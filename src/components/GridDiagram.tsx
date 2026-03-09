import { motion } from "framer-motion";

const GridDiagram = () => {
  // Layout coordinates (viewBox 0 0 800 500)
  const nodes = {
    utilities: { x: 400, y: 200, label: "Utilities" },
    flexibility: { x: 120, y: 200, label: "Flexibility Providers", sublabel: "(Aggregators)" },
    loads: { x: 680, y: 200, label: "Large Loads" },
    energy: { x: 400, y: 400, label: "Energy Providers", sublabel: "(Utility-scale solar or storage)" },
  };

  const connections = [
    { from: nodes.flexibility, to: nodes.utilities },
    { from: nodes.flexibility, to: nodes.loads },
    { from: nodes.energy, to: nodes.utilities },
  ];

  const nodeW = 160;
  const nodeH = 72;
  const nodeR = 16;

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <svg viewBox="0 0 800 500" className="w-full h-auto" fill="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(174 72% 46%)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="hsl(174 72% 46%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(174 72% 46%)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        {connections.map((conn, i) => {
          const x1 = conn.from.x;
          const y1 = conn.from.y;
          const x2 = conn.to.x;
          const y2 = conn.to.y;

          // Curved path
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const curveOffset = Math.abs(x2 - x1) > 200 && y1 === y2 ? -30 : 0;
          const path = `M ${x1} ${y1} Q ${midX} ${midY + curveOffset} ${x2} ${y2}`;

          return (
            <g key={i}>
              {/* Glow line */}
              <motion.path
                d={path}
                stroke="hsl(174 72% 46%)"
                strokeWidth="2"
                strokeOpacity="0.12"
                filter="url(#softGlow)"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.2 }}
              />
              {/* Main line */}
              <motion.path
                d={path}
                stroke="hsl(174 72% 46%)"
                strokeWidth="1"
                strokeOpacity="0.35"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.2 }}
              />
              {/* Animated dot */}
              <motion.circle
                r="3"
                fill="hsl(174 72% 46%)"
                filter="url(#glow)"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: ["0%", "100%", "0%"] }}
                transition={{
                  duration: 4 + i * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                style={{
                  offsetPath: `path('${path}')`,
                }}
              />
            </g>
          );
        })}

        {/* Node: Utilities (center) */}
        <motion.g
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <rect
            x={nodes.utilities.x - nodeW / 2}
            y={nodes.utilities.y - nodeH / 2}
            width={nodeW}
            height={nodeH}
            rx={nodeR}
            fill="hsl(200 40% 9%)"
            stroke="hsl(174 72% 46%)"
            strokeWidth="1"
            strokeOpacity="0.4"
            filter="url(#glow)"
          />
          {/* Zap icon */}
          <g transform={`translate(${nodes.utilities.x - 8}, ${nodes.utilities.y - 18})`}>
            <path
              d="M9 1L1 10h7l-1 6 8-9H8l1-6z"
              stroke="hsl(174 72% 46%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
          <text
            x={nodes.utilities.x}
            y={nodes.utilities.y + 20}
            textAnchor="middle"
            fill="hsl(180 15% 92%)"
            fontSize="13"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="600"
          >
            {nodes.utilities.label}
          </text>
        </motion.g>

        {/* Node: Flexibility Providers */}
        <motion.g
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <rect
            x={nodes.flexibility.x - nodeW / 2}
            y={nodes.flexibility.y - nodeH / 2}
            width={nodeW}
            height={nodeH}
            rx={nodeR}
            fill="hsl(200 40% 9%)"
            stroke="hsl(200 20% 16%)"
            strokeWidth="1"
          />
          {/* Radio/signal icon */}
          <g transform={`translate(${nodes.flexibility.x - 8}, ${nodes.flexibility.y - 22})`}>
            <path d="M4 12a4 4 0 0 1 4-4" stroke="hsl(174 72% 46%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M1 15a8 8 0 0 1 8-8" stroke="hsl(174 72% 46%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="8" cy="12" r="1.5" fill="hsl(174 72% 46%)" />
          </g>
          <text
            x={nodes.flexibility.x}
            y={nodes.flexibility.y + 14}
            textAnchor="middle"
            fill="hsl(180 15% 92%)"
            fontSize="12"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="500"
          >
            Flexibility Providers
          </text>
          <text
            x={nodes.flexibility.x}
            y={nodes.flexibility.y + 28}
            textAnchor="middle"
            fill="hsl(195 12% 50%)"
            fontSize="10"
            fontFamily="'Inter', sans-serif"
          >
            (Aggregators)
          </text>
        </motion.g>

        {/* Node: Large Loads */}
        <motion.g
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <rect
            x={nodes.loads.x - nodeW / 2}
            y={nodes.loads.y - nodeH / 2}
            width={nodeW}
            height={nodeH}
            rx={nodeR}
            fill="hsl(200 40% 9%)"
            stroke="hsl(200 20% 16%)"
            strokeWidth="1"
          />
          {/* Building icon */}
          <g transform={`translate(${nodes.loads.x - 8}, ${nodes.loads.y - 20})`}>
            <rect x="2" y="2" width="12" height="14" rx="1" stroke="hsl(174 72% 46%)" strokeWidth="1.5" fill="none" />
            <line x1="6" y1="5" x2="6" y2="7" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="5" x2="10" y2="7" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="10" x2="6" y2="12" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="10" x2="10" y2="12" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text
            x={nodes.loads.x}
            y={nodes.loads.y + 18}
            textAnchor="middle"
            fill="hsl(180 15% 92%)"
            fontSize="12"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="500"
          >
            Large Loads
          </text>
        </motion.g>

        {/* Node: Energy Providers */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <rect
            x={nodes.energy.x - (nodeW + 20) / 2}
            y={nodes.energy.y - nodeH / 2}
            width={nodeW + 20}
            height={nodeH}
            rx={nodeR}
            fill="hsl(200 40% 9%)"
            stroke="hsl(200 20% 16%)"
            strokeWidth="1"
          />
          {/* Sun icon */}
          <g transform={`translate(${nodes.energy.x - 8}, ${nodes.energy.y - 22})`}>
            <circle cx="8" cy="8" r="4" stroke="hsl(174 72% 46%)" strokeWidth="1.5" fill="none" />
            <line x1="8" y1="0" x2="8" y2="2" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="14" x2="8" y2="16" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="8" x2="2" y2="8" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="8" x2="16" y2="8" stroke="hsl(174 72% 46%)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <text
            x={nodes.energy.x}
            y={nodes.energy.y + 14}
            textAnchor="middle"
            fill="hsl(180 15% 92%)"
            fontSize="12"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="500"
          >
            Energy Providers
          </text>
          <text
            x={nodes.energy.x}
            y={nodes.energy.y + 28}
            textAnchor="middle"
            fill="hsl(195 12% 50%)"
            fontSize="10"
            fontFamily="'Inter', sans-serif"
          >
            (Utility-scale solar or storage)
          </text>
        </motion.g>
      </svg>
    </div>
  );
};

export default GridDiagram;
