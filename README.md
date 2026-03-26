# 📚 Library Policy Assistant

A chatbot that answers patron questions about library policies using Claude AI. Built with Next.js and deployable to Vercel in minutes.

## Features

- 💬 Conversational chat interface
- 📄 Answers grounded in your actual policy documents
- 🔗 Returns direct links to the relevant policy pages
- 📱 Fully responsive (mobile-friendly)
- ⚡ Streaming-ready Next.js API route

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/library-policy-bot.git
cd library-policy-bot
npm install
```

### 2. Add your API key

Copy the example env file and add your Anthropic API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...your-key...
```

Get your key at [console.anthropic.com](https://console.anthropic.com/).

### 3. Add your policies

Edit `data/policies.json`. Each policy needs:

```json
[
  {
    "title": "Policy Name",
    "content": "Full text of the policy as it should be understood by the AI.",
    "url": "https://yourlibrary.org/policies/policy-name"
  }
]
```

Add as many policies as you need. The AI will only answer based on what's in this file.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the chatbot!

---

## Deploying to Vercel

### Option A: Via GitHub (recommended)

1. Push your code to GitHub (`.env.local` is gitignored — never committed)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key
5. Click **Deploy** ✅

Every push to `main` will auto-deploy.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
```

Then add the env variable in your Vercel project dashboard under **Settings → Environment Variables**.

---

## Project Structure

```
library-policy-bot/
├── app/
│   ├── api/chat/route.ts   ← Claude API integration
│   ├── page.tsx            ← Chat UI
│   ├── page.module.css     ← Styles
│   ├── layout.tsx          ← Root layout
│   └── globals.css         ← Global styles
├── data/
│   └── policies.json       ← YOUR POLICIES GO HERE
├── .env.local              ← API key (never commit)
└── .env.local.example      ← Template for env setup
```

---

## Customization

### Change the library name
Edit the `<h1>` in `app/page.tsx` and the `metadata` in `app/layout.tsx`.

### Adjust the AI's behavior
Edit the `SYSTEM_PROMPT` in `app/api/chat/route.ts` to change tone, response format, or instructions.

### Update policies
Just edit `data/policies.json` — no code changes needed. Redeploy when done.

---

## Tech Stack

- [Next.js 15](https://nextjs.org/) — React framework
- [Anthropic Claude](https://www.anthropic.com/) — AI responses
- [react-markdown](https://github.com/remarkjs/react-markdown) — Renders markdown links in responses
- [Vercel](https://vercel.com/) — Hosting & deployment
