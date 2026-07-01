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
  | 'linkedin'
  | 'grandma'
  | 'poetry';

type ShareCardPayload = {
  repoName: string;
  mode: PersonalityMode;
  hook: string;
  whatIsIt: string;
  example: string;
  status: string;
  recentActivity?: string;
  whyStopped?: string;
  cta: string;
  url: string;
  language?: string;
  stars?: number;
  updatedAt?: string;
  repoUrl?: string;
};

// Draws wrapped prose text, returns new y
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

// Draws poetry lines preserving \n as actual line breaks, returns new y
function drawPoetryLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  maxLines: number
): number {
  const lines = String(text || '').split('\n').filter((l) => l.trim().length > 0);
  let drawn = 0;
  for (const line of lines) {
    if (drawn >= maxLines) {
      // add ellipsis to last drawn line — redraw it
      break;
    }
    ctx.fillText(line, x, y);
    y += lineH;
    drawn++;
  }
  return y;
}

function normalizeText(text: string): string {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function ensureTrailingDots(text: string): string {
  const clean = normalizeText(text).replace(/[.!\?…]+$/g, '').trim();
  return `${clean}....`;
}

function fitText(text: string, max = 600): string {
  const clean = normalizeText(text);
  if (clean.length <= max) return ensureTrailingDots(clean);
  return ensureTrailingDots(clean.slice(0, max).trim());
}

function splitSentences(text: string): string[] {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Always cuts on a sentence boundary, ends with ....
function expandPreview(text: string, maxChars = 900, minSentences = 4): string {
  const sentences = splitSentences(text);
  if (!sentences.length) return fitText(text, maxChars);

  let out: string[] = [];

  for (const sentence of sentences) {
    const candidate = out.length ? `${out.join(' ')} ${sentence}` : sentence;
    if (candidate.length > maxChars && out.length >= minSentences) break;
    out.push(sentence);
  }

  if (out.length < minSentences && sentences.length > 0) {
    // take what we have even if over
    out = sentences.slice(0, minSentences);
  }

  return ensureTrailingDots(out.join(' '));
}

// Poetry-specific: preserves line breaks, truncates to maxLines, adds ....
function previewPoetry(text: string, maxLines = 4): string {
  const lines = String(text || '').split('\n').filter((l) => l.trim().length > 0);
  if (lines.length <= maxLines) return lines.join('\n');
  return lines.slice(0, maxLines).join('\n') + '\n....';
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

function getShareLabels(mode: PersonalityMode): string[] {
  const labels: Partial<Record<PersonalityMode, string[]>> = {
    flirty: ['what it is', 'why you want it', 'seeing anyone?', 'recently active', 'why it ghosted'],
    bro: ['WHAT IT IS', 'WHY IT SLAPS', 'ALIVE OR DEAD', 'RECENT PLAYS', 'WHY IT QUIT'],
    emo: ['what this is', 'a page from it', 'still breathing?', 'the last words', 'where it went'],
    conspiracy: ['COVER STORY', 'EXHIBIT A', 'STILL ACTIVE?', 'THE TRAIL', 'WHY IT WENT DARK'],
    brainrot: ['THE LORE', 'WHY IT BUSSIN', 'STILL ALIVE FR?', 'RECENT GLAZING', 'WHY IT FLOPPED'],
    sporty: ['SCOUTING REPORT', 'TAPE SAMPLE', 'GAME STATUS', 'RECENT PLAYS', 'FINAL WHISTLE'],
    otaku: ['LORE DROP', 'ARC PREVIEW', 'ARC STATUS', 'EPISODE RECAP', 'WHY IT ENDED'],
    linkedin: ['THE THESIS', 'WHO THIS SERVES', 'MOMENTUM CHECK', 'RECENT WINS', 'WHY IT PAUSED'],
    grandma: ['what it is, dear', 'who needs this', 'still going?', 'recent news', 'where it went'],
    fullnormie: ['WHAT IT IS', 'WHY IT MATTERS', 'IS IT ALIVE?', 'WHAT CHANGED', 'WHY IT STOPPED'],
    poetry: ['what it is', 'a line from the translation', 'alive or quiet', 'found poetry'],
  };
  return labels[mode] || ['WHAT IT IS', 'WHY IT MATTERS', 'STATUS', 'RECENT ACTIVITY', 'WHY IT STOPPED'];
}

function drawHookQuote(
  ctx: CanvasRenderingContext2D,
  hook: string,
  x: number,
  y: number,
  maxW: number,
  font: string,
  color: string,
  bg: string
): number {
  if (!hook?.trim()) return y;

  const preview = expandPreview(hook, 420, 2);
  ctx.font = font;
  const words = preview.split(/\s+/);
  let lineCount = 1;
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxW - 24 && current) {
      lineCount++;
      current = word;
    } else {
      current = test;
    }
  }
  lineCount = Math.min(lineCount, 3);
  const boxH = 18 + lineCount * 20 + 14;

  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x, y - 14, maxW, boxH, 6);
  ctx.fill();

  ctx.font = font;
  ctx.fillStyle = color;
  return wrapLines(ctx, preview, x + 12, y + 6, maxW - 24, 20, 3) + 8;
}

function drawMetaChips(
  ctx: CanvasRenderingContext2D,
  payload: ShareCardPayload,
  x: number,
  y: number,
  chipBg: string,
  chipColor: string
): number {
  const chips: string[] = [];
  if (payload.language) chips.push(payload.language);
  if (payload.stars != null && payload.stars > 0) chips.push(`★ ${payload.stars}`);
  if (payload.updatedAt) {
    chips.push(
      `updated ${new Date(payload.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    );
  }
  if (!chips.length) return y;

  ctx.font = '600 9px system-ui, sans-serif';
  let cx = x;
  for (const chip of chips) {
    const w = ctx.measureText(chip).width + 16;
    ctx.fillStyle = chipBg;
    ctx.beginPath();
    ctx.roundRect(cx, y - 10, w, 20, 10);
    ctx.fill();
    ctx.fillStyle = chipColor;
    ctx.fillText(chip, cx + 8, y + 3);
    cx += w + 6;
  }
  return y + 22;
}

type RichContentTheme = {
  padX: number;
  contentW: number;
  labelFont: string;
  bodyFont: string;
  labelColor: string;
  bodyColor: string;
  hookFont: string;
  hookColor: string;
  hookBg: string;
  chipBg: string;
  chipColor: string;
  lineH: number;
  transformText?: (text: string) => string;
};

function drawRichContent(
  ctx: CanvasRenderingContext2D,
  payload: ShareCardPayload,
  theme: RichContentTheme,
  startY: number
): number {
  let y = startY;
  y = drawHookQuote(ctx, payload.hook, theme.padX, y, theme.contentW, theme.hookFont, theme.hookColor, theme.hookBg);
  y = drawMetaChips(ctx, payload, theme.padX, y, theme.chipBg, theme.chipColor);

  const labels = getShareLabels(payload.mode);
  const texts = [
    payload.whatIsIt,
    payload.example,
    payload.status,
    payload.recentActivity || '',
    payload.whyStopped || '',
  ];
  const tf = theme.transformText || ((s: string) => s);

  for (let i = 0; i < texts.length; i++) {
    if (!texts[i]?.trim()) continue;
    const maxLines = i >= 3 ? 4 : 6;
    const minSentences = i >= 3 ? 2 : 4;
    y = drawSection(
      ctx,
      labels[i] || labels[labels.length - 1],
      tf(expandPreview(texts[i], theme.contentW + 200, minSentences)),
      theme.padX,
      y,
      theme.contentW,
      theme.labelFont,
      theme.bodyFont,
      theme.labelColor,
      theme.bodyColor,
      theme.lineH,
      maxLines
    );
    y += 8;
  }
  return y;
}

function drawCardFooter(
  ctx: CanvasRenderingContext2D,
  payload: ShareCardPayload,
  x: number,
  y: number,
  ctaFont: string,
  ctaColor: string,
  urlFont: string,
  urlColor: string
): number {
  ctx.textAlign = 'left';
  ctx.font = ctaFont;
  ctx.fillStyle = ctaColor;
  ctx.fillText(payload.cta, x, y);
  ctx.font = urlFont;
  ctx.fillStyle = urlColor;
  ctx.fillText(payload.url, x, y + 20);
  return y + 44;
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
    [[W - 92, H - 82, '💋', 50, 0.14],[W - 150, 64, '♡', 18, 0.22],[W - 110, 138, '♥', 14, 0.12]],
    [[W - 100, H - 78, '💋', 52, -0.16],[78, H - 62, '♡', 20, -0.12],[W - 72, 58, '✦', 16, 0]],
    [[W - 92, H - 82, '💋', 48, 0.08],[W - 170, 84, '♡', 18, 0.16],[W - 134, 106, '♡', 14, -0.18]],
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
    [[W - 82, 58],[W - 58, 92],[W - 72, 132]],
    [[W - 70, 54],[W - 46, 86],[W - 90, 118]],
    [[W - 60, 64],[W - 86, 96],[W - 52, 126]],
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
    [[W - 210, 170, W - 120, 126],[140, 150, 240, 210]],
    [[W - 250, 160, W - 126, 118],[120, 190, 230, 136]],
    [[W - 220, 210, W - 126, 120],[160, 150, 278, 224]],
  ];
  const lines = variants[seed % variants.length] as number[][];
  for (const [x1, y1, x2, y2] of lines) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
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
  ctx.moveTo(28, y); ctx.lineTo(164, y - 18); ctx.lineTo(280, y + 8);
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

const W = 900;
const H_MAX = 900;
const H_MIN = 520;

function drawNormie(ctx: CanvasRenderingContext2D, payload: ShareCardPayload, full: boolean): number {
  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, W, H_MAX);
  drawPaperTexture(ctx, W, H_MAX, 0.018);
  ctx.strokeStyle = '#e7e1d8'; ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, W - 20, H_MAX - 20);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, W, 56);
  ctx.font = '600 12px system-ui, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
  ctx.fillText('Talk Normie 2 Me', 26, 35);
  if (full) {
    ctx.textAlign = 'right'; ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.fillText('Full Normie 🧠', W - 26, 35);
  }
  ctx.textAlign = 'left'; ctx.font = '600 24px system-ui, sans-serif';
  ctx.fillStyle = '#1c1a17'; ctx.fillText(payload.repoName, 28, 94);
  ctx.strokeStyle = '#ece6dc'; ctx.beginPath(); ctx.moveTo(28, 108); ctx.lineTo(W - 28, 108); ctx.stroke();

  const y = drawRichContent(ctx, payload, {
    padX: 28,
    contentW: W - 56,
    labelFont: '700 10px system-ui, sans-serif',
    bodyFont: full ? '16px system-ui, sans-serif' : '15px system-ui, sans-serif',
    labelColor: '#9d9386',
    bodyColor: '#4a433c',
    hookFont: '600 13px system-ui, sans-serif',
    hookColor: '#2f2a25',
    hookBg: 'rgba(157,147,134,0.12)',
    chipBg: '#f0ebe3',
    chipColor: '#6a6058',
    lineH: 23,
  }, 118);

  return drawCardFooter(ctx, payload, 28, y + 12,
    '600 12px system-ui, sans-serif', '#6f655a',
    '11px "Courier New", monospace', '#b6ada1');
}

function drawPoetry(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  ctx.fillStyle = '#f6efe2';
  ctx.fillRect(0, 0, W, H_MAX);
  drawPaperTexture(ctx, W, H_MAX, 0.04);

  for (let ry = 72; ry < H_MAX - 42; ry += 28) {
    ctx.strokeStyle = 'rgba(146,121,80,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(56, ry); ctx.lineTo(W - 52, ry); ctx.stroke();
  }

  ctx.font = '500 11px "Courier New", monospace';
  ctx.fillStyle = 'rgba(120,94,60,0.82)';
  ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME  ·  POETRY', 60, 40);

  ctx.font = 'italic 500 20px Georgia, serif';
  ctx.fillStyle = '#2c1c0d';
  ctx.fillText(payload.repoName, 60, 76);

  ctx.strokeStyle = 'rgba(140,110,70,0.32)'; ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(60, 90); ctx.lineTo(W - 60, 90); ctx.stroke();

  const labelFont = '500 10px "Courier New", monospace';
  const bodyFont = 'italic 15px Georgia, serif';
  const labelColor = 'rgba(120,94,60,0.74)';
  const bodyColor = '#332112';
  const lineH = 26;
  const labels = getShareLabels('poetry');

  let y = 104;
  if (payload.hook?.trim()) {
    ctx.font = 'italic 14px Georgia, serif'; ctx.fillStyle = '#4a301b';
    y = wrapLines(ctx, expandPreview(payload.hook, 500, 2), 60, y, W - 120, 22, 2) + 14;
  }

  const stanzas = [payload.whatIsIt, payload.example, payload.status, payload.recentActivity || ''];
  for (let i = 0; i < stanzas.length; i++) {
    if (!stanzas[i]?.trim()) continue;
    ctx.font = labelFont; ctx.fillStyle = labelColor;
    ctx.fillText(labels[i] || labels[labels.length - 1], 60, y);
    y += 18;
    ctx.font = bodyFont; ctx.fillStyle = bodyColor;
    y = drawPoetryLines(ctx, previewPoetry(stanzas[i], 4), 60, y, W - 120, lineH, 4);
    y += 14;
  }

  ctx.save(); ctx.globalAlpha = 0.16;
  ctx.translate(W - 120, 108); ctx.rotate(-0.12);
  ctx.font = '28px serif'; ctx.fillStyle = '#5d2a18';
  ctx.fillText('✒', 0, 0);
  ctx.restore();

  return drawCardFooter(ctx, payload, 60, y + 8,
    'italic 13px Georgia, serif', '#4a301b',
    '11px "Courier New", monospace', 'rgba(120,94,60,0.76)');
}

function drawEmo(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  const seed = hashString(payload.repoName + payload.mode);
  ctx.fillStyle = '#f3f2ef'; ctx.fillRect(0, 0, W, H_MAX);
  drawPaperTexture(ctx, W, H_MAX, 0.028);
  ctx.strokeStyle = 'rgba(182,182,176,0.4)'; ctx.lineWidth = 1;
  for (let ly = 62; ly < H_MAX - 40; ly += 28) {
    ctx.beginPath(); ctx.moveTo(60, ly); ctx.lineTo(W - 42, ly); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(185,65,65,0.34)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(98, 30); ctx.lineTo(98, H_MAX - 30); ctx.stroke();
  ctx.fillStyle = '#e7e7e4'; ctx.strokeStyle = 'rgba(170,170,164,0.6)'; ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const hy = 56 + (i * (H_MAX - 90)) / 7;
    ctx.beginPath(); ctx.arc(22, hy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.font = '500 10px "Courier New", monospace'; ctx.fillStyle = 'rgba(78,78,78,0.6)';
  ctx.fillText('talk normie 2 me  //  emo mode', 112, 38);
  ctx.font = '500 18px "Courier New", monospace'; ctx.fillStyle = '#1a1a1a';
  ctx.fillText(payload.repoName, 112, 76);

  const y = drawRichContent(ctx, payload, {
    padX: 112,
    contentW: W - 164,
    labelFont: '700 10px "Courier New", monospace',
    bodyFont: '15px "Courier New", monospace',
    labelColor: 'rgba(92,92,92,0.72)',
    bodyColor: '#363636',
    hookFont: 'italic 13px "Courier New", monospace',
    hookColor: '#404040',
    hookBg: 'rgba(185,65,65,0.08)',
    chipBg: 'rgba(185,65,65,0.12)',
    chipColor: '#666',
    lineH: 21,
  }, 104);

  drawNotebookStars(ctx, seed, W);
  return drawCardFooter(ctx, payload, 112, y + 12,
    '12px "Courier New", monospace', '#555',
    '10px "Courier New", monospace', 'rgba(118,118,118,0.66)');
}

function drawBro(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  ctx.fillStyle = '#0f0f0f'; ctx.fillRect(0, 0, W, H_MAX);
  ctx.font = '900 220px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.textAlign = 'center';
  ctx.fillText('PR', W / 2, H_MAX / 2 + 80);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.strokeRect(16, 16, W - 32, H_MAX - 32);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 16, W - 32, 6);
  ctx.textAlign = 'left';
  const badge = ' 🔥 W REPO ';
  ctx.font = '900 11px "Arial Black", sans-serif';
  const bw = ctx.measureText(badge).width + 16;
  ctx.fillStyle = '#fff'; ctx.fillRect(40, 40, bw, 26);
  ctx.fillStyle = '#000'; ctx.fillText(badge, 40, 57);
  ctx.fillStyle = '#fff'; ctx.font = '900 26px "Arial Black", Impact, sans-serif';
  ctx.fillText(payload.repoName.toUpperCase(), 40, 96);

  const y = drawRichContent(ctx, payload, {
    padX: 40,
    contentW: W - 80,
    labelFont: '900 10px "Arial Black", sans-serif',
    bodyFont: '700 14px "Arial Black", sans-serif',
    labelColor: '#7d7d7d',
    bodyColor: '#d4d4d4',
    hookFont: '700 13px "Arial Black", sans-serif',
    hookColor: '#ffffff',
    hookBg: 'rgba(255,255,255,0.08)',
    chipBg: 'rgba(255,255,255,0.12)',
    chipColor: '#aaaaaa',
    lineH: 19,
    transformText: (s) => s.toUpperCase(),
  }, 118);

  return drawCardFooter(ctx, payload, 40, y + 12,
    '900 12px "Arial Black", sans-serif', '#d9d9d9',
    '11px "Courier New", monospace', 'rgba(150,150,150,0.7)');
}

function drawConspiracy(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  const seed = hashString(payload.repoName + payload.mode);
  ctx.fillStyle = '#fefdf5'; ctx.fillRect(0, 0, W, H_MAX);
  drawPaperTexture(ctx, W, H_MAX, 0.024);
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H_MAX - 40); ctx.strokeRect(24, 24, W - 48, H_MAX - 48);
  ctx.save(); ctx.translate(W / 2, H_MAX / 2); ctx.rotate(-0.42);
  ctx.font = '900 72px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = 'rgba(180,40,40,0.06)'; ctx.textAlign = 'center';
  ctx.fillText('CONFIDENTIAL', 0, 20); ctx.restore();
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(20, 20, W - 40, 44);
  ctx.textAlign = 'left'; ctx.font = '700 10px "Courier New", monospace';
  ctx.fillStyle = '#fff'; ctx.fillText('CLASSIFIED  //  EYES ONLY  //  DO NOT DISTRIBUTE', 36, 46);
  ctx.save(); ctx.translate(W - 120, 105); ctx.rotate(0.08);
  ctx.strokeStyle = 'rgba(180,40,40,0.65)'; ctx.lineWidth = 2;
  ctx.strokeRect(-4, -20, 100, 28);
  ctx.font = '900 12px "Arial Black", sans-serif'; ctx.fillStyle = 'rgba(180,40,40,0.65)';
  ctx.textAlign = 'center'; ctx.fillText('CLASSIFIED', 46, -3); ctx.restore();
  ctx.textAlign = 'left'; ctx.font = '11px "Courier New", monospace'; ctx.fillStyle = '#555';
  ctx.fillText(`FILE REF: ${payload.repoName.toUpperCase()}`, 40, 84);
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(40, 96); ctx.lineTo(W - 40, 96); ctx.stroke();

  const y = drawRichContent(ctx, payload, {
    padX: 40,
    contentW: W - 80,
    labelFont: '700 10px "Courier New", monospace',
    bodyFont: '14px "Courier New", monospace',
    labelColor: '#7a7a72',
    bodyColor: '#1a1a1a',
    hookFont: 'italic 13px "Courier New", monospace',
    hookColor: '#3a3a30',
    hookBg: 'rgba(180,40,40,0.06)',
    chipBg: 'rgba(180,40,40,0.1)',
    chipColor: '#7a7a72',
    lineH: 21,
  }, 108);

  drawConspiracyDoodles(ctx, seed, W, H_MAX);
  return drawCardFooter(ctx, payload, 40, y + 12,
    '11px "Courier New", monospace', '#5a5a50',
    '10px "Courier New", monospace', 'rgba(120,120,100,0.7)');
}

function drawFlirty(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  const seed = hashString(payload.repoName + payload.mode);
  ctx.fillStyle = '#fff8f8'; ctx.fillRect(0, 0, W, H_MAX);
  drawPaperTexture(ctx, W, H_MAX, 0.016);
  const vg = ctx.createRadialGradient(W / 2, H_MAX / 2, 200, W / 2, H_MAX / 2, 620);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(180,80,100,0.06)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H_MAX);
  ctx.strokeStyle = 'rgba(200,130,145,0.5)'; ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, W - 36, H_MAX - 36);
  ctx.strokeStyle = 'rgba(200,130,145,0.25)'; ctx.strokeRect(24, 24, W - 48, H_MAX - 48);
  drawSparkles(ctx, [[36, 40], [W - 36, 40]], 'rgba(200,130,145,0.3)');
  ctx.textAlign = 'left'; ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = 'rgba(180,100,120,0.6)';
  ctx.fillText('talk normie 2 me  ·  flirty edition', 50, 50);
  ctx.font = 'italic 500 22px Georgia, serif'; ctx.fillStyle = '#441828';
  ctx.fillText(payload.repoName, 50, 88);
  ctx.strokeStyle = 'rgba(200,130,145,0.35)'; ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(50, 100); ctx.lineTo(W - 50, 100); ctx.stroke();

  const y = drawRichContent(ctx, payload, {
    padX: 50,
    contentW: W - 100,
    labelFont: 'italic 11px Georgia, serif',
    bodyFont: 'italic 16px Georgia, serif',
    labelColor: 'rgba(180,100,120,0.72)',
    bodyColor: '#3a1522',
    hookFont: 'italic 14px Georgia, serif',
    hookColor: '#5a2535',
    hookBg: 'rgba(200,130,145,0.12)',
    chipBg: 'rgba(200,130,145,0.15)',
    chipColor: '#8a5062',
    lineH: 22,
  }, 118);

  drawHeartDoodles(ctx, seed, W, H_MAX);
  return drawCardFooter(ctx, payload, 50, y + 12,
    'italic 12px Georgia, serif', '#8a5062',
    'italic 11px Georgia, serif', 'rgba(180,100,120,0.6)');
}

function drawBrainrot(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  const seed = hashString(payload.repoName + payload.mode);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H_MAX);
  const blobs = [
    { x: 80, y: 80, r: 60, c: 'rgba(255,0,200,0.08)' },
    { x: W - 100, y: 120, r: 80, c: 'rgba(0,200,255,0.08)' },
    { x: 200, y: H_MAX - 80, r: 70, c: 'rgba(100,255,0,0.07)' },
    { x: W - 60, y: H_MAX - 100, r: 50, c: 'rgba(255,200,0,0.1)' },
  ];
  for (const b of blobs) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, b.c); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H_MAX);
  }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 52);
  ctx.font = '700 12px system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME  🫠  BRAINROT EDITION  FR FR', 24, 33);
  ctx.font = '900 26px system-ui, "Arial Black", sans-serif'; ctx.fillStyle = '#000';
  ctx.fillText(payload.repoName, 24, 96);

  const y = drawRichContent(ctx, payload, {
    padX: 24,
    contentW: W - 48,
    labelFont: '900 10px system-ui, sans-serif',
    bodyFont: '15px system-ui, sans-serif',
    labelColor: '#666',
    bodyColor: '#111',
    hookFont: '700 13px system-ui, sans-serif',
    hookColor: '#000',
    hookBg: 'rgba(255,229,0,0.25)',
    chipBg: '#f0f0f0',
    chipColor: '#444',
    lineH: 21,
  }, 118);

  drawBrainrotDoodles(ctx, seed, W, H_MAX);
  return drawCardFooter(ctx, payload, 24, y + 12,
    '700 12px system-ui, sans-serif', '#444',
    '11px system-ui, monospace', 'rgba(0,0,0,0.4)');
}

function drawSporty(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  const seed = hashString(payload.repoName + payload.mode);
  ctx.fillStyle = '#f8f8f8'; ctx.fillRect(0, 0, W, H_MAX);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, W, 60);
  ctx.fillStyle = '#ffffff'; ctx.font = '900 12px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('TALK NORMIE 2 ME', 24, 38);
  ctx.font = '700 12px "Arial Black", sans-serif'; ctx.fillStyle = '#888';
  ctx.textAlign = 'right'; ctx.fillText('🏆 SPORTY MODE', W - 24, 38);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 60, 8, H_MAX - 60);
  ctx.textAlign = 'left'; ctx.font = '900 30px "Arial Black", Impact, sans-serif';
  ctx.fillStyle = '#0a0a0a'; ctx.fillText(payload.repoName.toUpperCase(), 28, 104);
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(28, 114); ctx.lineTo(W - 28, 114); ctx.stroke();

  const y = drawRichContent(ctx, payload, {
    padX: 28,
    contentW: W - 56,
    labelFont: '900 10px "Arial Black", sans-serif',
    bodyFont: '800 14px "Arial Black", sans-serif',
    labelColor: '#666',
    bodyColor: '#222',
    hookFont: '700 13px "Arial Black", sans-serif',
    hookColor: '#111',
    hookBg: 'rgba(0,0,0,0.06)',
    chipBg: '#eee',
    chipColor: '#444',
    lineH: 19,
    transformText: (s) => s.toUpperCase(),
  }, 132);

  drawSportyDoodles(ctx, seed, W, H_MAX);
  return drawCardFooter(ctx, payload, 28, y + 12,
    '700 11px "Arial Black", sans-serif', '#444',
    '10px "Courier New", monospace', 'rgba(0,0,0,0.35)');
}

function drawOtaku(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  const seed = hashString(payload.repoName + payload.mode);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H_MAX);
  ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 1.5;
  const cx = W; const cy = 0;
  for (let a = Math.PI / 2; a < Math.PI * 1.4; a += 0.06) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900); ctx.stroke();
  }
  ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(12, 12, W - 24, H_MAX - 24);
  ctx.lineWidth = 1; ctx.strokeRect(20, 20, W - 40, H_MAX - 40);
  ctx.textAlign = 'left'; ctx.font = '500 10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillText('TALK NORMIE 2 ME  ·  OTAKU ARC', 32, 46);
  ctx.font = '900 28px "Arial Black", system-ui, sans-serif'; ctx.fillStyle = '#000';
  ctx.fillText(payload.repoName, 32, 92);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(32, 102); ctx.lineTo(W - 32, 102); ctx.stroke();

  const y = drawRichContent(ctx, payload, {
    padX: 32,
    contentW: W - 220,
    labelFont: '700 10px system-ui, sans-serif',
    bodyFont: '700 15px system-ui, sans-serif',
    labelColor: '#666',
    bodyColor: '#111',
    hookFont: '700 13px system-ui, sans-serif',
    hookColor: '#000',
    hookBg: 'rgba(90,58,138,0.08)',
    chipBg: '#f0f0f0',
    chipColor: '#5a3a8a',
    lineH: 20,
  }, 118);

  drawOtakuDoodles(ctx, seed, W, H_MAX);
  return drawCardFooter(ctx, payload, 32, y + 12,
    '700 11px system-ui, sans-serif', '#333',
    '10px system-ui, sans-serif', 'rgba(0,0,0,0.35)');
}

function drawLinkedIn(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  ctx.fillStyle = '#f3f6f8';
  ctx.fillRect(0, 0, W, H_MAX);
  ctx.fillStyle = '#0a66c2';
  ctx.fillRect(0, 0, W, 56);
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('TALK NORMIE 2 ME  ·  LINKEDIN EDITION  🫡', 28, 35);
  ctx.textAlign = 'right';
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Agree?', W - 28, 35);

  ctx.textAlign = 'left';
  ctx.font = '700 26px system-ui, sans-serif';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(payload.repoName, 28, 96);
  ctx.strokeStyle = '#d0d7de';
  ctx.beginPath();
  ctx.moveTo(28, 110);
  ctx.lineTo(W - 28, 110);
  ctx.stroke();

  const y = drawRichContent(ctx, payload, {
    padX: 28,
    contentW: W - 56,
    labelFont: '700 10px system-ui, sans-serif',
    bodyFont: '15px system-ui, sans-serif',
    labelColor: '#0a66c2',
    bodyColor: '#1a1a1a',
    hookFont: '600 14px Georgia, serif',
    hookColor: '#333',
    hookBg: 'rgba(10,102,194,0.08)',
    chipBg: '#e8f0fe',
    chipColor: '#0a66c2',
    lineH: 22,
  }, 118);

  return drawCardFooter(ctx, payload, 28, y + 12,
    '600 12px system-ui, sans-serif', '#0a66c2',
    '11px system-ui, sans-serif', '#666');
}

function drawGrandma(ctx: CanvasRenderingContext2D, payload: ShareCardPayload): number {
  const seed = hashString(payload.repoName + payload.mode);
  ctx.fillStyle = '#fffaf5';
  ctx.fillRect(0, 0, W, H_MAX);
  drawPaperTexture(ctx, W, H_MAX, 0.02);
  ctx.strokeStyle = 'rgba(180,140,100,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, W - 32, H_MAX - 32);

  ctx.textAlign = 'left';
  ctx.font = '500 12px Georgia, serif';
  ctx.fillStyle = '#8a6a50';
  ctx.fillText('talk normie 2 me  ·  grandma edition  🧶', 40, 48);
  ctx.font = '600 24px Georgia, serif';
  ctx.fillStyle = '#3a2818';
  ctx.fillText(payload.repoName, 40, 88);
  ctx.strokeStyle = 'rgba(180,140,100,0.3)';
  ctx.beginPath();
  ctx.moveTo(40, 100);
  ctx.lineTo(W - 40, 100);
  ctx.stroke();

  const y = drawRichContent(ctx, payload, {
    padX: 40,
    contentW: W - 80,
    labelFont: '600 11px Georgia, serif',
    bodyFont: '16px Georgia, serif',
    labelColor: '#a08060',
    bodyColor: '#3a2818',
    hookFont: 'italic 15px Georgia, serif',
    hookColor: '#5a4030',
    hookBg: 'rgba(180,140,100,0.1)',
    chipBg: 'rgba(180,140,100,0.15)',
    chipColor: '#8a6a50',
    lineH: 23,
  }, 118);

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.font = '48px serif';
  ctx.fillText('🧶', W - 80, y - 20);
  ctx.restore();

  return drawCardFooter(ctx, payload, 40, y + 12,
    'italic 13px Georgia, serif', '#8a6a50',
    '12px Georgia, serif', 'rgba(138,106,80,0.7)');
}

type DrawerFn = (ctx: CanvasRenderingContext2D, payload: ShareCardPayload) => number;

export function generateShareCard(payload: ShareCardPayload): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H_MAX;
    const ctx = canvas.getContext('2d');
    if (!ctx) { resolve(''); return; }

    let endY = H_MAX;
    switch (payload.mode) {
      case 'poetry': endY = drawPoetry(ctx, payload); break;
      case 'emo': endY = drawEmo(ctx, payload); break;
      case 'bro': endY = drawBro(ctx, payload); break;
      case 'conspiracy': endY = drawConspiracy(ctx, payload); break;
      case 'flirty': endY = drawFlirty(ctx, payload); break;
      case 'brainrot': endY = drawBrainrot(ctx, payload); break;
      case 'sporty': endY = drawSporty(ctx, payload); break;
      case 'otaku': endY = drawOtaku(ctx, payload); break;
      case 'linkedin': endY = drawLinkedIn(ctx, payload); break;
      case 'grandma': endY = drawGrandma(ctx, payload); break;
      case 'fullnormie': endY = drawNormie(ctx, payload, true); break;
      default: endY = drawNormie(ctx, payload, false); break;
    }

    const finalH = Math.min(Math.max(endY + 24, H_MIN), H_MAX);
    const out = document.createElement('canvas');
    out.width = W;
    out.height = finalH;
    const outCtx = out.getContext('2d');
    if (!outCtx) { resolve(''); return; }
    outCtx.drawImage(canvas, 0, 0, W, finalH, 0, 0, W, finalH);
    resolve(out.toDataURL('image/png'));
  });
}
