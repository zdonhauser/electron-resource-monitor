import { describe, it, expect } from '@jest/globals'
import {
  CpuMetricsSchema,
  MemoryMetricsSchema,
  TelemetryDataSchema,
  TelemetrySettingsSchema
} from '../../src/shared/schemas/telemetry.schema'

describe('Telemetry Schemas', () => {
  describe('CpuMetricsSchema', () => {
    it('should validate valid CPU metrics', () => {
      const validCpuMetrics = {
        hostId: 'test',
        timestamp: Date.now(),
        usage: 50.5,
        cores: 8,
        loadAverage: [1.0, 2.0, 3.0]
      }

      expect(() => CpuMetricsSchema.parse(validCpuMetrics)).not.toThrow()
    })

    it('should reject invalid CPU usage', () => {
      const invalidCpuMetrics = {
        hostId: 'test',
        timestamp: Date.now(),
        usage: 150, // Invalid: > 100
        cores: 8,
        loadAverage: [1.0, 2.0, 3.0]
      }

      expect(() => CpuMetricsSchema.parse(invalidCpuMetrics)).toThrow()
    })

    it('should reject negative cores', () => {
      const invalidCpuMetrics = {
        hostId: 'test',
        timestamp: Date.now(),
        usage: 50,
        cores: -1, // Invalid: negative
        loadAverage: [1.0, 2.0, 3.0]
      }

      expect(() => CpuMetricsSchema.parse(invalidCpuMetrics)).toThrow()
    })

    it('should accept optional temperature', () => {
      const cpuWithTemp = {
        hostId: 'test',
        timestamp: Date.now(),
        usage: 50,
        cores: 8,
        loadAverage: [1.0, 2.0, 3.0],
        temperature: 65.5
      }

      expect(() => CpuMetricsSchema.parse(cpuWithTemp)).not.toThrow()
    })
  })

  describe('MemoryMetricsSchema', () => {
    it('should validate valid memory metrics', () => {
      const validMemoryMetrics = {
        hostId: 'test',
        timestamp: Date.now(),
        total: 8000000000,
        used: 4000000000,
        free: 4000000000,
        available: 4000000000
      }

      expect(() => MemoryMetricsSchema.parse(validMemoryMetrics)).not.toThrow()
    })

    it('should reject negative values', () => {
      const invalidMemoryMetrics = {
        hostId: 'test',
        timestamp: Date.now(),
        total: -1000000000, // Invalid: negative
        used: 4000000000,
        free: 4000000000,
        available: 4000000000
      }

      expect(() => MemoryMetricsSchema.parse(invalidMemoryMetrics)).toThrow()
    })

    it('should accept optional swap metrics', () => {
      const memoryWithSwap = {
        hostId: 'test',
        timestamp: Date.now(),
        total: 8000000000,
        used: 4000000000,
        free: 4000000000,
        available: 4000000000,
        swapTotal: 2000000000,
        swapUsed: 500000000,
        swapFree: 1500000000
      }

      expect(() => MemoryMetricsSchema.parse(memoryWithSwap)).not.toThrow()
    })
  })

  describe('TelemetryDataSchema', () => {
    it('should validate telemetry data with all metrics', () => {
      const fullTelemetryData = {
        cpu: {
          hostId: 'test',
          timestamp: Date.now(),
          usage: 50,
          cores: 8,
          loadAverage: [1.0, 2.0, 3.0]
        },
        memory: {
          hostId: 'test',
          timestamp: Date.now(),
          total: 8000000000,
          used: 4000000000,
          free: 4000000000,
          available: 4000000000
        }
      }

      expect(() => TelemetryDataSchema.parse(fullTelemetryData)).not.toThrow()
    })

    it('should validate empty telemetry data', () => {
      const emptyData = {}
      expect(() => TelemetryDataSchema.parse(emptyData)).not.toThrow()
    })

    it('should validate partial telemetry data', () => {
      const partialData = {
        cpu: {
          hostId: 'test',
          timestamp: Date.now(),
          usage: 50,
          cores: 8,
          loadAverage: [1.0, 2.0, 3.0]
        }
      }

      expect(() => TelemetryDataSchema.parse(partialData)).not.toThrow()
    })
  })

  describe('TelemetrySettingsSchema', () => {
    it('should validate valid settings', () => {
      const validSettings = {
        sampleInterval: 250,
        enableCpu: true,
        enableMemory: true,
        enableDisk: false,
        enableNetwork: false,
        enableProcesses: false,
        maxDataPoints: 1000
      }

      expect(() => TelemetrySettingsSchema.parse(validSettings)).not.toThrow()
    })

    it('should reject sample interval too low', () => {
      const invalidSettings = {
        sampleInterval: 50, // Invalid: < 100
        enableCpu: true,
        enableMemory: true,
        enableDisk: false,
        enableNetwork: false,
        enableProcesses: false,
        maxDataPoints: 1000
      }

      expect(() => TelemetrySettingsSchema.parse(invalidSettings)).toThrow()
    })

    it('should reject sample interval too high', () => {
      const invalidSettings = {
        sampleInterval: 70000, // Invalid: > 60000
        enableCpu: true,
        enableMemory: true,
        enableDisk: false,
        enableNetwork: false,
        enableProcesses: false,
        maxDataPoints: 1000
      }

      expect(() => TelemetrySettingsSchema.parse(invalidSettings)).toThrow()
    })

    it('should reject invalid maxDataPoints', () => {
      const invalidSettings = {
        sampleInterval: 250,
        enableCpu: true,
        enableMemory: true,
        enableDisk: false,
        enableNetwork: false,
        enableProcesses: false,
        maxDataPoints: 5 // Invalid: < 10
      }

      expect(() => TelemetrySettingsSchema.parse(invalidSettings)).toThrow()
    })
  })
})