import { expect, test } from "@playwright/test";

async function openEditor(page: import("@playwright/test").Page, { dismissTour = true } = {}) {
  if (dismissTour) {
    await page.addInitScript(() => {
      window.localStorage.setItem("meshysmith.tourDismissed", "true");
    });
  }
  await page.goto("/app?editor=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
  await expect(page.locator(".three-workplane-host canvas")).toBeVisible();
  await page.waitForTimeout(400);
}

async function addShape(page: import("@playwright/test").Page, name: string | RegExp) {
  await page.getByRole("button", { name: /add shape/i }).click();
  await page.locator(".shape-menu-item", { hasText: name }).first().click();
  await page.waitForTimeout(150);
}

test.describe("Interactions visual proof", () => {
  test("onboarding tour step", async ({ page }) => {
    await openEditor(page, { dismissTour: false });
    await expect(page.locator("[data-onboarding-tour]")).toBeVisible();
    // Advance to step 3 (outliner) so the spotlight is on a visible element.
    await page.locator("[data-onboarding-next]").click();
    await page.locator("[data-onboarding-next]").click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: "test-results/interactions-onboarding.png" });
  });

  test("context menu on outliner row", async ({ page }) => {
    await openEditor(page);
    await addShape(page, /^Box$/);
    await addShape(page, /^Cylinder$/);
    await page.locator("[data-outliner-row]").first().click({ button: "right" });
    await expect(page.locator("[data-context-menu]")).toBeVisible();
    await page.screenshot({ path: "test-results/interactions-context-menu.png" });
  });

  test("orthographic mode", async ({ page }) => {
    await openEditor(page);
    await addShape(page, /^Box$/);
    await addShape(page, /^Cylinder$/);
    await addShape(page, /^Sphere$/);
    await page.locator("[data-camera-mode]").click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: "test-results/interactions-ortho.png" });
  });
});
