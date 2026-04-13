import { motion } from 'framer-motion';
import StreamingText from './StreamingText';

export default function RoastBadge({ content, isStreaming }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.8 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#7f1d1d',
        border: '1px dashed rgba(239, 68, 68, 0.5)',
        boxShadow: 'var(--glow-red)',
      }}
    >
      <div className="p-5">
        <div
          className="flex items-center gap-2 mb-3 font-display font-bold text-sm uppercase"
          style={{
            color: '#fca5a5',
            letterSpacing: '0.15em',
          }}
        >
          <span className="text-lg">🔥</span>
          WHY IT'LL FAIL
        </div>
        <div style={{ color: '#fca5a5' }}>
          <StreamingText text={content} isStreaming={isStreaming} />
        </div>
      </div>
    </motion.div>
  );
}
