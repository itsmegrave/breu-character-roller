import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import * as Sentry from '@sentry/sveltekit';

/**
 * Web Vitals monitoring for RPG Character Roller
 * Tracks Core Web Vitals and sends them to Sentry for analysis
 */

// Send vitals to Sentry
function sendToSentry(metric: Metric) {
  // Send as Sentry measurement
  Sentry.setMeasurement(metric.name, metric.value, 'millisecond');

  // Also send as custom metric with more context
  Sentry.addBreadcrumb({
    message: `Web Vital: ${metric.name}`,
    category: 'performance',
    level: 'info',
    data: {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    }
  });

  // Log performance issues if vitals are poor
  if (metric.rating === 'poor') {
    Sentry.captureMessage(`Poor ${metric.name}: ${metric.value}`, {
      level: 'warning',
      tags: {
        component: 'web-vitals',
        metric: metric.name,
        rating: 'poor'
      },
      extra: {
        value: metric.value,
        threshold: getThreshold(metric.name),
        url: window.location.href
      }
    });
  }
}

// Get performance thresholds for context
function getThreshold(metricName: string): number {
  const thresholds: Record<string, number> = {
    CLS: 0.1,      // Cumulative Layout Shift
    FID: 100,      // First Input Delay
    FCP: 1800,     // First Contentful Paint
    LCP: 2500,     // Largest Contentful Paint
    TTFB: 800      // Time to First Byte
  };
  return thresholds[metricName] || 0;
}

// Initialize Web Vitals monitoring
export function initWebVitals() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  try {
    // Core Web Vitals
    onCLS(sendToSentry);  // Cumulative Layout Shift
    onFCP(sendToSentry);  // First Contentful Paint
    onLCP(sendToSentry);  // Largest Contentful Paint
    onTTFB(sendToSentry); // Time to First Byte

    console.log('📊 Web Vitals monitoring initialized');
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
    Sentry.captureException(error, {
      tags: { component: 'web-vitals-init' }
    });
  }
}

// Custom performance tracking for RPG-specific actions
export function trackCustomPerformance(name: string, startTime: number) {
  const duration = performance.now() - startTime;

  // Send to Sentry
  Sentry.setMeasurement(`custom.${name}`, duration, 'millisecond');

  // Log if performance is slow
  if (duration > 1000) { // More than 1 second
    Sentry.captureMessage(`Slow operation: ${name}`, {
      level: 'warning',
      tags: {
        component: 'custom-performance',
        operation: name
      },
      extra: {
        duration,
        url: window.location.href
      }
    });
  }

  return duration;
}

// Track dice animation performance
export function trackDiceAnimationPerformance() {
  const startTime = performance.now();

  return {
    end: () => trackCustomPerformance('dice-animation', startTime)
  };
}

// Track font loading performance
export function trackFontLoadingPerformance() {
  if (typeof document === 'undefined') return;

  document.fonts.ready.then(() => {
    const fontLoadTime = performance.now();
    Sentry.setMeasurement('custom.font-load-time', fontLoadTime, 'millisecond');

    Sentry.addBreadcrumb({
      message: 'Fonts loaded',
      category: 'performance',
      level: 'info',
      data: { loadTime: fontLoadTime }
    });
  });
}
