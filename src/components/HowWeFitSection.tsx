import { motion } from "framer-motion";

const roles = [
  {
    label: "Data Platforms",
    body: "Move the data",
  },
  {
    label: "GridForge",
    body: "Verifies that what was reported actually happened and was not altered",
    highlight: true,
  },
  {
    label: "Aggregators & VPPs",
    body: "Control the resources",
  },
];

const HowWeFitSection = () => {
  return (
    <section id="how-we-fit" className="py-28 px-6 section-light">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-sm font-medium text-primary mb-4 tracking-wide uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How We Fit
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6 text-foreground max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          We make the platforms and providers around us{" "}
          <span className="text-gradient-primary">more valuable, not redundant.</span>
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground max-w-3xl mb-14 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          So both sides can settle on the data with confidence.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {roles.map((role, i) => (
            <motion.div
              key={role.label}
              className={`p-7 rounded-2xl border shadow-sm ${
                role.highlight
                  ? "border-primary bg-card glow"
                  : "border-border bg-card"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${role.highlight ? "text-primary" : "text-muted-foreground"}`}>
                {role.highlight ? "Verification Layer" : `Role ${i + 1}`}
              </p>
              <h3 className="text-xl font-display font-semibold mb-2 text-foreground">{role.label}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{role.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeFitSection;
