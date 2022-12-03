import { defineConfig } from 'cypress'

export default defineConfig({
    // fileServerFolder: "cypress/e2e",
    e2e: {
        specPattern: "cypress/e2e/app2.cy.ts",
        fixturesFolder: false,
        supportFile: false,
        baseUrl: "http://localhost:3000",
        // viewportWidth: 1000,
        // viewportHeight: 800,
        defaultCommandTimeout: 15000,
        video:false,
        // videosFolder: "cypress/videos-pair/first",
        // screenshotsFolder: "cypress/screenshots-pair/first",
        // $schema: "https://on.cypress.io/cypress.schema.json"
    }
  })