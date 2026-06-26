import { expect, test } from "@playwright/test";

async function openEditor(page: import("@playwright/test").Page, { dismissTour = true } = {}) {
  if (dismissTour) {
    await page.addInitScript(() => {
      window.localStorage.setItem("meshysmith.tourDismissed", "true");
    });
  }
  await page.goto("/?editor=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
  await expect(page.locator(".three-workplane-host canvas")).toBeVisible();
  await page.waitForTimeout(300);
}

async function addShape(page: import("@playwright/test").Page, name: string | RegExp) {
  await page.getByRole("button", { name: /add shape/i }).click();
  await page.locator(".shape-menu-item", { hasText: name }).first().click();
  await page.waitForTimeout(150);
}

test.describe("Tinkercad-style interactions", () => {
  test("ViewCube drag rotates the camera (transform changes during drag)", async ({ page }) => {
    await openEditor(page);
    const cube = page.locator(".view-cube-inner");
    const initial = await cube.evaluate((el) => (el as HTMLElement).style.transform);
    const handle = page.locator("[data-view-cube]");
    const box = await handle.boundingBox();
    if (!box) throw new Error("ViewCube box missing");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Drag far enough to count as a drag (suppression threshold is 4px).
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const after = await cube.evaluate((el) => (el as HTMLElement).style.transform);
    expect(after).not.toBe(initial);
  });

  test("Perspective / Orthographic toggle button is present and flips data-camera-mode", async ({ page }) => {
    await openEditor(page);
    const toggle = page.locator("[data-camera-mode]");
    await expect(toggle).toBeVisible();
    const before = await toggle.getAttribute("data-camera-mode");
    expect(before).toBe("perspective");
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-camera-mode", "orthographic");
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-camera-mode", "perspective");
  });

  test("Right-click on outliner row opens context menu with Duplicate / Hide / Delete", async ({ page }) => {
    await openEditor(page);
    await addShape(page, /^Box$/);
    const row = page.locator("[data-outliner-row]").first();
    await row.click({ button: "right" });
    const menu = page.locator("[data-context-menu]");
    await expect(menu).toBeVisible();
    await expect(menu.locator('[data-context-action="duplicate"]')).toBeVisible();
    await expect(menu.locator('[data-context-action="toggle-hidden"]')).toBeVisible();
    await expect(menu.locator('[data-context-action="delete"]')).toBeVisible();
    // Duplicate via the menu adds a second row.
    await menu.locator('[data-context-action="duplicate"]').click();
    await expect(page.locator("[data-outliner-count]")).toHaveText("2");
  });

  test("Onboarding tour shows on first run and is dismissable", async ({ page }) => {
    await openEditor(page, { dismissTour: false });
    await expect(page.locator("[data-onboarding-tour]")).toBeVisible({ timeout: 5_000 });
    const tooltip = page.locator("[data-onboarding-tooltip]");
    await expect(tooltip).toBeVisible();
    // Click Next twice, then Skip — both should advance / dismiss.
    await page.locator("[data-onboarding-next]").click();
    await page.locator("[data-onboarding-next]").click();
    await page.locator(".onboarding-skip").first().click();
    await expect(page.locator("[data-onboarding-tour]")).toBeHidden();
    // Storage flag is now set.
    const dismissed = await page.evaluate(() => window.localStorage.getItem("meshysmith.tourDismissed"));
    expect(dismissed).toBe("true");
  });

  test("Tips panel exposes a Replay tour button", async ({ page }) => {
    await openEditor(page);
    // Tips opens via the Visibility-options tool button; that button is only enabled with a selection.
    await addShape(page, /^Box$/);
    // Trigger the Tips panel by clicking the Visibility-options button (it's the only one whose label is "Visibility options").
    await page.getByRole("button", { name: /visibility options/i }).click();
    await expect(page.locator(".top-action-panel")).toBeVisible();
    await expect(page.locator("[data-replay-tour]")).toBeVisible();
  });
});
