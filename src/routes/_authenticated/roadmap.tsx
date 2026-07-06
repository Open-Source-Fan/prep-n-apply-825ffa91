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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2, Target, Sparkles, History, Clock, ArrowLeft, RotateCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/roadmap")({
  component: Roadmap,
});

type Plan = {
  summary: string;
  phases: { title: string; weeks: string; focus: string; tasks: string[]; resources: string[] }[];
};

type VersionSnapshot = {
  version: number;
  generatedAt: string;
  label: string;
  plan: Plan;
};

type VersionRow = {
  id: string;
  created_at: string;
  entity_id: string | null;
  label: string | null;
  snapshot: VersionSnapshot;
};

function Roadmap() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ targetRole: "", currentPosition: "", targetCompany: "", timeline: "12 weeks" });
  const [loading, setLoading] = useState(false);
  // roadmapId -> version number currently being viewed (null = current/latest)
  const [viewing, setViewing] = useState<Record<string, number | null>>({});

  const { data: roadmaps } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const { data } = await supabase.from("roadmaps").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: versions } = useQuery({
    queryKey: ["roadmap-versions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_versions")
        .select("*")
        .eq("entity_type", "roadmap")
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as VersionRow[];
    },
  });

  const versionsFor = (roadmapId: string) =>
    (versions ?? [])
      .filter((v) => v.entity_id === roadmapId && v.snapshot?.version != null)
      .sort((a, b) => b.snapshot.version - a.snapshot.version);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.targetRole.trim()) return toast.error("Enter a target role");
    setLoading(true);
    try {
      const plan = await generateRoadmap({ data: form });

      // Find an existing roadmap for the same target role (case-insensitive).
      const existing = (roadmaps ?? []).find(
        (r) => r.target_role.trim().toLowerCase() === form.targetRole.trim().toLowerCase(),
      );

      let roadmapId: string;

      if (existing) {
        // Regenerating for the same role — archive as a new version and update the card.
        roadmapId = existing.id;
        await supabase
          .from("roadmaps")
          .update({
            plan: plan as never,
            current_position: form.currentPosition || null,
            target_company: form.targetCompany || null,
            timeline: form.timeline,
          })
          .eq("id", existing.id);
      } else {
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
        roadmapId = data.id;
      }

      // Next version number = existing versions count + 1.
      const nextVersion = versionsFor(roadmapId).length + 1;
      const snapshot: VersionSnapshot = {
        version: nextVersion,
        generatedAt: new Date().toISOString(),
        label: `${form.targetRole}${form.targetCompany ? ` @ ${form.targetCompany}` : ""} · ${form.timeline}`,
        plan,
      };
      await supabase.from("ai_versions").insert({
        user_id: user!.id,
        entity_type: "roadmap",
        entity_id: roadmapId,
        label: snapshot.label,
        snapshot: snapshot as never,
      });

      // Always show the latest after generating.
      setViewing((v) => ({ ...v, [roadmapId]: null }));
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
      qc.invalidateQueries({ queryKey: ["roadmap-versions"] });
      toast.success(existing ? `Roadmap updated to v${nextVersion}!` : "Roadmap created!");
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
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Tip: generating for a role you already have archives the old plan as a new version.
          </p>
        </div>

        {(roadmaps ?? []).map((r) => {
          const roadmapVersions = versionsFor(r.id);
          const latestVersion = roadmapVersions[0]?.snapshot.version ?? 1;
          const viewingVersion = viewing[r.id] ?? null;
          const activeSnapshot =
            viewingVersion != null
              ? roadmapVersions.find((v) => v.snapshot.version === viewingVersion)?.snapshot ?? null
              : null;

          const plan = (activeSnapshot?.plan ?? (r.plan as unknown as Plan | null)) as Plan | null;
          const isOldVersion = viewingVersion != null && viewingVersion !== latestVersion;
          // Progress only applies to the current/live plan.
          const progress = isOldVersion ? {} : ((r.progress as Record<string, boolean>) ?? {});
          if (!plan) return null;
          const allTasks = plan.phases.flatMap((p, pi) => p.tasks.map((_, ti) => `${pi}-${ti}`));
          const done = allTasks.filter((k) => progress[k]).length;
          const pct = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;
          const shownVersion = viewingVersion ?? latestVersion;

          return (
            <div key={r.id} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    <Target className="size-5 text-primary" /> {r.target_role}
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      v{shownVersion}
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">{r.target_company || "—"} · {r.timeline}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <History className="size-4" /> History
                        {roadmapVersions.length > 0 && (
                          <span className="ml-1 rounded-full bg-secondary px-1.5 text-xs">{roadmapVersions.length}</span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Version history</SheetTitle>
                        <SheetDescription>{r.target_role}</SheetDescription>
                      </SheetHeader>
                      <div className="mt-4 space-y-2">
                        {roadmapVersions.length === 0 && (
                          <p className="text-sm text-muted-foreground">No archived versions yet.</p>
                        )}
                        {roadmapVersions.map((v) => {
                          const isLatest = v.snapshot.version === latestVersion;
                          const isActive = shownVersion === v.snapshot.version;
                          return (
                            <button
                              key={v.id}
                              onClick={() =>
                                setViewing((s) => ({ ...s, [r.id]: isLatest ? null : v.snapshot.version }))
                              }
                              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                                isActive ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2 font-semibold">
                                  v{v.snapshot.version}
                                  {isLatest && (
                                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                                      current
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  {new Date(v.snapshot.generatedAt ?? v.created_at).toLocaleString()}
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">{v.snapshot.label ?? v.label}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gradient">{pct}%</div>
                    <div className="text-xs text-muted-foreground">{done}/{allTasks.length} tasks</div>
                  </div>
                </div>
              </div>

              {isOldVersion && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <History className="size-4" />
                    You're viewing an archived snapshot (v{viewingVersion}). Progress editing is disabled.
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setViewing((s) => ({ ...s, [r.id]: null }))}>
                    <ArrowLeft className="size-4" /> Back to current
                  </Button>
                </div>
              )}

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
                          <label key={ti} className={`flex items-start gap-2 text-sm ${isOldVersion ? "" : "cursor-pointer"}`}>
                            <Checkbox
                              checked={!!progress[key]}
                              disabled={isOldVersion}
                              onCheckedChange={() => toggleTask(r.id, key, progress)}
                            />
                            <span className={`min-w-0 break-words [overflow-wrap:anywhere] ${progress[key] ? "text-muted-foreground line-through" : ""}`}>{t}</span>
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

              {isOldVersion && (
                <Button variant="secondary" className="w-full" onClick={() => setViewing((s) => ({ ...s, [r.id]: null }))}>
                  <RotateCw className="size-4" /> Back to current (v{latestVersion})
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
