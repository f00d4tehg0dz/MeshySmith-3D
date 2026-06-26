import { expect, test } from "@playwright/test";

test.describe("Favicon and logo wiring", () => {
  test("HTML head links the icon and apple-icon", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Next.js App Router auto-emits icon links from app/icon.png + app/apple-icon.png.
    const iconHrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]'));
      return links.map((l) => ({ rel: l.getAttribute("rel"), href: l.getAttribute("href") }));
    });
    expect(iconHrefs.length).toBeGreaterThanOrEqual(1);
    // At least one link points at a Next-generated icon route (/icon... or /apple-icon...).
    expect(iconHrefs.some((l) => /\/icon\b|\/apple-icon\b|\/favicon\b/.test(l.href ?? ""))).toBe(true);
  });

  test("favicon.ico is served from the dev server", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/icon|image/i);
    const body = await response.body();
    // ICO files start with bytes 00 00 01 00 (reserved + type=icon).
    expect(body[0]).toBe(0);
    expect(body[1]).toBe(0);
    expect(body[2]).toBe(1);
    expect(body[3]).toBe(0);
  });

  test("icon.png served from the convention path", async ({ request }) => {
    const response = await request.get("/icon.png");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/png/i);
    const body = await response.body();
    // PNG magic: 89 50 4E 47
    expect(body[0]).toBe(0x89);
    expect(body[1]).toBe(0x50);
    expect(body[2]).toBe(0x4e);
    expect(body[3]).toBe(0x47);
  });

  test("dashboard logo loads from the public assets folder", async ({ page, request }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const brandLogo = page.locator("[data-brand-logo]");
    if (await brandLogo.count()) {
      const src = await brandLogo.getAttribute("src");
      expect(src).toBeTruthy();
      const r = await request.get(src!);
      expect(r.status()).toBe(200);
      expect(r.headers()["content-type"] ?? "").toMatch(/png|image/i);
    }
  });

  test("page title is MeshySmith", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/MeshySmith/);
  });
});
