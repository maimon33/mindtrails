# MindTrails Website

Static website hosted on S3 with Cloudflare CDN and automated deployments.

## Local Development

### Prerequisites
- Docker & Docker Compose installed

### Run Locally
```bash
docker-compose up
```

Then open `http://localhost:8080` in your browser. Changes to files in `content/` reload automatically.

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
├── content/              # Your website files (HTML, CSS, images, etc)
├── Dockerfile            # Container for local dev
├── docker-compose.yml    # Docker setup
├── .github/workflows/    # GitHub Actions automation
└── README.md
```

## Updating the Site

1. Edit files in `content/`
2. Commit and push to `main`
3. GitHub Actions automatically deploys to S3 and clears Cloudflare cache

Done! Changes live in ~30 seconds.

## Optional: Branch Protection

For safety, enable GitHub branch protection on `main`:
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Require deployment status checks before merging
4. Require approvals (if working with a team)
