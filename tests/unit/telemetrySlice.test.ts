import telemetryReducer, {
  addCpuMetrics,
  addMemoryMetrics,
  addDiskMetrics,
  addNetworkMetrics,
  addProcessMetrics,
  setConnectionStatus,
  setSamplingStatus,
  clearMetrics,
  clearAllTelemetryData,
  updateBufferSize,
  selectCpuData,
  selectMemoryData,
  selectLatestCpu,
  selectLatestMemory,
  selectRecentCpuData,
  selectBufferStats,
  TelemetryState
} from '../../src/renderer/src/app/telemetrySlice'
import type {
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  ProcessMetrics
} from '../../src/shared/types/telemetry'

// Mock telemetry data
const mockCpuMetrics: CpuMetrics = {
  timestamp: Date.now(),
  usage: 45.5,
  cores: [
    { usage: 40.0 },
    { usage: 50.0 },
    { usage: 45.0 },
    { usage: 48.0 }
  ]
}

const mockMemoryMetrics: MemoryMetrics = {
  timestamp: Date.now(),
  total: 16000000000,
  used: 8000000000,
  free: 8000000000,
  usage: 50.0
}

const mockDiskMetrics: DiskMetrics = {
  timestamp: Date.now(),
  disks: [
    {
      device: '/dev/disk1',
      mountpoint: '/',
      total: 500000000000,
      used: 250000000000,
      free: 250000000000,
      usage: 50.0
    }
  ]
}

const mockNetworkMetrics: NetworkMetrics = {
  timestamp: Date.now(),
  interfaces: [
    {
      name: 'en0',
      bytesReceived: 1000000,
      bytesSent: 500000,
      packetsReceived: 1000,
      packetsSent: 500
    }
  ]
}

const mockProcessMetrics: ProcessMetrics = {
  timestamp: Date.now(),
  processes: [
    {
      pid: 1234,
      name: 'test-process',
      cpu: 25.0,
      memory: 1000000000
    }
  ]
}

describe('telemetrySlice (Serializable)', () => {
  let initialState: TelemetryState

  beforeEach(() => {
    initialState = telemetryReducer(undefined, { type: 'unknown' })
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(initialState.cpu).toHaveProperty('buffer')
      expect(initialState.cpu).toHaveProperty('head', 0)
      expect(initialState.cpu).toHaveProperty('tail', 0)
      expect(initialState.cpu).toHaveProperty('size', 0)
      expect(initialState.cpu).toHaveProperty('capacity')
      expect(initialState.isConnected).toBe(false)
      expect(initialState.isSampling).toBe(false)
      
      // Check buffer capacities
      expect(initialState.cpu.capacity).toBe(300)
      expect(initialState.memory.capacity).toBe(300)
      expect(initialState.disk.capacity).toBe(60)
      expect(initialState.network.capacity).toBe(60)
      expect(initialState.processes.capacity).toBe(20)
    })

    it('should be serializable', () => {
      expect(() => JSON.stringify(initialState)).not.toThrow()
      const serialized = JSON.stringify(initialState)
      const deserialized = JSON.parse(serialized)
      expect(deserialized.cpu.capacity).toBe(300)
    })
  })

  describe('adding metrics', () => {
    it('should add CPU metrics to ring buffer', () => {
      const state = telemetryReducer(initialState, addCpuMetrics(mockCpuMetrics))
      
      expect(state.cpu.size).toBe(1)
      expect(selectLatestCpu({ telemetry: state })).toEqual(mockCpuMetrics)
      expect(selectCpuData({ telemetry: state })).toEqual([mockCpuMetrics])
    })

    it('should add memory metrics to ring buffer', () => {
      const state = telemetryReducer(initialState, addMemoryMetrics(mockMemoryMetrics))
      
      expect(state.memory.size).toBe(1)
      expect(selectLatestMemory({ telemetry: state })).toEqual(mockMemoryMetrics)
      expect(selectMemoryData({ telemetry: state })).toEqual([mockMemoryMetrics])
    })

    it('should add disk metrics to ring buffer', () => {
      const state = telemetryReducer(initialState, addDiskMetrics(mockDiskMetrics))
      
      expect(state.disk.size).toBe(1)
      expect(selectCpuData({ telemetry: state })).toEqual([]) // CPU should be empty
    })

    it('should add network metrics to ring buffer', () => {
      const state = telemetryReducer(initialState, addNetworkMetrics(mockNetworkMetrics))
      
      expect(state.network.size).toBe(1)
    })

    it('should add process metrics to ring buffer', () => {
      const state = telemetryReducer(initialState, addProcessMetrics(mockProcessMetrics))
      
      expect(state.processes.size).toBe(1)
    })

    it('should handle multiple metrics additions', () => {
      let state = initialState
      
      const cpuMetrics1 = { ...mockCpuMetrics, timestamp: 1000 }
      const cpuMetrics2 = { ...mockCpuMetrics, timestamp: 2000 }
      const cpuMetrics3 = { ...mockCpuMetrics, timestamp: 3000 }
      
      state = telemetryReducer(state, addCpuMetrics(cpuMetrics1))
      state = telemetryReducer(state, addCpuMetrics(cpuMetrics2))
      state = telemetryReducer(state, addCpuMetrics(cpuMetrics3))
      
      expect(state.cpu.size).toBe(3)
      expect(selectCpuData({ telemetry: state })).toEqual([cpuMetrics1, cpuMetrics2, cpuMetrics3])
      expect(selectLatestCpu({ telemetry: state })).toEqual(cpuMetrics3)
    })

    it('should handle buffer overflow correctly', () => {
      // Create initial state and modify capacity for testing
      let state = initialState
      // First resize to smaller capacity
      state = telemetryReducer(state, updateBufferSize({ metric: 'cpu', size: 2 }))
      
      const cpuMetrics1 = { ...mockCpuMetrics, timestamp: 1000 }
      const cpuMetrics2 = { ...mockCpuMetrics, timestamp: 2000 }
      const cpuMetrics3 = { ...mockCpuMetrics, timestamp: 3000 }
      
      state = telemetryReducer(state, addCpuMetrics(cpuMetrics1))
      state = telemetryReducer(state, addCpuMetrics(cpuMetrics2))
      state = telemetryReducer(state, addCpuMetrics(cpuMetrics3)) // Should overwrite first
      
      expect(state.cpu.size).toBe(2)
      expect(selectCpuData({ telemetry: state })).toEqual([cpuMetrics2, cpuMetrics3])
      expect(selectLatestCpu({ telemetry: state })).toEqual(cpuMetrics3)
    })
  })

  describe('connection and sampling status', () => {
    it('should set connection status', () => {
      const state = telemetryReducer(initialState, setConnectionStatus(true))
      expect(state.isConnected).toBe(true)
    })

    it('should set sampling status', () => {
      const state = telemetryReducer(initialState, setSamplingStatus(true))
      expect(state.isSampling).toBe(true)
    })
  })

  describe('clearing metrics', () => {
    let populatedState: TelemetryState

    beforeEach(() => {
      populatedState = initialState
      populatedState = telemetryReducer(populatedState, addCpuMetrics(mockCpuMetrics))
      populatedState = telemetryReducer(populatedState, addMemoryMetrics(mockMemoryMetrics))
      populatedState = telemetryReducer(populatedState, addDiskMetrics(mockDiskMetrics))
      populatedState = telemetryReducer(populatedState, addNetworkMetrics(mockNetworkMetrics))
      populatedState = telemetryReducer(populatedState, addProcessMetrics(mockProcessMetrics))
    })

    it('should clear specific metric buffer', () => {
      const state = telemetryReducer(populatedState, clearMetrics('cpu'))
      
      expect(state.cpu.size).toBe(0)
      expect(state.memory.size).toBe(1) // Other buffers unchanged
    })

    it('should clear all metric buffers', () => {
      const state = telemetryReducer(populatedState, clearMetrics('all'))
      
      expect(state.cpu.size).toBe(0)
      expect(state.memory.size).toBe(0)
      expect(state.disk.size).toBe(0)
      expect(state.network.size).toBe(0)
      expect(state.processes.size).toBe(0)
    })

    it('should clear all telemetry data', () => {
      const state = telemetryReducer(populatedState, clearAllTelemetryData())
      
      expect(state.cpu.size).toBe(0)
      expect(state.memory.size).toBe(0)
      expect(state.disk.size).toBe(0)
      expect(state.network.size).toBe(0)
      expect(state.processes.size).toBe(0)
    })
  })

  describe('buffer size updates', () => {
    it('should update buffer size and preserve data', () => {
      let state = initialState
      
      // Add some data
      state = telemetryReducer(state, addCpuMetrics({ ...mockCpuMetrics, timestamp: 1000 }))
      state = telemetryReducer(state, addCpuMetrics({ ...mockCpuMetrics, timestamp: 2000 }))
      state = telemetryReducer(state, addCpuMetrics({ ...mockCpuMetrics, timestamp: 3000 }))
      
      // Expand buffer
      state = telemetryReducer(state, updateBufferSize({ metric: 'cpu', size: 500 }))
      
      expect(state.cpu.capacity).toBe(500)
      expect(state.cpu.size).toBe(3) // Data preserved
    })

    it('should shrink buffer and keep recent data', () => {
      let state = initialState
      
      // Add data
      const metrics = [
        { ...mockCpuMetrics, timestamp: 1000 },
        { ...mockCpuMetrics, timestamp: 2000 },
        { ...mockCpuMetrics, timestamp: 3000 },
        { ...mockCpuMetrics, timestamp: 4000 },
        { ...mockCpuMetrics, timestamp: 5000 }
      ]
      
      metrics.forEach(metric => {
        state = telemetryReducer(state, addCpuMetrics(metric))
      })
      
      // Shrink buffer to 3
      state = telemetryReducer(state, updateBufferSize({ metric: 'cpu', size: 3 }))
      
      expect(state.cpu.capacity).toBe(3)
      expect(state.cpu.size).toBe(3)
      expect(selectCpuData({ telemetry: state })).toEqual([
        { ...mockCpuMetrics, timestamp: 3000 },
        { ...mockCpuMetrics, timestamp: 4000 },
        { ...mockCpuMetrics, timestamp: 5000 }
      ])
    })
  })

  describe('selectors', () => {
    let rootState: { telemetry: TelemetryState }

    beforeEach(() => {
      let telemetryState = initialState
      telemetryState = telemetryReducer(telemetryState, addCpuMetrics({ ...mockCpuMetrics, timestamp: 1000 }))
      telemetryState = telemetryReducer(telemetryState, addCpuMetrics({ ...mockCpuMetrics, timestamp: 2000 }))
      telemetryState = telemetryReducer(telemetryState, addCpuMetrics({ ...mockCpuMetrics, timestamp: 3000 }))
      
      telemetryState = telemetryReducer(telemetryState, addMemoryMetrics({ ...mockMemoryMetrics, timestamp: 1000 }))
      telemetryState = telemetryReducer(telemetryState, addMemoryMetrics({ ...mockMemoryMetrics, timestamp: 2000 }))
      
      rootState = { telemetry: telemetryState }
    })

    it('should select CPU data', () => {
      const cpuData = selectCpuData(rootState)
      expect(cpuData).toHaveLength(3)
      expect(cpuData[0].timestamp).toBe(1000)
      expect(cpuData[2].timestamp).toBe(3000)
    })

    it('should select memory data', () => {
      const memoryData = selectMemoryData(rootState)
      expect(memoryData).toHaveLength(2)
      expect(memoryData[0].timestamp).toBe(1000)
      expect(memoryData[1].timestamp).toBe(2000)
    })

    it('should select latest CPU metrics', () => {
      const latestCpu = selectLatestCpu(rootState)
      expect(latestCpu?.timestamp).toBe(3000)
    })

    it('should select latest memory metrics', () => {
      const latestMemory = selectLatestMemory(rootState)
      expect(latestMemory?.timestamp).toBe(2000)
    })

    it('should select recent CPU data', () => {
      const recentCpuData = selectRecentCpuData(2)(rootState)
      expect(recentCpuData).toHaveLength(2)
      expect(recentCpuData[0].timestamp).toBe(2000)
      expect(recentCpuData[1].timestamp).toBe(3000)
    })

    it('should select buffer stats', () => {
      const bufferStats = selectBufferStats(rootState)
      
      expect(bufferStats.cpu.length).toBe(3)
      expect(bufferStats.cpu.capacity).toBe(300)
      expect(bufferStats.cpu.utilization).toBe(1) // 3/300 * 100 = 1%
      expect(bufferStats.cpu.isEmpty).toBe(false)
      expect(bufferStats.cpu.isFull).toBe(false)
      
      expect(bufferStats.memory.length).toBe(2)
      expect(bufferStats.memory.capacity).toBe(300)
    })
  })

  describe('performance characteristics', () => {
    it('should handle high-frequency updates efficiently', () => {
      let state = initialState
      const startTime = performance.now()
      
      // Simulate 1000 rapid updates
      for (let i = 0; i < 1000; i++) {
        const metrics = { ...mockCpuMetrics, timestamp: i }
        state = telemetryReducer(state, addCpuMetrics(metrics))
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete reasonably quickly (less than 200ms on modern hardware)
      expect(duration).toBeLessThan(200)
      expect(state.cpu.size).toBe(300) // Buffer capacity
      expect(selectLatestCpu({ telemetry: state })?.timestamp).toBe(999)
    })

    it('should maintain data integrity during wraparound', () => {
      // Start with small buffer
      let state = telemetryReducer(initialState, updateBufferSize({ metric: 'cpu', size: 5 }))
      
      // Add 10 items (causing wraparound)
      for (let i = 0; i < 10; i++) {
        const metrics = { ...mockCpuMetrics, timestamp: i }
        state = telemetryReducer(state, addCpuMetrics(metrics))
      }
      
      expect(state.cpu.size).toBe(5)
      
      const allData = selectCpuData({ telemetry: state })
      expect(allData).toHaveLength(5)
      expect(allData[0].timestamp).toBe(5) // Oldest remaining
      expect(allData[4].timestamp).toBe(9) // Most recent
    })
  })

  describe('serialization', () => {
    it('should maintain state after serialization/deserialization', () => {
      let state = initialState
      state = telemetryReducer(state, addCpuMetrics(mockCpuMetrics))
      state = telemetryReducer(state, addMemoryMetrics(mockMemoryMetrics))
      state = telemetryReducer(state, setConnectionStatus(true))
      
      // Serialize and deserialize
      const serialized = JSON.stringify(state)
      const deserialized = JSON.parse(serialized)
      
      // Verify structure is maintained
      expect(deserialized.cpu.size).toBe(1)
      expect(deserialized.memory.size).toBe(1)
      expect(deserialized.isConnected).toBe(true)
      expect(deserialized.cpu.buffer[0]).toEqual(mockCpuMetrics)
    })
  })
})