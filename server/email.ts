import nodemailer from "nodemailer";
import type { WaitlistEntry } from "./db";

/**
 * Signup emails, sent through Gmail's SMTP with an App Password.
 *
 * Chosen because it needs no domain of your own: Google really is the sender,
 * so the mail is DMARC-aligned and lands in inboxes. Providers like Brevo and
 * Resend instead require a domain you control, which a *.netlify.app subdomain
 * can never be.
 *
 * Entirely optional: with GMAIL_USER / GMAIL_APP_PASSWORD unset nothing is
 * sent and signups carry on as normal. Sending never fails a signup — the row
 * is stored first and errors here are logged, never thrown.
 *
 * Free Gmail allows roughly 500 recipients a day, far beyond early waitlist
 * volume. Moving to a custom domain later is a change to this file only.
 */

function config() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, ""); // Google shows it in groups of four
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "KAHRÀH Skincare";
  // Optional: a copy of every signup, so the list also lives in your inbox.
  const notifyEmail = process.env.NOTIFY_EMAIL?.trim();
  return { user, pass, fromName, notifyEmail };
}

function createTransport(user: string, pass: string) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgraded to TLS via STARTTLS
    auth: { user, pass },
    // Bounded so a slow SMTP handshake cannot hold up the signup response.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

function welcomeHtml(entry: WaitlistEntry): string {
  const greeting = entry.first_name ? `Hi ${escapeHtml(entry.first_name)},` : "Hi there,";
  const isVendor = entry.role === "vendor";

  const body = isVendor
    ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B35;">
         ${greeting}
       </p>
       <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B35;">
         Thank you for putting your brand forward. We're building KAHRÀH to be a place where
         honest formulators get found by the people who actually need them — no bleaching
         creams, no miracle claims, no paying your way to the top of a list.
       </p>
       <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B35;">
         You're <strong style="color:#2C1D18;">number ${entry.positionNumber}</strong> in line.
         When vendor onboarding opens we'll be in touch personally about getting your
         products verified and listed.
       </p>`
    : `<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B35;">
         ${greeting}
       </p>
       <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B35;">
         Thank you, genuinely. Handing over your email is a small thing to do and a real thing
         to trust someone with, and we don't take it lightly.
       </p>
       <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B35;">
         You're <strong style="color:#2C1D18;">number ${entry.positionNumber}</strong> in line.
         KAHRÀH exists because finding skincare that understands your skin shouldn't mean
         guesswork, or shelves full of products that were never tested on skin like yours.
       </p>
       <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3B35;">
         Here's what happens next: not much, for a little while. We won't crowd your inbox.
         When early access opens you'll get one email, and you'll be among the first to try
         the skin analysis.
       </p>`;

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px 16px;background:#FAF6F0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#2C1D18;">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E8DFD3;border-radius:12px;padding:32px 28px;">
      <div style="display:inline-block;background:#8C4A27;color:#FFFDF9;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;margin-bottom:20px;">
        KAHRÀH
      </div>

      <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:#2C1D18;">
        You're on the list.
      </h1>

      ${body}

      <div style="margin:26px 0;padding:18px;background:#FAF6F0;border:1px solid #E8DFD3;border-radius:8px;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.8px;text-transform:uppercase;color:#8C7C72;">
          Your referral code
        </p>
        <p style="margin:0 0 8px;font-size:22px;font-weight:bold;letter-spacing:1.5px;color:#8C4A27;">
          ${escapeHtml(entry.referralCode)}
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">
          Know someone whose skin deserves better answers? Pass it along.
        </p>
      </div>

      <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#4A3B35;">
        Thanks for being early.
      </p>
      <p style="margin:0 0 26px;font-size:15px;line-height:1.7;color:#4A3B35;">
        — Barakah &amp; the KAHRÀH team
      </p>

      <p style="margin:0;padding-top:18px;border-top:1px solid #E8DFD3;font-size:12px;line-height:1.6;color:#94A3B8;">
        You're getting this because ${escapeHtml(entry.email)} was entered on the KAHRÀH
        waitlist. If that wasn't you, just ignore this and you'll hear nothing more.
      </p>
    </div>
  </body>
</html>`;
}

function welcomeText(entry: WaitlistEntry): string {
  // A plain-text part improves deliverability and serves text-only clients.
  const isVendor = entry.role === "vendor";
  return [
    entry.first_name ? `Hi ${entry.first_name},` : "Hi there,",
    "",
    isVendor
      ? "Thank you for putting your brand forward. We're building KAHRÀH to be a place where honest formulators get found by the people who actually need them."
      : "Thank you, genuinely. Handing over your email is a small thing to do and a real thing to trust someone with, and we don't take it lightly.",
    "",
    `You're number ${entry.positionNumber} in line.`,
    "",
    isVendor
      ? "When vendor onboarding opens we'll be in touch personally about getting your products verified and listed."
      : "Here's what happens next: not much, for a little while. We won't crowd your inbox. When early access opens you'll get one email, and you'll be among the first to try the skin analysis.",
    "",
    `Your referral code: ${entry.referralCode}`,
    "Know someone whose skin deserves better answers? Pass it along.",
    "",
    "Thanks for being early.",
    "— Barakah & the KAHRÀH team",
    "",
    `You're getting this because ${entry.email} was entered on the KAHRÀH waitlist.`,
    "If that wasn't you, just ignore this and you'll hear nothing more.",
  ].join("\n");
}

/**
 * Welcomes a new signup, and copies the owner if NOTIFY_EMAIL is set.
 * Always resolves; failures are logged, never thrown.
 */
export async function sendWelcomeEmail(entry: WaitlistEntry): Promise<void> {
  const { user, pass, fromName, notifyEmail } = config();
  if (!user || !pass) return; // Not configured — nothing to do.

  const transport = createTransport(user, pass);
  const from = `"${fromName}" <${user}>`;

  try {
    await transport.sendMail({
      from,
      to: entry.email,
      subject: "You're on the KAHRÀH list — thank you",
      text: welcomeText(entry),
      html: welcomeHtml(entry),
    });
  } catch (err) {
    console.error("[KAHRÀH email] Welcome email failed:", err instanceof Error ? err.message : err);
  }

  if (notifyEmail) {
    try {
      await transport.sendMail({
        from,
        to: notifyEmail,
        replyTo: entry.email,
        subject: `New KAHRÀH signup: ${entry.email}`,
        text: `${entry.email} joined as ${entry.role === "vendor" ? "a vendor" : "a customer"}.
Position ${entry.positionNumber} · referral ${entry.referralCode}
${entry.created_at}`,
      });
    } catch (err) {
      console.error("[KAHRÀH email] Owner notification failed:", err instanceof Error ? err.message : err);
    }
  }

  transport.close();
}
