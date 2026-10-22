import { afterEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn(async () => ({}));
const createTransport = vi.fn(() => ({ sendMail }));
vi.mock("nodemailer", () => ({ createTransport }));

const { sendLoginLink } = await import("@/src/auth/mailer");

describe("sendLoginLink", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    sendMail.mockClear();
    createTransport.mockClear();
  });

  it("sends through Gmail SMTP when only SMTP_USER and SMTP_PASS are set", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("SMTP_USER", "owner@gmail.com");
    vi.stubEnv("SMTP_PASS", "abcdabcdabcdabcd");
    await sendLoginLink("rosa@example.com", "https://kapyba.vercel.app/api/auth/verify?t=x");
    expect(createTransport).toHaveBeenCalledWith({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: "owner@gmail.com", pass: "abcdabcdabcdabcd" } });
    const mail = sendMail.mock.calls[0] as unknown as [{ from: string; to: string; text: string }];
    expect(mail[0]).toMatchObject({ from: "KapyBa <owner@gmail.com>", to: "rosa@example.com" });
    expect(mail[0].text).toContain("https://kapyba.vercel.app/api/auth/verify?t=x");
  });

  it("prefers Resend when its key and sender are set", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("RESEND_API_KEY", "re_key");
    vi.stubEnv("MAIL_FROM", "KapyBa <hi@kapyba.example>");
    vi.stubEnv("SMTP_USER", "owner@gmail.com");
    vi.stubEnv("SMTP_PASS", "abcdabcdabcdabcd");
    await sendLoginLink("rosa@example.com", "https://x/y");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("refuses to run in production with no mail settings", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASS", "");
    vi.stubEnv("E2E_MAIL_FILE", "");
    vi.stubEnv("NODE_ENV", "production");
    await expect(sendLoginLink("rosa@example.com", "https://x/y")).rejects.toThrow(/SMTP_USER/);
  });
});
