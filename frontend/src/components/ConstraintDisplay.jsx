import { motion } from 'framer-motion';

const ITEMS = [
  { key: 'audience', label: 'AUDIENCE', color: '#9333ea' },
  { key: 'problem', label: 'PROBLEM', color: '#ec4899' },
  { key: 'tech', label: 'TECH', color: '#06b6d4' },
];

export default function ConstraintDisplay({ selected }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-3 gap-3"
    >
      {ITEMS.map(({ key, label, color }) => (
        <div key={key} className="glass-card p-4">
          <div
            className="font-display text-[10px] font-bold uppercase mb-2"
            style={{ color, opacity: 0.6, letterSpacing: '0.2em' }}
          >
            {label}
          </div>
          <div
            className="font-mono text-sm leading-snug"
            style={{ color }}
          >
            {selected[key]}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
