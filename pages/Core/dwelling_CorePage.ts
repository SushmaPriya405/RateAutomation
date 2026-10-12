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
import { selectDropdownCore, selectYesNoRadioCore } from "../../utils/question-helper";
import { safeQuestionPresent, safeSelectYesNoRadioCore, safeSelectDropdownCore } from "../../utils/question-helper";
import { validateRulesForTestCase, ValidationResult } from "../../utils/coreRuleBasedValidation";
import { selectDropdownWithRetry } from "./HO_Coverages_CorePage";

const getCreateDwellingButton = () => getLocator("//span[contains(@id, 'DwellingsListDetailPanel_tb:Add-btnInnerEl')]");
const getChangeAddressDropdownButton = () => getLocator('//a[contains(@id, "HODwellingLocationInputMenuIcon")]');
const getNewAddressButton = () => getLocator('//span[contains(@id, "HODwellingLocationInput:NewGarageLocation-textEl") and contains(text(), "New Address")]');
const getAddressLine1Field = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:AddressLine1-inputEl")]');
const getAddressLine2Field = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:AddressLine2-inputEl")]');
const getCityField = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:CityNoAutoFill-inputEl")]');
const getZipCodeField = () => getLocator('//input[contains(@id, "GlobalAddressInputSet:PostalCode-inputEl")]');
const getOkPopupButton = () => getLocator('//span[contains(@id, "LocationPopup:LocationScreen:Standardize-btnInnerEl") and contains(text(), "OK")]');
const getTerritoryDetailsTab = () => getLocator('//a[contains(@id, "TerritoryCodeInputSet:GetTerritoryDetailsId") and contains(text(), "Get Territory Details")]');
const getProtectionClassCodeField = () => getLocator(' //label[normalize-space()=\'Protection Class Code\']   /ancestor::tr[contains(@class,\'x-form-item-input-row\')]//input');
const getResidenceTypeDropdown = () => getLocator('//input[contains(@id, "HODwelling_ExtDV:ResidenceType-inputEl")]/parent::td/parent::tr//td//div[contains(@class, "x-form-arrow-trigger")]');
const getDwellingOccupiedDropDown = () => getLocator('//input[contains(@id, "HODwelling_ExtDV:DwellingOccupancy-inputEl")]/parent::td/parent::tr//td//div[contains(@class, "x-form-arrow-trigger")]');
const getYesFraternitySorority = () => getLocator("//div[contains(text(), 'Is the dwelling occupied as a fraternity, sorority, student housing, group home, halfway home, or other similar occupancy?')]/parent::td/parent::tr//td//div//input[@inputvalue='true']");
const getWhyDwellingVacantDropdown = () => getLocator('//div[contains(text(), "Why is the dwelling vacant?")]/parent::td/parent::tr//td[contains(@class, "g-cell-edit")]');
const getYesDwellinginParkSpace = () => getLocator("//table[contains(@id,'IsDwellingInPark_Ext-triggerWrap')]//div[contains(@class,'x-form-arrow-trigger')]");
const getDwellinginParkSpaceDropdown = () => getLocator("//table[contains(@id,'IsDwellingInPark_Ext-triggerWrap')]//div[contains(@class,'x-form-arrow-trigger')]");
const getYesTownHomeOption = () => getLocator("//label[contains(text(), 'Is the dwelling a Townhome or Row Home?')]/parent::td/parent::tr//td//div//input[contains(@id, 'true')]");
const getNoTownHomeOption = () => getLocator("//label[contains(text(), 'Is the dwelling a Townhome or Row Home?')]/parent::td/parent::tr//td//div//input[contains(@id, 'false')]");
const getYesOccassionallyRentedOption = () => getLocator("//div[contains(text(), 'Will the Yes be occasionally rented to others?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getYesMajorRenovationOption = () => getLocator("//div[contains(text(), 'Under Construction or Major Renovation?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getYesHeatingOption = () => getLocator("//div[contains(text(), 'Supplemental Heating Source (including wood/pellet burning stove)?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getDaysUninsuredField = () => getLocator('//div[contains(text(), "For the length of time the applicant has owned the dwelling, how many days has it gone uninsured?")]/parent::td/parent::tr/td[contains(@class, "g-cell-edit")]');
const getDaysUninsuredFill = () => getLocator('//input[@name="c1" and @type="text"]');
const getYesShortTermRentalOption = () => getLocator("//div[contains(text(), 'Will the lease terms for this dwelling be less than 3 months?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getDwellingSaveAndNextButton = () => getLocator('//span[contains(@id, "HODwellingHOEScreen") and contains(text(), "Dwelling")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getProtectionDetailsTab = () => getLocator("//a[contains(@id, 'DwellingSingleProtectionIdTab')]");
const getProtectionDetailsTab_Core = () => getLocator("//div[contains(@id, 'DwellingProtectionQuestionSetsDV:QuestionSetsDV:0:QuestionSetLV-body')]");
const getYesWroughtIronBalls = () => getLocator("//div[contains(text(), 'Are there wrought iron bars in all windows and doors of the dwelling?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoWroughtIronBalls = () => getLocator("//div[contains(text(), 'Are there wrought iron bars in all windows and doors of the dwelling?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesCentralFireSmokeAlarm = () => getLocator("//div[contains(text(), 'Central Station Fire & Smoke Alarm')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoCentralFireSmokeAlarm = () => getLocator("//div[contains(text(), 'Central Station Fire & Smoke Alarm')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesCentralBurglarAlarm = () => getLocator("//div[contains(text(), 'Central Station Burglar Alarm')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoCentralBurglarAlarm = () => getLocator("//div[contains(text(), 'Central Station Burglar Alarm')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesLocalSmokeAlarm = () => getLocator("//div[contains(text(), 'Local Smoke and/or Burglar Alarm')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoLocalSmokeAlarm = () => getLocator("//div[contains(text(), 'Local Smoke and/or Burglar Alarm')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesDeadboltLocks = () => getLocator("//div[contains(text(), 'Deadbolts, Smoke Alarm and Fire Extinguisher')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoDeadboltLocks = () => getLocator("//div[contains(text(), 'Deadbolts, Smoke Alarm and Fire Extinguisher')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getWaterSensorDropdown = () => getLocator("//div[contains(text(), 'Water Sensor')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getWaterShutoffDropdown = () => getLocator("//div[contains(text(), 'Water Shutoff Device')]/parent::td/parent::tr//td[contains(@class, 'g-cell-edit')]");
const getYesPolesAndPilings = () => getLocator("//div[contains(text(), 'Supported on raised poles or pilings over 6 feet?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoPolesAndPilings = () => getLocator("//div[contains(text(), 'Supported on raised poles or pilings over 6 feet?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesCondemnedOption = () => getLocator("//div[contains(text(), 'Condemned?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoCondemnedOption = () => getLocator("//div[contains(text(), 'Condemned?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesUnrepairedWaterDamageOption = () => getLocator("//div[contains(text(), 'Any water leaks or unrepaired water damage?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoUnrepairedWaterDamageOption = () => getLocator("//div[contains(text(), 'Any water leaks or unrepaired water damage?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesUnrepairedWaterDamageOptionChecked = () => getLocator("//div[contains(text(), 'Any water leaks or unrepaired water damage?')]/parent::td/parent::tr//td//input[@inputvalue='true']/parent::td");
const getNoUnrepairedWaterDamageOptionChecked = () => getLocator("//div[contains(text(), 'Any water leaks or unrepaired water damage?')]/parent::td/parent::tr//td//input[@inputvalue='false']/parent::td");
const getYesUnrepairedDamageOption = () => getLocator("//div[contains(text(), 'Any broken or boarded-up windows, or any other unrepaired damage?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoUnrepairedDamageOption = () => getLocator("//div[contains(text(), 'Any broken or boarded-up windows, or any other unrepaired damage?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesUnrepairedDamageOptionChecked = () => getLocator("//div[contains(text(), 'Any broken or boarded-up windows, or any other unrepaired damage?')]/parent::td/parent::tr//td//input[@inputvalue='true']/parent::td");
const getNoUnrepairedDamageOptionChecked = () => getLocator("//div[contains(text(), 'Any broken or boarded-up windows, or any other unrepaired damage?')]/parent::td/parent::tr//td//input[@inputvalue='false']/parent::td");
const getYesLandslideOption = () => getLocator("//div[contains(text(), 'In an area that is prone to or had a prior occurrence of landslide')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoLandslideOption = () => getLocator("//div[contains(text(), 'In an area that is prone to or had a prior occurrence of landslide')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesLandSlideChecked = () => getLocator("//div[contains(text(), 'In an area that is prone to or had a prior occurrence of landslide')]/parent::td/parent::tr//td//input[@inputvalue='true']/parent::td");
const getNoLandSlideChecked = () => getLocator("//div[contains(text(), 'In an area that is prone to or had a prior occurrence of landslide')]/parent::td/parent::tr//td//input[@inputvalue='false']/parent::td");
const getYesSwimmimgPoolOption = () => getLocator("//div[contains(text(), 'Swimming pool on the premises?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getYesSwimmingPoolFence = () => getLocator("//div[contains(text(), 'Pool enclosed by a fence at least 4 feet')]/parent::td/parent::tr//td//input[@inputvalue='true']")
const getNoSwimmingPoolFence = () => getLocator("//div[contains(text(), 'Pool enclosed by a fence at least 4 feet')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getNoSwimmimgPoolOption = () => getLocator("//div[contains(text(), 'Swimming pool on the premises?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesBusinessPremisesOption = () => getLocator("//div[contains(text(), 'Business on the premises?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoBusinessPremisesOption = () => getLocator("//div[contains(text(), 'Business on the premises?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesFarmingPremisesOption = () => getLocator("//div[contains(text(), 'Farming conducted on the premises?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoFarmingPremisesOption = () => getLocator("//div[contains(text(), 'Farming conducted on the premises?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesAnimalsOwnCare = () => getLocator("//div[contains(text(), 'own or care for any animals?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoAnimalsOwnCare = () => getLocator("//div[contains(text(), 'own or care for any animals?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesEarthHome = () => getLocator("//div[contains(text(), 'Earth home, dome home, or any other non-conventional design?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoEarthHome = () => getLocator("//div[contains(text(), 'Earth home, dome home, or any other non-conventional design?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesCurrentlyWorking = () => getLocator("//div[contains(text(), 'Currently have working utilities?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoCurrentlyWorking = () => getLocator("//div[contains(text(), 'Currently have working utilities?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesInaccessibleRoad = () => getLocator("//div[contains(text(), 'Isolated and inaccessible by road?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoInaccessibleRoad = () => getLocator("//div[contains(text(), 'Isolated and inaccessible by road?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getYesCommercialRisk = () => getLocator("//div[contains(text(), 'Attached to a commercial risk?')]/parent::td/parent::tr//td//input[@inputvalue='true']");
const getNoCommercialRisk = () => getLocator("//div[contains(text(), 'Attached to a commercial risk?')]/parent::td/parent::tr//td//input[@inputvalue='false']");
const getUnderwritingTab = () => getLocator("//a[contains(@id, 'dwellingunderwritingTab')]");
const getPerilScoresTab = () => getLocator("//a[contains(@id, 'DwellingPerilScoresIdTab')]");
const getAdditionalIntrestsTab = () => getLocator("//a[contains(@id, 'DwellingAdditionalInterestIdTab')]");
const getRoofDetailsTab = () => getLocator("//a[contains(@id, 'DwellingRoofDetailsIdTab')]");
const getAddressErrorMsg = () => getLocator("//div[contains(text(), 'The address entered does not appear to be a valid address.')]");
const getCorrectAddressSelectOption = () => getLocator("//a[@id='AddressRangePopup:AddressStandardizeLV:0:select']");
const getAddressPopUpCancelButton = () => getLocator("//span[@id='AddressRangePopup:Cancel-btnInnerEl']")
const getOverRideButton = () => getLocator("//a[@id='AddressRangePopup:AddressStandardizeLV:select']");
const getChooseReason = () => getLocator("//td[@id='AddressRangePopup:OverrideReason-inputCell']/following-sibling::td//div[contains(@class, 'x-form-arrow-trigger')]")
const getContinuePopUpButton = () => getLocator("//span[@id= 'AddressRangePopup:ToolbarButton-btnInnerEl']")
const getLocationHazardsTab = () => getLocator("//span[contains(@id, 'DwellingLocationHazardsIdTab-btnInnerEl')]");
const getDwellingFireField = () =>
  getLocator('//input[contains(@id, "DwellingFireDesc-inputEl")]');

const getDwellingTheftField = () =>
  getLocator('//input[contains(@id, "DwellingTheftDesc-inputEl")]');

const getDwellingLiabilityField = () =>
  getLocator('//input[contains(@id, "DwellingLiabilityDesc-inputEl")]');

const getDwellingWindHailField = () =>
  getLocator('//input[contains(@id, "DwellingWindHailDesc-inputEl")]');

const getDwellingWaterField = () =>
  getLocator('//input[contains(@id, "DwellingWaterlDesc-inputEl")]');

const getDwellingOtherField = () =>
  getLocator('//input[contains(@id, "DwellingOtherlDesc-inputEl")]');
const getAnimalFarmCell = (label: any) => getLocator(`//tr//div[contains(text(),'${label}')]/parent::td//following-sibling::td`);
const getAnimalFarmInput = (label: any) => getLocator(`//tr//div[contains(text(),'${label}')]/parent::td//following-sibling::td//ancestor::div[2]/following-sibling::div//input`)
const getFarmAnimalsHorses = () =>
  getLocator(
    "//tr[.//div[contains(normalize-space(), 'Horses')]]/td[contains(@class,'gridcolumn-2441')]//div"
  ).or(getLocator("//tr//div[contains(text(),'Horses')]/parent::td//following-sibling::td"));

const getFarmAnimalsCow = () =>
  getLocator(
    "//tr[.//div[contains(normalize-space(), 'Cows, Donkeys')]]/td[contains(@class,'gridcolumn-2441')]//div"
  ).or(getLocator("//tr//div[contains(text(),'Cows, Donkeys')]/parent::td//following-sibling::td"));

const getFarmSmallAnimals = () =>
  getLocator(
    "//tr[.//div[contains(normalize-space(), 'Small Animals (Chickens, Goats, etc.)')]]/td[contains(@class,'gridcolumn-2441')]//div"
  ).or(getLocator("//tr//div[contains(text(),'Small Animals (Chickens, Goats, etc.)')]/parent::td//following-sibling::td"));

const getFarmAnimalsEmu = () =>
  getLocator(
    "//tr[.//div[contains(normalize-space(), 'Emus, Ostriches, Llamas')]]/td[contains(@class,'gridcolumn-2441')]//div"
  ).or(getLocator("//tr//div[contains(text(),'Emus, Ostriches, Llamas')]/parent::td//following-sibling::td"));

const getFarmAnimalsOthers = () =>
  getLocator(
    "//tr[.//div[contains(normalize-space(), 'Other')]]/td[contains(@class,'gridcolumn-2441')]//div"
  ).or(getLocator("//tr//div[contains(text(),'Other')]/parent::td//following-sibling::td"));
  

async function selectProtectionClassCode(value: any) {
  if(await isElementVisible(getProtectionClassCodeField()) && value !== null && value !== undefined && value !== ''){
  await getProtectionClassCodeField().click();
  await getProtectionClassCodeField().fill(""); // Clear existing value
  await getProtectionClassCodeField().fill(value.toString()); // Fill new value
  }
}

async function selectResidenceType(value: any) {
  // if(await isElementVisible(getResidenceTypeDropdown()) && value !== null && value !== undefined && value !== ''){
  // await click(getResidenceTypeDropdown());
  // // Log all dropdown options
  // const optionsLocator = getLocator("//ul[@class='x-list-plain']//li");
  // const options = await optionsLocator.allTextContents();
  // console.log("Residence Type Dropdown Options:", options);
  // const residenceTypeOption = getLocator(`//ul[@class='x-list-plain']//li[text()= '${value}']`);
  // await click(residenceTypeOption);
  // }
  await selectDropdownWithRetry(getResidenceTypeDropdown(),value);
}
async function selectDwellingOccupied(value: any) {
  await wait(500);
  if (await isElementVisible(getDwellingOccupiedDropDown()) && value) {
    await wait(2000);
    if(await isElementVisible(getDwellingOccupiedDropDown())){
    await click(getDwellingOccupiedDropDown());
    // Log all dropdown options
    const optionsLocator = getLocator("//ul[@class='x-list-plain']//li");
    const options = await optionsLocator.allTextContents();
    console.log("Dwelling Occupied Dropdown Options:", options);
    const dwellingOccupiedOption = getLocator(`//ul[@class='x-list-plain']//li[text()= '${value}']`);
    await click(dwellingOccupiedOption);
    }
  }
}
async function selectTownHomeOption(value: any, page: Page, data: any) {
  await wait(500);
  try {
    const yesOption = getYesTownHomeOption();
    const noOption = getNoTownHomeOption();
 
    // Check if Yes/No options are visible
    const yesVisible = await isElementVisible(yesOption);
    const noVisible = await isElementVisible(noOption);
 
    // If question is not available in the UI, skip gracefully
    if (!yesVisible && !noVisible) {
      console.log("Townhome/Row Home question not applicable for this dwelling type (options not visible)");
      return;
    }
 
    // If value is provided, select the appropriate option
    if (value) {
      if (value === "Yes" && yesVisible) {
        await click(yesOption);
        console.log("✅ Selected 'Yes' for Townhome/Row Home");
       
        // Wait for possible child question to appear
        await wait(3000);
       
        // Try to select TownRowHomeUW child question if data is provided
        if (data && data["TownRowHomeUW"]) {
          await selectYesNoRadioCore(page, "TownRowHomeUW", data["TownRowHomeUW"]);
        }
      } else if (value === "No" && noVisible) {
        await click(noOption);
        console.log("✅ Selected 'No' for Townhome/Row Home");
      } else if (value && !yesVisible && value === "Yes") {
        console.log("⚠️ Yes option not visible for Townhome/Row Home");
      } else if (value && !noVisible && value === "No") {
        console.log("⚠️ No option not visible for Townhome/Row Home");
      }
    }
  } catch (error) {
    console.log("⚠️ Townhome/Row Home question not applicable for this dwelling type (elements not found):", error);
  }
}
async function selectDwellinginParkSpace(value: any) {
  // if (await isElementVisible(getYesDwellinginParkSpace()) && value) {
  //   await click(getYesDwellinginParkSpace());
  //   const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  //   await click(optionLocator);
  // }
  await selectDropdownWithRetry(getDwellinginParkSpaceDropdown(),value);
}
async function selectOccasionallyRentedOption(value: any) {
  if (await isElementVisible(getYesOccassionallyRentedOption()) && value) {
    if (value === "Yes") {
      await click(getYesOccassionallyRentedOption());
    }
  }
}
async function selectShortTermRentalOption(value: any) {
  if (await isElementVisible(getYesShortTermRentalOption()) && value) {
    if (value === "Yes") {
      await click(getYesShortTermRentalOption());
    }
  }
}
async function selectFraternitySororityOption(value: any, dwellingOccupied: any) {
  if (await isElementVisible(getYesFraternitySorority()) && value) {
    if (dwellingOccupied === "Rental") {
      if (value === "Yes") {
        await click(getYesFraternitySorority());
      }
    }
  }
}

async function enterDaysUninsured(page:Page, value: any) {
  if(await isElementVisible(getDaysUninsuredField()) && value !== null && value !== undefined && value !== '') {
  await getDaysUninsuredField().click();
  await getDaysUninsuredFill().click();
  await fill(getDaysUninsuredFill(), value);
  }
  else{
    await getDaysUninsuredField().click();
  await getDaysUninsuredFill().click();
  await fill(getDaysUninsuredFill(), '0');
  }
  await page.keyboard.press('Tab');
}
async function selectMajorRenovationOption(value: any) {
  if (await isElementVisible(getYesMajorRenovationOption()) && value) {
    if (value === "Yes") {
      await click(getYesMajorRenovationOption());
    }
  }
}
async function selectHeatingOption(value: any) {
  if (await isElementVisible(getYesHeatingOption()) && value) {
    if (value === "Yes") {
      await click(getYesHeatingOption());
    }
  }
}
async function selectWhyDwellingVacant(value: any, dwellingOccupied: any) {
  if (dwellingOccupied === "Vacant") {
    if (await isElementVisible(getWhyDwellingVacantDropdown()) && value !== null && value !== undefined && value !== '') {
    await click(getWhyDwellingVacantDropdown());
    const whyDwellingVacantOption = getLocator(`//ul[@class='x-list-plain']//li[text()= '${value}']`);
    await click(whyDwellingVacantOption);
    }
  }
}
async function selectWroghtIronBalls(value: any) {
  if (await isElementVisible(getYesWroughtIronBalls())) {
    if (value === "Yes") {
      await click(getYesWroughtIronBalls());
    } else {
      await click(getNoWroughtIronBalls());
    }
  }
}
async function selectCentralFireSmokeAlarm(value: any) {
  if (await isElementVisible(getYesCentralFireSmokeAlarm())) {
    if (value === "Yes") {
      await click(getYesCentralFireSmokeAlarm());
    } else {
      await click(getNoCentralFireSmokeAlarm());
    }
  }
}
async function selectCentralBurglarAlarm(value: any) {
  if (await isElementVisible(getYesCentralBurglarAlarm())) {
    if (value === "Yes") {
      await click(getYesCentralBurglarAlarm());
    } else {
      await click(getNoCentralBurglarAlarm());
    }
  }
}
async function selectLocalSmokeAlarm(value: any) {
  if (await isElementVisible(getYesLocalSmokeAlarm())) {
    if (value === "Yes") {
      await click(getYesLocalSmokeAlarm());
    } else {
      await click(getNoLocalSmokeAlarm());
    }
  }
}
async function selectDeadboltLocks(value: any) {
  if (await isElementVisible(getYesDeadboltLocks())) {
    if (value === "Yes") {
      await click(getYesDeadboltLocks());
    } else {
      await click(getNoDeadboltLocks());
    }
  }
}
async function selectWaterSensor(value: any) {
  await wait(500);
  console.log("Water Sensor Value:", value);
  if (value !== null && value !== undefined && value !== '') {
    await click(getWaterSensorDropdown());
    const waterSensorOption = getLocator(`//ul[@class='x-list-plain']//li[text()= '${value}']`);
    await click(waterSensorOption);
  }
}
async function selectWaterShutoff(value: any) {
  await wait(500);
  console.log("Water Shutoff Value:", value);
  if (value !== null && value !== undefined && value !== '') {
    await click(getWaterShutoffDropdown());
    const waterShutoffOption = getLocator(`//ul[@class='x-list-plain']//li[text()= '${value}']`);
    await click(waterShutoffOption);
  }
}
async function selectPolesAndPilings(value: any) {
  if (await isElementVisible(getYesPolesAndPilings())) {
    if (value === "Yes") {
      await click(getYesPolesAndPilings());
    } else {
      await click(getNoPolesAndPilings());
    }
  }
}
async function selectCondemnedOption(value: any) {
  if (await isElementVisible(getYesCondemnedOption())) {
    if (value === "Yes") {
      await click(getYesCondemnedOption());
    } else {
      await click(getNoCondemnedOption());
    }
  }
}
async function selectUnrepairedWaterDamageOption(value: any) {
  await wait(500);
  if (await isElementVisible(getYesUnrepairedWaterDamageOption())) {
    if (value === "Yes") {
      const yesOption = getYesUnrepairedWaterDamageOption().first();
      for (let attempt = 0; attempt < 3; attempt++) {
        await yesOption.click({ force: true });
        await wait(800);
        // Get the parent <td> element
        const parentTd = getYesUnrepairedWaterDamageOptionChecked();
        const className = await parentTd.getAttribute('class');
        console.log(`Attempt ${attempt + 1}: class = ${className}`);
        if (className?.includes('x-form-cb-checked')) {
          console.log("✅ Unrepaired water damage 'Yes' option is selected via class check.");
          break;
        }
        if (attempt === 2) {
          console.log("❌ Unrepaired water damage Radio button still not selected after 3 attempts.");
        }
        await wait(500);
      }
    } else {
      const NoOption = getNoUnrepairedWaterDamageOption().first();
      for (let attempt = 0; attempt < 3; attempt++) {
        await NoOption.click({ force: true });
        await wait(800);
        // Get the parent <td> element
        const parentTd = getNoUnrepairedWaterDamageOptionChecked();
        const className = await parentTd.getAttribute('class');
        console.log(`Attempt ${attempt + 1}: class = ${className}`);
        if (className?.includes('x-form-cb-checked')) {
          console.log("✅ Unrepaired water damage 'No' option is selected via class check.");
          break;
        }
        if (attempt === 2) {
          console.log("❌ Unrepaired water damage Radio button still not selected after 3 attempts.");
        }
        await wait(500);
      }
    }
  }
}
async function selectUnrepairedDamageOption(value: any) {
  if (await isElementVisible(getYesUnrepairedDamageOption())) {
    await wait(500);
    if (value === "Yes") {
      const yesOption = getYesUnrepairedDamageOption().first();

      for (let attempt = 0; attempt < 3; attempt++) {
        await yesOption.click({ force: true });
        await wait(800);

        // Get the parent <td> element
        const parentTd = getYesUnrepairedDamageOptionChecked();
        const className = await parentTd.getAttribute('class');

        console.log(`Attempt ${attempt + 1}: class = ${className}`);

        if (className?.includes('x-form-cb-checked')) {
          console.log("✅ Land slide 'Yes' option is selected via class check.");
          break;
        }

        if (attempt === 2) {
          console.log("❌ Land slide Radio button still not selected after 3 attempts.");
        }

        await wait(500);
      }


    } else {
      const NoOption = getNoUnrepairedDamageOption().first();

      for (let attempt = 0; attempt < 3; attempt++) {
        await NoOption.click({ force: true });
        await wait(800);

        // Get the parent <td> element
        const parentTd = getNoUnrepairedDamageOptionChecked();
        const className = await parentTd.getAttribute('class');

        console.log(`Attempt ${attempt + 1}: class = ${className}`);

        if (className?.includes('x-form-cb-checked')) {
          console.log("✅ Land slide 'Yes' option is selected via class check.");
          break;
        }

        if (attempt === 2) {
          console.log("❌ Land slide Radio button still not selected after 3 attempts.");
        }

        await wait(500);
      }
    }
  }
}

async function selectLandslideOption(value: any) {
  if (await isElementVisible(getYesLandslideOption())) {
    if (value === "Yes") {
      const yesOption = getYesLandslideOption().first();

      for (let attempt = 0; attempt < 3; attempt++) {
        await yesOption.click({ force: true });
        await wait(800);

        // Get the parent <td> element
        const parentTd = getYesLandSlideChecked();
        const className = await parentTd.getAttribute('class');

        console.log(`Attempt ${attempt + 1}: class = ${className}`);

        if (className?.includes('x-form-cb-checked')) {
          console.log("✅ Land slide 'Yes' option is selected via class check.");
          break;
        }

        if (attempt === 2) {
          console.log("❌ Land slide Radio button still not selected after 3 attempts.");
        }

        await wait(2000);
      }


    } else {
      const NoOption = getNoLandslideOption().first();

      for (let attempt = 0; attempt < 3; attempt++) {
        await NoOption.click({ force: true });
        await wait(TIMEOUT_8_SECONDS);

        // Get the parent <td> element
        const parentTd = getNoLandSlideChecked();
        const className = await parentTd.getAttribute('class');

        console.log(`Attempt ${attempt + 1}: class = ${className}`);

        if (className?.includes('x-form-cb-checked')) {
          console.log("✅ Land slide 'Yes' option is selected via class check.");
          break;
        }

        if (attempt === 2) {
          console.log("❌ Land slide Radio button still not selected after 3 attempts.");
        }

        await wait(2000);
      }

    }
  }
}
// async function selectSwimmingPoolOption(value: any, fenceValue: any) {
//   if (await isElementVisible(getYesSwimmimgPoolOption())) {
//     if (value === "Yes") {
//       await click(getYesSwimmimgPoolOption());
//       if (fenceValue === "Yes") {
//         await click(getYesSwimmingPoolFence());
//       } else {
//         await click(getNoSwimmingPoolFence());
//       }
//     } else {
//       await click(getNoSwimmimgPoolOption());
//     }
//   }
// }

async function selectSwimmingPoolOption(
  page: Page,
  SwimmingPool: string,
  PoolFence: string
) {
  // Use generic helper for main question
  await selectYesNoRadioCore(page, 'SwimmingPoolPremises', SwimmingPool, { optional: true });
  
  // Handle pool fence follow-up if main answer was Yes
  if (SwimmingPool?.trim().toLowerCase() === "yes") {
    await wait(TIMEOUT_8_SECONDS);
    await selectYesNoRadioCore(page, 'SwimmingPoolFence', PoolFence, { optional: true });
  }
}

async function  selectBusinessPremisesOption(
  page: Page,
  data: any
) {
  // Use generic helper for main question
  await selectYesNoRadioCore(page, 'BusinessPremises', data["BusinessPremises"], { optional: true });
  
  // Handle follow-up questions if main answer was Yes
  if (data["BusinessPremises"]?.trim().toLowerCase() === "yes") {
    await wait(TIMEOUT_4_SECONDS);
    await selectYesNoRadioCore(page, 'BusinessEmployeesPremises', data["BusinessEmployeesPremises"], { optional: true });
    await selectYesNoRadioCore(page, 'BusinessIncreasedHazard', data["BusinessIncreasedHazard"], { optional: true });
    await selectYesNoRadioCore(page, 'BusinessExposure', data["BusinessExposure"], { optional: true });
    await selectYesNoRadioCore(page, 'BusinessDaycare', data["BusinessDaycare"], { optional: true });
    await selectYesNoRadioCore(page, 'BusinessFootTraffic', data["BusinessFootTraffic"], { optional: true });
    await selectYesNoRadioCore(page, 'BusinessFootTrafficOrEmployees', data["BusinessFootTrafficOrEmployees"], { optional: true });
    await selectYesNoRadioCore(page, 'BusinessIncreasedPropertyOrLiabilityHazard', data["BusinessIncreasedPropertyOrLiabilityHazard"], { optional: true });
  }

}

async function selectFarmingConductOption(
  page: Page,
  data: any
) {
  // Use generic helper for main question
  await selectYesNoRadioCore(page, 'FarmingPremises', data["FarmingPremises"], { optional: true });
  
  // Handle gross receipts follow-up if main answer was Yes
  if (data["FarmingPremises"]?.trim().toLowerCase() === "yes") {
    await wait(TIMEOUT_4_SECONDS);
    await selectYesNoRadioCore(page, 'FarmingReceiptsExceed', data["FarmingReceiptsExceed"], { optional: true });
  }
}

async function selectOwnCareAnimalsOption(
  page: Page,
  data: any
) {
  // Use generic helper for main question
  await selectYesNoRadioCore(page, 'AnimalsOwnCare', data["AnimalsOwnCare"], { optional: true });
  
  // Handle follow-up questions if main answer was Yes
  if (data["AnimalsOwnCare"]?.trim().toLowerCase() === "yes") {
    await wait(TIMEOUT_4_SECONDS);
    await selectYesNoRadioCore(page, 'AnimalsBiteHistoryWildExotic', data["AnimalsBiteHistoryWildExotic"], { optional: true });
    await selectYesNoRadioCore(page, 'AnimalsSpecificBreeds', data["AnimalsSpecificBreeds"], { optional: true });
    await selectYesNoRadioCore(page, 'AnimalsFarm', data["AnimalsFarm"], { optional: true });
    await selectYesNoRadioCore(page, 'DogsTrainedToAttackOrGuard', data["DogsTrainedToAttackOrGuard"], { optional: true });
    await selectYesNoRadioCore(page, 'DogUsedForFighting', data["DogUsedForFighting"], { optional: true });
    await selectYesNoRadioCore(page, 'DogNotInoculatedAsRequiredByLaw', data["DogNotInoculatedAsRequiredByLaw"], { optional: true });
    await selectYesNoRadioCore(page, 'AnimalsBiteHistoryViciousUnusualExotic', data["AnimalsBiteHistoryViciousUnusualExotic"], { optional: true });
    await selectYesNoRadioCore(page, 'AnimalBittenInjuredSomeone', data["AnimalBittenInjuredSomeone"], { optional: true });
    await selectYesNoRadioCore(page, 'ClaimPaidResultOFAnimal', data["ClaimPaidResultOFAnimal"], { optional: true });
    await selectYesNoRadioCore(page, 'NonDomesticAnimalsOnPremises', data["NonDomesticAnimalsOnPremises"], { optional: true });
    
    // Handle farm animal counts if applicable
    if (data["AnimalsFarm"]?.trim().toLowerCase() === "yes") {
      await handleFarmAnimalInputs(data);
    }
  }
}

async function handleFarmAnimalInputs(data: any) {
  const farmInputs = [
    { label: "Horses", locatorFn: getFarmAnimalsHorses, value: data["AnimalsFarmNumberHorses"] },
    { label: "Cows, Donkeys", locatorFn: getFarmAnimalsCow, value: data["AnimalsFarmNumberCowsDonkeys"] },
    { label: "Small Animals (Chickens, Goats, etc.)", locatorFn: getFarmSmallAnimals, value: data["AnimalsFarmNumberSmallAnimals"] },
    { label: "Emus, Ostriches, Llamas", locatorFn: getFarmAnimalsEmu, value: data["AnimalsFarmNumberEmusOstrichesLlamas"] },
    { label: "Others", locatorFn: getFarmAnimalsOthers, value: data["AnimalsFarmNumberOthers"] }
  ];

for (const { label, value } of farmInputs) {
  if (!value) continue;

  const cell = getAnimalFarmCell(label);
  const input = getAnimalFarmInput(label);
  
  // const isCellVisible = await cell.isVisible().catch(() => false);
  // if (!isCellVisible) {
  //   console.log(`Skipping ${label} - cell not visible`);
  //   continue;
  // }

  try {
  await cell.waitFor({
    state: 'visible',
    timeout: 10000
  });
} catch {
  console.log(`Skipping ${label}`);
  continue;
}


  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // 🔥 click only if editor not already open
      if (!(await input.isVisible())) {
        console.log(`Clicking ${label} cell`);
        await cell.click();
      }

      // ✅ Wait for editor input
      await input.waitFor({ state: 'visible', timeout: 5000 });

      // ✅ Clear + fill
      await input.fill('');
      await input.fill(value.toString());

      console.log(`✅ Filled '${value}' for ${label}`);
      await wait(2000);
      await getPage().keyboard.press('Tab');
      break;
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed for ${label}`);

      if (attempt === 3) throw error;

      // ✅ close editor (optional but helps)
      await input.press('Escape').catch(() => {});
      await input.page().waitForTimeout(500);
    }
  }
}
}

async function selectFarmingPremisesOption(value: any) {
  if (await isElementVisible(getYesFarmingPremisesOption())) {
    if (value === "Yes") {
      await click(getYesFarmingPremisesOption());
    } else {
      await click(getNoFarmingPremisesOption());
    }
  }
}
async function selectAnimalsOwnCareOption(value: any) {
  if (await isElementVisible(getYesAnimalsOwnCare())) {
    if (value === "Yes") {
      await click(getYesAnimalsOwnCare());
    } else {
      await click(getNoAnimalsOwnCare());
    }
  }
}
async function selectEarthHomeOption(value: any) {
  if (await isElementVisible(getYesEarthHome())) {
    if (value === "Yes") {
      await click(getYesEarthHome());
    } else {
      await click(getNoEarthHome());
    }
  }
}
async function selectCurrentlyWorkingUtilitiesOption(value: any) {
  if (await isElementVisible(getYesCurrentlyWorking())) {
    if (value === "Yes") {
      await click(getYesCurrentlyWorking());
    } else {
      await click(getNoCurrentlyWorking());
    }
  }
}
async function selectInaccessibleByRoadOption(value: any) {
  if (await isElementVisible(getYesInaccessibleRoad())) {
    if (value === "Yes") {
      await click(getYesInaccessibleRoad());
    } else {
      await click(getNoInaccessibleRoad());
    }
  }
}
async function selectCommercialRiskOption(value: any) {
  if (await isElementVisible(getYesCommercialRisk())) {
    if (value === "Yes") {
      await click(getYesCommercialRisk());
    } else {
      await click(getNoCommercialRisk());
    }
  }
}

export async function fillDwellingDetails(page: Page, testInfo: TestInfo, DwellingDetails: any, streetAddress2?: any) {
  streetAddress2 = DwellingDetails["StreetAddress1"];
  await click(getCreateDwellingButton());
  await wait(4000);
  if (streetAddress2 && DwellingDetails["How_Dwell_Occupied"] != "Owner Occupied") {
    await click(getChangeAddressDropdownButton());
    await click(getNewAddressButton());
    await fill(getAddressLine1Field(), DwellingDetails["StreetAddress1"]);
    if(DwellingDetails["StreetAddress2"]!='' && DwellingDetails["StreetAddress2"]!=null && DwellingDetails["StreetAddress2"]!=undefined){
      await fill(getAddressLine2Field(), DwellingDetails["StreetAddress2"]);
    }
    await fill(getCityField(), DwellingDetails["City"]);
    await fill(getZipCodeField(), DwellingDetails["ZipCode"]);
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
  await getTerritoryDetailsTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(4000);
  await selectProtectionClassCode(DwellingDetails["Protection_Class_Code"]);
  await wait(2000);
  await selectResidenceType(DwellingDetails["Residence_Type"]);
  await selectTownHomeOption(DwellingDetails["Town_Or_Row"]|| DwellingDetails["Town_Row_Home"] || DwellingDetails["Town_Row_Home"],page,DwellingDetails);
  // Use robust, generic dropdown helper for both questions
  await selectDwellingOccupied(DwellingDetails["How_Dwell_Occupied"]);
  await selectDwellinginParkSpace(DwellingDetails["Dwelling_In_Park"]);
  await selectYesNoRadioCore(page, "TownRowHomeUW", DwellingDetails["TownRowHomeUW"] || DwellingDetails["Town_Row_Home_UW"] || 'No');
  await selectWhyDwellingVacant(DwellingDetails["RES_QSReasonVacant_1"] || DwellingDetails["ReasonVacant"], DwellingDetails["How_Dwell_Occupied"]);
  await selectYesNoRadioCore(page, "ShortTermRental", DwellingDetails["RES_QSShortTermRental_1"] || DwellingDetails["ShortTermRental"] || 'No'); 
  await selectYesNoRadioCore(page,"LivingProximityFromProperty",DwellingDetails["LivingProximityFromProperty"]);
  await selectYesNoRadioCore(page, "PropertyManager", DwellingDetails["PropertyManager"]); 
  await selectYesNoRadioCore(page,"ShortTermRentalPropertyManager",DwellingDetails["ShortTermRentalPropertyManager"]);
  await selectFraternitySororityOption(DwellingDetails["RES_QSFraternitySorority_1"] || DwellingDetails["FraternitySorority"], DwellingDetails["How_Dwell_Occupied"]);
  await selectYesNoRadioCore(page, "OccasionalRental", DwellingDetails["OccasionalRental"] || 'No');
  console.log("Days Uninsured value:", DwellingDetails["DaysUninsured"]);
  await enterDaysUninsured(page,DwellingDetails["DaysUninsured"].toString());
  await selectYesNoRadioCore(page, "MilitaryLapse", DwellingDetails["MilitaryLapse"]); 
  await selectYesNoRadioCore(page, "UnderConstruction", DwellingDetails["UnderConstruction"] || DwellingDetails["UnderConstruction"] || 'No');
  await selectYesNoRadioCore(page, "SupplementalHeating", DwellingDetails["SupplementalHeating_1"] || DwellingDetails["SupplementalHeating"] || 'No');
  await selectYesNoRadioCore(page, "InspectionFeeWaiver", DwellingDetails["InspectionFeeWaiver"]);
  
   const container = page.locator('#centerPanel');
  
//   // ========== TOP screenshot ==========
//   await container.evaluate(el => el.scrollTop = 0);
//   await page.waitForTimeout(300);

//   await captureAndAttachforCore(page, testInfo, "Entered Dwelling Details 1 of 2", {
//     fullPage: false
//   });


//   // ========== BOTTOM screenshot ==========
//   await container.evaluate(el => {
//     el.scrollTop = el.scrollHeight - el.clientHeight;
//   });
//   await page.waitForTimeout(300);

//   await captureAndAttachforCore(page, testInfo, "Entered Dwelling Details 2 of 2", {
//     fullPage: false
//   });
await captureFullPage2D(page, testInfo, "Fill Dwelling Details", "#centerPanel");
// await captureAndAttachforCore(page, testInfo, "Entered Dwelling Details", {
  fullPage: true
// });
}
export async function fillProtectionDetails(page: Page, testInfo: TestInfo, ProtectionDetails: any) {
  await wait(10000);
  for (let attempt = 0; attempt < 5; attempt++) {
    await getProtectionDetailsTab().click({ force: true });
    await wait(10000);

    const isSelected = await getProtectionDetailsTab_Core().isVisible();
    await wait(10000);
    console.log("ProtectionDetails tab is after click", isSelected);

    if (isSelected === true) {
      console.log("ProtectionDetails tab is clicked");
      break;
    };

    if (attempt === 4) { console.log("ProtectionDetails tab is not selected after 5 attempts."); }
  }

  await wait(10000);
  // Now perform actions as before, using only shortCode and value (label is resolved internally)
  const yesNoQuestions = [
    { shortCode: "WroughtIronBars", value: ProtectionDetails["WroughtIronBars"] },
    { shortCode: "CentralFireSmokeAlarm", value: ProtectionDetails["CentralFireSmokeAlarm"] },
    { shortCode: "CentralStationFireAlarm", value: ProtectionDetails["CentralStationFireAlarm"] },
    { shortCode: "CentralBurglarAlarm", value: ProtectionDetails["CentralBurglarAlarm"] },
    { shortCode: "FireDepartmentReportingFireAlarm", value: ProtectionDetails["FireDepartmentReportingFireAlarm"] },
    { shortCode: "LocalSmokeBurglarAlarm", value: ProtectionDetails["LocalSmokeBurglarAlarm"] },
    { shortCode: "LocalFireAlarm", value: ProtectionDetails["LocalFireAlarm"] },
    { shortCode: "DeadboltsSmokeAlarmFireExtinguisher", value: ProtectionDetails["DeadboltsSmokeAlarmFireExtinguisher"] },
    { shortCode: "FireExtinguishers", value: ProtectionDetails["FireExtinguishers"] },
    { shortCode: "PrivateFireCompany", value: ProtectionDetails["PrivateFireCompany"] },
    { shortCode: "PermanentStormShutter", value: ProtectionDetails["PermanentStormShutter"] },
    { shortCode: "ImpactResistantGla", value: ProtectionDetails["ImpactResistantGla"] },
    { shortCode: "PermanentStormShuttersOrImpactResistantGlass", value: ProtectionDetails["PermanentStormShuttersOrImpactResistantGlass"] },
    { shortCode: "IBHSFortifiedCertificationPrior", value: ProtectionDetails["IBHSFortifiedCertificationPrior"] },
    { shortCode: "IBHSFortifiedCertificationAfter", value: ProtectionDetails["IBHSFortifiedCertificationAfter"] },
    { shortCode: "QualifyForHurricaneMitigation", value: ProtectionDetails["QualifyForHurricaneMitigation"] },
    // { shortCode: "RoofSecondaryWaterResistanceSystem", value: ProtectionDetails["RoofSecondaryWaterResistanceSystem"] },
    { shortCode: "QualifyForSCMitigationDiscount", value: ProtectionDetails["QualifyForSCMitigationDiscount"] },
    { shortCode: "AttachedSCLossMitigationSurvey", value: ProtectionDetails["AttachedSCLossMitigationSurvey"] },
    { shortCode: "HomeComplianceWithCode", value: ProtectionDetails["HomeComplianceWithCode"] },
    { shortCode: "RoofComplianceWithCode", value: ProtectionDetails["RoofComplianceWithCode"] },
    { shortCode: "SheathingComplianceWithCode", value: ProtectionDetails["SheathingComplianceWithCode"] },
    { shortCode: "ProtectionLayerBetweenShinglesSheathing", value: ProtectionDetails["ProtectionLayerBetweenShinglesSheathing"] },
    { shortCode: "WindowShuttersMeetCode", value: ProtectionDetails["WindowShuttersMeetCode"] },
    { shortCode: "ImpactResistantGlassMeetCode", value: ProtectionDetails["ImpactResistantGlassMeetCode"] },
    { shortCode: "GarageDoorsMeetImpactStandards", value: ProtectionDetails["GarageDoorsMeetImpactStandards"] },
    { shortCode: "WildfireMitigationCommunityLevel", value: ProtectionDetails["WildfireMitigationCommunityLevel"] },
    { shortCode: "WFFirewiseUSARecognitionProgram", value: ProtectionDetails["WFFirewiseUSARecognitionProgram"] },
    { shortCode: "WFFireRiskReductionCommunity", value: ProtectionDetails["WFFireRiskReductionCommunity"] },
    { shortCode: "ClearingVegetationDebrisUnderDecks", value: ProtectionDetails["ClearingVegetationDebrisUnderDecks"] },
    { shortCode: "MoveableCombustibleMaterialWithin5FTBuilding", value: ProtectionDetails["MoveableCombustibleMaterialWithin5FTBuilding"] },
    { shortCode: "IncorporationOnlyNonCombustibleMaterialWithin5FTBuilding", value: ProtectionDetails["IncorporationOnlyNonCombustibleMaterialWithin5FTBuilding"] },
    { shortCode: "NoCombustibleStructureWithin30FTBuilding", value: ProtectionDetails["NoCombustibleStructureWithin30FTBuilding"] },
    { shortCode: "AbidesByLocalDefensibleSpaceOrdinances", value: ProtectionDetails["AbidesByLocalDefensibleSpaceOrdinances"] },
    { shortCode: "EnclosedEaves", value: ProtectionDetails["EnclosedEaves"] },
    { shortCode: "FireResistantVents", value: ProtectionDetails["FireResistantVents"] },
    { shortCode: "MultipaneWindows", value: ProtectionDetails["MultipaneWindows"] },
    { shortCode: "ClassAFireRatedRoof", value: ProtectionDetails["ClassAFireRatedRoof"] },
    { shortCode: "GreaterOrEqual6InchofNoncombustibleVertClearanceBlding", value: ProtectionDetails["GreaterOrEqual6InchofNoncombustibleVertClearanceBlding"] },
     { shortCode: "ClassAFireRatedRoof", value: ProtectionDetails["ClassAFireRatedRoof"] || 'No' },
    
    
  ];
  for (const q of yesNoQuestions) {
    if(q.value){
    await safeSelectYesNoRadioCore(page, q.shortCode, q.value);
    await wait(4000);
    }
  }
  if(ProtectionDetails["QualifyForHurricaneMitigation"] === "Yes"){
    await wait(4000);
    await selectYesNoRadioCore(page, "AttachedLossMitigationSurvey", ProtectionDetails["AttachedLossMitigationSurvey"]);
  }
  await wait(4000);
  // Dropdowns
  const dropdowns = [
    // { shortCode: "RES_QSWaterSensor_2", value: ProtectionDetails["WaterSensor"] },
    // { shortCode: "RES_QSWaterShutoffDevice_2", value: ProtectionDetails["WaterShutoffDevice"] },
    { shortCode: "WaterSensor", value: ProtectionDetails["WaterSensor"] },
    { shortCode: "WaterShutoffDevice", value: ProtectionDetails["WaterShutoffDevice"] },
    { shortCode: "IBHSFortifiedCertification", value: ProtectionDetails["IBHSFortifiedCertification"] },
    { shortCode: "BuildingCodeDwellingConstructedToPrior", value: ProtectionDetails["BuildingCodeDwellingConstructedToPrior"] },
    { shortCode: "BuildingCodeDwellingConstructedToAfter", value: ProtectionDetails["BuildingCodeDwellingConstructedToAfter"] },
    { shortCode: "BuildingCodeConstruction", value: ProtectionDetails["BuildingCodeConstruction"] },
    { shortCode: "ExposureCategoryConstruction", value: ProtectionDetails["ExposureCategoryConstruction"] },
    { shortCode: "RoofSecondaryWaterResistanceSystem", value: ProtectionDetails["RoofSecondaryWaterResistanceSystem"] },
    { shortCode: "OpeningProtection", value: ProtectionDetails["OpeningProtection"] },
    { shortCode: "RoofGeometry", value: ProtectionDetails["RoofGeometry"] },
    { shortCode: "RoofDeckAttachment", value: ProtectionDetails["RoofDeckAttachment"] },
    { shortCode: "RoofWallConnection", value: ProtectionDetails["RoofWallConnection"] },
    { shortCode: "DoorType", value: ProtectionDetails["DoorType"] },
    { shortCode: "AutomaticSprinklerSystem", value: ProtectionDetails["AutomaticSprinklerSystem"] },
    { shortCode: "NaillipsStrapomplianceWithCode", value: ProtectionDetails["NaillipsStrapomplianceWithCode"] },
    { shortCode: "WildfireMititgationPropertyLevel", value: ProtectionDetails["WildfireMitigationPropertyLevel"] },
    { shortCode: "RoofSecondaryWaterResistanceSystem", value: ProtectionDetails["RoofSecondaryWaterResistanceSystem"] }


  ];
  for (const d of dropdowns) {
    if(d.value){
      await safeSelectDropdownCore(page, d.shortCode, d.value);
      await page.keyboard.press('Tab');
      await wait(4000);
    }
  }
  await captureFullPage2D(page, testInfo, 'Entered Protection Details', "#centerPanel");
}
export async function fillProtectionDetails_MH(page: Page, testInfo: TestInfo, ProtectionDetails: any) {
  await wait(2000);
  for (let attempt = 0; attempt < 2; attempt++) {
    await getProtectionDetailsTab().click({ force: true });
    await wait(2000);

    const isSelected = await getProtectionDetailsTab_Core().isVisible();
    await wait(2000);
    console.log("ProtectionDetails tab is after click", isSelected);

    if (isSelected === true) {
      console.log("ProtectionDetails tab is clicked");
      break;
    };

    if (attempt === 2) { console.log("ProtectionDetails tab is not selected after 3 attempts."); }
  }

  await wait(4000);
  // Now perform actions as before, using only shortCode and value (label is resolved internally)
  const yesNoQuestions = [
    { shortCode: "WroughtIronBars", value: ProtectionDetails["WroughtIronBars"] },
    { shortCode: "CentralFireSmokeAlarm", value: ProtectionDetails["CentralFireSmokeAlarm"] },
    { shortCode: "CentralBurglarAlarm", value: ProtectionDetails["CentralBurglarAlarm"] },
    { shortCode: "FireDepartmentReportingFireAlarm", value: ProtectionDetails["FireDepartmentReportingFireAlarm"] },
    { shortCode: "LocalSmokeBurglarAlarm", value: ProtectionDetails["LocalSmokeBurglarAlarm"] },
    { shortCode: "LocalFireAlarm", value: ProtectionDetails["LocalFireAlarm"] },
    { shortCode: "DeadboltsSmokeAlarmFireExtinguisher", value: ProtectionDetails["DeadboltsSmokeAlarmFireExtinguisher"] },
    { shortCode: "FireExtinguishers", value: ProtectionDetails["FireExtinguishers"] },
    { shortCode: "PrivateFireCompany", value: ProtectionDetails["PrivateFireCompany"] },
    { shortCode: "PermanentStormShutter", value: ProtectionDetails["PermanentStormShutter"] },
    { shortCode: "ImpactResistantGla", value: ProtectionDetails["ImpactResistantGla"] },
    { shortCode: "PermanentStormShuttersOrImpactResistantGlass", value: ProtectionDetails["PermanentStormShuttersOrImpactResistantGlass"] },
    { shortCode: "IBHSFortifiedCertificationPrior", value: ProtectionDetails["IBHSFortifiedCertificationPrior"] },
    { shortCode: "IBHSFortifiedCertificationAfter", value: ProtectionDetails["IBHSFortifiedCertificationAfter"] },
    { shortCode: "QualifyForHurricaneMitigation", value: ProtectionDetails["QualifyForHurricaneMitigation"] },
    { shortCode: "RoofSecondaryWaterResistanceSystem", value: ProtectionDetails["RoofSecondaryWaterResistanceSystem"] },
    { shortCode: "QualifyForSCMitigationDiscount", value: ProtectionDetails["QualifyForSCMitigationDiscount"] },
    { shortCode: "AttachedSCLossMitigationSurvey", value: ProtectionDetails["AttachedSCLossMitigationSurvey"] },
    { shortCode: "HomeComplianceWithCode", value: ProtectionDetails["HomeComplianceWithCode"] },
    { shortCode: "RoofComplianceWithCode", value: ProtectionDetails["RoofComplianceWithCode"] },
    { shortCode: "ProtectionLayerBetweenShinglesSheathing", value: ProtectionDetails["ProtectionLayerBetweenShinglesSheathing"] },
    { shortCode: "WindowShuttersMeetCode", value: ProtectionDetails["WindowShuttersMeetCode"] },
    { shortCode: "ImpactResistantGlassMeetCode", value: ProtectionDetails["ImpactResistantGlassMeetCode"] },
    { shortCode: "GarageDoorsMeetImpactStandards", value: ProtectionDetails["GarageDoorsMeetImpactStandards"] },
    { shortCode: "WildfireMitigationCommunityLevel", value: ProtectionDetails["WildfireMitigationCommunityLevel"] },
    { shortCode: "WFFirewiseUSARecognitionProgram", value: ProtectionDetails["WFFirewiseUSARecognitionProgram"] },
    { shortCode: "WFFireRiskReductionCommunity", value: ProtectionDetails["WFFireRiskReductionCommunity"] },
    { shortCode: "ClearingVegetationDebrisUnderDecks", value: ProtectionDetails["ClearingVegetationDebrisUnderDecks"] },
    { shortCode: "MoveableCombustibleMaterialWithin5FTBuilding", value: ProtectionDetails["MoveableCombustibleMaterialWithin5FTBuilding"] },
    { shortCode: "IncorporationOnlyNonCombustibleMaterialWithin5FTBuilding", value: ProtectionDetails["IncorporationOnlyNonCombustibleMaterialWithin5FTBuilding"] },
    { shortCode: "NoCombustibleStructureWithin30FTBuilding", value: ProtectionDetails["NoCombustibleStructureWithin30FTBuilding"] },
    { shortCode: "AbidesByLocalDefensibleSpaceOrdinances", value: ProtectionDetails["AbidesByLocalDefensibleSpaceOrdinances"] },
    { shortCode: "EnclosedEaves", value: ProtectionDetails["EnclosedEaves"] },
    { shortCode: "FireResistantVents", value: ProtectionDetails["FireResistantVents"] },
    { shortCode: "MultipaneWindows", value: ProtectionDetails["MultipaneWindows"] },
    { shortCode: "GreaterOrEqual6InchofNoncombustibleVertClearanceBlding", value: ProtectionDetails["GreaterOrEqual6InchofNoncombustibleVertClearanceBlding"] },
    
    
  ];
  for (const q of yesNoQuestions) {
    await safeSelectYesNoRadioCore(page, q.shortCode, q.value);
  }
  if(ProtectionDetails["QualifyForHurricaneMitigation"] === "Yes"){
    await safeSelectYesNoRadioCore(page, "AttachedLossMitigationSurvey", ProtectionDetails["AttachedLossMitigationSurvey"]);
  }
  // Dropdowns
  const dropdowns = [
    // { shortCode: "RES_QSWaterSensor_2", value: ProtectionDetails["WaterSensor"] },
    // { shortCode: "RES_QSWaterShutoffDevice_2", value: ProtectionDetails["WaterShutoffDevice"] },
    { shortCode: "WaterSensor", value: ProtectionDetails["WaterSensor"] },
    { shortCode: "WaterShutoffDevice", value: ProtectionDetails["WaterShutoffDevice"] },
    { shortCode: "IBHSFortifiedCertification", value: ProtectionDetails["IBHSFortifiedCertification"] },
    { shortCode: "BuildingCodeDwellingConstructedToPrior", value: ProtectionDetails["BuildingCodeDwellingConstructedToPrior"] },
    { shortCode: "BuildingCodeDwellingConstructedToAfter", value: ProtectionDetails["BuildingCodeDwellingConstructedToAfter"] },
    { shortCode: "BuildingCodeConstruction", value: ProtectionDetails["BuildingCodeConstruction"] },
    { shortCode: "ExposureCategoryConstruction", value: ProtectionDetails["ExposureCategoryConstruction"] },
    { shortCode: "OpeningProtection", value: ProtectionDetails["OpeningProtection"] },
    { shortCode: "RoofGeometry", value: ProtectionDetails["RoofGeometry"] },
    { shortCode: "RoofDeckAttachment", value: ProtectionDetails["RoofDeckAttachment"] },
    { shortCode: "RoofWallConnection", value: ProtectionDetails["RoofWallConnection"] },
    { shortCode: "DoorType", value: ProtectionDetails["DoorType"] },
    { shortCode: "AutomaticSprinklerSystem", value: ProtectionDetails["AutomaticSprinklerSystem"] },
    { shortCode: "NaillipsStrapomplianceWithCode", value: ProtectionDetails["NaillipsStrapomplianceWithCode"] },
    { shortCode: "WildfireMititgationPropertyLevel", value: ProtectionDetails["WildfireMitigationPropertyLevel"] },


  ];
  for (const d of dropdowns) {
    await safeSelectDropdownCore(page, d.shortCode, d.value);
  }
  await captureAndAttachforCore(page, testInfo, 'Entered Protection Details', {fullPage: true});
}
export async function fillUnderwritingDetails(page: Page, testInfo: TestInfo, ProtectionDetails: any, ruleMatrix: any, blockingContext: string, testCaseId: any): Promise<ValidationResult> {
  try {
  await wait(2000);
  await getUnderwritingTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(4000);
  // Use a generic helper for all Yes/No/radio questions
  const yesNoQuestions = [
    { shortCode: "EarthDomeHome", value: ProtectionDetails["EarthDomeHome"] || 'No' },
    { shortCode: "SupportedOnRaisedPoles", value: ProtectionDetails["SupportedOnRaisedPoles"] || 'No' },
    { shortCode: "DwellingCondemned", value: ProtectionDetails["DwellingCondemned"] || 'No' },
    { shortCode: "UnrepairedWaterDamage", value: ProtectionDetails["UnrepairedWaterDamage"] || 'No' },
    { shortCode: "UnrepairedWindowsOrDamage", value: ProtectionDetails["UnrepairedWindowsOrDamage"] || 'No' },
    { shortCode: "WorkingUtilities", value: ProtectionDetails["WorkingUtilities"] || 'No' },
    { shortCode: "LacksUtilities", value: ProtectionDetails["LacksUtilities"] || 'No' },
    { shortCode: "LandslideForestBrushFire", value: ProtectionDetails["LandslideForestBrushFire"] || 'No' },
    { shortCode: "IsolatedInaccessibleByRoad", value: ProtectionDetails["IsolatedInaccessibleByRoad"] || 'No' },
    { shortCode: "AttachedCommecialRisk", value: ProtectionDetails["AttachedCommecialRisk"] || 'No' },
    { shortCode: "BusinessPremises", value: ProtectionDetails["BusinessPremises"] || 'No' },
    { shortCode: "FarmingPremises", value: ProtectionDetails["FarmingPremises"] || 'No' },
    { shortCode: "AnimalsOwnCare", value: ProtectionDetails["AnimalsOwnCare"] || 'No' },
    { shortCode: "IslandSeacoast", value: ProtectionDetails["IslandSeacoast"] || 'No' },
    { shortCode: "RiverLake", value: ProtectionDetails["RiverLake"] || 'No' },
    { shortCode: "UnrepairedWaterDamage", value: ProtectionDetails["UnrepairedWaterDamage"] || 'No' },
    { shortCode: "UnrepairedWindowsOrDamage", value: ProtectionDetails["UnrepairedWindowsOrDamage"] || 'No' },
    { shortCode: "ClassAFireRatedRoof", value: ProtectionDetails["ClassAFireRatedRoof"] || 'No' },
    { shortCode: "DwellingConditionHazards", value: ProtectionDetails["DwellingConditionHazards"] },



  ];
  for (const q of yesNoQuestions) {
    if (q.shortCode === "RES_QSWorkingUtilities_1" || q.shortCode === "RES_QSFarmingPremises_1") {
      console.log(`[DEBUG] Attempting to answer ${q.shortCode} with value:`, q.value);
    }
    await selectYesNoRadioCore(page, q.shortCode, q.value);
  }
  // Swimming pool question is special (has a fence sub-question)
  // await selectSwimmingPoolOption(
  //   ProtectionDetails["SwimmingPoolPremises"] || 'No',
  //   ProtectionDetails["SwimmingPoolFence"] || 'No', 
  // );

 await selectSwimmingPoolOption(page, ProtectionDetails["SwimmingPoolPremises"] || 'No', ProtectionDetails["SwimmingPoolFence"] || 'No');
  await selectBusinessPremisesOption(page, ProtectionDetails);
  await selectFarmingConductOption(page, ProtectionDetails);
  await selectOwnCareAnimalsOption(page, ProtectionDetails);

  
  await wait(1000);
  const container = page.locator('#centerPanel');
  // await container.evaluate(el => el.scrollTop = 0);
  // await page.waitForTimeout(3000);
  // await captureAndAttachforCore(page, testInfo, "Entered Underwriting Details", { 
  //   fullPage: true
  // });
  // await page.waitForTimeout(3000);
  //  await container.evaluate(el => {
  //   el.scrollTop = el.scrollHeight - el.clientHeight;
  // });
  // await page.waitForTimeout(3000);
  // await captureAndAttachforCore(page, testInfo, "Entered Underwriting Details 2_2", { 
  //   fullPage: false 
  // });
  await captureFullPage2D(page, testInfo, 'Entered Underwriting Details',"#centerPanel");
  // await captureAndAttachforCore(page, testInfo, 'Entered Underwriting Details');
  await wait(2000);
  if (await isElementVisible(getLocationHazardsTab())) {
    await getLocationHazardsTab().click({ timeout: TIMEOUT_8_SECONDS });
  
  await wait(2000);
//   await container.evaluate(el => el.scrollTop = 0);
//   await page.waitForTimeout(3000);
//   await captureAndAttachforCore(page, testInfo, "Location Hazards tab Details 1 of 2", { 
//     fullPage: true 
//   });
//   await page.waitForTimeout(3000);
//   await container.evaluate(el => {
//     el.scrollTop = el.scrollHeight - el.clientHeight;
//   });
//   await captureAndAttachforCore(page, testInfo, "Location Hazards tab Details 2 of 2", { 
//     fullPage: false 
//   });

await captureFullPage2D(page, testInfo, 'Location Hazards Tab Details',"#centerPanel");
// await captureAndAttachforCore(page, testInfo, 'Location Hazards Tab Details');
  }
  await wait(2000);
  await getPerilScoresTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(5000);
  // await container.evaluate(el => el.scrollTop = 0);
  // await page.waitForTimeout(3000);
  // await captureAndAttachforCore(page, testInfo, "Peril Scores tab Details 1 of 2", { 
  //   fullPage: true 
  // });
  // await page.waitForTimeout(3000);
  // await container.evaluate(el => {
  //   el.scrollTop = el.scrollHeight - el.clientHeight;
  // });  
  // await captureAndAttachforCore(page, testInfo, "Peril Scores tab Details 2 of 2", { 
  //   fullPage: false 
  // });
  await captureFullPage2D(page, testInfo, 'Peril Scores Tab Details',"#centerPanel");
  // await captureAndAttachforCore(page, testInfo, 'Peril Scores Tab Details');
  await getAdditionalIntrestsTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(10000);
  // await captureAndAttachforCore(page, testInfo, 'Additional Intrests tab Details');
  await captureFullPage2D(page, testInfo, 'Additional Interests Tab Details',"#centerPanel");
  // await captureAndAttachforCore(page, testInfo, 'Additional Interests Tab Details');
  if (await isElementVisible(getRoofDetailsTab())) {
  await getRoofDetailsTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(5000);
  // await captureAndAttachforCore(page, testInfo, 'Roof Details');
  await captureFullPage2D(page, testInfo, 'Roof Details',"#centerPanel");
  // await captureAndAttachforCore(page, testInfo, 'Roof Details');
  }
  await getDwellingSaveAndNextButton().click();
await wait(TIMEOUT_8_SECONDS);
         console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );

    if (await isElementVisible(getDwellingSaveAndNextButton())) {
      await getDwellingSaveAndNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }

    console.log("Dwelling Details validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;

  }
}

export async function fillUnderwritingDetails_MH(page: Page, testInfo: TestInfo, ProtectionDetails: any, ruleMatrix: any, blockingContext: string, testCaseId: any): Promise<ValidationResult> {
  try {
  await wait(2000);
  await getUnderwritingTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(4000);
  // Use a generic helper for all Yes/No/radio questions
  const yesNoQuestions = [
    // { shortCode: "EarthDomeHome", value: ProtectionDetails["EarthDomeHome"] || 'No' },
    { shortCode: "SupportedOnRaisedPoles", value: ProtectionDetails["SupportedOnRaisedPoles"] || 'No' },
    { shortCode: "DwellingCondemned", value: ProtectionDetails["DwellingCondemned"] || 'No' },
    { shortCode: "UnrepairedWaterDamage", value: ProtectionDetails["UnrepairedWaterDamage"] || 'No' },
    { shortCode: "UnrepairedWindowsOrDamage", value: ProtectionDetails["UnrepairedWindowsOrDamage"] || 'No' },
    { shortCode: "WorkingUtilities", value: ProtectionDetails["WorkingUtilities"] || 'No' },
    { shortCode: "LacksUtilities", value: ProtectionDetails["LacksUtilities"] || 'No' },
    { shortCode: "LandslideForestBrushFire", value: ProtectionDetails["LandslideForestBrushFire"] || 'No' },
    { shortCode: "IsolatedInaccessibleByRoad", value: ProtectionDetails["IsolatedInaccessibleByRoad"] || 'No' },
    { shortCode: "AttachedCommecialRisk", value: ProtectionDetails["AttachedCommecialRisk"] || 'No' },
    { shortCode: "BusinessPremises", value: ProtectionDetails["BusinessPremises"] || 'No' },
    { shortCode: "FarmingPremises", value: ProtectionDetails["FarmingPremises"] || 'No' },
    { shortCode: "AnimalsOwnCare", value: ProtectionDetails["AnimalsOwnCare"] || 'No' },
    { shortCode: "IslandSeacoast", value: ProtectionDetails["IslandSeacoast"] || 'No' },
    { shortCode: "RiverLake", value: ProtectionDetails["RiverLake"] || 'No' },

  ];
  for (const q of yesNoQuestions) {
    if (q.shortCode === "RES_QSWorkingUtilities_1" || q.shortCode === "RES_QSFarmingPremises_1") {
      console.log(`[DEBUG] Attempting to answer ${q.shortCode} with value:`, q.value);
    }
    await selectYesNoRadioCore(page, q.shortCode, q.value);
  }
  // Swimming pool question is special (has a fence sub-question)
  // await selectSwimmingPoolOption(
  //   ProtectionDetails["SwimmingPoolPremises"] || 'No',
  //   ProtectionDetails["SwimmingPoolFence"] || 'No', 
  // );

  await selectSwimmingPoolOption(page, ProtectionDetails["SwimmingPoolPremises"] || 'No', ProtectionDetails["SwimmingPoolFence"] || 'No');
  await selectBusinessPremisesOption(page, ProtectionDetails);
  await selectFarmingConductOption(page, ProtectionDetails);
  await selectOwnCareAnimalsOption(page, ProtectionDetails);

  
  await wait(1000);
  const container = page.locator('#centerPanel');
  await container.evaluate(el => el.scrollTop = 0);
  await page.waitForTimeout(300);
  await captureAndAttachforCore(page, testInfo, "Entered Underwriting Details 1 of 2", {
    fullPage: false
  });
  await container.evaluate(el => {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  });
  await page.waitForTimeout(300);
  await captureAndAttachforCore(page, testInfo, "Entered Underwriting Details 2 of 2", {
    fullPage: false
  });
  // await captureAndAttachforCore(page, testInfo, 'Entered Underwriting Details');
  await wait(2000);
  if (await isElementVisible(getLocationHazardsTab())) {
    await getLocationHazardsTab().click({ timeout: TIMEOUT_8_SECONDS });
  
  await wait(2000);
  await container.evaluate(el => el.scrollTop = 0);
  await page.waitForTimeout(3000);
  await captureAndAttachforCore(page, testInfo, "Location Hazards tab Details 1 of 2", { 
    fullPage: true 
  });
  await page.waitForTimeout(3000);
  await container.evaluate(el => {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  });
  await captureAndAttachforCore(page, testInfo, "Location Hazards tab Details 2 of 2", { 
    fullPage: false 
  });
}
  await wait(2000);
  await getPerilScoresTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(2000);
  await container.evaluate(el => el.scrollTop = 0);
  await page.waitForTimeout(3000);
  await captureAndAttachforCore(page, testInfo, "Peril Scores tab Details 1 of 2", { 
    fullPage: true 
  });
  await page.waitForTimeout(3000);
  await container.evaluate(el => {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  });  
  await captureAndAttachforCore(page, testInfo, "Peril Scores tab Details 2 of 2", { 
    fullPage: false 
  });
  await getAdditionalIntrestsTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(10000);
  await captureAndAttachforCore(page, testInfo, 'Additional Intrests tab Details');
  if (await isElementVisible(getRoofDetailsTab())) {
  await getRoofDetailsTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(2000);
  await captureAndAttachforCore(page, testInfo, 'Roof Details');
  }
  await getDwellingSaveAndNextButton().click();
await wait(TIMEOUT_8_SECONDS);
         console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );

    if (await isElementVisible(getDwellingSaveAndNextButton())) {
      await getDwellingSaveAndNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }

    console.log("Dwelling Details validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;

  }
}

export async function fillUnderwritingDetails_DWS(page: Page, testInfo: TestInfo, ProtectionDetails: any, ruleMatrix: any, blockingContext: string, testCaseId: any): Promise<ValidationResult> {
  try {
  await wait(2000);
  await getUnderwritingTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(8000);
  // Use a generic helper for all Yes/No/radio questions
  const yesNoQuestions = [
    { shortCode: "ArsonFraudUW", value: ProtectionDetails["ArsonFraudUW"] },
    { shortCode: "EarthDomeHome", value: ProtectionDetails["EarthHomeDomeHomeOrNonConventionalDesign"] || ProtectionDetails["EarthDomeHome"] || 'No' },
    { shortCode: "SupportedOnRaisedPoles", value: ProtectionDetails["SupportedOnRaisedPoles"] || 'No' },
    { shortCode: "UnconventionalHome", value: ProtectionDetails["UnconventionalHome"] },
    { shortCode: "DwellingCondemned", value: ProtectionDetails["DwellingCondemned"] || 'No' },
    { shortCode: "UnrepairedWaterDamage", value: ProtectionDetails["UnrepairedWaterDamage"] || 'No' },
    { shortCode: "UnrepairedWindowsOrDamage", value: ProtectionDetails["UnrepairedWindowsOrDamage"] || 'No' },
    { shortCode: "ConstRenoBrokeWindowsUnrepDmg", value: ProtectionDetails["ConstRenoBrokeWindowsUnrepDmg"] },
    { shortCode: "WorkingUtilities", value: ProtectionDetails["WorkingUtilities"] || 'No' },
    { shortCode: "LacksUtilities", value: ProtectionDetails["LacksUtilities"] },
    { shortCode: "LandslideForestBrushFire", value: ProtectionDetails["LandslideForestBrushFire"] || 'No' },
    { shortCode: "DwellingConditionHazards", value: ProtectionDetails["DwellingConditionHazards"] },
    { shortCode: "VacantConditionHazards", value: ProtectionDetails["VacantConditionHazards"] },
    { shortCode: "UnconventionalConstruction", value: ProtectionDetails["UnconventionalConstruction"] },
    { shortCode: "RemoteLocation", value: ProtectionDetails["RemoteLocation"] },
    { shortCode: "IslandSeacoast", value: ProtectionDetails["IslandSeacoast"] || 'No' },
    { shortCode: "RiverLake", value: ProtectionDetails["RiverLake"] || 'No' },
    { shortCode: "IsolatedInaccessibleByRoad", value: ProtectionDetails["IsolatedInaccessibleByRoad"] || 'No' },
    { shortCode: "AttachedCommecialRisk", value: ProtectionDetails["AttachedToCommercialRisk"] || 'No' },
    { shortCode: "BusinessPremises", value: ProtectionDetails["BusinessPremises"] || 'No' },
    { shortCode: "FarmingPremises", value: ProtectionDetails["FarmingPremises"] || 'No' },
    { shortCode: "AnimalsOwnCare", value: ProtectionDetails["AnimalsOwnCare"] || 'No' },
    { shortCode: "DeniedClaimDueToArsonFraud", value: ProtectionDetails["DeniedClaimDueToArsonFraud"] },
  
  ];
  for (const q of yesNoQuestions) {
    if (q.shortCode === "RES_QSWorkingUtilities_1" || q.shortCode === "RES_QSFarmingPremises_1") {
      console.log(`[DEBUG] Attempting to answer ${q.shortCode} with value:`, q.value);
    }
    await selectYesNoRadioCore(page, q.shortCode, q.value);
  }
  // Swimming pool question is special (has a fence sub-question)
  // await selectSwimmingPoolOption(
  //   ProtectionDetails["SwimmingPoolPremises"] || 'No',
  //   ProtectionDetails["SwimmingPoolFence"] || 'No', 
  // );

  await selectSwimmingPoolOption(page, ProtectionDetails["SwimmingPoolPremises"] || 'No', ProtectionDetails["SwimmingPoolFence"] || 'No');
  await selectBusinessPremisesOption(page, ProtectionDetails);
  await selectFarmingConductOption(page, ProtectionDetails);
  await selectOwnCareAnimalsOption(page, ProtectionDetails);

  
  await wait(1000);
  const container = page.locator('#centerPanel');
  // await container.evaluate(el => el.scrollTop = 0);
  // await page.waitForTimeout(300);
  // await captureAndAttachforCore(page, testInfo, "Entered Underwriting Details 1 of 2", {
  //   fullPage: false
  // });
  // await page.waitForTimeout(3000);
  //  await container.evaluate(el => {
  //   el.scrollTop = el.scrollHeight - el.clientHeight;
  // });
  // await page.waitForTimeout(3000);
  // await captureAndAttachforCore(page, testInfo, "Entered Underwriting Details 2_2", { 
  //   fullPage: false 
  // });
  await captureFullPage2D(page,testInfo,"Entered Underwriting Details","#centerPanel");
  // await captureAndAttachforCore(page, testInfo, 'Entered Underwriting Details');
  await wait(2000);
  if (await isElementVisible(getLocationHazardsTab())) {
    await getLocationHazardsTab().click({ timeout: TIMEOUT_8_SECONDS });
  
  await wait(2000);
  // await container.evaluate(el => el.scrollTop = 0);
  // await page.waitForTimeout(3000);
  // await captureAndAttachforCore(page, testInfo, "Location Hazards tab Details 1 of 2", { 
  //   fullPage: true 
  // });
  // await page.waitForTimeout(3000);
  // await container.evaluate(el => {
  //   el.scrollTop = el.scrollHeight - el.clientHeight;
  // });
  // await captureAndAttachforCore(page, testInfo, "Location Hazards tab Details 2 of 2", { 
  //   fullPage: false 
  // });
  await captureFullPage2D(page,testInfo,"Location Hazards Tab Details","#centerPanel");
}
  await wait(2000);
  await getPerilScoresTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(2000);
  if(await isElementVisible(getDwellingFireField()) && ProtectionDetails["Fire"]){
  await getDwellingFireField().fill(ProtectionDetails["Fire"].toString());
  }
  if(await isElementVisible(getDwellingTheftField()) && ProtectionDetails["Theft"]){
  await getDwellingTheftField().fill(ProtectionDetails["Theft"].toString());
  }
  if(await isElementVisible(getDwellingLiabilityField()) && ProtectionDetails["Liability"]){
  await getDwellingLiabilityField().fill(ProtectionDetails["Liability"].toString());
  }
  if(await isElementVisible(getDwellingWindHailField()) && ProtectionDetails["Wind/Hail"]){
  await getDwellingWindHailField().fill(ProtectionDetails["Wind/Hail"].toString());
  }
  if(await isElementVisible(getDwellingWaterField()) && ProtectionDetails["Water"]){
  await getDwellingWaterField().fill(ProtectionDetails["Water"].toString());
  }
  if(await isElementVisible(getDwellingOtherField()) && ProtectionDetails["Other"]){
  await getDwellingOtherField().fill(ProtectionDetails["Other"].toString());
  }
  // await container.evaluate(el => el.scrollTop = 0);
  // await page.waitForTimeout(3000);
  // await captureAndAttachforCore(page, testInfo, "Peril Scores tab Details 1 of 2", { 
  //   fullPage: true 
  // });
  // await page.waitForTimeout(3000);
  // await container.evaluate(el => {
  //   el.scrollTop = el.scrollHeight - el.clientHeight;
  // });  
  // await captureAndAttachforCore(page, testInfo, "Peril Scores tab Details 2 of 2", { 
  //   fullPage: false 
  // });
  await captureFullPage2D(page,testInfo,"Peril Scores Tab Details","#centerPanel");
  await getAdditionalIntrestsTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(10000);
  await captureFullPage2D(page, testInfo, 'Additional Interests Tab Details',"#centerPanel");
  if (await isElementVisible(getRoofDetailsTab())) {
  await getRoofDetailsTab().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(2000);
  await captureFullPage2D(page, testInfo, 'Roof Details',"#centerPanel");
  }
  await getDwellingSaveAndNextButton().click();
  await wait(TIMEOUT_8_SECONDS);
         console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );

    if (await isElementVisible(getDwellingSaveAndNextButton())) {
      await getDwellingSaveAndNextButton().click({ timeout: 10000 });
      await wait(TIMEOUT_4_SECONDS);
    }

    console.log("Dwelling Details validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;

  }
}
