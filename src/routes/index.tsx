import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Mic,
  FileText,
  TrendingUp,
  Target,
  Trophy,
  MessageSquare,
  Camera,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Brain, title: "AI Mock Interviews", desc: "Role-specific questions generated from any job description, scored in real time." },
  { icon: Mic, title: "Voice & Camera Practice", desc: "Answer by voice, watch your body language, and get live delivery feedback." },
  { icon: FileText, title: "Resume Analyzer", desc: "Match your resume to any JD — skill gaps, keywords, and fixes." },
  { icon: TrendingUp, title: "Analytics", desc: "Track score trends, skill radar, and category performance over time." },
  { icon: Target, title: "Career Roadmap", desc: "A phased, week-by-week plan to bridge your gaps to your target role." },
  { icon: MessageSquare, title: "AI Coach", desc: "A context-aware coach that knows your history and pushes you forward." },
  { icon: Trophy, title: "SWOT & Readiness", desc: "A brutally honest, data-driven readiness verdict with a gap-closing plan." },
  { icon: Sparkles, title: "Study Plans", desc: "Hyper-personalized day-by-day plans targeting your exact weak topics." },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-bold">
          <div className="grid size-9 place-items-center rounded-xl gradient-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          PrepPilot
        </div>
        <Link to="/auth">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground">
          <Camera className="size-4 text-primary" /> AI interviewer · voice · body language · real-time scoring
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Walk into any interview <span className="text-gradient">actually ready.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          PrepPilot runs realistic AI mock interviews, scores you across the dimensions that matter, and gives you a
          personalized path from "not ready" to "strong candidate."
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
              Start practicing free
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline">
              Explore features
            </Button>
          </a>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card/60 p-5 shadow-card transition-colors hover:border-primary/40">
              <f.icon className="mb-3 size-6 text-primary" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built with PrepPilot · Practice smarter, interview better.
      </footer>
    </div>
  );
}
