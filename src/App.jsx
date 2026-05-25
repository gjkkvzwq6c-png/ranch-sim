import { useGameState } from './hooks/useGameState';
import FarmScene from './components/FarmScene';
import Notifications from './components/Notifications';
import { OfflineModal, DailyRewardModal } from './components/Modals';
import CowEvolutionModal from './components/CowEvolutionModal';
import CowEvolutionTab from './components/tabs/CowEvolutionTab';
import UpgradesTab from './components/tabs/UpgradesTab';
import FarmsTab from './components/tabs/FarmsTab';
import AchievementsTab from './components/tabs/AchievementsTab';
import PrestigeTab from './components/tabs/PrestigeTab';
import { fmtMoney, fmt } from './utils/formatters';

const TABS = [
  { id: 'evolve',       label: 'Evolve',    emoji: '🧬' },
  { id: 'upgrades',     label: 'Upgrades',  emoji: '⬆️' },
  { id: 'farms',        label: 'Farms',     emoji: '🏡' },
  { id: 'achievements', label: 'Awards',    emoji: '🏆' },
  { id: 'prestige',     label: 'Prestige',  emoji: '⭐' },
];

export default function App() {
  const {
    state,
    notifications,
    truckVisible,
    cowPop,
    activeTab,
    setActiveTab,
    offlineEarnings,
    dismissOffline,
    evolutionResult,
    dismissEvolution,
    actions,
    derived,
  } = useGameState();

  const showDailyModal = state._dailyReady && !offlineEarnings && !evolutionResult;
  const evolveReady = derived.nextCowType && state.money >= derived.nextCowType.unlockCost;

  return (
    <div className="h-screen flex flex-col overflow-hidden max-w-lg mx-auto" style={{ background: '#1a1a2e' }}>

      {/* ── Floating stats overlay (lives inside farm area visually) ── */}
      <div
        className="shrink-0 z-20 relative"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between px-3 py-1.5 gap-2">
          {/* Farm + breed label */}
          <div className="text-[9px] font-bold text-white/50 truncate max-w-[90px]">
            {derived.cowType.emoji} {derived.cowType.name}
            {state.prestigeCount > 0 && (
              <span className="ml-1 text-yellow-400">⭐P{state.prestigeCount}</span>
            )}
          </div>

          {/* Stats pills */}
          <div className="flex gap-1.5 flex-1 justify-end">
            <StatPill icon="💰" value={fmtMoney(state.money)} label="cash" color="#4ade80" />
            <StatPill icon={derived.cowType.resourceEmoji} value={fmt(state.milk)} label={derived.cowType.resourceUnit} color="#60a5fa" />
            <StatPill icon="⚡" value={`${fmt(state.milkPerSecond)}/s`} label="prod" color="#a78bfa" />
            <StatPill icon={derived.cowType.emoji} value={`${fmt(state.cows)}/${fmt(state.maxCows)}`} label="herd" color="#fbbf24" />
          </div>
        </div>
      </div>

      {/* ── Main farm scene ── */}
      <div className="shrink-0">
        <FarmScene
          state={state}
          derived={{ ...derived, milk: state.milk, milkStorage: state.milkStorage }}
          truckVisible={truckVisible}
          onAddCow={actions.addCow}
        />
      </div>

      {/* ── Bottom panel (tab bar + content) ── */}
      <div className="flex-1 flex flex-col min-h-0" style={{ background: '#f9fafb' }}>

        {/* Tab bar */}
        <div className="shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const pulse = tab.id === 'evolve' && evolveReady && !active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all ${
                    active
                      ? 'text-green-600 border-t-2 border-green-500 bg-green-50/70'
                      : 'text-gray-400 border-t-2 border-transparent'
                  }`}
                >
                  <span className="text-base leading-none">{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {pulse && (
                    <span className="absolute top-1.5 right-2.5 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow shadow-green-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'evolve'       && <CowEvolutionTab state={state} derived={derived} onEvolve={actions.evolveCow} />}
          {activeTab === 'upgrades'     && <UpgradesTab state={state} onBuy={actions.buyUpgrade} />}
          {activeTab === 'farms'        && <FarmsTab state={state} onUpgrade={actions.upgradeFarm} />}
          {activeTab === 'achievements' && <AchievementsTab state={state} />}
          {activeTab === 'prestige'     && <PrestigeTab state={state} onPrestige={actions.prestige} onReset={actions.resetGame} />}
        </div>
      </div>

      {/* ── Overlays ── */}
      <Notifications notifications={notifications} />

      {evolutionResult && <CowEvolutionModal evolutionResult={evolutionResult} onDismiss={dismissEvolution} />}
      {offlineEarnings && !evolutionResult && <OfflineModal earnings={offlineEarnings} onDismiss={dismissOffline} />}
      {showDailyModal && <DailyRewardModal streak={state.dailyStreak || 1} onClaim={actions.claimDailyReward} onSkip={actions.claimDailyReward} />}
    </div>
  );
}

function StatPill({ icon, value, label, color }) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <div className="text-right">
        <div className="text-[10px] font-bold leading-none" style={{ color }}>{value}</div>
        <div className="text-[8px] text-white/30 leading-none">{label}</div>
      </div>
    </div>
  );
}
