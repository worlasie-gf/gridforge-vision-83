import { motion } from "framer-motion";

type FutureSectionProps = {
  onLeadCaptureOpen: () => void;
};

const FutureSection = ({ onLeadCaptureOpen }: FutureSectionProps) => {
  return (
    <section className="py-32 px-6 relative overflow-hidden section-light">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(199_88.7%_48.4%_/_0.07),_transparent_60%)]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-8 text-foreground"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          The flexible grid doesn't just need{" "}
          <span className="text-gradient-primary">more data.</span>
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          It needs data that can be trusted. GridForge is building the verification layer that turns flexible demand into dependable grid capacity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <button
            type="button"
            onClick={onLeadCaptureOpen}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity glow"
          >
            Get in touch
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FutureSection;
