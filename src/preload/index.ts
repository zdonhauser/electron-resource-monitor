import { contextBridge, ipcRenderer } from 'electron'
import { TelemetryDataSchema, TelemetrySettingsSchema } from '../shared/schemas/telemetry.schema'
import type { TelemetryData, TelemetrySettings } from '../shared/types/telemetry'
import { IPC_CHANNELS, formatChannel, DEFAULT_HOST_ID } from '../shared/constants/ipc'

const telemetryApi = {
  startSampling: () => {
    ipcRenderer.send(IPC_CHANNELS.CONTROL.START_SAMPLING)
  },

  stopSampling: () => {
    ipcRenderer.send(IPC_CHANNELS.CONTROL.STOP_SAMPLING)
  },

  updateSettings: (settings: TelemetrySettings) => {
    const validated = TelemetrySettingsSchema.parse(settings)
    ipcRenderer.send(IPC_CHANNELS.CONTROL.UPDATE_SETTINGS, validated)
  },

  getSettings: (): Promise<TelemetrySettings> => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONTROL.GET_SETTINGS)
  },

  onTelemetryData: (callback: (data: TelemetryData) => void) => {
    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.ALL, { hostId: DEFAULT_HOST_ID })

    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      try {
        const validated = TelemetryDataSchema.parse(data)
        callback(validated)
      } catch (error) {
        console.error('Invalid telemetry data received:', error)
      }
    }

    ipcRenderer.on(channel, handler)

    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  },

  onCpuMetrics: (callback: (data: TelemetryData['cpu']) => void) => {
    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.CPU, { hostId: DEFAULT_HOST_ID })

    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      callback(data as TelemetryData['cpu'])
    }

    ipcRenderer.on(channel, handler)

    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  },

  onMemoryMetrics: (callback: (data: TelemetryData['memory']) => void) => {
    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.MEMORY, { hostId: DEFAULT_HOST_ID })

    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      callback(data as TelemetryData['memory'])
    }

    ipcRenderer.on(channel, handler)

    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  },

  onDiskMetrics: (callback: (data: TelemetryData['disk']) => void) => {
    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.DISK, { hostId: DEFAULT_HOST_ID })

    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      callback(data as TelemetryData['disk'])
    }

    ipcRenderer.on(channel, handler)

    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  },

  onNetworkMetrics: (callback: (data: TelemetryData['network']) => void) => {
    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.NETWORK, { hostId: DEFAULT_HOST_ID })

    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      callback(data as TelemetryData['network'])
    }

    ipcRenderer.on(channel, handler)

    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  },

  onProcessMetrics: (callback: (data: TelemetryData['processes']) => void) => {
    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.PROCESSES, { hostId: DEFAULT_HOST_ID })

    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      callback(data as TelemetryData['processes'])
    }

    ipcRenderer.on(channel, handler)

    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  },

  queryDatabase: (query: string, params?: any[]): Promise<any[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DATABASE.QUERY, query, params)
  },

  exportData: (format: 'json' | 'csv', startTime?: number, endTime?: number): Promise<string> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DATABASE.EXPORT, format, startTime, endTime)
  }
}

contextBridge.exposeInMainWorld('telemetry', telemetryApi)

export type TelemetryAPI = typeof telemetryApi
