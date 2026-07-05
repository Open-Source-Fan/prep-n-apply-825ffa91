import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { analyzeResume } from "@/lib/ai.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, FileText, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/resume")({
  component: ResumePage,
});

type Analysis = {
  matchScore: number;
  summary: string;
  strengths: string[];
  skillGaps: string[];
  experienceGaps: string[];
  missingKeywords: string[];
  recommendations: string[];
};

function scoreColor(s: number) {
  return s >= 75 ? "text-success" : s >= 50 ? "text-warning" : "text-destructive";
}

function ResumePage() {
  const { user } = useAuth();
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });

  // Reuse the resume saved during interview setup (or a previous analysis).
  useEffect(() => {
    if (profile?.resume_text && !resume) {
      setResume(profile.resume_text);
      setFileName(profile.resume_file_name ?? "");
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    if (f.type === "application/pdf") {
      toast.info("For PDFs, please paste the text below for best results.");
      return;
    }
    const text = await f.text();
    setResume(text);
  };

  const run = async () => {
    if (!resume.trim() || !jd.trim()) return toast.error("Add both your resume text and a job description");
    setLoading(true);
    try {
      const a = await analyzeResume({ data: { resume, jobDescription: jd } });
      setResult(a);
      await supabase.from("resumes").insert({
        user_id: user!.id,
        content: resume,
        job_description: jd,
        file_name: fileName || null,
        match_score: a.matchScore,
        analysis: a as never,
      });
      // Save the resume to the profile so it's reused in interview setup too.
      if (resume.trim() !== (profile?.resume_text ?? "").trim()) {
        await supabase
          .from("profiles")
          .update({ resume_text: resume.trim(), resume_file_name: fileName || null })
          .eq("id", user!.id);
      }
    } catch (e) {
      console.error(e);
      toast.error("Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, items, color }: { title: string; items: string[]; color: string }) => (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className={`mb-3 font-semibold ${color}`}>{title}</h3>
      <ul className="space-y-2 text-sm">
        {(items ?? []).map((s, i) => <li key={i}>• {s}</li>)}
        {(!items || items.length === 0) && <li className="text-muted-foreground">None found.</li>}
      </ul>
    </div>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Analyzer</h1>
          <p className="text-muted-foreground">Match your resume against any job description.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Your resume</Label>
            <div className="flex items-center gap-2">
              <Input type="file" accept=".txt,.md,.pdf" onChange={onFile} className="cursor-pointer" />
              <Upload className="size-4 text-muted-foreground" />
            </div>
            <Textarea rows={12} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Paste your resume text here…" />
          </div>
          <div className="space-y-2">
            <Label>Job description</Label>
            <Textarea rows={14} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the target job description…" />
          </div>
        </div>

        <Button className="gradient-primary text-primary-foreground" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {loading ? "Analyzing…" : "Analyze match"}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${scoreColor(result.matchScore)}`}>{result.matchScore}%</div>
                  <div className="text-sm text-muted-foreground">Match score</div>
                </div>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Section title="Strengths" items={result.strengths} color="text-success" />
              <Section title="Skill gaps" items={result.skillGaps} color="text-destructive" />
              <Section title="Experience gaps" items={result.experienceGaps} color="text-warning" />
              <Section title="Missing keywords" items={result.missingKeywords} color="text-primary" />
            </div>
            <Section title="Recommendations" items={result.recommendations} color="text-foreground" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
