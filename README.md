# ✦ ShineBypass

**ShineBypass** is a full-stack link unshortener and redirect resolver built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It safely discovers the genuine destination URL behind shortened links, affiliate redirects, and interstitial transition pages without executing third-party trackers or ad payloads.

Designed for seamless deployment on **Vercel** as serverless functions, with built-in **SSRF protection**, **rate-limiting**, and an ethical security model.

---

## 🌟 Key Features

- **Multi-Method Redirect Resolution**:
  - **HTTP 301, 302, 303, 307, and 308**: Follows up to 10 redirects while maintaining security on every single hop.
  - **HTML `<meta http-equiv="refresh">`**: Detects and extracts delayed or instant meta-refresh redirect targets.
  - **Inline JavaScript Redirection**: Safely parses `window.location`, `location.replace()`, and `location.href` assignments without executing untrusted client code.
  - **Embedded Query Parameters**: Unpacks parameters like `?url=`, `?target=`, `?dest=`, `?redirect=`, and Base64-encoded URL targets.
- **Robust SSRF Defense**:
  - Automatically denies `localhost`, `127.0.0.1`, `0.0.0.0`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` (Cloud Metadata), and private IPv6 ranges.
  - Performs pre-flight DNS lookups to prevent DNS-rebinding attacks.
  - Validates every intermediate hop independently.
- **Serverless-Friendly Rate Limiting**:
  - Token-bucket limiter protecting serverless function budgets.
  - Optional zero-setup Upstash Redis support via REST API for distributed deployments.
- **Liquid Glass Aesthetic**:
  - Deep obsidian background (`#07090D`), subtle frosted card surfaces (`#0D1117`), and modern hairline accents.
  - Dark mode and light mode support with seamless system sync.
  - Fully responsive from 360px mobile viewports to 1440px desktop screens.
- **Browser-Only History**:
  - Stores up to 50 resolved URLs directly in browser `localStorage`.
  - Zero centralized databases or user tracking logs.
  - Complete with 1-click Copy, Open in new tab, and Delete features.

---

## 🛡️ Ethical Boundaries & Limitations

ShineBypass is strictly an educational and privacy-focused redirect unshortener. It **does NOT**:
- ❌ Bypass CAPTCHAs, Turnstile, or human verification challenges.
- ❌ Circumvent paywalls or subscription gates.
- ❌ Steal, forge, or hijack session cookies or authentication tokens.
- ❌ Bypass Cloudflare WAF or anti-bot verification screens.
- ❌ Provide an open proxy to private intranet or cloud metadata services.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Serverless Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📁 Project Structure

```text
shinebypass/
├── app/
│   ├── api/
│   │   └── bypass/
│   │       └── route.ts          # POST /api/bypass resolver endpoint
│   ├── history/
│   │   └── page.tsx              # Browser history manager
│   ├── settings/
│   │   └── page.tsx              # Appearance and motion preferences
│   ├── about/
│   │   └── page.tsx              # System architecture & legal disclaimer
│   ├── globals.css               # Liquid glass design system tokens
│   ├── layout.tsx                # Root layout with SEO and metadata
│   ├── page.tsx                  # Homepage with resolver interface
│   ├── robots.ts                 # Search crawler rules
│   └── sitemap.ts                # Dynamic sitemap index
├── components/
│   ├── hero.tsx                  # Marketing hero section
│   ├── url-form.tsx              # URL submission card with validation
│   ├── result-card.tsx           # Destination display, copy, and hop trace
│   ├── how-it-works.tsx          # 4-stage resolution explanation
│   ├── supported-redirects.tsx   # Capabilities and boundaries
│   ├── history-list.tsx          # Local history table and controls
│   ├── navbar.tsx                # Responsive top navigation
│   ├── footer.tsx                # Legal disclaimers & links
│   └── theme-toggle.tsx          # Dark / Light / System switcher
├── lib/
│   ├── resolver/
│   │   ├── index.ts              # Orchestration pipeline
│   │   ├── http.ts               # Safe HTTP multi-hop fetcher
│   │   ├── html.ts               # Meta refresh & JS redirect parser
│   │   └── parser.ts             # Query parameter & Base64 decoder
│   ├── security/
│   │   ├── ssrf.ts               # SSRF pre-flight and DNS validator
│   │   └── rate-limit.ts         # Token bucket & Upstash Redis adapter
│   └── utils.ts                  # String truncation and helper functions
├── types/
│   └── bypass.ts                 # TypeScript interfaces
├── public/
│   └── favicon.svg               # ShineBypass vector brand icon
├── .env.example                  # Environment configuration template
├── next.config.ts                # Next.js security headers
└── README.md
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18.18.0 or higher
- npm 9+ or pnpm 8+

### 2. Clone and Install
```bash
git clone https://github.com/your-username/shinebypass.git
cd shinebypass
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | No | App title (Default: `ShineBypass`) |
| `NEXT_PUBLIC_APP_URL` | No | App canonical base URL |
| `UPSTASH_REDIS_REST_URL` | No | Optional Redis URL for persistent rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Optional Redis auth token |

> **Note**: For local development and single-instance deployments, the built-in in-memory rate limiter works out of the box with zero external configuration.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Production Build
```bash
npm run build
npm run start
```

---

## ☁️ Deploying to Vercel

ShineBypass is designed specifically for zero-configuration deployment to Vercel:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial ShineBypass commit"
   git remote add origin https://github.com/corleonev975-crypto/shinebypass.git
   git branch -M main
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New"** > **"Project"**.
   - Select your GitHub repository `shinebypass`.
   - Vercel automatically detects **Next.js** framework preset.

3. **Configure Environment Variables (Optional)**:
   - If using Upstash Redis for distributed rate-limiting:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
   - Otherwise, leave blank (in-memory fallback operates seamlessly).

4. **Deploy**:
   - Click **"Deploy"**.
   - Your site will be live on `https://shinebypass.vercel.app` in less than a minute!

---

## 📡 API Specification

### Endpoint
`POST /api/bypass`

### Request Body
```json
{
  "url": "https://httpbin.org/redirect-to?url=https%3A%2F%2Fgithub.com"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "originalUrl": "https://httpbin.org/redirect-to?url=https%3A%2F%2Fgithub.com",
  "destinationUrl": "https://github.com",
  "method": "http-redirect",
  "redirectCount": 2,
  "trace": [
    {
      "url": "https://httpbin.org/redirect-to?url=https%3A%2F%2Fgithub.com",
      "status": 302,
      "type": "http",
      "note": "HTTP 302 redirecting to https://github.com"
    },
    {
      "url": "https://github.com",
      "status": 200,
      "type": "http",
      "note": "Final status: HTTP 200"
    }
  ]
}
```

### Error Response (`422 Unprocessable` / `403 Forbidden`)
```json
{
  "success": false,
  "originalUrl": "https://127.0.0.1/admin",
  "error": "This link targets an internal, private, or prohibited address and cannot be resolved.",
  "code": "SECURITY_RESTRICTION"
}
```

---

## 🔒 Security Architecture

1. **Zero Open Proxy Abuse**:
   - Every destination candidate is scrutinized against RFC 1918, RFC 3927 (link-local), RFC 6598 (carrier-grade NAT), and IPv6 loopback ranges.
   - Forwarding arbitrary streaming data or acting as a tunneling proxy is strictly prevented.
2. **Hop Verification**:
   - Redirection is executed with `redirect: 'manual'`. Every hop's `Location` target is verified against the SSRF checker before opening the next socket.
3. **Security Headers**:
   - Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive `Permissions-Policy`.

---

## 📄 License
MIT © ShineBypass
