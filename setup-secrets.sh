# Cloudflare Workers Environment Variables
# Use these commands to set up secrets for production deployment

# Set the Sentry DSN (replace with your actual DSN)
wrangler secret put VITE_SENTRY_DSN
# When prompted, paste your DSN: https://your-sentry-dsn@sentry.io/project-id

# Set the environment (production)
wrangler secret put SENTRY_ENVIRONMENT
# When prompted, enter: production

# Optional: Set Sentry Auth Token for better source maps
# wrangler secret put SENTRY_AUTH_TOKEN
# When prompted, paste your auth token from Sentry

# Check your secrets
# wrangler secret list
