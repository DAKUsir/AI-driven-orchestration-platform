# 🚀 FinishIt — AI-Powered Competitive Orchestrated Learning Platform

> *Stop starting. Start finishing.*

**FinishIt** is a full-stack, AI-driven platform built for competitive programmers, students, and developers who want to track, finish, and win at their learning goals. It combines real-time collaboration, intelligent task automation, career tools, and deep integrations — all in one focused workspace.

**Live Demo:** [https://finishit-tau.vercel.app](https://finishit-tau.vercel.app)  
**Backend API:** [https://finishit-backend.onrender.com](https://finishit-backend.onrender.com)

---

## 📸 Overview

```
Frontend (React + Vite)     →    Backend (Node.js + Express)    →    MongoDB Atlas
     Vercel                              Render                         Cloud DB
                                    FastAPI AI Service
                                    (Python + Uvicorn)
```

---

## 🧠 AI Features

FinishIt has **6 distinct AI integrations** across the platform, all powered by GitHub Models (DeepSeek-V3) and custom FastAPI services:

### 1. 🎯 AI Task Generator — Task Planner
> *Generate a full, structured task plan from a single goal sentence*

- Describe your goal in plain English (e.g. *"Learn React in 30 days"*)
- AI breaks it into prioritized, categorized, timed tasks with difficulty levels
- Tasks auto-populate into your Kanban board with due dates
- **Model:** GitHub Models (DeepSeek-V3-0324) via FastAPI `/api/break-task`

### 2. 📅 AI Day Prioritizer — Task Planner
> *Let AI decide the optimal order for today's tasks*

- Analyzes pending tasks and your available hours
- Returns a smart ordering with reasoning for each decision
- **Model:** FastAPI `/api/prioritize-day`

### 3. 🔄 AI Smart Reschedule
> *Missed tasks? AI reschedules them intelligently*

- Detects skipped/overdue tasks
- Generates an optimal catch-up plan
- **Model:** FastAPI `/api/reschedule`

### 4. 📝 AI Weekly Review
> *Get a motivational, data-driven summary of your week*

- Analyzes completed, skipped, and carried-forward tasks
- Produces a narrative summary with actionable insights
- **Model:** FastAPI `/api/weekly-review`

### 5. 💻 AI Code Assistant — Code Editor
> *Context-aware AI that sees your code and guides you*

- Full Monaco editor with real-time code context injection
- **Hint Mode** 💡 — guides without spoiling (Socratic method)
- **Solution Mode** ✅ — provides complete working code with explanations
- One-click "Ask for Hint" scans your current code
- Supports: JavaScript, Python, Java, C++, TypeScript
- **Model:** GitHub Models via `/api/ai/chat`

### 6. 🎬 AI YouTube Discover — YouTube Dashboard
> *Find the perfect learning playlist with one query*

- Type a topic (e.g. *"system design for interviews"*)
- AI searches and returns curated YouTube playlist recommendations
- One-click save to your course library
- Auto-generates study tasks from any playlist
- **Model:** GitHub Models via `/api/ai/chat`

### 7. 📄 AI Resume Analyzer — Career Page
> *Complete AI-powered career toolkit*

- **Resume Score** — Overall quality analysis with section-by-section feedback
- **ATS Analysis** — Match score against any job description
- **AI Rephrase** — Rewrite bullet points to be more impactful
- **Cover Letter Generator** — Tailored cover letters from resume + JD
- **Interview Question Generator** — Custom questions based on job description
- Powered by **Gradio** + **GitHub Models** via FastAPI proxy

---

## 📋 Core Platform Features

### 🏠 Dashboard
- Real-time stats: tasks completed, streak days, competition rank, hours studied
- Today's task summary with carry-forward system
- Leaderboard preview and streak tracker
- Dark/Light mode with system preference detection

### ✅ Task Planner (Kanban)
- Drag-and-drop Kanban board (Pending → In Progress → Done → Skipped)
- Categories: YouTube, Coursera, GitHub, LeetCode, GFG, Kaggle, Interview Prep
- Priority levels: Low / Medium / High / Urgent
- Difficulty ratings, due dates, estimated time, source links, tags
- Persistent cross-day carry-forward (tasks don't disappear)
- Search and filter by category

### 📅 Calendar
- Month/week view linked directly to Task Planner
- Visual task scheduling with color-coded priorities
- "Unscheduled Tasks" panel for tasks without due dates
- Click any day to see or create tasks

### 🏆 Competitions Tracker
- Live Codeforces contests via real-time API
- Static entries: LeetCode Weekly/Biweekly, CodeChef Starters, TechGig
- Upcoming / Ongoing / Past filters
- Set personal reminders per contest
- Auto-seeded on first load

### 📚 DSA Sheets
- 10 curated industry-standard DSA problem sheets:
  - Striver's SDE Sheet (191), A2Z Sheet (456), NeetCode 150, Blind 75
  - Love Babbar 450, Apna College 375, Fraz 200, LeetCode Patterns, GFG Company-wise
- Filter by tags: beginner, interview-ready, company-specific, revision
- Upvote system, verified badges

### 💻 Code Editor
- Monaco Editor (same engine as VS Code)
- Multi-language: JS, Python, Java, C++, TypeScript
- Live browser execution for JavaScript/TypeScript
- Custom test input/output panels
- Full AI chat panel (see AI features)
- Hint vs Solution mode toggle

### 📊 Analytics
- Study hours tracked over time
- Task completion rates and trends
- Category-wise breakdown
- Streak analysis

### 🎬 YouTube Course Tracker
- Connect YouTube account via OAuth
- Auto-sync and detect course playlists (vs music/entertainment)
- Smart category detection: DSA, Web Dev, Python, ML/AI, DevOps, etc.
- Track video-by-video progress with watched/unwatched toggle
- Auto-generate study tasks from playlist
- Add any public playlist by URL (no OAuth needed)
- AI-powered course discovery

### 👥 Group Study Rooms
- Create/join study groups
- Real-time group chat via Socket.IO
- Voice channels with live audio
- Message persistence in MongoDB
- Member presence tracking

### 🏅 Leaderboard
- Platform-wide competitive ranking
- Score based on tasks completed, streaks, competitions
- Real-time updates

### 🔔 Notifications
- In-app notification system
- Competition reminders
- Study streak alerts

### 🎯 Career Hub
- AI resume analyzer (see AI features)
- Resume upload and parsing
- Job description matching
- Cover letter generation
- Interview question generation

### 🗺️ Learning Roadmap
- Structured learning paths for popular tech stacks
- Node/progress tracking per topic

### 🔗 Integrations
- **YouTube** — OAuth sync of playlists and history
- **GitHub** — Project monitoring
- **Google OAuth** — Sign in with Google

### ⚙️ Settings & Profile
- Edit name, avatar, bio
- Notification preferences
- Theme toggle (Dark/Light)
- Account management

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Zustand** | Global state management (18 stores) |
| **React Router v6** | Client-side routing |
| **Framer Motion** | Animations & transitions |
| **Monaco Editor** | VS Code-grade code editor |
| **Socket.IO Client** | Real-time chat |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Icon system |
| **Vanilla CSS** | Styling with CSS custom properties (dark/light themes) |

### Backend (Node.js)
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Primary database |
| **Socket.IO** | Real-time WebSocket server |
| **Passport.js** | Google OAuth 2.0 strategy |
| **JWT (jsonwebtoken)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Transactional emails |
| **Multer** | File upload handling |
| **helmet** | Security headers |

### AI Service (Python)
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | AI microservice REST API |
| **Uvicorn** | ASGI server |
| **GitHub Models API** | DeepSeek-V3-0324 LLM |
| **Azure AI Inference** | GitHub Models SDK |
| **OpenAI SDK** | LLM client fallback |
| **Gradio Client** | Resume analyzer via Hugging Face Spaces |

### Infrastructure & Deployment
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting (CDN + auto-deploy) |
| **Render** | Backend + AI service hosting |
| **MongoDB Atlas** | Cloud database (M0 free tier) |
| **Google Cloud Console** | OAuth credentials |
| **GitHub** | Version control + GitHub Models API |

---

## 📁 Project Structure

```
AI-driven-orchestration-platform/
├── frontend_ai_code/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/                 # 22 page components
│   │   ├── components/            # Shared UI components
│   │   ├── store/                 # 18 Zustand stores
│   │   └── utils/
│   │       └── api.js             # Axios client
│   ├── vercel.json                # SPA routing config
│   └── vite.config.js
│
├── backend_ai_code/               # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/                # 18 API route files
│   │   ├── middleware/            # Auth, upload middleware
│   │   ├── services/              # AI service client, YouTube service
│   │   └── config/               # Passport, DB config
│   ├── ai-service/                # Python FastAPI AI microservice
│   │   ├── main.py
│   │   ├── routers/
│   │   └── services/
│   ├── start.sh                   # Starts both Node + Python on Render
│   ├── requirements.txt           # Python deps for Render build
│   └── .env.example
│
└── render.yaml                    # Render deployment config
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console OAuth credentials
- GitHub Personal Access Token (for AI models)

### Clone & Install

```bash
git clone https://github.com/DAKUsir/AI-driven-orchestration-platform.git
cd AI-driven-orchestration-platform
```

**Backend:**
```bash
cd backend_ai_code
npm install
pip install -r ai-service/requirements.txt
cp .env.example .env
# Fill in .env values
npm run dev   # Starts both Node.js + FastAPI concurrently
```

**Frontend:**
```bash
cd frontend_ai_code
npm install
# Create .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env.local
npm run dev
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GITHUB_TOKEN=github_pat_...
YOUTUBE_API_KEY=...
ENCRYPTION_KEY=...
EMAIL_SENDER=...
EMAIL_PASSWORD=...
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### Frontend `.env.local`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🌐 API Endpoints

| Module | Base | Key Routes |
|--------|------|-----------|
| Auth | `/api/auth` | POST /login, POST /register, GET /google, GET /me |
| Tasks | `/api/tasks` | CRUD + /today + /carry-forward |
| Competitions | `/api/competitions` | GET (filter by status) + /seed + reminders |
| DSA Sheets | `/api/sheets` | GET (filter by tag) + /seed |
| Groups | `/api/groups` | CRUD + /messages (Socket.IO) |
| YouTube | `/api/integrations/youtube` | /connect, /callback, /sync, /courses |
| AI | `/api/ai` | POST /chat, /break-task, /resume/analyze |
| Career | `/api/resume` | POST /upload, /analyze, /cover-letter |
| Leaderboard | `/api/leaderboard` | GET (top 50) |
| Streaks | `/api/streaks` | GET, POST (update) |
| Notifications | `/api/notifications` | GET, PATCH (mark read) |

---

## 🔄 Real-Time Architecture

```
Client A sends message
    ↓
POST /api/groups/:id/messages  (REST — persists to MongoDB)
    ↓
Server broadcasts via Socket.IO io.to(groupRoom).emit('receive-message')
    ↓
All clients receive exactly one copy (including sender)
```

This eliminates duplicate messages from REST + socket race conditions.

---

## 📦 Deployment

| Layer | Platform | Config |
|-------|----------|--------|
| Frontend | Vercel | Root: `frontend_ai_code`, Framework: Vite |
| Backend | Render | Root: `backend_ai_code`, Start: `bash start.sh` |
| Database | MongoDB Atlas | Free M0 cluster, network access: `0.0.0.0/0` |

The `start.sh` script starts FastAPI (port 8000) in background, then Node.js (port 5000) in foreground, giving Render a single process to monitor.

---

## 👤 Author

**Aditya Chauhan**  
[GitHub](https://github.com/DAKUsir) • [Email](mailto:chauhan.aditya.tech@gmail.com)

---

## 📄 License

MIT License — free to use, fork, and build upon.
