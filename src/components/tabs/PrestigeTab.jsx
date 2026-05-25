import { calcPrestigeRequired } from '../../game/gameEngine';
import { fmt, fmtMoney } from '../../utils/formatters';

export default function PrestigeTab({ state, onPrestige, onReset }) {
  const required = calcPrestigeRequired(state.prestigeCount);
  const canPrestige = state.totalMilkProduced >= required;
  const pct = Math.min(1, state.totalMilkProduced / required);
  const currentBonus = Math.round(state.prestigeCount * 15);
  const nextBonus = Math.round((state.prestigeCount + 1) * 15);

  return (
    <div className="p-4 space-y-4">
      {/* Prestige header */}
      <div className="text-center">
        <div className="text-5xl mb-2">🌟</div>
        <h2 className="text-xl font-bold text-gray-800">Prestige</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sell your farm and start fresh with permanent bonuses.
        </p>
      </div>

      {/* Current prestige */}
      {state.prestigeCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-center">
          <div className="text-sm font-bold text-yellow-800">
            ⭐ Prestige {state.prestigeCount} — {currentBonus}% permanent bonus active
          </div>
        </div>
      )}

      {/* Progress to next prestige */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-600 font-semibold">
          <span>Total Milk Produced</span>
          <span>{fmt(state.totalMilkProduced)} / {fmt(required)}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 text-center">
          {canPrestige
            ? '✅ Ready to prestige!'
            : `${fmt((1 - pct) * required)} more milk needed`}
        </div>
      </div>

      {/* Prestige rewards */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
        <div className="text-sm font-bold text-blue-800 mb-2">Prestige Rewards:</div>
        <RewardRow emoji="⚡" text={`+${nextBonus}% permanent production bonus`} />
        <RewardRow emoji="💰" text={`+${nextBonus}% permanent income bonus`} />
        <RewardRow emoji="🏆" text="All achievements kept" />
        <RewardRow emoji="📅" text="Daily streak kept" />
        <RewardRow emoji="🔄" text="Farm & upgrades reset" />
      </div>

      {/* Prestige button */}
      <button
        onClick={onPrestige}
        disabled={!canPrestige}
        className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${
          canPrestige
            ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-white shadow-lg active:scale-95 animate-pulse-glow'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        🌟 Sell Farm & Prestige
        <div className="text-xs font-normal opacity-80 mt-0.5">
          {canPrestige ? 'Start fresh with a permanent bonus!' : `Need ${fmt(required)} total milk`}
        </div>
      </button>

      {/* Stats */}
      <div className="bg-gray-50 rounded-xl p-3 space-y-1">
        <div className="text-xs font-bold text-gray-600 mb-2">All-Time Stats</div>
        <StatRow label="Total Milk" value={`${fmt(state.totalMilkProduced)} gal`} />
        <StatRow label="Total Earned" value={fmtMoney(state.totalMoneyEarned)} />
        <StatRow label="Prestige Count" value={state.prestigeCount} />
        <StatRow label="Cows Owned" value={fmt(state.cows)} />
        <StatRow label="Daily Streak" value={`${state.dailyStreak || 0} days`} />
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 rounded-xl p-3">
        <div className="text-xs font-bold text-red-600 mb-2">⚠️ Danger Zone</div>
        <button
          onClick={() => {
            if (window.confirm('Reset ALL progress including prestige? This cannot be undone.')) {
              onReset();
            }
          }}
          className="w-full py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
}

function RewardRow({ emoji, text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-blue-700">
      <span>{emoji}</span>
      <span>{text}</span>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
}
