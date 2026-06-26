import { expect, test } from "@playwright/test";

async function openEditor(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("meshysmith.tourDismissed", "true");
  });
  await page.goto("/app?editor=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
  await expect(page.locator(".three-workplane-host canvas")).toBeVisible();
  await page.waitForTimeout(400);
}

test.describe("Visual smoke", () => {
  test("light theme screenshot", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("meshysmith.theme", "light");
    });
    await openEditor(page);
    await page.screenshot({ path: "test-results/light-theme.png", fullPage: false });
  });

  test("dark theme screenshot", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("meshysmith.theme", "dark");
    });
    await openEditor(page);
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
    await page.screenshot({ path: "test-results/dark-theme.png", fullPage: false });
  });

  test("ViewCube has interactive zones (faces, edges, corners)", async ({ page }) => {
    await openEditor(page);
    expect(await page.locator("[data-cube-zone]").count()).toBe(6 + 12 + 8);
  });
});
