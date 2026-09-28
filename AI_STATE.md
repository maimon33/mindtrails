# MindTrails Project State

## Project Purpose
Static website for MindTrails (custom quest experiences) hosted on S3 + Cloudflare CDN with automated deployments via GitHub Actions.

## Tech Stack
- **Frontend**: Static HTML/CSS/JS (exported from WordPress/Elementor)
- **Hosting**: AWS S3 + Cloudflare CDN
- **Deployment**: GitHub Actions with OIDC (keyless AWS auth)
- **CMS Origin**: WordPress 7.1.1 with Elementor 4.2.4 (no longer needed after export)

## Key File Map
- `.github/workflows/deploy.yml` — Deployment pipeline (S3 sync + Cloudflare purge)
- `content/` — Website files (HTML, CSS, images, plugins—only HTML/CSS/images used in prod)
- `SETUP.md` — Step-by-step AWS OIDC and Cloudflare setup guide
- `Dockerfile` & `docker-compose.yml` — Local dev environment
- `.deployignore` — Files excluded from S3 deployment (plugins, feeds, etc.)

## Active Conventions
- Deploy on push to `main` branch (automatic via GitHub Actions)
- S3 bucket: `mindtrails.net` (region: eu-central-1)
- Cloudflare: Full cache purge on every deploy (~30s propagation)
- Changes in `content/` or `.github/workflows/` trigger deploy

## Current Initiatives
- **Done**: Fixed S3 bucket name typo in deploy workflow (was `mindtrails.net0`)
- **Done**: Added `.deployignore` to exclude WordPress/plugin bloat from S3
- **Done**: Updated docs to reflect OIDC auth (no stored AWS keys)
- **Next**: Review and optimize site content, design, and styles

## Known Constraints & Decisions
- Site is fully static (no server-side logic possible)
- All WordPress/Elementor backend is vestigial—only the exported HTML/CSS matters
- Cloudflare full purge is blunt but safe (no granular cache rules needed yet)
- Deploy excludes `wp-content/plugins/` and `wp-includes/` to keep S3 storage lean

---

## Session Log

### 2026-09-29 — Infrastructure fixes
- Fixed critical S3 bucket name typo in deploy.yml (`mindtrails.net0` → `mindtrails.net`)
- Created `.deployignore` to exclude WordPress files from S3 sync
- Updated deploy workflow to use `--exclude` flags for WordPress directories
- Simplified README.md and SETUP.md to clarify OIDC-based auth (no stored credentials)
- Clarified Cloudflare secret requirements (zone ID + API token only)
