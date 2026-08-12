import type { NewSignup } from "./db";
import { isValidEmail, normalizeEmail } from "../shared/email";

/**
 * Request-body validation shared by the Express route and the serverless
 * handler, so the two entry points can never drift on what they accept.
 */

export interface SignupError {
  message: string;
  code: "BOT_DETECTED" | "INVALID_EMAIL";
  status: number;
}

export interface SignupParse {
  /** Set when the body was rejected; `signup` is then absent. */
  error?: SignupError;
  /** Set when the body was accepted, normalized for the store. */
  signup?: NewSignup;
}

export function parseSignupBody(body: any): SignupParse {
  const {
    email,
    first_name,
    name,
    role,
    audience,
    skinConcerns,
    vendorType,
    hp_field,
    website,
    honeypot,
    b_name,
  } = body ?? {};

  // Honeypot fields are invisible to humans — anything filled in is a bot.
  if (hp_field || website || honeypot || b_name) {
    return {
      error: { message: "Bot submission rejected.", code: "BOT_DETECTED", status: 400 },
    };
  }

  if (!isValidEmail(email)) {
    return {
      error: {
        message: "Please enter a complete email address, like name@gmail.com.",
        code: "INVALID_EMAIL",
        status: 400,
      },
    };
  }

  const rawName = first_name ?? name;
  const isVendor = role === "vendor" || audience === "vendor";

  return {
    signup: {
      email: normalizeEmail(email),
      firstName: rawName ? String(rawName).trim() || undefined : undefined,
      role: isVendor ? "vendor" : "seeker",
      audience: isVendor ? "vendor" : "enthusiast",
      skinConcerns: Array.isArray(skinConcerns) ? skinConcerns.map(String) : [],
      vendorType: vendorType ? String(vendorType).trim() : undefined,
    },
  };
}
