cat > /home/claude/talk-normie-2-me/app/shareCards.ts << 'TSEOF'
// Per-mode canvas share card generators
// Each returns a data URL (PNG) drawn on a 900x540 canvas

type PersonalityMode = 'normie' | 'fullnormie' | 'flirty' | 'emo' | 'bro' | 'conspiracy' | 'brainrot' | 'sporty' | 'otaku' | 'poetry';

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number): number {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line) { ctx.fillText(line, x, y); y += lineH; }
  return y;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number): number {
  const rawLines = text.split('\n');
  for (const rawLine of rawLines) {
    if (rawLine.trim() === '') { y += lineH * 0.6; continue; }
    y = wrapText(ctx, rawLine, x, y, maxW, lineH);
  }
  return y;
}

// ── POETRY — aged manuscript paper ──────────────────────────────────────────
function drawPoetry(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  // Warm parchment
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(0, 0, W, H);

  // Subtle horizontal lines
  ctx.strokeStyle = 'rgba(160,140,100,0.18)';
  ctx.lineWidth = 1;
  for (let y = 64; y < H - 40; y += 30) {
    ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 50, y); ctx.stroke();
  }

  // Left margin crease shadow
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  ctx.fillRect(0, 0, 8, H);

  // Slight page curl top-right
  ctx.save();
  ctx.translate(W, 0);
  ctx.beginPath();
  ctx.moveTo(-48, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, 48);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fill();
  ctx.restore();

  // App name — top left, very small caps
  ctx.font = '500 11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(140,120,80,0.7)';
  ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME  ·  🪶 POETRY', 60, 44);

  // Repo name — medium weight serif
  ctx.font = 'italic 500 20px Georgia, serif';
  ctx.fillStyle = '#2a1e0a';
  ctx.fillText(repoName, 60, 90);

  // Thin rule under repo name
  ctx.strokeStyle = 'rgba(140,120,80,0.3)';
  ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(60, 100); ctx.lineTo(W - 60, 100); ctx.stroke();

  // Hook text — italic Georgia, generous leading
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillStyle = '#2e2010';
  wrapLines(ctx, hook, 60, 138, W - 130, 32);

  // Ink smear decoration — bottom right
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath();
  ctx.ellipse(W - 100, H - 60, 32, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W - 85, H - 55, 14, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Fountain pen nib glyph
  ctx.font = '22px serif';
  ctx.globalAlpha = 0.2;
  ctx.fillText('✒', W - 80, H - 40);
  ctx.globalAlpha = 1;

  // URL — bottom, typewriter
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(130,110,70,0.7)';
  ctx.fillText('talk-normie-2-me.vercel.app', 60, H - 36);
}

// ── EMO — torn spiral notebook page ─────────────────────────────────────────
function drawEmo(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  // Off-white, slightly grey
  ctx.fillStyle = '#f4f4f2';
  ctx.fillRect(0, 0, W, H);

  // Faint ruled lines
  ctx.strokeStyle = 'rgba(180,180,175,0.4)';
  ctx.lineWidth = 1;
  for (let y = 60; y < H - 40; y += 28) {
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 40, y); ctx.stroke();
  }

  // Red margin line
  ctx.strokeStyle = 'rgba(200,70,70,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(96, 30); ctx.lineTo(96, H - 30); ctx.stroke();

  // Spiral holes — left edge
  ctx.fillStyle = '#e8e8e6';
  ctx.strokeStyle = 'rgba(180,180,175,0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const hy = 56 + i * (H - 80) / 6;
    ctx.beginPath(); ctx.arc(22, hy, 10, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  // Torn top edge
  ctx.fillStyle = '#f4f4f2';
  for (let x = 0; x < W; x += 12) {
    const tear = Math.sin(x * 0.3) * 4 + Math.random() * 3;
    ctx.fillRect(x, 0, 13, 8 + tear);
  }

  // Mode label
  ctx.font = '500 10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(80,80,80,0.5)';
  ctx.textAlign = 'left';
  ctx.fillText('talk normie 2 me  //  emo mode', 110, 38);

  // Repo name — slightly shaky feel
  ctx.font = '500 18px "Courier New", monospace';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(repoName, 110, 78);

  // Hook text
  ctx.font = '14px "Courier New", monospace';
  ctx.fillStyle = '#333';
  wrapLines(ctx, hook, 110, 118, W - 160, 28);

  // Doodles — stars, small cross
  ctx.font = '16px serif';
  ctx.globalAlpha = 0.15;
  ctx.fillText('✦', W - 80, 60);
  ctx.fillText('✦', W - 55, 90);
  ctx.fillText('†', W - 70, 130);
  ctx.globalAlpha = 1;

  // URL
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,120,120,0.6)';
  ctx.fillText('talk-normie-2-me.vercel.app', 110, H - 32);
}

// ── BRO — gym whiteboard / locker room flyer ─────────────────────────────────
function drawBro(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  // Black
  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, W, H);

  // Faint "PR" watermark
  ctx.font = '900 220px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.textAlign = 'center';
  ctx.fillText('PR', W / 2, H / 2 + 80);

  // Bold white border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Top accent stripe
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(16, 16, W - 32, 6);

  // W badge
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = '900 11px "Arial Black", sans-serif';
  const badge = ' 🔥 W REPO ';
  const bw = ctx.measureText(badge).width + 16;
  ctx.fillStyle = '#fff';
  ctx.fillRect(40, 40, bw, 26);
  ctx.fillStyle = '#000';
  ctx.font = '900 11px "Arial Black", sans-serif';
  ctx.fillText(badge, 40, 57);

  // Repo name
  ctx.fillStyle = '#fff';
  ctx.font = '900 26px "Arial Black", Impact, sans-serif';
  ctx.fillText(repoName.toUpperCase(), 40, 100);

  // Hook — all caps
  ctx.font = '700 13px "Arial Black", sans-serif';
  ctx.fillStyle = '#ccc';
  wrapLines(ctx, hook.toUpperCase(), 40, 138, W - 80, 26);

  // URL
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(150,150,150,0.7)';
  ctx.fillText('talk-normie-2-me.vercel.app', 40, H - 36);
}

// ── CONSPIRACY — redacted government document ────────────────────────────────
function drawConspiracy(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  // Aged yellowy white
  ctx.fillStyle = '#fefdf5';
  ctx.fillRect(0, 0, W, H);

  // Document border
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // CONFIDENTIAL watermark
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.42);
  ctx.font = '900 72px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = 'rgba(180,40,40,0.06)';
  ctx.textAlign = 'center';
  ctx.fillText('CONFIDENTIAL', 0, 20);
  ctx.restore();

  // Header bar
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(20, 20, W - 40, 44);

  ctx.textAlign = 'left';
  ctx.font = '700 10px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText('CLASSIFIED  //  EYES ONLY  //  DO NOT DISTRIBUTE', 36, 46);

  // Red CLASSIFIED stamp
  ctx.save();
  ctx.translate(W - 120, 105);
  ctx.rotate(0.08);
  ctx.strokeStyle = 'rgba(180,40,40,0.65)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-4, -20, 100, 28);
  ctx.font = '900 12px "Arial Black", sans-serif';
  ctx.fillStyle = 'rgba(180,40,40,0.65)';
  ctx.textAlign = 'center';
  ctx.fillText('CLASSIFIED', 46, -3);
  ctx.restore();

  ctx.textAlign = 'left';

  // File label
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#555';
  ctx.fillText(`FILE REF: ${repoName.toUpperCase()}`, 40, 84);

  // Thin rule
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(40, 96); ctx.lineTo(W - 40, 96); ctx.stroke();

  // Hook text with fake redactions
  const hookWords = hook.split(' ');
  const redactIdxs = new Set([
    Math.floor(hookWords.length * 0.3),
    Math.floor(hookWords.length * 0.6)
  ]);
  
  ctx.font = '13px "Courier New", monospace';
  ctx.fillStyle = '#1a1a1a';
  
  let line = '';
  let lineWords: string[] = [];
  let lineHasRedact = false;
  let y = 126;
  const maxW = W - 100;
  
  for (let i = 0; i <= hookWords.length; i++) {
    const word = hookWords[i];
    const isRedact = redactIdxs.has(i);
    const displayWord = isRedact ? '███████' : word;
    const test = line ? line + ' ' + (displayWord || '') : (displayWord || '');
    
    if ((ctx.measureText(test).width > maxW && line) || i === hookWords.length) {
      // Draw current line
      let lx = 40;
      for (let j = 0; j < lineWords.length; j++) {
        const lw = lineWords[j];
        const isR = lw === '███████';
        if (isR) {
          const tw = ctx.measureText(lw).width + 4;
          ctx.fillStyle = '#111';
          ctx.fillRect(lx - 2, y - 14, tw, 18);
          lx += tw + ctx.measureText(' ').width;
        } else {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillText(lw, lx, y);
          lx += ctx.measureText(lw + ' ').width;
        }
      }
      lineWords = displayWord ? [displayWord] : [];
      line = displayWord || '';
      y += 28;
    } else {
      line = test;
      lineWords.push(displayWord || '');
    }
  }

  // URL
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,120,100,0.7)';
  ctx.fillText('talk-normie-2-me.vercel.app', 40, H - 42);
}

// ── FLIRTY — perfumed note on fancy card stock ───────────────────────────────
function drawFlirty(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  // Blush pink
  ctx.fillStyle = '#fff8f8';
  ctx.fillRect(0, 0, W, H);

  // Subtle vignette
  const vg = ctx.createRadialGradient(W/2, H/2, 200, W/2, H/2, 600);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(180,80,100,0.06)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Border — double line, rose
  ctx.strokeStyle = 'rgba(200,130,145,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.strokeStyle = 'rgba(200,130,145,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Decorative corner flourishes
  const corners = [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]];
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = 'rgba(200,130,145,0.3)';
  ctx.textAlign = 'center';
  for (const [cx, cy] of corners) {
    ctx.fillText('✦', cx, cy + 6);
  }

  // App label
  ctx.textAlign = 'left';
  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = 'rgba(180,100,120,0.6)';
  ctx.fillText('talk normie 2 me  ·  flirty edition', 50, 50);

  // Repo name
  ctx.font = 'italic 500 22px Georgia, serif';
  ctx.fillStyle = '#441828';
  ctx.fillText(repoName, 50, 92);

  // Rule
  ctx.strokeStyle = 'rgba(200,130,145,0.35)';
  ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(50, 104); ctx.lineTo(W - 50, 104); ctx.stroke();

  // Hook text
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillStyle = '#3a1522';
  wrapLines(ctx, hook, 50, 138, W - 120, 30);

  // Lipstick kiss mark — stylised
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.translate(W - 90, H - 80);
  ctx.rotate(0.15);
  ctx.font = '52px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cc3355';
  ctx.fillText('💋', 0, 0);
  ctx.restore();

  // URL
  ctx.textAlign = 'left';
  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = 'rgba(180,100,120,0.6)';
  ctx.fillText('talk-normie-2-me.vercel.app', 50, H - 38);
}

// ── BRAINROT — chaotic meme card ─────────────────────────────────────────────
function drawBrainrot(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Random neon blobs
  const blobs = [
    { x: 80, y: 80, r: 60, c: 'rgba(255,0,200,0.08)' },
    { x: W - 100, y: 120, r: 80, c: 'rgba(0,200,255,0.08)' },
    { x: 200, y: H - 80, r: 70, c: 'rgba(100,255,0,0.07)' },
    { x: W - 60, y: H - 100, r: 50, c: 'rgba(255,200,0,0.1)' },
  ];
  for (const b of blobs) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, b.c); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  // Top bar gradient
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, 52);

  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME  🫠  BRAINROT EDITION  FR FR', 24, 33);

  // Big emoji watermark
  ctx.font = '140px serif';
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  ctx.textAlign = 'center';
  ctx.fillText('🫠', W / 2, H / 2 + 50);

  // Repo name — Impact-style
  ctx.textAlign = 'left';
  ctx.font = '900 26px system-ui, "Arial Black", sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText(repoName, 24, 100);

  // Hook text — mixed case chaos
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#111';
  wrapLines(ctx, hook, 24, 138, W - 60, 28);

  // Sticker-style badge
  ctx.save();
  ctx.translate(W - 100, H - 100);
  ctx.rotate(-0.3);
  ctx.fillStyle = '#ffe500';
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const r = i % 2 === 0 ? 42 : 30;
    i === 0 ? ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r)
             : ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
  }
  ctx.closePath(); ctx.fill();
  ctx.font = '900 9px system-ui, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText('GOATED', 0, -3);
  ctx.fillText('FR FR', 0, 9);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.font = '11px system-ui, monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText('talk-normie-2-me.vercel.app', 24, H - 32);
}

// ── SPORTY — scoreboard / press release ─────────────────────────────────────
function drawSporty(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, W, H);

  // Header bar
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 12px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME', 24, 38);
  ctx.font = '700 12px "Arial Black", sans-serif';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'right';
  ctx.fillText('🏆 SPORTY MODE', W - 24, 38);

  // Left accent bar
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 60, 8, H - 60);

  // Repo name — massive
  ctx.textAlign = 'left';
  ctx.font = '900 30px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = '#0a0a0a';
  ctx.fillText(repoName.toUpperCase(), 28, 108);

  // Underline
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(28, 118); ctx.lineTo(W - 28, 118); ctx.stroke();

  // Hook text — uppercase
  ctx.font = '800 13px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = '#222';
  wrapLines(ctx, hook.toUpperCase(), 28, 152, W - 60, 26);

  // Stats badge — bottom left
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(28, H - 72, 110, 36);
  ctx.font = '700 10px "Arial Black", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('W  ·  DEPLOYED  ·  BUILT', 36, H - 50);

  // URL
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText('talk-normie-2-me.vercel.app', 28, H - 28);
}

// ── OTAKU — manga panel ──────────────────────────────────────────────────────
function drawOtaku(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Speed lines radiating from top-right
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1.5;
  const cx = W, cy = 0;
  for (let a = Math.PI / 2; a < Math.PI * 1.4; a += 0.06) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900);
    ctx.stroke();
  }

  // Panel borders — thick manga style
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  // Inner accent line
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Speech bubble top-right
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(W - 190, 36, 160, 44, 12);
  ctx.fill(); ctx.stroke();
  // Bubble tail
  ctx.beginPath();
  ctx.moveTo(W - 170, 80); ctx.lineTo(W - 155, 96); ctx.lineTo(W - 140, 80);
  ctx.fill(); ctx.stroke();
  ctx.font = '700 10px system-ui, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ MAIN CHARACTER', W - 110, 57);
  ctx.fillText('CODED FR', W - 110, 72);

  // App label
  ctx.textAlign = 'left';
  ctx.font = '500 10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText('TALK NORMIE 2 ME  ·  OTAKU ARC', 32, 46);

  // Repo name — bold manga title
  ctx.font = '900 28px "Arial Black", system-ui, sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText(repoName, 32, 96);

  // Action line under name
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(32, 106); ctx.lineTo(W - 32, 106); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(32, 112); ctx.lineTo(W - 32, 112); ctx.stroke();

  // Hook text
  ctx.font = '700 14px system-ui, sans-serif';
  ctx.fillStyle = '#111';
  wrapLines(ctx, hook, 32, 148, W - 210, 28);

  // Power level box
  ctx.fillStyle = '#000';
  ctx.fillRect(W - 160, H - 90, 136, 54);
  ctx.font = '700 9px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('POWER LEVEL', W - 92, H - 72);
  ctx.font = '900 22px "Arial Black", sans-serif';
  ctx.fillText('9000+', W - 92, H - 50);

  ctx.textAlign = 'left';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText('talk-normie-2-me.vercel.app', 32, H - 30);
}

// ── NORMIE / FULLNORMIE — clean card ─────────────────────────────────────────
function drawNormie(ctx: CanvasRenderingContext2D, W: number, H: number, repoName: string, hook: string, full: boolean) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Header
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, 52);
  ctx.font = '500 12px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('Talk Normie 2 Me', 24, 34);
  if (full) {
    ctx.textAlign = 'right';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Full Normie mode 🧠', W - 24, 34);
  }

  ctx.textAlign = 'left';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(repoName, 24, 98);

  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(24, 110); ctx.lineTo(W - 24, 110); ctx.stroke();

  ctx.font = full ? '15px system-ui, sans-serif' : '14px system-ui, sans-serif';
  ctx.fillStyle = '#444';
  wrapLines(ctx, hook, 24, 144, W - 48, full ? 30 : 26);

  ctx.font = '11px system-ui, monospace';
  ctx.fillStyle = '#bbb';
  ctx.fillText('talk-normie-2-me.vercel.app', 24, H - 32);
}

// ── Main export ──────────────────────────────────────────────────────────────
export function generateShareCard(
  mode: PersonalityMode,
  repoName: string,
  hook: string
): Promise<string> {
  return new Promise((resolve) => {
    const W = 900, H = 540;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    switch (mode) {
      case 'poetry':     drawPoetry(ctx, W, H, repoName, hook); break;
      case 'emo':        drawEmo(ctx, W, H, repoName, hook); break;
      case 'bro':        drawBro(ctx, W, H, repoName, hook); break;
      case 'conspiracy': drawConspiracy(ctx, W, H, repoName, hook); break;
      case 'flirty':     drawFlirty(ctx, W, H, repoName, hook); break;
      case 'brainrot':   drawBrainrot(ctx, W, H, repoName, hook); break;
      case 'sporty':     drawSporty(ctx, W, H, repoName, hook); break;
      case 'otaku':      drawOtaku(ctx, W, H, repoName, hook); break;
      case 'fullnormie': drawNormie(ctx, W, H, repoName, hook, true); break;
      default:           drawNormie(ctx, W, H, repoName, hook, false); break;
    }

    resolve(canvas.toDataURL('image/png'));
  });
}
TSEOF
echo "done"
