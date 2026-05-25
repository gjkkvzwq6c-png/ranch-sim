import { useState, useEffect, useRef, useCallback } from 'react';
import {
  calcMilkPerSecond,
  calcMaxCows,
  calcMilkStorage,
  calcMilkPrice,
  calcTruckDelivery,
  calcNextCowCost,
  calcAutoHerderInterval,
  calcPrestigeRequired,
  calcOfflineEarnings,
  getUpgradeCost,
  getUpgradeLevel,
  getCowType,
  getNextCowType,
} from '../game/gameEngine';
import { ACHIEVEMENTS, UPGRADES, COW_TYPES, FARM_TIERS } from '../game/gameData';
import { loadState, saveState } from '../utils/storage';

const INITIAL_STATE = {
  money: 50,
  milk: 0,
  totalMilkProduced: 0,
  totalMoneyEarned: 0,
  cows: 1,
  cowTypeIndex: 0,
  currentFarm: 0,
  upgrades: {},
  achievements: {},
  prestigeCount: 0,
  lastActive: Date.now(),
  lastDailyReward: null,
  dailyStreak: 0,
  // computed (kept in state for easy reading)
  milkPerSecond: 0.5,
  maxCows: 10,
  milkStorage: 100,
};

function buildInitialState() {
  const saved = loadState();
  if (!saved) return { ...INITIAL_STATE };

  const earnings = calcOfflineEarnings(saved);
  let patched = { ...INITIAL_STATE, ...saved };
  if (earnings) {
    const maxStorage = calcMilkStorage(patched);
    patched = {
      ...patched,
      milk: Math.min(patched.milk + earnings.milkEarned - earnings.milkSold, maxStorage),
      money: patched.money + earnings.moneyEarned,
      totalMoneyEarned: (patched.totalMoneyEarned || 0) + earnings.moneyEarned,
      totalMilkProduced: (patched.totalMilkProduced || 0) + earnings.milkEarned,
      _offlineEarnings: earnings,
    };
  }
  patched.milkPerSecond = calcMilkPerSecond(patched);
  patched.maxCows = calcMaxCows(patched);
  patched.milkStorage = calcMilkStorage(patched);
  patched.lastActive = Date.now();
  return patched;
}

export function useGameState() {
  const [state, setState] = useState(buildInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [notifications, setNotifications] = useState([]);
  const [truckVisible, setTruckVisible] = useState(false);
  const [cowPop, setCowPop] = useState(0);
  const [activeTab, setActiveTab] = useState('evolve');
  const [evolutionResult, setEvolutionResult] = useState(null); // { oldType, newType }

  const offlineEarnings = state._offlineEarnings || null;

  const notify = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev.slice(-4), { id, msg, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3500);
  }, []);

  const dismissOffline = useCallback(() => {
    setState((prev) => ({ ...prev, _offlineEarnings: undefined }));
  }, []);

  // ─── Game Loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const TICK = 100;
    let truckTimer = 0;
    let herderTimer = 0;
    let saveTimer = 0;
    let achTimer = 0;

    const intervalId = setInterval(() => {
      const dt = TICK / 1000;
      const cur = stateRef.current;

      const mps = calcMilkPerSecond(cur);
      const maxStorage = calcMilkStorage(cur);
      const newMilk = Math.min(cur.milk + mps * dt, maxStorage);
      const milkAdded = newMilk - cur.milk;

      setState((prev) => ({
        ...prev,
        milk: newMilk,
        totalMilkProduced: prev.totalMilkProduced + milkAdded,
        milkPerSecond: mps,
        maxCows: calcMaxCows(prev),
        milkStorage: maxStorage,
      }));

      // Truck delivery
      truckTimer += TICK;
      const { amount, intervalMs } = calcTruckDelivery(cur);
      if (truckTimer >= intervalMs) {
        truckTimer = 0;
        if (cur.milk > 0.1) {
          const sold = Math.min(cur.milk, amount);
          const earned = sold * calcMilkPrice(cur);
          setState((prev) => ({
            ...prev,
            milk: Math.max(0, prev.milk - sold),
            money: prev.money + earned,
            totalMoneyEarned: prev.totalMoneyEarned + earned,
          }));
          setTruckVisible(true);
          setTimeout(() => setTruckVisible(false), 3000);
        }
      }

      // Auto herder
      const herderLevel = getUpgradeLevel(cur, 'auto_herder');
      if (herderLevel > 0) {
        herderTimer += TICK;
        if (herderTimer >= calcAutoHerderInterval(herderLevel)) {
          herderTimer = 0;
          setState((prev) => {
            if (prev.cows >= calcMaxCows(prev)) return prev;
            return { ...prev, cows: prev.cows + 1 };
          });
        }
      } else {
        herderTimer = 0;
      }

      // Achievements (every 500ms)
      achTimer += TICK;
      if (achTimer >= 500) {
        achTimer = 0;
        const s = stateRef.current;
        const newAch = { ...s.achievements };
        let changed = false;
        for (const ach of ACHIEVEMENTS) {
          if (!newAch[ach.id] && ach.check(s)) {
            newAch[ach.id] = Date.now();
            changed = true;
            notify(`🏆 Achievement: ${ach.name}`, 'achievement');
          }
        }
        if (changed) setState((prev) => ({ ...prev, achievements: newAch }));
      }

      // Save
      saveTimer += TICK;
      if (saveTimer >= 5000) {
        saveTimer = 0;
        saveState(stateRef.current);
      }
    }, TICK);

    return () => clearInterval(intervalId);
  }, [notify]);

  // Daily reward check
  useEffect(() => {
    const timeout = setTimeout(() => {
      const today = new Date().toDateString();
      if (stateRef.current.lastDailyReward !== today) {
        setState((prev) => ({ ...prev, _dailyReady: true }));
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const addCow = useCallback(() => {
    setState((prev) => {
      const max = calcMaxCows(prev);
      if (prev.cows >= max) return prev;
      const cost = calcNextCowCost(prev);
      if (prev.money < cost) return prev;
      setCowPop((n) => n + 1);
      return { ...prev, money: prev.money - cost, cows: prev.cows + 1 };
    });
  }, []);

  const evolveCow = useCallback(() => {
    setState((prev) => {
      const nextType = getNextCowType(prev);
      if (!nextType) return prev;
      if (prev.money < nextType.unlockCost) return prev;
      const oldType = getCowType(prev);
      // Trigger animation after state update
      setTimeout(() => setEvolutionResult({ oldType, newType: nextType }), 50);
      return {
        ...prev,
        money: prev.money - nextType.unlockCost,
        cowTypeIndex: nextType.index,
        // Reset milk on evolution — it's a new resource phase
        milk: 0,
      };
    });
  }, []);

  const dismissEvolution = useCallback(() => {
    setEvolutionResult(null);
  }, []);

  const buyUpgrade = useCallback(
    (upgradeId) => {
      setState((prev) => {
        const upgrade = UPGRADES.find((u) => u.id === upgradeId);
        if (!upgrade) return prev;
        const level = getUpgradeLevel(prev, upgradeId);
        if (level >= upgrade.maxLevel) return prev;
        const cost = getUpgradeCost(upgradeId, level);
        if (prev.money < cost) return prev;
        notify(`${upgrade.emoji} ${upgrade.name} → Lv ${level + 1}`, 'success');
        return {
          ...prev,
          money: prev.money - cost,
          upgrades: { ...prev.upgrades, [upgradeId]: level + 1 },
        };
      });
    },
    [notify]
  );

  const upgradeFarm = useCallback(
    (farmId) => {
      setState((prev) => {
        const farm = FARM_TIERS[farmId];
        if (!farm || farmId !== prev.currentFarm + 1) return prev;
        if (prev.money < farm.cost) return prev;
        notify(`🎉 Upgraded to ${farm.name}!`, 'success');
        return { ...prev, money: prev.money - farm.cost, currentFarm: farmId };
      });
    },
    [notify]
  );

  const prestige = useCallback(() => {
    const cur = stateRef.current;
    const required = calcPrestigeRequired(cur.prestigeCount);
    if (cur.totalMilkProduced < required) return;
    setState({
      ...INITIAL_STATE,
      money: 50,
      cows: 1,
      prestigeCount: cur.prestigeCount + 1,
      achievements: cur.achievements,
      lastActive: Date.now(),
      lastDailyReward: cur.lastDailyReward,
      dailyStreak: cur.dailyStreak,
      milkPerSecond: 0,
      maxCows: 10,
      milkStorage: 100,
    });
    notify('🌟 Farm sold! +15% permanent bonus per prestige!', 'success');
  }, [notify]);

  const claimDailyReward = useCallback(() => {
    setState((prev) => {
      const today = new Date().toDateString();
      if (prev.lastDailyReward === today) return { ...prev, _dailyReady: false };
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak = prev.lastDailyReward === yesterday ? (prev.dailyStreak || 0) + 1 : 1;
      const reward = Math.floor(100 * Math.pow(1.8, Math.min(streak - 1, 7)));
      notify(`🎁 Daily reward: $${reward}! (${streak}-day streak)`, 'success');
      return {
        ...prev,
        money: prev.money + reward,
        lastDailyReward: today,
        dailyStreak: streak,
        _dailyReady: false,
      };
    });
  }, [notify]);

  const resetGame = useCallback(() => {
    const fresh = { ...INITIAL_STATE, lastActive: Date.now() };
    setState(fresh);
    saveState(fresh);
  }, []);

  return {
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
    actions: { addCow, evolveCow, buyUpgrade, upgradeFarm, prestige, claimDailyReward, resetGame },
    derived: {
      nextCowCost: calcNextCowCost(state),
      prestigeRequired: calcPrestigeRequired(state.prestigeCount),
      milkPct: state.milkStorage > 0 ? Math.min(1, state.milk / state.milkStorage) : 0,
      cowPct: state.maxCows > 0 ? Math.min(1, state.cows / state.maxCows) : 0,
      cowType: getCowType(state),
      nextCowType: getNextCowType(state),
    },
  };
}
