import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../utils/locator-utils";
import {
  click,
  clear,
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
  NAVIGATION_TIMEOUT,
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { getText, isElementVisible } from "../../utils/element-utils";
import { get } from "http";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../utils/wordingValidation";
import { selectYesNoRadioCore, selectDropdownCore } from "../../utils/question-helper";
import { validateRulesForTestCase, ValidationResult } from "../../utils/coreRuleBasedValidation";
import { selectDropdownWithRetry } from "./HO_Coverages_CorePage";

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
const getDescribeOtherDeclinedCancelledCell = () => getLocator('//td[contains(@class,"x-grid-cell")]//div[contains(text(), "Describe Other")]/ancestor::tr/td[contains(@class,"g-cell-edit")]');
const getNumDwellOwnedClick = () => getLocator("//div[contains(text(), 'How many dwellings does the applicant own?')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getNumDwellOwnedFill = () => getLocator('//input[@name="c1" and @type="text"]');
const getAutoPolicySelectButton = () => getLocator("//div[contains(text(), 'Does the applicant currently have an automobile policy written through your agency?')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getAssociateNameField = () => getLocator("//div[contains(text(), 'Is the applicant a member of any of the following organizations?  If so, select one.')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getPolicyInfoSaveandNextOption = () => getLocator('//span[contains(@id, "PolicyInfoScreen") and contains(text(), "Policy Info")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getPreviousPolicyNumberField = () => getLocator("//input[contains(@id, 'PrimaryInsuredPrimaryPhoneGd-inputEl')]");
const getInsuranceScoreField = () => getLocator("//input[contains(@id,'InsuranceScore_Ext-inputEl')]");
const getDescribeOtherDeclinedCancelledField = () => getLocator('//td[contains(@class,"x-grid-cell")]//div[contains(text(), "Describe Other")]/ancestor::tr/td[contains(@class,"g-cell-edit")]');
const getAdd = () => getLocator("//span[text()='Add']");
const FirstName = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:FirstName-inputEl']");
const LastName = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:LastName-inputEl']");
const MiddleName = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:MiddleName-inputEl']");
const getDateOfBirth = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:DateOfBirth-inputEl']");
const getMaritialStatus = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:MaritalStatus-inputEl']");
const getPrimaryPhone = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:PrimaryPhone-inputEl']");
const getRelationshipToPrimaryInsured = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:RelationshiptoPrimaryInsured-inputEl']");
const getAddress1 = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PrimaryAddressInputSet:AddressInputSet:globalAddressContainer:GlobalAddressInputSet:AddressLine1-inputEl']");
const getAddress2 = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PrimaryAddressInputSet:AddressInputSet:globalAddressContainer:GlobalAddressInputSet:AddressLine2-inputEl']");
const getCity = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PrimaryAddressInputSet:AddressInputSet:globalAddressContainer:GlobalAddressInputSet:CityNoAutoFill-inputEl']");
const getState = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PrimaryAddressInputSet:AddressInputSet:globalAddressContainer:GlobalAddressInputSet:State-inputEl']");
const getZipcode = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PrimaryAddressInputSet:AddressInputSet:globalAddressContainer:GlobalAddressInputSet:PostalCode-inputEl']");
const getAddressType = () => getLocator("//input[@id = 'NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:AddressType-inputEl']");
const getHomePhone = () => getLocator("//input[@id='NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:HomePhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl']");
const getName = () => getLocator("//input[@id='NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:GlobalContactNameInputSet:Name-inputEl']");
const getCompanyType = () => getLocator("//input[@id='NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:companyType-inputEl']");
const OKButton = () => getLocator("//span[@id='NewAdditionalNamedInsuredPopup:ContactDetailScreen:Validate-btnInnerEl']");
const AddOption = (AddType: string) => getLocator(`//span[text()='${AddType}']`);
const OptionLocator = (maritialstatus: string) => getLocator(`//li[text()='${maritialstatus}']`);
const DescriptionOfInterest = () => getLocator("//div[@id='SubmissionWizard:LOBWizardStepGroup:SubmissionWizard_PolicyInfoScreen:AdditionalNamedInsuredsDV:NamedInsuredInputSet:NamedInsuredsLV-body']//div[text()='<none>']");
const getAdditionalNamedInsuredInput = (detail: string) => getLocatorByRole('textbox', { name: `${detail}` })
const YesCompanyPrimaryContact = () => getLocator("//input[@id='NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:CompanyPrimaryContact_Ext_true-inputEl']");
const NoCompanyPrimaryContact = () => getLocator("//input[@id='NewAdditionalNamedInsuredPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:PolicyContactRoleNameInputSet:CompanyPrimaryContact_Ext_false-inputEl']");






// Helper function to set input value in grid cells (similar to setCoverageInputValue in HO_Coverages_CorePage)
async function setDescribeOtherDeclinedCancelledValue(value: string, page: Page): Promise<void> {
  if (!value || value.trim() === "") {
    console.log("⚠️ No value provided for DescribeOtherDeclinedCancelled");
    return;
  }

  const control = getDescribeOtherDeclinedCancelledField();
  
  try {
    if (!(await isElementVisible(control))) {
      console.log("❌ DescribeOtherDeclinedCancelled field is not visible");
      return;
    }

    // Click to activate the cell
    await control.click({ force: true });
    await wait(500);
    
    // Double-click to enter edit mode
    await control.dblclick({ force: true });
    await wait(800);

    // Target the textbox input that appears in edit mode
    const textboxInput = getLocator('//input[@role="textbox" and @name="c1"]');

    const isInputVisible = await textboxInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isInputVisible) {
      await textboxInput.click({ force: true });
      await wait(300);
      await clear(textboxInput);
      await wait(200);
      await fill(textboxInput, value.trim());
      await page.keyboard.press('Tab'); // Confirm entry and move focus away
      console.log(`✅ DescribeOtherDeclinedCancelled set to: ${value}`);
    } else {
      console.error("❌ Textbox input not visible for DescribeOtherDeclinedCancelled");
    }
  } catch (error) {
    console.error("❌ Failed to fill DescribeOtherDeclinedCancelled:", error);
  }
}

async function fillPreviousPolicyNumber() {
  if (await isElementVisible(getPreviousPolicyNumberField())) {
  await getPreviousPolicyNumberField().click({ force: true });
  await getPreviousPolicyNumberField().fill("26Filings");
  }
}
async function fillInsuranceScore(value: any) {
  if (value !== undefined && value !== null && value !== "") {
    const insuranceScoreField = getInsuranceScoreField();
    if (await isElementVisible(insuranceScoreField)) {
      await insuranceScoreField.click({ force: true });
      await clear(insuranceScoreField);
      await fill(insuranceScoreField, value.toString());
      console.log(`✅ Insurance Score filled with value: ${value}`);
    } else {
      console.log(`⚠️ Insurance Score field not visible`);
    }
  }
}
async function selectPaperLessOption(value: any) {
  if (value === "Yes") {
    await click(getYesPaperLess());
  } else {
    await click(getNoPaperLess());
  }
}
async function selectPayingInFullOption(value: any) {
  if (value === "Yes") {
    await click(getYesPayingInFull());
  } else {
    await click(getNoPayingInFull());
  }
}
async function selectMultiPolicyDiscountOption(value: any) {
  if (value === "Yes") {
    await click(getYesMultiPolicyDiscount());
  }
}
async function selectAutoPolicyOption(value: any) {
  await click(getAutoPolicySelectButton());
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()= '${value}']`);
  await click(optionLocator);
}
async function selectLossesAbove500Option(value: any) {
  if (value === "Yes") {
    await click(getYesLossesAbove500());
  } else {
    await click(getNoLossesAbove500());
  }
}
async function selectInsuranceDeclinedOption(page: Page, data: any,
  value: any) {
  if (value === "Yes") {
    await click(getYesInsuranceDeclined());
    await wait(2000);
    await selectDropdownCore(page, "ReasonDeclinedCancelled",data["ReasonDeclinedCancelled"]);
    await wait(2000);
    if(data["ReasonDeclinedCancelled"] === "Other"){
      // Click grid cell to select it
      const cell = getDescribeOtherDeclinedCancelledCell();
      console.log('📝 Attempting to fill DescribeOtherDeclinedCancelled field');
      
      // Double click to activate edit mode
      await cell.click({ force: true });
      await wait(500);
      await cell.dblclick({ force: true });
      await wait(800);
      
      // Target the specific textbox input that appears
      const textboxInput = getLocator('//input[@role="textbox" and @name="c1"]');
      
      try {
        const isVisible = await textboxInput.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          console.log('✅ Textbox input found - filling with:', data["DescribeOtherDeclinedCancelled"]);
          await textboxInput.click({ force: true });
          await wait(300);
          await clear(textboxInput);
          await wait(200);
          await fill(textboxInput, data["DescribeOtherDeclinedCancelled"]);
          console.log('✅ Successfully filled DescribeOtherDeclinedCancelled');
        } else {
          throw new Error('Textbox input not visible');
        } 
      }
      catch (error) {
        console.error('❌ Failed to fill DescribeOtherDeclinedCancelled:', error);
      }
  } else {
    await click(getNoInsuranceDeclined());
  }
}
}
async function selectNumDwellOccupied(page:Page,value: any) {
  console.log("No Of Dwellings Occupied "+value);
  await wait(4000);
  if(await isElementVisible(getNumDwellOwnedClick()) && value !== undefined && value !== null && value !== ""){ 
  await getNumDwellOwnedClick().click({ force: true });
  await wait(4000);
  await getNumDwellOwnedClick().click({ force: true });
  await getNumDwellOwnedFill().fill(""); // Clear the input
  await getNumDwellOwnedFill().fill(value.toString()); // Fill the value
  await page.keyboard.press('Tab');
  } // Fill the value
}
async function selectAssociateName(page: Page, value: any) {
  await getAssociateNameField().click({ force: true });
  await wait(3000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  
  // Check if option is visible, if not try reopening dropdown
  if(!(await isElementVisible(optionLocator))){
    await getAssociateNameField().click({ force: true });
    await wait(1000); // Wait for dropdown to reopen
  }
  
  // Click the option (should be visible now)
  await click(optionLocator);
}

// async function fillInsuranceScore(score:number) {
//   await getInsuranceScore().click({force: true});
//   await fill(getInsuranceScore(),score.toString());
// }

async function selectAdditionalNamedInsuredsDesignees() {
  //let value = "New Company";
  let value = '';
  //let value = "New Person";
  if( value == "" || value == null || value == undefined){
    return;
  }
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await click(getAdd());

      if (await AddOption(value).isVisible()) {
        break;
      }

      throw new Error('New Person not visible');
    } catch (error) {
      if (attempt === 5) throw error;
      await wait(1000);
    }
  }

  await AddOption(value).click();
  await wait(2000);

  

  if (value == "New Person") {
    await FillPersonContactDetail();
  }

  if (value == "New Company") {
    await fillCompanyContactDetails();
  }

  await FillAddressDetail();
  await relationshipToPrimaryInsuredSelection();
  await scrollLocatorIntoView(OKButton());
  await OKButton().click();
  await DescriptionOfInterestSelection();
}

async function relationshipToPrimaryInsuredSelection() {

  const relationshipToPrimaryInsuredValue = 'Other';
  await selectDropdownWithRetry(getRelationshipToPrimaryInsured(), relationshipToPrimaryInsuredValue, { maxAttempts: 5 });
}

async function FillPersonContactDetail() {

  await getAdditionalNamedInsuredInput('First Name').fill('Steve');
  await getAdditionalNamedInsuredInput('Last Name').pressSequentially('Smith');
  await getAdditionalNamedInsuredInput('Middle Name').fill('');
  await getAdditionalNamedInsuredInput('Last Name').fill('Smith');
  await getDateOfBirth().click();
  await getDateOfBirth().pressSequentially('11/15/2010', { delay: 500 });
  const maritialstatus = "Single";
  await getMaritialStatus().click();
  await OptionLocator(maritialstatus).waitFor({
    state: "visible",
    timeout: NAVIGATION_TIMEOUT,
  });
  await OptionLocator(maritialstatus).click();
  const primaryPhoneValue = 'Home';
  await getPrimaryPhone().click();
  await OptionLocator(primaryPhoneValue).waitFor({
    state: "visible",
    timeout: NAVIGATION_TIMEOUT,
  });
  await OptionLocator(primaryPhoneValue).click();
  await wait(2000);

  await getAdditionalNamedInsuredInput('Home Phone').fill('3035551234');
  await getAdditionalNamedInsuredInput('Primary Email').fill('abc@1gmail.com');
  await getAdditionalNamedInsuredInput('Secondary Email').fill('');

}

async function FillAddressDetail() {

  await getAdditionalNamedInsuredInput('Attention/Care Of').fill('');
  await getAdditionalNamedInsuredInput('Address 1').click();
  await wait(2000);
  await getAdditionalNamedInsuredInput('Address 1').pressSequentially('4635 E 19TH AVE', { delay: 500 });
  await (getAdditionalNamedInsuredInput('Address 2').pressSequentially(''));
  await getAdditionalNamedInsuredInput('City').fill('DENVER');
  const stateValue = 'Colorado';
  await getState().click();
  await OptionLocator(stateValue).waitFor({
    state: "visible",
    timeout: NAVIGATION_TIMEOUT,
  });
  await OptionLocator(stateValue).click();
  await getAdditionalNamedInsuredInput('Zip Code').fill('80220-1133');
  const addressTypeValue = 'Business';
  await selectDropdownWithRetry(getAddressType(), addressTypeValue, { maxAttempts: 5 });
  await getAdditionalNamedInsuredInput('Address Description').fill('');
  
}

async function fillCompanyContactDetails() {

  await getAdditionalNamedInsuredInput('Name').fill('MRF');
  await getCompanyType().click();
  const companyTypeValue = 'Trust or Living Trust ';
  await OptionLocator(companyTypeValue).waitFor({
    state: "visible",
    timeout: NAVIGATION_TIMEOUT,
  });
  await OptionLocator(companyTypeValue).click();
  await getAdditionalNamedInsuredInput('Office Phone').fill('');
  await getAdditionalNamedInsuredInput('Fax').fill('');
  await getAdditionalNamedInsuredInput('Primary Email').fill('company@gmail.com');
  await (getAdditionalNamedInsuredInput('Secondary Email').fill(''));

}

async function DescriptionOfInterestSelection() {
  const descriptionOfInterestValue = 'Designee';
  await DescriptionOfInterest().click();
  await OptionLocator(descriptionOfInterestValue).waitFor({
    state: "visible",
    timeout: NAVIGATION_TIMEOUT,
  });

  await OptionLocator(descriptionOfInterestValue).click();

}

export async function fillPolicyInfoCorePage(page: Page, testInfo: TestInfo, policyInfoData: any, ruleMatrix: any, blockingContext: string, testCaseId: any): Promise<ValidationResult> {

  try {
    await wait(TIMEOUT_4_SECONDS);
    await fillPreviousPolicyNumber();
    let insuranceScore = policyInfoData["Insurance Score"] || policyInfoData["Insurance_Score"];
    if(insuranceScore){
      await fillInsuranceScore(insuranceScore);
    }

    // Use generic helpers for all radio/dropdown fields
    await selectYesNoRadioCore(page, 'PaperlessDiscount', policyInfoData["Paperless"] || policyInfoData["PaperlessDiscount"]);
    await selectYesNoRadioCore(page, 'PaidInFullDiscount', policyInfoData["Paid_in_Full"] || policyInfoData["PaidInFullDiscount"]);
    await selectYesNoRadioCore(page, 'MultiPolicyDiscount', policyInfoData["Multi_Policy"] || policyInfoData["MultiPolicyDiscount"]);
    await selectDropdownCore(page, 'AutoHomeDiscount', policyInfoData["Automobile_Policy"] || policyInfoData["Auto_Policy"] || policyInfoData["AutoHomeDiscount"]);
    await selectYesNoRadioCore(page, 'PriorLosses', policyInfoData["Losses_Above_500"] || policyInfoData["Losses_above_500_in_last_3_Years"] || policyInfoData["PriorLosses"] || policyInfoData["Losses above 500 in last 3 Years"]);
    await selectYesNoRadioCore(page, 'InsuranceDeclinedCancelled', policyInfoData["Insurance_Declined_Cancelled"] || policyInfoData["Similar_Insurance_Cancelled/Denied/Non-Renewed"] || policyInfoData["InsuranceDeclinedCancelled"]);
    await selectDropdownCore(page, 'AssociationDiscount', policyInfoData["ASSOCIATION_NAME"] || policyInfoData["Association"] || policyInfoData["AssociationDiscount"]);

    // await selectNumDwellOccupied(policyInfoData["NumberDwellingsOwned"] || policyInfoData["Number_of_Dwellings_Owned"] || policyInfoData["Dwellings_Owned"]);
    // Text fields (ReasonDeclinedCancelled, DescribeOtherDeclinedCancelled, NumberDwellingsOwned) can be handled here if needed
    await selectInsuranceDeclinedOption(page, policyInfoData, policyInfoData["Insurance_Declined_Cancelled"] || policyInfoData["Similar_Insurance_Cancelled/Denied/Non-Renewed"] || policyInfoData["InsuranceDeclinedCancelled"]);
    await selectNumDwellOccupied(page, policyInfoData["NumberDwellingsOwned"]);
    await setDescribeOtherDeclinedCancelledValue(policyInfoData["DescribeOtherDeclinedCancelled"], page);
    // await selectAdditionalNamedInsuredsDesignees();


    // await selectDropdownCore(page,"NumberDwellingsOwned",policyInfoData["NumberDwellingsOwned"]);

    // ...existing code for scrolling, screenshots, and validation...
    // const container = page.locator('#centerPanel');
    // await container.evaluate(el => el.scrollTop = 0);
    // await page.waitForTimeout(3000);
    //  await container.evaluate(el => el.scrollTop = 0);
    // await captureAndAttachforCore(page, testInfo, "PolicyInfo 1 of 2", { fullPage: true });
    // await page.waitForTimeout(3000);
    // await container.evaluate(el => { el.scrollTop = el.scrollHeight - el.clientHeight; });
    // await captureAndAttachforCore(page, testInfo, "PolicyInfo 2 of 2", { fullPage: false });
    await captureFullPage2D(page, testInfo, "Policy Info Details", '#centerPanel');
    // await captureAndAttachforCore(page, testInfo, "Policy Info Details", { fullPage: true });
    await getPolicyInfoSaveandNextOption().click({timeout: TIMEOUT_8_SECONDS});
    await wait(TIMEOUT_8_SECONDS);
    console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );
    if (await isElementVisible(getPolicyInfoSaveandNextOption())) {
      await getPolicyInfoSaveandNextOption().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }


    console.log("Policy Info Details validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;

  }
}