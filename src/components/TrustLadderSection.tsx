import { motion } from "framer-motion";

const rungs = [
  { step: "01", title: "See it", body: "Know where resources are, their status, and their availability." },
  { step: "02", title: "Trust it", body: "Settlement-grade performance data both sides can rely on.", highlight: true },
  { step: "03", title: "Act on it", body: "Coordinate and dispatch on data that holds up." },
  { step: "04", title: "Pay for it", body: "Settle faster, with fewer disputes and penalties." },
  { step: "05", title: "Plan with it", body: "Forecast capacity from verified historical performance." },
];

const TrustLadderSection = () => {
  return (
    <section id="trust-ladder" className="py-28 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-sm font-medium text-primary mb-4 tracking-wide uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          The Trust Ladder
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6 text-foreground max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Verified data unlocks every rung above it.
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground max-w-3xl mb-14 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          GridForge supplies the trust at step 02 that lets grid operators and flexibility providers move up the ladder together.
        </motion.p>

        <div className="relative">
          <div className="absolute left-7 top-2 bottom-2 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-4">
            {rungs.map((rung, i) => (
              <motion.div
                key={rung.step}
                className={`relative grid md:grid-cols-2 gap-6 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className={`pl-16 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-16" : "md:pl-16"}`}>
                  <div className={`p-6 rounded-2xl border bg-card shadow-sm inline-block w-full ${rung.highlight ? "border-primary" : "border-border"}`}>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${rung.highlight ? "text-primary" : "text-muted-foreground"}`}>{rung.step}</p>
                    <h3 className="text-lg font-display font-semibold mb-1 text-foreground">{rung.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rung.body}</p>
                  </div>
                </div>
                <div className="hidden md:block" />
                <div className={`absolute left-7 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${rung.highlight ? "bg-primary border-primary glow" : "bg-card border-border"}`} style={{ top: "50%", transform: "translate(-50%, -50%)" }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLadderSection;
