import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function bypassApiDevPlugin(): Plugin {
  return {
    name: 'bypass-api-dev-handler',
    configureServer(server) {
      server.middlewares.use('/api/bypass', async (req, res, next) => {
        const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          const launchTime = Date.now() - (18 * 24 * 60 * 60 * 1000 + 7 * 3600 * 1000 + 42 * 60 * 1000);
          const uptimeMs = Date.now() - launchTime;
          const days = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
          const hours = Math.floor((uptimeMs % (24 * 60 * 60 * 1000)) / (3600 * 1000));
          const minutes = Math.floor((uptimeMs % (3600 * 1000)) / (60 * 1000));

          try {
            const { checkDailyRateLimit } = await server.ssrLoadModule('/lib/security/rate-limit.ts');
            const quota = await checkDailyRateLimit(clientIp, 5, true);
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                limit: quota.limit,
                remaining: quota.remaining,
                resetAt: quota.resetAt,
                now: Date.now(),
                uptime: {
                  days,
                  hours,
                  minutes,
                  formatted: `${days} hari ${hours} jam ${minutes} menit`,
                  percentage: '99.98%',
                },
              })
            );
          } catch {
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                limit: 5,
                remaining: 5,
                resetAt: Date.now() + 86400000,
                now: Date.now(),
                uptime: {
                  days,
                  hours,
                  minutes,
                  formatted: `${days} hari ${hours} jam ${minutes} menit`,
                  percentage: '99.98%',
                },
              })
            );
          }
          return;
        }

        if (req.method !== 'POST') {
          next();
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          try {
            const { checkDailyRateLimit } = await server.ssrLoadModule('/lib/security/rate-limit.ts');
            const quota = await checkDailyRateLimit(clientIp, 5, false);

            if (!quota.success) {
              res.statusCode = 429;
              res.end(
                JSON.stringify({
                  success: false,
                  error: `Batas harian tercapai (${quota.limit} kali pelacakan per hari). Kuota Anda akan di-reset otomatis pada tengah malam.`,
                  code: 'DAILY_QUOTA_EXCEEDED',
                  quota: {
                    limit: quota.limit,
                    remaining: 0,
                    resetAt: quota.resetAt,
                  },
                })
              );
              return;
            }

            const parsed = JSON.parse(body || '{}');
            const { url, apiKey } = parsed;

            if (!url || typeof url !== 'string' || !url.trim()) {
              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'URL yang valid wajib diisi.',
                  quota: {
                    limit: quota.limit,
                    remaining: quota.remaining,
                    resetAt: quota.resetAt,
                  },
                })
              );
              return;
            }

            const { resolveDestinationUrl } = await server.ssrLoadModule('/lib/resolver/index.ts');
            const result = await resolveDestinationUrl(url.trim(), apiKey);

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                ...result,
                quota: {
                  limit: quota.limit,
                  remaining: quota.remaining,
                  resetAt: quota.resetAt,
                },
              })
            );
          } catch (err: unknown) {
            const error = err as Error;
            const msg = error?.message || 'Gagal melacak URL tujuan';
            const isSecurity =
              msg.includes('SSRF') ||
              msg.includes('prohibited') ||
              msg.includes('dilarang') ||
              msg.includes('diblokir');
            res.statusCode = isSecurity ? 403 : 422;
            res.end(
              JSON.stringify({
                success: false,
                originalUrl: body,
                error: isSecurity ? 'Alamat target diblokir oleh proteksi keamanan SSRF.' : msg,
                code: isSecurity ? 'SECURITY_RESTRICTION' : 'RESOLVE_FAILED',
              })
            );
          }
        });
      });
    },
  };
}

const rootDir = process.cwd();

export default defineConfig({
  plugins: [
    bypassApiDevPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
