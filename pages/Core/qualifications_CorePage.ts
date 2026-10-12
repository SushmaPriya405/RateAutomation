import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../utils/locator-utils";
import {
  click,
  fill,
  gotoURL,
  scrollLocatorIntoView,
  selectByText,
  selectByValue,
  wait,
} from "../../utils/action-utils";
import { captureAndAttachforCore, captureFullPage2D } from "../../utils/report-utils";
import { getFullStateName, formatToMMDDYYYY } from "../../testdata/testData";
import { AMSuite_GPAURL } from "../../utils/url-constansts";
import { getPage } from "../../utils/page-utils";
import {
  BIG_TIMEOUT,
  MAX_TIMEOUT, 
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { getText, isElementVisible } from "../../utils/element-utils";
import { get } from "http";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../utils/wordingValidation";
import { selectYesNoRadioCore, selectCheckboxCore, safeQuestionPresent, selectRadioCore } from "../../utils/question-helper";
import { createQuestionFetcher } from "../../utils/questionTextMapper";

import { validateRulesForTestCase, ValidationResult } from "../../utils/coreRuleBasedValidation";


const getActionsButton = () => getLocator('//a[@id="AccountFile:AccountFileMenuActions"]');
const getNewSubmissionButton = () => getLocator("//span[contains(@id, 'Create:AccountFileMenuActions_NewSubmission-textEl')]");
const getEffectiveDate = () => getLocator('//input[contains(@id,"NewSubmissionScreen:ProductSettingsDV:DefaultPPEffDate-inputEl")]');
const getResidentialSelectOption = () => getLocator('//div[text()= "Residential"]/parent::td/preceding-sibling::td//a[contains(@id, "ProductOffersDV:ProductSelectionLV:1:addSubmission")]');
const getRecreationSelectOption = () => getLocator('//div[text()= "Recreational"]/parent::td/preceding-sibling::td//a[contains(@id, "ProductOffersDV:ProductSelectionLV:0:addSubmission")]');
const getPolicyTypeSearchButton = () => getLocator('//div[contains(@id, "PreQualificationScreen:HOPolicyType:SelectHOPolicyType")]');
const getpolicyTypeSearchButton = () => getLocator('//div[contains(@id, "SubmissionWizard:SubmissionWizard_PreQualificationScreen:PAPolicyType:SelectPAPolicyType")]');
const getHOSelectButton = () => getLocator('//div[text()= "Homeowners"]/parent::td/preceding-sibling::td//a[contains(@id, "Select")]');
const getDBSelectButton = () => getLocator('//div[text()= "Dwelling Basic"]/parent::td/preceding-sibling::td//a[contains(@id, "Select")]');
const getDSselectButton = () => getLocator('//div[text()= "Dwelling Special"]/parent::td/preceding-sibling::td//a[contains(@id, "Select")]');
const getMHSelectButton = () => getLocator('//div[text()= "Manufactured Home"]/parent::td/preceding-sibling::td//a[contains(@id, "_Select")]');
const getCVSelectButton = () => getLocator('//div[text()= "Collector Vehicle"]/parent::td/preceding-sibling::td//a[contains(@id, "PolicyTypePickerPopup:0:_Select")]');
const getDBQuestionsCheckBox1_MHCore = () => getLocator('//div[contains(text(), "credit report")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox2_MHCore = () => getLocator('//div[contains(text(), "we may review your claims history")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox3_MHCore = () => getLocator('//div[contains(text(), "Disclaimer has been read and applicant did not object.")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox1 = () => getLocator('//div[contains(text(), "credit report")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")] | //div[contains(text(), "credit history")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox2 = () => getLocator('//div[contains(text(), "we may review your claims history")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox3 = () => getLocator('//div[contains(text(), "Disclaimer has been read and applicant did not object.")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox = () => getLocator('//img[@class="x-grid-checkcolumn"]');
const getNoOptionForDBQuestion1 = () => getLocator("(//input[@inputvalue='false'])[1]");
const getNoOptionForDBQuestion2 = () => getLocator('(//input[@inputvalue="false"])[2]');
const getQualificationSaveandNextOption = () => getLocator("//span[contains(@id, 'PreQualificationScreen') and contains(text(), 'Qualification')]/ancestor::*//span[@id='SubmissionWizard:Next-btnInnerEl']");
const getSubmissionNumberText = () => getLocator('//span[@id="SubmissionWizard:0_header_hd-textEl"]');
const getDBQuestionesCheckedCount = () => getLocator('//img[@class="x-grid-checkcolumn x-grid-checkcolumn-checked"]');
const getMSSelectButton = () => getLocator('//div[text()= "Motorsports"]/parent::td/preceding-sibling::td//a[contains(@id, "PolicyTypePickerPopup:1:_Select")]');

async function selectPolicyType(page: Page, testInfo: TestInfo, Qualifications: any) {
    await getPolicyTypeSearchButton().click({timeout: TIMEOUT_8_SECONDS});
    await wait(8000);
    if (Qualifications === "Homeowners") {
      await getHOSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    } else if (Qualifications === "Dwelling Basic") {
      await getDBSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    } else if (Qualifications === "Dwelling Special") {
      await getDSselectButton().click({timeout: TIMEOUT_8_SECONDS});
    } else if (Qualifications === "Manufactured Home") {
      await getMHSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    }
    else if (Qualifications === "Collector Vehicle") {
      await getCVSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    } 
    else if (Qualifications === "Motorsports") {
      await getMSSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    } 
    

}

async function selectRecreationalPolicyType(page: Page, testInfo: TestInfo, Qualifications: any) {
    await getpolicyTypeSearchButton().click({timeout: TIMEOUT_8_SECONDS});
    await wait(4000);
    if (Qualifications === "Collector Vehicle") {
      await getCVSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    } 
    else if (Qualifications === "Motorsports") {
      await getMSSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    } 
    
}
export async function createSubmissionQuote(page: Page, testInfo: TestInfo, Qualifications: any) {
  await getActionsButton().click({timeout: TIMEOUT_8_SECONDS});
  await getNewSubmissionButton().click({timeout: TIMEOUT_8_SECONDS});
  await wait(8000);
  await fill(getEffectiveDate(), formatToMMDDYYYY(Qualifications["EffectiveDate"]));
  if (Qualifications["Product"] === "Residential") {
    await getResidentialSelectOption().click({timeout: TIMEOUT_8_SECONDS});
    await wait(2000);
    await selectPolicyType(page, testInfo, Qualifications["ProductType"]);
    await wait(2000);
  } else if (Qualifications["Product"] === "Recreational") {
    await getRecreationSelectOption().click({timeout: TIMEOUT_8_SECONDS});
    await wait(2000);
    await selectRecreationalPolicyType(page, testInfo, Qualifications["ProductType"]);
  }   
}

  export async function answerDBQualificationQuestions_MHCore(page: Page, testInfo: TestInfo, qualification:any , ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any): Promise<ValidationResult> {
  // Map each checkbox to its Excel key and locator
  try{
// First three: checkboxes (robust, generic, partial text match)

    await wait(4000);
    await selectCheckboxCore(page, 'CreditReport', qualification['CreditReport']);
     await selectCheckboxCore(page, 'LossHistoryReport', qualification['LossHistoryReport']);
    await selectCheckboxCore(page, 'DisclaimerVerification', qualification['DisclaimerVerification']);
    // await selectCheckboxCore(page, 'LossHistoryReport', qualification['LossHistoryReport']);
    
    // Wait for UI to update after last checkbox (radios may appear dynamically)
    await page.waitForLoadState("load", { timeout: 1000 });
    await wait(4000); 

    console.log("Questions checkboxes answered, proceeding to radios...");

      await selectYesNoRadioCore(page, 'FeeDisclosure', qualification['FeeDisclosure']);
      await selectYesNoRadioCore(page, 'Foreclosure', qualification['Foreclosure']);
      await selectYesNoRadioCore(page, 'ArsonFraud', qualification['ArsonFraud']);
   

    await captureFullPage2D(page, testInfo, `Qualification Questions Answered`,"#centerPanel");
    await getQualificationSaveandNextOption().click({ timeout: TIMEOUT_8_SECONDS });
   console.log("🔍 Performing rule-based validation for Policy Details...");
          const validationResult = await validateRulesForTestCase(
            testCaseId,
            blockingContext,
            ruleMatrix,
            page,
            testInfo
          );
          await wait(3000);
    if (await isElementVisible(getQualificationSaveandNextOption())) {
      await getQualificationSaveandNextOption().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
    console.log("Qualifications Details validation result:", validationResult);
          return validationResult;
}
  catch (error) {
    console.error("Operation failed:", error);
      throw error;

    }
}

export async function getSubmissionNumberGenerated(): Promise<string> {
  await isElementVisible(getSubmissionNumberText(), { timeout: STANDARD_TIMEOUT });
  let subNum = (await getSubmissionNumberText().innerText()).replace("Submission", "").replace("Draft", "").trim();
  console.log(`Submission number: ${subNum}`);
  return subNum;
}

// export async function answerDBQualificationQuestions_MHCore(page: Page, testInfo: TestInfo, qualification:any , ruleMatrix: any, blockingContext: string) {
//   // Map each checkbox to its Excel key and locator
//   const checkboxConfigs = [
//     { key: 'CreditReport', locator: getDBQuestionsCheckBox1_MHCore },
//     { key: 'LossHistoryReport', locator: getDBQuestionsCheckBox2_MHCore },
//     { key: 'DisclaimerVerification', locator: getDBQuestionsCheckBox3_MHCore }
//   ];

//   for (let i = 0; i < checkboxConfigs.length; i++) {
//     const { key, locator } = checkboxConfigs[i];
//     const value = qualification[key];
//     if (typeof value !== 'string' || value.trim().toLowerCase() !== 'yes') {
//       console.log(`Skipping checkbox ${i + 1} (${key}) as value is not 'Yes'.`);
//       continue;
//     }
//     const checkbox = locator();
//     let retries = 0;
//     const maxRetries = 5;
//     while (retries < maxRetries) {
//       const className = await checkbox.getAttribute('class');
//       if (className?.includes('x-grid-checkcolumn-checked')) {
//         console.log(`✅ Checkbox ${i + 1} (${key}) is already checked.`);
//         break;
//       }
//       console.log(`Attempt ${retries + 1}: Clicking checkbox ${i + 1} (${key})...`);
//       await checkbox.hover();
//       await checkbox.click({ force: true, timeout: 6000 });
//       await page.waitForTimeout(1000); // short wait before re-checking
//       retries++;
//     }
//     // Final verification
//     const finalClass = await checkbox.getAttribute('class');
//     if (finalClass?.includes('x-grid-checkcolumn-checked')) {
//       console.log(`✅ Checkbox ${i + 1} (${key}) checked successfully.`);
//     } else {
//       console.error(`❌ Failed to check Checkbox ${i + 1} (${key}) after ${maxRetries} attempts.`);
//     }
//   }

// const checkedBoxCount = await getDBQuestionesCheckedCount().count();
// console.log("Checked box count: ", checkedBoxCount);

// await wait(3000);
// // Only click 'No' radio buttons if Excel/test data value is 'No'
// if (typeof qualification['FeeDisclosure'] === 'string' && qualification['FeeDisclosure'].trim().toLowerCase() === 'no') {
//   await getNoOptionForDBQuestion1().click({ timeout: TIMEOUT_8_SECONDS });
//   await wait(2000);
// }
// if (typeof qualification['ArsonFraud'] === 'string' && qualification['ArsonFraud'].trim().toLowerCase() === 'no') {
//   await getNoOptionForDBQuestion2().click({ timeout: TIMEOUT_8_SECONDS });
//   await wait(2000);
// }
//     await captureAndAttachforCore(page, testInfo, 'DB Qualification Questions answered');
//     await getQualificationSaveandNextOption().click({ timeout: TIMEOUT_8_SECONDS });
//     await warningsWordingValidationCore(ruleMatrix, page, testInfo);
//       blockingContext = "Qualification";
//       const errorValidationPassed = await errorWordingValidationCore(ruleMatrix, page, testInfo, blockingContext);
//       if (!errorValidationPassed) {
//         console.log("❌ Error wording validation failed. Stopping test.");
//         return false;
//       }
    
//       if (await isElementVisible(getQualificationSaveandNextOption())) {
//         await getQualificationSaveandNextOption().click({ timeout: 4000 });
//         await wait(TIMEOUT_4_SECONDS);
//       }
    
//       await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
//       await wait(3000);
//       return true;
// }

