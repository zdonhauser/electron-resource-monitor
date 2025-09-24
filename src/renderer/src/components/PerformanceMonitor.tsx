import React, { useState, useEffect } from 'react'
import { performanceMeasurement } from '../utils/PerformanceMeasurement'

interface PerformanceMonitorProps {
  isVisible?: boolean
  autoLog?: boolean
  logInterval?: number
}

/**
 * Development component to monitor and display performance metrics
 * This helps us track improvements from optimizations
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible = false,
  autoLog = false,
  logInterval = 10000 // 10 seconds
}) => {
  const [metrics, setMetrics] = useState<Record<string, any>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!autoLog) return

    const interval = setInterval(() => {
      const allMetrics = performanceMeasurement.getAllMetrics()
      setMetrics(allMetrics)
      
      if (Object.keys(allMetrics).length > 0) {
        console.log('📊 Performance Update:', allMetrics)
      }
    }, logInterval)

    return () => clearInterval(interval)
  }, [autoLog, logInterval])

  const handleRefresh = () => {
    const allMetrics = performanceMeasurement.getAllMetrics()
    setMetrics(allMetrics)
  }

  const handleClear = () => {
    performanceMeasurement.clearMeasurements()
    setMetrics({})
  }

  const handleLogToConsole = () => {
    performanceMeasurement.logSummary()
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-w-md">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Performance Monitor
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 max-h-96 overflow-y-auto">
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleRefresh}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Refresh
            </button>
            <button
              onClick={handleClear}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear
            </button>
            <button
              onClick={handleLogToConsole}
              className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Log to Console
            </button>
          </div>

          {Object.keys(metrics).length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No performance data available
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(metrics).map(([operation, data]: [string, any]) => (
                <div key={operation} className="border border-gray-200 dark:border-gray-600 rounded p-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {operation}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Avg: {data.averageDuration?.toFixed(2)}ms</div>
                    <div>Min: {data.minDuration?.toFixed(2)}ms</div>
                    <div>Max: {data.maxDuration?.toFixed(2)}ms</div>
                    <div>P95: {data.p95Duration?.toFixed(2)}ms</div>
                    <div>Count: {data.totalMeasurements}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PerformanceMonitor