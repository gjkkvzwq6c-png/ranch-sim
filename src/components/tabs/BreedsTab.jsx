import { COW_BREEDS } from '../../game/gameData';
import { fmtMoney, fmt } from '../../utils/formatters';

export default function BreedsTab({ state, onUnlock, onSwitch }) {
  return (
    <div className="p-3 space-y-2">
      <p className="text-xs text-gray-500 text-center mb-3">
        Unlock better breeds to massively boost milk production. Switch your active herd anytime.
      </p>
      {COW_BREEDS.map((breed) => {
        const isUnlocked = state.unlockedBreeds.includes(breed.id);
        const isActive = state.activeBreed === breed.id;
        const canAfford = state.money >= breed.unlockCost;

        return (
          <div
            key={breed.id}
            className={`relative rounded-xl border-2 p-3 transition-all ${
              isActive
                ? 'border-green-400 shadow-md shadow-green-100'
                : isUnlocked
                ? 'border-blue-200 bg-white'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {isActive && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                ACTIVE
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shrink-0 bg-gradient-to-br ${breed.color}`}
              >
                {breed.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 text-sm">{breed.name}</div>
                <div className="text-[11px] text-gray-500 leading-snug">{breed.description}</div>
                <div className="text-xs text-purple-600 font-semibold mt-0.5">
                  ⚡ {fmt(breed.milkPerSecond)} milk/cow/sec
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-2 flex justify-end">
              {isUnlocked ? (
                isActive ? (
                  <div className="text-xs text-green-600 font-bold px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                    ✓ Currently Active
                  </div>
                ) : (
                  <button
                    onClick={() => onSwitch(breed.id)}
                    className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold active:scale-95 transition-transform"
                  >
                    Switch to this breed
                  </button>
                )
              ) : (
                <button
                  onClick={() => onUnlock(breed.id)}
                  disabled={!canAfford}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    canAfford
                      ? 'bg-gradient-to-b from-yellow-400 to-amber-500 text-white shadow active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  🔓 Unlock — {fmtMoney(breed.unlockCost)}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
