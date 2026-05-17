import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { MentorKnight } from "@/components/MentorKnight";
import { SKINS } from "@/lib/skins";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[var(--gradient-mocha)] flex items-center justify-center text-primary-foreground font-bold" style={{ background: "var(--gradient-mocha)" }}>N</div>
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "Fraunces, serif" }}>Navy</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/play" className="hover:text-foreground transition-colors">{t("play_ai")}</Link>
          <a href="#skins" className="hover:text-foreground transition-colors">Skins</a>
          <a href="#variants" className="hover:text-foreground transition-colors">Variants</a>
        </nav>
        <Link to="/play" className="pill-btn bg-foreground text-background text-sm">{t("sign_in")}</Link>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 pb-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">A new way to play checkers</span>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6" style={{ fontFamily: "Fraunces, serif" }}>
            {t("tagline")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Six international variants. ELO ladder. Beautiful board skins you unlock as you climb. Quiet, warm, and deeply playable.
          </p>
          <div className="flex gap-3">
            <Link to="/play" className="pill-btn bg-primary text-primary-foreground">{t("play_now")} →</Link>
            <Link to="/play" className="pill-btn bg-card text-foreground border border-border">{t("sign_in")}</Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-6 -left-6 z-10">
            <MentorKnight mood="happy" size={120} />
          </div>
          <div className="card-soft p-6">
            <MiniBoardPreview />
            <p className="text-sm text-muted-foreground mt-4 text-center italic">"Ready when you are." — Navy</p>
          </div>
        </div>
      </section>

      {/* Skins */}
      <section id="skins" className="px-6 md:px-12 py-20 bg-secondary/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Four boards. Earn your skin.</h2>
          <p className="text-muted-foreground mb-10">Unlock new aesthetics as your XP climbs.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SKINS.map(s => (
              <div key={s.id} className="card-soft p-5" data-skin={s.id}>
                <div className="aspect-square rounded-xl mb-4 overflow-hidden" style={{ background: "var(--board-frame)" }}>
                  <div className="grid grid-cols-4 h-full p-2 gap-0">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const r = Math.floor(i / 4), c = i % 4;
                      const dark = (r + c) % 2 === 1;
                      return <div key={i} style={{ background: dark ? "var(--board-dark)" : "var(--board-light)" }} />;
                    })}
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-1">{s.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{s.vibe}</p>
                <span className="text-xs font-medium text-primary">{s.xpRequired === 0 ? "Starter" : `${s.xpRequired} XP`}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Variants */}
      <section id="variants" className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Six tournament variants</h2>
        <p className="text-muted-foreground mb-10">From American to Canadian 12×12. ELO matchmaking across every variant.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {["American Checkers","English Draughts","Russian Draughts","Brazilian Draughts","Turkish Draughts","Canadian 12×12"].map(v => (
            <div key={v} className="card-soft p-5">
              <h3 className="font-semibold mb-1">{v}</h3>
              <p className="text-sm text-muted-foreground">Full rules with mandatory captures, flying kings where applicable.</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 text-center text-sm text-muted-foreground border-t border-border">
        Navy · Check 4 a Mate · Built with care
      </footer>
    </div>
  );
}

function MiniBoardPreview() {
  return (
    <div className="aspect-square rounded-xl overflow-hidden grid grid-cols-8" style={{ background: "var(--board-frame)" }}>
      {Array.from({ length: 64 }).map((_, i) => {
        const r = Math.floor(i / 8), c = i % 8;
        const dark = (r + c) % 2 === 1;
        const showPiece = dark && (r < 3 || r > 4);
        const black = r < 3;
        return (
          <div key={i} className="flex items-center justify-center" style={{ background: dark ? "var(--board-dark)" : "var(--board-light)" }}>
            {showPiece && (
              <div className="w-3/4 h-3/4 rounded-full" style={{
                background: black ? "var(--piece-black)" : "var(--piece-white)",
                boxShadow: "var(--board-glow), inset 0 -3px 6px rgba(0,0,0,0.3)",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
