import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    reducedMotion: 'no-preference',
  },
  webServer: {
    command: 'npm run dev -- -p 3100',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
