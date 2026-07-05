/**
 * Full-screen animated "3D-like" background.
 * Pure CSS: a full-page grid + receding perspective floor + floating glow orbs
 * + subtle abstract geometric shapes. Abstract only — no text or icons.
 * Sits behind all app content (pointer-events: none, negative z-index).
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,var(--color-accent)_0%,transparent_55%)] opacity-40" />

      {/* full-page consistent grid */}
      <div className="bg-grid-full" />

      {/* floating glow orbs */}
      <div className="orb-float absolute -left-32 top-1/4 size-[28rem] rounded-full bg-primary/20 blur-3xl" />
      <div
        className="orb-float absolute -right-40 top-0 size-[32rem] rounded-full bg-chart-2/20 blur-3xl"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="orb-float absolute bottom-[-10rem] left-1/3 size-[26rem] rounded-full bg-chart-4/15 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />

      {/* abstract geometric depth shapes */}
      <div className="shape-spin absolute right-[12%] top-[18%] size-40 rounded-3xl border border-primary/20 opacity-40 blur-[1px]" />
      <div
        className="shape-spin absolute left-[8%] top-[55%] size-28 rounded-full border border-chart-2/25 opacity-40"
        style={{ animationDirection: "reverse", animationDuration: "55s" }}
      />
      <div
        className="shape-spin absolute right-[22%] bottom-[12%] size-24 opacity-30 blur-[1px]"
        style={{ animationDuration: "48s", background: "conic-gradient(from 0deg, var(--color-chart-4), transparent 60%)", borderRadius: "30%" }}
      />

      {/* 3D perspective grid floor */}
      <div className="perspective-grid absolute inset-x-0 bottom-0 h-[60vh]">
        <div className="grid-plane" />
      </div>
    </div>
  );
}
