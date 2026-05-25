import { useRef, useEffect, useState, useCallback } from 'react';
import { useCowActors } from '../hooks/useCowActors';
import { getUpgradeLevel } from '../game/gameEngine';
import { fmt } from '../utils/formatters';
import {
  THEMES, drawSky, drawHills, drawGround, drawRoad, drawFence,
  drawBarn, drawTank, drawTruck, drawCow, drawFarmhouse, drawSilo, drawRobotArm, drawCloud,
} from '../utils/farmDraw';

const CANVAS_W = 420;
const CANVAS_H = 320;

// Stable cloud positions
const CLOUDS = [
  { x: 30,  y: 28,  w: 72, speed: 0.18, alpha: 0.88 },
  { x: 160, y: 46,  w: 52, speed: 0.12, alpha: 0.72 },
  { x: 290, y: 20,  w: 88, speed: 0.09, alpha: 0.65 },
];

export default function FarmScene({ state, derived, truckVisible, onAddCow }) {
  const { cowType, nextCowCost, milkPct } = derived;
  const farmTier = state.currentFarm;
  const theme = THEMES[Math.min(farmTier, 7)];

  const barnLevel = getUpgradeLevel(state, 'bigger_barn');
  const tankLevel = getUpgradeLevel(state, 'larger_tank');
  const barnStage = barnLevel < 5 ? 0 : barnLevel < 15 ? 1 : 2;
  const tankCount = Math.min(3, 1 + Math.floor(tankLevel / 5));
  const tankSz = Math.min(2, Math.floor(tankLevel / 4));

  const { actors, addEnteringCow } = useCowActors(state.cows);
  const [gateOpen, setGateOpen] = useState(false);

  const canAdd = state.cows < state.maxCows && state.money >= nextCowCost;

  const handleAddCow = () => {
    onAddCow();
    addEnteringCow();
    setGateOpen(true);
    setTimeout(() => setGateOpen(false), 1600);
  };

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(performance.now());

  // Truck state
  const truckXRef = useRef(CANVAS_W + 40);
  const truckPhaseRef = useRef('idle'); // 'idle' | 'return' | 'deliver'
  const prevTruckVisible = useRef(false);

  // Snapshot refs for render loop (avoid stale closures)
  const stateRef = useRef({});
  stateRef.current = { actors, gateOpen, milkPct, theme, farmTier, barnStage, tankCount, tankSz, cowType, truckVisible };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function render(now) {
      const elapsed = now - startRef.current;
      const {
        actors, gateOpen, milkPct, theme, farmTier,
        barnStage, tankCount, tankSz, cowType, truckVisible,
      } = stateRef.current;

      const W = CANVAS_W;
      const H = CANVAS_H;

      ctx.clearRect(0, 0, W, H);

      // Sky
      drawSky(ctx, W, H, theme);

      // Clouds (drift left over time)
      CLOUDS.forEach((cl) => {
        const speed = cl.speed * elapsed / 1000;
        const cx = ((cl.x + speed * 30) % (W + cl.w + 40)) - cl.w;
        drawCloud(ctx, cx, cl.y, cl.w, cl.alpha);
      });

      // Hills
      drawHills(ctx, W, H, theme);

      // Ground
      drawGround(ctx, W, H, theme);

      // Buildings (behind road)
      const buildY = H * 0.575;
      // Barn
      drawBarn(ctx, 80, buildY, barnStage, farmTier);
      // Farmhouse
      if (farmTier >= 1) drawFarmhouse(ctx, 190, buildY, farmTier);
      // Robot arm
      if (farmTier >= 4) drawRobotArm(ctx, 230, buildY, elapsed);

      // Silo (right side)
      if (farmTier >= 2) drawSilo(ctx, W - 90, buildY, farmTier);
      // Milk tanks
      for (let i = 0; i < tankCount; i++) {
        const tx = W - 40 - i * (tankSz === 2 ? 62 : tankSz === 1 ? 52 : 42);
        drawTank(ctx, tx, buildY, milkPct, tankSz);
      }

      // Road
      const roadOffset = (elapsed * 0.06) % 36;
      drawRoad(ctx, W, H, roadOffset);

      // Trucks
      // Continuous empty truck (right-moving)
      const emptyTruckPeriod = 14000;
      const emptyPhase = (elapsed % emptyTruckPeriod) / emptyTruckPeriod;
      const emptyX = -50 + emptyPhase * (W + 100);
      drawTruck(ctx, emptyX, H * 0.593, false, 0.75);

      // Delivery truck trigger
      if (truckVisible && !prevTruckVisible.current) {
        truckPhaseRef.current = 'deliver';
        truckXRef.current = W + 50;
      }
      prevTruckVisible.current = truckVisible;

      if (truckPhaseRef.current === 'deliver') {
        truckXRef.current -= 2.2;
        drawTruck(ctx, truckXRef.current, H * 0.593, true, 1);
        if (truckXRef.current < -70) truckPhaseRef.current = 'idle';
      }

      // Fence
      drawFence(ctx, W, H, gateOpen);

      // Pasture ground (below fence)
      const pastureY = H * 0.675;
      const pastGrad = ctx.createLinearGradient(0, pastureY, 0, H);
      pastGrad.addColorStop(0, theme.ground);
      pastGrad.addColorStop(1, theme.groundDark);
      ctx.fillStyle = pastGrad;
      ctx.fillRect(0, pastureY, W, H - pastureY);

      // Cows sorted by depth (higher y = in front)
      const sorted = [...actors].sort((a, b) => a.y - b.y);
      const cowT = elapsed / 200; // walk phase clock
      sorted.forEach((actor) => {
        const cx = (actor.x / 100) * W;
        const cy = pastureY + ((actor.y / 100) * (H - pastureY)) * 0.82;
        const depthScale = 0.55 + (actor.y / 100) * 0.55;
        const walkPhase = cowT + actor.bobOffset;
        const isGrazing = actor.state === 'graze';
        const isMoving = actor.state !== 'graze';
        drawCow(ctx, cx, cy, actor.scale * depthScale, actor.facing, isMoving ? walkPhase : 0, isGrazing, cowType.id);
      });

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // stable render loop — reads from refs

  // Milk storage bar colors per cow type
  const barColor = cowType.glowColor
    ? cowType.glowColor.replace(/[\d.]+\)$/, '0.85)')
    : 'rgba(96,165,250,0.85)';

  return (
    <div className="relative overflow-hidden select-none" style={{ height: CANVAS_H }}>
      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
      />

      {/* Add Cow button overlay */}
      <button
        onClick={handleAddCow}
        disabled={!canAdd}
        className={`absolute z-20 flex flex-col items-center gap-0.5 rounded-xl font-black text-[9px] leading-tight transition-all active:scale-90 ${
          canAdd
            ? 'bg-white/95 text-green-800 shadow-lg border-2 border-green-400'
            : 'bg-black/30 text-white/40 cursor-not-allowed border border-white/20'
        }`}
        style={{ left: 8, top: '66%', transform: 'translateY(-50%)', padding: '5px 8px', backdropFilter: 'blur(4px)' }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>{cowType.emoji}</span>
        <span className="font-black text-[9px]">ADD COW</span>
        <span className="font-normal opacity-65 text-[8px]">
          {state.cows >= state.maxCows ? 'BARN FULL' : `$${fmt(nextCowCost)}`}
        </span>
      </button>

      {/* Milk storage bar */}
      <div
        className="absolute left-0 right-0 z-10"
        style={{ bottom: 0, height: 18, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(2px)' }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${milkPct * 100}%`, background: `linear-gradient(to right, ${barColor.replace('0.85', '0.55')}, ${barColor})` }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-white text-[9px] font-bold drop-shadow">
            {cowType.resourceEmoji} {fmt(derived.milk ?? 0)} / {fmt(derived.milkStorage ?? 100)} {cowType.resourceUnit}
          </span>
          <span className="text-white/70 text-[9px] font-semibold">
            {Math.round(milkPct * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
