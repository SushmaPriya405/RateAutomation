import { expect, Page, TestInfo } from "@playwright/test";
import { getLocator } from "./locator-utils";
import { captureAndAttach, captureAndAttachforCore } from "./report-utils";
import { isElementVisible } from "./element-utils";
import { MAX_TIMEOUT } from "./timeout-constants";

const getWarningMsgUI = () => getLocator('[ng-repeat="war in getMessages(warning.warningMessage) track by $index"]');
const getWarningMsgCore = () => getLocator("//img[@class='warning_icon']/parent::div[@class='message']");
const getValidationErrorMSGUI = () => getLocator('[ng-repeat="err in getMessages(error.errorMessage) track by $index"]');
const getErrorMsgUI = ()=> getLocator('[ng-if="data.errorsFound"]');
const getValidationErrorMsgCore = ()=> getLocator("//img[@class='error_icon']/parent::div[@class='message']");
const getGroupErrorMSgUICore = () => getLocator("//img[@class='error_icon']/parent::div/parent::div[contains(@id, 'sgs')]");
const getGroupWarningMsgUICore = () => getLocator("//img[@class='warning_icon']/parent::div/parent::div[contains(@id, '_msgs')]");

async function getWarningMsgfromUI(): Promise<string[]> {
    const count = await getWarningMsgUI().count();
    const uiWarnings: string[] = [];
    for (let i = 0; i < count; i++) {
        uiWarnings.push((await getWarningMsgUI().nth(i).textContent()) ?? "");
    }
    return uiWarnings.map((desc) => desc.trim().replace("Dwelling #1:", ''));
}

async function getWarningMsgsfromUICore(): Promise<string[]> {
    const count = await getWarningMsgCore().count();
    const uiWarnings: string[] = [];
    for (let i = 0; i < count; i++) {
        uiWarnings.push((await getWarningMsgCore().nth(i).textContent()) ?? "");
    }
    return uiWarnings.map((desc) => desc.trim().replace("Dwelling #1:", ''));
}

export async function warningsWordingValidation(ruleMatrix: any, page: Page, testInfo: TestInfo) {
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if (await isElementVisible(getWarningMsgUI().first())) {
        const actualUIWarnings = await getWarningMsgfromUI();
        console.log("UI warnings:", actualUIWarnings);
        await captureAndAttach(page, testInfo, 'Warning Message Image');
        const rawExcelWarning = ruleMatrix["Warning_Wording"];
        if (!rawExcelWarning || rawExcelWarning.trim() === "") {
            console.log("⚠️ Excel warning wording is empty or undefined. Skipping comparison.");
            return; // Proceed to next step without failing
        }

        const ExcelWarnings = rawExcelWarning.replace("Dwelling #X:", '').trim();
        
        console.log("Excel Warning wording:", ExcelWarnings);
        const matchFound = actualUIWarnings.some(desc => (desc).includes(ExcelWarnings));
        if (matchFound) {
            console.log("Warning wording matched with the excel");
        } else {
            console.log("❌ No matching Warning message found. Skipping comparison.");
        }
    }
}
export async function warningsWordingValidationCore(ruleMatrix: any, page: Page, testInfo: TestInfo) {
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if (await isElementVisible(getGroupWarningMsgUICore().first())) {
        const actualUIWarnings = await getWarningMsgsfromUICore();
        console.log("UI warnings:", actualUIWarnings);
        await captureAndAttachforCore(page, testInfo, 'Warning Message Image');
        const rawExcelWarning = ruleMatrix["Warning_Wording"];
        if (!rawExcelWarning || rawExcelWarning.trim() === "") {
            console.log("⚠️ Excel warning wording is empty or undefined. Skipping comparison.");
            return; // Proceed to next step without failing
        }

        const ExcelWarnings = rawExcelWarning.replace("Dwelling #X:", '').trim();
        
        console.log("Excel Warning wording:", ExcelWarnings);
        const matchFound = actualUIWarnings.some(desc => (desc).includes(ExcelWarnings));
        if (matchFound) {
            console.log("Warning wording matched with the excel");
        } else {
            console.log("❌ No matching Warning message found. Skipping comparison.");
        }
    }
}
export async function getValidationErrorUI(): Promise<string[]> {
  const locators = [
    getValidationErrorMSGUI(),
    getValidationErrorMsgCore(),
  ];
 
  const uiErrors: string[] = [];
 
  for (const locator of locators) {
    const count = await locator.count();
 
    for (let i = 0; i < count; i++) {
      const text = (await locator.nth(i).textContent()) ?? "";
 
      uiErrors.push(
        text.replace(/\s+/g, " ")
            .replace("Dwelling #1:", "")
            .trim()
      );
    }
  }
  console.log("Validation Error:", uiErrors);
  return uiErrors;
}
 
export async function getValidationErrorUICore(): Promise<string[]> {
    if (await isElementVisible(getGroupErrorMSgUICore())){
  const count = await getValidationErrorMsgCore().count();
  const uiError: string[] = [];

  for (let i = 0; i < count; i++) {
    const rawText = (await getValidationErrorMsgCore().nth(i).textContent()) ?? "";
    const cleaned = rawText
      .replace(/\s+/g, ' ') // collapse all whitespace
      .replace("Dwelling #1:", '') // remove prefix
      .trim();
    uiError.push(cleaned);
  }
  console.log("Validation Error:", uiError);
  return uiError;
}
return [];
}

export async function errorWordingValidation(
  ruleMatrix: any,
  page: Page,
  testInfo: TestInfo,
  blockingContext: string
): Promise<boolean> {
  const rawExcelError = ruleMatrix["Validation_Wording"]?.trim();
  const blockingPoint = ruleMatrix["Blocking_Point"];
  const isUIErrorVisible = await isElementVisible(getValidationErrorMSGUI().first());
  const actualUIErrors = isUIErrorVisible ? await getValidationErrorUI() : [];

  // CASE 1: Validation error present in Excel & UI
  if (rawExcelError && isUIErrorVisible) {
    const expectedError = rawExcelError.replace("Dwelling #X:", '').trim();
    console.log("Expected validation error from Excel:", expectedError);
    console.log("UI validation errors:", actualUIErrors);

    await captureAndAttach(page, testInfo, 'Validation Error Image');

    const matchFound = actualUIErrors.some(desc => desc.includes(expectedError));
    await captureAndAttach(page, testInfo, matchFound
      ? '✅ Excel validation error wording matches the UI wording'
      : '❌ Excel validation error wording does not match the UI wording');

    expect.soft(matchFound, 'Excel wording should match the UI validation error').toBe(true);
    return matchFound; // true if match, false if mismatch
  }

  // CASE 2: Validation error present in Excel but NOT in UI
  if (rawExcelError && !isUIErrorVisible) {
    console.log("❌ Expected validation error from Excel, but no error message is visible in the UI.");

    if (blockingPoint === blockingContext) {
      expect.soft(isUIErrorVisible, 'Expected validation error message to be visible in the UI').toBe(true);
      return false; // Fail the test
    } else {
      console.log(`Blocking point is not ${blockingContext} — continuing.`);
      return true; // Continue with next steps
    }
  }

  // CASE 3: Validation error present in UI but NOT in Excel
  if (!rawExcelError && isUIErrorVisible) {
    console.log("❌ Unexpected validation error visible in UI when Excel has no expected error.");
    console.log("UI validation errors:", actualUIErrors);
    expect.soft(isUIErrorVisible, 'No validation error should be visible when Excel has no expected error').toBe(false);
    return false; // Fail the test
  }

  // CASE 4: No validation error in Excel and none in UI — all good
  console.log("✅ No validation error expected and none found in UI.");
  return true;
}

export async function errorWordingValidationCore(
  ruleMatrix: any,
  page: Page,
  testInfo: TestInfo,
  blockingContext: string
): Promise<boolean> {
  const rawExcelError = ruleMatrix["Validation_Wording"]?.trim();
  const blockingPoint = ruleMatrix["Blocking_Point"];
  const isUIErrorVisible = await isElementVisible(getValidationErrorMsgCore().first());
  const actualUIErrors = isUIErrorVisible ? await getValidationErrorUICore() : [];

  // CASE 1: Validation error present in Excel & UI
  if (rawExcelError && isUIErrorVisible) {
    const expectedError = rawExcelError.replace("Dwelling #X:", '').trim();
    console.log("Expected validation error from Excel:", expectedError);
    console.log("UI validation errors:", actualUIErrors);

    await captureAndAttachforCore(page, testInfo, 'Validation Error Image');

    const matchFound = actualUIErrors.some(desc => desc.includes(expectedError));
    // await captureAndAttach(page, testInfo, matchFound
    //   ? '✅ Excel validation error wording matches the UI wording'
    //   : '❌ Excel validation error wording does not match the UI wording');

    expect.soft(matchFound, 'Excel wording should match the UI validation error').toBe(true);
    return matchFound; // true if match, false if mismatch
  }

  // CASE 2: Validation error present in Excel but NOT in UI
  if (rawExcelError && !isUIErrorVisible) {
    console.log("❌ Expected validation error from Excel, but no error message is visible in the UI.");

    if (blockingPoint === blockingContext) {
      expect.soft(isUIErrorVisible, 'Expected validation error message to be visible in the UI').toBe(true);
      return false; // Fail the test
    } else {
      console.log(`Blocking point is not ${blockingContext} — continuing.`);
      return true; // Continue with next steps
    }
  }

  // CASE 3: Validation error present in UI but NOT in Excel
  if (!rawExcelError && isUIErrorVisible) {
    console.log("❌ Unexpected validation error visible in UI when Excel has no expected error.");
    console.log("UI validation errors:", actualUIErrors);
    //expect.soft(isUIErrorVisible, 'No validation error should be visible when Excel has no expected error').toBe(false);
    //return false; // Fail the test
    // ✅ Throw error with descriptive message that categorizeErrorType can recognize
    //throw new Error('Unexpected validation error visible in UI when Excel has no expected error. UI errors: ' + actualUIErrors.join('; '));
    throw new Error("Unexpected validation error visible in UI when Excel has no expected error.");
  }

  // CASE 4: No validation error in Excel and none in UI — all good
  console.log("✅ No validation error expected and none found in UI.");
  return true;
}

export async function getActualUIValidationErrors(): Promise<string[]> {
  const isVisible = await isElementVisible(getValidationErrorMSGUI().first());
  if (!isVisible) return [];

  const actualErrors = await getValidationErrorUI();
  return actualErrors.map(err => err.trim());
}

