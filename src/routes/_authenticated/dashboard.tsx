import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, BarChart3, Flame, Trophy, Target, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function statusColor(status: string) {
  if (status === "completed") return "bg-success/20 text-success border-success/30";
  if (status === "in_progress") return "bg-warning/20 text-warning border-warning/30";
  return "bg-secondary text-secondary-foreground";
}

function Dashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("interview_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const completed = (sessions ?? []).filter((s) => s.status === "completed" && s.overall_score != null);
  const total = completed.length;
  const avg = total ? Math.round(completed.reduce((a, s) => a + Number(s.overall_score), 0) / total) : 0;
  const best = total ? Math.round(Math.max(...completed.map((s) => Number(s.overall_score)))) : 0;
  const streak = profile?.streak ?? 0;

  const name = profile?.full_name || user?.email?.split("@")[0] || "there";

  const stats = [
    { label: "Interviews", value: total, icon: Activity },
    { label: "Avg Score", value: `${avg}%`, icon: BarChart3 },
    { label: "Best Score", value: `${best}%`, icon: Trophy },
    { label: "Day Streak", value: streak, icon: Flame },
  ];

  const actions = [
    { to: "/setup", title: "Mock Interview", desc: "Run a full AI interview", icon: Plus, cls: "gradient-primary text-primary-foreground" },
    { to: "/resume", title: "Resume Analyzer", desc: "Match resume to a JD", icon: FileText },
    { to: "/analytics", title: "Analytics", desc: "See your progress", icon: BarChart3 },
    { to: "/roadmap", title: "Career Roadmap", desc: "Plan your path", icon: Target },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-bold">
            Hi, <span className="text-gradient">{name}</span> 👋
          </h1>
          {total === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Get started in 3 steps: paste a JD → practice a mock interview → get your readiness report.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <s.icon className="mb-2 size-5 text-primary" />
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <Link key={a.to} to={a.to} className={`rounded-2xl border border-border p-5 shadow-card transition-transform hover:-translate-y-1 ${a.cls ?? "bg-card"}`}>
              <a.icon className="mb-3 size-6" />
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm opacity-80">{a.desc}</div>
            </Link>
          ))}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent sessions</h2>
            <Link to="/setup">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="size-4" /> New
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : (sessions ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                No interviews yet. Start your first mock interview!
              </div>
            ) : (
              (sessions ?? []).map((s) => (
                <Link
                  key={s.id}
                  to={s.status === "completed" ? "/report/$id" : "/interview/$id"}
                  params={{ id: s.id }}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40"
                >
                  <div>
                    <div className="font-medium">{s.job_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.company || "—"} · {s.interview_type} · {s.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.overall_score != null && (
                      <span className="text-lg font-bold text-gradient">{Math.round(Number(s.overall_score))}%</span>
                    )}
                    <Badge variant="outline" className={statusColor(s.status)}>
                      {s.status.replace("_", " ")}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
