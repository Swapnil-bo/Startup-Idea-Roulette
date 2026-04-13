import { motion } from 'framer-motion';
import PitchSection from './PitchSection';
import RoastBadge from './RoastBadge';
import StreamingText from './StreamingText';

function hasContent(str) {
  return str && str.trim().length > 0;
}

function parseBullets(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-•*]/.test(line))
    .map((line) => line.replace(/^[-•*]\s*/, ''));
}

export default function PitchCard({ sections, isStreaming }) {
  const allEmpty =
    !hasContent(sections.name) &&
    !hasContent(sections.tagline) &&
    !hasContent(sections.mvpSpec) &&
    !hasContent(sections.businessModel) &&
    !hasContent(sections.roast);

  if (isStreaming && allEmpty) {
    return (
      <div className="w-full max-w-[800px] mx-auto py-8 flex justify-center">
        <span className="loading-shimmer font-display text-xl font-bold uppercase">
          Generating your doomed startup...
        </span>
      </div>
    );
  }

  if (allEmpty) return null;

  const bullets = parseBullets(sections.mvpSpec);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-[800px] mx-auto flex flex-col gap-4"
      style={{ padding: '2rem 0' }}
    >
      {hasContent(sections.name) && (
        <PitchSection title="STARTUP NAME" accentColor="#9333ea" delay={0}>
          <div className="font-display font-extrabold text-glow-purple leading-tight" style={{ fontSize: '2.5rem' }}>
            <StreamingText text={sections.name} isStreaming={isStreaming && !hasContent(sections.tagline)} />
          </div>
        </PitchSection>
      )}

      {hasContent(sections.tagline) && (
        <PitchSection title="TAGLINE" accentColor="#ec4899" delay={0.15}>
          <div className="italic" style={{ color: '#ec4899', fontSize: '1.2rem' }}>
            <StreamingText text={sections.tagline} isStreaming={isStreaming && !hasContent(sections.mvpSpec)} />
          </div>
        </PitchSection>
      )}

      {hasContent(sections.mvpSpec) && (
        <PitchSection title="MVP SPEC" accentColor="#06b6d4" delay={0.3}>
          {bullets.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {bullets.map((item, i) => (
                <li key={i} className="flex items-start gap-2 font-mono text-sm text-gray-300">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#06b6d4' }} />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="font-mono text-sm text-gray-300">
              <StreamingText text={sections.mvpSpec} isStreaming={isStreaming && !hasContent(sections.businessModel)} />
            </div>
          )}
        </PitchSection>
      )}

      {hasContent(sections.businessModel) && (
        <PitchSection title="BUSINESS MODEL" accentColor="#9333ea" delay={0.45}>
          <div className="font-mono text-gray-300" style={{ fontSize: '0.9rem' }}>
            <StreamingText text={sections.businessModel} isStreaming={isStreaming && !hasContent(sections.roast)} />
          </div>
        </PitchSection>
      )}

      {hasContent(sections.roast) && (
        <RoastBadge content={sections.roast} isStreaming={isStreaming} />
      )}
    </motion.div>
  );
}
