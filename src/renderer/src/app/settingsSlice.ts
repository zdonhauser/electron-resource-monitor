import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { TelemetrySettings } from '../../../shared/types/telemetry'

interface SettingsState extends TelemetrySettings {
  darkMode: boolean
  chartUpdateInterval: number
  showGridLines: boolean
  animateCharts: boolean
  compactMode: boolean
}

const initialState: SettingsState = {
  sampleInterval: 1000, // Updated to match performance optimizations
  enableCpu: true,
  enableMemory: true,
  enableDisk: true, // Now that we have the widget
  enableNetwork: true, // Enabled now that we have the widget
  enableProcesses: true, // Enabled now that we have the widget
  maxDataPoints: 300, // Reduced for better performance
  darkMode: true,
  chartUpdateInterval: 500,
  showGridLines: true,
  animateCharts: true,
  compactMode: false
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload)
    },
    toggleDarkMode: state => {
      state.darkMode = !state.darkMode
    },
    toggleMetric: (state, action: PayloadAction<keyof TelemetrySettings>) => {
      const key = action.payload
      if (key.startsWith('enable')) {
        ;(state as any)[key] = !(state as any)[key]
      }
    },
    setSampleInterval: (state, action: PayloadAction<number>) => {
      state.sampleInterval = Math.max(100, Math.min(60000, action.payload))
    },
    setMaxDataPoints: (state, action: PayloadAction<number>) => {
      state.maxDataPoints = Math.max(10, Math.min(10000, action.payload))
    },
    toggleCompactMode: state => {
      state.compactMode = !state.compactMode
    },
    toggleAnimations: state => {
      state.animateCharts = !state.animateCharts
    },
    toggleGridLines: state => {
      state.showGridLines = !state.showGridLines
    },
    resetSettings: () => initialState
  }
})

export const {
  updateSettings,
  toggleDarkMode,
  toggleMetric,
  setSampleInterval,
  setMaxDataPoints,
  toggleCompactMode,
  toggleAnimations,
  toggleGridLines,
  resetSettings
} = settingsSlice.actions

export default settingsSlice.reducer
