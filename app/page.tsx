'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Providers } from './providers';
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
  | 'poetry';

const MODES: { id: PersonalityMode; label: string; emoji: string }[] = [
  { id: 'normie', label: 'Normie', emoji: '💬' },
  { id: 'fullnormie', label: 'Full Normie', emoji: '🧠' },
  { id: 'bro', label: 'Bro', emoji: '💪' },
  { id: 'flirty', label: 'Flirty', emoji: '😘' },
  { id: 'emo', label: 'Emo', emoji: '🖤' },
  { id: 'brainrot', label: 'Brainrot', emoji: '🫠' },
  { id: 'sporty', label: 'Sporty', emoji: '🏆' },
  { id: 'otaku', label: 'Otaku', emoji: '⚡' },
  { id: 'conspiracy', label: 'Conspiracy', emoji: '🕵️' },
  { id: 'poetry', label: 'Poetry', emoji: '🪶' },
];

const MODE_TEXT_STYLE: Record<PersonalityMode, React.CSSProperties> = {
  normie: { fontFamily: 'system-ui, sans-serif' },
  fullnormie: {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '15px',
    lineHeight: '1.9',
    letterSpacing: '0.01em',
  },
  bro: {
    fontFamily: '"Arial Black", "Impact", system-ui, sans-serif',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    lineHeight: '1.5',
  },
  flirty: {
    fontFamily: 'Georgia, "Palatino Linotype", serif',
    fontStyle: 'italic',
    lineHeight: '1.85',
    fontSize: '14px',
  },
  emo: {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '13px',
    lineHeight: '1.95',
    letterSpacing: '0.02em',
  },
  brainrot: {
    fontFamily: 'system-ui, sans-serif',
    letterSpacing: '0.03em',
    lineHeight: '1.8',
    fontSize: '13.5px',
  },
  sporty: {
    fontFamily: '"Arial Black", Impact, system-ui, sans-serif',
    fontWeight: 800,
    lineHeight: '1.45',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    fontSize: '12px',
  },
  otaku: {
    fontFamily: 'system-ui, sans-serif',
    lineHeight: '1.95',
    letterSpacing: '0.04em',
    fontSize: '13.5px',
  },
  conspiracy: {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '12.5px',
    lineHeight: '1.9',
    letterSpacing: '0.03em',
  },
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
  bro: {
    fontFamily: '"Arial Black", Impact, sans-serif',
    letterSpacing: '0.15em',
    fontSize: '9px',
  },
  flirty: {
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'none',
    letterSpacing: '0.02em',
    fontSize: '11px',
  },
  emo: {
    fontFamily: '"Courier New", monospace',
    letterSpacing: '0.12em',
  },
  brainrot: { letterSpacing: '0.1em' },
  sporty: {
    fontFamily: '"Arial Black", Impact, sans-serif',
    letterSpacing: '0.2em',
    fontSize: '9px',
  },
  otaku: { letterSpacing: '0.18em' },
  conspiracy: {
    fontFamily: '"Courier New", monospace',
    letterSpacing: '0.15em',
    fontSize: '9px',
  },
  poetry: {
    fontFamily: 'Georgia, serif',
    textTransform: 'none',
    fontStyle: 'italic',
    letterSpacing: '0.01em',
    fontSize: '11px',
    opacity: 0.55,
  },
};

function stripSectionLabel(text: string): string {
  return text
    .replace(/^#+\s+[IVX]+\.\s+[^\n]*/gm, '')
    .replace(/^\*?\*?Section\s+\d+[:\s][^\n]*\*?\*?\s*/i, '')
    .replace(/^\*\*[^*]+\*\*\s*/, '')
    .replace(/^---+\s*/gm, '')
    .replace(/^\s*\n/, '')
    .trim();
}

function parsePoetryStanzas(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.match(/^#+\s/) && !s.match(/^---+$/));
}

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

const SECTION_LABELS: Record<PersonalityMode, string[]> = {
  normie: ['What it is', 'Why it matters', 'Status', 'Recent commits', 'Why it stopped'],
  fullnormie: ['What it is', 'Why it matters', 'Is it alive?', 'What changed', 'Why it stopped'],
  bro: ['THE REP 💪', 'WHY IT SLAPS', 'ALIVE OR DEAD', 'RECENT PLAYS', 'WHY IT QUIT'],
  flirty: ['what it is 💋', 'why you want it', 'seeing anyone?', 'recently active', 'why it ghosted'],
  emo: ['what this is', 'why it hurts', 'still breathing?', 'the last words', 'where it went'],
  brainrot: ['the lore', 'why it bussin', 'still alive fr?', 'recent glazing', 'why it flopped'],
  sporty: ['THE PLAYBOOK', 'WHY IT WINS', 'GAME STATUS', 'RECENT PLAYS', 'FINAL WHISTLE'],
  otaku: ['the lore', 'power level', 'arc status', 'episode recap', 'why it ended'],
  conspiracy: ['the cover story', 'the real reason', 'still active?', 'the trail', 'why it went dark'],
  poetry: ['i.', 'ii.', 'iii.', 'iv.', 'v.'],
};

function useShareCard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCard = useCallback(
    (repoName: string, hook: string, mode: PersonalityMode, modeEmoji: string): Promise<string> => {
      return new Promise((resolve) => {
        const W = 900;
        const H = 540;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        canvasRef.current = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        ctx.fillStyle = '#faf8f4';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(180,170,155,0.35)';
        ctx.lineWidth = 1;
        for (let y = 72; y < H - 40; y += 32) {
          ctx.beginPath();
          ctx.moveTo(60, y);
          ctx.lineTo(W - 60, y);
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(210,100,90,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(108, 40);
        ctx.lineTo(108, H - 40);
        ctx.stroke();

        ctx.fillStyle = 'rgba(200,195,185,0.5)';
        [120, H / 2, H - 120].forEach((y) => {
          ctx.beginPath();
          ctx.arc(32, y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(160,155,148,0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        ctx.font = '500 13px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(140,130,115,0.8)';
        ctx.textAlign = 'right';
        ctx.fillText('talk normie 2 me', W - 60, 52);

        ctx.textAlign = 'left';
        ctx.font = '500 12px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(160,150,135,0.7)';
        ctx.fillText(`${modeEmoji} ${mode}`, 128, 52);

        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillStyle = '#2a2218';
        ctx.fillText(repoName, 128, 108);

        ctx.strokeStyle = 'rgba(180,170,155,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(128, 120);
        ctx.lineTo(W - 60, 120);
        ctx.stroke();

        const isPoetry = mode === 'poetry';
        ctx.font = isPoetry ? 'italic 17px Georgia, serif' : '15px system-ui, sans-serif';
        ctx.fillStyle = '#3a3020';

        const lines = hook.split('\n');
        let y = 162;
        const maxW = W - 190;

        for (const rawLine of lines) {
          if (rawLine.trim() === '') {
            y += 20;
            continue;
          }

          const words = rawLine.split(' ');
          let line = '';

          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            const m = ctx.measureText(test);

            if (m.width > maxW && line) {
              ctx.fillText(line, 128, y);
              line = word;
              y += 32;
            } else {
              line = test;
            }
          }

          if (line) {
            ctx.fillText(line, 128, y);
            y += 32;
          }
        }

        ctx.font = '500 12px "Courier New", monospace';
        ctx.fillStyle = 'rgba(150,140,125,0.8)';
        ctx.fillText('talk-normie-2-me.vercel.app', 128, H - 56);

        resolve(canvas.toDataURL('image/png'));
      });
    },
    []
  );

  return { generateCard };
}

function ShareButton({
  result,
  mode,
  dark,
}: {
  result: any;
  mode: PersonalityMode;
  dark: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { generateCard } = useShareCard();
  const currentMode = MODES.find((m) => m.id === mode)!;

  async function handleShare() {
    const hook = result.shareHook || `explained ${result.meta?.name} on Talk Normie 2 Me`;
    const appUrl = 'https://talk-normie-2-me.vercel.app';

    const dataUrl = await generateCard(result.meta?.name || 'repo', hook, mode, currentMode.emoji);

    const tweetText = `${hook}\n\n${appUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `tn2m-${result.meta?.name || 'card'}.png`;
      link.href = dataUrl;
      link.click();
    }

    navigator.clipboard.writeText(tweetText).catch(() => {});
    setTimeout(() => window.open(twitterUrl, '_blank', 'width=600,height=400'), 300);

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleShare}
      className={dark ? styles.shareBtnDark : styles.shareBtnLight}
      title="Download card + share on X"
    >
      {copied ? '✓ card saved' : '𝕏 share'}
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

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [activeRepo, setActiveRepo] = useState('');
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(false);
  const [useCount, setUseCount] = useState(0);
  const [showWall, setShowWall] = useState(false);
  const [mode, setMode] = useState<PersonalityMode>('normie');
  const cache = useRef<Record<string, any>>({});

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
    setResult(null);
  }

  async function handleSubmit(repoUrl?: string) {
    const target = repoUrl || url;
    if (!target.trim()) return;

    if (!isUnlocked && useCount >= FREE_LIMIT) {
      setShowWall(true);
      return;
    }

    const cacheKey = `${target}__${mode}`;
    if (cache.current[cacheKey]) {
      setResult(cache.current[cacheKey]);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    if (!isUnlocked) {
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

      cache.current[cacheKey] = data;
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
    poetry: 'Dipping the pen...',
  };

  const getModeResultClass = () => {
    if (mode === 'poetry') return dark ? styles.resultPoetryDark : styles.resultPoetryLight;
    if (mode === 'emo') return dark ? styles.resultEmoDark : styles.resultEmoLight;
    if (mode === 'conspiracy') return dark ? styles.resultConspiracyDark : styles.resultConspiracyLight;
    if (mode === 'bro') return dark ? styles.resultBroDark : styles.resultBroLight;
    if (mode === 'sporty') return dark ? styles.resultSportyDark : styles.resultSportyLight;
    return dark ? styles.resultDark : styles.resultLight;
  };

  return (
    <main className={dark ? styles.mainDark : styles.mainLight}>
      <div className={styles.container}>
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
          {dark
            ? 'Still plain English, just darker.'
            : 'Paste any GitHub link. Get a plain English breakdown.'}
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
              Two explains. That&apos;s the free tier. Grab 10M CLAWD, connect your wallet, and get back to
              talking normie.
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
                    setResult(null);
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
                    {new Date(repo.pushedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className={dark ? styles.errorDark : styles.errorLight}>{error}</div>}

        {loading && (
          <div className={dark ? styles.thinkingDark : styles.thinkingLight}>{thinkingMessages[mode]}</div>
        )}

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
              <span className={dark ? styles.resultNameDark : styles.resultNameLight}>{result.meta?.name}</span>

              {result.meta?.language && (
                <span className={dark ? styles.badgeDark : styles.badgeLight}>{result.meta.language}</span>
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

              <ShareButton result={result} mode={mode} dark={dark} />
            </div>

            {mode === 'poetry' ? (
              <PoetryView explanation={result.explanation} dark={dark} />
            ) : (
              <div className={styles.resultBody}>
                {sections.map((section: string, i: number) => (
                  <div key={i} className={dark ? styles.sectionDark : styles.sectionLight}>
                    <div className={dark ? styles.sectionLabelDark : styles.sectionLabelLight} style={labelStyle}>
                      {labels[i] ?? labels[labels.length - 1]}
                    </div>
                    <div className={dark ? styles.sectionTextDark : styles.sectionTextLight} style={textStyle}>
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

export default function Home() {
  return (
    <Providers>
      <App />
    </Providers>
  );
}
