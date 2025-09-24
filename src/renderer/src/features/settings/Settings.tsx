import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../app/store'
import { toggleDarkMode, toggleMetric, setSampleInterval } from '../../app/settingsSlice'

const Settings: React.FC = () => {
  const dispatch = useDispatch()
  const settings = useSelector((state: RootState) => state.settings)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

        <div className="grid gap-6">
          {/* General Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">General</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={() => dispatch(toggleDarkMode())}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Sample Interval (ms)</span>
                <input
                  type="number"
                  value={settings.sampleInterval}
                  onChange={e => dispatch(setSampleInterval(parseInt(e.target.value)))}
                  min="100"
                  max="60000"
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Telemetry Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Telemetry</h2>
            <div className="space-y-4">
              {[
                { key: 'enableCpu', label: 'CPU Monitoring' },
                { key: 'enableMemory', label: 'Memory Monitoring' },
                { key: 'enableDisk', label: 'Disk Monitoring' },
                { key: 'enableNetwork', label: 'Network Monitoring' },
                { key: 'enableProcesses', label: 'Process Monitoring' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  <button
                    onClick={() => dispatch(toggleMetric(key as any))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      (settings as any)[key] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        (settings as any)[key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a href="#/" className="btn-primary">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

export default Settings
