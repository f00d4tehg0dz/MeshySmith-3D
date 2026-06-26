import { expect, test } from "@playwright/test";

test.describe("Logo visual proof", () => {
  test("dashboard with new MeshySmith logo", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("meshysmith.tourDismissed", "true");
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "test-results/logo-dashboard.png", clip: { x: 0, y: 0, width: 460, height: 90 } });
  });

  test("favicon binary snapshot", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    expect(response.status()).toBe(200);
    const buf = await response.body();
    // The ICO header carries the number of images and their sizes; print so the proof line is visible in test logs.
    const count = buf.readUInt16LE(4);
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
