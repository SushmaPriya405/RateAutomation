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
  excelDateToJSDate,
  waitForPageLoadState
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
import { selectDropdownCore } from "../../../utils/question-helper";
import { getAddtionalInterests } from "./BT_Vehicle_CorePage";
import { getClearButton } from "../RiskAnalysis_CorePage";
import { isSameAsAccountAddress } from "../../GPA/Recreational/YT_VehiclesPage";

// ========================================
// LOCATORS
// ========================================
const getAddVehicleButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel_tb:CreateVehicle']");
const getNewVehicleButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel_tb:CreateVehicle:NewVehicle-itemEl']");
const getVehicleType = () => getLocator("//label[contains(text(), 'Vehicle Type')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getYear = () => getLocator("//input[contains(@id, 'Year_DV')]");
const getMake = () => getLocator("//label[contains(text(), 'Make')]//parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getMakeDescription = () => getLocator("//input[contains(@id,'MakeDescription_Ext-inputEl')]");
const getModel = () => getLocator("//label[contains(text(), 'Model')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getModelDescription = () => getLocator("//input[contains(@id,'ModelDescription-inputEl')]");
const getStorageType = () => getLocator("//input[contains(@id, 'Storage')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getValue = () => getLocator("//input[contains(@id, 'Value_DV')]");
const getValueList = () => getLocator("//label[contains(text(), 'Value')]//parent::td/parent::tr//td[contains(@class,'x-form-item-body ')]");
const getOrderTerritoryCode = () => getLocator("//a[contains(text(),'Order Territory Code')]");
const getVehiclesSaveandNextOption = () => getLocator('//span[contains(@id,"PAVehiclesScreen") and contains(text(), "Vehicles")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getVehicleDetailsTab = () => getLocator("//span[contains(text(),'Vehicle Details')]/parent::span/parent::span/parent::a[contains(@id,'VehiclesDetailsCV:VehicleDetailCardTab')]");
const getPurchaseDate = () => getLocator("//input[contains(@name,'PurchaseDate_Ext')]");
const getLastSurveyDate = () => getLocator("//input[contains(@name,'LastSurveyDate_Ext')]");
const getLength = () => getLocator("//input[contains(@id, 'Length') or contains(@id, 'length') or contains(@id, 'boat_length') or contains(@id, 'BoatLength')]");
const getHullID = () => getLocator("//input[contains(@id, 'HullID') or contains(@id, 'HullId') or contains(@id, 'Hin_Ext')]");
const getPropulsionType = () => getLocator("//label[contains(text(), 'Propulsion Type')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getBoatType = () => getLocator("//label[contains(text(), 'Boat Type')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getHorsePower = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:TotalHorsePower_Ext-inputEl']");
const getHullConstruction = () => getLocator("//label[contains(text(), 'Hull Construction')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getPurchasePrice = () => getLocator("//input[contains(@id,'PurchasePrice') or contains(@id,'Purchase_Price')]");
const getEngineType = () => getLocator("//label[contains(text(), 'Engine Type')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getFuelType = () => getLocator("//label[contains(text(), 'Fuel Type')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getNumberOfEngines = () => getLocator("//label[contains(text(), 'Number of Engines')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getWeight = () => getLocator("//input[contains(@id,'Weight') or contains(@id,'weight')]");
const getSpeed = () => getLocator("//input[contains(@id,'Speed') or contains(@id,'speed') or contains(@id,'MaxSpeed')]");
const getVehicleRecovery = () => getLocator("//div[contains(text(),'Vehicle Recovery') or contains(text(),'Recovery/Tracking')]//parent::td/parent::tr//td//label");
const getYesVehicleRecovery = () => getLocator("//div[contains(text(),'Vehicle Recovery') or contains(text(),'Recovery/Tracking')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoVehicleRecovery = () => getLocator("//div[contains(text(),'Vehicle Recovery') or contains(text(),'Recovery/Tracking')]//parent::td/parent::tr//td//label[contains(text(),'No')]");
const getVehicleIneligible = () => getLocator("//div[contains(text(),'vehicle ineligible?')]//parent::td/parent::tr//td//label");
const getYesVehicleIneligible = () => getLocator("//div[contains(text(),'vehicle ineligible?')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoVehicleIneligible = () => getLocator("//div[contains(text(),'vehicle ineligible?')]//parent::td/parent::tr//td//label[contains(text(),'No')]");

// Storage and Mooring Address Locators
const getStorageAddressDisplay = () => getLocator("//div[contains(@id,'StorageAddressSummary-inputEl')]");
const getStorageChangeButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAMooringLocation_ExtInputSet:PAGarageLocationInput:PAGarageLocationInputMenuIcon']");
const getStorageNewAddressOption = () => getLocator("//span[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAMooringLocation_ExtInputSet:PAGarageLocationInput:NewGarageLocation-textEl']");
const getStorageAttentionCare = () => getLocator("//input[contains(@id,'AddressName-inputEl')]").first();
const getStorageAddressLine1 = () => getLocator("//input[contains(@id,'AddressLine1-inputEl')]").first();
const getStorageAddressLine2 = () => getLocator("//input[contains(@id,'AddressLine2-inputEl')]").first();
const getStorageCity = () => getLocator("//input[contains(@id,'CityNoAutoFill-inputEl')]").first();
const getStorageState = () => getLocator("//div[contains(@id,'State-inputEl')]").first();
const getStorageZipCode = () => getLocator("//input[contains(@id,'PostalCode-inputEl')]").first();
const getStorageOkButton = () => getLocator("//span[contains(@id,'LocationPopup:LocationScreen:Standardize-btnInnerEl') and text()='OK']");

const getMooringAddressDisplay = () => getLocator("//div[contains(@id,'MooringAddressSummary_Ext-inputEl')]");
const getMooringAddressSame = () => getLocator("//label[contains(text(),'Mooring Address') or contains(text(),'same as Storage')]//parent::td/parent::tr//td//label");
const getYesMooringAddressSame = () => getLocator("//label[contains(text(),'Mooring Address') or contains(text(),'same as Storage')]//parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoMooringAddressSame = () => getLocator("//label[contains(text(),'Mooring Address') or contains(text(),'same as Storage')]//parent::td/parent::tr//td//label[contains(text(),'No')]");
const getMooringChangeButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAMooringLocation_ExtInputSet:PARegistLocationInput:PARegistLocationInputMenuIcon']");
const getMooringNewAddressOption = () => getLocator("//span[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAMooringLocation_ExtInputSet:PARegistLocationInput:NewGarageLocation-textEl']");
const getMooringAttentionCare = () => getLocator("//input[contains(@id,'AddressName-inputEl')]").last();
const getMooringAddressLine1 = () => getLocator("//input[contains(@id,'AddressLine1-inputEl')]").last();
const getMooringAddressLine2 = () => getLocator("//input[contains(@id,'AddressLine2-inputEl')]").last();
const getMooringCity = () => getLocator("//input[contains(@id,'CityNoAutoFill-inputEl')]").last();
const getMooringState = () => getLocator("//div[contains(@id,'State-inputEl')]").last();
const getMooringZipCode = () => getLocator("//input[contains(@id,'PostalCode-inputEl')]").last();
const getMooringOkButton = () => getLocator("//span[contains(@id,'LocationPopup:LocationScreen:Standardize-btnInnerEl') and text()='OK']");

// Assign Drivers Locators
const getAssignDriversection = () => getLocator("//label[contains(text(), 'Assign Drivers to Vehicles')]");
const getDriverAddButton = () => getLocator("//label[contains(text(), 'Assign Drivers to Vehicles')]//following::a[contains(@id,'AddDriver') or contains(text(),'Add')][1]");
const getDriverUseCell = () => getLocator("(//label[contains(text(), 'Assign Drivers to Vehicles')]//following::table[contains(@class,'x-grid')]//tr[contains(@class,'x-grid-row')][1]//td[3]//div)[1]");

// Engine Details Locators
const getEngineAddButton = () => getLocator("//span[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAEngineDetails_ExtInputSet:EngineDetails_ExtLV_tb:Add-btnInnerEl']");
//const getEngineDetailsYear = () => getLocator("//div[contains(@id,'EngineDetails_ExtLV')]//table//tbody//tr[1]//td[2]//div[contains(@class,'x-grid-cell-inner')]");
const getEngineDetailsYearValue = () => getLocator("//input[@name= 'ModelYear_Ext']");
// const getEngineDetailsMake = () => getLocator("(//td[contains(@class, 'g-cell-edit')])[2]");
// const getEngineDetailsModel = () => getLocator("(//td[contains(@class, 'g-cell-edit')])[3]");
// const getEngineDetailsHorsepower = () => getLocator("//div[contains(@id,'EngineDetails_ExtLV')]//table//tbody//tr//td[5]//div[contains(@class,'x-grid-cell-inner')]");
// const getEngineDetailsHorsePowerValue = () => getLocator("//input[@name= 'HorsePower_Ext']");
// const getEngineDetailsSerialNo = () => getLocator("//div[contains(@id,'EngineDetails_ExtLV')]//table//tbody//tr//td[6]//div[contains(@class,'x-grid-cell-inner')]");
const getEngineDetailsYear = (engineNum:any) => getLocator(`//div[contains(@id,'EngineDetails_ExtLV')]//tr[@data-recordindex='${engineNum}']/td[2]`);
const getEngineDetailsMake = (engineNum:any) => getLocator(`//div[contains(@id,'EngineDetails_ExtLV')]//tr[@data-recordindex='${engineNum}']/td[3]`);
const getEngineDetailsModel = (engineNum:any) => getLocator(`//div[contains(@id,'EngineDetails_ExtLV')]//tr[@data-recordindex='${engineNum}']/td[4]`);
const getEngineDetailsHorsepower = (engineNum:any) => getLocator(`//div[contains(@id,'EngineDetails_ExtLV')]//tr[@data-recordindex='${engineNum}']/td[5]`);
const getEngineDetailsSerialNo = (engineNum:any) => getLocator(`//div[contains(@id,'EngineDetails_ExtLV')]//tr[@data-recordindex='${engineNum}']/td[6]`);

const getEngineDetailsSerialNumber = () => getLocator("//input[@name= 'SerialNumber_Ext']");
const getMooringStateYesButton = () => getLocator("//div[contains(text(), 'mooring states?')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getMooringStateNoButton = () => getLocator("//div[contains(text(), 'mooring states?')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
// Trailer Serial Number locator
const getSerialNumber = () => getLocator("//input[contains(@id, 'VIN') or contains(@id, 'SerialNumber') or contains(@id, 'Serial') or contains(@id, 'serial') or contains(@id, 'Vin_DV')]");

// Antique-specific Locators
const getCondition = () => getLocator("//input[contains(@id, 'Condition')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getRestoration = () => getLocator("//input[contains(@id, 'Restoration')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");

// ========================================
// CONSTANTS
// ========================================

const HP_FIELD = "Total_Horsepower";
const ALT_HP_FIELD = "Engine_Size/Total_Horsepower";

// ========================================
// HELPER FUNCTIONS
// ========================================

async function clickAddVehicleButton() {
  console.log(`🔍 Attempting to click Add Vehicle button...`);
  try {
    const addButton = getAddVehicleButton();
    const isVisible = await addButton.isVisible({ timeout: 5000 });
    console.log(`🔍 Add Vehicle button visible: ${isVisible}`);
    
    if (isVisible) {
      await addButton.scrollIntoViewIfNeeded();
      await wait(1000);
      await addButton.click({ force: true, timeout: 5000 });
      console.log(`✅ Successfully clicked Add Vehicle button`);
      await wait(2000); // Wait for any dropdown or menu to appear
    } else {
      throw new Error("Add Vehicle button not visible");
    }
  } catch (error) {
    console.log(`❌ Error clicking Add Vehicle button: ${error}`);
    throw error;
  }
}

async function clickNewVehicleButton() {
  console.log(`🔍 Attempting to click New Vehicle button...`);
  try {
    const newButton = getNewVehicleButton();
    const isVisible = await newButton.isVisible({ timeout: 5000 });
    console.log(`🔍 New Vehicle button visible: ${isVisible}`);
    
    if (isVisible) {
      await newButton.scrollIntoViewIfNeeded();
      await wait(1000);
      await newButton.click({ force: true, timeout: 5000 });
      console.log(`✅ Successfully clicked New Vehicle button`);
      await wait(3000); // Wait for new vehicle form to load
    } else {
      throw new Error("New Vehicle button not visible");
    }
  } catch (error) {
    console.log(`❌ Error clicking New Vehicle button: ${error}`);
    throw error;
  }
}
async function selectVehicleType(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await getVehicleType().scrollIntoViewIfNeeded();
    await getVehicleType().click({ force: true }).catch(() => { });
    await wait(1000);

    try {
      // Verify dropdown list is visible
      const dropdownList = getLocator(`//ul[@class='x-list-plain']`);
      await dropdownList.waitFor({ state: "visible", timeout: 2000 });
      
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      await click(optionLocator);
      console.log(`✅ Selected Vehicle Type: '${value}' on attempt ${attempt}`);
      return;
    } catch {
      console.log(`⚠️ Vehicle Type dropdown not opened on attempt ${attempt}, retrying...`);
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectVehicleType: option '${value}' not found after ${maxAttempts} attempts`);
}

// ========================================
// ORDER TERRITORY CODE HANDLER (STATE AWARE)
// ========================================
async function handleOrderTerritoryCode() {
  const orderBtn = getOrderTerritoryCode();

  if (await isElementVisible(orderBtn)) {
    try {
      const text = (await orderBtn.textContent())?.trim();
      console.log(`🔍 Territory button text: ${text}`);

      // ✅ Case 1: Needs click
      if (text?.includes("Order Territory Code")) {
        console.log(`✅ Needs ordering → clicking`);

        for (let attempt = 1; attempt <= 2; attempt++) {
          await orderBtn.scrollIntoViewIfNeeded();
          await wait(1500);
          await orderBtn.click({ force: true });
          await wait(3000);

          const updatedText = (await orderBtn.textContent())?.trim();
          console.log(`🔄 After click attempt ${attempt}: ${updatedText}`);

          if (updatedText?.includes("Reorder")) {
            console.log(`✅ Territory successfully applied`);
            return;
          }
        }

        console.warn(`⚠️ Territory click attempted but state did not change`);

      }

      // ✅ Case 2: Already applied
      else if (text?.includes("Reorder")) {
        console.log(`✅ Territory already applied — skipping click`);
      }

      // ⚠️ Unknown state
      else {
        console.warn(`⚠️ Unknown Territory button state: ${text}`);
      }

    } catch (err) {
      console.warn(`⚠️ Error handling Order Territory Code:`, err);
    }
  } else {
    console.log(`ℹ️ Order Territory Code button not visible`);
  }
}

async function fillYearValue(year:number) {
  await getYear().click({force: true});
  await fill(getYear(),year.toString());
  await wait(5000);
}

async function selectMake(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()="${value}"]`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await wait(2000);
    await getMake().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await wait(2000);
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

async function selectStorageType(value: any) {
  console.log(`🔄 Selecting Storage Type: ${value}`);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await getStorageType().click({ force: true }).catch(() => { });

    try {
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      await click(optionLocator);
      console.log(`✅ Storage Type selected: '${value}' on attempt ${attempt}`);
      await wait(1000);
      
      // Verify selection persisted
      try {
        const currentValue = await getStorageType().inputValue({ timeout: 2000 });
        if (currentValue && currentValue.includes(value)) {
          console.log(`✅ Storage Type verified: ${value}`);
          return;
        } else {
          console.log(`⚠️ Storage Type didn't persist, got: "${currentValue}"`);
          if (attempt < maxAttempts) continue; // Retry
        }
      } catch (verifyError) {
        console.log(`⚠️ Could not verify Storage Type: ${verifyError}`);
      }
      return;
    } catch {
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectStorageType: option '${value}' not found after ${maxAttempts} attempts`);
}

async function fillValue(value:number) {
  console.log(`💰 Filling Value: ${value}`);
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    await getValue().click({ force: true });
    await wait(500);
    await getValue().clear();
    await wait(300);
    await fill(getValue(), value.toString());
    await wait(500);
    
    // Press Tab to commit
    await getValue().press('Tab');
    await wait(2000);
    
    // Verify value persisted
    try {
      const filledValue = await getValue().inputValue({ timeout: 3000 });
      if (filledValue === value.toString()) {
        console.log(`✅ Value verified: ${value}`);
        return;
      } else {
        console.log(`⚠️ Value didn't persist (attempt ${attempt}), expected "${value}", got "${filledValue}"`);
        if (attempt < 3) {
          await wait(1000);
          continue; // Retry
        }
      }
    } catch (verifyError) {
      console.log(`⚠️ Could not verify Value: ${verifyError}`);
    }
  }
  
  console.log(`✅ Completed fillValue after all attempts`);
}

async function fillValueList(value:number) {
  console.log(`💰 Filling Value List: ${value}`);
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    await getValueList().click({ force: true });
    await wait(500);
    await getValueList().clear();
    await wait(300);
    await fill(getValueList(), value.toString());
    await wait(500);
    
    // Press Tab to commit
    await getValueList().press('Tab');
    await wait(2000);
    
    // Verify value persisted
    try {
      const filledValue = await getValueList().inputValue({ timeout: 3000 });
      if (filledValue === value.toString()) {
        console.log(`✅ Value List verified: ${value}`);
        return;
      } else {
        console.log(`⚠️ Value List didn't persist (attempt ${attempt}), expected "${value}", got "${filledValue}"`);
        if (attempt < 3) {
          await wait(1000);
          continue; // Retry
        }
      }
    } catch (verifyError) {
      console.log(`⚠️ Could not verify Value List: ${verifyError}`);
    }
  }
  
  console.log(`✅ Completed fillValueList after all attempts`);
}

async function selectLength(value: any, page: Page) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await getLength().click({ force: true }).catch(() => { });

    try {
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      await click(optionLocator);
      console.log(`✅ Selected Boat Length: '${value}' on attempt ${attempt}`);
      return;
    } catch {
      await wait(attemptDelay);
    }
  }
}
async function fillHullID(hullID: any) {
  if (await isElementVisible(getHullID())) {
    await getHullID().click({ force: true });
    await fill(getHullID(), hullID.toString());
    await wait(2000);
    console.log(`✅ Filled Hull ID: ${hullID}`);
  }
}

async function fillSerialNumber(serialNumber: any) {
  if (await isElementVisible(getSerialNumber())) {
    await getSerialNumber().click({ force: true });
    await fill(getSerialNumber(), serialNumber.toString());
    await wait(2000);
    console.log(`✅ Filled Serial Number: ${serialNumber}`);
  }
}

async function selectHullConstruction(page: Page, value: any) {
  console.log(`🔄 Selecting Hull Construction: "${value}"`);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Clicking Hull Construction dropdown...`);
    await getHullConstruction().click({ force: true }).catch(() => { });
    await wait(1500);

    try {
      // Check if dropdown opened and log available options
      const dropdownList = getLocator(`//ul[@class='x-list-plain']`);
      await dropdownList.waitFor({ state: "visible", timeout: 2000 });
      
      const allOptions = await page.locator(`//ul[@class='x-list-plain']//li`).allTextContents();
      console.log(`📋 Available Hull Construction options (${allOptions.length} total):`, allOptions);
      
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      await click(optionLocator);
      console.log(`✅ Selected Hull Construction: '${value}' on attempt ${attempt}`);
      return;
    } catch (error) {
      console.log(`⚠️ Hull Construction dropdown not opened or option not found on attempt ${attempt}`);
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectHullConstruction: option '${value}' not found after ${maxAttempts} attempts`);
}

async function fillTotalHorsePower(value: any, page: Page) {
  console.log(`💪 Filling Total Horsepower: ${value}`);
  
  let horsepowerSuccess = false;
  const maxAttempts = 3;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Filling Total Horsepower with value ${value}...`);
    
    await getHorsePower().click({ force: true });
    await wait(500);
    await getHorsePower().clear();
    await wait(300);
    await getHorsePower().fill(value.toString());
    await wait(1000);
    
    // Press Tab to commit value (ExtJS best practice)
    await getHorsePower().press('Tab');
    await wait(1000);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await wait(500);
    
    // Verify value persisted
    try {
      const verifyHP = await getHorsePower().inputValue({ timeout: 3000 });
      console.log(`🔍 Total Horsepower verification (attempt ${attempt}) - Field contains: "${verifyHP}"`);
      
      if (verifyHP === value.toString()) {
        console.log(`✅ Total Horsepower filled successfully: ${verifyHP}`);
        horsepowerSuccess = true;
        return;
      } else if (verifyHP.trim() === '') {
        console.log(`⚠️ Total Horsepower field is EMPTY after fill (attempt ${attempt})`);
        if (attempt < maxAttempts) {
          await wait(1000);
          continue; // Retry
        }
      } else {
        console.log(`⚠️ Total Horsepower shows "${verifyHP}" instead of "${value}" (attempt ${attempt})`);
        if (attempt < maxAttempts) {
          await wait(1000);
          continue; // Retry
        }
      }
    } catch (error) {
      console.log(`⚠️ Could not verify Total Horsepower value (attempt ${attempt}): ${error}`);
      if (attempt < maxAttempts) {
        await wait(1000);
        continue; // Retry
      }
    }
  }
  
  if (!horsepowerSuccess) {
    console.log(`⚠️ WARNING: Total Horsepower may not be correct after ${maxAttempts} attempts`);
  }
}

// ========================================
// ENGINE DETAILS FUNCTIONS
// ========================================
async function clickEngineAddButton(page: Page) {
  const maxAttempts = 5;
  let success = false;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempting to click Engine Add button (attempt ${attempt}/${maxAttempts})...`);
    
    try {
      if (await isElementVisible(getEngineAddButton())) {
        await getEngineAddButton().click({ force: true });
        await wait(2000); // Initial wait for click to register
        
        // Wait for page to load after adding engine row
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
        await wait(2000); // Additional wait for grid to stabilize
        
        // Verify a new row was added by checking if the grid has rows
        const gridRows = await getLocator("//div[contains(@id,'EngineDetails_ExtLV')]//tr[contains(@class,'x-grid-row')]").count();
        console.log(`📊 Grid rows after click: ${gridRows}`);
        
        if (gridRows > 0) {
          console.log(`✅ Engine Add button clicked successfully (attempt ${attempt})`);
          success = true;
          break;
        } else {
          console.log(`⚠️ No grid rows found after click (attempt ${attempt}), retrying...`);
          await wait(2000);
        }
      } else {
        console.log(`⚠️ Engine Add button not visible (attempt ${attempt})`);
        await wait(2000);
      }
    } catch (error) {
      console.log(`⚠️ Error clicking Engine Add button (attempt ${attempt}): ${error}`);
      await wait(2000);
    }
  }
  
  if (!success) {
    throw new Error(`❌ Failed to click Engine Add button after ${maxAttempts} attempts`);
  }
  
  // Final stabilization wait before returning
  await wait(1000);
  console.log(`✅ Engine row added and stabilized`);
}


async function fillEngineYear(
  value: number,
  page: Page,
  engineNum: number
) {
  const yearCell = getEngineDetailsYear(engineNum);

  // 1️⃣ Activate ExtJS editor
  await yearCell.dblclick({ force: true });

  // 2️⃣ Target the correct editor by name
  const editorInput = page.locator("//input[@name='ModelYear_Ext']");

  await editorInput.waitFor({ state: "visible" });
  await editorInput.fill(value.toString());

  // 3️⃣ Commit the value
  // await page.keyboard.press("Enter");

  await wait(300);
}

async function selectEngineMake(page: Page, value: any,engineNum:any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getEngineDetailsMake(engineNum).click({ force: true }).catch(() => { });
    await wait(4000);
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectEngineMake: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectEngineMake: option '${value}' not found after ${maxAttempts} attempts`);
}

async function selectEngineModel(page: Page, value: any,engineNum:any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getEngineDetailsModel(engineNum).click({ force: true }).catch(() => { });
    await wait(4000);
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 16000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectEngineModel: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectEngineModel: option '${value}' not found after ${maxAttempts} attempts`);
}

async function fillEngineHorsePower(
  value: any,
  page: Page,
  engineNum: number
) {
  console.log(`🔍 Filling Engine ${engineNum + 1} Horsepower: ${value}`);
 
  const cell = getEngineDetailsHorsepower(engineNum);

  // Wait for cell to be attached to DOM first
  console.log(`⏳ Waiting for Horsepower cell to exist in DOM...`);
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
 
  // Try double-click with multiple attempts
  console.log(`🖱️ Double-clicking Horsepower cell for Engine ${engineNum + 1}...`);
  let editorAppeared = false;
 
  for (let attempt = 1; attempt <= 3; attempt++) {
    await cell.dblclick({ force: true });
    await wait(2000);
   
    // Check if editor appeared
    const editorInput = page.locator("//input[@name='HorsePower_Ext']");
    try {
      await editorInput.waitFor({ state: "attached", timeout: 3000 });
      editorAppeared = true;
      console.log(`✅ Editor appeared on attempt ${attempt}`);
      break;
    } catch {
      console.log(`⚠️ Editor didn't appear on attempt ${attempt}, retrying...`);
      // Click somewhere else first to reset focus
      await page.keyboard.press('Escape');
      await wait(500);
    }
  }
 
  if (!editorAppeared) {
    throw new Error(`❌ Failed to activate Horsepower editor for Engine ${engineNum + 1} after 3 attempts`);
  }

  const editorInput = page.locator("//input[@name='HorsePower_Ext']");
 
  // Use JavaScript to force focus and fill (bypasses visibility)
  console.log(`📝 Setting Horsepower value: ${value}`);
  await page.evaluate((val) => {
    const input = document.querySelector("input[name='HorsePower_Ext']") as HTMLInputElement;
    if (input) {
      input.focus();
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, value.toString());
 
  await wait(500);
 
  // Press Tab to commit
  console.log(`↹ Pressing Tab to commit Horsepower...`);
  await page.keyboard.press('Tab');
  await wait(2000); // Wait for ExtJS to process the commit
 
  // Verify value persisted in the grid cell
  console.log(`🔍 Verifying Horsepower value persisted in grid...`);
  try {
    const cellText = await cell.textContent({ timeout: 3000 });
    console.log(`📊 Grid cell shows: "${cellText}"`);
   
    if (!cellText || !cellText.includes(value.toString())) {
      console.log(`⚠️ Value didn't persist! Expected "${value}", got "${cellText}". Retrying with Enter key...`);
     
      // Retry: Click cell again and use Enter instead of Tab
      await cell.dblclick({ force: true });
      await wait(1500);
     
      await page.evaluate((val) => {
        const input = document.querySelector("input[name='HorsePower_Ext']") as HTMLInputElement;
        if (input) {
          input.focus();
          input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, value.toString());
     
      await wait(500);
      await page.keyboard.press('Enter'); // Try Enter instead of Tab
      await wait(2000);
     
      const retryText = await cell.textContent({ timeout: 3000 });
      console.log(`🔄 Retry - Grid cell shows: "${retryText}"`);
    } else {
      console.log(`✅ Value confirmed in grid: "${cellText}"`);
    }
  } catch (verifyError) {
    console.log(`⚠️ Could not verify grid value: ${verifyError}`);
  }
 
  console.log(`✅ Engine ${engineNum + 1} Horsepower filled: ${value}`);
}

async function fillEngineSerialNo(
  value: any,
  page: Page,
  engineNum: number
) {
  console.log(`🔍 Filling Engine ${engineNum + 1} Serial Number: ${value}`);
  
  const cell = getEngineDetailsSerialNo(engineNum);
  
  // Wait for cell to be attached
  await cell.waitFor({ state: 'attached', timeout: 5000 });
  await wait(500);
  
  // Click somewhere neutral first to ensure previous editor is closed
  try {
    console.log(`🖱️ Clicking Engine Details grid to reset focus...`);
    const gridContainer = getLocator("//div[contains(@id,'EngineDetails_ExtLV')]");
    await gridContainer.click({ force: true, position: { x: 10, y: 10 } });
    await wait(500);
  } catch (resetError) {
    console.log(`⚠️ Could not reset focus: ${resetError}`);
  }
  
  // Scroll cell into view
  try {
    await cell.scrollIntoViewIfNeeded({ timeout: 5000 });
    await wait(500);
  } catch (scrollError) {
    console.log(`⚠️ Scroll failed: ${scrollError}`);
  }
  
  // Double-click to activate editor
  console.log(`🖱️ Double-clicking Serial Number cell for Engine ${engineNum + 1}...`);
  await cell.dblclick({ force: true });
  await wait(2000);

  const editorInput = page.locator("//input[@name='SerialNumber_Ext']");

  try {
    // Wait for editor to become visible (not just attached)
    await editorInput.waitFor({ state: "visible", timeout: 5000 });
    console.log(`✅ Serial Number editor is visible`);
  } catch (visibilityError) {
    console.log(`⚠️ Editor not visible after dblclick, trying click + dblclick...`);
    
    // Retry: Click cell first, then double-click
    await cell.click({ force: true });
    await wait(500);
    await cell.dblclick({ force: true });
    await wait(2000);
    
    await editorInput.waitFor({ state: "visible", timeout: 5000 });
  }

  // Fill the serial number
  await editorInput.fill(value.toString());
  // await wait(500);
  
  // // Blur the input to commit the value (cleanest way - no navigation, no clicks)
  //await editorInput.blur();
  await wait(1000);
  
  console.log(`✅ Engine ${engineNum + 1} Serial Number filled: ${value}`);
}

async function selectEngineType(page: Page, value: any) {
  if (await isElementVisible(getEngineType())) {
    console.log(`🔄 Selecting Engine Type: "${value}"`);
    const maxAttempts = 8;
    const attemptDelay = 500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Clicking Engine Type dropdown...`);
      await getEngineType().click({ force: true }).catch(() => { });
      await wait(1500);

      // Always try to capture available options from the LAST dropdown (most recently opened)
      try {
        const allDropdowns = page.locator(`//ul[@class='x-list-plain']`);
        const dropdownCount = await allDropdowns.count();
        console.log(`📊 Found ${dropdownCount} dropdown(s) on page`);
        
        // Use .last() to get the most recently opened dropdown
        const lastDropdown = allDropdowns.last();
        await lastDropdown.waitFor({ state: "attached", timeout: 2000 });
        
        const optionsList = lastDropdown.locator(`//li`);
        const allOptions = await optionsList.allTextContents();
        if (allOptions.length > 0) {
          console.log(`📋 Available Engine Type options (${allOptions.length} total):`, allOptions);
        } else {
          console.log(`⚠️ No options found in dropdown list`);
        }
      } catch (optionsError) {
        console.log(`⚠️ Could not retrieve dropdown options: ${optionsError}`);
      }

      try {
        // Check if dropdown opened - use .last() to get the most recently opened one
        const dropdownList = page.locator(`//ul[@class='x-list-plain']`).last();
        await dropdownList.waitFor({ state: "visible", timeout: 2000 });
        console.log(`✅ Dropdown list is visible`);
        
        // Select option from the last dropdown
        const optionLocator = dropdownList.locator(`//li[text()='${value}']`);
        await optionLocator.waitFor({ state: "visible", timeout: 1000 });
        await click(optionLocator);
        console.log(`✅ Selected Engine Type: '${value}' on attempt ${attempt}`);
        return;
      } catch (error) {
        console.log(`⚠️ Engine Type dropdown not opened or option '${value}' not found on attempt ${attempt}`);
        console.log(`⚠️ Error details: ${error}`);
        await wait(attemptDelay);
      }
    }

    throw new Error(`selectEngineType: option '${value}' not found after ${maxAttempts} attempts`);
  }
}

async function selectFuelType(page: Page, value: any) {
  if (await isElementVisible(getFuelType())) {
    console.log(`🔄 Selecting Fuel Type: "${value}"`);
    const maxAttempts = 8;
    const attemptDelay = 500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Clicking Fuel Type dropdown...`);
      await getFuelType().click({ force: true }).catch(() => { });
      await wait(1500);

      // Always try to capture available options from the LAST dropdown
      try {
        const allDropdowns = page.locator(`//ul[@class='x-list-plain']`);
        const dropdownCount = await allDropdowns.count();
        console.log(`📊 Found ${dropdownCount} dropdown(s) on page`);
        
        const lastDropdown = allDropdowns.last();
        await lastDropdown.waitFor({ state: "attached", timeout: 2000 });
        
        const optionsList = lastDropdown.locator(`//li`);
        const allOptions = await optionsList.allTextContents();
        if (allOptions.length > 0) {
          console.log(`📋 Available Fuel Type options (${allOptions.length} total):`, allOptions);
        } else {
          console.log(`⚠️ No options found in dropdown list`);
        }
      } catch (optionsError) {
        console.log(`⚠️ Could not retrieve dropdown options: ${optionsError}`);
      }

      try {
        // Check if dropdown opened - use .last() to get the most recently opened one
        const dropdownList = page.locator(`//ul[@class='x-list-plain']`).last();
        await dropdownList.waitFor({ state: "visible", timeout: 2000 });
        console.log(`✅ Dropdown list is visible`);
        
        const optionLocator = dropdownList.locator(`//li[text()='${value}']`);
        await optionLocator.waitFor({ state: "visible", timeout: 1000 });
        await click(optionLocator);
        console.log(`✅ Selected Fuel Type: '${value}' on attempt ${attempt}`);
        return;
      } catch (error) {
        console.log(`⚠️ Fuel Type dropdown not opened or option '${value}' not found on attempt ${attempt}`);
        console.log(`⚠️ Error details: ${error}`);
        await wait(attemptDelay);
      }
    }

    throw new Error(`selectFuelType: option '${value}' not found after ${maxAttempts} attempts`);
  }
}

async function selectNumberOfEngines(page: Page, value: any) {
  if (await isElementVisible(getNumberOfEngines())) {
    console.log(`🔄 Selecting Number of Engines: "${value}"`);
    const maxAttempts = 8;
    const attemptDelay = 500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Clicking Number of Engines dropdown...`);
      await getNumberOfEngines().click({ force: true }).catch(() => { });
      await wait(1500);

      // Always try to capture available options from the LAST dropdown
      try {
        const allDropdowns = page.locator(`//ul[@class='x-list-plain']`);
        const dropdownCount = await allDropdowns.count();
        console.log(`📊 Found ${dropdownCount} dropdown(s) on page`);
        
        const lastDropdown = allDropdowns.last();
        await lastDropdown.waitFor({ state: "attached", timeout: 2000 });
        
        const optionsList = lastDropdown.locator(`//li`);
        const allOptions = await optionsList.allTextContents();
        if (allOptions.length > 0) {
          console.log(`📋 Available Number of Engines options (${allOptions.length} total):`, allOptions);
        } else {
          console.log(`⚠️ No options found in dropdown list`);
        }
      } catch (optionsError) {
        console.log(`⚠️ Could not retrieve dropdown options: ${optionsError}`);
      }

      try {
        // Check if dropdown opened - use .last() to get the most recently opened one
        const dropdownList = page.locator(`//ul[@class='x-list-plain']`).last();
        await dropdownList.waitFor({ state: "visible", timeout: 2000 });
        console.log(`✅ Dropdown list is visible`);
        
        const optionLocator = dropdownList.locator(`//li[text()='${value}']`);
        await optionLocator.waitFor({ state: "visible", timeout: 1000 });
        await click(optionLocator);
        console.log(`✅ Selected Number of Engines: '${value}' on attempt ${attempt}`);
        return;
      } catch (error) {
        console.log(`⚠️ Number of Engines dropdown not opened or option '${value}' not found on attempt ${attempt}`);
        console.log(`⚠️ Error details: ${error}`);
        await wait(attemptDelay);
      }
    }

    throw new Error(`selectNumberOfEngines: option '${value}' not found after ${maxAttempts} attempts`);
  }
}

async function fillWeight(weight: any) {
  if (await isElementVisible(getWeight())) {
    await getWeight().click({ force: true });
    await fill(getWeight(), weight.toString());
    await wait(1000);
    // Use blur() to commit value without navigation
    await getWeight().blur();
    await wait(2000);
    console.log(`✅ Filled Weight: ${weight}`);
  }
}

async function fillSpeed(speed: any, page: Page) {
  if (await isElementVisible(getSpeed())) {
    console.log(`🔍 Filling Speed: ${speed}`);
    
    const maxAttempts = 20; // Increase to ensure exact value
    let filledValue = '';
    
    // Keep trying until the exact value is entered
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Entering Speed value ${speed}...`);
      
      // Click and clear the field
      await getSpeed().click({ force: true });
      await wait(300);
      await getSpeed().clear();
      await wait(300);
      
      // Fill the value
      await getSpeed().fill(speed.toString());
      console.log(`📝 Filled field with: ${speed}`);
      await wait(800);
      
      // Use blur() to commit value
      await getSpeed().blur();
      await wait(1500);
      
      // Wait for page to settle
      try {
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      } catch (loadError) {
        console.log(`⚠️ Page load wait timed out on attempt ${attempt}`);
      }
      await wait(1000);
      
      // Verify the exact value
      try {
        filledValue = await getSpeed().inputValue({ timeout: 3000 });
        console.log(`✅ Verified Speed (attempt ${attempt}): "${filledValue}" (expecting: "${speed}")`);
        
        // Check if exact match
        if (filledValue === speed.toString()) {
          console.log(`✅✅ EXACT MATCH! Speed filled successfully: ${filledValue}`);
          return; // Success - exit the function
        } else {
          console.log(`⚠️ Value mismatch: got "${filledValue}" instead of "${speed}" - RETRYING...`);
          await wait(1000);
          continue; // Retry
        }
      } catch (verifyError) {
        console.log(`⚠️ Error verifying Speed (attempt ${attempt}): ${verifyError}`);
        await wait(1000);
        continue; // Retry
      }
    }
    
    // Final warning if exact value not achieved
    if (filledValue !== speed.toString()) {
      console.log(`❌ CRITICAL WARNING: Speed value is "${filledValue}" but should be "${speed}" after ${maxAttempts} attempts!`);
    }
  }
}

async function selectVehicleRecovery(value: any) {
  const normalized = value?.toString().trim().toLowerCase();
  const shouldSelectYes = normalized === "yes" || normalized === "true";
  const shouldSelectNo = normalized === "no" || normalized === "false";

  const isRecoveryOptionSelected = async (optionLabel: any): Promise<boolean> => {
    const inputId = (await optionLabel.getAttribute("for").catch(() => "")) || "";
    if (inputId) {
      const input = getLocator(`//*[@id="${inputId}"]`);
      return await input.isChecked().catch(() => false);
    }

    return false;
  };

  if (!shouldSelectYes && !shouldSelectNo) {
    console.log(`⚠️ selectVehicleRecovery skipped: invalid value '${value}'`);
    return;
  }

  const yesVisible = await isElementVisible(getYesVehicleRecovery());
  const noVisible = await isElementVisible(getNoVehicleRecovery());

  if (!yesVisible && !noVisible) {
    console.log(`⚠️ Vehicle Recovery options are not visible - skipping selection`);
    return;
  }

  const target = shouldSelectYes ? getYesVehicleRecovery() : getNoVehicleRecovery();
  const targetText = shouldSelectYes ? "Yes" : "No";

  if (await isRecoveryOptionSelected(target)) {
    console.log(`✅ Vehicle Recovery already selected: ${targetText}`);
    return;
  }

  await target.click({ force: true }).catch(() => {});
  await wait(700);

  if (await isRecoveryOptionSelected(target)) {
    console.log(`✅ Selected Vehicle Recovery: ${targetText}`);
    await wait(1200);
    return;
  }

  console.log(`⚠️ Vehicle Recovery selection did not persist for: ${targetText}`);
}

async function selectVehicleIneligible(value: any) {
  if (await isElementVisible(getYesVehicleIneligible()) || await isElementVisible(getNoVehicleIneligible())) {
    if (value === "Yes") {
      await getYesVehicleIneligible().click({ force: true });
      console.log(`✅ Selected Vehicle Ineligible: Yes`);
    } else {
      await getNoVehicleIneligible().click({ force: true });
      console.log(`✅ Selected Vehicle Ineligible: No`);
    }
    await wait(2000);
  }
}

async function selectMooringState(value: any) {
  const normalized = value?.toString().trim().toLowerCase();
  const shouldSelectYes = normalized === "yes" || normalized === "true";
  const shouldSelectNo = normalized === "no" || normalized === "false";

  if (!shouldSelectYes && !shouldSelectNo) {
    console.log(`⚠️ selectMooringState skipped: invalid value '${value}'`);
    return;
  }

  if (!(await isElementVisible(getMooringStateYesButton())) && !(await isElementVisible(getMooringStateNoButton()))) {
    console.log(`ℹ️ Mooring State options are not visible - skipping selection`);
    return;
  }

  const maxAttempts = 3;
  const target = shouldSelectYes ? getMooringStateYesButton() : getMooringStateNoButton();
  const targetText = shouldSelectYes ? "Yes" : "No";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await target.click({ force: true }).catch(() => { });
    await wait(700);

    const targetClass = (await target.getAttribute("class").catch(() => "")) || "";
    if (targetClass.includes("x-form-cb-checked")) {
      console.log(`✅ Selected Mooring State: ${targetText} (attempt ${attempt})`);
      await wait(1200);
      return;
    }

    console.log(`⚠️ Mooring State '${targetText}' did not stick on attempt ${attempt}, retrying...`);
    await wait(800);
  }

  console.log(`❌ Failed to persist Mooring State: ${targetText} after ${maxAttempts} attempts`);
}

// ========================================
// STORAGE AND MOORING ADDRESS FUNCTIONS
// ========================================
// Helper function to parse address from Excel format: "37757 SABRA LN,Palmdale,93552-4117"
function splitStorageAddress(fullAddress: string) {
  const parts = fullAddress.split(",");
  const parsedLine1 = parts[0]?.trim() || "";
  const parsedCity = parts[1]?.trim() || "";
  const stateZip = parts[2]?.trim() || "";
  const parsedZip = stateZip.match(/\d+(-\d+)?/)?.[0] || "";
  return { parsedLine1, parsedCity, parsedZip };
}

// Helper function to normalize address for comparison (removes HTML tags, extra spaces)
function normalizeAddress(address: string): string {
  return address
    .replace(/<br\s*\/?>/gi, " ") // Replace <br> with space
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim()
    .toLowerCase();
}

async function selectStorageAddress(page: Page, VehicleData: any) {
  // Support both formats:
  // 1. Single column: VehicleData["Storage_Address"] = "37757 SABRA LN,Palmdale,93552-4117"
  // 2. Separate columns: VehicleData["Storage_Address_Line_1"], VehicleData["Storage_Address_City"], VehicleData["Storage_Address_State"], VehicleData["Storage_Address_Zip"]
  
  let parsedLine1 = "";
  let parsedCity = "";
  let parsedState = "";
  let parsedZip = "";
  let addressForComparison = "";

  // Check if separate columns exist
  if (VehicleData["Storage_Address_Line_1"] || VehicleData["Storage_Address_City"] || VehicleData["Storage_Address_Zip"]) {
    console.log(`🏠 Processing Storage Address from separate columns`);
    parsedLine1 = VehicleData["Storage_Address_Line_1"]?.toString().trim() || "";
    parsedCity = VehicleData["Storage_Address_City"]?.toString().trim() || "";
    parsedState = VehicleData["Storage_Address_State"]?.toString().trim() || "";
    parsedZip = VehicleData["Storage_Address_Zip"]?.toString().trim() || "";
    
    // Build comparison string
    addressForComparison = `${parsedLine1} ${parsedCity} ${parsedState} ${parsedZip}`.trim();
    if (isSameAsAccountAddress(addressForComparison) || !addressForComparison) {
      console.log(`ℹ️ Storage address is the same as account address, skipping`);
      return;
    }
    console.log(`📋 Separate columns data:`);
    console.log(`   Address Line 1: ${parsedLine1}`);
    console.log(`   City: ${parsedCity}`);
    console.log(`   State: ${parsedState}`);
    console.log(`   Zip: ${parsedZip}`);
  } else if (VehicleData["Storage_Address"]) {
    console.log(`🏠 Processing Storage Address from single column`);
    const singleAddress = VehicleData["Storage_Address"].toString();
    const parsed = splitStorageAddress(singleAddress);
    parsedLine1 = parsed.parsedLine1;
    parsedCity = parsed.parsedCity;
    parsedZip = parsed.parsedZip;
    addressForComparison = singleAddress;
    
    console.log(`📋 Single column data: ${singleAddress}`);
  } else {
    console.log(`⚠️ No storage address data provided, skipping`);
    return;
  }

  // Skip if no address data
  if (!parsedLine1 && !parsedCity && !parsedZip) {
    console.log(`⚠️ Storage address data is empty, skipping`);
    return;
  }
 
  // Read the prefilled address from display field
  if (await isElementVisible(getStorageAddressDisplay())) {
    const displayedAddress = await getStorageAddressDisplay().textContent();
    console.log(`📋 Current displayed storage address: ${displayedAddress}`);
   
    // Normalize both addresses for comparison
    const normalizedDisplay = normalizeAddress(displayedAddress || "");
    const normalizedExcel = normalizeAddress(addressForComparison);
   
    console.log(`🔍 Comparing addresses:`);
    console.log(`   Display (normalized): ${normalizedDisplay}`);
    console.log(`   Excel (normalized): ${normalizedExcel}`);
   
    // Check if addresses match (compare address line 1)
    if (normalizedDisplay.includes(parsedLine1.toLowerCase())) {
      console.log(`✅ Storage address matches displayed address - no change needed`);
      return;
    }
   
    console.log(`🔄 Storage address is different - creating new address`);
   
    // Click Change button
    if (await isElementVisible(getStorageChangeButton())) {
      await getStorageChangeButton().click({ force: true });
      await wait(1000);
      console.log(`✅ Clicked Storage Change button`);
     
      // Click "New Address" option
      if (await isElementVisible(getStorageNewAddressOption())) {
        await getStorageNewAddressOption().click({ force: true });
        await wait(2000);
        console.log(`✅ Clicked New Address option`);
       
        console.log(`📝 Filling new storage address:`);
        console.log(`   Address Line 1: ${parsedLine1}`);
        console.log(`   City: ${parsedCity}`);
        console.log(`   Zip: ${parsedZip}`);
       
        // Fill Address Line 1 (mandatory)
        if (parsedLine1) {
          await wait(1000); // Wait for form to be ready
          const addressLine1 = getStorageAddressLine1();
          await addressLine1.waitFor({ state: 'visible', timeout: 5000 });
          await addressLine1.click({ force: true });
          await addressLine1.fill(parsedLine1);
          await wait(500);
          console.log(`✅ Filled Storage Address Line 1: ${parsedLine1}`);
        }
       
        // Fill City (mandatory)
        if (parsedCity) {
          await wait(500);
          const cityField = getStorageCity();
          await cityField.waitFor({ state: 'visible', timeout: 5000 });
          await cityField.click({ force: true });
          await cityField.clear();
          await wait(300);
          await cityField.fill(parsedCity);
          await wait(500);
          console.log(`✅ Filled Storage City: ${parsedCity}`);
        }
       
        // Check and fill State (manual if provided, otherwise auto-populate from zip)
        await wait(500);
        const stateField = getStorageState();
        
        // If State is provided in separate column, check if it needs to be filled
        if (parsedState) {
          try {
            await stateField.waitFor({ state: 'visible', timeout: 3000 });
            
            // Check current state value first
            const currentStateValue = await stateField.textContent();
            const currentStateNormalized = currentStateValue?.trim().toUpperCase() || '';
            const desiredStateNormalized = parsedState.trim().toUpperCase();
            
            if (currentStateNormalized === desiredStateNormalized) {
              console.log(`✅ Storage State already matches: ${currentStateValue} - skipping`);
            } else if (currentStateNormalized && currentStateNormalized !== desiredStateNormalized) {
              console.log(`ℹ️ Storage State prefilled with "${currentStateValue}" but needs "${parsedState}" - attempting to change...`);
              try {
                // State field is a div, need to click it to open dropdown
                await stateField.click({ force: true });
                await wait(500);
                
                // Select desired state from dropdown
                const stateOption = getLocator(`//ul[@class='x-list-plain']//li[contains(text(),'${parsedState}')]`);
                await stateOption.waitFor({ state: 'visible', timeout: 3000 });
                await stateOption.click({ force: true });
                await wait(500);
                console.log(`✅ Storage State changed to: ${parsedState}`);
              } catch (changeError) {
                console.log(`⚠️ Could not change State, keeping prefilled value "${currentStateValue}": ${changeError}`);
              }
            } else {
              // State is empty, fill it
              console.log(`ℹ️ Storage State is empty, filling with: ${parsedState}`);
              await stateField.click({ force: true });
              await wait(500);
              
              const stateOption = getLocator(`//ul[@class='x-list-plain']//li[contains(text(),'${parsedState}')]`);
              await stateOption.waitFor({ state: 'visible', timeout: 3000 });
              await stateOption.click({ force: true });
              await wait(500);
              console.log(`✅ Storage State manually filled: ${parsedState}`);
            }
          } catch (stateError) {
            console.log(`⚠️ Could not process State manually, will try auto-populate: ${stateError}`);
          }
        } else {
          // No State provided, will auto-populate from zip code
          try {
            await stateField.waitFor({ state: 'visible', timeout: 3000 });
            const currentStateValue = await stateField.textContent();
            if (!currentStateValue || currentStateValue.trim() === '') {
              console.log(`ℹ️ State field is empty, will auto-populate after zip code`);
            } else {
              console.log(`✅ Storage State already filled: ${currentStateValue}`);
            }
          } catch (stateError) {
            console.log(`ℹ️ State field check: ${stateError}`);
          }
        }
       
        // Fill Zip Code
        if (parsedZip) {
          await wait(500);
          const zipField = getStorageZipCode();
          await zipField.waitFor({ state: 'visible', timeout: 5000 });
          await zipField.click({ force: true });
          await zipField.fill(parsedZip);
          await wait(1000); // Wait for state to auto-populate
          console.log(`✅ Filled Storage Zip Code: ${parsedZip}`);
          
          // Verify state auto-populated after zip
          try {
            const finalStateValue = await stateField.textContent();
            if (finalStateValue && finalStateValue.trim() !== '') {
              console.log(`✅ State auto-populated: ${finalStateValue}`);
            } else {
              console.log(`⚠️ State did not auto-populate from zip code`);
            }
          } catch (e) {
            console.log(`ℹ️ State verification: ${e}`);
          }
        }
       
        // Click OK button
        if (await isElementVisible(getStorageOkButton())) {
          await getStorageOkButton().click({ force: true });
          await wait(3000); // Wait for address validation and form update
          console.log(`✅ Clicked Storage OK button`);
        }
       
        console.log(`✅ New storage address created successfully`);
      }
    }
  } else {
    console.log(`⚠️ Storage address display field not visible`);
  }
}

async function selectMooringAddressSame(value: any) {
  if (await isElementVisible(getYesMooringAddressSame()) || await isElementVisible(getNoMooringAddressSame())) {
    if (value === "Yes") {
      await getYesMooringAddressSame().click({ force: true });
      console.log(`✅ Selected Mooring Address Same as Storage: Yes`);
    } else {
      await getNoMooringAddressSame().click({ force: true });
      console.log(`✅ Selected Mooring Address Same as Storage: No`);
      await wait(2000);
    }
    await wait(2000);
  }
}

async function selectMooringAddress(page: Page, VehicleData: any) {
  // Support both formats:
  // 1. Single column: VehicleData["Mooring_Address"] = "37757 SABRA LN,Palmdale,93552-4117"
  // 2. Separate columns: VehicleData["Mooring_Address_Line_1"], VehicleData["Mooring_Address_City"], VehicleData["Mooring_Address_State"], VehicleData["Mooring_Address_Zip"]
  
  let parsedLine1 = "";
  let parsedCity = "";
  let parsedState = "";
  let parsedZip = "";
  let addressForComparison = "";

  // Check if separate columns exist
  if (VehicleData["Mooring_Address_Line_1"] || VehicleData["Mooring_Address_City"] || VehicleData["Mooring_Address_Zip"]) {
    console.log(`⚓ Processing Mooring Address from separate columns`);
    parsedLine1 = VehicleData["Mooring_Address_Line_1"]?.toString().trim() || "";
    parsedCity = VehicleData["Mooring_Address_City"]?.toString().trim() || "";
    parsedState = VehicleData["Mooring_Address_State"]?.toString().trim() || "";
    parsedZip = VehicleData["Mooring_Address_Zip"]?.toString().trim() || "";
    
    // Build comparison string
    addressForComparison = `${parsedLine1} ${parsedCity} ${parsedState} ${parsedZip}`.trim();
    if (isSameAsAccountAddress(addressForComparison) || !addressForComparison) {
      console.log(`ℹ️ Storage address is the same as account address, skipping`);
      return;
    }
    console.log(`📋 Separate columns data:`);
    console.log(`   Address Line 1: ${parsedLine1}`);
    console.log(`   City: ${parsedCity}`);
    console.log(`   State: ${parsedState}`);
    console.log(`   Zip: ${parsedZip}`);
  } else if (VehicleData["Mooring_Address"]) {
    console.log(`⚓ Processing Mooring Address from single column`);
    const singleAddress = VehicleData["Mooring_Address"].toString();
    const parsed = splitStorageAddress(singleAddress);
    parsedLine1 = parsed.parsedLine1;
    parsedCity = parsed.parsedCity;
    parsedZip = parsed.parsedZip;
    addressForComparison = singleAddress;
    
    console.log(`📋 Single column data: ${singleAddress}`);
  } else {
    console.log(`⚠️ No mooring address data provided, skipping`);
    return;
  }

  // Skip if no address data
  if (!parsedLine1 && !parsedCity && !parsedZip) {
    console.log(`⚠️ Mooring address data is empty, skipping`);
    return;
  }
 
  // Read the prefilled address from display field
  if (await isElementVisible(getMooringAddressDisplay())) {
    const displayedAddress = await getMooringAddressDisplay().textContent();
    console.log(`📋 Current displayed mooring address: ${displayedAddress}`);
   
    // Normalize both addresses for comparison
    const normalizedDisplay = normalizeAddress(displayedAddress || "");
    const normalizedExcel = normalizeAddress(addressForComparison);
   
    console.log(`🔍 Comparing mooring addresses:`);
    console.log(`   Display (normalized): ${normalizedDisplay}`);
    console.log(`   Excel (normalized): ${normalizedExcel}`);
   
    // Check if addresses match (compare address line 1)
    if (normalizedDisplay.includes(parsedLine1.toLowerCase())) {
      console.log(`✅ Mooring address matches displayed address - no change needed`);
      return;
    }
   
    console.log(`🔄 Mooring address is different - creating new address`);
   
    // Click Change button
    if (await isElementVisible(getMooringChangeButton())) {
      await getMooringChangeButton().click({ force: true });
      await wait(1000);
      console.log(`✅ Clicked Mooring Change button`);
     
      // Click "New Address" option
      if (await isElementVisible(getMooringNewAddressOption())) {
        await getMooringNewAddressOption().click({ force: true });
        await wait(2000);
        console.log(`✅ Clicked New Address option for mooring`);
       
        console.log(`📝 Filling new mooring address:`);
        console.log(`   Address Line 1: ${parsedLine1}`);
        console.log(`   City: ${parsedCity}`);
        console.log(`   Zip: ${parsedZip}`);
       
        // Fill Address Line 1 (mandatory)
        if (parsedLine1) {
          await wait(1000); // Wait for form to be ready
          const addressLine1 = getMooringAddressLine1();
          await addressLine1.waitFor({ state: 'visible', timeout: 5000 });
          await addressLine1.click({ force: true });
          await addressLine1.fill(parsedLine1);
          await wait(500);
          console.log(`✅ Filled Mooring Address Line 1: ${parsedLine1}`);
        }
       
        // Fill City (mandatory)
        if (parsedCity) {
          await wait(500);
          const cityField = getMooringCity();
          await cityField.waitFor({ state: 'visible', timeout: 5000 });
          await cityField.click({ force: true });
          await cityField.clear();
          await wait(300);
          await cityField.fill(parsedCity);
          await wait(500);
          console.log(`✅ Filled Mooring City: ${parsedCity}`);
        }
       
        // Check and fill State (manual if provided, otherwise auto-populate from zip)
        await wait(500);
        const stateField = getMooringState();
        
        // If State is provided in separate column, check if it needs to be filled
        if (parsedState) {
          try {
            await stateField.waitFor({ state: 'visible', timeout: 3000 });
            
            // Check current state value first
            const currentStateValue = await stateField.textContent();
            const currentStateNormalized = currentStateValue?.trim().toUpperCase() || '';
            const desiredStateNormalized = parsedState.trim().toUpperCase();
            
            if (currentStateNormalized === desiredStateNormalized) {
              console.log(`✅ Mooring State already matches: ${currentStateValue} - skipping`);
            } else if (currentStateNormalized && currentStateNormalized !== desiredStateNormalized) {
              console.log(`ℹ️ Mooring State prefilled with "${currentStateValue}" but needs "${parsedState}" - attempting to change...`);
              try {
                await stateField.click({ force: true });
                await wait(500);
                
                const stateOption = getLocator(`//ul[@class='x-list-plain']//li[contains(text(),'${parsedState}')]`);
                await stateOption.waitFor({ state: 'visible', timeout: 3000 });
                await stateOption.click({ force: true });
                await wait(500);
                console.log(`✅ Mooring State changed to: ${parsedState}`);
              } catch (changeError) {
                console.log(`⚠️ Could not change Mooring State, keeping prefilled value "${currentStateValue}": ${changeError}`);
              }
            } else {
              console.log(`ℹ️ Mooring State is empty, filling with: ${parsedState}`);
              await stateField.click({ force: true });
              await wait(500);
              
              const stateOption = getLocator(`//ul[@class='x-list-plain']//li[contains(text(),'${parsedState}')]`);
              await stateOption.waitFor({ state: 'visible', timeout: 3000 });
              await stateOption.click({ force: true });
              await wait(500);
              console.log(`✅ Mooring State manually filled: ${parsedState}`);
            }
          } catch (stateError) {
            console.log(`⚠️ Could not process Mooring State manually, will try auto-populate: ${stateError}`);
          }
        } else {
          // No State provided, will auto-populate from zip code
          try {
            await stateField.waitFor({ state: 'visible', timeout: 3000 });
            const currentStateValue = await stateField.textContent();
            if (!currentStateValue || currentStateValue.trim() === '') {
              console.log(`ℹ️ Mooring State field is empty, will auto-populate after zip code`);
            } else {
              console.log(`✅ Mooring State already filled: ${currentStateValue}`);
            }
          } catch (stateError) {
            console.log(`ℹ️ Mooring State field check: ${stateError}`);
          }
        }
       
        // Fill Zip Code
        if (parsedZip) {
          await wait(500);
          const zipField = getMooringZipCode();
          await zipField.waitFor({ state: 'visible', timeout: 5000 });
          await zipField.click({ force: true });
          await zipField.fill(parsedZip);
          await wait(1000); // Wait for state to auto-populate
          console.log(`✅ Filled Mooring Zip Code: ${parsedZip}`);
          
          // Verify state auto-populated after zip
          try {
            const finalStateValue = await stateField.textContent();
            if (finalStateValue && finalStateValue.trim() !== '') {
              console.log(`✅ Mooring State auto-populated: ${finalStateValue}`);
            } else {
              console.log(`⚠️ Mooring State did not auto-populate from zip code`);
            }
          } catch (e) {
            console.log(`ℹ️ Mooring State verification: ${e}`);
          }
        }
       
        // Click OK button
        if (await isElementVisible(getMooringOkButton())) {
          await getMooringOkButton().click({ force: true });
          await wait(3000); // Wait for address validation and form update
          console.log(`✅ Clicked Mooring OK button`);
        }
       
        console.log(`✅ New mooring address created successfully`);
      }
    }
  } else {
    console.log(`⚠️ Mooring address display field not visible`);
  }
}


async function selectDriverUse(page: Page, value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getDriverUseCell().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectDriverUse: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  // throw new Error(`selectDriverUse: option '${value}' not found after ${maxAttempts} attempts`);
}

async function selectCondition(page: Page, value: any) {
  console.log(`🔄 Selecting Condition: "${value}"`);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Clicking Condition dropdown...`);
    await getCondition().click({ force: true }).catch(() => { });
    await wait(1500);

    try {
      // Check if dropdown opened and log available options
      const dropdownList = getLocator(`//ul[@class='x-list-plain']`);
      await dropdownList.waitFor({ state: "visible", timeout: 2000 });
      
      const allOptions = await page.locator(`//ul[@class='x-list-plain']//li`).allTextContents();
      console.log(`📋 Available Condition options (${allOptions.length} total):`, allOptions);
      
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      await click(optionLocator);
      console.log(`✅ Selected Condition: '${value}' on attempt ${attempt}`);
      return;
    } catch (error) {
      console.log(`⚠️ Condition dropdown not opened or option not found on attempt ${attempt}`);
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectCondition: option '${value}' not found after ${maxAttempts} attempts`);
}

async function selectRestoration(page: Page, value: any) {
  const cleanValue = value.trim();
  console.log(`🔄 Selecting Restoration with cleaned value: "${cleanValue}"`);

  const maxAttempts = 8;
  const attemptDelay = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxAttempts}: Clicking Restoration dropdown...`);

    await getRestoration().click().catch(() => {});
    await wait(1500);

    try {
      const dropdownList = getLocator(`//ul[@class='x-list-plain']`);
      await dropdownList.waitFor({ state: "visible", timeout: 2000 });

      // ✅ FIXED LOCATOR (visible dropdown only)
      const optionLocator = getLocator(
        `//ul[contains(@class,'x-list-plain') and not(contains(@style,'display: none'))]//li[normalize-space()="${cleanValue}"]`
      );

      const allOptions = await page.locator(`//ul[@class='x-list-plain']//li`).allTextContents();
      console.log("📋 RAW OPTIONS:", allOptions.map(o => `[${o}]`));

      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      await click(optionLocator);

      console.log(`✅ Selected Restoration: '${cleanValue}' on attempt ${attempt}`);
      return;

    } catch (error) {
      console.log(`⚠️ Restoration dropdown not opened or option not found on attempt ${attempt}`);
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectRestoration: option '${cleanValue}' not found after ${maxAttempts} attempts`);
}

// ========================================
// GENERIC FIELDS - Apply to ALL vehicle types (Year, Make, Length, Model)
// ========================================
async function applyGenericFields(VehicleData: any, page: Page, vehicleType: string) {
  console.log(`📋 Applying GENERIC fields for ${vehicleType}...`);
  
  // Hull ID - ONLY for Yacht and Antique, NOT for Trailer
  const isTrailer = vehicleType.toLowerCase().includes("trailer");
  
  await wait(3000); // Wait for page to load before checking Hull ID field
  if (!isTrailer && VehicleData["HIN/Hull_ID"]) {
    if (await isElementVisible(getHullID())) {
      console.log(`✅ Hull ID field visible, filling: ${VehicleData["HIN/Hull_ID"]}`);
      await fillHullID(VehicleData["HIN/Hull_ID"]);
      console.log("✅ Hull ID filled (generic)");
    }
  }
  
  // Serial Number - ONLY for Trailer (uses HIN/Hull_ID column data)
  if (isTrailer && VehicleData["HIN/Hull_ID"]) {
    if (await isElementVisible(getSerialNumber())) {
      console.log(`✅ Serial Number field visible for trailer, filling: ${VehicleData["HIN/Hull_ID"]}`);
      await fillSerialNumber(VehicleData["HIN/Hull_ID"]);
      console.log("✅ Serial Number filled for trailer (generic)");
    }
  }
  
  // Year
  if (VehicleData["Model_Year"]) {
    if (await isElementVisible(getYear())) {
      console.log(`✅ Year field visible, filling: ${VehicleData["Model_Year"]}`);
      await fillYearValue(VehicleData["Model_Year"]);
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(5000); // Wait for Make dropdown to populate
      console.log("✅ Year filled (generic)");
    }
  }
  
  // Make
  if (VehicleData["Make"]) {
    if (await isElementVisible(getMake())) {
      console.log(`✅ Make field visible, selecting: ${VehicleData["Make"]}`);
      await selectMake(page, VehicleData["Make"]);
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(4000); // Wait for Length and Model dropdowns to populate
      console.log("✅ Make selected (generic)");
    }
  }
  
  // Length
  if (VehicleData["Length"]) {
    if (await isElementVisible(getLength())) {
      console.log(`✅ Length field visible, filling: ${VehicleData["Length"]}`);
      await selectLength(VehicleData["Length"], page);
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(2000);
      console.log("✅ Length filled (generic)");
    }
  }
  
  // Model
  if (VehicleData["Model"]) {
    if (await isElementVisible(getModel())) {
      console.log(`✅ Model field visible, selecting: ${VehicleData["Model"]}`);
      await selectModel(page, VehicleData["Model"]);
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(3000);
      console.log("✅ Model selected (generic)");
    }
  }
  
  console.log(`✅ Completed GENERIC fields for ${vehicleType}`);
}

// ========================================
// YATCH-SPECIFIC COMPLETE FLOW (IN ORDER)
// ========================================

async function applyYachtSpecificFlow(VehicleData: any, page: Page, testInfo: TestInfo) {
  console.log(`⛵ Applying BOAT-specific fields in order...`);
  const horsePowerValue =
  VehicleData[HP_FIELD] ??
  VehicleData[ALT_HP_FIELD];
  
    // 6. Hull Construction
  if (VehicleData["Hull_Construction"] && await isElementVisible(getHullConstruction())) {
    console.log(`✅ 6. Hull Construction field visible, selecting: ${VehicleData["Hull_Construction"]}`);
    await selectHullConstruction(page, VehicleData["Hull_Construction"]);
    await wait(3000);
  }
  // 7. Engine Type (moved before Horsepower to avoid recalculation)
  if (VehicleData["Engine_Type"]) {
    console.log(`✅ 7. Engine Type field, selecting: ${VehicleData["Engine_Type"]}`);
    await selectEngineType(page, VehicleData["Engine_Type"]);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await wait(2000);
  }

  // 8. Fuel Type
  if (VehicleData["Fuel_Type"]) {
    console.log(`✅ 8. Fuel Type field, selecting: ${VehicleData["Fuel_Type"]}`);
    await selectFuelType(page, VehicleData["Fuel_Type"]);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  }

  // 9. Number of Engines (must be before Total Horsepower)
  if (VehicleData["Number_of_Engines"]) {
    console.log(`✅ 9. Number of Engines field, selecting: ${VehicleData["Number_of_Engines"]}`);
    await selectNumberOfEngines(page, VehicleData["Number_of_Engines"]);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  }

  // 10. Horsepower (Total Horsepower) - NOW after engine selections to avoid being cleared
  // if (VehicleData["Total_Horsepower"] && await isElementVisible(getHorsePower())) {
  //   console.log(`✅ 10. Horsepower field visible, filling: ${VehicleData["Total_Horsepower"]}`);
  //   await fillTotalHorsePower(VehicleData["Total_Horsepower"], page);
  //   // Wait for page load state
  //   await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  //   await wait(1000);
    
  //   // Additional verification before proceeding
  //   await wait(1000);
  //   try {
  //     const verifyHP = await getHorsePower().inputValue({ timeout: 2000 });
  //     if (verifyHP !== VehicleData["Total_Horsepower"].toString()) {
  //       console.log(`⚠️ Total Horsepower verification failed! Expected "${VehicleData["Total_Horsepower"]}", got "${verifyHP}". Re-filling...`);
  //       await getHorsePower().click({ force: true });
  //       await wait(500);
  //       await getHorsePower().clear();
  //       await wait(300);
  //       await getHorsePower().fill(VehicleData["Total_Horsepower"].toString());
  //       await wait(500);
  //       await getHorsePower().press('Tab');
  //       await wait(2000);
  //       await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  //       await wait(1000);
        
  //       const finalHP = await getHorsePower().inputValue({ timeout: 2000 });
  //       console.log(`🔄 Total Horsepower after re-fill: "${finalHP}"`);
  //     } else {
  //       console.log(`✅ Total Horsepower verified before proceeding: ${verifyHP}`);
  //     }
  //   } catch (verifyError) {
  //     console.log(`⚠️ Could not verify Total Horsepower: ${verifyError}`);
  //   }
  // }
if (horsePowerValue && await isElementVisible(getHorsePower())) {
  console.log(`✅ 10. Horsepower field visible, filling: ${horsePowerValue}`);
  await fillTotalHorsePower(horsePowerValue, page);

  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(1000);

  await wait(1000);

  try {
    const verifyHP = await getHorsePower().inputValue({ timeout: 2000 });

    if (verifyHP !== horsePowerValue.toString()) {
      console.log(`⚠️ Total Horsepower verification failed! Expected "${horsePowerValue}", got "${verifyHP}". Re-filling...`);

      await getHorsePower().click({ force: true });
      await wait(500);
      await getHorsePower().clear();
      await wait(300);
      await getHorsePower().fill(horsePowerValue.toString());
      await wait(500);
      await getHorsePower().press('Tab');
      await wait(2000);

      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(1000);

      const finalHP = await getHorsePower().inputValue({ timeout: 2000 });
      console.log(`🔄 Total Horsepower after re-fill: "${finalHP}"`);
    } else {
      console.log(`✅ Total Horsepower verified before proceeding: ${verifyHP}`);
    }
  } catch (verifyError) {
    console.log(`⚠️ Could not verify Total Horsepower: ${verifyError}`);
  }
}
  // 11. Storage Address
  if (VehicleData["Storage_Address"] || VehicleData["Storage_Address_Line_1"] || VehicleData["Storage_Address_City"] || VehicleData["Storage_Address_Zip"]) {
    console.log(`✅ 11. Storage Address field, processing...`);
    await selectStorageAddress(page, VehicleData);
  }

  // 12. Mooring Address
  if (VehicleData["Mooring_Address"] || VehicleData["Mooring_Address_Line_1"] || VehicleData["Mooring_Address_City"] || VehicleData["Mooring_Address_Zip"]) {
    console.log(`✅ 12. Mooring Address field, processing...`);
    await selectMooringAddress(page, VehicleData);
  }

  // 13. Storage Type
  if (VehicleData["Storage_Type"] && await isElementVisible(getStorageType())) {
    console.log(`✅ 13. Storage Type field visible, selecting: ${VehicleData["Storage_Type"]}`);
    await selectStorageType(VehicleData["Storage_Type"]);
  }

  // 15. Purchase Price
  if (VehicleData["Purchase_Price"] || VehicleData["Purchse_Price"]) {
    const priceValue = VehicleData["Purchase_Price"] || VehicleData["Purchse_Price"];
    console.log(`✅ 15. Purchase Price field, filling: ${priceValue}`);

    if (await isElementVisible(getPurchasePrice())) {
      await wait(1000);

      try {
        // Focus and clear field
        await getPurchasePrice().focus();
        await wait(500);
        await getPurchasePrice().clear();
        await wait(500);

        // Use pressSequentially for natural typing behavior
        console.log(`📝 Typing Purchase Price sequentially: ${priceValue}`);
        await getPurchasePrice().pressSequentially(priceValue.toString(), { delay: 100 });
        await wait(1000);

        // Press Tab to commit the value
        await getPurchasePrice().press('Tab');
        await wait(2000);

        // Wait for page load state
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
        await wait(1000);

        // Verify value persisted
        const filledValue = await getPurchasePrice().inputValue({ timeout: 3000 });
        console.log(`✅ Purchase Price value after fill: ${filledValue}`);

        if (filledValue !== priceValue.toString()) {
          console.log(`⚠️ Purchase Price did not persist, retrying with slower typing...`);
          await getPurchasePrice().click({ force: true });
          await wait(500);
          await getPurchasePrice().clear();
          await wait(500);
          await getPurchasePrice().pressSequentially(priceValue.toString(), { delay: 150 });
          await wait(1000);
          await getPurchasePrice().press('Tab');
          await wait(2000);
          await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
          await wait(1000);

          const retryValue = await getPurchasePrice().inputValue({ timeout: 3000 });
          console.log(`✅ Purchase Price value after retry: ${retryValue}`);
        }
      } catch (error) {
        console.log(`⚠️ Error filling Purchase Price: ${error}, continuing...`);
      }
    }
  }

  // 14. Value
  if (VehicleData["Value"] && await isElementVisible(getValue())) {
    console.log(`✅ 14. Value field visible, filling: ${VehicleData["Value"]}`);
    await fillValue(VehicleData["Value"]);
    
    // Additional verification before territory code
    await wait(2000);
    try {
      const verifyValue = await getValue().inputValue({ timeout: 2000 });
      if (verifyValue !== VehicleData["Value"].toString()) {
        console.log(`⚠️ Value verification failed! Expected "${VehicleData["Value"]}", got "${verifyValue}". Re-filling...`);
        await getValue().click({ force: true });
        await wait(500);
        await getValue().clear();
        await wait(300);
        await getValue().fill(VehicleData["Value"].toString());
        await wait(500);
        await getValue().press('Tab');
        await wait(2000);
        
        const finalValue = await getValue().inputValue({ timeout: 2000 });
        console.log(`🔄 Value after re-fill: "${finalValue}"`);
      } else {
        console.log(`✅ Value verified before territory code: ${verifyValue}`);
      }
    } catch (verifyError) {
      console.log(`⚠️ Could not verify Value: ${verifyError}`);
    }
  }

  // 16. Purchase Date
   if (VehicleData["Purchase_Date"] && await isElementVisible(getPurchaseDate())) {
      const rawExcelValue = VehicleData["Purchase_Date"];
      console.log(`✅ 16. Purchase Date - Raw Excel value: ${rawExcelValue}`);
     
      try {
        // Convert Excel date to JS Date
        const jsDate = excelDateToJSDate(rawExcelValue);
        console.log(`✅ 16. Purchase Date - Converted JS Date: ${jsDate}`);
       
        // Format to MM/dd/yyyy
        const dateValue = formatToMMDDYYYY(jsDate);
        console.log(`✅ 16. Purchase Date - Formatted value: ${dateValue}`);
       
        // Try up to 3 times to fill Purchase Date
        let dateSuccess = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`🔄 Filling Purchase Date (attempt ${attempt}): ${dateValue}`);
          
          await wait(500);
          await getPurchaseDate().click({ force: true });
          await wait(300);
          await getPurchaseDate().clear();
          await wait(300);
          await getPurchaseDate().fill(dateValue);
          await wait(1000);
         
          // Press Tab to trigger validation
          try {
            await getPurchaseDate().press('Tab');
            await wait(1500);
          } catch (tabError) {
            console.log(`⚠️ Tab press failed: ${tabError}`);
          }
         
          // Wait for page state
          await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
          await wait(1000);
         
          // Verify the filled value
          const filledValue = await getPurchaseDate().inputValue({ timeout: 3000 });
          console.log(`🔍 Purchase Date verification (attempt ${attempt}) - Field contains: "${filledValue}"`);
         
          if (filledValue === dateValue || filledValue.replace(/\//g, '') === dateValue.replace(/\//g, '')) {
            console.log(`✅ Purchase Date filled successfully: ${dateValue}`);
            dateSuccess = true;
            break;
          } else if (filledValue.trim() === '') {
            console.log(`⚠️ Purchase Date field is EMPTY after fill (attempt ${attempt})`);
            if (attempt < 3) {
              await wait(1000);
              continue; // Retry
            }
          } else {
            console.log(`⚠️ Purchase Date shows "${filledValue}" instead of "${dateValue}" (attempt ${attempt})`);
            if (attempt < 3) {
              await wait(1000);
              continue; // Retry
            }
          }
        }
        
        if (!dateSuccess) {
          console.log(`⚠️ WARNING: Purchase Date may not be correct after 3 attempts`);
        }
       
      } catch (error) {
        console.log(`❌ Error filling Purchase Date: ${error}`);
      }
    }

  // 16a. Last Survey Date - Default for Antique vehicles
  if (await isElementVisible(getLastSurveyDate())) {
    console.log(`✅ 16a. Last Survey Date field visible, filling default date: 12/20/2023`);
    await wait(1000);

    try {
      // Focus and clear field
      await getLastSurveyDate().focus();
      await wait(500);
      await getLastSurveyDate().clear();
      await wait(500);

      // Use hardcoded default date for antiques
      const defaultSurveyDate = "12/20/2023";
      console.log(`📝 Typing Last Survey Date sequentially: ${defaultSurveyDate}`);
      await getLastSurveyDate().pressSequentially(defaultSurveyDate, { delay: 100 });
      await wait(1000);

      // Press Tab to commit the value
      try {
        await getLastSurveyDate().press('Tab');
        await wait(2000);
      } catch (tabError) {
        console.log(`⚠️ Tab press failed on Last Survey Date: ${tabError}`);
        await wait(2000);
      }

      // Wait for page load state
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(1000);

      // Verify value persisted
      try {
        const filledValue = await getLastSurveyDate().inputValue({ timeout: 3000 });
        console.log(`✅ Last Survey Date value after fill: ${filledValue}`);

        // Only retry if the field is empty
        if (!filledValue || filledValue.trim() === '') {
          console.log(`⚠️ Last Survey Date is EMPTY, retrying with slower typing...`);
          if (await isElementVisible(getLastSurveyDate())) {
            await getLastSurveyDate().click({ force: true });
            await wait(500);
            await getLastSurveyDate().clear();
            await wait(500);
            await getLastSurveyDate().pressSequentially(defaultSurveyDate, { delay: 150 });
            await wait(1000);
            await getLastSurveyDate().press('Tab');
            await wait(2000);
            await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
            await wait(1000);

            const retryValue = await getLastSurveyDate().inputValue({ timeout: 3000 });
            console.log(`✅ Last Survey Date value after retry: ${retryValue}`);
          }
        }
      } catch (verifyError) {
        console.log(`⚠️ Could not verify Last Survey Date value, continuing: ${verifyError}`);
      }

      console.log(`✅ Last Survey Date filling completed`);

    } catch (error) {
      console.log(`❌ Error in Last Survey Date filling: ${error}`);
      // Continue with the flow even if Last Survey Date fails
    }
  }
  // (Engine Type, Fuel Type, Number of Engines already filled before Total Horsepower)

  // 17. Weight
  if (VehicleData["Weight"]) {
    console.log(`✅ 17. Weight field, filling: ${VehicleData["Weight"]}`);
    await fillWeight(VehicleData["Weight"]);
  }

  // 18. Speed (first pass - before engine details)
  if (VehicleData["Speed"] || VehicleData["Max_Speed"]) {
    const speedValue = VehicleData["Speed"] || VehicleData["Max_Speed"];
    console.log(`✅ 18. Speed field (first pass), filling: ${speedValue}`);
    await fillSpeed(speedValue, page);
  }

  // 19. Vehicle Rate Modifiers Section
  console.log(`📋 19. Vehicle Rate Modifiers Section...`);
  // 19a. Vehicle Recovery
  if (VehicleData["Vehicle_Recovery/Tracking_System"] || VehicleData["Vehicle_Recovery_Tracking_System"] || VehicleData["AntiTheftVehicleRecoveryTrackingSystem"]) {
    const recoveryValue = VehicleData["Vehicle_Recovery/Tracking_System"] || VehicleData["Vehicle_Recovery_Tracking_System"] || VehicleData["AntiTheftVehicleRecoveryTrackingSystem"];
    console.log(`✅ 19a. Vehicle Recovery field, selecting: ${recoveryValue}`);
    await selectVehicleRecovery(recoveryValue);
  }
  // 19b. Vehicle Ineligible (default to "No" if not provided)
  const vehicleIneligibleValue = VehicleData["Vehicle_Ineligible"] || "No";
  if (await isElementVisible(getYesVehicleIneligible()) || await isElementVisible(getNoVehicleIneligible())) {
    console.log(`✅ 19b. Vehicle Ineligible field, selecting: ${vehicleIneligibleValue}`);
    await selectVehicleIneligible(vehicleIneligibleValue);
  }

  // 20. Assign Drivers to Vehicles Section
  console.log(`📋 20. Assign Drivers to Vehicles Section...`);

  // Check if Assign Drivers section exists
  if (await isElementVisible(getAssignDriversection())) {
    // Scroll to Assign Drivers section to make it visible
    console.log(`📜 Scrolling to Assign Drivers section...`);
    await getAssignDriversection().scrollIntoViewIfNeeded();
    await wait(2000);
    console.log(`✅ Assign Drivers section now visible`);

    // Click "Add" dropdown button in the Assign Drivers section
    if (await isElementVisible(getDriverAddButton())) {
      await getDriverAddButton().click({ force: true });
      await wait(2000);
      console.log(`✅ Clicked Add dropdown button in Assign Drivers section`);

      // Wait for menu to appear and click the first visible menu item
      await wait(1500);

      // Click the first driver menu item using the exact structure
      try {
        // Strategy 1: Target the specific AddDriver menu item by ID pattern
        const firstItem = getLocator("//span[contains(@id,'AddDriver:0:Driver-textEl') and contains(@class,'x-menu-item-text')]");
        if (await firstItem.isVisible({ timeout: 2000 }).catch(() => false)) {
          const name = await firstItem.textContent().catch(() => '');
          console.log(`📋 Found first driver in menu: "${name}"`);
          await click(firstItem);
          console.log(`✅ Selected first driver from Add menu`);
          await wait(3000);
        } else {
          // Strategy 2: Use broader AddDriver menu locator
          const fallbackItem = getLocator("//span[contains(@id,'AddDriver') and contains(@class,'x-menu-item-text')][1]");
          if (await fallbackItem.isVisible({ timeout: 1000 }).catch(() => false)) {
            const name = await fallbackItem.textContent().catch(() => '');
            console.log(`📋 Found first driver (fallback): "${name}"`);
            await click(fallbackItem);
            console.log(`✅ Selected first driver from Add menu (fallback)`);
            await wait(3000);
          } else {
            // Strategy 3: Use JavaScript to click first visible menu item directly
            console.log(`⚠️ Using JavaScript fallback to click first menu item`);
            await page.evaluate(() => {
              const items = document.querySelectorAll('.x-menu-item-text');
              for (const item of items) {
                const htmlItem = item as HTMLElement;
                if (htmlItem.offsetParent !== null) { // Check if visible
                  htmlItem.click();
                  return;
                }
              }
            });
            await wait(3000);
            console.log(`✅ Clicked first visible menu item via JavaScript`);
          }
        }
      } catch (error) {
        console.log(`❌ Failed to click menu item: ${error}`);
      }

    }


    // Now handle the Use cell
    await selectDriverUse(page, "Primary");

    await wait(2000);
    console.log(`✅ Driver assigned successfully`);
  }


  // // 21. Modifications Section
  // if(VehicleData["Modifications"] || VehicleData["Modifications_-_Select_all_that_apply"]) {
  //   const modValue = VehicleData["Modifications"] || VehicleData["Modifications_-_Select_all_that_apply"];
  //   console.log(`📋 21. Modifications Section, adding: ${modValue}`);
  //   await selectModifications(page, modValue);
  // }

//   // 22. Engine Details Section
//   console.log(`📋 22. Engine Details Section...`);
//   console.log(`📊 ALL VehicleData keys:`, Object.keys(VehicleData));
//   console.log(`📊 Checking for engine data keys: Engine_1_Year, Engine_1_Make, Engine_1_Model, Engine_1_Horsepower, Engine_1_Serial_Number`);

//   // Scroll to Engine Details section to make it visible
//   if (await isElementVisible(getEngineAddButton())) {
//     console.log(`📜 Scrolling to Engine Details section...`);
//     await getEngineAddButton().scrollIntoViewIfNeeded();
//     await wait(2000);
//     console.log(`✅ Engine Details section now visible`);
//   }

//   let engineNum = 1;
//   let hasMoreEngines = true;

//   while (hasMoreEngines) {
//     const yearKey = `Engine_${engineNum}_Year`;
//     const makeKey = `Engine_${engineNum}_Make`;
//     const modelKey = `Engine_${engineNum}_Model`;
//     const horsepowerKey = `Engine_${engineNum}_Horsepower`;
//     const serialKey = `Engine_${engineNum}_Serial_Number`;

//     if (VehicleData[yearKey] || VehicleData[makeKey] || VehicleData[modelKey]) {
//       console.log(`🔧 22.${engineNum} Filling Engine ${engineNum} Details...`);
//       console.log(`📋 Engine ${engineNum} Data:`, {
//         year: VehicleData[yearKey],
//         make: VehicleData[makeKey],
//         model: VehicleData[modelKey],
//         horsepower: VehicleData[horsepowerKey],
//         serial: VehicleData[serialKey]
//       });

//       await clickEngineAddButton(page);
//       await wait(2000);

//       // Keep Engine Details grid visible while filling
//       //await getEngineDetailsYear().scrollIntoViewIfNeeded();
//       await wait(500);

//       if (VehicleData[yearKey]) {
//         console.log(`🔄 Filling Engine ${engineNum} Year: ${VehicleData[yearKey]}`);
//         await fillEngineYear(VehicleData[yearKey], page,engineNum-1);
//         await wait(2000);
//       } else {
//         console.log(`⚠️ No Year data for Engine ${engineNum}`);
//       }

//       if (VehicleData[makeKey]) {
//         console.log(`🔄 Selecting Engine ${engineNum} Make: ${VehicleData[makeKey]}`);
//         await selectEngineMake(page, VehicleData[makeKey],engineNum-1);
//         await wait(3000); // Wait for Make dropdown to commit
//       } else {
//         console.log(`⚠️ No Make data for Engine ${engineNum}`);
//       }

//       if (VehicleData[modelKey]) {
//         console.log(`🔄 Selecting Engine ${engineNum} Model: ${VehicleData[modelKey]}`);
//         await selectEngineModel(page, VehicleData[modelKey],engineNum-1);
//         await wait(3000); // Wait for Model dropdown to commit
//       } else {
//         console.log(`⚠️ No Model data for Engine ${engineNum}`);
//       }

//       if (VehicleData[horsepowerKey]) {
//         console.log(`🔄 Filling Engine ${engineNum} Horsepower: ${VehicleData[horsepowerKey]}`);
//         await fillEngineHorsePower(VehicleData[horsepowerKey], page,engineNum-1);
//         await wait(2000);
//       } else {
//         console.log(`⚠️ No Horsepower data for Engine ${engineNum}`);
//       }

//       if (VehicleData[serialKey]) {
//         console.log(`🔄 Filling Engine ${engineNum} Serial Number: ${VehicleData[serialKey]}`);
//         await fillEngineSerialNo(VehicleData[serialKey], page,engineNum-1);
//         await wait(2000);
//       } else {
//         console.log(`⚠️ No Serial Number data for Engine ${engineNum}`);
//       }

//       console.log(`✅ Engine ${engineNum} Details filled`);

//       engineNum++;
//     } else {
//       console.log(`ℹ️ No Engine ${engineNum} data found`);
//       console.log(`✅ Total engines added: ${engineNum - 1}`);
//       hasMoreEngines = false;
//     }
// }
console.log(`📋 22. Engine Details Section...`);
//await page.pause();
console.log(`📊 ALL VehicleData keys:`, Object.keys(VehicleData));

// ✅ Always scroll (NO condition needed)
console.log(`📜 Scrolling to Engine Details section...`);
await getEngineAddButton().scrollIntoViewIfNeeded();
await wait(2000);
console.log(`✅ Engine Details section now visible`);

// ✅ Get engine rows
const engineRowLocator = getLocator(
  "//div[contains(@id,'EngineDetails_ExtLV')]//tr[contains(@class,'x-grid-row')]"
);

// ✅ Initial row count
let existingRowCount = await engineRowLocator.count();
console.log(`📊 Initial Engine row count: ${existingRowCount}`);

let engineNum = 1;
let hasMoreEngines = true;

while (hasMoreEngines) {
  const yearKey = `Engine_${engineNum}_Year`;
  const makeKey = `Engine_${engineNum}_Make`;
  const modelKey = `Engine_${engineNum}_Model`;
  const horsepowerKey = `Engine_${engineNum}_Horsepower`;
  const serialKey = `Engine_${engineNum}_Serial_Number`;

  if (VehicleData[yearKey] || VehicleData[makeKey] || VehicleData[modelKey]) {

    console.log(`🔧 Filling Engine ${engineNum} Details...`);

    // ✅ ✅ IMPORTANT FIX (core logic)
    if (engineNum > existingRowCount) {
      console.log(`➕ Adding new row for Engine ${engineNum}`);
      await getEngineAddButton().click({ force: true });
      await wait(2000);
      await page.waitForLoadState("load");

      // ✅ Update count after adding
      existingRowCount = await engineRowLocator.count();
      console.log(`📊 Updated row count: ${existingRowCount}`);

    } else {
      console.log(`✅ Reusing existing row for Engine ${engineNum}`);
    }

    // ✅ Fill fields
    if (VehicleData[yearKey]) {
      await fillEngineYear(VehicleData[yearKey], page, engineNum - 1);
      await wait(2000);
    }

    if (VehicleData[makeKey]) {
      await selectEngineMake(page, VehicleData[makeKey], engineNum - 1);
      await wait(3000);
    }

    if (VehicleData[modelKey]) {
      await selectEngineModel(page, VehicleData[modelKey], engineNum - 1);
      await wait(3000);
    }

    if (VehicleData[horsepowerKey]) {
      await fillEngineHorsePower(VehicleData[horsepowerKey], page, engineNum - 1);
      await wait(2000);
    }

    if (VehicleData[serialKey]) {
      await fillEngineSerialNo(VehicleData[serialKey], page, engineNum - 1);
      await wait(2000);
    }

    console.log(`✅ Engine ${engineNum} filled`);

    engineNum++;

  } else {
    console.log(`✅ Total engines processed: ${engineNum - 1}`);
    hasMoreEngines = false;
  }
}

  // 18. Speed (moved here - filled AFTER engine details)
  if (VehicleData["Speed"] || VehicleData["Max_Speed"]) {
    const speedValue = VehicleData["Speed"] || VehicleData["Max_Speed"];
    console.log(`✅ 18. Speed field, filling: ${speedValue}`);
    await fillSpeed(speedValue, page);
  }

  // if (await isElementVisible(getMooringStateYesButton())) {
  //   await getMooringStateNoButton().click({ force: true });
  //   await wait(2000);
  //   console.log(`✅ Mooring State Yes button clicked`);
  // }
  
 const mooringStateValue = VehicleData["DifferentSummerWinterMooring"] || "No";
  if (await isElementVisible(getMooringStateYesButton()) || await isElementVisible(getMooringStateNoButton())) {
    console.log(`✅ 19b. Vehicle Ineligible field, selecting: ${mooringStateValue}`);
    await selectMooringState(mooringStateValue);
  }

  // Final verification pass before clicking Order Territory Code
  console.log(`🔍 Final verification before clicking Order Territory Code...`);
  
  // Verify Value field
  if (VehicleData["Value"] && await isElementVisible(getValue())) {
    try {
      const currentValue = await getValue().inputValue({ timeout: 2000 });
      if (currentValue !== VehicleData["Value"].toString()) {
        console.log(`⚠️ CRITICAL: Value cleared before territory code! Re-filling: ${VehicleData["Value"]}`);
        await getValue().click({ force: true });
        await wait(300);
        await getValue().fill(VehicleData["Value"].toString());
        await wait(300);
        await getValue().press('Tab');
        await wait(1000);
      } else {
        console.log(`✅ Value verified before territory code: ${currentValue}`);
      }
    } catch (e) {
      console.log(`⚠️ Could not verify Value: ${e}`);
    }
  }
  
  // Verify Total Horsepower field

  // if (VehicleData["Total_Horsepower"] || VehicleData["Engine_Size/Total_Horsepower"] && await isElementVisible(getHorsePower())) {
  //   try {
  //     const currentHP = await getHorsePower().inputValue({ timeout: 2000 });
  //     if (currentHP !== VehicleData["Total_Horsepower"].toString()) {
  //       console.log(`⚠️ CRITICAL: Total Horsepower cleared before territory code! Re-filling: ${VehicleData["Total_Horsepower"]}`);
  //       await getHorsePower().click({ force: true });
  //       await wait(300);
  //       await getHorsePower().fill(VehicleData["Total_Horsepower"].toString());
  //       await wait(300);
  //       await getHorsePower().press('Tab');
  //       await wait(1000);
  //     } else {
  //       console.log(`✅ Total Horsepower verified before territory code: ${currentHP}`);
  //     }
  //   } catch (e) {
  //     console.log(`⚠️ Could not verify Total Horsepower: ${e}`);
  //   }
  // }

if (horsePowerValue && await isElementVisible(getHorsePower())) {
  try {
    const hpValue = horsePowerValue.toString();
    const currentHP = await getHorsePower().inputValue({ timeout: 2000 });

    if (currentHP !== hpValue) {
      console.log(
        `⚠️ CRITICAL: Total Horsepower cleared before territory code! Re-filling: ${hpValue}`
      );

      await getHorsePower().click({ force: true });
      await wait(300);
      await getHorsePower().fill(hpValue);
      await wait(300);
      await getHorsePower().press("Tab");
      await wait(1000);
    } else {
      console.log(
        `✅ Total Horsepower verified before territory code: ${currentHP}`
      );
    }
  } catch (e) {
    console.log(`⚠️ Could not verify Total Horsepower: ${e}`);
  }
}
  
  // Click Order Territory Code after all engines are filled
      //    await page.pause();

  await handleOrderTerritoryCode();
  console.log(`✅ Yacht-specific flow completed (with Condition and Restoration fields)`);
  await getAddVehicleButton().scrollIntoViewIfNeeded();
  await wait(1000);
}

// ========================================
// ANTIQUE-SPECIFIC COMPLETE FLOW (Same as Yacht + Condition + Restoration)
// ========================================
async function applyAntiqueSpecificFlow(VehicleData: any, page: Page) {
  console.log(`🏛️ Applying ANTIQUE-specific fields in order...`);
  const horsePowerValue =
  VehicleData[HP_FIELD] ??
  VehicleData[ALT_HP_FIELD];

  // 6. Hull Construction
  if (VehicleData["Hull_Construction"] && await isElementVisible(getHullConstruction())) {
    console.log(`✅ 6. Hull Construction field visible, selecting: ${VehicleData["Hull_Construction"]}`);
    await selectHullConstruction(page, VehicleData["Hull_Construction"]);
    await wait(3000);
  }
  
  // 7. Engine Type (moved before Horsepower to avoid recalculation)
  if (VehicleData["Engine_Type"]) {
    console.log(`✅ 7. Engine Type field, selecting: ${VehicleData["Engine_Type"]}`);
    await selectEngineType(page, VehicleData["Engine_Type"]);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await wait(2000);
  }

  // 8. Fuel Type
  if (VehicleData["Fuel_Type"]) {
    console.log(`✅ 8. Fuel Type field, selecting: ${VehicleData["Fuel_Type"]}`);
    await selectFuelType(page, VehicleData["Fuel_Type"]);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  }

  // 9. Number of Engines (must be before Total Horsepower)
  if (VehicleData["Number_of_Engines"]) {
    console.log(`✅ 9. Number of Engines field, selecting: ${VehicleData["Number_of_Engines"]}`);
    await selectNumberOfEngines(page, VehicleData["Number_of_Engines"]);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  }

  // 10. Horsepower (Total Horsepower) - NOW after engine selections to avoid being cleared
if (horsePowerValue && await isElementVisible(getHorsePower())) {
  console.log(`✅ 10. Horsepower field visible, filling: ${horsePowerValue}`);

  await fillTotalHorsePower(horsePowerValue, page);

  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(1000);
}

  // 11. Storage Address
  if (VehicleData["Storage_Address"]) {
    console.log(`✅ 11. Storage Address field, selecting: ${VehicleData["Storage_Address"]}`);
    await selectStorageAddress(page, VehicleData["Storage_Address"]);
  }

  // 12. Mooring Address
  if (VehicleData["Mooring_Address_Same_As_Storage"]) {
    console.log(`✅ 12a. Mooring Address Same as Storage, selecting: ${VehicleData["Mooring_Address_Same_As_Storage"]}`);
    await selectMooringAddressSame(VehicleData["Mooring_Address_Same_As_Storage"]);

    if (VehicleData["Mooring_Address_Same_As_Storage"] === "No" && VehicleData["Mooring_Address"]) {
      console.log(`✅ 12b. Mooring Address field, selecting: ${VehicleData["Mooring_Address"]}`);
      await selectMooringAddress(page, VehicleData["Mooring_Address"]);
    }
  }

  // 13. Storage Type
  if (VehicleData["Storage_Type"] && await isElementVisible(getStorageType())) {
    console.log(`✅ 13. Storage Type field visible, selecting: ${VehicleData["Storage_Type"]}`);
    await selectStorageType(VehicleData["Storage_Type"]);
  }

  // 14. Purchase Price
  if (VehicleData["Purchase_Price"] || VehicleData["Purchse_Price"]) {
    const priceValue = VehicleData["Purchase_Price"] || VehicleData["Purchse_Price"];
    console.log(`✅ 14. Purchase Price field, filling: ${priceValue}`);

    if (await isElementVisible(getPurchasePrice())) {
      await wait(1000);
      try {
        await getPurchasePrice().focus();
        await wait(500);
        await getPurchasePrice().clear();
        await wait(500);
        console.log(`📝 Typing Purchase Price sequentially: ${priceValue}`);
        await getPurchasePrice().pressSequentially(priceValue.toString(), { delay: 100 });
        await wait(1000);
        await getPurchasePrice().press('Tab');
        await wait(2000);
        await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
        await wait(1000);

        const filledValue = await getPurchasePrice().inputValue({ timeout: 3000 });
        console.log(`✅ Purchase Price value after fill: ${filledValue}`);

        if (filledValue !== priceValue.toString()) {
          console.log(`⚠️ Purchase Price did not persist, retrying with slower typing...`);
          await getPurchasePrice().click({ force: true });
          await wait(500);
          await getPurchasePrice().clear();
          await wait(500);
          await getPurchasePrice().pressSequentially(priceValue.toString(), { delay: 150 });
          await wait(1000);
          await getPurchasePrice().press('Tab');
          await wait(2000);
          await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
          await wait(1000);

          const retryValue = await getPurchasePrice().inputValue({ timeout: 3000 });
          console.log(`✅ Purchase Price value after retry: ${retryValue}`);
        }
      } catch (error) {
        console.log(`⚠️ Error filling Purchase Price: ${error}, continuing...`);
      }
    }
  }

  // 15. Value
  if (VehicleData["Value"] && await isElementVisible(getValue())) {
    console.log(`✅ 15. Value field visible, filling: ${VehicleData["Value"]}`);
    await fillValue(VehicleData["Value"]);
  }

  // 16. Purchase Date
   if (VehicleData["Purchase_Date"] && await isElementVisible(getPurchaseDate())) {
     const rawExcelValue = VehicleData["Purchase_Date"];
     console.log(`✅ 16. Purchase Date - Raw Excel value: ${rawExcelValue}`);
    
     try {
       // Convert Excel date to JS Date
       const jsDate = excelDateToJSDate(rawExcelValue);
       console.log(`✅ 16. Purchase Date - Converted JS Date: ${jsDate}`);
      
       // Format to MM/dd/yyyy
       const dateValue = formatToMMDDYYYY(jsDate);
       console.log(`✅ 16. Purchase Date - Formatted value: ${dateValue}`);
      
       // Try up to 3 times to fill Purchase Date
       let dateSuccess = false;
       for (let attempt = 1; attempt <= 3; attempt++) {
         console.log(`🔄 Filling Purchase Date (attempt ${attempt}): ${dateValue}`);
         
         await wait(500);
         await getPurchaseDate().click({ force: true });
         await wait(300);
         await getPurchaseDate().clear();
         await wait(300);
         await getPurchaseDate().fill(dateValue);
         await wait(1000);
        
         // Press Tab to trigger validation
         try {
           await getPurchaseDate().press('Tab');
           await wait(1500);
         } catch (tabError) {
           console.log(`⚠️ Tab press failed: ${tabError}`);
         }
        
         // Wait for page state
         await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
         await wait(1000);
        
         // Verify the filled value
         const filledValue = await getPurchaseDate().inputValue({ timeout: 3000 });
         console.log(`🔍 Purchase Date verification (attempt ${attempt}) - Field contains: "${filledValue}"`);
        
         if (filledValue === dateValue || filledValue.replace(/\//g, '') === dateValue.replace(/\//g, '')) {
           console.log(`✅ Purchase Date filled successfully: ${dateValue}`);
           dateSuccess = true;
           break;
         } else if (filledValue.trim() === '') {
           console.log(`⚠️ Purchase Date field is EMPTY after fill (attempt ${attempt})`);
           if (attempt < 3) {
             await wait(1000);
             continue; // Retry
           }
         } else {
           console.log(`⚠️ Purchase Date shows "${filledValue}" instead of "${dateValue}" (attempt ${attempt})`);
           if (attempt < 3) {
             await wait(1000);
             continue; // Retry
           }
         }
       }
       
       if (!dateSuccess) {
         console.log(`⚠️ WARNING: Purchase Date may not be correct after 3 attempts`);
       }
      
     } catch (error) {
       console.log(`❌ Error filling Purchase Date: ${error}`);
     }
   }

  // 16a. Last Survey Date - Default for Antique vehicles
  if (VehicleData["Last_Survey_Date"] && await isElementVisible(getLastSurveyDate())) {
    console.log(`✅ 16a. Last Survey Date field visible, filling: ${VehicleData["Last_Survey_Date"]} `);
    await wait(1000);

    try {
      // Focus and clear field
      await getLastSurveyDate().focus();
      await wait(500);
      await getLastSurveyDate().clear();
      await wait(500);

      // Use hardcoded default date for antiques
      const SurveyDate = excelDateToJSDate(VehicleData["Last_Survey_Date"]);
      console.log(`📝 Typing Last Survey Date sequentially: ${SurveyDate}`);
      await getLastSurveyDate().pressSequentially(SurveyDate, { delay: 100 });
      await wait(1000);

      // Press Tab to commit the value
      try {
        await getLastSurveyDate().press('Tab');
        await wait(2000);
      } catch (tabError) {
        console.log(`⚠️ Tab press failed on Last Survey Date: ${tabError}`);
        await wait(2000);
      }

      // Wait for page load state
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await wait(1000);

      // Verify value persisted
      try {
        const filledValue = await getLastSurveyDate().inputValue({ timeout: 3000 });
        console.log(`✅ Last Survey Date value after fill: ${filledValue}`);

        // Only retry if the field is empty
        if (!filledValue || filledValue.trim() === '') {
          console.log(`⚠️ Last Survey Date is EMPTY, retrying with slower typing...`);
          if (await isElementVisible(getLastSurveyDate())) {
            await getLastSurveyDate().click({ force: true });
            await wait(500);
            await getLastSurveyDate().clear();
            await wait(500);
            await getLastSurveyDate().pressSequentially(SurveyDate, { delay: 150 });
            await wait(1000);
            await getLastSurveyDate().press('Tab');
            await wait(2000);
            await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
            await wait(1000);

            const retryValue = await getLastSurveyDate().inputValue({ timeout: 3000 });
            console.log(`✅ Last Survey Date value after retry: ${retryValue}`);
          }
        }
      } catch (verifyError) {
        console.log(`⚠️ Could not verify Last Survey Date value, continuing: ${verifyError}`);
      }

      console.log(`✅ Last Survey Date filling completed`);

    } catch (error) {
      console.log(`❌ Error in Last Survey Date filling: ${error}`);
      // Continue with the flow even if Last Survey Date fails
    }
  }

  // 17. Condition (Antique-specific) - Default to "Good" if no data
  const conditionValue = VehicleData["Condition"];
  if (await isElementVisible(getCondition())) {
    console.log(`✅ 17. Condition field visible, selecting: ${conditionValue}`);
    await selectCondition(page, conditionValue);
    await wait(2000);
  }
  
  // 18. Restoration (Antique-specific) - Default to "25% Complete" if no data
  const restorationValue = VehicleData["Under_Restoration?"] || VehicleData["Restoration"];
  if (await isElementVisible(getRestoration())) {
    console.log(`✅ 18. Restoration field visible, selecting: ${restorationValue}`);
    //await selectRestoration(page, restorationValue);
    await selectDropdownCore(page, "Restoration", restorationValue);
    await wait(2000);
  }

  // 19. Weight
  if (VehicleData["Weight"]) {
    console.log(`✅ 19. Weight field, filling: ${VehicleData["Weight"]}`);
    await fillWeight(VehicleData["Weight"]);
  }

  // 20. Speed (first pass - before engine details)
  if (VehicleData["Speed"] || VehicleData["Max_Speed"]) {
    const speedValue = VehicleData["Speed"] || VehicleData["Max_Speed"];
    console.log(`✅ 20. Speed field (first pass), filling: ${speedValue}`);
    await fillSpeed(speedValue, page);
  }

  // 21. Vehicle Rate Modifiers Section
  console.log(`📋 21. Vehicle Rate Modifiers Section...`);
  if (VehicleData["Vehicle_Recovery/Tracking_System"] || VehicleData["Vehicle_Recovery_Tracking_System"]) {
    const recoveryValue = VehicleData["Vehicle_Recovery/Tracking_System"] || VehicleData["Vehicle_Recovery_Tracking_System"];
    console.log(`✅ 21a. Vehicle Recovery field, selecting: ${recoveryValue}`);
    await selectVehicleRecovery(recoveryValue);
  }
  
  const vehicleIneligibleValue = VehicleData["Vehicle_Ineligible"] || "No";
  if (await isElementVisible(getYesVehicleIneligible()) || await isElementVisible(getNoVehicleIneligible())) {
    console.log(`✅ 21b. Vehicle Ineligible field, selecting: ${vehicleIneligibleValue}`);
    await selectVehicleIneligible(vehicleIneligibleValue);
  }

  // 22. Assign Drivers to Vehicles Section
  console.log(`📋 22. Assign Drivers to Vehicles Section...`);

  if (await isElementVisible(getAssignDriversection())) {
    console.log(`📜 Scrolling to Assign Drivers section...`);
    await getAssignDriversection().scrollIntoViewIfNeeded();
    await wait(2000);
    console.log(`✅ Assign Drivers section now visible`);

    if (await isElementVisible(getDriverAddButton())) {
      await getDriverAddButton().click({ force: true });
      await wait(2000);
      console.log(`✅ Clicked Add dropdown button in Assign Drivers section`);

      await wait(1500);

      try {
        const firstItem = getLocator("//span[contains(@id,'AddDriver:0:Driver-textEl') and contains(@class,'x-menu-item-text')]");
        if (await firstItem.isVisible({ timeout: 2000 }).catch(() => false)) {
          const name = await firstItem.textContent().catch(() => '');
          console.log(`📋 Found first driver in menu: "${name}"`);
          await click(firstItem);
          console.log(`✅ Selected first driver from Add menu`);
          await wait(3000);
        } else {
          const fallbackItem = getLocator("//span[contains(@id,'AddDriver') and contains(@class,'x-menu-item-text')][1]");
          if (await fallbackItem.isVisible({ timeout: 1000 }).catch(() => false)) {
            const name = await fallbackItem.textContent().catch(() => '');
            console.log(`📋 Found first driver (fallback): "${name}"`);
            await click(fallbackItem);
            console.log(`✅ Selected first driver from Add menu (fallback)`);
            await wait(3000);
          } else {
            console.log(`⚠️ Using JavaScript fallback to click first menu item`);
            await page.evaluate(() => {
              const items = document.querySelectorAll('.x-menu-item-text');
              for (const item of items) {
                const htmlItem = item as HTMLElement;
                if (htmlItem.offsetParent !== null) {
                  htmlItem.click();
                  return;
                }
              }
            });
            await wait(3000);
            console.log(`✅ Clicked first visible menu item via JavaScript`);
          }
        }
      } catch (error) {
        console.log(`❌ Failed to click menu item: ${error}`);
      }
    }

    await selectDriverUse(page, "Primary");
    await wait(2000);
    console.log(`✅ Driver assigned successfully`);
  }

  // 23. Engine Details Section
  console.log(`📋 23. Engine Details Section...`);
  console.log(`📊 ALL VehicleData keys:`, Object.keys(VehicleData));
  console.log(`📊 Checking for engine data keys: Engine_1_Year, Engine_1_Make, Engine_1_Model, Engine_1_Horsepower, Engine_1_Serial_Number`);

   // Scroll to Engine Details section to make it visible
  if (await isElementVisible(getEngineAddButton())) {
    console.log(`📜 Scrolling to Engine Details section...`);
    await getEngineAddButton().scrollIntoViewIfNeeded();
    await wait(2000);
    console.log(`✅ Engine Details section now visible`);
  }

  let engineNum = 1;
  let hasMoreEngines = true;

  while (hasMoreEngines) {
    const yearKey = `Engine_${engineNum}_Year`;
    const makeKey = `Engine_${engineNum}_Make`;
    const modelKey = `Engine_${engineNum}_Model`;
    const horsepowerKey = `Engine_${engineNum}_Horsepower`;
    const serialKey = `Engine_${engineNum}_Serial_Number`;

    if (VehicleData[yearKey] || VehicleData[makeKey] || VehicleData[modelKey]) {
      console.log(`🔧 22.${engineNum} Filling Engine ${engineNum} Details...`);
      console.log(`📋 Engine ${engineNum} Data:`, {
        year: VehicleData[yearKey],
        make: VehicleData[makeKey],
        model: VehicleData[modelKey],
        horsepower: VehicleData[horsepowerKey],
        serial: VehicleData[serialKey]
      });

      await clickEngineAddButton(page);
      await wait(2000);

      // Keep Engine Details grid visible while filling
      //await getEngineDetailsYear().scrollIntoViewIfNeeded();
      await wait(500);

      if (VehicleData[yearKey]) {
        console.log(`🔄 Filling Engine ${engineNum} Year: ${VehicleData[yearKey]}`);
        await fillEngineYear(VehicleData[yearKey], page,engineNum-1);
        await wait(2000);
      } else {
        console.log(`⚠️ No Year data for Engine ${engineNum}`);
      }

      if (VehicleData[makeKey]) {
        console.log(`🔄 Selecting Engine ${engineNum} Make: ${VehicleData[makeKey]}`);
        await selectEngineMake(page, VehicleData[makeKey],engineNum-1);
        await wait(3000); // Wait for Make dropdown to commit
      } else {
        console.log(`⚠️ No Make data for Engine ${engineNum}`);
      }

      if (VehicleData[modelKey]) {
        console.log(`🔄 Selecting Engine ${engineNum} Model: ${VehicleData[modelKey]}`);
        await selectEngineModel(page, VehicleData[modelKey],engineNum-1);
        await wait(3000); // Wait for Model dropdown to commit
      } else {
        console.log(`⚠️ No Model data for Engine ${engineNum}`);
      }

      if (VehicleData[horsepowerKey]) {
        console.log(`🔄 Filling Engine ${engineNum} Horsepower: ${VehicleData[horsepowerKey]}`);
        await fillEngineHorsePower(VehicleData[horsepowerKey], page,engineNum-1);
        await wait(2000);
      } else {
        console.log(`⚠️ No Horsepower data for Engine ${engineNum}`);
      }

      if (VehicleData[serialKey]) {
        console.log(`🔄 Filling Engine ${engineNum} Serial Number: ${VehicleData[serialKey]}`);
        await fillEngineSerialNo(VehicleData[serialKey], page,engineNum-1);
        await wait(2000);
      } else {
        console.log(`⚠️ No Serial Number data for Engine ${engineNum}`);
      }

      console.log(`✅ Engine ${engineNum} Details filled`);

      engineNum++;
    } else {
      console.log(`ℹ️ No Engine ${engineNum} data found`);
      console.log(`✅ Total engines added: ${engineNum - 1}`);
      hasMoreEngines = false;
    }
}
 
  // 20. Speed (moved here - filled AFTER engine details)
  if (VehicleData["Speed"] || VehicleData["Max_Speed"]) {
    const speedValue = VehicleData["Speed"] || VehicleData["Max_Speed"];
    console.log(`✅ 20. Speed field, filling: ${speedValue}`);
    await fillSpeed(speedValue, page);
  }

  
  // if (await isElementVisible(getMooringStateYesButton())) {
  //   await getMooringStateNoButton().click({ force: true });
  //   await wait(2000);
  //   console.log(`✅ Mooring State No button clicked`);
  // }
  
 const mooringStateValue = VehicleData["DifferentSummerWinterMooring"] || "No";
  if (await isElementVisible(getMooringStateYesButton()) || await isElementVisible(getMooringStateNoButton())) {
    console.log(`✅ 19b. Vehicle Ineligible field, selecting: ${mooringStateValue}`);
    await selectMooringState(mooringStateValue);
  }

  
  await handleOrderTerritoryCode();
  console.log(`✅ Antique-specific flow completed (with Condition and Restoration fields)`);
}

// ========================================
// TRAILER-SPECIFIC FIELDS
// ========================================
async function applyTrailerFields(VehicleData: any, page: Page) {
  console.log(`🚛 Applying Trailer-specific fields...`);
  // Trailer-specific fields (Storage Type, Purchase Price/Date/Value, etc.)
  // To be implemented based on BT_VehiclesPage pattern
  await fillValue(VehicleData["Value"]);
}

// ========================================
// MAIN FILL FUNCTION
// ========================================
export async function fillVehicleCorePage(page: Page, testInfo: TestInfo, Vehicles: any[], ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any,): Promise<ValidationResult> {
  try {
  // First, add a temporary vehicle to ensure fields load properly (similar to GPA pattern)
  console.log(`🔄 Adding temporary vehicle to initialize form...`);
  await clickAddVehicleButton();
  await wait(2000);
  await clickNewVehicleButton();
  await wait(2000);

  // Select a temporary vehicle type to initialize the form
  await selectVehicleType(page, "Antique");
  await wait(3000);
  console.log(`✅ Temporary vehicle added and form initialized`);

  for (let VehicleData of Vehicles) {
    // Process vehicles that have a valid Vehicle_Type (regardless of Vehicle column value)
    const vehicleType = !(VehicleData["Vehicle"].includes("PCR")) ? VehicleData["Vehicle_Type"] : null;
    const vehicleId = VehicleData["Vehicle"] || "Unknown Vehicle";
    
    if (vehicleType && vehicleType.toString().trim() !== "") {
      console.log("📦 Vehicle Data:", VehicleData);
      console.log(`🚗 Processing Vehicle Type: ${vehicleType} (ID: ${vehicleId})`);
      
      // For the first vehicle, we already have a form ready (the temporary one)
      // For subsequent vehicles, we need to add new vehicles
      const currentIndex = Vehicles.indexOf(VehicleData);
      const isFirstVehicle = currentIndex === 0;
        if (!isFirstVehicle) {
        try {
          console.log(`Adding new vehicle form for Vehicle ${currentIndex + 1}`);
          await getAddVehicleButton().waitFor({ state: "visible", timeout: STANDARD_TIMEOUT });
          await getAddVehicleButton().click();
            await clickNewVehicleButton();
            await wait(2000);
          console.log("✅ Clicked Add Vehicle button");

          // Wait for the new vehicle form to appear
          await wait(5000); // Increased wait for form to render
          
          // Verify the vehicle type dropdown count increased (simpler approach)
          const newTypeCount = await getVehicleType().count();
          console.log(`✅ Vehicle ${currentIndex + 1} form check - Found ${newTypeCount} vehicle type dropdown(s)`);
          
          if (newTypeCount < currentIndex + 1) {
            console.warn(`⚠️ Expected ${currentIndex + 1} dropdowns but found ${newTypeCount}. Waiting longer...`);
            await wait(3000);
            const retryCount = await getVehicleType().count();
            console.log(`Retry check - Found ${retryCount} vehicle type dropdown(s)`);
          }

          // Additional wait to ensure form is fully interactive
          await wait(2000);
        } catch (err) {
          console.error(`❌ Failed to add Vehicle ${currentIndex + 1} form:`, err);
          throw new Error(`Failed to add vehicle form for Vehicle ${currentIndex + 1}`);
        }
        
        // 🔧 NEW FEATURE: For Vehicle 2 and 3, select a temporary vehicle type first to initialize Angular
        console.log(`🔄 Selecting temporary vehicle type to initialize Angular for Vehicle ${currentIndex + 1}`);
        
        // Determine temporary type (opposite of actual type to ensure change)
        const tempVehicleType = vehicleType.toLowerCase().includes("Antique") ? "Trailer" : "Yacht";
        console.log(`   - Temporary type: ${tempVehicleType}`);
        console.log(`   - Actual type: ${vehicleType}`);
        
        try {
          // Select temporary vehicle type
          await selectVehicleType(page, tempVehicleType);
          console.log(`✅ Selected temporary vehicle type: ${tempVehicleType}`);
          
          // Wait for Angular to initialize with temporary selection
          await wait(3000);
          
          console.log(`🔄 Now selecting actual vehicle type: ${vehicleType}`);
        } catch (tempErr) {
          console.warn(`⚠️ Failed to select temporary vehicle type, proceeding with actual type:`, tempErr);
        }
      }
      
      // ✅ Select vehicle type first - this determines which fields appear
      console.log(`🔄 Setting vehicle type to: ${vehicleType}`);
      await selectVehicleType(page, vehicleType);
      await wait(5000); // Wait for fields to load based on vehicle type

      console.log(`🔍 Checking if Hull ID field is available...`);
      if (await isElementVisible(getHullID())) {
        console.log(`✅ Hull ID field IS visible after vehicle type selection`);
      } else {
        console.log(`⚠️ Hull ID field NOT visible after vehicle type selection`);
      }

      // ✅ Apply vehicle type-specific flow
      const type = vehicleType.toLowerCase();

      if (type.includes("yacht")) {
        // Use the complete yacht-specific flow (in exact order)
        console.log(`🛥️ Processing as Yacht: ${vehicleType}`);
        await applyGenericFields(VehicleData, page, vehicleType);
        await applyYachtSpecificFlow(VehicleData, page, testInfo);
      } else if (type.includes("antique")) {
        // Use the complete antique-specific flow (same as yacht + Condition + Restoration)
        console.log(`🏛️ Processing as Antique: ${vehicleType}`);
        await applyGenericFields(VehicleData, page, vehicleType);
        await applyAntiqueSpecificFlow(VehicleData, page);
      } else if (type.includes("trailer")) {
        // For Trailer, use generic + trailer fields
        console.log(`🚛 Processing as Trailer: ${vehicleType}`);
        await applyGenericFields(VehicleData, page, vehicleType);
        await applyTrailerFields(VehicleData, page);
      } else {
        // YT product only supports: Yacht, Antique, and Trailer
        console.log(`⚠️ Unsupported vehicle type '${vehicleType}' for YT product - using generic fields only`);
        await applyGenericFields(VehicleData, page, vehicleType);
      }
      await captureFullPage2D(page, testInfo, `Vehicle ${currentIndex + 1} Details Tab`, "#centerPanel");

      if (await isElementVisible(getAddtionalInterests())) {
        await getAddtionalInterests().click();
        console.log(`Clicking on Addtional Interests Tab for Vehicle ${currentIndex + 1}`);
        await wait(2000);
        await captureFullPage2D(page, testInfo, `Vehicle ${currentIndex + 1} Additional Interest Tab`, "#centerPanel");

        // Switch back so next vehicle starts from Vehicle Details tab context.
        if (await isElementVisible(getVehicleDetailsTab())) {
          await getVehicleDetailsTab().click({ force: true });
          await wait(2000);
          console.log(`Switched back to Vehicle Details Tab for Vehicle ${currentIndex + 1}`);
        }
      }

      console.log(`✅ Completed processing for vehicle type: ${vehicleType}`);
    } else {
      console.log(`⚠️ Skipping row with empty/missing Vehicle_Type:`, VehicleData);
    }
  }

  //await getVehiclesSaveandNextOption().scrollIntoViewIfNeeded();
  await wait(1000);

  await getAddVehicleButton().scrollIntoViewIfNeeded();
  await wait(1000);
  //await captureAndAttachforCore(page, testInfo, "FillVehicleCorePage 1");
  //await captureFullPage2D(page, testInfo, `Vehicle ${currentIndex + 1} Details Tab`, "#centerPanel");
  await getVehiclesSaveandNextOption().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(3000);
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
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
    await captureFullPage2D(page, testInfo, `Warning In Vehicles Page`, "#centerPanel");
    if(await isElementVisible(getClearButton())){
      console.log("Clear button is visible, clicking on it");
      await getClearButton().click({ timeout: TIMEOUT_8_SECONDS });
    }    await getVehiclesSaveandNextOption().click({ timeout: 4000 });
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




