import { FARM_TIERS } from '../../game/gameData';
import { fmtMoney, fmt } from '../../utils/formatters';

export default function FarmsTab({ state, onUpgrade }) {
  return (
    <div className="p-3 space-y-2">
      <p className="text-xs text-gray-500 text-center mb-3">
        Upgrade your farm to unlock more cow capacity and better milk prices.
      </p>
      {FARM_TIERS.map((farm, i) => {
        const isCurrent = i === state.currentFarm;
        const isUnlocked = i < state.currentFarm;
        const isNext = i === state.currentFarm + 1;
        const canAfford = state.money >= farm.cost;

        return (
          <div
            key={farm.id}
            className={`rounded-xl border-2 overflow-hidden transition-all ${
              isCurrent
                ? 'border-green-400 shadow-lg'
                : isUnlocked
                ? 'border-gray-200 opacity-70'
                : isNext
                ? 'border-blue-300'
                : 'border-gray-100 opacity-50'
            }`}
          >
            {/* Header gradient */}
            <div className={`bg-gradient-to-r ${farm.bgClass} px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{farm.emoji}</span>
                <div>
                  <div className="font-bold text-white text-sm drop-shadow">{farm.name}</div>
                  <div className="text-white/80 text-[11px]">Up to {fmt(farm.maxCows)} cows</div>
                </div>
              </div>
              {isCurrent && (
                <span className="bg-white/30 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                  CURRENT
                </span>
              )}
              {isUnlocked && (
                <span className="bg-white/30 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                  ✓ OWNED
                </span>
              )}
            </div>

            {/* Body */}
            <div className="bg-white px-4 py-2 flex items-center justify-between">
              <div className="text-[11px] text-gray-500">{farm.description}</div>
              {!isCurrent && !isUnlocked && isNext && (
                <button
                  onClick={() => onUpgrade(farm.id)}
                  disabled={!canAfford}
                  className={`shrink-0 ml-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    canAfford
                      ? 'bg-gradient-to-b from-green-400 to-green-600 text-white shadow active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {fmtMoney(farm.cost)}
                </button>
              )}
              {!isCurrent && !isUnlocked && !isNext && (
                <div className="shrink-0 ml-3 text-xs text-gray-400">🔒 Locked</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
