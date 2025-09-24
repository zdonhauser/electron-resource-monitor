# Baseline Performance Measurement Guide

This guide helps you measure the current performance of chart updates before implementing the ChartUpdateManager optimization.

## Setup

1. **Add Performance Test Page to Router**
   
   Add the performance test page to your app router so you can access it:

   ```typescript
   // In src/renderer/src/App.tsx, add the import and route
   import PerformanceTestPage from './components/PerformanceTestPage'
   
   // Add this route to your router configuration
   <Route path="/performance-test" element={<PerformanceTestPage />} />
   ```

2. **Navigate to Test Page**
   
   Start your development server and navigate to `#/performance-test` in your app.

## Running Baseline Tests

### Quick Test (5 minutes)
1. Set data rate to 250ms (matches production)
2. Click "Start Test"
3. Let it run for 2-3 minutes to collect data
4. Click "Export Metrics" to save baseline
5. Note the key metrics in console

### Comprehensive Test (15 minutes)
1. Run multiple test scenarios:
   - 250ms rate (production rate)
   - 100ms rate (high frequency)
   - 500ms rate (low frequency)
2. For each rate, run for 3-5 minutes
3. Export metrics after each test
4. Compare performance across different rates

## Key Metrics to Track

### Before Optimization (Current Implementation)
- **plotly_newPlot**: Time to create new plot (should be high)
- **component_render**: React component render time
- **data_update**: Time to process new data
- **dom_manipulation**: DOM update time

### Expected Improvements After Optimization
- **plotly_react**: Should be much faster than newPlot
- **chart_update**: Batched updates should reduce frequency
- **component_render**: Should be more stable
- **queue_processing**: New metric for batch processing

## Baseline Targets

Based on the requirements, we want to achieve:
- Chart updates < 16ms (60fps)
- No UI blocking during updates
- Smooth interactions during pan/zoom
- Memory usage should remain stable

## Sample Baseline Results

Here's what you might see before optimization:

```json
{
  "plotly_newPlot": {
    "averageDuration": 45.2,
    "minDuration": 12.1,
    "maxDuration": 156.8,
    "p95Duration": 89.3,
    "totalMeasurements": 240
  },
  "component_render": {
    "averageDuration": 8.7,
    "minDuration": 2.1,
    "maxDuration": 28.4,
    "p95Duration": 18.2,
    "totalMeasurements": 240
  }
}
```

## Next Steps

After collecting baseline metrics:

1. Save the exported JSON files with descriptive names:
   - `baseline-250ms-production.json`
   - `baseline-100ms-highfreq.json`
   - etc.

2. Implement the ChartUpdateManager (Task 3)

3. Run the same tests with the optimized implementation

4. Compare the results to quantify improvements

## Troubleshooting

- **No data showing**: Make sure to click "Start Test" first
- **Performance monitor not visible**: Check the "Show Performance Monitor" checkbox
- **Metrics not updating**: Try refreshing the metrics manually
- **Export not working**: Check browser console for errors

## Performance Goals

After implementing ChartUpdateManager, we expect:
- 60-80% reduction in chart update time
- More consistent frame rates
- Better responsiveness during user interactions
- Reduced memory allocation/garbage collection