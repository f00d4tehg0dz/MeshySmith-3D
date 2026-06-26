import { expect, test } from "@playwright/test";

test("shape palette tabs all visible (no horizontal clipping)", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("meshysmith.tourDismissed", "true");
  });
  await page.goto("/?editor=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
  await page.getByRole("button", { name: /add shape/i }).click();
  await expect(page.locator("[data-shape-palette]")).toBeVisible();

  // Every category tab + ALL must be rendered AND inside the palette horizontally.
  const palette = page.locator("[data-shape-palette]");
  const paletteBox = await palette.boundingBox();
  if (!paletteBox) throw new Error("palette bounding box missing");

  for (const cat of ["all", "basic", "curved", "polyhedra", "mechanical", "type"]) {
    const tab = page.locator(`[data-shape-category="${cat}"]`);
    await expect(tab).toBeVisible();
    const box = await tab.boundingBox();
    if (!box) throw new Error(`tab ${cat} not laid out`);
    // The tab's right edge must be within the palette's right edge.
    expect(box.x + box.width).toBeLessThanOrEqual(paletteBox.x + paletteBox.width + 1);
  }

  await page.screenshot({ path: "test-results/dropdown-fixed.png", clip: { x: 0, y: 0, width: 480, height: 360 } });
});
