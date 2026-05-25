# HireVision — AI-Powered Video-First Hiring Platform

> **Record a 60-second video resume. AI watches it, extracts your skills, scores your communication, and instantly matches you to jobs. Recruiters see a ranked shortlist with reasons — not just keywords.**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?logo=firebase)](https://firebase.google.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)

---

## 🎯 What Is HireVision?

HireVision reimagines hiring by putting **video intelligence at the center of the process**. Instead of parsing keywords from a PDF, our AI:

1. **Watches** the candidate's 60-second video resume via Gemini 2.5 Flash
2. **Transcribes** speech verbatim and **extracts skills** mentioned
3. **Scores communication quality** (1–10) based on clarity, confidence, and pacing
4. **Generates embeddings** (768-dim) and **cosine-matches** candidates to open jobs
5. **Explains the match** to recruiters in plain English with skill overlap breakdown

```
Candidate Records Video
        ↓
Gemini 2.5 Flash Analyzes (transcript + skills + communication score)
        ↓
text-embedding-004 generates 768-dim profile vector
        ↓
Cosine similarity matched against all job embeddings
        ↓
Recruiter sees AI-ranked shortlist with explanation
        ↓
Drag-and-drop Kanban pipeline management
```

---

## 🚀 Features

### For Candidates
- 📹 **In-browser video recording** (60-second limit, MediaRecorder API)
- 📤 **File upload fallback** — supports MP4, WebM, MOV, AVI
- 🤖 **Real-time AI analysis** — skills, experience summary, communication score
- 📊 **Profile dashboard** with animated skill badges and score gauge
- 💼 **Job board** with search, filter, and one-click apply
- 📋 **Application tracker** with stage progress stepper

### For Recruiters
- 📝 **Post jobs** with dynamic skill-tag input
- 🏆 **AI-ranked candidate list** per job with match percentage & explanation
- 🎯 **Skill overlap visualization** — matched vs. missing skills
- 🗂️ **Kanban pipeline** — drag-and-drop across Applied → Screened → Interview → Hired
- 📈 **Stats dashboard** — applications, pipeline count, avg match score

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Framer Motion |
| **Backend** | Node.js 22, Express 4, Multer v2 |
| **Database** | MongoDB Atlas (Mongoose 8) |
| **Auth** | Firebase Authentication (Email/Password) |
| **Storage** | Firebase Storage |
| **AI — Video Analysis** | Google Gemini 2.5 Flash Preview |
| **AI — Embeddings** | Google `text-embedding-004` (768 dim) |
| **AI — Match Explanation** | Google Gemini 2.5 Flash (1-sentence hiring rec) |
| **Deployment** | Google Cloud Run (containerized) |

---

## 📁 Project Structure

```
Video_first/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, firebase.js, gemini.js
│   │   ├── controllers/     # auth, candidate, job, application
│   │   ├── middleware/       # auth.js (Firebase token verify), upload.js (multer)
│   │   ├── models/          # User.js, Job.js, Application.js
│   │   ├── routes/          # auth, candidates, jobs, applications, seed
│   │   ├── services/        # aiService.js, embeddingService.js,
│   │   │                    # storageService.js, matchingService.js
│   │   └── index.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Button, Card, Badge, Input, Modal
│   │   │   └── layout/      # Navbar
│   │   ├── context/         # AuthContext.jsx
│   │   ├── pages/           # Landing, Login, Register, VideoRecord,
│   │   │                    # CandidateDashboard, JobBoard, MyApplications,
│   │   │                    # RecruiterDashboard, PostJob, JobCandidates, KanbanPipeline
│   │   ├── services/        # api.js (Axios), firebase.js
│   │   └── App.jsx          # Routes + Auth guards
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free M0 cluster)
- Firebase project (free Spark plan)
- Google AI Studio API key (free)

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/hirevision.git
cd hirevision
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Fill in: MONGODB_URI, FIREBASE_*, GEMINI_API_KEY
```

### 3. Configure Frontend
```bash
cd frontend
cp .env.example .env
# Fill in: VITE_API_URL, VITE_FIREBASE_*
```

### 4. Install & Run
```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

### 5. Seed Demo Data
```bash
# After both servers are running:
curl -X POST http://localhost:8080/api/seed
```
This creates **3 recruiters**, **6 jobs**, and **3 candidates** with real AI embeddings.

### 6. Demo Accounts (after seeding)
| Role | Email | Password |
|---|---|---|
| Recruiter | `priya@techcorp.in` | `HireVision@123` |
| Recruiter | `rahul@designhub.io` | `HireVision@123` |
| Candidate | `arjun@test.com` | `HireVision@123` |

---

## 🔑 Environment Variables

### `backend/.env`
```env
MONGODB_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
FIREBASE_API_KEY=AIzaSy...
GEMINI_API_KEY=AIzaSy...
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register candidate or recruiter |
| `POST` | `/api/auth/login` | ❌ | Login, returns Firebase ID token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/candidates/analyze-video` | ✅ Candidate | Upload video → AI analysis |
| `GET` | `/api/candidates/:id/profile` | ❌ | Get candidate public profile |
| `GET` | `/api/jobs` | ❌ | List jobs (search + filter) |
| `POST` | `/api/jobs` | ✅ Recruiter | Create a job posting |
| `GET` | `/api/jobs/:id/candidates` | ✅ Recruiter | AI-ranked candidates for job |
| `POST` | `/api/applications` | ✅ Candidate | Apply to a job |
| `PATCH` | `/api/applications/:id/stage` | ✅ Recruiter | Move candidate in pipeline |
| `GET` | `/api/applications/recruiter/stats` | ✅ Recruiter | Dashboard statistics |
| `POST` | `/api/seed` | ❌ | Seed demo data |
| `GET` | `/api/health` | ❌ | Health check |

---

## 🐳 Deploy to Google Cloud Run

```bash
# Backend
cd backend
gcloud run deploy hirevision-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,..."
```

Update `frontend/.env` → `VITE_API_URL=https://your-backend-url.run.app`, then rebuild and deploy frontend.

---

## 🏆 Why HireVision Wins

| Traditional ATS | HireVision |
|---|---|
| Keyword matching on PDFs | Semantic embedding cosine similarity |
| No communication assessment | AI-scored clarity, confidence, pacing |
| Recruiter watches every video | AI pre-ranks; recruiters review top matches |
| Binary pass/fail | Explainable % score with skill breakdown |
| Static pipeline spreadsheets | Real-time drag-and-drop Kanban |

---

## 📄 License

MIT © 2025 HireVision
