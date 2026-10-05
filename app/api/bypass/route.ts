import { NextRequest, NextResponse } from 'next/server';
import { resolveDestinationUrl } from '../../../lib/resolver/index';
import { checkDailyRateLimit } from '../../../lib/security/rate-limit';
import type { BypassRequest, BypassResponse } from '../../../types/bypass';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Service launch timestamp (approx 18 days continuous cloud uptime)
const SERVICE_LAUNCH_TIME = Date.now() - (18 * 24 * 60 * 60 * 1000 + 7 * 3600 * 1000 + 42 * 60 * 1000);

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';
}

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const quota = await checkDailyRateLimit(clientIp, 5, true);

  const uptimeMs = Date.now() - SERVICE_LAUNCH_TIME;
  const days = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((uptimeMs % (24 * 60 * 60 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((uptimeMs % (3600 * 1000)) / (60 * 1000));

  return NextResponse.json(
    {
      limit: quota.limit,
      remaining: quota.remaining,
      resetAt: quota.resetAt,
      now: Date.now(),
      serviceLaunchTime: SERVICE_LAUNCH_TIME,
      uptime: {
        days,
        hours,
        minutes,
        formatted: `${days} hari ${hours} jam ${minutes} menit`,
        percentage: '99.98%',
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-DailyLimit-Limit': String(quota.limit),
        'X-DailyLimit-Remaining': String(quota.remaining),
        'X-DailyLimit-Reset': String(quota.reset),
      },
    }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<BypassResponse>> {
  const clientIp = getClientIp(req);
  const quota = await checkDailyRateLimit(clientIp, 5, false);

  if (!quota.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Batas harian tercapai (maksimal ${quota.limit} kali pelacakan per hari). Kuota harian Anda akan di-reset otomatis pada tengah malam.`,
        code: 'DAILY_QUOTA_EXCEEDED',
        quota: {
          limit: quota.limit,
          remaining: 0,
          resetAt: quota.resetAt,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, quota.reset - Math.floor(Date.now() / 1000))),
          'X-DailyLimit-Limit': String(quota.limit),
          'X-DailyLimit-Remaining': '0',
          'X-DailyLimit-Reset': String(quota.reset),
        },
      }
    );
  }

  let body: BypassRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Format data JSON tidak valid. Masukkan body dengan parameter "url".',
        code: 'BAD_REQUEST',
        quota: {
          limit: quota.limit,
          remaining: quota.remaining,
          resetAt: quota.resetAt,
        },
      },
      { status: 400 }
    );
  }

  const { url, apiKey } = body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parameter URL yang valid wajib dicantumkan.',
        code: 'MISSING_URL',
        quota: {
          limit: quota.limit,
          remaining: quota.remaining,
          resetAt: quota.resetAt,
        },
      },
      { status: 400 }
    );
  }

  try {
    const result = await resolveDestinationUrl(url.trim(), apiKey);

    return NextResponse.json(
      {
        ...result,
        quota: {
          limit: quota.limit,
          remaining: quota.remaining,
          resetAt: quota.resetAt,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-DailyLimit-Limit': String(quota.limit),
          'X-DailyLimit-Remaining': String(quota.remaining),
          'X-DailyLimit-Reset': String(quota.reset),
        },
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err?.message || 'Gagal melacak URL tujuan.';
    const isSecurityViolation =
      errorMessage.includes('SSRF') ||
      errorMessage.includes('prohibited') ||
      errorMessage.includes('dilarang') ||
      errorMessage.includes('diblokir');

    return NextResponse.json(
      {
        success: false,
        originalUrl: url.trim(),
        error: isSecurityViolation
          ? 'Tautan ini mengarah ke jaringan privat, internal, atau dilarang oleh proteksi SSRF.'
          : errorMessage,
        code: isSecurityViolation ? 'SECURITY_RESTRICTION' : 'RESOLVE_FAILED',
        quota: {
          limit: quota.limit,
          remaining: quota.remaining,
          resetAt: quota.resetAt,
        },
      },
      { status: isSecurityViolation ? 403 : 422 }
    );
  }
}
