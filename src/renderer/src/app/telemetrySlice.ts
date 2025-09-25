import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type {
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  ProcessMetrics
} from '@shared/types/telemetry'

// Serializable ring buffer state
interface SerializableRingBuffer<T> {
  buffer: (T | undefined)[]
  head: number
  tail: number
  size: number
  capacity: number
}

export interface TelemetryState {
  cpu: SerializableRingBuffer<CpuMetrics>
  memory: SerializableRingBuffer<MemoryMetrics>
  disk: SerializableRingBuffer<DiskMetrics>
  network: SerializableRingBuffer<NetworkMetrics>
  processes: SerializableRingBuffer<ProcessMetrics>
  isConnected: boolean
  isSampling: boolean
}

// Helper functions for ring buffer operations
const createRingBuffer = <T>(capacity: number): SerializableRingBuffer<T> => ({
  buffer: new Array(capacity),
  head: 0,
  tail: 0,
  size: 0,
  capacity
})

const pushToRingBuffer = <T>(ringBuffer: SerializableRingBuffer<T>, item: T): void => {
  ringBuffer.buffer[ringBuffer.tail] = item
  ringBuffer.tail = (ringBuffer.tail + 1) % ringBuffer.capacity

  if (ringBuffer.size < ringBuffer.capacity) {
    ringBuffer.size++
  } else {
    // Buffer is full, move head pointer to maintain size
    ringBuffer.head = (ringBuffer.head + 1) % ringBuffer.capacity
  }
}

const getRingBufferAll = <T>(ringBuffer: SerializableRingBuffer<T>): T[] => {
  if (ringBuffer.size === 0) {
    return []
  }

  const result: T[] = []
  let current = ringBuffer.head

  for (let i = 0; i < ringBuffer.size; i++) {
    const item = ringBuffer.buffer[current]
    if (item !== undefined) {
      result.push(item)
    }
    current = (current + 1) % ringBuffer.capacity
  }

  return result
}

const getRingBufferLatest = <T>(ringBuffer: SerializableRingBuffer<T>): T | undefined => {
  if (ringBuffer.size === 0) {
    return undefined
  }
  const latestIndex = ringBuffer.tail === 0 ? ringBuffer.capacity - 1 : ringBuffer.tail - 1
  return ringBuffer.buffer[latestIndex]
}

const getRingBufferRecent = <T>(ringBuffer: SerializableRingBuffer<T>, count: number): T[] => {
  if (count <= 0 || ringBuffer.size === 0) {
    return []
  }

  const actualCount = Math.min(count, ringBuffer.size)
  const result: T[] = []

  // Start from the position that gives us the last N items
  const startOffset = ringBuffer.size - actualCount
  let current = (ringBuffer.head + startOffset) % ringBuffer.capacity

  for (let i = 0; i < actualCount; i++) {
    const item = ringBuffer.buffer[current]
    if (item !== undefined) {
      result.push(item)
    }
    current = (current + 1) % ringBuffer.capacity
  }

  return result
}

const clearRingBuffer = <T>(ringBuffer: SerializableRingBuffer<T>): void => {
  ringBuffer.head = 0
  ringBuffer.tail = 0
  ringBuffer.size = 0
}

const resizeRingBuffer = <T>(ringBuffer: SerializableRingBuffer<T>, newCapacity: number): void => {
  if (newCapacity <= 0) {
    throw new Error('Ring buffer capacity must be greater than 0')
  }

  if (newCapacity === ringBuffer.capacity) {
    return
  }

  // Get current data in order
  const currentData = getRingBufferAll(ringBuffer)

  // Create new buffer
  ringBuffer.buffer = new Array(newCapacity)
  ringBuffer.capacity = newCapacity
  ringBuffer.head = 0
  ringBuffer.tail = 0
  ringBuffer.size = 0

  // Re-add data up to new capacity
  const dataToKeep = currentData.slice(-newCapacity)
  for (const item of dataToKeep) {
    pushToRingBuffer(ringBuffer, item)
  }
}

const initialState: TelemetryState = {
  cpu: createRingBuffer<CpuMetrics>(300), // 5 minutes at 1s interval
  memory: createRingBuffer<MemoryMetrics>(300), // 5 minutes at 1s interval
  disk: createRingBuffer<DiskMetrics>(60), // 1 minute when enabled
  network: createRingBuffer<NetworkMetrics>(60), // 1 minute when enabled
  processes: createRingBuffer<ProcessMetrics>(20), // Top 20 processes
  isConnected: false,
  isSampling: false
}

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    addCpuMetrics: (state, action: PayloadAction<CpuMetrics>) => {
      pushToRingBuffer(state.cpu, action.payload)
    },
    addMemoryMetrics: (state, action: PayloadAction<MemoryMetrics>) => {
      pushToRingBuffer(state.memory, action.payload)
    },
    addDiskMetrics: (state, action: PayloadAction<DiskMetrics>) => {
      pushToRingBuffer(state.disk, action.payload)
    },
    addNetworkMetrics: (state, action: PayloadAction<NetworkMetrics>) => {
      pushToRingBuffer(state.network, action.payload)
    },
    addProcessMetrics: (state, action: PayloadAction<ProcessMetrics>) => {
      pushToRingBuffer(state.processes, action.payload)
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setSamplingStatus: (state, action: PayloadAction<boolean>) => {
      state.isSampling = action.payload
    },
    clearMetrics: (state, action: PayloadAction<keyof TelemetryState | 'all'>) => {
      if (action.payload === 'all') {
        clearRingBuffer(state.cpu)
        clearRingBuffer(state.memory)
        clearRingBuffer(state.disk)
        clearRingBuffer(state.network)
        clearRingBuffer(state.processes)
      } else if (action.payload in state && typeof state[action.payload] === 'object') {
        const key = action.payload as keyof Omit<TelemetryState, 'isConnected' | 'isSampling'>
        const buffer = state[key] as SerializableRingBuffer<any>
        clearRingBuffer(buffer)
      }
    },
    clearAllTelemetryData: (state) => {
      clearRingBuffer(state.cpu)
      clearRingBuffer(state.memory)
      clearRingBuffer(state.disk)
      clearRingBuffer(state.network)
      clearRingBuffer(state.processes)
    },
    updateBufferSize: (
      state,
      action: PayloadAction<{
        metric: keyof Omit<TelemetryState, 'isConnected' | 'isSampling'>
        size: number
      }>
    ) => {
      const { metric, size } = action.payload
      const buffer = state[metric] as SerializableRingBuffer<any>
      resizeRingBuffer(buffer, size)
    }
  }
})

export const {
  addCpuMetrics,
  addMemoryMetrics,
  addDiskMetrics,
  addNetworkMetrics,
  addProcessMetrics,
  setConnectionStatus,
  setSamplingStatus,
  clearMetrics,
  clearAllTelemetryData,
  updateBufferSize
} = telemetrySlice.actions

// Base selectors for ring buffer state
const selectCpuRingBuffer = (state: { telemetry: TelemetryState }) => state.telemetry.cpu
const selectMemoryRingBuffer = (state: { telemetry: TelemetryState }) => state.telemetry.memory
const selectDiskRingBuffer = (state: { telemetry: TelemetryState }) => state.telemetry.disk
const selectNetworkRingBuffer = (state: { telemetry: TelemetryState }) => state.telemetry.network
const selectProcessRingBuffer = (state: { telemetry: TelemetryState }) => state.telemetry.processes

// Memoized selectors for accessing ring buffer data
export const selectCpuData = createSelector(
  [selectCpuRingBuffer],
  (cpuBuffer) => getRingBufferAll(cpuBuffer)
)

export const selectMemoryData = createSelector(
  [selectMemoryRingBuffer],
  (memoryBuffer) => getRingBufferAll(memoryBuffer)
)

export const selectDiskData = createSelector(
  [selectDiskRingBuffer],
  (diskBuffer) => getRingBufferAll(diskBuffer)
)

export const selectNetworkData = createSelector(
  [selectNetworkRingBuffer],
  (networkBuffer) => getRingBufferAll(networkBuffer)
)

export const selectProcessData = createSelector(
  [selectProcessRingBuffer],
  (processBuffer) => getRingBufferAll(processBuffer)
)

// Memoized selectors for latest values
export const selectLatestCpu = createSelector(
  [selectCpuRingBuffer],
  (cpuBuffer) => getRingBufferLatest(cpuBuffer)
)

export const selectLatestMemory = createSelector(
  [selectMemoryRingBuffer],
  (memoryBuffer) => getRingBufferLatest(memoryBuffer)
)

export const selectLatestDisk = createSelector(
  [selectDiskRingBuffer],
  (diskBuffer) => getRingBufferLatest(diskBuffer)
)

export const selectLatestNetwork = createSelector(
  [selectNetworkRingBuffer],
  (networkBuffer) => getRingBufferLatest(networkBuffer)
)

export const selectLatestProcess = createSelector(
  [selectProcessRingBuffer],
  (processBuffer) => getRingBufferLatest(processBuffer)
)

// Memoized selectors for recent data (useful for charts that don't need all data)
export const selectRecentCpuData = (count: number) => createSelector(
  [selectCpuRingBuffer],
  (cpuBuffer) => getRingBufferRecent(cpuBuffer, count)
)

export const selectRecentMemoryData = (count: number) => createSelector(
  [selectMemoryRingBuffer],
  (memoryBuffer) => getRingBufferRecent(memoryBuffer, count)
)

export const selectRecentDiskData = (count: number) => createSelector(
  [selectDiskRingBuffer],
  (diskBuffer) => getRingBufferRecent(diskBuffer, count)
)

export const selectRecentNetworkData = (count: number) => createSelector(
  [selectNetworkRingBuffer],
  (networkBuffer) => getRingBufferRecent(networkBuffer, count)
)

// Connection and sampling status selectors
export const selectIsConnected = (state: { telemetry: TelemetryState }) => state.telemetry.isConnected
export const selectIsSampling = (state: { telemetry: TelemetryState }) => state.telemetry.isSampling

// Memoized buffer status selector
export const selectBufferStats = createSelector(
  [selectCpuRingBuffer, selectMemoryRingBuffer, selectDiskRingBuffer, selectNetworkRingBuffer, selectProcessRingBuffer],
  (cpuBuffer, memoryBuffer, diskBuffer, networkBuffer, processBuffer) => ({
    cpu: {
      length: cpuBuffer.size,
      capacity: cpuBuffer.capacity,
      utilization: (cpuBuffer.size / cpuBuffer.capacity) * 100,
      isEmpty: cpuBuffer.size === 0,
      isFull: cpuBuffer.size === cpuBuffer.capacity
    },
    memory: {
      length: memoryBuffer.size,
      capacity: memoryBuffer.capacity,
      utilization: (memoryBuffer.size / memoryBuffer.capacity) * 100,
      isEmpty: memoryBuffer.size === 0,
      isFull: memoryBuffer.size === memoryBuffer.capacity
    },
    disk: {
      length: diskBuffer.size,
      capacity: diskBuffer.capacity,
      utilization: (diskBuffer.size / diskBuffer.capacity) * 100,
      isEmpty: diskBuffer.size === 0,
      isFull: diskBuffer.size === diskBuffer.capacity
    },
    network: {
      length: networkBuffer.size,
      capacity: networkBuffer.capacity,
      utilization: (networkBuffer.size / networkBuffer.capacity) * 100,
      isEmpty: networkBuffer.size === 0,
      isFull: networkBuffer.size === networkBuffer.capacity
    },
    processes: {
      length: processBuffer.size,
      capacity: processBuffer.capacity,
      utilization: (processBuffer.size / processBuffer.capacity) * 100,
      isEmpty: processBuffer.size === 0,
      isFull: processBuffer.size === processBuffer.capacity
    }
  })
)

export default telemetrySlice.reducer
