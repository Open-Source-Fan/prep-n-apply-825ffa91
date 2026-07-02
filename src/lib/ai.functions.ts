import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, CHAT_MODEL } from "./ai-gateway.server";

// Shared validation limits to prevent oversized/malicious payloads reaching the LLM
const shortStr = z.string().trim().max(300);
const midStr = z.string().trim().max(2000);
const bigStr = z.string().trim().max(20000);

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(CHAT_MODEL);
}

function extractJson<T>(text: string): T {
  let t = text.trim();
  // strip code fences
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const first = t.search(/[[{]/);
  if (first > 0) t = t.slice(first);
  // find matching last brace/bracket
  const lastObj = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (lastObj >= 0) t = t.slice(0, lastObj + 1);
  return JSON.parse(t) as T;
}

async function runJson<T>(system: string, prompt: string): Promise<T> {
  const { text } = await generateText({
    model: getModel(),
    system: system + "\nRespond ONLY with valid JSON. No markdown, no commentary.",
    prompt,
  });
  return extractJson<T>(text);
}

// 1. Analyze job description
export const analyzeJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobTitle: string; company?: string; jobDescription?: string }) =>
    z.object({ jobTitle: shortStr.min(1), company: shortStr.optional(), jobDescription: bigStr.optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    return runJson<{ summary: string; requiredSkills: string[]; roleExpectations: string[]; focusAreas: string[] }>(
      "You are an expert technical recruiter analyzing a job.",
      `Analyze this role and return JSON with keys: summary (string), requiredSkills (string[] up to 10), roleExpectations (string[] up to 6), focusAreas (string[] up to 5).
Job Title: ${data.jobTitle}
Company: ${data.company || "N/A"}
Job Description: ${data.jobDescription || "Not provided — infer typical requirements for this title."}`,
    );
  });

// 2. Generate interview questions
export const generateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      jobTitle: string;
      company?: string;
      interviewerStyle: string;
      interviewType: string;
      difficulty: string;
      jdAnalysis?: unknown;
      count?: number;
    }) =>
      z
        .object({
          jobTitle: shortStr.min(1),
          company: shortStr.optional(),
          interviewerStyle: shortStr.min(1),
          interviewType: shortStr.min(1),
          difficulty: shortStr.min(1),
          jdAnalysis: z.unknown().optional(),
          count: z.number().int().min(1).max(20).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const count = data.count ?? 6;
    return runJson<{ questions: { id: string; text: string; category: string; difficulty: string }[] }>(
      `You are a ${data.interviewerStyle}-style interviewer conducting a ${data.interviewType} interview.`,
      `Generate exactly ${count} interview questions for a ${data.difficulty}-level "${data.jobTitle}" candidate at ${data.company || "a top company"}.
Interview type: ${data.interviewType}. Style: ${data.interviewerStyle}.
JD analysis: ${JSON.stringify(data.jdAnalysis || {})}
Return JSON: { "questions": [ { "id": "q1", "text": "...", "category": "Technical|Behavioral|System Design|Problem Solving", "difficulty": "${data.difficulty}" } ] }`,
    );
  });

// 3. Evaluate a single answer + optional follow-up
export const evaluateAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { question: string; answer: string; jobTitle: string; difficulty: string; category?: string }) =>
      z
        .object({
          question: midStr.min(1),
          answer: bigStr,
          jobTitle: shortStr.min(1),
          difficulty: shortStr.min(1),
          category: shortStr.optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    return runJson<{
      scores: { technicalDepth: number; communication: number; problemSolving: number; practicalExperience: number };
      overall: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      followUp: string | null;
    }>(
      "You are a rigorous, fair interview evaluator. Scores are 0-100.",
      `Question (${data.category || "general"}, ${data.difficulty} level): ${data.question}
Candidate answer: ${data.answer || "(no answer given)"}
Role: ${data.jobTitle}
Return JSON: { "scores": { "technicalDepth": n, "communication": n, "problemSolving": n, "practicalExperience": n }, "overall": n, "feedback": "2-3 sentence honest feedback", "strengths": ["..."], "improvements": ["..."], "followUp": "a probing follow-up question targeting a gap, or null if the answer was strong" }`,
    );
  });

// 4. Generate full interview report
export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { jobTitle: string; difficulty: string; qa: { question: string; answer: string; overall?: number }[] }) =>
    z
      .object({
        jobTitle: shortStr.min(1),
        difficulty: shortStr.min(1),
        qa: z
          .array(z.object({ question: midStr, answer: bigStr, overall: z.number().optional() }))
          .max(50),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return runJson<{
      overall: number;
      readinessLevel: string;
      summary: string;
      competencies: { name: string; score: number }[];
      strengths: string[];
      weaknesses: string[];
      perQuestion: { question: string; score: number; feedback: string }[];
    }>(
      "You are an interview coach writing a final readiness report.",
      `Role: ${data.jobTitle} (${data.difficulty}).
Transcript: ${JSON.stringify(data.qa)}
Return JSON: { "overall": 0-100, "readinessLevel": "Strong Candidate|Ready|Almost Ready|Needs Work|Not Ready", "summary": "...", "competencies": [ {"name":"Technical Depth","score":n}, {"name":"Communication","score":n}, {"name":"Problem Solving","score":n}, {"name":"Practical Experience","score":n}, {"name":"Role Fit","score":n} ], "strengths": ["..."], "weaknesses": ["..."], "perQuestion": [ {"question":"...","score":n,"feedback":"..."} ] }`,
    );
  });

// 5. Resume analyzer
export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { resume: string; jobDescription: string }) =>
    z.object({ resume: bigStr.min(1), jobDescription: bigStr.min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    return runJson<{
      matchScore: number;
      summary: string;
      skillGaps: string[];
      experienceGaps: string[];
      strengths: string[];
      recommendations: string[];
      missingKeywords: string[];
    }>(
      "You are an ATS and resume-matching expert.",
      `Match this resume against the job description.
RESUME:\n${data.resume}\n\nJOB DESCRIPTION:\n${data.jobDescription}
Return JSON: { "matchScore": 0-100, "summary": "...", "strengths": ["..."], "skillGaps": ["..."], "experienceGaps": ["..."], "missingKeywords": ["..."], "recommendations": ["specific improvements"] }`,
    );
  });

// 6. Career roadmap
export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetRole: string; currentPosition?: string; targetCompany?: string; timeline?: string; context?: string }) =>
    z
      .object({
        targetRole: shortStr.min(1),
        currentPosition: shortStr.optional(),
        targetCompany: shortStr.optional(),
        timeline: shortStr.optional(),
        context: bigStr.optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return runJson<{
      summary: string;
      phases: { title: string; weeks: string; focus: string; tasks: string[]; resources: string[] }[];
    }>(
      "You are a career strategist building a phased, week-by-week roadmap.",
      `Current: ${data.currentPosition || "unspecified"}. Target: ${data.targetRole} at ${data.targetCompany || "target company"}. Timeline: ${data.timeline || "12 weeks"}.
Context: ${data.context || ""}
Return JSON: { "summary": "...", "phases": [ {"title":"Phase 1: ...","weeks":"Weeks 1-3","focus":"...","tasks":["..."],"resources":["..."]} ] }`,
    );
  });

// 7. SWOT analysis
export const generateSWOT = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { context: string }) => z.object({ context: bigStr.min(1) }).parse(d))
  .handler(async ({ data }) => {
    return runJson<{
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
      readinessPercent: number;
      verdict: string;
    }>(
      "You are a brutally honest but constructive career analyst producing a SWOT from real user data.",
      `User data (interviews, scores, resume, target roles):\n${data.context}
Return JSON: { "strengths": ["data-backed..."], "weaknesses": ["real gaps..."], "opportunities": ["AI-predicted wins..."], "threats": ["honest risk flags..."], "readinessPercent": 0-100, "verdict": "1-2 sentence honest verdict + what to do next" }`,
    );
  });

// 8. Study plan
export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { weakAreas: string; role: string }) =>
    z.object({ weakAreas: bigStr.min(1), role: shortStr.min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    return runJson<{
      summary: string;
      topics: { name: string; status: string }[];
      days: { day: number; topic: string; tasks: string[]; resources: string[] }[];
    }>(
      "You are a study-plan engine creating a hyper-personalized day-by-day plan.",
      `Role: ${data.role}. Weak areas identified: ${data.weakAreas}.
Return JSON: { "summary": "...", "topics": [ {"name":"...","status":"needs review"} ], "days": [ {"day":1,"topic":"...","tasks":["..."],"resources":["YouTube: ...","LeetCode: ..."]} ] } with 7-14 days.`,
    );
  });

// 9. AI Coach chat (returns markdown text)
export const coachChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { messages: { role: "user" | "assistant"; content: string }[]; context?: string }) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(10000) }))
          .min(1)
          .max(50),
        context: bigStr.optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system: `You are an encouraging, sharp AI career & interview coach. Use markdown. Be specific and actionable.
User context: ${data.context || "No history yet."}`,
      messages: data.messages,
    });
    return { text };
  });
