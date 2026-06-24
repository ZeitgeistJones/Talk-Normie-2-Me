# Deploy to Vercel in 5 Minutes

## Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Talk Normie 2 Me"
git branch -M main
git remote add origin https://github.com/yourusername/talk-normie-2-me
git push -u origin main
```

## Step 2: Create Vercel Account
Go to [vercel.com](https://vercel.com) and sign up with GitHub.

## Step 3: Create API Keys

### GitHub Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Talk Normie 2 Me"
4. Check `public_repo` scope
5. Click "Generate token" and copy it
6. Keep it safe—you'll need it for Vercel

### Gemini API Key
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Choose or create a Google Cloud project
4. Copy the API key
5. Keep it safe—you'll need it for Vercel

## Step 4: Deploy
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Select" next to your GitHub repository
3. Confirm project settings (defaults are fine)
4. Under "Environment Variables", add:
   - Name: `GITHUB_TOKEN` → Value: Your GitHub token
   - Name: `NEXT_PUBLIC_GEMINI_API_KEY` → Value: Your Gemini API key
5. Click "Deploy"

## Step 5: Done!
Your app is live! Vercel will give you a URL like `https://talk-normie-2-me.vercel.app`

## Custom Domain (Optional)
1. In Vercel Dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records per Vercel's instructions

## Keep It Updated
Every time you push to `main` on GitHub, Vercel auto-deploys. Just:
```bash
git add .
git commit -m "Your message"
git push
```

Done! Your app redeploys automatically. ✨
