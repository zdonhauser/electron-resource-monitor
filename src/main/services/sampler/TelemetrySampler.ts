import { exec } from 'child_process'
import { promisify } from 'util'
import * as os from 'os'
import { EventEmitter } from 'events'
const execAsync = promisify(exec)
import type {
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  ProcessMetrics,
  TelemetryData,
  TelemetrySettings
} from '../../../shared/types/telemetry'
import { DEFAULT_HOST_ID } from '../../../shared/constants/ipc'

export class TelemetrySampler extends EventEmitter {
  private sampleTimer: NodeJS.Timeout | null = null
  private settings: TelemetrySettings = {
    sampleInterval: 1000, // Changed to 1 second for better performance
    enableCpu: true,
    enableMemory: true,
    enableDisk: true, // Enabled now that we have the UI component
    enableNetwork: true, // Enabled now that we have the UI component
    enableProcesses: true, // Enabled now that we have the UI component
    maxDataPoints: 300 // Reduced from 1000 for better memory usage
  }
  private previousCpuInfo: { idle: number; total: number } | null = null
  private diskInfo: DiskMetrics | null = null

  async start(): Promise<void> {
    if (this.sampleTimer) {
      return
    }

    console.log('Starting telemetry sampler...')

    // Get disk info once on startup (doesn't change much)
    if (this.settings.enableDisk) {
      try {
        console.log('Getting disk metrics...')
        this.diskInfo = await this.getDiskMetrics()
        this.emit('disk', this.diskInfo)
        console.log('Disk metrics loaded:', this.diskInfo.devices.length, 'devices')
      } catch (error) {
        console.error('Error getting disk metrics:', error)
      }
    }

    this.sampleTimer = setInterval(() => {
      this.sample()
    }, this.settings.sampleInterval)

    console.log('Starting regular sampling at', this.settings.sampleInterval, 'ms interval')
    this.sample()
  }

  stop(): void {
    if (this.sampleTimer) {
      clearInterval(this.sampleTimer)
      this.sampleTimer = null
    }
  }

  updateSettings(settings: Partial<TelemetrySettings>): void {
    const wasRunning = this.sampleTimer !== null

    if (wasRunning) {
      this.stop()
    }

    this.settings = { ...this.settings, ...settings }

    if (wasRunning) {
      this.start()
    }
  }

  getSettings(): TelemetrySettings {
    return { ...this.settings }
  }

  private async sample(): Promise<void> {
    const data: TelemetryData = {}

    if (this.settings.enableCpu) {
      data.cpu = await this.getCpuMetrics()
    }

    if (this.settings.enableMemory) {
      data.memory = await this.getMemoryMetrics()
    }

    // Disk info is sampled only once on startup, not every interval

    if (this.settings.enableNetwork) {
      data.network = await this.getNetworkMetrics()
    }

    if (this.settings.enableProcesses) {
      data.processes = await this.getProcessMetrics()
    }

    this.emit('telemetry', data)

    if (data.cpu) this.emit('cpu', data.cpu)
    if (data.memory) this.emit('memory', data.memory)
    // Disk is emitted only on startup in start() method
    if (data.network) this.emit('network', data.network)
    if (data.processes) this.emit('processes', data.processes)
  }

  private async getCpuMetrics(): Promise<CpuMetrics> {
    const cpus = os.cpus()
    const loadAvg = os.loadavg() as [number, number, number]

    let usage = 0
    if (process.platform === 'darwin') {
      try {
        const { stdout } = await execAsync('top -l 1 -n 0 | grep "CPU usage"')
        const match = stdout.match(/(\d+\.\d+)%\s+user.*?(\d+\.\d+)%\s+sys/)
        if (match) {
          usage = parseFloat(match[1]) + parseFloat(match[2])
        }
      } catch (error) {
        // Fallback to calculation if top command fails
        usage = this.calculateCpuUsage(cpus)
      }
    } else {
      usage = this.calculateCpuUsage(cpus)
    }

    return {
      hostId: DEFAULT_HOST_ID,
      timestamp: Date.now(),
      usage: Math.min(100, usage),
      cores: cpus.length,
      loadAverage: loadAvg
    }
  }

  private calculateCpuUsage(cpus: os.CpuInfo[]): number {
    let idle = 0
    let total = 0

    cpus.forEach(cpu => {
      idle += cpu.times.idle
      total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq
    })

    if (this.previousCpuInfo) {
      const idleDiff = idle - this.previousCpuInfo.idle
      const totalDiff = total - this.previousCpuInfo.total
      const usage = 100 - (100 * idleDiff) / totalDiff

      this.previousCpuInfo = { idle, total }
      return usage
    } else {
      this.previousCpuInfo = { idle, total }
      return 0
    }
  }

  private async getMemoryMetrics(): Promise<MemoryMetrics> {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    let swapTotal = 0
    let swapUsed = 0
    let swapFree = 0

    if (process.platform === 'darwin') {
      try {
        const { stdout: swapInfo } = await execAsync('sysctl vm.swapusage')
        const totalMatch = swapInfo.match(/total\s+=\s+([\d.]+)M/)
        const usedMatch = swapInfo.match(/used\s+=\s+([\d.]+)M/)
        const freeMatch = swapInfo.match(/free\s+=\s+([\d.]+)M/)

        if (totalMatch) swapTotal = parseFloat(totalMatch[1]) * 1024 * 1024
        if (usedMatch) swapUsed = parseFloat(usedMatch[1]) * 1024 * 1024
        if (freeMatch) swapFree = parseFloat(freeMatch[1]) * 1024 * 1024
      } catch {
        // Ignore swap errors, continue with 0 values
      }
    }

    return {
      hostId: DEFAULT_HOST_ID,
      timestamp: Date.now(),
      total: totalMem,
      used: usedMem,
      free: freeMem,
      available: freeMem,
      swapTotal,
      swapUsed,
      swapFree
    }
  }

  private async getDiskMetrics(): Promise<DiskMetrics> {
    const devices: DiskMetrics['devices'] = []

    if (process.platform === 'darwin') {
      try {
        const { stdout: dfOutput } = await execAsync('df -k')
        const lines = dfOutput.split('\n').slice(1)

        for (const line of lines) {
          const parts = line.trim().split(/\s+/)
          if (parts.length >= 6 && parts[0].startsWith('/dev/')) {
            // Mount point is the last column (could be parts[5], [6], etc.)
            const mount = parts[parts.length - 1]
            const total = parseInt(parts[1]) * 1024
            const used = parseInt(parts[2]) * 1024
            const free = parseInt(parts[3]) * 1024
            // Percentage has % sign, so remove it
            const percentage = parseInt(parts[4].replace('%', ''))

            // Only show the data volume (where user files actually live) and external drives
            // Skip the system root partition since it's not meaningful to users
            const isDataVolume = mount === '/System/Volumes/Data'
            const isExternalDrive = mount.startsWith('/Volumes/') && !mount.startsWith('/System/Volumes/')
            const isSystemRoot = mount === '/'

            // Skip system root partition, only show data volume and true external drives
            if ((isDataVolume || isExternalDrive) && !isSystemRoot) {
              devices.push({
                name: parts[0],
                mount: isDataVolume ? '/' : mount, // Show / for the main drive
                total,
                used,
                free,
                percentage
              })
            }
          }
        }
      } catch {}
    }

    return {
      hostId: DEFAULT_HOST_ID,
      timestamp: Date.now(),
      devices
    }
  }


  private async getNetworkMetrics(): Promise<NetworkMetrics> {
    const interfaces: NetworkMetrics['interfaces'] = []

    if (process.platform === 'darwin') {
      try {
        const { stdout: netstatOutput } = await execAsync('netstat -ibn')
        const lines = netstatOutput.split('\n')

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].trim().split(/\s+/)
          if (parts.length >= 10 && !parts[0].includes('*')) {
            const name = parts[0]
            const bytesReceived = parseInt(parts[6]) || 0
            const bytesSent = parseInt(parts[9]) || 0

            interfaces.push({
              name,
              bytesReceived,
              bytesSent,
              packetsReceived: parseInt(parts[4]) || 0,
              packetsSent: parseInt(parts[7]) || 0,
              errorIn: parseInt(parts[5]) || 0,
              errorOut: parseInt(parts[8]) || 0,
              dropIn: 0,
              dropOut: 0
            })
          }
        }
      } catch {}
    }

    return {
      hostId: DEFAULT_HOST_ID,
      timestamp: Date.now(),
      interfaces
    }
  }

  private async getProcessMetrics(): Promise<ProcessMetrics> {
    const processes: ProcessMetrics['processes'] = []
    let total = 0
    let running = 0
    let sleeping = 0

    if (process.platform === 'darwin') {
      try {
        const { stdout: psOutput } = await execAsync('ps aux | head -21')
        const lines = psOutput.split('\n')

        for (let i = 1; i < lines.length && processes.length < 20; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const parts = line.split(/\s+/)
          if (parts.length >= 11) {
            const pid = parseInt(parts[1])
            const cpu = parseFloat(parts[2]) || 0
            const memory = parseFloat(parts[3]) || 0
            const status = parts[7]
            const command = parts[10]

            if (!isNaN(pid) && command) {
              processes.push({
                pid,
                name: command,
                cpu,
                memory,
                ppid: undefined,
                uid: undefined,
                gid: undefined,
                status
              })

              total++
              if (status === 'R' || status === 'R+') {
                running++
              } else {
                sleeping++
              }
            }
          }
        }

        // Sort by CPU usage
        processes.sort((a, b) => b.cpu - a.cpu)
      } catch (error) {
        console.error('Error getting process metrics:', error)
      }
    }

    return {
      hostId: DEFAULT_HOST_ID,
      timestamp: Date.now(),
      processes,
      total,
      running,
      sleeping
    }
  }
}
