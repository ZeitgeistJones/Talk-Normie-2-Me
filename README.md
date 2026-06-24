# Talk Normie 2 Me

Explain any GitHub repository like you're texting a smart friend. No jargon, no tech articles—just plain English explanations powered by AI.

## Features

- 🔍 **Repo Analysis**: Fetches README, file structure, recent commits, and update dates from GitHub
- 🤖 **AI Explanation**: Uses Google Gemini to generate human-friendly explanations
- ⚡ **Session Cache**: Results are cached within your session to avoid redundant API calls
- 🎨 **Dark Minimal UI**: Clean, distraction-free interface
- 📱 **Mobile Responsive**: Works great on any screen size
- 🚀 **Vercel Ready**: One-click deployment to Vercel

## Tech Stack

- **Next.js 14** - React framework with API routes
- **TypeScript** - Type-safe code
- **Google Generative AI** - Gemini 1.5 Flash for explanations
- **GitHub REST API** - Public repo data
- **CSS Modules** - Scoped styling
- **Vercel** - Serverless deployment

## Local Setup

### Prerequisites

- Node.js 18+ (for Next.js 14)
- GitHub Personal Access Token ([create here](https://github.com/settings/tokens))
- Google Gemini API Key ([create here](https://aistudio.google.com/apikey))

### Installation

1. **Clone and install**:
   ```bash
   git clone https://github.com/yourusername/talk-normie-2-me.git
   cd talk-normie-2-me
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and add:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

The easiest way to deploy is to Vercel:

### Option 1: Via Git (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" → Select your repository
4. Configure environment variables:
   - `GITHUB_TOKEN` - Your GitHub personal access token
   - `NEXT_PUBLIC_GEMINI_API_KEY` - Your Gemini API key
5. Click "Deploy"

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel
```

Then add your environment variables when prompted, or add them in the Vercel dashboard under Project Settings → Environment Variables.

## Environment Variables

### Required for Development

- `GITHUB_TOKEN` - [Create a personal access token](https://github.com/settings/tokens)
  - Needs: `public_repo` scope (read public repositories)
  - Can be classic or fine-grained token
  
- `NEXT_PUBLIC_GEMINI_API_KEY` - [Create from Google AI Studio](https://aistudio.google.com/apikey)
  - This is prefixed with `NEXT_PUBLIC_` so it's available in the browser for API calls
  - Keep it secure; restrict API key in Google Cloud Console

### On Vercel

Add these in **Settings → Environment Variables**:
- `GITHUB_TOKEN` (Server-side, hidden)
- `NEXT_PUBLIC_GEMINI_API_KEY` (Public, exposed to client)

## How It Works

### The Flow

1. **User Input**: Paste any GitHub repo URL (e.g., `https://github.com/vercel/next.js`)
2. **Fetch Data**: The app calls GitHub API to get:
   - README file
   - File structure (first 50 files)
   - Last 3 commit messages with dates
   - Last updated date
3. **AI Explanation**: Sends all data to Google Gemini with this prompt:
   ```
   You explain GitHub repos to people who know nothing about code. 
   Write like you're texting a smart friend, not writing a tech article. 
   No jargon. No bullet points. Cover four things in plain paragraph form: 
   - What this repo actually is and who it's for
   - Why it matters to someone holding the CLAWD token specifically
   - Whether it looks alive or abandoned based on the commit dates
   - What the last 3 commits mean in plain English
   Keep the whole thing under 200 words.
   ```
4. **Display**: Shows the explanation in a clean card below the input
5. **Cache**: Same URL in the same session won't call APIs twice

## API Route

### POST `/api/explain`

Expects JSON body:
```json
{
  "repoUrl": "https://github.com/owner/repo"
}
```

Response:
```json
{
  "explanation": "...",
  "repoUrl": "https://github.com/owner/repo"
}
```

Errors:
- `400`: Missing or invalid repo URL
- `500`: GitHub or Gemini API errors, missing environment variables

## Design Notes

- **Dark theme** (`#0a0a0a` background) with subtle gradient
- **Minimal UI**: Input, button, result card—nothing else
- **Blue accent** (`#6b9bff`) for CTAs and highlights
- **Typography**: System fonts, careful letter-spacing for modern feel
- **Responsive**: Works on mobile (flex input/button stack below 640px)
- **Accessible**: Focus states, keyboard support (Enter to submit), ARIA-friendly

## Development

### File Structure

```
talk-normie-2-me/
├── app/
│   ├── api/
│   │   └── explain/
│   │       └── route.ts         # GitHub + Gemini API logic
│   ├── layout.tsx               # HTML structure
│   ├── page.tsx                 # Main component (client-side state)
│   ├── page.module.css          # Page styling
│   └── globals.css              # Global styles
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json                  # Vercel deployment config
├── .env.local.example           # Environment template
└── README.md
```

### Commands

- `npm run dev` - Start dev server on :3000
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint

## Troubleshooting

### "Invalid GitHub URL"
- Make sure you're pasting the full URL: `https://github.com/owner/repo`
- Try removing `.git` at the end if present

### "GitHub token not configured"
- Add `GITHUB_TOKEN` to your `.env.local` file
- On Vercel, add it in Project Settings → Environment Variables

### "Gemini API key not configured"
- Add `NEXT_PUBLIC_GEMINI_API_KEY` to your `.env.local` file
- On Vercel, add it in Project Settings → Environment Variables
- Make sure it's prefixed with `NEXT_PUBLIC_`

### "Failed to fetch explanation"
- Check that your Gemini API key is valid and has quota
- Private repos will only work if your GitHub token has access
- Some repos may have rate limits; wait a moment and try again

### API call fails with 403
- Your GitHub token may lack required scopes
- For public repos, the `public_repo` scope is sufficient
- For private repos, add `repo` scope

## License

MIT - Use freely, modify, deploy, share.

## Support

Having issues? Check:
1. Environment variables are set correctly
2. GitHub token has public repo access
3. Gemini API key is valid and has quota
4. Repository URL is correct and accessible

---

**Made with ❤️ for people who want tech explained in plain English**
