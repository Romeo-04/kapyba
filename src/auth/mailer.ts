// Sends the sign-in link. Resend when its key is set, else Gmail SMTP (no domain needed); logs the link in development only.
const SUBJECT = "Your KapyBa sign-in link";
const body = (link: string) => `Open this link to sign in to KapyBa. It works once and expires in 15 minutes.\n\n${link}`;

export async function sendLoginLink(to: string, link: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (key && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: SUBJECT, text: body(link) }),
    });
    if (!res.ok) throw new Error(`mail provider returned ${res.status}`);
    return;
  }
  // Gmail: SMTP_USER is the Gmail address, SMTP_PASS a 16-character app password (not the account password).
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (user && pass) {
    const { createTransport } = await import("nodemailer");
    const transport = createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } });
    await transport.sendMail({ from: from ?? `KapyBa <${user}>`, to, subject: SUBJECT, text: body(link) });
    return;
  }
  // End-to-end tests read the link from a file; this is set only by the Playwright config.
  const capture = process.env.E2E_MAIL_FILE;
  if (capture) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(capture, `${link}\n`);
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("Set RESEND_API_KEY and MAIL_FROM, or SMTP_USER and SMTP_PASS, to send sign-in links");
  console.log(`[dev mail] sign-in link for ${to}: ${link}`);
}
