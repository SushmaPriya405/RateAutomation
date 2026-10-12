import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByRole,
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
  reloadPage
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
import { validateRulesForTestCase, ValidationResult } from "../../../utils/coreRuleBasedValidation";
import { selectDropdownCore, selectYesNoRadioCore } from "../../../utils/question-helper";
import { clickAddDriverAndNewPersonWithRetry, clickMotorVehicleRecordButton } from "./MS_Drivers_CorePage";
import { getWarningMsgCore } from "./CV_RiskAnaysis_CorePage";
import { waitForPageReady } from "../RiskAnalysis_CorePage";
import { selectDropdownWithRetry } from "../HO_Coverages_CorePage";

const getAddDriverButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver']");
const getExistingDriverButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:AddExistingContact-itemEl']");
const getexistingDriverName = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:AddExistingContact:0:UnassignedDriver-itemEl']");
const getNewPersonButton = () => getLocator("//span[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:0:ContactType-textEl']");
const getFirstName = () => getLocator("//input[contains(@id,'FirstName-inputEl')]");
const getMiddleName = () => getLocator("//input[contains(@id,'MiddleName-inputEl')]");
const getLastName = () => getLocator("//input[contains(@id,'LastName-inputEl')]");
const getDateOfBirth = () => getLocator("//input[contains(@id,'DateOfBirth-inputEl')]");
const getMaritalStatus = () => getLocator("//label[contains(text(), 'Marital Status')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getPrimaryPhone = () => getLocator("//label[contains(text(), 'Primary Phone')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getHomePhone = () => getLocator("//input[contains(@id,'HomePhone') and contains(@id,'-inputEl')]");
const getWorkPhone = () => getLocator("//input[contains(@id,'WorkPhone') and contains(@id,'-inputEl')]");
const getMobilePhone = () => getLocator("//input[contains(@id,'CellPhone') and contains(@id,'-inputEl')]");
const getRelationshipToPrimaryInsured = () => getLocator("//label[contains(text(), 'Relationship to Primary Insured')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getCompanyPrimaryContactYes = () => getLocator("//label[contains(text(), 'Company Primary Contact')]//parent::td/parent::tr//td[contains(@class,'x-form-checkboxgroup-body')]//label[contains(text(),'Yes')]");
const getCompanyPrimaryContactNo = () => getLocator("//label[contains(text(), 'Company Primary Contact')]//parent::td/parent::tr//td[contains(@class,'x-form-checkboxgroup-body')]//label[contains(text(),'No')]");
const getAddressDropdown = () => getLocator("//a[@id='NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:LinkAddressMenuMenuIcon']");
const getNewDriverFormInputField = (field:any) => getLocatorByRole("textbox",{name:`${field}`});
const getAddressDriverName = () => getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:0:contactDetail-textEl']");
const getAddressFromDriver = () => getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:0:contactDetail:PrimaryAddress-textEl']");
const getNewDriverOkButton = () => getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:Validate-btnInnerEl']");
const getDateCompletedSafetyCourse = () => getLocator("input[placeholder='MM/dd/yyyy']");
const getSafetyCourseTypeTDClick = () => getLocator("//div[normalize-space()='Safety Course Type']//parent::td/following-sibling::td");
const getDateCompletedCourseTDClick = ()  => getLocator("//div[normalize-space()='Date Completed Safety Course']//parent::td/following-sibling::td");
const getSafetyCourseType = () => getLocator("//div[contains(text(), 'Safety Course')]//parent::td/parent::tr//td[contains(@class,'x-grid-cell-selected')]");
const getDriversSaveandNextOption = () => getLocator('//span[contains(@id,"PADriversScreen") and contains(text(), "Drivers")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getYesLicensed = () => getLocator("//label[contains(text(), 'Licensed')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoLicensed = () => getLocator("//label[contains(text(), 'Licensed')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getLicenseState = () => getLocator("//label[contains(text(), 'License State')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getLicenseNumber = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:PolicyContactDetailsDV:LicenseInputSet:LicenseNumber-inputEl']");
const getContactTab = () => getLocator("//span[contains(text(),'Contact')]/parent::span/parent::span/parent::a[contains(@id,'DriverDetailsCV:PolicyContactDetailCardTab')]");
const getDriverExperienceButton = () => getLocator("//span[contains(text(),'Driver Experience')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:RolesCardTab']");
const getDriverAddressessTab = () => getLocator("//span[contains(text(),'Addresses')]/parent::span/parent::span/parent::a[contains(@id,'DriverDetailsCV:AddressDetailCardTab')]");
const getDriverMotorVehicleRecordTab = () => getLocator("//span[contains(text(),'Motor Vehicle Record')]/parent::span/parent::span/parent::a[contains(@id,'DriverDetailsCV:MVRDetailCardTab')]");
const getNoOfAccidents = () => getLocator("//label[contains(text(), 'Number of Accidents')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getNoOfViolations = () => getLocator("//label[contains(text(), 'Number of Violations')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getYesDriverIneligibility = () => getLocator("//div[contains(text(), 'Is this driver ineligible?')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoDriverIneligibility = () => getLocator("//div[contains(text(), 'Is this driver ineligible?')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getDriverMemberOfAssociation = () => getLocator("//div[contains(text(), 'Is the driver a member of any of the following associations?')]//parent::td/parent::tr//td[contains(@class, 'x-grid-cell-last  g-cell-edit')]");
const getNoOfBoatingExperiences = () => getLocator("//div[contains(text(), 'Years of Boating Experience')]//parent::td/parent::tr//td[contains(@class, 'x-grid-cell-last')]");
const getInterestInVesselsDropDown = () => getLocator('//td//div[contains(text(), "Does this driver have ownership interest in the vessel(s)?")]/parent::td/following-sibling::td[contains(@class, "g-cell-edit")]');
const getAddPriorOwnerShipExpButton = () => getLocator("//span[contains(@id, 'PADriverPriorOwnerExp_ExtLV_tb:Add-btnInnerEl')]");
// Prior Ownership grid-specific locators (skipping checkbox column, using data columns 2-7)
const getPriorOwnershipGrid = () => getLocator("//div[contains(@id, 'PADriverPriorOwnerExp_ExtLV')]//table[contains(@id, 'gridview')]");
const getModelYear = () => getLocator("//div[contains(@id, 'PADriverPriorOwnerExp_ExtLV')]//table[contains(@id, 'gridview')]//tr[contains(@class, 'x-grid-data-row')][last()]//td[2]");
const getModelYearInput = () => getLocator("//input[@name='PriorOwnerExpModelModelYear']");
const getLength = () => getLocator("//div[contains(@id, 'PADriverPriorOwnerExp_ExtLV')]//table[contains(@id, 'gridview')]//tr[contains(@class, 'x-grid-data-row')][last()]//td[3]");
const getLengthInput = () => getLocator("//input[@name='PriorOwnerExpModelLength']");
const getMake = () => getLocator("//div[contains(@id, 'PADriverPriorOwnerExp_ExtLV')]//table[contains(@id, 'gridview')]//tr[contains(@class, 'x-grid-data-row')][last()]//td[4]");
const getMakeInput = () => getLocator("//input[@name='PriorOwnerExpMake']");
const getModel = () => getLocator("//div[contains(@id, 'PADriverPriorOwnerExp_ExtLV')]//table[contains(@id, 'gridview')]//tr[contains(@class, 'x-grid-data-row')][last()]//td[5]");
const getModelInput = () => getLocator("//input[@name='PriorOwnerExpModel']");
const getTopSpeed = () => getLocator("//div[contains(@id, 'PADriverPriorOwnerExp_ExtLV')]//table[contains(@id, 'gridview')]//tr[contains(@class, 'x-grid-data-row')][last()]//td[6]");
const getTopSpeedInput = () => getLocator("//input[@name='PriorOwnerExpTopSpeed']");
const getNoOfYearsOwned = () => getLocator("//div[contains(@id, 'PADriverPriorOwnerExp_ExtLV')]//table[contains(@id, 'gridview')]//tr[contains(@class, 'x-grid-data-row')][last()]//td[7]");
const getNoOfYearsOwnedInput = () => getLocator("//input[@name='PriorOwnerExpNumberOfYearsOwned']");
const getDriversSaveButton = () => getLocator("//span[contains(@id,'PADriversScreen') and contains(@id,'Draft-btnInnerEl')]");

async function clickAddDriverButton() {
  await getAddDriverButton().click();
} 

async function clickExistingDriverButton() {
  await getExistingDriverButton().click();
} 

async function clickExistingDriverNameButton() {
  await getexistingDriverName().click();
}

async function clickNewPersonButton(page: Page) {
  await getAddDriverButton().scrollIntoViewIfNeeded();
  await getAddDriverButton().click({force: true});
  console.log(`✅ Clicked Add Driver button`);
  await getNewPersonButton().click({force: true});
  console.log(`✅ Clicked New Person button`);
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
}

// ========================================
// GENERIC DROPDOWN FUNCTION WITH LOGGING
// ========================================
/**
 * Generic dropdown selection with comprehensive logging and retry logic
 * @param page - Playwright page object
 * @param fieldName - Display name for logging (e.g., "Marital Status", "Safety Course Type")
 * @param value - Value to select from dropdown
 * @param triggerLocator - Locator for dropdown trigger/arrow
 * @param maxAttempts - Maximum retry attempts (default: 8)
 * @returns true if successful, false otherwise
 */
async function selectDropdownWithLogging(
  page: Page,
  fieldName: string,
  value: any,
  triggerLocator: any,
  maxAttempts: number = 8
): Promise<boolean> {
  console.log(`🔍 Attempting to select ${fieldName}: "${value}"`);
  
  const optionLocator = page.locator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const attemptDelay = 500;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // ✅ Retry click on trigger with verification
      console.log(`🖱️ ${fieldName} - Attempt ${attempt}/${maxAttempts}: Clicking dropdown trigger...`);
      
      await triggerLocator.scrollIntoViewIfNeeded();
      await wait(500);
      
      // Retry click up to 3 times if it fails
      let clickSuccess = false;
      for (let clickAttempt = 1; clickAttempt <= 3; clickAttempt++) {
        try {
          await triggerLocator.click({ force: true, timeout: 3000 });
          clickSuccess = true;
          console.log(`✅ ${fieldName} - Trigger clicked successfully on click attempt ${clickAttempt}`);
          break;
        } catch (clickError) {
          console.log(`⚠️ ${fieldName} - Click attempt ${clickAttempt}/3 failed, retrying...`);
          await wait(300);
        }
      }
      
      if (!clickSuccess) {
        console.log(`❌ ${fieldName} - Failed to click trigger after 3 attempts`);
        await wait(attemptDelay);
        continue;
      }
      
      await wait(1500);
      
      // Get all available options
      try {
        const dropdownList = page.locator(`//ul[@class='x-list-plain']`);
        await dropdownList.waitFor({ state: "visible", timeout: 2000 });
        
        const allOptions = await page.locator(`//ul[@class='x-list-plain']//li`).allTextContents();
        console.log(`📋 ${fieldName} - Available options in UI (${allOptions.length} total):`, allOptions);
        
        // Check if value exists
        const normalizedValue = value.toString().trim();
        const matchFound = allOptions.some(option => option.trim() === normalizedValue);
        
        if (matchFound) {
          console.log(`✅ Match found! "${value}" exists in ${fieldName} dropdown`);
        } else {
          console.log(`❌ No exact match! "${value}" NOT found in ${fieldName} dropdown`);
          
          // Try fuzzy match
          const closeMatches = allOptions.filter(opt => 
            opt.toLowerCase().includes(normalizedValue.toLowerCase()) ||
            normalizedValue.toLowerCase().includes(opt.toLowerCase())
          );
          
          if (closeMatches.length > 0) {
            console.log(`📌 Possible matches for ${fieldName}:`, closeMatches);
          }
        }
        
        // ✅ Retry click on option with verification
        let optionClickSuccess = false;
        for (let optionAttempt = 1; optionAttempt <= 3; optionAttempt++) {
          try {
            await optionLocator.waitFor({ state: "visible", timeout: 1000 });
            await click(optionLocator);
            optionClickSuccess = true;
            console.log(`✅ Successfully selected ${fieldName}: '${value}' (attempt ${attempt}, option click ${optionAttempt})`);
            return true;
          } catch (optionClickError) {
            console.log(`⚠️ ${fieldName} - Option click attempt ${optionAttempt}/3 failed`);
            await wait(300);
          }
        }
        
        if (!optionClickSuccess) {
          console.log(`❌ ${fieldName} - Failed to click option after 3 attempts`);
        }
        
      } catch (optionsError) {
        console.log(`⚠️ Could not retrieve ${fieldName} options on attempt ${attempt}: ${optionsError}`);
      }
      
    } catch (error) {
      console.log(`⚠️ ${fieldName} selection failed on attempt ${attempt}: ${error}`);
      await wait(attemptDelay);
    }
  }
  
  console.log(`❌ Failed to select ${fieldName}: '${value}' after ${maxAttempts} attempts`);
  return false;
}

async function fillFirstName(firstName: string) {
  await getFirstName().scrollIntoViewIfNeeded();
  await getFirstName().click({force: true});
  await getFirstName().clear();
  await getFirstName().pressSequentially(firstName, { delay: 100 });
  await wait(500);
  console.log(`✅ Filled First Name: ${firstName}`);
}

async function fillLastName(lastName: string) {
  await getLastName().scrollIntoViewIfNeeded();
  await getLastName().click({force: true});
  await getLastName().clear();
  await getLastName().pressSequentially(lastName, { delay: 100 });
  await wait(500);
  console.log(`✅ Filled Last Name: ${lastName}`);
}

async function fillMiddleName(middleName: string) {
  await getMiddleName().scrollIntoViewIfNeeded();
  await getMiddleName().click({force: true});
  await getMiddleName().clear();
  await getMiddleName().pressSequentially(middleName, { delay: 100 });
  await wait(500);
  console.log(`✅ Filled Middle Name: ${middleName}`);
}

async function fillDateOfBirth(dob: any) {
  // Convert to string format MM/DD/YYYY
  const dobString = formatToMMDDYYYY(dob);
  
  await getDateOfBirth().scrollIntoViewIfNeeded();
  await getDateOfBirth().click({force: true});
  await getDateOfBirth().clear();
  await getDateOfBirth().pressSequentially(dobString, { delay: 100 });
  await wait(500);
  console.log(`✅ Filled Date of Birth: ${dobString}`);
}

async function selectPrimaryPhone(page: Page, value: any) {
  await selectDropdownWithLogging(page, "Primary Phone", value, getPrimaryPhone());
}

async function fillPhoneNumber(phoneNumber: string, phoneType: string) {
  console.log(`\n📞 FILLING PHONE NUMBER BASED ON PRIMARY PHONE TYPE`);
  console.log(`   Phone Type Selected: "${phoneType}"`);
  console.log(`   Phone Number to Fill: "${phoneNumber}"`);
  
  // Determine which phone field to use based on Primary Phone type
  let phoneLocator;
  let phoneFieldName;
  
  const normalizedPhoneType = phoneType.toLowerCase().trim();
  
  if (normalizedPhoneType === "home" || normalizedPhoneType === "Other") {
    phoneLocator = getHomePhone();
    phoneFieldName = "Home Phone";
  } else if (normalizedPhoneType === "work") {
    phoneLocator = getWorkPhone();
    phoneFieldName = "Work Phone";
  } else if (normalizedPhoneType === "mobile" || normalizedPhoneType === "cell") {
    phoneLocator = getMobilePhone();
    phoneFieldName = "Mobile Phone";
  } else {
    // Default to Home Phone if type is unknown
    console.log(`⚠️  Unknown phone type "${phoneType}", defaulting to Home Phone`);
    phoneLocator = getHomePhone();
    phoneFieldName = "Home Phone";
  }
  
  console.log(`✅ Using field: ${phoneFieldName}`);
  
  await phoneLocator.scrollIntoViewIfNeeded();
  await wait(500);
  await phoneLocator.click({force: true});
  await wait(500);
  
  // Clear field first
  await phoneLocator.clear();
  await wait(500);
  
  // Convert to string to handle numbers from Excel
  const phoneNumberString = String(phoneNumber);
  console.log(`📝 Typing ${phoneFieldName} sequentially: ${phoneNumberString}`);
  
  // Use pressSequentially for natural typing behavior
  await phoneLocator.pressSequentially(phoneNumberString, { delay: 100 });
  await wait(1000);
  
  // Press Tab to commit the value
  await phoneLocator.press('Tab');
  await wait(500);
  
  // Verify value persisted
  try {
    const filledValue = await phoneLocator.inputValue({ timeout: 3000 });
    console.log(`✅ ${phoneFieldName} value after fill: ${filledValue}`);
    
    // Only retry if the field is empty
    if (!filledValue || filledValue.trim() === '') {
      console.log(`⚠️ ${phoneFieldName} is EMPTY, retrying with slower typing...`);
      await phoneLocator.click({force: true});
      await wait(500);
      await phoneLocator.clear();
      await wait(500);
      await phoneLocator.pressSequentially(phoneNumberString, { delay: 150 });
      await wait(1000);
      await phoneLocator.press('Tab');
      await wait(500);
      
      const retryValue = await phoneLocator.inputValue({ timeout: 3000 });
      console.log(`✅ ${phoneFieldName} value after retry: ${retryValue}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not verify ${phoneFieldName} value: ${error}, continuing...`);
  }
  
  console.log(`✅ Completed filling ${phoneFieldName}\n`);
}

async function selectRelationshipToPrimaryInsured(page: Page, value: any) {
  await selectDropdownCore(page, "Relationship_to_Primary_Insured", value);
}

async function selectCompanyPrimaryContact(page: Page, value: any = "No") {
  // Company Primary Contact is a Yes/No radio button
  if(await isElementVisible(getCompanyPrimaryContactNo())){
  await getCompanyPrimaryContactNo().scrollIntoViewIfNeeded(); 
  if (value === "Yes") {
    // Check if "Yes" is already selected
    const yesSelected = await getCompanyPrimaryContactYes().getAttribute("aria-checked");
    if (yesSelected === "true") {
      console.log(`✅ Company Primary Contact: Yes (already selected)`);
      return;
    }
    await getCompanyPrimaryContactYes().click({ force: true });
    console.log(`✅ Selected Company Primary Contact: Yes`);
  } else {
    // Check if "No" is already selected
    const noSelected = await getCompanyPrimaryContactNo().getAttribute("aria-checked");
    if (noSelected === "true") {
      console.log(`✅ Company Primary Contact: No (already selected)`);
      return;
    }
    await getCompanyPrimaryContactNo().click({ force: true });
    console.log(`✅ Selected Company Primary Contact: No`);
  }
}
}

export async function selectSameAddressAs(page: Page,accountDetails: any) {
  // Click the Address dropdown
  if(await isElementVisible(getAddressDropdown())){
    await getAddressDropdown().scrollIntoViewIfNeeded();
    await wait(500);
    await getAddressDropdown().click({ force: true });
    await wait(1000);
    await getAddressDriverName().click({ force: true });
    await wait(1000);
    await getAddressFromDriver().click({ force: true });
    await wait(1000);
    console.log(`✅ Selected Address from dropdown of (first Driver)`);
  }else{
    console.log("Address from dropdown of (first Driver) is not visible .");
    await getNewDriverFormInputField("Address 1").fill(accountDetails["StreetAddress1"]);
    await getNewDriverFormInputField("Address 2").fill(accountDetails["StreetAddress2"]||"");
    await getNewDriverFormInputField("City").fill(accountDetails["City"]);
    await selectDropdownCore(page,"State",getFullStateName(accountDetails["State"]));
    await getNewDriverFormInputField("ZIP Code").fill(accountDetails["ZipCode"]);
    await selectDropdownCore(page,"Address_Type",accountDetails["Address_type"]);
  }

}

async function clickNewPersonOkButton(page: Page) {
  // Click OK/Update button to finalize adding the new person
  if(await isElementVisible(getNewDriverOkButton())){
  await getNewDriverOkButton().scrollIntoViewIfNeeded();
  await wait(500);
  await getNewDriverOkButton().click({ force: true });
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(2000);
  console.log(`✅ Clicked OK to add new person`);
  }
}

async function ensureContactTabActive(page: Page) {
  // After clicking OK, the page might land on Contact or Driver Experience tab
  // We need to ensure we're on Contact tab before filling Licensed/License fields
  try {
    await wait(1000);
    
    // Check if Contact tab exists and if it's active
    const contactTab = getContactTab();
    const isContactTabVisible = await contactTab.isVisible({ timeout: 3000 });
    
    if (isContactTabVisible) {
      // Check if the tab has 'x-tab-active' class
      const tabClass = await contactTab.getAttribute("class");
      const isActive = tabClass?.includes("x-tab-active");
      
      if (!isActive) {
        console.log(`⚠️ Contact tab is not active, clicking to activate...`);
        await contactTab.click({ force: true });
        await wait(1500);
        console.log(`✅ Switched to Contact tab`);
      } else {
        console.log(`✅ Already on Contact tab`);
      }
    }
  } catch (error) {
    console.log(`⚠️ Could not verify Contact tab status: ${error}, continuing...`);
  }
}

async function fillDateCompletedSafetyCourse(date: string) {
console.log(`Date Completed Safety Course: ${date}`);
  if(await isElementVisible(getDateCompletedCourseTDClick()) ){
  await getDateCompletedCourseTDClick().scrollIntoViewIfNeeded();
  await getDateCompletedCourseTDClick().click({force: true});
  await getDateCompletedSafetyCourse().clear();
  await wait(3000);
  await getDateCompletedSafetyCourse().pressSequentially(date, { delay: 100 });
  await getDateCompletedSafetyCourse().press('Tab');
  await wait(5000);
  console.log(`✅ Filled Date Completed Safety Course: ${date}`);
  }
}
async function selectSafetyCourseType(page: Page, value: any) {
  if(await isElementVisible(getSafetyCourseType())){
    await selectDropdownWithLogging(page, "Safety Course Type", value, getSafetyCourseTypeTDClick());
    await wait(2000);
  } else {
    console.log(`⚠️ Safety Course Type dropdown not visible`);
  }
}

async function selectMaritalStatus(page: Page, value: any) {
  await selectDropdownWithLogging(page, "Marital Status", value, getMaritalStatus());
}

async function selectLicenseOption(value: any) {
    await getYesLicensed().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesLicensed().click({force:true});
  } else {
    await getNoLicensed().click({force:true});
  }
}

async function selectLicenseState(page: Page, value: any) {
  await getLicenseState().scrollIntoViewIfNeeded();
  await wait(3000);
  await getLicenseState().click({force: true});
  await wait(3000);
  let stateOption = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= '${value}']`);
  await stateOption().click({ force: true });
}

async function fillLicenseValue(page:Page,number:any) {
  await getLicenseNumber().scrollIntoViewIfNeeded();
  await wait(500);
  
  const licenseNumberString = String(number);
  console.log(`📝 Filling License Number: ${licenseNumberString}`);
  
  // Strategy 1: Simple fill (original working method)
  await getLicenseNumber().click({force: true});
  await wait(500);
  await fill(getLicenseNumber(), licenseNumberString);
  await wait(1000);
  
  // Press Tab to commit
  try {
    await getLicenseNumber().press('Tab');
    await wait(1500);
  } catch (e) {
    console.log(`⚠️ Tab press failed, continuing...`);
  }
  
  // Verify the value
  try {
    const filledValue = await getLicenseNumber().inputValue({ timeout: 2000 });
    console.log(`✅ License Number after fill: ${filledValue}`);
    
    // If value disappeared or is wrong, try alternative methods
    if (!filledValue || filledValue.trim() === '' || filledValue !== licenseNumberString) {
      console.log(`⚠️ Value issue detected. Expected: "${licenseNumberString}", Got: "${filledValue}"`);
      
      // Strategy 2: Use .fill() directly (bypass masks)
      console.log(`🔄 Trying .fill() method...`);
      await getLicenseNumber().fill(licenseNumberString);
      await wait(1000);
      await getLicenseNumber().press('Tab');
      await wait(1500);
      
      const fillValue = await getLicenseNumber().inputValue({ timeout: 2000 });
      console.log(`✅ After .fill(): ${fillValue}`);
      
      // Strategy 3: If still not working, use pressSequentially with slower delay
      if (!fillValue || fillValue !== licenseNumberString) {
        console.log(`🔄 Trying pressSequentially method...`);
        await getLicenseNumber().click({force: true});
        await wait(500);
        await getLicenseNumber().clear();
        await wait(500);
        await getLicenseNumber().pressSequentially(licenseNumberString, { delay: 150 });
        await wait(1500);
        await getLicenseNumber().press('Tab');
        await wait(2000);
        
        const seqValue = await getLicenseNumber().inputValue({ timeout: 2000 });
        console.log(`✅ After pressSequentially: ${seqValue}`);
      }
    }
const finalValue = await getLicenseNumber().inputValue();
console.log(`✅ Final value: ${finalValue}`);

if (!finalValue || finalValue !== licenseNumberString) {
  console.log(`🔄 Clicking Save as final attempt...`);

  await getDriversSaveButton().click({ force: true });
  await wait(5000);

  const savedValue = await getLicenseNumber().inputValue();
  console.log(`✅ Value after Save: ${savedValue}`);
}
  } catch (error) {
    console.log(`⚠️ Could not verify License Number: ${error}, continuing...`);
  }
}

async function clickDriverExperienceButton() {
  await getDriverExperienceButton().click({force: true});
}

async function selectDriverIneligibleOption(value: any) {
    await getNoDriverIneligibility().scrollIntoViewIfNeeded();

    const normalizedValue = String(value ?? "").trim().toLowerCase();
    if (!normalizedValue) {
      console.log("⚠️ Ineligible Driver is blank/undefined. Skipping selection to avoid unintended overwrite.");
      return;
    }

    const selectYes = normalizedValue === "yes" || normalizedValue === "true";
    const selectNo = normalizedValue === "no" || normalizedValue === "false";

    if (!selectYes && !selectNo) {
      console.log(`⚠️ Invalid Ineligible Driver value: "${value}". Expected Yes/No. Skipping selection.`);
      return;
    }

    const targetLabel = selectYes ? getYesDriverIneligibility() : getNoDriverIneligibility();
    const targetText = selectYes ? "Yes" : "No";
    const targetInput = getLocator(
      selectYes
        ? "//div[contains(text(), 'Is this driver ineligible?')]/parent::td/parent::tr//input[@inputvalue='true']"
        : "//div[contains(text(), 'Is this driver ineligible?')]/parent::td/parent::tr//input[@inputvalue='false']"
    );

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const className = (await targetInput.getAttribute("class")) || "";
        if (className.includes("x-form-cb-checked")) {
          console.log(`Selected Ineligible Driver: ${targetText} (already selected)`);
          return;
        }

        await targetLabel.click({ force: true });
        await wait(500);

        const classAfterClick = (await targetInput.getAttribute("class")) || "";
        if (classAfterClick.includes("x-form-cb-checked")) {
          console.log(`Selected Ineligible Driver: ${targetText}`);
          return;
        }

        console.log(`⚠️ Ineligible Driver ${targetText} not confirmed after attempt ${attempt}, retrying...`);
      } catch (error) {
        console.log(`⚠️ Failed to select Ineligible Driver ${targetText} on attempt ${attempt}: ${error}`);
      }
      await wait(300);
    }

    console.log(`❌ Could not confirm Ineligible Driver selection: ${targetText} after retries.`);
}

async function selectMembersOfAssociations(page: Page, value: any) {
  if(await isElementVisible(getDriverMemberOfAssociation())){
    await selectDropdownWithLogging(page, "Members of Associations", value, getDriverMemberOfAssociation());
  }
}
async function selectBoatingExperience(page: Page, value: any) {
  console.log(`\n🚤 Attempting to select Years of Boating Experience: "${value}"`);
  if(await isElementVisible(getNoOfBoatingExperiences())){
console.log(`✅ Dropdown for Years of Boating Experience is visible, proceeding with selection`);

    await selectDropdownWithLogging(page, "Years of Boating Experience", value, getNoOfBoatingExperiences());
  }
}

async function selectNoOfAccident(page: Page, value: any) {
  await selectDropdownWithLogging(page, "Number of Accidents", value, getNoOfAccidents());
}

async function selectNoOfViolation(page: Page, value: any) {
  await selectDropdownWithLogging(page, "Number of Violations", value, getNoOfViolations());
}

async function selectInterestInVessels(page: Page, value: any) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 VESSELS OWNERSHIP INTEREST - DATA & SELECTION STATUS");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`📝 Excel Value: "${value}"`);
  console.log(`📋 Data Type: ${typeof value}`);
  console.log(`📏 Length: ${String(value).length} chars`);
  
  try {
    const isDropdownVisible = await isElementVisible(getInterestInVesselsDropDown());
    console.log(`👁️  Dropdown Visible: ${isDropdownVisible ? "✅ YES" : "❌ NO"}`);
    
    if (!isDropdownVisible) {
      console.log("⚠️  WARNING: Dropdown not visible - attempting scroll");
    }
    
    await getInterestInVesselsDropDown().scrollIntoViewIfNeeded();
    console.log("✅ Scrolled dropdown into view");
    
    // ✨ ROBUST RETRY LOGIC - Click until dropdown opens
    const maxAttempts = 5;
    let dropdownOpened = false;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Clicking Vessel Interest dropdown...`);
      await getInterestInVesselsDropDown().click({force: true});
      await wait(2000);
      
      // Verify dropdown list appeared
      const dropdownList = getLocator(`//ul[@class='x-list-plain']`);
      try {
        await dropdownList.waitFor({ state: "visible", timeout: 2000 });
        dropdownOpened = true;
        console.log(`✅ Dropdown opened successfully on attempt ${attempt}`);
        break;
      } catch {
        console.log(`⚠️ Dropdown not visible on attempt ${attempt}, retrying...`);
        if (attempt < maxAttempts) {
          await wait(1000);
        }
      }
    }
    
    if (!dropdownOpened) {
      throw new Error(`Failed to open Vessel Interest dropdown after ${maxAttempts} attempts`);
    }
    
    // Log all available options
    try {
      const allOptions = await page.locator(`//ul[@class='x-list-plain']//li`).allTextContents();
      console.log(`📋 Available Options (${allOptions.length} total):`);
      allOptions.forEach((option, index) => {
        const trimmedOption = option.trim();
        const matches = trimmedOption === String(value).trim();
        console.log(`   ${index + 1}. "${trimmedOption}" ${matches ? "✅ MATCH" : ""}`);
      });
    } catch (error) {
      console.log(`⚠️  Could not retrieve dropdown options: ${error}`);
    }
    
    // Try to select the option
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
    const isOptionAvailable = await isElementVisible(optionLocator);
    console.log(`🔍 Exact Match for "${value}": ${isOptionAvailable ? "✅ YES" : "❌ NO"}`);
    
    if (isOptionAvailable) {
      await click(optionLocator);
      console.log(`✅ Successfully selected: "${value}"`);
      await wait(1000);
      
      // Verify selection
      try {
        const selectedValue = await getInterestInVesselsDropDown().textContent();
        console.log(`📋 Selected Value: "${selectedValue?.trim()}"`);
      } catch (verifyError) {
        console.log("⚠️  Could not verify selection");
      }
    } else {
      // Try trimmed/normalized match
      console.log(`🔄 Trying normalized match...`);
      const trimmedValue = String(value).trim();
      const normalizedLocator = getLocator(`//ul[@class='x-list-plain']//li[normalize-space(text())='${trimmedValue}']`);
      const isNormalizedAvailable = await isElementVisible(normalizedLocator);
      
      if (isNormalizedAvailable) {
        await click(normalizedLocator);
        console.log(`✅ Successfully selected using normalized match`);
        await wait(1000);
      } else {
        console.log(`❌ ERROR: Option "${value}" not found in dropdown`);
        console.log(`💡 Update Excel "OwnershipInterestInVessels" to match one of the available options above`);
        throw new Error(`Option "${value}" not found in Vessel Ownership Interest dropdown`);
      }
    }
    
  } catch (error) {
    console.log("❌ ERROR during vessel interest selection:");
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    console.log("═══════════════════════════════════════════════════════");
  }
}

async function addModelYear(page: Page, PriorOwnershipData: any) {
  // Wait for grid to load after clicking Add button
  await wait(3000);
  
  // Try clicking the input field directly if visible
  try {
    await getModelYearInput().waitFor({ state: "visible", timeout: 5000 });
    await getModelYearInput().scrollIntoViewIfNeeded();
    await getModelYearInput().click();
    await wait(1000);
    await fill(getModelYearInput(), PriorOwnershipData.toString());
    await getModelYearInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Model Year: ${PriorOwnershipData}`);
    return;
  } catch (e) {
    console.log(`⚠️ Direct input not visible, trying cell click approach...`);
  }
  
  // Fallback: click cell then input
  if (await isElementVisible(getModelYear())) {   
    await getModelYear().scrollIntoViewIfNeeded();
    await getModelYear().click();
    await wait(2000); 
    await fill(getModelYearInput(), PriorOwnershipData.toString());
    await getModelYearInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Model Year: ${PriorOwnershipData}`);
  }
}
async function addLength(page: Page, PriorOwnershipData: any) {
  // Try clicking the input field directly if visible
  try {
    await getLengthInput().waitFor({ state: "visible", timeout: 3000 });
    await getLengthInput().scrollIntoViewIfNeeded();
    await getLengthInput().click();
    await wait(500);
    await fill(getLengthInput(), PriorOwnershipData.toString());
    await getLengthInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Length: ${PriorOwnershipData}`);
    return;
  } catch (e) {
    console.log(`⚠️ Length input not visible, trying cell click...`);
  }
  
  // Fallback: click cell then input
  if (await isElementVisible(getLength())) {    
    await getLength().scrollIntoViewIfNeeded();
    await getLength().click();
    await wait(2000); 
    await fill(getLengthInput(), PriorOwnershipData.toString());
    await getLengthInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Length: ${PriorOwnershipData}`);
  }
}
async function addMake(page: Page, PriorOwnershipData: any) {
  try {
    await getMakeInput().waitFor({ state: "visible", timeout: 3000 });
    await getMakeInput().scrollIntoViewIfNeeded();
    await getMakeInput().click();
    await wait(500);
    await fill(getMakeInput(), PriorOwnershipData.toString());
    await getMakeInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Make: ${PriorOwnershipData}`);
    return;
  } catch (e) {
    console.log(`⚠️ Make input not visible, trying cell click...`);
  }
  
  if (await isElementVisible(getMake())) {
    await getMake().scrollIntoViewIfNeeded();
    await getMake().click();
    await wait(2000); 
    await fill(getMakeInput(), PriorOwnershipData.toString());
    await getMakeInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Make: ${PriorOwnershipData}`);
  }
}
async function addModel(page: Page, PriorOwnershipData: any) {
  try {
    await getModelInput().waitFor({ state: "visible", timeout: 3000 });
    await getModelInput().scrollIntoViewIfNeeded();
    await getModelInput().click();
    await wait(500);
    await fill(getModelInput(), PriorOwnershipData.toString());
    await getModelInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Model: ${PriorOwnershipData}`);
    return;
  } catch (e) {
    console.log(`⚠️ Model input not visible, trying cell click...`);
  }
  
  if (await isElementVisible(getModel())) {
    await getModel().scrollIntoViewIfNeeded();
    await getModel().click();
    await wait(2000); 
    await fill(getModelInput(), PriorOwnershipData.toString());
    await getModelInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Model: ${PriorOwnershipData}`);
  }
}
async function addTopSpeed(page: Page, PriorOwnershipData: any) {
  try {
    await getTopSpeedInput().waitFor({ state: "visible", timeout: 3000 });
    await getTopSpeedInput().scrollIntoViewIfNeeded();
    await getTopSpeedInput().click();
    await wait(500);
    await fill(getTopSpeedInput(), PriorOwnershipData.toString());
    await getTopSpeedInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Top Speed: ${PriorOwnershipData}`);
    return;
  } catch (e) {
    console.log(`⚠️ Top Speed input not visible, trying cell click...`);
  }
  
  if (await isElementVisible(getTopSpeed())) {
    await getTopSpeed().scrollIntoViewIfNeeded();
    await getTopSpeed().click();
    await wait(2000); 
    await fill(getTopSpeedInput(), PriorOwnershipData.toString());
    await getTopSpeedInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Top Speed: ${PriorOwnershipData}`);
  }
}
async function addNoOfYearsOwned(page: Page, PriorOwnershipData: any) {
  try {
    await getNoOfYearsOwnedInput().waitFor({ state: "visible", timeout: 3000 });
    await getNoOfYearsOwnedInput().scrollIntoViewIfNeeded();
    await getNoOfYearsOwnedInput().click();
    await wait(500);
    await fill(getNoOfYearsOwnedInput(), PriorOwnershipData.toString());
    await getNoOfYearsOwnedInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Years Owned: ${PriorOwnershipData}`);
    return;
  } catch (e) {
    console.log(`⚠️ Years Owned input not visible, trying cell click...`);
  }
  
  if (await isElementVisible(getNoOfYearsOwned())) {
    await getNoOfYearsOwned().scrollIntoViewIfNeeded();
    await getNoOfYearsOwned().click();
    await wait(2000); 
    await fill(getNoOfYearsOwnedInput(), PriorOwnershipData.toString());
    await getNoOfYearsOwnedInput().press('Tab');
    await wait(500);
    console.log(`✅ Filled Years Owned: ${PriorOwnershipData}`);
  }
}

export async function fillDriverCorePage(page: Page, testInfo: TestInfo, Drivers: any[], 
  ruleMatrix: Record<string, Record<string, any>>,
    blockingContext: string,
    testCaseId: any,accountDetails: any): Promise<ValidationResult> {
  // await reloadPage();
  try {
  let driverCount = 0;
  
  for(let DriverData of Drivers){
    // Check if this driver has data (checking for Drivers field or First_Name/Last_Name)
    const hasDriverData = DriverData["Drivers"] || (DriverData["First_Name"] && DriverData["Last_Name"]);
    
    if(hasDriverData){
      driverCount++;
      const driverLabel = DriverData["Drivers"] || `Driver ${driverCount}`;
      console.log(`\n📋 ========== Processing ${driverLabel} ==========`);
      console.log(`Driver Data:`, DriverData);
      
      // Add driver based on driver number
      if(driverCount === 1) {
        // First driver - add from existing contacts
        console.log(`➕ Adding Driver 1 from existing contacts...`);
        await clickAddDriverButton();
        await waitForPageReady(page);
        await clickExistingDriverButton();
        await waitForPageReady(page);
        await clickExistingDriverNameButton();
        await waitForPageReady(page);
      } else {
        // Driver 2, 3, etc. - add as new person
        
        // Validate that First Name and Last Name are present before clicking Add
        if (!DriverData["First_Name"] || !DriverData["Last_Name"]) {
          console.log(`⚠️ Skipping Driver ${driverCount}: Missing First_Name or Last_Name`);
          console.log(`   First_Name: ${DriverData["First_Name"]}`);
          console.log(`   Last_Name: ${DriverData["Last_Name"]}`);
          driverCount--; // Decrement since we're not actually processing this driver
          continue; // Skip to next driver
        }
        
        console.log(`➕ Adding Driver ${driverCount} as new person...`);
        // await clickAddDriverButton();
        // await wait(2000);
        // await clickNewPersonButton(page);
        // await wait(2000);
        await clickAddDriverAndNewPersonWithRetry(page);
        await wait(2000);
        
        // Fill First Name, Middle Name, and Last Name for new driver
        if(DriverData["First_Name"]) {
          await fillFirstName(DriverData["First_Name"]);
        }
        if(DriverData["Middle_Name"]) {
          await fillMiddleName(DriverData["Middle_Name"]);
        }
        if(DriverData["Last_Name"]) {
          await fillLastName(DriverData["Last_Name"]);
        }
        
        // Fill Date of Birth for new driver
        if(DriverData["DATE_OF_BIRTH"]) {
          const dobValue = DriverData["DATE_OF_BIRTH"];
          await fillDateOfBirth(dobValue);
        }
        
        // Fill Marital Status for new driver (after DOB)
        if(DriverData["Marital_Status"]) {
          await selectMaritalStatus(page, DriverData["Marital_Status"]);
        }
        
        // Fill Primary Phone for new driver (after Marital Status)
        if(DriverData["Phone_Type"]) {
          await selectPrimaryPhone(page, DriverData["Phone_Type"]);
        }
        
        // Fill Phone Number based on Primary Phone Type
        if(DriverData["Phone_Number"] && DriverData["Phone_Type"]) {
          await fillPhoneNumber(DriverData["Phone_Number"], DriverData["Phone_Type"]);
        } else if(DriverData["Phone_Number"]) {
          // If no Phone_Type specified, default to Home
          console.log("⚠️  No Phone_Type specified, defaulting to Home Phone");
          await fillPhoneNumber(DriverData["Phone_Number"], "Home");
        }
        
        // Fill Relationship to Primary Insured for new driver
        if(DriverData["Relationship_to_Primary_Insured"]) {
          await selectRelationshipToPrimaryInsured(page, DriverData["Relationship_to_Primary_Insured"]);
        }
        
        // Company Primary Contact - use Excel value if available, otherwise default to "No"
        const companyPrimaryContactValue = DriverData["Company_Primary_Contact"] || "No";
        await selectCompanyPrimaryContact(page, companyPrimaryContactValue);
        await wait(1000);
        
        // Address - select same address as (first option) and then second dropdown
        await selectSameAddressAs(page,accountDetails);
        await wait(2000);
        
        // Click OK/Update button to finalize adding the new person
        await clickNewPersonOkButton(page);
        
        // Ensure we're on Contact tab before filling license fields
        await ensureContactTabActive(page);
        
        console.log(`✅ Completed new person creation for ${driverLabel}`);
      }
      
      // Fill common driver details for ALL drivers
      console.log(`📝 Filling contact details for ${driverLabel}...`);
      
      // Fill Marital Status for Driver 1 (already filled for Driver 2+ above)
      if(driverCount === 1 && DriverData["Marital_Status"]) {
        await selectMaritalStatus(page, DriverData["Marital_Status"]);
      }
      
      // ⚠️ IMPORTANT: Driver 1's phone information is pre-filled from Named Insured contact
      // Phone Type and Phone Number are ONLY filled for Driver 2+ (already handled in 'new person' block above)
      // DO NOT attempt to fill phone fields for Driver 1
      
      if(DriverData["Licensed"]){
        await selectLicenseOption(DriverData["Licensed"]);
      }
      
      if(DriverData["License_State"]) {
        const fullStateName = getFullStateName(DriverData["License_State"]);
        console.log(`   License State: ${DriverData["License_State"]} → ${fullStateName}`);
        // await selectLicenseState(page, fullStateName);
        await selectDropdownCore(page,"License_State",fullStateName);
      }
      
      if(DriverData["License_Number"]) {
        await fillLicenseValue(page, DriverData["License_Number"]);
      }
      
      await captureFullPage2D(page, testInfo, `Driver ${driverCount} Contact Detail Tab`, "#centerPanel");
      await wait(3000);
      
      // Fill driver experience details
      console.log(`📝 Filling driver experience for ${driverLabel}...`);
      await clickDriverExperienceButton();
      await wait(2000);
      // await page.pause();
      console.log(`   Ineligible Driver: ${DriverData["IneligibleDriver"]}`);
      // await selectDriverIneligibleOption(DriverData["IneligibleDriver"]);
      await selectYesNoRadioCore(page,"IneligibleDriver",DriverData["IneligibleDriver"]);
      await wait(1000);
      
      // Date Completed Safety Course (if filled, Safety Course Type dropdown will appear)
      if(DriverData["DateCompletedSafetyCourse"]) {
        const safetyCourseDate = formatToMMDDYYYY(DriverData["DateCompletedSafetyCourse"]);
        await fillDateCompletedSafetyCourse(safetyCourseDate);
        await wait(1500); // Wait for Safety Course Type dropdown to appear
        
        // Fill Safety Course Type if it exists
        if(DriverData["SafetyCourseType"]) {
          await selectSafetyCourseType(page, DriverData["SafetyCourseType"]);
        }
      }
      
      if(DriverData["AssociationDiscount"]) {
        await selectMembersOfAssociations(page, DriverData["AssociationDiscount"]);
      }
      console.log(`Years of Boating Experience: ${DriverData["YearsBoatingExperience"]}`);
      if(DriverData["YearsBoatingExperience"].toString()) {
          console.log(`Years of Boating Experience: ${DriverData["YearsBoatingExperience"].toString()}`);
        await selectBoatingExperience(page, DriverData["YearsBoatingExperience"].toString());
      }
      
      // 📸 Capture Driver Experience tab after filling
      await captureFullPage2D(page, testInfo, `Driver ${driverCount} Experience Tab`, "#centerPanel");
      console.log(`✅ Captured Driver Experience for ${driverLabel}`);
      
      // 📸 Navigate to and capture Driver Addresses tab
      if (await isElementVisible(getDriverAddressessTab())) {
        console.log(`📸 Switching to Addresses tab for ${driverLabel}...`);
        await getDriverAddressessTab().click({ force: true });
        await wait(2000);
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
        await captureFullPage2D(page, testInfo, `Driver ${driverCount} Addresses Tab`, "#centerPanel");
        console.log(`✅ Captured Addresses for ${driverLabel}`);
        await wait(2000);
        await clickMotorVehicleRecordButton();
        await wait(5000);
        await captureFullPage2D(page, testInfo, `Driver ${driverCount} Motor Vehicle Record Tab`, "#centerPanel");

        // Return to Contact tab for next driver (if any)
        await getContactTab().click({ force: true });
        await wait(1000);
      }
      console.log(`✅ Completed ${driverLabel} with full capture`);
    }
  }
  console.log("\=============================================================");
  console.log(`\n✅ Total drivers processed: ${driverCount}`);
  
  // Capture final screenshot
  //await wait(2000);
                                                                                                                
  //await captureFullPage2D(page, testInfo, "FillAllDriversExperienceCorePage", "#centerPanel");
  
  // Click Save and Next
  await getDriversSaveandNextOption().click();
  await wait(TIMEOUT_8_SECONDS);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    console.log("🔍 Performing rule-based validation for Drivers...");
        const validationResult = await validateRulesForTestCase(
          testCaseId, 
          blockingContext,
          ruleMatrix,
          page,
          testInfo
        );
        
        console.log("Driver validation result:", validationResult);
        
        if (await isElementVisible(getWarningMsgCore())) {
          await captureFullPage2D(page, testInfo, "Warnings In Drivers Page", "#centerPanel");
          await getDriversSaveandNextOption().click({ timeout: 4000 });
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
      


export async function fillDriverDetailsYTCorePage(page: Page, testInfo: TestInfo, Drivers: any[], 
  ruleMatrix: Record<string, Record<string, any>>,
    blockingContext: string,
    testCaseId: any,accountDetails: any): Promise<ValidationResult> {
  // await reloadPage();
  try {
  let driverCount = 0;
  
  for(let DriverData of Drivers){
    // Check if this driver has data (checking for Drivers field or First_Name/Last_Name)
    const hasDriverData = DriverData["Drivers"] || (DriverData["First_Name"] && DriverData["Last_Name"]);
    
    if(hasDriverData){
      driverCount++;
      const driverLabel = DriverData["Drivers"] || `Driver ${driverCount}`;
      console.log(`\n📋 ========== Processing ${driverLabel} ==========`);
      console.log(`Driver Data:`, DriverData);
      
      // Add driver based on driver number
      if(driverCount === 1) {
        // First driver - add from existing contacts
        console.log(`➕ Adding Driver 1 from existing contacts...`);
        await clickAddDriverButton();
        await waitForPageReady(page);
        await clickExistingDriverButton();
        await waitForPageReady(page);
        await clickExistingDriverNameButton();
        await waitForPageReady(page);
      } else {
        // Driver 2, 3, etc. - add as new person
        
        // Validate that First Name and Last Name are present before clicking Add
        if (!DriverData["First_Name"] || !DriverData["Last_Name"]) {
          console.log(`⚠️ Skipping Driver ${driverCount}: Missing First_Name or Last_Name`);
          console.log(`   First_Name: ${DriverData["First_Name"]}`);
          console.log(`   Last_Name: ${DriverData["Last_Name"]}`);
          driverCount--; // Decrement since we're not actually processing this driver
          continue; // Skip to next driver
        }
        
        console.log(`➕ Adding Driver ${driverCount} as new person...`);
        // await clickAddDriverButton();
        // await wait(2000);
        // await clickNewPersonButton(page);
        // await wait(2000);
        await clickAddDriverAndNewPersonWithRetry(page);
        await wait(2000);
        
        // Fill First Name, Middle Name, and Last Name for new driver
        if(DriverData["First_Name"]) {
          await fillFirstName(DriverData["First_Name"]);
        }
        if(DriverData["Middle_Name"]) {
          await fillMiddleName(DriverData["Middle_Name"]);
        }
        if(DriverData["Last_Name"]) {
          await fillLastName(DriverData["Last_Name"]);
        }
        
        // Fill Date of Birth for new driver
        if(DriverData["DATE_OF_BIRTH"]) {
          const dobValue = DriverData["DATE_OF_BIRTH"];
          await fillDateOfBirth(dobValue);
        }
        
        // Fill Marital Status for new driver (after DOB)
        if(DriverData["Marital_Status"]) {
          await selectMaritalStatus(page, DriverData["Marital_Status"]);
        }
        
        // Fill Primary Phone for new driver (after Marital Status)
        if(DriverData["Phone_Type"]) {
          await selectPrimaryPhone(page, DriverData["Phone_Type"]);
        }
        
        // Fill Phone Number based on Primary Phone Type
        if(DriverData["Phone_Number"] && DriverData["Phone_Type"]) {
          await fillPhoneNumber(DriverData["Phone_Number"], DriverData["Phone_Type"]);
        } else if(DriverData["Phone_Number"]) {
          // If no Phone_Type specified, default to Home
          console.log("⚠️  No Phone_Type specified, defaulting to Home Phone");
          await fillPhoneNumber(DriverData["Phone_Number"], "Home");
        }
        
        // Fill Relationship to Primary Insured for new driver
        if(DriverData["Relationship_to_Primary_Insured"]) {
          await selectRelationshipToPrimaryInsured(page, DriverData["Relationship_to_Primary_Insured"]);
        }
        
        // Company Primary Contact - use Excel value if available, otherwise default to "No"
        const companyPrimaryContactValue = DriverData["Company_Primary_Contact"] || "No";
        await selectCompanyPrimaryContact(page, companyPrimaryContactValue);
        await wait(1000);
        
        // Address - select same address as (first option) and then second dropdown
        await selectSameAddressAs(page,accountDetails);
        await wait(2000);
        
        // Click OK/Update button to finalize adding the new person
        await clickNewPersonOkButton(page);
        
        // Ensure we're on Contact tab before filling license fields
        await ensureContactTabActive(page);
        
        console.log(`✅ Completed new person creation for ${driverLabel}`);
      }
      
      // Fill common driver details for ALL drivers
      console.log(`📝 Filling contact details for ${driverLabel}...`);
      
      // Fill Marital Status for Driver 1 (already filled for Driver 2+ above)
      if(driverCount === 1 && DriverData["Marital_Status"]) {
        await selectMaritalStatus(page, DriverData["Marital_Status"]);
      }
      
      // ⚠️ IMPORTANT: Driver 1's phone information is pre-filled from Named Insured contact
      // Phone Type and Phone Number are ONLY filled for Driver 2+ (already handled in 'new person' block above)
      // DO NOT attempt to fill phone fields for Driver 1
      
      if(DriverData["Licensed"]){
        await selectLicenseOption(DriverData["Licensed"]);
      }
      
      if(DriverData["License_State"]) {
        const fullStateName = getFullStateName(DriverData["License_State"]);
        console.log(`   License State: ${DriverData["License_State"]} → ${fullStateName}`);
        await selectLicenseState(page, fullStateName);
      }
      
      if(DriverData["License_Number"]) {
        await fillLicenseValue(page, DriverData["License_Number"]);
      }
      
      await captureFullPage2D(page, testInfo, `Driver ${driverCount} Contact Detail Tab`, "#centerPanel");
      await wait(3000);
      
      // Fill driver experience details
      console.log(`📝 Filling driver experience for ${driverLabel}...`);
      await clickDriverExperienceButton();
      await wait(2000);
      // await page.pause();
      console.log(`   Ineligible Driver: ${DriverData["IneligibleDriver"]}`);
      // await selectDriverIneligibleOption(DriverData["IneligibleDriver"]);
      await selectYesNoRadioCore(page,"IneligibleDriver",DriverData["IneligibleDriver"]);
      await wait(1000);
      
      // Date Completed Safety Course (if filled, Safety Course Type dropdown will appear)
      if(DriverData["DateCompletedSafetyCourse"]) {
        const safetyCourseDate = formatToMMDDYYYY(DriverData["DateCompletedSafetyCourse"]);
        await fillDateCompletedSafetyCourse(safetyCourseDate);
        await wait(1500); // Wait for Safety Course Type dropdown to appear
        
        // Fill Safety Course Type if it exists
        if(DriverData["SafetyCourseType"]) {
          await selectSafetyCourseType(page, DriverData["SafetyCourseType"]);
        }
      }
      
      if(DriverData["AssociationDiscount"]) {
        await selectMembersOfAssociations(page, DriverData["AssociationDiscount"]);
      }
      console.log(`Years of Boating Experience: ${DriverData["YearsBoatingExperience"]}`);
        if(DriverData["YearsBoatingExperience"]?.toString()) {
          console.log(`Years of Boating Experience: ${DriverData["YearsBoatingExperience"].toString()}`);
        await selectBoatingExperience(page, DriverData["YearsBoatingExperience"].toString());
      }
      console.log("\n🚤 PROCESSING VESSEL OWNERSHIP INTEREST...");
      console.log(`📊 Raw DriverData["OwnershipInterestInVessels"]: ${JSON.stringify(DriverData["OwnershipInterestInVessels"])}`);
      console.log(`✅ Has Value: ${!!DriverData["OwnershipInterestInVessels"]}`);
      console.log(`📋 Value Type: ${typeof DriverData["OwnershipInterestInVessels"]}`);
      
      if(DriverData["OwnershipInterestInVessels"]){
        console.log("▶️  Calling selectInterestInVessels function...");
        await selectInterestInVessels(page,DriverData["OwnershipInterestInVessels"]);
        console.log("✅ selectInterestInVessels function completed\n");
      } else {
        console.log("⏭️  SKIPPED: OwnershipInterestInVessels field is empty or undefined\n");
      }
      
     if (await isElementVisible(getAddPriorOwnerShipExpButton(),{timeout: 10000})) {     
     await getAddPriorOwnerShipExpButton().scrollIntoViewIfNeeded();
     await getAddPriorOwnerShipExpButton().click();
     console.log("✅ Clicked 'Add Prior Ownership Experience' button");
     } else {
       console.log("⚠️  'Add Prior Ownership Experience' button NOT visible");
     }
      await wait(5000);
      if(DriverData["Model_Year"]){
        await addModelYear(page,DriverData["Model_Year"]);
      }
      if(DriverData["Length(feet)"]){
        await addLength(page,DriverData["Length(feet)"]);
      }
      if(DriverData["Make"]){
        await addMake(page,DriverData["Make"]);
      }
      if(DriverData["Model"]){
        await addModel(page,DriverData["Model"]);
      }
      
      // Top Speed (Excel column: Top_Speed_(MPH))
      if(DriverData["Top_Speed_(MPH)"]){
        await addTopSpeed(page,DriverData["Top_Speed_(MPH)"]);
      }
      
      // Number of Years Owned (Excel column: Number_of_Years_Owned)
      if(DriverData["Number_of_Years_Owned"]){
        await addNoOfYearsOwned(page,DriverData["Number_of_Years_Owned"]);
      }

      // 📸 Capture Driver Experience tab after filling
      await captureFullPage2D(page, testInfo, `Driver ${driverCount} Experience Tab`, "#centerPanel");
      console.log(`✅ Captured Driver Experience for ${driverLabel}`);
      
      // 📸 Navigate to and capture Driver Addresses tab
      if (await isElementVisible(getDriverAddressessTab())) {
        console.log(`📸 Switching to Addresses tab for ${driverLabel}...`);
        await getDriverAddressessTab().click({ force: true });
        await wait(2000);
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
        await captureFullPage2D(page, testInfo, `Driver ${driverCount} Addresses Tab`, "#centerPanel");
        console.log(`✅ Captured Addresses for ${driverLabel}`);
        await wait(2000);
        await clickMotorVehicleRecordButton();
        await wait(5000);
        await captureFullPage2D(page, testInfo, `Driver ${driverCount} Motor Vehicle Record Tab`, "#centerPanel");

        // Return to Contact tab for next driver (if any)
        await getContactTab().click({ force: true });
        await wait(1000);
      }
      console.log(`✅ Completed ${driverLabel} with full capture`);
    }
  }
  console.log("\=============================================================");
  console.log(`\n✅ Total drivers processed: ${driverCount}`);
  
  // Capture final screenshot
  //await wait(2000);
                                                                                                                
  //await captureFullPage2D(page, testInfo, "FillAllDriversExperienceCorePage", "#centerPanel");
  
  // Click Save and Next
  await getDriversSaveandNextOption().click({timeout: TIMEOUT_8_SECONDS});
  await wait(TIMEOUT_8_SECONDS);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    console.log("🔍 Performing rule-based validation for Drivers...");
        const validationResult = await validateRulesForTestCase(
          testCaseId, 
          blockingContext,
          ruleMatrix,
          page,
          testInfo
        );
        
        console.log("Driver validation result:", validationResult);
        
        if (await isElementVisible(getWarningMsgCore())) {
          await captureFullPage2D(page, testInfo, "Warnings In Drivers Page", "#centerPanel");
          await getDriversSaveandNextOption().click({ timeout: 4000 });
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