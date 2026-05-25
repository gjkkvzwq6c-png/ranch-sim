import { useState } from 'react';
import { fmt } from '../utils/formatters';
import { FARM_TIERS } from '../game/gameData';

const COW_POSITIONS = Array.from({ length: 50 }, (_, i) => ({
  x: 5 + ((i * 37) % 88),
  y: 10 + ((i * 53) % 68),
  animDuration: 2.2 + (i % 5) * 0.7,
  animDelay: -(i * 0.45),
  scale: 0.8 + (i % 4) * 0.12,
}));

export default function Pasture({ state, derived, truckVisible, cowPop, onAddCow }) {
  const farm = FARM_TIERS[state.currentFarm];
  const { cowType, nextCowCost, milkPct } = { ...derived, nextCowCost: derived.nextCowCost };
  const visibleCows = Math.min(state.cows, 40);

  const [btnAnim, setBtnAnim] = useState(false);
  const [floaters, setFloaters] = useState([]);

  const canAdd = state.cows < state.maxCows && state.money >= derived.nextCowCost;

  const handleAdd = () => {
    onAddCow();
    setBtnAnim(true);
    setTimeout(() => setBtnAnim(false), 150);
    const id = Date.now();
    const x = 42 + Math.random() * 16;
    setFloaters((prev) => [...prev.slice(-6), { id, x }]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== id)), 1400);
  };

  // Blend farm bg with a subtle cow-type aura tint
  const farmBg = farm.bgGradient;

  return (
    <div className="relative overflow-hidden" style={{ height: '265px' }}>
      {/* Background gradient (farm tier) */}
      <div className={`absolute inset-0 bg-gradient-to-b ${farmBg}`} />

      {/* Cow-type aura overlay */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ backgroundColor: cowType.glowColor, opacity: 0.18, mixBlendMode: 'soft-light' }}
      />

      {/* Ground / horizon */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-900/30 to-transparent" />

      {/* Clouds */}
      <div className="absolute top-2 left-4 text-2xl opacity-60" style={{ animation: 'drift 20s linear infinite' }}>☁️</div>
      <div className="absolute top-6 left-1/3 text-xl opacity-40" style={{ animation: 'drift 28s linear -9s infinite' }}>☁️</div>
      <div className="absolute top-1 right-8 text-3xl opacity-30" style={{ animation: 'drift 34s linear -17s infinite' }}>☁️</div>

      {/* Barn */}
      <div className="absolute bottom-14 right-4 text-5xl drop-shadow-lg select-none">🏚️</div>

      {/* Cows */}
      {Array.from({ length: visibleCows }).map((_, i) => {
        const pos = COW_POSITIONS[i];
        return (
          <span
            key={i}
            className="absolute select-none text-2xl cursor-default"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `scale(${pos.scale})`,
              animation: `cow-bob ${pos.animDuration}s ease-in-out ${pos.animDelay}s infinite`,
              filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.35))',
            }}
          >
            {cowType.emoji}
          </span>
        );
      })}

      {/* Truck delivery animation */}
      {truckVisible && (
        <div className="absolute bottom-[58px] left-0 right-0 overflow-hidden h-10 pointer-events-none">
          <div className="animate-truck-drive inline-flex items-center gap-2">
            <span className="text-2xl">🚚</span>
            <span className="text-xs font-bold text-white bg-green-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow whitespace-nowrap">
              {cowType.resourceEmoji} Delivering!
            </span>
          </div>
        </div>
      )}

      {/* Cow add floaters */}
      {floaters.map((f) => (
        <div
          key={f.id}
          className="absolute pointer-events-none text-base font-black text-white drop-shadow-lg animate-float-up"
          style={{ left: `${f.x}%`, top: '50%' }}
        >
          +{cowType.emoji}
        </div>
      ))}

      {/* Resource storage bar */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
        <div className="flex items-center justify-between text-[11px] text-white font-semibold mb-0.5 drop-shadow">
          <span>
            {cowType.resourceEmoji} {fmt(state.milk)}{cowType.resourceUnit === 'lb' ? ' lb' : ' gal'} / {fmt(state.milkStorage)}
          </span>
          <span>{Math.round(derived.milkPct * 100)}% full</span>
        </div>
        <div className="h-2.5 bg-black/25 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${derived.milkPct * 100}%`,
              background: `linear-gradient(to right, ${cowType.glowColor}, ${cowType.glowColor.replace('0.4', '0.8')})`,
            }}
          />
        </div>
      </div>

      {/* Add Cow button */}
      <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2">
        <button
          onClick={handleAdd}
          className={`
            px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg transition-all duration-100 select-none
            ${canAdd
              ? 'bg-gradient-to-b from-white/95 to-white/80 text-gray-800 active:scale-95 hover:shadow-xl'
              : 'bg-gray-600/60 text-white/60 cursor-not-allowed'
            }
            ${btnAnim ? 'scale-95' : 'scale-100'}
          `}
          disabled={!canAdd}
        >
          <span className="text-xl">{cowType.emoji}</span>{' '}
          <span className="font-black">Add Cow</span>
          <span className="block text-[10px] font-normal opacity-70 mt-0.5">
            {state.cows >= state.maxCows ? '🚫 Barn Full' : `$${fmt(derived.nextCowCost)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
