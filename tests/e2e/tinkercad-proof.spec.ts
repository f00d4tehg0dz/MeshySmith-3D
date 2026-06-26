import { expect, test } from "@playwright/test";

async function openEditor(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("meshysmith.tourDismissed", "true");
  });
  await page.goto("/app?editor=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
  await expect(page.locator(".three-workplane-host canvas")).toBeVisible();
  await page.waitForTimeout(500);
}

test.describe("Tinkercad-style UI proof", () => {
  test("empty editor + scene outliner + empty hint", async ({ page }) => {
    await openEditor(page);
    await page.screenshot({ path: "test-results/tinkercad-empty.png" });
  });

  test("shape palette with categories", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await expect(page.locator("[data-shape-palette]")).toBeVisible();
    await page.screenshot({ path: "test-results/tinkercad-palette.png", clip: { x: 0, y: 0, width: 720, height: 760 } });
  });

  test("scene with multiple shapes populates outliner", async ({ page }) => {
    await openEditor(page);
    for (const name of [/^Box$/, /^Cylinder$/, "Capsule", "Gear", "Octahedron"]) {
      await page.getByRole("button", { name: /add shape/i }).click();
      await page.locator(".shape-menu-item", { hasText: name as RegExp | string }).first().click();
      await page.waitForTimeout(150);
    }
    await page.screenshot({ path: "test-results/tinkercad-scene.png" });
  });
});
