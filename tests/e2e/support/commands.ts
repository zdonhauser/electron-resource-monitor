/// <reference types="cypress" />

// Custom Cypress commands for Resource Monitor

declare global {
  namespace Cypress {
    interface Chainable {
      waitForTelemetryConnection(): Chainable<void>
      checkWidgetExists(widgetName: string): Chainable<void>
      mockElectronAPI(): Chainable<void>
    }
  }
}

// Wait for telemetry connection
Cypress.Commands.add('waitForTelemetryConnection', () => {
  cy.get('[data-testid="connection-status"]', { timeout: 10000 }).should('contain', 'Connected')
})

// Check if a widget exists
Cypress.Commands.add('checkWidgetExists', (widgetName: string) => {
  cy.get(`[data-testid="${widgetName}-widget"]`).should('exist').and('be.visible')
})

// Mock Electron API for browser testing
Cypress.Commands.add('mockElectronAPI', () => {
  cy.window().then((win) => {
    // Mock the telemetry API that the app expects
    win.telemetry = {
      // Mock telemetry data listeners
      onTelemetryData: cy.stub().callsFake((callback) => {
        // Simulate some telemetry data after a short delay
        setTimeout(() => {
          callback({
            cpu: {
              hostId: 'test-host',
              timestamp: Date.now(),
              usage: 45.5,
              cores: 8,
              loadAverage: [1.2, 1.5, 1.8],
              temperature: 65.0
            },
            memory: {
              hostId: 'test-host',
              timestamp: Date.now(),
              total: 8000000000, // 8GB
              used: 4000000000,  // 4GB
              free: 4000000000,  // 4GB
              available: 4000000000, // 4GB
              swapTotal: 2000000000,
              swapUsed: 500000000,
              swapFree: 1500000000
            }
          })
        }, 100)

        // Return cleanup function
        return () => {}
      }),

      // Mock API methods
      startSampling: cy.stub().as('startSampling'),
      stopSampling: cy.stub().as('stopSampling'),
      onCpuMetrics: cy.stub().returns(() => {}),
      onMemoryMetrics: cy.stub().returns(() => {}),
      onDiskMetrics: cy.stub().returns(() => {}),
      onNetworkMetrics: cy.stub().returns(() => {}),
      onProcessMetrics: cy.stub().returns(() => {}),
      onConnectionStatus: cy.stub().returns(() => {}),

      // Mock settings API
      updateSettings: cy.stub(),
      getSettings: cy.stub().resolves({
        sampleInterval: 250,
        enableCpu: true,
        enableMemory: true,
        enableDisk: false,
        enableNetwork: false,
        enableProcesses: false,
        maxDataPoints: 1000
      }),

      // Mock database API
      queryDatabase: cy.stub().resolves([]),
      exportData: cy.stub().resolves('')
    }

    // Also add it to globalThis for compatibility
    globalThis.telemetry = win.telemetry
  })
})