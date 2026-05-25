import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import TopBar from './components/TopBar';
import Pasture from './components/Pasture';
import Notifications from './components/Notifications';
import { OfflineModal, DailyRewardModal } from './components/Modals';
import UpgradesTab from './components/tabs/UpgradesTab';
import BreedsTab from './components/tabs/BreedsTab';
import FarmsTab from './components/tabs/FarmsTab';
import AchievementsTab from './components/tabs/AchievementsTab';
import PrestigeTab from './components/tabs/PrestigeTab';

const TABS = [
  { id: 'upgrades', label: 'Upgrades', emoji: '⬆️' },
  { id: 'breeds', label: 'Breeds', emoji: '🐮' },
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
    actions,
    derived,
  } = useGameState();

  const showDailyModal = state._dailyReady;

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden max-w-lg mx-auto relative">
      {/* Sticky top bar */}
      <TopBar state={state} />

      {/* Pasture */}
      <Pasture
        state={state}
        derived={derived}
        truckVisible={truckVisible}
        cowPop={cowPop}
        onAddCow={actions.addCow}
      />

      {/* Tab bar */}
      <div className="bg-white border-t border-gray-200 shadow-sm shrink-0">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all text-[10px] font-semibold ${
                activeTab === tab.id
                  ? 'text-green-600 border-t-2 border-green-500 bg-green-50'
                  : 'text-gray-400 border-t-2 border-transparent'
              }`}
            >
              <span className="text-lg leading-none">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === 'upgrades' && (
          <UpgradesTab state={state} onBuy={actions.buyUpgrade} />
        )}
        {activeTab === 'breeds' && (
          <BreedsTab state={state} onUnlock={actions.unlockBreed} onSwitch={actions.switchBreed} />
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

      {/* Notifications */}
      <Notifications notifications={notifications} />

      {/* Modals */}
      {offlineEarnings && (
        <OfflineModal earnings={offlineEarnings} onDismiss={dismissOffline} />
      )}
      {showDailyModal && !offlineEarnings && (
        <DailyRewardModal
          streak={state.dailyStreak || 1}
          onClaim={actions.claimDailyReward}
          onSkip={() => actions.claimDailyReward()}
        />
      )}
    </div>
  );
}
