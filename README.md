# 🛡️ PhishGuard — AI-Powered Phishing Detection Platform

PhishGuard is a real-time phishing detection web application that combines **machine learning**, **natural language processing**, **computer vision**, and **multi-source threat intelligence** to protect users from phishing attacks across URLs, emails, SMS messages, QR codes, screenshots, and PDF documents.

> **Live Demo**: Deployed on [Vercel](https://vercel.com) with serverless API functions for secure backend processing.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Browser)                       │
│  React + TypeScript + Vite + TailwindCSS + Framer Motion     │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Scanner     │  │ QR Scanner   │  │ Screenshot Scanner │  │
│  │ Input       │  │ (html5-qrcode│  │ (Tesseract.js OCR) │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                │                    │              │
│         ▼                ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              ML Detection Engine (api.ts)            │    │
│  │  • Logistic Regression (16 features)                 │    │
│  │  • NLP Feature Extraction                            │    │
│  │  • Lookalike/Homograph Detection                     │    │
│  │  • DNS Forensics (Cloudflare DoH)                    │    │
│  │  • Domain Age (RDAP/WHOIS)                           │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐    │
│  │         Firebase (Auth + Firestore)                  │    │
│  │  • User Authentication (Email, Google, Anonymous)    │    │
│  │  • Scan History Storage                              │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────┬─────────────────────────────────┘
                             │ fetch('/api/...')
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                BACKEND (Vercel Serverless)                    │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────────────────────┐   │
│  │ /api/detect-     │  │ /api/test-api-connections.ts    │   │
│  │  phishing.ts     │  │  Tests connectivity to all APIs │   │
│  │  Calls 6 APIs:   │  └──────────────────────────────────┘   │
│  │  • VirusTotal    │                                        │
│  │  • Google GSB    │  API Keys stored securely in           │
│  │  • PhishTank     │  Vercel Environment Variables          │
│  │  • IPQualityScore│  (never sent to browser)               │
│  │  • Cloudmersive  │                                        │
│  │  • URLhaus       │                                        │
│  └─────────────────┘                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI / ML Components

### 1. Logistic Regression Classifier
**File**: [`src/lib/api.ts`](src/lib/api.ts) — `calculateLogisticRegression()`

A binary classifier using the **sigmoid function** σ(z) = 1 / (1 + e^(-z)) with 16 weighted features:

| Feature | Weight | Description |
|---------|--------|-------------|
| `lookalike` | 3.5 | Homograph/lookalike domain attack detected |
| `hasIp` | 3.0 | URL uses IP address instead of domain |
| `punycode` | 3.0 | Internationalized domain name (IDN) homograph |
| `brandMismatch` | 2.5 | Content claims brand X but links to different domain |
| `cryptoRequest` | 2.5 | Cryptocurrency wallet addresses found |
| `domainAge` | 2.0 | Domain registered less than 30 days ago |
| `credentialRequest` | 2.0 | Asks for passwords, SSN, credit cards |
| `urlKeywords` | 1.5 | URL contains phishing keywords (login, verify, etc.) |
| `linkDiscrepancy` | 1.5 | Shortened URL redirects to different destination |
| `suspiciousAttachments` | 1.5 | High-risk file types (.exe, .zip, .scr) |
| `disposableHost` | 1.5 | Hosted on free/temporary platform |
| `semanticMismatch` | 1.5 | Urgency + poor grammar combination |
| `urgency` | 1.0 | High-pressure language ("act now", "suspended") |
| `senderReputation` | 1.0 | Free email provider for official communication |
| `urlLength` | 0.8 | URL exceeds 50 characters |
| `numDots` | 0.5 | URL has 3+ dots (subdomain abuse) |

**Classification Thresholds**:
- `probability ≥ 0.5` → **Phishing** (high risk)
- `0.3 ≤ probability < 0.5` → **Suspicious** (caution)
- `probability < 0.3` → **Safe**

### 2. NLP Feature Extraction
- **Urgency keyword detection**: Identifies pressure language ("immediate", "suspended", "act now")
- **Grammar analysis**: Detects common phishing grammar patterns ("kindly do the needful")
- **Credential request detection**: Regex matching for sensitive data requests
- **Cryptocurrency detection**: BTC/ETH/LTC wallet address pattern matching

### 3. Lookalike / Homograph Attack Detection
**File**: [`src/lib/api.ts`](src/lib/api.ts) — `detectLookalikeAttack()`

Detects Unicode-based domain impersonation:
- Maintains a substitution table (e.g., `a→4`, `a→@`, `o→0`, `l→1`)
- Normalizes domains to base characters and compares against 11 known brands
- Reports specific character substitutions found (e.g., `g00gle.com` → "0→o, 0→o")

### 4. OCR (Optical Character Recognition)
**Library**: [Tesseract.js](https://tesseract.projectnaptha.com/) v7

Used in two components:
- **ScreenshotScanner**: Extracts URLs from uploaded screenshot images
- **PDFScanner**: Extracts text from image-based PDF pages when native text extraction fails

### 5. Brand Color Analysis (Computer Vision)
**File**: [`src/components/ScreenshotScanner.tsx`](src/components/ScreenshotScanner.tsx) — `analyzeBrandColors()`

Samples dominant colors from screenshots using Canvas API and cross-references with brand identity:
- Detects if "PayPal" text appears with non-blue color scheme
- Detects if "Facebook" text appears with incorrect color scheme
- Flags visual mismatches as potential phishing indicators

---

## 🔌 Third-Party API Integrations

All API calls are proxied through **Vercel Serverless Functions** (`api/` directory) — API keys never reach the browser.

| API Service | Purpose | Severity if Flagged |
|-------------|---------|---------------------|
| **VirusTotal** | URL analysis by 70+ security vendors | High (+60 score) |
| **Google Safe Browsing** | Google's malware/phishing database | High (+100 score) |
| **PhishTank** | Community-verified phishing URL database | High (+80 score) |
| **IPQualityScore** | URL risk scoring and fraud detection | Medium/High (+20-40) |
| **Cloudmersive** | Website virus/malware scanning | High (+60 score) |
| **URLhaus** | Malware distribution URL tracking | High (+80 score) |

---

## 🔍 Forensics Engine

### DNS-over-HTTPS (DoH)
**Provider**: Cloudflare (`cloudflare-dns.com/dns-query`)

Queries A, MX, and TXT records for extracted domains:
- **No MX records** → Domain can't receive email (suspicious for "bank" emails)
- **DNS anomalies** → Additional risk indicators

### Domain Age Verification
**Protocols**: RDAP (modern) → WHOIS (fallback)

- Queries `rdap.org` for domain registration date
- Falls back to traditional WHOIS port 43 lookup via `whois-json`
- Domains < 30 days old are flagged as **newly created** (high risk)
- Known brands (google.com, paypal.com, etc.) are whitelisted

### URL Expansion
Short URLs (bit.ly, tinyurl.com, goo.gl, etc.) are expanded via `unshorten.me` API to reveal hidden destinations.

---

## 📱 Input Methods

| Method | Technology | Description |
|--------|-----------|-------------|
| **Text Input** | Direct paste | URL, email body, SMS text |
| **QR Code Scanner** | [html5-qrcode](https://github.com/nicedaycode/html5-qrcode) | Camera-based or image upload QR scanning |
| **Screenshot Scanner** | [Tesseract.js](https://tesseract.projectnaptha.com/) OCR | Extract and analyze URLs from screenshots |
| **PDF Scanner** | [pdfjs-dist](https://mozilla.github.io/pdf.js/) + Tesseract.js | Extract email content from PDF documents |
| **Manual Checklist** | Interactive UI | 12-point manual phishing verification checklist |

---

## 🔐 Authentication & Data

| Feature | Technology |
|---------|-----------|
| **Auth Provider** | Firebase Authentication (Email/Password, Google Sign-In, Anonymous) |
| **Database** | Cloud Firestore (scan history per user) |
| **Local Storage** | Browser localStorage (anonymous scan history) |
| **History Migration** | Auto-migrates local scans to Firestore on sign-in |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite 5** | Build tool & dev server |
| **TailwindCSS 3** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **shadcn/ui** (Radix) | UI component library |
| **Recharts** | Data visualization |
| **Lucide Icons** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Vercel Serverless Functions** | API key protection & third-party API proxying |
| **Firebase Auth** | User authentication |
| **Cloud Firestore** | NoSQL database for scan history |

### AI / ML Libraries
| Technology | Purpose |
|-----------|---------|
| **Tesseract.js 7** | OCR text extraction from images |
| **pdfjs-dist 5** | PDF text extraction |
| **html5-qrcode 2** | QR code detection & decoding |
| **Custom Logistic Regression** | Phishing probability classification |

### PWA
| Feature | Implementation |
|---------|---------------|
| **Service Worker** | vite-plugin-pwa with Workbox |
| **Offline Support** | Precached assets (8 entries) |
| **Installable** | Web App Manifest with icons |

---

## 📂 Project Structure

```
phish-guard-main/
├── api/                          # Vercel Serverless Functions
│   ├── detect-phishing.ts        # Proxies 6 threat intelligence APIs
│   └── test-api-connections.ts   # Tests API connectivity
├── src/
│   ├── components/
│   │   ├── ScannerInput.tsx      # Multi-type input with QR/Screenshot/PDF
│   │   ├── ScanResult.tsx        # Risk visualization & detailed results
│   │   ├── RiskMeter.tsx         # Animated risk gauge
│   │   ├── ScanHistory.tsx       # Scan history list with re-scan
│   │   ├── QRScanner.tsx         # Camera + upload QR decoding
│   │   ├── ScreenshotScanner.tsx # OCR-based URL extraction
│   │   ├── PDFScanner.tsx        # PDF/image email extraction
│   │   ├── ManualChecklist.tsx   # 12-point manual verification
│   │   ├── AuthModal.tsx         # Login/signup modal
│   │   ├── ApiStatusPanel.tsx    # API health dashboard
│   │   ├── Header.tsx            # Navigation header
│   │   └── ui/                   # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx             # Main scanner page
│   │   ├── About.tsx             # About & features page
│   │   ├── AdminDashboard.tsx    # Admin panel with API status
│   │   └── NotFound.tsx          # 404 page
│   ├── lib/
│   │   ├── api.ts                # Core ML engine + detection logic
│   │   ├── apiTester.ts          # API connectivity tester
│   │   ├── firebase.ts           # Firebase initialization
│   │   ├── pdfExtractor.ts       # PDF text extraction logic
│   │   └── utils.ts              # Utility functions
│   └── hooks/
│       ├── useAuth.tsx           # Authentication state management
│       ├── use-toast.ts          # Toast notification system
│       └── use-mobile.tsx        # Mobile detection hook
├── vercel.json                   # Vercel deployment config
├── vite.config.ts                # Vite config with WHOIS plugin
└── package.json                  # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development
```bash
git clone https://github.com/komalm55/phish-guard-main.git
cd phish-guard-main
npm install
npm run dev
```

The app runs at `http://localhost:8080`. Local heuristic detection works immediately. Third-party API-enhanced scanning requires deployment to Vercel (where API keys are configured as environment variables).

### Deployment to Vercel
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add API keys as Environment Variables in Vercel Dashboard:
   - `VIRUSTOTAL_KEY`, `GOOGLE_SAFE_BROWSING_KEY`, `IPQUALITYSCORE_KEY`, `URLHAUS_KEY`, `PHISHTANK_KEY`, `CLOUDMERSIVE_KEY`
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
4. Deploy

---

## 📊 Detection Flow

```
User Input
    │
    ▼
┌─────────────────────────┐
│  URL/Pattern Extraction │ ← Regex, NLP
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐  ┌──────────┐
│ Local  │  │ Server   │
│ ML     │  │ APIs     │
│ Engine │  │ (Vercel) │
└───┬────┘  └────┬─────┘
    │            │
    ▼            ▼
┌─────────────────────┐
│   Score Merging     │ ← min(local + server, 100)
│   Label Assignment  │ ← ≥50: phishing | ≥20: suspicious | safe
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Risk Assessment   │ ← Indicators, forensics, threat audit
│   UI Display        │ ← Risk meter, detailed breakdown
└─────────────────────┘
```

---

## 📝 License

This project is for educational and research purposes.

---

Built with ❤️ for a safer internet.
