import { expect, test } from "@playwright/test";
import { readFileSync, rmSync } from "node:fs";
import { MAIL_FILE } from "../../playwright.config";

test("owner sets up a stall, a second phone rates, the owner sees it", async ({ browser, baseURL }) => {
  rmSync(MAIL_FILE, { force: true });

  // Owner signs in with the emailed link.
  const ownerCtx = await browser.newContext({ baseURL });
  const owner = await ownerCtx.newPage();
  await owner.goto("/");
  await owner.getByLabel("Owner sign-in").fill("rosa@example.com");
  await owner.getByRole("button", { name: "Send link" }).click();
  await expect(owner.getByText("Check your email")).toBeVisible();
  const link = readFileSync(MAIL_FILE, "utf8").trim().split("\n").pop()!;
  await owner.goto(link);
  await expect(owner.getByRole("heading", { name: "Simula" })).toBeVisible();

  // Setup: stall, then a dish.
  await owner.getByLabel("Stall name").fill("Karinderya ni Rosa");
  await owner.getByLabel("Area or school nearby").fill("UST");
  await owner.getByRole("button", { name: "Next" }).click();
  await expect(owner.getByRole("heading", { name: "Ngayon" })).toBeVisible();
  await owner.getByLabel("Dish", { exact: true }).fill("Adobo");
  await owner.getByLabel("Price (₱)").fill("70");
  await owner.getByRole("button", { name: "Add" }).click();
  await expect(owner.getByText("Adobo", { exact: true })).toBeVisible();
  await expect(owner.getByAltText("Stall QR code")).toBeVisible();

  // Fetch from the page: the browser keeps the Secure session cookie on 127.0.0.1, the request client may not.
  const code = await owner.evaluate(async () => (await (await fetch("/api/stalls")).json()).stalls[0].code as string);

  // A different phone (separate cookies) scans the QR page and rates.
  const buyerCtx = await browser.newContext({ baseURL });
  const buyer = await buyerCtx.newPage();
  await buyer.goto(`/s/${code}`);
  await buyer.getByRole("button", { name: /Adobo/ }).click();
  await buyer.getByRole("button", { name: "Masarap", exact: true }).click();
  await expect(buyer.getByRole("heading", { name: "Salamat!" })).toBeVisible();

  // The same buyer cannot rate the same dish twice in a day.
  await buyer.getByRole("button", { name: "Rate another dish" }).click();
  await buyer.getByRole("button", { name: /Adobo/ }).click();
  await buyer.getByRole("button", { name: "Masarap", exact: true }).click();
  await expect(buyer.getByText("Nai-rate mo na ito ngayong araw")).toBeVisible();

  // The owner sees exactly one rating.
  await owner.reload();
  await expect(owner.getByText("1 ratings · 1 buyers")).toBeVisible();

  await ownerCtx.close();
  await buyerCtx.close();
});

test("signed-out visitors cannot open the owner page", async ({ page }) => {
  await page.goto("/o");
  await expect(page).toHaveURL(/\/$/);
});

test("an unknown stall code shows a not-found message", async ({ page }) => {
  await page.goto("/s/doesnotexist");
  await expect(page.getByText("Hindi mahanap ang stall na ito.")).toBeVisible();
});
