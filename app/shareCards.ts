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
  status: string;
  cta: string;
  url: string;
};

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  maxLines?: number
): number {
  const rawLines = String(text || '').split('\n');
  let linesUsed = 0;

  for (const rawLine of rawLines) {
    if (maxLines && linesUsed >= maxLines) break;

    if (rawLine.trim() === '') {
      y += lineH * 0.5;
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
      if (maxLines && linesUsed >= maxLines) return y;
    }
  }

  return y;
}

function normalizeText(text: string): string {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function ensureTrailingDots(text: string): string {
  const clean = normalizeText(text).replace(/[.!\?…]+$/g, '').trim();
  return `${clean}...`;
}

function fitText(text: string, max = 600): string {
  const clean = normalizeText(text);
  if (clean.length <= max) return clean;
  return ensureTrailingDots(clean.slice(0, max).trim());
}

function splitSentences(text: string): string[] {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function expandPreview(text: string, maxChars = 600, minSentences = 3): string {
  const sentences = splitSentences(text);
  if (!sentences.length) return fitText(text, maxChars);

  let out: string[] = [];
  let charCount = 0;

  for (const sentence of sentences) {
    const next = out.length ? `${out.join(' ')} ${sentence}` : sentence;
    if (next.length > maxChars && out.length >= minSentences) break;
    out.push(sentence);
    charCount = next.length;
    if (charCount >= maxChars && out.length >= minSentences) break;
  }

  if (out.length < minSentences) {
    const clean = normalizeText(text);
    return fitText(clean, maxChars);
  }

  // Don't add trailing dots if the text ends naturally
  const result = out.join(' ');
  const lastChar = result[result.length - 1];
  if (['.', '!', '?'].includes(lastChar)) return result;
  return ensureTrailingDots(result);
}

function drawPaperTexture(ctx: CanvasRenderingContext2D, W: number, H: number, alpha = 0.03) {
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = Math.random() * alpha;
    ctx.fillStyle = `rgba(40,30,20,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
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
  maxLines = 5
): number {
  ctx.textAlign = 'left';
  ctx.font = labelFont;
  ctx.fillStyle = labelColor;
  ctx.fillText(label, x, y);
  y += 20;

  ctx.font = bodyFont;
  ctx.fillStyle = bodyColor;
  return wrapLines(ctx, text, x, y, maxW, lineH, maxLines);
}

function drawSparkles(ctx: CanvasRenderingContext2D, points: Array<[number, number]>, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  for (const [x, y] of points) ctx.fillText('✦', x, y);
  ctx.restore();
}

function drawHeartDoodles(ctx: CanvasRenderingContext2D, seed: number, W: number, H: number) {
  const variants = [
    [
      [W - 92, H - 82, '💋', 50, 0.14],
      [W - 150, 64, '♡', 18, 0.22],
      [W - 110, 138, '♥', 14, 0.12],
    ],
    [
      [W - 100, H - 78, '💋', 52, -0.16],
      [78, H - 62, '♡', 20, -0.12],
      [W - 72, 58, '✦', 16, 0],
    ],
    [
      [W - 92, H - 82, '💋', 48, 0.08],
      [W - 170, 84, '♡', 18, 0.16],
      [W - 134, 106, '♡', 14, -0.18],
    ],
  ];
  const set = variants[seed % variants.length];
  for (const [x, y, glyph, size, rot] of set as any) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = glyph === '💋' ? 0.18 : 0.22;
    ctx.font = `${size}px Georgia, serif`;
    ctx.fillStyle = glyph === '💋' ? '#d83f67' : '#c7748a';
    ctx.textAlign = 'center';
    ctx.fillText(glyph, 0, 0);
    ctx.restore();
  }
}

function drawNotebookStars(ctx: CanvasRenderingContext2D, seed: number, W: number) {
  const variants = [
    [[W - 82, 58], [W - 58, 92], [W - 72, 132]],
    [[W - 70, 54], [W - 46, 86], [W - 90, 118]],
    [[W - 60, 64], [W - 86, 96], [W - 52, 126]],
  ];
  const pts = variants[seed % variants.length] as Array<[number, number]>;
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.font = '16px serif';
  ctx.fillStyle = '#444';
  for (const [x, y] of pts) ctx.fillText('✦', x, y);
  ctx.restore();
}

function drawConspiracyDoodles(ctx: CanvasRenderingContext2D, seed: number, W: number, H: number) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#b94949';
  ctx.lineWidth = 2;
  const variants = [
    [[W - 210, 170, W - 120, 126], [140, 150, 240, 210]],
    [[W - 250, 160, W - 126, 118], [120, 190, 230, 136]],
    [[W - 220, 210, W - 126, 120], [160, 150, 278, 224]],
  ];
  const lines = variants[seed % variants.length] as number[][];
  for (const [x1, y1, x2, y2] of lines) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#7f7f73';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(W - 130, 118, 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBrainrotDoodles(ctx: CanvasRenderingContext2D, seed: number, W: number, H: number) {
  const stickers = ['GOATED', 'NO CAP', 'FR FR'];
  const word = stickers[seed % stickers.length];

  ctx.save();
  ctx.translate(W - 92, H - 96);
  ctx.rotate([-0.3, -0.18, -0.38][seed % 3]);
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
  ctx.textAlign = 'center';
  ctx.font = '900 9px system-ui, sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText(word, 0, -4);
  ctx.fillText('FR FR', 0, 9);
  ctx.restore();

  const emojis = ['🫠', '✨', '😭'];
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.font = '110px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000';
  ctx.fillText(emojis[seed % emojis.length], W / 2, H / 2 + 40);
  ctx.restore();
}

function drawSportyDoodles(ctx: CanvasRenderingContext2D, seed: number, W: number, H: number) {
  const balls = ['🏀', '🏈', '⚽'];
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.font = '46px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#111';
  ctx.fillText(balls[seed % balls.length], W - 92, H - 58);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  const y = [150, 188, 226][seed % 3];
  ctx.beginPath();
  ctx.moveTo(28, y);
  ctx.lineTo(164, y - 18);
  ctx.lineTo(280, y + 8);
  ctx.stroke();
  ctx.restore();
}

function drawOtakuDoodles(ctx: CanvasRenderingContext2D, seed: number, W: number, H: number) {
  const labels = ['9000+', 'S-RANK', 'BOSS FIGHT'];
  ctx.fillStyle = '#000';
  ctx.fillRect(W - 160, H - 90, 136, 54);
  ctx.font = '700 9px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('POWER LEVEL', W - 92, H - 72);
  ctx.font = '900 22px "Arial Black", sans-serif';
  ctx.fillText(labels[seed % labels.length], W - 92, H - 50);
}

// Canvas is 900x600 (taller than before to fit 3 sections)
const W = 900;
const H = 600;

function drawNormie(
  ctx: CanvasRenderingContext2D,
  payload: ShareCardPayload,
  full: boolean
) {
  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.018);

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
  y = drawSection(ctx, 'WHAT IT IS', expandPreview(payload.whatIsIt, 560, 3), 28, y, W - 56,
    '700 10px system-ui, sans-serif', full ? '16px system-ui, sans-serif' : '15px system-ui, sans-serif',
    '#9d9386', '#4a433c', 23, 5);

  y += 12;
  y = drawSection(ctx, 'WHO & WHY', expandPreview(payload.example, 560, 3), 28, y, W - 56,
    '700 10px system-ui, sans-serif', full ? '16px system-ui, sans-serif' : '15px system-ui, sans-serif',
    '#9d9386', '#2f2a25', 23, 4);

  y += 12;
  drawSection(ctx, 'STATUS', expandPreview(payload.status, 400, 2), 28, y, W - 56,
    '700 10px system-ui, sans-serif', full ? '15px system-ui, sans-serif' : '14px system-ui, sans-serif',
    '#9d9386', '#6a6058', 22, 3);

  ctx.font = '600 12px system-ui, sans-serif';
  ctx.fillStyle = '#6f655a';
  ctx.fillText(payload.cta, 28, H - 48);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#b6ada1';
  ctx.fillText(payload.url, 28, H - 28);
}

function drawPoetry(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
  ctx.fillStyle = '#f6efe2';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.04);

  for (let y = 72; y < H - 42; y += 30) {
    ctx.strokeStyle = 'rgba(146,121,80,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(56, y);
    ctx.lineTo(W - 52, y);
    ctx.stroke();
  }

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
  y = drawSection(ctx, 'what it is', expandPreview(payload.whatIsIt, 540, 3), 60, y, W - 120,
    '500 10px "Courier New", monospace', 'italic 16px Georgia, serif',
    'rgba(120,94,60,0.74)', '#332112', 24, 4);

  y += 12;
  y = drawSection(ctx, 'a line from the translation', expandPreview(payload.example, 540, 3), 60, y, W - 120,
    '500 10px "Courier New", monospace', 'italic 16px Georgia, serif',
    'rgba(120,94,60,0.74)', '#2d1d10', 24, 4);

  y += 12;
  drawSection(ctx, 'alive or quiet', expandPreview(payload.status, 380, 2), 60, y, W - 120,
    '500 10px "Courier New", monospace', 'italic 15px Georgia, serif',
    'rgba(120,94,60,0.74)', '#4a3020', 23, 3);

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
  ctx.fillText(payload.cta, 60, H - 48);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,94,60,0.76)';
  ctx.fillText(payload.url, 60, H - 28);
}

function drawEmo(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
  const seed = hashString(payload.repoName + payload.mode);

  ctx.fillStyle = '#f3f2ef';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.028);

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
  for (let i = 0; i < 8; i++) {
    const hy = 56 + (i * (H - 90)) / 7;
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
  y = drawSection(ctx, 'what this is', expandPreview(payload.whatIsIt, 540, 3), 112, y, W - 164,
    '700 10px "Courier New", monospace', '15px "Courier New", monospace',
    'rgba(92,92,92,0.72)', '#363636', 21, 5);

  y += 10;
  y = drawSection(ctx, 'a page from it', expandPreview(payload.example, 540, 3), 112, y, W - 164,
    '700 10px "Courier New", monospace', '15px "Courier New", monospace',
    'rgba(92,92,92,0.72)', '#202020', 21, 4);

  y += 10;
  drawSection(ctx, 'still breathing?', expandPreview(payload.status, 380, 2), 112, y, W - 164,
    '700 10px "Courier New", monospace', '14px "Courier New", monospace',
    'rgba(92,92,92,0.72)', '#404040', 20, 3);

  drawNotebookStars(ctx, seed, W);

  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#555';
  ctx.fillText(payload.cta, 112, H - 48);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(118,118,118,0.66)';
  ctx.fillText(payload.url, 112, H - 28);
}

function drawBro(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
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
  y = drawSection(ctx, 'WHAT IT IS', expandPreview(payload.whatIsIt, 480, 3).toUpperCase(), 40, y, W - 80,
    '900 10px "Arial Black", sans-serif', '700 14px "Arial Black", sans-serif',
    '#7d7d7d', '#d4d4d4', 19, 5);

  y += 10;
  y = drawSection(ctx, 'WHY IT SLAPS', expandPreview(payload.example, 480, 3).toUpperCase(), 40, y, W - 80,
    '900 10px "Arial Black", sans-serif', '700 14px "Arial Black", sans-serif',
    '#7d7d7d', '#ffffff', 19, 4);

  y += 10;
  drawSection(ctx, 'ALIVE OR DEAD', expandPreview(payload.status, 340, 2).toUpperCase(), 40, y, W - 80,
    '900 10px "Arial Black", sans-serif', '700 13px "Arial Black", sans-serif',
    '#7d7d7d', '#aaaaaa', 18, 3);

  ctx.font = '900 12px "Arial Black", sans-serif';
  ctx.fillStyle = '#d9d9d9';
  ctx.fillText(payload.cta.toUpperCase(), 40, H - 48);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(150,150,150,0.7)';
  ctx.fillText(payload.url, 40, H - 28);
}

function drawConspiracy(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
  const seed = hashString(payload.repoName + payload.mode);

  ctx.fillStyle = '#fefdf5';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.024);

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
  y = drawSection(ctx, 'COVER STORY', expandPreview(payload.whatIsIt, 540, 3), 40, y, W - 80,
    '700 10px "Courier New", monospace', '14px "Courier New", monospace',
    '#7a7a72', '#1a1a1a', 21, 5);

  y += 10;
  y = drawSection(ctx, 'EXHIBIT A', expandPreview(payload.example, 540, 3), 40, y, W - 80,
    '700 10px "Courier New", monospace', '14px "Courier New", monospace',
    '#7a7a72', '#1a1a1a', 21, 4);

  y += 10;
  drawSection(ctx, 'STILL ACTIVE?', expandPreview(payload.status, 380, 2), 40, y, W - 80,
    '700 10px "Courier New", monospace', '13px "Courier New", monospace',
    '#7a7a72', '#3a3a30', 20, 3);

  drawConspiracyDoodles(ctx, seed, W, H);

  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#5a5a50';
  ctx.fillText(payload.cta, 40, H - 48);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,120,100,0.7)';
  ctx.fillText(payload.url, 40, H - 28);
}

function drawFlirty(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
  const seed = hashString(payload.repoName + payload.mode);

  ctx.fillStyle = '#fff8f8';
  ctx.fillRect(0, 0, W, H);
  drawPaperTexture(ctx, W, H, 0.016);

  const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 620);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(180,80,100,0.06)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(200,130,145,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.strokeStyle = 'rgba(200,130,145,0.25)';
  ctx.strokeRect(24, 24, W - 48, H - 48);

  drawSparkles(ctx, [[36, 40], [W - 36, 40], [36, H - 24], [W - 36, H - 24]], 'rgba(200,130,145,0.3)');

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
  y = drawSection(ctx, 'what it is', expandPreview(payload.whatIsIt, 540, 3), 50, y, W - 112,
    'italic 11px Georgia, serif', 'italic 16px Georgia, serif',
    'rgba(180,100,120,0.72)', '#3a1522', 22, 5);

  y += 10;
  y = drawSection(ctx, 'a little taste', expandPreview(payload.example, 540, 3), 50, y, W - 112,
    'italic 11px Georgia, serif', 'italic 16px Georgia, serif',
    'rgba(180,100,120,0.72)', '#2d1020', 22, 4);

  y += 10;
  drawSection(ctx, 'seeing anyone?', expandPreview(payload.status, 380, 2), 50, y, W - 112,
    'italic 11px Georgia, serif', 'italic 15px Georgia, serif',
    'rgba(180,100,120,0.72)', '#5a2535', 21, 3);

  drawHeartDoodles(ctx, seed, W, H);

  ctx.textAlign = 'left';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillStyle = '#8a5062';
  ctx.fillText(payload.cta, 50, H - 48);

  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = 'rgba(180,100,120,0.6)';
  ctx.fillText(payload.url, 50, H - 28);
}

function drawBrainrot(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
  const seed = hashString(payload.repoName + payload.mode);

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

  ctx.textAlign = 'left';
  ctx.font = '900 26px system-ui, "Arial Black", sans-serif';
  ctx.fillStyle = '#000';
  ctx.fillText(payload.repoName, 24, 96);

  let y = 122;
  y = drawSection(ctx, 'THE LORE', expandPreview(payload.whatIsIt, 480, 3), 24, y, W - 48,
    '900 10px system-ui, sans-serif', '15px system-ui, sans-serif',
    '#666', '#111', 21, 5);

  y += 10;
  y = drawSection(ctx, 'WHY IT BUSSIN', expandPreview(payload.example, 480, 3), 24, y, W - 48,
    '900 10px system-ui, sans-serif', '15px system-ui, sans-serif',
    '#666', '#000', 21, 4);

  y += 10;
  drawSection(ctx, 'STILL ALIVE FR?', expandPreview(payload.status, 340, 2), 24, y, W - 48,
    '900 10px system-ui, sans-serif', '14px system-ui, sans-serif',
    '#666', '#333', 20, 3);

  drawBrainrotDoodles(ctx, seed, W, H);

  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillStyle = '#444';
  ctx.fillText(payload.cta, 24, H - 48);

  ctx.font = '11px system-ui, monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillText(payload.url, 24, H - 28);
}

function drawSporty(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
  const seed = hashString(payload.repoName + payload.mode);

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
  y = drawSection(ctx, 'SCOUTING REPORT', expandPreview(payload.whatIsIt, 440, 3).toUpperCase(), 28, y, W - 56,
    '900 10px "Arial Black", sans-serif', '800 14px "Arial Black", sans-serif',
    '#666', '#222', 19, 5);

  y += 10;
  y = drawSection(ctx, 'TAPE SAMPLE', expandPreview(payload.example, 440, 3).toUpperCase(), 28, y, W - 56,
    '900 10px "Arial Black", sans-serif', '800 14px "Arial Black", sans-serif',
    '#666', '#111', 19, 4);

  y += 10;
  drawSection(ctx, 'GAME STATUS', expandPreview(payload.status, 320, 2).toUpperCase(), 28, y, W - 56,
    '900 10px "Arial Black", sans-serif', '800 13px "Arial Black", sans-serif',
    '#666', '#444', 18, 3);

  drawSportyDoodles(ctx, seed, W, H);

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(28, H - 72, 168, 38);
  ctx.font = '700 10px "Arial Black", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('FILM ROOM  •  NO JARGON  •  BUILT', 36, H - 48);

  ctx.font = '700 11px "Arial Black", sans-serif';
  ctx.fillStyle = '#444';
  ctx.fillText(payload.cta.toUpperCase(), 214, H - 48);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText(payload.url, 28, H - 24);
}

function drawOtaku(ctx: CanvasRenderingContext2D, payload: ShareCardPayload) {
  const seed = hashString(payload.repoName + payload.mode);

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
  y = drawSection(ctx, 'LORE DROP', expandPreview(payload.whatIsIt, 460, 3), 32, y, W - 220,
    '700 10px system-ui, sans-serif', '700 15px system-ui, sans-serif',
    '#666', '#111', 20, 5);

  y += 10;
  y = drawSection(ctx, 'ARC PREVIEW', expandPreview(payload.example, 460, 3), 32, y, W - 220,
    '700 10px system-ui, sans-serif', '700 15px system-ui, sans-serif',
    '#666', '#000', 20, 4);

  y += 10;
  drawSection(ctx, 'ARC STATUS', expandPreview(payload.status, 340, 2), 32, y, W - 220,
    '700 10px system-ui, sans-serif', '700 14px system-ui, sans-serif',
    '#666', '#333', 19, 3);

  drawOtakuDoodles(ctx, seed, W, H);

  ctx.textAlign = 'left';
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText(payload.cta, 32, H - 48);

  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText(payload.url, 32, H - 28);
}

export function generateShareCard(payload: ShareCardPayload): Promise<string> {
  return new Promise((resolve) => {
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
        drawPoetry(ctx, payload);
        break;
      case 'emo':
        drawEmo(ctx, payload);
        break;
      case 'bro':
        drawBro(ctx, payload);
        break;
      case 'conspiracy':
        drawConspiracy(ctx, payload);
        break;
      case 'flirty':
        drawFlirty(ctx, payload);
        break;
      case 'brainrot':
        drawBrainrot(ctx, payload);
        break;
      case 'sporty':
        drawSporty(ctx, payload);
        break;
      case 'otaku':
        drawOtaku(ctx, payload);
        break;
      case 'fullnormie':
        drawNormie(ctx, payload, true);
        break;
      default:
        drawNormie(ctx, payload, false);
        break;
    }

    resolve(canvas.toDataURL('image/png'));
  });
}
