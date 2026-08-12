import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BASE_COUNTER, getStore, statsFromCounts } from "../server/db";
import { parseSignupBody } from "../server/signup";

/**
 * Serverless mirror of the Express /api/waitlist route.
 *
 * The Express server in server.ts is the primary backend; this handler exists
 * for serverless deploys and deliberately shares the same storage layer and
 * validation so both return identical payloads.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET /api/waitlist - Returns public count
  if (req.method === "GET") {
    try {
      const store = await getStore();
      const { confirmed } = await store.counts();
      return res.status(200).json({
        success: true,
        count: BASE_COUNTER + confirmed,
        confirmedSignups: confirmed,
      });
    } catch (err) {
      console.error("Error reading waitlist count:", err);
      return res.status(200).json({
        success: true,
        count: BASE_COUNTER,
        confirmedSignups: 0,
      });
    }
  }

  // POST /api/waitlist - Create waitlist entry
  if (req.method === "POST") {
    const { error, signup } = parseSignupBody(req.body);
    if (error || !signup) {
      return res.status(error?.status || 400).json({
        success: false,
        message: error?.message || "Invalid signup request.",
        code: error?.code || "INVALID_EMAIL",
      });
    }

    try {
      const store = await getStore();
      const { entry, alreadyRegistered } = await store.create(signup);
      const stats = statsFromCounts(await store.counts());

      return res.status(200).json({
        success: true,
        alreadyRegistered,
        entry,
        stats,
        positionNumber: entry.positionNumber,
        message: alreadyRegistered
          ? "You are already on the KAHRÀH waitlist!"
          : "Your email has been added successfully! Welcome to KAHRÀH.",
      });
    } catch (err) {
      console.error("Waitlist signup failed:", err);
      return res.status(500).json({
        success: false,
        message: "We couldn't save your signup. Please try again.",
        code: "STORAGE_ERROR",
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
}
