import { BASE_COUNTER, getStore, statsFromCounts } from "../../server/db";
import { parseSignupBody } from "../../server/signup";

/**
 * The waitlist API on Netlify.
 *
 * Netlify serves the built site as static files — server.ts (Express) never
 * runs there — so these routes are provided as a serverless function instead.
 * It shares server/db.ts and server/signup.ts with the Express server, so both
 * behave identically and return the same payloads.
 *
 * Requires DATABASE_URL to be set in the Netlify site's environment variables.
 */

// Netlify Functions v2 routes on this config, no redirect rules needed.
export const config = {
  path: [
    "/api/health",
    "/api/waitlist",
    "/api/waitlist/stats",
    "/api/waitlist/count",
    "/api/waitlist/unsubscribe",
  ],
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default async function handler(req: Request): Promise<Response> {
  // Works whether Netlify routes via config.path (original URL preserved) or
  // via a /api/* -> /.netlify/functions/api redirect (path rewritten).
  const pathname = new URL(req.url).pathname.replace(/^\/\.netlify\/functions\/api/, "") || "/";

  try {
    const store = await getStore();

    // A serverless function's filesystem is thrown away after the request, so
    // the file fallback would accept a signup and silently lose it. Refuse the
    // write instead — a visible error is recoverable, a lost email is not.
    if (store.driver !== "postgres" && req.method === "POST") {
      console.error(
        "DATABASE_URL is not set on this deploy — refusing to accept a signup that could not be stored."
      );
      return json(
        {
          success: false,
          message: "The waitlist is temporarily unavailable. Please try again shortly.",
          code: "STORAGE_UNAVAILABLE",
        },
        503
      );
    }

    if (req.method === "GET") {
      if (pathname === "/api/health") {
        return json({ status: "ok", brand: "KAHRÀH Skincare", storage: store.driver });
      }

      if (pathname === "/api/waitlist/stats") {
        return json(statsFromCounts(await store.counts()));
      }

      if (pathname === "/api/waitlist/count") {
        const { confirmed } = await store.counts();
        return json({
          success: true,
          count: BASE_COUNTER + confirmed,
          confirmedSignups: confirmed,
        });
      }
    }

    if (req.method === "POST" && pathname === "/api/waitlist") {
      const body = await req.json().catch(() => ({}));
      const { error, signup } = parseSignupBody(body);

      if (error || !signup) {
        return json(
          {
            success: false,
            message: error?.message || "Invalid signup request.",
            code: error?.code || "INVALID_EMAIL",
          },
          error?.status || 400
        );
      }

      const { entry, alreadyRegistered } = await store.create(signup);
      const stats = statsFromCounts(await store.counts());

      return json({
        success: true,
        alreadyRegistered,
        entry,
        stats,
        message: alreadyRegistered
          ? "You are already on the KAHRÀH waitlist!"
          : "Your email has been added successfully! Welcome to KAHRÀH.",
      });
    }

    if (req.method === "POST" && pathname === "/api/waitlist/unsubscribe") {
      const body: any = await req.json().catch(() => ({}));
      const { email, token } = body ?? {};

      if (!email && !token) {
        return json(
          { success: false, message: "Email or token is required.", code: "MISSING_IDENTIFIER" },
          400
        );
      }

      const entry = await store.unsubscribe({
        email: typeof email === "string" ? email.trim().toLowerCase() : undefined,
        token: typeof token === "string" ? token : undefined,
      });

      if (!entry) {
        return json(
          { success: false, message: "No active signup found with the provided details." },
          404
        );
      }

      return json({
        success: true,
        message: "Your email has been successfully unsubscribed from the KAHRÀH waitlist.",
      });
    }

    return json({ success: false, message: "Method not allowed" }, 405);
  } catch (err) {
    console.error("Waitlist API error:", err);
    return json(
      {
        success: false,
        message: "We couldn’t save your signup. Please try again.",
        code: "STORAGE_ERROR",
      },
      500
    );
  }
}
