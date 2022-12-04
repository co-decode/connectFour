import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        specPattern: "cypress/e2e/first.cy.ts",
        fixturesFolder: false,
        supportFile: false,
        baseUrl: "http://localhost:3000",
        defaultCommandTimeout: 15000,
        video:false,
    }
  })