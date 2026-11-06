import { defineConfig, devices } from '@playwright/test'

const port = process.env.MAP_E2E_PORT ?? '3100'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'map-canvas.spec.ts',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 25_000 },
  outputDir: 'test-results',
  reporter: [
    ['line'],
    ['json', { outputFile: process.env.PET101_JSON_REPORT ?? 'test-results/pet101-map.json' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npx tsx tests/e2e/web-server.ts',
    url: `http://127.0.0.1:${port}/map`,
    // An already answering port belongs to some other process. Reusing it could
    // hide a different DATABASE_URL. Playwright must start this server or fail.
    reuseExistingServer: false,
    timeout: 180_000,
    env: { MAP_E2E_PORT: port },
  },
})
