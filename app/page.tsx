'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const cache: Record<string, any> = {};

  async function handleSubmit() {
    if (!url.trim()) return;
    if (cache[url]) { setResult(cache[url]); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      cache[url] = data;
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>🗣️ Talk Normie 2 Me</h1>
        <p className={styles.subtitle}>Paste any GitHub link. Get a plain English breakdown.</p>
        <div className={styles.inputRow}>
          <input className={styles.input} type="text" placeholder="https://github.com/someone/something" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <button className={styles.button} onClick={handleSubmit} disabled={loading}>{loading ? 'Thinking...' : 'Talk Normie 2 Me'}</button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {result && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.repoName}>{result.meta?.name}</span>
              {result.meta?.language && <span className={styles.lang}>{result.meta.language}</span>}
            </div>
            <p className={styles.explanation}>{result.explanation}</p>
          </div>
        )}
      </div>
    </main>
  );
}
