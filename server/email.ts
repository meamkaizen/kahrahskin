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
  const greeting = entry.first_name ? `Hi ${escapeHtml(entry.first_name)},` : "Hi,";
  const isVendor = entry.role === "vendor";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#FAF6F0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#2C1D18;">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E8DFD3;border-radius:12px;padding:32px;">
      <div style="display:inline-block;background:#8C4A27;color:#FFFDF9;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:20px;margin-bottom:18px;">
        KAHRÀH Waitlist
      </div>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;">You're on the list.</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#64748B;">
        ${greeting} thanks for joining KAHRÀH${isVendor ? " as a vendor" : ""}. You're
        <strong style="color:#2C1D18;">number ${entry.positionNumber}</strong> in the queue.
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#64748B;">
        ${isVendor
          ? "We'll be in touch about listing your products once vendor onboarding opens."
          : "We'll email you as soon as early access opens, so you can try the AI skin analysis before the public launch."}
      </p>
      <p style="margin:0 0 6px;font-size:13px;color:#64748B;">Your referral code</p>
      <p style="margin:0 0 24px;font-size:20px;font-weight:bold;letter-spacing:1px;color:#8C4A27;">
        ${escapeHtml(entry.referralCode)}
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#94A3B8;">
        You received this because ${escapeHtml(entry.email)} was entered on the KAHRÀH waitlist.
        If that wasn't you, you can ignore this email.
      </p>
    </div>
  </body>
</html>`;
}

function welcomeText(entry: WaitlistEntry): string {
  // A plain-text part improves deliverability and serves text-only clients.
  return [
    entry.first_name ? `Hi ${entry.first_name},` : "Hi,",
    "",
    `Thanks for joining the KAHRÀH waitlist. You're number ${entry.positionNumber} in the queue.`,
    `Your referral code: ${entry.referralCode}`,
    "",
    "We'll email you as soon as early access opens.",
    "",
    `You received this because ${entry.email} was entered on the KAHRÀH waitlist.`,
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
      subject: "Welcome to the KAHRÀH waitlist",
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
