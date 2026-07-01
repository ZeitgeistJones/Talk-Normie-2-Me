'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Providers } from './providers';
import { generateShareCard } from './shareCards';
import styles from './page.module.css';

const CLAWD_GATE = '0xc22B7b983EC81523c969753c2385106835E8CfCE' as const;
const CLAWD_GATE_ABI = [
  {
    name: 'hasAccess',
    type: 'function',
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'tier', type: 'uint8' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
] as const;

const FREE_LIMIT = 2;

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
  cta: string;
  url: string;
  language?: string;
  stars?: number;
  updatedAt?: string;
  repoUrl?: string;
};

const CACHE_STORAGE_KEY = 'tn2m_cache';
const MODE_STORAGE_KEY = 'tn2m_mode';
const MAX_CACHE_ENTRIES = 20;

type CacheEntry = {
  explanation: string;
  shareHook: string;
  repoUrl: string;
  meta: Record<string, unknown>;
};

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/$/, '').replace(/\.git$/, '');
}

function loadCacheFromStorage(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCacheToStorage(cache: Record<string, CacheEntry>) {
  const entries = Object.entries(cache);
  const trimmed =
    entries.length > MAX_CACHE_ENTRIES
      ? Object.fromEntries(entries.slice(entries.length - MAX_CACHE_ENTRIES))
      : cache;
  localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(trimmed));
}

async function isCacheStale(url: string, sha?: string): Promise<boolean> {
  if (!sha) return true;
  try {
    const res = await fetch(
      `/api/repo-stale?url=${encodeURIComponent(url)}&sha=${encodeURIComponent(sha)}`
    );
    const data = await res.json();
    return Boolean(data.stale);
  } catch {
    return true;
  }
}

const MODES: { id: PersonalityMode; label: string; emoji: string }[] = [
  { id: 'normie', label: 'Normie', emoji: '💬' },
  { id: 'fullnormie', label: 'Full Normie', emoji: '🧠' },
  { id: 'bro', label: 'Bro', emoji: '💪' },
  { id: 'flirty', label: 'Flirty', emoji: '😘' },
  { id: 'emo', label: 'Emo', emoji: '🖤' },
  { id: 'brainrot', label: 'Brainrot', emoji: '🫠' },
  { id: 'sporty', label: 'Sporty', emoji: '🏆' },
  { id: 'otaku', label: 'Otaku', emoji: '⚡' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '🫡' },
  { id: 'grandma', label: 'Grandma', emoji: '🧶' },
  { id: 'conspiracy', label: 'Conspiracy', emoji: '🕵️' },
  { id: 'poetry', label: 'Poetry', emoji: '🪶' },
];

const MODE_TEXT_STYLE: Record<PersonalityMode, React.CSSProperties> = {
  normie: { fontFamily: 'system-ui, sans-serif' },
  fullnormie: { fontFamily: 'system-ui, sans-serif', fontSize: '15px', lineHeight: '1.9', letterSpacing: '0.01em' },
  bro: { fontFamily: '"Arial Black", "Impact", system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: '1.5' },
  flirty: { fontFamily: 'Georgia, "Palatino Linotype", serif', fontStyle: 'italic', lineHeight: '1.85', fontSize: '14px' },
  emo: { fontFamily: '"Courier New", Courier, monospace', fontSize: '13px', lineHeight: '1.95', letterSpacing: '0.02em' },
  brainrot: { fontFamily: 'system-ui, sans-serif', letterSpacing: '0.03em', lineHeight: '1.8', fontSize: '13.5px' },
  sporty: {
    fontFamily: '"Arial Black", Impact, system-ui, sans-serif',
    fontWeight: 800,
    lineHeight: '1.45',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    fontSize: '12px',
  },
  otaku: { fontFamily: 'system-ui, sans-serif', lineHeight: '1.95', letterSpacing: '0.04em', fontSize: '13.5px' },
  linkedin: { fontFamily: 'system-ui, sans-serif', lineHeight: '1.75', fontSize: '14.5px', letterSpacing: '0.01em' },
  grandma: { fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: '1.9', fontSize: '15px', letterSpacing: '0.01em' },
  conspiracy: { fontFamily: '"Courier New", Courier, monospace', fontSize: '12.5px', lineHeight: '1.9', letterSpacing: '0.03em' },
  poetry: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontStyle: 'normal',
    fontSize: '15px',
    lineHeight: '1.95',
    letterSpacing: '0.005em',
    whiteSpace: 'pre-wrap',
  },
};

const MODE_LABEL_STYLE: Record<PersonalityMode, React.CSSProperties> = {
  normie: {},
  fullnormie: { fontSize: '11px' },
  bro: { fontFamily: '"Arial Black", Impact, sans-serif', letterSpacing: '0.15em', fontSize: '9px' },
  flirty: { fontFamily: 'Georgia, serif', fontStyle: 'italic', textTransform: 'none', letterSpacing: '0.02em', fontSize: '11px' },
  emo: { fontFamily: '"Courier New", monospace', letterSpacing: '0.12em' },
  brainrot: { letterSpacing: '0.1em' },
  sporty: { fontFamily: '"Arial Black", Impact, sans-serif', letterSpacing: '0.2em', fontSize: '9px' },
  otaku: { letterSpacing: '0.18em' },
  linkedin: { letterSpacing: '0.06em', fontSize: '10px', color: '#0a66c2' },
  grandma: { fontFamily: 'Georgia, serif', textTransform: 'none', fontStyle: 'italic', letterSpacing: '0.02em', fontSize: '11px' },
  conspiracy: { fontFamily: '"Courier New", monospace', letterSpacing: '0.15em', fontSize: '9px' },
  poetry: { fontFamily: 'Georgia, serif', textTransform: 'none', fontStyle: 'italic', letterSpacing: '0.01em', fontSize: '11px', opacity: 0.55 },
};

const SECTION_LABELS: Record<PersonalityMode, string[]> = {
  normie: ['What it is', 'Why it matters', 'Status', 'Recent commits', 'Why it stopped', 'About this tool'],
  fullnormie: ['What it is', 'Why it matters', 'Is it alive?', 'What changed', 'Why it stopped', 'About this tool'],
  bro: ['THE REP 💪', 'WHY IT SLAPS', 'ALIVE OR DEAD', 'RECENT PLAYS', 'WHY IT QUIT', 'WHAT IS THIS'],
  flirty: ['what it is 💋', 'why you want it', 'seeing anyone?', 'recently active', 'why it ghosted', 'so what is this'],
  emo: ['what this is', 'why it hurts', 'still breathing?', 'the last words', 'where it went', 'what even is this'],
  brainrot: ['the lore', 'why it bussin', 'still alive fr?', 'recent glazing', 'why it flopped', 'what is this app'],
  sporty: ['THE PLAYBOOK', 'WHY IT WINS', 'GAME STATUS', 'RECENT PLAYS', 'FINAL WHISTLE', 'THE PROGRAM'],
  otaku: ['the lore', 'power level', 'arc status', 'episode recap', 'why it ended', 'what is this'],
  linkedin: ['the thesis', 'who this serves', 'momentum check', 'recent wins', 'why the arc paused', 'grateful plug'],
  grandma: ['what it is, dear', 'who needs this', 'still going?', 'recent news', 'where it went', 'what is this website'],
  conspiracy: ['the cover story', 'the real reason', 'still active?', 'the trail', 'why it went dark', 'what is this operation'],
  poetry: ['i.', 'ii.', 'iii.', 'iv.', 'v.'],
};

type Repo = {
  name: string;
  description: string;
  url: string;
  language: string;
  pushedAt: string;
  stars: number;
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3b82f6',
  JavaScript: '#f59e0b',
  Python: '#f59e0b',
  Shell: '#10b981',
  Solidity: '#8b5cf6',
  HTML: '#ef4444',
};

function stripSectionLabel(text: string): string {
  return text
    .replace(/^#+\s+[IVX]+\.\s+[^\n]*/gm, '')
    .replace(/^\*?\*?Section\s+\d+[:\s][^\n]*\*?\*?\s*/gim, '')
    .replace(/^\*\*[^*]+\*\*\s*/gm, '')
    .replace(/^---+\s*$/gm, '')
    .replace(/\bsilence\b/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parsePoetryStanzas(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((s) => stripSectionLabel(s).trim())
    .filter((s) => s.length > 0);
}

function getModeCTA(mode: PersonalityMode): string {
  switch (mode) {
    case 'poetry':
      return 'read the rest at';
    case 'emo':
      return 'if you want the whole page, it is at';
    case 'bro':
      return 'full breakdown at';
    case 'conspiracy':
      return 'review the full file at';
    case 'flirty':
      return 'see the full thing at';
    case 'brainrot':
      return 'full lore dump at';
    case 'sporty':
      return 'watch the full tape at';
    case 'otaku':
      return 'continue the arc at';
    case 'linkedin':
      return 'read the full breakdown at';
    case 'grandma':
      return 'see the whole explanation at';
    case 'fullnormie':
      return 'see the simple version at';
    case 'normie':
    default:
      return 'check it out at';
  }
}

function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

function buildSharePayload(result: any, mode: PersonalityMode): ShareCardPayload {
  const explanation = String(result?.explanation || '').trim();

  const proseSections =
    mode === 'poetry'
      ? parsePoetryStanzas(explanation)
      : explanation
          .split('\n')
          .reduce((acc: string[][], line: string) => {
            if (line.trim() === '') {
              if (acc[acc.length - 1]?.length > 0) acc.push([]);
            } else {
              if (!acc.length) acc.push([]);
              acc[acc.length - 1].push(line.trim());
            }
            return acc;
          }, [[]])
          .filter((s: string[]) => s.length > 0)
          .map((s: string[]) => stripSectionLabel(s.join(' ')))
          .filter((s: string) => s.length > 0);

  const whatIsIt =
    proseSections[0] ||
    result?.meta?.description ||
    `an AI-translated explanation of ${result?.meta?.name || 'this repo'}`;

  const example = proseSections[1] || proseSections[0] || explanation || result?.shareHook || '';

  const status = proseSections[2] || '';
  const recentActivity = proseSections[3] || '';

  return {
    repoName: result?.meta?.name || 'repo',
    mode,
    hook: result?.shareHook || `explained ${result?.meta?.name || 'repo'} on Talk Normie 2 Me`,
    whatIsIt,
    example,
    status,
    recentActivity,
    cta: getModeCTA(mode),
    url: 'https://talk-normie-2-me.vercel.app',
    language: result?.meta?.language,
    stars: result?.meta?.stars,
    updatedAt: result?.meta?.updatedAt,
    repoUrl: result?.repoUrl,
  };
}

function buildCopyText(result: any, mode: PersonalityMode, sections: string[]): string {
  const labels = SECTION_LABELS[mode];
  const lines: string[] = [];
  if (result?.shareHook) lines.push(result.shareHook, '');
  sections.forEach((section, i) => {
    lines.push(`${labels[i] ?? labels[labels.length - 1]}`, section, '');
  });
  if (result?.repoUrl) lines.push(result.repoUrl);
  lines.push('https://talk-normie-2-me.vercel.app');
  return lines.join('\n');
}

function ShareButton({ result, mode, dark }: { result: any; mode: PersonalityMode; dark: boolean }) {
  const [saved, setSaved] = useState(false);
  const [building, setBuilding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  async function handleShare() {
    setBuilding(true);
    const payload = buildSharePayload(result, mode);
    const dataUrl = await generateShareCard(payload);
    setBuilding(false);
    if (!dataUrl) return;

    setPreviewUrl(dataUrl);
    const res = await fetch(dataUrl);
    setPreviewBlob(await res.blob());
  }

  function closePreview() {
    setPreviewUrl(null);
    setPreviewBlob(null);
  }

  function downloadImage() {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = `tn2m-${mode}-${result?.meta?.name || 'card'}.png`;
    link.href = previewUrl;
    link.click();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  async function nativeShare() {
    if (!previewBlob || !canNativeShare()) return;
    const file = new File([previewBlob], `tn2m-${mode}-${result?.meta?.name || 'card'}.png`, {
      type: 'image/png',
    });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${result?.meta?.name} — Talk Normie 2 Me`,
      });
    }
  }

  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <>
      <button
        onClick={handleShare}
        className={dark ? styles.shareBtnDark : styles.shareBtnLight}
        title="Preview and save share image"
        disabled={building}
      >
        {building ? 'building card...' : saved ? '✓ saved image' : 'save image'}
      </button>

      {previewUrl && (
        <div className={styles.modalOverlay} onClick={closePreview}>
          <div
            className={dark ? styles.modalCardDark : styles.modalCardLight}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={dark ? styles.modalHeaderDark : styles.modalHeaderLight}>
              <span>{result?.meta?.name}</span>
              <span className={dark ? styles.modeBadgeDark : styles.modeBadgeLight}>
                {currentMode.emoji} {currentMode.label}
              </span>
            </div>
            <img src={previewUrl} alt="Share card preview" className={styles.modalImage} />
            <div className={styles.modalActions}>
              <button
                className={dark ? styles.modalBtnPrimaryDark : styles.modalBtnPrimaryLight}
                onClick={downloadImage}
              >
                Download PNG
              </button>
              {canNativeShare() && previewBlob && (
                <button
                  className={dark ? styles.modalBtnSecondaryDark : styles.modalBtnSecondaryLight}
                  onClick={nativeShare}
                >
                  Share…
                </button>
              )}
              <button
                className={dark ? styles.modalBtnSecondaryDark : styles.modalBtnSecondaryLight}
                onClick={closePreview}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CopyButton({
  result,
  mode,
  dark,
  sections,
}: {
  result: any;
  mode: PersonalityMode;
  dark: boolean;
  sections: string[];
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(buildCopyText(result, mode, sections));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={dark ? styles.copyBtnDark : styles.copyBtnLight}
      title="Copy explanation as text"
    >
      {copied ? '✓ copied' : 'copy text'}
    </button>
  );
}

function PoetryView({ explanation, dark }: { explanation: string; dark: boolean }) {
  const stanzas = parsePoetryStanzas(explanation);
  const labels = SECTION_LABELS.poetry;

  return (
    <div className={dark ? styles.poetryBodyDark : styles.poetryBodyLight}>
      {stanzas.map((stanza, i) => (
        <div key={i} className={dark ? styles.poetryStanzaDark : styles.poetryStanzaLight}>
          <span className={dark ? styles.poetryNumeralDark : styles.poetryNumeralLight}>
            {labels[i] ?? labels[labels.length - 1]}
          </span>
          <p className={dark ? styles.poetryTextDark : styles.poetryTextLight}>{stanza}</p>
        </div>
      ))}
    </div>
  );
}

function App({ dark, setDark }: { dark: boolean; setDark: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [activeRepo, setActiveRepo] = useState('');
  const [search, setSearch] = useState('');
  const [useCount, setUseCount] = useState(0);
  const [showWall, setShowWall] = useState(false);
  const [mode, setMode] = useState<PersonalityMode>('normie');
  const [activeUrl, setActiveUrl] = useState('');
  const [needsReexplain, setNeedsReexplain] = useState(false);
  const cache = useRef<Record<string, CacheEntry>>({});

  const { address, isConnected } = useAccount();

  const { data: hasAccess } = useReadContract({
    address: CLAWD_GATE,
    abi: CLAWD_GATE_ABI,
    functionName: 'hasAccess',
    args: address ? [address, 1] : undefined,
    chainId: 8453,
    query: { enabled: !!address },
  });

  const isUnlocked = isConnected && Boolean(hasAccess);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem('tn2m_uses') || '0', 10);
    setUseCount(stored);
    cache.current = loadCacheFromStorage();
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY) as PersonalityMode | null;
    if (storedMode && MODES.some((m) => m.id === storedMode)) {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked && showWall) setShowWall(false);
  }, [isUnlocked, showWall]);

  useEffect(() => {
    if (browseOpen && repos.length === 0) {
      setReposLoading(true);
      fetch('/api/repos')
        .then((r) => r.json())
        .then((data) => {
          setRepos(data);
          setReposLoading(false);
        })
        .catch(() => setReposLoading(false));
    }
  }, [browseOpen, repos.length]);

  const isJob = (name: string, description?: string) =>
    name.startsWith('leftclaw-service-job') ||
    name.startsWith('cv-') ||
    name.startsWith('job-') ||
    (description || '').toLowerCase().includes('job ');

  const filteredRepos = repos
    .filter((r) => !isJob(r.name, r.description))
    .filter(
      (r) =>
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(search.toLowerCase())
    );

  function cycleMode() {
    const idx = MODES.findIndex((m) => m.id === mode);
    const next = MODES[(idx + 1) % MODES.length];
    setMode(next.id);
    localStorage.setItem(MODE_STORAGE_KEY, next.id);

    if (!activeUrl) return;

    const cacheKey = `${normalizeUrl(activeUrl)}__${next.id}`;
    const cached = cache.current[cacheKey];
    if (cached) {
      void (async () => {
        const stale = await isCacheStale(activeUrl, cached.meta?.latestCommitSha as string | undefined);
        if (!stale) {
          setResult(cached);
          setNeedsReexplain(false);
        } else {
          delete cache.current[cacheKey];
          saveCacheToStorage(cache.current);
          setNeedsReexplain(true);
        }
      })();
    } else {
      setNeedsReexplain(true);
    }
  }

  async function tryLoadCache(target: string, personality: PersonalityMode): Promise<CacheEntry | null> {
    const cacheKey = `${normalizeUrl(target)}__${personality}`;
    const cached = cache.current[cacheKey];
    if (!cached) return null;

    const stale = await isCacheStale(target, cached.meta?.latestCommitSha as string | undefined);
    if (stale) {
      delete cache.current[cacheKey];
      saveCacheToStorage(cache.current);
      return null;
    }
    return cached;
  }

  async function handleSubmit(repoUrl?: string, force = false) {
    const target = repoUrl || url;
    if (!target.trim()) return;

    if (!isUnlocked && useCount >= FREE_LIMIT && !force) {
      setShowWall(true);
      return;
    }

    setActiveUrl(target);

    if (!force) {
      const cached = await tryLoadCache(target, mode);
      if (cached) {
        setResult(cached);
        setNeedsReexplain(false);
        return;
      }
    }

    setLoading(true);
    setError('');
    setResult(null);
    setNeedsReexplain(false);

    if (!isUnlocked && !force) {
      const newCount = useCount + 1;
      setUseCount(newCount);
      localStorage.setItem('tn2m_uses', String(newCount));
    }

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, mode }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const cacheKey = `${normalizeUrl(target)}__${mode}`;
      cache.current[cacheKey] = data;
      saveCacheToStorage(cache.current);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const sections =
    result?.explanation && mode !== 'poetry'
      ? result.explanation
          .split('\n')
          .reduce((acc: string[][], line: string) => {
            if (line.trim() === '') {
              if (acc[acc.length - 1]?.length > 0) acc.push([]);
            } else {
              if (!acc.length) acc.push([]);
              acc[acc.length - 1].push(line.trim());
            }
            return acc;
          }, [[]])
          .filter((s: string[]) => s.length > 0)
          .map((s: string[]) => stripSectionLabel(s.join(' ')))
          .filter((s: string) => s.length > 0)
      : [];

  const currentMode = MODES.find((m) => m.id === mode)!;
  const labels = SECTION_LABELS[mode];
  const textStyle = MODE_TEXT_STYLE[mode];
  const labelStyle = MODE_LABEL_STYLE[mode];

  const thinkingMessages: Record<PersonalityMode, string> = {
    normie: 'Thinking...',
    fullnormie: 'Making it super simple...',
    flirty: 'Sliding into your DMs...',
    emo: 'Staring into the void...',
    bro: 'Getting gains on this...',
    conspiracy: 'Following the threads...',
    brainrot: 'Cooking fr fr...',
    sporty: 'Warming up...',
    otaku: 'Entering the arc...',
    linkedin: 'Drafting a humble post...',
    grandma: 'Putting on reading glasses...',
    poetry: 'Dipping the pen...',
  };

  const getModeResultClass = () => {
    if (mode === 'poetry') return dark ? styles.resultPoetryDark : styles.resultPoetryLight;
    if (mode === 'emo') return dark ? styles.resultEmoDark : styles.resultEmoLight;
    if (mode === 'conspiracy') return dark ? styles.resultConspiracyDark : styles.resultConspiracyLight;
    if (mode === 'bro') return dark ? styles.resultBroDark : styles.resultBroLight;
    if (mode === 'sporty') return dark ? styles.resultSportyDark : styles.resultSportyLight;
    if (mode === 'flirty') return dark ? styles.resultFlirtyDark : styles.resultFlirtyLight;
    if (mode === 'brainrot') return dark ? styles.resultBrainrotDark : styles.resultBrainrotLight;
    if (mode === 'otaku') return dark ? styles.resultOtakuDark : styles.resultOtakuLight;
    if (mode === 'linkedin') return dark ? styles.resultLinkedinDark : styles.resultLinkedinLight;
    if (mode === 'grandma') return dark ? styles.resultGrandmaDark : styles.resultGrandmaLight;
    if (mode === 'fullnormie') return dark ? styles.resultFullnormieDark : styles.resultFullnormieLight;
    return dark ? styles.resultDark : styles.resultLight;
  };

  const getHookClass = () => {
    if (mode === 'flirty') return dark ? styles.hookFlirtyDark : styles.hookFlirtyLight;
    if (mode === 'linkedin') return dark ? styles.hookLinkedinDark : styles.hookLinkedinLight;
    if (mode === 'grandma') return dark ? styles.hookGrandmaDark : styles.hookGrandmaLight;
    if (mode === 'conspiracy') return dark ? styles.hookConspiracyDark : styles.hookConspiracyLight;
    return dark ? styles.hookDark : styles.hookLight;
  };

  return (
    <main className={dark ? styles.mainDark : styles.mainLight}>
      <div className={styles.container} data-mode={mode} data-theme={dark ? 'dark' : 'light'}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={dark ? styles.logoIconDark : styles.logoIconLight}>
              <div className={dark ? styles.bubbleBigDark : styles.bubbleBigLight}>
                <span className={dark ? styles.dotDark : styles.dotLight} />
                <span className={dark ? styles.dotDark : styles.dotLight} />
                <span className={dark ? styles.dotDark : styles.dotLight} />
              </div>
              <div className={dark ? styles.bubbleSmallDark : styles.bubbleSmallLight} />
            </div>
            <span className={dark ? styles.logoTextDark : styles.logoTextLight}>
              Talk{' '}
              <button
                className={dark ? styles.modeWordDark : styles.modeWordLight}
                onClick={cycleMode}
                title={`Switch mode (currently ${currentMode.label})`}
              >
                {currentMode.label}
              </button>{' '}
              2 Me
            </span>
          </div>

          <div className={styles.headerRight}>
            <button
              className={dark ? styles.darkToggleDark : styles.darkToggleLight}
              onClick={() => setDark((d) => !d)}
              title={dark ? 'Back to normie mode' : 'Warning: less normie ahead'}
            >
              {dark ? '☀️' : '🌙'}
            </button>

            <button
              className={dark ? styles.browseToggleDark : styles.browseToggleLight}
              onClick={() => setBrowseOpen((o) => !o)}
            >
              <span>{browseOpen ? 'Close' : 'Browse CLAWD repos'}</span>
              <span>{browseOpen ? '↑' : '↓'}</span>
            </button>
          </div>
        </div>

        <p className={dark ? styles.taglineDark : styles.taglineLight}>
          {dark ? 'Still plain English, just darker.' : 'Paste any GitHub link. Get a plain English breakdown.'}
        </p>

        {browseOpen && (
          <p className={dark ? styles.clawdHintDark : styles.clawdHintLight}>
            CLAWD repos include context on why each build matters for token holders — not just what it does.
          </p>
        )}

        <div className={styles.searchRow}>
          <input
            className={dark ? styles.inputDark : styles.inputLight}
            type="text"
            placeholder="https://github.com/someone/something"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            className={dark ? styles.buttonDark : styles.buttonLight}
            onClick={() => handleSubmit()}
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Explain'}
          </button>
        </div>

        {showWall && (
          <div className={dark ? styles.wallDark : styles.wallLight}>
            <p className={dark ? styles.wallHeadingDark : styles.wallHeadingLight}>
              This is where we find out who the real normies are.
            </p>
            <p className={dark ? styles.wallTextDark : styles.wallTextLight}>
              Two explains. That&apos;s the free tier. Grab 10M CLAWD, connect your wallet, and get back to talking normie.
            </p>
            <div className={styles.wallConnect}>
              <ConnectButton />
            </div>
          </div>
        )}

        {browseOpen && !showWall && (
          <div className={dark ? styles.browsePanelDark : styles.browsePanelLight}>
            <div className={dark ? styles.browseHeaderDark : styles.browseHeaderLight}>
              <span className={dark ? styles.browseTitleDark : styles.browseTitleLight}>
                {reposLoading ? 'Loading...' : `${filteredRepos.length} builds`}
              </span>
              <input
                className={dark ? styles.browseSearchDark : styles.browseSearchLight}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.repoList}>
              {filteredRepos.map((repo) => (
                <div
                  key={repo.name}
                  className={`${dark ? styles.repoItemDark : styles.repoItemLight} ${
                    activeRepo === repo.url
                      ? dark
                        ? styles.repoItemActiveDark
                        : styles.repoItemActiveLight
                      : ''
                  }`}
                  onClick={() => {
                    setActiveRepo(repo.url);
                    setUrl(repo.url);
                    setError('');
                    handleSubmit(repo.url);
                    setBrowseOpen(false);
                  }}
                >
                  <span className={styles.repoDot} style={{ background: LANG_COLORS[repo.language] || '#888' }} />
                  <div className={styles.repoInfo}>
                    <div className={dark ? styles.repoNameDark : styles.repoNameLight}>{repo.name}</div>
                    {repo.description && (
                      <div className={dark ? styles.repoDescDark : styles.repoDescLight}>{repo.description}</div>
                    )}
                  </div>
                  <span className={dark ? styles.repoDateDark : styles.repoDateLight}>
                    {new Date(repo.pushedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className={dark ? styles.errorDark : styles.errorLight}>{error}</div>}
        {loading && <div className={dark ? styles.thinkingDark : styles.thinkingLight}>{thinkingMessages[mode]}</div>}

        {result && !showWall && (
          <div className={getModeResultClass()}>
            <div
              className={
                mode === 'poetry'
                  ? dark
                    ? styles.resultTopPoetryDark
                    : styles.resultTopPoetryLight
                  : dark
                  ? styles.resultTopDark
                  : styles.resultTopLight
              }
            >
              <span className={dark ? styles.resultNameDark : styles.resultNameLight}>
                {result.meta?.name}
              </span>

              {result.meta?.language && (
                <span className={dark ? styles.badgeDark : styles.badgeLight}>
                  {result.meta.language}
                </span>
              )}

              {result.meta?.stars != null && result.meta.stars > 0 && (
                <span className={dark ? styles.badgeDark : styles.badgeLight}>
                  ★ {result.meta.stars}
                </span>
              )}

              {result.meta?.isAbandoned != null && mode !== 'poetry' && (
                <span
                  className={
                    result.meta.isAbandoned
                      ? dark
                        ? styles.badgeAbandonedDark
                        : styles.badgeAbandonedLight
                      : dark
                      ? styles.badgeActiveDark
                      : styles.badgeActiveLight
                  }
                >
                  {result.meta.isAbandoned ? 'abandoned' : 'active'}
                </span>
              )}

              {mode !== 'normie' && (
                <span className={dark ? styles.modeBadgeDark : styles.modeBadgeLight}>
                  {currentMode.emoji} {currentMode.label}
                </span>
              )}

              {result.meta?.updatedAt && mode !== 'poetry' && (
                <span className={dark ? styles.resultDateDark : styles.resultDateLight}>
                  updated{' '}
                  {new Date(result.meta.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}

              <div className={styles.resultActions}>
                <CopyButton result={result} mode={mode} dark={dark} sections={sections} />
                <ShareButton result={result} mode={mode} dark={dark} />
              </div>
            </div>

            {needsReexplain && activeUrl && (
              <div className={dark ? styles.reexplainBarDark : styles.reexplainBarLight}>
                <span>Viewing a different personality —</span>
                <button
                  className={dark ? styles.reexplainBtnDark : styles.reexplainBtnLight}
                  onClick={() => handleSubmit(activeUrl, true)}
                  disabled={loading}
                >
                  Re-explain in {currentMode.label}
                </button>
              </div>
            )}

            {result.shareHook && mode !== 'poetry' && (
              <div className={getHookClass()}>{result.shareHook}</div>
            )}

            {mode === 'poetry' ? (
              <PoetryView explanation={result.explanation} dark={dark} />
            ) : (
              <div className={styles.resultBody}>
                {sections.map((section: string, i: number) => (
                  <div key={i} className={dark ? styles.sectionDark : styles.sectionLight}>
                    <div
                      className={dark ? styles.sectionLabelDark : styles.sectionLabelLight}
                      style={labelStyle}
                    >
                      {labels[i] ?? labels[labels.length - 1]}
                    </div>
                    <div
                      className={dark ? styles.sectionTextDark : styles.sectionTextLight}
                      style={textStyle}
                    >
                      {section}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!showWall && !isUnlocked && (
          <p className={dark ? styles.counterDark : styles.counterLight}>
            {FREE_LIMIT - useCount > 0
              ? `${FREE_LIMIT - useCount} free explain${FREE_LIMIT - useCount === 1 ? '' : 's'} remaining`
              : ''}
          </p>
        )}
      </div>
    </main>
  );
}

function AppShell() {
  const [dark, setDark] = useState(false);
  return (
    <Providers dark={dark}>
      <App dark={dark} setDark={setDark} />
    </Providers>
  );
}

export default function Home() {
  return <AppShell />;
}
