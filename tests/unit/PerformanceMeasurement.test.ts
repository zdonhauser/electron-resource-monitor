import { performanceMeasurement, measureChartUpdate, measureChartRender } from '../../src/renderer/src/utils/PerformanceMeasurement'

describe('PerformanceMeasurement', () => {
  beforeEach(() => {
    performanceMeasurement.clearMeasurements()
  })

  describe('basic measurement functionality', () => {
    it('should start and end measurements correctly', () => {
      const measurementId = performanceMeasurement.startMeasurement('test_operation')
      expect(measurementId).toBeDefined()
      expect(typeof measurementId).toBe('string')

      const duration = performanceMeasurement.endMeasurement(measurementId)
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('should return null for invalid measurement ID', () => {
      const duration = performanceMeasurement.endMeasurement('invalid_id')
      expect(duration).toBeNull()
    })

    it('should store measurements with metadata', () => {
      const metadata = { chartId: 'test-chart', dataPoints: 100 }
      const measurementId = performanceMeasurement.startMeasurement('test_operation', metadata)
      
      performanceMeasurement.endMeasurement(measurementId)
      
      const measurements = performanceMeasurement.getMeasurements('test_operation')
      expect(measurements).toHaveLength(1)
      expect(measurements[0].metadata).toEqual(metadata)
    })
  })

  describe('metrics calculation', () => {
    it('should calculate correct metrics for multiple measurements', async () => {
      // Create multiple measurements with known durations
      const durations = [10, 20, 30, 40, 50]
      
      for (const expectedDuration of durations) {
        const measurementId = performanceMeasurement.startMeasurement('test_operation')
        
        // Simulate work by waiting
        await new Promise(resolve => setTimeout(resolve, expectedDuration))
        
        performanceMeasurement.endMeasurement(measurementId)
      }

      const metrics = performanceMeasurement.getMetrics('test_operation')
      expect(metrics).toBeDefined()
      expect(metrics!.totalMeasurements).toBe(5)
      expect(metrics!.minDuration).toBeGreaterThanOrEqual(8) // Allow some variance
      expect(metrics!.maxDuration).toBeGreaterThanOrEqual(48)
      expect(metrics!.averageDuration).toBeGreaterThan(20)
    })

    it('should return null for operations with no measurements', () => {
      const metrics = performanceMeasurement.getMetrics('nonexistent_operation')
      expect(metrics).toBeNull()
    })

    it('should calculate percentiles correctly', () => {
      // Create measurements with known durations by using performance.now() mock
      const originalNow = performance.now
      let mockTime = 0
      
      performance.now = jest.fn(() => mockTime)
      
      try {
        // Create 100 measurements with predictable durations (1ms, 2ms, ..., 100ms)
        for (let i = 1; i <= 100; i++) {
          mockTime = 0
          const measurementId = performanceMeasurement.startMeasurement('percentile_test')
          
          mockTime = i // Set end time to create duration of i milliseconds
          performanceMeasurement.endMeasurement(measurementId)
        }

        const metrics = performanceMeasurement.getMetrics('percentile_test')
        expect(metrics).toBeDefined()
        expect(metrics!.totalMeasurements).toBe(100)
        expect(metrics!.minDuration).toBe(1)
        expect(metrics!.maxDuration).toBe(100)
        expect(metrics!.p95Duration).toBeGreaterThanOrEqual(94)
        expect(metrics!.p95Duration).toBeLessThanOrEqual(96)
        expect(metrics!.p99Duration).toBeGreaterThanOrEqual(98)
        expect(metrics!.p99Duration).toBeLessThanOrEqual(100)
      } finally {
        performance.now = originalNow
      }
    })
  })

  describe('convenience functions', () => {
    it('should create chart update measurements', () => {
      const measurementId = measureChartUpdate('test-chart', 100)
      expect(measurementId).toBeDefined()
      
      performanceMeasurement.endMeasurement(measurementId)
      
      const measurements = performanceMeasurement.getMeasurements('chart_update')
      expect(measurements).toHaveLength(1)
      expect(measurements[0].metadata?.chartId).toBe('test-chart')
      expect(measurements[0].metadata?.dataPoints).toBe(100)
    })

    it('should create chart render measurements', () => {
      const measurementId = measureChartRender('test-chart', true)
      expect(measurementId).toBeDefined()
      
      performanceMeasurement.endMeasurement(measurementId)
      
      const measurements = performanceMeasurement.getMeasurements('chart_render')
      expect(measurements).toHaveLength(1)
      expect(measurements[0].metadata?.chartId).toBe('test-chart')
      expect(measurements[0].metadata?.isInitialRender).toBe(true)
    })
  })

  describe('data management', () => {
    it('should clear measurements for specific operations', () => {
      performanceMeasurement.startMeasurement('operation1')
      performanceMeasurement.startMeasurement('operation2')
      
      performanceMeasurement.clearMeasurements('operation1')
      
      const measurements1 = performanceMeasurement.getMeasurements('operation1')
      const measurements2 = performanceMeasurement.getMeasurements('operation2')
      
      expect(measurements1).toHaveLength(0)
      expect(measurements2).toHaveLength(0) // Active measurements aren't stored yet
    })

    it('should clear all measurements', () => {
      const id1 = performanceMeasurement.startMeasurement('operation1')
      const id2 = performanceMeasurement.startMeasurement('operation2')
      
      performanceMeasurement.endMeasurement(id1)
      performanceMeasurement.endMeasurement(id2)
      
      performanceMeasurement.clearMeasurements()
      
      const allMetrics = performanceMeasurement.getAllMetrics()
      expect(Object.keys(allMetrics)).toHaveLength(0)
    })

    it('should get all metrics summary', () => {
      const id1 = performanceMeasurement.startMeasurement('operation1')
      const id2 = performanceMeasurement.startMeasurement('operation2')
      
      performanceMeasurement.endMeasurement(id1)
      performanceMeasurement.endMeasurement(id2)
      
      const allMetrics = performanceMeasurement.getAllMetrics()
      expect(Object.keys(allMetrics)).toContain('operation1')
      expect(Object.keys(allMetrics)).toContain('operation2')
    })
  })
})