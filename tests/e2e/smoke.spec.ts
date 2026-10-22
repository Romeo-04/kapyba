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
  await page.getByRole("button", { name: "₱60 pababa" }).click();
  await expect(page.getByTestId("board-empty")).toBeVisible();
});

test("a write from another site is refused and pages carry security headers", async ({ request, baseURL }) => {
  const evil = await request.post("/api/auth/request", { headers: { Origin: "https://evil.example" }, data: { email: "a@b.co" } });
  expect(evil.status()).toBe(403);
  const home = await request.get("/");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  const same = await request.post("/api/auth/request", { headers: { Origin: baseURL! }, data: { email: "not-an-email" } });
  expect(same.status()).toBe(400);
});
