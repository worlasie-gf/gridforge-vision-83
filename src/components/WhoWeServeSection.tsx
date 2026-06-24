import { motion } from "framer-motion";

const groups = [
  {
    title: "Grid Operators",
    audience: "Utilities, ISOs, RTOs",
    body: "Verified visibility into grid-edge performance.",
  },
  {
    title: "Flexibility Providers",
    audience: "Aggregators, CCAs, VPPs, EV fleets, storage owners, DER platforms",
    body: "An independent way to prove the performance you deliver and get paid faster.",
  },
  {
    title: "Data & IT Platforms",
    audience: "Data access platforms, utility IT integrators",
    body: "A verification engine that turns standard pipelines into settlement-grade data.",
  },
];

const WhoWeServeSection = () => {
  return (
    <section id="who-we-serve" className="py-28 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-sm font-medium text-primary mb-4 tracking-wide uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Who We Serve
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-14 text-foreground max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Every role on the flexible grid.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {groups.map((g, i) => (
            <motion.div
              key={g.title}
              className="p-8 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h3 className="text-xl font-display font-semibold mb-2 text-foreground">{g.title}</h3>
              <p className="text-xs text-primary mb-4 font-medium tracking-wide uppercase">{g.audience}</p>
              <p className="text-muted-foreground leading-relaxed">{g.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeServeSection;
