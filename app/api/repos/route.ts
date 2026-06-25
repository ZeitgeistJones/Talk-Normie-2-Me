import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

    const res = await fetch('https://api.github.com/users/clawdbotatg/repos?per_page=100&sort=pushed', { headers });
    if (!res.ok) throw new Error('Failed to fetch repos');
    const repos = await res.json();

    return NextResponse.json(repos.map((r: any) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      pushedAt: r.pushed_at,
      stars: r.stargazers_count,
    })));

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
