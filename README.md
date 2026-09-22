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

Push to `main` branch in the `content/` folder to automatically:
1. Upload files to S3 bucket (`mindtrails`)
2. Purge Cloudflare cache

### Setup GitHub Secrets

Add these secrets to your GitHub repository settings:

- `AWS_ACCESS_KEY_ID` — Your AWS access key
- `AWS_SECRET_ACCESS_KEY` — Your AWS secret key
- `CLOUDFLARE_ZONE_ID` — Your Cloudflare zone ID
- `CLOUDFLARE_API_TOKEN` — Your Cloudflare API token (with cache purge permission)

See `.env.example` for reference.

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
