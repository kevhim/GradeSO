# GradeOS - Phase 1 & 2

## Project Overview
Your academic intelligence layer. An AI-driven academic cockpit that computes real-time SGPA/CGPA, predicts performance, and delivers AI-powered study guidance based on the student's actual transcript.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v3.4 |
| Animations | GSAP 3 + ScrollTrigger |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| AI | Google Gemini 1.5 Flash |

## Local Development
1. Clone the repo
2. Run `npm install`
3. Create `.env` based on `.env.example`
4. Run `npm run dev`

## Team Structure
- **Phase 1 Owner:** Antigravity Device 1 (Scaffold, Landing, Auth, UI Frame)
- **Phase 2 Owner:** Antigravity Device 2 (Dashboards, Calculator, Charts, AI frontend)

## How to add modules
Create a folder in `src/modules/`, export default component, import via lazy loading in `Dashboard.jsx`.
