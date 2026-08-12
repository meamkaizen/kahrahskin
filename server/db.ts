import fs from "fs";
import path from "path";
import crypto from "crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Storage layer for the KAHRÀH waitlist.
 *
 * Two interchangeable backends behind one interface:
 *   - NeonStore: Neon Postgres, used whenever DATABASE_URL is set.
 *   - FileStore: data/waitlist.json, used as a local fallback so the site
 *     still works before a database is provisioned.
 *
 * Both return the same WaitlistEntry shape, which is what the React frontend
 * (WaitlistSubmission in src/types.ts) consumes.
 */

// Initial seed count reflecting early established interest
export const BASE_COUNTER = 1428;

export type Audience = "enthusiast" | "seeker" | "vendor";
export type Role = "seeker" | "vendor";
export type Status = "pending" | "confirmed" | "unsubscribed";

export interface WaitlistEntry {
  id: string;
  email: string; // stored lowercased + trimmed
  first_name?: string;
  name?: string;
  audience: Audience;
  role: Role;
  status: Status;
  confirm_token: string;
  consent_at: string;
  created_at: string;
  createdAt: string;
  confirmed_at: string | null;
  skinConcerns: string[];
  vendorType?: string;
  referralCode: string;
  positionNumber: number;
}

export interface NewSignup {
  email: string;
  firstName?: string;
  role: Role;
  audience: Audience;
  skinConcerns: string[];
  vendorType?: string;
}

export interface WaitlistCounts {
  active: number;
  confirmed: number;
  seekers: number;
  vendors: number;
}

export interface WaitlistStats {
  totalWaitlistCount: number;
  seekerCount: number;
  vendorCount: number;
  betaSpotsRemaining: number;
}

export interface CreateResult {
  entry: WaitlistEntry;
  alreadyRegistered: boolean;
}

export interface WaitlistStore {
  readonly driver: "postgres" | "file";
  init(): Promise<void>;
  create(signup: NewSignup): Promise<CreateResult>;
  findByEmail(email: string): Promise<WaitlistEntry | null>;
  findByToken(token: string): Promise<WaitlistEntry | null>;
  confirm(token: string): Promise<WaitlistEntry | null>;
  unsubscribe(opts: { email?: string; token?: string }): Promise<WaitlistEntry | null>;
  counts(): Promise<WaitlistCounts>;
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KAHR-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateConfirmToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * Marketing-facing stats derived from real counts plus the seeded base.
 * The base counter is split 82/18 seeker/vendor so the two figures always
 * add up to the displayed total.
 */
export function statsFromCounts(counts: WaitlistCounts): WaitlistStats {
  const totalWaitlistCount = BASE_COUNTER + counts.active;
  const seededSeekers = Math.round(BASE_COUNTER * 0.82);
  const seededVendors = BASE_COUNTER - seededSeekers;
  return {
    totalWaitlistCount,
    seekerCount: seededSeekers + counts.seekers,
    vendorCount: seededVendors + counts.vendors,
    betaSpotsRemaining: Math.max(12, 2000 - totalWaitlistCount),
  };
}

// ---------------------------------------------------------------------------
// Neon Postgres
// ---------------------------------------------------------------------------

type Row = Record<string, any>;

function rowToEntry(row: Row): WaitlistEntry {
  const createdAt = new Date(row.created_at).toISOString();
  const firstName = row.first_name ?? undefined;
  return {
    id: String(row.id),
    email: row.email,
    first_name: firstName,
    name: firstName,
    audience: row.audience,
    role: row.role === "vendor" ? "vendor" : "seeker",
    status: row.status,
    confirm_token: row.confirm_token,
    consent_at: new Date(row.consent_at ?? row.created_at).toISOString(),
    created_at: createdAt,
    createdAt,
    confirmed_at: row.confirmed_at ? new Date(row.confirmed_at).toISOString() : null,
    skinConcerns: Array.isArray(row.skin_concerns) ? row.skin_concerns : [],
    vendorType: row.vendor_type ?? undefined,
    referralCode: row.referral_code ?? generateReferralCode(),
    positionNumber: BASE_COUNTER + Number(row.seq ?? 0),
  };
}

class NeonStore implements WaitlistStore {
  readonly driver = "postgres" as const;
  private sql: NeonQueryFunction<false, false>;
  private ready: Promise<void> | null = null;

  constructor(connectionString: string) {
    this.sql = neon(connectionString);
  }

  init(): Promise<void> {
    // Migration runs once per process; later calls await the same promise.
    if (!this.ready) {
      this.ready = this.migrate();
    }
    return this.ready;
  }

  private async migrate() {
    const sql = this.sql;

    await sql`
      CREATE TABLE IF NOT EXISTS waitlist_signups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        audience TEXT CHECK (audience IN ('enthusiast', 'seeker', 'vendor')) DEFAULT 'enthusiast',
        status TEXT CHECK (status IN ('pending', 'confirmed', 'unsubscribed')) DEFAULT 'confirmed',
        confirm_token TEXT UNIQUE,
        consent_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Columns added after the original table shape shipped. Each is
    // idempotent so an existing database upgrades in place.
    await sql`ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS seq BIGSERIAL;`;
    await sql`ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'seeker';`;
    await sql`ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS skin_concerns TEXT[] DEFAULT '{}';`;
    await sql`ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS vendor_type TEXT;`;
    await sql`ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS referral_code TEXT;`;

    await sql`CREATE INDEX IF NOT EXISTS waitlist_signups_status_idx ON waitlist_signups (status);`;
    await sql`CREATE INDEX IF NOT EXISTS waitlist_signups_confirm_token_idx ON waitlist_signups (confirm_token);`;
    await sql`CREATE INDEX IF NOT EXISTS waitlist_signups_role_idx ON waitlist_signups (role);`;

    // Customers and vendors are one table (so an email can't be taken twice and
    // confirm/unsubscribe/stats stay simple) but are exposed as two separate,
    // signup-ordered lists for reading the waitlist per audience.
    await sql`
      CREATE OR REPLACE VIEW waitlist_customers AS
      SELECT seq AS position, email, first_name, status, skin_concerns,
             referral_code, created_at, confirmed_at
      FROM waitlist_signups
      WHERE role IS DISTINCT FROM 'vendor'
      ORDER BY seq;
    `;
    await sql`
      CREATE OR REPLACE VIEW waitlist_vendors AS
      SELECT seq AS position, email, first_name, status, vendor_type,
             referral_code, created_at, confirmed_at
      FROM waitlist_signups
      WHERE role = 'vendor'
      ORDER BY seq;
    `;
  }

  async create(signup: NewSignup): Promise<CreateResult> {
    await this.init();
    const sql = this.sql;
    const referralCode = generateReferralCode();
    const confirmToken = generateConfirmToken();

    // Signups are confirmed on submission (no double opt-in email yet), but a
    // confirm token is still issued so a confirmation link can be mailed later.
    const inserted = await sql`
      INSERT INTO waitlist_signups (
        email, first_name, audience, role, status, confirm_token,
        skin_concerns, vendor_type, referral_code,
        consent_at, created_at, confirmed_at
      ) VALUES (
        ${signup.email}, ${signup.firstName ?? null}, ${signup.audience}, ${signup.role},
        'confirmed', ${confirmToken},
        ${signup.skinConcerns}::text[], ${signup.vendorType ?? null}, ${referralCode},
        NOW(), NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;

    if (inserted.length > 0) {
      return { entry: rowToEntry(inserted[0]), alreadyRegistered: false };
    }

    // Email already present. Reactivate it if it had been unsubscribed.
    const existing = await sql`
      UPDATE waitlist_signups
      SET status = CASE WHEN status = 'unsubscribed' THEN 'confirmed' ELSE status END,
          confirmed_at = CASE WHEN status = 'unsubscribed' THEN NOW() ELSE confirmed_at END
      WHERE email = ${signup.email}
      RETURNING *;
    `;

    return { entry: rowToEntry(existing[0]), alreadyRegistered: true };
  }

  async findByEmail(email: string): Promise<WaitlistEntry | null> {
    await this.init();
    const rows = await this.sql`SELECT * FROM waitlist_signups WHERE email = ${email} LIMIT 1;`;
    return rows.length > 0 ? rowToEntry(rows[0]) : null;
  }

  async findByToken(token: string): Promise<WaitlistEntry | null> {
    await this.init();
    const rows = await this.sql`SELECT * FROM waitlist_signups WHERE confirm_token = ${token} LIMIT 1;`;
    return rows.length > 0 ? rowToEntry(rows[0]) : null;
  }

  async confirm(token: string): Promise<WaitlistEntry | null> {
    await this.init();
    const rows = await this.sql`
      UPDATE waitlist_signups
      SET status = 'confirmed', confirmed_at = NOW()
      WHERE confirm_token = ${token}
      RETURNING *;
    `;
    return rows.length > 0 ? rowToEntry(rows[0]) : null;
  }

  async unsubscribe({ email, token }: { email?: string; token?: string }): Promise<WaitlistEntry | null> {
    await this.init();
    const rows = email
      ? await this.sql`UPDATE waitlist_signups SET status = 'unsubscribed' WHERE email = ${email} RETURNING *;`
      : await this.sql`UPDATE waitlist_signups SET status = 'unsubscribed' WHERE confirm_token = ${token} RETURNING *;`;
    return rows.length > 0 ? rowToEntry(rows[0]) : null;
  }

  async counts(): Promise<WaitlistCounts> {
    await this.init();
    const rows = await this.sql`
      SELECT
        COUNT(*) FILTER (WHERE status <> 'unsubscribed')::int AS active,
        COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
        COUNT(*) FILTER (WHERE status <> 'unsubscribed' AND role IS DISTINCT FROM 'vendor')::int AS seekers,
        COUNT(*) FILTER (WHERE status <> 'unsubscribed' AND role = 'vendor')::int AS vendors
      FROM waitlist_signups;
    `;
    const r = rows[0] ?? {};
    return {
      active: r.active ?? 0,
      confirmed: r.confirmed ?? 0,
      seekers: r.seekers ?? 0,
      vendors: r.vendors ?? 0,
    };
  }
}

// ---------------------------------------------------------------------------
// JSON file fallback (no DATABASE_URL configured)
// ---------------------------------------------------------------------------

class FileStore implements WaitlistStore {
  readonly driver = "file" as const;
  private dataDir = path.join(process.cwd(), "data");
  private file = path.join(this.dataDir, "waitlist.json");
  private entries: WaitlistEntry[] = [];
  private writable = true;

  async init(): Promise<void> {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (e) {
        this.writable = false;
        console.warn("Could not create data directory, using memory storage:", e);
      }
    }

    if (fs.existsSync(this.file)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(this.file, "utf-8"));
        // Current format is { customers, vendors }; a bare array is the older
        // flat format and is still read so existing data isn't lost.
        const rows: any[] = Array.isArray(parsed)
          ? parsed
          : [...(parsed?.customers ?? []), ...(parsed?.vendors ?? [])];
        this.entries = rows
          .map((e: any) => ({ ...e, skinConcerns: e.skinConcerns ?? [] }))
          .sort((a, b) => a.positionNumber - b.positionNumber);
      } catch (err) {
        console.error("Error reading waitlist.json:", err);
      }
    }
  }

  private save() {
    if (!this.writable) return;
    try {
      // Mirrors the waitlist_customers / waitlist_vendors split used in
      // Postgres, each ordered by signup position.
      const byPosition = (a: WaitlistEntry, b: WaitlistEntry) => a.positionNumber - b.positionNumber;
      const grouped = {
        customers: this.entries.filter(e => e.role !== "vendor").sort(byPosition),
        vendors: this.entries.filter(e => e.role === "vendor").sort(byPosition),
      };
      fs.writeFileSync(this.file, JSON.stringify(grouped, null, 2));
    } catch (err) {
      console.error("Failed to write waitlist.json:", err);
    }
  }

  async create(signup: NewSignup): Promise<CreateResult> {
    const existing = this.entries.find(e => e.email === signup.email);
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "confirmed";
        existing.confirmed_at = new Date().toISOString();
        this.save();
      }
      return { entry: existing, alreadyRegistered: true };
    }

    const nowIso = new Date().toISOString();
    const entry: WaitlistEntry = {
      id: `w_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      email: signup.email,
      first_name: signup.firstName,
      name: signup.firstName,
      audience: signup.audience,
      role: signup.role,
      status: "confirmed",
      confirm_token: generateConfirmToken(),
      consent_at: nowIso,
      created_at: nowIso,
      createdAt: nowIso,
      confirmed_at: nowIso,
      skinConcerns: signup.skinConcerns,
      vendorType: signup.vendorType,
      referralCode: generateReferralCode(),
      positionNumber: BASE_COUNTER + this.entries.length + 1,
    };

    this.entries.push(entry);
    this.save();
    return { entry, alreadyRegistered: false };
  }

  async findByEmail(email: string) {
    return this.entries.find(e => e.email === email) ?? null;
  }

  async findByToken(token: string) {
    return this.entries.find(e => e.confirm_token === token) ?? null;
  }

  async confirm(token: string) {
    const entry = this.entries.find(e => e.confirm_token === token);
    if (!entry) return null;
    entry.status = "confirmed";
    entry.confirmed_at = new Date().toISOString();
    this.save();
    return entry;
  }

  async unsubscribe({ email, token }: { email?: string; token?: string }) {
    const entry = email
      ? this.entries.find(e => e.email === email)
      : this.entries.find(e => e.confirm_token === token);
    if (!entry) return null;
    entry.status = "unsubscribed";
    this.save();
    return entry;
  }

  async counts(): Promise<WaitlistCounts> {
    const active = this.entries.filter(e => e.status !== "unsubscribed");
    return {
      active: active.length,
      confirmed: this.entries.filter(e => e.status === "confirmed").length,
      seekers: active.filter(e => e.role !== "vendor").length,
      vendors: active.filter(e => e.role === "vendor").length,
    };
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let storePromise: Promise<WaitlistStore> | null = null;

export function getStore(): Promise<WaitlistStore> {
  if (!storePromise) {
    storePromise = (async () => {
      const dbUrl = process.env.DATABASE_URL?.trim();
      if (dbUrl) {
        try {
          const store = new NeonStore(dbUrl);
          await store.init();
          console.log("[KAHRÀH] Waitlist storage: Neon Postgres");
          return store;
        } catch (err) {
          console.error("[KAHRÀH] Neon Postgres unavailable, falling back to file storage:", err);
        }
      } else {
        console.warn("[KAHRÀH] DATABASE_URL not set — waitlist signups persist to data/waitlist.json only.");
      }

      const fallback = new FileStore();
      await fallback.init();
      return fallback;
    })();
  }
  return storePromise;
}
