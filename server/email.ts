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

/**
 * One pooled transport per process, kept at module scope on purpose.
 *
 * Connecting and authenticating to Gmail costs ~4s; reusing the socket brings
 * later sends down to ~1.5s. Serverless containers are reused between
 * invocations, so the second signup onward pays only the cheap path.
 */
let transport: nodemailer.Transporter | null = null;

function getTransport(user: string, pass: string) {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // upgraded to TLS via STARTTLS
      auth: { user, pass },
      pool: true,
      maxConnections: 1,
      // Bounded so a slow handshake cannot hold up the signup response, and
      // stays well inside Netlify's 10s function limit.
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 7000,
    });
  }
  return transport;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

export function welcomeHtml(entry: WaitlistEntry): string {
  const greeting = entry.first_name ? `Hi ${escapeHtml(entry.first_name)},` : "Hi there,";
  const isVendor = entry.role === "vendor";

  const p = 'margin:0 0 16px;font-size:15px;line-height:1.65;color:#4A3B35;';
  const li = 'margin:0 0 10px;font-size:15px;line-height:1.6;color:#4A3B35;';

  const body = isVendor
    ? `<p style="${p}">${greeting}</p>
       <p style="${p}">
         Thanks for applying to sell on KAHRÀH. You're
         <strong style="color:#2C1D18;">number ${entry.positionNumber}</strong> on the vendor list.
       </p>
       <p style="${p}">As a verified KAHRÀH vendor you get:</p>
       <ul style="margin:0 0 16px;padding-left:20px;">
         <li style="${li}">Your products listed with a <strong style="color:#2C1D18;">KAHRÀH Verified</strong> badge, once ingredients and lab results are checked.</li>
         <li style="${li}">Customers matched to you by their skin analysis — people already looking for what you make.</li>
         <li style="${li}">No paid placement. Ranking is by ingredient fit, so you compete on formulation, not ad budget.</li>
         <li style="${li}">First access to onboarding, before the marketplace opens publicly.</li>
       </ul>
       <p style="${p}">
         We'll contact you directly when vendor onboarding opens, with what's needed to get verified.
       </p>`
    : `<p style="${p}">${greeting}</p>
       <p style="${p}">
         Thanks for joining the KAHRÀH waitlist. You're
         <strong style="color:#2C1D18;">number ${entry.positionNumber}</strong> in line.
       </p>
       <p style="${p}">
         KAHRÀH analyses your skin from a photo and matches you with products suited to it,
         chosen by ingredients rather than advertising.
       </p>
       <p style="${p}">
         We'll email you once, when early access opens. Nothing before then.
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

      <p style="margin:0 0 26px;font-size:15px;line-height:1.65;color:#4A3B35;">
        — The KAHRÀH team
      </p>

      <p style="margin:0;padding-top:18px;border-top:1px solid #E8DFD3;font-size:12px;line-height:1.6;color:#94A3B8;">
        You're receiving this because ${escapeHtml(entry.email)} was entered on the KAHRÀH
        waitlist. If that wasn't you, you can ignore this email.
      </p>
    </div>
  </body>
</html>`;
}

export function welcomeText(entry: WaitlistEntry): string {
  // A plain-text part improves deliverability and serves text-only clients.
  const isVendor = entry.role === "vendor";
  const greeting = entry.first_name ? `Hi ${entry.first_name},` : "Hi there,";

  const lines = isVendor
    ? [
        greeting,
        "",
        `Thanks for applying to sell on KAHRÀH. You're number ${entry.positionNumber} on the vendor list.`,
        "",
        "As a verified KAHRÀH vendor you get:",
        "",
        "- Your products listed with a KAHRÀH Verified badge, once ingredients and lab results are checked.",
        "- Customers matched to you by their skin analysis — people already looking for what you make.",
        "- No paid placement. Ranking is by ingredient fit, so you compete on formulation, not ad budget.",
        "- First access to onboarding, before the marketplace opens publicly.",
        "",
        "We'll contact you directly when vendor onboarding opens, with what's needed to get verified.",
      ]
    : [
        greeting,
        "",
        `Thanks for joining the KAHRÀH waitlist. You're number ${entry.positionNumber} in line.`,
        "",
        "KAHRÀH analyses your skin from a photo and matches you with products suited to it, chosen by ingredients rather than advertising.",
        "",
        "We'll email you once, when early access opens. Nothing before then.",
      ];

  return [
    ...lines,
    "",
    "— The KAHRÀH team",
    "",
    `You're receiving this because ${entry.email} was entered on the KAHRÀH waitlist.`,
    "If that wasn't you, you can ignore this email.",
  ].join("\n");
}

/**
 * Welcomes a new signup, and copies the owner if NOTIFY_EMAIL is set.
 * Always resolves; failures are logged, never thrown.
 */
export async function sendWelcomeEmail(entry: WaitlistEntry): Promise<void> {
  const { user, pass, fromName, notifyEmail } = config();
  if (!user || !pass) return; // Not configured — nothing to do.

  try {
    // One message, not two: a second send costs another ~4s and two sends
    // measured 10.5s, over Netlify's 10s function limit. The owner is blind
    // copied instead, so they still receive every signup — the To: header
    // shows who joined.
    await getTransport(user, pass).sendMail({
      from: `"${fromName}" <${user}>`,
      to: entry.email,
      bcc: notifyEmail || undefined,
      subject: "You're on the KAHRÀH list — thank you",
      text: welcomeText(entry),
      html: welcomeHtml(entry),
    });
  } catch (err) {
    console.error("[KAHRÀH email] Welcome email failed:", err instanceof Error ? err.message : err);
  }
  // The transport is pooled and deliberately left open for the next signup.
}
