# HireVision

HireVision is a video-first hiring platform. Candidates submit video resumes that are analyzed by an automated system to extract skills, evaluate communication, and summarize experience. Recruiters receive a ranked pool of candidates matched against job requirements.

## Architecture and Tech Stack

*   **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
*   **Backend:** Node.js, Express
*   **Database:** MongoDB Atlas
*   **Analysis:** Google Gemini API
*   **Vector Matching:** text-embedding-004 (768-dim), cosine similarity
*   **Authentication:** Firebase Authentication
*   **Storage:** Firebase Storage
*   **Deployment:** Vercel (Frontend), Google Cloud Run (Backend)

## Core Capabilities

### Candidate Experience
*   Record and upload video resumes directly in the browser.
*   Automated skill extraction and communication evaluation.
*   Track application status across multiple job postings.
*   Upload supplementary PDF resumes alongside video submissions.
*   View profile completeness and categorized skills portfolio.

### Recruiter Experience
*   Post jobs with required skills and experience levels.
*   Review system-ranked candidate lists based on cosine similarity scores.
*   View detailed skill match breakdowns and automated match explanations.
*   Search candidate database by skill set and location.
*   Manage candidates through a drag-and-drop Kanban pipeline.

## Setup Instructions

### Prerequisites
*   Node.js 18 or higher
*   MongoDB Atlas cluster
*   Firebase project (Email/Password auth enabled, service account key)
*   Google AI Studio API key

### 1. Repository Setup

```bash
git clone https://github.com/Rohit-Muda/HireVision.git
cd HireVision
```

### 2. Dependency Installation

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:
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

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

### 4. Running the Application

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend server:
```bash
cd frontend
npm run dev
```

### 5. Seeding Demo Data

With the backend running, execute the following command to populate the database with initial users and jobs:

Mac or Linux:
```bash
curl -X POST http://localhost:8080/api/seed
```

Windows PowerShell:
```bash
Invoke-WebRequest -Uri "http://localhost:8080/api/seed" -Method POST
```

## System Workflow

1.  The candidate's speech is captured in real-time via the Web Speech API.
2.  The transcript is processed to extract skills, calculate communication metrics, and generate a summary.
3.  A 768-dimension embedding is generated for the candidate's profile.
4.  Candidate embeddings are compared against job embeddings using cosine similarity to generate match scores.
5.  If speech capture is unavailable in the browser, the raw video is processed directly as a fallback.

## Deployment Details

### Frontend (Vercel)
Set the root directory to `frontend` and configure all `VITE_*` environment variables. Ensure `VITE_API_URL` points to the production backend URL.

### Backend (Google Cloud Run)
Build and deploy the Docker container to Google Artifact Registry, then deploy to Cloud Run with unauthenticated access allowed. Set production environment variables in the Cloud Run configuration.
