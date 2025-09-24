describe('Navigation E2E Tests', () => {
  beforeEach(() => {
    // Mock the Electron API before visiting the page
    cy.mockElectronAPI()
    cy.visit('/')
  })

  it('navigates to settings page', () => {
    // Look for settings navigation (assuming there's a settings link/button)
    cy.get('[data-testid="settings-nav"]').click()
    cy.url().should('include', '/settings')
    cy.get('h1').should('contain', 'Settings')
  })

  it('navigates to alerts page', () => {
    // Look for alerts navigation
    cy.get('[data-testid="alerts-nav"]').click()
    cy.url().should('include', '/alerts')
    cy.get('h1').should('contain', 'Alerts')
  })

  it('navigates back to dashboard', () => {
    // Go to settings first
    cy.visit('/settings')

    // Navigate back to dashboard
    cy.get('[data-testid="dashboard-nav"]').click()
    cy.url().should('not.include', '/settings')
    cy.get('h1').should('contain', 'Resource Monitor')
  })
})