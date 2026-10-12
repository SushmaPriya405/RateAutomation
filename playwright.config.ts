// import { defineConfig, devices } from "@playwright/test";
// import { WaitForLoadStateOptions } from "./setup/optional-parameter-types";
// import {
//   ACTION_TIMEOUT,
//   EXPECT_TIMEOUT,
//   NAVIGATION_TIMEOUT,
//   TEST_TIMEOUT,
// } from "./utils/timeout-constants";
// import path from "path";
// import fs from 'fs';

// /**
//  * Read environment variables from file.
//  * https://github.com/motdotla/dotenv
//  */
// // import dotenv from 'dotenv';
// // import path from 'path';
// // dotenv.config({ path: path.resolve(__dirname, '.env') });

// /**
//  * See https://playwright.dev/docs/test-configuration.
//  */
// const unifiedOutputDir = path.resolve(__dirname, 'reports');
// export const LOADSTATE: WaitForLoadStateOptions = "domcontentloaded";
// export default defineConfig({
//    //globalSetup: path.resolve(__dirname, './setup/global-setup.ts'),
//   testDir: "./tests",
//   /* Run tests in files in parallel */
//   fullyParallel: false,
//   /* Fail the build on CI if you accidentally left test.only in the source code. */
//   forbidOnly: !!process.env.CI,
//   /* Retry on CI only */
//   retries: process.env.CI ? 2 : 0,
//   /* Opt out of parallel tests on CI. */
//   workers: process.env.CI ? 1 : undefined,
//   /* Reporter to use. See https://playwright.dev/docs/test-reporters */

//   reporter: [
//     ["line"],
//     ["html", { outputFolder: path.join(unifiedOutputDir, "html"), open: "always" }],    ["json", { outputFile: path.join(unifiedOutputDir, "json", "report.json") }],
//     // Use Core PDF Reporter directly - it will work for all tests
//     [path.resolve(__dirname, 'utils/corePdfReporter.ts'), { outputDir: path.join(unifiedOutputDir, "pdf-report") }],
//     // ['@estruf/github-actions-reporter'],
//   ],

//   timeout: TEST_TIMEOUT,

//   expect: {
//     timeout: EXPECT_TIMEOUT,
//   },
   
//   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//   use: {
//     /* Base URL to use in actions like `await page.goto('/')`. */
//    baseURL: 'https://test.amsuite.amig.com/launch/bypass.html',

//     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//     trace: "on",
//     actionTimeout: ACTION_TIMEOUT,
//     /* Sets a timeout for page loading navigations like goto URL, go back, reload, waitForNavigation to prevent long page loads. */
//     navigationTimeout: NAVIGATION_TIMEOUT,
//     screenshot: "off",
//   },

//   /* Configure projects for major browsers */
//   projects: [
//     // {
//     //   name: "chromium",
//     //   use: {
//     //     ...devices["Desktop Chrome"],
//     //     // viewport: { width: 1600, height: 1000 },
//     //     headless: false, 
//     //     storageState: fs.existsSync('state.json')
//     //       ? path.resolve('state.json')
//     //       : undefined,
//     //     launchOptions: {
//     //       args: ["--disable-web-security"],
//     //       /* --auto-open-devtools-for-tabs option is used to open a test with Network tab for debugging. It can help in analyzing network requests and responses.*/
//     //       // args: ["--disable-web-security","--auto-open-devtools-for-tabs"],
//     //       slowMo: 0,
//     //     },
//     //   },
//     // },

//     // {
//     //   name: "firefox",
//     //   use: { ...devices["Desktop Firefox"] },
//     // },

//     // {
//     //   name: "webkit",
//     //   use: { ...devices["Desktop Safari"] },
//     // },

//     /* Test against mobile viewports. */
//     // {
//     //   name: 'Mobile Chrome',
//     //   use: { ...devices['Pixel 5'] },
//     // },
//     // {
//     //   name: 'Mobile Safari',
//     //   use: { ...devices['iPhone 12'] },
//     // },

//     /* Test against branded browsers. */
//     {
//       name: 'msedge',
//       // use: { ...devices['Desktop Edge'], channel: 'msedge' },
//       use: {
//         browserName: 'chromium',
//         channel: 'msedge', // Use installed Edge
//         headless: false,   // Ensure UI is visible
//          storageState: fs.existsSync('state.json')
//           ? path.resolve('state.json')
//           : undefined,
//         launchOptions: {
//           args: [
//             // Removed '--no-startup-window'
//             '--disable-extensions',
//             '--disable-popup-blocking',
//           ],
//         },
//       },
//     },
//     // {
//     //   name: 'Google Chrome',
//     //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
//     // },
//   ],

//   /* Run your local dev server before starting the tests */
//   // webServer: {
//   //   command: 'npm run start',
//   //   url: 'http://localhost:3000',
//   //   reuseExistingServer: !process.env.CI,
//   // },
// });


//----------------------------------------//
import { defineConfig, devices } from "@playwright/test";
import { WaitForLoadStateOptions } from "./setup/optional-parameter-types";
import {
  ACTION_TIMEOUT,
  EXPECT_TIMEOUT,
  NAVIGATION_TIMEOUT,
  TEST_TIMEOUT,
} from "./utils/timeout-constants";
import { getEnvironmentConfig, getCurrentEnvironment } from "./config/environments";
import path from "path";
import fs from 'fs';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */  
const unifiedOutputDir = path.resolve(__dirname, 'reports');
export const LOADSTATE: WaitForLoadStateOptions = "domcontentloaded";

// Dynamic PDF Reporter Selection based on test naming convention
function getPdfReporter() {
  // Check command line arguments or test files to determine test type
  const testArgs = process.argv.join(' ');
  
  if (testArgs.includes('Core_') || testArgs.includes('core_')) {
    console.log('🔥 Using Enhanced Core PDF Reporter for Core tests');
    return [path.resolve(__dirname, 'utils/corePdfReporter.ts'), { outputDir: path.join(unifiedOutputDir, "pdf-report"), hideInternalSteps: true }];
  } else if (testArgs.includes('GPA_') || testArgs.includes('gpa_')) {
    console.log('🏠 Using Original PDF Reporter for GPA tests');
    return [path.resolve(__dirname, 'utils/pdfReporter.ts'), { outputDir: path.join(unifiedOutputDir, "pdf-report"), hideInternalSteps: true }];
  } else {
    // Default to original PDF reporter for safety
    console.log('📄 Using Default PDF Reporter');
    return [path.resolve(__dirname, 'utils/pdfReporter.ts'), { outputDir: path.join(unifiedOutputDir, "pdf-report"), hideInternalSteps: true }];
  }
}

// Get current environment configuration
const currentEnv = getCurrentEnvironment();
const envConfig = getEnvironmentConfig(currentEnv);

console.log(`🚀 Playwright Config Loaded:`);
console.log(`   Environment: ${envConfig.displayName} (${envConfig.name})`);
console.log(`   Base URL: ${envConfig.baseURL}`);
console.log(`   Description: ${envConfig.description}`);
const getPdfReporterArr: any[] = getPdfReporter();
export default defineConfig({
   //globalSetup: path.resolve(__dirname, './setup/global-setup.ts'),
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["line"],
    ["html", { outputFolder: path.join(unifiedOutputDir, "html"), open: "always" }],
    ["json", { outputFile: path.join(unifiedOutputDir, "json", "report.json") }],
    // Dynamic PDF Reporter Selection:
    // - Core_ tests → Enhanced Core PDF Reporter (no blank pages, proper captions)
    // - GPA_ tests → Original PDF Reporter (existing working logic)
   [getPdfReporterArr[0],getPdfReporterArr[1]],
    // ['@estruf/github-actions-reporter'],
  ],

  timeout: TEST_TIMEOUT,

  expect: {
    timeout: EXPECT_TIMEOUT,
  },
     /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
   baseURL: envConfig.baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on",
    actionTimeout: ACTION_TIMEOUT,
    /* Sets a timeout for page loading navigations like goto URL, go back, reload, waitForNavigation to prevent long page loads. */
    navigationTimeout: NAVIGATION_TIMEOUT,
    screenshot: "off",
  },

  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: "chromium",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     // viewport: { width: 1600, height: 1000 },
    //     headless: false, 
    //     storageState: fs.existsSync('state.json')
    //       ? path.resolve('state.json')
    //       : undefined,
    //     launchOptions: {
    //       args: ["--disable-web-security"],
    //       /* --auto-open-devtools-for-tabs option is used to open a test with Network tab for debugging. It can help in analyzing network requests and responses.*/
    //       // args: ["--disable-web-security","--auto-open-devtools-for-tabs"],
    //       slowMo: 0,
    //     },
    //   },
    // },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    {
      name: 'msedge',
      // use: { ...devices['Desktop Edge'], channel: 'msedge' },
      use: {
        browserName: 'chromium',
        channel: 'msedge', // Use installed Edge
        headless: false,   // Ensure UI is visible
         storageState: fs.existsSync('state.json')
          ? path.resolve('state.json')
          : undefined,
        launchOptions: {
          args: [
            // Removed '--no-startup-window'
            '--disable-extensions',
            '--disable-popup-blocking',
          ],
        },
      },
    },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});