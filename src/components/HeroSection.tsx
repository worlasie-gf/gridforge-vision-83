import { motion } from "framer-motion";
import logo from "@/assets/logo-2.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(199_88.7%_48.4%_/_0.08),_transparent_60%)]" />

      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <img src={logo} alt="GridForge Energy" className="h-10 md:h-12" />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#problem" className="hover:text-foreground transition-colors">Problem</a>
          <a href="#how-we-fit" className="hover:text-foreground transition-colors">How we fit</a>
          <a href="#trust-ladder" className="hover:text-foreground transition-colors">Trust Ladder</a>
          <a href="#who-we-serve" className="hover:text-foreground transition-colors">Who we serve</a>
        </nav>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground tracking-wide">Built on tech developed at Oak Ridge National Laboratory</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.05] mb-8 text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Trust for the{" "}
            <span className="text-gradient-primary">Flexible Grid</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            GridForge is a privacy-preserving, real-time verification layer for the energy sector. We don't move data or dispatch assets — we verify the performance data flowing through other systems so it can be trusted and settled.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <a
              href="#problem"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity glow"
            >
              See how it works
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#who-we-serve"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border bg-card text-foreground font-medium text-sm hover:border-primary/40 transition-colors"
            >
              Who we serve
            </a>
          </motion.div>
        </div>

        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium tracking-wide uppercase">
              Verification Layer
            </div>
            <div className="space-y-4">
              {[
                { label: "Reported MW", value: "4,820", status: "Submitted" },
                { label: "Verified MW", value: "4,807", status: "Settlement-grade", accent: true },
                { label: "Discrepancy", value: "0.27%", status: "Within tolerance" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className={`text-2xl font-display font-semibold ${row.accent ? "text-primary" : "text-foreground"}`}>{row.value}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
