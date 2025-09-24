import { IpcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS, formatChannel, DEFAULT_HOST_ID } from '../../shared/constants/ipc'
import { TelemetrySampler } from '../services/sampler/TelemetrySampler'
import { DatabaseService } from '../services/database/DatabaseService'
import type { TelemetrySettings, TelemetryData } from '../../shared/types/telemetry'

export function setupIpcHandlers(
  ipcMain: IpcMain,
  sampler: TelemetrySampler,
  database: DatabaseService
): void {
  ipcMain.on(IPC_CHANNELS.CONTROL.START_SAMPLING, () => {
    sampler.start()
  })

  ipcMain.on(IPC_CHANNELS.CONTROL.STOP_SAMPLING, () => {
    sampler.stop()
  })

  ipcMain.on(IPC_CHANNELS.CONTROL.UPDATE_SETTINGS, (_event, settings: TelemetrySettings) => {
    sampler.updateSettings(settings)
  })

  ipcMain.handle(IPC_CHANNELS.CONTROL.GET_SETTINGS, () => {
    return sampler.getSettings()
  })

  ipcMain.handle(IPC_CHANNELS.DATABASE.QUERY, (_event, query: string, params?: any[]) => {
    return database.query(query, params)
  })

  ipcMain.handle(
    IPC_CHANNELS.DATABASE.EXPORT,
    (_event, format: 'json' | 'csv', startTime?: number, endTime?: number) => {
      return database.exportData(format, startTime, endTime)
    }
  )

  sampler.on('telemetry', (data: TelemetryData) => {
    // Save to database but don't send the redundant ALL channel
    if (data.cpu) {
      database.saveCpuMetrics(data.cpu)
    }
    if (data.memory) {
      database.saveMemoryMetrics(data.memory)
    }
    if (data.disk) {
      database.saveDiskMetrics(data.disk)
    }
    if (data.network) {
      database.saveNetworkMetrics(data.network)
    }
    if (data.processes) {
      database.saveProcessMetrics(data.processes)
    }
  })

  sampler.on('cpu', data => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (!mainWindow) return

    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.CPU, { hostId: DEFAULT_HOST_ID })
    mainWindow.webContents.send(channel, data)
  })

  sampler.on('memory', data => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (!mainWindow) return

    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.MEMORY, { hostId: DEFAULT_HOST_ID })
    mainWindow.webContents.send(channel, data)
  })

  sampler.on('disk', data => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (!mainWindow) return

    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.DISK, { hostId: DEFAULT_HOST_ID })
    mainWindow.webContents.send(channel, data)
  })

  sampler.on('network', data => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (!mainWindow) return

    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.NETWORK, { hostId: DEFAULT_HOST_ID })
    mainWindow.webContents.send(channel, data)
  })

  sampler.on('processes', data => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (!mainWindow) return

    const channel = formatChannel(IPC_CHANNELS.TELEMETRY.PROCESSES, { hostId: DEFAULT_HOST_ID })
    mainWindow.webContents.send(channel, data)
  })
}
