import { sequence } from '@sveltejs/kit/hooks';
import type { HandleServerError } from '@sveltejs/kit';

// For Cloudflare Workers, we use a simplified approach without Sentry server-side hooks
export const handle = sequence();

// Simple error handler for Cloudflare Workers
export const handleError: HandleServerError = ({ error }) => {
  // Log error for debugging (will appear in Cloudflare Workers logs)
  console.error('Server error:', error);

  // Return a safe error message for users
  return {
    message: 'An unexpected error occurred'
  };
};
