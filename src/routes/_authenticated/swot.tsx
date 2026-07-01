import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateSWOT } from "@/lib/ai.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, ScrollText, TrendingUp, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/swot")({
  component: SWOT,
});

type SwotData = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  readinessPercent: number;
  verdict: string;
};

function SWOT() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [swot, setSwot] = useState<SwotData | null>(null);

  const { data: sessions } = useQuery({
    queryKey: ["swot-sessions"],
    queryFn: async () => {
      const { data } = await supabase.from("interview_sessions").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const { data: resumes } = useQuery({
    queryKey: ["swot-resumes"],
    queryFn: async () => (await supabase.from("resumes").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const run = async () => {
    const completed = (sessions ?? []).filter((s) => s.overall_score != null);
    if (completed.length === 0) return toast.error("Complete at least one interview first.");
    setLoading(true);
    try {
      const context = JSON.stringify({
        targetRole: profile?.target_role,
        targetCompany: profile?.target_company,
        streak: profile?.streak,
        interviews: completed.map((s) => ({
          role: s.job_title,
          type: s.interview_type,
          difficulty: s.difficulty,
          score: s.overall_score,
          readiness: s.readiness_level,
          report: s.report,
          date: s.completed_at,
        })),
        resumes: (resumes ?? []).map((r) => ({ matchScore: r.match_score, analysis: r.analysis })),
      });
      const result = await generateSWOT({ data: { context } });
      setSwot(result);
      await supabase.from("ai_versions").insert({
        user_id: user!.id,
        entity_type: "swot",
        label: `SWOT ${new Date().toLocaleDateString()}`,
        snapshot: result as never,
      });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate SWOT.");
    } finally {
      setLoading(false);
    }
  };

  const Quad = ({ title, items, icon: Icon, cls }: { title: string; items: string[]; icon: any; cls: string }) => (
    <div className={`rounded-2xl border p-5 ${cls}`}>
      <h3 className="mb-3 flex items-center gap-2 font-semibold"><Icon className="size-4" /> {title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((s, i) => <li key={i}>• {s}</li>)}
      </ul>
    </div>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">SWOT & Readiness</h1>
            <p className="text-muted-foreground">A brutally honest, data-driven verdict from your real performance.</p>
          </div>
          <Button className="gradient-primary text-primary-foreground" onClick={run} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ScrollText className="size-4" />}
            {loading ? "Analyzing…" : "Generate SWOT"}
          </Button>
        </div>

        {!swot && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Generate a SWOT to see your strengths, weaknesses, opportunities, threats, and readiness verdict.
          </div>
        )}

        {swot && (
          <>
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
              <div className="text-5xl font-bold text-gradient">{swot.readinessPercent}%</div>
              <div className="mb-3 text-sm text-muted-foreground">Overall readiness</div>
              <Progress value={swot.readinessPercent} className="mx-auto max-w-md" />
              <p className="mx-auto mt-4 max-w-2xl text-sm">{swot.verdict}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Quad title="Strengths" items={swot.strengths} icon={ThumbsUp} cls="border-success/30 bg-success/5 text-success" />
              <Quad title="Weaknesses" items={swot.weaknesses} icon={ThumbsDown} cls="border-destructive/30 bg-destructive/5 text-destructive" />
              <Quad title="Opportunities" items={swot.opportunities} icon={TrendingUp} cls="border-primary/30 bg-primary/5 text-primary" />
              <Quad title="Threats" items={swot.threats} icon={AlertTriangle} cls="border-warning/30 bg-warning/5 text-warning" />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
