import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="relative flex min-h-screen">
      <AnimatedBackground />

      {/* Feature panel — glass, collapsible */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border/60 bg-sidebar/60 backdrop-blur-xl transition-[width] duration-300 md:flex",
          collapsed ? "w-[74px] px-2 py-4" : "w-64 p-4",
        )}
      >
        <div className={cn("mb-6 flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
          <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
              <Brain className="size-5" />
            </div>
            {!collapsed && <span>PrepPilot</span>}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse panel"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand panel"
            className="mb-4 grid size-10 place-items-center self-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <PanelLeftOpen className="size-5" />
          </button>
        )}

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                title={collapsed ? n.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg text-sm font-medium transition-all",
                  collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
                  active
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5",
                )}
              >
                <n.icon className="size-4 shrink-0" />
                {!collapsed && n.label}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className={cn("gap-3", collapsed ? "justify-center px-0" : "justify-start")}
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="size-4 shrink-0" /> {!collapsed && "Sign out"}
        </Button>
      </aside>

      {/* Mobile top nav */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border/60 bg-card/40 p-2 backdrop-blur-xl md:hidden">
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
