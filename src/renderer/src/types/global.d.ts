import type { TelemetryAPI } from '../../../preload/index'

declare global {
  interface Window {
    telemetry: TelemetryAPI
  }
}

export {}
