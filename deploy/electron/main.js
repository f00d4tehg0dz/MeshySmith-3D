const { app, BrowserWindow, shell, Menu, protocol } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const fsp = require("node:fs/promises");

const staticRoot = path.join(__dirname, "..", "..", "apps", "web", "out");

/**
 * Why a custom scheme:
 *
 * The static export emits absolute asset URLs like `/_next/static/chunks/foo.js`.
 * Under `file:` the browser resolves those against the filesystem root, which
 * 404s. Under a *standard* custom scheme, absolute paths resolve against the
 * URL's host, so we can map them cleanly to the export directory.
 *
 * `meshysmith://app/app/` -> `<staticRoot>/app/index.html`
 * `meshysmith://app/_next/static/chunks/foo.js` -> `<staticRoot>/_next/static/chunks/foo.js`
 * `meshysmith://app/icon.png` -> `<staticRoot>/icon.png`
 */
const SCHEME = "meshysmith";
const HOST = "app";

// Must be called *before* app is ready.
protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true,
    },
  },
]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".wasm": "application/wasm",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
};

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

async function serveFile(target) {
  const body = await fsp.readFile(target);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(target),
      "Cache-Control": "no-cache",
    },
  });
}

function registerStaticAssetHandler() {
  const verbose = process.env.MESHYSMITH_ELECTRON_SMOKE === "1"
    || process.env.MESHYSMITH_DEVTOOLS === "1";
  protocol.handle(SCHEME, async (request) => {
    let target;
    try {
      const parsed = new URL(request.url);
      // Strip the leading slash; we want relative paths under staticRoot.
      let pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
      // Strip query strings (Next emits cache-busted hrefs like icon.png?...).
      const queryIndex = pathname.indexOf("?");
      if (queryIndex >= 0) {
        pathname = pathname.slice(0, queryIndex);
      }
      // Empty path or directory-style URL -> serve index.html for that segment.
      if (pathname === "" || pathname.endsWith("/")) {
        pathname += "index.html";
      }
      target = path.join(staticRoot, pathname);
    } catch (err) {
      console.error("[meshysmith] bad URL:", request.url, err);
      return new Response("Bad request", { status: 400 });
    }

    try {
      // Direct file hit.
      if (fileExists(target)) {
        if (verbose) console.log("[meshysmith] 200", request.url, "->", target);
        return await serveFile(target);
      }

      // Directory route — Next emits /app/ -> apps/web/out/app/index.html.
      const directoryAttempt = path.join(target, "index.html");
      if (fileExists(directoryAttempt)) {
        if (verbose) console.log("[meshysmith] 200(dir)", request.url, "->", directoryAttempt);
        return await serveFile(directoryAttempt);
      }

      // Next's trailingSlash mode also writes `<route>.html` siblings; fall back.
      const htmlAttempt = target.replace(/\/?$/, ".html");
      if (fileExists(htmlAttempt)) {
        if (verbose) console.log("[meshysmith] 200(html)", request.url, "->", htmlAttempt);
        return await serveFile(htmlAttempt);
      }
    } catch (err) {
      console.error("[meshysmith] read failed", request.url, "->", target, err);
      return new Response(`Read failed: ${err.message}`, { status: 500 });
    }

    console.error("[meshysmith] 404", request.url, "->", target);
    return new Response(`Not found: ${target}`, { status: 404 });
  });
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#0b1220",
    title: "MeshySmith",
    icon: resolveIcon(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  win.removeMenu();

  // Decide which page to load. Prefer the editor entry (`/app/`) when the export
  // includes it; fall back to the landing page (`/`) for older exports.
  const appIndex = path.join(staticRoot, "app", "index.html");
  const rootIndex = path.join(staticRoot, "index.html");
  const startRoute = fs.existsSync(appIndex) ? "app/" : "";

  if (!fs.existsSync(rootIndex)) {
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(missingBuildHtml(rootIndex)),
    );
  } else {
    win.loadURL(`${SCHEME}://${HOST}/${startRoute}`);
  }

  // Optional DevTools for live debugging (set MESHYSMITH_DEVTOOLS=1).
  if (process.env.MESHYSMITH_DEVTOOLS === "1") {
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.webContents.once("did-finish-load", async () => {
    if (process.env.MESHYSMITH_ELECTRON_SMOKE === "1") {
      // Give React time to hydrate the dashboard before probing.
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        const probe = await win.webContents.executeJavaScript(
          `({
            dashboard: Boolean(document.querySelector(".dashboard-shell")),
            topbar: Boolean(document.querySelector(".dashboard-topbar")),
            title: document.title,
            href: location.href,
          })`,
        );
        console.log("[meshysmith] smoke probe:", JSON.stringify(probe));
        if (!probe.dashboard || !probe.topbar) {
          console.error("[meshysmith] dashboard not rendered — smoke failed");
          app.exit(2);
          return;
        }
      } catch (err) {
        console.error("[meshysmith] smoke probe failed:", err);
        app.exit(3);
        return;
      }
      setTimeout(() => app.quit(), 250);
    }
  });

  win.webContents.on("render-process-gone", (_event, details) => {
    if (details.reason !== "clean-exit") {
      console.error("[meshysmith] renderer gone:", details);
    }
  });

  win.webContents.on("did-fail-load", (_event, code, description, url) => {
    console.error(`[meshysmith] did-fail-load ${code} ${description} url=${url}`);
  });

  // Surface renderer console messages so issues are visible in the terminal.
  const verboseConsole = process.env.MESHYSMITH_ELECTRON_SMOKE === "1"
    || process.env.MESHYSMITH_DEVTOOLS === "1";
  win.webContents.on("console-message", (event) => {
    if (verboseConsole || event.level >= 2) {
      const stream = event.level >= 2 ? console.error : console.log;
      stream(`[renderer ${event.sourceId}:${event.lineNumber}]`, event.message);
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    const target = new URL(url);
    if (target.protocol !== `${SCHEME}:`) {
      event.preventDefault();
      if (target.protocol === "http:" || target.protocol === "https:") {
        shell.openExternal(url);
      }
    }
  });
}

function resolveIcon() {
  const candidates = process.platform === "win32"
    ? [path.join(__dirname, "icon.ico"), path.join(__dirname, "icon.png")]
    : [path.join(__dirname, "icon.png")];
  candidates.push(
    path.join(staticRoot, "assets", "meshysmith", "meshysmith-logo.png"),
    path.join(__dirname, "..", "..", "apps", "web", "public", "assets", "meshysmith", "meshysmith-logo.png"),
  );
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function missingBuildHtml(expectedPath) {
  return `<!doctype html><meta charset="utf-8"><title>MeshySmith - build missing</title>
<style>body{font-family:system-ui,sans-serif;background:#0b1220;color:#e2e8f0;padding:32px;line-height:1.5}code{background:#1e293b;padding:2px 6px;border-radius:4px}</style>
<h1>MeshySmith static build not found</h1>
<p>Expected file: <code>${expectedPath.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></p>
<p>Run <code>npm run export</code> first to generate the static export, then relaunch.</p>`;
}

if (process.platform === "win32") {
  app.setAppUserModelId("dev.f00d4tehg0dz.meshysmith");
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerStaticAssetHandler();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
