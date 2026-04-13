import { useRef, useEffect, useCallback } from 'react';

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const COLUMNS = [
  { key: 'audience', label: 'AUDIENCE', accent: '#9333ea', listKey: 'audiences' },
  { key: 'problem', label: 'PROBLEM', accent: '#ec4899', listKey: 'problems' },
  { key: 'tech', label: 'TECH', accent: '#06b6d4', listKey: 'techs' },
];

function Reel({ items, selectedValue, isSpinning, accent }) {
  const stripRef = useRef(null);
  const rafRef = useRef(null);
  const offsetRef = useRef(0);
  const spinningRef = useRef(false);
  const lockedValueRef = useRef(null);

  const totalHeight = items.length * ITEM_HEIGHT;

  const getTargetOffset = useCallback(
    (value) => {
      const idx = items.indexOf(value);
      if (idx === -1) return 0;
      return -(idx * ITEM_HEIGHT);
    },
    [items],
  );

  // Start the fast-scroll RAF loop when isSpinning becomes true
  useEffect(() => {
    if (!isSpinning || items.length === 0) return;

    lockedValueRef.current = null;
    spinningRef.current = true;
    const speed = 15 + Math.random() * 10;

    const animate = () => {
      if (!spinningRef.current) return;

      offsetRef.current -= speed;

      // Wrap around seamlessly
      if (offsetRef.current <= -totalHeight) {
        offsetRef.current += totalHeight;
      }

      if (stripRef.current) {
        stripRef.current.style.transform = `translateY(${offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      spinningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isSpinning, items, totalHeight]);

  // When selectedValue arrives (hook timeout fires), decelerate then snap
  useEffect(() => {
    if (!selectedValue || !spinningRef.current) return;

    lockedValueRef.current = selectedValue;

    // Stop the constant-speed loop
    spinningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Start deceleration from current velocity
    let velocity = 15 + Math.random() * 8;

    const decelerate = () => {
      velocity *= 0.91;
      offsetRef.current -= velocity;

      if (offsetRef.current <= -totalHeight) {
        offsetRef.current += totalHeight;
      }

      if (stripRef.current) {
        stripRef.current.style.transform = `translateY(${offsetRef.current}px)`;
      }

      if (velocity > 0.4) {
        rafRef.current = requestAnimationFrame(decelerate);
      } else {
        // Hard snap to target — the slot-machine lock moment
        const target = getTargetOffset(selectedValue);
        offsetRef.current = target;
        if (stripRef.current) {
          stripRef.current.style.transform = `translateY(${target}px)`;
        }
      }
    };

    rafRef.current = requestAnimationFrame(decelerate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedValue, totalHeight, getTargetOffset]);

  const isLocked = !isSpinning && selectedValue !== null;
  const centerIndex = items.indexOf(selectedValue);

  // Triple the items for seamless wrapping
  const renderItems = [...items, ...items, ...items];

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: VIEWPORT_HEIGHT }}
    >
      {/* Top fade mask */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: ITEM_HEIGHT,
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.95) 0%, transparent 100%)',
        }}
      />
      {/* Bottom fade mask */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: ITEM_HEIGHT,
          background: 'linear-gradient(to top, rgba(10,10,15,0.95) 0%, transparent 100%)',
        }}
      />

      {/* Center highlight line - top */}
      <div
        className="absolute left-2 right-2 z-10 pointer-events-none"
        style={{
          top: ITEM_HEIGHT - 1,
          height: 1,
          background: accent,
          boxShadow: `0 0 8px ${accent}`,
          opacity: isLocked ? 0.8 : 0.15,
        }}
      />
      {/* Center highlight line - bottom */}
      <div
        className="absolute left-2 right-2 z-10 pointer-events-none"
        style={{
          top: ITEM_HEIGHT * 2,
          height: 1,
          background: accent,
          boxShadow: `0 0 8px ${accent}`,
          opacity: isLocked ? 0.8 : 0.15,
        }}
      />

      <div
        ref={stripRef}
        className="absolute left-0 right-0"
        style={{
          transform: `translateY(${isLocked ? getTargetOffset(selectedValue) : 0}px)`,
          top: ITEM_HEIGHT,
        }}
      >
        {renderItems.map((item, i) => {
          const realIndex = i % items.length;
          const isCenterItem = isLocked && realIndex === centerIndex;

          return (
            <div
              key={i}
              className="flex items-center justify-center text-center px-3"
              style={{
                height: ITEM_HEIGHT,
                fontSize: isCenterItem ? '1.1rem' : '0.85rem',
                fontWeight: isCenterItem ? 700 : 400,
                color: isCenterItem ? accent : '#e2e8f0',
                opacity: isCenterItem ? 1 : 0.3,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.3,
              }}
            >
              <span className="line-clamp-2">{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SpinWheel({
  audiences,
  problems,
  techs,
  selected,
  isSpinning,
  hasSpun,
  onSpin,
  onReset,
}) {
  const lists = { audiences, problems, techs };

  return (
    <div className="w-full">
      {/* Three columns */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {COLUMNS.map((col) => {
          const items = lists[col.listKey] || [];
          const selectedValue = selected[col.key];
          const isLocked = !isSpinning && selectedValue !== null;

          return (
            <div key={col.key} className="flex flex-col items-center">
              {/* Column label */}
              <span
                className="font-display text-xs font-bold uppercase mb-3"
                style={{
                  color: col.accent,
                  letterSpacing: '0.2em',
                }}
              >
                {col.label}
              </span>

              {/* Wheel column */}
              <div
                className={`wheel-column w-full relative overflow-hidden ${isLocked ? 'locked' : ''}`}
                style={{ padding: 0 }}
              >
                {/* Brand stripe at top */}
                <div
                  style={{
                    height: 2,
                    background: col.accent,
                    boxShadow: `0 0 10px ${col.accent}`,
                  }}
                />

                {items.length > 0 ? (
                  <Reel
                    items={items}
                    selectedValue={selectedValue}
                    isSpinning={isSpinning}
                    accent={col.accent}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center opacity-30 text-sm"
                    style={{ height: VIEWPORT_HEIGHT }}
                  >
                    Loading...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3">
        {/* SPIN button */}
        <button
          onClick={onSpin}
          disabled={isSpinning || audiences.length === 0}
          className="spin-btn relative w-full py-4 rounded-xl font-display font-bold text-xl uppercase text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            letterSpacing: '0.25em',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
          }}
        >
          <span className="relative z-10">
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </span>
        </button>

        {/* Re-spin button */}
        {hasSpun && !isSpinning && (
          <button
            onClick={onReset}
            className="respin-btn px-6 py-2 rounded-lg font-display text-sm uppercase font-bold"
            style={{
              letterSpacing: '0.15em',
              color: '#9333ea',
              background: 'transparent',
              border: '1px solid rgba(147, 51, 234, 0.4)',
            }}
          >
            Re-spin
          </button>
        )}
      </div>
    </div>
  );
}
