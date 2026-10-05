import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShineBypass — Bypass Semua Tautan Beriklan & Safelinku',
  description:
    'Tempel semua tautan beriklan, safelinku, shortener, atau redirect URL — dapatkan tautan aslinya tanpa iklan dan tanpa jeda tunggu.',
  keywords: [
    'shinebypass',
    'bypass link iklan',
    'sfl.gl bypass',
    'safelinku bypass',
    'linkvertise bypass',
    'sub2unlock bypass',
    'shortener bypass',
  ],
  authors: [{ name: 'ShineBypass' }],
  openGraph: {
    title: 'ShineBypass — Bypass Semua Tautan Beriklan & Safelinku',
    description:
      'Tempel semua tautan beriklan, safelinku, shortener, atau redirect URL — dapatkan tautan aslinya tanpa iklan dan tanpa jeda tunggu.',
    url: 'https://shinebypass.vercel.app',
    siteName: 'ShineBypass',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShineBypass — Bypass Semua Tautan Beriklan & Safelinku',
    description:
      'Tempel semua tautan beriklan, safelinku, shortener, atau redirect URL — dapatkan tautan aslinya tanpa iklan dan tanpa jeda tunggu.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0D14',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#0B0D14] text-[#F5F7FA] antialiased selection:bg-purple-600/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
