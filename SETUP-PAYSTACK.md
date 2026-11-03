# Paystack payments (live) — one-time setup

How it works: the customer clicks **Pay with Paystack** → a Supabase Edge Function creates the order using the
server-side price and opens Paystack → after payment, Paystack calls our webhook (and the return page also
asks the server to confirm) → the server checks the amount with Paystack, marks the order paid and issues the
licence. The browser can never mark an order as paid. Your Paystack **secret key never touches the website code**.

## 1. Run the database script
Supabase → SQL Editor → New query → paste **supabase/payments.sql** → Run. (Safe to run again.)

## 2. Store your LIVE secret key in Supabase
Supabase → Edge Functions → Secrets → Add: `PAYSTACK_SECRET_KEY` = your `sk_live_...` key.

## 3. Deploy the three functions
Easiest from your computer (needs Node): 
```
npx supabase login
npx supabase link --project-ref roaigouxppxzmpeepcab
npx supabase functions deploy paystack-init
npx supabase functions deploy paystack-verify
npx supabase functions deploy paystack-webhook --no-verify-jwt
```
(`--no-verify-jwt` is only for the webhook, because Paystack has no Supabase login. It is protected by Paystack's signature check instead.)

## 4. Tell Paystack where to send notifications
Paystack dashboard → Settings → API Keys & Webhooks → **Live Webhook URL**:
`https://roaigouxppxzmpeepcab.supabase.co/functions/v1/paystack-webhook`

## 5. Merge, redeploy the site, and make one small real purchase
Pick the cheapest product, pay with M-Pesa, confirm the licence appears, then use **Admin → Orders → Revoke licence**
and refund yourself in the Paystack dashboard. Prices are edited in Admin → Products (they sync to `product_prices`).

Refunds are done in the Paystack dashboard; then revoke the licence in Admin → Orders.
