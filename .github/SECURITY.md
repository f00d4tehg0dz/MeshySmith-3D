# Security Policy

## Supported versions

MeshySmith is alpha software. Only the latest release on the `main` branch receives security fixes.

| Version | Supported |
| --- | --- |
| `main` (latest) | ✅ |
| Older releases | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for security reports.**

Instead:

1. Use GitHub's [private security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) flow for this repository, or
2. Contact the maintainer directly via the email listed on the [GitHub profile](https://github.com/f00d4tehg0dz).

A good report includes:

- Affected version, commit SHA, or live URL
- Steps to reproduce — minimal repro is best
- Expected vs. actual behavior
- Impact (what an attacker can do)
- Browser, operating system, and any relevant logs (with secrets redacted)
- A proof-of-concept if you have one

## Response timeline

| Stage | Target |
| --- | --- |
| Acknowledge receipt | Within 72 hours |
| Initial assessment | Within 7 days |
| Patch + coordinated disclosure | Within 30 days (severity-dependent) |

Severe vulnerabilities (remote code execution, unauthenticated data exfiltration, etc.) are prioritised and may ship as out-of-band releases.

## Scope

In scope:

- The Next.js application under `apps/web/`
- The Electron desktop shell under `deploy/electron/`
- The Docker deployment under `deploy/docker/`
- Build and CI configuration in `.github/workflows/`

Out of scope:

- Findings that only affect example STL/OBJ files included in tests
- Issues caused by user-installed browser extensions
- Vulnerabilities in upstream dependencies that don't have a viable exploit path through MeshySmith — report those to the upstream project

## Coordinated disclosure

After a fix lands on `main`, we will:

1. Publish a GitHub Security Advisory crediting the reporter (unless you ask to remain anonymous).
2. Tag a release with the fix.
3. Note the CVE (if assigned) in the release notes.

Thank you for helping keep MeshySmith and its users safe.
