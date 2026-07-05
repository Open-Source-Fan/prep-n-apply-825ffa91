import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/report/$id")({
  component: Report,
});

type PerQ = {
  question: string;
  category?: string;
  score: number;
  llmScore?: number;
  ruleScore?: number;
  contentRelevance?: number;
  starScore?: number;
  keywordCoverage?: number;
  conceptScore?: number;
  detectedStar?: { situation: boolean; task: boolean; action: boolean; result: boolean; quantified: boolean } | null;
  feedback: string;
};
type Report = {
  overall: number;
  readinessLevel: string;
  summary: string;
  competencies: { name: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  perQuestion: PerQ[];
  scoring?: { llmAverage: number; ruleAverage: number; weights: { llm: number; rule: number } };
};

function readinessColor(level: string) {
  if (level === "Strong Candidate") return "bg-success/20 text-success border-success/30";
  if (level === "Ready") return "bg-primary/20 text-primary border-primary/30";
  if (level === "Almost Ready") return "bg-warning/20 text-warning border-warning/30";
  return "bg-destructive/20 text-destructive border-destructive/30";
}

function barColor(score: number) {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  return "var(--destructive)";
}

function Report() {
  const { id } = Route.useParams();
  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const { data } = await supabase.from("interview_sessions").select("*").eq("id", id).single();
      return data;
    },
  });

  if (isLoading) return <AppLayout><div className="grid h-96 place-items-center"><Loader2 className="size-6 animate-spin" /></div></AppLayout>;
  const report = session?.report as unknown as Report | null;
  if (!session || !report)
    return <AppLayout><div className="text-center text-muted-foreground">No report available.</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{session.job_title} — Report</h1>
            <p className="text-muted-foreground">{session.company || "—"} · {session.interview_type} · {session.difficulty}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/coach"><Button variant="outline"><MessageSquare className="size-4" /> Ask coach</Button></Link>
            <Link to="/setup"><Button className="gradient-primary text-primary-foreground"><RotateCcw className="size-4" /> New interview</Button></Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
            <div className="text-5xl font-bold text-gradient">{Math.round(report.overall)}%</div>
            <div className="mt-1 text-sm text-muted-foreground">Overall score</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card md:col-span-2">
            <Badge variant="outline" className={`mb-2 text-base ${readinessColor(report.readinessLevel)}`}>{report.readinessLevel}</Badge>
            <p className="text-sm text-muted-foreground">{report.summary}</p>
          </div>
        </div>

        {report.scoring && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-1 font-semibold">Hybrid scoring breakdown</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Your final score blends two independent layers — subjective LLM quality and deterministic rule-based signals.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <div className="text-3xl font-bold text-primary">{report.scoring.llmAverage}%</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  LLM quality · weight {Math.round(report.scoring.weights.llm * 100)}%
                </div>
              </div>
              <div className="rounded-xl border border-chart-2/40 bg-chart-2/5 p-4 text-center">
                <div className="text-3xl font-bold" style={{ color: "var(--chart-2)" }}>{report.scoring.ruleAverage}%</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Rule-based · weight {Math.round(report.scoring.weights.rule * 100)}%
                </div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4 text-center">
                <div className="text-3xl font-bold text-gradient">{Math.round(report.overall)}%</div>
                <div className="mt-1 text-xs text-muted-foreground">Composite (blended)</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 font-semibold">Competency breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={report.competencies}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 font-semibold">Per-question performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={report.perQuestion.map((q, i) => ({ name: `Q${i + 1}`, score: q.score }))}>
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {report.perQuestion.map((q, i) => (
                    <Cell key={i} fill={barColor(q.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-success"><ThumbsUp className="size-4" /> Strengths</h3>
            <ul className="space-y-2 text-sm">
              {(report.strengths ?? []).map((s, i) => <li key={i}>• {s}</li>)}
              {(!report.strengths || report.strengths.length === 0) && <li className="text-muted-foreground">No standout strengths detected.</li>}
            </ul>
          </div>
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-destructive"><ThumbsDown className="size-4" /> Weaknesses</h3>
            <ul className="space-y-2 text-sm">
              {(report.weaknesses ?? []).map((s, i) => <li key={i}>• {s}</li>)}
              {(!report.weaknesses || report.weaknesses.length === 0) && <li className="text-muted-foreground">No major weaknesses detected.</li>}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 font-semibold">Question-by-question breakdown</h3>
          <Accordion type="single" collapsible className="w-full">
            {report.perQuestion.map((q, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left">
                  <span className="flex w-full items-center justify-between gap-3 pr-3">
                    <span className="truncate">Q{i + 1}: {q.question}</span>
                    <span className="shrink-0 font-bold" style={{ color: barColor(q.score) }}>{q.score}%</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{q.feedback || "No feedback recorded."}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.llmScore != null && (
                      <span className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs text-primary">
                        LLM quality {q.llmScore}%
                      </span>
                    )}
                    {q.ruleScore != null && (
                      <span className="rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs">
                        Rule-based {q.ruleScore}%
                      </span>
                    )}
                    {q.contentRelevance != null && (
                      <span className="rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs">
                        Content relevance {q.contentRelevance}%
                      </span>
                    )}
                    {/behav/i.test(q.category ?? "") && q.starScore != null && (
                      <span className="rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs">
                        STAR completeness {q.starScore}%
                      </span>
                    )}
                    {q.keywordCoverage != null && (
                      <span className="rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs">
                        Keyword coverage {q.keywordCoverage}%
                      </span>
                    )}
                  </div>
                  {/behav/i.test(q.category ?? "") && q.detectedStar && (
                    <div className="flex flex-wrap gap-2">
                      {([
                        ["Situation", q.detectedStar.situation],
                        ["Task", q.detectedStar.task],
                        ["Action", q.detectedStar.action],
                        ["Result", q.detectedStar.result],
                        ["Quantified impact", q.detectedStar.quantified],
                      ] as const).map(([label, present]) => (
                        <span
                          key={label}
                          className={`rounded-md px-2 py-1 text-xs ${present ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                        >
                          {present ? "✓" : "✗"} {label}
                        </span>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
}
