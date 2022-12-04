import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        specPattern: "cypress/e2e/second.cy.ts",
        fixturesFolder: false,
        supportFile: false,
        baseUrl: "http://localhost:3000",
        viewportWidth: 900,
        // viewportHeight: 800,
        defaultCommandTimeout: 15000,
        video:false,
    }
  })