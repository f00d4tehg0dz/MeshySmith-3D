# MeshySmith Desktop (Electron)

Wraps the static MeshySmith build in an Electron shell so it can ship as a
native desktop app on Windows, macOS, and Linux. The renderer is the same
static export consumed by the Docker image (`apps/web/out`); the app already
detects `window.location.protocol === "file:"` and switches to the bundled
Manifold WASM, so no source changes are needed.

## Run from source

```bash
npm install
npm run electron:dev
```

## Package installers

```bash
npm run electron:dist        # current platform
npm run electron:dist:win    # Windows NSIS installer
npm run electron:dist:mac    # macOS DMG (universal arches)
npm run electron:dist:linux  # Linux AppImage
```

Output goes to `deploy/electron/dist/`.

## Cutting a GitHub Release

The [`.github/workflows/release-electron.yml`](../../.github/workflows/release-electron.yml) workflow builds the installers for every supported platform and attaches them to a GitHub Release.

### Recommended: tag-driven release

```bash
# 1. Bump the version in package.json (e.g. 0.4.0 -> 0.5.0) and commit.
npm version patch     # or `minor` / `major` — also creates the tag
git push origin main --follow-tags
```

The push of the `v<semver>` tag triggers the workflow. It will:

1. Run three parallel build jobs on `ubuntu-latest`, `macos-latest`, `windows-latest`.
2. Each job runs `npm run electron:dist:<os>`, producing a platform-native installer in `deploy/electron/dist/`.
3. Uploads the installers as workflow artifacts (retained 14 days).
4. Attaches the installers to the GitHub Release matching the tag, creating it with auto-generated release notes if it doesn't exist yet.

Tag-push releases are **published** (not drafts).

### Manual: workflow dispatch

If you need to re-cut binaries for an existing tag (e.g. one of the platform jobs failed and you fixed it), go to Actions → "Release Electron builds" → "Run workflow":

- **Tag name**: the tag the release should attach to (e.g. `v0.4.0`). The tag must already exist on the repo.
- **Create as draft**: leave `true` for first manual runs so you can review before publishing. Toggle off to publish immediately.

### What gets uploaded per platform

| Platform | Files |
| --- | --- |
| Windows | `MeshySmith-Setup-<version>.exe` (NSIS installer), `MeshySmith-<version>-win-x64.exe`, `latest.yml` |
| macOS | `MeshySmith-<version>-mac-x64.dmg`, `MeshySmith-<version>-mac-arm64.dmg`, matching `.zip`s, `latest-mac.yml` |
| Linux | `MeshySmith-<version>-linux-x64.AppImage`, `latest-linux.yml` |

The `latest*.yml` files are Squirrel/electron-builder auto-update manifests. They're harmless if you don't use auto-update, and ready to go if you ever add it.

### A note on code signing

The workflow ships **unsigned** builds — `CSC_IDENTITY_AUTO_DISCOVERY=false` is set in the workflow env. First-time users will see:

- **macOS**: Gatekeeper "unidentified developer" warning. Right-click → Open to bypass.
- **Windows**: SmartScreen "Windows protected your PC". Click "More info" → "Run anyway".

To sign the builds later, add `CSC_LINK` / `CSC_KEY_PASSWORD` (macOS) and `WIN_CSC_LINK` / `WIN_CSC_KEY_PASSWORD` (Windows) secrets to the repo and electron-builder will pick them up automatically — no workflow changes needed.
