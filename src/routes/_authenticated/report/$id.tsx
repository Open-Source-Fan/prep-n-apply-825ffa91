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

type Report = {
  overall: number;
  readinessLevel: string;
  summary: string;
  competencies: { name: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  perQuestion: { question: string; score: number; feedback: string }[];
};

function readinessColor(level: string) {
  if (level === "Strong Candidate") return "bg-success/20 text-success border-success/30";
  if (level === "Ready") return "bg-primary/20 text-primary border-primary/30";
  if (level === "Almost Ready") return "bg-warning/20 text-warning border-warning/30";
  return "bg-destructive/20 text-destructive border-destructive/30";
}

function barColor(score: number) {
  if (score >= 75) return "hsl(var(--success))";
  if (score >= 50) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
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

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 font-semibold">Competency breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={report.competencies}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 font-semibold">Per-question performance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={report.perQuestion.map((q, i) => ({ name: `Q${i + 1}`, score: q.score }))}>
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
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
                <AccordionContent className="text-sm text-muted-foreground">{q.feedback || "No feedback recorded."}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
}
