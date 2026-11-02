# Shared accounts setup (one-time, about 15 minutes)

## Why this is needed

Until now the site saved accounts **inside each visitor's own browser**. That is why:

- an account created on a customer's phone was invisible to the admin on a laptop, and
- signing in from any other device or browser said "incorrect password" and forced a password reset.

The fix stores accounts and passwords in **one shared database** (Supabase, free plan is enough to
start). Passwords are stored by Supabase as salted hashes; they are never in the website code.

Until you finish these steps the site keeps working exactly as before (browser-only accounts).

## Steps

### 1. Create the project
1. Go to <https://supabase.com> → sign in → **New project**.
2. Name it `motech`, choose a strong database password (save it), pick the region closest to Kenya.

### 2. Create the tables and security rules
1. In the project: **SQL Editor → New query**.
2. Paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. ("Success. No rows returned" is correct.)

### 3. Sign-in settings
**Authentication → Providers → Email**
- Keep **Email** enabled.
- Set **Minimum password length** to `8`.
- **Confirm email**: leave **off** so customers can use their account straight after registering.
  (If you turn it on, customers must click a link in their inbox first; the site handles both.)

**Authentication → URL Configuration**
- **Site URL:** `https://motechenergyembedded.com`
- **Redirect URLs:** add `https://motechenergyembedded.com/**`

### 4. Make emails actually reach customers (needed for "Forgot password")
Supabase's built-in email sender only delivers to your own team and is heavily rate-limited, so
password-reset emails would **not reach customers**. Set up your own sender:

**Project Settings → Authentication → SMTP Settings → Enable custom SMTP**, then enter the details
from any email provider (for example Gmail with an *App password*, Brevo, Resend or Zoho Mail).
Use `motechembeddedengineering@gmail.com` (or a company address) as the sender.

### 5. Create the administrator
1. **Authentication → Users → Add user → Create new user.**
2. Email `motechembeddedengineering@gmail.com`, choose a **new strong password** (do not reuse
   the old one, it appears in the project history), tick **Auto Confirm User**.
3. Back in **SQL Editor**, run this single line to make that account the admin:

   ```sql
   update public.profiles set role = 'admin' where email = 'motechembeddedengineering@gmail.com';
   ```

Do steps 5.1–5.3 straight after creating the project so nobody else can register that email first.
Every other account created through the website is always a normal customer.

### 6. Connect the website
1. Supabase: **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
   (Never use the `service_role` key anywhere in the website.)
2. GitHub, this repository: **Settings → Secrets and variables → Actions → Variables tab → New repository variable**. Add two:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | the Project URL |
   | `VITE_SUPABASE_ANON_KEY` | the anon public key |

3. **Actions → Deploy to GitHub Pages → Run workflow.** Wait for the green tick.

### 7. Check it works
1. On your phone, open the site and **Register** a test customer.
2. On a computer, sign in as the admin → **Admin → Customers**: the new customer is listed.
3. On a third device sign in as the test customer with the same password.
4. Try **Forgot password** and confirm the email arrives.

## Day-to-day

- **New accounts** appear in Admin → Customers on any device (the page also refreshes itself every 30 seconds).
- **Disable / enable** a customer from the same page.
- **Customer forgot their password:** they use *Forgot password*; you can also send a reset from Supabase → Authentication → Users.
- **Stays signed in:** customers remain signed in on their own device between visits until they sign out.

## What is still stored per device

Accounts, passwords and sign-in are now shared. **Orders, payment proofs, licences and the product
catalogue edited in the admin area are still kept in each browser** and are not shared between devices
yet. The next step is to move those into the same database.
