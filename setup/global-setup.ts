/**
 * global-setup.ts: This module is responsible for setting up the global state before all tests start.
 * It includes a default export function that runs before all tests, setting up any necessary global context.
 * By centralizing these setup operations, it ensures a consistent starting point for all tests, improving test reliability.
 * You can add any initialization setup code within this function.
 */


import { chromium, firefox, FullConfig } from '@playwright/test';
import * as loginPage from "../pages/GPA/Residential/LoginPage";
import * as path from 'path';
import * as fs from 'fs';


const STORAGE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds 

async function globalSetup(config: FullConfig) {
  const projects = config.projects.map((p) => p.name.toLowerCase());

  for (const browserName of ['chromium', 'firefox','edge']) {
    if (!projects.includes(browserName)) continue;

    const storagePath = path.resolve(
      process.cwd(),
      `storageState-${browserName}.json`,
    );

    // Check if storage exists and is recent
    let shouldLogin = true;
    if (fs.existsSync(storagePath)) {
      const stats = fs.statSync(storagePath);
      const age = Date.now() - stats.mtimeMs;
      if (age < STORAGE_MAX_AGE_MS) {
        console.log(
          `[${browserName}] Storage state exists and is recent. Skipping login.`,
        );
        shouldLogin = false;
      } else {
       console.log(
          `[${browserName}] Storage state is older than 1 day. Re-login required.`,
        );
      }
    }

    if (!shouldLogin) continue;

    const browserType = browserName === 'chromium' ? chromium : firefox;
    const browser = await browserType.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
   // const loginPage = new LoginPage(page);

     console.log(`[${browserName}] Navigating to login page...`);
   

    const username = process.env.TEST_USERNAME || 'autotester';
    const password = process.env.TEST_PASSWORD || 'amigp@ss1';

     await loginPage.navigateToAMSuiteLoginPage();
     await loginPage.logInSuccesfully();
     
     console.log(`[${browserName}] Login successful`);

    await context.storageState({ path: storagePath });
     console.log(`[${browserName}] Storage state saved at ${storagePath}`);

    await browser.close();
  }
}

export default globalSetup;