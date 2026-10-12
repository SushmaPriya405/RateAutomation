import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../../utils/locator-utils";
import {
  click,
  clear,
  fill,
  gotoURL,
  scrollLocatorIntoView,
  selectByText,
  selectByValue,
  wait,
} from "../../../utils/action-utils";
import { captureAndAttachforCore, captureFullPage2D } from "../../../utils/report-utils";
import { getFullStateName, formatToMMDDYYYY } from "../../../testdata/testData";
import { AMSuite_GPAURL } from "../../../utils/url-constansts";
import { getPage } from "../../../utils/page-utils";
import {
  BIG_TIMEOUT,
  MAX_TIMEOUT, 
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../../utils/timeout-constants";
import { getText, isElementVisible } from "../../../utils/element-utils";
import { get } from "http";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../../utils/wordingValidation";
import { validateRulesForTestCase, ValidationResult } from "../../../utils/ruleBasedValidation";
import { selectDropdownCore, selectYesNoRadioCore } from "../../../utils/question-helper";
import { getWarningMsgCore } from "./CV_RiskAnaysis_CorePage";

const getYesPaperLess = () => getLocator("//div[contains(text(), 'Does the applicant intend to enroll in paperless policy delivery?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoPaperLess = () => getLocator("//div[contains(text(), 'Does the applicant intend to enroll in paperless policy delivery?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesPayingInFull = () => getLocator("//div[contains(text(), 'Will the applicant be paying in full for this policy?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoPayingInFull = () => getLocator("//div[contains(text(), 'Will the applicant be paying in full for this policy?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesMultiPolicyDiscount = () => getLocator("//div[contains(text(), 'Eligible for multi-policy discount?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoMultiPolicyDiscount = () => getLocator("//div[contains(text(), 'Eligible for multi-policy discount?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesLossesAbove500 = () => getLocator("//div[contains(text(), 'Has the applicant had any losses above $500 in the past 3 years?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoLossesAbove500 = () => getLocator("//div[contains(text(), 'Has the applicant had any losses above $500 in the past 3 years?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesInsuranceDeclined = () => getLocator("//div[contains(text(), 'Has the applicant had similar insurance declined, cancelled, or non-renewed?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoInsuranceDeclined = () => getLocator("//div[contains(text(), 'Has the applicant had similar insurance declined, cancelled, or non-renewed?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getNumDwellOwnedClick = () => getLocator("//div[contains(text(), 'How many dwellings does the applicant own?')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getNumDwellOwnedFill = () => getLocator('//input[@name="c1" and @type="text"]');
const getAutoPolicySelectButton = () => getLocator("//div[contains(text(), 'Does the applicant currently have an automobile policy written through your agency?')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getAssociateNameField = () => getLocator("//div[contains(text(), 'Is the applicant a member of any of the following organizations?  If so, select one.')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getPolicyInfoSaveandNextOption = () => getLocator('//span[contains(@id, "PolicyInfoScreen") and contains(text(), "Policy Info")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getPreviousPolicyNumberField = () => getLocator("//input[contains(@id, 'PrimaryInsuredPrimaryPhoneGd-inputEl')]");
const getYesApplicantMoved = () => getLocator("//label[contains(text(), 'Has the applicant moved in the last 60 days?')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoApplicantMoved = () => getLocator("//label[contains(text(), 'Has the applicant moved in the last 60 days?')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesAllowedtoInsuranceScore = () => getLocator("//label[contains(text(), 'Allowed to Insurance Score')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoAllowedtoInsuranceScore = () => getLocator("//label[contains(text(), 'Allowed to Insurance Score')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getInsuranceScore = () => getLocator("//input[contains(@id, 'SubmissionWizard:LOBWizardStepGroup:SubmissionWizard_PolicyInfoScreen:SubmissionWizard_PolicyInfoDV:AccountInfoInputSet:InsuranceScore_Ext-inputEl')]");
const getApplicantPrimaryResidence = () => getLocator("//div[contains(text(), 'Applicant primary residence')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const get31dayswithanothercarrier = () => getLocator("//div[contains(text(), 'Has the applicant, on any of the vehicles being quoted, been insured in the past 31 days with another carrier?')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getOrderprefillReport = () => getLocator("//a[contains(text(),'Order Prefill Report')]");
const getYesActiveMilitaryDuty = () => getLocator("//div[contains(text(), 'Was this lapse the result of military deployment or active military duty?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoActiveMilitaryDuty = () => getLocator("//div[contains(text(), 'Was this lapse the result of military deployment or active military duty?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
// 

async function fillPreviousPolicyNumber() {
  await getPreviousPolicyNumberField().click({force: true});
  await getPreviousPolicyNumberField().fill("26Filings");
}

async function fillInsuranceScore(score:number) {
  await getInsuranceScore().click({force: true});
  await fill(getInsuranceScore(),score.toString());
}
async function selectPaperLessOption(value: any) {
    await getYesPaperLess().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await click(getYesPaperLess());
  } else {
    await click(getNoPaperLess());
  }
}
async function selectPayingInFullOption(value: any) {
    await getYesPayingInFull().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await click(getYesPayingInFull());
  } else {
    await click(getNoPayingInFull());
  } 
}
async function selectMultiPolicyDiscountOption(value: any) {
  if (value === "Yes") {
    await getYesMultiPolicyDiscount().scrollIntoViewIfNeeded();
    await click(getYesMultiPolicyDiscount());
  }
}
async function selectActiveMilitaryDuty(value: any) {
  if(await isElementVisible(getYesActiveMilitaryDuty())){
    await getYesActiveMilitaryDuty().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await click(getYesActiveMilitaryDuty());
  } else {
    await click(getNoActiveMilitaryDuty());
  } 
}
}

async function selectPrimaryResidence(page: Page, value: string) {

  const cell = getApplicantPrimaryResidence();
  await cell.scrollIntoViewIfNeeded();
  await cell.click(); 
  const optionLocator = page.locator(`//ul[contains(@class,'x-list-plain')]//li[contains(normalize-space(.), "${value}")]`);
  await optionLocator.waitFor({ state: 'visible' });
  await optionLocator.click();
}


async function selectlast31days(value: any) {
  console.log("Value is: ",value);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
      const maxAttempts = 8;
      const attemptDelay = 500; // ms
   
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          // Click to open the drop-down / refresh list
          await get31dayswithanothercarrier().click({ force: true }).catch(() => {});
   
          try {
              // Small wait for the option to appear
              await optionLocator.waitFor({ state: "visible", timeout: 1000 });
              // Option is present and visible, click it and return
              await click(optionLocator);
              console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
              return;
          } catch {
              // Not yet visible — wait and try again
              await wait(attemptDelay);
          }
      }
   
      throw new Error(`selectlast31days: option '${value}' not found after ${maxAttempts} attempts`);
}
export async function fillPolicyInfoCorePage(page: Page, testInfo: TestInfo,
  policyInfoData: any,
  ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any
): Promise<ValidationResult> {
  try {
    await wait(TIMEOUT_4_SECONDS);
    await fillPreviousPolicyNumber();
    await getOrderprefillReport().click({ force: true });
    await wait(3000);
    let insuranceScore = policyInfoData["Insurance_Score"];
    if (insuranceScore) {
      await fillInsuranceScore(insuranceScore);
    }
    await selectYesNoRadioCore(page, "MultiPolicyDiscount", policyInfoData["MultiPolicyDiscount"]);
    await selectYesNoRadioCore(page, "PaidInFullDiscount", policyInfoData["PaidInFullDiscount"]);
    await selectYesNoRadioCore(page, "PaperlessDiscount", policyInfoData["PaperlessDiscount"]);
    await selectDropdownCore(page, "PriorInsurance", policyInfoData["PriorInsurance"]);
    await selectDropdownCore(page, "ApplicantPrimaryResidence", policyInfoData["ApplicantPrimaryResidence"]);
    await selectYesNoRadioCore(page, "MilitaryLapse", policyInfoData["MilitaryLapse"]);
    // await captureAndAttachforCore(page, testInfo, "FillPolicyInfoCorePage");
    await captureFullPage2D(page, testInfo, "Policy Info Details", "#centerPanel");
    await getPolicyInfoSaveandNextOption().click({ timeout: TIMEOUT_8_SECONDS });
    
    // Perform rule-based validation
    console.log("🔍 Performing rule-based validation for Drivers...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );

    console.log("Policy Info validation result:", validationResult);
    if (await isElementVisible(getWarningMsgCore())) {
      await captureFullPage2D(page, testInfo, "Warning In Policy Info Page", "#centerPanel");
      await getPolicyInfoSaveandNextOption().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }

    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await wait(3000);
    return validationResult;

  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;
  }

}

      
    
    
    
    
    
    
    
    




      
    
    
    
    
    
    
    
    



