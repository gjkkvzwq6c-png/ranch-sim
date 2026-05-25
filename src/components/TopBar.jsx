import { fmtMoney, fmt } from '../utils/formatters';
import { FARM_TIERS } from '../game/gameData';

export default function TopBar({ state, cowType }) {
  const farm = FARM_TIERS[state.currentFarm];

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm px-3 py-2 sticky top-0 z-30">
      <div className="max-w-lg mx-auto">
        {/* Farm + breed name row */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <span>{farm.emoji} {farm.name}</span>
          <span className="text-gray-300">•</span>
          <span>{cowType.emoji} {cowType.name}</span>
          {state.prestigeCount > 0 && (
            <span className="bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              ⭐ P{state.prestigeCount}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1.5">
          <Stat label="Money" value={fmtMoney(state.money)} icon="💰" color="text-green-700" />
          <Stat label={cowType.resourceName} value={fmt(state.milk)} icon={cowType.resourceEmoji} color="text-blue-600" />
          <Stat label="/sec" value={fmt(state.milkPerSecond)} icon="⚡" color="text-purple-600" />
          <Stat label="Cows" value={`${fmt(state.cows)}/${fmt(state.maxCows)}`} icon={cowType.emoji} color="text-amber-700" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, color }) {
  return (
    <div className="bg-gray-50 rounded-xl px-1.5 py-1.5 text-center">
      <div className="text-base leading-none">{icon}</div>
      <div className={`text-xs font-bold ${color} truncate`}>{value}</div>
      <div className="text-gray-400 text-[9px] truncate">{label}</div>
    </div>
  );
}
