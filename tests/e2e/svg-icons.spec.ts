import { expect, test } from "@playwright/test";

test.describe("Shape icons are SVGs and theme-coloured", () => {
  test("each shape menu icon resolves to an SVG file", async ({ page, request }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("meshysmith.tourDismissed", "true");
    });
    await page.goto("/app?editor=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });

    await page.getByRole("button", { name: /add shape/i }).click();
    await expect(page.locator("[data-shape-palette]")).toBeVisible();

    // Every shape-menu-icon span exposes its mask-image URL via inline style.
    const iconUrls = await page.locator(".shape-menu-icon").evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).style.maskImage || (el as HTMLElement).style.webkitMaskImage),
    );
    expect(iconUrls.length).toBe(16);
    for (const url of iconUrls) {
      // Strip the url(" ... ") wrapper.
      const match = url.match(/url\(["']?(.+?)["']?\)/);
      expect(match).not.toBeNull();
      const href = match![1];
      expect(href).toMatch(/\.svg$/);
      const response = await request.get(href);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"] ?? "").toMatch(/svg/);
      // SVG body must start with the <svg root tag or an XML declaration.
      const body = await response.text();
      expect(body.trimStart().startsWith("<")).toBe(true);
      expect(body.includes("<svg")).toBe(true);
    }
  });

  test("dark theme keeps icons visible (background color is set from theme variable)", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("meshysmith.tourDismissed", "true");
      window.localStorage.setItem("meshysmith.theme", "dark");
    });
    await page.goto("/app?editor=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
    await page.getByRole("button", { name: /add shape/i }).click();
    const colors = await page.locator(".shape-menu-icon").evaluateAll((els) =>
      els.map((el) => getComputedStyle(el as HTMLElement).backgroundColor),
    );
    expect(colors.length).toBeGreaterThan(0);
    for (const color of colors) {
      // Not the transparent default — it must have been set by the theme variable.
      expect(color).not.toBe("rgba(0, 0, 0, 0)");
      expect(color).not.toBe("transparent");
    }
    await page.screenshot({ path: "test-results/svg-icons-dark.png", clip: { x: 0, y: 0, width: 480, height: 720 } });
  });

  test("light theme icon snapshot", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("meshysmith.tourDismissed", "true");
      window.localStorage.setItem("meshysmith.theme", "light");
    });
    await page.goto("/app?editor=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: "test-results/svg-icons-light.png", clip: { x: 0, y: 0, width: 480, height: 720 } });
  });
});
