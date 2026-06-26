import { expect, test } from "@playwright/test";

test.describe("Landing page SEO / AEO / GEO surface", () => {
  test("loads at /, returns 200, has one h1 and a Skip to main content link", async ({ page, request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/html/);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const h1s = await page.locator("h1").count();
    expect(h1s).toBe(1);
    // Skip link uses sr-only-style classes; assert by href rather than a CSS-class hook.
    await expect(page.locator('a[href="#main-content"]').first()).toHaveAttribute("href", "#main-content");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("metadata: title, description, canonical, OG, Twitter, robots", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/MeshySmith/);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(80);
    expect(desc!.length).toBeLessThan(320);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute("content");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const ogType = await page.locator('meta[property="og:type"]').getAttribute("content");
    expect(ogTitle).toMatch(/MeshySmith/);
    expect(ogDesc).toBeTruthy();
    expect(ogImage).toMatch(/og-image/);
    expect(ogType).toBe("website");

    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(twitterCard).toBe("summary_large_image");

    // Default robots meta should NOT prevent indexing.
    const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
    if (robots !== null) {
      expect(robots).not.toContain("noindex");
    }
  });

  test("structured data: SoftwareApplication, Organization, BreadcrumbList (no FAQPage)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const ldBlocks = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    expect(ldBlocks.length).toBeGreaterThanOrEqual(3);

    const parsed = ldBlocks.map((text) => JSON.parse(text));
    const types = parsed.map((entry) => entry["@type"]);
    expect(types).toEqual(expect.arrayContaining(["SoftwareApplication", "Organization", "BreadcrumbList"]));
    // FAQ section removed; FAQPage JSON-LD should be gone too (visible content must match structured data).
    expect(types).not.toContain("FAQPage");

    const software = parsed.find((p) => p["@type"] === "SoftwareApplication");
    expect(software.name).toBe("MeshySmith");
    expect(software.applicationCategory).toBe("DesignApplication");
    expect(software.offers?.price).toBe("0");
    expect(Array.isArray(software.featureList)).toBe(true);
    expect(software.featureList.length).toBeGreaterThanOrEqual(6);
  });

  test("primary CTAs link to /app", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heroCta = page.getByRole("link", { name: /open the web editor/i }).first();
    await expect(heroCta).toHaveAttribute("href", "/app");
    const navCta = page.getByRole("link", { name: /^open the editor$/i }).first();
    await expect(navCta).toHaveAttribute("href", "/app");
  });

  test("page is scrollable (body does not lock overflow on the marketing page)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    expect(scrollHeight).toBeGreaterThan(viewportHeight);

    // Scrolling actually moves the page.
    await page.evaluate(() => window.scrollTo(0, 1200));
    const scrolled = await page.evaluate(() => window.scrollY);
    expect(scrolled).toBeGreaterThan(800);
  });

  test("Use Cases section renders the three audience cards (makers, classrooms, fab labs)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const useCases = page.locator("section#use-cases");
    await expect(useCases).toBeAttached();
    // Page is now scrollable; use a page-level scroll-to-anchor.
    await page.evaluate(() => document.querySelector("#use-cases")?.scrollIntoView({ block: "center" }));
    await expect(useCases.getByRole("heading", { name: /makers and hobbyists/i })).toBeVisible();
    await expect(useCases.getByRole("heading", { name: /^classrooms$/i })).toBeVisible();
    await expect(useCases.getByRole("heading", { name: /^fab labs$/i })).toBeVisible();
  });

  test("Pricing section shows the single free tier card", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const pricing = page.locator("#pricing");
    await expect(pricing.getByRole("heading", { name: /free, forever/i })).toBeVisible();
    await expect(pricing.getByText("$0")).toBeVisible();
    await expect(pricing.getByText(/AGPL-3\.0/).first()).toBeVisible();
  });

  test("robots.txt is served and allows /, lists sitemap, opts AI crawlers in", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toMatch(/User-Agent:\s*\*/i);
    expect(body).toMatch(/Sitemap:\s*\S+/i);
    expect(body).toMatch(/GPTBot/);
    expect(body).toMatch(/PerplexityBot/);
    expect(body).toMatch(/Google-Extended/);
  });

  test("sitemap.xml is served as XML and lists at least / and /app", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/xml/);
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>/);
    expect(body).toMatch(/<loc>https?:\/\/[^<]+\/app<\/loc>/);
  });

  test("manifest.webmanifest is served and points start_url at /app", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toMatch(/MeshySmith/);
    expect(body.short_name).toBe("MeshySmith");
    expect(body.start_url).toBe("/app");
    expect(Array.isArray(body.icons)).toBe(true);
  });

  test("OG image is served as image/* with a non-trivial body", async ({ request }) => {
    const response = await request.get("/og-image.svg");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/svg|image/);
    const body = await response.text();
    expect(body.length).toBeGreaterThan(800);
    expect(body).toContain("MeshySmith");
  });

  test("landing visual snapshot", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({ path: "test-results/landing-hero.png", clip: { x: 0, y: 0, width: 1280, height: 720 } });
  });
});

test.describe("Editor still loads at /app", () => {
  test("/app?editor=1 boots the workplane", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("meshysmith.tourDismissed", "true");
    });
    await page.goto("/app?editor=1", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
    await expect(page.locator(".three-workplane-host canvas")).toBeVisible();
  });
});
