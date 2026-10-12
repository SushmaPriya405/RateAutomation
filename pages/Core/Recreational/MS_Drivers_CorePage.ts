import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
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
import { get } from "http";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../../utils/wordingValidation";
import { validateRulesForTestCase, ValidationResult } from "../../../utils/ruleBasedValidation";
import { selectDropdown, selectDropdownCore, selectYesNoRadioCore } from "../../../utils/question-helper";
import { waitForPageReady } from "../RiskAnalysis_CorePage";
import { selectSameAddressAs } from "./BT_Drivers_CorePage";

const getAddDriverButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver']");
const getExistingDriverButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:AddExistingContact-itemEl']");
const getexistingDriverName = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:AddExistingContact:0:UnassignedDriver-itemEl']");
const getMaritalStatus = () => getLocator("//label[contains(text(), 'Marital Status')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getGender = () => getLocator("//label[contains(text(), 'Gender')]//parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getDriversSaveandNextOption = () => getLocator('//span[contains(@id,"PADriversScreen") and contains(text(), "Drivers")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getYesLicensed = () => getLocator("//label[contains(text(), 'Licensed')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoLicensed = () => getLocator("//label[contains(text(), 'Licensed')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getLicenseState = () => getLocator("//label[contains(text(), 'License State')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getLicenseNumber = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:PolicyContactDetailsDV:LicenseInputSet:LicenseNumber-inputEl']");
const getDriverExperienceButton = () => getLocator("//span[contains(text(),'Driver Experience')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:RolesCardTab']");
const getNoOfAccidents = () => getLocator("//label[contains(text(), 'Number of Accidents')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getNoOfViolations = () => getLocator("//label[contains(text(), 'Number of Violations')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getYesMotorcycleLicense = () => getLocator("//label[contains(text(), 'Motorcycle License')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoMotorcycleLicense = () => getLocator("//label[contains(text(), 'Motorcycle License')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getDriverAddressButton = () => getLocator("//span[contains(text(),'Addresses')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:AddressDetailCardTab']");
const getMotorVehicleRecordButton = () => getLocator("//span[contains(text(),'Motor Vehicle Record')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:MVRDetailCardTab']");
const getFirstName = () => getLocator("//input[contains(@id,'FirstName-inputEl')]");
const getLastName = () => getLocator("//input[contains(@id,'LastName-inputEl')]");
const getDateOfBirth = () => getLocator("//input[contains(@id,'DateOfBirth-inputEl')]");
const getDateCompletedCourseTDClick = ()  => getLocator("//div[normalize-space()='Date Completed Safety Course']/ancestor::tr/td[contains(@class,'x-grid-cell-last')]");
const getYearsOfLicensedMotorcycleExperienceTDClick = () => getLocator("//div[normalize-space()='Years of Licensed Motorcycle Experience']//parent::td/following-sibling::td");
const getYearsOfLicensedMotorcycleExperience = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:YearsOfLicensedMotorcycleExperience-inputEl']");
const getMonthsLicensedForMotorcyclesDifferentCountry = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:MonthsLicensedForMotorcyclesDifferentCountry-inputEl']");
const getDateCompletedSafetyCourse = () => getLocator("//div[normalize-space()='Date Completed Safety Course']/ancestor::div/following-sibling::div//input");
const getSafetyCourseRefresherTDClick = ()  => getLocator("//div[normalize-space()='Date Completed Safety Course Refresher']//parent::td/following-sibling::td");
const getSafetyCourseRefresher = () => getLocator("//div[normalize-space()='Date Completed Safety Course Refresher']/ancestor::div/following-sibling::div//input");
const getDateFirstLicensedForMotorcyclesUSOrCanadaTDClick = () => getLocator("//div[normalize-space()='Date First Licensed for Motorcycles in US or Canada']//parent::td/following-sibling::td");
const getDateFirstLicensedForMotorcyclesUSOrCanada = () => getLocator("//div[normalize-space()='Date First Licensed for Motorcycles in US or Canada']/ancestor::div/following-sibling::div//input");
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
const getContactDetail = () => getLocator("//span[contains(text(),'Contact Detail')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriverDetailsCV:PolicyContactDetailCardTab']");
const getDriverTitle = () => getLocator("//span[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:0')]");
const getNewPerson = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PADriversScreen:PADriversPanelSet:DriversListDetailPanel:DriversLV_tb:AddDriver:0:ContactType-itemEl']");
const getNewDriverFormHeader = () => getLocator("//span[@id='NewPolicyDriverPopup:ContactDetailScreen:ttlBar']");
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
async function selectSameAddress() {
  await getAddressArrowIcon().click();
  await wait(1000);
  await getAddressSameNameButton().click();
  await wait(1000);
  await getAddressAddressButton().click();
}

async function selectPrimaryPhone(page: Page, value: any) {
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
async function fillWorkPhoneNumber(number: number) {
  await getWorkPhone().click({ force: true });
  await fill(getWorkPhone(), number.toString());
  await wait(2000);
}
async function fillFaxPhoneNumber(number: number) {
  await getFaxPhone().click({ force: true });
  await fill(getFaxPhone(), number.toString());
  await wait(2000);
}

async function clickAddDriverButton() {
  await getAddDriverButton().click({ force: true });
}

async function clickExistingDriverButton() {
  await getExistingDriverButton().click();
}

async function clickExistingDriverNameButton() {
  await getexistingDriverName().click();
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
      console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectMake: option '${value}' not found after ${maxAttempts} attempts`);
}

async function selectMaritalStatus(page: Page, value: any) {
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
      console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectMake: option '${value}' not found after ${maxAttempts} attempts`);
}

// async function selectLicenseOption(page: Page, value: any) {
//   const maxAttempts = 8;
//   const attemptDelay = 500; // ms

//   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//     try {
//       // Find ALL Licensed rows and get the last one (current active driver)
//       const allLicensedRows = page.locator("//label[contains(text(), 'Licensed')]/parent::td/parent::tr");
//       const lastLicensedRow = allLicensedRows.last();
      
//       // Scroll into view to ensure visibility
//       await lastLicensedRow.scrollIntoViewIfNeeded().catch(() => {});
//       await wait(500);
      
//       if (value === "Yes") {
//         // Find and click Yes within the last Licensed row
//         const yesButton = lastLicensedRow.locator(".//label[contains(text(),'Yes')]");
//         await yesButton.click({ force: true });
//       } else {
//         // Find and click No within the last Licensed row
//         const noButton = lastLicensedRow.locator(".//label[contains(text(),'No')]");
//         await noButton.click({ force: true });
//       }
//       console.log(`selectLicenseOption: clicked '${value}' on attempt ${attempt}`);
//       return;
//     } catch (error) {
//       console.log(`selectLicenseOption: attempt ${attempt} failed - ${error}`);
//       if (attempt < maxAttempts) {
//         await wait(attemptDelay);
//       }
//     }
//   }

//   throw new Error(`selectLicenseOption: failed to click '${value}' after ${maxAttempts} attempts`);
// }
async function selectLicenseOption(value: any) {
    await getYesLicensed().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesLicensed().click({force:true});
  } else {
    await getNoLicensed().click({force:true});
  }
}
async function selectMotorcycleLicenseOption(value: any) {
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await getYesMotorcycleLicense().scrollIntoViewIfNeeded().catch(() => {});

    try {
      if (value === "Yes") {
        await getYesMotorcycleLicense().click({ force: true });
      } else {
        await getNoMotorcycleLicense().click({ force: true });
      }
      console.log(`selectMotorcycleLicenseOption: clicked '${value}' on attempt ${attempt}`);
      return;
    } catch {
      if (attempt < maxAttempts) {
        await wait(attemptDelay);
      }
    }
  }

  throw new Error(`selectMotorcycleLicenseOption: failed to click '${value}' after ${maxAttempts} attempts`);
}

async function selectLicenseState(page: Page, value: any) {
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
  await getLicenseNumber().pressSequentially(number.toString(), { delay: 1000 }); // types slowly like a user

  await wait(5000);

}
async function enterDateCompletedSafetyCourse(page: Page, date: string) {
  if(!date) {
    console.log("No date provided for Date Completed Safety Course, skipping this step.");
    return;
  }
  if(await isElementVisible(getDateCompletedCourseTDClick())){
      date=formatToMMDDYYYY(excelDateToJSDate(date));
      console.log(`Before Entering Date Completed Safey Course ${date}`);
      await wait(4000);
      await getDateCompletedCourseTDClick().click({ force: true });
      await wait(2000);
      await getDateCompletedSafetyCourse().pressSequentially(date, { delay: 1000 }); // types slowly like a user
      await getDateCompletedSafetyCourse().press('Tab');
  }
  await wait(5000);
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
async function enterDateFirstLicensedForMotorcyclesUSOrCanada(page: Page, date: string) {
  if(!date) {
    console.log("No date provided for Date First Licensed for Motorcycles in US or Canada, skipping this step.");
    return;
  }
  if(await isElementVisible(getDateFirstLicensedForMotorcyclesUSOrCanadaTDClick())){
      date=formatToMMDDYYYY(excelDateToJSDate(date));
      await getDateFirstLicensedForMotorcyclesUSOrCanadaTDClick().click({ force: true });
      await wait(2000);
      await getDateFirstLicensedForMotorcyclesUSOrCanada().pressSequentially(date, { delay: 1000 }); // types slowly like a user
      await getSafetyCourseRefresher().press('Tab');
      await wait(5000);
  }
}
async function enterMonthsLicensedForMotorcyclesDifferentCountry(page: Page, months: string) {
  await wait(2000);
  if (await isElementVisible(getMonthsLicensedForMotorcyclesDifferentCountry())) {
    await getMonthsLicensedForMotorcyclesDifferentCountry().pressSequentially(months, { delay: 1000 }); // types slowly like a user
    await getMonthsLicensedForMotorcyclesDifferentCountry().press('Tab');
  }
}
async function enterYearsOfLicensedMotorcycleExperience(page: Page, years: string) {
  const locator = getYearsOfLicensedMotorcycleExperienceTDClick();
  if(await isElementVisible(locator)){
      await locator.click({ force: true });
      await wait(2000);
      await getYearsOfLicensedMotorcycleExperience().pressSequentially(years, { delay: 1000 });
      await getYearsOfLicensedMotorcycleExperience().press('Tab');
  }
  await wait(5000);
}
async function clickDriverExperienceButton() {
  await getDriverExperienceButton().click({ force: true });
}
async function clickDriverAddressButton() {
  await getDriverAddressButton().click({ force: true });
}
export async function clickMotorVehicleRecordButton() {
  await getMotorVehicleRecordButton().click({ force: true });
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
export async function clickAddDriverAndNewPersonWithRetry(page: Page, maxAttempts: number = 5) {
  const popupElement = getNewDriverFormHeader();
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Adding driver - New Person popup attempt ${attempt}/${maxAttempts}`);
   
    try {
      await clickAddDriverButton();
      await wait(2000);
      await getNewPerson().click();
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
 
  throw new Error(`Failed to open New Person popup after ${maxAttempts} attempts. Element ${popupElement} is not visible.`);
}

export async function fillDriverCorePage(
  page: Page,
  testInfo: TestInfo,
  Drivers: any[],
  AccountCreation: any,
  ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string, testCaseId: any,accountDetails: any
): Promise<ValidationResult> {
  try {
    //await reloadPage();
    await clickAddDriverButton();
    await waitForPageReady(page);
    await clickExistingDriverButton();
    await waitForPageReady(page);
    await clickExistingDriverNameButton();
    await waitForPageReady(page);
    for (let [index,DriverData] of Drivers.entries()) {
      if (DriverData["Drivers"]?.includes("Driver 1")) {
        console.log(DriverData);
        // await fillFirstName(DriverData["First_Name"]);
        // await fillLastName(DriverData["Last_Name"]);
        if(DriverData["DATE_OF_BIRTH"]){
          await fill(getDateOfBirth(), formatToMMDDYYYY(excelDateToJSDate(DriverData["DATE_OF_BIRTH"])), { timeout: STANDARD_TIMEOUT });
        }
        await selectDropdownCore(page, "Suffix", DriverData["Suffix"]);
        // await selectGender(page, "Male");
        console.log(`Selected Gender: ${DriverData["Gender"]}`);
        await selectDropdownCore(page, "Gender", DriverData["Gender"]);


        // await selectMaritalStatus(page, DriverData["Marital_Status"]);
        await selectDropdownCore(page, "Marital_Status", DriverData["Marital_Status"]);
        await selectDropdownCore(page, "Primary Phone", DriverData["Phone_Type"]);
        if (DriverData["Phone_Type"] === "Work") {
          await fillWorkPhoneNumber(DriverData["Phone_Number"]);
        }
        if (DriverData["Phone_Type"] === "Home") {
          await fillHomePhoneNumber(DriverData["Phone_Number"]);
        }
        if (DriverData["Phone_Type"] === "Mobile") {
          await fillMobilePhoneNumber(DriverData["Phone_Number"]);
        }
        if (DriverData["Licensed"]) {
          await selectLicenseOption(DriverData["Licensed"]);
        }
        // await selectYesNoRadioCore(page, "Licensed", DriverData["Licensed"]);
        const fullStateName = getFullStateName(DriverData["License_State"]);
        console.log(`Mapped state: ${DriverData["State"]} → ${fullStateName}`);
        await selectLicenseState(page, fullStateName);
        await fillLicenseValue(page, DriverData["License_Number"]);
        // if (DriverData["Motorcycle_License"]) {
        //   await selectMotorcycleLicenseOption(DriverData["Motorcycle_License"]);
        // }
        await selectYesNoRadioCore(page, "Motorcycle_License", DriverData["Motorcycle_License"]);

        await captureFullPage2D(page, testInfo, `Driver ${index+1} Contact Detail Tab`, "#centerPanel");
        await wait(3000);
        await clickDriverExperienceButton();
        // await selectNoOfAccident(page, '0');
        // await selectNoOfViolation(page, '0');
        if ((DriverData["NumberofAccidents"]?.toString()) || (DriverData["Number_of_Accidents"]?.toString())) {
          console.log(`Selecting Number of Accidents: ${DriverData["NumberofAccidents"] || DriverData["Number_of_Accidents"]}`);
          await selectNoOfAccident(page, DriverData["NumberofAccidents"]?.toString() || DriverData["Number_of_Accidents"]?.toString());
          await wait(1000);
        }
        if ((DriverData["NumberofViolations"]?.toString()) || (DriverData["Number_of_Violations"]?.toString())) {
          console.log(`Selecting Number of Violations: ${DriverData["NumberofViolations"]?.toString() || DriverData["Number_of_Violations"]?.toString()}`);
          await selectNoOfViolation(page, DriverData["NumberofViolations"]?.toString() || DriverData["Number_of_Violations"]?.toString());
          await wait(1000);
        } 
        await selectYesNoRadioCore(page, "IneligibleDriver", DriverData["IneligibleDriver"]);
        await selectYesNoRadioCore(page, "ExcludedDriver", DriverData["ExcludedDriver"]);
        await selectDropdownCore(page, "AssociationDiscount", DriverData["AssociationDiscount"]);
        await enterDateCompletedSafetyCourse(page, DriverData["DateCompletedSafetyCourse"]);
        await selectDropdownCore(page, "SafetyCourseType", DriverData["SafetyCourseType"]);
        await selectYesNoRadioCore(page, "CourtMandatedCourse", DriverData["CourtMandatedCourse"]);
        await enterSafetyCourseRefresherDate(page, DriverData["SafetyCourseRefresher"]);
        await enterDateFirstLicensedForMotorcyclesUSOrCanada(page, DriverData["DateFirstLicensedForMotorcyclesUSOrCanada"]);
        await enterMonthsLicensedForMotorcyclesDifferentCountry(page, DriverData["MonthsLicensedForMotorcyclesDifferentCountry"]);
        await selectDropdownCore(page, "GoodDriverDiscount", DriverData["GoodDriverDiscount"]);
        await selectYesNoRadioCore(page, "ActiveMilitary", DriverData["ActiveMilitary"]);
        await selectYesNoRadioCore(page, "MilesPerYearDriven", DriverData["MilesPerYearDriven"]);


        await enterYearsOfLicensedMotorcycleExperience(page, DriverData["YearsOfLicensedMotorcycleExperience"]);
        await wait(3000);
        await captureFullPage2D(page, testInfo, `Driver ${index+1} Experience Tab`, "#centerPanel");
        await wait(2000);
        await clickDriverAddressButton();
        await wait(5000);
        await captureFullPage2D(page, testInfo, `Driver ${index+1} Addresses Tab`, "#centerPanel");
        await wait(2000);
        await clickMotorVehicleRecordButton();
        await wait(5000);
        await captureFullPage2D(page, testInfo, `Driver ${index+1} Motor Vehicle Record Tab`, "#centerPanel");

      }
      if (DriverData["Drivers"]?.includes("Driver 2") || DriverData["Drivers"]?.includes("Driver 3")) {
        if (DriverData["First_Name"] != '') {
          // await clickAddDriverButton();
          // await wait(2000);
          // await getNewPerson().click();
          await clickAddDriverAndNewPersonWithRetry(page);
          await wait(2000);
          await fillFirstName(DriverData["First_Name"]);
          await fillLastName(DriverData["Last_Name"]);
          await selectDropdownCore(page, "Suffix", DriverData["Suffix"]);
          // await selectGender(page, "Male");
          await selectDropdownCore(page, "Gender", DriverData["Gender"]);
          if(DriverData["DATE_OF_BIRTH"]){
          await fill(getDateOfBirth(), formatToMMDDYYYY(excelDateToJSDate(DriverData["DATE_OF_BIRTH"])), { timeout: STANDARD_TIMEOUT });
          }
          // await selectMaritalStatus(page, DriverData["Marital_Status"]);
          // await selectPrimaryPhone(page, DriverData["Phone_Type"]);
          await selectDropdownCore(page, "Marital_Status", DriverData["Marital_Status"]);
          await selectDropdownCore(page, "Primary Phone", DriverData["Phone_Type"]);
          if (DriverData["Phone_Type"] === "Work") {
            await fillWorkPhoneNumber(DriverData["Phone_Number"]);
          }
          if (DriverData["Phone_Type"] === "Home") {
            await fillHomePhoneNumber(DriverData["Phone_Number"]);
          }
          if (DriverData["Phone_Type"] === "Mobile") {
            await fillMobilePhoneNumber(DriverData["Phone_Number"]);
          }
          // await selectRelationshipToPrimaryInsured(page, DriverData["Relationship_to_Primary_Insured"]);
          await selectDropdownCore(page, "Relationship_to_Primary_Insured", DriverData["Relationship_to_Primary_Insured"]);
          await selectSameAddressAs(page,accountDetails);
          //await getOKNewDriverButton().click({ force: true });
          let clicked = false;
          //let attempts = 0;

          let attempts = 0;

          while (attempts < 8) {
            console.log("Attempt number is: " + attempts);

            // Check if DriverTitle is visible
            const isVisible = await getOKNewDriverButton().isVisible();

            if (isVisible) {
              // Keep clicking until it's gone
              await getOKNewDriverButton().click({ force: true });
              await page.waitForTimeout(5000);
            } else {
              // Exit once DriverTitle is not visible
              console.log("DriverTitle is no longer visible, stopping loop.");
              break;
            }

            attempts++;
          }
          await wait(2000);
          await getContactDetail().click({ force: true });
          await wait(2000);

          if (DriverData["Licensed"]) {
            await selectLicenseOption(DriverData["Licensed"]);
          }
          // await selectYesNoRadioCore(page, "Licensed", DriverData["Licensed"]);
          const fullStateName = getFullStateName(DriverData["License_State"]);
          console.log(`Mapped state: ${DriverData["State"]} → ${fullStateName}`);
          await selectLicenseState(page, fullStateName);
          await fillLicenseValue(page, DriverData["License_Number"]);

          // await selectMotorcycleLicenseOption(DriverData["Motorcycle_License"]);
          await selectYesNoRadioCore(page, "Motorcycle_License", DriverData["Motorcycle_License"]);

          // await captureAndAttachforCore(page, testInfo, "FillDriverContactDetailsCorePage");
          await captureFullPage2D(page, testInfo, `Driver ${index+1} Contact Detail Tab`, "#centerPanel");
          await wait(3000);
          await clickDriverExperienceButton();
          await selectNoOfAccident(page, '0');
          await selectNoOfViolation(page, '0');
          await selectYesNoRadioCore(page, "IneligibleDriver", DriverData["IneligibleDriver"]);
          await selectYesNoRadioCore(page, "ExcludedDriver", DriverData["ExcludedDriver"]);
          await selectDropdownCore(page, "AssociationDiscount", DriverData["AssociationDiscount"]);
          await enterDateCompletedSafetyCourse(page, DriverData["DateCompletedSafetyCourse"]);
          await selectDropdownCore(page, "SafetyCourseType", DriverData["SafetyCourseType"]);
          await selectYesNoRadioCore(page, "CourtMandatedCourse", DriverData["CourtMandatedCourse"]);
          await enterSafetyCourseRefresherDate(page, DriverData["SafetyCourseRefresher"]);
          await enterDateFirstLicensedForMotorcyclesUSOrCanada(page, DriverData["DateFirstLicensedForMotorcyclesUSOrCanada"]);
          await enterMonthsLicensedForMotorcyclesDifferentCountry(page, DriverData["MonthsLicensedForMotorcyclesDifferentCountry"]);
          await selectDropdownCore(page, "GoodDriverDiscount", DriverData["GoodDriverDiscount"]);
          await selectYesNoRadioCore(page, "ActiveMilitary", DriverData["ActiveMilitary"]);
          await selectYesNoRadioCore(page, "MilesPerYearDriven", DriverData["MilesPerYearDriven"]);
      

      await enterYearsOfLicensedMotorcycleExperience(page, DriverData["YearsOfLicensedMotorcycleExperience"]);
          // await captureAndAttachforCore(page, testInfo, "FillDriverExperienceCorePage");
          await captureFullPage2D(page, testInfo, `Driver ${index+1} Experience Tab`, "#centerPanel");
          await wait(2000);
          await clickDriverAddressButton();
          await wait(5000);
          // await captureAndAttachforCore(page, testInfo, "FillDriverAddressCorePage");
          await captureFullPage2D(page, testInfo, `Driver ${index+1} Addresses Tab`, "#centerPanel");
          await wait(2000);
          await clickMotorVehicleRecordButton();
          await wait(5000);
          await captureFullPage2D(page, testInfo, `Driver ${index+1} Motor Vehicle Record Tab`, "#centerPanel");
        }}
  }



  
  await getDriversSaveandNextOption().click({ timeout: TIMEOUT_8_SECONDS });

  await wait(TIMEOUT_8_SECONDS);
    // Perform rule-based validation
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
  
  
  