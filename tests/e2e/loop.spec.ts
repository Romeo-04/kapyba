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
  await expect(owner.getByText("Adobo", { exact: true }).first()).toBeVisible();
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

  // End-of-day log: 12 cooked, 9 sold at ₱70 leaves 3 portions, about ₱210.
  await owner.getByLabel("Adobo cooked").fill("12");
  await owner.getByLabel("Adobo sold").fill("9");
  await owner.getByRole("button", { name: "Save today" }).click();
  await expect(owner.getByTestId("natira-summary")).toContainText("3 left over, about ₱210");

  // Bukas now suggests 9 (the average sold) for Adobo.
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 9");

  // Palengke: 9 servings of Adobo need 1.4 kg chicken; the list shows a range and the placeholder notice.
  await expect(owner.getByText("Chicken · 1.4 kg")).toBeVisible();
  await expect(owner.getByTestId("palengke-total")).toContainText("likely total");
  await expect(owner.getByRole("note")).toContainText("placeholder estimate");

  // Alok: the owner picks Adobo as Paborito (so it shows on the board) and posts a one-plate deal.
  await owner.getByRole("button", { name: "Paborito" }).click();
  await owner.getByLabel("Limit").fill("1");
  await owner.getByRole("button", { name: "Post deal" }).click();
  await expect(owner.getByTestId("alok-row")).toContainText("1 of 1 left");

  // A phone that never scanned the QR opens the board, sees the ribbon and reserves the deal.
  const guestCtx = await browser.newContext({ baseURL });
  const guest = await guestCtx.newPage();
  await guest.goto("/ulam");
  await expect(guest.getByText("Alok · 1 left")).toBeVisible();
  await guest.getByRole("button", { name: "Kunin ang deal" }).click();
  await expect(guest.getByRole("status")).toContainText("Reserved");
  await expect(guest.getByText("Alok", { exact: false })).toHaveCount(0);
  await guestCtx.close();

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
