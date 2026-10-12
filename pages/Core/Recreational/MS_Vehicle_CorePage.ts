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
import { validateRulesForTestCase, ValidationResult } from "../../../utils/ruleBasedValidation";
import { selectDropdownCore, selectYesNo, selectYesNoRadioCore } from "../../../utils/question-helper";
import { fillValue, fillValueList, getAddtionalInterests, getSaveDraft, getValue, getValueList } from "./BT_Vehicle_CorePage";
import { waitForPageReady } from "../RiskAnalysis_CorePage";
 
const getOccasional = () => getLocator("//div[contains(text(),'Occasional Pleasure Use')]");
const getUsageDropdown = () => getLocator("//td[@id='simplecombo-2605-inputCell']//following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getAddVehicleButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel_tb:CreateVehicle']");
const getNewVehicleButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel_tb:CreateVehicle:NewVehicle-itemEl']");
const getVehicleType = () => getLocator("//label[contains(text(), 'Vehicle Type')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getYesKitCar = () => getLocator("//label[contains(text(), 'Registered for Street Use')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoKitCar = () => getLocator("//label[contains(text(), 'Kit Car')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getVinNumber = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:Vin_DV-inputEl']");
const getYesBypassVINValidation = () => getLocator("//label[contains(text(), 'Bypass VIN Validations')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoBypassVINValidation = () => getLocator("//label[contains(text(), 'Bypass VIN Validations')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesStateAssignedVIN = () => getLocator("//label[contains(text(), 'State Assigned VIN')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoStateAssignedVIN = () => getLocator("//label[contains(text(), 'State Assigned VIN')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getYear = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:Year_DV-inputEl']");
const getMake = () => getLocator("//label[contains(text(), 'Make')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getMakeDescription = () => (getLocator("//input[contains(@id,'MakeDescription-inputEl')]"));
const getModel = () => getLocator("//label[contains(text(), 'Model')]//parent::td/parent::tr//td[contains(@class,' x-trigger-cell x-unselectable')]");
const getModelDescription = () => (getLocator("//input[contains(@id,'ModelDescription-inputEl')]"));
const getBodyType = () => getLocator("//input[contains(@id, 'Body')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getYesRegisteredforStreetUse = () => getLocator("//label[contains(text(), 'Registered for Street Use')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoRegisteredforStreetUse = () => getLocator("//label[contains(text(), 'Registered for Street Use')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getStorageType = () => getLocator("//input[contains(@id,'Storagetype-inputEl')]");
//const getStorageType = () => getLocator("//input[contains(@id, 'Storage')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getStorageConstructionType = () => getLocator("//label[contains(text(), 'Storage Construction Type')]//parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
// const getValue = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:StatedValue-inputEl']");
const getCondition = () => getLocator("//input[contains(@id, 'Condition')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getRestoration = () => getLocator("//input[contains(@id, 'Restoration')]/parent::td/parent::tr//td//div[contains(@class, 'x-form-arrow-trigger')]");
const getEngineSize = () => getLocator("//label[normalize-space()='Engine Size (cc)']/ancestor::td/following-sibling::td//input");
const getYesLeased = () => getLocator("//label[contains(text(), 'Leased')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoLeased = () => getLocator("//label[contains(text(), 'Leased')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getOrderTerritoryCode = () => getLocator("//a[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAGarageLocationInputSet:OrderTerritoryCode')]");
const getAlarm = () => getLocator("//div[contains(text(), 'Alarm')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getDisablingDevice = () => getLocator("//div[contains(text(), 'Disabling Device')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getDoesBuildingHaveFollowing = () => getLocator("//div[contains(text(), 'Does the storage building have any of the following?')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getUsage = () => getLocator("//label[contains(text(),'Usage - Add all that apply')]");
const getVehiclesSaveandNextOption = () => getLocator('//span[contains(@id,"PAVehiclesScreen") and contains(text(), "Vehicles")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getPurchaseDate = () => getLocatorByPlaceholder("MM/dd/yyyy");
const getYesSalvage = () => getLocator("//label[contains(text(), 'Salvaged/Rebuilt')]/parent::td/parent::tr//td//label[contains(text(),'Yes')]");
const getNoSalvage = () => getLocator("//label[contains(text(), 'Salvaged/Rebuilt')]/parent::td/parent::tr//td//label[contains(text(),'No')]");
const getYesAntiTheftDevice = () => getLocator("//div[contains(text(), 'Do you have any anti-theft devices?')]/parent::td/parent::tr//td//input[contains(@inputvalue,'true')]");
const getNoAntiTheftDevice = () => getLocator("//div[contains(text(), 'Do you have any anti-theft devices?')]/parent::td/parent::tr//td//input[contains(@inputvalue,'false')]");
const getTrailerVIN = () => getLocator("//input[contains(@id,'Vin_DV-inputEl')]");
const getTrailerValue = () => getLocator("//input[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAVehicleTrailerInputSet:StatedValue-inputEl')]");
const getTrailerModelYear = () => getLocator("//input[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAVehicleTrailerInputSet:Year_DV-inputEl')]");
const getModelYearInput = () => getLocator("//input[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:Year_DV-inputEl']")
const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getTrailerMake = () => getLocator("//input[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAVehicleTrailerInputSet:Make_DV-inputEl')]");
const getTrailerLength = () => getLocator("//input[contains(@id,'Length-inputEl')]");
const getAdditionalInterestTab = () => getLocator("//span[contains(text(),'Additional Interest')]/parent::span/parent::span/parent::a[contains(@id,'AdditionalInterestCardTab')]");
const getUsageInput = () => getLocator("//input[@id='simplecombo-1209-inputEl']");
const getRemoveButton = () => getLocator("//a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAUseInputSet:VehicleusageLV_tb:Remove']");
const getVehicleDetailstab = () => getLocator("//span[contains(text(),'Vehicle Details')]/parent::span/parent::span/parent::a[contains(@id,'VehicleDetailCardTab')]");
const getRegistrationAddressArrowButton = () => getLocator("//table[contains(@id,'PARegistLocationInput-inputWrap')]//a[contains(@id,'MenuIcon')]");
const getRegistrationAddressNewAddress = () => getLocator("//div[contains(@id,'PARegistLocationInputMenuIcon-fieldMenu')]//span[contains(@id,'NewGarageLocation-textEl')]");
const getStorageAddressArrowButton = () => getLocator("//table[contains(@id,'PAGarageLocationInput')]//a[contains(@id,'PAGarageLocationInputMenuIcon')]");
const getStorageAddressNewAddress = () => getLocator("//div[contains(@id,'PAGarageLocationInputMenuIcon-fieldMenu')]//span[contains(@id,'NewGarageLocation-textEl')]");
const getNewAddressLine1 = () => getLocator("//input[contains(@id,'AddressLine1-inputEl')]");
const getNewAddressLine2 = () => getLocator("//input[contains(@id,'AddressLine2-inputEl')]");
const getNewAddressCity = () => getLocator("//input[contains(@id,'CityNoAutoFill-inputEl')]");
const getNewAddressZipCode = () => getLocator("//input[contains(@id,'PostalCode-inputEl')]");
const getNewAddressOKButton = () => getLocator("//span[text()='OK']");
const getLocationInformationHeader = () => getLocator("//span[text()='Location Information']");
const getNewAddress = () => getLocator("//div//span[contains(text(),'New Address')]");
const getRegistrationExistingAddress = () => getLocator("//span[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAGarageLocationInputSet:PARegistLocationInput:AddExistingAccountLocation-textEl']");
const getStorageExistingAddress = () => getLocator("//span[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PAVehiclesScreen:PAVehiclesPanelSet:VehiclesListDetailPanel:VehiclesDetailsCV:PersonalAuto_Vehicle_ExtDV:PAGarageLocationInputSet:PAGarageLocationInput:AddExistingAccountLocation-textEl']");
 
async function clickAddVehicleButton() {
  await getAddVehicleButton().click({ force: true });
}
async function fillTrailerVinValue(number: string) {
  await getTrailerVIN().click({ force: true });
  await wait(2000);
  await getTrailerVIN().type(number, { delay: 1000 });
  await wait(3000);
 
}
async function clickAdditionalInterestButton() {
  await getAdditionalInterestTab().click({ force: true });
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
async function fillTrailerModelYearValue(modelYear: number) {
  if(await isElementVisible(getTrailerModelYear())){
    await getTrailerModelYear().click({ force: true });
    await fill(getTrailerModelYear(), modelYear.toString());
    await wait(2000);
    await fill(getTrailerModelYear(), modelYear.toString());
  }
}
async function fillModelYear(page: Page,modelYear: string){
  if(await isElementVisible(getModelYearInput())){
    await getModelYearInput().click();
    await getModelYearInput().pressSequentially(modelYear.toString(),{delay: 250});
    await page.keyboard.press('Tab');
  }
}
async function selectRegisteredforStreetUseOption(value: any) {
  await getYesKitCar().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesKitCar().click({ force: true });
  } else {
    await getNoKitCar().click({ force: true });
  }
}
async function fillVinValue(number: string) {
  await getVinNumber().click();
  await fill(getVinNumber(), number);
  await wait(2000);
  await getPage().keyboard.press('Tab');
}
async function selectByPassVINValidationOption(value: any) {
  await getYesBypassVINValidation().scrollIntoViewIfNeeded();
  console.log("Bypass value",value);
  if (value == "Yes") {
    await getYesBypassVINValidation().click();
    console.log(`Selected ${value} for ByPass VIN`);  
  } else {
    await getNoBypassVINValidation().click();
    console.log(`Selected ${value} for ByPass VIN`);
  }
}
async function selecStateAssignedVINOption(value: any) {
  await getYesStateAssignedVIN().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesStateAssignedVIN().click({ force: true });
  } else {
    await getNoStateAssignedVIN().click({ force: true });
  }
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
      console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectMake: option '${value}' not found after ${maxAttempts} attempts`);
}
 
async function enterMakeDescription() {
  if (await isElementVisible(getMakeDescription())) {
    await getMakeDescription().fill("All Other");
    }else{
      console.log("Make Description field is not appeared in UI.")
    }
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
      console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
      await optionLocator.press('Tab');
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectModel: option '${value}' not found after ${maxAttempts} attempts`);
}
 
 
async function enterModelDescription() {
  if (await isElementVisible(getModelDescription())) {
    await getModelDescription().pressSequentially("All Other");
  } else {
    console.log("Model Description field is not enabled");
  }
}
async function selectRegistrationAddressNewAddress() {
  await getRegistrationAddressArrowButton().click();
  await wait(2000);                      
  await getRegistrationAddressNewAddress().waitFor({ state: 'visible' });
  await wait(2000);
  await getRegistrationAddressNewAddress().click();
}
 
async function selectStorageAddressNewAddress() {
  await getStorageAddressArrowButton().click();
  await wait(2000);                      
  await getStorageAddressNewAddress().waitFor({ state: 'visible' });
  await wait(2000);
  await getStorageAddressNewAddress().click();
}
 
async function fillNewAddress(addressline1: any, city:any, zipCode:any,addressline2?: any,) {
  await getNewAddressLine1().click({ force: true });
  await fill(getNewAddressLine1(), addressline1);
  await wait(2000);
  if(addressline2){
    await getNewAddressLine2().click({ force: true });
    await fill(getNewAddressLine2(), addressline2);
  }
  await wait(2000);
  await getNewAddressCity().click({ force: true });
  await fill(getNewAddressCity(), city);
  await wait(2000);
  await getNewAddressZipCode().click({ force: true });
  await fill(getNewAddressZipCode(), zipCode);
  await wait(2000);
  await getNewAddressOKButton().click();
}
async function selectStorageAddressSameAsRegistrationAddress(page: Page, VehicleData: any) {
  await getStorageAddressArrowButton().scrollIntoViewIfNeeded();
  // Step 1: Click arrow
  await getStorageAddressArrowButton().click();
  await waitForPageReady(page);
  // Step 2: Click "Existing Address" (visible one only)
  const existingAddress = await page.locator(
    "//span[contains(@class,'x-menu-item-text') and contains(text(),'Existing Address')]"
  )
  // .locator(':visible').click();
 
  // await existingAddress.hover();
 
  //   await existingAddress.dispatchEvent('mouseover');
  //   await page.waitForTimeout(1000);
 
 
  //   await wait(2000);
 
  // const line1 = VehicleData["Storage_Address_Address_Line_1"]?.toLowerCase();
  // const city = VehicleData["Storage_Address_City"]?.toLowerCase();
  // const zip = VehicleData["Storage_Address_Zip"];
 
  // console.log("DEBUG Address:", { line1, city, zip });
 
 
  // const option = page.locator(
  //   `
  //     //span[contains(@class,'x-menu-item-text')
  //     and contains(
  //       translate(normalize-space(.),
  //         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  //         'abcdefghijklmnopqrstuvwxyz'
  //       ),
  //       '${line1}'
  //     )]
  //     `
  // ).filter({visible: true});
 
  await existingAddress.click();
  await waitForPageReady(page);
  console.log("Clicked 'Existing Address'");
  await page.keyboard.press('Control+ArrowRight');
  console.log("Pressed ArrowRight (opened submenu)");
  await waitForPageReady(page);
  //Convert data to Title Case e. g "525 TOPAZ WAY" → "525 Topaz Way"
  // Step 3: Select address (visible one only)
  const option = page.locator(
    `//span[contains(@class,'x-menu-item-text')
              and contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),
                          '${VehicleData["Registration_Address_Address_Line_1"].toLowerCase()}')
              and contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),
                          '${VehicleData["Registration_Address_City"].toLowerCase()}')
              and contains(text(),'${VehicleData["Registration_Address_Zip"]}')]`
  );
  // .locator(':visible');
 
  const activeOption = page.locator('div.x-menu:visible .x-menu-item-active .x-menu-item-text').filter({hasNotText:"Existing Address"});
  const activeText = (await activeOption.innerText()).replace(/\s+/g, ' ').trim().toLowerCase();
  const optionText = (await option.innerText()).replace(/\s+/g, ' ').trim().toLowerCase();
  const optionLocator = page.getByRole('link',{name:optionText});
 
  console.log("Active: ", activeText);
  console.log("Expected: ", optionText);
 
  if (activeText === optionText) {
    console.log("Match found");
    await optionLocator.click();
    await waitForPageReady(page);
    // await page.keyboard.press('Enter');
  }
  else {
    console.log("Not Found")
  }
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
      console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectBodyType: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectRegisteredforStrretUse(value: any) {
  try {
    await getYesRegisteredforStreetUse().scrollIntoViewIfNeeded();
  } catch(e){}
  if (value === "Yes") {
    await getYesRegisteredforStreetUse().click({ force: true });
  } else {
    await getNoRegisteredforStreetUse().click({ force: true });
  }
}
async function selectSalvagedRebuilt(value: any) {
  await getYesSalvage().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesSalvage().click({ force: true });
  } else {
    await getNoSalvage().click({ force: true });
  }
}
async function fillTrailerValue(value: number) {
  await getTrailerValue().click({ force: true });
  await fill(getTrailerValue(), value.toString());
  await wait(2000);
}
async function fillTrailerLengthValue(length: number) {
  await getTrailerLength().click({ force: true });
  await fill(getTrailerLength(), length.toString());
  await wait(2000);
  await fill(getTrailerLength(), length.toString());
}
async function selectAntiTheftDevices(value: any) {
  if (await getYesAntiTheftDevice().count() > 0) {
 
    await getYesAntiTheftDevice().scrollIntoViewIfNeeded();
 
    if (value === "Yes") {
      await getYesAntiTheftDevice().click({ force: true });
    } else {
      await getNoAntiTheftDevice().click({ force: true });
    }
 
  } else {
    console.log("Anti-theft question not present, skipping...");
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
 
 
async function fillTrailerMakeValue(make: string) {
  await getTrailerMake().click({ force: true });
  await fill(getTrailerMake(), make.toString());
  await wait(2000);
  await fill(getTrailerMake(), make.toString());
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
async function fillValue_MS(value: number) {
  await getValue().click();
  await fill(getValue(), value.toString());
  await wait(2000);
  await fill(getValue(),value.toString());
  await wait(5000);
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
      console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectConstructionType: option '${value}' not found after ${maxAttempts} attempts`);
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
      console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
 
  throw new Error(`selectConstructionType: option '${value}' not found after ${maxAttempts} attempts`);
}
async function fillEngineSize(engineSize: number) {
  await getEngineSize().click({ force: true });
  await fill(getEngineSize(), engineSize.toString());
  await wait(2000);
 
 
}
const gridConfig: any = {
  Usage: {
    inputName: "usagetype",
    gridRoot: () => getLocator("//div[contains(@id,'VehicleusageLV')]//tBody//tr"),
    addButton: () =>
      getLocator("//a[contains(@id,'VehicleusageLV_tb:Add')]"),
    hasDefaultRow: true
  },
  Modification: {
    inputName: "modificationType",
    gridRoot: () => getLocator("//div[contains(@id,'VehicleModificationLV')]//tBody//tr"),
    addButton: () =>
      getLocator("//a[contains(@id,'VehicleModificationLV_tb:Add')]"),
    hasDefaultRow: false
  }
};
async function selectGridDropdownValues(
  type: "Usage" | "Modification",
  values: string[]
) {
  const config = gridConfig[type];
  const grid = config.gridRoot();
 
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
 
    console.log(`Selecting ${type}: ${value}`);
 
    // ✅ Step 1: Check if row exists (only for Usage first iteration)
    // const rowExists = await grid.locator("//tr[contains(@class,'x-grid-row')]").count() > 0;
    const rowExists = (await grid.count()) > 0;
    if (i === 0 && config.hasDefaultRow && rowExists) {
      console.log("Using existing default row");
 
      // ✅ Click existing row cell
      await grid.first().locator("xpath=.//td[contains(@class,'g-cell-edit')][1]").click();
 
    } else {
      // ✅ For subsequent entries OR Modification
      console.log("Clicking Add for new row");
      await config.addButton().click();
      await wait(2000);
 
      // ✅ Click new row
      await grid.last().locator("xpath=.//td[contains(@class,'g-cell-edit')][1]").click();
    }
 
    // ✅ Step 2: Get active editor input
    const input = getPage().locator(
      `div.x-editor:visible input[name="${config.inputName}"]`
    );
 
    await input.waitFor({ state: "visible", timeout: 5000 });
 
    // ✅ Step 3: Open dropdown
    await input.click();
    await input.press("ArrowDown");
 
    // ✅ Step 4: Select option (retry)
    const optionLocator = getLocator(
      `//ul[@class='x-list-plain']//li[text()="${value}"]`
    );
 
    let selected = false;
 
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        await optionLocator.waitFor({ state: "visible", timeout: 1000 });
        await optionLocator.click();
        console.log(`${type}: selected '${value}'`);
        selected = true;
        break;
      } catch {
        await wait(500);
      }
    }
 
    // ✅ Step 5: fallback
    if (!selected) {
      console.log(`${type}: fallback selection`);
 
      const fallback = getLocator(
        `//div[contains(text(),'${value}')]/ancestor::tr//img[contains(@class,'x-grid-checkcolumn')]`
      );
 
      await fallback.click();
    }
 
    await wait(500);
  }
}
 
async function selectUsageValue(value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()="${value}"]`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getOccasional().click({ force: true }).catch(() => { });
 
    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectUsageDropdown: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }
  console.log("1");
  await wait(5000);
  const option1 = getLocator(`//div[contains(text(),'${value}')]/parent::td//preceding-sibling::td//img[@class='x-grid-checkcolumn']`)
  //div[contains(text(),'${value}')]/parent::td/parent::tr/td//div[contains(@class, 'x-grid-cell-inner x-grid-cell-inner-checkcolumn')]
  await click(option1);
  throw new Error(`selectUsageDropdown: option '${value}' not found after ${maxAttempts} attempts`);
 
 
}
async function selectLeased(value: any) {
  await getYesLeased().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesLeased().click({ force: true });
  } else {
    await getNoLeased().click({ force: true });
  }
}
 
 
async function selectAlarm(page: Page, value: string) {
  await getAlarm().scrollIntoViewIfNeeded();
  await getAlarm().click({ force: true });
  await page.waitForSelector("//ul[contains(@class,'x-list-plain')]", {
    timeout: 5000,
  });
  const optionLocator = getLocator(
    `//ul[contains(@class,'x-list-plain')]//li[contains(normalize-space(.), "${value}")]`
  );
  await optionLocator.click();
}
 
 
 
// async function selectDisablingDevice(page: Page, value: any) {
//   await getDisablingDevice().scrollIntoViewIfNeeded();
//   await getDisablingDevice().click({ force: true });
//   await wait(3000);
//   //await getApplicantPrimaryResidence().click({force: true});
//   const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
//   await click(optionLocator);
// }
 
async function selectDisablingDevice(page: Page, value: string) {
 
  const cell = getDisablingDevice();
  await cell.scrollIntoViewIfNeeded();
  await cell.click();
  const optionLocator = page.locator(`//ul[contains(@class,'x-list-plain')]//li[contains(normalize-space(.), "${value}")]`);
  await optionLocator.waitFor({ state: 'visible' });
  await optionLocator.click();
}
 
async function selectUsage(page: Page, value: any) {
  await getUsage().scrollIntoViewIfNeeded();
  const option1 = getLocator(`//div[contains(text(),'Occasional Pleasure Use')]/parent::td/parent::tr/td//img`)
  await click(option1);
  await getRemoveButton().click();
  await getUsageInput().clear();
  await wait(3000);
  await fill(getUsageInput(),value);
 
  await wait(3000);
 
  const option = getLocator(`//div[contains(text(),'${value}')]/parent::td/parent::tr/td//img`)
  await click(option);
}
 
export async function fillVehicleCorePage(page: Page,
  testInfo: TestInfo,
  Vehicles: any[],
  ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any
): Promise<ValidationResult> {
  try {
    for (let i = 0; i < Vehicles.length; i++) {
      const VehicleData = Vehicles[i];
      const vehicleType = !(VehicleData["Vehicle"].includes("PCR")) ? VehicleData["Vehicle_Type"] : null;
      if(!vehicleType){
        console.log(`Finished adding ${Vehicles.length} vehicles.`);
        break;
      }
      console.log(`🚗 Processing Vehicle ${i + 1}`, VehicleData);
 
      // ✅ Clear previous state if needed (only for subsequent vehicles)
      if (i > 0) {
        for (let j = 0; j < 5; j++) {
          if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
            await getClearButtoninRiskAnalysisCore().click({ force: true });
            await wait(3000);
          } else break;
        }
 
        await clickAddVehicleButton();
        await wait(2000);
        await clickNewVehicleButton();
        await wait(4000);
      } else {
        // ✅ First vehicle
        await clickAddVehicleButton();
        await wait(2000);
        await clickNewVehicleButton();
        await wait(2000);
      }
 
      await getVehicleDetailstab().click({ force: true });
 
      // ✅ Vehicle Type
      if (VehicleData["Vehicle_Type"]) {
        await selectVehicleType(page, VehicleData["Vehicle_Type"]);
        await wait(3000);
      }
 
      // ✅ VIN
      if (VehicleData["VIN/Serial Number"]) {
        if (VehicleData["Vehicle_Type"] === "Trailer") {
          await fillTrailerVinValue(VehicleData["VIN/Serial Number"]);
        } else {
          await fillVinValue(VehicleData["VIN/Serial Number"]);
        }
      }
      //✅ Bypass VIN Validations
      if(VehicleData["Bypass_Vin_Validations"])
      {
        await selectByPassVINValidationOption(VehicleData["Bypass_Vin_Validations"]);
      }      
      await selectYesNoRadioCore(page,"State_Assigned_VIN",VehicleData["State_Assigned_VIN"]);
      // ✅ Model Year
      if (VehicleData["Model_Year"]) {
        if (VehicleData["Vehicle_Type"] === "Trailer") {
          await fillTrailerModelYearValue(VehicleData["Model_Year"]);
        } else{
          await fillModelYear(page,VehicleData["Model_Year"]);
        }
      }
 
      // ✅ Make + Model
      if (
        ["Golf Cart", "Snowmobile", "ATV/Utility", "Motorcycle","Dirt Bike"].includes(
          VehicleData["Vehicle_Type"]
        )
      ) {
        if (VehicleData["Make"]) {
          await selectDropdownCore(page,"Make", VehicleData["Make"]);
          await page.keyboard.press('Tab');
          await enterMakeDescription();
        }
 
        if (VehicleData["Model"]) {
          await selectDropdownCore(page,"Model", VehicleData["Model"]);
          await page.keyboard.press('Tab');
          await wait(4000);
          await enterModelDescription();
        }
      }
 
      // ✅ Trailer specific
      if (VehicleData["Vehicle_Type"] === "Trailer") {
        await fillTrailerMakeValue(VehicleData["Make"]);
        await fillTrailerLengthValue(20);
        await fillTrailerValue(VehicleData["Value"]);
      }
 
      // ✅ Registered for Street Use
      if (
        ["Golf Cart", "Snowmobile", "ATV/Utility", "Motorcycle", "Dirt Bike"].includes(
          VehicleData["Vehicle_Type"]
        ) &&
        VehicleData["Registered_for_Street_Use"]
      ) {
        await selectRegisteredforStrretUse(
          VehicleData["Registered_for_Street_Use"]
        );
      }
 
      //Resgistration Address.
      let newRegistartionAdressAdded = false;
      if (VehicleData["Vehicle_Type"] != "Trailer") {
        if (VehicleData["Registration_Address_Address_Line_1"] && VehicleData["Registration_Address_City"] && VehicleData["Registration_Address_Zip"]) {
          await selectRegistrationAddressNewAddress();
          await getLocationInformationHeader().waitFor({ state: 'visible' });
          await fillNewAddress(VehicleData["Registration_Address_Address_Line_1"], VehicleData["Registration_Address_City"], VehicleData["Registration_Address_Zip"])
          newRegistartionAdressAdded=true;
        }
      }
      if (VehicleData["Vehicle_Type"] != "Trailer") {
        // if (VehicleData["Registration_Address_same_as_Storage_Address?"].toLowerCase() === 'yes' && newRegistartionAdressAdded) {
        //    await selectStorageAddressSameAsRegistrationAddress(page,VehicleData);
        // }
        if (VehicleData["Storage_Address_Address_Line_1"] && VehicleData["Storage_Address_City"] && VehicleData["Storage_Address_Zip"]) {
          await selectStorageAddressNewAddress();
          await getLocationInformationHeader().waitFor({ state: 'visible' });
          await fillNewAddress(VehicleData["Storage_Address_Address_Line_1"], VehicleData["Storage_Address_City"], VehicleData["Storage_Address_Zip"])
        }
      }
      await waitForPageReady(page);
      if (VehicleData["Value"] && await getValue().isVisible()) {
        console.log(`Value field visible, filling: ${VehicleData["Value"]}`);
        await fillValue(VehicleData["Value"],page);
      }
 
      if (VehicleData["Value"] && await getValueList().isVisible()) {
        console.log(`Value List field visible, filling: ${VehicleData["Value"]}`);
        await fillValueList(VehicleData["Value"],page);
      }
 
 
      // ✅ Salvage
      if (VehicleData["Salvaged/Rebuilt?"]) {
        if(VehicleData["Salvaged/Rebuilt?"]=="Yes")
        {
          getYesSalvage().click();
        }
        else{
          getNoSalvage().click()
        }
        //await selectYesNoRadioCore(page,"Salvaged/Rebuilt?",VehicleData["Salvaged/Rebuilt?"]);
      }
 
      // ✅ Purchase Date
      if (VehicleData["Vehicle_Type"] !== "Trailer" && VehicleData["Purchase_Date"]) {
        const rawExcelValue = VehicleData["Purchase_Date"];
        const jsDate = excelDateToJSDate(rawExcelValue);
        const dateValue = formatToMMDDYYYY(jsDate);
 
        await getPurchaseDate().scrollIntoViewIfNeeded();
        await wait(500);
 
        let purchaseDateSet = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`🔄 Purchase Date attempt ${attempt}: ${dateValue}`);
          await getPurchaseDate().click({ force: true });
          await getPurchaseDate().fill("");
          await getPurchaseDate().fill(dateValue);
          await wait(500);
          await getPurchaseDate().press("Tab");
          await wait(1000);
 
          const filledValue = await getPurchaseDate().inputValue({ timeout: 3000 });
          console.log(`🔍 Purchase Date field contains: "${filledValue}"`);
 
          if (
            filledValue === dateValue ||
            filledValue.replace(/\//g, "") === dateValue.replace(/\//g, "")
          ) {
            purchaseDateSet = true;
            break;
          }
        }
 
        if (!purchaseDateSet) {
          console.warn(
            `⚠️ Purchase Date was not applied for Vehicle ${i + 1}: ${dateValue}`
          );
        }
      }
 
      // ✅ Engine size
      if (
        ["ATV/Utility", "Dirt Bike", "Snowmobile"].includes(
          VehicleData["Vehicle_Type"]
        ) &&
        VehicleData["Engine_Size(CC)"]
      ) {
        await fillEngineSize(VehicleData["Engine_Size(CC)"]);
      }
 
 
      // ✅ Usage + Storage (non-trailer)
      if (VehicleData["Vehicle_Type"] !== "Trailer") {
        // await selectUsageValue(
        //   VehicleData["Usage_-_Select_all_that_apply"]
        // );
       
        const modifications: string[] = VehicleData["Modifications_-_Select_all_that_apply"]
        .split(',')
        .map((x:any) => x.trim())
        .filter((x:any) => x.length > 0)
 
        await selectGridDropdownValues("Modification",modifications);
        const Usages: string[] = VehicleData["Usage_-_Select_all_that_apply"]
        .split(',')
        .map((x:any) => x.trim())
        .filter((x:any) => x.length > 0)
        await selectGridDropdownValues("Usage",Usages);
 
        await selectAntiTheftDevices(VehicleData["AntiTheftDevices"]);
        await selectDropdownCore(page,"AntiTheftAlarm",VehicleData["AntiTheftAlarm"]);
        await selectDropdownCore(page,"AntiTheftDisablingDevice",VehicleData["AntiTheftDisablingDevice"]);
        await selectYesNoRadioCore(page,"AntiTheftVINEtching",VehicleData["AntiTheftVINEtching"]);
        await selectYesNoRadioCore(page,"AntiTheftVehicleRecoveryTrackingSystem",VehicleData["AntiTheftVehicleRecoveryTrackingSystem"]);
        await selectYesNoRadioCore(page,"VehicleAntiTheftDevices",VehicleData["VehicleAntiTheftDevices"]);
        await selectYesNoRadioCore(page,"IneligibleVehicle",VehicleData["IneligibleVehicle"]);
        await selectYesNoRadioCore(page,"ActiveAlarmOnly",VehicleData["ActiveAlarmOnly"]);
        await selectYesNoRadioCore(page,"PassiveAlarmOnly",VehicleData["PassiveAlarmOnly"]);
        await selectYesNoRadioCore(page,"-IgnitionOrStarterCutoffSwitch",VehicleData["IgnitionOrStarterCutoffSwitch"]);
        await selectYesNoRadioCore(page,"SteeringColumnArmoredCollar",VehicleData["SteeringColumnArmoredCollar"]);
        await selectYesNoRadioCore(page,"FuelCutoffDevice",VehicleData["FuelCutoffDevice"]);
        await selectYesNoRadioCore(page,"PermanentlyAttachedSteeringWheelLock",VehicleData["PermanentlyAttachedSteeringWheelLock"]);
        await selectYesNoRadioCore(page,"ArmoredCableHoodLockAndIgnitionCutoffSwitch",VehicleData["ArmoredCableHoodLockAndIgnitionCutoffSwitch"]);
        await selectYesNoRadioCore(page,"ArmoredIgnitionCutoffSwitch",VehicleData["ArmoredIgnitionCutoffSwitch"]);
        await selectYesNoRadioCore(page,"ArmoredCableOrElectricHoodLockAndIgnitionCutoff",VehicleData["ArmoredCableOrElectricHoodLockAndIgnitionCutoff"]);
        await selectYesNoRadioCore(page,"PassiveDisablingDevice",VehicleData["PassiveDisablingDevice"]);
        await selectYesNoRadioCore(page,"VINEtchingWindowIdentificationSystem",VehicleData["VINEtchingWindowIdentificationSystem"]);
        await selectYesNoRadioCore(page,"VehicleRecoverySystem",VehicleData["VehicleRecoverySystem"]);
        await selectYesNoRadioCore(page,"HighSecurityIgnitionReplacementLock",VehicleData["HighSecurityIgnitionReplacementLock"]);
        await selectYesNoRadioCore(page,"InternallyOperatedAlarms",VehicleData["InternallyOperatedAlarms"]);
        await selectYesNoRadioCore(page,"SpecifiedAlarms",VehicleData["SpecifiedAlarms"]);
        await selectYesNoRadioCore(page,"HistoricVehicle",VehicleData["HistoricVehicle"]);
        await selectYesNoRadioCore(page,"VehicleRegistrationType",VehicleData["VehicleRegistrationType"]);
        await selectYesNoRadioCore(page,"AuxiliaryLightingSystem",VehicleData["AuxiliaryLightingSystem"]);
 
       
 
 
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
 
        await selectStorageType(VehicleData["Storage_Type"]);
      }
 
          await getSaveDraft().click()
          await waitForPageReady(page);
 
      // ✅ Capture screenshot dynamically
      await captureFullPage2D(page, testInfo, `Vehicle ${i+1} Details`, "#centerPanel");
  if (await isElementVisible(getAddtionalInterests())) {
        await getAddtionalInterests().click();
        console.log(`Clicking on Addtional Interests Tab For Vehicle ${i+1}`);
        await wait(2000);
        await captureFullPage2D(page, testInfo, `Vehicle ${i+1} Additional Interest Tab`, "#centerPanel");
      }
      console.log("Making Sure we are back to Vehicle Detail Tab");
      await getVehicleDetailstab().click();
      await wait(2000);
 
    }
  // ✅ Additional Interest
  // if(await isElementVisible(getAddtionalInterests())){
  //     await getAddtionalInterests().click();
  //     console.log(`Clicking on Addtional Interests Tab`);
  //     await wait(2000);
  //     await captureFullPage2D(page, testInfo, `Additional Interest Tab`, "#centerPanel");
  // }
 
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