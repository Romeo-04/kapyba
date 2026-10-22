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
  const rawLink = readFileSync(MAIL_FILE, "utf8").trim().split("\n").pop()!;
  const parsed = new URL(rawLink);
  if (baseURL) parsed.port = new URL(baseURL).port;
  await owner.goto(parsed.href);
  await expect(owner.getByRole("heading", { name: "Simula" })).toBeVisible();

  // Step 1 — Simula: stall name, address input, and multi-select landmark chip.
  await owner.getByLabel("Stall name").fill("Karinderya ni Rosa");
  await owner.getByLabel("Area or school nearby").fill("1245 P. Noval St.");
  await owner.getByRole("button", { name: "UST", exact: true }).click();
  await expect(owner.getByRole("button", { name: "UST", exact: true })).toHaveAttribute("aria-pressed", "true");
  await owner.getByRole("button", { name: "Next" }).click();

  // Step 2 — Ulam: keep Adobo selected, deselect the other 5 defaults.
  await expect(owner.getByRole("heading", { name: "Ulam" })).toBeVisible();
  for (const dish of ["Sinigang", "Tinola", "Galunggong", "Monggo", "Menudo"]) {
    await owner.getByRole("button", { name: dish, exact: true }).click();
  }
  await owner.getByRole("button", { name: "Next" }).click();

  // Step 3 — Presyo: verify mid-way refresh resumes on Step 3 without losing state.
  await expect(owner.getByRole("heading", { name: "Presyo" })).toBeVisible();
  await owner.reload();
  await expect(owner.getByRole("heading", { name: "Presyo" })).toBeVisible();
  await expect(owner.getByLabel("Adobo price", { exact: true })).toHaveValue("70");
  await owner.getByRole("button", { name: "Next" }).click();

  // Step 4 — Karaniwan: usual daily servings.
  await expect(owner.getByRole("heading", { name: "Karaniwan" })).toBeVisible();
  await owner.getByRole("button", { name: "Next" }).click();

  // Step 5 — Paborito: signature dish picks (leave unpicked here; toggled on Ngayon for Alok test).
  await expect(owner.getByRole("heading", { name: "Paborito" })).toBeVisible();
  await owner.getByRole("button", { name: "Next" }).click();

  // Step 6 — QR: scannable QR displayed, then Finish lands on Ngayon.
  await expect(owner.getByRole("heading", { name: "QR" })).toBeVisible();
  await expect(owner.getByAltText("Stall QR code")).toBeVisible();
  await owner.getByRole("button", { name: "Finish" }).click();

  await expect(owner.getByRole("heading", { name: "Ngayon" })).toBeVisible();
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
  await owner.getByRole("button", { name: "Natira", exact: true }).click();
  await owner.getByLabel("Adobo cooked").fill("12");
  await owner.getByLabel("Adobo sold").fill("9");
  await owner.getByRole("button", { name: "Save today" }).click();
  await expect(owner.getByTestId("natira-summary")).toContainText("3 left over, about ₱210");

  // Bukas now suggests 9 (the average sold) for Adobo.
  await owner.getByRole("button", { name: "Bukas", exact: true }).click();
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 9");

  // Palengke: 9 servings of Adobo need 1.4 kg chicken; the list shows a range and the placeholder notice.
  await owner.getByRole("button", { name: "Listahan sa Palengke" }).click();
  await expect(owner.getByText("Chicken · 1.4 kg")).toBeVisible();
  await expect(owner.getByTestId("palengke-total")).toContainText("likely total");
  await expect(owner.getByRole("note")).toContainText("placeholder estimate");
  await owner.getByRole("button", { name: "Bumalik" }).click();

  // Bagyo mode trims tomorrow's plan to 60% (9 becomes 5); turning it off restores it.
  await owner.getByRole("button", { name: "Bagyo mode" }).click();
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 5");
  await owner.getByRole("button", { name: "Turn off Bagyo" }).click();
  await expect(owner.getByTestId("bukas-row").filter({ hasText: "Adobo" })).toContainText("12 → 9");

  // Alok: the owner picks Adobo as Paborito (so it shows on the board) and posts a one-plate deal.
  await owner.getByRole("button", { name: "Ngayon", exact: true }).click();
  await owner.getByRole("button", { name: "Paborito" }).click();
  await owner.getByRole("button", { name: "Alok deals" }).click();
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

  // Ulat: the owner reports the last hour; the rating goes under review, then the reviewer rejects the report.
  await owner.getByRole("button", { name: "Isara" }).click();
  await owner.getByRole("button", { name: "Ulam: Adobo" }).click();
  await owner.getByRole("button", { name: /Ulat/ }).click();
  await owner.getByLabel("What looked wrong?").fill("Looks odd");
  await owner.getByRole("button", { name: "Send report" }).click();
  await expect(owner.getByText("1 under review").first()).toBeVisible();

  // The sign-in link may land on another host than baseURL; keep the session's origin.
  await owner.goto(new URL("/review", owner.url()).href);
  await expect(owner.getByTestId("review-row")).toContainText("Adobo");
  await owner.getByRole("button", { name: "Reject" }).click();
  await expect(owner.getByTestId("review-empty")).toBeVisible();

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
