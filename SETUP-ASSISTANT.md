# MOTECH AI Assistant (Claude) — one-time setup

A chat button ("Ask MOTECH AI") appears on every page. Server side, a Supabase Edge Function (`site-assistant`)
talks to Claude. Your API key never reaches the browser.

What it can do
- Visitors: product/specification answers (from the site's own data), live prices and availability, how to buy, how the
  students marketplace works, and "take me to…" buttons.
- Signed-in users: their OWN orders, payment status and licences (read through their own login, so row-level security applies).
- Admin only (checked on the server, not by the AI): sales, revenue, customers, orders and projects analytics.
- It cannot buy, refund, or change anything. Safety limits: 20 questions/hour per visitor, 60 per signed-in user, 1500/hour overall.

## 1. Get an Anthropic API key
https://console.anthropic.com → API keys → Create key. This is separate from a claude.ai subscription and billed per use.
In the console, set a monthly **spend limit** that you are comfortable with.

## 2. Run the database script
Supabase → SQL Editor → paste **supabase/assistant.sql** → Run. (Creates the rate-limit table/function.)

## 3. Store the key in Supabase
Edge Functions → Secrets → add `ANTHROPIC_API_KEY` = your key.
Optional: `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`; use `claude-haiku-5-5` to reduce cost).

## 4. Deploy the function (PowerShell, in the cloned repo)
```
npx.cmd supabase functions deploy site-assistant --use-api
```
(Do NOT add --no-verify-jwt: visitors are covered by the public anon key; the function still checks every caller.)

## 5. Merge the pull request and redeploy the site
Actions → Deploy to GitHub Pages → Run workflow.

## Keeping its knowledge current
Product descriptions are bundled into the function. After you change `src/data/*.ts`, run
`npm run build:assistant` and redeploy `site-assistant`. Prices, availability and student projects are always read live.
