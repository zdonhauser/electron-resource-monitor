import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import CpuWidget from '../../src/renderer/src/features/telemetry/CpuWidget'
import telemetryReducer from '../../src/renderer/src/app/telemetrySlice'

// Mock Plotly
jest.mock('plotly.js-basic-dist-min', () => ({
  newPlot: jest.fn().mockResolvedValue(undefined),
  react: jest.fn().mockResolvedValue(undefined),
  purge: jest.fn()
}))

// Mock performance measurement
jest.mock('../../src/renderer/src/utils/PerformanceMeasurement', () => ({
  performanceMeasurement: {
    startMeasurement: jest.fn().mockReturnValue('test-id'),
    endMeasurement: jest.fn()
  }
}))

describe('CpuWidget Optimization', () => {
  let store: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    store = configureStore({
      reducer: {
        telemetry: telemetryReducer,
        settings: () => ({ darkMode: false }),
        layout: () => ({ sidebarCollapsed: false }),
        alerts: () => ({ alerts: [] })
      }
    })

    // Add some test CPU data
    store.dispatch({
      type: 'telemetry/addCpuMetrics',
      payload: {
        hostId: 'test',
        timestamp: Date.now(),
        usage: 50,
        cores: 8,
        loadAverage: [1.0, 1.1, 1.2],
        temperature: 60
      }
    })
  })

  it('should initialize chart with Plotly.newPlot once', () => {
    const Plotly = require('plotly.js-basic-dist-min')
    
    render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    // Should call newPlot once for initialization
    expect(Plotly.newPlot).toHaveBeenCalledTimes(1)
    expect(Plotly.react).not.toHaveBeenCalled()
  })

  it('should use Plotly.react for subsequent updates', async () => {
    const Plotly = require('plotly.js-basic-dist-min')
    
    const { rerender } = render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    // Clear the initial newPlot call
    jest.clearAllMocks()

    // Add more CPU data to trigger an update
    store.dispatch({
      type: 'telemetry/addCpuMetrics',
      payload: {
        hostId: 'test',
        timestamp: Date.now() + 1000,
        usage: 75,
        cores: 8,
        loadAverage: [1.5, 1.6, 1.7],
        temperature: 65
      }
    })

    // Rerender to trigger the effect
    rerender(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    // Should use react for updates, not newPlot
    expect(Plotly.react).toHaveBeenCalled()
    expect(Plotly.newPlot).not.toHaveBeenCalled()
  })

  it('should clean up with Plotly.purge on unmount', () => {
    const Plotly = require('plotly.js-basic-dist-min')
    
    const { unmount } = render(
      <Provider store={store}>
        <CpuWidget />
      </Provider>
    )

    unmount()

    expect(Plotly.purge).toHaveBeenCalled()
  })
})