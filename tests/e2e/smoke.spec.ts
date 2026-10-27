import { expect, test } from "@playwright/test";

test("health endpoint is ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect((await res.json()).ok).toBe(true);
});

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

test("the Ulam board loads with an empty state and a budget filter", async ({ page }) => {
  await page.goto("/ulam");
  await expect(page.getByRole("heading", { name: "Ulam" })).toBeVisible();
  await page.getByLabel("Price").selectOption("50");
  await expect(page.getByTestId("board-empty")).toBeVisible();
});

test("a write from another site is refused and pages carry security headers", async ({ request, baseURL }) => {
  const evil = await request.post("/api/auth/request", { headers: { Origin: "https://evil.example" }, data: { email: "a@b.co" } });
  expect(evil.status()).toBe(403);
  const opaque = await request.post("/api/auth/request", { headers: { Origin: "null" }, data: { email: "a@b.co" } });
  expect(opaque.status()).toBe(403);
  const home = await request.get("/");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  const same = await request.post("/api/auth/request", { headers: { Origin: baseURL! }, data: { email: "not-an-email" } });
  expect(same.status()).toBe(400);
});

test("the privacy notice shows once, links to the privacy page and stays dismissed", async ({ page }) => {
  await page.goto("/owner");
  await expect(page.getByTestId("privacy-note")).toBeVisible();
  await page.getByTestId("privacy-note").getByRole("button", { name: "OK" }).click();
  await expect(page.getByTestId("privacy-note")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("privacy-note")).toHaveCount(0);
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();
  await expect(page.getByText("no money is held or paid out")).toBeVisible();
});

test("the app is installable: manifest, icons and service worker are served", async ({ request }) => {
  const m = await (await request.get("/manifest.webmanifest")).json();
  expect(m.display).toBe("standalone");
  for (const icon of m.icons) expect((await request.get(icon.src)).status()).toBe(200);
  const sw = await request.get("/sw.js");
  expect(sw.status()).toBe(200);
  expect(await sw.text()).toContain("kb-v2");
});

test("the front door is the Ulam board", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Ulam", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Owner" })).toBeVisible();
  await expect(page.getByTestId("welcome")).toHaveCount(0);
});

test.describe("first open on a new phone", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("a customer answers the welcome questions and the board uses them", async ({ page }) => {
    await page.goto("/");
    const w = page.getByTestId("welcome");
    await expect(w.getByRole("heading", { name: /Which one is you/ })).toBeVisible();
    await w.getByRole("button", { name: /I eat at karinderyas/ }).click();
    await w.getByRole("button", { name: "Pork" }).click();
    await w.getByRole("button", { name: "Next" }).click();
    await w.getByLabel(/Most you spend/).fill("85");
    await w.getByRole("button", { name: "Next" }).click();
    await w.getByRole("button", { name: "Peanut" }).click();
    await w.getByRole("button", { name: "Next" }).click();
    await w.getByRole("button", { name: "Next" }).click();
    await w.getByRole("button", { name: "Show my ulam" }).click();
    await expect(w).toHaveCount(0);
    await expect(page.locator("#budget")).toHaveValue("85");
    await expect(page.getByRole("button", { name: /My preferences · 2/ })).toBeVisible();
    await expect(page.getByText(/contain peanut are listed last/)).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("welcome")).toHaveCount(0);
    await page.getByRole("button", { name: /My preferences/ }).click();
    await expect(page.getByTestId("welcome").getByRole("button", { name: "Pork" })).toHaveAttribute("aria-pressed", "true");
  });

  test("an owner is sent to set up their karinderya", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("welcome").getByRole("button", { name: /I run a karinderya/ }).click();
    await expect(page.getByTestId("welcome")).toContainText("Print your QR code");
    await page.getByRole("link", { name: "Set up my karinderya" }).click();
    await expect(page).toHaveURL(/\/owner$/);
    await expect(page.getByTestId("welcome")).toHaveCount(0);
  });

  test("the rating page never shows the welcome", async ({ page }) => {
    await page.goto("/s/nope");
    await expect(page.getByTestId("welcome")).toHaveCount(0);
  });
});

test("Kapy greets the first open of a visit, not the rating page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("splash")).toBeVisible();
  await expect(page.getByTestId("splash")).toHaveCount(0, { timeout: 5000 });
  await page.reload();
  await expect(page.getByTestId("splash")).toHaveCount(0);
});

test("the Community page shows the public feed and invites owners to sign in", async ({ page }) => {
  await page.goto("/community");
  await expect(page.getByTestId("community-feed")).toBeVisible();
  await expect(page.getByText("Own a karinderya?")).toBeVisible();
  await expect(page.getByRole("link", { name: "Owner sign-in" })).toBeVisible();
});
