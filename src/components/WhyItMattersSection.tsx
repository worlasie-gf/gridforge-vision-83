import { motion } from "framer-motion";

const items = [
  {
    title: "Performance risk",
    body: "As demand response, VPP, and capacity programs become performance-based, unreliable data creates real financial exposure. Participants risk penalties, delayed settlement, and lost revenue when performance cannot be verified.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    title: "Idle grid capacity",
    body: "Flexible capacity already exists across batteries, EV fleets, rooftop solar, and commercial loads. Without a trusted data layer, utilities fall back on conservative assumptions and leave usable capacity on the sidelines. GridForge makes that capacity trustworthy, verifiable, and ready to use.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
];

const WhyItMattersSection = () => {
  return (
    <section className="py-28 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-sm font-medium text-primary mb-4 tracking-wide uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why It Matters
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-14 text-foreground max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Unverified performance is a quiet tax on the grid.
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              className="p-8 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-primary mb-5">
                {item.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
