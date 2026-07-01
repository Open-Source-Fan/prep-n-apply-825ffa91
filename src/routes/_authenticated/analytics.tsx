import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: Analytics,
});

type Report = { competencies?: { name: string; score: number }[] };

function Analytics() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["analytics-sessions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  if (isLoading) return <AppLayout><div className="grid h-96 place-items-center"><Loader2 className="size-6 animate-spin" /></div></AppLayout>;

  const completed = (sessions ?? []).filter((s) => s.overall_score != null);

  if (completed.length === 0)
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-4 text-3xl font-bold">Analytics</h1>
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Complete a mock interview to unlock your analytics.
          </div>
        </div>
      </AppLayout>
    );

  const trend = completed.map((s, i) => ({ name: `#${i + 1}`, score: Math.round(Number(s.overall_score)) }));

  // aggregate competencies
  const agg: Record<string, { total: number; count: number }> = {};
  for (const s of completed) {
    const comps = (s.report as unknown as Report)?.competencies ?? [];
    for (const c of comps) {
      agg[c.name] = agg[c.name] || { total: 0, count: 0 };
      agg[c.name].total += c.score;
      agg[c.name].count += 1;
    }
  }
  const radar = Object.entries(agg).map(([name, v]) => ({ name, score: Math.round(v.total / v.count) }));

  const byType: Record<string, { total: number; count: number }> = {};
  for (const s of completed) {
    byType[s.interview_type] = byType[s.interview_type] || { total: 0, count: 0 };
    byType[s.interview_type].total += Number(s.overall_score);
    byType[s.interview_type].count += 1;
  }
  const catData = Object.entries(byType).map(([name, v]) => ({ name, score: Math.round(v.total / v.count) }));

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 font-semibold">Score trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 font-semibold">Skill radar (all interviews)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Radar dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 font-semibold">Average by interview type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={catData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Bar dataKey="score" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 font-semibold">Interview history</h3>
          <div className="space-y-2">
            {completed.slice().reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0">
                <span>{s.job_title} <span className="text-muted-foreground">· {s.interview_type}</span></span>
                <Badge variant="outline">{Math.round(Number(s.overall_score))}%</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
