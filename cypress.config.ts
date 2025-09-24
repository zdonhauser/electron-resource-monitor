import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/e2e.ts',
    videosFolder: 'tests/e2e/videos',
    screenshotsFolder: 'tests/e2e/screenshots',
    downloadsFolder: 'tests/e2e/downloads',
    fixturesFolder: 'tests/e2e/fixtures',
    viewportWidth: 1400,
    viewportHeight: 900,
    video: false,
    screenshot: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
})