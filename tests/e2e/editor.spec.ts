import { expect, test } from "@playwright/test";

async function openEditor(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("meshysmith.tourDismissed", "true");
  });
  // page.tsx auto-opens the editor when the URL has ?editor=1, bypassing the dashboard.
  await page.goto("/?editor=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".workplane-stage")).toBeVisible({ timeout: 90_000 });
  await expect(page.locator(".three-workplane-host canvas")).toBeVisible({ timeout: 30_000 });
  // Give the ViewCube one paint to mount.
  await page.waitForTimeout(150);
}

test.describe("MeshySmith editor", () => {
  test("loads the workplane viewport", async ({ page }) => {
    await openEditor(page);
    await expect(page.locator(".three-workplane-host canvas")).toBeVisible();
    await expect(page.locator(".view-cube")).toBeVisible();
  });

  test("ViewCube faces are clickable and move the camera", async ({ page }) => {
    await openEditor(page);

    const cube = page.locator(".view-cube-inner");
    await expect(cube).toBeVisible();

    // Read the initial transform; clicking a face must change it.
    const initialTransform = await cube.evaluate((el) => (el as HTMLElement).style.transform);

    const topFace = page.locator('[data-cube-zone="top"]');
    await expect(topFace).toBeVisible();
    await topFace.click({ force: true });

    // The fly animation runs ~400ms. Poll until the transform changes.
    await expect.poll(async () =>
      cube.evaluate((el) => (el as HTMLElement).style.transform)
    ).not.toBe(initialTransform);
  });

  test("ViewCube edge zones are clickable", async ({ page }) => {
    await openEditor(page);
    const cube = page.locator(".view-cube-inner");
    const before = await cube.evaluate((el) => (el as HTMLElement).style.transform);
    await page.locator('[data-cube-zone="top-front"]').click({ force: true });
    await expect.poll(async () =>
      cube.evaluate((el) => (el as HTMLElement).style.transform)
    ).not.toBe(before);
  });

  test("ViewCube corner zones are clickable", async ({ page }) => {
    await openEditor(page);
    const cube = page.locator(".view-cube-inner");
    const before = await cube.evaluate((el) => (el as HTMLElement).style.transform);
    await page.locator('[data-cube-zone="tfr"]').click({ force: true });
    await expect.poll(async () =>
      cube.evaluate((el) => (el as HTMLElement).style.transform)
    ).not.toBe(before);
  });

  test("Home and Fit buttons exist and are clickable", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /home view/i }).click();
    await page.getByRole("button", { name: /fit to view/i }).click();
    await page.getByRole("button", { name: /^zoom in$/i }).click();
    await page.getByRole("button", { name: /^zoom out$/i }).click();
  });

  test("Theme toggle cycles light -> dark -> system", async ({ page }) => {
    await openEditor(page);
    const toggle = page.locator("[data-theme-toggle]");
    await expect(toggle).toBeVisible();

    // Force a known starting state.
    await page.evaluate(() => localStorage.setItem("meshysmith.theme", "light"));
    await page.reload();
    await openEditor(page);

    const getTheme = () => page.evaluate(() => document.documentElement.dataset.theme);
    expect(await getTheme()).toBe("light");

    await page.locator("[data-theme-toggle]").click();
    expect(await getTheme()).toBe("dark");

    await page.locator("[data-theme-toggle]").click();
    // "system" resolves to whatever the OS reports; just assert the attribute exists and is light or dark.
    const resolved = await getTheme();
    expect(["light", "dark"]).toContain(resolved);

    // Verify the theme actually flowed to the 3D scene clear color: read --scene-clear.
    const sceneClear = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--scene-clear").trim()
    );
    expect(sceneClear.length).toBeGreaterThan(0);
  });

  test("Toolbar shape menu opens and lists shapes including new primitives", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await expect(page.locator(".shape-menu-dropdown")).toBeVisible();
    const shapeButtons = page.locator(".shape-menu-item");
    // Originals (11) + new (capsule, octahedron, dodecahedron, torus knot, gear) = 16
    expect(await shapeButtons.count()).toBe(16);
    for (const name of ["Capsule", "Octahedron", "Dodecahedron", "Torus Knot", "Gear"]) {
      await expect(page.locator(".shape-menu-item", { hasText: name })).toBeVisible();
    }
  });

  test("Adding a Gear shape inserts it into the scene", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.locator(".shape-menu-item", { hasText: "Gear" }).click();
    // The shape inspector should appear after the new shape is selected.
    await expect(page.locator(".shape-inspector")).toBeVisible({ timeout: 10_000 });
    // The inspector should expose gear-specific controls.
    await expect(page.getByText("Teeth", { exact: true })).toBeVisible();
    await expect(page.getByText("Tooth depth", { exact: true })).toBeVisible();
  });

  test("Box inspector exposes Fillet and Chamfer controls", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.locator(".shape-menu-item", { hasText: /^Box$/ }).click();
    await expect(page.locator(".shape-inspector")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Fillet", { exact: true })).toBeVisible();
    await expect(page.getByText("Chamfer", { exact: true })).toBeVisible();
  });

  test("Shape palette has category tabs + search filter", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /add shape/i }).click();
    await expect(page.locator("[data-shape-palette]")).toBeVisible();
    await expect(page.locator('[data-shape-category="all"]')).toBeVisible();
    for (const cat of ["basic", "curved", "polyhedra", "mechanical", "type"]) {
      await expect(page.locator(`[data-shape-category="${cat}"]`)).toBeVisible();
    }
    // All tab shows 16 shapes; Mechanical only Torus Knot + Gear.
    await page.locator('[data-shape-category="all"]').click();
    await expect(page.locator(".shape-menu-item")).toHaveCount(16);
    await page.locator('[data-shape-category="mechanical"]').click();
    await expect(page.locator(".shape-menu-item")).toHaveCount(2);
    await expect(page.locator(".shape-menu-item", { hasText: "Gear" })).toBeVisible();
    // Search narrows results across categories.
    await page.locator('[data-shape-category="all"]').click();
    await page.locator("[data-shape-search]").fill("cube");
    // "cube" is a keyword for Box.
    await expect(page.locator(".shape-menu-item", { hasText: "Box" })).toBeVisible();
    await expect(page.locator(".shape-menu-item")).toHaveCount(1);
    await page.locator("[data-shape-search]").fill("xxxxxxx");
    await expect(page.locator("[data-shape-empty]")).toBeVisible();
  });

  test("Scene outliner shows shapes, count updates, and supports select + visibility toggle", async ({ page }) => {
    await openEditor(page);
    // Initially empty — outliner shows an empty hint and the workplane empty hint.
    await expect(page.locator("[data-scene-outliner]")).toBeVisible();
    await expect(page.locator("[data-outliner-empty]")).toBeVisible();
    await expect(page.locator("[data-empty-hint]")).toBeVisible();
    // Add a Box, then an Octahedron.
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.locator(".shape-menu-item", { hasText: /^Box$/ }).click();
    await expect(page.locator("[data-outliner-count]")).toHaveText("1");
    await expect(page.locator("[data-empty-hint]")).toBeHidden();
    await page.getByRole("button", { name: /add shape/i }).click();
    await page.locator(".shape-menu-item", { hasText: "Octahedron" }).click();
    await expect(page.locator("[data-outliner-count]")).toHaveText("2");
    // Outliner has two rows; the second-added shape is selected.
    const rows = page.locator("[data-outliner-row]");
    await expect(rows).toHaveCount(2);
    const selectedCount = await rows.evaluateAll((els) => els.filter((el) => el.getAttribute("aria-selected") === "true").length);
    expect(selectedCount).toBeGreaterThanOrEqual(1);
    // Clicking a row selects it.
    const firstRow = rows.first();
    await firstRow.locator(".scene-outliner-label").click();
    await expect(firstRow).toHaveAttribute("aria-selected", "true");
    // Eye toggle flips visibility.
    const visibilityButton = firstRow.locator(".scene-outliner-visibility");
    const labelBefore = await visibilityButton.getAttribute("aria-label");
    await visibilityButton.click();
    const labelAfter = await visibilityButton.getAttribute("aria-label");
    expect(labelAfter).not.toBe(labelBefore);
  });

  test("Output buttons (Import / Export / Settings) respond to clicks", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: /^import$/i }).click();
    await expect(page.locator(".top-action-panel")).toBeVisible();
    await page.getByRole("button", { name: /close import/i }).click();

    await page.getByRole("button", { name: /^export$/i }).click();
    await expect(page.locator(".top-action-panel")).toBeVisible();
    await page.getByRole("button", { name: /close export/i }).click();
  });
});
