# 🚀 RecruitPro RMS — Enterprise AI Recruitment Management System

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-blue?logo=postgresql)](https://neon.tech/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_70B-orange?logo=groq)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-grade **Recruitment Management System (RMS)** and **Applicant Tracking System (ATS)** with integrated **Payroll Mobility**, **AI-Powered ATS Scoring & Email Drafting (Groq Llama 3.3 70B)**, **Executive Analytics & Time-to-Hire BI**, **Career Portal Builder**, and **Real-Time Event-Driven Notifications**.

---

## 📖 Complete Documentation
For full architectural details, module walkthroughs, API reference, and ER diagrams, see:
👉 **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**

---

## 🌟 Key Highlights

- 🤖 **AI ATS Scoring & Smart Matching**: Groq Llama 3.3 70B calculates match scores, splits candidates into tiers (⭐ 80%+, 📋 60-79%, ⚠️ <60%), and provides diagnostic skill gap analysis.
- ✉️ **AI Candidate Outreach**: Instant personalized email drafter (interview invitations, offers, acknowledgments, rejection feedback) with HR confirmation workflow.
- 🏢 **Payroll & Succession Mobility**: Pre-seeded with 120+ employees across 6 departments. Real-time departure webhook suggests top internal successors and creates cascading vacancy backfills with one click.
- 📊 **Executive Analytics & Time-to-Hire BI**: Executive KPI dashboards, stage velocity, funnel drop-off analysis, departmental metrics, recruiter leaderboards, and CSV export.
- 🔔 **Event-Driven Notifications**: Live notification center with bell icon and unread counter triggered by actual recruitment events.
- 🌐 **Public Career Portal & Offer E-Signature**: Branded career site customizer and cryptographically secure digital offer signing portal (`/offers/[token]`).
- 📱 **Full Mobile Responsiveness**: Slide-out navigation drawer (`☰`), responsive tables with touch inertia scrolling, and adaptive modals.

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Clone repo
git clone https://github.com/Haseeb479/RMS.git
cd RMS

# 2. Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# 3. Setup backend environment (backend/.env)
# DATABASE_URL="postgresql://user:pass@localhost:5432/rms"
# GROQ_API_KEY="your-groq-api-key"
# JWT_SECRET="your-jwt-secret"

# 4. Sync database
cd backend && npx prisma db push && cd ..

# 5. Start dev server
npm run dev
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## ☁️ Deployment

- **Frontend & Backend**: Deployed seamlessly on [Vercel](https://vercel.com).
- **Database**: Cloud PostgreSQL on [Neon](https://neon.tech).
- See detailed deployment steps in **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**.
