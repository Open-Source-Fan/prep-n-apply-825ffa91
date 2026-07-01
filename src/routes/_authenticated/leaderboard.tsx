import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  component: Leaderboard,
});

function Leaderboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leaderboard")
        .select("*")
        .order("best_score", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const rankColors = ["text-warning", "text-muted-foreground", "text-amber-700"];

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold"><Trophy className="size-7 text-warning" /> Leaderboard</h1>
          <p className="text-muted-foreground">Top performers ranked by best interview score.</p>
        </div>

        {isLoading ? (
          <div className="grid h-64 place-items-center"><Loader2 className="size-6 animate-spin" /></div>
        ) : (data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No ranked players yet. Complete an interview to join the board!
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {(data ?? []).map((row, i) => {
              const isMe = row.user_id === user?.id;
              return (
                <div
                  key={row.user_id ?? i}
                  className={`flex items-center justify-between gap-4 border-b border-border/60 px-5 py-3 last:border-0 ${isMe ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-center text-lg font-bold ${rankColors[i] ?? "text-muted-foreground"}`}>
                      {i < 3 ? <Medal className="mx-auto size-5" /> : i + 1}
                    </span>
                    <div>
                      <div className="font-medium">{row.display_name || "Anonymous"} {isMe && <Badge variant="secondary" className="ml-1">You</Badge>}</div>
                      <div className="text-xs text-muted-foreground">{row.interview_count} interviews · avg {Math.round(Number(row.avg_score ?? 0))}%</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gradient">{Math.round(Number(row.best_score ?? 0))}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
