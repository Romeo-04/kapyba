// Sends the sign-in link. Resend over fetch when configured; logs the link in development only.
export async function sendLoginLink(to: string, link: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (key && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: "Your KapyBa sign-in link",
        text: `Open this link to sign in to KapyBa. It works once and expires in 15 minutes.\n\n${link}`,
      }),
    });
    if (!res.ok) throw new Error(`mail provider returned ${res.status}`);
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY and MAIL_FROM are required in production");
  console.log(`[dev mail] sign-in link for ${to}: ${link}`);
}
