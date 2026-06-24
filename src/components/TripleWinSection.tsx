import { motion } from "framer-motion";

const wins = [
  {
    title: "Flexibility Providers",
    body: "Proof they can be paid on.",
  },
  {
    title: "Grid Operators",
    body: "Capacity they can rely on.",
  },
  {
    title: "Data Platforms",
    body: "Pipelines worth settling against.",
  },
];

const TripleWinSection = () => {
  return (
    <section className="py-28 px-6 section-light">
      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          className="text-sm font-medium text-primary mb-4 tracking-wide uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          The Triple Win
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-14 text-foreground max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Verification{" "}
          <span className="text-gradient-primary">aligns everyone.</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {wins.map((win, i) => (
            <motion.div
              key={win.title}
              className="p-8 rounded-2xl border border-border bg-card shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 mx-auto">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 text-foreground">{win.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{win.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TripleWinSection;
