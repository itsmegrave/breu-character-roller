/**
 * Performance monitoring initialization
 * Call this early in your app lifecycle
 */

import { initWebVitals } from './metrics/web-vitals';

export function initPerformanceMonitoring() {
  // Initialize Web Vitals as early as possible
  if (typeof window !== 'undefined') {
    initWebVitals();

    // Track initial page load performance
    window.addEventListener('load', () => {
      // Track total page load time
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigationTiming) {
        console.log('📊 Page Load Metrics:', {
          domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
          fullLoad: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
          totalTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart
        });
      }
    });
  }
}
