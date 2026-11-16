import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    ...devices['Desktop Chrome'],
    channel: 'msedge',
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    headless: true,
  },
  reporter: 'list',
});
