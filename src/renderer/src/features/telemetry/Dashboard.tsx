import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import CpuWidget from './CpuWidget'
import MemoryWidget from './MemoryWidget'
import DiskWidget from './DiskWidget'
import NetworkWidget from './NetworkWidget'
import ProcessWidget from './ProcessWidget'

const Dashboard: React.FC = () => {
  const { isConnected, isSampling } = useSelector((state: RootState) => state.telemetry)
  const sidebarCollapsed = useSelector((state: RootState) => state.layout.sidebarCollapsed)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4">
          <h1 className={`font-bold text-xl ${sidebarCollapsed ? 'hidden' : 'block'}`}>
            Resource Monitor
          </h1>
        </div>
        <nav className="mt-8">
          <a href="#" className="block py-2 px-4 hover:bg-gray-700" data-testid="dashboard-nav">
            {sidebarCollapsed ? '📊' : '📊 Dashboard'}
          </a>
          <a href="#/settings" className="block py-2 px-4 hover:bg-gray-700" data-testid="settings-nav">
            {sidebarCollapsed ? '⚙️' : '⚙️ Settings'}
          </a>
          <a href="#/alerts" className="block py-2 px-4 hover:bg-gray-700" data-testid="alerts-nav">
            {sidebarCollapsed ? '🔔' : '🔔 Alerts'}
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold">System Dashboard</h2>
              <div className="flex items-center space-x-2" data-testid="connection-status">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {isSampling && (
                  <span className="text-sm text-blue-600 dark:text-blue-400">Sampling...</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CpuWidget />
            <MemoryWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DiskWidget />
            <NetworkWidget />
          </div>

          <div className="mt-6">
            <ProcessWidget />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
