import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectProcessData, selectLatestProcess } from '../../app/telemetrySlice'
import type { ProcessInfo } from '@shared/types/telemetry'

type SortField = 'cpu' | 'memory' | 'name' | 'pid'
type SortOrder = 'asc' | 'desc'

const ProcessWidget: React.FC = React.memo(() => {
  const processData = useSelector(selectProcessData)
  const latestProcess = useSelector(selectLatestProcess)
  const [sortField, setSortField] = useState<SortField>('cpu')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const filteredAndSortedProcesses = React.useMemo(() => {
    if (!latestProcess?.processes) return []

    let processes = latestProcess.processes.filter((process: ProcessInfo) =>
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.pid.toString().includes(searchTerm)
    )

    processes.sort((a: ProcessInfo, b: ProcessInfo) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (sortField === 'name') {
        aValue = (aValue as string).toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return processes.slice(0, 20) // Show top 20 processes
  }, [latestProcess?.processes, sortField, sortOrder, searchTerm])

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    return sortOrder === 'asc' ? '↗️' : '↘️'
  }

  const getStatusColor = (status?: string) => {
    switch (status?.charAt(0)?.toUpperCase()) {
      case 'R': return 'text-green-600 dark:text-green-400' // Running
      case 'S': return 'text-blue-600 dark:text-blue-400'   // Sleeping
      case 'Z': return 'text-red-600 dark:text-red-400'     // Zombie
      case 'T': return 'text-yellow-600 dark:text-yellow-400' // Stopped
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status?: string) => {
    const char = status?.charAt(0)?.toUpperCase()
    switch (char) {
      case 'R': return 'Run'
      case 'S': return 'Sleep'
      case 'Z': return 'Zombie'
      case 'T': return 'Stop'
      default: return status || 'Unknown'
    }
  }

  return (
    <div className="card" data-testid="process-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Processes</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">{processData.length} samples</div>
      </div>

      {latestProcess ? (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center" data-testid="total-processes">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{latestProcess.total}</div>
              <div className="text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center" data-testid="running-processes">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{latestProcess.running}</div>
              <div className="text-gray-600 dark:text-gray-400">Running</div>
            </div>
            <div className="text-center" data-testid="sleeping-processes">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{latestProcess.sleeping}</div>
              <div className="text-gray-600 dark:text-gray-400">Sleeping</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="process-search"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              🔍
            </div>
          </div>

          {/* Process Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th
                    className="text-left py-2 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('pid')}
                    data-testid="sort-pid"
                  >
                    PID {getSortIcon('pid')}
                  </th>
                  <th
                    className="text-left py-2 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('name')}
                    data-testid="sort-name"
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th
                    className="text-right py-2 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('cpu')}
                    data-testid="sort-cpu"
                  >
                    CPU% {getSortIcon('cpu')}
                  </th>
                  <th
                    className="text-right py-2 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('memory')}
                    data-testid="sort-memory"
                  >
                    Mem% {getSortIcon('memory')}
                  </th>
                  <th className="text-center py-2 px-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedProcesses.map((process: ProcessInfo, index: number) => (
                  <tr
                    key={`${process.pid}-${index}`}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    data-testid="process-row"
                  >
                    <td className="py-1 px-1 font-mono text-gray-600 dark:text-gray-400" data-testid="process-pid">
                      {process.pid}
                    </td>
                    <td className="py-1 px-1 max-w-32 truncate font-medium" title={process.name} data-testid="process-name">
                      {process.name}
                    </td>
                    <td className="py-1 px-1 text-right font-mono" data-testid="process-cpu">
                      <span className={process.cpu > 50 ? 'text-red-600 dark:text-red-400 font-bold' :
                                     process.cpu > 10 ? 'text-yellow-600 dark:text-yellow-400' :
                                     'text-gray-900 dark:text-white'}>
                        {process.cpu.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-1 px-1 text-right font-mono" data-testid="process-memory">
                      <span className={process.memory > 10 ? 'text-red-600 dark:text-red-400 font-bold' :
                                     process.memory > 5 ? 'text-yellow-600 dark:text-yellow-400' :
                                     'text-gray-900 dark:text-white'}>
                        {process.memory.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-1 px-1 text-center" data-testid="process-status">
                      <span className={`text-xs font-medium ${getStatusColor(process.status)}`}>
                        {getStatusLabel(process.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedProcesses.length === 0 && searchTerm && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No processes match "{searchTerm}"
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(latestProcess.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          {processData.length === 0 ? 'Waiting for process data...' : 'No process data available'}
        </div>
      )}
    </div>
  )
})

export default ProcessWidget