import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Brain,
  LayoutDashboard,
  Plus,
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Trophy,
  ScrollText,
  BookOpen,
  LogOut,
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/setup", label: "New Interview", icon: Plus },
  { to: "/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/roadmap", label: "Career Roadmap", icon: Target },
  { to: "/swot", label: "SWOT & Readiness", icon: ScrollText },
  { to: "/coach", label: "AI Coach", icon: MessageSquare },
  { to: "/study", label: "Study Plans", icon: BookOpen },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <Link to="/dashboard" className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
          <div className="grid size-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          PrepPilot
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" className="justify-start gap-3" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </aside>

      {/* Mobile top nav */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-card/50 p-2 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground [&.active]:bg-secondary [&.active]:text-foreground"
            >
              <n.icon className="size-3.5" /> {n.label}
            </Link>
          ))}
        </div>
        <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
