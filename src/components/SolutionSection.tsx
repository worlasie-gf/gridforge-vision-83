import { motion } from "framer-motion";

const blocks = [
  {
    title: "Verification",
    description: "Measure and verify flexible load with cryptographic transparency.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Coordination",
    description: "Secure communication between utilities, aggregators, and large loads.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: "Trust",
    description: "A shared system of record for grid flexibility.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
  },
];

const SolutionSection = () => {
  return (
    <section className="py-32 px-6 section-light">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-center mb-20 text-foreground"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          GridForge provides the{" "}
          <span className="text-gradient-primary">missing layer.</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {blocks.map((block, i) => (
            <motion.div
              key={i}
              className="group p-8 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors duration-500 shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary mb-6 group-hover:glow transition-shadow duration-500">
                {block.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-foreground">{block.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{block.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
