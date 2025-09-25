import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import type { RootState } from '../app/store'
import { toggleSidebar } from '../app/layoutSlice'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch()
  const { isConnected, isSampling } = useSelector((state: RootState) => state.telemetry)
  const sidebarCollapsed = useSelector((state: RootState) => state.layout.sidebarCollapsed)
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'System Dashboard'
      case '/settings':
        return 'Settings'
      case '/alerts':
        return 'Alerts'
      case '/performance-test':
        return 'Performance Test'
      default:
        return 'Resource Monitor'
    }
  }

  const isActiveRoute = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

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
          <Link 
            to="/" 
            className={`block py-2 px-4 hover:bg-gray-700 ${
              isActiveRoute('/') ? 'bg-gray-700 border-r-2 border-blue-500' : ''
            }`}
            data-testid="dashboard-nav"
          >
            {sidebarCollapsed ? '📊' : '📊 Dashboard'}
          </Link>
          <Link 
            to="/settings" 
            className={`block py-2 px-4 hover:bg-gray-700 ${
              isActiveRoute('/settings') ? 'bg-gray-700 border-r-2 border-blue-500' : ''
            }`}
            data-testid="settings-nav"
          >
            {sidebarCollapsed ? '⚙️' : '⚙️ Settings'}
          </Link>
          <Link 
            to="/alerts" 
            className={`block py-2 px-4 hover:bg-gray-700 ${
              isActiveRoute('/alerts') ? 'bg-gray-700 border-r-2 border-blue-500' : ''
            }`}
            data-testid="alerts-nav"
          >
            {sidebarCollapsed ? '🔔' : '🔔 Alerts'}
          </Link>
          {/* Performance test link only in development */}
          {import.meta.env.DEV && (
            <Link 
              to="/performance-test" 
              className={`block py-2 px-4 hover:bg-gray-700 ${
                isActiveRoute('/performance-test') ? 'bg-gray-700 border-r-2 border-blue-500' : ''
              }`}
              data-testid="performance-nav"
            >
              {sidebarCollapsed ? '🚀' : '🚀 Performance Test'}
            </Link>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                data-testid="sidebar-toggle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-2xl font-semibold">{getPageTitle()}</h2>
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
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout