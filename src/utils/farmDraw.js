// Canvas drawing utilities for the farm scene

// Polyfill roundRect for browsers that don't support it (matches spec: just adds to current path)
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
    const radii = Array.isArray(r) ? r : [r];
    const tl = radii[0] ?? 0, tr = radii[1] ?? tl, br = radii[2] ?? tl, bl = radii[3] ?? tr;
    const cap = Math.min(Math.abs(w) / 2, Math.abs(h) / 2);
    const R = { tl: Math.min(tl, cap), tr: Math.min(tr, cap), br: Math.min(br, cap), bl: Math.min(bl, cap) };
    this.moveTo(x + R.tl, y);
    this.lineTo(x + w - R.tr, y);
    this.arcTo(x + w, y, x + w, y + R.tr, R.tr);
    this.lineTo(x + w, y + h - R.br);
    this.arcTo(x + w, y + h, x + w - R.br, y + h, R.br);
    this.lineTo(x + bl, y + h);
    this.arcTo(x, y + h, x, y + h - R.bl, R.bl);
    this.lineTo(x, y + R.tl);
    this.arcTo(x, y, x + R.tl, y, R.tl);
    this.closePath();
  };
}

export const THEMES = [
  { skyTop: '#87CEEB', skyBot: '#C8E8F8', ground: '#5ADE8A', groundDark: '#2EAA5A', hillA: '#3DBB6A', hillB: '#2DAA58', sun: '#FCD34D', sunGlow: 'rgba(252,211,77,0.5)' },
  { skyTop: '#7EC8E3', skyBot: '#D0EEF8', ground: '#52D880', groundDark: '#28A050', hillA: '#38B065', hillB: '#28A055', sun: '#FCD34D', sunGlow: 'rgba(252,211,77,0.5)' },
  { skyTop: '#6AB8D8', skyBot: '#BCDDF5', ground: '#40CC70', groundDark: '#229040', hillA: '#30A85A', hillB: '#208048', sun: '#F59E0B', sunGlow: 'rgba(245,158,11,0.55)' },
  { skyTop: '#4A90C0', skyBot: '#A8D4EE', ground: '#36C064', groundDark: '#187840', hillA: '#289858', hillB: '#187848', sun: '#F59E0B', sunGlow: 'rgba(245,158,11,0.55)' },
  { skyTop: '#5C4DC0', skyBot: '#9070E8', ground: '#30B860', groundDark: '#127840', hillA: '#226848', hillB: '#125838', sun: '#DDB0F0', sunGlow: 'rgba(221,176,240,0.65)' },
  { skyTop: '#0EA5E9', skyBot: '#90D8F8', ground: '#50E090', groundDark: '#20A058', hillA: '#30C870', hillB: '#20A858', sun: '#FFFDE7', sunGlow: 'rgba(255,253,231,0.75)' },
  { skyTop: '#1E293B', skyBot: '#3A506B', ground: '#2D3748', groundDark: '#1A2535', hillA: '#263344', hillB: '#1A2535', sun: '#94A3B8', sunGlow: 'rgba(148,163,184,0.4)' },
  { skyTop: '#0A0A2E', skyBot: '#1A1A60', ground: '#1E1B4B', groundDark: '#0F0D30', hillA: '#181640', hillB: '#100E28', sun: '#818CF8', sunGlow: 'rgba(129,140,248,0.75)' },
];

export const COW_COLORS = {
  basic:     { body: '#F5F0E8', spots: '#3D2010', udder: '#F4A0A0', hooves: '#2D1A08', outline: '#3D2010', horn: '#DEB887', eye: '#1A0A00', nose: '#E88080' },
  jersey:    { body: '#D4A96A', spots: '#8B5E3C', udder: '#F4B0A0', hooves: '#4A2810', outline: '#6B3D1A', horn: '#C8A050', eye: '#2A1400', nose: '#D88070' },
  holstein:  { body: '#F0F0F0', spots: '#1A1A1A', udder: '#F4A0A0', hooves: '#1A1A1A', outline: '#1A1A1A', horn: '#E0D090', eye: '#0A0A0A', nose: '#D88080' },
  angus:     { body: '#1A1A1A', spots: '#2D2D2D', udder: '#8B3030', hooves: '#0A0A0A', outline: '#333', horn: '#887755', eye: '#4A3020', nose: '#8B4040' },
  chocolate: { body: '#6B3A2A', spots: '#3D1A0A', udder: '#F4B0C0', hooves: '#2A1000', outline: '#4A2010', horn: '#C09060', eye: '#1A0800', nose: '#D08060' },
  golden:    { body: '#FFD700', spots: '#FFA500', udder: '#FFB6C1', hooves: '#B8860B', outline: '#DAA520', horn: '#FFE066', eye: '#332200', nose: '#FFAA44' },
  diamond:   { body: '#B0E8FF', spots: '#7EC8EE', udder: '#E0F0FF', hooves: '#5BA8CC', outline: '#7EC8EE', horn: '#D0F0FF', eye: '#224466', nose: '#A0D8EF' },
  cosmic:    { body: '#6A3FBF', spots: '#3D1F8A', udder: '#D090FF', hooves: '#2A1060', outline: '#9060CF', horn: '#C080FF', eye: '#1A0040', nose: '#C070EF' },
  mythic:    { body: '#FF6EB0', spots: '#CC2080', udder: '#FFB0D8', hooves: '#991060', outline: '#DD40A0', horn: '#FFD0EC', eye: '#330020', nose: '#FF80C0' },
  galactic:  { body: '#C0C0FF', spots: '#6060CC', udder: '#E0E0FF', hooves: '#4040AA', outline: '#8080EE', horn: '#FFFFF0', eye: '#001040', nose: '#A0A0FF' },
};

function getCowColors(cowTypeId) {
  return COW_COLORS[cowTypeId] || COW_COLORS.basic;
}

// Draw a cartoon cloud
export function drawCloud(ctx, x, y, w, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(200,220,255,0.4)';
  ctx.shadowBlur = 8;
  const h = w * 0.42;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.25, y + h * 0.7, w * 0.28, h * 0.5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.45, y + h * 0.45, w * 0.32, h * 0.65, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.65, y + h * 0.6, w * 0.26, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw sky gradient + sun
export function drawSky(ctx, W, H, theme) {
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.52);
  grad.addColorStop(0, theme.skyTop);
  grad.addColorStop(1, theme.skyBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.52);

  // Sun
  const sx = W - 48, sy = 28, sr = 20;
  const sunGrad = ctx.createRadialGradient(sx - 4, sy - 4, 2, sx, sy, sr);
  sunGrad.addColorStop(0, '#FFFDE7');
  sunGrad.addColorStop(1, theme.sun);
  ctx.save();
  ctx.shadowColor = theme.sunGlow;
  ctx.shadowBlur = 28;
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draw rolling hills
export function drawHills(ctx, W, H, theme) {
  const horizon = H * 0.48;

  ctx.save();
  // Back hills
  ctx.fillStyle = theme.hillB;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.bezierCurveTo(W * 0.15, horizon - 45, W * 0.3, horizon - 55, W * 0.5, horizon - 38);
  ctx.bezierCurveTo(W * 0.65, horizon - 22, W * 0.78, horizon - 50, W, horizon - 35);
  ctx.lineTo(W, horizon);
  ctx.closePath();
  ctx.fill();

  // Front hills
  ctx.fillStyle = theme.hillA;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.bezierCurveTo(W * 0.2, horizon - 30, W * 0.4, horizon - 42, W * 0.55, horizon - 28);
  ctx.bezierCurveTo(W * 0.7, horizon - 14, W * 0.85, horizon - 36, W, horizon - 22);
  ctx.lineTo(W, horizon);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw ground
export function drawGround(ctx, W, H, theme) {
  const groundTop = H * 0.48;
  const grad = ctx.createLinearGradient(0, groundTop, 0, H);
  grad.addColorStop(0, theme.ground);
  grad.addColorStop(1, theme.groundDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundTop, W, H - groundTop);
}

// Draw dirt road
export function drawRoad(ctx, W, H, roadOffset) {
  const roadY = H * 0.575;
  const roadH = 30;

  // Road surface
  const roadGrad = ctx.createLinearGradient(0, roadY, 0, roadY + roadH);
  roadGrad.addColorStop(0, '#C49A6C');
  roadGrad.addColorStop(1, '#B8895A');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, roadY, W, roadH);

  // Road edges
  ctx.strokeStyle = '#8B6040';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, roadY); ctx.lineTo(W, roadY);
  ctx.moveTo(0, roadY + roadH); ctx.lineTo(W, roadY + roadH);
  ctx.stroke();

  // Dashed center line
  const dashW = 20, gapW = 16, period = dashW + gapW;
  const midY = roadY + roadH / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  const offset = roadOffset % period;
  for (let x = -period + offset; x < W + period; x += period) {
    ctx.fillRect(x, midY - 1, dashW, 2);
  }
}

// Draw fence
export function drawFence(ctx, W, H, gateOpen) {
  const fenceY = H * 0.665;
  const postW = 5, postH = 20;
  const railTop = fenceY + 4, railBot = fenceY + 11;
  const numPosts = 22;

  // Rails
  ctx.fillStyle = '#E8DFC8';
  ctx.fillRect(0, railTop, W, 3);
  ctx.fillStyle = '#D4C9B0';
  ctx.fillRect(0, railBot, W, 3);

  // Posts
  for (let i = 0; i < numPosts; i++) {
    const px = (i / (numPosts - 1)) * W;
    const isGate = px < W * 0.11;
    ctx.save();
    if (isGate && gateOpen) {
      ctx.translate(px, fenceY + postH);
      ctx.rotate((60 * Math.PI) / 180);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#D4C9B0';
      ctx.fillRect(-postW / 2, -postH, postW, postH);
    } else {
      ctx.fillStyle = '#E8DFC8';
      ctx.fillRect(px - postW / 2, fenceY, postW, postH);
    }
    ctx.restore();
  }

  // Gate label
  ctx.font = 'bold 8px sans-serif';
  ctx.fillStyle = gateOpen ? '#22c55e' : 'rgba(255,255,255,0.55)';
  ctx.fillText(gateOpen ? '▲ OPEN' : 'GATE', 14, fenceY - 2);
}

// Draw cartoon barn
export function drawBarn(ctx, x, y, stage, farmTier) {
  const W = [78, 108, 144][stage];
  const H = [54, 76, 102][stage];
  const RH = [30, 42, 56][stage];
  const roofColor = farmTier >= 4 ? '#4B0082' : '#8B0000';
  const bodyColor = farmTier >= 4 ? '#7A1AD0' : farmTier >= 2 ? '#CC2222' : '#CC3333';

  const bx = x - W / 2;

  // Foundation
  ctx.fillStyle = '#9B8560';
  ctx.beginPath();
  ctx.roundRect(bx - 5, y, W + 10, 6, [0, 0, 4, 4]);
  ctx.fill();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(bx, y - H, W, H);

  // Board lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    const lx = bx + (i * W) / 6;
    ctx.beginPath(); ctx.moveTo(lx, y - H); ctx.lineTo(lx, y); ctx.stroke();
  }

  // White trim
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(bx + 2, y - H + 2, W - 4, 1.5);

  // Windows
  ctx.fillStyle = '#FDE68A';
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1;
  ctx.fillRect(bx + 8, y - H + 10, 13, 12);
  ctx.strokeRect(bx + 8, y - H + 10, 13, 12);
  ctx.strokeStyle = 'rgba(120,60,0,0.4)';
  ctx.beginPath(); ctx.moveTo(bx + 14, y - H + 10); ctx.lineTo(bx + 14, y - H + 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 8, y - H + 16); ctx.lineTo(bx + 21, y - H + 16); ctx.stroke();

  if (stage >= 1) {
    ctx.fillStyle = '#FDE68A';
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 1;
    ctx.fillRect(bx + W - 21, y - H + 10, 13, 12);
    ctx.strokeRect(bx + W - 21, y - H + 10, 13, 12);
  }

  // Door
  const dw = W * 0.22, dh = H * 0.48;
  const dx = bx + W / 2 - dw / 2;
  ctx.fillStyle = '#3D1A00';
  ctx.beginPath();
  ctx.roundRect(dx, y - dh, dw, dh, [dw / 2, dw / 2, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(dx + dw / 2, y - dh); ctx.lineTo(dx + dw / 2, y); ctx.stroke();

  // Loft door (stage 2)
  if (stage >= 2) {
    ctx.fillStyle = '#2A1000';
    ctx.beginPath();
    ctx.roundRect(bx + W / 2 - W * 0.125, y - H + H * 0.15, W * 0.25, H * 0.22, 2);
    ctx.fill();
  }

  // Gambrel roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(bx, y - H);
  ctx.lineTo(bx + W / 2, y - H - RH);
  ctx.lineTo(bx + W, y - H);
  ctx.closePath();
  ctx.fill();

  // Roof ridge
  ctx.fillStyle = '#222';
  ctx.fillRect(bx + W / 2 - 4, y - H - RH - 1, 8, 3);

  // Weathervane (stage 1+)
  if (stage >= 1) {
    const wx = bx + W / 2;
    const wy = y - H - RH - 14;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + 12); ctx.stroke();
    ctx.fillStyle = '#AAA';
    ctx.beginPath();
    ctx.moveTo(wx - 8, wy); ctx.lineTo(wx, wy - 4); ctx.lineTo(wx + 8, wy); ctx.lineTo(wx, wy + 4);
    ctx.closePath(); ctx.fill();
  }
}

// Draw milk tank
export function drawTank(ctx, x, y, fillPct, sizeIdx) {
  const W = [34, 44, 56][sizeIdx];
  const H = [50, 68, 88][sizeIdx];
  const DH = [14, 18, 24][sizeIdx];
  const bx = x - W / 2;

  // Legs
  ctx.strokeStyle = '#718096';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) {
    const lx = bx + W * 0.2 + i * W * 0.3;
    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx, y + 7); ctx.stroke();
  }

  // Base
  ctx.fillStyle = '#4A5568';
  ctx.beginPath();
  ctx.roundRect(bx - 4, y + 5, W + 8, 4, [0, 0, 3, 3]);
  ctx.fill();

  // Tank body
  ctx.save();
  ctx.beginPath();
  ctx.rect(bx, y - H, W, H);
  ctx.clip();

  // Body bg
  ctx.fillStyle = '#EDF2F7';
  ctx.fillRect(bx, y - H, W, H);

  // Liquid fill
  const fillH = Math.max(2, fillPct * H);
  const liqGrad = ctx.createLinearGradient(0, y, 0, y - fillH);
  liqGrad.addColorStop(0, '#2563EB');
  liqGrad.addColorStop(0.6, '#60A5FA');
  liqGrad.addColorStop(1, '#BAE6FD');
  ctx.fillStyle = liqGrad;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(bx, y - fillH, W, fillH);
  ctx.globalAlpha = 1;

  // Ring seams
  ctx.strokeStyle = 'rgba(160,174,192,0.6)';
  ctx.lineWidth = 1.5;
  for (const p of [0.25, 0.5, 0.75]) {
    const sy = y - H * p;
    ctx.beginPath(); ctx.moveTo(bx, sy); ctx.lineTo(bx + W, sy); ctx.stroke();
  }

  // Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.roundRect(bx + 3, y - H + 4, 3, H - 8, 2);
  ctx.fill();

  ctx.restore();

  // Tank outline
  ctx.strokeStyle = '#A0AEC0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, y - H, W, H);

  // Dome top
  const domeGrad = ctx.createLinearGradient(0, y - H - DH, 0, y - H);
  domeGrad.addColorStop(0, '#E2E8F0');
  domeGrad.addColorStop(1, '#CBD5E0');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - H, W / 2, DH, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#A0AEC0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y - H, W / 2, DH, 0, Math.PI, 0);
  ctx.stroke();

  // Dome shine
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.roundRect(bx + 4, y - H - DH + 3, 4, DH - 5, 2);
  ctx.fill();
}

// Draw cartoon truck (driving right = flipped for deliver-left)
export function drawTruck(ctx, x, y, facingLeft, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (facingLeft) {
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }

  const W = 64, H = 22;
  const bx = x - W / 2;
  const by = y - H;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, W * 0.55, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trailer
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = '#718096';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by + 4, W * 0.6, H - 4, [2, 2, 0, 0]);
  ctx.fill(); ctx.stroke();

  // Trailer stripe
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(bx, by + H * 0.4, W * 0.6, H * 0.18);

  // Cab
  const cabX = bx + W * 0.6;
  ctx.fillStyle = '#4A5568';
  ctx.beginPath();
  ctx.roundRect(cabX, by + 2, W * 0.38, H - 2, [4, 8, 0, 0]);
  ctx.fill(); ctx.stroke();

  // Cab window
  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.roundRect(cabX + 6, by + 4, W * 0.2, H * 0.38, [2, 5, 2, 2]);
  ctx.fill();
  ctx.strokeStyle = '#93C5FD';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Headlight
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.roundRect(bx + W - 4, by + H * 0.35, 4, 6, 1);
  ctx.fill();

  // Wheels
  for (const wx of [bx + 8, bx + W * 0.45, bx + W * 0.72]) {
    ctx.fillStyle = '#1A202C';
    ctx.beginPath();
    ctx.arc(wx, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4A5568';
    ctx.beginPath();
    ctx.arc(wx, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(wx, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw a full cartoon cow
export function drawCow(ctx, x, y, scale, facing, walkPhase, grazing, cowTypeId) {
  const c = getCowColors(cowTypeId);
  ctx.save();
  ctx.translate(x, y);
  if (facing === 'left') ctx.scale(-1, 1);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 18, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Leg animation
  const legSwing = grazing ? 0 : Math.sin(walkPhase) * 6;
  const legSwing2 = grazing ? 0 : Math.sin(walkPhase + Math.PI) * 6;

  // Legs (back first for depth)
  drawLeg(ctx, -7, 0, legSwing2, c);
  drawLeg(ctx, 7, 0, legSwing2, c);
  drawLeg(ctx, -7, 0, legSwing, c, true);
  drawLeg(ctx, 7, 0, legSwing, c, true);

  // Body (ellipse)
  const bodyGrad = ctx.createRadialGradient(-4, -8, 2, 0, -6, 18);
  bodyGrad.addColorStop(0, lighten(c.body, 30));
  bodyGrad.addColorStop(1, c.body);
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, -8, 18, 11, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Spots
  ctx.fillStyle = c.spots;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.ellipse(6, -10, 6, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-5, -6, 4, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Udder
  ctx.fillStyle = c.udder;
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(2, 0, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Tail
  const tailWag = Math.sin(walkPhase * 1.3) * 12;
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-17, -8);
  ctx.quadraticCurveTo(-24, -18 + tailWag * 0.5, -20 + tailWag * 0.4, -26 + tailWag);
  ctx.stroke();
  ctx.fillStyle = c.outline;
  ctx.beginPath();
  ctx.ellipse(-20 + tailWag * 0.4, -27 + tailWag, 3, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Head (graze = drooped down)
  const headY = grazing ? 2 : -15;
  const headAngle = grazing ? 0.6 : 0;
  ctx.save();
  ctx.translate(16, -10);
  ctx.rotate(headAngle);

  // Neck
  ctx.fillStyle = c.body;
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(4, headY);
  ctx.lineTo(10, headY);
  ctx.lineTo(8, 0);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Head blob
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(8, headY - 2, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Ear
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(4, headY - 7, 4, 3, -0.5, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = c.nose;
  ctx.beginPath();
  ctx.ellipse(4, headY - 7, 2, 1.5, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Horn
  ctx.fillStyle = c.horn;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(6, headY - 9);
  ctx.lineTo(3, headY - 17);
  ctx.lineTo(8, headY - 11);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Eye
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(12, headY - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(13, headY - 4, 1, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = c.nose;
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(16, headY, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Nostrils
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(14, headY, 1.2, 1, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, headY, 1.2, 1, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // head transform
  ctx.restore(); // main transform
}

function drawLeg(ctx, ox, oy, swing, c, front = false) {
  const lx = ox + (front ? 2 : 0);
  ctx.save();
  ctx.translate(lx, oy - 4);
  ctx.rotate((swing * Math.PI) / 180);

  // Upper leg
  ctx.fillStyle = c.body;
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-2.5, 0, 5, 8, 2);
  ctx.fill(); ctx.stroke();

  // Lower leg
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.roundRect(-2, 7, 4, 7, 2);
  ctx.fill(); ctx.stroke();

  // Hoof
  ctx.fillStyle = c.hooves;
  ctx.beginPath();
  ctx.roundRect(-2.5, 13, 5, 3.5, [0, 0, 2, 2]);
  ctx.fill();

  ctx.restore();
}

function lighten(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

// Draw small farmhouse
export function drawFarmhouse(ctx, x, y, farmTier) {
  const fancy = farmTier >= 3;
  const W = 48, H = 34, RH = 22;
  const bx = x - W / 2;

  // Foundation
  ctx.fillStyle = '#9B8560';
  ctx.beginPath();
  ctx.roundRect(bx - 4, y, W + 8, 4, [0, 0, 3, 3]);
  ctx.fill();

  // Body
  ctx.fillStyle = fancy ? '#F0E6FF' : '#FFF8E7';
  ctx.strokeStyle = fancy ? '#C084FC' : '#D4B896';
  ctx.lineWidth = 1;
  ctx.fillRect(bx, y - H, W, H);
  ctx.strokeRect(bx, y - H, W, H);

  // Door
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.roundRect(bx + 4, y - 16, 10, 16, [4, 4, 0, 0]);
  ctx.fill();

  // Window
  ctx.fillStyle = '#BAE6FD';
  ctx.strokeStyle = '#93C5FD';
  ctx.lineWidth = 1.5;
  ctx.fillRect(bx + W - 18, y - H + 6, 13, 11);
  ctx.strokeRect(bx + W - 18, y - H + 6, 13, 11);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(bx + W - 11, y - H + 6); ctx.lineTo(bx + W - 11, y - H + 17);
  ctx.moveTo(bx + W - 18, y - H + 12); ctx.lineTo(bx + W - 5, y - H + 12);
  ctx.stroke();

  // Roof
  ctx.fillStyle = fancy ? '#5B3A8A' : '#8B4513';
  ctx.beginPath();
  ctx.moveTo(bx - 4, y - H);
  ctx.lineTo(x, y - H - RH);
  ctx.lineTo(bx + W + 4, y - H);
  ctx.closePath();
  ctx.fill();

  // Chimney
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(bx + W - 14, y - H - RH + 5, 5, 16);
  ctx.fillStyle = '#6B5335';
  ctx.fillRect(bx + W - 16, y - H - RH + 3, 9, 4);

  // Smoke
  ctx.save();
  ctx.globalAlpha = 0.4 + 0.3 * Math.sin(Date.now() / 800);
  ctx.fillStyle = '#CCC';
  for (let i = 0; i < 3; i++) {
    const sy = y - H - RH + 3 - i * 7;
    const sof = Math.sin(Date.now() / 400 + i) * 3;
    ctx.beginPath();
    ctx.arc(bx + W - 11 + sof, sy, 3 + i, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Draw silo
export function drawSilo(ctx, x, y, farmTier) {
  const tall = farmTier >= 5;
  const W = tall ? 22 : 18;
  const H = tall ? 72 : 54;
  const bx = x - W / 2;

  // Foundation
  ctx.fillStyle = '#4B5563';
  ctx.beginPath();
  ctx.roundRect(bx - 4, y, W + 8, 4, [0, 0, 3, 3]);
  ctx.fill();

  // Body
  const siloGrad = ctx.createLinearGradient(bx, 0, bx + W, 0);
  siloGrad.addColorStop(0, '#D1D5DB');
  siloGrad.addColorStop(0.4, '#F3F4F6');
  siloGrad.addColorStop(1, '#9CA3AF');
  ctx.fillStyle = siloGrad;
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, y - H, W, H, [0, 0, W / 2, W / 2]);
  ctx.fill(); ctx.stroke();

  // Ring seams
  ctx.strokeStyle = 'rgba(100,110,120,0.35)';
  ctx.lineWidth = 1;
  for (const p of [0.2, 0.45, 0.7]) {
    ctx.beginPath();
    ctx.moveTo(bx, y - H * p);
    ctx.lineTo(bx + W, y - H * p);
    ctx.stroke();
  }

  // Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.roundRect(bx + 3, y - H + 4, 4, H - 8, 2);
  ctx.fill();

  // Cone cap
  ctx.fillStyle = '#9CA3AF';
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx - 4, y - H);
  ctx.lineTo(x, y - H - W * 0.65);
  ctx.lineTo(bx + W + 4, y - H);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
}

// Draw robot arm
export function drawRobotArm(ctx, x, y, t) {
  const armAngle = Math.sin(t / 800) * 0.6 - 0.2;
  ctx.save();
  ctx.translate(x, y);

  // Base
  ctx.fillStyle = '#4338CA';
  ctx.beginPath();
  ctx.roundRect(-7, -4, 14, 4, 2);
  ctx.fill();

  // Post
  ctx.fillStyle = '#6366F1';
  ctx.beginPath();
  ctx.roundRect(-4, -34, 8, 30, 4);
  ctx.fill();

  // Arm pivot
  ctx.save();
  ctx.translate(0, -26);
  ctx.rotate(armAngle);
  ctx.fillStyle = '#818CF8';
  ctx.beginPath();
  ctx.roundRect(-20, -3, 20, 6, 3);
  ctx.fill();

  // End effector
  ctx.fillStyle = '#C7D2FE';
  ctx.shadowColor = 'rgba(99,102,241,0.7)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(-20, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
