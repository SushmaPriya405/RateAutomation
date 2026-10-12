import { errors, expect, Locator, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../utils/locator-utils";
import { click, fill, gotoURL, reloadPage, wait } from "../../utils/action-utils";
import { isElementVisible } from "../../utils/element-utils";
import {
  MAX_TIMEOUT,
  SMALL_TIMEOUT,
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { getPage } from "../../utils/page-utils";
import { AMSuite_CoreURL } from "../../utils/url-constansts";
import { captureAndAttach, captureAndAttachforCore, captureFullPage2D } from "../../utils/report-utils";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../utils/wordingValidation";
import { log } from "console";
import { validateRulesForTestCase, ValidationResult } from "../../utils/coreRuleBasedValidation";
import { formatToMMDDYYYY } from "../../testdata/testData";
import { CV_saveAndQuote } from "./Recreational/CV_RiskAnaysis_CorePage";
import { getErrorIconCore } from "./Recreational/CV_Coverage_CorePage";
import { getReturnToPaymentsText } from "./payments_CorePage";
import { selectDropdownWithRetry } from "./HO_Coverages_CorePage";

const getUnderWritingIssueMessage = `//gw-displaykey-format[text() = 'There are underwriting issues associated with this offering. ']`;
const getSubmissionNumberText = `//a[@class = 'gw-highlight ng-binding']`;
const getNextButtoninPolicyDetails = () =>
  getLocator("//button[@ng-click='goToNext()']");
const getPropertyHeading = () => getLocator("//h2[text()='Property']");
const getsubmissionSearch = () =>
  getLocatorByRole("textbox", { name: "Sub #:" });
const getsubmissionSearchBtn = () =>
  getLocator(
    '[id="TabBar\\:PolicyTab\\:PolicyTab_SubmissionNumberSearchItem_Button"]'
  );
const getRiskAnalysisTab = () => getLocator("//div[contains(@class, 'treecolumn')]//span[text()='Risk Analysis']");
const getPriorPoliciesTab = () => getLocator("//span[contains(@id, 'PriorPolicyCardTab-btnInnerEl')]");
const getPriorLossesTab = () => getLocator("//span[contains(@id, 'LossHistoryCardTab-btnInnerEl')]");
const getMotorVehicleRecord = () => getLocator("//span[contains(@id,'SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:MotorVehicleRecordTab-btnInnerEl')]");
const addpriorlossesbtn = () => getLocator("//span[contains(@id, 'ManualLossHistoryLV_tb:Add-btnInnerEl')]");
const editPolicyTransactionbtn = () => getLocator("//span[contains(@id,'EditPolicy-btnInnerEl') and contains(text(),'Edit Policy')]");
const Okbtn = () => getLocator("//span[contains(@id,'btnInnerEl') and contains(text(),'OK')]");
const getlossDate = () => getLocator("//input[@name='LossDate']");
const getLosscause = () => getLocator("//td[contains(@class,'x-grid-cell')]//following-sibling::td//div[contains(@class,'x-grid-cell-inner') and contains(text(),'Earthquake')]");
const getLossTo = () => getLocator("//td[contains(@class,'x-grid-cell')]//following-sibling::td//div[contains(@class,'x-grid-cell-inner') and contains(text(),'Dwelling')]");
const getLossDescription = () => getLocator("//td[contains(@class,'x-grid-cell-headerId-gridcolumn-1237')]/div");
const getAmountPaid = () => getLocator("//td[contains(@class,'x-grid-cell-headerId-gridcolumn-1239')]/div");
const getLossStatus = () => getLocator("//input[@name='Status' and @role='combobox']");
const getCatastrophe = () => getLocator("//input[@name='Catastrophe' and @role='combobox']");

const getLossDateField = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[3]`);
const getLossCauseField = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[4]`);
const getLossToField = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[5]`);
const getLossDescriptionField = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[6]`);
const getAmountPaidField = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[7]`);
const getLossStatusField = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[8]`);
const getCatastropheField = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[9]`);
const getYesFloodLossField = (label: any,LossNum: any) => getLocator(`//tr[contains(@class,'x-grid-row')][${LossNum}]/td[ count(   //div[@id='SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:ManualLossHistoryLV']   //div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]   [.//span[normalize-space()='${label}']]   /preceding-sibling::div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))] ) + 1 ]//input[@inputValue="true"]`);
const getNoFloodLossField = (label: any,LossNum: any) => getLocator(`//tr[contains(@class,'x-grid-row')][${LossNum}]/td[ count(   //div[@id='SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:ManualLossHistoryLV']   //div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]   [.//span[normalize-space()='${label}']]   /preceding-sibling::div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))] ) + 1 ]//input[@inputValue="false"]`);
const getFloodLossAmount = (LossNum: any) => getLocator(`//div[contains(@id, 'RiskAnalysisCV:ManualLossHistoryLV_ref')]//tr[@data-recordindex=${LossNum}]/td[12]`);
// const getPriorLossesDataRowCell = (label: any,LossNum: any) => getLocator(`//tr[contains(@class,'x-grid-row')][${LossNum}]/td[ count(   //div[@id='SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:ManualLossHistoryLV']   //div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]   [.//span[normalize-space()='${label}']]   /preceding-sibling::div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))] ) + 1 ]`);
const getPriorLossesDataRowCell = (label: any,LossNum: any) => getLocator(`//div[contains(@id,'ManualLossHistoryLV')]//tr[contains(@class,'x-grid-row')][${LossNum}]/td[ count(   //div[contains(@id,'ManualLossHistoryLV')]//div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]   [.//span[normalize-space()='${label}']]   /preceding-sibling::div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))] ) + 1 ]`);
const getDiscountAppliedTab = () => getLocator("//span[contains(@id, 'DiscountsCardTab-btnInnerEl')]");
const getPriorLossesInputBox =(label:any,LossNum: any) => getLocator(` //tr[contains(@class,'x-grid-row')][${LossNum}]/td[   count(     //div[@id='SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:ManualLossHistoryLV']     //div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]     [.//span[normalize-space()='${label}']]     /preceding-sibling::div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]   ) + 1 ]/ancestor::div[2]/following-sibling::div[last()]//input`);
// === Violations locators/helpers (mirror ManualLossHistoryLV but for ManualViolationHistoryLV) ===
const getViolationsAddButton = () => getLocator("//span[contains(@id, 'ManualViolationHistoryLV_tb:Add-btnInnerEl')]");
const getViolationDataRowCell = (label: any, ViolationNum: any) => getLocator(`//div[contains(@id,'ManualViolationHistoryLV')]//tr[contains(@class,'x-grid-row')][${ViolationNum}]/td[ count(   //div[contains(@id,'ManualViolationHistoryLV')]//div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]   [.//span[normalize-space()='${label}']]   /preceding-sibling::div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))] ) + 1 ]`);
const getViolationInputBox = (label:any,ViolationNum: any) => getLocator(`//tr[contains(@class,'x-grid-row')][${ViolationNum}]/td[   count(     //div[contains(@id,'ManualViolationHistoryLV')]     //div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]     [.//span[normalize-space()='${label}']]     /preceding-sibling::div[contains(@class,'x-column-header') and not(contains(@style,'display: none'))]   ) + 1 ]/ancestor::div[2]/following-sibling::div[last()]//input`);

const getFirstApproval = () => getLocator("//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn']");

const getApproveBtn = () =>
  getLocator(
    '[id="SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:RiskEvaluationPanelSet:Approve-btnInnerEl"]'
  );
const getApproveOkBtn = () =>
  getLocator('[id="RiskApprovalDetailsPopup:Update"]');
const getGpaLinkButton = () => getLocator("#image-1013");

const getAccountSearchBox = () => getLocator("//input[@name='SearchParam']");
const getSearchButton = () =>
  getLocator("//span[@class='gw-icon fa fa-search']");
const getQuoteNumber = () =>
  getLocator("//a[@class='gw-action-link ng-binding']");
const getContinueQuote = () =>
  getLocatorByRole("button", { name: "Continue quote" });
const getYesButtoninPopup = () =>
  getLocator("//button[@class='gw-btn gw-btn-primary']");
const getPopupforHomePage = `//div[@class='gw-modal__inner']`;
const getNextinProperty = () =>
  getLocator("//button[@class='gw-btn-primary ng-binding']");
const getNextButton = () => getLocator('//button[@ng-click="next(form)"]');
const getDSText = `//h2[text() = 'Discounts / Surcharges']`;
const getCalculatorButton = () =>
  getLocator("//div[@class='gw-calculate-btn-wrapper gw-displayed']");
const getProceedToIssueButton = () =>
  getLocator("//button[text()='Proceed to Issue']");
const getUWIDescription = () =>
  getLocator('//a[contains(@id,"UWIssueRowSet:ShortDescription")]');
const getWarningMsg = () =>
  getLocator(
    '[ng-repeat="war in getMessages(warning.warningMessage) track by $index"]'
  );
const getSaveButtoninCore = () => getLocator('[id="SubmissionWizard\\:Job_RiskAnalysisScreen\\:JobWizardToolbarButtonSet\\:Draft"]');
const getQuoteButton = () => getLocator('[id="SubmissionWizard:Job_RiskAnalysisScreen:JobWizardToolbarButtonSet:QuoteOrReview"]');
const getQuoteinPolicyReviewPage = () => getLocator("//span[contains(@id, 'SubmissionWizard:SubmissionWizard_PolicyReviewScreen:JobWizardToolbarButtonSet:QuoteOrReview-btnEl')]");
export const getClearButton = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getForms = () => getLocator("//span[contains(@id, 'SubmissionWizard:FormsScreen:0')]");
const getFormsNextButton = () => getLocator("//span[contains(@class, 'x-btn-icon-el x-tbar-page-next ')]");
const getPageCountIndicator = () => getLocator("//div[contains(@class, 'x-toolbar-text') and contains(text(), 'of')]");
const getFormsTitle = () => getLocator("//span[@class = 'g-title' and contains(text(), 'Forms')]"); 

const getResolveButton = () => getLocator("//span[text()='Resolve']")
const getAlreadyApprovedCheckBox = () => getLocator("//a[text()='Reopen']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn x-grid-checkcolumn-checked']");
const getValuationHeading = () => getLocator("//h2[text()='Valuation']");
const getQuoteHeading = () => getLocator("//div[text()='Quote']");
const getQuotePageScreenHeading= ()=> getLocator("//span[contains(@id,'SubmissionWizard:SubmissionWizard_QuoteScreen:0')]");
const getQuoteButtonInCoreRiskAnalysis = () => getLocator("//span[contains(@id, 'QuoteOrReview-btnInnerEl')]");
const getRiskAnalysisText = () => getLocator("//span[contains(@id, 'RiskAnalysisScreen') and contains(text(), 'Risk Analysis')]");
const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getSaveAndNextButton = () => getLocator('//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getBindOptionsDropDown = () => getLocator("//span[contains(@id, 'BindOptions-btnWrap')]");
const getProceedToIssuanceOption = () => getLocator("//span[contains(@id, 'BindOptions:BindOnly-textEl') and contains(text(), 'Proceed To Issuance')]");
const getQuotePageText = () => getLocator("//label[text() = 'Total Premium']");
const getClueResultsPopUp = () => getLocator("//div[contains(text(), 'CLUE results have been applied. To continue issuance click Quote then Proceed to Issue')]");
export const getReturnToRiskAnalysisButton = () => getLocator("//a[@id = 'Policy_IssuanceChecklistPopup:__crumb__'  and contains(text(), 'Return to Risk Analysis') or contains(text(), 'Return to Approvals Required') or contains(@id, 'UWBlockProgressIssuesPopup:__crumb__') or contains(text(),'Return to Policy Review')]");
const getWarningMsgCore = () => getLocator("//img[@class='warning_icon']/parent::div[@class='message']");
const getReturnToRiskApprovals = () => getLocator("//a[@id = 'Policy_IssuanceChecklistPopup:__crumb__' and contains(text(), 'Return to Approvals Required')]");
const clearrisk = () => getLocator("//span[text()='Clear']")
const getUWIssuesHeading = () => getLocator("//span[contains(@id, 'EvaluationIssuesCardTab-btnInnerEl') and contains(text(), 'UW Issues')]");
const getQuoteTab = () => getLocator("//div[contains(@class, 'treecolumn')]//span[text()='Quote']");
const getFormsTab = () => getLocator("//div[contains(@class, 'treecolumn')]//span[text()='Forms']");
const getBindOptionsinFormsPage = () => getLocator("//span[contains(@id, 'FormsScreen') and contains(text(), 'Forms')]/ancestor::*//span[contains(@id, 'BindOptions-btnWrap')]");
const getPolicyReviewHeading = () => getLocator("//span[contains(@id, 'SubmissionWizard_PolicyReviewScreen') and contains(text(), 'Policy Review')]");
const getSavenNextinForms = () => getLocator("//span[contains(@id, 'FormsScreen') and contains(text(), 'Forms')]/ancestor::*//span[contains(@id, 'SubmissionWizard:Next-btnInnerEl')]");
const checkNewUW = () => getLocator("(//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn'])[1]");
async function clickQuoteSafely(page: Page, locator: ReturnType<typeof getLocator>, label: string): Promise<boolean> {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (!(await isElementVisible(locator, { timeout: 1000 }))) {
        return false;
      }

      await locator.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => undefined);

      const maskCount = await page.locator('.x-mask-fixed').count();
      if (maskCount > 0) {
        console.warn(`${label}: overlay mask detected on attempt ${attempt}; waiting for it to clear`);
        await page.locator('.x-mask-fixed').waitFor({ state: 'hidden', timeout: 4000 }).catch(() => undefined);
        await page.locator('.x-mask-fixed').evaluateAll((els) => els.forEach((el) => el.remove())).catch(() => undefined);
      }

      await locator.click({ timeout: TIMEOUT_8_SECONDS, force: true }).catch(async () => {
        await locator.evaluate((el) => {
          (el as HTMLElement).click();
        });
      });

      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(1000);
      return true;
    } catch (error) {
      console.warn(`${label}: click attempt ${attempt} failed - ${error instanceof Error ? error.message : String(error)}`);
      await wait(1000);
    }
  }

  return false;
}

export async function clickonQuoteinRiskAnalysis(page: Page, testInfo: TestInfo) {
  await wait(TIMEOUT_4_SECONDS);
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await wait(5000);

  await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(5000);
  const descriptions = await getIssueDescriptions();
  const hasUIMessages = descriptions.length > 0;

  console.log("UWI Descriptions from UI:", descriptions);
  console.log(`UI has UW messages: ${hasUIMessages}`);

  // if (!hasUIMessages) {
  //   await captureAndAttachforCore(page, testInfo, 'Risk Analysis before clicking Quote');
  // } // only commneting to exeute BT team ready reports need to fix this later
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  // if(await isElementVisible(getResolveButton())){
  //   await getResolveButton().click({ timeout: TIMEOUT_8_SECONDS });
  //   await wait(2000);
  // }
 if(await isElementVisible(getResolveButton())){
await getResolveButton().waitFor({ state: 'visible', timeout: TIMEOUT_8_SECONDS });
await getResolveButton().click();
await wait(2000);
  }

  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  if (await isElementVisible(getQuotePageText())) {
    await getRiskAnalysisTab().click();
    await wait(2000);
    if (await isElementVisible(getWarningMsgCore())) {
      await getRiskAnalysisTab().click({ timeout: TIMEOUT_8_SECONDS });
    }
  }
  await wait(2000);
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
}
function hasLossValue(value: any): boolean {
  return value !== undefined && value !== null && String(value).trim() !== "";
}
async function handleInputOrDropDown(
  value: any,
  trigger: () => ReturnType<typeof getLocator>,
  label: string,
  lossNum: any
) {
  const finalValue = String(value ?? "").trim();
  const cell = trigger();

  await cell.waitFor({ state: "attached", timeout: STANDARD_TIMEOUT });

  try {
    await cell.scrollIntoViewIfNeeded();
  } catch {
    await wait(500);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`🔁 ${label}: Attempt ${attempt}`);

    // ✅ Step 1: Activate editor (IMPORTANT)
    await cell.dblclick({ force: true });
    await wait(1500);

    // ✅ CASE 1 → INPUT (MH or text field)
    const inputEditor = getLocator(
      "//input[contains(@class,'x-form-field') and not(@type='hidden')]"
    ).filter({ visible: true }).last();

    if (await inputEditor.count() > 0 && (await inputEditor.getAttribute("role")||"")=="textbox") {
      console.log(`✅ ${label}: Input detected`);

      await fill(inputEditor, finalValue);
      return;
    }

    // ✅ CASE 2 → DROPDOWN (BT)
    const dropdownTrigger = getLocator(
      "//div[contains(@class,'x-form-trigger') and contains(@class,'x-form-arrow-trigger')]"
    ).filter({ visible: true }).last();

    if (await dropdownTrigger.count() > 0) {
      console.log(`✅ ${label}: Dropdown detected`);
      await selectLossDropdown(
        finalValue,
        trigger,
        label
      );
      return;
    }

    console.log(`⚠️ ${label}: Editor not detected, retrying...`);
    await wait(1000);
  }

  throw new Error(`❌ ${label}: Unable to detect input or dropdown editor`);
}

async function selectLossDropdown(
  optionValue: any,
  trigger: () => ReturnType<typeof getLocator>,
  label: string
) {
  const value = String(optionValue ?? "").trim();

  const optionLocator = getLocator(
    `//ul[contains(@class,'x-list-plain')]//li[normalize-space()='${value}']`
  );

  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const el = trigger();

    await el.waitFor({ state: "attached", timeout: STANDARD_TIMEOUT });

    try {
      await el.scrollIntoViewIfNeeded();
    } catch {
      await wait(500);
    }

    await el.click({ force: true }).catch(() => {});

    try {
      // ✅ Wait for dropdown list (NOT input)
      await optionLocator.waitFor({
        state: "visible",
        timeout: STANDARD_TIMEOUT
      });

      await optionLocator.scrollIntoViewIfNeeded();
      await click(optionLocator);

      console.log(`${label}: selected '${value}' on attempt ${attempt}`);
      return;

    } catch {
      console.log(`Retry ${attempt} → option not visible yet`);

      await el.evaluate(node => {
        const container = node.closest('#centerPanel');
        if (container) container.scrollTop += 300;
      });

      await wait(1000);
    }
  }

  throw new Error(`${label}: option '${value}' not found after ${maxAttempts} attempts`);
}

async function selectLossCause(value: any, lossNum: number) {
  await selectLossDropdown(value, () => getPriorLossesDataRowCell("Loss Cause", lossNum), "selectLossCause");
}

async function selectLossTo(value: any, lossNum: number) {
  await selectLossDropdown(value, () => getPriorLossesDataRowCell("Loss To", lossNum), "selectLossTo");
}

async function selectLossStatus(value: any, lossNum: number) {
  await selectLossDropdown(value, () => getPriorLossesDataRowCell("Status", lossNum), "selectLossStatus");
}

async function selectCatastrophe(value: any, lossNum: number) {
  await selectLossDropdown(value, () => getPriorLossesDataRowCell("Catastrophe", lossNum), "selectCatastrophe");
}
async function selectFloodLoss(value: any,lossNum: number){
  if(value.toLowerCase()=='yes'){
    await getYesFloodLossField("Flood Loss",lossNum).click();
  }else{
    await getNoFloodLossField("Flood Loss",lossNum).click();
  }
}
export async function addingViolations(page: Page, testInfo: TestInfo, violationData: any) {
  await wait(TIMEOUT_4_SECONDS);
  if (!violationData) return;

  console.log("Clicking on Violations tab / add button to add violations");

  // locate existing rows and compute index for appended row
  const rowsLocator = page.locator("//div[contains(@id,'ManualViolationHistoryLV')]//tr[contains(@class,'x-grid-row')]");
  await wait(TIMEOUT_8_SECONDS);
  let violationNum = await rowsLocator.count() + 1;

  let totalViolationsAdded = 0;
  let testViolationNum = 1;
  let maxViolations = 4;

  while (maxViolations-- > 0) {
    const record = getViolationRecord(violationData, testViolationNum);
    if (!hasViolationData(record)) {
      console.log(`ℹ️ No Violation ${testViolationNum} data found`);
      console.log(`✅ Total violations added: ${totalViolationsAdded}`);
      break;
    }

    if (await isElementVisible(editPolicyTransactionbtn())) {
      await editPolicyTransactionbtn().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(2000);
      if (await isElementVisible(Okbtn())) {
        await Okbtn().click({ timeout: TIMEOUT_8_SECONDS });
        await wait(2000);
      }
    }

    console.log(`🧾 Filling Violation ${violationNum} details...`, record);

    if (await isElementVisible(getViolationsAddButton())) {
      await getViolationsAddButton().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(8000);
    }

    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });

    if (hasLossValue(record.occurrenceDate) && await isElementVisible(getViolationDataRowCell("Occurrence Date", violationNum))) {
      await fillViolationOccurrenceDate(record.occurrenceDate, violationNum);
      await wait(700);
    }

    if (hasLossValue(record.description) && await isElementVisible(getViolationDataRowCell("Description", violationNum))) {
      await handleInputOrDropDown(
        record.description,
        () => getViolationDataRowCell("Description", violationNum),
        "Description",
        violationNum
      );
      // await fillViolationDescription(record.description, violationNum);
      await wait(700);
    }

    if (hasLossValue(record.detail) && await isElementVisible(getViolationDataRowCell("Detail", violationNum))) {
      await fillViolationDetail(record.detail, violationNum);
      await wait(700);
    }

    if (await isElementVisible(getViolationDataRowCell("Driver", violationNum))) {
      await selectViolationDriver(record.driver, violationNum, page);
      await wait(700);
    }

    totalViolationsAdded++;
    console.log(`✅ Violation ${violationNum} details filled`);
    violationNum++;
    testViolationNum++;
  }
}
async function enterFloodLossAmount(value: any, lossNum: number,label: any) {
  await wait(500);//input[@name='Description']

  const cell = getPriorLossesDataRowCell(label,lossNum);

  console.log(`Filling Flood Loss Amount for Loss ${lossNum} with value: ${value}`);
  await cell.waitFor({ state: 'attached', timeout: 10000 });
  await wait(1000); // Longer wait for grid to stabilize
 
  // Try scrolling with error handling
  try {
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
    await wait(500);
  } catch (scrollError) {
    console.log(`⚠️ Scroll failed (element may have refreshed), retrying...`);
    await wait(1000);
    await cell.waitFor({ state: 'attached', timeout: 5000 });
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
  }

  console.log(`🖱️ Double-clicking Flood Loss Amount cell for Loss ${lossNum}...`);
  let editorAppeared = false;
 
  for (let attempt = 1; attempt <= 3; attempt++) {
    await cell.dblclick({ force: true });
    await wait(2000);
   
    // Check if editor appeared
    const editorInput = getLocator("//input[@name='FloodLossAmountId']");
    if (await isElementVisible(editorInput)) {
      await fill(editorInput, value.toString());
    }
  }
}
async function fillLossDescription(value: any, lossNum: number) {
  await wait(500);//input[@name='Description']

  const cell = getLossDescriptionField(lossNum);

  console.log(`Filling Loss Description for Loss ${lossNum} with value: ${value}`);
  await cell.waitFor({ state: 'attached', timeout: 10000 });
  await wait(1000); // Longer wait for grid to stabilize
 
  // Try scrolling with error handling
  try {
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
    await wait(500);
  } catch (scrollError) {
    console.log(`⚠️ Scroll failed (element may have refreshed), retrying...`);
    await wait(1000);
    await cell.waitFor({ state: 'attached', timeout: 5000 });
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
  }

  console.log(`🖱️ Double-clicking Loss Description cell for Loss ${lossNum}...`);
  let editorAppeared = false;
 
  for (let attempt = 1; attempt <= 3; attempt++) {
    await cell.dblclick({ force: true });
    await wait(2000);
   
    // Check if editor appeared
    const editorInput = getLocator("//input[@name='Description']");
    if (await isElementVisible(editorInput)) {
      await fill(editorInput, value.toString());
    }
  }
}
async function fillAmountPaid(value: any, lossNum: number,label: any) {
  const input = getLocator("//input[@name='AmountPaidRes']");
 
  const cell = getPriorLossesDataRowCell(label,lossNum);
  console.log(`Filling Amount Paid for Loss ${lossNum} with value: ${value}`);
  await cell.waitFor({ state: 'attached', timeout: 10000 });
  await wait(1000); // Longer wait for grid to stabilize
  // Try scrolling with error handling
  try {
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
    await wait(500);
  } catch (scrollError) {
    console.log(`⚠️ Scroll failed (element may have refreshed), retrying...`);
    await wait(1000);
    await cell.waitFor({ state: 'attached', timeout: 5000 });
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    await cell.dblclick({ force: true });
    await wait(2000);
   
    // Check if editor appeared
   
    if (await isElementVisible(input)) {
      await fill(input, value.toString());
    }
  }
 
}
async function fillLossAmountPaid(value: any, lossNum: number,label: any) {
  const input = getPriorLossesInputBox(label, lossNum);
  const cell = getPriorLossesDataRowCell(label, lossNum);
  console.log(`Filling Amount Paid for Loss ${lossNum} with value: ${value}`);
  await cell.waitFor({ state: 'attached', timeout: 10000 });
  await wait(1000); 
  try {
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
    await wait(500);
  } catch (err) {
    console.log(`Scroll failed, retrying after refresh...`);
    await wait(1000);
    await cell.waitFor({ state: 'attached', timeout: 5000 });
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`Attempt ${attempt} to fill Loss Amount Paid`);
    await cell.dblclick({ force: true });
    await wait(2000);
    if (await isElementVisible(input)) {
      await input.click({ clickCount: 3 });
      await wait(2000);
      await input.press("Backspace");
      await input.type(value.toString(),{delay: 800});
      await input.press("Tab");
      await wait(800);
      console.log(`Successfully filled on attempt ${attempt}`);
      break;
    } else {
      console.log(`Input not visible, retrying...`);
      await wait(1000);
    }
  }
}

async function fillOccurrenceDate(value: any, lossNum: number) {
  const formattedDate = formatToMMDDYYYY(value);
  const Datecell = getPriorLossesDataRowCell("Occurrence Date", lossNum);

  // Ensure the cell is visible and activate edit mode
  await Datecell.scrollIntoViewIfNeeded().catch(() => undefined);

  const maxAttempts = 3;
  let editor: ReturnType<typeof getLocator> | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await Datecell.dblclick({ force: true });
      await wait(500);

      // Primary candidate: the usual input for this column
      const primary = getPriorLossesInputBox("Occurrence Date", lossNum);
      try {
        await primary.waitFor({ state: 'visible', timeout: 1200 });
        // quick sanity check on name/id to ensure it matches occurrence
        const nameOrId = (await primary.evaluate((el: any) => (el.getAttribute('name') || el.id || '')).catch(() => '')) || '';
        if (/occurr/i.test(nameOrId)) {
          editor = primary;
          break;
        }
      } catch { /* primary not visible or not correct */ }

      // Secondary candidate: search for any input inside the same row that looks like an occurrence input
      const rowInput = getLocator(`//tr[@data-recordindex=${lossNum}]//input[contains(@name,'Occurrence') or contains(@id,'Occurrence') or contains(@name,'occurrence') or contains(@id,'occurrence') or contains(@name,'OccurrenceDate') or contains(@id,'OccurrenceDate')]`);
      try {
        await rowInput.waitFor({ state: 'visible', timeout: 1200 });
        editor = rowInput;
        break;
      } catch { /* not found yet */ }

      // Third fallback: any visible input inside the row (last resort)
      const anyRowInput = getLocator(`//tr[@data-recordindex=${lossNum}]//input[not(@type='hidden')]`).first();
      try {
        await anyRowInput.waitFor({ state: 'visible', timeout: 800 });
        editor = anyRowInput;
        // still verify by checking name/id contains 'occurr' if possible
        const nameOrId = (await editor.evaluate((el: any) => (el.getAttribute('name') || el.id || '')).catch(() => '')) || '';
        if (!/occurr/i.test(nameOrId)) {
          // if it doesn't appear like an occurrence input, retry the process
          editor = null;
        } else {
          break;
        }
      } catch { /* nothing visible yet */ }
    } catch (err) {
      // ignore and retry
    }

    await wait(500);
  }

  if (!editor) {
    throw new Error(`Occurrence Date: unable to find editor for Loss ${lossNum}`);
  }

  // Ensure editor has focus then type the formatted date
  try {
    const isFocused = await editor.evaluate((el: any) => el === document.activeElement).catch(() => false);
    if (!isFocused) await editor.click().catch(() => undefined);
  } catch { /* ignore */ }
  // Attempt typing + verification loop
  const maxTypeAttempts = 3;
  let typedAndVerified = false;

  for (let t = 1; t <= maxTypeAttempts; t++) {
    try {
      await editor.fill('');
      await editor.type(formattedDate, { delay: 800, timeout: STANDARD_TIMEOUT });
      // attempt to commit the edit
      try {
        await editor.press('Tab');
      } catch { /* some inputs may not support press */ }

      await wait(700);

      // verify cell shows the value (accept a couple of formats)
      const cellText = (await Datecell.innerText().catch(() => '')).toString().trim();
      const altFormatted = formattedDate.replace(/\//g, '-');
      if (
        cellText.length > 0 &&
        (cellText.includes(formattedDate) || cellText.includes(altFormatted) || cellText.includes(formattedDate.replace(/^0+/, '')))
      ) {
        typedAndVerified = true;
        break;
      }

      // Not verified: try to re-open the editor for another attempt
      await Datecell.dblclick({ force: true }).catch(() => undefined);
      await wait(400);

      // try to re-find a proper editor in the row
      const retryPrimary = getPriorLossesInputBox('Occurrence Date', lossNum);
      if (await retryPrimary.count && (await retryPrimary.count()) > 0) {
        editor = retryPrimary;
        continue;
      }

      const retryRowInput = getLocator(`//tr[@data-recordindex=${lossNum}]//input[contains(@name,'Occurrence') or contains(@id,'Occurrence')]`);
      if (await retryRowInput.count && (await retryRowInput.count()) > 0) {
        editor = retryRowInput;
        continue;
      }
    } catch (err) {
      // swallow and retry
    }
  }

  if (!typedAndVerified) {
    throw new Error(`Occurrence Date: failed to set/verify value '${formattedDate}' for Loss ${lossNum}`);
  }
}
async function fillLossDetail(value: any, lossNum:number) {
  const finalValue = String(value ?? "").trim();
  const cell = getPriorLossesDataRowCell("Detail", lossNum);
  console.log(`Filling Loss Detail for Loss ${lossNum} with value: ${finalValue}`);
  await cell.waitFor({ state: "visible", timeout: 10000 });
  await cell.scrollIntoViewIfNeeded().catch(() => undefined);

  const typeValue = async () => {
    await cell.click({ force: true });
    await wait(500);
    await cell.type(finalValue, { delay: 150 });
    await cell.press('Tab').catch(() => undefined);
    await wait(700);
  };

  await typeValue();

  const verifyTyped = async () => {
    const cellText = (await cell.innerText().catch(() => '')).trim();
    return cellText.length > 0 && (cellText.includes(finalValue) || cellText === finalValue);
  };

  if (!await verifyTyped()) {
    console.log(`⚠️ Loss Detail not verified for Loss ${lossNum}; retrying`);
    await cell.click({ force: true }).catch(() => undefined);
    await wait(500);
    await typeValue();

    if (!await verifyTyped()) {
      throw new Error(`Loss Detail: failed to type and verify value '${finalValue}' for Loss ${lossNum}`);
    }
  }
}
async function selectDriver(value: any, lossNum: number, page: Page) {
  console.log(`Input Value: '${value}'`);
  const driverName = await page
    .locator("//span[@id='SubmissionWizard:JobWizardInfoBar:AccountName-btnInnerEl']//span")
    .textContent();
  console.log(`Header DriverName: '${driverName}'`);
  const finalValue = String(value ?? driverName ?? "").trim();
  console.log(`Final Value Used: '${finalValue}'`);
  if (!finalValue) {
    console.log("No driver value available");
    throw new Error("Driver: No value available to select");
  }
  const cell = getPriorLossesDataRowCell("Driver", lossNum);
  const optionLocator = getLocator(
    `//ul[@class='x-list-plain']//li[text()='${finalValue}']`
  );
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Driver] Attempt ${attempt} of ${maxAttempts}`);
    await cell.waitFor({ state: "attached"});
    try {
      await cell.scrollIntoViewIfNeeded();
      console.log("Cell scrolled into view");
    } catch {}
    await cell.click({ force: true }).catch(() => {});
    console.log("Clicked driver cell");
    try {
      await optionLocator.waitFor({ state: "visible"});
      console.log(`Option '${finalValue}' is visible`);
      await optionLocator.scrollIntoViewIfNeeded();
      await optionLocator.click({ force: true });
      console.log(`SUCCESS: Driver '${finalValue}' selected on attempt ${attempt}`);
      return;
    } catch (err) {
      console.log(`Attempt ${attempt} failed for '${finalValue}'`);
      console.log(`Error: ${err}`);
      await wait(1000);
    }
  }
  console.log(`FAILURE: Driver '${finalValue}' not selected after ${maxAttempts} attempts`);
  // throw new Error(`Driver selection failed for value: ${finalValue}`);
}
async function fillLossDate(value: any, lossNum: number,label: any) {
  const formattedDate = formatToMMDDYYYY(value);
  const Datecell = getPriorLossesDataRowCell(label,lossNum);
  console.log(`Filling Loss Date for Loss ${lossNum} with value: ${formattedDate}`);
  console.log(`Locator for Loss Date field: ${Datecell}`);
  console.log(`Is Loss Date field visible: ${await isElementVisible(Datecell)}`);
  await Datecell.click({ timeout: TIMEOUT_8_SECONDS });
  
  await getlossDate().waitFor({ state: "visible", timeout: TIMEOUT_8_SECONDS });
  await fill(getlossDate(), formattedDate, { timeout: STANDARD_TIMEOUT });

  await wait(700);
}
async function fillAtFaultIndicator(value: any, lossNum: number) {
  const cell = getPriorLossesDataRowCell("At Fault Indicator", lossNum);
  console.log(`Filling At Fault Indicator for Loss ${lossNum} with value: ${value}`);
  console.log(`Locator for At Fault Indicator field: ${cell}`);
  console.log(`Is At Fault Indicator field visible: ${await isElementVisible(cell)}`);
  await cell.click({ timeout: TIMEOUT_8_SECONDS });
  const input = getPriorLossesInputBox("At Fault Indicator", lossNum);
  if (!input.isEditable() || !input.isEnabled() || !await isElementVisible(input)){
    console.log(`At Fault Indicator field is not editable for Loss ${lossNum}, skipping...`);
    return;
  }
  await input.waitFor({ state: "visible", timeout: TIMEOUT_8_SECONDS });
  await input.fill('');
  await input.pressSequentially(value.toString(), { delay: 500 });
  await input.press("Tab");
  await wait(700);
}
// --- Violation field helpers (mirror prior-loss helpers) ---
async function fillViolationOccurrenceDate(value: any, violationNum: number) {
  const formattedDate = formatToMMDDYYYY(value);
  const Datecell = getViolationDataRowCell("Occurrence Date", violationNum);

  await Datecell.dblclick();

  const input = getViolationInputBox("Occurrence Date", violationNum);
  await input.waitFor({ state: "visible", timeout: TIMEOUT_8_SECONDS });

  await wait(2000);
  const isFocused = await input.evaluate((el: any) => el === document.activeElement);
  if (!isFocused) {
    await input.click().catch(() => undefined);
  }

  await input.type(formattedDate, { delay: 800, timeout: STANDARD_TIMEOUT });
  await wait(700);
}

async function fillViolationDescription(value: any, violationNum: number) {
  const finalValue = String(value ?? "").trim();
  console.log(`Selecting Violation Description for Violation ${violationNum}: '${finalValue}'`);
  await selectViolationDescriptionDropdown(finalValue, violationNum);
}

// Dedicated dropdown selector for Violation Description with verification/retries
async function selectViolationDescriptionDropdown(optionValue: any, violationNum: number) {
  const value = String(optionValue ?? "").trim();
  const optionLocator = getLocator(`//ul[contains(@class,'x-list-plain')]//li[normalize-space()='${value}']`);
  const trigger = () => getViolationDataRowCell("Description", violationNum);

  // await selectDropdownWithRetry(trigger,optionValue);

  const maxAttempts = 8;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const el = trigger();
    await el.waitFor({ state: "attached", timeout: STANDARD_TIMEOUT });

    try {
      await el.scrollIntoViewIfNeeded();
    } catch { await wait(500); }

    // open the dropdown/editor
    await el.click().catch(() => {});

    try {
      await optionLocator.waitFor({ state: "visible", timeout: STANDARD_TIMEOUT });
      await optionLocator.scrollIntoViewIfNeeded();
      await waitForPageReady(getPage());
      await click(optionLocator);
      await waitForPageReady(getPage());
      await getPage().keyboard.press('Escape');

      // short wait then verify the cell shows the selected value
      await wait(500);
      const selectedText = (await trigger().innerText()).trim();
      if (selectedText.includes(value) || selectedText === value) {
        console.log(`Violation Description: selected '${value}' on attempt ${attempt}`);
        return;
      } else {
        console.log(`Violation Description: selection not reflected yet (got '${selectedText}') — retrying`);
      }
    } catch (err) {
      console.log(`Violation Description: attempt ${attempt} failed to select option — ${err instanceof Error ? err.message : String(err)}`);
    }

    await wait(1000);
  }

  throw new Error(`Violation Description: option '${value}' not selectable after ${maxAttempts} attempts`);
}

async function fillViolationDetail(value: any, violationNum:number) {
  const cell = getViolationDataRowCell("Detail", violationNum);
  console.log(`Filling Violation Detail for Violation ${violationNum} with value: ${value}`);
  await cell.waitFor({ state: 'visible', timeout: 10000 });
  await cell.scrollIntoViewIfNeeded().catch(() => undefined);
  await cell.dblclick();
  await cell.type(value.toString(), { delay: 150 });
}

async function selectViolationDriver(value: any, violationNum: number, page: Page) {
  console.log(`Input Value: '${value}'`);
  const driverName = await page
    .locator("//span[@id='SubmissionWizard:JobWizardInfoBar:AccountName-btnInnerEl']//span")
    .textContent();
  console.log(`Header DriverName: '${driverName}'`);
  const finalValue = String(value ?? driverName ?? "").trim();
  console.log(`Final Value Used: '${finalValue}'`);
  if (!finalValue) {
    throw new Error("Driver: No value available to select");
  }
  const cell = getViolationDataRowCell("Driver", violationNum);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${finalValue}']`);
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await cell.waitFor({ state: 'attached', timeout: 5000 });
    await cell.click({ force: true }).catch(() => {});
    try {
      await optionLocator.waitFor({ state: 'visible', timeout: 3000 });
      await click(optionLocator);
      console.log(`Driver '${finalValue}' selected`);
      return;
    } catch (err) {
      await wait(1000);
    }
  }
  throw new Error(`Driver selection failed for value: ${finalValue}`);
}
function getPriorLossRecord(riskAnalysisData: any, lossNum: number) {
  return {
    vehicleClassification: riskAnalysisData[`Loss_Vehicle_Classificartion_${lossNum}`],
    occurrenceDate: riskAnalysisData[`Loss_Occurrence_Date_${lossNum}`],
    lossDetail: riskAnalysisData[`Loss_Detail_${lossNum}`],
    lossAmountPaid: riskAnalysisData[`Loss_Amount_Paid_${lossNum}`],
    lossAtFaultIndicator: riskAnalysisData[`Loss_At_Fault_Indicator_${lossNum}`] || riskAnalysisData[`Loss_Fault_Indicator_${lossNum}`],
    lossDriver: riskAnalysisData[`Loss_Driver_${lossNum}`],
    lossDate: riskAnalysisData[`Loss_Date_${lossNum}`],
    lossCause: riskAnalysisData[`Loss_Cause_${lossNum}`],
    lossTo: riskAnalysisData[`Loss_To_${lossNum}`],
    lossDescription: riskAnalysisData[`Loss_Description_${lossNum}`],
    lossAmount: riskAnalysisData[`Loss_Amount_${lossNum}`],
    lossStatus: riskAnalysisData[`Loss_Status_${lossNum}`],
    catastrophe: riskAnalysisData[`Catastrophe_${lossNum}`],
    floodloss: riskAnalysisData[`Flood_Loss_${lossNum}`],
    floodlossamount: riskAnalysisData[`Flood_Loss_Amount_${lossNum}`]
  };
}
 
function hasPriorLossData(record: {
  vehicleClassification: any;
  occurrenceDate: any;
  lossDetail: any;
  lossAmountPaid: any;
  lossAtFaultIndicator: any;
  lossDriver: any;
  lossDate: any;
  lossCause: any;
  lossTo: any;
  lossDescription: any;
  lossAmount: any;
  lossStatus: any;
  catastrophe: any;
}): boolean {
  return (
    hasLossValue(record.vehicleClassification) ||
    hasLossValue(record.occurrenceDate) ||
    hasLossValue(record.lossDetail) ||
    hasLossValue(record.lossAmountPaid) ||
    hasLossValue(record.lossAtFaultIndicator) ||
    hasLossValue(record.lossDriver) ||
    hasLossValue(record.lossDate) ||
    hasLossValue(record.lossCause) ||
    hasLossValue(record.lossTo) ||
    hasLossValue(record.lossDescription) ||
    hasLossValue(record.lossAmount) ||
    hasLossValue(record.lossStatus) ||
    hasLossValue(record.catastrophe)
  );
}

// Violation record extractor (mirrors getPriorLossRecord)
function getViolationRecord(violationData: any, violationNum: number) {
  return {
    occurrenceDate: violationData[`Violation_Occurrence_Date_${violationNum}`],
    description: violationData[`Violation_Description_${violationNum}`],
    detail: violationData[`Violation_Detail_${violationNum}`],
    driver: violationData[`Violation_Driver_${violationNum}`]
  };
}

function hasViolationData(record: {
  occurrenceDate: any;
  description: any;
  detail: any;
  driver: any;
}): boolean {
  return (
    hasLossValue(record.occurrenceDate) ||
    hasLossValue(record.description) ||
    hasLossValue(record.detail) ||
    hasLossValue(record.driver)
  );
}

export async function addingpriorlosses(page: Page, testInfo: TestInfo, riskAnalysisData: any) {
  await wait(TIMEOUT_4_SECONDS);
  if (!(await isElementVisible(getPriorLossesTab()))) {
    return;
  }

  console.log("Clicking on Prior Losses tab to add prior losses");
  await getPriorLossesTab().click({ timeout: TIMEOUT_8_SECONDS });

  // if(await isElementVisible(editPolicyTransactionbtn())){
  //   console.log("Edit Policy Transaction button to add prior losses is visible, clicking on it");
  //   await editPolicyTransactionbtn().click({ timeout: TIMEOUT_8_SECONDS });
  //   await wait(2000);
  //   if (await isElementVisible(Okbtn())) {
  //     await Okbtn().click({ timeout: TIMEOUT_8_SECONDS });
  //     await wait(2000);
  //   }
  // }

  const rows = page.locator("//div[@id='SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:ManualLossHistoryLV']//tr[contains(@class,'x-grid-row')]");

  // ✅ wait until backend default row appears
  // await rows.first().waitFor({ state: "visible" });
  await wait(TIMEOUT_8_SECONDS);

  // now count will be correct
  let lossNum = await rows.count() + 1;  // should be 1 now

  let totalLossesAdded = 0;
  let testLossNum = 1;
  let maxLossess = 4;
  while (maxLossess-- > 0) {
    const record = getPriorLossRecord(riskAnalysisData, testLossNum);
    if (!hasPriorLossData(record)) {
      console.log(`ℹ️ No Prior Loss ${testLossNum} data found`);
      console.log(`✅ Total prior losses added: ${totalLossesAdded}`);
      break;
    }

    if (await isElementVisible(editPolicyTransactionbtn())) {
      console.log("Edit Policy Transaction button to add prior losses is visible, clicking on it");
      await editPolicyTransactionbtn().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(2000);
      if (await isElementVisible(Okbtn())) {
        await Okbtn().click({ timeout: TIMEOUT_8_SECONDS });
        await wait(2000);
      }
    }

    console.log(`🧾 Filling Prior Loss ${lossNum} details...`, record);

    if (await isElementVisible(addpriorlossesbtn())) {
      await addpriorlossesbtn().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(10000);
    }


    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if (hasLossValue(record.lossDate) && await isElementVisible(getPriorLossesDataRowCell("Loss Date",lossNum))) {
      console.log(`Filling Loss Date for Prior Loss ${lossNum} with value: ${record.lossDate}`);
      await fillLossDate(record.lossDate, lossNum,"Loss Date");
    }

    if (hasLossValue(record.lossCause) && await isElementVisible(getPriorLossesDataRowCell("Loss Cause",lossNum))) {
      console.log(`Selecting Loss Cause for Prior Loss ${lossNum} with value: ${record.lossCause}`);
      await selectLossCause(record.lossCause, lossNum);
      await wait(700);
    }

    if (hasLossValue(record.lossTo) && await isElementVisible(getPriorLossesDataRowCell("Loss To",lossNum))) {
      console.log(`Selecting Loss To for Prior Loss ${lossNum} with value: ${record.lossTo}`);
      await selectLossTo(record.lossTo, lossNum);
      await wait(700);
    }

    if (hasLossValue(record.lossDescription) && await isElementVisible(getPriorLossesDataRowCell("Description", lossNum))) {
      console.log(`Filling Loss Description for Prior Loss ${lossNum} with value: ${record.lossDescription}`);
      await handleInputOrDropDown(
        record.lossDescription,
        () => getPriorLossesDataRowCell("Description", lossNum),
        "Description",
        lossNum
      );
      await wait(700);
    }

    // if (hasLossValue(record.lossAmount) && await isElementVisible(getPriorLossesDataRowCell("Amount",lossNum))) {
    //   console.log(`Filling Amount for Prior Loss ${lossNum} with value: ${record.lossAmount}`);
    //   await fillAmountPaid(record.lossAmount, lossNum,"Amount");
    //   await wait(700);
    // }

    if (hasLossValue(record.lossStatus) && await isElementVisible(getPriorLossesDataRowCell("Status", lossNum))) {
      console.log(`Selecting Loss Status for Prior Loss ${lossNum} with value: ${record.lossStatus}`);
      await selectLossStatus(record.lossStatus, lossNum);
      await wait(700);
    }

    if (hasLossValue(record.catastrophe) && await isElementVisible(getPriorLossesDataRowCell("Catastrophe",lossNum))) {
      console.log(`Selecting Catastrophe for Prior Loss ${lossNum} with value: ${record.catastrophe}`);
      await selectCatastrophe(record.catastrophe, lossNum);
      await wait(700);
    }

    if (hasLossValue(record.floodloss) && await isElementVisible(getPriorLossesDataRowCell("Flood Loss",lossNum))) {
      console.log(`Selecting Flood Loss for Prior Loss ${lossNum} with value: ${record.floodloss}`);
      await selectFloodLoss(record.floodloss, lossNum);
      await wait(700);
    }
    if (hasLossValue(record.floodlossamount) && await isElementVisible(getPriorLossesDataRowCell("Flood Loss Amount",lossNum))) {
      console.log(`Selecting Flood Loss Amount for Prior Loss ${lossNum} with value: ${record.floodlossamount}`);
      await enterFloodLossAmount(record.floodlossamount, lossNum,"Flood Loss Amount");
      await wait(700);
    }
    if (hasLossValue(record.vehicleClassification) && await isElementVisible(getPriorLossesDataRowCell("Vehicle Classification", lossNum))) {
      console.log(`Selecting Vehicle Classification for Prior Loss ${lossNum} with value: ${record.vehicleClassification}`);
      await selectLossDropdown(record.vehicleClassification, () => getPriorLossesDataRowCell("Vehicle Classification", lossNum), "Vehicle Classification");
      // await page.keyboard.press('Tab');
      await wait(700);
    }
    if (hasLossValue(record.occurrenceDate) && await isElementVisible(getPriorLossesDataRowCell("Occurrence Date", lossNum))) {
      console.log(`Selecting Occurrence Date for Prior Loss ${lossNum} with value: ${record.occurrenceDate}`);
      await fillOccurrenceDate(record.occurrenceDate, lossNum);
      await wait(700);
    }
    if (hasLossValue(record.lossDetail) && await isElementVisible(getPriorLossesDataRowCell("Detail", lossNum))) {
      console.log(`Selecting Loss Detail for Prior Loss ${lossNum} with value: ${record.lossDetail}`);
      await fillLossDetail(record.lossDetail, lossNum);
      await wait(700);
    }
    if ((hasLossValue(record.lossAmountPaid) || hasLossValue(record.lossAmount)) && await isElementVisible(getPriorLossesDataRowCell("Amount Paid", lossNum))) {
      console.log(`Filling Amount Paid for Prior Loss ${lossNum} with value: ${record.lossAmountPaid}`);
      await fillLossAmountPaid(record.lossAmountPaid || record.lossAmount, lossNum,"Amount Paid");
      await wait(700);
    }

    if (await isElementVisible(getPriorLossesDataRowCell("Driver", lossNum))) {

      await selectDriver(record.lossDriver, lossNum, page);

      await wait(700);
    }
    if (hasLossValue(record.lossAtFaultIndicator) && await isElementVisible(getPriorLossesDataRowCell("At Fault Indicator", lossNum))) {
      console.log(`Filling At Fault Indicator for Prior Loss ${lossNum} with value: ${record.lossAtFaultIndicator}`);
      await fillAtFaultIndicator(record.lossAtFaultIndicator, lossNum);
      await wait(700);
    }

    totalLossesAdded++;
    console.log(`✅ Prior Loss ${lossNum} details filled`);
    lossNum++;
    testLossNum++;
  }
}

async function navigateToPriorPoliciesAndCapture(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getPriorPoliciesTab())) {
    await getPriorPoliciesTab().click();
    await waitForPageReady(page);
    await clearIfVisible(page);
    await captureFullPage2D(page, testInfo, "Prior Policies", "#centerPanel");
  }
}
async function navigateToPriorLossesAndCapture(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getPriorLossesTab())) {
    await getPriorLossesTab().click();
    await waitForPageReady(page);

    let lossTabText = "Prior Losses";
    try {
      lossTabText = await page.locator("//span[contains(text(),'Losses')]").first().innerText();
    } catch { }
    await clearIfVisible(page);
    await waitForPageReady(page);

    await captureFullPage2D(page, testInfo, lossTabText, "#centerPanel");
  }
}
async function navigateToMotorVehicleRecordsAndCapture(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getMotorVehicleRecord())) {

    await getMotorVehicleRecord().click();
    await waitForPageReady(page);

    // await captureAndAttachforCore(page, testInfo, "Motor Vehicle Records");
    await captureFullPage2D(page, testInfo, "Motor Vehicle Records", "#centerPanel");

  }
}

async function navigateBackToRiskAnalysis(page: Page) {
  if (await isElementVisible(getRiskAnalysisTab())) {
    await getRiskAnalysisTab().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await waitForPageReady(getPage());
}

async function clickSaveAndNextWithRetry(page: Page) {
  await getSaveAndNextButton().click();

  const retryRequired = await isElementVisible(getWarningMsgCore()) && !(await isElementVisible(getClearButton()));
  if (retryRequired) {
    console.log("Warning message found without Clear button. Retrying Save & Next.");
    await getSaveAndNextButton().click();
  }
  await waitForPageReady(page);
}

export async function clickSaveandNextFromRiskAnlyasisPage(page: Page, testInfo: TestInfo, riskAnalysisData: any) {
  await waitForPageReady(page);

  await navigateToPriorPoliciesAndCapture(page, testInfo);
  await navigateToPriorLossesAndCapture(page, testInfo);
  await navigateToMotorVehicleRecordsAndCapture(page, testInfo);
  await navigateBackToRiskAnalysis(page);
  await clickSaveAndNextWithRetry(page);
}

async function navigateToRiskAnalysisUWIssues(page: Page): Promise<boolean> {
  if (!(await isElementVisible(getResolveButton())) && !(await isElementVisible(getReturnToRiskAnalysisButton())) && !(await isElementVisible(getRiskAnalysisText()))) {
    return false;
  }

  console.log("Resolve/ReturnToRiskAnalysis button is visible or Currently in Risk Analysis Page, clicking on it to resolve issues");

  if(await isElementVisible(getResolveButton())){
    await getResolveButton().click();
  }
  await waitForPageReady(page);
  
  if(await isElementVisible(getReturnToRiskAnalysisButton())){
    await getReturnToRiskAnalysisButton().click();
  }
  await waitForPageReady(page);

  await getRiskAnalysisTab().click();
  await waitForPageReady(page);

  console.log("Navigated back to Risk Analysis tab");

  if (await isElementVisible(getUWIssuesHeading())) {
    console.log("Opening UW Issues tab");

    await getUWIssuesHeading().click();
    await waitForPageReady(page);
  }

  return true;
}

async function handlingUWFromPolicyReview(testId: string, blockingContext: string, ruleMatrix: any, page: Page, testInfo: any): Promise<ValidationResult> {
  if (await isElementVisible(getClearButton())) {
    const validationResult = await handleValidationAndClear(testId, blockingContext, ruleMatrix, page, testInfo);

    const stopResult = await stopIfValidationFailed(validationResult);
    if (stopResult) return stopResult;
  }
  let validationResult: ValidationResult = createApprovalResult("No UW approval elements visible - continuing");
  let UWI_Description: string[] = [];

  const resolved = await navigateToRiskAnalysisUWIssues(page);
  await clickQuote(page);
  await navigateToRiskAnalysisUWIssues(page);

  if (resolved) {

    validationResult = await CV_saveAndQuote(testId, ruleMatrix, page, testInfo);
    let stopResult = await stopIfValidationFailed(validationResult);
    if (stopResult) return stopResult;

    console.log("Under UW Issues Tab In Risk Analysis");
    if (await isElementVisible(checkNewUW())) {
      if (await isElementVisible(getUWIDescription())) {
        UWI_Description = await getIssueDescriptions();
        console.log("🔍 Raw UWI_Description from Risk Analysis:", UWI_Description);
      } else {
        console.log("ℹ️ No UWI descriptions found in Risk Analysis");
      }
    }
    await waitForPageReady(page);

    validationResult = { ...validationResult, uwMessages: UWI_Description };
    stopResult = await stopIfValidationFailed(validationResult);
    if (stopResult) return stopResult;

    await clickQuote(page);

    validationResult = await handleValidationAndClear(testId, "Risk Analysis", ruleMatrix, page, testInfo);
    validationResult = { ...validationResult, uwMessages: UWI_Description };
    stopResult = await stopIfValidationFailed(validationResult);
    if (stopResult) return stopResult;

    await waitForPageReady(page);
    if (await isElementVisible(getQuoteButtonInCoreRiskAnalysis()) && !(await isElementVisible(getQuotePageScreenHeading()))) {
      console.log("Quote button is still visible after clicking Clear, clicking on it again");
      await getQuoteButtonInCoreRiskAnalysis().click().catch(() => undefined);
    }
  }
  return {
    ...validationResult, uwMessages: UWI_Description
  }
}
// Optional function to generate quote instead of proceeding to next page
export async function generateQuoteFromPolilcyReviewPage(
  testId: string,
  blockingContext: string,
  ruleMatrix: any,
  page: Page,
  testInfo: TestInfo
): Promise<ValidationResult> {

  console.log("Attempting to generate quote from Policy Review page if Quote button is visible");

  let validationResult: ValidationResult = createApprovalResult("No UW approval elements visible - continuing");

  if (await isElementVisible(getPolicyReviewHeading())) {
    console.log("Currently in Policy Review page, checking for Quote button");

    await waitForPageReady(page);

    for (let attempt = 1; attempt <= 4; attempt++) {
      if (!(await isElementVisible(getQuoteinPolicyReviewPage()))) {
        break;
      }

      console.log(`Clicking Quote from Policy Review (Attempt ${attempt})`);

      await getQuoteinPolicyReviewPage().click();
      await waitForPageReady(page);

      validationResult = await handleValidationAndClear(testId, blockingContext, ruleMatrix, page, testInfo);
      let stopResult = await stopIfValidationFailed(validationResult);
      if (stopResult) return stopResult;

      // if(await navigateToRiskAnalysisUWIssues(page)){
      //   console.log("Return to Risk Analysis is Visible after Quote Click in Policy Review.");
      //     break;
      // }

      if (await isElementVisible(getQuotePageText()) || await isElementVisible(getQuotePageScreenHeading())) {
        console.log("Successfully navigated to Quote page.");
        break;
      }
    }

    await waitForPageReady(page);
    await clearIfVisible(page);


    validationResult = await handlingUWFromPolicyReview(testId, blockingContext, ruleMatrix, page, testInfo);
    let stopResult = await stopIfValidationFailed(validationResult);
    if (stopResult) return stopResult;

    console.log("Checking if Save and Next button is visible in Policy Review page");

    const canClickSaveAndNext = await isElementVisible(getSaveAndNextButton()) && !(await isElementVisible(getQuotePageScreenHeading()));
    if (canClickSaveAndNext) {
      console.log("Save and Next button is visible, proceeding to next page");

      await getSaveAndNextButton().click();
    }
  }

  await waitForPageReady(page);
  if (await isElementVisible(getQuotePageScreenHeading())) {
    console.log("Navigated to Quote page, clicking Quote tab from left navigation panel");
  }

  return validationResult;
}
export async function forms(page: Page, testInfo: TestInfo) {
  await clearIfVisible(page);
  if (!await isElementVisible(getForms())) {
    console.log("Still not navigated to forms Page,clicking tab again .");
    await getFormsTab().click({ timeout: TIMEOUT_8_SECONDS });
    await waitForPageReady(page);
  }
  if (await isElementVisible(getForms())) {
    log("---------------------Navigated to Forms page---------------------");
    if (await isElementVisible(getFormsTitle())) {
      if (!await isElementVisible(getPageCountIndicator())) {
        console.log("Only one form is Visible,capturing it .");
        // await captureAndAttachforCore(page, testInfo, `Forms Page`,{fullPage:true});
        await captureFullPage2D(page, testInfo, "Forms Page", "#centerPanel");
        await wait(2000);
        return;
      }
      const pageIndicatorText = await getPageCountIndicator().innerText();
      const pageCountMatch = pageIndicatorText.match(/of\s+(\d+)/);
      const totalPages = pageCountMatch ? parseInt(pageCountMatch[1]) : 1;

      console.log(`📄 Total form pages to capture: ${totalPages}`);

      // Capture all pages starting from page 1
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`Capturing form page ${pageNum} of ${totalPages}...`);

        // Capture screenshot with proper title
        await wait(4000);
        // await captureAndAttachforCore(page, testInfo, `Forms Page ${pageNum} of ${totalPages}`,{fullPage:true});
        await captureFullPage2D(page, testInfo, `Forms Page ${pageNum} of ${totalPages}`, "#centerPanel");

        // Click next button to go to next page (skip for last page)
        if (pageNum < totalPages && await isElementVisible(getFormsNextButton())) {
          await getFormsNextButton().click({ timeout: TIMEOUT_8_SECONDS });
          await wait(4000); // Wait for page to load
        } else if (pageNum < totalPages) {
          console.log("Forms next button not visible, stopping pagination");
          break;
        }
      }

      console.log(`✅ Captured all ${totalPages} form pages`);
    }
  } else {
    if (!(await isElementVisible(getFormsTitle()))) {
      console.log("Failed To Navigate Form Page,Stopping Test");
      throw new Error("Navigation Failed to Forms Page");
    }
  }
}
async function navigateToQuotePageAndCapture(page: Page, testInfo: TestInfo) {

  await waitForPageReady(page);
  console.log("📸 Capturing Quote Page");

  await captureFullPage2D(page, testInfo, "Quote Page", "#centerPanel");
}
async function navigateToDiscountsAppliedAndCapture(page: Page, testInfo: TestInfo) {
  if (!(await isElementVisible(getDiscountAppliedTab()))) {
    return;
  }
  await getDiscountAppliedTab().click();
  await waitForPageReady(page);

  await captureFullPage2D(page, testInfo, "Quote Page Discounts Applied Tab", "#centerPanel");
}
async function clickSaveAndNextFromQuotePage() {
  if (!(await isElementVisible(getSaveAndNextButton()))) {
    return;
  }
  console.log("Save And Next visible on Quote Page");

  await getSaveAndNextButton().click();
}
async function navigateToFormsAndCapture(  page: Page,  testInfo: TestInfo) {

  await getFormsTab().click({force:true});

  await waitForPageReady(page);
  await forms(page, testInfo);
}
async function clickBindOptionsAndProceedToIssuance(page: Page) {
  if (!(await isElementVisible(getBindOptionsinFormsPage()))) {
    return;
  }

  console.log("Proceeding To Issuance from Forms");

  await getBindOptionsinFormsPage().click();
  await waitForPageReady(page);

  if (await isElementVisible(getProceedToIssuanceOption())) {
    await getProceedToIssuanceOption().click();
    await waitForPageReady(page);
  }
}
async function clickSaveAndNextFromFormsPage(page: Page) {
  if (!(await isElementVisible(getSavenNextinForms()))) {
    return;
  }
  console.log("Save And Next visible on Forms page");
  await getSavenNextinForms().click();

  await waitForPageReady(page);
}
async function validateAndHandleClearButton(
  testCaseId: string,
  blockingContext: string,
  ruleMatrix: any,
  page: Page,
  testInfo: TestInfo
): Promise<ValidationResult> {

  const validationResult: ValidationResult = {
    success: true,
    errorType: "none",
    message: "",
    shouldStop: false,
    status: "PASS"
  };

  if (!(await isElementVisible(getClearButtoninRiskAnalysisCore())) && !(await isElementVisible(getErrorIconCore()))) {
    return validationResult;
  }

  const result = await validateRulesForTestCase(
    testCaseId,
    blockingContext,
    ruleMatrix,
    page,
    testInfo
  );

  if (result.shouldStop) {
    return result;
  }

  await getClearButtoninRiskAnalysisCore().click({force:true});

  return result;
}
async function handleReturnToRiskAnalysisAndResolveUW(
  page: Page
) {
  if (!(await isElementVisible(getReturnToRiskAnalysisButton()))) {
    return;
  }

  console.log("UW triggered. Returning to Risk Analysis.");

  await wait(2000);

  await getReturnToRiskAnalysisButton().click({
    timeout: TIMEOUT_8_SECONDS
  });

  await wait(TIMEOUT_4_SECONDS);

  if (await isElementVisible(getQuoteButton())) {
    await getQuoteButton().click();
    await wait(4000);
  }

  if (await isElementVisible(getReturnToRiskAnalysisButton())) {
    await getReturnToRiskAnalysisButton().click({
      timeout: TIMEOUT_8_SECONDS
    });
  }

  await wait(4000);

  if (await isElementVisible(getResolveButton())) {
    await getResolveButton().click({
      timeout: TIMEOUT_8_SECONDS
    });

    await wait(2000);

    if (await isElementVisible(getUWIssuesHeading())) {
      await getUWIssuesHeading().click({
        timeout: TIMEOUT_8_SECONDS
      });
    }
  }

  await getRiskAnalysisTab().click();
  await wait(2000);

  if (await isElementVisible(getUWIssuesHeading())) {
    await getUWIssuesHeading().click({
      timeout: TIMEOUT_8_SECONDS
    });

    await wait(2000);
  }
}

export async function proceedToIssuanceFromPolicyReviewPage(
  page: Page,
  testInfo: TestInfo,
  ruleMatrix: any,
  blockingContext: string,
  testCaseId: any
): Promise<ValidationResult> {
  let validationResult: ValidationResult = createApprovalResult("Quote Page Validation");

  try {
      validationResult = await validateAndHandleClearButton(      testCaseId,      blockingContext,      ruleMatrix,      page,      testInfo    );
      let stopResult = await stopIfValidationFailed(validationResult);
      if (stopResult) return stopResult;

    if (!(await isElementVisible(getQuotePageScreenHeading()))) {
      console.log("Failed Navigating to Quote page, Failing the test");
      throw new Error('Navigation Failed to Quote Page');
    }
    await navigateToQuotePageAndCapture(page, testInfo);
    await navigateToDiscountsAppliedAndCapture(page, testInfo);
    await proceedToIssuance(page);
    
    validationResult = await handlingUWFromPolicyReview(testCaseId, blockingContext, ruleMatrix, page, testInfo);
    stopResult = await stopIfValidationFailed(validationResult);
    if (stopResult) return stopResult;
    if(await isElementVisible(getSaveAndNextButton()) && await isElementVisible(getQuotePageScreenHeading())){
      await clickSaveAndNextFromQuotePage();
    }

    await navigateToFormsAndCapture(page, testInfo);
    await clickBindOptionsAndProceedToIssuance(page);
    await clickSaveAndNextFromFormsPage(page);

    validationResult = await validateAndHandleClearButton(testCaseId, blockingContext, ruleMatrix, page, testInfo);
    stopResult = await stopIfValidationFailed(validationResult);
    if (stopResult) return stopResult;

    await navigateToRiskAnalysisUWIssues(page);
    await clickQuote(page); //To Trigger All UWs.
    await processUWWorkflow(testCaseId,ruleMatrix,page,testInfo,blockingContext);
    await navigateToRiskAnalysisUWIssues(page);

    console.log("Performing final validation after UW handling");
    
    validationResult = await validateRulesForTestCase(testCaseId, blockingContext, ruleMatrix, page, testInfo);

    await ifCLuePopUpAppears_ClickReturnToRiskAnalysis(page, testInfo);

    console.log("Risk Analysis Validation Result:", validationResult);

    return validationResult;
  } catch (error) {
    console.error("Proceed To Issuance failed:", error);
    throw error;
  }
}

export async function ifRiskApprovalsVIsible_ClickReturnToApprovals(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getReturnToRiskApprovals())) {
    console.log("Risk Approvals required - Return to Approvals link is visible.");
  }
}
export async function ifCLuePopUpAppears_ClickReturnToRiskAnalysis(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getClueResultsPopUp())) {
    console.log("CLUE Results PopUp appeared.");
    await captureAndAttachforCore(page, testInfo, "CLUEResultsPopUp",{fullPage:true});
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    await getReturnToRiskAnalysisButton().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(TIMEOUT_4_SECONDS);
    await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(3000);
    if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
      await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    }
    if (await isElementVisible(getBindOptionsDropDown())) {
      await getBindOptionsDropDown().click();
      await wait(1000);

      await getProceedToIssuanceOption().click();
      await wait(TIMEOUT_4_SECONDS);
    }
    if(await isElementVisible(getReturnToRiskAnalysisButton())){
      await wait(2000);
      await getReturnToRiskAnalysisButton().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(TIMEOUT_4_SECONDS);
      if(await isElementVisible(getResolveButton())){
        await getResolveButton().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(2000);

      await getUWIssuesHeading().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(2000);
      }
    }
  }
}

export async function UWIWording_Validation(ruleMatrix: any, page: Page, testInfo: TestInfo): Promise<boolean> {
  // ✅ STEP 1: Always check UI first - get UW messages from UI
  const descriptions = await getIssueDescriptions();
  const hasUIMessages = descriptions.length > 0;

  console.log("UWI Descriptions from UI:", descriptions);
  console.log(`UI has UW messages: ${hasUIMessages}`);

  if (hasUIMessages) {
    await captureAndAttachforCore(page, testInfo, 'Risk Analysis Before Approval',{ fullPage: true });
  }

  // ✅ STEP 2: Check Excel wording
  const rawUWIWording = ruleMatrix["UW_wording"];
  const hasExcelWording = rawUWIWording && rawUWIWording.trim() !== "";

  console.log(`Wording from RuleMatrix Excel: "${rawUWIWording || ''}"`);
  console.log(`Excel has UW wording: ${hasExcelWording}`);

  // ✅ STEP 3: Apply business logic based on UI and Excel states

  // Case 1: Excel has wording AND UI has messages - Compare and validate
  if (hasExcelWording && hasUIMessages) {
    console.log("📋 Case 1: Excel has wording AND UI has messages - Comparing...");

    let UWIWordingFromExcel = rawUWIWording
      .replace("Dwelling #X:", "Dwelling #1:")
      .replace(/\r?\n|\r/g, "")
      .trim();

    function stripAnsi(str: string): string {
      return str.replace(/\x1B\[[0-9;]*m/g, "");
    }

    const matchFound = descriptions.some(desc =>
      stripAnsi(desc).includes(UWIWordingFromExcel)
    );

    if (matchFound) {
      console.log("✅ Excel UW wording matches with the UI UW message - Approving");

      if (await isElementVisible(getFirstApproval().first())) {
        const count = await getFirstApproval().count();
        console.log("Approval count: ", count);

        for (let i = 0; i < count; i++) {
          await getFirstApproval().nth(i).click({ force: true });
        }
        return true;
      }
    } else {
      console.log("❌ Excel UW wording does NOT match UI message - Failing test");
      console.log(`🔍 Expected from Excel: "${UWIWordingFromExcel}"`);
      console.log(`🔍 Actual from UI: ${JSON.stringify(descriptions)}`);
      return false;
    }
  }

  // Case 2: Excel is empty AND UI has NO messages - Skip validation, proceed
  else if (!hasExcelWording && !hasUIMessages) {
    console.log("✅ Case 2: Excel empty AND UI has no messages - Skipping UW validation, proceeding");
    return true;
  }

  // Case 3: Excel is empty BUT UI has messages - FAIL the test
  else if (!hasExcelWording && hasUIMessages) {
    console.log("❌ Case 3: Excel is empty BUT UI has UW messages - FAILING test");
    console.log("🔍 Expected: No UW messages (Excel is empty)");
    console.log(`🔍 Actual: Found ${descriptions.length} UW message(s) in UI:`);
    descriptions.forEach((desc, index) => {
      console.log(`   ${index + 1}. "${desc}"`);
    });
    console.log("💡 Fix: Either add expected UW wording to Excel or resolve UI UW issues");
    return false;
  }

  // ✅ FIXED Case 4: Excel has wording BUT UI has NO messages - FAIL the test
  else if (hasExcelWording && !hasUIMessages) {
    console.log("❌ Case 4: Excel has wording BUT UI has no messages - FAILING test");
    console.log("🔍 Expected: UW messages should appear in UI (Excel has wording)");
    console.log(`🔍 Expected UW wording: "${rawUWIWording}"`);
    console.log("🔍 Actual: No UW messages found in UI");
    console.log("💡 Fix: Either remove UW wording from Excel or check why expected UW issues didn't trigger");
    return false;
  }

  return false;
}

export async function validateUWinRiskAnalysisPage(page: Page, testInfo: TestInfo, ruleMatrix: any): Promise<boolean> {
  console.log("🔍 Starting UW validation in Risk Analysis page...");

  // ✅ SIMPLIFIED: Always call UWI validation - it handles all logic internally
  const validationPassed = await UWIWording_Validation(ruleMatrix, page, testInfo);

  if (!validationPassed) {
    console.log("❌ UWI wording validation failed - Stopping test");
    return false;
  }

  console.log("✅ UWI validation passed - Proceeding with remaining approvals");

  // Handle any already approved checkboxes
  if (await isElementVisible(getAlreadyApprovedCheckBox())) {
    const alreadyApprovedCount = await getAlreadyApprovedCheckBox().count();
    console.log("Already Approved Count:", alreadyApprovedCount);
    for (let i = 0; i < alreadyApprovedCount; i++) {
      await getAlreadyApprovedCheckBox().nth(i).click({ force: true });
    }
  }

  // Only click Approve if there were actual UW issues to approve
  console.log("🔘 Clicking Approve button for UW issues");
  await wait(2000);
  await click(getApproveBtn(), { force: true });
  await wait(2000);
  await click(getApproveOkBtn(), { force: true });
  await wait(2000);


  console.log("✅ UW validation and approval process completed successfully");
  return true;
}

export async function getIssueDescriptions(): Promise<string[]> {
  const count = await getUWIDescription().count();
  const descriptions: string[] = [];
  for (let i = 0; i < count; i++) {
    descriptions.push((await getUWIDescription().nth(i).textContent()) ?? "");
  }
  return descriptions.map((desc) => desc.trim());
}

export async function assertUWIssue(UW_Issue_wording: string) {
  try {
    const expectedDescriptions = UW_Issue_wording
      ? UW_Issue_wording.split(",").map((desc) => desc.trim())
      : [];

    const actualDescriptions = await getIssueDescriptions();
    const reslut = arraysHaveSameContent(
      expectedDescriptions,
      actualDescriptions
    );
    expect.soft(reslut).toBeTruthy;
  } catch (error: any) {
    console.log(
      `UWassert- ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function arraysHaveSameContent<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;

  const countMap = new Map<T, number>();

  for (const item of a) {
    countMap.set(item, (countMap.get(item) || 0) + 1);
  }

  for (const item of b) {
    if (!countMap.has(item)) return false;
    countMap.set(item, countMap.get(item)! - 1);
    if (countMap.get(item)! < 0) return false;
  }

  return true;
}
export async function clearriskbutton() {
      if(await isElementVisible(clearrisk())){
    await clearrisk().click()

    }
  }

///////////----------------------New functions--------------------------//////////////////
export async function clickonBindOptionsProceedToIssuance(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getRiskAnalysisText())) {
    console.log("We are still in Risk Analysis, clicking Quote.");

    for (let attempt = 1; attempt <= 4; attempt++) {
      if (!(await isElementVisible(getQuoteButton()))) {
        break;
      }
      console.log(`Clicking Quote from Risk Analysis (Attempt ${attempt})`);
      await getQuoteButton().click();
      await waitForPageReady(page);

      await clearIfVisible(page);

      if (await isElementVisible(getQuotePageText()) || await isElementVisible(getQuotePageScreenHeading())) {
        console.log("Successfully navigated to Quote page.");
        break;
      }
    }
  }

  await clearIfVisible(page);
 await waitForPageReady(page);

  console.log("Attempting to click on Bind Options and Proceed to Issuance if Bind Options dropdown is visible");
  await waitForPageReady(page);
  if (await isElementVisible(getBindOptionsDropDown())) {
      console.log("Bind Options dropdown is visible, proceeding to click and select Proceed to Issuance from clickonBindOptionsProceedToIssuance function");
      await getBindOptionsDropDown().click();
      await waitForPageReady(page);
      if(await isElementVisible(getProceedToIssuanceOption())){
      console.log("Clicked on Bind Options dropdown and proceeding to click on Proceed to Issuance");
      await getProceedToIssuanceOption().click();
      }
    } else{
      if(!(await isElementVisible(getQuotePageScreenHeading())) && !(await isElementVisible(getReturnToPaymentsText()))){
        console.log("Failed to Navigate To Quote Page From RiskAnalysis");
        throw new Error("Navigation Failed From Risk Analysis to Quote Page");
      }else{
        console.log("We might got Return to payments checklist.");
      }
    }
  }

export async function handleValidationAndClear(
  testCaseId: string,
  blockingContext: string,
  ruleMatrix: Record<string, Record<string, any>>,
  page: Page,
  testInfo: TestInfo
): Promise<ValidationResult> {

  if (!(await isElementVisible(getClearButton())) && !(await isElementVisible(getErrorIconCore()))) {
    return createApprovalResult("No issues found.");
  }
  console.log("⚠ Clear button detected. Validating before proceeding...");
  const validationResult = await validateRulesForTestCase(
    testCaseId,
    blockingContext,
    ruleMatrix,
    page,
    testInfo
  );

  console.log("Validation Result:", JSON.stringify(validationResult, null, 2));

  if (validationResult.status === "FAIL") {

    console.error(`❌ Unexpected validation encountered: ${validationResult.message}`);

    // await captureFullPage2D(
    //   page,
    //   testInfo,
    //   "Unexpected Validation Before Clear"
    // );
    console.log(`Validation Failure: ${validationResult.message}`);
    throw new Error("Unexpected Validation Error");
  }
  console.log("✅ Validation passed. Clicking Clear and continuing.");

  await clearIfVisible(page);

  return validationResult;
}
async function proceedToIssuance(page: Page) {
  if (await isElementVisible(getBindOptionsDropDown())) {
    console.log("Opening Bind Options");

    await getBindOptionsDropDown().click();
    await waitForPageReady(page);

    await getProceedToIssuanceOption().click();

    console.log("Clicked Proceed to Issuance");
    await waitForPageReady(page);
  }
}
async function returnToRiskAnalysis() {
  let attempts = 4;

  while (attempts-- > 0) {
    if (await isElementVisible(getReturnToRiskAnalysisButton())) {

      console.log("Return to Risk Analysis button visible");

      await getReturnToRiskAnalysisButton().click({
        timeout: TIMEOUT_8_SECONDS
      });

      await wait(TIMEOUT_8_SECONDS);
    }
  }
}
async function resolveUWIssues(page: Page) {
  await page.waitForLoadState("load", {
    timeout: MAX_TIMEOUT
  });

  if (await isElementVisible(getResolveButton())) {

    console.log("Resolve button visible");

    await getResolveButton().click({
      timeout: TIMEOUT_8_SECONDS
    });

    await wait(2000);
  }
}
async function openUWIssues(page: Page) {

  await waitForPageReady(page);

  if (await isElementVisible(getUWIssuesHeading())) {

    console.log("Opening UW Issues");
    await getUWIssuesHeading().click();

    await waitForPageReady(page);
  }
}
async function navigateToRiskAnalysis(page: Page) {

  await page.waitForLoadState("load", {
    timeout: MAX_TIMEOUT
  });

  await getRiskAnalysisTab().click({
    timeout: TIMEOUT_8_SECONDS
  });

  await wait(2000);
}
async function clickQuote(page: Page) {

  await waitForPageReady(page);

  if (await isElementVisible(getQuoteButtonInCoreRiskAnalysis())) {

    console.log("Clicking Quote button");
    await getQuoteButtonInCoreRiskAnalysis().click();

    await waitForPageReady(page);
  }
}
async function processUWWorkflow(testCaseId:any,ruleMatrix:any,page: Page,testInfo:TestInfo,blockingContext:any) {

  const validationResult = await handleValidationAndClear(testCaseId,blockingContext,ruleMatrix,page,testInfo);
  let stopResult = await stopIfValidationFailed(validationResult);
  if (stopResult) return stopResult; 

  await proceedToIssuance(page);

  await navigateToRiskAnalysisUWIssues(page);
  await waitForPageReady(page);
}
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('load');
  const mask = page.locator(".x-mask-fixed");
  if(await mask.count()){
    await page.locator('.x-mask-fixed').waitFor({state: 'hidden',timeout: 10000}).catch(() => { });
  }
  await wait(1000);
}
export async function clearIfVisible(page: Page): Promise<boolean> {
  if (await isElementVisible(getClearButton())) {
    console.log("Clear button is visible, clicking on it");

    await getClearButton().click({timeout: TIMEOUT_8_SECONDS});
    await waitForPageReady(page);

    return true;
  }
  return false;
}
async function stopIfValidationFailed(validationResult?: ValidationResult): Promise<ValidationResult | null> {
  if (!validationResult?.shouldStop) return null;
  console.error("Validation indicates execution should stop. Stopping further processing.");
  return validationResult;
}
function createApprovalResult(message: string): ValidationResult {
  return {
    success: true,
    errorType: "none",
    message,
    shouldStop: false,
    status: "PASS"
  };
}
export async function clickonBindOptionsinQuote(testCaseId: any,ruleMatrix: any,page: Page,testInfo: TestInfo,riskAnalysisData: any,blockingContext: any) :Promise<ValidationResult> {

  await waitForPageReady(page);

  // First attempt
  let validationResult = await processUWWorkflow(testCaseId,ruleMatrix,page,testInfo,blockingContext);
  let stopResult = await stopIfValidationFailed(validationResult);
  if (stopResult) return stopResult; 

  await addingpriorlosses(page,testInfo,riskAnalysisData);
  await addingViolations(page,testInfo,riskAnalysisData);

  await clickQuote(page);

  // Second attempt
  validationResult = await processUWWorkflow(testCaseId, ruleMatrix, page, testInfo, blockingContext);
  stopResult = await stopIfValidationFailed(validationResult);
  if (stopResult) return stopResult; 

  validationResult = await handleValidationAndClear(testCaseId,blockingContext,ruleMatrix,page,testInfo);
  stopResult = await stopIfValidationFailed(validationResult);
  if (stopResult) return stopResult; 

  // await navigateToRiskAnalysisUWIssues(page);
  if (await isElementVisible(getUWIssuesHeading())) { //this is necessary incase of no uw .
    console.log("Opening UW Issues tab");

    await getUWIssuesHeading().click();
    await waitForPageReady(page);
  }
  await waitForPageReady(page);

  if (await isElementVisible(getFirstApproval().first())) {
    return createApprovalResult("Approval found.");
  }
  console.log("Retrying UW Issues"); // if we get return to payment And signature .
  if(await isElementVisible(getReturnToPaymentsText())){
    await getRiskAnalysisTab().click();
  }
  await navigateToRiskAnalysisUWIssues(page);

  await waitForPageReady(page);

  if (await isElementVisible(getFirstApproval().first())) {
    return createApprovalResult("Approval found.");
  }

  await captureFullPage2D(page,testInfo,"UW Issues Tab In Risk Analysis","#centerPanel"); 
  
  return createApprovalResult("Approval not found after processing UW Issues.");

}

