// Smoke test for a deployed KapyBa: node scripts/smoke.mjs https://your-url
// Read-only. Checks health, the public pages and that the owner area is closed to strangers.
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!base) { console.error("usage: node scripts/smoke.mjs <url>"); process.exit(2); }

let failed = 0;
async function check(name, fn) {
  try { await fn(); console.log(`ok   ${name}`); }
  catch (e) { failed++; console.log(`FAIL ${name}: ${e.message}`); }
}
const get = (path, init) => fetch(base + path, { redirect: "manual", ...init });
const must = (cond, msg) => { if (!cond) throw new Error(msg); };

await check("health is ok and the database answers", async () => {
  const r = await get("/api/health"); const j = await r.json();
  must(r.status === 200 && j.ok && j.db, `status ${r.status} ${JSON.stringify(j)}`);
});
await check("home page loads", async () => { const r = await get("/"); must(r.status === 200, `status ${r.status}`); });
await check("Ulam board loads", async () => { const r = await get("/ulam"); must(r.status === 200, `status ${r.status}`); });
await check("privacy page loads", async () => { const r = await get("/privacy"); must(r.status === 200, `status ${r.status}`); });
await check("owner page sends a stranger home", async () => {
  const r = await get("/o"); must([302, 303, 307, 308].includes(r.status), `status ${r.status}`);
});
await check("owner API refuses a stranger", async () => { const r = await get("/api/stalls"); must(r.status === 401, `status ${r.status}`); });
await check("an unknown stall code is not found", async () => { const r = await get("/api/s/zzzzzzzzzz"); must(r.status === 404, `status ${r.status}`); });
await check("a cross-site write is refused", async () => {
  const r = await get("/api/auth/request", { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: "{}" });
  must(r.status === 403, `status ${r.status}`);
});
await check("security headers are present", async () => {
  const r = await get("/"); must(r.headers.get("x-content-type-options") === "nosniff" && r.headers.get("x-frame-options") === "DENY", "missing headers");
});
await check("retention job is closed without the secret", async () => { const r = await get("/api/cron/retention"); must(r.status === 401, `status ${r.status}`); });

console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
