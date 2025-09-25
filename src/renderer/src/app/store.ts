import { configureStore } from '@reduxjs/toolkit'
import telemetryReducer from './telemetrySlice'
import settingsReducer from './settingsSlice'
import layoutReducer from './layoutSlice'
import alertsReducer from './alertsSlice'

export const store = configureStore({
  reducer: {
    telemetry: telemetryReducer,
    settings: settingsReducer,
    layout: layoutReducer,
    alerts: alertsReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
