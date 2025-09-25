import React, { useEffect, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './app/store'
import {
  addCpuMetrics,
  addMemoryMetrics,
  addDiskMetrics,
  addNetworkMetrics,
  addProcessMetrics,
  setConnectionStatus
} from './app/telemetrySlice'

import Layout from './components/Layout'
import Dashboard from './features/telemetry/Dashboard'
import Settings from './features/settings/Settings'
import Alerts from './features/alerts/Alerts'

// Only import performance test page in development
const PerformanceTestPage = import.meta.env.DEV
  ? React.lazy(() => import('./components/PerformanceTestPage'))
  : null



function App() {
  const dispatch = useDispatch()
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    console.log('App mounted, checking telemetry API...', window.telemetry)
    if (!window.telemetry) {
      console.error('Telemetry API not available')
      return
    }

    console.log('Telemetry API available, setting connection status')
    dispatch(setConnectionStatus(true))

    // Listen to individual metric channels instead of the ALL channel for better performance
    const cleanupCpu = window.telemetry.onCpuMetrics(data => {
      if (data) dispatch(addCpuMetrics(data))
    })

    const cleanupMemory = window.telemetry.onMemoryMetrics(data => {
      if (data) dispatch(addMemoryMetrics(data))
    })

    const cleanupDisk = window.telemetry.onDiskMetrics(data => {
      if (data) dispatch(addDiskMetrics(data))
    })

    const cleanupNetwork = window.telemetry.onNetworkMetrics(data => {
      if (data) dispatch(addNetworkMetrics(data))
    })

    const cleanupProcesses = window.telemetry.onProcessMetrics(data => {
      if (data) dispatch(addProcessMetrics(data))
    })

    window.telemetry.startSampling()

    return () => {
      cleanupCpu()
      cleanupMemory()
      cleanupDisk()
      cleanupNetwork()
      cleanupProcesses()
      window.telemetry?.stopSampling()
      dispatch(setConnectionStatus(false))
    }
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/alerts" element={<Alerts />} />
          {/* Performance test page only available in development */}
          {import.meta.env.DEV && PerformanceTestPage && (
            <Route
              path="/performance-test"
              element={
                <Suspense fallback={<div>Loading performance test...</div>}>
                  <PerformanceTestPage />
                </Suspense>
              }
            />
          )}
        </Routes>
      </Layout>
    </div>
  )
}

export default App
