import '@testing-library/jest-dom'

// Mock fs module for Node.js environments
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}))

// Mock electron module
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/path'),
    getVersion: jest.fn(() => '1.0.0')
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn()
  },
  BrowserWindow: jest.fn()
}))

// Mock better-sqlite3
jest.mock('better-sqlite3', () => {
  const mockDb = {
    pragma: jest.fn(),
    prepare: jest.fn(() => ({
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn()
    })),
    exec: jest.fn(),
    close: jest.fn()
  }
  return jest.fn(() => mockDb)
})

// Add TextEncoder/TextDecoder for jsdom environment
Object.assign(global, {
  TextEncoder: require('util').TextEncoder,
  TextDecoder: require('util').TextDecoder
})

// Mock Electron APIs
const mockElectronAPI = {
  startSampling: jest.fn(),
  stopSampling: jest.fn(),
  updateSettings: jest.fn(),
  getSettings: jest.fn().mockResolvedValue({
    sampleInterval: 250,
    enableCpu: true,
    enableMemory: true,
    enableDisk: false,
    enableNetwork: false,
    enableProcesses: false,
    maxDataPoints: 1000
  }),
  onTelemetryData: jest.fn().mockReturnValue(() => {}),
  onCpuMetrics: jest.fn().mockReturnValue(() => {}),
  onMemoryMetrics: jest.fn().mockReturnValue(() => {}),
  queryDatabase: jest.fn(),
  exportData: jest.fn()
}

// Mock window.telemetry
Object.defineProperty(window, 'telemetry', {
  value: mockElectronAPI,
  writable: true
})

// Mock Plotly
jest.mock('plotly.js-basic-dist-min', () => ({
  newPlot: jest.fn(),
  purge: jest.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Suppress console.error and console.warn in tests unless explicitly needed
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning') || args[0].includes('React'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning')) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})