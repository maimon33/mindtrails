# MindTrails Website

Static website hosted on S3 with Cloudflare CDN and automated deployments.

## Local Development

### Prerequisites
- Docker & Docker Compose installed

### Run Locally
```bash
docker-compose up
```

Then open `http://localhost:8080` in your browser. The container serves `Mind-Trails-website/site/` read-only, so rebuild the site (see below) and refresh.

## Deployment

Push to `main` branch to automatically:
1. Upload files to S3 bucket via AWS OIDC (keyless authentication)
2. Purge Cloudflare cache

### Prerequisites

Requires GitHub Secrets (set in repo Settings → Secrets and variables → Actions):
- `CLOUDFLARE_ZONE_ID` — Your Cloudflare zone ID
- `CLOUDFLARE_API_TOKEN` — Your Cloudflare API token (with cache purge permission)

AWS credentials are handled securely via OIDC—no keys stored in GitHub.

## File Structure

```
mindtrails/
├── Mind-Trails-website/
│   ├── site/             # Built website, deployed to S3
│   └── source/           # Astro project the site is built from
├── Archive/              # Previous WordPress export (not deployed)
├── Dockerfile            # Container for local dev
├── docker-compose.yml    # Docker setup
├── .github/workflows/    # GitHub Actions automation
└── README.md
```

## Updating the Site

1. Edit `Mind-Trails-website/source/` (texts in `src/data/site.js`, page in `src/pages/index.astro`)
2. Rebuild: `cd Mind-Trails-website/source && npm install && npm run build -- --outDir ../site`, then commit `Mind-Trails-website/site/`
3. Commit and push to `main`
4. GitHub Actions automatically deploys to S3 and clears Cloudflare cache

Done! Changes live in ~30 seconds.

## Optional: Branch Protection

For safety, enable GitHub branch protection on `main`:
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Require deployment status checks before merging
4. Require approvals (if working with a team)
