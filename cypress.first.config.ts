import { defineConfig } from 'cypress'

export default defineConfig({
    // fileServerFolder: "cypress/e2e",
    e2e: {
        specPattern: "cypress/e2e/app.cy.ts",
        fixturesFolder: false,
        supportFile: false,
        baseUrl: "http://localhost:3000",
        // viewportWidth: 400,
        // viewportHeight: 400,
        defaultCommandTimeout: 15000,
        video:false,
        // videosFolder: "cypress/videos-pair/first",
        // screenshotsFolder: "cypress/screenshots-pair/first",
        // $schema: "https://on.cypress.io/cypress.schema.json"
    }
  })