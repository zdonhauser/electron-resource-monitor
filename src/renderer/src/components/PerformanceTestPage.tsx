import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCpuData } from '../app/telemetrySlice'
import CpuWidget from '../features/telemetry/CpuWidget'
import PerformanceMonitor from './PerformanceMonitor'
import { performanceMeasurement } from '../utils/PerformanceMeasurement'

/**
 * Test page for measuring performance using real telemetry data
 * 
 * NOTE: This component is only available in development mode.
 * It will not be included in production builds.
 */
const PerformanceTestPage: React.FC = () => {
  const cpuData = useSelector(selectCpuData)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [showMonitor, setShowMonitor] = useState(true)

  // No mock data generation - we only use real telemetry data

  const handleStartMonitoring = () => {
    setIsMonitoring(true)
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
  }

  const handleClearMetrics = () => {
    performanceMeasurement.clearMeasurements()
  }

  const handleExportMetrics = () => {
    const metrics = performanceMeasurement.getAllMetrics()
    const dataStr = JSON.stringify(metrics, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `performance-metrics-${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Performance Testing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This page measures chart performance using real telemetry data.
          Start monitoring to begin collecting performance metrics.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Performance Monitoring Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-end">
            <button
              onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
              className={`px-4 py-2 rounded-md font-medium ${
                isMonitoring
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleClearMetrics}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium"
            >
              Clear Metrics
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleExportMetrics}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
            >
              Export Metrics
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showMonitor}
              onChange={(e) => setShowMonitor(e.target.checked)}
              className="mr-2"
            />
            Show Performance Monitor
          </label>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Telemetry Data Points: {cpuData.length}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Monitoring: {isMonitoring ? '🟢 Active' : '🔴 Stopped'}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Data Source: Real Telemetry (250ms sampling)
          </div>
        </div>
      </div>

      {/* Test Widget */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">CPU Widget (Optimized with Plotly.react)</h2>
        <CpuWidget />
      </div>

      {/* Performance Monitor */}
      <PerformanceMonitor 
        isVisible={showMonitor} 
        autoLog={true} 
        logInterval={5000} 
      />

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How to Use
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
          <li>Click "Start Monitoring" to begin collecting performance metrics</li>
          <li>Let it run for 30-60 seconds to collect data</li>
          <li>Watch the real-time performance metrics in the floating panel</li>
          <li>Click "Export Metrics" to save measurements</li>
          <li>The CPU widget above uses the optimized Plotly.react implementation</li>
        </ol>
      </div>
    </div>
  )
}

export default PerformanceTestPage