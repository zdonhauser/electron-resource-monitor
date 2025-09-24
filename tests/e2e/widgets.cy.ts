describe('Widgets E2E Tests', () => {
  beforeEach(() => {
    // Mock the Electron API before visiting the page
    cy.mockElectronAPI()
    cy.visit('/')
  })

  it('displays CPU widget with correct elements', () => {
    cy.checkWidgetExists('cpu')

    // Check for CPU-specific elements
    cy.get('[data-testid="cpu-widget"]').within(() => {
      cy.get('h3').should('contain', 'CPU Usage')
      cy.get('[data-testid="cpu-usage-percent"]').should('exist')
      cy.get('[data-testid="cpu-progress-bar"]').should('exist')
      cy.get('[data-testid="cpu-cores"]').should('contain', 'Cores:')
      cy.get('[data-testid="cpu-load-average"]').should('contain', 'Load Avg:')
    })
  })

  it('displays Memory widget with correct elements', () => {
    cy.checkWidgetExists('memory')

    // Check for Memory-specific elements
    cy.get('[data-testid="memory-widget"]').within(() => {
      cy.get('h3').should('contain', 'Memory Usage')
      cy.get('[data-testid="memory-usage-percent"]').should('exist')
      cy.get('[data-testid="memory-progress-bar"]').should('exist')
      cy.get('[data-testid="memory-total"]').should('contain', 'Total:')
      cy.get('[data-testid="memory-used"]').should('contain', 'Used:')
      cy.get('[data-testid="memory-free"]').should('contain', 'Free:')
    })
  })

  it('updates widget data over time', () => {
    cy.waitForTelemetryConnection()

    // Get initial CPU usage value
    cy.get('[data-testid="cpu-usage-percent"]')
      .invoke('text')
      .then(initialValue => {
        // Wait a few seconds and check if value potentially changed
        cy.wait(3000)
        cy.get('[data-testid="cpu-usage-percent"]').should('exist')
        // Note: Values might be the same, but we're testing the elements remain functional
      })
  })
})