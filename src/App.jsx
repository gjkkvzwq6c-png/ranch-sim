import { useGameState } from './hooks/useGameState';
import TopBar from './components/TopBar';
import Pasture from './components/Pasture';
import Notifications from './components/Notifications';
import { OfflineModal, DailyRewardModal } from './components/Modals';
import CowEvolutionModal from './components/CowEvolutionModal';
import CowEvolutionTab from './components/tabs/CowEvolutionTab';
import UpgradesTab from './components/tabs/UpgradesTab';
import FarmsTab from './components/tabs/FarmsTab';
import AchievementsTab from './components/tabs/AchievementsTab';
import PrestigeTab from './components/tabs/PrestigeTab';

const TABS = [
  { id: 'evolve', label: 'Evolve', emoji: '🧬' },
  { id: 'upgrades', label: 'Upgrades', emoji: '⬆️' },
  { id: 'farms', label: 'Farms', emoji: '🏡' },
  { id: 'achievements', label: 'Awards', emoji: '🏆' },
  { id: 'prestige', label: 'Prestige', emoji: '⭐' },
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

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden max-w-lg mx-auto relative">
      <TopBar state={state} cowType={derived.cowType} />

      <Pasture
        state={state}
        derived={derived}
        truckVisible={truckVisible}
        cowPop={cowPop}
        onAddCow={actions.addCow}
      />

      {/* Tab bar */}
      <div className="bg-white border-t border-gray-200 shrink-0">
        <div className="flex">
          {TABS.map((tab) => {
            // Show pulse on Evolve tab when evolution is affordable
            const isEvolveReady =
              tab.id === 'evolve' &&
              derived.nextCowType &&
              state.money >= derived.nextCowType.unlockCost;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all text-[10px] font-semibold relative ${
                  activeTab === tab.id
                    ? 'text-green-600 border-t-2 border-green-500 bg-green-50'
                    : 'text-gray-400 border-t-2 border-transparent'
                }`}
              >
                <span className="text-lg leading-none">{tab.emoji}</span>
                <span>{tab.label}</span>
                {isEvolveReady && activeTab !== 'evolve' && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === 'evolve' && (
          <CowEvolutionTab state={state} derived={derived} onEvolve={actions.evolveCow} />
        )}
        {activeTab === 'upgrades' && (
          <UpgradesTab state={state} onBuy={actions.buyUpgrade} />
        )}
        {activeTab === 'farms' && (
          <FarmsTab state={state} onUpgrade={actions.upgradeFarm} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab state={state} />
        )}
        {activeTab === 'prestige' && (
          <PrestigeTab state={state} onPrestige={actions.prestige} onReset={actions.resetGame} />
        )}
      </div>

      <Notifications notifications={notifications} />

      {/* Evolution modal takes highest priority */}
      {evolutionResult && (
        <CowEvolutionModal evolutionResult={evolutionResult} onDismiss={dismissEvolution} />
      )}
      {offlineEarnings && !evolutionResult && (
        <OfflineModal earnings={offlineEarnings} onDismiss={dismissOffline} />
      )}
      {showDailyModal && (
        <DailyRewardModal
          streak={state.dailyStreak || 1}
          onClaim={actions.claimDailyReward}
          onSkip={actions.claimDailyReward}
        />
      )}
    </div>
  );
}
