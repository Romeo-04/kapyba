import { expect, test } from "@playwright/test";
import { readFileSync, rmSync } from "node:fs";
import { MAIL_FILE } from "../../playwright.config";

test("owner sets up a stall, a second phone rates, the owner sees it", async ({ browser, baseURL }) => {
  test.setTimeout(60_000); // the whole owner loop in one test
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
  await owner.getByRole("button", { name: "Adobo", exact: true }).click(); // Paborito
  await owner.getByRole("button", { name: "Next" }).click();
  await expect(owner.getByAltText("Stall QR code")).toBeVisible();
  await expect(owner.getByRole("button", { name: "Print" })).toBeVisible();
  await owner.getByRole("button", { name: "Tapos" }).click();
  await expect(owner.getByRole("heading", { name: "Now" })).toBeVisible();
  await expect(owner.getByTestId("waiting")).toBeVisible();
  await expect(owner.getByText("Adobo", { exact: true }).first()).toBeVisible();
  await owner.getByRole("button", { name: "Manage" }).click();
  await expect(owner.getByRole("button", { name: "Paborito" })).toHaveAttribute("aria-pressed", "true");

  // Photo is optional: the dish card shows one after the owner adds it under Manage, and the public board uses it.
  const dot = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGN4kaWDFTEMLQkAf/NfgaZ1GiMAAAAASUVORK5CYII=", "base64");
  await owner.getByLabel("Photo of Adobo").setInputFiles({ name: "adobo.png", mimeType: "image/png", buffer: dot });
  await expect(owner.locator("img.thumb")).toBeVisible();
  await expect(owner.getByRole("button", { name: "Remove photo" })).toBeVisible();

  await owner.getByRole("tab", { name: "Others" }).click();
  await expect(owner.getByAltText("Stall QR code")).toBeVisible();
  await owner.getByRole("tab", { name: "Now" }).click();

  // Fix the price (Manage is still open from above).
  await owner.getByRole("button", { name: "Edit" }).click();
  await owner.getByLabel("Price (₱)").first().fill("75");
  await owner.getByLabel("Main ingredient").selectOption("chicken");
  await owner.getByLabel("Ingredients (optional)").fill("Chicken, soy sauce, vinegar");
  await owner.getByLabel("Soy", { exact: true }).check();
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
  await buyer.getByLabel("Want to leave a comment?").fill("Ang sarap ng sabaw!");
  await buyer.getByRole("button", { name: "Send comment" }).click();
  await expect(buyer.getByText("Thanks for the comment!")).toBeVisible();

  // The owner sees what customers ticked, as bars, without opening anything private to the public.
  await owner.reload();
  // Balita: the bell shows one new rating; opening it lists the dish (never who rated) and clears the count.
  await expect(owner.getByTestId("bell-count")).toHaveText("1");
  await owner.getByRole("button", { name: /Balita/ }).click();
  await expect(owner.getByTestId("notice")).toContainText("Adobo was rated");
  await expect(owner.getByTestId("bell-count")).toHaveCount(0);
  await owner.getByRole("button", { name: "Balita" }).click(); // back to Ngayon
  await owner.getByText("Ano ang sinabi ng customers").click();
  await expect(owner.getByTestId("owner-comments")).toContainText("Ang sarap ng sabaw!"); // private to the owner
  await expect(owner.getByRole("meter", { name: "Too salty or bland" })).toBeVisible();
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
    await expect(owner.getByText("2 ratings · 2 buyers")).toBeVisible({ timeout: 5000 });
  }).toPass();
  // Reopening the page with no signal still shows the dishes from the cached copy.
  await offCtx.setOffline(true);
  await off.reload();
  await expect(off.getByRole("button", { name: /Adobo/ })).toBeVisible();
  await offCtx.setOffline(false);
  await offCtx.close();

  // End-of-day log: 12 cooked, 9 sold at ₱75 (after the price fix) leaves 3 portions, about ₱225.
  await owner.getByRole("tab", { name: "Leftovers" }).click();
  await owner.getByLabel("Adobo cooked").fill("12");
  await owner.getByLabel("Adobo sold").fill("9");
  await owner.getByRole("button", { name: "Save today" }).click();
  await expect(owner.getByTestId("natira-summary")).toContainText("3 left over, about ₱225");

  // The same log shows under the dish's Manage panel, where today's numbers can also be entered.
  await owner.getByRole("tab", { name: "Now" }).click();
  const manage = owner.getByRole("button", { name: /^(Manage|Close)$/ });
  if ((await manage.getAttribute("aria-expanded")) !== "true") await manage.click();
  await expect(owner.getByTestId("dish-natira")).toContainText("cooked 12, sold 9, 3 left (₱225)");
  await owner.getByRole("button", { name: "Close", exact: true }).click();

  // Bukas now suggests 9 (the average sold) for Adobo.
  await owner.getByRole("tab", { name: "Tomorrow" }).click();
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 9");

  // Palengke: 9 servings of Adobo need 1.4 kg chicken; the list shows a range and the placeholder notice.
  await expect(owner.getByText("1.4kg of Chicken")).toBeVisible();
  await expect(owner.getByTestId("palengke-total")).toContainText("Your estimated total is");
  await expect(owner.getByRole("note")).toContainText("placeholder estimate");

  // Bagyo mode trims tomorrow's plan to 60% (9 becomes 5); turning it off restores it.
  await owner.getByRole("button", { name: "Bagyo mode" }).click();
  await expect(owner.getByTestId("fund-card")).toContainText("Simulasyon");
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 5");
  await owner.getByRole("button", { name: "Turn off Bagyo" }).click();
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 9");

  // Alok: Adobo is already Paborito from setup (so it shows on the board); the owner posts a one-plate deal.
  await owner.getByRole("tab", { name: "Others" }).click();
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

  // The status survives a refresh, the card carries the main ingredient and allergen tags, and a tap opens the dish card.
  await guest.reload();
  const card = guest.getByTestId("board-card").first();
  await expect(card).toContainText("Reserved");
  await expect(card).toContainText("Chicken");
  await expect(card.getByTestId("allergens")).toContainText("Soy");
  await guest.getByLabel("Main ingredient").selectOption("chicken");
  await guest.getByRole("button", { name: /Adobo/ }).click();
  const sheet = guest.getByRole("dialog", { name: "Adobo" });
  await expect(sheet.getByText("vinegar")).toBeVisible();
  await expect(sheet.getByText("Soy", { exact: true })).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Adobo" })).toBeVisible();
  await guest.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(guest.getByText("Alok", { exact: false })).toHaveCount(0);
  await guestCtx.close();

  // Naubos and Sale: the owner marks Adobo gone and discounts it; the board shows both.
  await owner.getByRole("tab", { name: "Now" }).click();
  await owner.getByRole("button", { name: "Manage" }).click();
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
  await owner.getByRole("tab", { name: "Others" }).click();
  await owner.getByText("Report odd ratings").click();
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
  await owner.getByRole("tab", { name: "Others" }).click();
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

test("two devices that sign in with different emails get separate accounts", async ({ browser, baseURL }) => {
  rmSync(MAIL_FILE, { force: true });
  const signIn = async (email: string) => {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByLabel("Owner sign-in").fill(email);
    await page.getByRole("button", { name: "Send link" }).click();
    await expect(page.getByText("Check your email")).toBeVisible();
    await page.goto(readFileSync(MAIL_FILE, "utf8").trim().split("\n").pop()!);
    await expect(page.getByRole("heading", { name: "Simula" })).toBeVisible();
    return { ctx, page };
  };
  const a = await signIn("ana@example.com");
  await a.page.getByLabel("Stall name").fill("Tindahan ni Ana");
  await a.page.getByLabel("Area or school nearby").fill("UST");
  await a.page.getByRole("button", { name: "Next", exact: true }).click();
  const b = await signIn("ben@example.com");

  // Ben, on his own device, starts at Simula with no stall; Ana's stall is not his.
  const stallsOf = (p: typeof a.page) => p.evaluate(async () => (await (await fetch("/api/stalls")).json()).stalls.map((s: { name: string }) => s.name) as string[]);
  expect(await stallsOf(a.page)).toEqual(["Tindahan ni Ana"]);
  expect(await stallsOf(b.page)).toEqual([]);

  // A device that never signed in sees the sign-in form, not anyone's stall.
  const anon = await browser.newContext({ baseURL });
  const guest = await anon.newPage();
  await guest.goto("/o");
  await expect(guest.getByRole("button", { name: "Send link" })).toBeVisible();
  await anon.close();
  await a.ctx.close();
  await b.ctx.close();
});
