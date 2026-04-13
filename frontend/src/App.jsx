import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSpinWheel } from './hooks/useSpinWheel';
import { usePitchStream } from './hooks/usePitchStream';
import SpinWheel from './components/SpinWheel';
import ConstraintDisplay from './components/ConstraintDisplay';
import PitchCard from './components/PitchCard';

function App() {
  const {
    audiences,
    problems,
    techs,
    selected,
    isSpinning,
    hasSpun,
    spin,
    reset: resetSpin,
  } = useSpinWheel();

  const { sections, isStreaming, error, startStream, reset: resetPitch } = usePitchStream();

  const handleReset = useCallback(() => {
    resetSpin();
    resetPitch();
  }, [resetSpin, resetPitch]);

  const handleGenerate = useCallback(() => {
    startStream(selected.audience, selected.problem, selected.tech);
  }, [startStream, selected]);

  const hasPitchContent = isStreaming || Object.values(sections).some((v) => v.trim());

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <h1 className="font-display font-bold text-white text-glow-purple text-center" style={{ fontSize: '2.5rem' }}>
        STARTUP IDEA ROULETTE
      </h1>
      <p className="font-mono text-gray-500 mb-10 text-center" style={{ fontSize: '0.9rem' }}>
        Spin the wheel. Get a startup. Watch it fail.
      </p>

      {/* Max-width container */}
      <div className="w-full" style={{ maxWidth: 860 }}>
        <SpinWheel
          audiences={audiences}
          problems={problems}
          techs={techs}
          selected={selected}
          isSpinning={isSpinning}
          hasSpun={hasSpun}
          onSpin={spin}
          onReset={handleReset}
        />

        {/* Constraint display */}
        {hasSpun && !isSpinning && selected.audience && (
          <div className="mt-6">
            <ConstraintDisplay selected={selected} />
          </div>
        )}

        {/* Generate Pitch button */}
        {hasSpun && !isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={handleGenerate}
              disabled={isStreaming}
              className="spin-btn relative w-full py-3.5 rounded-xl font-display font-bold text-lg uppercase text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                letterSpacing: '0.2em',
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              }}
            >
              <span className="relative z-10">
                {isStreaming ? 'GENERATING...' : 'GENERATE PITCH'}
              </span>
            </button>
          </motion.div>
        )}

        {/* Error panel */}
        {error && (
          <div
            className="mt-6 rounded-xl px-5 py-4 text-white text-sm font-mono"
            style={{ background: 'rgba(127, 29, 29, 0.8)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
          >
            {error}
          </div>
        )}

        {/* Pitch card */}
        {hasPitchContent && (
          <div className="mt-6">
            <PitchCard sections={sections} isStreaming={isStreaming} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App
