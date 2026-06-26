#!/usr/bin/env node
/**
 * Generate platform-specific icon files (.ico for Windows, runtime PNG for Electron)
 * from the master logo at apps/web/public/assets/meshysmith/meshysmith-logo.png.
 *
 * Run with: node scripts/generate-icons.mjs
 */
import pngToIco from "png-to-ico";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "apps/web/public/assets/meshysmith/meshysmith-logo.png");

if (!existsSync(source)) {
  console.error(`[icons] master logo not found at ${source}`);
  process.exit(1);
}

const targets = [
  resolve(root, "apps/web/public/favicon.ico"),
  resolve(root, "deploy/electron/icon.ico"),
];

const buffer = await pngToIco(source);
for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buffer);
  console.log(`[icons] wrote ${relative(root, target)} (${buffer.length} bytes)`);
}

const runtimePng = resolve(root, "deploy/electron/icon.png");
copyFileSync(source, runtimePng);
console.log(`[icons] wrote ${relative(root, runtimePng)}`);
