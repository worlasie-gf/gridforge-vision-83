import { motion } from "framer-motion";

const nodes = [
  { x: 50, y: 20, label: "EV" },
  { x: 15, y: 50, label: "Building" },
  { x: 85, y: 50, label: "Data Center" },
  { x: 30, y: 80, label: "Solar" },
  { x: 70, y: 80, label: "Battery" },
];

const GridDiagram = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Center hub */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center glow"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-xs font-display text-primary font-semibold">GRID</span>
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
              stroke="hsl(217 91% 60%)"
              strokeWidth="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />
          </svg>

          {/* Node */}
          <motion.div
            className="absolute w-16 h-16 rounded-lg border border-border bg-secondary flex items-center justify-center"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
          >
            <span className="text-[10px] text-muted-foreground font-medium">{node.label}</span>
          </motion.div>

          {/* Pulse dot traveling along line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <motion.circle
              r="0.8"
              fill="hsl(217 91% 60%)"
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
        </motion.div>
      ))}
    </div>
  );
};

export default GridDiagram;
