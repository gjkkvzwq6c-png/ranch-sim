import { useState, useEffect } from 'react';
import { fmt } from '../utils/formatters';

// Phase timeline (ms):
//  0–400   → overlay fades in, "EVOLVING" pulses
//  400–900 → old cow visible, shakes
//  900     → flash burst
//  1200    → new cow zooms in
//  2000    → stats + tap to continue

export default function CowEvolutionModal({ evolutionResult, onDismiss }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!evolutionResult) return;
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1300);
    const t4 = setTimeout(() => setPhase(4), 2100);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [evolutionResult]);

  if (!evolutionResult) return null;
  const { oldType, newType } = evolutionResult;

  const valueMultiplier = (newType.valuePerUnit / oldType.valuePerUnit).toFixed(0);
  const prodMultiplier = (newType.productionRate / oldType.productionRate).toFixed(1);
  const resourceChanged = newType.resource !== oldType.resource;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      onClick={phase >= 4 ? onDismiss : undefined}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: phase >= 0 ? 0.92 : 0 }}
      />

      {/* Flash burst */}
      {phase === 2 && (
        <div className="absolute inset-0 bg-white animate-[flash_0.4s_ease-out_forwards] pointer-events-none" />
      )}

      {/* Stars/particles background */}
      {phase >= 3 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-xl animate-[float-up_2s_ease-out_forwards]"
              style={{
                left: `${5 + (i * 17) % 90}%`,
                top: `${20 + (i * 23) % 60}%`,
                animationDelay: `${(i * 0.1) % 0.8}s`,
                opacity: 0,
              }}
            >
              {['✨', '⭐', '🌟', '💫'][i % 4]}
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 max-w-sm w-full">

        {/* EVOLVING header */}
        <div
          className="text-center transition-all duration-300"
          style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'scale(1)' : 'scale(0.5)' }}
        >
          <div className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase mb-1">
            {phase < 3 ? '✨ EVOLVING ✨' : '✨ EVOLVED! ✨'}
          </div>
        </div>

        {/* Old cow (phases 1–2) */}
        {phase <= 1 && (
          <div
            className="flex flex-col items-center gap-2 transition-all duration-500"
            style={{
              opacity: phase === 1 ? 1 : 0,
              transform: phase === 1 ? 'scale(1)' : 'scale(0.3)',
              animation: phase === 1 ? 'cow-shake 0.4s ease-in-out infinite' : undefined,
            }}
          >
            <div className="text-8xl drop-shadow-2xl">{oldType.emoji}</div>
            <div className="text-white/60 text-sm font-semibold">{oldType.name}</div>
          </div>
        )}

        {/* New cow (phases 3+) */}
        {phase >= 3 && (
          <div
            className="flex flex-col items-center gap-3"
            style={{
              animation: phase === 3 ? 'evolve-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : undefined,
            }}
          >
            {/* Glow ring behind the emoji */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-2xl scale-150"
                style={{ backgroundColor: newType.glowColor, opacity: 0.8 }}
              />
              <div className="relative text-[96px] drop-shadow-2xl leading-none">
                {newType.emoji}
              </div>
            </div>

            <div className="text-center">
              <div className="text-white font-black text-2xl tracking-wide drop-shadow-lg">
                {newType.name}
              </div>
              <div className="text-white/70 text-sm mt-1 italic">"{newType.flavorText}"</div>
            </div>
          </div>
        )}

        {/* Stats reveal (phase 4) */}
        {phase >= 4 && (
          <div className="w-full space-y-3 animate-pop-in">
            {/* Resource type change banner */}
            {resourceChanged && (
              <div className="bg-red-500/80 rounded-xl px-4 py-2 text-center text-white font-bold text-sm backdrop-blur-sm">
                🔄 Resource Changed: Now producing {newType.resourceEmoji} {newType.resourceName}!
              </div>
            )}

            {/* Stats comparison card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 text-center">
                New Stats
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label={`${newType.resourceEmoji} Value / unit`}
                  value={`$${fmt(newType.valuePerUnit)}`}
                  badge={`${valueMultiplier}x`}
                  highlight
                />
                <StatBox
                  label="⚡ Production / sec"
                  value={`${newType.productionRate}/cow`}
                  badge={`${prodMultiplier}x`}
                  highlight
                />
              </div>
              <div className="mt-3 text-center text-white/60 text-xs leading-relaxed">
                {newType.description}
              </div>
            </div>

            {/* Tap to continue */}
            <div className="text-center animate-bounce">
              <div className="text-white/60 text-sm font-semibold">Tap anywhere to continue</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, badge, highlight }) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-white/20' : 'bg-white/10'}`}>
      <div className="text-white/60 text-[10px] uppercase tracking-wide mb-1">{label}</div>
      <div className="text-white font-bold text-sm">{value}</div>
      {badge && (
        <div className="mt-1 inline-block bg-green-400 text-green-900 text-[10px] font-black px-2 py-0.5 rounded-full">
          ↑ {badge}
        </div>
      )}
    </div>
  );
}
