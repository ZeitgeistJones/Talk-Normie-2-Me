'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Providers } from './providers';
import styles from './page.module.css';

const CLAWD_GATE = '0xc22B7b983EC81523c969753c2385106835E8CfCE' as const;
const CLAWD_GATE_ABI = [
  {
    name: 'hasAccess',
    type: 'function',
    inputs: [{ name: 'wallet', type: 'address' }, { name: 'tier', type: 'uint8' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  }
] as const;

const FREE_LIMIT = 2;

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
  const cache: Record<string, any> = {};

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
    const stored = parseInt(localStorage.getItem('tn2m_uses') || '0');
    setUseCount(stored);
  }, []);

  useEffect(() => {
    if (isUnlocked && showWall) setShowWall(false);
  }, [isUnlocked, showWall]);

  useEffect(() => {
    if (browseOpen && repos.length === 0) {
      setReposLoading(true);
      fetch('/api/repos')
        .then(r => r.json())
        .then(data => { setRepos(data); setReposLoading(false); })
        .catch(() => setReposLoading(false));
    }
  }, [browseOpen]);

  const isJob = (name: string, description?: string) =>
    name.startsWith('leftclaw-service-job') ||
    name.startsWith('cv-') ||
    name.startsWith('job-') ||
    (description || '').toLowerCase().includes('job ');

  const filteredRepos = repos
    .filter(r => !isJob(r.name, r.description))
    .filter(r =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase())
    );

  async function handleSubmit(repoUrl?: string) {
    const target = repoUrl || url;
    if (!target.trim()) return;

    if (!isUnlocked && useCount >= FREE_LIMIT) {
      setShowWall(true);
      return;
    }

    if (cache[target]) { setResult(cache[target]); return; }
    setLoading(true); setError(''); setResult(null);

    if (!isUnlocked) {
      const newCount = useCount + 1;
      setUseCount(newCount);
      localStorage.setItem('tn2m_uses', String(newCount));
    }

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      cache[target] = data;
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const sections = result?.explanation
    ? result.explanation.split('\n').reduce((acc: string[][], line: string) => {
        if (line.trim() === '') {
          if (acc[acc.length - 1]?.length > 0) acc.push([]);
        } else {
          if (!acc.length) acc.push([]);
          acc[acc.length - 1].push(line.trim());
        }
        return acc;
      }, [[]])
      .filter((s: string[]) => s.length > 0)
      .map((s: string[]) => s.join(' '))
    : [];

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
            <span className={dark ? styles.logoTextDark : styles.logoTextLight}>Talk Normie 2 Me</span>
          </div>
          <div className={styles.headerRight}>
            <button
              className={dark ? styles.darkToggleDark : styles.darkToggleLight}
              onClick={() => setDark(d => !d)}
              title={dark ? 'Back to normie mode' : 'Warning: less normie ahead'}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              className={dark ? styles.browseToggleDark : styles.browseToggleLight}
              onClick={() => setBrowseOpen(o => !o)}
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
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button className={dark ? styles.buttonDark : styles.buttonLight} onClick={() => handleSubmit()} disabled={loading}>
            {loading ? 'Thinking...' : 'Explain this'}
          </button>
        </div>

        {showWall && (
          <div className={dark ? styles.wallDark : styles.wallLight}>
            <p className={dark ? styles.wallHeadingDark : styles.wallHeadingLight}>
              This is where we find out who the real normies are.
            </p>
            <p className={dark ? styles.wallTextDark : styles.wallTextLight}>
              Two explains. That's the free tier. Grab 10M CLAWD, connect your wallet, and get back to talking normie.
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
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.repoList}>
              {filteredRepos.map(repo => (
                <div
                  key={repo.name}
                  className={`${dark ? styles.repoItemDark : styles.repoItemLight} ${activeRepo === repo.url ? (dark ? styles.repoItemActiveDark : styles.repoItemActiveLight) : ''}`}
                  onClick={() => { setActiveRepo(repo.url); setResult(null); setError(''); handleSubmit(repo.url); setBrowseOpen(false); }}
                >
                  <span className={styles.repoDot} style={{ background: LANG_COLORS[repo.language] || '#888' }} />
                  <div className={styles.repoInfo}>
                    <div className={dark ? styles.repoNameDark : styles.repoNameLight}>{repo.name}</div>
                    {repo.description && <div className={dark ? styles.repoDescDark : styles.repoDescLight}>{repo.description}</div>}
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
        {loading && <div className={dark ? styles.thinkingDark : styles.thinkingLight}>Thinking...</div>}

        {result && !showWall && (
          <div className={dark ? styles.resultDark : styles.resultLight}>
            <div className={dark ? styles.resultTopDark : styles.resultTopLight}>
              <span className={dark ? styles.resultNameDark : styles.resultNameLight}>{result.meta?.name}</span>
              {result.meta?.language && <span className={dark ? styles.badgeDark : styles.badgeLight}>{result.meta.language}</span>}
              {result.meta?.updatedAt && (
                <span className={dark ? styles.resultDateDark : styles.resultDateLight}>
                  updated {new Date(result.meta.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className={styles.resultBody}>
              {sections.map((section: string, i: number) => (
                <div key={i} className={dark ? styles.sectionDark : styles.sectionLight}>
                  <div className={dark ? styles.sectionLabelDark : styles.sectionLabelLight}>
                   {i === 0 ? 'What it is' : i === 1 ? 'Why it matters' : i === 2 ? 'Status' : 'Recent commits'}
                  </div>
                  <div className={dark ? styles.sectionTextDark : styles.sectionTextLight}>{section}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showWall && !isUnlocked && (
          <p className={dark ? styles.counterDark : styles.counterLight}>
            {FREE_LIMIT - useCount > 0 ? `${FREE_LIMIT - useCount} free explain${FREE_LIMIT - useCount === 1 ? '' : 's'} remaining` : ''}
          </p>
        )}

      </div>
    </main>
  );
}

export default function Home() {
  const [dark, setDark] = useState(false);
  return (
    <Providers dark={dark}>
      <App />
    </Providers>
  );
}
