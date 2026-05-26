# HireVision — AI-Powered Video-First Hiring Platform

> **Record a 60-second video resume. AI watches it, extracts your skills, scores your communication, and instantly matches you to jobs. Recruiters see a ranked shortlist with reasons — not just keywords.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?logo=firebase)](https://firebase.google.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![Tests](https://img.shields.io/badge/Tests-35_passing-brightgreen)](./backend/src/tests)
[![License](https://img.shields.io/badge/License-MIT-blue)](#)

---

## 🎯 What Is HireVision?

HireVision reimagines hiring by putting **video intelligence at the center of the process**. Instead of parsing keywords from a PDF, our AI:

1. **Watches** the candidate's 60-second video resume via Gemini 2.5 Flash multimodal
2. **Transcribes** speech verbatim and **extracts skills** mentioned
3. **Scores communication quality** (1–10) based on clarity, confidence, and pacing
4. **Generates embeddings** (768-dim via `text-embedding-004`) and **cosine-matches** candidates to open jobs
5. **Explains the match** to recruiters in plain English with skill overlap breakdown

```
Candidate Records Video
        ↓
Gemini File API uploads buffer → Polls for ACTIVE state
        ↓
Gemini 2.5 Flash analyzes (transcript + skills + communication score + aiSummary)
        ↓
text-embedding-004 generates 768-dim profile vector
        ↓
Cosine similarity matched against all job embeddings (0–100 scale)
        ↓
Recruiter sees AI-ranked shortlist with Gemini-generated explanation
        ↓
Drag-and-drop Kanban pipeline management (Applied→Screened→Interview→Hired)
```

---

## ✅ Feature Status

### Candidates
| Feature | Status |
|---|---|
| In-browser video recording (SVG countdown ring, animated waveform) | ✅ |
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
| Kanban pipeline drag-and-drop (same-column reorder fixed) | ✅ |
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
| Seed data (3 jobs + 4 candidates with embeddings) | ✅ |
| 1-click demo login (auto-submits) | ✅ |
| 35 unit tests passing (17 backend + 18 frontend) | ✅ |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, lucide-react |
| **Backend** | Node.js 20, Express 4, mongoose |
| **AI** | Google Gemini 2.5 Flash (video), text-embedding-004 (matching) |
| **Auth** | Firebase Authentication + firebase-admin |
| **Database** | MongoDB Atlas |
| **Storage** | Firebase Storage (video archival), Gemini File API (AI analysis) |
| **Security** | Helmet.js, express-rate-limit, CORS |
| **Deployment** | Google Cloud Run (Docker multi-stage) |
| **Testing** | Node.js built-in test runner (backend), Vitest (frontend) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas cluster
- Firebase project with Authentication enabled
- Google AI Studio API key (Gemini)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/hirevision.git
cd hirevision

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
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
CORS_ORIGIN=http://localhost:5173
PORT=8080
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
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
- `cosineSimilarity` — null/empty/orthogonal/identical/random vector cases
- `buildCandidateEmbeddingText` — null safety, content inclusion
- AI JSON parsing — clean JSON, markdown-fenced fallback, score clamping
- Pipeline stage validation — valid/invalid stage rejection
- Timer formatting, MIME → extension mapping, upload progress calculation
- Match explanation generation — all edge cases

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register candidate or recruiter |
| `POST` | `/api/auth/login` | ❌ | Login, returns Firebase ID token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/candidates/analyze-video` | ✅ Candidate | Upload video → Gemini AI analysis (10/hr limit) |
| `GET` | `/api/candidates/:id/profile` | ❌ | Get public candidate profile |
| `GET` | `/api/jobs` | ❌ | List jobs (search, filter, paginate) |
| `POST` | `/api/jobs` | ✅ Recruiter | Create job with AI embedding |
| `GET` | `/api/jobs/:id/candidates` | ✅ Recruiter | AI-ranked matched candidates + applicationId |
| `GET` | `/api/applications/candidate/:id` | ✅ | Candidate's applications with stage |
| `GET` | `/api/applications/job/:jobId` | ✅ Recruiter | Applications grouped by Kanban stage |
| `PATCH` | `/api/applications/:id/stage` | ✅ Recruiter | Update pipeline stage |
| `GET` | `/api/applications/recruiter/stats` | ✅ Recruiter | Jobs, applications, avg match score |
| `GET` | `/api/health` | ❌ | Health check (DB status, env) |
| `POST` | `/api/seed` | ❌ | Seed demo data |

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

---

## 📐 Architecture

```
frontend/                   # React 19 + Vite + Tailwind
├── src/
│   ├── pages/              # Route-level components
│   ├── components/         # Shared UI (Card, Modal, Badge, etc.)
│   ├── context/            # AuthContext (Firebase + user state)
│   ├── services/           # axios API client + Firebase init
│   └── tests/              # Vitest unit tests

backend/
├── src/
│   ├── config/             # MongoDB, Firebase Admin, Gemini init
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth, upload, error handler, rate limits
│   ├── models/             # Mongoose schemas (User, Job, Application)
│   ├── routes/             # Express routers
│   ├── services/
│   │   ├── aiService.js        # Gemini File API + video analysis
│   │   ├── embeddingService.js # text-embedding-004, null-safe
│   │   ├── matchingService.js  # Cosine similarity + explanations
│   │   └── storageService.js   # Firebase Storage archival
│   └── tests/              # Node.js built-in test runner
├── Dockerfile              # Multi-stage, non-root, HEALTHCHECK
└── .dockerignore
```

---

## 🎬 Demo Flow (for Judges)

1. **Open** `http://localhost:5173`
2. Click **"⚡ Demo Candidate"** → logs in instantly
3. Click **"Record Video Resume"** → record 15–30 seconds speaking about your skills
4. Click **"Analyze with AI"** → watch the 5-step analysis panel
5. View your **dashboard** — skills, score gauge, AI summary, transcript
6. Click **"Browse Jobs"** → apply to a role
7. Logout → click **"🏢 Demo Recruiter"** → logs in instantly
8. Click **"AI Candidates"** on any job → see ranked shortlist with explanations
9. Click **"Shortlist"** → candidate moves to Screened (instant, no reload)
10. Click **"Pipeline"** → drag candidates across Kanban columns

---

## 📄 License

MIT © 2026 HireVision
