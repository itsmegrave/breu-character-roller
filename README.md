# Breu Character Roller

A RPG character generator for Breu built with SvelteKit and deployed on Cloudflare Workers. Features automatic attribute generation, death detection with countdown timer, and comprehensive observability.

## Features

- 🎲 **Automatic Character Generation**: Generates 6 RPG attributes (FOR, DES, CON, INT, SAB, CAR) using 2d4 rule.
- ⚰️ **Death Banner**: Shows warning when character attributes are too low with auto-regeneration countdown
- 📊 **Web Vitals Monitoring**: Tracks Core Web Vitals and custom RPG metrics
- 🐛 **Error Tracking**: Client-side error monitoring with Sentry (Cloudflare Workers compatible)
- ♿ **Accessibility**: Full ARIA support and screen reader compatibility
- 🧪 **Comprehensive Testing**: Unit and integration tests with mocking strategies

## Technology Stack

- **Framework**: SvelteKit with Svelte 5 runes
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Testing**: Vitest
- **Observability**: Sentry + Web Vitals
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build

# Deploy to Cloudflare Workers
bun run deploy
```

## Development

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Optional: Sentry DSN for error tracking
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

### Code Quality

Pre-commit hooks automatically run:
- ESLint for code linting
- Prettier for code formatting
- Type checking

## Architecture

### Clean Separation of Concerns

- **`src/lib/character-generator.ts`**: Core business logic
- **`src/lib/types.ts`**: TypeScript definitions
- **`src/lib/web-vitals.ts`**: Performance monitoring
- **`src/routes/+page.svelte`**: Presentation layer
- **`src/tests/`**: Comprehensive test suite

### Cloudflare Workers Compatibility

This project is optimized for Cloudflare Workers deployment:
- Client-side only Sentry integration (server-side not supported in Workers)
- Edge-compatible runtime configuration
- Minimal bundle size and fast cold starts

## Documentation

- [Test Specification](docs/test-specification.md) - Comprehensive testing strategy
- [Web Vitals](docs/web-vitals.md) - Performance monitoring details
- [Sentry + Cloudflare Workers](docs/sentry-cloudflare-workers.md) - Error tracking configuration

## Deployment

Deployed on Cloudflare Workers with automatic CI/CD. The application includes:
- Static asset optimization
- Edge caching
- Global CDN distribution
- Real-time error tracking and performance monitoring
