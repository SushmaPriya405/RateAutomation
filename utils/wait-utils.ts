import { getPage } from './page-utils';
import { STANDARD_TIMEOUT } from './timeout-constants';

export async function waitForExtMaskToDisappear() {
  const page = getPage();

  await page.waitForFunction(
    () => document.querySelectorAll('.x-mask').length === 0,
    { timeout: STANDARD_TIMEOUT }
  );
}

