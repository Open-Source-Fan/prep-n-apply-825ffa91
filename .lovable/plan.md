# AI Interview Readiness Analyzer — Build Plan

You gave me two lists: the original 9-page app spec and 19 ambitious "next-level" features. Building all 19 as fully working simultaneously (3D avatars with lip-sync, live WebRTC peer matching, real-time ML pose/voice analysis, email + Google Calendar integration, leaderboards) is a multi-week effort and some parts depend on ML models that can't run reliably in-browser. Instead I'll build in phases so you get a **real, usable product early** and we add the flashy features on a working base.

## What powers it (Lovable Cloud + Lovable AI)
- **Database + Auth**: user accounts, interview sessions, scores, roadmaps, resumes, study plans, versions.
- **Lovable AI (Gemini)**: JD analysis, question generation, answer evaluation, follow-ups, reports, resume matching, roadmap, SWOT, AI Coach chat, study plans. This is real AI, not mocked.
- **Browser APIs**: SpeechRecognition (voice answers), MediaDevices (camera preview), Web Audio (waveform + filler-word / pace analysis).

## Phase 1 — Foundation + core interview loop (this phase)
Design system + auth + these fully working:
1. **Auth** (email/password) + real logged-in user (replaces hardcoded "Ananya Sharma").
2. **Dashboard**: live stats (interviews, avg/best score, streak), quick actions, recent sessions.
3. **Interview Setup wizard**: job title, company, JD → AI extracts skills/expectations; pick style, type, difficulty.
4. **Interview Room**: AI-generated questions from JD, typed **and** voice answers, camera preview toggle, real-time AI scoring across dimensions, dynamic follow-ups, timer, progress map.
5. **Interview Report**: readiness level, radar + bar charts, strengths/weaknesses, per-question AI feedback.

## Phase 2 — Prep & insight tools
6. Resume Analyzer (upload/paste JD → AI match score, gaps, recommendations)
7. Analytics (score trend, skill radar, category distribution, history)
8. AI Coach (context-aware chat, suggestion chips, markdown, history)
9. Career Roadmap (phased week-by-week plan, progress tracking)
10. **SWOT Analysis** (data-driven strengths/weaknesses/opportunities/threats + readiness verdict)
11. Real-time **Voice Analysis** (filler words, WPM pace, waveform) during answers
12. Personalized **Study Plan** engine + topic mastery tracking

## Phase 3 — Advanced / gamified
13. Prompt **Versioning** (snapshot every AI roadmap/SWOT/report, history + diff)
14. Micro-Practice "Question of the Day" + streaks
15. Phrase Library & STAR templates
16. Company-Specific prep modules (Google/Amazon/Meta/McKinsey)
17. EQ Coach + power-word highlighter
18. Smart Resume Builder + ATS score
19. Leaderboard & achievements/badges
20. Career Path node-graph visualizer
21. Retro Terminal skin (Nostalgia mode)
22. Multilingual practice

## Phase 4 — Hard/experimental (feasibility-gated)
- **3D Immersive Room** (Three.js environment + avatar) — I'll build the 3D scene; true real-time lip-sync + TTS is a stretch and may be a simplified animated avatar.
- **Body Language Analyzer** (camera pose estimation via MediaPipe) — real but browser-perf dependent.
- **Interview Recording & Playback** (MediaRecorder timeline + annotations).
- **Peer WebRTC mock interviews** — needs signaling; largest lift, done last.
- Email reminders / Google Calendar — needs integrations, scheduled last.

## Technical notes
- TanStack Start + Lovable Cloud (Supabase under the hood). AI via server routes/functions with `LOVABLE_API_KEY`.
- Tables: profiles, interview_sessions, questions/answers, resumes, roadmaps, study_plans, coach_conversations, ai_versions, achievements. RLS scoped to `auth.uid()`.
- Recharts for 2D charts; Three.js only where 3D is essential.

## What I'd do right now
Enable Lovable Cloud, build the design system, auth, and the full **Phase 1** core loop end-to-end with real AI — a product you can actually use today — then continue down the phases.

Want me to proceed with Phase 1 as described, or reprioritize which features come first?