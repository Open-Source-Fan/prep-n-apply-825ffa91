<div align="center">
🎯 PrepPilot

AI-Powered Interview Readiness Analyzer

Practice smarter. Get evaluated like a real technical interview. Know exactly where you stand.

Show Image
Show Image
Show Image

Show Image
Show Image
Show Image
Show Image

Live Demo · Features · Architecture · Getting Started

</div>

🖼️ Hero Banner

(Concept brief for a future generated banner — not yet created as an image asset)


A dark, futuristic scene with glassmorphism panels floating in layered depth. Center: an abstract stylized AI brain rendered in thin glowing teal/green line-art. Around it, four translucent floating dashboard cards tilted in 3D perspective — a resume-match score, a live voice-interview waveform, an analytics radar chart, and a career roadmap timeline — each softly lit against a near-black navy background. Minimal, confident typography. No literal text or icons crowding the composition — the feeling is "control room for your career," not "marketing collage."




💡 Problem Statement

Most candidates walk into interviews with no objective signal on how they're actually performing. Interview coaching is expensive, human coaches don't scale, and self-practice with no feedback loop just reinforces bad habits — vague answers, missing structure, no quantified impact.

Existing "practice" tools tend to fall into one of two traps:


No evaluation at all — a static question bank with no feedback on how you actually answered
Shallow evaluation — a single LLM call that returns generic praise ("Great communication skills!") with no measurable signal behind it, and no way to verify the score means anything


Neither gets a candidate closer to knowing, concretely, what to fix before the interview that matters.

✅ Solution

PrepPilot runs a full mock interview against a real job description, then evaluates every answer through two independent scoring systems — an LLM judging subjective quality, and a deterministic rule engine checking for measurable signals (STAR structure, quantified results, relevant terminology). The two are blended into one transparent score, so the feedback is both nuanced and verifiable — not just a confident-sounding number from a single model call.

On top of that, PrepPilot turns a single interview into an ongoing prep system: resume-to-JD matching, a SWOT-style readiness verdict, a phased career roadmap, and day-by-day study plans generated from your actual weak points.


🚀 Product Overview

PrepPilot is a full-stack, AI-native interview preparation platform. Paste a job description, run a mock interview by text or voice, and receive a readiness report that reads less like a quiz result and more like notes from a senior engineer who sat in on your interview — specific, evidence-based, and actionable.

It was built to prove a point as much as to be useful: that evaluation systems built on a single LLM call are fragile, and that combining LLM judgment with deterministic, auditable signals produces feedback people can actually trust.


⭐ Key Features

<details open>
<summary><b>🧠 AI & Evaluation</b></summary>
FeatureDescriptionHybrid Evaluation EngineEvery answer scored by an LLM (subjective quality) and a deterministic rule engine (measurable signals), blended into one transparent composite scoreQuote-Anchored FeedbackFeedback references your actual phrasing, not generic trait labelsSTAR-Structure DetectionBehavioral answers checked for Situation/Task/Action/Result and quantified impact — structurally, not just by prompt-askingContent Relevance ScoringA dedicated dimension measuring how directly an answer addresses the actual question asked

</details>
<details open>
<summary><b>🎤 Interview Experience</b></summary>
FeatureDescriptionJD-Driven Question GenerationPaste any job description; questions are generated specifically for that roleMultiple Interviewer StylesGoogle, FAANG, Startup, Consulting, HRInterview TypesTechnical, Behavioral, System Design, MixedDifficulty LevelsJunior, Mid, Senior, StaffVoice InputAnswer by speaking; transcribed in real timeCamera PracticeLive preview with delivery/body-language prompts

</details>
<details open>
<summary><b>📄 Resume Intelligence</b></summary>
FeatureDescriptionResume-to-JD MatchingPercentage match score against any job descriptionStrengths & Skill GapsExplicit breakdown of what aligns and what's missingMissing Keyword DetectionSurfaces exact terms an ATS or recruiter would look forResume ReuseUpload once, reused across the Resume Analyzer and interview personalization

</details>
<details open>
<summary><b>📊 Analytics & Career Growth</b></summary>
FeatureDescriptionCompetency Radar5-dimension breakdown per interview (Technical Depth, Communication, Problem Solving, Practical Experience, Content Relevance)Score TrendsProgress tracked across all sessions over timeSWOT & ReadinessAggregated, data-driven SWOT verdict across your full interview historyCareer RoadmapPhased, week-by-week plan from current role to target role/companyPersonalized Study PlansDay-by-day plan targeting your actual weak areasAI CoachContext-aware chat referencing your real score history and target role

</details>
<details open>
<summary><b>🔐 Infrastructure & Security</b></summary>
FeatureDescriptionServer-Side AI CallsAll LLM calls routed through Supabase Edge Functions — no API key ever reaches the clientRow-Level SecurityPostgres RLS policies scope every query to the authenticated userPDF Report ExportFull readiness report exportable as a shareable PDF

</details>

📸 Screenshots

DashboardInterview SetupShow ImageShow ImageAt-a-glance stats, recent sessions, quick actionsInterviewer style, type, and difficulty selection

Readiness ReportResume AnalyzerShow ImageShow ImageHybrid score breakdown, competency radar, per-question feedbackMatch score, strengths, skill gaps, missing keywords

AI CoachAnalyticsShow ImageShow ImageContext-aware chat referencing real performance dataScore trends, skill radar, performance by interview type


🏗️ Architecture

#mermaid-r11b-r9 { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; fill: rgb(229, 229, 229); }
#mermaid-r11b-r9 .edge-animation-slow { stroke-dashoffset: 900; animation: 50s linear 0s infinite normal none running dash; stroke-linecap: round; stroke-dasharray: 9, 5 !important; }
#mermaid-r11b-r9 .edge-animation-fast { stroke-dashoffset: 900; animation: 20s linear 0s infinite normal none running dash; stroke-linecap: round; stroke-dasharray: 9, 5 !important; }
#mermaid-r11b-r9 .error-icon { fill: rgb(204, 120, 92); }
#mermaid-r11b-r9 .error-text { fill: rgb(51, 135, 163); stroke: rgb(51, 135, 163); }
#mermaid-r11b-r9 .edge-thickness-normal { stroke-width: 1px; }
#mermaid-r11b-r9 .edge-thickness-thick { stroke-width: 3.5px; }
#mermaid-r11b-r9 .edge-pattern-solid { stroke-dasharray: 0; }
#mermaid-r11b-r9 .edge-thickness-invisible { stroke-width: 0; fill: none; }
#mermaid-r11b-r9 .edge-pattern-dashed { stroke-dasharray: 3; }
#mermaid-r11b-r9 .edge-pattern-dotted { stroke-dasharray: 2; }
#mermaid-r11b-r9 .marker { fill: rgb(161, 161, 161); stroke: rgb(161, 161, 161); }
#mermaid-r11b-r9 .marker.cross { stroke: rgb(161, 161, 161); }
#mermaid-r11b-r9 svg { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; }
#mermaid-r11b-r9 p { margin: 0px; }
#mermaid-r11b-r9 .label { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: rgb(229, 229, 229); }
#mermaid-r11b-r9 .cluster-label text { fill: rgb(51, 135, 163); }
#mermaid-r11b-r9 .cluster-label span { color: rgb(51, 135, 163); }
#mermaid-r11b-r9 .cluster-label span p { background-color: transparent; }
#mermaid-r11b-r9 .label text, #mermaid-r11b-r9 span { fill: rgb(229, 229, 229); color: rgb(229, 229, 229); }
#mermaid-r11b-r9 .node rect, #mermaid-r11b-r9 .node circle, #mermaid-r11b-r9 .node ellipse, #mermaid-r11b-r9 .node polygon, #mermaid-r11b-r9 .node path { fill: transparent; stroke: rgb(161, 161, 161); stroke-width: 1px; }
#mermaid-r11b-r9 .rough-node .label text, #mermaid-r11b-r9 .node .label text, #mermaid-r11b-r9 .image-shape .label, #mermaid-r11b-r9 .icon-shape .label { text-anchor: middle; }
#mermaid-r11b-r9 .node .katex path { fill: rgb(0, 0, 0); stroke: rgb(0, 0, 0); stroke-width: 1px; }
#mermaid-r11b-r9 .rough-node .label, #mermaid-r11b-r9 .node .label, #mermaid-r11b-r9 .image-shape .label, #mermaid-r11b-r9 .icon-shape .label { text-align: center; }
#mermaid-r11b-r9 .node.clickable { cursor: pointer; }
#mermaid-r11b-r9 .root .anchor path { stroke-width: 0; stroke: rgb(161, 161, 161); fill: rgb(161, 161, 161) !important; }
#mermaid-r11b-r9 .arrowheadPath { fill: rgb(11, 11, 11); }
#mermaid-r11b-r9 .edgePath .path { stroke: rgb(161, 161, 161); stroke-width: 1px; }
#mermaid-r11b-r9 .flowchart-link { stroke: rgb(161, 161, 161); fill: none; }
#mermaid-r11b-r9 .edgeLabel { background-color: transparent; text-align: center; }
#mermaid-r11b-r9 .edgeLabel p { background-color: transparent; }
#mermaid-r11b-r9 .edgeLabel rect { opacity: 0.5; background-color: transparent; fill: transparent; }
#mermaid-r11b-r9 .labelBkg { background-color: rgba(0, 0, 0, 0.5); }
#mermaid-r11b-r9 .cluster rect { fill: rgb(204, 120, 92); stroke: rgb(138, 115, 107); stroke-width: 1px; }
#mermaid-r11b-r9 .cluster text { fill: rgb(51, 135, 163); }
#mermaid-r11b-r9 .cluster span { color: rgb(51, 135, 163); }
#mermaid-r11b-r9 div.mermaidTooltip { position: absolute; text-align: center; max-width: 200px; padding: 2px; font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 12px; background: rgb(204, 120, 92); border: 1px solid rgb(138, 115, 107); border-radius: 2px; pointer-events: none; z-index: 100; }
#mermaid-r11b-r9 .flowchartTitleText { text-anchor: middle; font-size: 18px; fill: rgb(229, 229, 229); }
#mermaid-r11b-r9 rect.text { fill: none; stroke-width: 0; }
#mermaid-r11b-r9 .icon-shape, #mermaid-r11b-r9 .image-shape { background-color: transparent; text-align: center; }
#mermaid-r11b-r9 .icon-shape p, #mermaid-r11b-r9 .image-shape p { background-color: transparent; padding: 2px; }
#mermaid-r11b-r9 .icon-shape .label rect, #mermaid-r11b-r9 .image-shape .label rect { opacity: 0.5; background-color: transparent; fill: transparent; }
#mermaid-r11b-r9 .label-icon { display: inline-block; height: 1em; overflow: visible; vertical-align: -0.125em; }
#mermaid-r11b-r9 .node .label-icon path { fill: currentcolor; stroke: revert; stroke-width: revert; }
#mermaid-r11b-r9 .node .neo-node { stroke: rgb(161, 161, 161); }
#mermaid-r11b-r9 [data-look="neo"].node rect, #mermaid-r11b-r9 [data-look="neo"].cluster rect, #mermaid-r11b-r9 [data-look="neo"].node polygon { stroke: url("#mermaid-r11b-r9-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11b-r9 [data-look="neo"].node path { stroke: url("#mermaid-r11b-r9-gradient"); stroke-width: 1px; }
#mermaid-r11b-r9 [data-look="neo"].node .outer-path { filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11b-r9 [data-look="neo"].node .neo-line path { stroke: rgb(161, 161, 161); filter: none; }
#mermaid-r11b-r9 [data-look="neo"].node circle { stroke: url("#mermaid-r11b-r9-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11b-r9 [data-look="neo"].node circle .state-start { fill: rgb(0, 0, 0); }
#mermaid-r11b-r9 [data-look="neo"].icon-shape .icon { fill: url("#mermaid-r11b-r9-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11b-r9 [data-look="neo"].icon-shape .icon-neo path { stroke: url("#mermaid-r11b-r9-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11b-r9 :root { --mermaid-font-family: "Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }UserReact + TypeScript FrontendSupabase PostgresRow-Level SecuritySupabase Edge FunctionsLovable AI Gateway /GeminiHybrid Evaluation EngineLLM-Based ScorerRule-Based ScorerWeighted Composite ScoreAnalytics DashboardReadiness ReportPDF Export

🔄 AI Pipeline

#mermaid-r11c-r10 { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; fill: rgb(229, 229, 229); }
#mermaid-r11c-r10 .edge-animation-slow { stroke-dashoffset: 900; animation: 50s linear 0s infinite normal none running dash; stroke-linecap: round; stroke-dasharray: 9, 5 !important; }
#mermaid-r11c-r10 .edge-animation-fast { stroke-dashoffset: 900; animation: 20s linear 0s infinite normal none running dash; stroke-linecap: round; stroke-dasharray: 9, 5 !important; }
#mermaid-r11c-r10 .error-icon { fill: rgb(204, 120, 92); }
#mermaid-r11c-r10 .error-text { fill: rgb(51, 135, 163); stroke: rgb(51, 135, 163); }
#mermaid-r11c-r10 .edge-thickness-normal { stroke-width: 1px; }
#mermaid-r11c-r10 .edge-thickness-thick { stroke-width: 3.5px; }
#mermaid-r11c-r10 .edge-pattern-solid { stroke-dasharray: 0; }
#mermaid-r11c-r10 .edge-thickness-invisible { stroke-width: 0; fill: none; }
#mermaid-r11c-r10 .edge-pattern-dashed { stroke-dasharray: 3; }
#mermaid-r11c-r10 .edge-pattern-dotted { stroke-dasharray: 2; }
#mermaid-r11c-r10 .marker { fill: rgb(161, 161, 161); stroke: rgb(161, 161, 161); }
#mermaid-r11c-r10 .marker.cross { stroke: rgb(161, 161, 161); }
#mermaid-r11c-r10 svg { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; }
#mermaid-r11c-r10 p { margin: 0px; }
#mermaid-r11c-r10 .label { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: rgb(229, 229, 229); }
#mermaid-r11c-r10 .cluster-label text { fill: rgb(51, 135, 163); }
#mermaid-r11c-r10 .cluster-label span { color: rgb(51, 135, 163); }
#mermaid-r11c-r10 .cluster-label span p { background-color: transparent; }
#mermaid-r11c-r10 .label text, #mermaid-r11c-r10 span { fill: rgb(229, 229, 229); color: rgb(229, 229, 229); }
#mermaid-r11c-r10 .node rect, #mermaid-r11c-r10 .node circle, #mermaid-r11c-r10 .node ellipse, #mermaid-r11c-r10 .node polygon, #mermaid-r11c-r10 .node path { fill: transparent; stroke: rgb(161, 161, 161); stroke-width: 1px; }
#mermaid-r11c-r10 .rough-node .label text, #mermaid-r11c-r10 .node .label text, #mermaid-r11c-r10 .image-shape .label, #mermaid-r11c-r10 .icon-shape .label { text-anchor: middle; }
#mermaid-r11c-r10 .node .katex path { fill: rgb(0, 0, 0); stroke: rgb(0, 0, 0); stroke-width: 1px; }
#mermaid-r11c-r10 .rough-node .label, #mermaid-r11c-r10 .node .label, #mermaid-r11c-r10 .image-shape .label, #mermaid-r11c-r10 .icon-shape .label { text-align: center; }
#mermaid-r11c-r10 .node.clickable { cursor: pointer; }
#mermaid-r11c-r10 .root .anchor path { stroke-width: 0; stroke: rgb(161, 161, 161); fill: rgb(161, 161, 161) !important; }
#mermaid-r11c-r10 .arrowheadPath { fill: rgb(11, 11, 11); }
#mermaid-r11c-r10 .edgePath .path { stroke: rgb(161, 161, 161); stroke-width: 1px; }
#mermaid-r11c-r10 .flowchart-link { stroke: rgb(161, 161, 161); fill: none; }
#mermaid-r11c-r10 .edgeLabel { background-color: transparent; text-align: center; }
#mermaid-r11c-r10 .edgeLabel p { background-color: transparent; }
#mermaid-r11c-r10 .edgeLabel rect { opacity: 0.5; background-color: transparent; fill: transparent; }
#mermaid-r11c-r10 .labelBkg { background-color: rgba(0, 0, 0, 0.5); }
#mermaid-r11c-r10 .cluster rect { fill: rgb(204, 120, 92); stroke: rgb(138, 115, 107); stroke-width: 1px; }
#mermaid-r11c-r10 .cluster text { fill: rgb(51, 135, 163); }
#mermaid-r11c-r10 .cluster span { color: rgb(51, 135, 163); }
#mermaid-r11c-r10 div.mermaidTooltip { position: absolute; text-align: center; max-width: 200px; padding: 2px; font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 12px; background: rgb(204, 120, 92); border: 1px solid rgb(138, 115, 107); border-radius: 2px; pointer-events: none; z-index: 100; }
#mermaid-r11c-r10 .flowchartTitleText { text-anchor: middle; font-size: 18px; fill: rgb(229, 229, 229); }
#mermaid-r11c-r10 rect.text { fill: none; stroke-width: 0; }
#mermaid-r11c-r10 .icon-shape, #mermaid-r11c-r10 .image-shape { background-color: transparent; text-align: center; }
#mermaid-r11c-r10 .icon-shape p, #mermaid-r11c-r10 .image-shape p { background-color: transparent; padding: 2px; }
#mermaid-r11c-r10 .icon-shape .label rect, #mermaid-r11c-r10 .image-shape .label rect { opacity: 0.5; background-color: transparent; fill: transparent; }
#mermaid-r11c-r10 .label-icon { display: inline-block; height: 1em; overflow: visible; vertical-align: -0.125em; }
#mermaid-r11c-r10 .node .label-icon path { fill: currentcolor; stroke: revert; stroke-width: revert; }
#mermaid-r11c-r10 .node .neo-node { stroke: rgb(161, 161, 161); }
#mermaid-r11c-r10 [data-look="neo"].node rect, #mermaid-r11c-r10 [data-look="neo"].cluster rect, #mermaid-r11c-r10 [data-look="neo"].node polygon { stroke: url("#mermaid-r11c-r10-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11c-r10 [data-look="neo"].node path { stroke: url("#mermaid-r11c-r10-gradient"); stroke-width: 1px; }
#mermaid-r11c-r10 [data-look="neo"].node .outer-path { filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11c-r10 [data-look="neo"].node .neo-line path { stroke: rgb(161, 161, 161); filter: none; }
#mermaid-r11c-r10 [data-look="neo"].node circle { stroke: url("#mermaid-r11c-r10-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11c-r10 [data-look="neo"].node circle .state-start { fill: rgb(0, 0, 0); }
#mermaid-r11c-r10 [data-look="neo"].icon-shape .icon { fill: url("#mermaid-r11c-r10-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11c-r10 [data-look="neo"].icon-shape .icon-neo path { stroke: url("#mermaid-r11c-r10-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r11c-r10 :root { --mermaid-font-family: "Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }Job DescriptionQuestion GenerationResume UploadMock InterviewHybrid EvaluationComposite ScoringAnalyticsReadiness ReportAI Career CoachStudy Plan GenerationPDF Export


⚖️ Hybrid Evaluation Engine

The core technical differentiator. Every answer is scored by two independent systems, not one:

LLM-Based ScoringRule-Based ScoringTypeSubjective, model-judgedDeterministic, code-verifiedMeasuresTechnical depth, reasoning quality, problem-solving approach, answer maturity, content relevanceSTAR structure completeness, keyword/skill coverage, answer length/completeness, named concept & trade-off detectionOutput0–100 score + written justification per dimension0–100 score per signal, computed via explicit checksStrengthUnderstands nuance, context, and reasoning qualityCatches what LLMs tend to rubber-stamp — vague answers, missing metrics, templated structureWeight in composite60%40%

Why this matters: a single LLM call tends to reward coherent-sounding answers even when they're light on substance. The rule-based layer acts as a check against that — in practice, this consistently surfaces a gap between the two scores: LLM-judged quality tends to score noticeably higher than rule-based signals when an answer is well-reasoned but light on quantified results, missing keywords, or incomplete STAR structure. This gap is visible per-question in every generated report, not just in aggregate.


📁 Folder Structure

(High-level, representative — see the repository for exact contents)

prep-n-apply/
├── src/
│   ├── components/       # UI components
│   ├── pages/             # Route-level views (Dashboard, Interview, Report, ...)
│   ├── lib/                # Evaluation logic, scoring, utilities
│   └── integrations/     # Supabase client & typed queries
├── supabase/
│   ├── functions/        # Edge Functions (server-side LLM calls)
│   └── migrations/       # Database schema & RLS policies
├── public/                # Static assets
└── package.json


🛠️ Tech Stack

CategoryTechnologyFrontendReact, TypeScript, ViteStylingTailwind CSSBackendSupabase (Postgres, Row-Level Security, PL/pgSQL)ServerlessSupabase Edge FunctionsAI / LLMLovable AI Gateway, Google GeminiHostingLovable (continuous deploy on push)Package ManagerBun


🔒 Security


No client-side API keys — every AI call is routed through a Supabase Edge Function; the LLM provider key lives server-side only and is never shipped to the browser (verified via full codebase audit)
Row-Level Security — every table query is scoped to the authenticated user via Postgres RLS policies, not application-layer trust
Environment separation — secrets are stored in Supabase's secret manager, not in tracked source files
Authentication — user sessions managed through Supabase Auth



📦 Installation

bash# Clone the repository
git clone https://github.com/Open-Source-Fan/prep-n-apply.git
cd prep-n-apply

# Install dependencies
bun install

# Run the development server
bun dev

You'll need your own Supabase project configured with the appropriate environment variables to run this with full functionality locally.

▶️ Usage


Paste a job description in New Interview → Step 1
Configure your interview — interviewer style, type, and difficulty
Answer by text or voice, with optional camera practice
Review your Readiness Report — hybrid score breakdown, per-question feedback, strengths/weaknesses
Check Resume Analyzer to match your resume against the same JD
Generate a Career Roadmap or Study Plan targeting your specific weak areas
Ask the AI Coach for follow-up guidance grounded in your real performance



🗺️ Future Roadmap


Items below are not yet implemented — planned directions only.



AreaPlanned AdditionMLOps ToolingMLflow experiment tracking for prompt/evaluation versioningDeploymentDocker containerization for reproducible local/prod parityAPI LayerDedicated FastAPI service layer for evaluation logicMobileNative or PWA mobile experienceInterview RealismAI avatar-led interview modeAccessibilityMultilingual interview supportBenchmarkingPublic, anonymized benchmark scores by role/levelCommunityPeer/mentor interview marketplace


🎯 Why This Project Stands Out

Most AI interview-practice demos wrap a single prompt around a single LLM call and call the output a "score." PrepPilot treats evaluation as a system with two independently verifiable inputs — an LLM's judgment and a deterministic rule engine — because a score a candidate can't audit isn't a score they should trust. The same discipline extends through the product: resume matching, career roadmaps, and study plans are all generated from the same real performance data, not disconnected features bolted on for a longer feature list.


⚡ Performance Notes


Hybrid scoring adds a second, deterministic evaluation pass without a second round-trip to the user — both layers run as part of the same evaluation call
Interview difficulty and focus areas adapt based on uploaded resume content, not just role selection
Analytics aggregate across all historical sessions, not just the most recent one



🧩 Challenges Solved


Evaluation reliability — moving from a single subjective LLM score to a hybrid, auditable system
Prompt engineering — tuning the LLM evaluator to produce quote-anchored, specific feedback instead of generic praise
Secure architecture — ensuring zero API key exposure by routing all AI calls server-side through Edge Functions
Structured detection — building deterministic STAR-completeness detection without relying purely on LLM self-report
Cross-feature data reuse — connecting resume, interview, and roadmap data into one coherent user profile instead of siloed tools



🎓 Learning Outcomes

Building PrepPilot involved end-to-end ownership of an AI product: prompt design and evaluation methodology, server-side architecture for secure LLM integration, relational schema design with row-level access control, and iterative UX refinement based on real usage. It also involved a full lifecycle decision — validating an approach against a specified stack (Python/Streamlit) before committing to a production rebuild — a sequencing choice made deliberately, not by accident.


🤝 Contributing

This is currently a solo academic/portfolio project. Issues and suggestions are welcome via GitHub Issues.

📄 License

Built for educational purposes as part of an academic MLOps course.

📬 Contact

Questions or feedback — open an issue on this repository.


<div align="center">
Built with ambition, one hybrid score at a time.

</div>
