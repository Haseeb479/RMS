# 🚀 RecruitPro RMS — Enterprise AI Recruitment Management System

> **RecruitPro RMS** is a modern, enterprise-grade **Recruitment Management System (RMS)** and **Applicant Tracking System (ATS)** with integrated **Payroll Mobility**, **AI-Powered ATS Scoring & Email Drafting (Groq Llama 3.3 70B)**, **Executive Analytics & Time-to-Hire BI**, **Career Portal Builder**, and **Real-Time Event-Driven Notifications**.

---

## 📑 Table of Contents
1. [System Architecture & Tech Stack](#-system-architecture--tech-stack)
2. [Core Modules Breakdown (Modules 1–10)](#-core-modules-breakdown)
3. [AI Engine & Groq Llama 3.3 Integration](#-ai-engine--groq-llama-33-integration)
4. [Enterprise Payroll & Internal Mobility Engine](#-enterprise-payroll--internal-mobility-engine)
5. [Executive Analytics & Time-to-Hire BI](#-executive-analytics--time-to-hire-bi)
6. [Real-Time Notification System](#-real-time-notification-system)
7. [Mobile Responsive Design](#-mobile-responsive-design)
8. [Database Schema & Entity Relationships](#-database-schema--entity-relationships)
9. [API Endpoints Reference](#-api-endpoints-reference)
10. [Cloud Deployment Guide (Vercel + Neon)](#-cloud-deployment-guide)
11. [Local Development Setup](#-local-development-setup)

---

## 🏗️ System Architecture & Tech Stack

```
                                  ┌─────────────────────────────────────────┐
                                  │      Next.js 14 Web & Mobile Client     │
                                  │    (Tailwind, TypeScript, Lucide UI)    │
                                  └────────────────────┬────────────────────┘
                                                       │ HTTPS / REST API
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │      Node.js / Express 4 API Gateway     │
                                  │     (TypeScript, JWT Auth, RBAC)        │
                                  └─────────┬───────────────────┬───────────┘
                                            │                   │
                     ┌──────────────────────┴──────┐     ┌──────┴──────────────────────┐
                     │ PostgreSQL (Neon Cloud / DB)│     │  Groq AI Cloud Engine       │
                     │ (Prisma ORM Client v5.22)   │     │  (Llama 3.3 70B Versatile)  │
                     └─────────────────────────────┘     └─────────────────────────────┘
```

### 💻 Technologies Used
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Zustand.
- **Backend**: Node.js, Express.js 4, TypeScript, Prisma ORM 5.22, JWT Authentication, Multer (file parsing), PDF-Parse, Docx-Parser, Nodemailer.
- **Database**: PostgreSQL (Neon Cloud Serverless / Local PostgreSQL).
- **AI / LLM**: Groq Cloud API running `llama-3.3-70b-versatile` (70-Billion Parameter Model).
- **Deployment**: Vercel Serverless Functions (Frontend & Backend), Neon (Cloud PostgreSQL).

---

## 📦 Core Modules Breakdown

### 🔹 Module 1: Multi-Tenant Authentication & Organization Setup
- Company registration with automatic URL slug generation.
- JWT-based authentication with bcrypt password hashing (10 salt rounds).
- Multi-tenant isolation: All candidates, jobs, resumes, and payroll data are segregated by `companyId`.
- Role-Based Access Control (RBAC): `admin`, `recruiter`, `hiring_manager`, `interviewer`.

### 🔹 Module 2: Job Requisition & Screening Questionnaires
- Create, draft, publish, pause, and close job postings.
- Department categorization, salary ranges, location types (Remote, On-site, Hybrid).
- Custom screening questions per job (Text, Single Choice, Multiple Choice, Yes/No).
- Auto-generation of public apply links and career portal integration.

### 🔹 Module 3: Candidate Pipeline & Kanban Management
- Interactive visual **Kanban Board** with drag-and-drop / stage advancement:
  `Applied` ➔ `Screening` ➔ `Interview` ➔ `Offer` ➔ `Hired` / `Rejected`.
- Candidate profile cards with experience, skills chips, contact details, and source attribution.
- Candidate Activity Timeline with audit logging and recruiter internal notes.
- ATS Match score indicator badges on candidate cards.

### 🔹 Module 4: CV Parsing & Sourcing Resume Inbox
- Resume file ingest supporting PDF and Microsoft Word (.docx).
- Inbound resume dropzone and webhook intake.
- Auto-extraction of name, email, phone number, work experience years, and skill tags.
- **Automatic Resume Inbox Ingestion**: When a candidate applies on a public job opening, their CV is automatically registered in the Sourcing Resume Inbox.

### 🔹 Module 5: AI ATS Scoring & Smart Matching (Groq Llama 3.3)
- Instant evaluation of inbound candidate resumes against target job descriptions.
- Calculates ATS Match percentage score (0–100%).
- Categorizes candidates into **ATS Splitting Tiers**:
  - ⭐ **Top Match Tier (80%–100%)**: High skill alignment, recommended for priority outreach.
  - 📋 **Moderate Tier (60%–79%)**: Meets core requirements with minor skill gaps.
  - ⚠️ **Low Tier (< 60%)**: Lacks critical prerequisites.
- Detailed AI Diagnostic breakdown: Matched skills, Missing skills, Key strengths, Risk areas, and Recommendation summary.
- Single-click **Batch ATS Scoring** across entire candidate pools.

### 🔹 Module 6: AI-Powered Candidate Outreach & Email Drafter
- Automated personalized email drafter powered by Groq Llama 3.3.
- Selectable email templates:
  - 📅 **Interview Invitation**: Includes job title, interview format, and candidate-specific skill praises.
  - 📝 **Offer Letter Notification**: Professional announcement of offer package.
  - 📬 **Application Acknowledgment**: Warm receipt confirmation.
  - ❌ **Constructive Rejection**: Polite, encouraging feedback.
  - ✍️ **Custom AI Prompt**: Custom instructions for unique candidate scenarios.
- **HR Confirmation Workflow**: HR reviews and edits AI-drafted subject and body before sending.
- Automatic activity note recording upon dispatch.

### 🔹 Module 7: Interview Scheduling & Feedback Management
- Schedule video, phone, or in-person interviews with calendar date/time picker.
- Automated email invitations sent to candidates via Nodemailer.
- Background cron scheduler (`node-cron`) for automated 24-hour and 1-hour interview reminders.
- Structured Interviewer Feedback scoring (Rating 1–5 stars, Technical & Cultural assessment, Recommendation).

### 🔹 Module 8: Digital Offer Letters & Public E-Signature
- Generate formalized digital offer letters with annual compensation, tentative start date, and custom terms.
- Cryptographically secure 32-character token generation for candidate access.
- Public candidate offer portal (`/offers/[token]`) for candidates to review, sign, and accept/decline online.
- Auto-updates candidate status to `Hired` upon signature and notifies HR in real-time.

### 🔹 Module 9: Enterprise Payroll Integration & Internal Succession Mobility
- Pre-seeded **120+ Employee Enterprise Payroll Directory** across 6 core departments:
  - Supply Chain Management
  - IT & Support
  - ERP Operations
  - HR & People Operations
  - Import / Export Logistics
  - Sales & Enterprise Accounts
- Real-time **Employee Departure Webhook Ingest**:
  - Simulates an employee departure in any department.
  - Instantly evaluates all remaining employees for internal promotion readiness based on skill overlap and seniority.
  - Suggests ranked internal successors to HR.
- **One-Click Actions for HR**:
  - 🌟 **Promote Successor**: Promotes internal employee with salary adjustment and creates a cascading vacancy backfill.
  - 💼 **Post Public Requisition**: Automatically creates a draft job requisition on the RMS career site with one click.
  - 🗂️ **Dismiss / Reallocate**: Archives event.

### 🔹 Module 10: Executive Analytics, BI & Cloud Deployment
- Executive KPI cards: Time-to-Hire, Offer Acceptance Rate, Sourcing Cost per Hire, Active Funnel Velocity.
- Stage-by-stage Funnel Drop-off Analysis.
- Departmental Hiring Velocity breakdown.
- Sourcing Channel ROI tracker (Direct Apply, LinkedIn, Referrals, Sourcing Inbox).
- Recruiter Performance Leaderboard.
- One-click CSV Data Export for executive presentations.
- 100% Free Cloud Deployment setup on Vercel + Neon Cloud.

---

## 🤖 AI Engine & Groq Llama 3.3 Integration

RecruitPro RMS is directly connected to Groq's high-speed inference engine running `llama-3.3-70b-versatile`:

```
┌───────────────────────────┐         ┌──────────────────────────────────────┐
│ Candidate CV / Resume Text│ ──────► │       Groq Cloud Inference API       │
├───────────────────────────┤         │       (llama-3.3-70b-versatile)      │
│ Target Job Requisition JD │ ──────► │                                      │
└───────────────────────────┘         └──────────────────┬───────────────────┘
                                                         │
                                      ┌──────────────────▼───────────────────┐
                                      │ JSON Diagnostic Match Analysis:      │
                                      │ • atsScore (0-100)                   │
                                      │ • tier (top / moderate / low)        │
                                      │ • matchedSkills & missingSkills      │
                                      │ • strengths & concerns               │
                                      │ • recommendationReason               │
                                      └──────────────────────────────────────┘
```

---

## 🔔 Real-Time Notification System

RecruitPro RMS uses a pure **event-driven notification engine**:

| Event Trigger | Notification Title | Type | Link |
|---|---|---|---|
| **High ATS Candidate Match** | ⭐ High ATS Match: John Doe (92%) | `high_ats_match` | `/sourcing/inbox` |
| **New Job Application Submitted** | 📬 New Application: Sarah Smith (85% ATS) | `inbound_resume` | `/sourcing/inbox` |
| **Employee Offboarded / Departure** | 🚪 Payroll Departure: Lead in Supply Chain | `payroll_departure` | `/payroll-mobility` |
| **Interview Scheduled** | 📅 Interview Scheduled: Alex Mercer | `interview_alert` | `/interviews` |
| **Offer Letter Signed & Accepted** | 🎉 Offer Accepted: Michael Brown | `offer_signed` | `/offers` |

---

## 📱 Mobile Responsive Design

The application provides a first-class mobile experience on all iOS and Android devices:
- **Mobile Navigation Drawer**: Tap the Hamburger icon (`☰`) on the top bar to open a smooth slide-out drawer.
- **Fluid Layout**: All page containers and subheaders automatically stack and adapt.
- **Horizontal Touch Scroll**: Tables and Kanban boards scroll horizontally with native inertia touch.
- **Adaptive Modals**: Dialog boxes and notification dropdowns dynamically resize to fit small screens.

---

## 🗄️ Database Schema & Entity Relationships

```mermaid
erDiagram
    Company ||--o{ User : has
    Company ||--o{ Job : posts
    Company ||--o{ Candidate : manages
    Company ||--o{ Employee : employs
    Company ||--o{ Notification : receives
    Company ||--o{ OfferLetter : issues
    Job ||--o{ Application : receives
    Job ||--o{ ScreeningQuestion : contains
    Candidate ||--o{ Application : submits
    Candidate ||--o{ Resume : uploads
    Candidate ||--o{ Interview : attends
    Candidate ||--o{ CandidateNote : has
    Application ||--o{ CandidateAnswer : answers
```

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register company and admin user
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Current authenticated user profile

### Jobs (`/api/jobs`)
- `GET /api/jobs` — List company jobs (with status filter)
- `POST /api/jobs` — Create a new job requisition
- `GET /api/jobs/:id` — Get detailed job posting
- `PATCH /api/jobs/:id` — Update job posting
- `DELETE /api/jobs/:id` — Archive / delete job

### Candidates (`/api/candidates`)
- `GET /api/candidates` — List candidates with search and score filters
- `POST /api/candidates` — Create new candidate record
- `GET /api/candidates/:id` — Candidate profile with resumes and timeline
- `POST /api/candidates/:id/notes` — Add internal activity note

### AI ATS Engine (`/api/ats`)
- `POST /api/ats/score-resume` — AI ATS score on inbound resume
- `POST /api/ats/batch-score-inbox` — Run AI scoring on all pending CVs
- `POST /api/ats/score-candidate` — AI ATS score on existing candidate
- `POST /api/ats/generate-email` — Groq AI personalized email draft
- `POST /api/ats/send-email` — HR confirmation & email dispatch

### Payroll & Mobility (`/api/mobility`)
- `GET /api/mobility/events` — List vacancy & departure events
- `POST /api/mobility/events/:id/promote` — Promote successor and backfill
- `POST /api/mobility/events/:id/create-job` — Create job from vacancy
- `GET /api/mobility/employees` — 120+ Employee Directory
- `POST /api/mobility/simulate-departure` — Simulate employee exit

### Notifications (`/api/notifications`)
- `GET /api/notifications` — List live company notifications & unread count
- `PATCH /api/notifications/:id/read` — Mark single notification as read
- `POST /api/notifications/read-all` — Mark all notifications as read

### Public Career Portal (`/api/public`)
- `GET /api/public/careers/:companySlug` — Public career portal data
- `GET /api/public/jobs/:id` — Public job requisition details
- `POST /api/public/apply` — Public application submission with CV upload

---

## 🚀 Cloud Deployment Guide

### Free Cloud Architecture
- **Frontend**: [Vercel](https://vercel.com) (Next.js)
- **Backend API**: [Vercel Serverless Functions](https://vercel.com)
- **Cloud Database**: [Neon Serverless PostgreSQL](https://neon.tech)

### Step 1: Provision Neon Database
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy your connection string (`postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).

### Step 2: Deploy Backend to Vercel
1. In Vercel, import repository `Haseeb479/RMS`.
2. Root Directory: `backend` | Framework Preset: `Other`.
3. Add Environment Variables:
   - `DATABASE_URL` = your Neon connection string
   - `JWT_SECRET` = `rms-production-secret-key-2024`
   - `GROQ_API_KEY` = `your_groq_api_key_here`
   - `GROQ_MODEL` = `llama-3.3-70b-versatile`
   - `NODE_ENV` = `production`
4. Deploy and copy backend URL (e.g. `https://rms-backend.vercel.app`).

### Step 3: Deploy Frontend to Vercel
1. In Vercel, import repository `Haseeb479/RMS` as a new project.
2. Root Directory: `frontend` | Framework Preset: `Next.js`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://rms-backend.vercel.app/api`
4. Deploy!

---

## 💻 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Haseeb479/RMS.git
cd RMS
```

### 2. Install Dependencies
```bash
# Install root, frontend, and backend packages
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Setup Backend Environment (`backend/.env`)
```ini
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rms?schema=public"
JWT_SECRET="dev-jwt-secret-key-32-chars-minimum"
GROQ_API_KEY="your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"
NODE_ENV="development"
```

### 4. Setup Frontend Environment (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 5. Run Database Migrations
```bash
cd backend
npx prisma db push
```

### 6. Start Development Servers
```bash
# From the root directory:
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`
