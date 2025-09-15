# Web Vitals Setup Guide

## 📊 What Web Vitals Track

### Core Web Vitals:
- **CLS (Cumulative Layout Shift)**: Visual stability - measures unexpected layout shifts
- **LCP (Largest Contentful Paint)**: Loading performance - time until main content loads
- **FCP (First Contentful Paint)**: When first content appears on screen
- **TTFB (Time to First Byte)**: Server response time

### Custom Metrics for Your RPG App:
- **Dice Animation Performance**: How long 3D dice animations take
- **Font Loading Time**: Time to load Bondrians and other custom fonts
- **Attribute Generation Speed**: Performance of dice rolling operations

## 🎯 Good Performance Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP    | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FCP    | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| CLS    | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB   | ≤ 0.8s | 0.8s - 1.8s | > 1.8s |

## 🔍 Monitoring in Sentry

1. **Performance Tab**: See Web Vitals trends over time
2. **Issues**: Automatic alerts when metrics are poor
3. **Custom Measurements**: Track dice rolling and font loading
4. **Session Replay**: See exactly what users experienced during slow loads

## 🚀 Installation

```bash
bun add web-vitals
```

The setup is already configured in your app!

## 📱 Testing Performance

1. **Chrome DevTools**:
   - Performance tab → Record page load
   - Lighthouse → Run audit

2. **Real User Monitoring**:
   - Check Sentry dashboard after deployment
   - Monitor metrics over time

3. **3D Dice Performance**:
   - Watch console for dice animation timing
   - Check if animations are causing layout shifts

## 🔧 Optimization Tips

- **Fonts**: Use `font-display: swap` for faster text rendering
- **Images**: Add proper width/height to prevent CLS
- **3D Dice**: Consider reducing animation complexity on slow devices
- **Code Splitting**: Load heavy 3D libraries only when needed
