# HireVision — Video-First Hiring Platform

A hiring platform where candidates record short video resumes, AI analyzes them, and recruiters get a ranked, searchable talent pool — all in one place.

Built for the problem that traditional resumes don't show communication skills, personality, or how someone actually thinks. This does.

---

## 🌍 Live Deployment
- **Frontend (Vercel):** [https://hire-vision-3arjxnulx-rohit-mudas-projects.vercel.app](https://hire-vision-3arjxnulx-rohit-mudas-projects.vercel.app)
- **Backend (Google Cloud Run):** [https://hirevision-backend-969140599829.asia-south1.run.app](https://hirevision-backend-969140599829.asia-south1.run.app)
- **Database:** MongoDB Atlas (Production Cluster)

---

## What It Does

**For Candidates:**
- Record a 60-second video resume in the browser (or upload one)
- AI extracts your skills, experience, and gives you a communication score
- Apply to jobs — recruiters can see your video, score, and AI summary
- Track your application status across every company you applied to
- Upload a PDF resume alongside your video
- See how complete your profile is with a live progress tracker

**For Recruiters:**
- Post jobs with required skills
- Get a ranked list of matching candidates — AI explains why each candidate fits
- Search all candidates by skill or location
- Move candidates through a hiring pipeline (Applied → Screened → Interview → Hired)
- Drag-and-drop Kanban board for pipeline management
- See candidate communication scores, video resumes, and AI-written summaries in one place

---

## Tech Stack

| Layer | What We Used |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| AI | Google Gemini API (speech analysis + match explanations) |
| Vector Matching | text-embedding-004 (768-dim), cosine similarity |
| Auth | Firebase Authentication |
| Storage | Firebase Storage (video files + PDF resumes) |
| Deployment | Vercel (frontend) + Google Cloud Run (backend) |

---

## Features Implemented

### Candidate Side
- ✅ In-browser video recording with countdown timer
- ✅ Upload a video from device (MP4, WebM, MOV)
- ✅ Live speech-to-text capture during recording
- ✅ AI analysis: skills extraction, experience summary, communication score (1–10)
- ✅ Profile completeness tracker (Video + Skills + PDF)
- ✅ Skills portfolio (categorized into Technical and Other)
- ✅ PDF resume upload with drag-and-drop UI
- ✅ Job board with search, type filter, and experience level filter
- ✅ One-click apply with duplicate prevention
- ✅ Application tracker with pipeline stage visibility

### Recruiter Side
- ✅ Post jobs with skill tags and experience level
- ✅ AI-ranked candidate list with cosine similarity scores
- ✅ Skill match breakdown (which skills overlap, which are missing)
- ✅ AI-generated match explanation per candidate
- ✅ Candidate search engine (by skills + location)
- ✅ Profile modal with video playback, score, and PDF resume
- ✅ Kanban drag-and-drop pipeline
- ✅ Dashboard with hiring stats

### Platform
- ✅ Role-based access (candidates and recruiters see different things)
- ✅ Firebase ID token auth on every protected route
- ✅ Rate limiting on video uploads and auth endpoints
- ✅ 1-click demo login for judges (no signup needed)
- ✅ Seed endpoint to populate demo data

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier works)
- A Firebase project with Email/Password auth enabled + a service account key
- A Google AI Studio API key — [get one here](https://aistudio.google.com/apikey)

---

### 1. Clone the repo

```bash
git clone https://github.com/Rohit-Muda/HireVision.git
cd HireVision
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Set up environment variables

**`backend/.env`**
```env
PORT=8080
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hirevision

GEMINI_API_KEY=your_gemini_api_key

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_API_KEY=your_firebase_web_api_key

CORS_ORIGIN=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:8080/api

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

### 4. Start the servers

```bash
# Terminal 1 — Backend (runs on :8080)
cd backend
npm run dev

# Terminal 2 — Frontend (runs on :5173)
cd frontend
npm run dev
```

### 5. Seed demo data

With the backend running:

```bash
# Mac/Linux
curl -X POST http://localhost:8080/api/seed

# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/api/seed" -Method POST
```

This creates:
- Demo Candidate: `arjun@test.com` / `HireVision@123`
- Demo Recruiter: `priya@techcorp.in` / `HireVision@123`
- 6 open jobs + 4 candidates with pre-computed AI profiles

Then open `http://localhost:5173` and use the **1-click demo login** buttons.

---

## How the AI Analysis Works

When a candidate records their video:

1. The browser captures their speech in real-time using the Web Speech API
2. When they click "Analyze", the transcript is sent to the backend (not the raw video)
3. The backend sends the transcript to the Gemini API — which extracts skills, scores communication, and writes an AI summary
4. The backend also generates a 768-dimension embedding of the candidate's profile
5. When a recruiter opens a job's candidates, each candidate's embedding is compared against the job's embedding using cosine similarity — giving a 0–100 match score

This approach is much faster and cheaper than sending raw video to AI. The transcript is a few hundred tokens. A raw video would be tens of thousands.

If speech capture isn't available (Firefox, Safari), the raw video is sent directly to the AI as a fallback.

---

## Project Structure

```
HireVision/
├── frontend/                  # React app
│   ├── src/
│   │   ├── pages/             # All route-level screens
│   │   ├── components/        # Shared UI components
│   │   ├── context/           # Auth context
│   │   └── services/          # API client, Firebase config
│   ├── vercel.json            # SPA routing for Vercel
│   └── vite.config.js
│
└── backend/                   # Express API
    ├── src/
    │   ├── config/            # MongoDB, Firebase Admin, Gemini init
    │   ├── controllers/       # Business logic per resource
    │   ├── middleware/        # Auth, file upload, rate limits
    │   ├── models/            # Mongoose schemas
    │   ├── routes/            # Express routers
    │   └── services/          # AI, embeddings, matching, storage
    └── Dockerfile
```

---

## API Endpoints

| Method | Endpoint | Auth | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account (candidate or recruiter) |
| POST | `/api/auth/login` | — | Login, get Firebase token |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/candidates/analyze-video` | ✅ Candidate | Upload video + transcript → AI analysis |
| GET | `/api/candidates/search` | — | Search candidates by skill/location |
| GET | `/api/jobs` | — | List/filter jobs |
| POST | `/api/jobs` | ✅ Recruiter | Create a job |
| GET | `/api/jobs/:id/candidates` | ✅ Recruiter | AI-ranked candidate list for a job |
| POST | `/api/applications` | ✅ Candidate | Apply to a job |
| PATCH | `/api/applications/:id/stage` | ✅ Recruiter | Move candidate in pipeline |
| GET | `/api/applications/recruiter/stats` | ✅ Recruiter | Dashboard stats |
| POST | `/api/candidates/upload-resume` | ✅ Candidate | Upload PDF resume |
| GET | `/api/health` | — | Health check |
| POST | `/api/seed` | — | Populate demo data |

---

## Deployment

**Frontend → Vercel**
1. Import the repo in [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add all `VITE_*` environment variables (make sure `VITE_API_URL` points to your deployed backend)
4. Deploy — `vercel.json` handles SPA routing automatically

**Backend → Google Cloud Run**
1. Build the Docker image and push it to Google Artifact Registry:
   ```bash
   gcloud builds submit --tag asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/hirevision/backend:latest .
   ```
2. Deploy the container to Cloud Run:
   ```bash
   gcloud run deploy hirevision-backend \
     --image asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/hirevision/backend:latest \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars "NODE_ENV=production,MONGODB_URI=...,GEMINI_API_KEY=...,CORS_ORIGIN=*"
   ```
3. Cloud Run automatically manages scaling, HTTPS, and health checks.

---

## Demo

Use the 1-click demo buttons on the login page — no signup needed.

**As a Candidate:**
- Go to Record Resume → speak for 30–60 seconds → click Analyze with AI
- Watch the analysis happen in ~5 seconds
- Check your dashboard — skills, score, summary
- Browse jobs and apply

**As a Recruiter:**
- Go to any job → view AI-ranked candidates
- Click a candidate to see their video, score, and PDF resume
- Move them through the pipeline
- Use Find Talent to search all candidates by skill

---

## License

MIT
