import { ElementHandle, Page, TestInfo, type Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { isExecutionAborted } from './abort-helper';
import sharp from "sharp"; // Make sure to install the 'sharp' library for image processing before  automation execution.
import { waitForPageReady } from '../pages/Core/RiskAnalysis_CorePage';

function nextSequentialIndex(screenshotDir: string): number {
  try {
    const files = fs.readdirSync(screenshotDir);
    const indices = files
      .map(f => {
        const match = /^(\d+)_/.exec(f);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);

    const maxIndex = indices.length ? Math.max(...indices) : 0;
    return maxIndex + 1;
  } catch {
    return 1;
  }
}

export async function captureAndAttach(page: Page, testInfo: TestInfo, stepName: string) {

  try {
    const timestamp = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Kolkata',
    }).replace(/[/:, ]+/g, '_');
    const safeStepName = stepName.replace(/\s+/g, '_');

    // UNIQUE FOLDER PER TEST CASE
    const testFolder = testInfo.title.replace(/\s+/g, '_');
    const screenshotDir = path.join(__dirname, '..', 'reports', 'pdf-report', 'data', testFolder);
    fs.mkdirSync(screenshotDir, { recursive: true });
    const counter = nextSequentialIndex(screenshotDir);
    const fileName = `${counter}_${safeStepName}.png`;
    const screenshotPath = path.join(screenshotDir, fileName);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach(`Step: ${stepName} - ${timestamp}`, {
      path: screenshotPath,
      contentType: 'image/png',
    });
  } finally {
    if (isExecutionAborted()) {
      throw new Error("TEST_ABORTED");
    }
  }
}



type CaptureOptions = {
  /**
   * If true, captures a full-page screenshot.
   * If false, captures a normal screenshot of the current viewport.
   */
  fullPage?: boolean;

  /**
   * Optional height to use when fullPage is true.
   * If not provided and fullPage is true, the function will dynamically compute the maximum scroll height.
   */
  viewportHeight?: number;

  /**
   * Optional explicit width for resizing the viewport during full-page capture.
   * Defaults to 1280 if not provided.
   */
  viewportWidth?: number;

  /**
   * Optional locator to capture only a specific element instead of the whole page.
   */
  element?: Locator;
};


export async function captureAndAttachforCore(
  page: Page,
  testInfo: TestInfo,
  stepName: string,
  options: CaptureOptions = {}
) {

  const timestamp = new Date()
    .toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
    .replace(/[/:, ]+/g, '_');

  const safeStepName = stepName.replace(/[\s\/\\:*?"<>|]+/g, '_');
  const testFolder = testInfo.title.replace(/\s+/g, '_');
  const screenshotDir = path.join(__dirname, '..', 'reports', 'pdf-report', 'data', testFolder);
  fs.mkdirSync(screenshotDir, { recursive: true });

  // Compute deterministic next index from files on disk
  const counter = nextSequentialIndex(screenshotDir);

  const fileName = `${counter}_${safeStepName}.png`;
  const screenshotPath = path.join(screenshotDir, fileName);

  // Remember original viewport to restore later
  const originalViewport = page.viewportSize();

  try {
    if (options.element) {
      await options.element.screenshot({ path: screenshotPath });
    } else {
      await waitForPageReady(page);
      // Capture with fullPage:true because we are not changing viewport,viewport now not matches content
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    // Attach to report
    await testInfo.attach(`Step: ${stepName} - ${timestamp}`, {
      path: screenshotPath,
      contentType: 'image/png',
    });

  } finally {
    if (isExecutionAborted()) {
      throw new Error("TEST_ABORTED");
    }
  }
}
async function scrollWithRetry(elementHandle: ElementHandle<HTMLElement | SVGElement>,
  page: Page,
  top: number,
  left: number,
  maxRetries = 5
) {
  let retries = 0;

  while (retries < maxRetries) {
    await elementHandle.evaluate(
      (el, pos) => {
        el.scrollTop = pos.top;
        el.scrollLeft = pos.left;
      },
      { top, left }
    );

    await page.waitForTimeout(200);

    const verify = await elementHandle.evaluate(el => ({
      top: el.scrollTop,
      left: el.scrollLeft,
    }));

    if (Math.abs(verify.top - top) < 3 && Math.abs(verify.left - left) < 3) {
      return true;
    }

    console.log(`⚠️ Scroll mismatch retry ${retries + 1}`, verify);
    retries++;
  }

  return false;
}
export async function captureFullPage2D(
  page: Page,
  testInfo: TestInfo,
  stepName: string,
  containerSelector = "#centerPanel",
): Promise<string> {

  const timestamp = new Date()
    .toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })
    .replace(/[/:, ]+/g, "_");

  const safeStepName = stepName.replace(
    /[\s\/\\:*?"<>|]+/g,
    "_"
  );
  try {
    const testFolder = testInfo.title.replace(/\s+/g, "_");

    const screenshotDir = path.join(
      __dirname,
      "..",
      "reports",
      "pdf-report",
      "data",
      testFolder
    );
    await waitForPageReady(page);
    await page.evaluate(() => {
      const ExtJS = (window as any).Ext;
      if (!ExtJS) return;
      ExtJS.ComponentQuery.query('panel').forEach((p: any) => {
        if (p.doLayout) {
          p.doLayout();
        }
      });
    });
    const counter = nextSequentialIndex(screenshotDir);
    const tempDir = path.join(screenshotDir, `tmp_${counter}`);

    const debugDir = path.join(
      tempDir,
      "debug"
    );

    fs.mkdirSync(screenshotDir, { recursive: true });
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(debugDir, { recursive: true });
    // Compute deterministic next index from files on disk

    const fileName = `${counter}_${safeStepName}.png`;
    const screenshotPath = path.join(screenshotDir, fileName);

    console.log(`📸 Starting Full 2D Capture: ${fileName}`);

    const container = page.locator(containerSelector);

    const elementHandle = await container.elementHandle();

    if (!elementHandle) {
      throw new Error(`Container not found: ${containerSelector}`);
    }

    // ------------------------------------------
    // ExtJS Cleanup
    // ------------------------------------------
    // ✅ Remove focus/highlight reliably
    console.log("🚀 Before stabilize editor");

    // ✅ STEP 1: wait dropdown disappears (selection applied)

    // ✅ STEP 2: small delay for ExtJS update
    await page.waitForTimeout(150);

    // ✅ STEP 3: blur active editor input (CRITICAL FIX)
    const editorInput = page.locator('div.x-editor input.x-form-field');

    if (await editorInput.isVisible().catch(() => false)) {
      console.log("✅ Blurring editor input");
      await editorInput.evaluate(el => (el as HTMLInputElement).blur());
    }

    // ✅ STEP 4: wait until editor closes

    console.log("✅ Editor closed, now cleaning UI");

    await page.evaluate(() => {
      console.log("🔥 Inside evaluate - clearing ExtJS focus");

      function clearFocus() {
        document.querySelectorAll(
          '.x-form-trigger-wrap-focus, .x-grid-item-focused, .x-grid-item-selected, .x-grid-cell-selected, .g-cell-edit'
        ).forEach(el => {
          el.classList.remove(
            'x-form-trigger-wrap-focus',
            'x-grid-item-focused',
            'x-grid-item-selected',
            'x-grid-cell-selected',
            'g-cell-edit'
          );
        });
      }

      // ✅ Run multiple times
      clearFocus();
      setTimeout(clearFocus, 50);
      setTimeout(clearFocus, 150);
      setTimeout(clearFocus, 300);
      setTimeout(clearFocus, 400);
      setTimeout(clearFocus, 450);
      setTimeout(clearFocus, 1000);
      setTimeout(clearFocus, 2000);

      // ✅ Reset aria
      document.querySelectorAll('[aria-selected="true"]').forEach(el => {
        el.setAttribute('aria-selected', 'false');
      });

      // ✅ Blur active element
      if (document.activeElement instanceof HTMLElement) {
        console.log("Blurring active element:", document.activeElement.outerHTML);
        document.activeElement.blur();
      }

      console.log("✅ Focus clearing completed");

      // ✅ ✅ ✅ DEBUG SECTION (very important)

      // console.log("===== ✅ END DEBUG =====");
    });

    // ✅ OPTIONAL: stabilizer click (now safe)

    await page.mouse.click(5, 5);
    // await page.waitForTimeout(2000);

    // ------------------------------------------
    // Measure Container
    // ------------------------------------------

    console.log("🔄 Resetting panel scroll to top-left");

    await elementHandle.evaluate((el) => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });

    await page.waitForTimeout(500);

    const verifyReset = await elementHandle.evaluate((el) => ({
      top: el.scrollTop,
      left: el.scrollLeft
    }));

    console.log("After reset:", verifyReset);

    const dims = await elementHandle.evaluate(el => ({
      scrollHeight: el.scrollHeight,
      scrollWidth: el.scrollWidth,
      clientHeight: el.clientHeight,
      clientWidth: el.clientWidth,
    }));

    const {
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth
    } = dims;

    // console.log("Container Dimensions:", dims);

    const rows = Math.max(1, Math.ceil(scrollHeight / clientHeight));

    const cols = Math.max(1, Math.ceil(scrollWidth / clientWidth));

    console.log(`📸 Rows=${rows}, Cols=${cols}`);

    const chromePath = path.join(tempDir, "pageChrome.png");

    await page.screenshot({ path: chromePath, fullPage: false });

    // const containerBox = await container.boundingBox();
    const panelPosition = await container.evaluate(el => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left),
        y: Math.round(r.top)
      };
    });

    if (!panelPosition) {
      throw new Error(`Unable to determine bounds for ${containerSelector}`);
    }

    // console.log("Container Box:", panelPosition);
    interface Tile {
      path: string;

      top: number;
      left: number;

      actualTop: number;
      actualLeft: number;

      scrollHeight: number;
      scrollWidth: number;
    }

    const tiles: Tile[] = [];

    // ------------------------------------------
    // Capture Matrix
    // ------------------------------------------

    for (let row = 0; row < rows; row++) {

      for (let col = 0; col < cols; col++) {

        const top = Math.min(row * clientHeight, Math.max(0, scrollHeight - clientHeight));
        const left = Math.min(col * clientWidth, Math.max(0, scrollWidth - clientWidth));

        const success = await scrollWithRetry(elementHandle,page,top,left);
        // await page.waitForTimeout(150);

        const metrics = await elementHandle.evaluate(el => ({
          scrollTop: el.scrollTop,
          scrollLeft: el.scrollLeft,

          scrollHeight: el.scrollHeight,
          scrollWidth: el.scrollWidth,

          clientHeight: el.clientHeight,
          clientWidth: el.clientWidth
        }));

        const actualScroll = {
          scrollTop: metrics.scrollTop,
          scrollLeft: metrics.scrollLeft
        };

        const tilePath = path.join(
          tempDir,
          `r${row}_c${col}.png`
        );
        const browserShot = path.join(
          debugDir,
          `browser_r${row}_c${col}.png`
        );

        await page.screenshot({
          path: browserShot,
          fullPage: false
        });
        await scrollWithRetry(elementHandle,page,top,left);
        // await page.waitForTimeout(150);
        await container.screenshot({ path: tilePath });        

        tiles.push({
          path: tilePath,

          top,
          left,

          actualTop: actualScroll.scrollTop,
          actualLeft: actualScroll.scrollLeft,

          scrollHeight: metrics.scrollHeight,
          scrollWidth: metrics.scrollWidth
        });

      }
    }

    // ------------------------------------------
    // Read Tile Size
    // ------------------------------------------

    const firstMeta = await sharp(
      tiles[0].path
    ).metadata();

    const tileWidth = firstMeta.width!;
    const tileHeight = firstMeta.height!;

    const finalImagePath = path.join(
      screenshotDir,
      fileName
    );

    const composites: sharp.OverlayOptions[] = [];

    // ------------------------------------------
    // Build Final Composite Using
    // Actual Scroll Coordinates
    // ------------------------------------------

    for (const tile of tiles) {

      let buffer = await fs.promises.readFile(tile.path);

      let cropWidth = tileWidth;
      let cropHeight = tileHeight;

      if (tile.left + tileWidth > scrollWidth) {
        cropWidth = scrollWidth - tile.left;
      }

      if (tile.top + tileHeight > scrollHeight) {
        cropHeight = scrollHeight - tile.top;
      }

      if (cropWidth !== tileWidth || cropHeight !== tileHeight) {
        buffer = await sharp(buffer)
          .extract({
            left: 0,
            top: 0,
            width: cropWidth,
            height: cropHeight,
          })
          .toBuffer();
      }

      composites.push({
        input: buffer,
        left: Math.round(tile.actualLeft),
        top: Math.round(tile.actualTop),
      });
    }

    const stitchedPanelPath = path.join(
      tempDir,
      "stitchedPanel.png"
    );

    await sharp({
      create: {
        width: scrollWidth,
        height: scrollHeight,
        channels: 4,
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 1,
        },
      },
    })
      .composite(composites)
      .png()
      .toFile(stitchedPanelPath);

    const chromeMeta = await sharp(chromePath).metadata();

    const finalCanvasWidth = Math.max(
      chromeMeta.width ?? 0,
      Math.round(panelPosition.x + scrollWidth)
    );

    const finalCanvasHeight = Math.max(
      chromeMeta.height ?? 0,
      Math.round(panelPosition.y + scrollHeight)
    );

    const chromeBuffer = await fs.promises.readFile(chromePath);
    const panelBuffer = await fs.promises.readFile(stitchedPanelPath);

    await sharp({
      create: {
        width: finalCanvasWidth,
        height: finalCanvasHeight,
        channels: 4,
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 1,
        },
      },
    })
      .composite([
        {
          input: chromeBuffer,
          left: 0,
          top: 0,
        },
        {
          input: panelBuffer,
          left: Math.round(panelPosition.x),
          top: Math.round(panelPosition.y),
        },
      ])
      .png()
      .toFile(finalImagePath);

    // ------------------------------------------
    // Attach Final Image
    // ------------------------------------------

    await testInfo.attach(
      `${fileName} - ${timestamp}`,
      {
        path: finalImagePath,
        contentType: "image/png",
      }
    );

    // ------------------------------------------
    // Cleanup
    // ------------------------------------------

    for (const tile of tiles) {
      try {
        if (fs.existsSync(tile.path)) {
          fs.unlinkSync(tile.path);
        }
      } catch { }
    }

    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, {
          recursive: true,
          force: true,
        });
      }
    } catch { }

    console.log(`✅ Full 2D Capture Complete: ${stepName}`);

    return finalImagePath;
  } finally {

    if (isExecutionAborted()) {
      throw new Error("TEST_ABORTED");
    }
  }
}