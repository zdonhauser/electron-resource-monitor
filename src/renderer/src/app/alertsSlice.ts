import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Alert } from '../../../shared/types/telemetry'

interface AlertNotification {
  id: string
  alertId: string
  message: string
  timestamp: number
  severity: 'info' | 'warning' | 'error'
  acknowledged: boolean
}

interface AlertsState {
  alerts: Alert[]
  notifications: AlertNotification[]
  maxNotifications: number
  soundEnabled: boolean
  desktopNotificationsEnabled: boolean
}

const initialState: AlertsState = {
  alerts: [
    {
      id: 'cpu-high',
      type: 'cpu',
      threshold: 90,
      condition: 'above',
      enabled: true,
      message: 'CPU usage is above 90%'
    },
    {
      id: 'memory-high',
      type: 'memory',
      threshold: 90,
      condition: 'above',
      enabled: true,
      message: 'Memory usage is above 90%'
    },
    {
      id: 'disk-full',
      type: 'disk',
      threshold: 95,
      condition: 'above',
      enabled: true,
      message: 'Disk usage is above 95%'
    }
  ],
  notifications: [],
  maxNotifications: 50,
  soundEnabled: true,
  desktopNotificationsEnabled: false
}

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.push(action.payload)
    },
    updateAlert: (state, action: PayloadAction<Alert>) => {
      const index = state.alerts.findIndex(a => a.id === action.payload.id)
      if (index !== -1) {
        state.alerts[index] = action.payload
      }
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(a => a.id !== action.payload)
    },
    toggleAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload)
      if (alert) {
        alert.enabled = !alert.enabled
      }
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<AlertNotification, 'id' | 'timestamp' | 'acknowledged'>>
    ) => {
      const notification: AlertNotification = {
        ...action.payload,
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        acknowledged: false
      }
      state.notifications.unshift(notification)
      if (state.notifications.length > state.maxNotifications) {
        state.notifications.pop()
      }
    },
    acknowledgeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.acknowledged = true
      }
    },
    clearNotifications: state => {
      state.notifications = []
    },
    clearAcknowledgedNotifications: state => {
      state.notifications = state.notifications.filter(n => !n.acknowledged)
    },
    toggleSound: state => {
      state.soundEnabled = !state.soundEnabled
    },
    toggleDesktopNotifications: state => {
      state.desktopNotificationsEnabled = !state.desktopNotificationsEnabled
    }
  }
})

export const {
  addAlert,
  updateAlert,
  removeAlert,
  toggleAlert,
  addNotification,
  acknowledgeNotification,
  clearNotifications,
  clearAcknowledgedNotifications,
  toggleSound,
  toggleDesktopNotifications
} = alertsSlice.actions

export default alertsSlice.reducer
