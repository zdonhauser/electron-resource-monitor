import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Plotly from 'plotly.js-basic-dist-min'

import { selectNetworkData, selectLatestNetwork } from '../../app/telemetrySlice'
import type { NetworkInterface } from '@shared/types/telemetry'
import { measurePlotlyOperation, performanceMeasurement } from '../../utils/PerformanceMeasurement'

const MAX_DATA_POINTS = 240 // 4 minutes at 1 second intervals

const NetworkWidget: React.FC = React.memo(() => {
  const networkData = useSelector(selectNetworkData)
  const latestNetwork = useSelector(selectLatestNetwork)
  const plotRef = useRef<HTMLDivElement>(null)




  const formatTotalBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  // Calculate rates from cumulative data
  const calculateRates = () => {
    if (networkData.length < 2) return { rxRates: [], txRates: [], timestamps: [] }

    const displayData = networkData.slice(-MAX_DATA_POINTS)
    const rxRates: number[] = []
    const txRates: number[] = []
    const timestamps: number[] = []

    // Get the main interface (usually the one with most traffic)
    const mainInterface = latestNetwork?.interfaces.find(iface =>
      !iface.name.includes('lo') && !iface.name.includes('awdl') && iface.bytesReceived > 0
    ) || latestNetwork?.interfaces[0]

    if (!mainInterface) return { rxRates: [], txRates: [], timestamps: [] }

    for (let i = 1; i < displayData.length; i++) {
      const current = displayData[i].interfaces.find(iface => iface.name === mainInterface.name)
      const previous = displayData[i - 1].interfaces.find(iface => iface.name === mainInterface.name)

      if (current && previous) {
        const timeDiff = (displayData[i].timestamp - displayData[i - 1].timestamp) / 1000 // seconds
        const rxRate = Math.max(0, (current.bytesReceived - previous.bytesReceived) / timeDiff)
        const txRate = Math.max(0, (current.bytesSent - previous.bytesSent) / timeDiff)

        rxRates.push(rxRate)
        txRates.push(txRate)
        timestamps.push(displayData[i].timestamp)
      }
    }

    return { rxRates, txRates, timestamps }
  }

  // Initialize chart once with empty data
  useEffect(() => {
    if (!plotRef.current) return

    const initialData = [
      {
        x: [],
        y: [],
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Download',
        line: { color: '#10B981', width: 2 },
        yaxis: 'y'
      },
      {
        x: [],
        y: [],
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Upload',
        line: { color: '#F59E0B', width: 2 },
        yaxis: 'y'
      }
    ]

    const layout = {
      autosize: true,
      height: 200,
      margin: { t: 10, r: 10, b: 30, l: 50 },
      xaxis: {
        type: 'date' as const,
        title: { text: '' },
        showgrid: false,
        tickformat: '%H:%M:%S'
      },
      yaxis: {
        title: { text: 'Speed (KB/s)' },
        showgrid: true,
        gridcolor: 'rgba(0,0,0,0.1)',
        rangemode: 'tozero' as const
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10 },
      legend: {
        x: 1,
        xanchor: 'right' as const,
        y: 1,
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h' as const
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
    if (!plotRef.current || networkData.length === 0) return

    const { rxRates, txRates, timestamps } = calculateRates()

    if (timestamps.length === 0) return

    const updatedData = [
      {
        x: timestamps,
        y: rxRates.map(rate => rate / 1024), // Convert to KB/s
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Download',
        line: { color: '#10B981', width: 2 },
        yaxis: 'y'
      },
      {
        x: timestamps,
        y: txRates.map(rate => rate / 1024), // Convert to KB/s
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: 'Upload',
        line: { color: '#F59E0B', width: 2 },
        yaxis: 'y'
      }
    ]

    const layout = {
      autosize: true,
      height: 200,
      margin: { t: 10, r: 10, b: 30, l: 50 },
      xaxis: {
        type: 'date' as const,
        title: { text: '' },
        showgrid: false,
        tickformat: '%H:%M:%S'
      },
      yaxis: {
        title: { text: 'Speed (KB/s)' },
        showgrid: true,
        gridcolor: 'rgba(0,0,0,0.1)',
        rangemode: 'tozero' as const
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { size: 10 },
      legend: {
        x: 1,
        xanchor: 'right' as const,
        y: 1,
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h' as const
      }
    }

    const config = {
      displayModeBar: false,
      responsive: true
    }

    // Use Plotly.react for efficient updates
    const plotlyMeasurementId = measurePlotlyOperation('react', 'network-widget')

    Plotly.react(plotRef.current, updatedData, layout, config).then(() => {
      performanceMeasurement.endMeasurement(plotlyMeasurementId)
    }).catch((error) => {
      console.error('Plotly.react failed:', error)
      performanceMeasurement.endMeasurement(plotlyMeasurementId)
    })
  }, [networkData])

  const getMainInterface = (): NetworkInterface | null => {
    if (!latestNetwork?.interfaces.length) return null

    // Find the main network interface (not loopback, has traffic)
    return latestNetwork.interfaces.find(iface =>
      !iface.name.includes('lo') &&
      !iface.name.includes('awdl') &&
      (iface.bytesReceived > 0 || iface.bytesSent > 0)
    ) || latestNetwork.interfaces[0]
  }

  const mainInterface = getMainInterface()

  return (
    <div className="card" data-testid="network-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Traffic</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">{networkData.length} samples</div>
      </div>

      {mainInterface ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Interface: {mainInterface.name}
            </span>
          </div>

          <div ref={plotRef} className="w-full" style={{ height: '200px' }} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                📥 Downloaded
              </div>
              <div className="text-lg font-bold" data-testid="bytes-received">
                {formatTotalBytes(mainInterface.bytesReceived)}
              </div>
              <div className="text-xs text-gray-500" data-testid="packets-received">
                {mainInterface.packetsReceived.toLocaleString()} packets
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                📤 Uploaded
              </div>
              <div className="text-lg font-bold" data-testid="bytes-sent">
                {formatTotalBytes(mainInterface.bytesSent)}
              </div>
              <div className="text-xs text-gray-500" data-testid="packets-sent">
                {mainInterface.packetsSent.toLocaleString()} packets
              </div>
            </div>
          </div>

          {(mainInterface.errorIn > 0 || mainInterface.errorOut > 0) && (
            <div className="grid grid-cols-2 gap-4 text-sm text-red-600 dark:text-red-400">
              <div data-testid="errors-in">Errors In: {mainInterface.errorIn}</div>
              <div data-testid="errors-out">Errors Out: {mainInterface.errorOut}</div>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(latestNetwork?.timestamp || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          {networkData.length === 0 ? 'Waiting for network data...' : 'No network interfaces found'}
        </div>
      )}
    </div>
  )
})

export default NetworkWidget