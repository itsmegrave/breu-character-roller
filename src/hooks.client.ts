import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';

// Only initialize Sentry if DSN is provided
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Performance monitoring
    tracesSampleRate: 1.0,

    // Session replay for debugging user interactions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      replayIntegration({
        // Mask all inputs for privacy
        maskAllInputs: true,
        // Block all media for smaller replay sizes
        blockAllMedia: true,
      }),
    ],

    // Environment detection
    environment: import.meta.env.MODE,

    // Custom tags for the RPG character roller
    initialScope: {
      tags: {
        component: 'breu-character-roller',
        type: 'client'
      }
    }
  });
}

export const handleError = handleErrorWithSentry();
