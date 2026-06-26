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

test.describe("Rebrand + features visual proof", () => {
  test("page title says MeshySmith", async ({ page }) => {
    await openEditor(page);
    await expect(page).toHaveTitle(/MeshySmith/);
  });

  test("editor shows new shape palette", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await expect(page.locator(".shape-menu-dropdown")).toBeVisible();
    await page.screenshot({ path: "test-results/rebrand-shape-menu.png", clip: { x: 0, y: 0, width: 720, height: 720 } });
  });

  test("gear shape renders", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.locator(".shape-menu-item", { hasText: "Gear" }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: "test-results/rebrand-gear.png" });
  });

  test("box with fillet renders", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.locator(".shape-menu-item", { hasText: /^Box$/ }).click();
    await page.waitForTimeout(500);
    // Drag the Fillet slider to ~6.
    const filletRow = page.locator(".shape-property", { hasText: "Fillet" });
    if (await filletRow.count()) {
      const slider = filletRow.locator('input[type="range"]');
      if (await slider.count()) {
        await slider.first().evaluate((el: HTMLInputElement) => {
          el.value = "6";
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
        await page.waitForTimeout(400);
      }
    }
    await page.screenshot({ path: "test-results/rebrand-box-fillet.png" });
  });

  test("box with chamfer renders", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.locator(".shape-menu-item", { hasText: /^Box$/ }).click();
    await page.waitForTimeout(500);
    const chamferRow = page.locator(".shape-property", { hasText: "Chamfer" });
    if (await chamferRow.count()) {
      const slider = chamferRow.locator('input[type="range"]');
      if (await slider.count()) {
        await slider.first().evaluate((el: HTMLInputElement) => {
          el.value = "6";
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
        await page.waitForTimeout(400);
      }
    }
    await page.screenshot({ path: "test-results/rebrand-box-chamfer.png" });
  });
});
