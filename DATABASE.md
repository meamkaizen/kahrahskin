# KAHRÀH — Database Setup

The waitlist stores signups in **Neon Postgres**. Until you add a connection
string it falls back to a local file (`data/waitlist.json`) so the site still
works — but that file is not a real database, and it disappears on most hosting
platforms when the server restarts. Do the steps below before you launch.

Total time: about 5 minutes.

---

## 1. Create the database

| What | Link |
| --- | --- |
| Sign up / log in | https://neon.com |
| Console (after signup) | https://console.neon.tech |
| Connection string docs | https://neon.com/docs/connect/connect-from-any-app |

1. Go to **https://neon.com** and sign up (the free tier is enough to launch).
2. Create a project. Name it `kahrah`. Pick the region closest to your users —
   `eu-west-2` (London) or `us-east-1` are both fine.
3. Neon creates a database called `neondb` for you. You do **not** need to
   create any tables — the server does that itself on startup.

## 2. Copy the connection string

1. In your project dashboard, click the **Connect** button.
2. Leave **Connection pooling** switched **on** (this is the default, and it is
   the one you want — it handles many visitors at once).
3. Copy the string. It looks like this:

```
postgresql://neondb_owner:AbC123dEf@ep-cool-darkness-a1b2c3d4-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Note the `-pooler` in the hostname — that confirms you copied the pooled one.

## 3. Add it to the project

```bash
cp .env.example .env
```

Open `.env` and paste your string:

```
DATABASE_URL="postgresql://neondb_owner:...-pooler....aws.neon.tech/neondb?sslmode=require"
```

Keep the quotes. `.env` is git-ignored, so your password is never committed.

## 4. Restart and confirm it worked

```bash
bun run dev
```

You want to see this line:

```
[KAHRÀH] Waitlist storage: Neon Postgres
KAHRÀH server active on http://0.0.0.0:3000 (storage: postgres)
```

You can also ask the server directly:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","brand":"KAHRÀH Skincare","storage":"postgres"}
```

`"storage":"postgres"` means you are connected. If it says `"file"`, see
**Troubleshooting** below.

---

## What gets created automatically

On the first boot with a `DATABASE_URL`, the server creates everything it needs.
This is safe to run repeatedly and safe on a database that already has data.

**Table `waitlist_signups`** — one row per person, one row per email address:

| Column | Meaning |
| --- | --- |
| `id` | Unique id (UUID) |
| `email` | Always lowercase and trimmed. **Unique** — the same email cannot be added twice |
| `first_name` | Optional |
| `role` | `seeker` (customer) or `vendor` |
| `audience` | `enthusiast` or `vendor` |
| `status` | `confirmed`, `pending`, or `unsubscribed` |
| `seq` | Signup order, 1, 2, 3… Their public position is `1428 + seq` |
| `skin_concerns` | List, customers only |
| `vendor_type` | Vendor only |
| `referral_code` | e.g. `KAHR-8XPQ` |
| `confirm_token` | For the email confirmation link |
| `created_at` / `confirmed_at` / `consent_at` | Timestamps |

**Two views**, so customers and vendors read as separate lists:

- `waitlist_customers`
- `waitlist_vendors`

## Reading your waitlist

Easiest way: Neon Console → your project → **SQL Editor**.

```sql
-- Everyone who signed up as a customer, in order
SELECT * FROM waitlist_customers;

-- Everyone who applied as a vendor
SELECT * FROM waitlist_vendors;

-- Quick totals
SELECT role, status, COUNT(*)
FROM waitlist_signups
GROUP BY role, status;

-- Just the emails, for an email campaign
SELECT email FROM waitlist_customers WHERE status = 'confirmed';
```

From your own terminal instead:

```bash
psql "postgresql://...your connection string..."
```

## Going live

Set `DATABASE_URL` in your host's environment variables — **not** in the code:

- **Vercel** → Project → Settings → Environment Variables
- **Render / Railway / Fly** → the Environment or Variables tab

Also set `APP_URL` to your live domain (e.g. `https://kahrah.com`) so link
previews on WhatsApp and X show the logo correctly.

---

## Troubleshooting

**It says `storage: file` instead of `postgres`**

1. `DATABASE_URL` is missing or empty in `.env` → the log says
   `DATABASE_URL not set`.
2. The connection failed → the log says `Neon Postgres unavailable, falling back
   to file storage:` followed by the real reason. The site keeps working; only
   storage changes.

Common causes:

| Message | Fix |
| --- | --- |
| `password authentication failed` | The string was copied incomplete, or the password was reset. Copy it again from **Connect**. |
| `could not connect` / timeout | Wrong or truncated hostname. Check for a line break in `.env`. |
| Nothing at all in the log | You edited `.env` but did not restart the server. |

**Did my `.env` load?** The server prints `injected env` on startup. `.env` must
be in the project root, next to `package.json`.

**Signups made before you connected the database** live in
`data/waitlist.json` and are *not* copied over automatically. If that file has
real signups in it, say so before you launch and they can be imported.
