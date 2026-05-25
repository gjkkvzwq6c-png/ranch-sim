import { COW_TYPES } from '../../game/gameData';
import { fmtMoney, fmt } from '../../utils/formatters';

export default function CowEvolutionTab({ state, derived, onEvolve }) {
  const { cowType, nextCowType } = derived;
  const evolutionCost = nextCowType?.unlockCost ?? Infinity;
  const canEvolve = nextCowType && state.money >= evolutionCost;

  // Progress toward evolution (based on money)
  const moneyPct = nextCowType
    ? Math.min(1, state.money / evolutionCost)
    : 1;

  return (
    <div className="p-3 space-y-4">
      {/* Current cow — large hero card */}
      <div className={`rounded-2xl bg-gradient-to-br ${cowType.bgGradient} p-0.5 shadow-lg`}>
        <div className="bg-white rounded-2xl p-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Current Breed
          </div>
          <div className="flex items-center gap-4">
            <div className="text-7xl leading-none drop-shadow-sm">{cowType.emoji}</div>
            <div className="flex-1">
              <div className="font-black text-gray-800 text-lg leading-tight">{cowType.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 italic">"{cowType.flavorText}"</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <MiniStat icon={cowType.resourceEmoji} label="Value / unit" value={`$${fmt(cowType.valuePerUnit)}`} />
                <MiniStat icon="⚡" label="Production" value={`${cowType.productionRate}/cow/s`} />
                <MiniStat icon="💰" label="Total earn rate" value={`$${fmt(state.milkPerSecond * (state.milk > 0 ? 1 : 0))}/s`} />
                <MiniStat icon={cowType.resourceEmoji} label="Resource" value={cowType.resourceName} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution target */}
      {nextCowType ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Evolution</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div
            className={`rounded-2xl border-2 overflow-hidden transition-all ${
              canEvolve ? `${nextCowType.border} shadow-lg` : 'border-gray-200'
            }`}
          >
            {/* Preview gradient header */}
            <div
              className={`bg-gradient-to-br ${nextCowType.bgGradient} p-4 flex items-center gap-4`}
              style={{ opacity: canEvolve ? 1 : 0.7 }}
            >
              <div className={`text-7xl leading-none drop-shadow-lg ${!canEvolve && 'grayscale opacity-60'}`}>
                {nextCowType.emoji}
              </div>
              <div className="flex-1">
                <div className="font-black text-white text-lg drop-shadow leading-tight">
                  {nextCowType.name}
                </div>
                <div className="text-white/80 text-xs mt-0.5">
                  {nextCowType.description}
                </div>
                {nextCowType.resource !== cowType.resource && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-[10px] font-bold">
                    🔄 New resource: {nextCowType.resourceEmoji} {nextCowType.resourceName}
                  </div>
                )}
              </div>
            </div>

            {/* Stats comparison */}
            <div className="bg-white p-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <CompareRow
                  label={`${nextCowType.resourceEmoji} Value / unit`}
                  from={`$${fmt(cowType.valuePerUnit)}`}
                  to={`$${fmt(nextCowType.valuePerUnit)}`}
                  multiplier={nextCowType.valuePerUnit / cowType.valuePerUnit}
                />
                <CompareRow
                  label="⚡ Production / cow"
                  from={cowType.productionRate}
                  to={nextCowType.productionRate}
                  multiplier={nextCowType.productionRate / cowType.productionRate}
                />
              </div>

              {/* Money progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-500">Progress to evolution</span>
                  <span className={canEvolve ? 'text-green-600' : 'text-gray-600'}>
                    {fmtMoney(state.money)} / {fmtMoney(evolutionCost)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      canEvolve
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : 'bg-gradient-to-r from-blue-300 to-blue-500'
                    }`}
                    style={{ width: `${moneyPct * 100}%` }}
                  />
                </div>
              </div>

              {/* Evolve button */}
              <button
                onClick={onEvolve}
                disabled={!canEvolve}
                className={`w-full py-4 rounded-xl font-black text-base transition-all ${
                  canEvolve
                    ? `bg-gradient-to-b ${nextCowType.bgGradient} text-white shadow-lg active:scale-95`
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canEvolve ? (
                  <>
                    ✨ EVOLVE TO {nextCowType.name.toUpperCase()}!
                    <div className="text-xs font-normal opacity-80 mt-0.5">
                      All cows transform — {fmtMoney(evolutionCost)}
                    </div>
                  </>
                ) : (
                  <>
                    🔒 {nextCowType.name}
                    <div className="text-xs font-normal mt-0.5">
                      Need {fmtMoney(evolutionCost - state.money)} more
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🌌</div>
          <div className="font-bold text-gray-700">Maximum Evolution Reached!</div>
          <div className="text-sm text-gray-500 mt-1">You rule the Galactic Moo Empire.</div>
        </div>
      )}

      {/* Full progression timeline */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Full Evolution Path
        </div>
        <div className="space-y-1.5">
          {COW_TYPES.map((ct) => {
            const isPast = ct.index < state.cowTypeIndex;
            const isCurrent = ct.index === state.cowTypeIndex;
            const isFuture = ct.index > state.cowTypeIndex;

            return (
              <div
                key={ct.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                  isCurrent
                    ? `bg-gradient-to-r ${ct.bgGradient} border-transparent text-white shadow-md`
                    : isPast
                    ? 'bg-green-50 border-green-200 opacity-60'
                    : 'bg-gray-50 border-gray-100 opacity-50'
                }`}
              >
                <div className={`text-2xl ${isFuture && 'grayscale opacity-40'}`}>{ct.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm truncate ${isCurrent ? 'text-white' : 'text-gray-700'}`}>
                    {ct.name}
                  </div>
                  <div className={`text-[10px] ${isCurrent ? 'text-white/70' : 'text-gray-400'}`}>
                    {ct.resourceEmoji} {ct.resourceName} · ${fmt(ct.valuePerUnit)}/unit
                  </div>
                </div>
                <div className="shrink-0">
                  {isPast && <span className="text-green-500 text-lg">✓</span>}
                  {isCurrent && <span className="text-white text-xs font-bold">NOW</span>}
                  {isFuture && <span className={`text-[10px] font-semibold text-gray-400`}>{fmtMoney(ct.unlockCost)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
      <div className="text-[10px] text-gray-400">{icon} {label}</div>
      <div className="text-xs font-bold text-gray-700 truncate">{value}</div>
    </div>
  );
}

function CompareRow({ label, from, to, multiplier }) {
  const isUp = multiplier >= 1;
  const mult = multiplier >= 10000
    ? `${(multiplier / 1000).toFixed(0)}K×`
    : multiplier >= 100
    ? `${multiplier.toFixed(0)}×`
    : `${multiplier.toFixed(1)}×`;

  return (
    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
      <div className="text-[10px] text-gray-400 mb-0.5">{label}</div>
      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-400 line-through">{from}</span>
        <span className="text-gray-400">→</span>
        <span className="font-bold text-gray-800">{to}</span>
      </div>
      <div className={`text-[10px] font-black mt-0.5 ${isUp ? 'text-green-600' : 'text-red-500'}`}>
        ↑ {mult} boost
      </div>
    </div>
  );
}
