import type { WaitlistEntry } from "./db";

/**
 * Transactional email for waitlist signups, via Brevo's HTTP API.
 *
 * HTTP rather than SMTP because serverless platforms often block outbound SMTP
 * ports, and an HTTP call needs no connection pooling or long-lived socket.
 *
 * Entirely optional: with BREVO_API_KEY unset nothing is sent and signups carry
 * on as normal. Sending never blocks or fails a signup — an email that does not
 * arrive is a smaller problem than an email address that was never saved.
 */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface BrevoContact {
  email: string;
  name?: string;
}

function config() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim();
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "KAHRÀH Skincare";
  // Optional: a copy of every signup, so you also hold them outside the database.
  const notifyEmail = process.env.NOTIFY_EMAIL?.trim();
  return { apiKey, fromEmail, fromName, notifyEmail };
}

async function send(to: BrevoContact[], subject: string, htmlContent: string): Promise<boolean> {
  const { apiKey, fromEmail, fromName } = config();
  if (!apiKey || !fromEmail) return false;

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to,
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      // Brevo explains rejections (unverified sender, quota) in the body.
      console.error(`[KAHRÀH email] Brevo returned ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[KAHRÀH email] Could not reach Brevo:", err);
    return false;
  }
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

/**
 * Welcomes a new signup, and copies the owner if NOTIFY_EMAIL is set.
 * Always resolves; failures are logged, never thrown.
 */
export async function sendWelcomeEmail(entry: WaitlistEntry): Promise<void> {
  const { apiKey, fromEmail, notifyEmail } = config();
  if (!apiKey || !fromEmail) return; // Not configured — nothing to do.

  await send(
    [{ email: entry.email, name: entry.first_name }],
    "Welcome to the KAHRÀH waitlist",
    welcomeHtml(entry)
  );

  if (notifyEmail) {
    await send(
      [{ email: notifyEmail }],
      `New KAHRÀH signup: ${entry.email}`,
      `<p style="font-family:system-ui,sans-serif;font-size:14px;">
        <strong>${escapeHtml(entry.email)}</strong> joined as
        <strong>${entry.role === "vendor" ? "a vendor" : "a customer"}</strong>.<br>
        Position ${entry.positionNumber} · referral ${escapeHtml(entry.referralCode)}<br>
        ${escapeHtml(entry.created_at)}
      </p>`
    );
  }
}
