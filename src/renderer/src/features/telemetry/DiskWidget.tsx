import React from 'react'
import { useSelector } from 'react-redux'
import { selectDiskData, selectLatestDisk } from '../../app/telemetrySlice'
import type { DiskDevice } from '@shared/types/telemetry'

const DiskWidget: React.FC = React.memo(() => {
  const diskData = useSelector(selectDiskData)
  const latestDisk = useSelector(selectLatestDisk)

  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUsageTextColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getFriendlyName = (device: DiskDevice): string => {
    if (device.mount === '/') {
      // Try to get a more descriptive name from the device path
      if (device.name.includes('disk')) {
        return 'Internal SSD' // Most Macs have SSDs as main drives
      }
      return 'Main Drive'
    }
    if (device.mount.startsWith('/Volumes/')) {
      const volumeName = device.mount.replace('/Volumes/', '')
      return volumeName || 'External Drive'
    }
    return device.mount
  }

  const getDiskType = (device: DiskDevice): string => {
    if (device.mount === '/') return '💾 Internal Storage'
    if (device.mount.startsWith('/Volumes/')) return '🔌 External Drive'
    return '💿 Storage'
  }

  return (
    <div className="card" data-testid="disk-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">{diskData.length} samples</div>
      </div>

      {latestDisk && latestDisk.devices.length > 0 ? (
        <div className="space-y-4">
          {latestDisk.devices.map((device: DiskDevice) => (
            <div key={device.name} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white" data-testid="disk-device-name">
                      {getFriendlyName(device)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                      {getDiskType(device)}
                    </span>
                  </div>
                  {device.mount !== '/' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="disk-mount-point">
                      {device.mount}
                    </span>
                  )}
                </div>
                <span className={`text-lg font-bold ${getUsageTextColor(device.percentage)}`} data-testid="disk-usage-percent">
                  {device.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2" data-testid="disk-progress-bar">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getUsageColor(device.percentage)}`}
                  style={{ width: `${device.percentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div data-testid="disk-used">
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span className="ml-1 font-medium">{formatBytes(device.used)}</span>
                </div>
                <div data-testid="disk-free">
                  <span className="text-gray-600 dark:text-gray-400">Free:</span>
                  <span className="ml-1 font-medium">{formatBytes(device.free)}</span>
                </div>
                <div data-testid="disk-total">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="ml-1 font-medium">{formatBytes(device.total)}</span>
                </div>
              </div>

            </div>
          ))}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(latestDisk.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          {diskData.length === 0 ? 'Waiting for disk data...' : 'No disk devices found'}
        </div>
      )}
    </div>
  )
})

export default DiskWidget