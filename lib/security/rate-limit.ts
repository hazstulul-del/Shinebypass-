export interface DailyRateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  resetAt: number;
  type: 'upstash-redis' | 'memory-fallback';
}

interface DailyRecord {
  count: number;
  dayKey: string;
}

const dailyMemory = new Map<string, DailyRecord>();

// Cleanup stale memory records older than 2 days
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const today = new Date().toISOString().slice(0, 10);
    for (const [key, record] of dailyMemory.entries()) {
      if (record.dayKey !== today) {
        dailyMemory.delete(key);
      }
    }
  }, 60 * 60 * 1000);
}

export async function checkDailyRateLimit(
  identifier: string,
  limit: number = 5,
  peekOnly: boolean = false
): Promise<DailyRateLimitResult> {
  const envLimit = process.env.DAILY_RATE_LIMIT ? parseInt(process.env.DAILY_RATE_LIMIT, 10) : limit;
  const effectiveLimit = isNaN(envLimit) || envLimit < 1 ? limit : envLimit;

  // Day key: YYYY-MM-DD
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);

  // Reset at tomorrow 00:00:00 UTC
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const resetAt = tomorrow.getTime();
  const resetSeconds = Math.floor(resetAt / 1000);

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const redisKey = `ratelimit:daily:${identifier}:${dayKey}`;
      if (peekOnly) {
        const getRes = await fetch(`${upstashUrl}/get/${encodeURIComponent(redisKey)}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
          signal: AbortSignal.timeout(2000),
        });
        if (getRes.ok) {
          const getData = await getRes.json();
          const current = typeof getData.result === 'string' ? parseInt(getData.result, 10) : 0;
          return {
            success: current < effectiveLimit,
            limit: effectiveLimit,
            remaining: Math.max(0, effectiveLimit - current),
            reset: resetSeconds,
            resetAt,
            type: 'upstash-redis',
          };
        }
      } else {
        const secondsUntilMidnight = Math.max(60, Math.floor((resetAt - now.getTime()) / 1000));
        const pipeRes = await fetch(`${upstashUrl}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${upstashToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            ['INCR', redisKey],
            ['EXPIRE', redisKey, secondsUntilMidnight + 3600],
          ]),
          signal: AbortSignal.timeout(2000),
        });
        if (pipeRes.ok) {
          const pipeData = await pipeRes.json();
          const current = (pipeData[0] && typeof pipeData[0].result === 'number') ? pipeData[0].result : 1;
          return {
            success: current <= effectiveLimit,
            limit: effectiveLimit,
            remaining: Math.max(0, effectiveLimit - current),
            reset: resetSeconds,
            resetAt,
            type: 'upstash-redis',
          };
        }
      }
    } catch {
      // Fall through to memory fallback
    }
  }

  // In-memory fallback
  const safeId = identifier || 'anonymous';
  const existing = dailyMemory.get(safeId);

  let currentCount = 0;
  if (existing && existing.dayKey === dayKey) {
    currentCount = existing.count;
  }

  if (peekOnly) {
    return {
      success: currentCount < effectiveLimit,
      limit: effectiveLimit,
      remaining: Math.max(0, effectiveLimit - currentCount),
      reset: resetSeconds,
      resetAt,
      type: 'memory-fallback',
    };
  }

  if (currentCount >= effectiveLimit) {
    return {
      success: false,
      limit: effectiveLimit,
      remaining: 0,
      reset: resetSeconds,
      resetAt,
      type: 'memory-fallback',
    };
  }

  const nextCount = currentCount + 1;
  dailyMemory.set(safeId, { count: nextCount, dayKey });

  return {
    success: true,
    limit: effectiveLimit,
    remaining: Math.max(0, effectiveLimit - nextCount),
    reset: resetSeconds,
    resetAt,
    type: 'memory-fallback',
  };
}
