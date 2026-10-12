import { expect, Locator, TestInfo, type Page } from "@playwright/test";
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
  excelDateToJSDate,
} from "../../utils/action-utils";
import { captureAndAttachforCore, captureFullPage2D } from "../../utils/report-utils";
import { getFullStateName, formatToMMDDYYYY, getFoundationType_MSB, getNumberofStoriesMSB, getRoofCoveringMSB, getRoofStyleMSB, getConstructionType_MSB, getPrimaryHeating_MSB } from "../../testdata/testData";
import { AMSuite_GPAURL } from "../../utils/url-constansts";
import { getPage } from "../../utils/page-utils";
import {
  BIG_TIMEOUT,
  MAX_TIMEOUT,
  SMALL_TIMEOUT,
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { getText, isElementVisible } from "../../utils/element-utils";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../utils/wordingValidation";
import { validateRulesForTestCase, ValidationResult } from "../../utils/coreRuleBasedValidation";
import { waitForPageReady } from "./RiskAnalysis_CorePage";
import { createAutoQuestionFetcher } from "../../utils/questionTextMapper";
import { getCalculateButton, getConstructionTypeDropDownMSB, getEditButtoninMSB, getFinishedLivingArea_MSB, getFoundationTypeMSB, getMoreButton, getMoreforConstructionType, getMoreforPrimaryHeating, getMSBYearBuilt, getNumberOfStoriesMSB, getPrimaryHeating_MSB_DropDown, getRoofCoveringDropDownButton, getRoofStyleDropDownMSB, getSaveButton } from "../GPA/Residential/ValuationPage";

const getValuationTypeDropDown = () => getLocator("//td[contains(@id, 'ValuationType_Ext')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getMakeDropDown = () => getLocator("//td[contains(@id, 'make-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getMakeInput = () => getLocator('//*[contains(@id,"make-inputEl")]').filter({ visible: true }).first();
const getInputYearBuilt = () => getLocator("//*[contains(@id, 'YearBuilt-inputEl')]").filter({ visible: true }).first();
const getLength = () => getLocator("//input[contains(@id, 'length-inputEl')]");
const getWidth = () => getLocator("//input[contains(@id, 'width-inputEl')]");
const getStyleMultiwide = () => getLocator("//label[contains(@id, 'style_option1-boxLabelEl')]");
const getStyleSingleWide = () => getLocator("//label[contains(@id, 'style_option2-boxLabelEl')]");
const getStyleInput = () => getLocator('//*[contains(@id,"style-inputEl")]').filter({ visible: true }).first();
const getModel = () => getLocator("//*[contains(@id, 'model-inputEl')]");
const getSerialNumber = () => getLocator("//*[contains(@id, 'serialnumber-inputEl')]").filter({ visible: true }).first();
const getDwellingNumber = () => getLocator("//label[contains(@id, 'DwellingNumber_Ext-labelEl')]");
const getModelYear = () => getLocator("//*[contains(@id, 'ModelYear-inputEl')]").filter({ visible: true }).first();
const getYesAttachedStructures = () => getLocator("//label[contains(@id, 'attachedstructures_true-boxLabelEl')]");
const getNoAttachedStructures = () => getLocator("//input[contains(@id, 'attachedstructures_false-inputEl')]");
const getInputConstructionType = () => getLocator("//td[contains(@id, 'ConstructionType-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getConstructionTypeInput = () => getLocator('//*[contains(@id,"ConstructionType-inputEl")]').filter({ visible: true }).first();
const getNumberofStories = () => getLocator("//td[contains(@id, 'NumStories-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getNumberOfStoriesInput = () => getLocator('//*[contains(@id,"NumStories-inputEl")]').filter({ visible: true }).first();
const getFinishedLivingArea = () => getLocator("//*[contains(@id, 'ApproxSqFoot-inputEl')]").filter({ visible: true }).first();
const getEstimatedValue = () => getLocator("//*[contains(@id, 'EstimatedValuation_Ext-inputEl')]").filter({ visible: true }).first();
const getFoundationType = () => getLocator("//td[contains(@id, 'FoundationType-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getFoundationTypeInput = () => getLocator("//*[contains(@id, 'FoundationType-inputEl')]").filter({ visible: true }).first();
const getRoofType = () => getLocator("//td[contains(@id, 'RoofType-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getRoofCoveringInput = () =>getLocator("//*[contains(@id, 'RoofType-inputEl')]").filter({ visible: true }).first();
const getRoofStyle = () => getLocator("//td[contains(@id, 'RoofSlopeStyle_Ext-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getRoofStyleInput = () => getLocator("//*[contains(@id,'RoofSlopeStyle_Ext-inputEl')]").filter({ visible: true }).first();
const getPurchaseDate = () => getLocator("//*[contains(@id, 'PurchaseDate_Ext-inputEl')]").filter({ visible: true }).first();
const getPurchasePrice = () => getLocator("//*[contains(@id, 'PurchasePrice_Ext-inputEl')]").filter({ visible: true }).first();
const getInputYearRoofReplaced = () => getLocator("//input[contains(@id, 'YearRoofReplaced-inputEl')]");
const getYearRoofReplacedInput = () => getLocator("//*[contains(@id, 'YearRoofReplaced-inputEl')]").filter({ visible: true }).first();
const getYesPrimaryHeating = () => getLocator("//label[contains(text(), 'Is Primary Heating Thermostatically Controlled?')]/parent::td/following-sibling::td//div//input[contains(@id, 'isprimaryheating_true-inputEl')]");
const getPrimaryHeatingControlledInput = () => getLocator("//input[contains(@id, 'isprimaryheating')]/following-sibling::label");
const getNoPrimaryHeating = () => getLocator("//label[contains(text(), 'Is Primary Heating Thermostatically Controlled?')]/parent::td/following-sibling::td//div//input[contains(@id, 'isprimaryheating_false-inputEl')]");
const getYesPrimaryHeatingChecked = () => getLocator("//input[contains(@id, 'isprimaryheating_true-inputEl')]/parent::div/parent::td/parent::tr/parent::tbody/parent::table");
const getNoPrimaryHeatingChecked = () => getLocator("//input[contains(@id, 'isprimaryheating_false-inputEl')]/parent::div/parent::td/parent::tr/parent::tbody/parent::table");
const getPrimaryHeatingDropDown = () => getLocator("//td[contains(@id, 'PrimaryHeating-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPrimaryHeatingInput = () => getLocator("//*[contains(@id, 'PrimaryHeating-inputEl')]").filter({ visible: true }).first();
const getFuelStorageTankLocationDropDown= () => getLocator("//td[contains(@id, 'FuelStorageTankLocation-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getElectricalSystemDropDown = () => getLocator("//td[contains(@id, 'ElectricalSystem-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getElectricalSystemInput = () => getLocator("//*[contains(@id, 'ElectricalSystem-inputEl')]").filter({ visible: true }).first();
const getYesKnobWiring = () => getLocator("//input[contains(@id, 'knobtubewiring_true-inputEl')]");
const getKnobTubePresentInput = () => getLocator("//input[contains(@id, 'knobtubewiring')]/following-sibling::label");
const getNoKnobWiring = () => getLocator("//input[contains(@id, 'knobtubewiring_false-inputEl')]");
const getYesUnitModular = () => getLocator("//input[contains(@id, 'ExtDV:modularhome_true-inputEl')]");
const getNoUnitTied = () => getLocator('//input[contains(@id, "DwellingConstruction_ExtDV:tieddown_false-inputEl")]');
const getSaveAndNextButton = () => getLocator('//span[contains(@id, "HODwellingConstructionHOEScreen") and contains(text(), "Dwelling Construction")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getGoToMSBbutton = () => getLocator("//a[contains(@id, 'ExtDV:gotomsb') and contains(text(), 'Go to MSB')]");
const getFieldHeatingSystems = (questionText: any) =>
  getLocator(
    `//td//div[contains(text(), '${questionText}')]/parent::td/parent::tr//td[contains(@class, 'edit')]`
  );
const getInputlocatorforSystemsQuestions = (questionText: any) =>
  getLocator(`//td//div[contains(text(), '${questionText}')]/ancestor::div//div[contains(@class, 'editor')]//td//input`)
const getFinishButton = `[value="Finish"]`;
const getSaveButton_MSB = `[id="SaveValuationButton"]`;
const getRetriveFromMSB_Button = () => getLocator("//a[contains(@id, 'ExtDV:retrievefrommsb') and contains(text(), 'Retrieve from MSB')]");

async function fillHeatingSystems(questionElement: any, value: any){
  if(value && await isElementVisible(getFieldHeatingSystems(questionElement))) {
    await getFieldHeatingSystems(questionElement).click();
    // await getFieldHeatingSystems(questionElement).click();
    await fill(getInputlocatorforSystemsQuestions(questionElement), value.toString());
  }
}
 
// Action functions for each field
async function enterYearBuilt(value: any) {
  await clear(getInputYearBuilt());
  await getInputYearBuilt().click();
  await fill(getInputYearBuilt(), value.toString());
}
 
async function enterModel(value: any) {
  await clear(getModel());
  await getModel().click();
  await fill(getModel(), value.toString());
}
async function enterModelYear(value: any) {
  await clear(getModelYear());
  await getModelYear().click();
  await fill(getModelYear(), value.toString());
}
 
async function enterSerialNumber(value: any) {
  await clear(getSerialNumber());
  await getSerialNumber().click();
  await fill(getSerialNumber(), value.toString());
}
async function selectUnitModular(value: any) {
  if (value === "Yes") {
    await click(getYesUnitModular());
  }
}
async function selectUnitTiedDown(value: any) {
  if (value === "No") {
    await click(getNoUnitTied());
  }
}
async function selectValuationType(valuationTypeValue: any) {
  await wait(1000);
  await getValuationTypeDropDown().click({ force: true });
  await wait(1000);
  const trimmedValue = (valuationTypeValue || '').trim();
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${trimmedValue}']`);
  await click(optionLocator);
  await wait(3000);
}
async function selectAttachedStructres(value: any) {
  if (await isElementVisible(getYesAttachedStructures())) {
    const normalizedValue = String(value ?? "").trim().toLowerCase();
    const maxAttempts = 3;
    let selected = false;
 
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (normalizedValue === "yes") {
        // Click Yes label
        await getYesAttachedStructures().click({ force: true });
      } else {
        // Click No input
        await getNoAttachedStructures().click({ force: true });
      }
 
      await wait(1500);
 
      // Verify selection by checking the input element's checked state
      try {
        const isNoChecked = await getNoAttachedStructures().isChecked({ timeout: 2000 });
       
        if (normalizedValue === "yes") {
          // For Yes, No should NOT be checked
          selected = !isNoChecked;
        } else {
          // For No, No should be checked
          selected = isNoChecked;
        }
      } catch (checkError) {
        console.log(`⚠️ Could not verify Attached Structures state on attempt ${attempt}`);
        selected = false;
      }
 
      if (selected) {
        console.log(`✅ Attached Structures '${normalizedValue}' selected on attempt ${attempt}`);
        break;
      }
 
      console.log(`⚠️ Attached Structures '${normalizedValue}' not selected on attempt ${attempt}, retrying...`);
      await wait(1000);
    }
 
    if (!selected) {
      console.log(`❌ Failed to select Attached Structures '${normalizedValue}' after ${maxAttempts} attempts`);
    }
  }
}
async function selectStyle(value: any) {
  if (await isElementVisible(getStyleSingleWide())) {
    const normalizedValue = String(value ?? "").trim().toLowerCase();
    const maxAttempts = 3;
    let selected = false;
 
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (normalizedValue === "multi-wide" || normalizedValue === "multiwide") {
        // Click Multiwide label
        await getStyleMultiwide().click({ force: true });
      } else {
        // Click SingleWide label
        await getStyleSingleWide().click({ force: true });
      }
 
      await wait(1500);
 
      // Verify selection by checking the input element's checked state
      try {
        const isSingleWideChecked = await getStyleSingleWide().isChecked({ timeout: 2000 });
       
        if (normalizedValue === "multi-wide" || normalizedValue === "multiwide") {
          // For Multi-wide, SingleWide should NOT be checked
          selected = !isSingleWideChecked;
        } else {
          // For Single-wide, SingleWide should be checked
          selected = isSingleWideChecked;
        }
      } catch (checkError) {
        console.log(`⚠️ Could not verify Style state on attempt ${attempt}`);
        selected = false;
      }
 
      if (selected) {
        console.log(`✅ Style '${normalizedValue}' selected on attempt ${attempt}`);
        break;
      }
 
      console.log(`⚠️ Style '${normalizedValue}' not selected on attempt ${attempt}, retrying...`);
      await wait(1000);
    }
 
    if (!selected) {
      console.log(`❌ Failed to select Style '${normalizedValue}' after ${maxAttempts} attempts`);
    }
  }
}
async function selectMake(value: any) {
  await wait(1000);
  await getMakeDropDown().click({ force: true });
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  if(!(await isElementVisible(optionLocator))){
    await getMakeDropDown().click({ force: true });
  }
  await wait(2000);
  await click(optionLocator);
  await wait(3000);
}
async function selectConstructionType(value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getInputConstructionType().click({ force: true }).catch(() => { });
 
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
 
 
async function selectNumberOfStories(value: any) {
  await click(getNumberofStories());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
 
async function enterLength(value: any) {
  await clear(getLength());
  await getLength().click();
  await fill(getLength(), value.toString());
}
 
async function enterWidth(value: any) {
  await clear(getWidth());
  await getWidth().click();
  await fill(getWidth(), value.toString());
}
 
async function enterFinishedLivingArea(value: any) {
  await clear(getFinishedLivingArea());
  await fill(getFinishedLivingArea(), value.toString());
}
 
async function enterEstimatedValue(value: any) {
  await clear(getEstimatedValue());
  await click(getEstimatedValue());
  await fill(getEstimatedValue(), value.toString());
}
 
async function selectFoundationType(value: any) {
  await click(getFoundationType());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
 
async function selectRoofType(value: any) {
  await click(getRoofType());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
 
async function selectRoofStyle(value: any) {
  await click(getRoofStyle());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
 
async function enterPurchaseDate(value: any) {
  await clear(getPurchaseDate());
  const formatePurchaseDate = formatToMMDDYYYY(value);
    await fill(getPurchaseDate(), formatePurchaseDate);
}
 
async function enterPurchasePrice(value: any) {
  await clear(getPurchasePrice());
  await fill(getPurchasePrice(), value.toString());
}
 
async function enterYearRoofReplaced(value: any) {
  await wait(1000);
  console.log("Year Roof Replaced Value: ", value);
  await getInputYearRoofReplaced().click();
  await wait(1000);
  await fill(getInputYearRoofReplaced(), value);
}
 
async function selectPrimaryHeatingOption(value: any) {
 
 
  if (value === "Yes") {
    const yesOption = getYesPrimaryHeating().first();
 
    for (let attempt = 0; attempt < 3; attempt++) {
      await yesOption.click({ force: true });
      await wait(TIMEOUT_8_SECONDS);
 
      // Get the parent <td> element
      const parentTd = getYesPrimaryHeatingChecked();
      const className = await parentTd.getAttribute('class');
 
      console.log(`Attempt ${attempt + 1}: class = ${className}`);
 
      if (className?.includes('x-form-cb-checked')) {
        console.log("✅ Primary Heating 'Yes' option is selected via class check.");
        break;
      }
 
      if (attempt === 2) {
        console.log("❌ Primay Heating Yes Radio button still not selected after 3 attempts.");
      }
 
      await wait(2000);
    }
 
 
  } else {
    const NoOption = getNoPrimaryHeating().first();
 
    for (let attempt = 0; attempt < 3; attempt++) {
      await NoOption.click({ force: true });
      await wait(TIMEOUT_8_SECONDS);
 
      // Get the parent <td> element
      const parentTd = getNoPrimaryHeatingChecked();
      const className = await parentTd.getAttribute('class');
 
      console.log(`Attempt ${attempt + 1}: class = ${className}`);
 
      if (className?.includes('x-form-cb-checked')) {
        console.log("✅ Primary Heating 'No' option is selected via class check.");
        break;
      }
 
      if (attempt === 2) {
        console.log("❌ Primary Heating  Radio button still not selected after 3 attempts.");
      }
 
      await wait(2000);
    }
 
  }
}
 
async function selectPrimaryHeating(value: any) {
  await click(getPrimaryHeatingDropDown());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
async function selectFuelStorageTank(value: any) {
  console.log("Inside selectFuelStorageTank");
 
  await click(getFuelStorageTankLocationDropDown());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
 
async function selectElectricalSystem(value: any) {
  await click(getElectricalSystemDropDown());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  await click(optionLocator);
}
 
async function selectKnobWiringOption(value: any) {
  if (value === "Yes") {
    await click(getYesKnobWiring());
  } else {
    await click(getNoKnobWiring());
  }
}
// Collapses all whitespace and trims
const normalize = (s: string | null | undefined): string =>
  (s ?? "").replace(/\s+/g, " ").trim();

const compare = (uiValue: string, expected: any, fieldName: string) => {
  const ui = normalize(uiValue);
  const exp = normalize(expected?.toString());
  if (ui !== exp) {
    return (`${fieldName}: MSB="${ui}", Expected="${exp}"`);
  }
};

export async function getFieldValue(locator: Locator): Promise<string> {
  return await locator.evaluate((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      return (el.value ?? "").trim();
    }

    return (el.textContent ?? "").trim();
  });
}
async function assertUIVsExcelDataCore(dataFromExcel: Map<string, string>, page: Page,testInfo: TestInfo): Promise<{shouldStop: boolean;mismatchData: string;}> {
  let excelUIMismatchList: string[] = [];

  //Get All Field Values and Compare Parallely .
  if (dataFromExcel.has("YearBuilt"))
    excelUIMismatchList.push(compare(await getFieldValue(getInputYearBuilt()), dataFromExcel.get("YearBuilt"), "YearBuilt") ?? "");

  if (dataFromExcel.has("ConstructionType"))
    excelUIMismatchList.push(compare(await getFieldValue(getConstructionTypeInput()), dataFromExcel.get("ConstructionType"), "ConstructionType") ?? "");

  if (dataFromExcel.has("NumberOfStories"))
    excelUIMismatchList.push(compare(await getFieldValue(getNumberOfStoriesInput()), dataFromExcel.get("NumberOfStories"), "NumberOfStories") ?? "");

  if (dataFromExcel.has("Finished_Living_Area"))
    excelUIMismatchList.push(compare(await getFieldValue(getFinishedLivingArea()), dataFromExcel.get("Finished_Living_Area"), "Finished_Living_Area") ?? "");

  if (dataFromExcel.has("Estimated_Valuation"))
    excelUIMismatchList.push(compare((Number(await getFieldValue(getEstimatedValue())).toString()), dataFromExcel.get("Estimated_Valuation"), "Estimated_Valuation") ?? "");

  if (dataFromExcel.has("PurchaseDate"))
    excelUIMismatchList.push(compare(await getFieldValue(getPurchaseDate()), dataFromExcel.get("PurchaseDate"), "PurchaseDate") ?? "");

  if (dataFromExcel.has("PurchasePrice"))
    excelUIMismatchList.push(compare((Number(await getFieldValue(getPurchasePrice())).toString()), dataFromExcel.get("PurchasePrice"), "PurchasePrice") ?? "");

  if (dataFromExcel.has("Foundation_Type"))
    excelUIMismatchList.push(compare(await getFieldValue(getFoundationTypeInput()), dataFromExcel.get("Foundation_Type"), "Foundation_Type") ?? "");

  if (dataFromExcel.has("Roof Covering"))
    excelUIMismatchList.push(compare(await getFieldValue(getRoofCoveringInput()), dataFromExcel.get("Roof Covering"), "Roof Covering") ?? "");

  if (dataFromExcel.has("Roof_Slope/Style"))
    excelUIMismatchList.push(compare(await getFieldValue(getRoofStyleInput()), dataFromExcel.get("Roof_Slope/Style"), "Roof_Slope/Style") ?? "");

  if (dataFromExcel.has("Year_Roof_Replaced ") || dataFromExcel.has("Year_Roof_Replaced"))
    excelUIMismatchList.push(compare(await getFieldValue(getYearRoofReplacedInput()), dataFromExcel.get("Year_Roof_Replaced ") || dataFromExcel.get("Year_Roof_Replaced"), "Year_Roof_Replaced") ?? "");

  if (dataFromExcel.has("Primary_Heating"))
    excelUIMismatchList.push(compare(await getFieldValue(getPrimaryHeatingInput()), dataFromExcel.get("Primary_Heating"), "Primary_Heating") ?? "");

  if (dataFromExcel.has("Electrical_System"))
    excelUIMismatchList.push(compare(await getFieldValue(getElectricalSystemInput()), dataFromExcel.get("Electrical_System"), "Electrical_System") ?? "");

  if (dataFromExcel.has("ModelYear"))
    excelUIMismatchList.push(compare(await getFieldValue(getModelYear()), dataFromExcel.get("ModelYear"), "ModelYear") ?? "");

  if (dataFromExcel.has("Length") && await isElementVisible(getLength()))
    excelUIMismatchList.push(compare(await getFieldValue(getLength()), dataFromExcel.get("Length"), "Length") ?? "");

  if (dataFromExcel.has("Width") && await isElementVisible(getWidth()))
    excelUIMismatchList.push(compare(await getFieldValue(getWidth()), dataFromExcel.get("Width"), "Width") ?? "");

  if (dataFromExcel.has("Style"))
    excelUIMismatchList.push(compare(await getFieldValue(getStyleInput()), dataFromExcel.get("Style"), "Style") ?? "");

  if (dataFromExcel.has("Make"))
    excelUIMismatchList.push(compare(await getFieldValue(getMakeInput()), dataFromExcel.get("Make"), "Make") ?? "");

  if (dataFromExcel.has("Model"))
    excelUIMismatchList.push(compare(await getFieldValue(getModel()), dataFromExcel.get("Model"), "Model") ?? "");

  if (dataFromExcel.has("Serial_Number"))
    excelUIMismatchList.push(compare(await getSerialNumber().inputValue(), dataFromExcel.get("Serial_Number"), "Serial_Number") ?? "");
  // excelUIMismatchList.push(compare(await getPrimaryHeatingControlledInput().textContent() ?? "", dataFromExcel.get("Primary_Heating_Controlled"), "Primary_Heating_Controlled") ?? ""); // this is yes no
  // excelUIMismatchList.push(compare(await getKnobTubePresentInput().textContent() ?? "", dataFromExcel.get("Knob_Tube_Present"), "Knob_Tube_Present") ?? ""); // this is yes no
  // excelUIMismatchList.push(compare(await getUnitModularHomeInput().textContent() ?? "", dataFromExcel.get("Unit_Modular_Home"), "Unit_Modular_Home") ?? ""); // this is yes no
  // excelUIMismatchList.push(compare(await getAttachedStructureInput().textContent() ?? "", dataFromExcel.get("AttachedStructure"), "AttachedStructure") ?? ""); // this is yes no
  // excelUIMismatchList.push(compare(await getUnitTiedDownInput().textContent() ?? "", dataFromExcel.get("Unit_Tied_Down"), "Unit_Tied_Down") ?? ""); // this is yes no

  const mismatches = excelUIMismatchList.filter(Boolean);
  if (mismatches.length > 0) {
    console.log("❌ Excel/UI Mismatches Found: ", mismatches);
    mismatches.forEach(m => console.log(m));
    await captureFullPage2D(page,testInfo,"ExcelvsUI Data Mismatches Found",'#centerPanel');
    return {shouldStop:true,mismatchData:excelUIMismatchList.join(' ')};
  }
  console.log("✅ UI values match Excel values");
  return {shouldStop:false,mismatchData:excelUIMismatchList.join(' ')};
}
// Main function to fill all dwelling construction fields
export async function fillDwellingConstructionCorePage(page: Page, testInfo: TestInfo, dwellingConstructionData: any, ruleMatrix: any, blockingContext: string, testCaseId: any, ): Promise<ValidationResult> {
   try {
    const getQuestion = createAutoQuestionFetcher(page);

  let dataFromExcel = new Map<string, string>();
  await wait(TIMEOUT_4_SECONDS);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(1000);
  if (dwellingConstructionData["YearBuilt"] && await isElementVisible(getInputYearBuilt())) {
    dataFromExcel.set("YearBuilt", dwellingConstructionData["YearBuilt"]);
    await enterYearBuilt(dwellingConstructionData["YearBuilt"]);
  }
 
  if (dwellingConstructionData["ConstructionType"] && await isElementVisible(getInputConstructionType())) {
    dataFromExcel.set("ConstructionType", dwellingConstructionData["ConstructionType"]);
    await selectConstructionType(dwellingConstructionData["ConstructionType"]);
  }
 
  if (dwellingConstructionData["NumberOfStories"] && await isElementVisible(getNumberofStories())) {
    dataFromExcel.set("NumberOfStories", dwellingConstructionData["NumberOfStories"]);
    await selectNumberOfStories(dwellingConstructionData["NumberOfStories"]);
  }
 
  if (dwellingConstructionData["Finished_Living_Area"] && await isElementVisible(getFinishedLivingArea())) {
    dataFromExcel.set("Finished_Living_Area", dwellingConstructionData["Finished_Living_Area"]);
    await enterFinishedLivingArea(dwellingConstructionData["Finished_Living_Area"]);
  }
  console.log("Estimated Valuation value:", dwellingConstructionData["Estimated_Valuation"]);
  if (dwellingConstructionData["Estimated_Valuation"] && await isElementVisible(getEstimatedValue())) {
    dataFromExcel.set("Estimated_Valuation", dwellingConstructionData["Estimated_Valuation"].toString());
    await enterEstimatedValue(dwellingConstructionData["Estimated_Valuation"].toString());
  }
 
  if (dwellingConstructionData["PurchaseDate"] && await isElementVisible(getPurchaseDate())) {
    dataFromExcel.set("PurchaseDate", formatToMMDDYYYY(dwellingConstructionData["PurchaseDate"]));
    await enterPurchaseDate(dwellingConstructionData["PurchaseDate"]);
  }
 
  if (dwellingConstructionData["PurchasePrice"] && await isElementVisible(getPurchasePrice())) {
    dataFromExcel.set("PurchasePrice", dwellingConstructionData["PurchasePrice"].toString());
    await enterPurchasePrice(dwellingConstructionData["PurchasePrice"]);
  }
  if (dwellingConstructionData["Foundation_Type"] && await isElementVisible(getFoundationType())) {
    dataFromExcel.set("Foundation_Type", dwellingConstructionData["Foundation_Type"]);
    await selectFoundationType(dwellingConstructionData["Foundation_Type"]);
  }
 
  if (dwellingConstructionData["Roof Covering"] || dwellingConstructionData["RoofCovering"] && await isElementVisible(getRoofType())) {
    dataFromExcel.set("Roof Covering", dwellingConstructionData["Roof Covering"] || dwellingConstructionData["RoofCovering"]);
    await selectRoofType(dwellingConstructionData["Roof Covering"] || dwellingConstructionData["RoofCovering"]);
  }
 
  if (dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"] && await isElementVisible(getRoofStyle())) {
    dataFromExcel.set("Roof_Slope/Style", dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"]);
    await selectRoofStyle(dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"]);
  }
 
  if (dwellingConstructionData["Year_Roof_Replaced "] && await isElementVisible(getInputYearRoofReplaced())) {
    dataFromExcel.set("Year_Roof_Replaced ", dwellingConstructionData["Year_Roof_Replaced "].toString());
    await enterYearRoofReplaced(dwellingConstructionData["Year_Roof_Replaced "].toString());
 
  }
 
  if (dwellingConstructionData["Primary_Heating_Controlled"] && await isElementVisible(getYesPrimaryHeating())) {
    dataFromExcel.set("Primary_Heating_Controlled", dwellingConstructionData["Primary_Heating_Controlled"]);
    await selectPrimaryHeatingOption(dwellingConstructionData["Primary_Heating_Controlled"]);
  }
 
  if (dwellingConstructionData["Primary_Heating"] && await isElementVisible(getPrimaryHeatingDropDown())) {
    dataFromExcel.set("Primary_Heating", dwellingConstructionData["Primary_Heating"]);
    await selectPrimaryHeating(dwellingConstructionData["Primary_Heating"]);
  }
  if (dwellingConstructionData["Fuel_Storage_Tank_Location"] && await isElementVisible(getFuelStorageTankLocationDropDown())) {
    await selectFuelStorageTank(dwellingConstructionData["Fuel_Storage_Tank_Location"]);
  }
 
  if (dwellingConstructionData["Electrical_System"] && await isElementVisible(getElectricalSystemDropDown())) {
    dataFromExcel.set("Electrical_System", dwellingConstructionData["Electrical_System"]);
    await selectElectricalSystem(dwellingConstructionData["Electrical_System"]);
  }
 
  if (dwellingConstructionData["Knob_Tube_Present"] && await isElementVisible(getYesKnobWiring())) {
    dataFromExcel.set("Knob_Tube_Present", dwellingConstructionData["Knob_Tube_Present"]);
    await selectKnobWiringOption(dwellingConstructionData["Knob_Tube_Present"]);
  }

  const questionTextHeatingSystem = await getQuestion('HeatingSystemUpdateYear');
  console.log('heating systems update year:', questionTextHeatingSystem);
  if(dwellingConstructionData["HeatingSystemUpdateYear"] && await isElementVisible(getFieldHeatingSystems(questionTextHeatingSystem))){
    await fillHeatingSystems(questionTextHeatingSystem, dwellingConstructionData["HeatingSystemUpdateYear"]);
  }

  const questionTextPlumbingSystem = await getQuestion('PlumbingSystemUpdateYear');
  console.log('Plumbing system update year:', questionTextPlumbingSystem)
  if(dwellingConstructionData["PlumbingSystemUpdateYear"] && await isElementVisible(getFieldHeatingSystems(questionTextPlumbingSystem))){
    await fillHeatingSystems(questionTextHeatingSystem, dwellingConstructionData["PlumbingSystemUpdateYear"]);
  }

  const questionTextElectricalSystem = await getQuestion('ElectricalSystemUpdateYear');
  console.log('electrica; system update year:', questionTextElectricalSystem);
  if(dwellingConstructionData["ElectricalSystemUpdateYear"] && await isElementVisible(getFieldHeatingSystems(questionTextElectricalSystem))){
    await fillHeatingSystems(questionTextHeatingSystem, dwellingConstructionData["ElectricalSystemUpdateYear"]);
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(1000);
  const {shouldStop,mismatchData} = await assertUIVsExcelDataCore(dataFromExcel, page,testInfo);
  if (shouldStop) {
    console.log("❌ Data mismatch found between UI and Excel. Stopping test.");
    return { success: false, message: `Dwelling Construction Details doesn't match-> ${mismatchData}`, shouldStop: shouldStop, errorType:"Data mismatch found between UI and Excel." , status: "FAIL" };
  }
     await captureFullPage2D(page, testInfo, "Fill Dwelling Construction Page", "#centerPanel");
     await getSaveAndNextButton().click();

     // await wait(TIMEOUT_8_SECONDS);
     // await warningsWordingValidationCore(ruleMatrix, page, testInfo);
     // blockingContext = "Qualification";
     // const errorValidationPassed = await errorWordingValidationCore(ruleMatrix, page, testInfo, blockingContext);
     // if (!errorValidationPassed) {
     //   console.log("❌ Error wording validation failed. Stopping test.");

     // }

     console.log("🔍 Performing rule-based validation for Policy Details...");
     const validationResult = await validateRulesForTestCase(
       testCaseId,
       blockingContext,
       ruleMatrix,
       page,
       testInfo
     );
     await waitForPageReady(page);
     if (await isElementVisible(getSaveAndNextButton())) {
       await getSaveAndNextButton().click();
     }
     await waitForPageReady(page);
     return validationResult;

}
catch (error) {
    console.error("Operation failed:", error);
    throw error;
 
  }
}
 
export async function fillDwellingConstruction_DWSPage(page: Page, testInfo: TestInfo, dwellingConstructionData: any, ruleMatrix: any, blockingContext: string, testCaseId: any):  Promise<ValidationResult>{
  try {
    const getQuestion = createAutoQuestionFetcher(page);
  await wait(TIMEOUT_4_SECONDS);
  let dataFromExcel = new Map<string, string>();
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(1000);
  if (dwellingConstructionData["Valuation_Type"] && await isElementVisible(getValuationTypeDropDown())) {
    console.log("Valuation_Type:", dwellingConstructionData["Valuation_Type"])
    await selectValuationType(dwellingConstructionData["Valuation_Type"]);
  }
  if (dwellingConstructionData["YearBuilt"] && await isElementVisible(getInputYearBuilt())) {
    await wait(3000);
    dataFromExcel.set("YearBuilt", dwellingConstructionData["YearBuilt"]);
    await enterYearBuilt(dwellingConstructionData["YearBuilt"]);
  }
 
  if (dwellingConstructionData["ConstructionType"] && await isElementVisible(getInputConstructionType())) {
    await wait(3000);
    dataFromExcel.set("ConstructionType", dwellingConstructionData["ConstructionType"]);
    await selectConstructionType(dwellingConstructionData["ConstructionType"]);
  }
 
  if (dwellingConstructionData["NumberOfStories"] && await isElementVisible(getNumberofStories())) {
    await wait(3000);
    dataFromExcel.set("NumberOfStories", dwellingConstructionData["NumberOfStories"]);
    await selectNumberOfStories(dwellingConstructionData["NumberOfStories"]);
  }
 
  if (dwellingConstructionData["Finished_Living_Area"] && await isElementVisible(getFinishedLivingArea())) {
    await wait(3000);
    dataFromExcel.set("Finished_Living_Area", dwellingConstructionData["Finished_Living_Area"]);
    await enterFinishedLivingArea(dwellingConstructionData["Finished_Living_Area"]);
  }
  if (dwellingConstructionData["Estimated_Valuation"] && await isElementVisible(getEstimatedValue())) {
    await wait(3000);
    dataFromExcel.set("Estimated_Valuation", dwellingConstructionData["Estimated_Valuation"]);
    await enterEstimatedValue(dwellingConstructionData["Estimated_Valuation"]);
  }

  if (dwellingConstructionData["PurchaseDate"] && await isElementVisible(getPurchaseDate())) {
    await wait(3000);
    dataFromExcel.set("PurchaseDate", formatToMMDDYYYY(dwellingConstructionData["PurchaseDate"]));
    await enterPurchaseDate(excelDateToJSDate(dwellingConstructionData["PurchaseDate"]));
  }
 
  if (dwellingConstructionData["PurchasePrice"] && await isElementVisible(getPurchasePrice())) {
    await wait(3000);
    dataFromExcel.set("PurchasePrice", dwellingConstructionData["PurchasePrice"]);
    await enterPurchasePrice(dwellingConstructionData["PurchasePrice"]);
  }
 
  if (dwellingConstructionData["Foundation_Type"] && await isElementVisible(getFoundationType())) {
    await wait(3000);
    dataFromExcel.set("Foundation_Type", dwellingConstructionData["Foundation_Type"]);
    await selectFoundationType(dwellingConstructionData["Foundation_Type"]);
  }
 
  // Check for both "Roof Covering" and "Roof_Covering" to support different LOBs
  if (dwellingConstructionData["Roof Covering"] || dwellingConstructionData["RoofCovering"] || dwellingConstructionData["Roof_Covering"] && await isElementVisible(getRoofType())) {
    const roofCoveringValue = dwellingConstructionData["Roof Covering"] || dwellingConstructionData["RoofCovering"] || dwellingConstructionData["Roof_Covering"];
    await wait(3000);
    dataFromExcel.set("Roof Covering", roofCoveringValue);
    await selectRoofType(roofCoveringValue);
  }
 
  if (dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"] && await isElementVisible(getRoofStyle())) {
    await wait(3000);
    dataFromExcel.set("Roof_Slope/Style", dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"]);
    await selectRoofStyle(dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"]);
  }

  if (dwellingConstructionData["Year_Roof_Replaced "] || dwellingConstructionData["Year_Roof_Replaced"] && await isElementVisible(getInputYearRoofReplaced())) {
    await wait(3000);
    const yearRoofReplaced = dwellingConstructionData["Year_Roof_Replaced"] || dwellingConstructionData["Year_Roof_Replaced "];
    dataFromExcel.set("Year_Roof_Replaced", yearRoofReplaced);
     await enterYearRoofReplaced(yearRoofReplaced.toString());
  }
 
 
  if (dwellingConstructionData["Primary_Heating_Controlled"] && await isElementVisible(getYesPrimaryHeating())) {
    await wait(3000);
    dataFromExcel.set("Primary_Heating_Controlled", dwellingConstructionData["Primary_Heating_Controlled"]);
    await selectPrimaryHeatingOption(dwellingConstructionData["Primary_Heating_Controlled"]);
  }
 
  if (dwellingConstructionData["Primary_Heating"] && await isElementVisible(getPrimaryHeatingDropDown())) {
    await wait(3000);
    dataFromExcel.set("Primary_Heating", dwellingConstructionData["Primary_Heating"]);
    await selectPrimaryHeating(dwellingConstructionData["Primary_Heating"]);
  }
  console.log("Fuel_Storage_Tank_Location",dwellingConstructionData["Fuel_Storage_Tank_Location"]);
 
  if (dwellingConstructionData["Electrical_System"] && await isElementVisible(getElectricalSystemDropDown())) {
    await wait(3000);
    dataFromExcel.set("Electrical_System", dwellingConstructionData["Electrical_System"]);
    await selectElectricalSystem(dwellingConstructionData["Electrical_System"]);
  }
 
  if (dwellingConstructionData["Knob_Tube_Present"] && await isElementVisible(getYesKnobWiring())) {
    await wait(3000);
    dataFromExcel.set("Knob_Tube_Present", dwellingConstructionData["Knob_Tube_Present"]);
    await selectKnobWiringOption(dwellingConstructionData["Knob_Tube_Present"]);
  }
  
  // const questionTextHeatingSystem = await getQuestion('HeatingSystemUpdateYear');
  // console.log('heating systems update year:', questionTextHeatingSystem);
  // if(dwellingConstructionData["HeatingSystemUpdateYear"] && await isElementVisible(getFieldHeatingSystems(questionTextHeatingSystem))){
  //   await fillHeatingSystems(questionTextHeatingSystem, dwellingConstructionData["HeatingSystemUpdateYear"]);
  // }

  // const questionTextPlumbingSystem = await getQuestion('PlumbingSystemUpdateYear');
  // console.log('Plumbing system update year:', questionTextPlumbingSystem)
  // if(dwellingConstructionData["PlumbingSystemUpdateYear"] && await isElementVisible(getFieldHeatingSystems(questionTextPlumbingSystem))){
  //   await fillHeatingSystems(questionTextPlumbingSystem, dwellingConstructionData["PlumbingSystemUpdateYear"]);
  // }

  // const questionTextElectricalSystem = await getQuestion('ElectricalSystemUpdateYear');
  // console.log('electrical system update year:', questionTextElectricalSystem);
  // if(dwellingConstructionData["ElectricalSystemUpdateYear"] && await isElementVisible(getFieldHeatingSystems(questionTextElectricalSystem))){
  //   await fillHeatingSystems(questionTextElectricalSystem, dwellingConstructionData["ElectricalSystemUpdateYear"]);
  // }

    if(await isElementVisible(getRetriveFromMSB_Button()) && await getRetriveFromMSB_Button().isEnabled()){
    await captureFullPage2D(page, testInfo, "Dwelling Construction Details Before Clicking On Retrieve From MSB Button","#centerPanel");
    } else {
      await captureFullPage2D(page, testInfo, "Dwelling Construction Details without MSB PopUp","#centerPanel");
    }

  if (await isElementVisible(getGoToMSBbutton())) {
    console.log("🔍 MSB button is visible, attempting to open popup...");
 
    let MSBPage = null;
    let popupOpened = false;
    const maxPopupAttempts = 8;
 
    // ✅ Keep clicking MSB button until popup opens
    for (let popupAttempt = 1; popupAttempt <= maxPopupAttempts; popupAttempt++) {
      console.log(`🔄 Attempt ${popupAttempt}/${maxPopupAttempts}: Clicking Go To MSB button...`);
      const popupPromise = page.waitForEvent("popup", { timeout: 10000 });
       MSBPage = await popupPromise;

      try {
        // Set up popup listener before clicking
        // const popupPromise = page.waitForEvent("popup", { timeout: 10000 });
 
        // Click the MSB button
        await getGoToMSBbutton().click({ force: true });
        console.log(`📝 MSB button clicked on attempt ${popupAttempt}`);
 
        // Wait for popup to open
        // MSBPage = await popupPromise;
 
        if (MSBPage && !MSBPage.isClosed()) {
          console.log(`✅ MSB popup opened successfully on attempt ${popupAttempt}`);
          popupOpened = true;
          await wait(10000);//wait sometime to make page loaded successfully .
          // await page.pause();
          // await captureAndAttachforCore(MSBPage, testInfo, 'MSB Popup',{fullPage:true});
          break;
        }
 
      } catch (popupError) {
        console.log(`⚠️ Popup not opened on attempt ${popupAttempt}: ${popupError}`);
 
        if (popupAttempt < maxPopupAttempts) {
          console.log(`⏳ Waiting 3 seconds before retry...`);
          await wait(3000);
 
          // Check if button is still visible before next attempt
          if (!(await isElementVisible(getGoToMSBbutton()))) {
            console.log(`❌ MSB button no longer visible, stopping attempts`);
            break;
          }
        }
      }
    
    // ✅ Proceed only if popup actually opened
  }
  
  if (MSBPage && !MSBPage.isClosed()) {
      console.log("🎯 MSB popup confirmed open, proceeding with popup interactions...");
      // await MSBPage.bringToFront();
      try {
        await wait(8000);
        // await MSBPage.bringToFront();
        console.log("📋 MSB popup brought to front");
 
        // ✅ Wait for Finish button to be available in popup
        let finishButtonVisible = false;
        for (let finishAttempt = 0; finishAttempt < 5; finishAttempt++) {
          try {
            await MSBPage.waitForLoadState("load", { timeout: 5000 });
            await wait(2000);
 
            // Check if finish button is visible in the popup
            const finishButton = MSBPage.locator(getFinishButton);
            finishButtonVisible = await finishButton.isVisible({ timeout: 3000 });
 
            console.log(`🔍 Finish button check attempt ${finishAttempt + 1}: ${finishButtonVisible}`);
 
            if (finishButtonVisible) {
              console.log("✅ Finish button is now visible in MSB popup");
              break;
            }
 
            await wait(2000);
          } catch (finishError) {
            console.log(`⚠️ Finish button check attempt ${finishAttempt + 1} failed: ${finishError}`);
          }
        }
 
        // ✅ If Finish button is visible, proceed with interactions
      const maxRetries = 3;
  
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const editButton = getEditButtoninMSB;
        await MSBPage.click(editButton, { force: true });
        await wait(SMALL_TIMEOUT);
  
        const isVisible = await isElementVisible(getMSBYearBuilt);
        if (isVisible) {
          console.log(`Edit window opened on attempt ${attempt}`);
          break;
        }
      }
      //filling yearbuilt
      await MSBPage.fill(getMSBYearBuilt, dwellingConstructionData["YearBuilt"].toString());
      console.log('MSB Year Built filled with:', dwellingConstructionData["YearBuilt"].toString());
  
      //filling finished living area
      await MSBPage.fill(getFinishedLivingArea_MSB, dwellingConstructionData["Finished_Living_Area"].toString());
      await MSBPage.click(getFoundationTypeMSB());
      const formattedFoundationType = getFoundationType_MSB(dwellingConstructionData["Foundation_Type"]);
      await MSBPage.getByRole("option", { name: formattedFoundationType, exact: true }).click();
      await MSBPage.locator(`text="${formattedFoundationType}"`).last().click({ force: true });
      // await MSBPage.click(getFoundationTypeMSB());
  
      //selecting number of stories
      await MSBPage.click(getNumberOfStoriesMSB());
      const formattedNumOfStories = getNumberofStoriesMSB(dwellingConstructionData["NumberOfStories"]);
      await MSBPage.getByRole("option", { name: formattedNumOfStories, exact: true }).click({ force: true });
      await MSBPage.click(`text="${formattedNumOfStories}"`);
  
      //clicking save 
      await MSBPage.getByRole("button", { name: "Save" }).scrollIntoViewIfNeeded();
      await MSBPage.click(getSaveButton, { force: true });
      await MSBPage.click(getSaveButton, { force: true });
      await wait(TIMEOUT_4_SECONDS);
  
      //Roof Covering
      await MSBPage.click(getRoofCoveringDropDownButton);
      await MSBPage.evaluate(() => { document.body.style.zoom = "85%"; });
      await MSBPage.click(getMoreButton);
      const getRoofCover = getRoofCoveringMSB(dwellingConstructionData["Roof_Covering"] || dwellingConstructionData["Roof Covering"]);
      console.log(`Mapped Roof Cover: ${dwellingConstructionData["Roof_Covering"] || dwellingConstructionData["Roof Covering"]} → ${getRoofCover}`);
  
      let found = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getRoofCover, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
  
      // Roof Style
      await MSBPage.click(getRoofStyleDropDownMSB);
      if (await isElementVisible(getMoreButton)) {
        await MSBPage.click(getMoreButton);
      }
  
      const getRoofStyle = getRoofStyleMSB(dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"]);
      console.log(`Mapped Roof Style: ${dwellingConstructionData["Roof_Slope/Style"] || dwellingConstructionData["Roof_Style"]} → ${getRoofStyle}`);
  
      let found1 = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getRoofStyle, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found1 = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
  
      //ConstructionType
      await MSBPage.click(getConstructionTypeDropDownMSB);
      await MSBPage.click(getMoreforConstructionType);
      const getMSBConstructionType = getConstructionType_MSB(dwellingConstructionData["Construction_Type"] || dwellingConstructionData["ConstructionType"]);
      console.log(`Mapped Construction Type: ${dwellingConstructionData["Construction_Type"] || dwellingConstructionData["ConstructionType"]} → ${getMSBConstructionType}`);
  
      let found2 = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getMSBConstructionType, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found2 = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
  
      //Primary Heating
      await MSBPage.click(getPrimaryHeating_MSB_DropDown);
      await MSBPage.click(getMoreforPrimaryHeating);
      const getPrimaryHeating = getPrimaryHeating_MSB(dwellingConstructionData["Primary_Heating"] || dwellingConstructionData["Primary Heating"]);
      console.log(`Mapped Primary Heating: ${dwellingConstructionData["Primary_Heating"] || dwellingConstructionData["Primary Heating"]} → ${getPrimaryHeating}`);

      let found3 = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getPrimaryHeating, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found3 = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
      await wait(2000);
      console.log("MSB popup capturing Image Now.");
      await captureAndAttachforCore(MSBPage, testInfo, 'MSB popup window');
      await wait(SMALL_TIMEOUT);
      await MSBPage.click(getCalculateButton);
      await wait(2000);
      await MSBPage.click(getFinishButton);
      await wait(2000);
      await MSBPage.click(getSaveButton_MSB);
    }
       catch (error) {
        console.error("❌ Error occurred during MSB page interaction:", error);
      } finally {
        // ✅ Always close popup if it's still open
        try {
          if (MSBPage && !MSBPage.isClosed()) {
            await MSBPage.close();
            console.log("🔒 MSB popup closed in finally block");
          }
        } catch (closeError) {
          console.log("⚠️ Error closing MSB popup:", closeError);
        }
      }
 
    } else {
      console.log("❌ Failed to open MSB popup after all attempts, continuing without MSB interaction");
    }
}
  if (await isElementVisible(getRetriveFromMSB_Button())) {
    await getRetriveFromMSB_Button().click({ force: true });
    console.log("Clicked on Retrieve from MSB button");
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(1000);

    if (dwellingConstructionData["Fuel_Storage_Tank_Location"] && await isElementVisible(getFuelStorageTankLocationDropDown())) {
    await selectFuelStorageTank(dwellingConstructionData["Fuel_Storage_Tank_Location"]);
    }
    const {shouldStop,mismatchData} = await assertUIVsExcelDataCore(dataFromExcel, page, testInfo);
    if (shouldStop) {
      console.log("❌ Data mismatch found between UI and Excel. Stopping test.");
    return { success: false, message: `Dwelling Construction Details doesn't match-> ${mismatchData}`, shouldStop: shouldStop, errorType:"Data mismatch found between UI and Excel." , status: "FAIL" };
    }
    if (await isElementVisible(getRetriveFromMSB_Button()) && await getRetriveFromMSB_Button().isEnabled()) {
    
  await captureFullPage2D(page, testInfo, "Dwelling Construction Details After Clicking On Retrieve From MSB Button", "#centerPanel");
    }
  await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(TIMEOUT_8_SECONDS);
 
  console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );
 
    if (await isElementVisible(getSaveAndNextButton())) {
      await getSaveAndNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
 
 
    console.log("Dwelling Construction Details validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;
  }
}
 
export async function fillDwellingConstruction_MHPage(page: Page, testInfo: TestInfo, dwellingConstructionData: any, ruleMatrix: any, blockingContext: string, testCaseId: any): Promise<ValidationResult> {
  try {
    await wait(TIMEOUT_4_SECONDS);
    await page.evaluate(() => window.scrollTo(0, 0));
    let dataFromExcel = new Map<string, string>();
    await wait(1000);
    if (dwellingConstructionData["Valuation_Type"] && await isElementVisible(getValuationTypeDropDown())) {
      console.log("Valuation_Type:", dwellingConstructionData["Valuation_Type"])
      await selectValuationType(dwellingConstructionData["Valuation_Type"]);
    }
    if (dwellingConstructionData["YearBuilt"] && await isElementVisible(getInputYearBuilt())) {
      await wait(3000);
      dataFromExcel.set("YearBuilt", dwellingConstructionData["YearBuilt"]);
      await enterYearBuilt(dwellingConstructionData["YearBuilt"]);
    }
    if (dwellingConstructionData["ModelYear"] && await isElementVisible(getModelYear())) {
      await wait(3000);
      dataFromExcel.set("ModelYear", dwellingConstructionData["ModelYear"]);
      await enterModelYear(dwellingConstructionData["ModelYear"]);
    }
    if (dwellingConstructionData["AttachedStructure"] && await isElementVisible(getYesAttachedStructures())) {
        await wait(3000);
        dataFromExcel.set("AttachedStructure", dwellingConstructionData["AttachedStructure"]);
        await selectAttachedStructres(dwellingConstructionData["AttachedStructure"]);
    }
    if (dwellingConstructionData["Length"] && await isElementVisible(getLength())) {
      await wait(3000);
      dataFromExcel.set("Length", dwellingConstructionData["Length"]);
      await enterLength(dwellingConstructionData["Length"]);
    }
    if (dwellingConstructionData["Width"] && await isElementVisible(getWidth())) {
      await wait(3000);
      dataFromExcel.set("Width", dwellingConstructionData["Width"]);
      await enterWidth(dwellingConstructionData["Width"]);
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    }
    if (dwellingConstructionData["Style"] && await isElementVisible(getStyleSingleWide())) {
        await wait(3000);
        dataFromExcel.set("Style", dwellingConstructionData["Style"]);
        await selectStyle(dwellingConstructionData["Style"]);
    }
    console.log("estimated Valuation value:", dwellingConstructionData["Estimated_Valuation"]);
    if (dwellingConstructionData["Estimated_Valuation"] && await isElementVisible(getEstimatedValue())) {
      await wait(3000);
      dataFromExcel.set("Estimated_Valuation", dwellingConstructionData["Estimated_Valuation"]);
      await enterEstimatedValue(dwellingConstructionData["Estimated_Valuation"].toString());
    }
    if (dwellingConstructionData["PurchaseDate"] && await isElementVisible(getPurchaseDate())) {
      await wait(3000);
      dataFromExcel.set("PurchaseDate", formatToMMDDYYYY(dwellingConstructionData["PurchaseDate"]));
      await enterPurchaseDate(dwellingConstructionData["PurchaseDate"]);
    }
   
 
    if (dwellingConstructionData["PurchasePrice"] && await isElementVisible(getPurchasePrice())) {
      await wait(3000);
      dataFromExcel.set("PurchasePrice", dwellingConstructionData["PurchasePrice"]);
      await enterPurchasePrice(dwellingConstructionData["PurchasePrice"]);
    }
    if (dwellingConstructionData["Year_Roof_Replaced "] && await isElementVisible(getInputYearRoofReplaced())) {
      await wait(3000);
      dataFromExcel.set("Year_Roof_Replaced", dwellingConstructionData["Year_Roof_Replaced "].toString());
      await enterYearRoofReplaced(dwellingConstructionData["Year_Roof_Replaced "].toString());
    }
    if (dwellingConstructionData["Make"] && await isElementVisible(getMakeDropDown())) {
      await wait(3000);
      dataFromExcel.set("Make", dwellingConstructionData["Make"]);
      await selectMake(dwellingConstructionData["Make"]);
    }
    if (dwellingConstructionData["Model"] && await isElementVisible(getModel())) {
      await wait(3000);
      dataFromExcel.set("Model", dwellingConstructionData["Model"]);
      await enterModel(dwellingConstructionData["Model"]);
    }
    if(dwellingConstructionData["Unit_Modular_Home"] && await isElementVisible(getYesUnitModular())){
      await wait(3000);
      dataFromExcel.set("Unit_Modular_Home", dwellingConstructionData["Unit_Modular_Home"]);
      await selectUnitModular(dwellingConstructionData["Unit_Modular_Home"]);
    }
    if (dwellingConstructionData["Serial_Number"] && await isElementVisible(getSerialNumber())) {
      await wait(3000);
      dataFromExcel.set("Serial_Number", dwellingConstructionData["Serial_Number"]);
      await enterSerialNumber(dwellingConstructionData["Serial_Number"]);
    }
    if(dwellingConstructionData["Unit_Tied_Down"] && await isElementVisible(getNoUnitTied())){
      await wait(3000);
      dataFromExcel.set("Unit_Tied_Down", dwellingConstructionData["Unit_Tied_Down"]);
      await selectUnitTiedDown(dwellingConstructionData["Unit_Tied_Down"]);
    }
 
    // const container = page.locator('#centerPanel');
    // await container.evaluate(el => el.scrollTop = 0);
    // await page.waitForTimeout(3000);
    // await captureAndAttachforCore(page, testInfo, "Dwelling Construction Details Before clicking on Retrieve from MSB button 1 of 2", {
    //   fullPage: true
    // });
    // await page.waitForTimeout(3000);
    // // ========== BOTTOM screenshot ==========
    // await container.evaluate(el => {
    //   el.scrollTop = el.scrollHeight - el.clientHeight;
    // });
    // await captureAndAttachforCore(page, testInfo, "Dwelling Construction Details Before clicking on Retrieve from MSB button 2 of 2", {
    //   fullPage: false
    // });
    await captureFullPage2D(page, testInfo, "Dwelling Construction Details Before Clicking On Retrieve From MSB Button","#centerPanel");
    // await captureAndAttachforCore(page, testInfo, "Dwelling Construction Details Before Clicking On Retrieve From MSB Button");
    // if (await isElementVisible(getGoToMSBbutton())) {
    //   console.log("🔍 MSB button is visible, attempting to open popup...");
 
    //   let MSBPage = null;
    //   let popupOpened = false;
    //   const maxPopupAttempts = 8;
 
    //   // ✅ Keep clicking MSB button until popup opens
    //   for (let popupAttempt = 1; popupAttempt <= maxPopupAttempts; popupAttempt++) {
    //     console.log(`🔄 Attempt ${popupAttempt}/${maxPopupAttempts}: Clicking Go To MSB button...`);
 
    //     try {
    //       // Set up popup listener before clicking
    //       const popupPromise = page.waitForEvent("popup", { timeout: 10000 });
 
    //       // Click the MSB button
    //       await getGoToMSBbutton().click({ force: true });
    //       console.log(`📝 MSB button clicked on attempt ${popupAttempt}`);
    //       await wait(5000);
    //       // Wait for popup to open
    //       MSBPage = await popupPromise;
    //       await wait(3000);
    //       if (MSBPage && !MSBPage.isClosed()) {
    //         console.log(`✅ MSB popup opened successfully on attempt ${popupAttempt}`);
    //         popupOpened = true;
    //         await captureAndAttachforCore(MSBPage, testInfo, 'MSB Popup',{fullPage:true});
    //         break;
    //       }
 
    //     } catch (popupError) {
    //       console.log(`⚠️ Popup not opened on attempt ${popupAttempt}: ${popupError}`);
 
    //       if (popupAttempt < maxPopupAttempts) {
    //         console.log(`⏳ Waiting 3 seconds before retry...`);
    //         await wait(3000);
 
    //         // Check if button is still visible before next attempt
    //         if (!(await isElementVisible(getGoToMSBbutton()))) {
    //           console.log(`❌ MSB button no longer visible, stopping attempts`);
    //           break;
    //         }
    //       }
    //     }
    //   }
 
    //   // ✅ Proceed only if popup actually opened
    //   if (popupOpened && MSBPage && !MSBPage.isClosed()) {
    //     console.log("🎯 MSB popup confirmed open, proceeding with popup interactions...");
 
    //     try {
    //       await wait(8000);
    //       await MSBPage.bringToFront();
    //       console.log("📋 MSB popup brought to front");
 
    //       // ✅ Wait for Finish button to be available in popup
    //       let finishButtonVisible = false;
    //       for (let finishAttempt = 0; finishAttempt < 5; finishAttempt++) {
    //         try {
    //           await MSBPage.waitForLoadState("load", { timeout: 5000 });
    //           await wait(2000);
 
    //           // Check if finish button is visible in the popup
    //           const finishButton = MSBPage.locator(getFinishButton);
    //           finishButtonVisible = await finishButton.isVisible({ timeout: 3000 });
 
    //           console.log(`🔍 Finish button check attempt ${finishAttempt + 1}: ${finishButtonVisible}`);
 
    //           if (finishButtonVisible) {
    //             console.log("✅ Finish button is now visible in MSB popup");
    //             break;
    //           }
 
    //           await wait(2000);
    //         } catch (finishError) {
    //           console.log(`⚠️ Finish button check attempt ${finishAttempt + 1} failed: ${finishError}`);
    //         }
    //       }
 
    //       // ✅ Interact with popup if Finish button is available
    //       if (finishButtonVisible) {
    //         console.log("🔘 Clicking Finish button in MSB popup...");
    //         await MSBPage.click(getFinishButton);
    //         await wait(2000);
 
    //         console.log("💾 Clicking Save button in MSB popup...");
    //         await MSBPage.click(getSaveButton_MSB);
    //         await wait(2000);
 
    //         console.log("✅ MSB popup interactions completed successfully");
    //       } else {
    //         console.log("⚠️ Finish button not found in MSB popup, proceeding anyway");
    //       }
 
    //     } catch (error) {
    //       console.error("❌ Error occurred during MSB page interaction:", error);
    //     } finally {
    //       // ✅ Always close popup if it's still open
    //       try {
    //         if (MSBPage && !MSBPage.isClosed()) {
    //           await MSBPage.close();
    //           console.log("🔒 MSB popup closed in finally block");
    //         }
    //       } catch (closeError) {
    //         console.log("⚠️ Error closing MSB popup:", closeError);
    //       }
    //     }
 
    //   } else {
    //     console.log("❌ Failed to open MSB popup after all attempts, continuing without MSB interaction");
    //   }
 
    // } else {
    //   console.log("ℹ️ Go To MSB button not visible, skipping MSB interaction");
    // }
    // if (await isElementVisible(getRetriveFromMSB_Button())) {
    //   await getRetriveFromMSB_Button().click({ force: true });
    //   console.log("Clicked on Retrieve from MSB button");
    //   await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    // }
    // Identify the scrollable container
    // const container = page.locator('#centerPanel');
 
    // ========== TOP screenshot ==========
    // await container.evaluate(el => el.scrollTop = 0);
    // await page.waitForTimeout(3000);
 
    // await captureAndAttachforCore(page, testInfo, "Dwelling Construction Details after clicking on Retrieve from MSB button 1 of 2", {
    //   fullPage: true
    // });
    // await page.waitForTimeout(3000);
    // // ========== BOTTOM screenshot ==========
    // await container.evaluate(el => {
    //   el.scrollTop = el.scrollHeight - el.clientHeight;
    // });
    // await captureAndAttachforCore(page, testInfo, "Dwelling Construction Details after clicking on Retrieve from MSB button 2 of 2", {
    //   fullPage: false
    // });
    // await captureAndAttachforCore(page, testInfo, "Dwelling Construction Details After Clicking On Retrieve From MSB Button");
    const MSBPage = await page.waitForEvent("popup");
  
    try {
      // const MSBPage = await page.waitForEvent("popup");
      await MSBPage.waitForLoadState();
      await wait(TIMEOUT_4_SECONDS);
      const maxRetries = 3;
  
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const editButton = getEditButtoninMSB;
        await MSBPage.click(editButton, { force: true });
        await wait(SMALL_TIMEOUT);
  
        const isVisible = await isElementVisible(getMSBYearBuilt);
        if (isVisible) {
          console.log(`Edit window opened on attempt ${attempt}`);
          break;
        }
      }
      //filling yearbuilt
      await MSBPage.fill(getMSBYearBuilt, dwellingConstructionData["YearBuilt"].toString());
      console.log('MSB Year Built filled with:', dwellingConstructionData["YearBuilt"].toString());
  
      //filling finished living area
      await MSBPage.fill(getFinishedLivingArea_MSB, dwellingConstructionData["Finished_Living_Area"].toString());
      await MSBPage.click(getFoundationTypeMSB());
      const formattedFoundationType = getFoundationType_MSB(dwellingConstructionData["Foundation_Type"]);
      await MSBPage.getByRole("option", { name: formattedFoundationType, exact: true }).click();
      // await MSBPage.click(`text="${formattedFoundationType}"`);
      await MSBPage.locator(`text="${formattedFoundationType}"`).last().click({ force: true });
      // await MSBPage.click(getFoundationTypeMSB());
  
      //selecting number of stories
      await MSBPage.click(getNumberOfStoriesMSB());
      const formattedNumOfStories = getNumberofStoriesMSB(dwellingConstructionData["Number_of_Stories"]);
      await MSBPage.getByRole("option", { name: formattedNumOfStories, exact: true }).click({ force: true });
      await MSBPage.click(`text="${formattedNumOfStories}"`);
  
      //clicking save 
      await MSBPage.getByRole("button", { name: "Save" }).scrollIntoViewIfNeeded();
      await MSBPage.click(getSaveButton, { force: true });
      await MSBPage.click(getSaveButton, { force: true });
      await wait(TIMEOUT_4_SECONDS);
  
      //Roof Covering
      await MSBPage.click(getRoofCoveringDropDownButton);
      await MSBPage.evaluate(() => { document.body.style.zoom = "85%"; });
      await MSBPage.click(getMoreButton);
      const getRoofCover = getRoofCoveringMSB(dwellingConstructionData["Roof_Covering"]);
      console.log(`Mapped Roof Cover: ${dwellingConstructionData["Roof_Covering"]} → ${getRoofCover}`);
  
      let found = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getRoofCover, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
  
      // Roof Style
      await MSBPage.click(getRoofStyleDropDownMSB);
      if (await isElementVisible(getMoreButton)) {
        await MSBPage.click(getMoreButton);
      }
  
      const getRoofStyle = getRoofStyleMSB(dwellingConstructionData["Roof_Slope/Style"]);
      console.log(`Mapped Roof Style: ${dwellingConstructionData["Roof_Slope/Style"]} → ${getRoofStyle}`);
  
      let found1 = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getRoofStyle, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found1 = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
  
      //ConstructionType
      await MSBPage.click(getConstructionTypeDropDownMSB);
      await MSBPage.click(getMoreforConstructionType);
      const getMSBConstructionType = getConstructionType_MSB(dwellingConstructionData["Construction_Type"]);
      console.log(`Mapped Construction Type: ${dwellingConstructionData["Construction_Type"]} → ${getMSBConstructionType}`);
  
      let found2 = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getMSBConstructionType, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found2 = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
  
      //Primary Heating
      await MSBPage.click(getPrimaryHeating_MSB_DropDown);
      await MSBPage.click(getMoreforPrimaryHeating);
      const getPrimaryHeating = getPrimaryHeating_MSB(dwellingConstructionData["Primary_Heating"]);
      console.log(`Mapped Primary Heating: ${dwellingConstructionData["Primary_Heating"]} → ${getPrimaryHeating}`);
  
      let found3 = false;
      for (let i = 0; i < 20; i++) {
        const cell = MSBPage.getByText(getPrimaryHeating, { exact: true });
        if (await isElementVisible(cell)) {
          await cell.click({ force: true });
          found3 = true;
          break;
        }
        await MSBPage.keyboard.press('ArrowDown');
        await wait(1000);
      }
      await wait(2000);
      console.log("MSB popup capturing Image Now.");
      await captureFullPage2D(MSBPage, testInfo, 'MSB popup window');
      await wait(SMALL_TIMEOUT);
      await MSBPage.click(getCalculateButton);
      await wait(2000);
      await MSBPage.click(getFinishButton);
      await wait(2000);
      await MSBPage.click(getSaveButton_MSB);
    } catch (error) {
      console.error("Error occurred during MSB page interaction:", error);
    } 
    finally {
      if (!MSBPage.isClosed()) {
        await MSBPage.close();
        console.log("MSB popup closed in finally block.");
      }
    }   

    if (await isElementVisible(getRetriveFromMSB_Button())) {
      await getRetriveFromMSB_Button().click({ force: true });
      console.log("Clicked on Retrieve from MSB button");
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    }
    const {shouldStop,mismatchData} = await assertUIVsExcelDataCore(dataFromExcel, page,testInfo);
    if (shouldStop) {
      console.log("❌ Data mismatch found between UI and Excel. Stopping test.");
    return { success: false, message: `Dwelling Construction Details doesn't match-> ${mismatchData}`, shouldStop: shouldStop, errorType:"Data mismatch found between UI and Excel." , status: "FAIL" };
    }
    await captureFullPage2D(page, testInfo, "Dwelling Construction Details After Clicking On Retrieve From MSB Button", "#centerPanel");
    await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(TIMEOUT_8_SECONDS);
 
 
    console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );
 
    if (await isElementVisible(getSaveAndNextButton())) {
      await getSaveAndNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
 
 
    console.log("Policy Details validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;
 
  }
}