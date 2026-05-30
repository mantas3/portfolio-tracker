# Portfolio Tracker 📈

A clean, self-hosted, private-first investment portfolio and asset ledger tracker. Developed with React, TypeScript, Tailwind CSS, and a lightweight Node.js Express server that persists all data to a single local `db.json` file.

Designed specifically for easy deployment on Unraid or any Docker-compatible hosting environment.

---

## ✨ Features

- **Multi-Asset Ledger**: Track ETFs, active funds, peer-to-peer (P2P) crowdfunding, pension pillars, and custom assets.
- **Monthly Valuation Snapshots**: Log monthly valuations for each asset to track cumulative growth and net-worth trends.
- **Key Metrics Overview**: View total portfolio value, total net contributions, absolute returns, and percentage gains instantly.
- **Interactive Visualizations**: Includes timeline performance area charts, monthly asset returns, asset share allocation distribution, and growth curves using Recharts.
- **Automated Calculations**: Computes key financial performance indicators dynamically across all historical entries.
- **Responsive Layout**: Designed with a clean, high-contrast, professional Interface prioritizing Inter and JetBrains Mono typography.
- **Portability & Backups**: Import/Export feature saves or loads your entire portfolio state as a localized JSON file with precise timestamps.
- **Private-First architecture**: Zero third-party web trackers, analytics scripts, or cookie consent banners. All database operations are completely local.

---

## 🚀 Deployed via Docker

You can easily package and run this application in a isolated container.

### Fast Run (Unraid / Docker CLI)
```bash
docker run -d \
  --name='portfolio-tracker' \
  --net='bridge' \
  -p '3000:3000/tcp' \
  -v '/mnt/user/appdata/portfolio-tracker/db.json':'/app/db.json':'rw' \
  -e TZ="Europe/Kiev" \
  --restart unless-stopped \
  'ghcr.io/mantas3/portfolio-tracker:main'
```

### Docker Compose
```yaml
version: '3.8'

services:
  portfolio-tracker:
    image: ghcr.io/mantas3/portfolio-tracker:main
    container_name: portfolio-tracker
    ports:
      - "3000:3000"
    volumes:
      - ./appdata/db.json:/app/db.json:rw
    environment:
      - TZ=Europe/Kiev
    restart: unless-stopped
```

---

## 🛠️ Local Development Setup

To run, inspect, or modify the source code locally, follow these simple steps.

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Live Development Mode
Launches both the backend application server and the Vite frontend developer proxy on port `3000`.
```bash
npm run dev
```

### 3. Production Compilation & Packaging
Bundles the React client and compiles the backend server cleanly into `dist/`.
```bash
npm run build
npm start
```

---

## 🛡️ Security & Single-Tenant Operation

This application operates on a **Single-Tenant No-Auth** model:
- **Zero Authentication**: All authorization gates, Google OAuth handlers, and session management configurations have been removed. 
- **Recommendation**: To keep your private financial ledger safe, always deploy this application behind a secure local home network, a VPN (like WireGuard/Tailscale), or access gated by a reverse proxy handler (such as Nginx Proxy Manager, Cloudflare Access, or Authelia).

---

## 📊 Directory Overview

```text
├── db.json                 # Persistent local SQLite/JSON document database
├── server.ts               # Express web service & local static asset server
├── src/
│   ├── App.tsx             # Primary Client Container layout
│   ├── main.tsx            # React application mounting point
│   ├── types.ts            # Global TypeScript interface structures
│   ├── index.css           # Global custom Tailwind directives & Typography
│   ├── components/         # Modular user interface components
│   ├── data/               # Demo seed asset definitions
│   └── utils/              # Financial calculation algorithms & math helper utilities
```

---

## 📄 License

This project is open-source. Feel free to copy, modify, and self-host for personal use.
