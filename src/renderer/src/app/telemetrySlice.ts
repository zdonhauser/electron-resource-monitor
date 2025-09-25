import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  ProcessMetrics
} from '../../../shared/types/telemetry'

interface RingBuffer<T> {
  data: T[]
  maxSize: number
}

interface TelemetryState {
  cpu: RingBuffer<CpuMetrics>
  memory: RingBuffer<MemoryMetrics>
  disk: RingBuffer<DiskMetrics>
  network: RingBuffer<NetworkMetrics>
  processes: RingBuffer<ProcessMetrics>
  isConnected: boolean
  isSampling: boolean
}

const createRingBuffer = <T>(maxSize: number): RingBuffer<T> => ({
  data: [],
  maxSize
})

const addToRingBuffer = <T>(buffer: RingBuffer<T>, item: T): RingBuffer<T> => {
  const newData = [...buffer.data, item]
  if (newData.length > buffer.maxSize) {
    newData.shift()
  }
  return {
    ...buffer,
    data: newData
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
      state.cpu = addToRingBuffer(state.cpu, action.payload)
    },
    addMemoryMetrics: (state, action: PayloadAction<MemoryMetrics>) => {
      state.memory = addToRingBuffer(state.memory, action.payload)
    },
    addDiskMetrics: (state, action: PayloadAction<DiskMetrics>) => {
      state.disk = addToRingBuffer(state.disk, action.payload)
    },
    addNetworkMetrics: (state, action: PayloadAction<NetworkMetrics>) => {
      state.network = addToRingBuffer(state.network, action.payload)
    },
    addProcessMetrics: (state, action: PayloadAction<ProcessMetrics>) => {
      state.processes = addToRingBuffer(state.processes, action.payload)
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setSamplingStatus: (state, action: PayloadAction<boolean>) => {
      state.isSampling = action.payload
    },
    clearMetrics: (state, action: PayloadAction<keyof TelemetryState | 'all'>) => {
      if (action.payload === 'all') {
        state.cpu.data = []
        state.memory.data = []
        state.disk.data = []
        state.network.data = []
        state.processes.data = []
      } else if (action.payload in state && typeof state[action.payload] === 'object') {
        const key = action.payload as keyof Omit<TelemetryState, 'isConnected' | 'isSampling'>
        state[key].data = []
      }
    },
    clearAllTelemetryData: (state) => {
      state.cpu.data = []
      state.memory.data = []
      state.disk.data = []
      state.network.data = []
      state.processes.data = []
    },
    updateBufferSize: (
      state,
      action: PayloadAction<{
        metric: keyof Omit<TelemetryState, 'isConnected' | 'isSampling'>
        size: number
      }>
    ) => {
      const { metric, size } = action.payload
      state[metric].maxSize = size
      if (state[metric].data.length > size) {
        state[metric].data = state[metric].data.slice(-size)
      }
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

export default telemetrySlice.reducer
