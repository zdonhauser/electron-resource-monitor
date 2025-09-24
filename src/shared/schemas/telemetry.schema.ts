import { z } from 'zod'

export const CpuMetricsSchema = z.object({
  hostId: z.string(),
  timestamp: z.number(),
  usage: z.number().min(0).max(100),
  cores: z.number().positive(),
  loadAverage: z.tuple([z.number(), z.number(), z.number()]),
  temperature: z.number().optional()
})

export const MemoryMetricsSchema = z.object({
  hostId: z.string(),
  timestamp: z.number(),
  total: z.number().nonnegative(),
  used: z.number().nonnegative(),
  free: z.number().nonnegative(),
  available: z.number().nonnegative(),
  swapTotal: z.number().nonnegative().optional(),
  swapUsed: z.number().nonnegative().optional(),
  swapFree: z.number().nonnegative().optional()
})

export const DiskDeviceSchema = z.object({
  name: z.string(),
  mount: z.string(),
  total: z.number().nonnegative(),
  used: z.number().nonnegative(),
  free: z.number().nonnegative(),
  percentage: z.number().min(0).max(100)
})

export const DiskMetricsSchema = z.object({
  hostId: z.string(),
  timestamp: z.number(),
  devices: z.array(DiskDeviceSchema)
})

export const NetworkInterfaceSchema = z.object({
  name: z.string(),
  bytesReceived: z.number().nonnegative(),
  bytesSent: z.number().nonnegative(),
  packetsReceived: z.number().nonnegative(),
  packetsSent: z.number().nonnegative(),
  errorIn: z.number().nonnegative(),
  errorOut: z.number().nonnegative(),
  dropIn: z.number().nonnegative(),
  dropOut: z.number().nonnegative()
})

export const NetworkMetricsSchema = z.object({
  hostId: z.string(),
  timestamp: z.number(),
  interfaces: z.array(NetworkInterfaceSchema)
})

export const ProcessInfoSchema = z.object({
  pid: z.number().positive(),
  name: z.string(),
  cpu: z.number().min(0),
  memory: z.number().min(0),
  ppid: z.number().optional(),
  uid: z.number().optional(),
  gid: z.number().optional(),
  status: z.string().optional()
})

export const ProcessMetricsSchema = z.object({
  hostId: z.string(),
  timestamp: z.number(),
  processes: z.array(ProcessInfoSchema),
  total: z.number().nonnegative(),
  running: z.number().nonnegative(),
  sleeping: z.number().nonnegative()
})

export const TelemetryDataSchema = z.object({
  cpu: CpuMetricsSchema.optional(),
  memory: MemoryMetricsSchema.optional(),
  disk: DiskMetricsSchema.optional(),
  network: NetworkMetricsSchema.optional(),
  processes: ProcessMetricsSchema.optional()
})

export const TelemetrySettingsSchema = z.object({
  sampleInterval: z.number().min(100).max(60000),
  enableCpu: z.boolean(),
  enableMemory: z.boolean(),
  enableDisk: z.boolean(),
  enableNetwork: z.boolean(),
  enableProcesses: z.boolean(),
  maxDataPoints: z.number().min(10).max(10000)
})

export const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['cpu', 'memory', 'disk', 'network']),
  threshold: z.number(),
  condition: z.enum(['above', 'below']),
  enabled: z.boolean(),
  message: z.string()
})
