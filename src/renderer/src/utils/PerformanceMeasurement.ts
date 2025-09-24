/**
 * Performance measurement utility for tracking chart update performance
 * This will help us measure improvements from the ChartUpdateManager
 */

export interface PerformanceMeasurementData {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

export interface PerformanceMetrics {
  averageDuration: number
  minDuration: number
  maxDuration: number
  totalMeasurements: number
  p95Duration: number
  p99Duration: number
}

class PerformanceMeasurement {
  private measurements: Map<string, PerformanceMeasurementData[]> = new Map()
  private activeMeasurements: Map<string, PerformanceMeasurementData> = new Map()

  /**
   * Start measuring a performance operation
   */
  startMeasurement(operation: string, metadata?: Record<string, any>): string {
    const measurementId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const measurement: PerformanceMeasurementData = {
      operation,
      startTime: performance.now(),
      metadata
    }

    this.activeMeasurements.set(measurementId, measurement)
    return measurementId
  }

  /**
   * End a measurement and record the duration
   */
  endMeasurement(measurementId: string): number | null {
    const measurement = this.activeMeasurements.get(measurementId)
    if (!measurement) {
      console.warn(`No active measurement found for ID: ${measurementId}`)
      return null
    }

    measurement.endTime = performance.now()
    measurement.duration = measurement.endTime - measurement.startTime

    // Store completed measurement
    const operation = measurement.operation
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, [])
    }
    this.measurements.get(operation)!.push(measurement)

    // Clean up active measurement
    this.activeMeasurements.delete(measurementId)

    return measurement.duration
  }

  /**
   * Get performance metrics for a specific operation
   */
  getMetrics(operation: string): PerformanceMetrics | null {
    const measurements = this.measurements.get(operation)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const durations = measurements
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)
      .sort((a, b) => a - b)

    if (durations.length === 0) {
      return null
    }

    const sum = durations.reduce((acc, duration) => acc + duration, 0)
    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    return {
      averageDuration: sum / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      totalMeasurements: durations.length,
      p95Duration: durations[p95Index] || durations[durations.length - 1],
      p99Duration: durations[p99Index] || durations[durations.length - 1]
    }
  }

  /**
   * Get all measurements for an operation
   */
  getMeasurements(operation: string): PerformanceMeasurementData[] {
    return this.measurements.get(operation) || []
  }

  /**
   * Clear measurements for an operation or all operations
   */
  clearMeasurements(operation?: string): void {
    if (operation) {
      this.measurements.delete(operation)
    } else {
      this.measurements.clear()
    }
  }

  /**
   * Get a summary of all operations
   */
  getAllMetrics(): Record<string, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {}
    
    for (const operation of this.measurements.keys()) {
      const metrics = this.getMetrics(operation)
      if (metrics) {
        result[operation] = metrics
      }
    }

    return result
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const allMetrics = this.getAllMetrics()
    
    console.group('📊 Performance Summary')
    
    for (const [operation, metrics] of Object.entries(allMetrics)) {
      console.group(`🔍 ${operation}`)
      console.log(`Average: ${metrics.averageDuration.toFixed(2)}ms`)
      console.log(`Min: ${metrics.minDuration.toFixed(2)}ms`)
      console.log(`Max: ${metrics.maxDuration.toFixed(2)}ms`)
      console.log(`P95: ${metrics.p95Duration.toFixed(2)}ms`)
      console.log(`P99: ${metrics.p99Duration.toFixed(2)}ms`)
      console.log(`Total measurements: ${metrics.totalMeasurements}`)
      console.groupEnd()
    }
    
    console.groupEnd()
  }
}

// Global instance for easy access (only in development)
export const performanceMeasurement = import.meta.env.DEV 
  ? new PerformanceMeasurement()
  : ({
      startMeasurement: () => '',
      endMeasurement: () => null,
      getMetrics: () => null,
      getMeasurements: () => [],
      clearMeasurements: () => {},
      getAllMetrics: () => ({}),
      logSummary: () => {}
    } as unknown as PerformanceMeasurement)

// Convenience functions for common chart operations
export const measureChartUpdate = (chartId: string, dataPoints: number) => {
  if (!import.meta.env.DEV) return ''
  return performanceMeasurement.startMeasurement('chart_update', {
    chartId,
    dataPoints,
    timestamp: Date.now()
  })
}

export const measureChartRender = (chartId: string, isInitialRender: boolean) => {
  if (!import.meta.env.DEV) return ''
  return performanceMeasurement.startMeasurement('chart_render', {
    chartId,
    isInitialRender,
    timestamp: Date.now()
  })
}

export const measurePlotlyOperation = (operation: 'newPlot' | 'react' | 'restyle' | 'relayout', chartId: string) => {
  if (!import.meta.env.DEV) return ''
  return performanceMeasurement.startMeasurement(`plotly_${operation}`, {
    chartId,
    timestamp: Date.now()
  })
}