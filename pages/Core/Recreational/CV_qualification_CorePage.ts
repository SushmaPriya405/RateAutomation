import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../../utils/locator-utils";
import {
  click,
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
import { validateRulesForTestCase } from "../../../utils/ruleBasedValidation";
import { ValidationResult } from "../../../utils/coreRuleBasedValidation";
import { selectCheckboxCore, selectCheckboxCoreRec, selectYesNoRadioCore } from "../../../utils/question-helper";


const getActionsButton = () => getLocator('//a[@id="AccountFile:AccountFileMenuActions"]');
const getNewSubmissionButton = () => getLocator("//span[contains(@id, 'Create:AccountFileMenuActions_NewSubmission-textEl')]");
const getEffectiveDate = () => getLocator('//input[contains(@id,"NewSubmissionScreen:ProductSettingsDV:DefaultPPEffDate-inputEl")]');
const getResidentialSelectOption = () => getLocator('//div[text()= "Residential"]/parent::td/preceding-sibling::td//a[contains(@id, "ProductOffersDV:ProductSelectionLV:1:addSubmission")]');
const getRecreationSelectOption = () => getLocator('//div[text()= "Recreational"]/parent::td/preceding-sibling::td//a[contains(@id, "ProductOffersDV:ProductSelectionLV:0:addSubmission")]');
const getolicyTypeCVSearchButton = () => getLocator('//div[contains(@id, "SubmissionWizard:SubmissionWizard_PreQualificationScreen:PAPolicyType:SelectPAPolicyType")]');
const getHOSelectButton = () => getLocator('//div[text()= "Homeowners"]/parent::td/preceding-sibling::td//a[contains(@id, "RESPolicyTypePicker_ExtPopup:0:_Select")]');
const getDBSelectButton = () => getLocator('//div[text()= "Dwelling Basic"]/parent::td/preceding-sibling::td//a[contains(@id, "RESPolicyTypePicker_ExtPopup:3:_Select")]');
const getDSselectButton = () => getLocator('//div[text()= "Dwelling Special"]/parent::td/preceding-sibling::td//a[contains(@id, "RESPolicyTypePicker_ExtPopup:4:_Select")]');
const getMHSelectButton = () => getLocator('//div[text()= "Manufactured Home"]/parent::td/preceding-sibling::td//a[contains(@id, "RESPolicyTypePicker_ExtPopup:4:_Select")]');
const getCVSelectButton = () => getLocator('//div[text()= "Collector Vehicle"]/parent::td/preceding-sibling::td//a[contains(@id, "PolicyTypePickerPopup:0:_Select")]');
const getDBQuestionsCheckBox1_CVCore = () => getLocator('//div[contains(text(), "we may review your credit report")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox2_CVCore = () => getLocator('//div[contains(text(), "we may review your claims history or loss experience and may report future claims made by you to a claims history provider.")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox3_CVCore = () => getLocator('//div[contains(text(), "we may review your motor vehicle or driver history report.")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox4_CVCore = () => getLocator('//div[contains(text(), "Disclaimer has been read and applicant did not object.")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox1 = () => getLocator('//div[contains(text(), "//div[contains(text(), "We may use a third party in connection with the development of your insurance score")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox2 = () => getLocator('//div[contains(text(), "we may review your claims history")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox3 = () => getLocator('//div[contains(text(), "Disclaimer has been read and applicant did not object.")]/parent::td/parent::tr//td//div//img[contains(@class, "x-grid-checkcolumn")]');
const getDBQuestionsCheckBox = () => getLocator('//img[@class="x-grid-checkcolumn"]');
const getNoOptionForDBQuestion1 = () => getLocator("(//input[@inputvalue='false'])[1]");
const getNoOptionForDBQuestion2 = () => getLocator('(//input[@inputvalue="false"])[2]');
const getNoOptionForDBQuestion3 = () => getLocator('(//input[@inputvalue="false"])[3]');
const getNoOptionForDBQuestion4 = () => getLocator('(//input[@inputvalue="false"])[4]');
const getNoOptionForDBQuestion5 = () => getLocator('(//input[@inputvalue="false"])[5]');
const getNoOptionForDBQuestion6 = () => getLocator('(//input[@inputvalue="false"])[6]');
const getNoOptionForDBQuestion7 = () => getLocator('(//input[@inputvalue="false"])[7]');
const getNoOptionForDBQuestion8 = () => getLocator('(//input[@inputvalue="false"])[8]');
const getNoOptionForDBQuestion9 = () => getLocator('(//input[@inputvalue="false"])[9]');
const getQualificationSaveandNextOption = () => getLocator("//span[contains(@id, 'PreQualificationScreen') and contains(text(), 'Qualification')]/ancestor::*//span[@id='SubmissionWizard:Next-btnInnerEl']");
const getSubmissionNumberText = () => getLocator('//span[@id="SubmissionWizard:0_header_hd-textEl"]');
const getDBQuestionesCheckedCount = () => getLocator('//img[@class="x-grid-checkcolumn x-grid-checkcolumn-checked"]');
const getDefaultEffectiveDate = () => getLocator("//label[contains(text(),'Default Effective Date')]");

async function selectRecreationalPolicyType(page: Page, testInfo: TestInfo, Qualifications: any) {
    await getolicyTypeCVSearchButton().click({timeout: TIMEOUT_8_SECONDS});
    await wait(4000);
    if (Qualifications === "Collector Vehicle") {
      await getCVSelectButton().click({timeout: TIMEOUT_8_SECONDS});
    }
    
}
export async function createSubmissionQuote(page: Page, testInfo: TestInfo, Qualifications: any,
  
) {
  await getActionsButton().click({timeout: TIMEOUT_8_SECONDS});
  await getNewSubmissionButton().click({timeout: TIMEOUT_8_SECONDS});
  await wait(4000);
  await getEffectiveDate().click();
  await wait(5000);
  await fill(getEffectiveDate(), formatToMMDDYYYY(Qualifications["EffectiveDate"]));
  await wait(2000);
  await getDefaultEffectiveDate().click();
  if (Qualifications["Product"] === "Residential") {
    await getResidentialSelectOption().click({timeout: TIMEOUT_8_SECONDS});
  } else if (Qualifications["Product"] === "Recreational") {
    await getRecreationSelectOption().click({timeout: TIMEOUT_8_SECONDS});
  }
    await wait(4000);
    await selectRecreationalPolicyType(page, testInfo, Qualifications["ProductType"]);
    await wait(4000);
    
}

export async function getSubmissionNumberGenerated(): Promise<string> {
  await isElementVisible(getSubmissionNumberText(), { timeout: STANDARD_TIMEOUT });
  let subNum = (await getSubmissionNumberText().innerText()).replace("Submission", "").replace("Draft", "").trim();
  console.log(`Submission number: ${subNum}`);
  return subNum;
}

export async function answerDBQualificationQuestions_CVCore(
  page: Page, 
  testInfo: TestInfo, 
  qualification: any,
  ruleMatrix: Record<string, Record<string, any>>,
    blockingContext: string,
    testCaseId: any,): Promise<ValidationResult> {
try{
    await selectCheckboxCoreRec(page, 'CreditReport', qualification['CreditReport'] || "Yes");
    await selectCheckboxCoreRec(page, 'LossHistoryReport', qualification['LossHistoryReport'] || "Yes");
    await selectCheckboxCoreRec(page, 'MotorVehicleReport', qualification['MotorVehicleReport'] || "Yes");
    await selectCheckboxCoreRec(page, 'DisclaimerVerification', qualification['DisclaimerVerification'] || "Yes");

    // Wait for UI to update after last checkbox (radios may appear dynamically)
    await page.waitForLoadState("load", { timeout: 6000 });

    console.log("Questions checkboxes answered, proceeding to radios...");

    await wait(4000);
    await selectYesNoRadioCore(page, 'Pre_FeeDisclosure', qualification['Pre_FeeDisclosure']);
    await selectYesNoRadioCore(page, 'FeeDisclosure', qualification['FeeDisclosure']);
    await selectYesNoRadioCore(page, 'SR22', qualification['SR22']);
    await selectYesNoRadioCore(page, 'FR44', qualification['FR44']);
    await selectYesNoRadioCore(page, 'VehicleForSaleConsignment', qualification['VehicleForSaleConsignment']);
    await selectYesNoRadioCore(page, 'VehicleDailyUse', qualification['VehicleDailyUse']);
    await selectYesNoRadioCore(page, 'VerifyAgeDailyUseAuto', qualification['VerifyAgeDailyUseAuto']);
    await selectYesNoRadioCore(page, 'LicenseSuspendedRevoked', qualification['LicenseSuspendedRevoked']);
    await selectYesNoRadioCore(page, 'VerifyTitledOwner', qualification['VerifyTitledOwner']);
    await selectYesNoRadioCore(page, 'UnrepairedDamage', qualification['UnrepairedDamage']);
    if(qualification['UnrepairedDamage'] === "Yes"){
      await selectYesNoRadioCore(page, 'UnrepairedDamageUnderRestoration', qualification['UnrepairedDamageUnderRestoration']);
    }
    await selectYesNoRadioCore(page, 'FelonyConviction', qualification['FelonyConviction']);
    await selectYesNoRadioCore(page, 'VehicleForRent', qualification['VehicleForRent']);
    await selectYesNoRadioCore(page, 'UnitAgeGreaterThan25Years', qualification['UnitAgeGreaterThan25Years']);
    await selectYesNoRadioCore(page, 'PrimaryUseRacing', qualification['PrimaryUseRacing']);


    await getQualificationSaveandNextOption().scrollIntoViewIfNeeded();
    await captureFullPage2D(page, testInfo, 'Qualification Questions Answered', "#centerPanel");
    await getQualificationSaveandNextOption().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(3000);

    await wait(3000);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
     console.log("🔍 Performing rule-based validation for Qualification page...");
            const validationResult = await validateRulesForTestCase(
              testCaseId, 
              blockingContext,
              ruleMatrix,
              page,
              testInfo
            );
            
            console.log("Qualification page validation result:", validationResult);
            await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
            if (await isElementVisible(getQualificationSaveandNextOption())) {
              await captureFullPage2D(page, testInfo, "Warning In Qualification Page", "#centerPanel");
              await getQualificationSaveandNextOption().click({ timeout: 4000 });
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