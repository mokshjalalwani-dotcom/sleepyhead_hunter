# SleepyHead Hunter — Web Frontend

A stunning marketing + configurator site for the [SleepyHead Hunter](../eye_closure_alarm.py) drowsiness detection app.

Built with **Next.js 16**, deployed to **Vercel**.

## 🚀 Deploy to Vercel

### Option 1 — Vercel CLI (Recommended)
```bash
cd web
npm i -g vercel
vercel --prod
```

### Option 2 — GitHub + Vercel Dashboard
1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Set the **Root Directory** to `web`
5. Framework preset: **Next.js** (auto-detected)
6. Click **Deploy** ✅

## 💻 Local Development
```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

## 📁 Structure
```
web/
├── app/
│   ├── layout.js          # Root layout + SEO metadata
│   ├── globals.css        # Full design system
│   ├── page.js            # Landing page
│   └── configure/
│       └── page.js        # 4-stage alarm configurator
└── components/
    ├── Navbar.js
    ├── HeroSection.js      # Animated SVG eye hero
    ├── AnimatedEye.js      # Blinking eye SVG component
    ├── StatsBar.js
    ├── HowItWorks.js
    ├── FeaturesGrid.js
    ├── Footer.js
    ├── StageCard.js        # Per-stage alarm settings card
    ├── GlobalSettings.js   # EAR + timing sliders
    └── ConfigExport.js     # Live Python config preview + export
```
