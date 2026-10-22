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

  // Simula: stall, dishes, price, plates, Paborito, QR.
  await owner.getByLabel("Stall name").fill("Karinderya ni Rosa");
  await owner.getByLabel("Area or school nearby").fill("UST");
  await owner.getByRole("button", { name: "Next" }).click();
  await owner.getByRole("button", { name: "Adobo", exact: true }).click();
  await owner.getByRole("button", { name: "Next" }).click();
  await owner.getByRole("button", { name: "Next" }).click();
  await expect(owner.getByText("Set a price for every dish.")).toBeVisible();
  await owner.getByLabel("Price of Adobo (₱)").fill("70");
  await owner.getByRole("button", { name: "Next" }).click();
  await owner.getByRole("button", { name: "Next" }).click(); // Karaniwan: leave the plates as they are
  await owner.getByRole("button", { name: /Adobo/ }).click(); // Paborito
  await owner.getByRole("button", { name: "Next" }).click();
  await expect(owner.getByAltText("Stall QR code")).toBeVisible();
  await expect(owner.getByRole("button", { name: "Print" })).toBeVisible();
  await owner.getByRole("button", { name: "Tapos" }).click();
  await expect(owner.getByRole("heading", { name: "Ngayon" })).toBeVisible();
  await expect(owner.getByTestId("waiting")).toBeVisible();
  await expect(owner.getByText("Adobo", { exact: true }).first()).toBeVisible();
  await expect(owner.getByRole("button", { name: "Paborito" })).toHaveAttribute("aria-pressed", "true");
  await expect(owner.getByAltText("Stall QR code")).toBeVisible();

  // Fix the price.
  await owner.getByRole("button", { name: "Edit" }).click();
  await owner.getByLabel("Price (₱)").first().fill("75");
  await owner.getByRole("button", { name: "Save", exact: true }).first().click();
  await expect(owner.getByText("₱75")).toBeVisible();

  // Fetch from the page: the browser keeps the Secure session cookie on 127.0.0.1, the request client may not.
  const code = await owner.evaluate(async () => (await (await fetch("/api/stalls")).json()).stalls[0].code as string);

  // A different phone (separate cookies) scans the QR page and rates.
  const buyerCtx = await browser.newContext({ baseURL });
  const buyer = await buyerCtx.newPage();
  await buyer.goto(`/s/${code}`);
  await buyer.getByRole("button", { name: /Adobo/ }).click();
  await buyer.getByRole("button", { name: "Masarap", exact: true }).click();
  await expect(buyer.getByRole("heading", { name: "Salamat!" })).toBeVisible();

  // The owner sees what customers ticked, as bars, without opening anything private to the public.
  await owner.reload();
  await owner.getByText("Ano ang sinabi ng customers").click();
  await expect(owner.getByRole("meter", { name: "Maalat o matabang" })).toBeVisible();
  await expect(owner.getByTestId("trend")).toContainText("Kulang pa ang datos");

  // The same buyer cannot rate the same dish twice in a day.
  await buyer.getByRole("button", { name: "Rate another dish" }).click();
  await buyer.getByRole("button", { name: /Adobo/ }).click();
  await buyer.getByRole("button", { name: "Masarap", exact: true }).click();
  await expect(buyer.getByText("Nai-rate mo na ito ngayong araw")).toBeVisible();

  // A third phone loses signal after opening the page: the tap is saved, then sent once when it is back online.
  const offCtx = await browser.newContext({ baseURL });
  const off = await offCtx.newPage();
  await off.goto(`/s/${code}`);
  await expect(off.getByRole("button", { name: /Adobo/ })).toBeVisible();
  // Once the service worker is active, a second visit is cached.
  await off.evaluate(() => navigator.serviceWorker.ready);
  await off.reload();
  await expect(off.getByRole("button", { name: /Adobo/ })).toBeVisible();
  await offCtx.setOffline(true);
  await off.getByRole("button", { name: /Adobo/ }).click();
  await off.getByRole("button", { name: "Masarap", exact: true }).click();
  await expect(off.getByRole("heading", { name: "Naka-save ang rating mo" })).toBeVisible();
  await offCtx.setOffline(false);
  await off.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(async () => {
    await owner.reload();
    await expect(owner.getByText("2 ratings · 2 buyers")).toBeVisible({ timeout: 1000 });
  }).toPass();
  // Reopening the page with no signal still shows the dishes from the cached copy.
  await offCtx.setOffline(true);
  await off.reload();
  await expect(off.getByRole("button", { name: /Adobo/ })).toBeVisible();
  await offCtx.setOffline(false);
  await offCtx.close();

  // End-of-day log: 12 cooked, 9 sold at ₱75 (after the price fix) leaves 3 portions, about ₱225.
  await owner.getByLabel("Adobo cooked").fill("12");
  await owner.getByLabel("Adobo sold").fill("9");
  await owner.getByRole("button", { name: "Save today" }).click();
  await expect(owner.getByTestId("natira-summary")).toContainText("3 left over, about ₱225");

  // Bukas now suggests 9 (the average sold) for Adobo.
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 9");

  // Palengke: 9 servings of Adobo need 1.4 kg chicken; the list shows a range and the placeholder notice.
  await expect(owner.getByText("Chicken · 1.4 kg")).toBeVisible();
  await expect(owner.getByTestId("palengke-total")).toContainText("likely total");
  await expect(owner.getByRole("note")).toContainText("placeholder estimate");

  // Bagyo mode trims tomorrow's plan to 60% (9 becomes 5); turning it off restores it.
  await owner.getByRole("button", { name: "Bagyo mode" }).click();
  await expect(owner.getByTestId("fund-card")).toContainText("Simulasyon");
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 5");
  await owner.getByRole("button", { name: "Turn off Bagyo" }).click();
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 9");

  // Alok: Adobo is already Paborito from setup (so it shows on the board); the owner posts a one-plate deal.
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

  // Naubos and Sale: the owner marks Adobo gone and discounts it; the board shows both.
  await owner.getByRole("button", { name: "Naubos", exact: true }).click();
  await owner.getByRole("button", { name: "Sale", exact: true }).click();
  await owner.getByLabel("Sale price today (₱)").fill("50");
  await owner.getByRole("button", { name: "Start" }).click();
  await expect(owner.getByRole("button", { name: /Sale ₱50/ })).toBeVisible();
  const board = await (await browser.newContext({ baseURL })).newPage();
  await board.goto("/ulam");
  await expect(board.getByText("Naubos")).toBeVisible();
  await board.close();

  // Ulat: the owner reports the last hour; the rating goes under review, then the reviewer rejects the report.
  await owner.getByLabel("What looked wrong?").fill("Looks odd");
  await owner.getByRole("button", { name: "Send report" }).click();
  await expect(owner.getByText("2 ratings are under review").first()).toBeVisible();

  // The sign-in link may land on another host than baseURL; keep the session's origin.
  await owner.goto(new URL("/review", owner.url()).href);
  await expect(owner.getByTestId("review-row")).toContainText("Adobo");
  await owner.getByRole("button", { name: "Reject" }).click();
  await expect(owner.getByTestId("review-empty")).toBeVisible();

  // A second stall can be added and the owner can switch back.
  await owner.goto(new URL("/o", owner.url()).href);
  await owner.getByRole("button", { name: "Another stall" }).click();
  await owner.getByLabel("Stall name").fill("Pangalawang Tindahan");
  await owner.getByLabel("Area or school nearby").fill("UST");
  await owner.getByRole("button", { name: "Next" }).click();
  await owner.getByRole("button", { name: "Laktaw" }).click();
  await expect(owner.getByRole("button", { name: "Pangalawang Tindahan" })).toHaveAttribute("aria-pressed", "true");
  await owner.getByRole("button", { name: "Karinderya ni Rosa" }).click();
  await expect(owner.getByText("Adobo", { exact: true }).first()).toBeVisible();

  // Signing out ends the session on this device.
  await owner.goto(new URL("/o", owner.url()).href);
  await owner.getByRole("button", { name: "Sign out" }).click();
  await expect(owner.getByRole("button", { name: "Send link" })).toBeVisible();
  await owner.goto(new URL("/o", owner.url()).href);
  await expect(owner).toHaveURL(/\/$/);

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
