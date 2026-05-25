import { COW_TYPES, FARM_TIERS, UPGRADES } from './gameData';

export function getCowType(state) {
  return COW_TYPES[state.cowTypeIndex ?? 0] || COW_TYPES[0];
}

export function getNextCowType(state) {
  return COW_TYPES[(state.cowTypeIndex ?? 0) + 1] || null;
}

export function getFarm(state) {
  return FARM_TIERS[state.currentFarm ?? 0] || FARM_TIERS[0];
}

export function getUpgrade(id) {
  return UPGRADES.find((u) => u.id === id);
}

export function getUpgradeCost(upgradeId, currentLevel) {
  const u = getUpgrade(upgradeId);
  if (!u) return Infinity;
  return Math.ceil(u.baseCost * Math.pow(u.costMultiplier, currentLevel));
}

export function getUpgradeLevel(state, id) {
  return state.upgrades?.[id] || 0;
}

// ─── Core Calculations ────────────────────────────────────────────────────────

export function calcMilkPerSecond(state) {
  const cowType = getCowType(state);
  const base = (state.cows || 0) * cowType.productionRate;

  const feedLevel = getUpgradeLevel(state, 'better_feed');
  const feedMult = Math.pow(1.5, feedLevel);

  const robotLevel = getUpgradeLevel(state, 'robotic_milker');
  const robotMult = Math.pow(2, robotLevel);

  const prestigeMult = 1 + (state.prestigeCount || 0) * 0.15;

  return base * feedMult * robotMult * prestigeMult;
}

export function calcMaxCows(state) {
  const farm = getFarm(state);
  const barnLevel = getUpgradeLevel(state, 'bigger_barn');
  return farm.maxCows + barnLevel * 5;
}

export function calcMilkStorage(state) {
  const base = 100 + (state.currentFarm || 0) * 300;
  const tankLevel = getUpgradeLevel(state, 'larger_tank');
  return Math.floor(base * Math.pow(1.5, tankLevel));
}

export function calcMilkPrice(state) {
  const cowType = getCowType(state);
  const brandLevel = getUpgradeLevel(state, 'premium_brand');
  const brandMult = 1 + brandLevel * 0.5;
  const prestigeMult = 1 + (state.prestigeCount || 0) * 0.1;
  return cowType.valuePerUnit * brandMult * prestigeMult;
}

export function calcTruckDelivery(state) {
  const base = 30 + (state.currentFarm || 0) * 50;
  const speedLevel = getUpgradeLevel(state, 'faster_trucks');
  const speedMult = 1 + speedLevel * 0.5;
  const intervalMs = Math.max(4000, 15000 / speedMult);
  return { amount: base, intervalMs };
}

export function calcNextCowCost(state) {
  const base = 5 + (state.currentFarm || 0) * 15;
  return Math.ceil(base * Math.pow(1.12, (state.cows || 1) - 1));
}

export function calcAutoHerderInterval(level) {
  return Math.max(15, 60 - level * 5) * 1000;
}

export function calcPrestigeRequired(prestigeCount) {
  return Math.pow(10, 6 + (prestigeCount || 0));
}

export function calcEvolutionCost(state) {
  const next = getNextCowType(state);
  return next ? next.unlockCost : Infinity;
}

// Offline earnings calculation
export function calcOfflineEarnings(savedState) {
  const now = Date.now();
  const elapsed = Math.min((now - (savedState.lastActive || now)) / 1000, 4 * 3600);
  if (elapsed < 5) return null;

  const mps = calcMilkPerSecond(savedState);
  const milkEarned = mps * elapsed;
  const { amount, intervalMs } = calcTruckDelivery(savedState);
  const deliveries = Math.floor(elapsed / (intervalMs / 1000));
  const milkSold = Math.min(milkEarned, deliveries * amount);
  const moneyEarned = milkSold * calcMilkPrice(savedState);

  return { elapsed, milkEarned, moneyEarned, milkSold };
}
