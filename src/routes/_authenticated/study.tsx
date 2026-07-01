import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateStudyPlan } from "@/lib/ai.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/study")({
  component: Study,
});

type Plan = {
  summary: string;
  topics: { name: string; status: string }[];
  days: { day: number; topic: string; tasks: string[]; resources: string[] }[];
};

function Study() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [role, setRole] = useState("");
  const [weak, setWeak] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: sessions } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: async () => (await supabase.from("interview_sessions").select("*").eq("status", "completed").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: plans } = useQuery({
    queryKey: ["study-plans"],
    queryFn: async () => (await supabase.from("study_plans").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const autofill = () => {
    const latest = (sessions ?? [])[0];
    if (!latest) return toast.error("No completed interviews yet.");
    const report = latest.report as any;
    setRole(latest.job_title);
    setWeak((report?.weaknesses ?? []).join("; ") || "General interview weaknesses");
    toast.success("Prefilled from your latest interview.");
  };

  const generate = async () => {
    if (!role.trim() || !weak.trim()) return toast.error("Enter role and weak areas");
    setLoading(true);
    try {
      const plan = await generateStudyPlan({ data: { role, weakAreas: weak } });
      const { data, error } = await supabase
        .from("study_plans")
        .insert({ user_id: user!.id, title: `${role} study plan`, plan: plan as never, topics: (plan.topics ?? []) as never })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("ai_versions").insert({ user_id: user!.id, entity_type: "study_plan", entity_id: data.id, label: role, snapshot: plan as never });
      qc.invalidateQueries({ queryKey: ["study-plans"] });
      toast.success("Study plan created!");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate study plan.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (planId: string, key: string, progress: Record<string, boolean>) => {
    const next = { ...progress, [key]: !progress[key] };
    await supabase.from("study_plans").update({ topics: next as never }).eq("id", planId);
    qc.invalidateQueries({ queryKey: ["study-plans"] });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Personalized Study Plans</h1>
          <p className="text-muted-foreground">Day-by-day plans targeting your exact weak topics.</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="space-y-2">
            <Label>Target role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Backend Engineer" />
          </div>
          <div className="space-y-2">
            <Label>Weak areas to focus on</Label>
            <Input value={weak} onChange={(e) => setWeak(e.target.value)} placeholder="Distributed systems, system design tradeoffs…" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={autofill}>Autofill from last interview</Button>
            <Button className="flex-1 gradient-primary text-primary-foreground" onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <BookOpen className="size-4" />}
              {loading ? "Generating…" : "Generate plan"}
            </Button>
          </div>
        </div>

        {(plans ?? []).map((p) => {
          const plan = p.plan as unknown as Plan | null;
          const progress = (p.topics as Record<string, boolean>) ?? {};
          if (!plan) return null;
          const keys = plan.days.map((d) => `d${d.day}`);
          const done = keys.filter((k) => progress[k]).length;
          const pct = keys.length ? Math.round((done / keys.length) * 100) : 0;
          return (
            <div key={p.id} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{p.title}</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">{pct}%</div>
                  <div className="text-xs text-muted-foreground">{done}/{keys.length} days</div>
                </div>
              </div>
              <Progress value={pct} />
              <p className="text-sm text-muted-foreground">{plan.summary}</p>
              {plan.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {plan.topics.map((t, i) => <Badge key={i} variant="secondary">{t.name}</Badge>)}
                </div>
              )}
              <div className="space-y-3">
                {plan.days.map((d) => {
                  const key = `d${d.day}`;
                  return (
                    <div key={d.day} className="rounded-xl border border-border/60 p-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <Checkbox checked={!!progress[key]} onCheckedChange={() => toggle(p.id, key, progress)} />
                        <span className="font-semibold">Day {d.day}: {d.topic}</span>
                      </label>
                      <ul className="mt-2 space-y-1 pl-6 text-sm text-muted-foreground">
                        {d.tasks.map((t, i) => <li key={i}>• {t}</li>)}
                      </ul>
                      {d.resources?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                          {d.resources.map((r, i) => <span key={i} className="rounded-md bg-secondary px-2 py-0.5 text-xs">{r}</span>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
