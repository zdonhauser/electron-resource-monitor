import { describe, it, expect } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'
import telemetryReducer, {
  addCpuMetrics,
  addMemoryMetrics,
  setConnectionStatus,
  clearMetrics
} from '../../src/renderer/src/app/telemetrySlice'
import type { CpuMetrics, MemoryMetrics } from '../../src/shared/types/telemetry'

const createMockStore = () =>
  configureStore({
    reducer: {
      telemetry: telemetryReducer
    }
  })

describe('telemetrySlice', () => {
  it('should handle initial state', () => {
    const store = createMockStore()
    const state = store.getState().telemetry

    expect(state.isConnected).toBe(false)
    expect(state.cpu.data).toHaveLength(0)
    expect(state.memory.data).toHaveLength(0)
  })

  it('should handle setConnectionStatus', () => {
    const store = createMockStore()

    store.dispatch(setConnectionStatus(true))
    expect(store.getState().telemetry.isConnected).toBe(true)

    store.dispatch(setConnectionStatus(false))
    expect(store.getState().telemetry.isConnected).toBe(false)
  })

  it('should add CPU metrics', () => {
    const store = createMockStore()
    const cpuMetric: CpuMetrics = {
      hostId: 'test',
      timestamp: 1000,
      usage: 50.5,
      cores: 8,
      loadAverage: [1.0, 2.0, 3.0]
    }

    store.dispatch(addCpuMetrics(cpuMetric))
    const state = store.getState().telemetry

    expect(state.cpu.data).toHaveLength(1)
    expect(state.cpu.data[0]).toEqual(cpuMetric)
  })

  it('should add memory metrics', () => {
    const store = createMockStore()
    const memoryMetric: MemoryMetrics = {
      hostId: 'test',
      timestamp: 1000,
      total: 8000000000,
      used: 4000000000,
      free: 4000000000,
      available: 4000000000
    }

    store.dispatch(addMemoryMetrics(memoryMetric))
    const state = store.getState().telemetry

    expect(state.memory.data).toHaveLength(1)
    expect(state.memory.data[0]).toEqual(memoryMetric)
  })

  it('should maintain ring buffer with max data points', () => {
    const store = createMockStore()
    const maxPoints = 1000

    // Add more than max points
    for (let i = 0; i < maxPoints + 100; i++) {
      const cpuMetric: CpuMetrics = {
        hostId: 'test',
        timestamp: i,
        usage: i % 100,
        cores: 8,
        loadAverage: [1.0, 2.0, 3.0]
      }
      store.dispatch(addCpuMetrics(cpuMetric))
    }

    const state = store.getState().telemetry
    expect(state.cpu.data).toHaveLength(maxPoints)
    // Should keep the latest entries
    expect(state.cpu.data[0].timestamp).toBe(100) // First entry after trimming
    expect(state.cpu.data[maxPoints - 1].timestamp).toBe(maxPoints + 99) // Last entry
  })

  it('should clear telemetry data', () => {
    const store = createMockStore()

    // Add some data first
    store.dispatch(addCpuMetrics({
      hostId: 'test',
      timestamp: 1000,
      usage: 50,
      cores: 8,
      loadAverage: [1.0, 2.0, 3.0]
    }))

    store.dispatch(clearMetrics('all'))
    const state = store.getState().telemetry

    expect(state.cpu.data).toHaveLength(0)
    expect(state.memory.data).toHaveLength(0)
  })
})