/**
 * page-setup.ts: This module is responsible for setting up the initial state of a page before each test.
 * It includes a hook that runs before each test, setting the page context. By centralizing these setup operations,
 * it ensures a consistent starting point for each test, improving test reliability. It also exports a base test object
 * with a beforeEach hook already set up. This can be used to define tests with the page context set up.
 */

import { Browser, Page, test as baseTest } from '@playwright/test';
import { setPage } from '../utils/page-utils';
import { clearSessionCache } from '../utils/excel-path-resolver';
import { isExecutionAborted, startAbortBrowserWatcher } from '../utils/abort-helper';

/**
 * A hook that runs before each test, setting the page context and clearing Excel cache.
 * @param {Page} page - The page context provided by Playwright.
 */
import { emitExecutionEvent } from '../utils/execution-event';
const abortWatcherStops = new WeakMap<Browser, () => void>();

baseTest.beforeEach(({ page, browser }: { page: Page; browser: Browser }) => {
  setPage(page);
  abortWatcherStops.get(browser)?.();
  abortWatcherStops.set(browser, startAbortBrowserWatcher(browser));
});
baseTest.afterEach(async ({ browser }, testInfo) => {
  abortWatcherStops.get(browser)?.();
  abortWatcherStops.delete(browser);

  const testNumberAnnotation = testInfo.annotations.find(annotation => annotation.type === 'executionTestNumber');
  const testNumber = Number(testNumberAnnotation?.description);
  const executionIndexAnnotation = testInfo.annotations.find(annotation => annotation.type === 'executionTestIndex');
  const executionIndex = Number(executionIndexAnnotation?.description);
  if (!Number.isInteger(testNumber) || testNumber < 1) return;

  const isAborted = isExecutionAborted() || testInfo.status === 'interrupted' || testInfo.error?.message?.includes('TEST_ABORTED');
  const status = isAborted ? 'TEST_ABORTED' : testInfo.status === 'passed' ? 'TEST_PASSED' : 'TEST_FAILED';
  emitExecutionEvent({
    type: status,
    testNumber: Number.isInteger(executionIndex) && executionIndex > 0 ? executionIndex : testNumber,
    sourceTestNumber: testNumber,
    testName: testInfo.title,
    error: testInfo.error?.message
  });
});

/**
 * The base test object with a beforeEach hook already set up.
 * This can be used to define tests with the page context set up.
 */
export const test = baseTest;
