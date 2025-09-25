import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Plotly from 'plotly.js-basic-dist-min'

import { selectMemoryData, selectLatestMemory } from '../../app/telemetrySlice'
import { measurePlotlyOperation, performanceMeasurement } from '../../utils/PerformanceMeasurement'

const MAX_DATA_POINTS = 240 // 60 seconds at 250ms intervals

const MemoryWidget: React.FC = React.memo(() => {
  const memoryData = useSelector(selectMemoryData)
  const latestMemory = useSelector(selectLatestMemory)
  const plotRef = useRef<HTMLDivElement>(null)


  // Initialize chart once with empty data
  useEffect(() => {
    if (!plotRef.current) return

    const initialData = [
      {
        x: [],
        y: [],
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Used',
        line: { color: '#10B981', width: 2 },
        fill: 'tozeroy' as const,
        fillcolor: 'rgba(16, 185, 129, 0.2)'
      },
      {
        x: [],
        y: [],
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Free',
        line: { color: '#6B7280', width: 1, dash: 'dot' as const },
        visible: 'legendonly' as const
      }
    ]

    const layout = {
      autosize: true,
      height: 200,
      margin: { t: 10, r: 10, b: 30, l: 40 },
      xaxis: {
        type: 'date' as const,
        title: { text: '' },
        showgrid: false,
        tickformat: '%H:%M:%S'
      },
      yaxis: {
        title: { text: 'Memory (GB)' },
        range: [0, 16], // Default range, will be updated
        showgrid: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'transparent',
        font: { size: 9 }
      }
    }

    const config = {
      displayModeBar: false,
      responsive: true
    }

    // Initialize once with newPlot
    Plotly.newPlot(plotRef.current, initialData, layout, config)

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current)
      }
    }
  }, [])

  // Update chart data using Plotly.react (optimized!)
  useEffect(() => {
    if (!plotRef.current || memoryData.length === 0) return

    // Take only the last MAX_DATA_POINTS
    const displayData = memoryData.slice(-MAX_DATA_POINTS)
    const totalGB = latestMemory ? latestMemory.total / (1024 * 1024 * 1024) : 16

    const updatedData = [
      {
        x: displayData.map(d => d.timestamp),
        y: displayData.map(d => d.used / (1024 * 1024 * 1024)),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Used',
        line: { color: '#10B981', width: 2 },
        fill: 'tozeroy' as const,
        fillcolor: 'rgba(16, 185, 129, 0.2)'
      },
      {
        x: displayData.map(d => d.timestamp),
        y: displayData.map(d => d.free / (1024 * 1024 * 1024)),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Free',
        line: { color: '#6B7280', width: 1, dash: 'dot' as const },
        visible: 'legendonly' as const
      }
    ]

    const layout = {
      autosize: true,
      height: 200,
      margin: { t: 10, r: 10, b: 30, l: 40 },
      xaxis: {
        type: 'date' as const,
        title: { text: '' },
        showgrid: false,
        tickformat: '%H:%M:%S'
      },
      yaxis: {
        title: { text: 'Memory (GB)' },
        range: [0, totalGB],
        showgrid: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10 },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: 'transparent',
        font: { size: 9 }
      }
    }

    const config = {
      displayModeBar: false,
      responsive: true
    }

    // Use Plotly.react for efficient updates
    const plotlyMeasurementId = measurePlotlyOperation('react', 'memory-widget')

    Plotly.react(plotRef.current, updatedData, layout, config).then(() => {
      performanceMeasurement.endMeasurement(plotlyMeasurementId)
    }).catch((error) => {
      console.error('Plotly.react failed:', error)
      performanceMeasurement.endMeasurement(plotlyMeasurementId)
    })
  }, [memoryData, latestMemory])

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
  }

  const getUsagePercentage = (used: number, total: number) => (used / total) * 100

  return (
    <div className="card" data-testid="memory-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Memory Usage</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">{memoryData.length} samples</div>
      </div>

      {latestMemory ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Usage
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="memory-usage-percent">
              {getUsagePercentage(latestMemory.used, latestMemory.total).toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3" data-testid="memory-progress-bar">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getUsagePercentage(latestMemory.used, latestMemory.total)}%` }}
            ></div>
          </div>

          <div ref={plotRef} className="w-full" style={{ height: '200px' }} />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div data-testid="memory-total">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="ml-1 font-medium">{formatBytes(latestMemory.total)}</span>
            </div>
            <div data-testid="memory-used">
              <span className="text-gray-600 dark:text-gray-400">Used:</span>
              <span className="ml-1 font-medium">{formatBytes(latestMemory.used)}</span>
            </div>
            <div data-testid="memory-free">
              <span className="text-gray-600 dark:text-gray-400">Free:</span>
              <span className="ml-1 font-medium">{formatBytes(latestMemory.free)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Available:</span>
              <span className="ml-1 font-medium">{formatBytes(latestMemory.available)}</span>
            </div>
          </div>

          {latestMemory.swapTotal && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Swap</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="ml-1 font-medium">{formatBytes(latestMemory.swapTotal)}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span className="ml-1 font-medium">
                    {formatBytes(latestMemory.swapUsed || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(latestMemory.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          Waiting for memory data...
        </div>
      )}
    </div>
  )
})

export default MemoryWidget
