import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { TelemetrySampler } from '../../src/main/services/sampler/TelemetrySampler'
import type { TelemetrySettings } from '../../src/shared/types/telemetry'

// Mock child_process and os modules
jest.mock('child_process', () => ({
  execSync: jest.fn()
}))

jest.mock('os', () => ({
  cpus: jest.fn(),
  loadavg: jest.fn(),
  totalmem: jest.fn(),
  freemem: jest.fn()
}))

const mockExecSync = jest.requireMock('child_process').execSync
const mockOs = jest.requireMock('os')

describe('TelemetrySampler', () => {
  let sampler: TelemetrySampler

  beforeEach(() => {
    sampler = new TelemetrySampler()
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    sampler.stop()
    jest.useRealTimers()
  })

  it('should initialize with default settings', () => {
    const settings = sampler.getSettings()

    expect(settings.sampleInterval).toBe(250)
    expect(settings.enableCpu).toBe(true)
    expect(settings.enableMemory).toBe(true)
    expect(settings.enableDisk).toBe(false)
    expect(settings.enableNetwork).toBe(false)
    expect(settings.enableProcesses).toBe(false)
    expect(settings.maxDataPoints).toBe(1000)
  })

  it('should update settings', () => {
    const newSettings: Partial<TelemetrySettings> = {
      sampleInterval: 500,
      enableDisk: true
    }

    sampler.updateSettings(newSettings)
    const settings = sampler.getSettings()

    expect(settings.sampleInterval).toBe(500)
    expect(settings.enableDisk).toBe(true)
    expect(settings.enableCpu).toBe(true) // Should preserve existing settings
  })

  it('should start sampling', () => {
    const eventListener = jest.fn()
    sampler.on('telemetry', eventListener)

    // Mock os functions
    mockOs.cpus.mockReturnValue([
      { times: { idle: 1000, user: 100, nice: 0, sys: 50, irq: 0 } }
    ])
    mockOs.loadavg.mockReturnValue([1.0, 2.0, 3.0])
    mockOs.totalmem.mockReturnValue(8000000000)
    mockOs.freemem.mockReturnValue(4000000000)

    // Mock execSync for macOS CPU usage
    mockExecSync.mockReturnValue('CPU usage: 25.0% user, 10.0% sys, 65.0% idle')

    sampler.start()

    // Fast-forward time to trigger sampling
    jest.advanceTimersByTime(250)

    expect(eventListener).toHaveBeenCalled()
    const telemetryData = eventListener.mock.calls[0][0]
    expect(telemetryData).toHaveProperty('cpu')
    expect(telemetryData).toHaveProperty('memory')
  })

  it('should stop sampling', () => {
    sampler.start()
    expect(sampler['sampleTimer']).not.toBeNull()

    sampler.stop()
    expect(sampler['sampleTimer']).toBeNull()
  })

  it('should not start multiple timers', () => {
    sampler.start()
    const firstTimer = sampler['sampleTimer']

    sampler.start() // Try to start again
    const secondTimer = sampler['sampleTimer']

    expect(firstTimer).toBe(secondTimer)
  })

  it('should restart sampling when settings change', () => {
    sampler.start()
    const originalTimer = sampler['sampleTimer']

    sampler.updateSettings({ sampleInterval: 500 })

    // Timer should be different (restarted)
    expect(sampler['sampleTimer']).not.toBe(originalTimer)
  })

  it('should generate CPU metrics', () => {
    // Mock os.cpus
    mockOs.cpus.mockReturnValue([
      { times: { idle: 1000, user: 100, nice: 0, sys: 50, irq: 0 } },
      { times: { idle: 2000, user: 200, nice: 0, sys: 100, irq: 0 } }
    ])
    mockOs.loadavg.mockReturnValue([1.5, 2.5, 3.5])

    const cpuMetrics = sampler['getCpuMetrics']()

    expect(cpuMetrics).toHaveProperty('hostId', 'local')
    expect(cpuMetrics).toHaveProperty('timestamp')
    expect(cpuMetrics).toHaveProperty('usage')
    expect(cpuMetrics).toHaveProperty('cores', 2)
    expect(cpuMetrics.loadAverage).toEqual([1.5, 2.5, 3.5])
  })

  it('should generate memory metrics', () => {
    mockOs.totalmem.mockReturnValue(8000000000)
    mockOs.freemem.mockReturnValue(4000000000)

    const memoryMetrics = sampler['getMemoryMetrics']()

    expect(memoryMetrics).toHaveProperty('hostId', 'local')
    expect(memoryMetrics).toHaveProperty('timestamp')
    expect(memoryMetrics).toHaveProperty('total', 8000000000)
    expect(memoryMetrics).toHaveProperty('used', 4000000000)
    expect(memoryMetrics).toHaveProperty('free', 4000000000)
    expect(memoryMetrics).toHaveProperty('available', 4000000000)
  })

  it('should calculate CPU usage correctly', () => {
    const cpus = [
      { times: { idle: 1000, user: 100, nice: 0, sys: 50, irq: 0 } },
      { times: { idle: 2000, user: 200, nice: 0, sys: 100, irq: 0 } }
    ]

    // First call should return 0 (no previous data)
    const usage1 = sampler['calculateCpuUsage'](cpus)
    expect(usage1).toBe(0)

    // Second call with updated values
    const updatedCpus = [
      { times: { idle: 1100, user: 150, nice: 0, sys: 75, irq: 0 } },
      { times: { idle: 2100, user: 250, nice: 0, sys: 125, irq: 0 } }
    ]

    const usage2 = sampler['calculateCpuUsage'](updatedCpus)
    expect(usage2).toBeGreaterThan(0)
    expect(usage2).toBeLessThanOrEqual(100)
  })
})