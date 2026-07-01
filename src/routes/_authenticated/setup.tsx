import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { analyzeJob, generateQuestions } from "@/lib/ai.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/setup")({
  component: Setup,
});

const styles = ["Google", "FAANG", "Startup", "Consulting", "HR"];
const types = ["Technical", "Behavioral", "System Design", "Mixed"];
const difficulties = ["Junior", "Mid", "Senior", "Staff"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
        active ? "gradient-primary border-transparent text-primary-foreground shadow-glow" : "border-border bg-card hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

function Setup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
    interviewerStyle: "FAANG",
    interviewType: "Mixed",
    difficulty: "Mid",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const start = async () => {
    if (!form.jobTitle.trim()) return toast.error("Please enter a job title");
    setLoading(true);
    try {
      let jdAnalysis: unknown = null;
      try {
        jdAnalysis = await analyzeJob({ data: { jobTitle: form.jobTitle, company: form.company, jobDescription: form.jobDescription } });
      } catch (e) {
        console.warn("JD analysis failed", e);
      }

      let questions;
      try {
        const q = await generateQuestions({
          data: {
            jobTitle: form.jobTitle,
            company: form.company,
            interviewerStyle: form.interviewerStyle,
            interviewType: form.interviewType,
            difficulty: form.difficulty,
            jdAnalysis,
            count: 6,
          },
        });
        questions = q.questions;
      } catch (e) {
        console.warn("Question generation failed, using fallback", e);
        questions = fallbackQuestions(form.interviewType, form.difficulty);
      }

      const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user!.id,
          job_title: form.jobTitle,
          company: form.company || null,
          job_description: form.jobDescription || null,
          interviewer_style: form.interviewerStyle,
          interview_type: form.interviewType,
          difficulty: form.difficulty,
          jd_analysis: jdAnalysis as never,
          questions: questions as never,
          status: "in_progress",
        })
        .select()
        .single();
      if (error) throw error;
      navigate({ to: "/interview/$id", params: { id: data.id } });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't start the interview. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Set up your mock interview</h1>
          <p className="text-muted-foreground">Step {step} of 2</p>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full gradient-primary transition-all" style={{ width: `${step * 50}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-2">
              <Label>Job title *</Label>
              <Input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="Senior Backend Engineer" />
            </div>
            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Google" />
            </div>
            <div className="space-y-2">
              <Label>Job description (optional — improves question quality)</Label>
              <Textarea rows={6} value={form.jobDescription} onChange={(e) => set("jobDescription", e.target.value)} placeholder="Paste the JD here…" />
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={() => setStep(2)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-3">
              <Label>Interviewer style</Label>
              <div className="grid grid-cols-3 gap-2">
                {styles.map((s) => (
                  <Chip key={s} active={form.interviewerStyle === s} onClick={() => set("interviewerStyle", s)}>{s}</Chip>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Interview type</Label>
              <div className="grid grid-cols-2 gap-2">
                {types.map((s) => (
                  <Chip key={s} active={form.interviewType === s} onClick={() => set("interviewType", s)}>{s}</Chip>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Difficulty</Label>
              <div className="grid grid-cols-4 gap-2">
                {difficulties.map((s) => (
                  <Chip key={s} active={form.difficulty === s} onClick={() => set("difficulty", s)}>{s}</Chip>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={start} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Generating questions…
                  </>
                ) : (
                  <>
                    <Check className="size-4" /> Start interview
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function fallbackQuestions(type: string, difficulty: string) {
  const base = [
    { id: "q1", text: "Tell me about yourself and your most impactful project.", category: "Behavioral" },
    { id: "q2", text: "Describe a technically challenging problem you solved and how.", category: "Technical" },
    { id: "q3", text: "How would you design a scalable URL shortener?", category: "System Design" },
    { id: "q4", text: "Tell me about a time you disagreed with a teammate.", category: "Behavioral" },
    { id: "q5", text: "How do you approach debugging a production incident?", category: "Problem Solving" },
    { id: "q6", text: "Where do you see the biggest risk in a system you've built?", category: "Technical" },
  ];
  return base.map((q) => ({ ...q, difficulty }));
}
