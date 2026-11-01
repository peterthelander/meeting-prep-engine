# Meeting Prep Engine

A Next.js prototype that turns a user profile and meeting brief into an HTML
preparation report using Gemini.

## Run locally

Use Node.js 20.9 or later. From the repository root:

```bash
npm ci
cp .env.example .env.local
# Set GOOGLE_API_KEY (or GEMINI_API_KEY) in .env.local.
npm run dev -- --hostname 127.0.0.1
```

Open http://localhost:3000. Generated HTML previews are written to `emails/`.

## Prototype behavior and privacy

- News search currently returns synthetic example stories and URLs, not verified
  reporting. Reports are demonstrations, not factual research.
- Email delivery is mocked: reports are saved locally rather than sent.
- Profile details are stored in the browser's localStorage. Submitted profile,
  meeting objective, and historical notes are sent to Gemini for generation.
- Logs may contain names, email addresses, meeting targets, and search queries.
  Generated previews may also contain personal or confidential meeting details.
- Environment files and generated previews are ignored by Git; keep them private.
- The API has no authentication or rate limiting. Keep this prototype local;
  public hosting requires additional access controls and reliable background jobs.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
