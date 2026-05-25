import { COW_BREEDS, FARM_TIERS, UPGRADES } from './gameData';

export function getBreed(id) {
  return COW_BREEDS.find((b) => b.id === id) || COW_BREEDS[0];
}

export function getFarm(id) {
  return FARM_TIERS[id] || FARM_TIERS[0];
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
  return state.upgrades[id] || 0;
}

export function calcMilkPerSecond(state) {
  const breed = getBreed(state.activeBreed);
  const baseMPS = state.cows * breed.milkPerSecond;

  const feedLevel = getUpgradeLevel(state, 'better_feed');
  const feedMult = Math.pow(1.5, feedLevel);

  const robotLevel = getUpgradeLevel(state, 'robotic_milker');
  const robotMult = Math.pow(2, robotLevel);

  const prestigeMult = 1 + state.prestigeCount * 0.15;

  return baseMPS * feedMult * robotMult * prestigeMult;
}

export function calcMaxCows(state) {
  const farm = getFarm(state.currentFarm);
  const barnLevel = getUpgradeLevel(state, 'bigger_barn');
  return farm.maxCows + barnLevel * 5;
}

export function calcMilkStorage(state) {
  const base = 100 + state.currentFarm * 300;
  const tankLevel = getUpgradeLevel(state, 'larger_tank');
  return Math.floor(base * Math.pow(1.5, tankLevel));
}

export function calcMilkPrice(state) {
  const base = 1 + state.currentFarm * 0.8;
  const brandLevel = getUpgradeLevel(state, 'premium_brand');
  const brandMult = 1 + brandLevel * 0.5;
  const prestigeMult = 1 + state.prestigeCount * 0.1;
  return base * brandMult * prestigeMult;
}

export function calcTruckDelivery(state) {
  const base = 30 + state.currentFarm * 50;
  const speedLevel = getUpgradeLevel(state, 'faster_trucks');
  const speedMult = 1 + speedLevel * 0.5;
  const intervalMs = Math.max(4000, 15000 / speedMult);
  return { amount: base, intervalMs };
}

export function calcNextCowCost(state) {
  const base = 5 + state.currentFarm * 15;
  return Math.ceil(base * Math.pow(1.12, state.cows - 1));
}

export function calcAutoHerderInterval(level) {
  return Math.max(15, 60 - level * 5) * 1000;
}

export function calcPrestigeRequired(prestigeCount) {
  return Math.pow(10, 6 + prestigeCount);
}

export function calcOfflineEarnings(savedState) {
  const now = Date.now();
  const elapsed = Math.min((now - savedState.lastActive) / 1000, 4 * 3600);
  if (elapsed < 5) return null;

  const mps = calcMilkPerSecond(savedState);
  const milkEarned = mps * elapsed;

  const { amount, intervalMs } = calcTruckDelivery(savedState);
  const deliveries = Math.floor(elapsed / (intervalMs / 1000));
  const milkSold = Math.min(milkEarned, deliveries * amount);
  const moneyEarned = milkSold * calcMilkPrice(savedState);

  return {
    elapsed,
    milkEarned,
    moneyEarned,
    milkSold,
  };
}
