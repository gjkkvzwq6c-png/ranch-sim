import { fmtMoney, fmt } from '../utils/formatters';
import { FARM_TIERS } from '../game/gameData';

export default function TopBar({ state }) {
  const farm = FARM_TIERS[state.currentFarm];

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-green-200 shadow-sm px-3 py-2 sticky top-0 z-30">
      <div className="max-w-lg mx-auto">
        {/* Farm name */}
        <div className="text-center text-xs font-semibold text-green-700 mb-1 truncate">
          {farm.emoji} {farm.name}
          {state.prestigeCount > 0 && (
            <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-bold">
              ⭐ P{state.prestigeCount}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1">
          <Stat label="Money" value={fmtMoney(state.money)} icon="💰" color="text-green-700" />
          <Stat label="Milk" value={fmt(state.milk)} icon="🥛" color="text-blue-600" />
          <Stat label="/sec" value={fmt(state.milkPerSecond)} icon="⚡" color="text-purple-600" />
          <Stat label="Cows" value={`${fmt(state.cows)}/${fmt(state.maxCows)}`} icon="🐄" color="text-amber-700" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, color }) {
  return (
    <div className="bg-gray-50 rounded-lg px-1 py-1 text-center">
      <div className="text-base leading-none">{icon}</div>
      <div className={`text-xs font-bold ${color} truncate`}>{value}</div>
      <div className="text-gray-400 text-[10px]">{label}</div>
    </div>
  );
}
