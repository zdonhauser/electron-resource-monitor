import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

const Alerts: React.FC = () => {
  const alerts = useSelector((state: RootState) => state.alerts.alerts)
  const notifications = useSelector((state: RootState) => state.alerts.notifications)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Alerts & Notifications
        </h1>

        <div className="grid gap-6">
          {/* Active Alerts */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Active Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${
                    alert.enabled
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {alert.type.toUpperCase()} Alert
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Threshold: {alert.threshold}% ({alert.condition})
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.enabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {alert.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Notifications ({notifications.length})
            </h2>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 10).map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg ${
                      notification.acknowledged
                        ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          notification.severity === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            : notification.severity === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                        }`}
                      >
                        {notification.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            )}
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

export default Alerts
