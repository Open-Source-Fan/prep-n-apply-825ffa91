import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { evaluateAnswer, generateReport } from "@/lib/ai.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { CameraPreview } from "@/components/interview/CameraPreview";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Mic, MicOff, SkipForward, Send, Lightbulb, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/interview/$id")({
  component: Room,
});

type Q = { id: string; text: string; category: string; difficulty: string };
type Eval = import("@/lib/ai.functions").HybridEval;

function Room() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [results, setResults] = useState<Record<string, { answer: string; eval: Eval }>>({});
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const speech = useSpeechRecognition();

  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const { data } = await supabase.from("interview_sessions").select("*").eq("id", id).single();
      return data;
    },
  });

  const questions = useMemo<Q[]>(() => (session?.questions as unknown as Q[]) ?? [], [session]);
  const current = questions[index];

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [index]);

  useEffect(() => {
    if (speech.transcript) setAnswer(speech.transcript);
  }, [speech.transcript]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const submit = async () => {
    if (!current) return;
    if (!answer.trim()) return toast.error("Type or speak an answer first");
    speech.stop();
    setEvaluating(true);
    try {
      const ev = await evaluateAnswer({
        data: {
          question: followUp ?? current.text,
          answer,
          jobTitle: session!.job_title,
          difficulty: session!.difficulty,
          category: current.category,
        },
      });
      setResults((r) => ({ ...r, [current.id + (followUp ? "-f" : "")]: { answer, eval: ev } }));
      if (ev.followUp && !followUp) {
        setFollowUp(ev.followUp);
        setAnswer("");
        speech.reset();
        toast.info("Follow-up question — probe deeper!");
      } else {
        next();
      }
    } catch (e) {
      console.error(e);
      toast.error("Evaluation failed — moving on");
      next();
    } finally {
      setEvaluating(false);
    }
  };

  const next = () => {
    setFollowUp(null);
    setAnswer("");
    speech.reset();
    setSeconds(0);
    if (index + 1 >= questions.length) finish();
    else setIndex((i) => i + 1);
  };

  const skip = () => {
    speech.stop();
    next();
  };

  const finish = async () => {
    setFinishing(true);
    try {
      const qa = questions.map((q) => {
        const res = results[q.id];
        return { question: q.text, answer: res?.answer ?? "(skipped)", overall: res?.eval.composite };
      });

      // Deterministic per-question breakdown built from the hybrid evals we already have.
      const avg = (nums: number[]) => (nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0);
      const evals = questions.map((q) => results[q.id]?.eval).filter(Boolean) as Eval[];
      const composites = evals.map((e) => e.composite);
      const overall = avg(composites);

      const perQuestion = questions.map((q) => {
        const e = results[q.id]?.eval;
        return {
          question: q.text,
          category: q.category,
          score: e?.composite ?? 0,
          llmScore: e?.llm.overall ?? 0,
          ruleScore: e?.rule.overall ?? 0,
          contentRelevance: e?.llm.contentRelevance.score ?? 0,
          starScore: e?.rule.starScore ?? 0,
          keywordCoverage: e?.rule.keywordCoverage ?? 0,
          conceptScore: e?.rule.conceptScore ?? 0,
          detectedStar: e?.rule.detectedStar ?? null,
          feedback: e?.feedback ?? (e ? "" : "Skipped."),
        };
      });

      const competencies = [
        { name: "Technical Depth", score: avg(evals.map((e) => e.llm.technicalDepth.score)) },
        { name: "Communication", score: avg(evals.map((e) => e.llm.reasoningQuality.score)) },
        { name: "Problem Solving", score: avg(evals.map((e) => e.llm.problemSolving.score)) },
        { name: "Content Relevance", score: avg(evals.map((e) => e.llm.contentRelevance.score)) },
        { name: "Practical Experience", score: avg(evals.map((e) => e.llm.answerMaturity.score)) },
      ];

      const scoring = {
        llmAverage: avg(evals.map((e) => e.llm.overall)),
        ruleAverage: avg(evals.map((e) => e.rule.overall)),
        weights: { llm: 0.6, rule: 0.4 },
      };

      // LLM narrative layer (summary / strengths / weaknesses / readiness) — deterministic scores override its numbers.
      let narrative: {
        readinessLevel: string;
        summary: string;
        strengths: string[];
        weaknesses: string[];
      };
      try {
        const r = await generateReport({ data: { jobTitle: session!.job_title, difficulty: session!.difficulty, qa } });
        narrative = {
          readinessLevel: r.readinessLevel,
          summary: r.summary,
          strengths: r.strengths ?? [],
          weaknesses: r.weaknesses ?? [],
        };
      } catch (e) {
        console.warn("report narrative failed", e);
        narrative = {
          readinessLevel: overall >= 80 ? "Ready" : overall >= 60 ? "Almost Ready" : "Needs Work",
          summary: "Report generated from your hybrid answer scores.",
          strengths: [],
          weaknesses: [],
        };
      }

      const report = {
        overall,
        readinessLevel: narrative.readinessLevel,
        summary: narrative.summary,
        competencies,
        strengths: narrative.strengths,
        weaknesses: narrative.weaknesses,
        perQuestion,
        scoring,
      };

      await supabase
        .from("interview_sessions")
        .update({
          status: "completed",
          overall_score: report.overall,
          readiness_level: report.readinessLevel,
          report: report as never,
          completed_at: new Date().toISOString(),
        })
        .eq("id", id);
      // version snapshot
      const { data: userRes } = await supabase.auth.getUser();
      if (userRes.user) {
        await supabase.from("ai_versions").insert({
          user_id: userRes.user.id,
          entity_type: "interview_report",
          entity_id: id,
          label: session!.job_title,
          snapshot: report as never,
        });
      }
      navigate({ to: "/report/$id", params: { id } });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't finish. Try again.");
      setFinishing(false);
    }
  };

  if (isLoading) return <AppLayout><div className="grid h-96 place-items-center"><Loader2 className="size-6 animate-spin" /></div></AppLayout>;
  if (!session || !current)
    return <AppLayout><div className="text-center text-muted-foreground">Interview not found.</div></AppLayout>;

  if (finishing)
    return (
      <AppLayout>
        <div className="grid h-96 place-items-center text-center">
          <div>
            <Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" />
            <p className="font-medium">Analyzing your performance…</p>
            <p className="text-sm text-muted-foreground">Building your readiness report</p>
          </div>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{session.job_title}</h1>
              <p className="text-sm text-muted-foreground">
                {session.interview_type} · {session.interviewer_style} · {session.difficulty}
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="size-3.5" /> {mmss}
            </Badge>
          </div>

          <Progress value={((index + 1) / questions.length) * 100} />
          <p className="text-sm text-muted-foreground">Question {index + 1} of {questions.length}</p>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <Badge className="mb-3" variant="secondary">{current.category}</Badge>
            <p className="text-lg font-medium leading-relaxed break-words [overflow-wrap:anywhere]">{followUp ?? current.text}</p>
            {followUp && <Badge className="mt-3 bg-warning/20 text-warning">Follow-up probe</Badge>}
          </div>

          {speech.listening && (
            <div className="flex flex-wrap gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-primary"><span className="size-2 animate-pulse rounded-full bg-primary" /> Listening</span>
              <span>Fillers: <b className={speech.fillerCount > 5 ? "text-destructive" : ""}>{speech.fillerCount}</b></span>
              <span>Pace: <b className={speech.wpm > 180 || (speech.wpm > 0 && speech.wpm < 110) ? "text-warning" : ""}>{speech.wpm} wpm</b></span>
            </div>
          )}

          <Textarea
            rows={7}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer, or use the mic to speak…"
          />

          <div className="flex flex-wrap gap-2">
            {speech.supported && (
              <Button variant={speech.listening ? "secondary" : "outline"} onClick={speech.listening ? speech.stop : speech.start}>
                {speech.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                {speech.listening ? "Stop" : "Speak"}
              </Button>
            )}
            <Button variant="ghost" onClick={skip} disabled={evaluating}>
              <SkipForward className="size-4" /> Skip
            </Button>
            <Button className="flex-1 gradient-primary text-primary-foreground" onClick={submit} disabled={evaluating}>
              {evaluating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {evaluating ? "Evaluating…" : index + 1 >= questions.length && !followUp ? "Submit & Finish" : "Submit answer"}
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <CameraPreview compact />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="mb-3 text-sm font-semibold">Progress map</h3>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const res = results[q.id];
                return (
                  <div key={q.id} className="flex items-center gap-2 text-sm">
                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs", i === index ? "gradient-primary text-primary-foreground" : res ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground")}>
                      {res ? <CheckCircle2 className="size-3.5" /> : i + 1}
                    </span>
                    <span className="truncate text-muted-foreground">{q.category}</span>
                    {res && <span className="ml-auto font-semibold">{res.eval.overall}%</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Lightbulb className="size-4 text-warning" /> Quick tips</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Use the STAR method for behavioral answers.</li>
              <li>• Think out loud during technical problems.</li>
              <li>• Keep answers to 1–3 minutes.</li>
              <li>• Minimize filler words — pause instead.</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
