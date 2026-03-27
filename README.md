# York County Library Policy Assistant

A chatbot that answers patron questions about York County Library policies using AI.

## What It Does
Patrons can ask natural language questions about library policies and get accurate, 
cited answers powered by the Anthropic Claude API. The bot reads directly from 
official policy PDF documents stored in the repository.

## Tech Stack
- **Framework:** Next.js (App Router)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Deployment:** Vercel
- **Version Control:** GitHub

## Project Structure
```
/app
  page.tsx          # Main chat UI
  layout.tsx        # App layout and fonts
  /api/chat
    route.ts        # API endpoint that calls Claude
/lib
  fetchPolicies.ts  # Reads and parses policy PDFs
/public
  ycl-logo.png      # Library logo
  /policies         # All library policy PDF files
```

## How It Works
1. When a user asks a question, the app reads all PDFs from `/public/policies`
2. The text is extracted using `pdf2json`
3. The extracted text is passed to Claude as context along with the user's question
4. Claude answers using only the policy documents provided

## Adding or Updating Policies
1. Export the updated policy as a PDF
2. Add it to `/public/policies` in the repo
3. Commit and push to main — Vercel will redeploy automatically

## Environment Variables
Set these in Vercel dashboard under Project Settings → Environment Variables:
- `ANTHROPIC_API_KEY` — your Anthropic API key

## Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deployment
Push to the `main` branch on GitHub — Vercel deploys automatically.

## Last Updated
March 2026 — Migrated from Google Drive to local PDF storage in repo.
# dev
