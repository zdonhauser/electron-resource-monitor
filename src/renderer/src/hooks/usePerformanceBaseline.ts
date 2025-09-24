import { useEffect, useRef } from 'react'
import { performanceMeasurement } from '../utils/PerformanceMeasurement'

/**
 * Hook to measure baseline performance of chart components
 * This will help us quantify improvements from optimizations
 */
export const usePerformanceBaseline = (
  chartId: string,
  dataLength: number,
  isEnabled: boolean = true
) => {
  const renderStartRef = useRef<string | null>(null)
  const updateStartRef = useRef<string | null>(null)
  const lastDataLengthRef = useRef<number>(0)

  // Only measure in development mode
  const shouldMeasure = import.meta.env.DEV && isEnabled

  // Measure component render time
  useEffect(() => {
    if (!shouldMeasure) return

    renderStartRef.current = performanceMeasurement.startMeasurement('component_render', {
      chartId,
      dataLength,
      isInitialRender: lastDataLengthRef.current === 0
    })

    return () => {
      if (renderStartRef.current) {
        performanceMeasurement.endMeasurement(renderStartRef.current)
        renderStartRef.current = null
      }
    }
  })

  // Measure data update performance
  useEffect(() => {
    if (!shouldMeasure || dataLength === lastDataLengthRef.current) return

    if (updateStartRef.current) {
      performanceMeasurement.endMeasurement(updateStartRef.current)
    }

    updateStartRef.current = performanceMeasurement.startMeasurement('data_update', {
      chartId,
      previousLength: lastDataLengthRef.current,
      newLength: dataLength,
      isNewData: dataLength > lastDataLengthRef.current
    })

    lastDataLengthRef.current = dataLength

    // End measurement on next tick to capture the full update cycle
    const timeoutId = setTimeout(() => {
      if (updateStartRef.current) {
        performanceMeasurement.endMeasurement(updateStartRef.current)
        updateStartRef.current = null
      }
    }, 0)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [dataLength, chartId, shouldMeasure])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderStartRef.current) {
        performanceMeasurement.endMeasurement(renderStartRef.current)
      }
      if (updateStartRef.current) {
        performanceMeasurement.endMeasurement(updateStartRef.current)
      }
    }
  }, [])

  return {
    logMetrics: () => performanceMeasurement.logSummary(),
    getMetrics: (operation: string) => performanceMeasurement.getMetrics(operation),
    clearMetrics: () => performanceMeasurement.clearMeasurements()
  }
}