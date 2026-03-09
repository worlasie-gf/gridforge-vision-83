import { motion } from "framer-motion";
import { Zap, Building2, Sun, Radio } from "lucide-react";

const nodes = [
  {
    x: 15,
    y: 20,
    label: "Flexibility Providers",
    sublabel: "(Aggregators)",
    icon: <Radio className="w-7 h-7" />,
  },
  {
    x: 85,
    y: 20,
    label: "Large Loads",
    sublabel: "",
    icon: <Building2 className="w-7 h-7" />,
  },
  {
    x: 15,
    y: 80,
    label: "Energy Providers",
    sublabel: "(Utility-scale solar or storage)",
    icon: <Sun className="w-7 h-7" />,
  },
];

const GridDiagram = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Center hub */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-2xl border border-border bg-card flex flex-col items-center justify-center glow gap-1.5 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Zap className="w-8 h-8 text-primary" />
        <span className="text-xs font-display text-foreground font-semibold">Utilities</span>
      </motion.div>

      {nodes.map((node, i) => (
        <motion.div key={i}>
          {/* Connection line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <motion.line
              x1="50"
              y1="50"
              x2={node.x}
              y2={node.y}
              stroke="hsl(174 72% 46%)"
              strokeWidth="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />
          </svg>

          {/* Glow dot on line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <motion.circle
              r="0.6"
              fill="hsl(174 72% 46%)"
              initial={{ cx: node.x, cy: node.y }}
              animate={{
                cx: [node.x, 50, node.x],
                cy: [node.y, 50, node.y],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          </svg>

          {/* Node card */}
          <motion.div
            className="absolute flex flex-col items-center"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
          >
            <div className="w-20 h-20 rounded-2xl border border-border bg-card flex items-center justify-center text-primary mb-3">
              {node.icon}
            </div>
            <span className="text-xs text-foreground font-medium text-center leading-tight whitespace-nowrap">
              {node.label}
            </span>
            {node.sublabel && (
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {node.sublabel}
              </span>
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default GridDiagram;
