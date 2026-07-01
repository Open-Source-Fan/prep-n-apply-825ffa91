import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateRoadmap } from "@/lib/ai.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Target, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/roadmap")({
  component: Roadmap,
});

type Plan = {
  summary: string;
  phases: { title: string; weeks: string; focus: string; tasks: string[]; resources: string[] }[];
};

function Roadmap() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ targetRole: "", currentPosition: "", targetCompany: "", timeline: "12 weeks" });
  const [loading, setLoading] = useState(false);

  const { data: roadmaps } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const { data } = await supabase.from("roadmaps").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.targetRole.trim()) return toast.error("Enter a target role");
    setLoading(true);
    try {
      const plan = await generateRoadmap({ data: form });
      const { data, error } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user!.id,
          target_role: form.targetRole,
          current_position: form.currentPosition || null,
          target_company: form.targetCompany || null,
          timeline: form.timeline,
          plan: plan as never,
          progress: {} as never,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("ai_versions").insert({
        user_id: user!.id,
        entity_type: "roadmap",
        entity_id: data.id,
        label: form.targetRole,
        snapshot: plan as never,
      });
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
      toast.success("Roadmap created!");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (roadmapId: string, key: string, progress: Record<string, boolean>) => {
    const next = { ...progress, [key]: !progress[key] };
    await supabase.from("roadmaps").update({ progress: next as never }).eq("id", roadmapId);
    qc.invalidateQueries({ queryKey: ["roadmaps"] });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Career Roadmap</h1>
          <p className="text-muted-foreground">A phased, week-by-week plan to reach your target role.</p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Target role *</Label>
            <Input value={form.targetRole} onChange={(e) => set("targetRole", e.target.value)} placeholder="Senior Backend Engineer" />
          </div>
          <div className="space-y-2">
            <Label>Current role</Label>
            <Input value={form.currentPosition} onChange={(e) => set("currentPosition", e.target.value)} placeholder="Mid Backend Engineer" />
          </div>
          <div className="space-y-2">
            <Label>Target company</Label>
            <Input value={form.targetCompany} onChange={(e) => set("targetCompany", e.target.value)} placeholder="Google" />
          </div>
          <div className="space-y-2">
            <Label>Timeline</Label>
            <Input value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="12 weeks" />
          </div>
          <Button className="gradient-primary text-primary-foreground sm:col-span-2" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Generating…" : "Generate roadmap"}
          </Button>
        </div>

        {(roadmaps ?? []).map((r) => {
          const plan = r.plan as unknown as Plan | null;
          const progress = (r.progress as Record<string, boolean>) ?? {};
          if (!plan) return null;
          const allTasks = plan.phases.flatMap((p, pi) => p.tasks.map((_, ti) => `${pi}-${ti}`));
          const done = allTasks.filter((k) => progress[k]).length;
          const pct = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
          return (
            <div key={r.id} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold"><Target className="size-5 text-primary" /> {r.target_role}</h2>
                  <p className="text-sm text-muted-foreground">{r.target_company || "—"} · {r.timeline}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">{pct}%</div>
                  <div className="text-xs text-muted-foreground">{done}/{allTasks.length} tasks</div>
                </div>
              </div>
              <Progress value={pct} />
              <p className="text-sm text-muted-foreground">{plan.summary}</p>
              <div className="space-y-4">
                {plan.phases.map((phase, pi) => (
                  <div key={pi} className="rounded-xl border border-border/60 p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-semibold">{phase.title}</h3>
                      <span className="text-xs text-muted-foreground">{phase.weeks}</span>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{phase.focus}</p>
                    <div className="space-y-2">
                      {phase.tasks.map((t, ti) => {
                        const key = `${pi}-${ti}`;
                        return (
                          <label key={ti} className="flex cursor-pointer items-start gap-2 text-sm">
                            <Checkbox checked={!!progress[key]} onCheckedChange={() => toggleTask(r.id, key, progress)} />
                            <span className={progress[key] ? "text-muted-foreground line-through" : ""}>{t}</span>
                          </label>
                        );
                      })}
                    </div>
                    {phase.resources?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {phase.resources.map((res, ri) => (
                          <span key={ri} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">{res}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
