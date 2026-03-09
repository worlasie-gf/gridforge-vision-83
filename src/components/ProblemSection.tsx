import { motion } from "framer-motion";
import GridDiagram from "./GridDiagram";

const statements = [
  "Electricity demand is growing faster than infrastructure.",
  "Flexible loads already exist across buildings, EVs, and data centers.",
  "Utilities lack the visibility and verification needed to trust them.",
];

const ProblemSection = () => {
  return (
    <section id="problem" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          The grid was built for{" "}
          <span className="text-muted-foreground">a different era.</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {statements.map((text, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                <p className="text-muted-foreground text-lg leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <GridDiagram />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
