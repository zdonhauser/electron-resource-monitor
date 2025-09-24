export interface CpuMetrics {
  hostId: string
  timestamp: number
  usage: number
  cores: number
  loadAverage: [number, number, number]
  temperature?: number
}

export interface MemoryMetrics {
  hostId: string
  timestamp: number
  total: number
  used: number
  free: number
  available: number
  swapTotal?: number
  swapUsed?: number
  swapFree?: number
}

export interface DiskMetrics {
  hostId: string
  timestamp: number
  devices: DiskDevice[]
}

export interface DiskDevice {
  name: string
  mount: string
  total: number
  used: number
  free: number
  percentage: number
  breakdown?: StorageBreakdown
}

export interface StorageBreakdown {
  documents: number
  downloads: number
  applications: number
  system: number
  other: number
}

export interface NetworkMetrics {
  hostId: string
  timestamp: number
  interfaces: NetworkInterface[]
}

export interface NetworkInterface {
  name: string
  bytesReceived: number
  bytesSent: number
  packetsReceived: number
  packetsSent: number
  errorIn: number
  errorOut: number
  dropIn: number
  dropOut: number
}

export interface ProcessMetrics {
  hostId: string
  timestamp: number
  processes: ProcessInfo[]
  total: number
  running: number
  sleeping: number
}

export interface ProcessInfo {
  pid: number
  name: string
  cpu: number
  memory: number
  ppid?: number
  uid?: number
  gid?: number
  status?: string
}

export interface TelemetryData {
  cpu?: CpuMetrics
  memory?: MemoryMetrics
  disk?: DiskMetrics
  network?: NetworkMetrics
  processes?: ProcessMetrics
}

export interface TelemetrySettings {
  sampleInterval: number
  enableCpu: boolean
  enableMemory: boolean
  enableDisk: boolean
  enableNetwork: boolean
  enableProcesses: boolean
  maxDataPoints: number
}

export interface Alert {
  id: string
  type: 'cpu' | 'memory' | 'disk' | 'network'
  threshold: number
  condition: 'above' | 'below'
  enabled: boolean
  message: string
}
