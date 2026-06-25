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

export default function Home() {
  const [tab, setTab] = useState<'paste' | 'browse'>('paste');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [activeRepo, setActiveRepo] = useState('');
  const [search, setSearch] = useState('');
  const cache: Record<string, any> = {};

  useEffect(() => {
    if (tab === 'browse' && repos.length === 0) {
      setReposLoading(true);
      fetch('/api/repos')
        .then(r => r.json())
        .then(data => { setRepos(data); setReposLoading(false); })
        .catch(() => setReposLoading(false));
    }
  }, [tab]);

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
      const res = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: target }) });
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

  const RepoItem = ({ repo }: { repo: Repo }) => (
    <div
      className={`${styles.repoItem} ${activeRepo === repo.url ? styles.repoItemActive : ''}`}
      onClick={() => { setActiveRepo(repo.url); setResult(null); setError(''); handleSubmit(repo.url); }}
    >
      <div className={styles.repoItemRow}>
        <span className={styles.repoItemName}>{repo.name}</span>
        {repo.language && <span className={styles.lang}>{repo.language}</span>}
        <span className={styles.updated}>{new Date(repo.pushedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      {repo.description && <div className={styles.repoItemDesc}>{repo.description}</div>}
    </div>
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>🗣️ Talk Normie 2 Me</h1>
        <p className={styles.subtitle}>GitHub repos explained in plain English.</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'paste' ? styles.tabActive : ''}`} onClick={() => { setTab('paste'); setResult(null); setError(''); setSearch(''); }}>Paste a Link</button>
          <button className={`${styles.tab} ${tab === 'browse' ? styles.tabActive : ''}`} onClick={() => { setTab('browse'); setResult(null); setError(''); }}>Browse CLAWD Repos</button>
        </div>

        {tab === 'paste' && (
          <div className={styles.inputRow}>
            <input className={styles.input} type="text" placeholder="https://github.com/someone/something" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            <button className={styles.button} onClick={() => handleSubmit()} disabled={loading}>{loading ? 'Thinking...' : 'Talk Normie 2 Me'}</button>
          </div>
        )}

        {tab === 'browse' && (
          <>
            <input
              className={styles.input}
              style={{ marginBottom: '12px', width: '100%' }}
              type="text"
              placeholder="Search CLAWD repos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className={styles.repoList}>
              {reposLoading && <div className={styles.dimText}>Loading repos...</div>}
              {filteredRepos.map(repo => <RepoItem key={repo.name} repo={repo} />)}
              {!reposLoading && filteredRepos.length === 0 && <div className={styles.dimText}>No repos found.</div>}
            </div>
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {loading && <div className={styles.dimText}>Thinking...</div>}

        {result && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.repoName}>{result.meta?.name}</span>
              {result.meta?.language && <span className={styles.lang}>{result.meta.language}</span>}
              {result.meta?.updatedAt && (
                <span className={styles.updated}>
                  updated {new Date(result.meta.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className={styles.sections}>
              {sections.map((section: string, i: number) => (
                <div key={i} className={styles.section}>
                  <p>{section}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
