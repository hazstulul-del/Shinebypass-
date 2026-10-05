import { promises as dns } from 'dns';

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true;
  }

  const [a, b, c, d] = parts;

  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224 && a <= 239) return true;
  if (a >= 240) return true;
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().trim();

  if (normalized === '::1' || normalized === '::' || normalized === '0:0:0:0:0:0:0:1') {
    return true;
  }

  if (normalized.startsWith('::ffff:')) {
    const v4Part = normalized.replace('::ffff:', '');
    return isPrivateIPv4(v4Part);
  }

  if (/^f[cd][0-9a-f]{2}:/i.test(normalized)) {
    return true;
  }

  if (/^fe[89ab][0-9a-f]:/i.test(normalized)) {
    return true;
  }

  if (normalized.startsWith('ff')) {
    return true;
  }

  return false;
}

export async function validateSafeUrl(rawUrl: string): Promise<{ safe: boolean; error?: string; urlObj?: URL }> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, error: 'URL tidak boleh kosong.' };
  }

  const trimmed = rawUrl.trim();

  if (!/^https?:\/\//i.test(trimmed)) {
    return { safe: false, error: 'Hanya protokol HTTP dan HTTPS yang didukung.' };
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('ftp:') ||
    lower.startsWith('blob:')
  ) {
    return { safe: false, error: 'Protokol URL dilarang demi keamanan.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { safe: false, error: 'Format URL salah atau tidak valid.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, error: 'Hanya protokol HTTP dan HTTPS yang diizinkan.' };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  if (!hostname) {
    return { safe: false, error: 'Nama host tidak boleh kosong.' };
  }

  const prohibitedHosts = [
    'localhost',
    'localhost.localdomain',
    'ip6-localhost',
    'ip6-loopback',
    'metadata.google.internal',
    'metadata.internal',
    'instance-data',
    '169.254.169.254',
  ];

  if (
    prohibitedHosts.includes(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { safe: false, error: 'Akses ke hostname privat atau lokal diblokir.' };
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { safe: false, error: 'Akses ke alamat IP privat atau loopback diblokir.' };
    }
  }

  if (hostname.includes(':')) {
    const cleanIpv6 = hostname.replace(/^\[|\]$/g, '');
    if (isPrivateIPv6(cleanIpv6)) {
      return { safe: false, error: 'Akses ke alamat IPv6 privat atau loopback diblokir.' };
    }
  }

  try {
    const lookupResults = await dns.lookup(hostname, { all: true });

    if (!lookupResults || lookupResults.length === 0) {
      return { safe: false, error: 'Gagal melakukan resolusi DNS untuk domain ini.' };
    }

    for (const record of lookupResults) {
      if (record.family === 4) {
        if (isPrivateIPv4(record.address)) {
          return {
            safe: false,
            error: 'Domain mengarah ke alamat IP internal atau privat (SSRF protection).',
          };
        }
      } else if (record.family === 6) {
        if (isPrivateIPv6(record.address)) {
          return {
            safe: false,
            error: 'Domain mengarah ke alamat IPv6 internal atau privat (SSRF protection).',
          };
        }
      }
    }
  } catch (dnsErr) {
    const err = dnsErr as { code?: string };
    if (err.code === 'ENOTFOUND') {
      return { safe: false, error: 'Nama domain tidak ditemukan di DNS publik (ENOTFOUND).' };
    }
    return { safe: false, error: 'Gagal memverifikasi catatan DNS untuk domain ini.' };
  }

  return { safe: true, urlObj: parsed };
}
