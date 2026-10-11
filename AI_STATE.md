# MindTrails Project State

## Project Purpose
Static website for MindTrails (custom quest experiences) hosted on S3 + Cloudflare CDN with automated deployments via GitHub Actions.

## Tech Stack
- **Frontend**: Astro 7 static site (`Mind-Trails-website/source`), built output in `Mind-Trails-website/site`
- **Hosting**: AWS S3 + Cloudflare CDN
- **Deployment**: GitHub Actions with OIDC (keyless AWS auth)
- **Previous site**: WordPress/Elementor export, kept in `Archive/` (not deployed)

## Key File Map
- `.github/workflows/deploy.yml` — Deployment pipeline (S3 sync + Cloudflare purge)
- `Mind-Trails-website/site/` — Built site uploaded to S3 root (this is what Docker and deploy serve)
- `Mind-Trails-website/source/src/pages/index.astro` — Home page incl. contact form + submit handler (posts to Lambda API)
- `Mind-Trails-website/source/src/data/site.js` — All page texts
- `Archive/` — Previous WordPress export (`content/`, `custom.css`), reference only
- `SETUP.md` — Step-by-step AWS OIDC and Cloudflare setup guide
- `Dockerfile` & `docker-compose.yml` — Local dev environment
- `.deployignore` — Legacy WordPress exclusion list (not used by the current deploy workflow)

## Active Conventions
- Deploy on push to `main` branch (automatic via GitHub Actions)
- S3 bucket: `mindtrails.net` (region: eu-central-1)
- Cloudflare: Full cache purge on every deploy (~30s propagation)
- Changes in `Mind-Trails-website/site/` or `.github/workflows/` trigger deploy
- Site is rebuilt from `source/` and the output is copied into `site/` (commit both)

## Current Initiatives
- **Done**: Fixed S3 bucket name typo in deploy workflow (was `mindtrails.net0`)
- **Done**: Added `.deployignore` to exclude WordPress/plugin bloat from S3
- **Done**: Updated docs to reflect OIDC auth (no stored AWS keys)
- **Done**: Integrated Terraform Lambda API endpoint into contact form
- **Done**: Improved text readability with solid semi-opaque overlays (WCAG AA compliant)
- **Done**: Redesigned hero section with brand-gradient background

## Known Constraints & Decisions
- Site is fully static (no server-side logic possible)
- All WordPress/Elementor backend is vestigial—only the exported HTML/CSS matters
- Cloudflare full purge is blunt but safe (no granular cache rules needed yet)
- Deploy excludes `wp-content/plugins/` and `wp-includes/` to keep S3 storage lean

---

## Session Log

### 2026-10-11 — New Astro site replaces WordPress export
- Moved the WordPress export (`content/`, `custom.css`) to `Archive/`
- New site lives in `Mind-Trails-website/` (`source/` = Astro project, `site/` = built output, deployed)
- Contact form now posts to the existing Lambda API (`/prod/contact`) with hCaptcha (same site key as before)
- Extra form fields (company, people, date, activity) are folded into the message: Lambda only stores name, email, message
- Deploy workflow syncs `Mind-Trails-website/site/` to S3; Dockerfile and docker-compose serve the same folder
- Open: the Lambda CORS origin is hardcoded to `https://mindtrails.net`, so form submissions from `localhost:8080` are blocked by the browser; the Lambda still processes the request, so don't test-submit locally (it sends real emails)

### 2026-10-03 — Contact form integration & design improvements

**Contact form & API:**
- Inserted Terraform Lambda API endpoint (`https://yga0l4agjf.execute-api.eu-central-1.amazonaws.com/prod/contact`) as config in HTML
- Added JavaScript handler to intercept form submission and POST to Lambda endpoint
- Includes success/error feedback to user

**Text readability (best practices):**
- Replaced text-shadow approach with solid semi-opaque dark containers (50% opacity)
- Updated background-colors: h1-h6 headings and text-editor blocks now have `rgba(0, 0, 0, 0.5)` backgrounds
- Ensured white text on dark backgrounds for WCAG AA compliance (4.5:1 contrast ratio)
- Added smooth transitions and proper padding/spacing for professional appearance

**Hero section redesign:**
- Replaced simple black background with brand-gradient (purple/indigo tones: `#1a0f3c` → `#4a1a5c`)
- Gradient echoes the logo's color palette (purple, orange, pink)
- Added subtle drop shadow on logo for depth
- Cleaner, more modern aesthetic aligned with leading sites

### 2026-09-29 — Infrastructure, content, and design improvements

**Infrastructure fixes:**
- Fixed critical S3 bucket name typo in deploy.yml (`mindtrails.net0` → `mindtrails.net`)
- Created `.deployignore` to exclude WordPress files from S3 sync
- Updated deploy workflow to use `--exclude` flags for WordPress directories
- Simplified README.md and SETUP.md to clarify OIDC-based auth (no stored credentials)
- Clarified Cloudflare secret requirements (zone ID + API token only)

**Content improvements:**
- Updated page title: "Home - custom quest" → "MindTrails - Custom Quest Experiences"
- Updated meta description (added semantic description tag, improved og:description)
- Changed "About me" → "About" (more professional)
- Changed "Contact Me" → "Get In Touch" (more inviting)
- Changed button text: "Send Message" → "Book Your Experience" (action-oriented CTA)
- Updated og:site_name: "custom quest" → "MindTrails" (brand clarity)

**Design & styling improvements:**
- Created `custom.css` with:
  - Standardized CSS variable color system (primary, secondary, accent, dark, light)
  - Consolidated typography scale (h1-h3, body, small with proper ratios)
  - Responsive padding/margin standards (clamp-based for fluid scaling)
  - Button styling with hover states and proper contrast
  - Improved image overlays (50% dark instead of 12-20% for text readability)
  - Form field styling with focus states and accessibility enhancements
  - Better responsive breakpoints for mobile/tablet/desktop
  - Removed decorative underlines (improved accessibility)
- Created `COLORS.md` documentation with:
  - Primary palette (purple, orange, pink) with hex codes
  - Usage guidelines for each color
  - Contrast ratios and accessibility notes
  - Semantic color meanings
  - CSS variable mapping
  - Guidance for dark mode (future)
