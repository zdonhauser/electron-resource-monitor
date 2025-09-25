import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Plotly from 'plotly.js-basic-dist-min'
import { selectCpuData, selectLatestCpu } from '../../app/telemetrySlice'
import { measurePlotlyOperation, performanceMeasurement } from '../../utils/PerformanceMeasurement'
import { usePerformanceBaseline } from '../../hooks/usePerformanceBaseline'

const MAX_DATA_POINTS = 240 // 60 seconds at 250ms intervals

const CpuWidget: React.FC = React.memo(() => {
  const cpuData = useSelector(selectCpuData)
  const latestCpu = useSelector(selectLatestCpu)
  const plotRef = useRef<HTMLDivElement>(null)

  // Add performance measurement
  const { logMetrics } = usePerformanceBaseline('cpu-widget', cpuData.length, true)



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
      title: { text: 'Usage (%)' },
      range: [0, 100],
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)'
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { size: 10 }
  }

  const config = {
    displayModeBar: false,
    responsive: true
  }


  // Initialize chart once with empty data
  useEffect(() => {
    if (!plotRef.current) return

    const initialData = [{
      x: [],
      y: [],
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'CPU Usage',
      line: { color: '#3B82F6', width: 2 },
      fill: 'tozeroy' as const,
      fillcolor: 'rgba(59, 130, 246, 0.2)'
    }]

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
    if (!plotRef.current || cpuData.length === 0) return

    // Take only the last MAX_DATA_POINTS
    const displayData = cpuData.slice(-MAX_DATA_POINTS)

    const updatedData = [{
      x: displayData.map(d => d.timestamp),
      y: displayData.map(d => d.usage),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'CPU Usage',
      line: { color: '#3B82F6', width: 2 },
      fill: 'tozeroy' as const,
      fillcolor: 'rgba(59, 130, 246, 0.2)'
    }]

    // Use Plotly.react for efficient updates - pass layout and config for consistency
    const plotlyMeasurementId = measurePlotlyOperation('react', 'cpu-widget')

    Plotly.react(plotRef.current, updatedData, layout, config).then(() => {
      performanceMeasurement.endMeasurement(plotlyMeasurementId)
    }).catch((error) => {
      console.error('Plotly.react failed:', error)
      performanceMeasurement.endMeasurement(plotlyMeasurementId)
    })
  }, [cpuData])

  const formatUsage = (usage: number) => `${usage.toFixed(1)}%`
  const formatLoadAverage = (loadAvg: [number, number, number]) =>
    `${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}`

  return (
    <div className="card" data-testid="cpu-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CPU Usage</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">{cpuData.length} samples</div>
          <button
            onClick={logMetrics}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Log performance metrics to console"
          >
            📊
          </button>
        </div>
      </div>

      {latestCpu ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Usage
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="cpu-usage-percent">
              {formatUsage(latestCpu.usage)}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3" data-testid="cpu-progress-bar">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${latestCpu.usage}%` }}
            ></div>
          </div>

          <div ref={plotRef} className="w-full" style={{ height: '200px' }} />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div data-testid="cpu-cores">
              <span className="text-gray-600 dark:text-gray-400">Cores:</span>
              <span className="ml-1 font-medium">{latestCpu.cores}</span>
            </div>
            <div data-testid="cpu-load-average">
              <span className="text-gray-600 dark:text-gray-400">Load Avg:</span>
              <span className="ml-1 font-medium">{formatLoadAverage(latestCpu.loadAverage)}</span>
            </div>
          </div>

          {latestCpu.temperature && (
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
              <span className="ml-1 font-medium">{latestCpu.temperature.toFixed(1)}°C</span>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(latestCpu.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          Waiting for CPU data...
        </div>
      )}
    </div>
  )
})

export default CpuWidget
