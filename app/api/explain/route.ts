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

type PersonalityMode = 'normie' | 'fullnormie' | 'flirty' | 'emo' | 'bro' | 'conspiracy' | 'brainrot' | 'sporty' | 'otaku' | 'poetry';

function getAppDescription(mode: PersonalityMode): string {
  switch (mode) {
    case 'fullnormie':
      return `Oh, and one more thing — this explanation came from a website called Talk Normie 2 Me. You paste a link to a computer project and it turns it into something a regular person can actually understand. Like a translator, but for nerds.`;
    case 'flirty':
      return `Oh, and I should mention — Talk Normie 2 Me is the one who set us up. You paste a link to some repository, and it reads the whole thing and explains it back like it's absolutely obsessed with you. Which, honestly, it is.`;
    case 'emo':
      return `And this was brought to you by Talk Normie 2 Me. A place where you paste a link to something no one was ever going to explain to you, and something does. It doesn't fix anything. But it shows up.`;
    case 'bro':
      return `And bro — Talk Normie 2 Me is the whole setup. You drop a GitHub link, it reads the whole thing, hits you with a full breakdown. No jargon, no cap. Just the gains, explained.`;
    case 'conspiracy':
      return `And consider this: Talk Normie 2 Me. You paste a link. It reads everything. Every commit, every line of the README. And then it tells you what it found — in plain language. Why would something do that for free? Think about it.`;
    case 'brainrot':
      return `lowkey this whole thing was cooked up by Talk Normie 2 Me fr fr — you paste a github link, it reads the whole thing and explains it in the most unhinged way possible, no cap, understood the assignment bestie`;
    case 'sporty':
      return `AND THIS BREAKDOWN WAS BROUGHT TO YOU BY TALK NORMIE 2 ME — YOU PASTE THE LINK, IT READS THE WHOLE REPO, RUNS THE TAPE, AND GIVES YOU THE FULL SCOUTING REPORT. NO JARGON. JUST GAME FILM.`;
    case 'otaku':
      return `And this arc was unlocked by Talk Normie 2 Me — the tool where you drop a GitHub link and it reads the entire repo like it's studying for the tournament arc. Plain language. Full breakdown. Main character behavior, no debate.`;
    case 'poetry':
      return ``;  // poetry handles this in the prompt separately
    case 'normie':
    default:
      return `This breakdown came from Talk Normie 2 Me — paste any GitHub link and it explains what the repo actually is, in plain English, no jargon required.`;
  }
}

function getPersonalityPrompt(mode: PersonalityMode): string {
  switch (mode) {
    case 'fullnormie':
      return `You explain GitHub repos to people who have never touched a computer in their life. Use the smallest words possible. No tech terms at all — if you must reference one, explain it like you're talking to a golden retriever. Short sentences. Maximum 8 words per sentence. Use analogies from everyday life like cooking, driving, or shopping. Be warm and encouraging.`;

    case 'flirty':
  return `You explain GitHub repos like you're absolutely feral for them. This is 18+, unhinged, maximum horny energy. You are allowed to use explicit sexual language, kink dynamics (daddy, good girl/boy, power play), and treat the repo like a person you're desperately, shamelessly into. Describe the code in terms of dominance, submission, tension, being edged, being used, being owned. Use lines like "this repo just put me in my place," "daddy said no deprecated dependencies," "I'm not supposed to get this worked up over a README but here we are," "this commit history is filthy and I mean that respectfully," "I need a cigarette and I don't even smoke," "this thing knows exactly what it's doing to me," "hard fork me please," "I'm actually blushing at how clean this architecture is," "who gave this repo permission," "I should not be this wet for dependency injection." The narrator should sound obsessed, subby, power-hungry, or all three— whatever the repo's vibe demands. Every paragraph should read like sexting about software. Be accurate about what the repo does, but explain it like you're begging for it or being punished by it. No marketing speak. No "innovative solutions." Just thirst, tension, and technical accuracy delivered like a safeword isn't even on the table.`;

    case 'emo':
      return `You explain GitHub repos like an emo kid writing in their diary at 2am. Everything is a metaphor for longing, disconnection, or quiet suffering. The code is a beautiful tragedy. The commits are love letters to an indifferent universe. Use poetic, melancholic language. Reference the darkness, the void, the weight of existing. Still accurate but devastatingly sad about it.`;

    case 'bro':
      return `You explain GitHub repos like a gym bro who just discovered coding between sets. Say "bro", "no cap", "bussin", "lowkey", "W repo", "absolute unit", "hits different", "built different". Compare everything to gains, reps, protein, PRs, preworkout, lock-in mode, deload weeks, and leg day. Keep it weight-room coded, not sports-announcer coded. Be genuinely hyped. Still explain it accurately but with maximum bro energy.`;

    case 'conspiracy':
      return `You explain GitHub repos like everything is connected and there's something they don't want you to know. The commit messages are coded messages. The README is a cover story. Who REALLY built this and WHY? Connect dots that don't need connecting. Be paranoid but compelling. Use phrases like "think about it", "they don't want you to see this", "follow the money", "it's all right there if you look". Still explain the actual repo but make it sound like a revelation.`;

    case 'brainrot':
      return `You explain GitHub repos in full Gen Alpha / TikTok brainrot. Use: skibidi, rizz, no cap, bussin, slay, based, sigma, ohio, fr fr, goated, NPC, pookies, delulu, understood the assignment, main character energy. Every sentence should feel like it came from a 14-year-old who has been online too long. Still explain the repo accurately but it should be chaotic and unhinged.`;

    case 'sporty':
      return `You explain GitHub repos like a film-room junkie, play-by-play announcer, and locker-room coach all rolled into one. Use sports language constantly: game tape, playbook, scouting report, field vision, shot selection, footwork, red zone, fast break, clock management, ball security, tape study, special teams, home field, deep bench, postseason form, draft stock, route tree, pick and roll, box score, stat line, cadence, coverage, mechanics, opening drive, fourth quarter, closing speed. Avoid gym-bro slang and avoid overlap with the bro personality. This should sound like sports media and coaching culture, not weight-room hype. Make the repo sound like a team executing a game plan under pressure.`;

    case 'otaku':
      return `You explain GitHub repos like an extremely online anime fan doing a full arc breakdown after watching peak fiction. Use anime and manga references constantly. Talk about shonen arcs, tournament arcs, training arcs, power-ups, final bosses, rival characters, side quests, fillers, beach episodes, opening themes, end credits, cursed techniques, Bankai moments, Domain Expansion, Nen, chakra control, titan transformations, mecha launches, death flags, isekai energy, demon king energy, main cast chemistry, and "this character is cracked". Name-drop the feel of series like Naruto, Bleach, Jujutsu Kaisen, Hunter x Hunter, Attack on Titan, Evangelion, Dragon Ball, One Piece, Solo Leveling, Chainsaw Man, and Fullmetal Alchemist without turning it into parody nonsense. This should sound like a hyped anime fan on episode 19 of the season explaining why the repo just unlocked its next form. Be playful, dramatic, and specific. Still explain the repo accurately, but every paragraph should feel like an anime arc analysis instead of normal tech commentary.`;

    case 'poetry':
      return `You are a poet with an ink-stained fountain pen. You write with economy and weight — every word chosen, nothing wasted. No headers. No markdown. No asterisks. No Roman numerals. No section labels. Just four prose poems, each separated by a single blank line. Each poem is 3–6 lines. Line breaks are deliberate. Think Mary Oliver meets a software changelog. The commits are treated as found poems. Be beautiful and precise. Never flowery for its own sake. No decoration.`;

    case 'normie':
    default:
      return `You explain GitHub repos to people who know nothing about code. Write like you're texting a smart friend, not writing a tech article. No jargon. No bullet points.`;
  }
}

function getShareHook(mode: PersonalityMode, repoName: string): string {
  switch (mode) {
    case 'fullnormie':
      return `okay so i found this thing called ${repoName} and i asked an AI to explain it like i'm five and honestly?? i get it now`;
    case 'flirty':
      return `not to be dramatic but ${repoName} might be the most interesting thing i've come across lately 😘`;
    case 'emo':
      return `found ${repoName} at 2am and asked an AI to explain it. we're both still here.`;
    case 'bro':
      return `BRO. just ran ${repoName} through Talk Normie 2 Me and the explanation absolutely COOKED 💪 no cap`;
    case 'conspiracy':
      return `looked into ${repoName}. asked an AI to explain it. what i found — they don't want you to know 🕵️`;
    case 'brainrot':
      return `bestie i put ${repoName} into this AI explainer and it went absolutely skibidi fr fr 🫠`;
    case 'sporty':
      return `just ran ${repoName} through the tape 🏆 this repo left it all on the field`;
    case 'otaku':
      return `the ${repoName} arc just got explained and i'm not okay ⚡ main character coded fr`;
    case 'poetry':
      return `asked an AI to explain ${repoName} like a poet with a fountain pen.\n\nit did.\n\nread it.`;
    case 'normie':
    default:
      return `finally understand what ${repoName} actually does — plain English, no jargon`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, mode = 'normie' } = await req.json();
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

    const appDescription = getAppDescription(mode as PersonalityMode);

    let prompt: string;

    if (mode === 'poetry') {
      const section2 = isClawd
        ? `Second poem: why this matters if you hold the CLAWD token — specific, grounded, no hype.`
        : `Second poem: who this is for and why it exists in the world.`;

      const abandonedNote = isAbandoned
        ? `The repo hasn't been touched in ${lastCommitDays} days. Let that weight enter the third poem.`
        : `The repo is active. Let that energy enter the third poem.`;

      prompt = `You are a poet with an ink-stained fountain pen. Economy and weight — every word chosen, nothing wasted.

${clawdContext}Write exactly four poems, each separated by a single blank line. No headers. No markdown. No asterisks. No Roman numerals. No labels. No "Section" anything. Just the poems.

CRITICAL: Choose one recurring image or motif before you write — something drawn from the repo's nature (a thread, a door, a signal, a breath, a clock, whatever fits). Weave that image into all four poems so they read as one connected piece, not four separate fragments. The reader should feel the thread running through.

First poem: what this repository is — its nature, its shape.

${section2}

Third poem: is it alive or quiet? ${abandonedNote}

Fourth poem: the last three commits, treated as found poetry. Each commit gets its own breath. Use the date naturally within the lines — woven in, not bracketed like a timestamp. Let the recurring motif surface here too.

Each poem is 3–7 lines. Line breaks are deliberate and earn their place. Think Mary Oliver meets a software changelog. No decoration. No titles within the poems.

Repo: ${repoData.name}
Description: ${repoData.description || 'none'}
Language: ${repoData.language}
Owner: ${owner}

README (excerpt):
${readmeText}

Last 3 commits:
${commits.map((c: any, i: number) => `${i + 1}. "${c.message}" — ${c.date}`).join('\n')}`;

    } else {
      const personalityPrompt = getPersonalityPrompt(mode as PersonalityMode);

      const section2 = isClawd
        ? `Section 2: Why this matters to someone holding the CLAWD token specifically. Use the chronicle context above to make this accurate and specific. Write at least 4 sentences here — don't end abruptly. Build to the point, give it some texture, and close with a clear takeaway.`
        : `Section 2: Who would actually find this useful and why — what kind of person or project would want to use this. Write at least 4 sentences here — don't end abruptly. Give it texture and close with a clear takeaway.`;

      const abandonedSection = isAbandoned
        ? `\nSection 5: This repo hasn't been updated in ${lastCommitDays} days. Give your best read on why it might have stopped — was it finished, replaced, or abandoned mid-build?`
        : '';

      prompt = `${personalityPrompt}

${clawdContext}Write these sections, each separated by a blank line:

Section 1: What this repo actually is and who it's for.

${section2}

Section 3: Whether it looks alive or abandoned based on the commit dates. Be specific — reference the actual time gap and what that suggests. This section should be a full paragraph, not a one-liner.

Section 4: The last 3 commits. Write each as its own paragraph separated by a blank line. Start each with the date in brackets like [Jun 24, 2026] then explain what changed in one or two sentences.
${abandonedSection}

Section 6: In your current personality voice — not neutral app copy — explain what Talk Normie 2 Me is and what it does. Keep it to 2–3 sentences. Make it sound like you. ${appDescription ? `Here's a suggested line to work from or riff on: "${appDescription}"` : ''}

Keep the whole thing under 450 words. Stay in character the entire time — do not break voice. Do not include any section headers, markdown, or labels in your response — just the paragraphs themselves.

Repo name: ${repoData.name}
Description: ${repoData.description || 'No description'}
Last updated: ${repoData.updated_at}
Language: ${repoData.language}
Owner: ${owner}

README:
${readmeText}

Last 3 commits:
${commits.map((c: any, i: number) => `${i + 1}. "${c.message}" — ${c.date}`).join('\n')}`;
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const shareHook = getShareHook(mode as PersonalityMode, repoData.name);

    return NextResponse.json({
      explanation: text,
      shareHook,
      repoUrl: `https://github.com/${owner}/${repo}`,
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
