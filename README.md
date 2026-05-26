# HireVision — AI-Powered Video-First Hiring Platform

> **Record a 60-second video resume. AI captures your speech in real-time, extracts skills, scores communication, and instantly matches you to jobs. Recruiters see a ranked shortlist with AI-generated explanations — not just keywords.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?logo=firebase)](https://firebase.google.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![Tests](https://img.shields.io/badge/Tests-35_passing-brightgreen)](./backend/src/tests)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker)](./backend/Dockerfile)
[![License](https://img.shields.io/badge/License-MIT-blue)](#)

---

## 🎯 What Is HireVision?

HireVision reimagines hiring by putting **video intelligence at the center of the process**. Instead of parsing keywords from a PDF, our AI:

1. **Captures speech in real-time** using the browser's Web Speech API — zero cost, zero latency
2. **Analyzes the transcript** via Gemini 2.0 Flash — extracting skills, experience, and communication quality
3. **Scores communication** (1–10) based on clarity, structure, vocabulary, and confidence indicators
4. **Generates embeddings** (768-dim via `text-embedding-004`) and **cosine-matches** candidates to open jobs
5. **Explains the match** to recruiters in plain English with skill overlap breakdown

### 💡 Key Innovation: Speech-First Architecture

Most AI hiring tools send raw video to multimodal models — expensive (~50,000 tokens/video) and slow (60-90 seconds). **HireVision uses a radically cheaper approach:**

```
┌─────────────────────────────────────────────────────────────────┐
│  DURING RECORDING (Browser — FREE)                              │
│  Web Speech API captures speech → real-time transcript display  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│  ON SUBMIT (Parallel)                                           │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Video → Firebase     │  │ Transcript → Gemini 2.0 Flash   │ │
│  │ Storage (playback)   │  │ (~200 tokens, 3-5 seconds)      │ │
│  │                      │  │ → skills, score, summary        │ │
│  └──────────────────────┘  └──────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│  text-embedding-004 generates 768-dim profile vector            │
│  Cosine similarity matches against all job embeddings (0–100)   │
│  Recruiter sees AI-ranked shortlist + Gemini explanation        │
│  Drag-and-drop Kanban pipeline (Applied→Screened→Interview→Hired)│
└─────────────────────────────────────────────────────────────────┘
```

| Metric | Video Analysis (others) | Speech-First (HireVision) |
|---|---|---|
| **AI Tokens per analysis** | ~50,000 | **~200-500** |
| **Cost multiplier** | 1x | **100x cheaper** |
| **Analysis time** | 60-90 seconds | **3-10 seconds** |
| **Free tier capacity** | ~3 videos/day | **1,000+ analyses/day** |
| **Browser dependency** | None | Chrome/Edge (graceful fallback) |

---

## ✅ Feature Status

### Candidates
| Feature | Status |
|---|---|
| In-browser video recording (SVG countdown ring, animated waveform) | ✅ |
| **Real-time speech capture** (Web Speech API with live transcript display) | ✅ |
| File upload fallback (MP4, WebM, MOV, AVI) | ✅ |
| Real-time upload progress bar (XHR onUploadProgress) | ✅ |
| Step-by-step AI analysis indicator | ✅ |
| Skills, experience summary, communication score gauge | ✅ |
| Transcript viewer modal | ✅ |
| Job board (search, filter, one-click apply) | ✅ |
| Application tracker with stage stepper | ✅ |

### Recruiters
| Feature | Status |
|---|---|
| Post jobs with dynamic skill-tag input | ✅ |
| AI-ranked candidate list (cosine similarity + Gemini explanation) | ✅ |
| Skill overlap visualization (matched ✅ vs. missing ❌) | ✅ |
| Candidate AI summary card per listing | ✅ |
| Shortlist (1-click → Screened stage, no extra API call) | ✅ |
| Kanban pipeline drag-and-drop (same-column reorder supported) | ✅ |
| Stats dashboard (jobs, applications, pipeline, avg match score) | ✅ |
| Video playback modal per candidate | ✅ |

### Platform
| Feature | Status |
|---|---|
| Firebase Authentication (email/password) | ✅ |
| Role-based routing (candidate / recruiter) | ✅ |
| Rate limiting (auth: 20/15min, video: 10/hr, API: 300/15min) | ✅ |
| Security headers (Helmet.js) | ✅ |
| Multi-stage Dockerfile (non-root user, HEALTHCHECK) | ✅ |
| **Model fallback chain** (gemini-2.0-flash → 2.5-flash → 2.0-flash-lite) | ✅ |
| **Retry with backoff** on 429 quota errors | ✅ |
| MongoDB connection retry (5 attempts, incremental backoff) | ✅ |
| Seed data (3 jobs + 4 candidates with embeddings) | ✅ |
| 1-click demo login (auto-submits) | ✅ |
| 35 unit tests passing (17 backend + 18 frontend) | ✅ |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, lucide-react |
| **Backend** | Node.js 20, Express 4, Mongoose |
| **AI (Analysis)** | Google Gemini 2.0 Flash (text-only transcript analysis) |
| **AI (Matching)** | text-embedding-004 (768-dim vectors), cosine similarity |
| **Speech Capture** | Web Speech API (browser-native, zero-cost) |
| **Auth** | Firebase Authentication + firebase-admin |
| **Database** | MongoDB Atlas (with retry + reconnect logic) |
| **Storage** | Firebase Storage (video archival), Gemini File API (video fallback) |
| **Security** | Helmet.js, express-rate-limit, CORS, role-based middleware |
| **Deployment** | Google Cloud Run (Docker multi-stage) |
| **Testing** | Node.js built-in test runner (backend), Vitest (frontend) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas cluster
- Firebase project with Authentication enabled
- Google AI Studio API key ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 1. Clone & Install

```bash
git clone https://github.com/Rohit-Muda/HireVision.git
cd HireVision

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Variables

**`backend/.env`**
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hirevision
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_API_KEY=your_firebase_web_api_key
CORS_ORIGIN=http://localhost:5173
PORT=8080
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

### 3. Run Locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### 4. Seed Demo Data

```bash
# With backend running:
curl -X POST http://localhost:8080/api/seed

# PowerShell:
Invoke-WebRequest -Uri "http://localhost:8080/api/seed" -Method POST
```

This creates:
- **Demo Candidate:** `arjun@test.com` / `HireVision@123`
- **Demo Recruiter:** `priya@techcorp.in` / `HireVision@123`
- 3 Jobs + 4 candidates with pre-computed AI embeddings

---

## 🧪 Running Tests

```bash
# Backend — 17 tests (Node.js built-in runner)
cd backend && npm test

# Frontend — 18 tests (Vitest)
cd frontend && npm test
```

**Test Coverage:**
- `cosineSimilarity` — null/empty/orthogonal/identical/random vector edge cases
- `buildCandidateEmbeddingText` — null safety, content inclusion
- AI JSON parsing — clean JSON, markdown-fenced fallback, score clamping
- Pipeline stage validation — valid/invalid stage rejection
- Timer formatting, MIME → extension mapping, upload progress calculation
- Match explanation generation — all edge cases

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new candidate or recruiter |
| `POST` | `/api/auth/login` | Public | Login, returns Firebase ID token |
| `GET` | `/api/auth/me` | Required | Get current verified user profile |
| `POST` | `/api/candidates/analyze-video` | Required (Candidate) | Upload video resume & transcript → AI analysis (limit: 10/hr) |
| `GET` | `/api/candidates/:id/profile` | Public | Retrieve public candidate profile info |
| `GET` | `/api/candidates/search` | Public | Search / filter candidates list |
| `GET` | `/api/jobs` | Public | Query/filter open jobs (supports search, type, experience filtering) |
| `GET` | `/api/jobs/recruiter/mine` | Required (Recruiter) | Fetch all jobs posted by the logged-in recruiter |
| `POST` | `/api/jobs` | Required (Recruiter) | Create a new job post and auto-generate its embedding |
| `GET` | `/api/jobs/:id` | Public | Get full details of a specific job post |
| `GET` | `/api/jobs/:id/candidates` | Required (Recruiter) | Fetch AI-ranked candidates matching the job's required skills |
| `POST` | `/api/applications` | Required (Candidate) | Submit a new job application |
| `GET` | `/api/applications/candidate/:candidateId` | Required | List all applications submitted by a candidate |
| `GET` | `/api/applications/job/:jobId` | Required (Recruiter) | List all applications for a job grouped by Kanban columns |
| `PATCH` | `/api/applications/:id/stage` | Required (Recruiter) | Move application to another pipeline stage (Kanban drag-and-drop) |
| `GET` | `/api/applications/recruiter/stats` | Required (Recruiter) | Fetch general hiring stats (jobs count, applications count, average match) |
| `PUT` | `/api/recruiters/profile` | Required (Recruiter) | Update recruiter profile (companyName, companyLogo, companyDescription) |
| `GET` | `/api/health` | Public | Server health status, timestamp, and MongoDB connectivity indicator |
| `POST` | `/api/seed` | Public | Re-seed MongoDB database with jobs, recruiters, and pre-computed candidates |

---

## 🐳 Docker / Cloud Run Deployment

```bash
cd backend
docker build -t hirevision-backend .
docker run -p 8080:8080 --env-file .env hirevision-backend
```

**Cloud Run:**
```bash
gcloud run deploy hirevision \
  --source ./backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI=...,GEMINI_API_KEY=...
```

The Dockerfile uses a **multi-stage build** with a non-root user and built-in HEALTHCHECK for Cloud Run health monitoring.

---

## 🔐 Security

| Control | Implementation |
|---|---|
| Authentication | Firebase ID token verified server-side on every protected route |
| Authorization | Role-based middleware (`requireRole`) — candidates can't hit recruiter endpoints |
| Rate Limiting | Auth: 20/15min · Video upload: 10/hour · API: 300/15min |
| Headers | Helmet.js (X-Frame-Options, HSTS, CSP, etc.) |
| CORS | Configurable via `CORS_ORIGIN` env var |
| Secrets | `.env` files excluded via `.gitignore` |
| Container | Non-root user in Docker, minimal `node:20-slim` base |
| AI Resilience | Model fallback chain + retry with backoff on 429 errors |

---

## 📐 Architecture

```
frontend/                    # React 19 + Vite + Tailwind
├── src/
│   ├── pages/               # Route-level components
│   │   ├── VideoRecord.jsx      # Camera + Web Speech API + upload
│   │   ├── Dashboard.jsx        # Candidate profile + score gauge
│   │   ├── JobBoard.jsx         # Browse + search + apply
│   │   └── RecruiterDash.jsx    # Stats + AI candidates + Kanban
│   ├── components/          # Shared UI (Card, Modal, Badge, etc.)
│   ├── context/             # AuthContext (Firebase + user state)
│   ├── services/            # axios API client + Firebase init
│   └── tests/               # Vitest unit tests

backend/
├── src/
│   ├── config/              # MongoDB (retry), Firebase Admin, Gemini init
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth, upload, error handler, rate limits
│   ├── models/              # Mongoose schemas (User, Job, Application)
│   ├── routes/              # Express routers
│   ├── services/
│   │   ├── aiService.js         # Transcript analysis + video fallback + model chain
│   │   ├── embeddingService.js  # text-embedding-004, null-safe builders
│   │   ├── matchingService.js   # Cosine similarity + Gemini explanations
│   │   └── storageService.js    # Firebase Storage archival
│   └── tests/               # Node.js built-in test runner
├── Dockerfile               # Multi-stage, non-root, HEALTHCHECK
└── .dockerignore
```

---

## 🎬 Demo Flow (for Judges)

1. **Open** `http://localhost:5173`
2. Click **"⚡ Demo Candidate"** → logs in instantly
3. Click **"Record Video Resume"** → record 15–30 seconds speaking about your skills
   - Notice the 🎙️ **live transcript** appearing at the bottom of the video
4. Click **"Analyze with AI"** → watch the 5-step analysis panel (~5 seconds!)
5. View your **dashboard** — skills, score gauge, AI summary, transcript
6. Click **"Browse Jobs"** → apply to a role
7. Logout → click **"🏢 Demo Recruiter"** → logs in instantly
8. Click **"AI Candidates"** on any job → see ranked shortlist with explanations
9. Click **"Shortlist"** → candidate moves to Screened (instant, no reload)
10. Click **"Pipeline"** → drag candidates across Kanban columns

> **💡 Why Speech-First?** Traditional approaches send raw video to Gemini (~50K tokens). We capture speech in the browser for free, then send only text (~200 tokens). This is **100x cheaper** and **10x faster** — the kind of optimization judges notice.

---

## 📊 Scalability & Performance

| Aspect | Design Decision |
|---|---|
| **AI Cost** | Speech-first: ~200 tokens/analysis vs ~50K for video. Sustains 1,000+ free-tier analyses/day |
| **Model Resilience** | 3-model fallback chain (2.0-flash → 2.5-flash → 2.0-flash-lite) with retry backoff |
| **DB Resilience** | 5-retry connection with incremental backoff (3s, 6s, 9s, 12s, 15s) |
| **Match Explanations** | Rule-based fallback when all AI models are quota'd — never blocks recruiter flow |
| **Embeddings** | 768-dim vectors with cosine similarity — O(n) matching, sub-millisecond per candidate |
| **Rate Limiting** | Per-user (Firebase UID) rate limits prevent abuse without IP-based issues |
| **Container** | Non-root, minimal base image, built-in health checks for auto-restart |

---

## 📄 License

MIT © 2026 HireVision
