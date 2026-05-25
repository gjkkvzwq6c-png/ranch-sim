import { useMemo, useEffect, useState } from 'react';
import { fmtMoney, fmt } from '../utils/formatters';
import { FARM_TIERS, COW_BREEDS } from '../game/gameData';

const COW_POSITIONS = Array.from({ length: 50 }, (_, i) => ({
  x: 5 + ((i * 37) % 90),
  y: 15 + ((i * 53) % 70),
  animDuration: 2.5 + (i % 5) * 0.6,
  animDelay: -(i * 0.4),
  scale: 0.85 + (i % 4) * 0.1,
}));

export default function Pasture({ state, derived, truckVisible, cowPop, onAddCow }) {
  const farm = FARM_TIERS[state.currentFarm];
  const breed = COW_BREEDS.find((b) => b.id === state.activeBreed) || COW_BREEDS[0];
  const visibleCows = Math.min(state.cows, 40);

  const [btnAnim, setBtnAnim] = useState(false);
  const [floaters, setFloaters] = useState([]);

  const canAdd = state.cows < state.maxCows && state.money >= derived.nextCowCost;

  const handleAdd = () => {
    onAddCow();
    setBtnAnim(true);
    setTimeout(() => setBtnAnim(false), 150);
    // Floating +cow text
    const id = Date.now();
    setFloaters((prev) => [...prev.slice(-5), { id, x: 45 + Math.random() * 10, y: 55 }]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== id)), 1500);
  };

  return (
    <div className="relative overflow-hidden" style={{ height: '260px' }}>
      {/* Sky/ground gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${farm.bgClass} opacity-80`} />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-800/40 to-transparent" />

      {/* Clouds */}
      <div className="absolute top-2 left-4 text-2xl opacity-60 animate-[drift_18s_linear_infinite]">☁️</div>
      <div className="absolute top-5 left-1/3 text-xl opacity-50 animate-[drift_24s_linear_infinite_-8s]">☁️</div>
      <div className="absolute top-1 right-8 text-3xl opacity-40 animate-[drift_30s_linear_infinite_-15s]">☁️</div>

      {/* Barn */}
      <div className="absolute bottom-10 right-4 text-5xl drop-shadow-lg select-none">🏚️</div>

      {/* Cows */}
      {Array.from({ length: visibleCows }).map((_, i) => {
        const pos = COW_POSITIONS[i];
        return (
          <span
            key={i}
            className="absolute select-none cursor-default text-2xl"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `scale(${pos.scale})`,
              animation: `cow-bob ${pos.animDuration}s ease-in-out ${pos.animDelay}s infinite`,
              filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))',
            }}
          >
            {breed.emoji}
          </span>
        );
      })}

      {/* Truck */}
      {truckVisible && (
        <div className="absolute bottom-12 left-0 right-0 overflow-hidden h-12 pointer-events-none">
          <div className="animate-truck-drive flex items-center gap-1 w-fit">
            <span className="text-3xl">🚚</span>
            <span className="text-sm font-bold text-white bg-green-600 px-2 py-0.5 rounded-full shadow">
              Delivering! 💰
            </span>
          </div>
        </div>
      )}

      {/* Floating cow count floaters */}
      {floaters.map((f) => (
        <div
          key={f.id}
          className="absolute pointer-events-none text-sm font-bold text-white drop-shadow animate-float-up"
          style={{ left: `${f.x}%`, top: `${f.y}%` }}
        >
          +🐄
        </div>
      ))}

      {/* Milk progress bar */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
        <div className="flex items-center justify-between text-xs text-white font-semibold mb-0.5">
          <span>🥛 {fmt(state.milk)} / {fmt(state.milkStorage)}</span>
          <span>{Math.round(derived.milkPct * 100)}% full</span>
        </div>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-300 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${derived.milkPct * 100}%` }}
          />
        </div>
      </div>

      {/* Add Cow button */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
        <button
          onClick={handleAdd}
          className={`
            relative px-6 py-3 rounded-2xl font-bold text-sm shadow-lg
            transition-all duration-100 select-none
            ${canAdd
              ? 'bg-gradient-to-b from-green-400 to-green-600 text-white active:scale-95 hover:from-green-300 hover:to-green-500'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-70'
            }
            ${btnAnim ? 'scale-95' : 'scale-100'}
          `}
          disabled={!canAdd}
        >
          <span className="text-lg">🐄</span> Add Cow
          <span className="block text-[10px] font-normal opacity-90">
            {state.cows >= state.maxCows ? 'Barn Full!' : `$${fmt(derived.nextCowCost)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
