describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Mock the Electron API before visiting the page
    cy.mockElectronAPI()
    cy.visit('/')
  })

  it('loads the dashboard successfully', () => {
    cy.get('h1').should('contain', 'Resource Monitor')
    cy.get('[data-testid="connection-status"]').should('exist')
  })

  it('displays CPU and Memory widgets', () => {
    cy.get('h3').should('contain', 'CPU Usage')
    cy.get('h3').should('contain', 'Memory Usage')
  })

  it('shows telemetry data when connected', () => {
    // Wait for connection
    cy.waitForTelemetryConnection()

    // Check that widgets show data instead of waiting message
    cy.get('[data-testid="cpu-widget"]').should('not.contain', 'Waiting for CPU data')
    cy.get('[data-testid="memory-widget"]').should('not.contain', 'Waiting for memory data')
  })
})