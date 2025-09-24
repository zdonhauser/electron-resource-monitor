# How to Take Baseline Performance Measurements

## Quick Start (5 minutes)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the Performance Test page:**
   - **Note**: The Performance Test page is only available in development mode
   - In your app, click on "🚀 Performance Test" in the sidebar
   - Or navigate directly to `#/performance-test`

3. **Run a baseline test:**
   - Set "Data Rate" to `250` (matches production sampling rate)
   - Click "Start Test" 
   - Let it run for 2-3 minutes
   - Watch the Performance Monitor panel for real-time metrics
   - Click "Export Metrics" to save your baseline data

4. **Review the results:**
   - Check the console for detailed performance logs
   - Look for these key metrics:
     - `plotly_newPlot`: Time to create charts (current implementation)
     - `component_render`: React component render time
     - `data_update`: Time to process new telemetry data

## What You'll See (Expected Baseline Results)

Before optimization, you should see metrics like:

```
📊 Performance Summary
🔍 plotly_newPlot
  Average: 35-50ms
  P95: 60-80ms
  
🔍 component_render  
  Average: 5-15ms
  P95: 20-30ms
  
🔍 data_update
  Average: 2-8ms
  P95: 10-15ms
```

## Performance Goals After Optimization

After implementing ChartUpdateManager, we expect:
- `plotly_react`: 5-15ms (much faster than newPlot)
- `chart_update_batched`: Reduced frequency of updates
- Overall 60-80% improvement in chart performance

## Troubleshooting

**Problem: Performance Test page not loading**
- Make sure you added the route to App.tsx
- Check browser console for import errors

**Problem: No performance data showing**
- Click "Start Test" to begin data generation
- Make sure "Show Performance Monitor" is checked
- Try refreshing the metrics manually

**Problem: Can't export metrics**
- Check browser console for errors
- Try clicking "Log to Console" first to see if data exists

## Next Steps

1. Save your baseline metrics with a descriptive filename like `baseline-250ms-before-optimization.json`
2. Implement the ChartUpdateManager (Task 3)
3. Run the same test with the optimized implementation
4. Compare the results to measure improvement

The baseline measurements will help us prove that our ChartUpdateManager optimization actually improves performance!