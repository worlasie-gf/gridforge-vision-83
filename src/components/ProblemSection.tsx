import { motion } from "framer-motion";

const ProblemSection = () => {
  return (
    <section id="problem" className="py-28 px-6 section-light">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-sm font-medium text-primary mb-4 tracking-wide uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          The Problem
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-8 text-foreground max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          The flexible grid runs on data that is{" "}
          <span className="text-gradient-primary">fragmented, slow, and hard to verify.</span>
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground max-w-3xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Performance is typically confirmed through estimates, after-the-fact reconciliation, or one resource type at a time — rather than real-time, settlement-grade verification. Grid operators need confidence in what they pay for. Flexibility providers need a way to prove the value they deliver.
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSection;
