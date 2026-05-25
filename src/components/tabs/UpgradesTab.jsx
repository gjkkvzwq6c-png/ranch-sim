import { UPGRADES } from '../../game/gameData';
import { getUpgradeCost, getUpgradeLevel } from '../../game/gameEngine';
import { fmtMoney } from '../../utils/formatters';

const CATEGORY_LABELS = {
  production: '⚡ Production',
  capacity: '📦 Capacity',
  storage: '🥛 Storage',
  sales: '💰 Sales',
  automation: '🤖 Automation',
};

const EFFECT_DESCS = {
  better_feed: (lv) => `${Math.round((Math.pow(1.5, lv) - 1) * 100)}% extra milk/cow`,
  bigger_barn: (lv) => `+${lv * 5} max cows`,
  larger_tank: (lv) => `${Math.round((Math.pow(1.5, lv) - 1) * 100)}% more storage`,
  faster_trucks: (lv) => `${(1 + lv * 0.5).toFixed(1)}x truck speed`,
  auto_herder: (lv) => `1 cow every ${Math.max(15, 60 - lv * 5)}s`,
  robotic_milker: (lv) => `${Math.pow(2, lv)}x production`,
  premium_brand: (lv) => `${(1 + lv * 0.5).toFixed(1)}x milk price`,
};

export default function UpgradesTab({ state, onBuy }) {
  const categories = {};
  for (const u of UPGRADES) {
    if (!categories[u.category]) categories[u.category] = [];
    categories[u.category].push(u);
  }

  return (
    <div className="p-3 space-y-4">
      {Object.entries(categories).map(([cat, upgrades]) => (
        <div key={cat}>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            {CATEGORY_LABELS[cat] || cat}
          </h3>
          <div className="space-y-2">
            {upgrades.map((u) => {
              const level = getUpgradeLevel(state, u.id);
              const cost = getUpgradeCost(u.id, level);
              const isMaxed = level >= u.maxLevel;
              const canAfford = state.money >= cost && !isMaxed;
              const effectDesc = EFFECT_DESCS[u.id];

              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isMaxed
                      ? 'bg-gray-100 border-gray-200 opacity-70'
                      : canAfford
                      ? 'bg-white border-green-300 shadow-sm'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="text-3xl">{u.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{u.name}</span>
                      {isMaxed ? (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 border border-yellow-300 px-1.5 rounded-full font-bold">
                          MAX
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full font-bold">
                          Lv {level}/{u.maxLevel}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{u.description}</div>
                    {level > 0 && effectDesc && (
                      <div className="text-[11px] text-green-600 font-medium mt-0.5">
                        Current: {effectDesc(level)}
                      </div>
                    )}
                    {/* Level progress bar */}
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${(level / u.maxLevel) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onBuy(u.id)}
                    disabled={!canAfford}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isMaxed
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : canAfford
                        ? 'bg-gradient-to-b from-green-400 to-green-600 text-white shadow active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isMaxed ? 'MAX' : fmtMoney(cost)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
