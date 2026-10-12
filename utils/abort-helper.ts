import fs from 'fs';
import path from 'path';
import type { Browser } from '@playwright/test';

export const executionAbortFile = path.join(
  process.cwd(),
  "execution-aborted.flag"
);

export function markExecutionAborted() {
  fs.writeFileSync(executionAbortFile, "aborted");
  console.log("🛑 Execution abort file created");
}

export function isExecutionAborted() {
  return fs.existsSync(executionAbortFile);
}

export function startAbortBrowserWatcher(browser: Browser) {
  let stopped = false;
  let closeStarted = false;

  const timer = setInterval(() => {
    if (stopped || closeStarted || !isExecutionAborted()) return;

    closeStarted = true;
    clearInterval(timer);
    console.log('🛑 Abort flag detected. Closing the Playwright browser gracefully.');
    void browser.close().catch((error) => {
      console.log(`⚠️ Browser close during abort completed with: ${error.message}`);
    });
  }, 100);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}