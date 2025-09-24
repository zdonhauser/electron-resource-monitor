import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import CpuWidget from '../../src/renderer/src/features/telemetry/CpuWidget'
import telemetryReducer from '../../src/renderer/src/app/telemetrySlice'
import type { CpuMetrics } from '../../src/shared/types/telemetry'

const createMockStore = (cpuData: CpuMetrics[] = []) =>
  configureStore({
    reducer: {
      telemetry: telemetryReducer
    },
    preloadedState: {
      telemetry: {
        isConnected: true,
        cpu: { data: cpuData },
        memory: { data: [] },
        disk: { data: [] },
        network: { data: [] },
        processes: { data: [] }
      }
    }
  })

const mockCpuMetric: CpuMetrics = {
  hostId: 'local',
  timestamp: Date.now(),
  usage: 45.5,
  cores: 8,
  loadAverage: [1.2, 1.8, 2.1]
}

describe('CpuWidget', () => {
  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    expect(screen.getByText('CPU Usage')).toBeInTheDocument()
  })

  it('displays waiting message when no data', () => {
    const store = createMockStore([])
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    expect(screen.getByText('Waiting for CPU data...')).toBeInTheDocument()
  })

  it('displays CPU metrics when data is available', () => {
    const store = createMockStore([mockCpuMetric])
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    expect(screen.getByText('45.5%')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument() // cores
    expect(screen.getByText('1.20, 1.80, 2.10')).toBeInTheDocument() // load average
  })

  it('displays current usage label', () => {
    const store = createMockStore([mockCpuMetric])
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    expect(screen.getByText('Current Usage')).toBeInTheDocument()
  })

  it('displays sample count', () => {
    const multipleMetrics = [mockCpuMetric, mockCpuMetric, mockCpuMetric]
    const store = createMockStore(multipleMetrics)
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    expect(screen.getByText('3 samples')).toBeInTheDocument()
  })

  it('displays last updated timestamp', () => {
    const store = createMockStore([mockCpuMetric])
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('displays temperature when available', () => {
    const cpuWithTemp = { ...mockCpuMetric, temperature: 65.5 }
    const store = createMockStore([cpuWithTemp])
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    expect(screen.getByText('65.5°C')).toBeInTheDocument()
  })

  it('updates progress bar width based on CPU usage', () => {
    const store = createMockStore([mockCpuMetric])
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    const progressBar = document.querySelector('.bg-blue-600')
    expect(progressBar).toHaveStyle({ width: '45.5%' })
  })
})