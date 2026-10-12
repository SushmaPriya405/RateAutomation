import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder
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
import { validateRulesForTestCase, ValidationResult } from "../../../utils/coreRuleBasedValidation";
import { selectDropdownCore, selectYesNoRadioCore } from "../../../utils/question-helper";
import { shortHexNumber } from "docx";
 
const getAddVehicleButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel_tb:CreateVehicle']");
const getNewVehicleButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel_tb:CreateVehicle:NewVehicle-itemEl']");
const getVehicleType = () => getLocator("//label[contains(text(), 'Vehicle Type')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getYesKitCar = () => getLocator("//label[contains(text(), 'Kit Car')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoKitCar = () => getLocator("//label[contains(text(), 'Kit Car')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getVinNumber = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:Vin_DV-inputEl']");
//const getTrailerVIN = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAVehicleTrailerInputSet:Vin_DV-inputEl']");
const getYesBypassVINValidation = () => getLocator("//label[contains(text(), 'Bypass VIN Validations')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoBypassVINValidation = () => getLocator("//label[contains(text(), 'Bypass VIN Validations')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesStateAssignedVIN = () => getLocator("//label[contains(text(), 'State Assigned VIN')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoStateAssignedVIN = () => getLocator("//label[contains(text(), 'State Assigned VIN')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesSalvageRebuilt = () => getLocator("//label[contains(text(), 'Salvage/Rebuilt')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoSalvageRebuilt = () => getLocator("//label[contains(text(), 'Salvage/Rebuilt')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYear = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:Year_DV-inputEl']");
const getMake = () => getLocator("//label[contains(text(), 'Make')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getMakeDescription = () => getLocator("//input[contains(@id,'MakeDescription_Ext-inputEl')]");
const getModel = () => getLocator("//label[contains(text(), 'Model')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getModelDescription = () => getLocator("//input[contains(@id,'ModelDescription-inputEl')]");
const getBodyType = () => getLocator("//input[contains(@id, 'Body')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getYesRegisteredforStreetUse = () => getLocator("//label[contains(text(), 'Registered for Street Use')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoRegisteredforStreetUse = () => getLocator("//label[contains(text(), 'Registered for Street Use')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getStorageType = () => getLocator("//input[contains(@id, 'Storagetype')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getStorageConstructionType = () => getLocator("//label[contains(text(), 'Storage Construction Type')]//parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getValue = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:StatedValue_DV-inputEl']");
const getCondition = () => getLocator("//input[contains(@id, 'Condition')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getRestoration = () => getLocator("//input[contains(@id, 'Restoration')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getOdometerReading = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:OdometerReading_DV-inputEl']");
const getPurchasePrice = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PurchasePrice_DV-inputEl']");
const getMileagePlan = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:MileagePlan_DV-inputEl']");
const getYesLeased = () => getLocator("//label[contains(text(), 'Leased')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoLeased = () => getLocator("//label[contains(text(), 'Leased')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getOrderTerritoryCode = () => getLocator("//a[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAGarageLocationInputSet:OrderTerritoryCode')]");
const getAlarm = () => getLocator("//div[contains(text(), 'Alarm')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getDisablingDevice = () => getLocator("//div[contains(text(), 'Disabling Device')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getDoesBuildingHaveFollowing = () => getLocator("//div[contains(text(), 'Does the storage building have any of the following?')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getUsage = () => getLocator("//label[contains(text(),'Usage - Add all that apply')]");
const getVehiclesSaveandNextOption = () => getLocator('//span[contains(@id,"PAVehiclesScreen") and contains(text(), "Vehicles")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getPurchaseDate = () => getLocatorByPlaceholder("MM/dd/yyyy");
const getTrailerMake = () => getLocator("//input[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAVehicleTrailerInputSet:Make_DV-inputEl')]");
const getTrailerValue = () => getLocator("//input[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAVehicleTrailerInputSet:StatedValue_DV-inputEl')]");
const getTrailerModelYear = () => getLocator("//input[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAVehicleTrailerInputSet:Year_DV-inputEl')]");
const getTrailerVIN = () => getLocator("//input[contains(@id,'Vin_DV-inputEl')]");
const getTrailerLength = () => getLocator("//input[contains(@id,'Length-inputEl')]");
const getRacingSurfaceType = () => getLocator("//label[contains(text(), 'Racing Surface Type')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getYesUsedforTimedEvents = () => getLocator("//label[contains(text(), 'Used for timed events')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoUsedforTimedEvents = () => getLocator("//label[contains(text(), 'Used for timed events')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getVehicleSubType = () => getLocator("//label[contains(text(), 'Vehicle Subtype')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getClearButton = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getModificationsAddButton = () => getLocator("//a[contains(@id,'PAModificationsInputSet:VehicleModificationLV_tb:Add')]");
const getModificationsInput = () => getLocator(" //div[contains(@id,'VehicleModificationLV')]//div[contains(@class,'x-grid-cell-inner') and normalize-space()='<none>']");
const getKitCarManufacturerInput = () => getLocator("//input[contains(@id,'KitCarManufacturer_DV-inputEl')]");
const getChangeAddressDropdownButton = () => getLocator('//a[contains(@id, "PAGarageLocationInputMenuIcon")]');
const getNewAddressButton = () => getLocator('//span[contains(@id, "PAGarageLocationInput:NewGarageLocation-textEl") and contains(text(), "New Address")]');
const getChangeRegistrationAddressDropdownButton = () => getLocator('//a[contains(@id, "PARegistLocationInputMenuIcon")]');
const getNewRegistrationAddressButton = () => getLocator('//span[contains(@id, "PARegistLocationInput:NewGarageLocation-textEl") and contains(text(), "New Address")]');
const getAddressLine1Field = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:AddressLine1-inputEl")]');
const getAddressLine2Field = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:AddressLine2-inputEl")]');
const getState = () => getLocator('//input[contains(@name, "GlobalAddressInputSet:State")]');
const getCityField = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:CityNoAutoFill-inputEl")]');
const getZipCodeField = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:PostalCode-inputEl")]');
const getOkPopupButton = () => getLocator('//span[contains(@id, "LocationPopup:LocationScreen:Standardize-btnInnerEl") and contains(text(), "OK")]');
const getAddressErrorMsg = () => getLocator("//div[contains(text(), 'The address entered does not appear to be a valid address.')]");
const getCorrectAddressSelectOption = () => getLocator("//a[@id='AddressRangePopup:AddressStandardizeLV:0:select']");
const getAddressPopUpCancelButton = () => getLocator("//span[@id='AddressRangePopup:Cancel-btnInnerEl']")
const getOverRideButton = () => getLocator("//a[@id='AddressRangePopup:AddressStandardizeLV:select']");
const getChooseReason = () => getLocator("//td[@id='AddressRangePopup:OverrideReason-inputCell']/following-sibling::td//div[contains(@class, 'x-form-arrow-trigger')]")
const getContinuePopUpButton = () => getLocator("//span[@id= 'AddressRangePopup:ToolbarButton-btnInnerEl']")
const getVehicleAdditionalInterestTab = () => getLocator("//span[contains(text(),'Additional Interest')]/parent::span/parent::span/parent::a[contains(@id,'VehiclesDetailsCV:AdditionalInterestCardTab')]");
const getVehicleDetailsTab = () => getLocator("//span[contains(text(),'Vehicle Details')]/parent::span/parent::span/parent::a[contains(@id,'VehiclesDetailsCV:VehicleDetailCardTab')]");
 
 
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
// const get = () => getLocator("");
 
 
 
async function fillTrailerVinValue(number: string) {
  await fillAndValidateField(getTrailerVIN, number.toString(), "Trailer VIN", 3, 0, 3000);
}
async function fillTrailerModelYearValue(modelYear: number) {
  await fillAndValidateField(getTrailerModelYear, modelYear.toString(), "Trailer Model Year", 3, 0, 2000);
}
async function fillTrailerMakeValue(make: string) {
  await fillAndValidateField(getTrailerMake, make.toString(), "Trailer Make", 3, 0, 4000);
}
async function fillTrailerValue(value: number) {
  await fillAndValidateField(getTrailerValue, value.toString(), "Trailer Value", 3, 0, 2000);
}
async function fillTrailerLengthValue(length: number) {
  await fillAndValidateField(getTrailerLength, length.toString(), "Trailer Length", 3, 0, 2000);
}
async function selectUsedforTimedEvents(value: any) {
  await getYesUsedforTimedEvents().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesUsedforTimedEvents().click({ force: true });
  } else {
    await getNoUsedforTimedEvents().click({ force: true });
  }
}
async function selectRacingSurfaceType(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getRacingSurfaceType().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectRacingSurfaceType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectRacingSurfaceType: option '${value}' not found after ${maxAttempts} attempts`);
}
 
 
 
 
 
const getVehicleNumber = () => getLocator("//div[contains(@id,'VehicleNumber_DV-inputEl')]");
 
// Generic function to fill and validate input fields
async function fillAndValidateField(
  locatorFn: () => any,
  value: string,
  fieldName: string,
  maxAttempts: number = 3,
  preClickWait: number = 0,
  postFillWait: number = 2000
): Promise<void> {
  const valueStr = value.toString();
  let filledValue = '';
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (preClickWait > 0) {
        await wait(preClickWait);
      }
     
      await locatorFn().click({ force: true });
      await fill(locatorFn(), valueStr);
      await wait(postFillWait);
      await fill(locatorFn(), valueStr);
      await locatorFn().press('Tab'); // Trigger blur event
     
     
      await locatorFn().evaluate((el:HTMLInputElement) => el.blur());
 
      // Wait a little and poll the input value without using Playwright's expect
      // to avoid creating a test-level failing step for transient UI timing issues.
      await wait(5000);
      const pollTimeout = 30000; // ms
      const pollInterval = 500; // ms3
      let pollSatisfied = false;
      const startTime = Date.now();
 
      if (fieldName === "Vehicle Value") {
        while (Date.now() - startTime < pollTimeout) {
          const current = await locatorFn().inputValue();
          if (current.includes(valueStr)) {
            pollSatisfied = true;
            break;
          }
          await wait(pollInterval);
        }
      } else {
        while (Date.now() - startTime < pollTimeout) {
          const current = await locatorFn().inputValue();
          if (current === valueStr) {
            pollSatisfied = true;
            break;
          }
          await wait(pollInterval);
        }
      }
 
      if (!pollSatisfied) {
        const finalVal = await locatorFn().inputValue();
        console.warn(`Non-fatal: expected value for '${fieldName}' not met after ${pollTimeout}ms. Expected: '${valueStr}', Got: '${finalVal}'`);
      }
 
     
      // Verify the value is present in the field
      filledValue = await locatorFn().inputValue();
      if (filledValue === valueStr || (fieldName === "Vehicle Value" && filledValue.includes(valueStr))) {
        console.log(`✅ ${fieldName} filled successfully on attempt ${attempt}: ${filledValue}`);
        return;
      } else {
        console.log(`⚠️ Attempt ${attempt} - ${fieldName} mismatch. Expected: ${valueStr}, Got: ${filledValue}`);
        if (attempt < maxAttempts) {
          await wait(1000);
        }
    }
    } catch (error) {
      console.error(`❌ Error filling ${fieldName} on attempt ${attempt}:`, error);
      if (attempt === maxAttempts) throw error;
      await wait(1000);
    }
  }
 
  // If we get here, all attempts failed
  throw new Error(`Failed to fill ${fieldName} after ${maxAttempts} attempts. Expected: ${valueStr}, Got: ${filledValue}`);
}
 
// Validate Vehicle Number after adding new vehicle
async function validateVehicleNumber(expectedVehicleNumber: number, maxAttempts: number = 5): Promise<void> {
  const expectedValue = expectedVehicleNumber.toString();
  let actualValue = '';
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      actualValue = await getVehicleNumber().textContent() || '';
      actualValue = actualValue.trim();
 
      if (actualValue === expectedValue) {
        console.log(`✅ Vehicle Number validated successfully on attempt ${attempt}: ${actualValue}`);
        return;
      } else {
        console.log(`⚠️ Attempt ${attempt} - Vehicle Number mismatch. Expected: ${expectedValue}, Got: ${actualValue}`);
        if (attempt < maxAttempts) {
          await clickAddVehicleButton();
          await wait(2000);
          await clickNewVehicleButton();
          await wait(2000);
        }
      }
    } catch (error) {
      console.error(`❌ Error validating Vehicle Number on attempt ${attempt}:`, error);
      if (attempt === maxAttempts) throw error;
      await wait(1500);
    }
  }
 
  // If we get here, all attempts failed
  throw new Error(`Failed to validate Vehicle Number after ${maxAttempts} attempts. Expected: ${expectedValue}, Got: ${actualValue}`);
}
 
async function clickAddVehicleButton() {
  await getAddVehicleButton().click({ force: true });
}
 
async function clickNewVehicleButton() {
  await getNewVehicleButton().click({ force: true });
}
async function selectVehicleType(page: Page, value: any) {
  await getVehicleType().scrollIntoViewIfNeeded();
  await getVehicleType().click({ force: true });
  await wait(3000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
async function selectKitCarOption(value: any) {
  await getYesKitCar().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesKitCar().click({ force: true });
  } else {
    await getNoKitCar().click({ force: true });
  }
}
async function fillVinValue(number: string) {
  await fillAndValidateField(getVinNumber, number, "VIN Number");
}
async function selectByPassVINValidationOption(value: any) {
  await getYesBypassVINValidation().scrollIntoViewIfNeeded();
  console.log("Bypass value",value);
  if (value === "Yes") {
    await getYesBypassVINValidation().click({ force: true });
    console.log(`Selected ${value} for ByPass VIN`);
  } else {
    await getNoBypassVINValidation().click({ force: true });
    console.log(`Selected ${value} for ByPass VIN`);
  }
}
async function selectStateAssignedVINOption(value: any) {
  await getYesStateAssignedVIN().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesStateAssignedVIN().click({ force: true });
  } else {
    await getNoStateAssignedVIN().click({ force: true });
  }
}
 
async function selectSalvageRebuiltOption(value: any) {
  if(await isElementVisible(getYesSalvageRebuilt())){
    await getYesSalvageRebuilt().scrollIntoViewIfNeeded();
    if (value === "Yes") {
      await getYesSalvageRebuilt().click({ force: true });
    } else {
      await getNoSalvageRebuilt().click({ force: true });
    }
  }
}
async function fillYearValue(year: number) {
  await fillAndValidateField(getYear, year.toString(), "Year", 3, 0, 2000);
  await wait(3000);
}
async function selectMake(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getMake().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectMake: selected '${value}' on attempt ${attempt}`);

      // Wait for page to load after Make selection
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(2000);
      
      // Check if description field becomes visible - if so, fill it
      try {
        await getMakeDescription().waitFor({ state: 'visible', timeout: 5000 });
        console.log(`📝 Make Description field is visible - filling with "good"...`);
        await getMakeDescription().fill("good");
        await wait(500);
        console.log(`✅ Make Description filled: "good"`);
      } catch (descError) {
        console.log(`ℹ️ Make Description field not visible - skipping`);
      }
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectMake: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectModel(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getModel().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectModel: selected '${value}' on attempt ${attempt}`);
      

      // Wait for page to load after Model selection
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(2000);
      
      // Check if description field becomes visible - if so, fill it
      try {
        await getModelDescription().waitFor({ state: 'visible', timeout: 5000 });
        console.log(`📝 Model Description field is visible - filling with "good"...`);
        await getModelDescription().fill("good");
        await wait(500);
        console.log(`✅ Model Description filled: "good"`);
      } catch (descError) {
        console.log(`ℹ️ Model Description field not visible - skipping`);
      }
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectModel: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectVehicleSubTypeType(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getVehicleSubType().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectVehicleSubType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectVehicleSubType: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectBodyType(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getBodyType().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectBodyType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectBodyType: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectRegisteredforStrretUse(value: any) {
  await getYesRegisteredforStreetUse().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesRegisteredforStreetUse().click({ force: true });
  } else {
    await getNoRegisteredforStreetUse().click({ force: true });
  }
}
async function selectStorageType(value: any) {
  //await getStorageType().scrollIntoViewIfNeeded();
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getStorageType().click({ force: true }).catch(() => { });
 
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
 
  throw new Error(`selectConstructionType: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectStorageConstructionType(value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getStorageConstructionType().click({ force: true }).catch(() => { });
 
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
 
  throw new Error(`selectConstructionType: option '${value}' not found after ${maxAttempts} attempts`);
}
async function fillValue(value: number) {
  await fillAndValidateField(getValue, value.toString(), "Vehicle Value", 5, 0, 5000);
}
async function selectCondition(value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getCondition().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectCondition: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectCondition: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectRestoration(value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getRestoration().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectRestoration: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectRestoration: option '${value}' not found after ${maxAttempts} attempts`);
}
async function fillOdometerReading(odometer: number) {
  await fillAndValidateField(getOdometerReading, odometer.toString(), "Odometer Reading", 3, 0, 2000);
}
 
async function fillPurchasePrice(purchasePrice: number) {
  await fillAndValidateField(getPurchasePrice, purchasePrice.toString(), "Purchase Price", 3, 0, 2000);
}

async function fillMileagePlan(page: Page, mileagePlan: number) {
  await selectDropdownCore(page, mileagePlan.toString(), "Mileage Plan");
}
 
async function selectLeased(value: any) {
  await getYesLeased().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesLeased().click({ force: true });
  } else {
    await getNoLeased().click({ force: true });
  }
}
async function selectAlarm(page: Page, value: any) {
  await getAlarm().scrollIntoViewIfNeeded();
  await getAlarm().click({ force: true });
  await wait(3000);
  //await getApplicantPrimaryResidence().click({force: true});
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
async function selectDisablingDevice(page: Page, value: any) {
  await getDisablingDevice().scrollIntoViewIfNeeded();
  await getDisablingDevice().click({ force: true });
  await wait(3000);
  //await getApplicantPrimaryResidence().click({force: true});
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
async function selectUsage(page: Page, value: any) {
  await getUsage().scrollIntoViewIfNeeded();
 
  await wait(3000);
 
  // Check if grid cell is visible, if not click the add button
  const gridCell = getLocator("//td[contains(@class,'x-grid-cell')]//div[normalize-space()='Occasional Pleasure Use']");
  if (!await isElementVisible(gridCell)) {
    const selectUsageAddButton = getLocator("//div[contains(@id,'VehicleusageLV')]//a[contains(@class,'x-btn')][.//span[normalize-space()='Add']]");
    await click(selectUsageAddButton);
    await wait(1000);
  }
 
  // Click the grid cell to open the dropdown
  await click(gridCell);
 
  await wait(1000);
 
  // Select the option from the dropdown list
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
  await wait(1000);
}
 
async function selectModifications(page: Page, value: any) {
  await wait(2000);
 
  // Check if grid cell is visible, if not click the add button
  const gridCell = getModificationsInput();
  while (!await isElementVisible(gridCell)) {
    await getModificationsAddButton().click({ force: true });
    await wait(3000);
  }
 
  // Click the grid cell to open the dropdown
  await click(gridCell);
 
  await wait(2000);
 
  // Select the option from the dropdown list
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
  await wait(1000);
}
 
async function selectKitCarManufacturer(value: any, description: any) {
  await wait(4000);
  await getKitCarManufacturerInput().click({ force: true });
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
  await wait(2000);
  if(value === "Other"){
    const otherDescriptionLocator = getLocator("//input[contains(@id,'KitMakeDescription-inputEl')]");
    await otherDescriptionLocator.click({ force: true });
    await otherDescriptionLocator.fill(description);
    await wait(2000);
  }
}
 
async function fillNewAddress(addressline1: any,addressLine2: any, city:any,state:any, zipCode:any) {
  await fillAndValidateField(getAddressLine1Field, addressline1, "Address Line 1");
      if(addressLine2 && addressLine2 !== ''){
        await fillAndValidateField(getAddressLine2Field, addressLine2, "Address Line 2");
      }
      await fillAndValidateField(getCityField, city, "City");
      if(await isElementVisible(getState())){
        await getState().click({ timeout: STANDARD_TIMEOUT });
        const fullStateName = getFullStateName(state);
        console.log(`Mapped state: ${state} → ${fullStateName}`);
        let stateOption = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= '${fullStateName}']`);
        await stateOption().click({ force: true });
      }
      await fillAndValidateField(getZipCodeField, zipCode, "Zip Code");
      await click(getOkPopupButton());
      if (await isElementVisible(getAddressErrorMsg())) {
        console.log("Address Standardization popup is displayed");
        await getAddressPopUpCancelButton().click();
        await wait(1000);
        await click(getOkPopupButton());
        await getOverRideButton().click();
        await getChooseReason().click();
        const reasonOption = getLocator(`//ul[@class='x-list-plain']//li[text()= 'New Construction']`);
        await click(reasonOption);
        await click(getContinuePopUpButton());
        await wait(1000);
      }
}
 
export async function fillVehicleCorePage(page: Page,
  testInfo: TestInfo,
  Vehicles: any[],
  ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any
): Promise<ValidationResult> {
  try{
    console.log(`🔄 Adding temporary vehicle to initialize form...`);
    await clickAddVehicleButton();
    await wait(2000);
    await clickNewVehicleButton();
    await wait(2000);
 
  for (let VehicleData of Vehicles) {
    if (!VehicleData["Vehicle_Type"] || VehicleData["Vehicle_Type"] === '') {
      continue; // Skip vehicles with no type
    }
 
    // Extract vehicle number from the Vehicle string (e.g., "Vehicle 1" -> 1)
    const vehicleNumberMatch = VehicleData["Vehicle"].match(/(\d+)/);
    const vehicleNumber = vehicleNumberMatch ? parseInt(vehicleNumberMatch[1]) : 1;
 
    // For vehicles 2+ : clear form and add new vehicle
    if (vehicleNumber > 1) {
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(2000);
     
      for (let i = 0; i < 5; i++) {
        if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
          await getClearButtoninRiskAnalysisCore().click({ force: true });
          await wait(3000);
        } else {
          break;
        }
      }
      await clickAddVehicleButton();
      await wait(2000);
      await clickNewVehicleButton();
      await wait(2000);
     
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(2000);
    }
 
    // Validate Vehicle Number
    await validateVehicleNumber(vehicleNumber);
 
    // Fill vehicle type
    if(await isElementVisible(getVehicleType())){
      await selectVehicleType(page, VehicleData["Vehicle_Type"]);
      await wait(4000);
    }
 
    // Specialty vehicle subtype
    if (VehicleData["Vehicle_Type"] === "Specialty") {
      if(await isElementVisible(getVehicleSubType())){
        await selectVehicleSubTypeType(page, VehicleData["Specialty_Vehicle_Subtype"]);
      }
    }
 
    // Kit Car and Manufacturer selections
    if (VehicleData["Vehicle_Type"] === "Auto/Truck" || VehicleData["Vehicle_Type"] === "Race Car") {
      if(await isElementVisible(getYesKitCar())){
        await selectKitCarOption(VehicleData["Kit_Car"]);
      }
      if(VehicleData["Kit_Car"] === "Yes" && await isElementVisible(getKitCarManufacturerInput())){
        await wait(2000);
        await selectKitCarManufacturer(VehicleData["Kit_Car_Manufacturer"], VehicleData["Description"]);
      }
    }
    //✅ Bypass VIN Validations
    if(VehicleData["Bypass_Vin_Validations"])
    {
      await selectByPassVINValidationOption(VehicleData["Bypass_Vin_Validations"]);
    }
    // State Assigned VIN (if available)
    if(VehicleData["State_Assigned_VIN"] && vehicleNumber === 1){
      await selectStateAssignedVINOption(VehicleData["State_Assigned_VIN"]);
    }
 
    // VIN/Serial Number
    if (VehicleData["VIN/Serial Number"]) {
      if (VehicleData["Vehicle_Type"] === "Trailer" && await isElementVisible(getTrailerVIN())) {
        await fillTrailerVinValue(VehicleData["VIN/Serial Number"]);
      } else if(await isElementVisible(getVinNumber())) {
        await fillVinValue(VehicleData["VIN/Serial Number"]);
      }
    }
 
    // Model Year
    if (VehicleData["Model_Year"]) {
      if (VehicleData["Vehicle_Type"] === "Trailer" && await isElementVisible(getTrailerModelYear())) {
        await fillTrailerModelYearValue(VehicleData["Model_Year"]);
        await fillTrailerModelYearValue(VehicleData["Model_Year"]);
      } else if(await isElementVisible(getYear())){
        await fillYearValue(VehicleData["Model_Year"]);
      }
    }
 
    // Make
    if (VehicleData["Make"]) {
      if ((VehicleData["Vehicle_Type"] === "Auto/Truck" || VehicleData["Vehicle_Type"] === "Race Car") && await isElementVisible(getMake())){
        await selectMake(page, VehicleData["Make"]);
      } else if (VehicleData["Vehicle_Type"] === "Trailer" && await isElementVisible(getTrailerMake())){
        await fillTrailerMakeValue(VehicleData["Make"]);
      }
    }
 
    // Model (only for Auto/Truck and Race Car)
    if (VehicleData["Vehicle_Type"] === "Auto/Truck" || VehicleData["Vehicle_Type"] === "Race Car") {
      if(await isElementVisible(getModel())){
        await selectModel(page,VehicleData["Model"]);
        await selectDropdownCore(page, "Model",VehicleData["Model"]);
      }
      if(await isElementVisible(getBodyType())){
        await selectModel(page,VehicleData["Model"]);
        await selectBodyType(page, VehicleData["Body_Type"]);
      }
    }
 
    // Trailer specific fields
    if (VehicleData["Vehicle_Type"] === "Trailer") {
      if(await isElementVisible(getTrailerLength())){
        await fillTrailerLengthValue(VehicleData["Trailer_Length"]);
      }
      if(await isElementVisible(getTrailerValue())){
        await fillTrailerValue(VehicleData["Value"]);
      }
    }
 
    // Value (for non-Trailer vehicles)
    if (VehicleData["Vehicle_Type"] !== "Trailer" && await isElementVisible(getValue())){
      await fillValue(VehicleData["Value"]);
    }
 
    // Condition
    if (VehicleData["Vehicle_Type"] === "Auto/Truck" || VehicleData["Vehicle_Type"] === "Race Car" || VehicleData["Vehicle_Type"] === "Specialty") {
      if(await isElementVisible(getCondition())){
        await selectCondition(VehicleData["Condition"]);
      }
    }
 
    // Restoration and related fields
    if (VehicleData["Vehicle_Type"] === "Auto/Truck" || VehicleData["Vehicle_Type"] === "Race Car" || VehicleData["Vehicle_Type"] === "Specialty") {
      if(await isElementVisible(getRestoration())){
        await selectRestoration(VehicleData["Under_Restoration?"]);
      }
     
      if(VehicleData["Salvage/Rebuilt"] && await isElementVisible(getYesSalvageRebuilt())){
        await selectSalvageRebuiltOption(VehicleData["Salvage/Rebuilt"]);
      }
     
      if(await isElementVisible(getPurchaseDate())){
        const formattedDate = formatToMMDDYYYY(excelDateToJSDate(VehicleData["Purchase_Date"]));
        await fillAndValidateField(getPurchaseDate, formattedDate, "Purchase Date", 3, 0, 2000);
      }
     
      if(VehicleData["Purchse_Price"] && await isElementVisible(getPurchasePrice())){
        await fillPurchasePrice(VehicleData["Purchse_Price"]);
      }
     
      if(VehicleData["Mileage Plan"] && await isElementVisible(getMileagePlan())){
        await fillMileagePlan(page,VehicleData["Mileage Plan"]);
      }
     
      // Odometer reading
      if(VehicleData["Odometer_Reading"] && (VehicleData["Vehicle_Type"] === "Auto/Truck" || VehicleData["Vehicle_Type"] === "Race Car") && await isElementVisible(getOdometerReading())){
        await fillOdometerReading(VehicleData["Odometer_Reading"]);
      }
    }
 
    // Registered for Street Use (Auto/Truck and Specialty)
    if ((VehicleData["Vehicle_Type"] === "Auto/Truck" || VehicleData["Vehicle_Type"] === "Specialty") && await isElementVisible(getYesRegisteredforStreetUse())){
      await selectRegisteredforStrretUse(VehicleData["Registered_for_Street_Use"]);
     
      if(VehicleData["Usage_-_Select_all_that_apply"] && await isElementVisible(getUsage())){
        await selectUsage(page, VehicleData["Usage_-_Select_all_that_apply"]);
      }
     
      if(VehicleData["Modifications_-_Select_all_that_apply"] && await isElementVisible(getModificationsAddButton())){
        await selectModifications(page, VehicleData["Modifications_-_Select_all_that_apply"]);
      }
    }
 
    // Race Car specific fields
    if (VehicleData["Vehicle_Type"] === "Race Car") {
      if(await isElementVisible(getYesRegisteredforStreetUse())){
        await selectRegisteredforStrretUse(VehicleData["Registered_for_Street_Use"]);
      }
      if(VehicleData["Usage_-_Select_all_that_apply"] && await isElementVisible(getUsage())){
        await selectUsage(page, VehicleData["Usage_-_Select_all_that_apply"]);
      }
      if(VehicleData["Modifications_-_Select_all_that_apply"] && await isElementVisible(getModificationsAddButton())){
        await selectModifications(page, VehicleData["Modifications_-_Select_all_that_apply"]);
      }
      if(await isElementVisible(getRacingSurfaceType())){
        await selectRacingSurfaceType(page, VehicleData["Racing_Surface_Type"]);
      }
      if(await isElementVisible(getYesUsedforTimedEvents())){
        await selectUsedforTimedEvents(VehicleData["Used_For_Timed_Events"]);
        await selectYesNoRadioCore(page, "Used_For_Timed_Events", VehicleData["Used_For_Timed_Events"]);
      }
    }
 
    // Storage Address
    const storageAddress = VehicleData["Storage_Address_Address_Line_1"];
    if (storageAddress && await isElementVisible(getChangeAddressDropdownButton())) {
      await click(getChangeAddressDropdownButton());
      await click(getNewAddressButton());
      await fillAndValidateField(getAddressLine1Field, VehicleData["Storage_Address_Address_Line_1"], "Storage Address Line 1");
      if(VehicleData["Storage_Address_Address_Line_2"] && VehicleData["Storage_Address_Address_Line_2"] !== ''){
        await fillAndValidateField(getAddressLine2Field, VehicleData["Storage_Address_Address_Line_2"], "Storage Address Line 2");
      }
      await fillAndValidateField(getCityField, VehicleData["Storage_Address_City"], "Storage City");
      await getState().click({ timeout: STANDARD_TIMEOUT });
      const fullStateName = getFullStateName(VehicleData["Storage_Address_State"]);
      console.log(`Mapped state: ${VehicleData["Storage_Address_State"]} → ${fullStateName}`);
      let stateOption = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= '${fullStateName}']`);
      await stateOption().click({ force: true });
      await fillAndValidateField(getZipCodeField, VehicleData["Storage_Address_Zip"], "Storage Zip Code");
      await click(getOkPopupButton());
      if (await isElementVisible(getAddressErrorMsg())) {
        console.log("Address Standardization popup is displayed");
        await getAddressPopUpCancelButton().click();
        await wait(2000);
        await click(getOkPopupButton());
        await wait(2000);
        await getOverRideButton().click();
        await getChooseReason().click();
        const reasonOption = getLocator(`//ul[@class='x-list-plain']//li[text()= 'New Construction']`);
        await click(reasonOption);
        await click(getContinuePopUpButton());
        await wait(1000);
      }
    }
 
    // Registration Address
    const registrationAddress = VehicleData["Registration_Address_Address_Line_1"];
    if (VehicleData["Registration_Address_same_as_Storage_Address?"] && await isElementVisible(getChangeRegistrationAddressDropdownButton())) {
      if(VehicleData["Registration_Address_same_as_Storage_Address?"] === "Yes") {
        await click(getChangeRegistrationAddressDropdownButton());
        await click(getNewRegistrationAddressButton());
        await fillNewAddress(VehicleData["Storage_Address_Address_Line_1"],VehicleData["Storage_Address_Address_Line_2"], VehicleData["Storage_Address_City"],VehicleData["Storage_Address_State"], VehicleData["Storage_Address_Zip"])
      }
      else if(VehicleData["Registration_Address_Address_Line_1"] && VehicleData["Registration_Address_Address_Line_1"] !== ''&& VehicleData["Registration_Address_City"] && VehicleData["Registration_Address_State"] && VehicleData["Registration_Address_Zip"])
      {
        await click(getChangeRegistrationAddressDropdownButton());
        await click(getNewRegistrationAddressButton());
        await fillNewAddress(VehicleData["Registration_Address_Address_Line_1"],VehicleData["Registration_Address_Address_Line_2"], VehicleData["Registration_Address_City"],VehicleData["Registration_Address_State"], VehicleData["Registration_Address_Zip"])
      }
    }
 
    // Order Territory Code and Storage options
    if (VehicleData["Vehicle_Type"] !== "Trailer") {
      await getOrderTerritoryCode().scrollIntoViewIfNeeded();
      await wait(5000);
      const latLabel = getLocator("//label[text()='Latitude to Use for Territory']");
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await getOrderTerritoryCode().click({ force: true });
        await wait(1000);
        if (await isElementVisible(latLabel)) {
          break;
        }
        if (attempt < maxAttempts) {
          await wait(1000);
        } else {
          console.warn(`Latitude label not visible after ${maxAttempts} attempts`);
        }
      }
    }
   
    if(await isElementVisible(getStorageType()) && VehicleData["Storage_Type"]){
      await selectStorageType(VehicleData["Storage_Type"]);
    }
   
    if(await isElementVisible(getStorageConstructionType()) && VehicleData["Storage_Construction_Type"]){
      await selectStorageConstructionType(VehicleData["Storage_Construction_Type"]);
    }
 
    if (VehicleData["Vehicle_Type"] !== "Trailer" && await isElementVisible(getValue())){
      await fillValue(VehicleData["Value"]);
    }
 
    // Anti-Theft and Security Features - Yes/No Questions
    const vehicleYesNoQuestions = [
      { shortCode: "AntiTheftVINEtching", value: VehicleData["AntiTheftVINEtching"] },
      { shortCode: "AntiTheftDevices", value: VehicleData["AntiTheftDevices"] },
      { shortCode: "AntiTheftVehicleRecoveryTrackingSystem", value: VehicleData["AntiTheftVehicleRecoveryTrackingSystem"] },
      { shortCode: "ActiveAlarmOnly", value: VehicleData["ActiveAlarmOnly"] },
      { shortCode: "Building_Has_Fire_Supression", value: VehicleData["Building_Has_Fire_Supression"] },
      { shortCode: "Building_Has_Entry_Deterrents", value: VehicleData["Building_Has_Entry_Deterrents"] },
      { shortCode: "PassiveAlarmOnly", value: VehicleData["PassiveAlarmOnly"] },
      { shortCode: "IgnitionOrStarterCutoffSwitch", value: VehicleData["IgnitionOrStarterCutoffSwitch"] },
      { shortCode: "NonArmoredIgnitionOrStarterCutoffSwitch", value: VehicleData["NonArmoredIgnitionOrStarterCutoffSwitch"] },
      { shortCode: "SteeringColumnArmoredCollar", value: VehicleData["SteeringColumnArmoredCollar"] },
      { shortCode: "ActiveFuelCutoffDevice", value: VehicleData["ActiveFuelCutoffDevice"] },
      { shortCode: "FuelCutoffDevice", value: VehicleData["FuelCutoffDevice"] },
      { shortCode: "PermanentlyAttachedSteeringWheelLock", value: VehicleData["PermanentlyAttachedSteeringWheelLock"] },
      { shortCode: "ArmoredCableHoodLockAndIgnitionCutoffSwitch", value: VehicleData["ArmoredCableHoodLockAndIgnitionCutoffSwitch"] },
      { shortCode: "ArmoredIgnitionCutoffSwitch", value: VehicleData["ArmoredIgnitionCutoffSwitch"] },
      { shortCode: "ArmoredCableOrElectricHoodLockAndIgnitionCutoff", value: VehicleData["ArmoredCableOrElectricHoodLockAndIgnitionCutoff"] },
      { shortCode: "EmergencyHandbrakeLock", value: VehicleData["EmergencyHandbrakeLock"] },
      { shortCode: "AutomobileTransmissionLock", value: VehicleData["AutomobileTransmissionLock"] },
      { shortCode: "PassiveDisablingDevice", value: VehicleData["PassiveDisablingDevice"] },
      { shortCode: "PassiveMultiComponentIncludingIgnitionCutoffSwitch", value: VehicleData["PassiveMultiComponentIncludingIgnitionCutoffSwitch"] },
      { shortCode: "PassiveTimeDelayIgnitionSystem", value: VehicleData["PassiveTimeDelayIgnitionSystem"] },
      { shortCode: "PassiveDelayedIgnitionCutoffSystem", value: VehicleData["PassiveDelayedIgnitionCutoffSystem"] },
      { shortCode: "PassiveIgnitionLockProtectionSystem", value: VehicleData["PassiveIgnitionLockProtectionSystem"] },
      { shortCode: "VINEtchingWindowIdentificationSystem", value: VehicleData["VINEtchingWindowIdentificationSystem"] },
      { shortCode: "VehicleRecoverySystem", value: VehicleData["VehicleRecoverySystem"] },
      { shortCode: "HighSecurityIgnitionReplacementLock", value: VehicleData["HighSecurityIgnitionReplacementLock"] },
      { shortCode: "HydraulicBrakeLockDevice", value: VehicleData["HydraulicBrakeLockDevice"] },
      { shortCode: "InternallyOperatedAlarms", value: VehicleData["InternallyOperatedAlarms"] },
      { shortCode: "SpecifiedAlarms", value: VehicleData["SpecifiedAlarms"] },
      { shortCode: "AntiLockBrakes", value: VehicleData["AntiLockBrakes"] },
      { shortCode: "StorageFireSuppressionSystem", value: VehicleData["StorageFireSuppressionSystem"] },
      { shortCode: "StorageEntryDeterrents", value: VehicleData["StorageEntryDeterrents"] },
      { shortCode: "DaytimeRunningLights", value: VehicleData["DaytimeRunningLights"] },
      { shortCode: "IneligibleVehicle", value: VehicleData["IneligibleVehicle"] },
      { shortCode: "Category1", value: VehicleData["Category1"] },
      { shortCode: "Category2", value: VehicleData["Category2"] },
      { shortCode: "Category3", value: VehicleData["Category3"] },
      { shortCode: "Category4", value: VehicleData["Category4"] },
      { shortCode: "HistoricVehicle", value: VehicleData["HistoricVehicle"] },
    ];
    for (const q of vehicleYesNoQuestions) {
      if (q.value) {
        await selectYesNoRadioCore(page, q.shortCode, q.value);
      }
    }
 
    // Anti-Theft and Security Features - Dropdowns
    const vehicleDropdowns = [
      { shortCode: "AntiTheftAlarm", value: VehicleData["AntiTheftAlarm"] },
      { shortCode: "AntiTheftDisablingDevice", value: VehicleData["AntiTheftDisablingDevice"] },
      { shortCode: "Building_Has_Any_of_Following" , value: VehicleData["Building_Has_Any_of_Following"] },
      { shortCode: "StorageFireBurglarAlarm", value: VehicleData["StorageFireBurglarAlarm"] },
      { shortCode: "AirBags", value: VehicleData["AirBags"] },
      { shortCode: "PA_AutomaticOccupantRestraint", value: VehicleData["PA_AutomaticOccupantRestraint"] },
      { shortCode: "PassiveRestraint", value: VehicleData["PassiveRestraint"] },
      { shortCode: "VehicleRegistrationType", value: VehicleData["VehicleRegistrationType"] },
    ];
    for (const d of vehicleDropdowns) {
      if (d.value) {
        await selectDropdownCore(page, d.shortCode, d.value);
      }
    }
 
    if (await isElementVisible(getOrderTerritoryCode())) {
      await getOrderTerritoryCode().scrollIntoViewIfNeeded();
      const orderTerritoryMaxAttempts = 3;
      const orderTerritoryRetryDelay = 2000;
      const orderTerritoryReadyLabel = getLocator("//label[text()='Latitude to Use for Territory']");
 
      for (let attempt = 1; attempt <= orderTerritoryMaxAttempts; attempt++) {
        await wait(orderTerritoryRetryDelay);
        await getOrderTerritoryCode().click({ force: true });
        await wait(orderTerritoryRetryDelay);
 
        if (await isElementVisible(orderTerritoryReadyLabel, { timeout: 1000 })) {
          break;
        }
 
        if (attempt < orderTerritoryMaxAttempts) {
          console.log(`Retrying Order Territory Code click (${attempt + 1}/${orderTerritoryMaxAttempts})`);
        } else {
          console.warn(`Order Territory Code click did not reveal the expected latitude label after ${orderTerritoryMaxAttempts} attempts`);
        }
      }
    }
 
    await wait(5000);
   
 
    // Capture screenshot
    await captureFullPage2D(page, testInfo, `${VehicleData["Vehicle"]} Details`,"#centerPanel");
   
    if (await isElementVisible(getVehicleAdditionalInterestTab())) {
      console.log(`📸 Switching to Additional Interest tab`);
      await clickVehicleAdditionalInterestTabWithRetry(page);
      await captureFullPage2D(page, testInfo, `${VehicleData["Vehicle"]} Additional Interest Tab`,"#centerPanel");
      console.log(`✅ Captured Additional Interest Tab`);
    }
    // Return to Vehicle Details tab for next Vehicle (if any)
      await getVehicleDetailsTab().click({ force: true });
      await wait(5000);
  }
 
 
 
 
 
  await getVehiclesSaveandNextOption().click({ timeout: TIMEOUT_8_SECONDS });
 
  await wait(TIMEOUT_8_SECONDS);
  // Perform rule-based validation
  console.log("🔍 Performing rule-based validation for Vehicles...");
  const validationResult = await validateRulesForTestCase(
    testCaseId,
    blockingContext,
    ruleMatrix,
    page,
    testInfo
  );
 
  console.log("Vehicle validation result:", validationResult);
 
  if (await isElementVisible(getVehiclesSaveandNextOption())) {
    // await captureFullPage2D(page, testInfo, "Warning In Vehicles Page", "#centerPanel");
    await getVehiclesSaveandNextOption().click({ timeout: 4000 });
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
 
// Click Additional Interest tab and verify the page shows the Additional Interests label
async function clickVehicleAdditionalInterestTabWithRetry(page: Page, maxAttempts: number = 4) {
  const tab = getVehicleAdditionalInterestTab();
  const verifyLabel = getLocator("//label[text()='Additional Interests']");
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await tab.scrollIntoViewIfNeeded().catch(() => undefined);
      await tab.click({ force: true }).catch(() => undefined);
      // wait a bit for content to render
      await wait(800 + attempt * 200);
 
      if (await isElementVisible(verifyLabel, { timeout: 1200 })) {
        await page.waitForLoadState('load', { timeout: MAX_TIMEOUT }).catch(() => undefined);
        await wait(300);
        console.log(`✅ Additional Interests visible on attempt ${attempt}`);
        return;
      }
    } catch (err) {
      // ignore and retry
    }
 
    console.log(`⚠️ Additional Interests not visible (attempt ${attempt}), retrying...`);
    await wait(500);
  }
 
  throw new Error('Additional Interests label did not appear after clicking Additional Interest tab');
}