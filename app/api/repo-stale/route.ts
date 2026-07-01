import { NextRequest, NextResponse } from 'next/server';

function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Not a valid GitHub URL');
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    const sha = req.nextUrl.searchParams.get('sha');

    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    if (!sha) return NextResponse.json({ stale: true, latestCommitSha: null });

    const { owner, repo } = parseGitHubUrl(url);

    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      { headers }
    );

    if (!res.ok) {
      return NextResponse.json({ stale: true, latestCommitSha: null });
    }

    const data = await res.json();
    const latestCommitSha = data[0]?.sha || null;

    return NextResponse.json({
      stale: !latestCommitSha || latestCommitSha !== sha,
      latestCommitSha,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}
