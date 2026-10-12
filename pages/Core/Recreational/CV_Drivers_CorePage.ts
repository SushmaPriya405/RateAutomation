import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
} from "../../../utils/locator-utils";
import {
  click,
  clear,
  fill,
  wait,
  reloadPage,
  excelDateToJSDate
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
import { selectDropdownCore, selectYesNoRadioCore } from "../../../utils/question-helper";
//import { get } from "http";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../../utils/wordingValidation";
import { validateRulesForTestCase, ValidationResult } from "../../../utils/coreRuleBasedValidation";
import { selectSameAddressAs } from "./BT_Drivers_CorePage";

const getAddDriverButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver']");
const getExistingDriverButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:AddExistingContact-itemEl']");
const getexistingDriverName = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:AddExistingContact:0:UnassignedDriver-itemEl']");
const getGender = () => getLocator("//label[contains(text(), 'Gender')]//parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getMaritalStatus = () => getLocator("//label[contains(text(), 'Marital Status')]//parent::td/parent::tr//div[contains(@class,' x-form-arrow-trigger')]");
const getCompanyPrimaryContactYes = () => getLocator("//label[contains(text(), 'Company Primary Contact')]//parent::td/parent::tr//td[contains(@class,'x-form-checkboxgroup-body')]//label[contains(text(),'Yes')]");
const getCompanyPrimaryContactNo = () => getLocator("//label[contains(text(), 'Company Primary Contact')]//parent::td/parent::tr//td[contains(@class,'x-form-checkboxgroup-body')]//label[contains(text(),'No')]");
const getDriversSaveandNextOption = () => getLocator('//span[contains(@id,"PADriversScreen") and contains(text(), "Drivers")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getYesLicensed = () => getLocator("//label[contains(text(), 'Licensed')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoLicensed = () => getLocator("//label[contains(text(), 'Licensed')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getLicenseState = () => getLocator("//label[contains(text(), 'License State')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getLicenseNumber = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:PolicyContactDetailsDV:LicenseInputSet:LicenseNumber-inputEl']");
const getContactTab = () => getLocator("//span[contains(text(),'Contact')]/parent::span/parent::span/parent::a[contains(@id,'DriverDetailsCV:PolicyContactDetailCardTab')]");
const getDriverExperienceButton = () => getLocator("//span[contains(text(),'Driver Experience')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:RolesCardTab']");
const getDriverAddressessTab = () => getLocator("//span[contains(text(),'Addresses')]/parent::span/parent::span/parent::a[contains(@id,'DriverDetailsCV:AddressDetailCardTab')]");
const getMotorVehicleRecordTab = () => getLocator("//span[contains(text(),'Motor Vehicle Record')]/parent::span/parent::span/parent::a[contains(@id,'DriverDetailsCV:MVRDetailCardTab')]");
const getAddressDropdown = () => getLocator("//a[@id='NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:LinkAddressMenuMenuIcon']");
const getAddressDriverName = () => getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:0:contactDetail-textEl']");
const getAddressFromDriver = () => getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:0:contactDetail:PrimaryAddress-textEl']");
const getNewDriverOkButton = () => getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:Validate-btnInnerEl']");
const getDateCompletedSafetyCourse = () => getLocator(" //tr[.//div[normalize-space()='Date Completed Safety Course']]/td[contains(@class, 'g-cell-edit')]");
const getSafetyCourseType = () => getLocator("//div[contains(text(),'Safety Course Type')]/ancestor::tr/td[contains(@class,'g-cell-edit')]");
const getNoOfAccidents = () => getLocator("//label[contains(text(), 'Number of Accidents')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getContactDetail = () => getLocator("//span[contains(text(),'Contact Detail')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:PolicyContactDetailCardTab']");
const getNoOfViolations = () => getLocator("//label[contains(text(), 'Number of Violations')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getYesDriverIneligibility = () => getLocator("//div[contains(text(), 'Is this driver ineligible?')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoDriverIneligibility = () => getLocator("//div[contains(text(), 'Is this driver ineligible?')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getDriverMemberOfAssociation = () => getLocator("//div[contains(text(), 'Is the driver a member of any of the following associations?')]//parent::td/parent::tr//td[contains(@class, 'x-grid-cell-last  g-cell-edit')]");
const getNoOfBoatingExperiences = () => getLocator("//div[contains(text(), 'Years of Boating Experience')]//parent::td/parent::tr//td[contains(@class, 'x-grid-cell-last')]");
const getMiddleName = () => getLocator("//input[contains(@id,'MiddleName-inputEl')]");
const getFirstName = () => getLocator("//input[contains(@id,'FirstName-inputEl')]");
const getLastName = () => getLocator("//input[contains(@id,'LastName-inputEl')]");
const getDateOfBirth = () => getLocator("//input[contains(@id,'DateOfBirth-inputEl')]");
const getPrimaryPhone = () => getLocator("//label[contains(text(), 'Primary Phone')]//parent::td/parent::tr//div[contains(@class,' x-form-arrow-trigger')]");
const getHomePhone = () => getLocator("//input[contains(@id,'HomePhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl')]");
const getWorkPhone = () => getLocator("//input[contains(@id,'WorkPhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl')]");
const getMobilePhone = () => getLocator("//input[contains(@id,'CellPhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl')]");
const getFaxPhone = () => getLocator("//input[contains(@id,'FaxPhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl')]");
const getRelationshiptoPrimaryInsured = () => getLocator("//label[contains(text(), 'Relationship to Primary Insured')]//parent::td/parent::tr//div[contains(@class,' x-form-arrow-trigger')]");
const getAddressArrowIcon = () => getLocator("//a[contains(@id,'LinkedAddressInputSet:LinkAddressMenu:LinkAddressMenuMenuIcon')]");
const getAddressSameNameButton = () => getLocator("//a[contains(@id,'NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:0:contactDetail-itemEl')]");
const getAddressAddressButton = () => getLocator("//a[contains(@id,'NewPolicyDriverPopup:ContactDetailScreen:NewPolicyContactRoleDetailsCV:PolicyContactDetailsDV:LinkedAddressInputSet:LinkAddressMenu:0:contactDetail:PrimaryAddress-itemEl')]");
const getOKNewDriverButton = () => getLocator("//span[contains(@id,'NewPolicyDriverPopup:ContactDetailScreen:Validate-btnInnerEl')]/parent::span/parent::span/parent::a");
const getNewPersonButton = () => getLocator("//a[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:0:ContactType-itemEl')]");
const getDriverAddressButton = () => getLocator("//span[contains(text(),'Addresses')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:AddressDetailCardTab']");
const getMotorVehicleRecordButton = () => getLocator("//span[contains(text(),'Motor Vehicle Record')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:MVRDetailCardTab']");
const getDriverTitle = () => getLocator("//span[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:0')]");

// Missing column locators
const getSafetyCourseRefresherTDClick = ()  => getLocator("//div[normalize-space()='Date Completed Safety Course Refresher']//parent::td/following-sibling::td");
const getSafetyCourseRefresher = () => getLocator("//div[normalize-space()='Date Completed Safety Course Refresher']/ancestor::div/following-sibling::div//input");
const getForeignLicenseState = () => getLocator("//label[contains(text(), 'Foreign License State')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getYesExcludedDriver = () => getLocator("//div[contains(text(), 'Excluded Driver')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoExcludedDriver = () => getLocator("//div[contains(text(), 'Excluded Driver')]//parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesCourtMandatedCourse = () => getLocator("//div[contains(text(), 'Court Mandated Course')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoCourtMandatedCourse = () => getLocator("//div[contains(text(), 'Court Mandated Course')]//parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesSafetyCourseRefresher = () => getLocator("//div[contains(text(), 'Safety Course Refresher')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoSafetyCourseRefresher = () => getLocator("//div[contains(text(), 'Safety Course Refresher')]//parent::td/parent::tr//td//label[contains(text(),'No')]");
const getDateFirstLicensed = () => getLocator("//input[contains(@id,'DateFirstLicensed-inputEl')]");
const getDateFirstLicensedUSOrCanada = () => getLocator("//tr[td/div[normalize-space()='Date first licensed in the US or Canada']]//td[.//div[normalize-space()='Date first licensed in the US or Canada']]/following-sibling::td");
const getDateFirstLicensedUSOrCanadaInput = () => getLocator("//tr[td/div[normalize-space()='Date first licensed in the US or Canada']]//following::input[@placeholder='MM/dd/yyyy']");
const getMonthsLicensedDifferentCountry = () => getLocator("//input[contains(@id,'MonthsLicensedDifferentCountry-inputEl')]");
const getYesGoodDriverDiscount = () => getLocator("//div[contains(text(), 'Good Driver Discount')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoGoodDriverDiscount = () => getLocator("//div[contains(text(), 'Good Driver Discount')]//parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesActiveMilitary = () => getLocator("//div[contains(normalize-space(),'Per Louisiana Regulation, is the applicant currently on active duty')]/ancestor::tr//label[normalize-space()='Yes']/preceding-sibling::input");
const getNoActiveMilitary = () => getLocator("//div[contains(normalize-space(),'Per Louisiana Regulation, is the applicant currently on active duty')]/ancestor::tr//table[contains(@class,'gw-radio-group-cell')]//label[normalize-space()='No']/preceding-sibling::input");
const getYesGoodStudent = () => getLocator("//div[contains(text(), 'Good Student')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoGoodStudent = () => getLocator("//div[contains(text(), 'Good Student')]//parent::td/parent::tr//td//label[contains(text(),'No')]");
const getMilesPerYearDriven = () => getLocator("//label[contains(text(), 'Miles Per Year Driven')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");

const getNewPerson = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:0:ContactType-itemEl']");
async function clickAddDriverButton() {
  await getAddDriverButton().click({ force: true });
}
async function fillFirstName(name: string) {
  await getFirstName().click({ force: true });
  await fill(getFirstName(), name);
  await wait(2000);
}
async function fillLastName(name: string) {
  await getLastName().click({ force: true });
  await fill(getLastName(), name);
  await wait(2000);
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


async function selectSameAddress() {
  await getAddressArrowIcon().click();
  await wait(1000);
  await getAddressSameNameButton().click();
  await wait(1000);
  await getAddressAddressButton().click();
}

async function selectPrimaryPhone(page: Page, value: any) {
  if (!(await isElementVisible(getPrimaryPhone()))) {
    console.log(`⚠️ Primary Phone field not visible, skipping...`);
    return;
  }
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getPrimaryPhone().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectPrimaryPhone: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectPrimaryPhone: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectRelationshipToPrimaryInsured(page: Page, value: any) {
  if (!(await isElementVisible(getRelationshiptoPrimaryInsured()))) {
    console.log(`⚠️ Relationship to Primary Insured field not visible, skipping...`);
    return;
  }
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getRelationshiptoPrimaryInsured().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectRelationshiptoPrimaryInsured: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectRelationshiptoPrimaryInsured: option '${value}' not found after ${maxAttempts} attempts`);
}

async function fillHomePhoneNumber(number: number) {
  await getHomePhone().click({ force: true });
  await wait(3000);
  await fill(getHomePhone(), number.toString());
  await wait(2000);
  await fill(getHomePhone(), number.toString());
}
async function fillMobilePhoneNumber(number: number) {
  await getMobilePhone().click({ force: true });
  await fill(getMobilePhone(), number.toString());
  await wait(2000);
}
async function fillWorkPhoneNumber(phoneNumber: string) {
  await getWorkPhone().scrollIntoViewIfNeeded();
  await wait(500);
  await getWorkPhone().click({force: true});
  await wait(500);
  
  // Clear field first
  await getWorkPhone().clear();
  await wait(500);
  
  // Convert to string to handle numbers from Excel
  const phoneNumberString = String(phoneNumber);
  console.log(`📝 Typing Work Phone sequentially: ${phoneNumberString}`);
  
  // Use pressSequentially for natural typing behavior
  await getWorkPhone().pressSequentially(phoneNumberString, { delay: 100 });
  await wait(1000);
  
  // Press Tab to commit the value
  await getWorkPhone().press('Tab');
  await wait(500);
  
  // Verify value persisted
  try {
    const filledValue = await getWorkPhone().inputValue({ timeout: 3000 });
    console.log(`✅ Work Phone value after fill: ${filledValue}`);
    
    // Only retry if the field is empty
    if (!filledValue || filledValue.trim() === '') {
      console.log(`⚠️ Work Phone is EMPTY, retrying with slower typing...`);
      await getWorkPhone().click({force: true});
      await wait(500);
      await getWorkPhone().clear();
      await wait(500);
      await getWorkPhone().pressSequentially(phoneNumberString, { delay: 150 });
      await wait(1000);
      await getWorkPhone().press('Tab');
      await wait(500);
      
      const retryValue = await getWorkPhone().inputValue({ timeout: 3000 });
      console.log(`✅ Work Phone value after retry: ${retryValue}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not verify Work Phone value: ${error}, continuing...`);
  }
}
async function fillFaxPhoneNumber(number: number) {
  await getFaxPhone().click({ force: true });
  await fill(getFaxPhone(), number.toString());
  await wait(2000);
}

async function clickExistingDriverButton() {
  await getExistingDriverButton().click({ force: true });
}

async function clickExistingDriverNameButton() {
  await getexistingDriverName().click({ force: true });
}

async function clickExistingDriverAndEnsureContact(page: Page, maxVerifyAttempts: number = 4) {
  // Click sequence to choose an existing driver and ensure Contact tab appears
  await clickAddDriverButton();
  await wait(2000);
  await clickExistingDriverButton();
  await wait(2000);
  await clickExistingDriverNameButton();
  await wait(2000);

  // Verify Contact tab is visible and active; retry clicking the selected name if not
  for (let attempt = 1; attempt <= maxVerifyAttempts; attempt++) {
    try {
      if (await isElementVisible(getContactTab(), { timeout: 1000 })) {
        const tab = getContactTab();
        const cls = await tab.getAttribute('class').catch(() => '');
        if (cls && cls.includes('x-tab-active')) {
          console.log(`✅ Contact tab visible and active on attempt ${attempt}`);
          return;
        }

        // If visible but not active, try activating it
        await tab.click({ force: true }).catch(() => undefined);
        await wait(800);
        const cls2 = await tab.getAttribute('class').catch(() => '');
        if (cls2 && cls2.includes('x-tab-active')) {
          console.log(`✅ Contact tab activated on attempt ${attempt}`);
          return;
        }
      }
    } catch (err) {
      // ignore and retry
    }

    console.log(`⚠️ Contact tab not present/active yet (attempt ${attempt}), retrying click on existing driver name`);
    // retry selecting the existing driver name to trigger the details pane
    await clickExistingDriverNameButton().catch(() => undefined);
    await wait(1000 + attempt * 500);
  }

  throw new Error('Contact tab did not become visible/active after selecting existing driver');
}

async function selectGender(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getGender().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectGender: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectMake: option '${value}' not found after ${maxAttempts} attempts`);
}

async function selectMaritalStatus(page: Page, value: any) {
  if (!(await isElementVisible(getMaritalStatus()))) {
    console.log(`⚠️ Marital Status field not visible, skipping...`);
    return;
  }
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getMaritalStatus().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectMaritalStatus: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectMaritalStatus: option '${value}' not found after ${maxAttempts} attempts`);
}
async function clickDriverAddressButton() {
  await getDriverAddressButton().click({ force: true });
}
async function clickMotorVehicleRecordButton() {
  await getMotorVehicleRecordButton().click({ force: true });
}

async function selectLicenseState(page: Page, value: any) {
  if (!(await isElementVisible(getLicenseState()))) {
    console.log(`⚠️ License State field not visible, skipping...`);
    return;
  }
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getLicenseState().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectLicenseState: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectLicenseState: option '${value}' not found after ${maxAttempts} attempts`);
}

async function fillLicenseValue(page: Page, number: string) {
  await getLicenseNumber().click({ force: true });
  await wait(2000);
  await getLicenseNumber().type(number.toString(), { delay: 1000 }); // types slowly like a user

  await wait(5000);

}

async function clickDriverExperienceButton() {
  await getDriverExperienceButton().click({ force: true });
}

async function selectNoOfAccident(page: Page, value: any) {
  if (!(await isElementVisible(getNoOfAccidents()))) {
    console.log(`⚠️ Number of Accidents field not visible, skipping...`);
    return;
  }
  console.log(`Selecting Number of Accidents: ${value}`);
  await getNoOfAccidents().scrollIntoViewIfNeeded();
  await getNoOfAccidents().click({ force: true });
  await wait(3000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}

async function selectNoOfViolation(page: Page, value: any) {
  if (!(await isElementVisible(getNoOfViolations()))) {
    console.log(`⚠️ Number of Violations field not visible, skipping...`);
    return;
  }
  console.log(`Selecting Number of Violations: ${value}`);
  await getNoOfViolations().scrollIntoViewIfNeeded();
  await getNoOfViolations().click({ force: true });
  await wait(3000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const firstvalue = optionLocator.nth(1);
  await firstvalue.click({ force: true });
}

async function clickNewPersonButton(page: Page) {
  await getAddDriverButton().click({force: true});
  await getNewPersonButton().click({force: true});
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
}

async function fillHomePhone(phoneNumber: string) {
  await getHomePhone().scrollIntoViewIfNeeded();
  await wait(500);
  await getHomePhone().click({force: true});
  await wait(500);
  
  // Clear field first
  await getHomePhone().clear();
  await wait(500);
  
  // Convert to string to handle numbers from Excel
  const phoneNumberString = String(phoneNumber);
  console.log(`📝 Typing Home Phone sequentially: ${phoneNumberString}`);
  
  // Use pressSequentially for natural typing behavior
  await getHomePhone().pressSequentially(phoneNumberString, { delay: 100 });
  await wait(1000);
  
  // Press Tab to commit the value
  await getHomePhone().press('Tab');
  await wait(500);
  
  // Verify value persisted
  try {
    const filledValue = await getHomePhone().inputValue({ timeout: 3000 });
    console.log(`✅ Home Phone value after fill: ${filledValue}`);
    
    // Only retry if the field is empty
    if (!filledValue || filledValue.trim() === '') {
      console.log(`⚠️ Home Phone is EMPTY, retrying with slower typing...`);
      await getHomePhone().click({force: true});
      await wait(500);
      await getHomePhone().clear();
      await wait(500);
      await getHomePhone().pressSequentially(phoneNumberString, { delay: 150 });
      await wait(1000);
      await getHomePhone().press('Tab');
      await wait(500);
      
      const retryValue = await getHomePhone().inputValue({ timeout: 3000 });
      console.log(`✅ Home Phone value after retry: ${retryValue}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not verify Home Phone value: ${error}, continuing...`);
  }
}

async function fillMobilePhone(phoneNumber: string) {
  await getMobilePhone().scrollIntoViewIfNeeded();
  await wait(500);
  await getMobilePhone().click({force: true});
  await wait(500);
  
  // Clear field first
  await getMobilePhone().clear();
  await wait(500);
  
  // Convert to string to handle numbers from Excel
  const phoneNumberString = String(phoneNumber);
  console.log(`📝 Typing Mobile Phone sequentially: ${phoneNumberString}`);
  
  // Use pressSequentially for natural typing behavior
  await getMobilePhone().pressSequentially(phoneNumberString, { delay: 100 });
  await wait(1000);
  
  // Press Tab to commit the value
  await getMobilePhone().press('Tab');
  await wait(500);
  
  // Verify value persisted
  try {
    const filledValue = await getMobilePhone().inputValue({ timeout: 3000 });
    console.log(`✅ Mobile Phone value after fill: ${filledValue}`);
    
    // Only retry if the field is empty
    if (!filledValue || filledValue.trim() === '') {
      console.log(`⚠️ Mobile Phone is EMPTY, retrying with slower typing...`);
      await getMobilePhone().click({force: true});
      await wait(500);
      await getMobilePhone().clear();
      await wait(500);
      await getMobilePhone().pressSequentially(phoneNumberString, { delay: 150 });
      await wait(1000);
      await getMobilePhone().press('Tab');
      await wait(500);
      
      const retryValue = await getMobilePhone().inputValue({ timeout: 3000 });
      console.log(`✅ Mobile Phone value after retry: ${retryValue}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not verify Mobile Phone value: ${error}, continuing...`);
  }
}

async function selectCompanyPrimaryContact(page: Page, value: any = "No") {
  // Company Primary Contact is a Yes/No radio button
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

// async function selectSameAddressAs(page: Page) {
//   // Click the Address dropdown
//   await getAddressDropdown().scrollIntoViewIfNeeded();
//   await wait(500);
//   await getAddressDropdown().click({ force: true });
//   await getAddressDriverName().click({ force: true });
//   await getAddressFromDriver().click({ force: true });
//   await wait(1000);
//   console.log(`✅ Selected Address from dropdown of (first Driver)`);
// }

async function clickNewPersonOkButton(page: Page) {
  // Click OK/Update button to finalize adding the new person
  await getNewDriverOkButton().scrollIntoViewIfNeeded();
  await wait(500);
  await getNewDriverOkButton().click({ force: true });
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(2000);
  console.log(`✅ Clicked OK to add new person`);
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

async function selectMembersOfAssociations(page: Page, value: any) {
  if (!(await isElementVisible(getDriverMemberOfAssociation()))) {
    console.log(`⚠️ Members of Associations field not visible, skipping...`);
    return;
  }
  await getDriverMemberOfAssociation().scrollIntoViewIfNeeded();
  await getDriverMemberOfAssociation().click({force: true});
  await wait(3000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}

async function selectAssociationDiscountDropdown(page: Page, value: any) {
  if (!value) {
    console.log(`⚠️ No value provided for AssociationDiscount, skipping...`);
    return;
  }

  const questionText = "Is the driver a member of any of the following associations?  If so, select one.";
  
  // Locate the cell containing the dropdown for associations question
  // Use more specific XPath with direct child selector /td instead of //td
  const cellLocator = getLocator(
    `//tr[.//div[contains(text(), '${questionText}')]]/td[contains(@class, 'g-cell-edit')]`
  ).first();

  try {
    // Check if cell exists
    const cellExists = await cellLocator.count().catch(() => 0) > 0;
    console.log(`[DEBUG selectAssociationDiscountDropdown] Cell exists: ${cellExists}`);

    if (!cellExists) {
      console.log(`❌ AssociationDiscount cell not found in DOM`);
      return;
    }

    // Scroll into view
    await cellLocator.scrollIntoViewIfNeeded({ timeout: 2000 });
    console.log(`✅ Scrolled AssociationDiscount cell into view`);
    await wait(250);

    // Click the cell multiple times to open dropdown
    const maxAttempts = 8;
    const attemptDelay = 500;

    for (let i = 1; i <= maxAttempts; i++) {
      console.log(`[DEBUG] AssociationDiscount: Attempt ${i}/${maxAttempts} - clicking cell...`);
      await cellLocator.click({ force: true }).catch(() => {});
      await wait(120);

      // Check for dropdown options
      const optionsLocator = getLocator(`//ul[contains(@class,'x-list-plain')]//li`);
      const optionElements = await optionsLocator.all();
      const optionTexts = await Promise.all(
        optionElements.map(opt => opt.textContent().then(txt => txt?.trim() ?? ''))
      );

      console.log(`🔽 Available options on attempt ${i}:`, optionTexts);

      // Try to find and click the matching option
      const optionLocator = getLocator(
        `//ul[contains(@class,'x-list-plain')]//li[normalize-space(text())='${value}']`
      );

      try {
        await optionLocator.waitFor({ state: "visible", timeout: 1000 });
        console.log(`✅ Found option '${value}', clicking...`);
        await optionLocator.click({ force: true });
        console.log(`✅ Successfully selected '${value}' for AssociationDiscount on attempt ${i}`);
        return;
      } catch (err) {
        console.log(`[DEBUG] Option '${value}' not found on attempt ${i}, retrying...`);
        await wait(attemptDelay);
      }
    }

    console.log(`❌ Failed to select '${value}' for AssociationDiscount after ${maxAttempts} attempts`);
  } catch (error) {
    console.error(`❌ Error in selectAssociationDiscountDropdown:`, error);
  }
}
async function selectBoatingExperience(page: Page, value: any) {
  if (!(await isElementVisible(getNoOfBoatingExperiences()))) {
    console.log(`⚠️ Boating Experience field not visible, skipping...`);
    return;
  }
  await getNoOfBoatingExperiences().scrollIntoViewIfNeeded();
  await wait(1000);
  
  // Try multiple times to click and open the dropdown
  const maxAttempts = 5;
  let dropdownOpened = false;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempting to open boating experience dropdown (attempt ${attempt})`);
    await getNoOfBoatingExperiences().click({force: true});
    await wait(1500);
    
    // Check if dropdown appeared
    const dropdownList = getLocator(`//ul[@class='x-list-plain']`);
    try {
      await dropdownList.waitFor({ state: "visible", timeout: 2000 });
      dropdownOpened = true;
      console.log(`✅ Dropdown opened on attempt ${attempt}`);
      break;
    } catch {
      console.log(`⚠️ Dropdown not visible on attempt ${attempt}, retrying...`);
    }
  }
  
  if (!dropdownOpened) {
    throw new Error("Failed to open boating experience dropdown after multiple attempts");
  }
  
  // Log available options for debugging
  const allOptions = await page.locator(`//ul[@class='x-list-plain']//li`).allTextContents();
  console.log(`Available boating experience options:`, allOptions);
  
  // Convert value to string for matching
  const valueStr = String(value);
  
  // Try exact match first
  let optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueStr}']`);
  
  try {
    await optionLocator.waitFor({ state: "visible", timeout: 2000 });
    await click(optionLocator);
    console.log(`✅ Selected boating experience: '${valueStr}'`);
  } catch {
    // If exact match fails, try contains match
    console.log(`⚠️ Exact match failed, trying contains match for '${valueStr}'`);
    optionLocator = getLocator(`//ul[@class='x-list-plain']//li[contains(text(),'${valueStr}')]`);
    await click(optionLocator);
    console.log(`✅ Selected boating experience (contains match): '${valueStr}'`);
  }
}

async function fillDateCompletedSafetyCourse(page: Page, date: string) {
  const cellLocator = getDateCompletedSafetyCourse();
  
  try {
    // Scroll and click the cell to activate editing
    await cellLocator.scrollIntoViewIfNeeded();
    await wait(1000);

    // Wait for the input field to appear inside the cell
    const inputLocator = page.locator("//tr[.//div[normalize-space()='Date Completed Safety Course']] //following::input[@placeholder='MM/dd/yyyy'][1]");
    
    // Try clicking and checking for inputLocator visibility up to 3 attempts
    const maxAttempts = 3;
    let inputVisible = false;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Attempting to activate Date Completed Safety Course input (attempt ${attempt}/${maxAttempts})`);
      await cellLocator.click({ force: true });
      await wait(2000);
      
      // Check if inputLocator is visible
      try {
        await inputLocator.waitFor({ state: "visible", timeout: 2000 });
        inputVisible = true;
        console.log(`✅ Input field visible on attempt ${attempt}`);
        break;
      } catch {
        console.log(`⚠️ Input field not visible on attempt ${attempt}, retrying...`);
        if (attempt < maxAttempts) {
          await wait(500);
        }
      }
    }
    
    if (!inputVisible) {
      throw new Error("Input field for Date Completed Safety Course did not appear after 3 attempts");
    }
    
    // Clear the input field
    await inputLocator.clear();
    await wait(300);
    
    // Fill the date using pressSequentially for better reliability
    await inputLocator.pressSequentially(date, { delay: 100 });
    await wait(300);
    
    // Press Tab to confirm and move to next field
    await inputLocator.press('Tab');
    await wait(500);
    
    console.log(`✅ Filled Date Completed Safety Course: ${date}`);
  } catch (error) {
    console.error(`❌ Error filling Date Completed Safety Course:`, error);
    throw error;
  }
}

async function selectSafetyCourseType(page: Page, value: any) {
  if (!(await isElementVisible(getSafetyCourseType()))) {
    console.log(`⚠️ Safety Course Type field not visible, skipping...`);
    return;
  }
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await getSafetyCourseType().scrollIntoViewIfNeeded();
  await wait(500);
  await getSafetyCourseType().click({ force: true });
  await wait(1000);
  await click(optionLocator);
  console.log(`✅ Selected Safety Course Type: ${value}`);
}

async function selectForeignLicenseState(page: Page, value: any) {
  if (!(await isElementVisible(getForeignLicenseState()))) {
    console.log(`⚠️ Foreign License State field not visible, skipping...`);
    return;
  }
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await getForeignLicenseState().click({ force: true }).catch(() => { });

    try {
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      await click(optionLocator);
      console.log(`✅ Selected Foreign License State: ${value}`);
      return;
    } catch {
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectForeignLicenseState: option '${value}' not found after ${maxAttempts} attempts`);
}

async function fillDateFirstLicensed(date: string) {
  if (!(await isElementVisible(getDateFirstLicensed()))) {
    console.log(`⚠️ Date First Licensed field not visible, skipping...`);
    return;
  }
  await getDateFirstLicensed().click({ force: true });
  await wait(2000);
  await getDateFirstLicensed().pressSequentially(date, { delay: 1000 }); // types slowly like a user
  await getDateFirstLicensed().press('Tab');
  await wait(5000);
  console.log(`✅ Filled Date First Licensed: ${date}`);
}

async function fillDateFirstLicensedUSOrCanada(date: string) {
  if (!(await isElementVisible(getDateFirstLicensedUSOrCanada()))) {
    console.log(`⚠️ Date First Licensed US or Canada field not visible, skipping...`);
    return;
  }
  await getDateFirstLicensedUSOrCanada().scrollIntoViewIfNeeded();
  await getDateFirstLicensedUSOrCanada().click({force: true});
  await getDateFirstLicensedUSOrCanadaInput().clear();
  await getDateFirstLicensedUSOrCanadaInput().pressSequentially(date, { delay: 100 });
  await wait(500);
  console.log(`✅ Filled Date First Licensed US or Canada: ${date}`);
}

async function fillMonthsLicensedDifferentCountry(months: string) {
  if (!(await isElementVisible(getMonthsLicensedDifferentCountry()))) {
    console.log(`⚠️ Months Licensed Different Country field not visible, skipping...`);
    return;
  }
  await getMonthsLicensedDifferentCountry().scrollIntoViewIfNeeded();
  await getMonthsLicensedDifferentCountry().click({force: true});
  await getMonthsLicensedDifferentCountry().clear();
  await getMonthsLicensedDifferentCountry().pressSequentially(months, { delay: 100 });
  await wait(500);
  console.log(`✅ Filled Months Licensed Different Country: ${months}`);
}

async function enterSafetyCourseRefresherDate(page: Page, date: string) {
  if(!date){
    console.log("No date provided for Safety Course Refresher, skipping this step.");
    return;
  }
  if(await isElementVisible(getSafetyCourseRefresherTDClick())){
      date=formatToMMDDYYYY(excelDateToJSDate(date));
      await getSafetyCourseRefresherTDClick().click({ force: true });
      await wait(2000);
      await getSafetyCourseRefresher().pressSequentially(date, { delay: 1000 }); // types slowly like a user
      await getSafetyCourseRefresher().press('Tab');
  }

  await wait(5000);
}

async function selectMilesPerYearDriven(page: Page, value: any) {
  await selectDropdownCore(page, "Miles Per Year Driven", value);
}

async function selectMotorcycleLicense(page: Page, value: any = "No") {
  await selectYesNoRadioCore(page, "Motorcycle License", value);
}

async function selectForeignLicenseStateYesNo(page: Page, value: any = "No") {
  await selectYesNoRadioCore(page, "Foreign License State", value);
}

async function selectActiveMilitaryLouisiana(page: Page, value: any = "No") {
  // Per Louisiana Regulation, is the applicant currently on active duty, permanently based in Louisiana, and qualifies as "active military personnel"?
  
  if (value === "Yes") {
    if (!(await isElementVisible(getYesActiveMilitary()))) {
      console.log(`⚠️ Active Military Yes option not visible, skipping...`);
      return;
    }
    await getYesActiveMilitary().scrollIntoViewIfNeeded();
    await getYesActiveMilitary().click({ force: true });
    console.log(`✅ Selected Active Military (Louisiana): Yes`);
  } else {
    if (!(await isElementVisible(getNoActiveMilitary()))) {
      console.log(`⚠️ Active Military No option not visible, skipping...`);
      return;
    }
    await getNoActiveMilitary().scrollIntoViewIfNeeded();
    await getNoActiveMilitary().click({ force: true });
    console.log(`✅ Selected Active Military (Louisiana): No`);
  }
}

async function clickAddDriverAndNewPersonWithRetry(page: Page, maxAttempts: number = 5) {
  const popupElement = getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:ttlBar']");
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Adding driver - New Person popup attempt ${attempt}/${maxAttempts}`);
    
    try {
      await clickAddDriverButton();
      await wait(2000);
      await clickNewPersonButton(page);
      await wait(2000);
      
      // Check if the popup element is visible
      const isPopupVisible = await isElementVisible(popupElement);
      
      if (isPopupVisible) {
        console.log(`✅ New Person popup successfully opened on attempt ${attempt}`);
        return;
      } else {
        console.log(`⚠️ New Person popup not visible on attempt ${attempt}, retrying...`);
        
        // If not the last attempt, retry
        if (attempt < maxAttempts) {
          await wait(1000);
        }
      }
    } catch (error) {
      console.log(`⚠️ Error on attempt ${attempt}: ${error}`);
      if (attempt < maxAttempts) {
        await wait(1000);
      }
    }
  }
  
  throw new Error(`Failed to open New Person popup after ${maxAttempts} attempts. Element //span[@id='NewPolicyDriverPopup:ContactDetailScreen:ttlBar'] is not visible.`);
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
        await clickExistingDriverAndEnsureContact(page);
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
        await clickAddDriverAndNewPersonWithRetry(page);
        
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

        if(DriverData["Gender"] && await isElementVisible(getGender())) {
          await selectDropdownCore(page, "Gender", DriverData["Gender"]);
        }
        
        // Fill Marital Status for new driver (after DOB)
        if(DriverData["Marital_Status"]) {
          await selectDropdownCore(page, "Marital_Status", DriverData["Marital_Status"]);
        }
        
        // Fill Primary Phone for new driver (after Marital Status)
        if(DriverData["Phone_Type"]) {
          await selectPrimaryPhone(page, DriverData["Phone_Type"]);
        }

        if (DriverData["Phone_Type"] === "Work") {
            await fillWorkPhoneNumber(DriverData["Phone_Number"]);
        }
        
        // Fill Home Phone for new driver (after Primary Phone)
        if(DriverData["Phone_Number"] && DriverData["Phone_Type"] === "Home") {
          await fillHomePhone(DriverData["Phone_Number"]);
        }

        if(DriverData["Phone_Number"] && DriverData["Phone_Type"] === "Mobile") {
          await fillMobilePhone(DriverData["Phone_Number"]);
        }
        
        // Fill Relationship to Primary Insured for new driver
        if(DriverData["Relationship_to_Primary_Insured"]) {
          await selectDropdownCore(page, "Relationship_to_Primary_Insured", DriverData["Relationship_to_Primary_Insured"]);
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
      await wait(4000);
      
      // Fill Marital Status for Driver 1 (already filled for Driver 2+ above)
      if(driverCount === 1 && DriverData["Marital_Status"]) {
        await selectDropdownCore(page, "Marital_Status", DriverData["Marital_Status"]);
      }
      
      // Primary Phone is filled by default for Driver 1, only fill for Driver 2+ (already done above)
      
      if(DriverData["Licensed"]){
        await selectYesNoRadioCore(page, "Licensed", DriverData["Licensed"]);
      }
      
      if(DriverData["License_State"]) {
        const fullStateName = getFullStateName(DriverData["License_State"]);
        console.log(`   License State: ${DriverData["License_State"]} → ${fullStateName}`);
        await selectLicenseState(page, fullStateName);
      }
      
      if(DriverData["License_Number"]) {
        await fillLicenseValue(page, DriverData["License_Number"]);
      }
      
      // Fill Foreign License State if available
      if(DriverData["Foreign_License_State?"]) {
        await selectForeignLicenseState(page, DriverData["Foreign_License_State?"]);
      }
      
      // Fill Date First Licensed if available
      if(DriverData["DateFirstLicensed"]) {
        const dateValue = formatToMMDDYYYY(DriverData["DateFirstLicensed"]);
        await fillDateFirstLicensed(dateValue);
      }

      if(DriverData["Marital_Status"]) {
          await selectDropdownCore(page, "Marital_Status", DriverData["Marital_Status"]);
        }
      
      await captureFullPage2D(page, testInfo, `Driver ${driverCount} Contact Detail Tab`,"#centerPanel");
      await wait(3000);
      
      // Fill driver experience details
      console.log(`📝 Filling driver experience for ${driverLabel}...`);
      await clickDriverExperienceButton();
      await wait(5000);
      
      // Fill IneligibleDriver option
      if(DriverData["IneligibleDriver"]) {
        await wait(2000);
        await selectYesNoRadioCore(page, "IneligibleDriver", DriverData["IneligibleDriver"]);
      } else {
        await selectYesNoRadioCore(page, "IneligibleDriver", "No");
      }
      await wait(1000);
      
      // Fill ExcludedDriver
      if(DriverData["ExcludedDriver"]) {
        await selectYesNoRadioCore(page, "ExcludedDriver", DriverData["ExcludedDriver"]);
      } else {
        await selectYesNoRadioCore(page, "ExcludedDriver", "No");
      }
      await wait(1000);
      
      // Fill Number of Accidents
      if(DriverData["NumberofAccidents"]?.toString() || DriverData["Number_of_Accidents"]?.toString()) {
        console.log(`Selecting Number of Accidents: ${DriverData["NumberofAccidents"]}`);
        await selectNoOfAccident(page, DriverData["NumberofAccidents"] || DriverData["Number_of_Accidents"]);
        await wait(1000);
      }
      else {
        // Default to 0 accidents if not specified
        // console.log(`No value provided for Number of Accidents`);
        // await selectNoOfAccident(page, '0');
        // await wait(1000);
      }
      
      // Fill Number of Violations
      if(DriverData["NumberofViolations"]?.toString() || DriverData["Number_of_Violations"]?.toString()) {
        console.log(`Selecting Number of Violations: ${DriverData["NumberofViolations"]}`);
        await selectNoOfViolation(page, DriverData["NumberofViolations"] || DriverData["Number_of_Violations"]);
        await wait(1000);
      } 
      // else {
      //   // Default to 0 violations if not specified
      //   await selectNoOfViolation(page, '0');
      //   await wait(1000);
      
      // }

      if(DriverData["AssociationDiscount"] )
      {
        await selectDropdownCore(page, "AssociationDiscount", DriverData["AssociationDiscount"]);
        await wait(1000);
        await selectAssociationDiscountDropdown(page, DriverData["AssociationDiscount"]);
        await wait(1000);
      }
      
      // Fill DateFirstLicensedUSOrCanada if available
      if(DriverData["DateFirstLicensedUSOrCanada"]) {
        const dateValue = formatToMMDDYYYY(DriverData["DateFirstLicensedUSOrCanada"]);
        await fillDateFirstLicensedUSOrCanada(dateValue);
        await wait(1000);
      }
      
      // Fill MonthsLicensedDifferentCountry if available
      if(DriverData["MonthsLicensedDifferentCountry"]) {
        await fillMonthsLicensedDifferentCountry(DriverData["MonthsLicensedDifferentCountry"].toString());
        await wait(1000);
      }
      
      
      // Date Completed Safety Course (if filled, Safety Course Type dropdown will appear)
      if(DriverData["DateCompletedSafetyCourse"]) {
        const safetyCourseDate = formatToMMDDYYYY(DriverData["DateCompletedSafetyCourse"]);
        await fillDateCompletedSafetyCourse(page, safetyCourseDate);
        await wait(3000); // Wait for Safety Course Type dropdown to appear
        
        // Fill Safety Course Type if it exists
        if(DriverData["SafetyCourseType"]) {
          await selectDropdownCore(page, "SafetyCourseType", DriverData["SafetyCourseType"]);
        }
      }

      // Fill CourtMandatedCourse
      if(DriverData["CourtMandatedCourse"]) {
        await selectYesNoRadioCore(page, "CourtMandatedCourse", DriverData["CourtMandatedCourse"]);
      } else {
        await selectYesNoRadioCore(page, "CourtMandatedCourse", "No");
      }
      await wait(1000);
      
      // Fill SafetyCourseRefresher
      if(DriverData["SafetyCourseRefresher"]) {
         await enterSafetyCourseRefresherDate(page, DriverData["SafetyCourseRefresher"]);
      } 
      await wait(1000);
      
      // Fill GoodDriverDiscount
      if(DriverData["GoodDriverDiscount"]) {
        await selectDropdownCore(page, "GoodDriverDiscount", DriverData["GoodDriverDiscount"]);
      } 
      await wait(1000);
      
      // Fill ActiveMilitary
      if(DriverData["ActiveMilitary"]) {
        await selectYesNoRadioCore(page, "ActiveMilitary", DriverData["ActiveMilitary"]);
      }
      await wait(1000);
      
      // Fill GoodStudent
      if(DriverData["GoodStudent"]) {
        await selectYesNoRadioCore(page, "GoodStudent", DriverData["GoodStudent"]);
      } 
      await wait(1000);
      
      // Fill MilesPerYearDriven if available
      if(DriverData["MilesPerYearDriven"]) {
        await selectYesNoRadioCore(page, "MilesPerYearDriven", DriverData["MilesPerYearDriven"]);
        await wait(1000);
      }
      
      
      // 📸 Capture Driver Experience tab after filling
      await captureFullPage2D(page, testInfo, `${driverLabel.replace(/\s+/g, '_')}_Experience Tab`,"#centerPanel");
      console.log(`✅ Captured Driver Experience for ${driverLabel}`);
      
      // 📸 Navigate to and capture Driver Addresses tab
      if (await isElementVisible(getDriverAddressessTab())) {
        console.log(`📸 Switching to Addresses tab for ${driverLabel}...`);
        await getDriverAddressessTab().click({ force: true });
        await wait(5000);
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
        await captureFullPage2D(page, testInfo, `${driverLabel.replace(/\s+/g, '_')}_Addresses Tab`,"#centerPanel");
        console.log(`✅ Captured Addresses for ${driverLabel}`);
        await getMotorVehicleRecordTab().click({ force: true });
        await wait(5000);
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
        await captureFullPage2D(page, testInfo, `${driverLabel.replace(/\s+/g, '_')}_Motor Vehicle Record Tab`,"#centerPanel");
        console.log(`✅ Captured Motor Vehicle Record for ${driverLabel}`);
        
        // Return to Contact tab for next driver (if any)
        await getContactTab().click({ force: true });
        await wait(1000);
      }
      
      console.log(`✅ Completed ${driverLabel} with full capture`);
    }
  }
  
  console.log(`\n✅ Total drivers processed: ${driverCount}`);
  
  // Capture final screenshot
  //await captureAndAttachforCore(page, testInfo, "FillAllDriversExperienceCorePage");
  
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
        
        if (await isElementVisible(getDriversSaveandNextOption())) {
          await captureFullPage2D(page, testInfo, "Warnings In Drivers Page","#centerPanel");
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



