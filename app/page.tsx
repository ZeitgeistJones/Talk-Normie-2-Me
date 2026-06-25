'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

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

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [activeRepo, setActiveRepo] = useState('');
  const [search, setSearch] = useState('');
  const cache: Record<string, any> = {};

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
    if (cache[target]) { setResult(cache[target]); return; }
    setLoading(true); setError(''); setResult(null);
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
    <main className={styles.main}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <div className={styles.bubbleBig}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <div className={styles.bubbleSmall} />
            </div>
            <span className={styles.logoText}>Talk Normie 2 Me</span>
          </div>
          <button
            className={`${styles.browseToggle} ${browseOpen ? styles.browseToggleActive : ''}`}
            onClick={() => setBrowseOpen(o => !o)}
          >
            <span>Browse CLAWD repos</span>
            <span className={styles.toggleArrow}>{browseOpen ? '↑' : '↓'}</span>
          </button>
        </div>

        <p className={styles.tagline}>Paste any GitHub link. Get a plain English breakdown.</p>

        <div className={styles.searchRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="https://github.com/someone/something"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button className={styles.button} onClick={() => handleSubmit()} disabled={loading}>
            {loading ? 'Thinking...' : 'Explain this'}
          </button>
        </div>

        {browseOpen && (
          <div className={styles.browsePanel}>
            <div className={styles.browseHeader}>
              <span className={styles.browseTitle}>
                {reposLoading ? 'Loading...' : `${filteredRepos.length} builds`}
              </span>
              <input
                className={styles.browseSearch}
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
                  className={`${styles.repoItem} ${activeRepo === repo.url ? styles.repoItemActive : ''}`}
                  onClick={() => { setActiveRepo(repo.url); setResult(null); setError(''); handleSubmit(repo.url); setBrowseOpen(false); }}
                >
                  <span
                    className={styles.repoDot}
                    style={{ background: LANG_COLORS[repo.language] || '#888' }}
                  />
                  <div className={styles.repoInfo}>
                    <div className={styles.repoName}>{repo.name}</div>
                    {repo.description && <div className={styles.repoDesc}>{repo.description}</div>}
                  </div>
                  <span className={styles.repoDate}>
                    {new Date(repo.pushedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {loading && <div className={styles.thinking}>Thinking...</div>}

        {result && (
          <div className={styles.result}>
            <div className={styles.resultTop}>
              <span className={styles.resultName}>{result.meta?.name}</span>
              {result.meta?.language && <span className={styles.badge}>{result.meta.language}</span>}
              {result.meta?.updatedAt && (
                <span className={styles.resultDate}>
                  updated {new Date(result.meta.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className={styles.resultBody}>
              {sections.map((section: string, i: number) => (
                <div key={i} className={styles.section}>
                  <div className={styles.sectionLabel}>
                    {i === 0 ? 'What it is' : i === 1 ? 'Why it matters' : i === 2 ? 'Status' : i === 3 ? 'Recent commits' : 'Note'}
                  </div>
                  <div className={styles.sectionText}>{section}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
