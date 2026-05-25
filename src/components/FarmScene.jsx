import { useState, useMemo } from 'react';
import { useCowActors } from '../hooks/useCowActors';
import { getUpgradeLevel } from '../game/gameEngine';
import { fmt, fmtMoney } from '../utils/formatters';

// Stable grass tuft positions (not random on re-render)
const GRASS = Array.from({ length: 18 }, (_, i) => ({
  x: 4 + ((i * 29 + 7) % 88),
  y: 8 + ((i * 19 + 13) % 84),
  char: ['🌿', '🌱', '🌾'][i % 3],
}));

// Sky/ground palette per farm tier
const THEMES = [
  { sky: ['#87CEEB', '#C8E8F8'], ground: '#5ADE8A', groundDark: '#2EAA5A', sun: '#FCD34D', glow: 'rgba(252,211,77,0.45)' },
  { sky: ['#7EC8E3', '#D0EEF8'], ground: '#52D880', groundDark: '#28A050', sun: '#FCD34D', glow: 'rgba(252,211,77,0.45)' },
  { sky: ['#6AB8D8', '#BCDDF5'], ground: '#40CC70', groundDark: '#229040', sun: '#F59E0B', glow: 'rgba(245,158,11,0.5)' },
  { sky: ['#4A90C0', '#A8D4EE'], ground: '#36C064', groundDark: '#187840', sun: '#F59E0B', glow: 'rgba(245,158,11,0.5)' },
  { sky: ['#5C4DC0', '#9070E8'], ground: '#30B860', groundDark: '#127840', sun: '#DDB0F0', glow: 'rgba(221,176,240,0.6)' },
  { sky: ['#0EA5E9', '#90D8F8'], ground: '#50E090', groundDark: '#20A058', sun: '#FFFDE7', glow: 'rgba(255,253,231,0.7)' },
  { sky: ['#1E293B', '#3A506B'], ground: '#2D3748', groundDark: '#1A2535', sun: '#94A3B8', glow: 'rgba(148,163,184,0.4)' },
  { sky: ['#0A0A2E', '#1A1A60'], ground: '#1E1B4B', groundDark: '#0F0D30', sun: '#818CF8', glow: 'rgba(129,140,248,0.7)' },
];

// ─── Farm Scene ───────────────────────────────────────────────────────────────
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

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ height: 320, background: `linear-gradient(to bottom, ${theme.sky[0]}, ${theme.sky[1]})` }}
    >
      {/* ── Sun / Moon ── */}
      <div
        className="absolute rounded-full"
        style={{
          right: 22, top: 14, width: 38, height: 38,
          background: `radial-gradient(circle at 35% 35%, #fff8dc, ${theme.sun})`,
          boxShadow: `0 0 0 6px ${theme.glow}, 0 0 30px 12px ${theme.glow}`,
        }}
      />

      {/* ── Clouds ── */}
      <FarmCloud x={6}  y={7}  w={72} speed={26} delay={0}   opacity={0.88} />
      <FarmCloud x={35} y={13} w={52} speed={38} delay={-14} opacity={0.72} />
      <FarmCloud x={66} y={5}  w={88} speed={50} delay={-25} opacity={0.65} />

      {/* ── Far Hills ── */}
      <Hills farmTier={farmTier} />

      {/* ── Ground base (fills horizon → bottom) ── */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '47%', bottom: 0,
          background: `linear-gradient(to bottom, ${theme.ground}, ${theme.groundDark})`,
        }}
      />

      {/* ── Buildings ── */}
      <div
        className="absolute left-0 right-0 flex items-end justify-between"
        style={{ bottom: '36%', paddingLeft: 10, paddingRight: 10, zIndex: 5 }}
      >
        {/* Left side */}
        <div className="flex items-end gap-2">
          <Barn stage={barnStage} farmTier={farmTier} />
          {farmTier >= 1 && <FarmHouse farmTier={farmTier} />}
          {farmTier >= 4 && <RobotArm />}
        </div>

        {/* Right side: milk tanks + silo */}
        <div className="flex items-end gap-1.5">
          {farmTier >= 2 && <Silo farmTier={farmTier} />}
          {Array.from({ length: tankCount }).map((_, i) => (
            <MilkTank key={i} fillPct={milkPct} sizeIdx={tankSz} />
          ))}
        </div>
      </div>

      {/* ── Dirt road ── */}
      <div
        className="absolute left-0 right-0"
        style={{ top: '57%', height: 28, zIndex: 6 }}
      >
        {/* Road surface */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #C49A6C, #B8895A)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: '#8B6040' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: '#8B6040' }} />

        {/* Scrolling dashed center line */}
        <div
          className="absolute left-0 right-0"
          style={{ top: '50%', transform: 'translateY(-50%)', height: 2, overflow: 'hidden' }}
        >
          <div style={{ width: '200%', height: '100%', animation: 'road-scroll 0.9s linear infinite', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 18px, transparent 18px, transparent 38px)' }} />
        </div>

        {/* Continuous empty truck (left → right, lighter) */}
        <div
          className="absolute flex items-center"
          style={{ top: 2, height: 24, animation: 'truck-cycle-right 14s linear infinite' }}
        >
          <span style={{ fontSize: 20, filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.35))', opacity: 0.75 }}>🚛</span>
        </div>

        {/* Delivery truck (right → left, full load) */}
        {truckVisible && (
          <div
            className="absolute right-0 flex items-center gap-1"
            style={{ top: 2, height: 24, animation: 'truck-deliver 3s linear forwards' }}
          >
            <span
              className="text-[10px] font-black text-green-800 bg-green-200/90 backdrop-blur-sm px-1.5 rounded-full shadow"
              style={{ transform: 'scaleX(-1)' }}
            >
              💰 Sold!
            </span>
            <span style={{ fontSize: 20, transform: 'scaleX(-1)', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.35))' }}>🚛</span>
          </div>
        )}
      </div>

      {/* ── Fence ── */}
      <FenceRow gateOpen={gateOpen} theme={theme} />

      {/* ── Pasture (cows live here) ── */}
      <div
        className="absolute left-0 right-0"
        style={{ top: '68%', bottom: 0, zIndex: 4 }}
      >
        {/* Grass texture */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${theme.ground}, ${theme.groundDark})` }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(120deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 22px)' }} />
        </div>

        {/* Grass tufts */}
        {GRASS.map((g, i) => (
          <div key={i} className="absolute pointer-events-none" style={{ left: `${g.x}%`, top: `${g.y}%`, fontSize: 9, zIndex: 1 }}>{g.char}</div>
        ))}

        {/* Cows */}
        {actors.map((actor) => (
          <CowSprite key={actor.id} actor={actor} emoji={cowType.emoji} />
        ))}
      </div>

      {/* ── Add Cow gate button ── */}
      <button
        onClick={handleAddCow}
        disabled={!canAdd}
        className={`absolute z-20 flex flex-col items-center gap-0.5 rounded-xl font-black text-[9px] leading-tight transition-all active:scale-90 ${
          canAdd
            ? 'bg-white/95 text-green-800 shadow-lg border-2 border-green-400'
            : 'bg-black/30 text-white/40 cursor-not-allowed border border-white/20'
        }`}
        style={{ left: 8, top: '63%', transform: 'translateY(-50%)', padding: '5px 8px', backdropFilter: 'blur(4px)' }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>{cowType.emoji}</span>
        <span className="font-black text-[9px]">ADD COW</span>
        <span className="font-normal opacity-65 text-[8px]">
          {state.cows >= state.maxCows ? 'BARN FULL' : `$${fmt(nextCowCost)}`}
        </span>
      </button>

      {/* ── Milk storage bar (bottom strip) ── */}
      <div
        className="absolute left-0 right-0 z-10"
        style={{ bottom: 0, height: 18, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${milkPct * 100}%`,
            background: `linear-gradient(to right, ${cowType.glowColor?.replace('0.4', '0.6') || 'rgba(96,165,250,0.6)'}, ${cowType.glowColor?.replace('0.4', '0.9') || 'rgba(96,165,250,0.9)'})`,
          }}
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function FarmCloud({ x, y, w, speed, delay, opacity }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, animation: `cloud-drift ${speed}s linear ${delay}s infinite`, opacity }}
    >
      <div className="relative" style={{ width: w, height: w * 0.45 }}>
        <div className="absolute rounded-full bg-white" style={{ width: '60%', height: '80%', left: '0%', top: '20%' }} />
        <div className="absolute rounded-full bg-white" style={{ width: '75%', height: '100%', left: '15%', top: '0%' }} />
        <div className="absolute rounded-full bg-white" style={{ width: '55%', height: '75%', left: '42%', top: '25%' }} />
      </div>
    </div>
  );
}

function Hills({ farmTier }) {
  const fill1 = farmTier >= 6 ? '#2D3748' : farmTier >= 4 ? '#3D6B50' : '#3DBB6A';
  const fill2 = farmTier >= 6 ? '#1A2535' : farmTier >= 4 ? '#2D5040' : '#2DAA58';
  return (
    <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '28%', height: '25%' }}>
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <ellipse cx={70}  cy={90} rx={140} ry={75} fill={fill2} opacity={0.55} />
        <ellipse cx={240} cy={95} rx={180} ry={80} fill={fill2} opacity={0.5}  />
        <ellipse cx={370} cy={92} rx={110} ry={68} fill={fill2} opacity={0.55} />
        <ellipse cx={110} cy={95} rx={160} ry={70} fill={fill1} opacity={0.75} />
        <ellipse cx={310} cy={98} rx={150} ry={65} fill={fill1} opacity={0.7}  />
      </svg>
    </div>
  );
}

// ─── Barn ─────────────────────────────────────────────────────────────────────
function Barn({ stage, farmTier }) {
  const W = [78, 108, 144][stage];
  const H = [54, 76, 102][stage];
  const RH = [30, 42, 56][stage];
  const roofColor = farmTier >= 4 ? '#4B0082' : '#8B0000';
  const bodyColor = farmTier >= 4 ? '#6A0DAD' : farmTier >= 2 ? '#CC2222' : '#CC3333';

  return (
    <div className="flex flex-col items-center" style={{ position: 'relative' }}>
      {/* Weathervane */}
      {stage >= 1 && (
        <div className="absolute" style={{ top: -14, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 1, height: 12, background: '#888', margin: '0 auto' }} />
          <div style={{ fontSize: 10, animation: 'weathervane 8s linear infinite', display: 'block', textAlign: 'center' }}>🌬️</div>
        </div>
      )}
      {/* Roof */}
      <div style={{ width: 0, height: 0, borderLeft: `${W / 2}px solid transparent`, borderRight: `${W / 2}px solid transparent`, borderBottom: `${RH}px solid ${roofColor}` }} />
      {/* Roof ridge */}
      <div style={{ width: W * 0.12, height: 4, background: '#444', marginTop: -4, zIndex: 1 }} />
      {/* Body */}
      <div className="relative" style={{ width: W, height: H, backgroundColor: bodyColor }}>
        {/* Vertical board lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0" style={{ left: `${(i + 1) * (W / 6)}px`, width: 1, background: 'rgba(0,0,0,0.15)' }} />
        ))}
        {/* White X trim */}
        <div className="absolute top-1 left-1 right-1 h-px bg-white opacity-30" />
        {/* Left window */}
        <div className="absolute bg-amber-100 border border-amber-900" style={{ width: 11, height: 11, top: 8, left: 7, borderRadius: 2 }}>
          <div className="absolute inset-0 border-r border-b border-amber-900/40" style={{ borderWidth: '0 1px 1px 0' }} />
        </div>
        {/* Right window */}
        {stage >= 1 && (
          <div className="absolute bg-amber-100 border border-amber-900" style={{ width: 11, height: 11, top: 8, right: 7, borderRadius: 2 }}>
            <div className="absolute inset-0" style={{ borderRight: '1px solid rgba(180,100,0,0.4)', borderBottom: '1px solid rgba(180,100,0,0.4)' }} />
          </div>
        )}
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: W * 0.22, height: H * 0.48, backgroundColor: '#3D1A00', borderRadius: `${W * 0.11}px ${W * 0.11}px 0 0` }}>
          <div className="absolute inset-y-0" style={{ left: '48%', width: 1, background: 'rgba(255,255,255,0.15)' }} />
        </div>
        {/* Large barn loft door */}
        {stage >= 2 && (
          <div className="absolute" style={{ width: W * 0.25, height: H * 0.22, top: H * 0.15, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#2A1000', borderRadius: 3 }} />
        )}
      </div>
      {/* Foundation */}
      <div style={{ width: W + 10, height: 6, background: 'linear-gradient(to bottom, #9B8560, #7A6240)', borderRadius: '0 0 4px 4px' }} />
    </div>
  );
}

// ─── FarmHouse ────────────────────────────────────────────────────────────────
function FarmHouse({ farmTier }) {
  const fancy = farmTier >= 3;
  return (
    <div className="flex flex-col items-center" style={{ position: 'relative' }}>
      {/* Chimney */}
      <div className="absolute" style={{ right: 8, top: -16, width: 5, height: 16, background: '#8B7355' }}>
        <div className="absolute" style={{ top: -6, left: -2, width: 9, height: 4, background: '#6B5335' }} />
        {/* Smoke puffs */}
        <div style={{ position: 'absolute', top: -14, left: 1, width: 6, height: 6, borderRadius: '50%', background: 'rgba(200,200,200,0.6)', animation: 'smoke 2.5s ease-out infinite' }} />
        <div style={{ position: 'absolute', top: -14, left: -1, width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,200,200,0.5)', animation: 'smoke 2.5s ease-out 1.2s infinite' }} />
      </div>
      {/* Roof */}
      <div style={{ width: 0, height: 0, borderLeft: '24px solid transparent', borderRight: '24px solid transparent', borderBottom: `22px solid ${fancy ? '#5B3A8A' : '#8B4513'}` }} />
      {/* Body */}
      <div className="relative" style={{ width: 48, height: 34, background: fancy ? '#F0E6FF' : '#FFF8E7', border: `1px solid ${fancy ? '#C084FC' : '#D4B896'}` }}>
        {/* Door */}
        <div style={{ position: 'absolute', bottom: 0, left: 4, width: 10, height: 16, background: '#8B4513', borderRadius: '4px 4px 0 0' }} />
        {/* Window */}
        <div style={{ position: 'absolute', top: 5, right: 5, width: 13, height: 12, background: '#BAE6FD', border: '1.5px solid #93C5FD', borderRadius: 2 }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.2)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.2)' }} />
        </div>
      </div>
      {/* Foundation */}
      <div style={{ width: 56, height: 4, background: '#9B8560', borderRadius: '0 0 3px 3px' }} />
    </div>
  );
}

// ─── MilkTank ─────────────────────────────────────────────────────────────────
function MilkTank({ fillPct, sizeIdx }) {
  const W = [34, 44, 56][sizeIdx];
  const H = [48, 66, 86][sizeIdx];
  const DH = [14, 18, 24][sizeIdx];

  return (
    <div className="flex flex-col items-center">
      {/* Dome */}
      <div style={{ width: W, height: DH, background: 'linear-gradient(to bottom, #E2E8F0, #CBD5E0)', borderRadius: `${W / 2}px ${W / 2}px 0 0`, border: '1.5px solid #A0AEC0', borderBottom: 'none' }}>
        <div style={{ position: 'absolute', top: 3, left: 4, width: 5, height: DH - 4, borderRadius: 3, background: 'rgba(255,255,255,0.5)' }} />
      </div>
      {/* Body */}
      <div className="relative overflow-hidden" style={{ width: W, height: H, background: '#EDF2F7', border: '1.5px solid #A0AEC0', borderTop: 'none' }}>
        {/* Fill level (blue liquid) */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
          style={{ height: `${Math.max(2, fillPct * 100)}%`, background: 'linear-gradient(to top, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%)', opacity: 0.85 }}
        />
        {/* Horizontal ring seams */}
        {[25, 50, 75].map((p) => (
          <div key={p} className="absolute left-0 right-0" style={{ top: `${p}%`, height: 1.5, background: 'rgba(160,174,192,0.6)', zIndex: 2 }} />
        ))}
        {/* Reflection stripe */}
        <div className="absolute top-0 bottom-0" style={{ left: 3, width: 3, background: 'rgba(255,255,255,0.4)', borderRadius: 2, zIndex: 3 }} />
      </div>
      {/* Legs */}
      <div className="flex" style={{ gap: 6, paddingTop: 1 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 2.5, height: 7, background: '#718096', borderRadius: 1 }} />
        ))}
      </div>
      {/* Base platform */}
      <div style={{ width: W + 10, height: 4, background: '#4A5568', borderRadius: '0 0 3px 3px' }} />
    </div>
  );
}

// ─── Silo ─────────────────────────────────────────────────────────────────────
function Silo({ farmTier }) {
  const tall = farmTier >= 5;
  const W = tall ? 22 : 18;
  const H = tall ? 72 : 54;
  return (
    <div className="flex flex-col items-center">
      {/* Cone cap */}
      <div style={{ width: 0, height: 0, borderLeft: `${W / 2 + 4}px solid transparent`, borderRight: `${W / 2 + 4}px solid transparent`, borderBottom: `${W * 0.6}px solid #9CA3AF` }} />
      {/* Body */}
      <div style={{ width: W, height: H, background: 'linear-gradient(to right, #D1D5DB, #9CA3AF, #D1D5DB)', border: '1.5px solid #6B7280', borderRadius: `0 0 ${W / 2}px ${W / 2}px`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 3, width: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
        {[20, 45, 70].map((p) => (
          <div key={p} style={{ position: 'absolute', left: 0, right: 0, top: `${p}%`, height: 1.5, background: 'rgba(100,110,120,0.35)' }} />
        ))}
      </div>
      <div style={{ width: W + 8, height: 4, background: '#4B5563', borderRadius: '0 0 3px 3px' }} />
    </div>
  );
}

// ─── Robot arm (tier 4+) ──────────────────────────────────────────────────────
function RobotArm() {
  return (
    <div className="relative flex flex-col items-center" style={{ width: 28, height: 48 }}>
      <div style={{ width: 8, height: 30, background: '#6366F1', borderRadius: 4, position: 'absolute', bottom: 4, left: 10 }} />
      <div style={{ width: 20, height: 6, background: '#818CF8', borderRadius: 3, position: 'absolute', bottom: 22, left: 2, animation: 'robot-arm 3s ease-in-out infinite', transformOrigin: 'right center' }} />
      <div style={{ width: 6, height: 6, background: '#C7D2FE', borderRadius: '50%', position: 'absolute', bottom: 20, left: 0, boxShadow: '0 0 6px 2px rgba(99,102,241,0.5)' }} />
      <div style={{ width: 14, height: 4, background: '#4338CA', borderRadius: 2, position: 'absolute', bottom: 0, left: 7 }} />
    </div>
  );
}

// ─── Fence ────────────────────────────────────────────────────────────────────
function FenceRow({ gateOpen, theme }) {
  const posts = Array.from({ length: 22 });
  return (
    <div className="absolute left-0 right-0 z-10" style={{ top: '66%', height: 18 }}>
      {/* Rail top */}
      <div className="absolute left-0 right-0" style={{ top: 3, height: 3, background: '#F5F0E8', borderRadius: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
      {/* Rail bottom */}
      <div className="absolute left-0 right-0" style={{ top: 10, height: 3, background: '#E8E0D0', borderRadius: 1 }} />
      {/* Posts */}
      {posts.map((_, i) => {
        const pct = (i / (posts.length - 1)) * 100;
        const isGate = pct < 11; // first two slots = gate
        if (isGate && gateOpen) {
          // Swing gate post to side
          return (
            <div key={i} className="absolute" style={{ left: `${pct}%`, top: -1, width: 5, height: 20, background: '#D4C9B0', borderRadius: 2, transform: 'rotate(60deg)', transformOrigin: 'bottom center', opacity: 0.6 }} />
          );
        }
        return (
          <div key={i} className="absolute" style={{ left: `${pct}%`, top: -1, width: 5, height: 20, background: '#E8DFC8', borderRadius: 2, boxShadow: '1px 0 0 rgba(0,0,0,0.1)' }} />
        );
      })}
      {/* Gate label */}
      <div className="absolute" style={{ left: 14, top: -11, fontSize: 8, fontWeight: 700, color: gateOpen ? '#22c55e' : 'rgba(255,255,255,0.55)' }}>
        {gateOpen ? '▲ OPEN' : 'GATE'}
      </div>
    </div>
  );
}

// ─── Cow sprite ────────────────────────────────────────────────────────────────
function CowSprite({ actor, emoji }) {
  const isMoving = actor.state !== 'graze';
  const delay = (actor.id % 9) * 0.28;
  return (
    // Position layer — handles x/y movement
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${actor.x}%`,
        top: `${actor.y}%`,
        transition: isMoving ? 'left 0.1s linear, top 0.1s linear' : 'none',
        zIndex: Math.floor(actor.y),
      }}
    >
      {/* Transform layer — handles facing/scale/graze bob (separate from position) */}
      <div
        style={{
          transform: `scaleX(${actor.facing === 'left' ? -1 : 1}) scale(${actor.scale})`,
          transformOrigin: 'center bottom',
          fontSize: 20,
          filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))',
          animation: actor.state === 'graze' ? `cow-graze 1.6s ease-in-out ${delay}s infinite` : undefined,
          position: 'relative',
        }}
      >
        {emoji}
        {actor.state === 'graze' && (
          <span
            className="absolute"
            style={{ fontSize: 8, top: -7, right: -5, transform: `scaleX(${actor.facing === 'left' ? -1 : 1})` }}
          >
            🌿
          </span>
        )}
      </div>
    </div>
  );
}
