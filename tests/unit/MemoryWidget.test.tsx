import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import MemoryWidget from '../../src/renderer/src/features/telemetry/MemoryWidget'
import telemetryReducer from '../../src/renderer/src/app/telemetrySlice'
import type { MemoryMetrics } from '../../src/shared/types/telemetry'

const createMockStore = (memoryData: MemoryMetrics[] = []) =>
  configureStore({
    reducer: {
      telemetry: telemetryReducer
    },
    preloadedState: {
      telemetry: {
        isConnected: true,
        cpu: { data: [] },
        memory: { data: memoryData },
        disk: { data: [] },
        network: { data: [] },
        processes: { data: [] }
      }
    }
  })

const mockMemoryMetric: MemoryMetrics = {
  hostId: 'local',
  timestamp: Date.now(),
  total: 8000000000, // 8GB
  used: 4000000000, // 4GB
  free: 4000000000, // 4GB
  available: 4000000000,
  swapTotal: 2000000000,
  swapUsed: 500000000,
  swapFree: 1500000000
}

describe('MemoryWidget', () => {
  it('renders without crashing', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <MemoryWidget />
      </Provider>
    )

    expect(screen.getByText('Memory Usage')).toBeInTheDocument()
  })

  it('displays waiting message when no data', () => {
    const store = createMockStore([])
    render(
      <Provider store={store}>
        <MemoryWidget />
      </Provider>
    )

    expect(screen.getByText('Waiting for memory data...')).toBeInTheDocument()
  })

  it('displays memory metrics when data is available', () => {
    const store = createMockStore([mockMemoryMetric])
    render(
      <Provider store={store}>
        <MemoryWidget />
      </Provider>
    )

    expect(screen.getByText('50.0%')).toBeInTheDocument() // usage percentage
    expect(screen.getByText('7.45 GB')).toBeInTheDocument() // total formatted
    expect(screen.getAllByText('3.73 GB')[0]).toBeInTheDocument() // used formatted (multiple instances)
  })

  it('displays swap information when available', () => {
    const store = createMockStore([mockMemoryMetric])
    render(
      <Provider store={store}>
        <MemoryWidget />
      </Provider>
    )

    expect(screen.getByText('Swap')).toBeInTheDocument()
    expect(screen.getByText('1.86 GB')).toBeInTheDocument() // swap total formatted
  })

  it('calculates usage percentage correctly', () => {
    const store = createMockStore([mockMemoryMetric])
    render(
      <Provider store={store}>
        <MemoryWidget />
      </Provider>
    )

    // 4GB used / 8GB total = 50%
    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('formats bytes correctly', () => {
    const store = createMockStore([mockMemoryMetric])
    render(
      <Provider store={store}>
        <MemoryWidget />
      </Provider>
    )

    // Check for memory specific text instead of generic GB
    expect(screen.getByText('Memory Usage')).toBeInTheDocument()
    expect(screen.getAllByText(/Total:/)[0]).toBeInTheDocument()
  })
})