type PersonalityMode =
  | 'normie'
  | 'fullnormie'
  | 'flirty'
  | 'emo'
  | 'bro'
  | 'conspiracy'
  | 'brainrot'
  | 'sporty'
  | 'otaku'
  | 'poetry';

type ShareCardPayload = {
  repoName: string;
  mode: PersonalityMode;
  hook: string;
  whatIsIt: string;
  example: string;
  cta: string;
  url: string;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number
): number {
  const words = text.split(' ');
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }

  if (line) {
    ctx.fillText(line, x, y);
    y += lineH;
  }

  return y;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  maxLines?: number
): number {
  const rawLines = text.split('\n');
  let linesUsed = 0;

  for (const rawLine of rawLines) {
    if (maxLines && linesUsed >= maxLines) break;

    if (rawLine.trim() === '') {
      y += lineH * 0.55;
      continue;
    }

    const words = rawLine.split(' ');
    let line = '';

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        y += lineH;
        linesUsed += 1;
        if (maxLines && linesUsed >= maxLines) return y;
        line = word;
      } else {
        line = test;
      }
    }

    if (line) {
      ctx.fillText(line, x, y);
      y += lineH;
      linesUsed += 1;
    }
  }

  return y;
}

function fitText(text: string, max = 340): string {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 3).trim()}...`;
}

function drawPaperTexture(ctx: CanvasRenderingContext2D, W: number, H: number, alpha = 0.035) {
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = Math.random() * alpha;
    ctx.fillStyle = `rgba(40,30,20,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  label: string,
  text: string,
  x: number,
  y: number,
  maxW: number,
  labelFont: string,
  bodyFont: string,
  labelColor: string,
  bodyColor: string,
  lineH: number,
  maxLines = 4
): number {
  ctx.font = labelFont;
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);
  y += 18;

  ctx.font = bodyFont;
  ctx.fillStyle = bodyColor;
  return wrapLines(ctx, text, x, y, maxW, lineH, maxLines);
}

function drawNormie(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload,
  full: boolean
) {
  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.02);

  ctx.strokeStyle = '#e7e1d8';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, 56);

  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('Talk Normie 2 Me', 26, 35);

  if (full) {
    ctx.textAlign = 'right';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fillText('Full Normie 🧠', W - 26, 35);
  }

  ctx.textAlign = 'left';
  ctx.font = '600 24px system-ui, sans-serif';
  ctx.fillStyle = '#1c1a17';
  ctx.fillText(payload.repoName, 28, 94);

  ctx.strokeStyle = '#ece6dc';
  ctx.beginPath();
  ctx.moveTo(28, 108);
  ctx.lineTo(W - 28, 108);
  ctx.stroke();

  let y = 132;

  y = drawSection(
    ctx,
    'WHAT IT IS',
    fitText(payload.whatIsIt, 230),
    28,
    y,
    W - 56,
    '700 10px system-ui, sans-serif',
    full ? '15px system-ui, sans-serif' : '14px system-ui, sans-serif',
    '#9d9386',
    '#4a433c',
    24,
    4
  );

  y += 8;

  y = drawSection(
    ctx,
    'EXAMPLE',
    fitText(payload.example, 290),
    28,
    y,
    W - 56,
    '700 10px system-ui, sans-serif',
    full ? '15px system-ui, sans-serif' : '14px system-ui, sans-serif',
    '#9d9386',
    '#2f2a25',
    24,
    5
  );

  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillStyle = '#6f655a';
  ctx.fillText(payload.cta, 28, H - 52);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#b6ada1';
  ctx.fillText(payload.url, 28, H - 30);
}

function drawPoetry(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#f6efe2';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.045);

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(90,60,20,0.04)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let y = 72; y < H - 42; y += 30) {
    ctx.strokeStyle = 'rgba(146,121,80,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(56, y);
    ctx.lineTo(W - 52, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(90,60,35,0.05)';
  ctx.fillRect(0, 0, 10, H);

  ctx.save();
  ctx.translate(W, 0);
  ctx.beginPath();
  ctx.moveTo(-58, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, 58);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(80,50,20,0.06)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(30, 24);
  ctx.quadraticCurveTo(W / 2, 6, W - 24, 28);
  ctx.stroke();
  ctx.restore();

  ctx.font = '500 11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,94,60,0.82)';
  ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME  ·  POETRY', 60, 44);

  ctx.font = 'italic 500 20px Georgia, serif';
  ctx.fillStyle = '#2c1c0d';
  ctx.fillText(payload.repoName, 60, 90);

  ctx.strokeStyle = 'rgba(140,110,70,0.32)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(60, 104);
  ctx.lineTo(W - 60, 104);
  ctx.stroke();

  let y = 132;

  y = drawSection(
    ctx,
    'what it is',
    fitText(payload.whatIsIt, 220),
    60,
    y,
    W - 120,
    '500 10px "Courier New", monospace',
    'italic 15px Georgia, serif',
    'rgba(120,94,60,0.74)',
    '#332112',
    25,
    4
  );

  y += 10;

  y = drawSection(
    ctx,
    'a line from the translation',
    fitText(payload.example, 270),
    60,
    y,
    W - 120,
    '500 10px "Courier New", monospace',
    'italic 16px Georgia, serif',
    'rgba(120,94,60,0.74)',
    '#2d1d10',
    27,
    5
  );

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#2b1608';
  ctx.beginPath();
  ctx.ellipse(W - 104, H - 66, 30, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W - 88, H - 58, 14, 3, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.translate(W - 120, 120);
  ctx.rotate(-0.12);
  ctx.font = '28px serif';
  ctx.fillStyle = '#5d2a18';
  ctx.fillText('✒', 0, 0);
  ctx.restore();

  ctx.font = 'italic 13px Georgia, serif';
  ctx.fillStyle = '#4a301b';
  ctx.fillText(payload.cta, 60, H - 54);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,94,60,0.76)';
  ctx.fillText(payload.url, 60, H - 34);
}

function drawEmo(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#f3f2ef';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.03);

  ctx.strokeStyle = 'rgba(182,182,176,0.4)';
  ctx.lineWidth = 1;
  for (let y = 62; y < H - 40; y += 28) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 42, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(185,65,65,0.34)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(98, 30);
  ctx.lineTo(98, H - 30);
  ctx.stroke();

  ctx.fillStyle = '#e7e7e4';
  ctx.strokeStyle = 'rgba(170,170,164,0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const hy = 56 + (i * (H - 90)) / 6;
    ctx.beginPath();
    ctx.arc(22, hy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.font = '500 10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(78,78,78,0.6)';
  ctx.fillText('talk normie 2 me  //  emo mode', 112, 38);

  ctx.font = '500 18px "Courier New", monospace';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(payload.repoName, 112, 76);

  let y = 104;

  y = drawSection(
    ctx,
    'what this is',
    fitText(payload.whatIsIt, 210),
    112,
    y,
    W - 164,
    '700 10px "Courier New", monospace',
    '14px "Courier New", monospace',
    'rgba(92,92,92,0.72)',
    '#363636',
    22,
    4
  );

  y += 8;

  y = drawSection(
    ctx,
    'a page from it',
    fitText(payload.example, 250),
    112,
    y,
    W - 164,
    '700 10px "Courier New", monospace',
    '14px "Courier New", monospace',
    'rgba(92,92,92,0.72)',
    '#202020',
    22,
    5
  );

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.font = '16px serif';
  ctx.fillText('✦', W - 82, 60);
  ctx.fillText('✦', W - 56, 92);
  ctx.fillText('†', W - 72, 132);
  ctx.restore();

  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#555';
  ctx.fillText(payload.cta, 112, H - 52);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(118,118,118,0.66)';
  ctx.fillText(payload.url, 112, H - 32);
}

function drawBro(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, W, H);

  ctx.font = '900 220px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.textAlign = 'center';
  ctx.fillText('PR', W / 2, H / 2 + 80);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(16, 16, W - 32, 6);

  ctx.textAlign = 'left';
  const badge = ' 🔥 W REPO ';
  ctx.font = '900 11px "Arial Black", sans-serif';
  const bw = ctx.measureText(badge).width + 16;
  ctx.fillStyle = '#fff';
  ctx.fillRect(40, 40, bw, 26);
  ctx.fillStyle = '#000';
  ctx.fillText(badge, 40, 57);

  ctx.fillStyle = '#fff';
  ctx.font = '900 26px "Arial Black", Impact, sans-serif';
  ctx.fillText(payload.repoName.toUpperCase(), 40, 96);

  let y = 122;

  y = drawSection(
    ctx,
    'WHAT IT IS',
    fitText(payload.whatIsIt, 170).toUpperCase(),
    40,
    y,
    W - 80,
    '900 10px "Arial Black", sans-serif',
    '700 13px "Arial Black", sans-serif',
    '#7d7d7d',
    '#d4d4d4',
    20,
    4
  );

  y += 8;

  y = drawSection(
    ctx,
    'SAMPLE',
    fitText(payload.example, 230).toUpperCase(),
    40,
    y,
    W - 80,
    '900 10px "Arial Black", sans-serif',
    '700 13px "Arial Black", sans-serif',
    '#7d7d7d',
    '#ffffff',
    20,
    5
  );

  ctx.font = '900 12px "Arial Black", sans-serif';
  ctx.fillStyle = '#d9d9d9';
  ctx.fillText(payload.cta.toUpperCase(), 40, H - 56);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(150,150,150,0.7)';
  ctx.fillText(payload.url, 40, H - 36);
}

function drawConspiracy(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#fefdf5';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.025);

  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.42);
  ctx.font = '900 72px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = 'rgba(180,40,40,0.06)';
  ctx.textAlign = 'center';
  ctx.fillText('CONFIDENTIAL', 0, 20);
  ctx.restore();

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(20, 20, W - 40, 44);

  ctx.textAlign = 'left';
  ctx.font = '700 10px "Courier New", monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText('CLASSIFIED  //  EYES ONLY  //  DO NOT DISTRIBUTE', 36, 46);

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
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#555';
  ctx.fillText(`FILE REF: ${payload.repoName.toUpperCase()}`, 40, 84);

  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(40, 96);
  ctx.lineTo(W - 40, 96);
  ctx.stroke();

  let y = 122;

  y = drawSection(
    ctx,
    'COVER STORY',
    fitText(payload.whatIsIt, 210),
    40,
    y,
    W - 80,
    '700 10px "Courier New", monospace',
    '13px "Courier New", monospace',
    '#7a7a72',
    '#1a1a1a',
    22,
    4
  );

  y += 8;

  y = drawSection(
    ctx,
    'EXHIBIT A',
    fitText(payload.example, 250),
    40,
    y,
    W - 80,
    '700 10px "Courier New", monospace',
    '13px "Courier New", monospace',
    '#7a7a72',
    '#1a1a1a',
    22,
    5
  );

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#5a5a50';
  ctx.fillText(payload.cta, 40, H - 58);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,120,100,0.7)';
  ctx.fillText(payload.url, 40, H - 40);
}

function drawFlirty(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#fff8f8';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.018);

  const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 600);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(180,80,100,0.06)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(200,130,145,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.strokeStyle = 'rgba(200,130,145,0.25)';
  ctx.strokeRect(24, 24, W - 48, H - 48);

  const corners = [
    [36, 36],
    [W - 36, 36],
    [36, H - 36],
    [W - 36, H - 36],
  ] as const;

  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = 'rgba(200,130,145,0.3)';
  ctx.textAlign = 'center';
  for (const [cx, cy] of corners) {
    ctx.fillText('✦', cx, cy + 6);
  }

  ctx.textAlign = 'left';
  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = 'rgba(180,100,120,0.6)';
  ctx.fillText('talk normie 2 me  ·  flirty edition', 50, 50);

  ctx.font = 'italic 500 22px Georgia, serif';
  ctx.fillStyle = '#441828';
  ctx.fillText(payload.repoName, 50, 88);

  ctx.strokeStyle = 'rgba(200,130,145,0.35)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(50, 100);
  ctx.lineTo(W - 50, 100);
  ctx.stroke();

  let y = 126;

  y = drawSection(
    ctx,
    'what it is',
    fitText(payload.whatIsIt, 230),
    50,
    y,
    W - 110,
    'italic 11px Georgia, serif',
    'italic 15px Georgia, serif',
    'rgba(180,100,120,0.72)',
    '#3a1522',
    23,
    4
  );

  y += 8;

  y = drawSection(
    ctx,
    'a little taste',
    fitText(payload.example, 290),
    50,
    y,
    W - 110,
    'italic 11px Georgia, serif',
    'italic 15px Georgia, serif',
    'rgba(180,100,120,0.72)',
    '#2d1020',
    25,
    5
  );

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.translate(W - 92, H - 84);
  ctx.rotate(0.15);
  ctx.font = '52px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cc3355';
  ctx.fillText('💋', 0, 0);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillStyle = '#8a5062';
  ctx.fillText(payload.cta, 50, H - 56);

  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = 'rgba(180,100,120,0.6)';
  ctx.fillText(payload.url, 50, H - 38);
}

function drawBrainrot(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  const blobs = [
    { x: 80, y: 80, r: 60, c: 'rgba(255,0,200,0.08)' },
    { x: W - 100, y: 120, r: 80, c: 'rgba(0,200,255,0.08)' },
    { x: 200, y: H - 80, r: 70, c: 'rgba(100,255,0,0.07)' },
    { x: W - 60, y: H - 100, r: 50, c: 'rgba(255,200,0,0.1)' },
  ];

  for (const b of blobs) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, b.c);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, 52);

  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME  🫠  BRAINROT EDITION  FR FR', 24, 33);

  ctx.font = '140px serif';
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  ctx.textAlign = 'center';
  ctx.fillText('🫠', W / 2, H / 2 + 50);

  ctx.textAlign = 'left';
  ctx.font = '900 26px system-ui, "Arial Black", sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText(payload.repoName, 24, 96);

  let y = 122;

  y = drawSection(
    ctx,
    'THE APP',
    fitText(payload.whatIsIt, 190),
    24,
    y,
    W - 48,
    '900 10px system-ui, sans-serif',
    '15px system-ui, sans-serif',
    '#666',
    '#111',
    22,
    4
  );

  y += 8;

  y = drawSection(
    ctx,
    'LIVE REACTION',
    fitText(payload.example, 250),
    24,
    y,
    W - 48,
    '900 10px system-ui, sans-serif',
    '15px system-ui, sans-serif',
    '#666',
    '#000',
    24,
    5
  );

  ctx.save();
  ctx.translate(W - 100, H - 100);
  ctx.rotate(-0.3);
  ctx.fillStyle = '#ffe500';
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const r = i % 2 === 0 ? 42 : 30;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.font = '900 9px system-ui, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText('GOATED', 0, -3);
  ctx.fillText('FR FR', 0, 9);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillStyle = '#444';
  ctx.fillText(payload.cta, 24, H - 52);

  ctx.font = '11px system-ui, monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText(payload.url, 24, H - 32);
}

function drawSporty(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, W, H);

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

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 60, 8, H - 60);

  ctx.textAlign = 'left';
  ctx.font = '900 30px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = '#0a0a0a';
  ctx.fillText(payload.repoName.toUpperCase(), 28, 104);

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(28, 114);
  ctx.lineTo(W - 28, 114);
  ctx.stroke();

  let y = 138;

  y = drawSection(
    ctx,
    'SCOUTING REPORT',
    fitText(payload.whatIsIt, 170).toUpperCase(),
    28,
    y,
    W - 56,
    '900 10px "Arial Black", sans-serif',
    '800 13px "Arial Black", sans-serif',
    '#666',
    '#222',
    20,
    4
  );

  y += 8;

  y = drawSection(
    ctx,
    'TAPE SAMPLE',
    fitText(payload.example, 230).toUpperCase(),
    28,
    y,
    W - 56,
    '900 10px "Arial Black", sans-serif',
    '800 13px "Arial Black", sans-serif',
    '#666',
    '#111',
    20,
    5
  );

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(28, H - 76, 142, 38);
  ctx.font = '700 10px "Arial Black", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('W  ·  NO JARGON  ·  BUILT', 36, H - 52);

  ctx.font = '700 11px "Arial Black", sans-serif';
  ctx.fillStyle = '#444';
  ctx.fillText(payload.cta.toUpperCase(), 188, H - 52);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText(payload.url, 28, H - 28);
}

function drawOtaku(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  payload: ShareCardPayload
) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1.5;
  const cx = W;
  const cy = 0;
  for (let a = Math.PI / 2; a < Math.PI * 1.4; a += 0.06) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900);
    ctx.stroke();
  }

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(W - 190, 36, 160, 44, 12);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(W - 170, 80);
  ctx.lineTo(W - 155, 96);
  ctx.lineTo(W - 140, 80);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 10px system-ui, sans-serif';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ MAIN CHARACTER', W - 110, 57);
  ctx.fillText('CODED FR', W - 110, 72);

  ctx.textAlign = 'left';
  ctx.font = '500 10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText('TALK NORMIE 2 ME  ·  OTAKU ARC', 32, 46);

  ctx.font = '900 28px "Arial Black", system-ui, sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText(payload.repoName, 32, 92);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(32, 102);
  ctx.lineTo(W - 32, 102);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 108);
  ctx.lineTo(W - 32, 108);
  ctx.stroke();

  let y = 132;

  y = drawSection(
    ctx,
    'LORE DROP',
    fitText(payload.whatIsIt, 220),
    32,
    y,
    W - 220,
    '700 10px system-ui, sans-serif',
    '700 14px system-ui, sans-serif',
    '#666',
    '#111',
    21,
    4
  );

  y += 6;

  y = drawSection(
    ctx,
    'ARC PREVIEW',
    fitText(payload.example, 270),
    32,
    y,
    W - 220,
    '700 10px system-ui, sans-serif',
    '700 14px system-ui, sans-serif',
    '#666',
    '#000',
    21,
    5
  );

  ctx.fillStyle = '#000';
  ctx.fillRect(W - 160, H - 90, 136, 54);
  ctx.font = '700 9px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('POWER LEVEL', W - 92, H - 72);
  ctx.font = '900 22px "Arial Black", sans-serif';
  ctx.fillText('9000+', W - 92, H - 50);

  ctx.textAlign = 'left';
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText(payload.cta, 32, H - 52);

  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText(payload.url, 32, H - 30);
}

export function generateShareCard(payload: ShareCardPayload): Promise<string> {
  return new Promise((resolve) => {
    const W = 900;
    const H = 540;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    switch (payload.mode) {
      case 'poetry':
        drawPoetry(ctx, W, H, payload);
        break;
      case 'emo':
        drawEmo(ctx, W, H, payload);
        break;
      case 'bro':
        drawBro(ctx, W, H, payload);
        break;
      case 'conspiracy':
        drawConspiracy(ctx, W, H, payload);
        break;
      case 'flirty':
        drawFlirty(ctx, W, H, payload);
        break;
      case 'brainrot':
        drawBrainrot(ctx, W, H, payload);
        break;
      case 'sporty':
        drawSporty(ctx, W, H, payload);
        break;
      case 'otaku':
        drawOtaku(ctx, W, H, payload);
        break;
      case 'fullnormie':
        drawNormie(ctx, W, H, payload, true);
        break;
      default:
        drawNormie(ctx, W, H, payload, false);
        break;
    }

    resolve(canvas.toDataURL('image/png'));
  });
}
