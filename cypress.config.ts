import { defineConfig } from 'cypress'

export default defineConfig({
  blockHosts: [
    '*googletagmanager.com',
    '*google-analytics.com',
    '*doubleclick.net',
  ],
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 60000,
  video: false,
  waitForAnimations: false,
  viewportWidth: 1000,
  viewportHeight: 1000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8000',
  },
})
