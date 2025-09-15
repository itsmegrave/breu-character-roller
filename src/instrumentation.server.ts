// Sentry instrumentation for server-side (disabled for Cloudflare Workers)
// Cloudflare Workers don't support traditional Node.js server instrumentation
// We rely on client-side Sentry tracking instead

console.log('Server-side instrumentation skipped for Cloudflare Workers environment');
