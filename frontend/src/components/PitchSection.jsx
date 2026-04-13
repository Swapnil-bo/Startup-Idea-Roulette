import { motion } from 'framer-motion';

export default function PitchSection({ title, children, accentColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className="glass-card overflow-hidden"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="p-5">
        <h3
          className="font-display text-xs font-bold uppercase mb-3"
          style={{
            color: accentColor,
            letterSpacing: '0.2em',
          }}
        >
          {title}
        </h3>
        {children}
      </div>
    </motion.div>
  );
}
