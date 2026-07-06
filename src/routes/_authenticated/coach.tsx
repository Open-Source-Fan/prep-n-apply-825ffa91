import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { coachChat } from "@/lib/ai.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { CameraPreview } from "@/components/interview/CameraPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/coach")({
  component: Coach,
});

type Msg = { role: "user" | "assistant"; content: string };

const chips = [
  "Coach me on behavioral questions",
  "Build me a study plan for system design",
  "How do I prep for a Google interview?",
  "How do I reduce filler words?",
];

function Coach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your AI interview coach 👋 I know your interview history. Ask me anything — or tap a suggestion below." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCam, setShowCam] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: context } = useQuery({
    queryKey: ["coach-context", user?.id],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from("interview_sessions")
        .select("job_title, interview_type, difficulty, overall_score, readiness_level")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return JSON.stringify({ profile, recentInterviews: sessions });
    },
    enabled: !!user,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const nextMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);
    try {
      const { text: reply } = await coachChat({ data: { messages: nextMsgs, context } });
      setMessages([...nextMsgs, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages([...nextMsgs, { role: "assistant", content: "Sorry, I hit an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h1 className="flex items-center gap-2 font-bold"><Sparkles className="size-5 text-primary" /> AI Coach</h1>
            <Button size="sm" variant="outline" onClick={() => setShowCam((s) => !s)}>
              {showCam ? "Hide camera" : "Practice presence"}
            </Button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] break-words [overflow-wrap:anywhere] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "gradient-primary text-primary-foreground" : "bg-secondary")}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:my-2">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-2.5"><Loader2 className="size-4 animate-spin" /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-t border-border p-4">
            <div className="mb-2 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c} onClick={() => send(c)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  {c}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your coach…" />
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={loading}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          {showCam && <CameraPreview compact />}
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-card">
            Your coach is context-aware — it knows your recent scores, strengths, and target role.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
