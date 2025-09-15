# Sentry Configuration for Cloudflare Workers

## Overview

This project uses a Cloudflare Workers-compatible Sentry configuration. Due to the limitations of the Workers runtime environment, we only use client-side Sentry integration.

## Configuration

### Client-Side Only

- **hooks.client.ts**: Full Sentry integration with error tracking, performance monitoring, and session replay
- **hooks.server.ts**: Simplified error handling without Sentry server-side integration
- **instrumentation.server.ts**: Minimal server-side logging (no Sentry)

### Environment Variables

```bash
# Required for Sentry to work
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional environment detection
SENTRY_ENVIRONMENT=production
```

### Why No Server-Side Sentry?

Cloudflare Workers have limitations:
- No Node.js server runtime (uses V8 isolates)
- Limited API compatibility with traditional Node.js packages
- The `@sentry/sveltekit` server-side exports don't work in Workers environment

## Features Available

✅ **Client-Side Error Tracking**: Captures unhandled errors and exceptions
✅ **Performance Monitoring**: Tracks page load times, user interactions
✅ **Session Replay**: Records user sessions for debugging (with privacy controls)
✅ **Web Vitals Integration**: Automatically tracks Core Web Vitals

❌ **Server-Side Error Tracking**: Not available due to Workers limitations
❌ **Server-Side Performance**: Not available due to Workers limitations

## Error Handling Strategy

1. **Client Errors**: Automatically captured by Sentry
2. **Server Errors**: Logged to console (visible in Cloudflare Workers logs)
3. **Build Errors**: Handled by build process and deployment pipeline

## Deployment

The build process automatically:
- Excludes server-side Sentry code from the Workers bundle
- Includes only client-side Sentry in the browser bundle
- Maintains compatibility with Cloudflare Workers runtime
