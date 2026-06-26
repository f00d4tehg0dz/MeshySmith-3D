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
