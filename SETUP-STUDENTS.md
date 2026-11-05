# MOTECH for Engineering Students — one-time setup

Students register on the normal site sign-up (same Supabase accounts), buy a project through Paystack, and
download the files from **My Projects**. Prices are always taken from the database on the server.

## 1. Run the database script
Supabase → SQL Editor → paste **supabase/students.sql** → Run (after schema.sql and payments.sql). Safe to re-run.
It creates the `student_projects` table and two storage buckets (private `project-files`, public `project-images`).

## 2. Deploy the functions (from the cloned repo, PowerShell)
```
npx.cmd supabase functions deploy paystack-init --use-api
npx.cmd supabase functions deploy project-download --use-api
```
(`paystack-init` must be redeployed because it now also prices student projects.)

## 3. The super admin
The admin is the existing account `motechembeddedengineering@gmail.com` (role = admin in the `profiles` table).
Its password lives only in Supabase Auth and is never stored in this repository. To change it:
Supabase → Authentication → Users → the user → Send password recovery, or use "Forgot password" on the site.

## 4. Add projects
Sign in as admin → **Admin → Student Projects → Add project**. Fill the details, upload a cover image and the
project package (.zip), set the status to **Published**. Students see only published projects.

## Demo videos
Run the updated **supabase/students.sql** again (it adds the demo-video columns and a `project-demos` bucket limited to
50 MB, MP4/WebM). In Admin → Student Projects → edit a project → **Demo video**. Videos longer than 3:00 are rejected.
Students watch it on the project page (with a © watermark and copyright notice) before buying.
Tip: export at 720p/H.264; a 3-minute 720p video is usually 20–40 MB. Supabase's free plan caps uploads at 50 MB.
