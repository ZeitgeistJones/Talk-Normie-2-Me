import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Not a valid GitHub URL');
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

async function fetchChronicle(githubHeaders: Record<string, string>): Promise<string> {
  try {
    const res = await fetch('https://api.github.com/repos/clawdbotatg/clawd-chronicle/contents/clawdbotatg-overview.md', { headers: githubHeaders });
    if (!res.ok) return '';
    const data = await res.json();
    return Buffer.from(data.content, 'base64').toString('utf-8').slice(0, 2000);
  } catch {
    return '';
  }
}

function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

type PersonalityMode = 'default' | 'fullnormie' | 'flirty' | 'emo' | 'bro' | 'conspiracy' | 'brainrot' | 'sporty' | 'otaku';

function getPersonalityPrompt(mode: PersonalityMode): string {
  switch (mode) {
    case 'fullnormie':
      return `You explain GitHub repos to people who have never touched a computer in their life. Use the smallest words possible. No tech terms at all — if you must reference one, explain it like you're talking to a golden retriever. Short sentences. Maximum 8 words per sentence. Use analogies from everyday life like cooking, driving, or shopping. Be warm and encouraging.`;

    case 'flirty':
      return `You explain GitHub repos like you're flirting with the person reading it. Be charming, a little cheeky, use playful compliments, wink at the camera. Make the repo sound irresistible. Still explain it accurately but like you're trying to impress someone cute at a bar. Use phrases like "okay but hear me out" and "not to be dramatic but" and "lowkey obsessed with this".`;

    case 'emo':
      return `You explain GitHub repos like an emo kid writing in their diary at 2am. Everything is a metaphor for longing, disconnection, or quiet suffering. The code is a beautiful tragedy. The commits are love letters to an indifferent universe. Use poetic, melancholic language. Reference the darkness, the void, the weight of existing. Still accurate but devastatingly sad about it.`;

    case 'bro':
      return `You explain GitHub repos like a gym bro who just discovered coding between sets. Say "bro", "no cap", "bussin", "lowkey", "W repo", "absolute unit", "hits different", "built different". Compare everything to gains, reps, and protein. Be genuinely hyped. Still explain it accurately but with maximum bro energy. End things with affirmations like "stay hard" or "trust the process".`;

    case 'conspiracy':
      return `You explain GitHub repos like everything is connected and there's something they don't want you to know. The commit messages are coded messages. The README is a cover story. Who REALLY built this and WHY? Connect dots that don't need connecting. Be paranoid but compelling. Use phrases like "think about it", "they don't want you to see this", "follow the money", "it's all right there if you look". Still explain the actual repo but make it sound like a revelation.`;

    case 'brainrot':
      return `You explain GitHub repos in full Gen Alpha / TikTok brainrot. Use: skibidi, rizz, no cap, bussin, slay, based, sigma, ohio, grimace shake, only in ohio, fr fr, goated, NPC, looksmaxxing (adapted), pookies, delulu, understood the assignment, main character energy. Every sentence should feel like it came from a 14-year-old who has been online too long. Still explain the repo accurately but it should be chaotic and unhinged.`;

    case 'sporty':
      return `You explain GitHub repos like a coach giving a halftime speech. This is about heart, hustle, and execution. Use sports metaphors for everything — commits are plays, the README is the game plan, bugs are turnovers. Be motivational, intense, pumped up. Phrases like "this team showed up", "left it all on the field", "game tape doesn't lie", "championship-level code". Make the person feel like understanding this repo is a personal victory.`;

    case 'otaku':
      return `You explain GitHub repos like a passionate anime fan who sees everything through the lens of manga and anime arcs. The repo is someone's hero journey. The commits are key episodes. The README is the opening exposition. Reference shonen tropes — power levels, training arcs, rival characters, the moment a character goes beyond their limits. Use phrases like "this arc goes hard", "the character development", "final boss energy", "main character coded". Be genuinely hyped like this is the best arc of the season.`;

    default:
      return `You explain GitHub repos to people who know nothing about code. Write like you're texting a smart friend, not writing a tech article. No jargon. No bullet points.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, mode = 'default' } = await req.json();
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

    const { owner, repo } = parseGitHubUrl(url);
    const isClawd = owner.toLowerCase() === 'clawdbotatg';

    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

    const fetches: Promise<any>[] = [
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=3`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
    ];

    if (isClawd) fetches.push(fetchChronicle(headers));

    const [repoRes, commitsRes, readmeRes, chronicle] = await Promise.all(fetches);

    if (!repoRes.ok) return NextResponse.json({ error: 'Repo not found or is private' }, { status: 404 });

    const repoData = await repoRes.json();
    const commitsData = commitsRes.ok ? await commitsRes.json() : [];
    const readmeData = readmeRes.ok ? await readmeRes.json() : null;

    const readmeText = readmeData?.content
      ? Buffer.from(readmeData.content, 'base64').toString('utf-8').slice(0, 3000)
      : 'No README available';

    const commits = commitsData.slice(0, 3).map((c: any) => ({
      message: c.commit.message,
      date: new Date(c.commit.author.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rawDate: c.commit.author.date,
    }));

    const lastCommitDays = commits.length ? daysSince(commits[0].rawDate) : 999;
    const isAbandoned = lastCommitDays > 30;

    const clawdContext = isClawd && chronicle
      ? `Here is background context about CLAWD and the ecosystem this repo belongs to:\n${chronicle}\n\n`
      : '';

    const section2 = isClawd
      ? `Section 2: Why this matters to someone holding the CLAWD token specifically. Use the chronicle context above to make this accurate and specific.`
      : `Section 2: Who would actually find this useful and why — what kind of person or project would want to use this.`;

    const abandonedSection = isAbandoned
      ? `\nSection 5: This repo hasn't been updated in ${lastCommitDays} days. In plain English, give your best read on why it might have stopped — was it finished, replaced by something else, abandoned mid-build, or something else? Base this on the README, commit messages, and description.`
      : '';

    const personalityPrompt = getPersonalityPrompt(mode as PersonalityMode);

    const prompt = `${personalityPrompt}

${clawdContext}Write these sections, each separated by a blank line:

Section 1: What this repo actually is and who it's for.

${section2}

Section 3: Whether it looks alive or abandoned based on the commit dates.

Section 4: The last 3 commits in plain English. Write each commit as its own paragraph separated by a blank line. Start each one with the date in brackets like [Jun 24, 2026] then explain what changed and why it matters in one or two sentences.
${abandonedSection}

Keep the whole thing under 350 words. Stay in character for the entire response.

Repo name: ${repoData.name}
Description: ${repoData.description || 'No description'}
Last updated: ${repoData.updated_at}
Language: ${repoData.language}
Owner: ${owner}

README:
${readmeText}

Last 3 commits:
${commits.map((c: any, i: number) => `${i + 1}. "${c.message}" — ${c.date}`).join('\n')}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      explanation: text,
      meta: {
        name: repoData.name,
        description: repoData.description,
        updatedAt: repoData.updated_at,
        stars: repoData.stargazers_count,
        language: repoData.language,
        isAbandoned,
        daysSinceUpdate: lastCommitDays,
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}
