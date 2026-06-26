# Contributing to MeshySmith

Thanks for your interest in improving MeshySmith. This guide covers how to set up your environment, propose changes, and ship a pull request that lands smoothly.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Project layout](#project-layout)
- [Branching and commit conventions](#branching-and-commit-conventions)
- [Testing requirements](#testing-requirements)
- [Pull request checklist](#pull-request-checklist)
- [Areas that need extra care](#areas-that-need-extra-care)
- [Style and code quality](#style-and-code-quality)
- [License](#license)

## Code of Conduct

This project follows the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md). By participating you agree to uphold its terms.

## Ways to contribute

- **Report bugs** with reproduction steps via the [Bug report template](ISSUE_TEMPLATE/bug_report.yml).
- **Suggest features** via the [Feature request template](ISSUE_TEMPLATE/feature_request.yml).
- **Improve documentation** in [README.md](../README.md), this guide, or inline source comments.
- **Send code** as a pull request that closes an issue or implements an agreed-upon proposal.
- **Triage** existing issues by reproducing reports and confirming whether a problem still happens.

## Development setup

Requirements:

- Node.js 20 or newer
- npm 10+
- A modern Chromium-based browser for manual testing
- Git

Clone and install:

```bash
git clone https://github.com/f00d4tehg0dz/MeshySmith-3D.git
cd MeshySmith-3D
npm install
npm run dev
```

The dev server runs at `http://127.0.0.1:3000/`. If you ever see a stale `/` 404 after a major rebrand or rename, run `npm run dev:clean` to wipe `.next` and restart.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Next.js dev server |
| `npm run dev:clean` | Wipe the `.next` cache and start dev |
| `npm run build` | Production build (server routes preserved) |
| `npm run export` | Static export to `apps/web/out` (used by Docker + Electron) |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm test` | Vitest unit suite |
| `npm run test:e2e` | Playwright end-to-end suite |
| `npm run electron:dev` | Build static export and launch the desktop shell |
| `npm run icons:generate` | Regenerate favicon.ico + Electron icons from the master logo |

## Project layout

```
apps/web/                  Next.js 16 App Router workspace
  src/app/                 Routes (page.tsx, layout.tsx, /api/*)
  src/components/          Editor + workplane + theme + onboarding
  src/lib/                 Pure logic (shape catalog, exports, settings)
  src/types/               Shared TypeScript types
  public/assets/meshysmith Brand assets and shape thumbnails
deploy/
  docker/                  Nginx-served static build
  electron/                Electron main + electron-builder config
scripts/                   Build helpers (icon generation, etc.)
tests/
  unit/                    Vitest unit tests
  e2e/                     Playwright end-to-end tests
  perf/                    STL import benchmarks
```

## Branching and commit conventions

- Work on a feature branch named like `feat/shape-categories`, `fix/cube-drag-suppresses-click`, or `docs/contributing-rewrite`.
- Keep commits focused. Squash trivial fixups before opening the PR.
- Write commit subjects in the imperative mood ("Add gear primitive", "Fix outliner rename on Escape"). 50-character soft limit.
- The first line of the body should explain the **why** when it isn't obvious from the diff.

Conventional Commits are welcome but not required.

## Testing requirements

Every PR must pass:

1. `npm run typecheck` — no TypeScript errors.
2. `npm test` — Vitest unit suite green.
3. `npm run test:e2e` — Playwright suite green for any change that touches editor UI, the viewport, theming, the outliner, the shape palette, or persistence.

If you touch the 3D viewport, add or update a Playwright assertion that exercises the change (snap-to-view, drag, fillet/chamfer, etc.). Visual proof screenshots land in `test-results/`.

## Pull request checklist

Before requesting review:

- [ ] Branch is up to date with `main`.
- [ ] `npm run typecheck`, `npm test`, and `npm run test:e2e` all pass locally.
- [ ] New behavior is covered by tests, or there's a concrete reason it isn't.
- [ ] UI changes include before/after screenshots in the PR description.
- [ ] Public-facing changes are reflected in `README.md` and any release notes.
- [ ] Storage keys, event names, or DnD MIME types are unchanged, OR the PR includes a migration note.
- [ ] No new `console.log` left in production code.
- [ ] License header / AGPL compatibility preserved for any code copied from third parties.

## Areas that need extra care

These surfaces have subtle invariants — change them deliberately and back the change with tests.

- **STL import and export** (`apps/web/src/lib/stlImport.ts`, viewport mesh path).
- **Imported mesh transforms** — scale/rotation baking semantics.
- **Grouping and hole subtraction** — boolean ops in `MeshySmithEditor.tsx`.
- **Undo/redo history** — commit semantics and the project-snapshot serializer.
- **Project persistence and dashboard thumbnails** — the `meshSmith.projects` / `meshSmith.projectShapes` storage keys plus the `/api/project-thumbnail` route.
- **Snapping, rotation wheels, and rotated-object dimension readouts** — gizmo math.
- **ViewCube interaction** — click/drag arbitration (5px threshold).
- **Camera mode swap** — perspective ↔ orthographic frustum sync.

## Style and code quality

- Prefer existing project patterns before adding new abstractions.
- Keep UI behavior local to the relevant component unless the behavior is shared.
- Use TypeScript types instead of loose object shapes.
- Avoid comments that restate the code; write a comment only when the WHY is non-obvious.
- Don't introduce new runtime dependencies without justification.
- Don't ship dead code paths or feature flags for unfinished work.

## License

By contributing you agree that your contributions are licensed under the project's [AGPL-3.0-or-later](../LICENSE) license. If you copy code from another project, ensure the upstream license is compatible and call it out in the PR description.
