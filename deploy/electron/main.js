const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const staticRoot = path.join(__dirname, "..", "..", "apps", "web", "out");
// The desktop app skips the marketing landing and boots straight into the editor.
// If the /app subroute isn't present (older export), fall back to /index.html.
const appIndex = path.join(staticRoot, "app", "index.html");
const rootIndex = path.join(staticRoot, "index.html");
const indexPath = fs.existsSync(appIndex) ? appIndex : rootIndex;

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

  if (!fs.existsSync(indexPath)) {
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(missingBuildHtml(indexPath)),
    );
  } else {
    win.loadFile(indexPath);
  }

  win.webContents.once("did-finish-load", () => {
    if (process.env.MESHYSMITH_ELECTRON_SMOKE === "1") {
      setTimeout(() => app.quit(), 250);
    }
  });
  win.webContents.on("render-process-gone", (_event, details) => {
    if (details.reason !== "clean-exit") {
      console.error("[meshysmith] renderer gone:", details);
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
    if (target.protocol !== "file:") {
      event.preventDefault();
      if (target.protocol === "http:" || target.protocol === "https:") {
        shell.openExternal(url);
      }
    }
  });
}

function resolveIcon() {
  // On Windows the .ico format gives the crispest title-bar / taskbar rendering.
  // On macOS the BrowserWindow icon is ignored (the .icns inside the app bundle is what shows).
  // On Linux PNG is fine. We probe in order and use whatever exists.
  const candidates = process.platform === "win32"
    ? [
        path.join(__dirname, "icon.ico"),
        path.join(__dirname, "icon.png"),
      ]
    : [
        path.join(__dirname, "icon.png"),
      ];
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

// Group taskbar windows under "MeshySmith" instead of the generic "Electron" entry.
// Must run before whenReady on Windows; harmless on macOS/Linux.
if (process.platform === "win32") {
  app.setAppUserModelId("dev.f00d4tehg0dz.meshysmith");
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
