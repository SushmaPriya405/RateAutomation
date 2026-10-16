import { expect, Locator, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByLabel,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../utils/locator-utils";
import {
  click,
  clickAndNavigate,
  fill,
  gotoURL,
  selectByIndex,
  selectByText,
  selectByValue,
  wait,
  waitForPageLoadState,
} from "../../utils/action-utils";
import { createAutoQuestionFetcher, createQuestionFetcher, getAllQuestions } from "../../utils/questionTextMapper";
import { captureAndAttach } from "../../utils/report-utils";
import { getConstructionType_MSB, getFoundationType_MSB, getNumberofStoriesMSB, getPrimaryHeating_MSB, getRoofCoveringMSB, getRoofStyleMSB } from "../../testdata/testData";
import { AMSuite_GPAURL } from "../../utils/url-constansts";
import { getPage } from "../../utils/page-utils";
import { isElementHidden, isElementVisible } from "../../utils/element-utils";
import {
  BIG_TIMEOUT,
  MAX_TIMEOUT,
  PAUSE_TIMEOUT,
  SMALL_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { errorWordingValidation, warningsWordingValidation } from "../../utils/wordingValidation";
import { validateRulesForTestCase, ValidationResult } from "../../utils/ruleBasedValidation";
import { selectDropdown } from "../../utils/question-helper";
// import { normalize } from "path";

const getYearBuilt = () =>
  getLocatorByRole("textbox", { name: "Year Built *" });
const getModelYear = () =>
  getLocatorByRole("textbox", { name: "Model Year" });
const getStyleSingleWide = () =>
  getLocator("//label[@title='Single-wide']");         
const getStyleMultiWide = () =>
  getLocator("//label[@title='Multi-wide']");               
const getLengthFeet = () =>
  getLocator("input[name='length']");
const getWidthFeet = () =>
  getLocator("input[name='width']");
const DomBody = () =>
  getLocator("body");
const getConstructionType = () => getLocatorByLabel("Construction Type *");
const getNoOfStories = () =>
  getLocator(
    "(//select[@gw-pl-select='view.construction.storiesNumber.value'])[1]"
  );
const enterLivingSquare = () =>
  getLocatorByRole("textbox", { name: "Finished Living Area (Sq Ft) *" });
const getAttachStrucYes = () =>
  getLocator("//label[normalize-space()='Attached Structures']/following-sibling::div//label[@title='Yes']");
const getAttachStrucNo = () =>
  getLocator("//label[normalize-space()='Attached Structures']/following-sibling::div//label[@title='No']");
const getNoTownHome = () =>
  getLocator("//div[@class='gw-labels']/label[@title='No']");
const getYesTownHome = () => getLocator("//input[@ng-model='view.construction.isDwellingRowHouse.value']/parent::div//div//label[@title='No']");
const selectFoundationType = () => getLocatorByLabel("Foundation Type *");
const selectRoofCovering = () => getLocatorByLabel("Roof Covering *");
const selectRoofStyle = () => getLocatorByLabel("Roof Slope/Style *");
const enterYearOfRoof = () =>
  getLocatorByRole("textbox", { name: "Year Roof Replaced *" });
const modularHomeYes = () =>
  getLocator("//div[@class='gw-control-group' and @model='view.construction.isUnitModular']//div/label[@title='Yes']");
const modularHomeNo = () =>
  getLocator("//div[@class='gw-control-group' and @model='view.construction.isUnitModular']//div[@class='gw-radios-binary ng-isolate-scope' and @title2='No']");
const unitTiedDownYes = () =>
  getLocator("//div[@class='gw-control-group ng-scope' and @model='view.construction.isUnitTiedDown']//div/label[@title='Yes']");//'.bar > .gw-control-group.ng-scope > .gw-controls > .gw-radios-binary > .gw-overlap2');
const unitTiedDownNo = () =>
  getLocator("//div[@class='gw-control-group ng-scope' and @model='view.construction.isUnitTiedDown']//div[@class='gw-radios-binary ng-isolate-scope' and @title2='No']");
const selectPrimaryHeating = () => getLocatorByLabel("Primary Heating *");
const slectStorageTankLocation = () =>
  getLocatorByLabel("Fuel Storage Tank Location *");
const enterEstimatedValuation = () =>
  getLocatorByRole("textbox", { name: "Estimated Valuation *" });
const getNextButton = () => getLocator("//h2[contains(text(), 'Valuation')]/parent::div//button[@ng-click='next(form)']");
const getContinue = () =>
  getLocatorByRole('button', { name: 'Continue' })
const getViewMSBbutton = () => getLocatorByRole("button", { name: "View MSB" });
export const getEditButtoninMSB = `//div[@class='building-info']//div//input[@value='Edit']`;
const getEditWindow = `[id='EditBuildingWindow']`;
export const getFoundationTypeMSB = () => "//div[contains(@id, 'FoundationType')]//span[contains(@class, 'arrow')]";
export const getNumberOfStoriesMSB = () => "//div[contains(@class, 'homeStyle ')]//span[contains(@class, 'arrow')]";
export const getRoofCoveringDropDownButton = `//td//input[contains(@data-metadata, "'groupId': 'Roof'") and contains(@data-metadata, "'subgroupId': 'RoofCover'")]/following-sibling::button`;
export const getMoreButton = `(//a[text() = 'More'])[1] | (//a[text() = 'More'])[4] | (//a[text() = 'More'])[2] | (//a[text() = 'More'])[3]`;
export const getSaveButton = `#saveBuildingButton`;
export const getMSBYearBuilt = `[title="Year Built"]`;
export const getFinishedLivingArea_MSB = `[title="Finished Living Area"]`;
export const getRoofStyleDropDownMSB = `//td//input[contains(@data-metadata, "'groupId': 'Roof'") and contains(@data-metadata, "'subgroupId': 'RoofStyle'")]/following-sibling::button`;
export const getConstructionTypeDropDownMSB = `//td//input[contains(@data-metadata, "'groupId': 'ExteriorWalls'") and contains(@data-metadata, "'subgroupId': 'null'")]/following-sibling::button`;
export const getCalculateButton = `[value="Calculate"]`;
export const getFinishButton = `[value="Finish"]`;
export const getSaveButton_MSB = `[id="SaveValuationButton"]`;
export const getPrimaryHeating_MSB_DropDown = `(//td//input[contains(@data-metadata, "'groupId': 'HVAC'") and contains(@data-metadata, "'subgroupId': 'null'")]/following-sibling::button)[1]`;
const getRetriveFromMSB_Button = () => getLocatorByRole('button', { name: 'Retrieve from MSB' });
const getWarningMsg = () =>
  getLocator(
    '[ng-repeat="war in getMessages(warning.warningMessage) track by $index"]'
  ).first();
const getFoundationTypeErrorMsg = () => getLocator("//div[contains(@label, 'Foundation Type')]//div[@class='gw-inline-messages']");
const getFuelStorageTankLocation = () => getLocator('//div[@label="Fuel Storage Tank Location"]//select');
export const getMoreforConstructionType = `//a[text()= 'Shakes, Wood']/parent::li/following-sibling::li//a[text() = 'More']`;
export const getMoreforPrimaryHeating = `//a[text()= 'Central Air Conditioning, Separate Ducts']/parent::li/following-sibling::li//a[text() = 'More']`;
const getDescribeOtherForPrimaryHeating = ()=> getLocator('[ng-model="view.construction.primaryHeatingTypeDescription.value"]');
const getValidationError = () => getLocator('[ng-if="data.errorsFound"]');
const getYearBuiltText = () => getLocator('(//div//gw-pl-input-ctrl[@label="Year Built"]//div//div//span | //div//gw-pl-input-ctrl[@label="Year Built"]//input)');
const getConstructiontypeText = () => getLocator('(//div//gw-pl-input-ctrl[@model="view.construction.constructionType"]//div//div//span | //div//gw-pl-input-ctrl[@model="view.construction.constructionType"]//select)');
const getFinishedLivingAreaText = () => getLocator('(//div//gw-pl-input-ctrl[@label="Finished Living Area (Sq Ft)"]//div//div//span | //div//gw-pl-input-ctrl[@label="Finished Living Area (Sq Ft)"]//input)');
const getFoundationTypeText = () => getLocator('(//div[@model="view.construction.foundationType"]//div//div//span | //div[@model="view.construction.foundationType"]//select)');
const getRoofCCoveringText = () => getLocator('(//div[@label="Roof Covering"]//div//div//span | //div[@label="Roof Covering"]//select)');
const getRoofStyleText = () => getLocator('(//div[@model="view.construction.roofStyle"]//div//div//span | //div[@model="view.construction.roofStyle"]//select)');
const getYearRoofReplacedText = () => getLocator('(//gw-pl-input-ctrl[@label="Year Roof Replaced"]//div//div//input | //gw-pl-input-ctrl[@label="Year Roof Replaced"]//input)');
const getPrimaryHeatingText = () => getLocator('(//div[@label="Primary Heating"]//div//div//span | //div[@label="Primary Heating"]//select)');
const getPrimaryHeatingSelectedOPtioninMSB = `//ul[@role="listbox"]//li[@class="selected ui-menu-item"]//a[@class="ui-corner-all"]`;
//MH
const getModelYearText = () => getLocator('//div//gw-pl-input-ctrl[@label="Finished Living Area (Sq Ft)"]//div//div//span');
const getValuationTypeText = () => getLocator('//gw-pl-input-ctrl[@model="view.construction.valuationType"]//div//div//span');
const getMSBReportedValueText = () => getLocator('//div//gw-pl-input-ctrl[@label="MSB Reported Value"]//div//div//span');
const getErrorinValuationPage = () => getLocator("//h2[contains(text(), 'Valuation')]/parent::div/parent::div//div[@data='validationErrors']");
const HeaderPageContent = () => getLocator("//h2[@class = 'gw-page-section-title gw-as-page-title ng-binding']");
const getSingleWideRadio =() =>
  getLocator("//input[contains(@ng-value, 'Single-wide')]");
const getMultiWideRadio =() =>
  getLocator("//input[contains(@ng-value, 'Multi-wide')]");
export const getMSBAlertCloseButton = `(//span[contains(@class,"closethick")])[2]`;
const getheatingSystems = () => getLocator("//div[contains(@label, 'Year heating systems installed or fully updated?')]//input");
const getPlumbingSystems = () => getLocator("//div[contains(@label, 'Year plumbing systems installed or fully updated?')]//input");
const getElectricalSystems = () => getLocator("//div[contains(@label, 'Year electrical systems installed or fully updated?')]//input");

const getSystemsLocator = (questiontext: string) => getLocator(`//div[contains(@label,"${questiontext}")]//div//div//input`)

async function fillSystemsQUestions(questionElement: any, value: any) {
  await getSystemsLocator(questionElement).scrollIntoViewIfNeeded();
  await fill(getSystemsLocator(questionElement), value.toString());
}

async function selectTownRowOption(townRow: string,) {
  if (await isElementVisible(getNoTownHome().first())){
    if (townRow === "Yes") {
    await getYesTownHome().click({ force: true });
   }
   else{
    await getNoTownHome().first().click({ force: true });
   }
  }
}
async function selectAttachedStructureOption(attachedStructure: string) {
if (attachedStructure == "Yes") {
        await getAttachStrucYes().click({ timeout: 4000 });
  } else {
        await getAttachStrucNo().click({ timeout: 4000 });
  }
}
async function selectModularHomeOption(Modularhome: string, page: Page) {
    // await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Optional buffer for flicker

    if (Modularhome === "Yes") {
        const yesOption = modularHomeYes();

        await yesOption.waitFor({ state: 'visible', timeout: 5000 });
        await yesOption.evaluate((el: HTMLElement) => el.click());

        console.log("Clicked 'Yes' for Modular Home");
    } else {
        const noOption = modularHomeNo();

        await noOption.waitFor({ state: 'visible', timeout: 5000 });
        await noOption.click({ timeout: 5000 });

        console.log("Clicked 'No' for Modular Home");
    }
}
async function selectUnitTiedOption(UnitTied: string, page:Page) {
    // await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Optional buffer for flicker

    if (UnitTied === "Yes") {
        const yesOption = unitTiedDownYes();

        await yesOption.waitFor({ state: 'visible', timeout: 5000 });
        await yesOption.evaluate((el: HTMLElement) => el.click());

        console.log("Clicked 'Yes' for Unit Tied Down");
    } else {
        const noOption = unitTiedDownNo();

        await noOption.waitFor({ state: 'visible', timeout: 5000 });
        await noOption.click({ timeout: 5000 });

        console.log("Clicked 'No' for Unit Tied Down");
    }
}
//Re-select the values after MSB resets them
// async function reApplyValuationFields(page: Page, valuationMH: any) {
//   await selectModularHomeOption(valuationMH["Modular_Home"], page);
//   await selectUnitTiedOption(valuationMH["Unit_Tied_Down"], page);
// }
async function selectFoundationTypeHO(foundationType: string){
  if(await isElementVisible(selectFoundationType())){
    await selectFoundationType().scrollIntoViewIfNeeded();
    await selectByText(selectFoundationType(), foundationType);
  }
}
async function enterRoofCoveringHO(value: string){
  if(await isElementVisible(selectRoofCovering())){
    await selectRoofCovering().scrollIntoViewIfNeeded();
    await selectByText(selectRoofCovering(), value);
  }
}
async function enterRoofStyleHO(value: string) {
  if(await isElementVisible(selectRoofStyle())){
    await selectRoofStyle().scrollIntoViewIfNeeded();
    await selectByText(selectRoofStyle(), value);
  }
}
async function selectPrimaryHeatingHO(PrimaryHeating: string){
  if(await isElementVisible(selectPrimaryHeating())){
  await selectPrimaryHeating().scrollIntoViewIfNeeded();
  await selectByText(selectPrimaryHeating(), PrimaryHeating);
  if (PrimaryHeating === "Oil" || PrimaryHeating === "Propane")
    await slectStorageTankLocation().selectOption({index: 1});
  if(await isElementVisible(getDescribeOtherForPrimaryHeating())){
    await fill(getDescribeOtherForPrimaryHeating(), "Solar Power");
  }
}
}
async function enterEstimationValuationHO(estimatedValuation: string){
  if (await isElementVisible(enterEstimatedValuation())){
    await enterEstimatedValuation().scrollIntoViewIfNeeded();
  await fill(enterEstimatedValuation(), estimatedValuation.toString().replace(/[$,]/g, ''));
  }
}

// This fucntion is used in GPA DWB spec
export async function enterValuationDetails(page: Page, testInfo: TestInfo,
   valuationData: any, ruleMatrix: any, blockingContext:string,testcaseID:any
): Promise<ValidationResult>{
  try{
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await fill(getYearBuilt(), valuationData["YearBuilt"].toString());
  await selectByText(getConstructionType(), valuationData["ConstructionType"]);
  await selectNumOfStories(valuationData["NumberOfStories"].toString());
  await enterLivingSquare().scrollIntoViewIfNeeded();
  await fill(enterLivingSquare(), valuationData["Finished_Living_Area"].toString().replace(/,/g, ""));
  await selectTownRowOption(valuationData["Town_Or_Row"]);
  
  await selectFoundationType().scrollIntoViewIfNeeded();
  await selectByText(selectFoundationType(), valuationData["Foundation_Type"]);
  await selectByText(selectRoofCovering(), valuationData["Roof Covering"]);
  await selectRoofStyle().scrollIntoViewIfNeeded();
  await selectByText(selectRoofStyle(), valuationData["Roof_Style"]);
  await fill(enterYearOfRoof(), valuationData["Year_Roof_Replaced "].toString());
  await selectPrimaryHeating().scrollIntoViewIfNeeded();
  await selectByText(selectPrimaryHeating(),valuationData["Primary_Heating"]);
  if (valuationData["Primary_Heating"] === "Oil" || valuationData["Primary_Heating"] === "Propane")
    await slectStorageTankLocation().selectOption({index: 1});
  if(await isElementVisible(getDescribeOtherForPrimaryHeating())){
    await fill(getDescribeOtherForPrimaryHeating(), "Solar Power");
  }
  await enterEstimatedValuation().scrollIntoViewIfNeeded();
  await fill(enterEstimatedValuation(), valuationData["Estimated_Valuation"].toString().replace(/[$,]/g, ''));
  await selectDropdown(page,"Fuel_Storage_Tank_Location",valuationData["Fuel_Storage_Tank_Location"]);
  await captureAndAttach(page, testInfo, 'Enter details in valuation page');
 
  await getNextButton().scrollIntoViewIfNeeded();
  await getNextButton().click({ force: true });

  const HeaderPageContent = () =>
  getLocator(
    "((//h2[@class='gw-page-section-title gw-as-page-title ng-binding'])[1] | (//div[@class='gw-page-section-title__left ng-binding'])[2])[1]"
  );
 
  // Guard for generic validation: only validate this page if we are still on Valuation Page
    let textContent = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      console.log(`Checking page content for validation (attempt ${attempt + 1}/3)...`);
      textContent = (await HeaderPageContent().textContent())?.trim() || "";
      console.log("Current page header content:", textContent);
      if (!textContent.includes('Valuation')) {
        break;
      }
      await wait(2000);
    }
  
    if (textContent && !textContent.includes('Valuation')) {
      console.log(`✅ Navigated to next page (${textContent}). Skipping Valuation Page validation.`);
      return {
        success: true,
        errorType: 'none',
        message: 'Navigated to next page - Valuation Page validation skipped',
        shouldStop: false,
        status: 'PASS',
        validationErrors: [],
        uwMessages: [],
      };
    }
  

  console.log("🔍 Performing rule-based validation for Valuation Details...");
  const validationResult = await validateRulesForTestCase(
    testcaseID,
    blockingContext,
    ruleMatrix,
    page,
    testInfo
  );
        
  console.log("Valuation Details validation result:", validationResult);
await wait(5000);
await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  if (textContent && textContent.includes('Valuation')) {
    if(await isElementVisible(getNextButton())){
      await getNextButton().scrollIntoViewIfNeeded();
      await getNextButton().click({ force: true });
    }
  }
  return validationResult;
} catch (error) {
      console.error("Operation failed:", error);
      throw error;

    }
}
async function selectNumOfStories(NumOfStories: any){
  if(NumOfStories === "Bi-Level"){
    await getNoOfStories().selectOption({index: 8});
  } else if(NumOfStories === "Tri-Level"){
    await getNoOfStories().selectOption({index: 7});
  }else {
    await selectByText(getNoOfStories(), NumOfStories.toString());
  }
}

// Collapses all whitespace and trims (e.g., "Please   Select\nConcrete" -> "Please Select Concrete")
const normalize = (s: string | null | undefined): string =>
  (s ?? "").replace(/\s+/g, " ").trim();

// Reads visible text safely from any locator (works for <span>, <div>, etc.)
const readText = async (locator: Locator): Promise<string> => {
  const text = await locator.textContent(); // safer than innerText for hidden/shadowy nodes
  return normalize(text);
};

// Reads the value from an <input> or <textarea>
const readInputValue = async (locator: Locator): Promise<string> => {
  const v = await locator.inputValue();
  return normalize(v);
};

// Reads the selected option text for a native <select> element
const readSelectedOptionText = async (selectLocator: Locator): Promise<string> => {
  const option = selectLocator.locator('option:checked');
  const text = await option.textContent();
  return normalize(text);
};

// If the control is a custom dropdown (div-based), pass the locator that renders the selected value
const readCustomDropdownSelectedText = async (valueLocator: Locator): Promise<string> => {
  const text = await valueLocator.textContent();
  return normalize(text);
};

// // Click the first visible element that matches the given exact text within the provided frame/page.
// async function clickFirstVisibleByText(frameOrPage: Page | Frame, text: string) {
//   const locator = frameOrPage.locator(`text="${text}"`);
//   const count = await locator.count();
//   if (count === 0) return;
//   for (let i = 0; i < count; i++) {
//     const el = locator.nth(i);
//     try {
//       if (await el.isVisible()) {
//         await el.click({ force: true });
//         return;
//       }
//     } catch (e) {
//       // ignore and try next
//     }
//   }
//   // fallback: try clicking the first one with force
//   await locator.first().click({ force: true });
// }

export async function assertAllTexts(page: Page, valuationDWS: Record<string, any>): Promise<string> {
  const mismatches: string[] = [];

  const compare = (uiValue: string, expected: any, fieldName: string) => {
    const ui = normalize(uiValue);
    const exp = normalize(expected?.toString());
    if (ui !== exp) {
      mismatches.push(`${fieldName}: MSB="${ui}", Expected="${exp}"`);
    }
  };

  // --- Year Built (prefer input value first, fall back to text) ---
  // Adjust these locators to your real DOM:
  const yearBuiltInput = page.locator('gw-pl-input-ctrl[label="Year Built"] input').first();
  const yearBuiltSpan  = page.locator('//div//gw-pl-input-ctrl[@label="Year Built"]//div//div//span').first();

  let yearBuilt = '';
  if (await yearBuiltInput.count() > 0) {
    yearBuilt = await readInputValue(yearBuiltInput);
  } else if (await yearBuiltSpan.count() > 0) {
    yearBuilt = await readText(yearBuiltSpan);
  }
  console.log(`Year Built from UI: "${yearBuilt}"`);
  compare(yearBuilt, valuationDWS["YearBuilt"], "Year Built");

  // --- Construction Type (native select or custom control) ---
  const constructionSelect = page.locator('//div//gw-pl-input-ctrl[@model="view.construction.constructionType"]//select'); // example
  let constructionType = '';
  if (await constructionSelect.count() > 0) {
    constructionType = await readSelectedOptionText(constructionSelect);
  } else {
    // Custom control visible value element (update the locator to match your UI)
    const constructionValue = page.locator('//div//gw-pl-input-ctrl[@model="view.construction.constructionType"]//div//div//span');
    constructionType = await readCustomDropdownSelectedText(constructionValue);
  }
  console.log(`Construction Type from UI: "${constructionType}"`);
  compare(constructionType, valuationDWS["ConstructionType"] || valuationDWS["Construction_Type"], "Construction Type");

  //--- Number of Stories (you referenced nth(1). Prefer explicit select locator) ---
  const storiesSelect = page.locator('//select[@gw-pl-select="view.construction.storiesNumber.value"]').first();
  let stories = '';
  if (await storiesSelect.count() > 0) {
    stories = await readSelectedOptionText(storiesSelect);
  } else {
    // If this is a custom dropdown:
    const storiesValue = page.locator('//select[@gw-pl-select="view.construction.storiesNumber.value"]').first();
    stories = await readCustomDropdownSelectedText(storiesValue);
  }
  compare(stories, valuationDWS["NumberOfStories"] || valuationDWS["Number_of_Stories"], "Number of Stories");

  // --- Finished Living Area ---
  const flaInput = page.locator('//div//gw-pl-input-ctrl[@label="Finished Living Area (Sq Ft)"]//input').first();
  const flaSpan  = page.locator('//div//gw-pl-input-ctrl[@label="Finished Living Area (Sq Ft)"]//div//div//span').first();
  let fla = '';
  if (await flaInput.count() > 0) {
    fla = await readInputValue(flaInput);
  } else if (await flaSpan.count() > 0) {
    fla = await readText(flaSpan);
  }
  compare(fla, valuationDWS["Finished_Living_Area"], "Finished Living Area");

  // --- Foundation Type ---
  const foundationSelect = page.locator('//div[@model="view.construction.foundationType"]//select').first();
  let foundationType = '';
  if (await foundationSelect.count() > 0) {
    foundationType = await readSelectedOptionText(foundationSelect);
  } else {
    const foundationValue = page.locator('//div[@model="view.construction.foundationType"]//div//div//span').first();
    foundationType = await readCustomDropdownSelectedText(foundationValue);
  }
  compare(foundationType, valuationDWS["Foundation_Type"], "Foundation Type");

  // --- Roof Covering ---
  const roofCoverSelect = page.locator('//div[@label="Roof Covering"]//select').first();
  let roofCover = '';
  if (await roofCoverSelect.count() > 0) {
    roofCover = await readSelectedOptionText(roofCoverSelect);
  } else {
    const roofCoverValue = page.locator('//div[@label="Roof Covering"]//div//div//span').first();
    roofCover = await readCustomDropdownSelectedText(roofCoverValue);
  }
  compare(roofCover, valuationDWS["Roof Covering"] || valuationDWS["Roof_Covering"], "Roof Covering");

  // --- Roof Style ---
  const roofStyleSelect = page.locator('//div[@model="view.construction.roofStyle"]//select').first();
  let roofStyle = '';
  if (await roofStyleSelect.count() > 0) {
    roofStyle = await readSelectedOptionText(roofStyleSelect);
  } else {
    const roofStyleValue = page.locator('//div[@model="view.construction.roofStyle"]//div//div//span').first();
    roofStyle = await readCustomDropdownSelectedText(roofStyleValue);
  }
  compare(roofStyle, valuationDWS["Roof_Style"] || valuationDWS["Roof_Slope/Style"], "Roof Style");

  // --- Year Roof Replaced (fix the key name) ---
  const yrrInput = page.locator('//gw-pl-input-ctrl[@label="Year Roof Replaced"]//input').first();
  const yrrSpan  = page.locator('//gw-pl-input-ctrl[@label="Year Roof Replaced"]//div//div//input').first();
  let yrr = '';
  if (await yrrInput.count() > 0) yrr = await readInputValue(yrrInput);
  else if (await yrrSpan.count() > 0) yrr = await readText(yrrSpan);

  const expectedYrr = valuationDWS["Year_Roof_Replaced"] ?? valuationDWS["Year_Roof_Replaced "]; // tolerate the trailing-space key once
  compare(yrr, expectedYrr, "Year_Roof_Replaced");

  // --- Primary Heating ---
  const primaryHeatSelect = page.locator('//div[@label="Primary Heating"]//select').first();
  let primaryHeating = '';
  if (await primaryHeatSelect.count() > 0) {
    primaryHeating = await readSelectedOptionText(primaryHeatSelect);
  } else {
    const primaryHeatValue = page.locator('//div[@label="Primary Heating"]//div//div//span').first();
    primaryHeating = await readCustomDropdownSelectedText(primaryHeatValue);
  }
  compare(primaryHeating, valuationDWS["Primary_Heating"], "Primary Heating");

  return mismatches.length > 0 ? mismatches.join("; ") : "";
}


async function assertAllTextsValuationMH(page: Page, valuationMH: any): Promise<string> {
  const mismatches: string[] = [];

  const compare = (uiValue: string | null, expected: any, fieldName: string) => {
    const ui = uiValue?.trim() ?? '';
    const exp = expected?.toString().trim() ?? '';
    if (ui !== exp) {
      mismatches.push(`${fieldName}: MSB="${ui}", Expected="${exp}"`);
    }
  };

  // --- Year Built (prefer input value first, fall back to text) ---
  // Adjust these locators to your real DOM:
  const yearBuiltInput = page.locator('gw-pl-input-ctrl[label="Year Built"] input').first();
  const yearBuiltSpan  = page.locator('//div//gw-pl-input-ctrl[@label="Year Built"]//div//div//span').first();

  let yearBuilt = '';
  if (await yearBuiltInput.count() > 0) {
    yearBuilt = await readInputValue(yearBuiltInput);
  } else if (await yearBuiltSpan.count() > 0) {
    yearBuilt = await readText(yearBuiltSpan);
  }
  console.log(`Year Built from UI: "${yearBuilt}"`);
  compare(yearBuilt, valuationMH["YearBuilt"], "Year Built");

// --- Model Year ---
  const modelYearInput = page.locator('//div//input[@ng-model="view.construction.modelYear.value"]').first();
  const modelYearSpan  = page.locator('//div//gw-pl-input-ctrl[@label="Model Year"]//div//div//span').first();
  let modelYear = '';
  if (await modelYearInput.count() > 0) {
    modelYear = await readInputValue(modelYearInput);
  } else if (await modelYearSpan.count() > 0) {
    modelYear = await readText(modelYearSpan);
  }
  compare(modelYear, valuationMH["Model_Year"], "Model Year");

  const flaInput = page.locator('//div//gw-pl-input-ctrl[@label="Finished Living Area (Sq Ft)"]//input').first();
  const flaSpan  = page.locator('//div//gw-pl-input-ctrl[@label="Finished Living Area (Sq Ft)"]//div//div//span').first();
  let fla = '';
  if (await flaInput.count() > 0) {
    fla = await readInputValue(flaInput);
  } else if (await flaSpan.count() > 0) {
    fla = await readText(flaSpan);
  }
  compare(fla, valuationMH["Finished_Living_Area"], "Finished Living Area");

  
  // --- Year Roof Replaced (fix the key name) ---
  const yrrInput = page.locator('//gw-pl-input-ctrl[@label="Year Roof Replaced"]//input').first();
  const yrrSpan  = page.locator('//gw-pl-input-ctrl[@label="Year Roof Replaced"]//div//div//input').first();
  let yrr = '';
  if (await yrrInput.count() > 0) yrr = await readInputValue(yrrInput);
  else if (await yrrSpan.count() > 0) yrr = await readText(yrrSpan);

  const expectedYrr = valuationMH["Year_Roof_Replaced"] ?? valuationMH["Year_Roof_Replaced "]; // tolerate the trailing-space key once
  compare(yrr, expectedYrr, "Year_Roof_Replaced");

  return mismatches.length > 0 ? mismatches.join("; ") : "";
}


export async function enterHO_ValuationDetails(page: Page, testInfo: TestInfo,
  valuationDWS: any, ruleMatrix: any, blockingContext: string,testcaseID: any
): Promise<{ validationResult: ValidationResult; mismatchSummary: string }> {
  try{
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  const getQuestion = createAutoQuestionFetcher(page);
  if (await isElementVisible(getYearBuilt())){
  await fill(getYearBuilt(), valuationDWS["YearBuilt"].toString());
  //await fill(getModelYear(), valuationDWS["Model_Year"].toString());
  await selectByText(getConstructionType(), valuationDWS["Construction_Type"]);
  await selectByText(getNoOfStories(), valuationDWS["Number_of_Stories"].toString());
  await fill(enterLivingSquare(), valuationDWS["Finished_Living_Area"].toString().replace(/,/g, ""));
  if( await getContinue().isVisible()){
  await getContinue().click({ force: true });
  }
  }
  await selectTownRowOption(valuationDWS["Townhome_or_Row_Home"]);
  await page.waitForLoadState();
  await selectNumOfStories(valuationDWS["Number_of_Stories"]);
  await selectFoundationTypeHO(valuationDWS["Foundation_Type"]);
  await enterRoofCoveringHO(valuationDWS["Roof Covering"] || valuationDWS["Roof_Covering"]);
  await enterRoofStyleHO(valuationDWS["Roof_Slope/Style"]);
  await selectPrimaryHeatingHO(valuationDWS["Primary_Heating"]);
  await fill(enterYearOfRoof(), valuationDWS["Year_Roof_Replaced"].toString());
  // await fill(getheatingSystems(), valuationDWS["HeatingSystemUpdateYear"].toString());
  // await fill(getPlumbingSystems(), valuationDWS["PlumbingSystemUpdateYear"].toString());
  // await fill(getElectricalSystems(), valuationDWS["ElectricalSystemUpdateYear"].toString());

  const getHeatingSystemUpdateYear = await getQuestion("HeatingSystemUpdateYear");
  if (getHeatingSystemUpdateYear) {
    await fill(getHeatingSystemUpdateYear, valuationDWS["HeatingSystemUpdateYear"].toString());
  }
  const getPlumbingSystemUpdateYear = await getQuestion("PlumbingSystemUpdateYear");
  if (getPlumbingSystemUpdateYear) {
    await fill(getPlumbingSystemUpdateYear, valuationDWS["PlumbingSystemUpdateYear"].toString());
  }
  const getElectricalSystemUpdateYear = await getQuestion("ElectricalSystemUpdateYear");
  if (getElectricalSystemUpdateYear) {
    await fill(getElectricalSystemUpdateYear, valuationDWS["ElectricalSystemUpdateYear"].toString());
  }
  // if (await isElementVisible(getFuelStorageTankLocation())) {
  //   await getFuelStorageTankLocation().selectOption({ index: 1 });
  // }
  await enterEstimationValuationHO(valuationDWS["Estimated_Valuation"]);
  await captureAndAttach(page, testInfo, 'Enter details in valuation page before MSB');
  if (await isElementVisible(getViewMSBbutton())) {
  await getViewMSBbutton().click({ force: true });

  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  // await FillMSBValuesinPopUp(page, valuationDWS, testInfo);
  const MSBPage = await page.waitForEvent("popup");

  try {
    // const MSBPage = await page.waitForEvent("popup");
    await MSBPage.waitForLoadState();
    await wait(TIMEOUT_4_SECONDS);
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window before update');
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
    await MSBPage.fill(getMSBYearBuilt, valuationDWS["YearBuilt"].toString());
    console.log('MSB Year Built filled with:', valuationDWS["YearBuilt"].toString());

    //filling finished living area
    await MSBPage.fill(getFinishedLivingArea_MSB, valuationDWS["Finished_Living_Area"].toString());
    await MSBPage.click(getFoundationTypeMSB());
    const formattedFoundationType = getFoundationType_MSB(valuationDWS["Foundation_Type"]);
    await MSBPage.getByRole("option", { name: formattedFoundationType, exact: true }).click();
    // await MSBPage.click(`text="${formattedFoundationType}"`);
    await MSBPage.locator(`text="${formattedFoundationType}"`).last().click({ force: true });
    // await MSBPage.click(getFoundationTypeMSB());

    //selecting number of stories
    await MSBPage.click(getNumberOfStoriesMSB());
    const formattedNumOfStories = getNumberofStoriesMSB(valuationDWS["Number_of_Stories"]);
    await MSBPage.getByRole("option", { name: formattedNumOfStories, exact: true }).click({ force: true });
    await MSBPage.click(`text="${formattedNumOfStories}"`);

    //clicking save 
    await MSBPage.getByRole("button", { name: "Save" }).scrollIntoViewIfNeeded();
    await MSBPage.click(getSaveButton, { force: true });
    await MSBPage.click(getSaveButton, { force: true });
    await wait(TIMEOUT_4_SECONDS);

    if( await isElementVisible(getMSBAlertCloseButton)){
      await MSBPage.click(getMSBAlertCloseButton);
    }
    //Roof Covering
    await MSBPage.click(getRoofCoveringDropDownButton);
    await MSBPage.evaluate(() => { document.body.style.zoom = "85%"; });
    await MSBPage.click(getMoreButton);
    const getRoofCover = getRoofCoveringMSB(valuationDWS["Roof_Covering"]);
    console.log(`Mapped Roof Cover: ${valuationDWS["Roof_Covering"]} → ${getRoofCover}`);

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

    const getRoofStyle = getRoofStyleMSB(valuationDWS["Roof_Slope/Style"]);
    console.log(`Mapped Roof Style: ${valuationDWS["Roof_Slope/Style"]} → ${getRoofStyle}`);

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
    const getMSBConstructionType = getConstructionType_MSB(valuationDWS["Construction_Type"]);
    console.log(`Mapped Construction Type: ${valuationDWS["Construction_Type"]} → ${getMSBConstructionType}`);

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
    const getPrimaryHeating = getPrimaryHeating_MSB(valuationDWS["Primary_Heating"]);
    console.log(`Mapped Primary Heating: ${valuationDWS["Primary_Heating"]} → ${getPrimaryHeating}`);

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
    // await MSBPage.click(getMSBAlertCloseButton);
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window after update');
    await wait(SMALL_TIMEOUT);
    await MSBPage.click(getCalculateButton);
    await wait(2000);
    await MSBPage.click(getFinishButton);
    await wait(2000);
    await MSBPage.click(getSaveButton_MSB);
  } catch (error) {
    console.error("Error occurred during MSB page interaction:", error);
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window on error');
  } 
  finally {
    if (!MSBPage.isClosed()) {
      await MSBPage.close();
      console.log("MSB popup closed in finally block.");
    }
  }
}
//  if (await isElementVisible(getViewMSBbutton())) {
//   console.log("🔍 MSB button is visible, attempting to open popup...");
  
//   let MSBPage = null;
//   let popupOpened = false;
//   const maxPopupAttempts = 5;
  
//   // ✅ Keep clicking MSB button until popup opens
//   for (let popupAttempt = 1; popupAttempt <= maxPopupAttempts; popupAttempt++) {
//     console.log(`🔄 Attempt ${popupAttempt}/${maxPopupAttempts}: Clicking Go To MSB button...`);
    
//     try {
//       // Set up popup listener before clicking
//       const popupPromise = page.waitForEvent("popup", { timeout: 10000 });
      
//       // Click the MSB button
//       await getViewMSBbutton().click({ force: true });
//       console.log(`📝 MSB button clicked on attempt ${popupAttempt}`);
      
//       // Wait for popup to open
//       MSBPage = await popupPromise;
      
//       if (MSBPage && !MSBPage.isClosed()) {
//         console.log(`✅ MSB popup opened successfully on attempt ${popupAttempt}`);
//         popupOpened = true;
//         break;
//       }
      
//     } catch (popupError) {
//       console.log(`⚠️ Popup not opened on attempt ${popupAttempt}: ${popupError}`);
      
//       if (popupAttempt < maxPopupAttempts) {
//         console.log(`⏳ Waiting 3 seconds before retry...`);
//         await wait(3000);
        
//         // Check if button is still visible before next attempt
//         if (!(await isElementVisible(getViewMSBbutton()))) {
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
//       await wait(5000);
//       await MSBPage.bringToFront();
//       console.log("📋 MSB popup brought to front");
      
//       // ✅ Wait for Finish button to be available in popup
//       let finishButtonVisible = false;
//       for (let finishAttempt = 0; finishAttempt < 5; finishAttempt++) {
//         try {
//           await MSBPage.waitForLoadState("load", { timeout: 5000 });
//           await wait(2000);
          //  await captureAndAttach(MSBPage, testInfo, 'MSB popup window');
//           await MSBPage.click(getPrimaryHeating_MSB_DropDown);
//           // await MSBPage.click(getMoreforPrimaryHeating);
//           const primaryHeatingSelected_Option = await MSBPage.locator(getPrimaryHeatingSelectedOPtioninMSB).textContent();
//           console.log(`Currently selected Primary Heating in MSB: ${primaryHeatingSelected_Option}`);
//           if (primaryHeatingSelected_Option === "Heat/Central Air Conditioning, Avg Cost") {
//           const getPrimaryHeating = getPrimaryHeating_MSB("Electric");
//           console.log(`Mapped Primary Heating: Heat/Central Air Conditioning, Avg Cost → ${getPrimaryHeating}`);

//           let found3 = false;
//           for (let i = 0; i < 20; i++) {
//             const cell = MSBPage.getByText(getPrimaryHeating, { exact: true });
//             if (await isElementVisible(cell)) {
//         await cell.click({ force: true });
//         found3 = true;
//         break;
//       }
//       await MSBPage.keyboard.press('ArrowDown');
//       await wait(1000);
//     }
  
// await captureAndAttach(MSBPage, testInfo, 'MSB popup window after updating primary heating');
//     await wait(SMALL_TIMEOUT);
//     await MSBPage.click(getCalculateButton);
//   }
//   else {
//     console.log("Primary Heating already set correctly in MSB, no change needed.");
//     await MSBPage.click(getPrimaryHeating_MSB_DropDown);
//   }
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
//         // await captureAndAttach(page, testInfo, 'MSB screen');
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

if(await isElementVisible(getRetriveFromMSB_Button())){
await getRetriveFromMSB_Button().click({ force: true });
await wait(5000);
}

const mismatchSummary = await assertAllTexts(page, valuationDWS);
  
// if(await getFoundationTypeErrorMsg().isVisible()){
//   await selectByText(selectFoundationType(), valuationDWS["Foundation_Type"]);
// }
await selectDropdown(page,"Fuel_Storage_Tank_Location",valuationDWS["Fuel_Storage_Tank_Location"]);
await captureAndAttach(page, testInfo, 'Enter details in valuation page after clicking on Retrive from MSB');
await getNextButton().scrollIntoViewIfNeeded();
  await getNextButton().click({ force: true });

  await page.waitForLoadState();
//   const textContent = await HeaderPageContent().textContent();
// if (textContent && textContent.includes('Valuation')) {
//   if(await isElementVisible(getErrorinValuationPage())){
//   await warningsWordingValidation(ruleMatrix, page, testInfo);

//   // Check for validation errors
//   blockingContext === "Valuation";
//   const errorValidationPassed = await errorWordingValidation(ruleMatrix, page, testInfo, blockingContext);
//   if (!errorValidationPassed) {
//     console.log("❌ Error wording validation failed. Stopping test.");
//     return mismatchSummary || "Validation Error Failed";
//   }
  const textContent = await HeaderPageContent().textContent();
// if (textContent && textContent.includes('Valuation')) {
//   if(await isElementVisible(getErrorinValuationPage())){
//     if (await isElementVisible(getNextButton())) {
//       await getNextButton().click({ timeout: 4000 });
//       await wait(TIMEOUT_4_SECONDS);
//     }
//   }
// }
//     await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
//   await wait(3000);
//   if (textContent && textContent.includes('Valuation')) {
  
//     if (await isElementVisible(getNextButton())) {
//       await getNextButton().click({ timeout: 4000 });
//       await wait(TIMEOUT_4_SECONDS);
//     }
// }
//   return mismatchSummary;
//   }
// }
// }
console.log("🔍 Performing rule-based validation for Valuation Details...");
  const validationResult = await validateRulesForTestCase(
    testcaseID,
    blockingContext,
    ruleMatrix,
    page,
    testInfo
  );
        
  console.log("Valuation Details validation result:", validationResult);
   if (textContent && textContent.includes('Valuation')) {
  
    if (await isElementVisible(getNextButton())) {
      await getNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
}
  return {validationResult,mismatchSummary};
} catch (error) {
      console.error("Operation failed:", error);
      throw error;

    }
}
// This function is used in DWS Spec
export async function  enterDWSValuationDetails(page: Page, testInfo: TestInfo,
  valuationDWS: any, ruleMatrix: any, blockingContext: string,testcaseID: any
): Promise<{ validationResult: ValidationResult; mismatchSummary: string }> {
  try{
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  if (await isElementVisible(getYearBuilt())){
  await fill(getYearBuilt(), valuationDWS["YearBuilt"].toString());
  //await fill(getModelYear(), valuationDWS["Model_Year"].toString());
  await selectByText(getConstructionType(), valuationDWS["ConstructionType"]);
  await selectByText(getNoOfStories(), valuationDWS["NumberOfStories"].toString());
  await fill(enterLivingSquare(), valuationDWS["Finished_Living_Area"].toString().replace(/,/g, ""));
  if( await getContinue().isVisible()){
  await getContinue().click({ force: true });
  }
  }
  await selectTownRowOption(valuationDWS["Town_Or_Row"]);
  await page.waitForLoadState();
  await selectNumOfStories(valuationDWS["NumberOfStories"]);
  await selectFoundationTypeHO(valuationDWS["Foundation_Type"]);
  await enterRoofCoveringHO(valuationDWS["Roof Covering"] || valuationDWS["Roof_Covering"]);
  await enterRoofStyleHO(valuationDWS["Roof_Style"]);
  await selectPrimaryHeatingHO(valuationDWS["Primary_Heating"]);
  await fill(enterYearOfRoof(), valuationDWS["Year_Roof_Replaced "].toString());
  if (await isElementVisible(getFuelStorageTankLocation())) {
    await getFuelStorageTankLocation().selectOption({ index: 1 });
  }
  await enterEstimationValuationHO(valuationDWS["Estimated_Valuation"]);
  await captureAndAttach(page, testInfo, 'Enter details in valuation page before MSB');
  if (await isElementVisible(getViewMSBbutton())) {
  await getViewMSBbutton().click({ force: true });

  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  const MSBPage = await page.waitForEvent("popup");

  try {
    // const MSBPage = await page.waitForEvent("popup");
    await MSBPage.waitForLoadState();
    await wait(TIMEOUT_4_SECONDS);
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window before update');
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
    await MSBPage.fill(getMSBYearBuilt, valuationDWS["YearBuilt"].toString());
    console.log('MSB Year Built filled with:', valuationDWS["YearBuilt"].toString());

    //filling finished living area
    await MSBPage.fill(getFinishedLivingArea_MSB, valuationDWS["Finished_Living_Area"].toString());
    await MSBPage.click(getFoundationTypeMSB());
    const formattedFoundationType = getFoundationType_MSB(valuationDWS["Foundation_Type"]);
    await MSBPage.getByRole("option", { name: formattedFoundationType, exact: true }).click();
    // await MSBPage.click(`text="${formattedFoundationType}"`);
    await MSBPage.locator(`text="${formattedFoundationType}"`).last().click({ force: true });
    // await MSBPage.click(getFoundationTypeMSB());

    //selecting number of stories
    await MSBPage.click(getNumberOfStoriesMSB());
    const formattedNumOfStories = getNumberofStoriesMSB(valuationDWS["NumberOfStories"]);
    await MSBPage.getByRole("option", { name: formattedNumOfStories, exact: true }).click({ force: true });
    await MSBPage.click(`text="${formattedNumOfStories}"`);

    //clicking save 
    await MSBPage.getByRole("button", { name: "Save" }).scrollIntoViewIfNeeded();
    await MSBPage.click(getSaveButton, { force: true });
    await MSBPage.click(getSaveButton, { force: true });
    await wait(TIMEOUT_4_SECONDS);

    if( await isElementVisible(getMSBAlertCloseButton)){
      await MSBPage.click(getMSBAlertCloseButton);
    }
    //Roof Covering
    await MSBPage.click(getRoofCoveringDropDownButton);
    await MSBPage.evaluate(() => { document.body.style.zoom = "85%"; });
    await MSBPage.click(getMoreButton);
    const getRoofCover = getRoofCoveringMSB(valuationDWS["Roof Covering"]);
    console.log(`Mapped Roof Cover: ${valuationDWS["Roof Covering"]} → ${getRoofCover}`);

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

    const getRoofStyle = getRoofStyleMSB(valuationDWS["Roof_Style"]);
    console.log(`Mapped Roof Style: ${valuationDWS["Roof_Style"]} → ${getRoofStyle}`);

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
    const getMSBConstructionType = getConstructionType_MSB(valuationDWS["ConstructionType"]);
    console.log(`Mapped Construction Type: ${valuationDWS["ConstructionType"]} → ${getMSBConstructionType}`);

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
    const getPrimaryHeating = getPrimaryHeating_MSB(valuationDWS["Primary_Heating"]);
    console.log(`Mapped Primary Heating: ${valuationDWS["Primary_Heating"]} → ${getPrimaryHeating}`);

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
    // await MSBPage.click(getMSBAlertCloseButton);
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window after update');
    await wait(SMALL_TIMEOUT);
    await MSBPage.click(getCalculateButton);
    await wait(2000);
    await MSBPage.click(getFinishButton);
    await wait(2000);
    await MSBPage.click(getSaveButton_MSB);
  } catch (error) {
    console.error("Error occurred during MSB page interaction:", error);
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window on error');
  } 
  finally {
    if (!MSBPage.isClosed()) {
      await MSBPage.close();
      console.log("MSB popup closed in finally block.");
    }
  }
}
//  if (await isElementVisible(getViewMSBbutton())) {
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
//       await getViewMSBbutton().click({ force: true });
//       console.log(`📝 MSB button clicked on attempt ${popupAttempt}`);
      
//       // Wait for popup to open
//       MSBPage = await popupPromise;
      
//       if (MSBPage && !MSBPage.isClosed()) {
//         console.log(`✅ MSB popup opened successfully on attempt ${popupAttempt}`);
//         popupOpened = true;
//         break;
//       }
      
//     } catch (popupError) {
//       console.log(`⚠️ Popup not opened on attempt ${popupAttempt}: ${popupError}`);
      
//       if (popupAttempt < maxPopupAttempts) {
//         console.log(`⏳ Waiting 3 seconds before retry...`);
//         await wait(3000);
        
//         // Check if button is still visible before next attempt
//         if (!(await isElementVisible(getViewMSBbutton()))) {
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
//       await wait(5000);
//       await MSBPage.bringToFront();
//       console.log("📋 MSB popup brought to front");
      
//       // ✅ Wait for Finish button to be available in popup
//       let finishButtonVisible = false;
//       for (let finishAttempt = 0; finishAttempt < 5; finishAttempt++) {
//         try {
//           await MSBPage.waitForLoadState("load", { timeout: 5000 });
//           await wait(2000);
//            await captureAndAttach(MSBPage, testInfo, 'MSB popup window');
//           await MSBPage.click(getPrimaryHeating_MSB_DropDown);
//           // await MSBPage.click(getMoreforPrimaryHeating);
//           const primaryHeatingSelected_Option = await MSBPage.locator(getPrimaryHeatingSelectedOPtioninMSB).textContent();
//           console.log(`Currently selected Primary Heating in MSB: ${primaryHeatingSelected_Option}`);
//           if (primaryHeatingSelected_Option === "Heat/Central Air Conditioning, Avg Cost") {
//           const getPrimaryHeating = getPrimaryHeating_MSB("Electric");
//           console.log(`Mapped Primary Heating: Heat/Central Air Conditioning, Avg Cost → ${getPrimaryHeating}`);

//           let found3 = false;
//           for (let i = 0; i < 20; i++) {
//             const cell = MSBPage.getByText(getPrimaryHeating, { exact: true });
//             if (await isElementVisible(cell)) {
//         await cell.click({ force: true });
//         found3 = true;
//         break;
//       }
//       await MSBPage.keyboard.press('ArrowDown');
//       await wait(1000);
//     }
  
// await captureAndAttach(MSBPage, testInfo, 'MSB popup window after updating primary heating');
//     await wait(SMALL_TIMEOUT);
//     await MSBPage.click(getCalculateButton);
//   }
//   else {
//     console.log("Primary Heating already set correctly in MSB, no change needed.");
//     await MSBPage.click(getPrimaryHeating_MSB_DropDown);
//   }
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
//         // await captureAndAttach(page, testInfo, 'MSB screen');
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

if(await isElementVisible(getRetriveFromMSB_Button())){
await getRetriveFromMSB_Button().click({ force: true });
await wait(5000);
}

const mismatchSummary = await assertAllTexts(page, valuationDWS);
  
// if(await getFoundationTypeErrorMsg().isVisible()){
//   await selectByText(selectFoundationType(), valuationDWS["Foundation_Type"]);
// }
  await selectDropdown(page,"Fuel_Storage_Tank_Location",valuationDWS["Fuel_Storage_Tank_Location"]);
await captureAndAttach(page, testInfo, 'Enter details in valuation page after clicking on Retrive from MSB');
await getNextButton().scrollIntoViewIfNeeded();
  await getNextButton().click({ force: true });

  await page.waitForLoadState();
//   const textContent = await HeaderPageContent().textContent();
// if (textContent && textContent.includes('Valuation')) {
//   if(await isElementVisible(getErrorinValuationPage())){
//   await warningsWordingValidation(ruleMatrix, page, testInfo);

//   // Check for validation errors
//   blockingContext === "Valuation";
//   const errorValidationPassed = await errorWordingValidation(ruleMatrix, page, testInfo, blockingContext);
//   if (!errorValidationPassed) {
//     console.log("❌ Error wording validation failed. Stopping test.");
//     return mismatchSummary || "Validation Error Failed";
//   }
//   const textContent = await HeaderPageContent().textContent();
// if (textContent && textContent.includes('Valuation')) {
//   if(await isElementVisible(getErrorinValuationPage())){
//     if (await isElementVisible(getNextButton())) {
//       await getNextButton().click({ timeout: 4000 });
//       await wait(TIMEOUT_4_SECONDS);
//     }
//   }
// }
//     await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
//   await wait(3000);
//   if (textContent && textContent.includes('Valuation')) {
  
//     if (await isElementVisible(getNextButton())) {
//       await getNextButton().click({ timeout: 4000 });
//       await wait(TIMEOUT_4_SECONDS);
//     }
// }
//   return mismatchSummary;
//   }
// }
// }
console.log("🔍 Performing rule-based validation for Valuation Details...");
  const validationResult = await validateRulesForTestCase(
    testcaseID,
    blockingContext,
    ruleMatrix,
    page,
    testInfo
  );
  if (await isElementVisible(getNextButton())) {
      await getNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
  console.log("Valuation Details validation result:", validationResult);
  return {validationResult,mismatchSummary};
} catch (error) {
      console.error("Operation failed:", error);
      throw error;

    }
}
export async function selectMHStyle(style: string, page: Page) {
  console.log("Checking MH Style from Excel:", style);
  console.log(`Selecting MH style: ${style}`);
 
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // buffer for UI rendering
 
  if (style.trim().toLowerCase() === "single-wide") {
    const isSelected = await getSingleWideRadio().getAttribute('aria-checked');
 
    if(isSelected === 'true') {
      console.log("Single-Wide style is already selected.");
    }
   else {
    console.log("Single-wide is not selected. Currented selected option is different. Maybe Multi-wide");
  }
  }
  else if (style.trim().toLowerCase() === "multi-wide") {
    const isSelected = await getMultiWideRadio().getAttribute('aria-checked');
 
    if(isSelected === 'true') {
      console.log("Multi-Wide style is already selected.");
    }
   else {
    console.log("Selecting Multi-wide..");
    await getStyleMultiWide().click({ timeout: 10000, force: true });
    await expect(getMultiWideRadio()).toHaveAttribute('aria-checked', 'true', { timeout: 10000 });
    console.log("Multi-wide style selected successfully.");
  }
  } else {
    throw new Error(`Unknown MH style: ${style}. Expected 'Single-Wide' or 'Multi-Wide'.`);
  }
}
export async function enterMHValuationDetails(page: Page, testInfo: TestInfo,
  valuationMH: any,ruleMatrix: any,
  blockingContext: string,testcaseID: any
):Promise<{ validationResult: ValidationResult; mismatchSummary: string }> {
  try{
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await page.waitForLoadState();
  await wait(4000);
  if (await isElementVisible(getYearBuilt())){
  await wait(2000);  
  await fill(getYearBuilt(), valuationMH["YearBuilt"].toString());
  await fill(getModelYear(), valuationMH["Model_Year"].toString());
  await selectMHStyle(valuationMH["Style"], page);   
  await wait(2000);  
  await getLengthFeet().click({ force: true });
  await wait(2000); 
  await fill(getLengthFeet(), valuationMH["Length"].toString());
  await getWidthFeet().click({ force: true });
  await page.keyboard.type('66');
  await getWidthFeet().click({ force: true });
  await wait(2000); 
  await fill(getWidthFeet(), valuationMH["Width"].toString());
  await getWidthFeet().click({ force: true });
  //await page.keyboard.type('32');
  await wait(2000); 
  const livingSquareField =  getAttachStrucYes().first();
  await livingSquareField.evaluate(el => el.scrollIntoView({ behavior: 'auto', block: 'center' }));
  await selectAttachedStructureOption(valuationMH["Attached_Structure"]);
  }
  if( await getContinue().isVisible()){
  await getContinue().click({ force: true });
  }
  await page.waitForLoadState();
  await fill(enterYearOfRoof(), valuationMH["Year_Roof_Replaced"].toString());
  await selectModularHomeOption(valuationMH["Modular_Home"] || valuationMH["Unit_Modular_Home"], page);
  await selectUnitTiedOption(valuationMH["Unit_Tied_Down"], page);
  await enterEstimatedValuation().scrollIntoViewIfNeeded();
  await fill(enterEstimatedValuation(), valuationMH["Estimated_Valuation"].toString().replace(/[$,]/g, ''));
  await captureAndAttach(page, testInfo, 'Enter details in valuation page before clicking on Retrive from MSB');
  if (await isElementVisible(getViewMSBbutton())) {
  await getViewMSBbutton().click({ force: true });

  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  // await FillMSBValuesinPopUp(page, valuationDWS, testInfo);
  const MSBPage = await page.waitForEvent("popup");

  try {
    // const MSBPage = await page.waitForEvent("popup");
    await MSBPage.waitForLoadState();
    await wait(TIMEOUT_4_SECONDS);
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window before update');
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
    await MSBPage.fill(getMSBYearBuilt, valuationMH["YearBuilt"].toString());
    console.log('MSB Year Built filled with:', valuationMH["YearBuilt"].toString());

    //filling finished living area
    await MSBPage.fill(getFinishedLivingArea_MSB, valuationMH["Finished_Living_Area"].toString());
    

    //selecting Style
    await MSBPage.click(getNumberOfStoriesMSB());
    const formattedNumOfStories = getNumberofStoriesMSB(valuationMH["Style"]);
    await MSBPage.getByRole("option", { name: formattedNumOfStories, exact: true }).click({ force: true });
    // await MSBPage.click(`text="${formattedNumOfStories}"`);

    //clicking save 
    await MSBPage.getByRole("button", { name: "Save" }).scrollIntoViewIfNeeded();
    await MSBPage.click(getSaveButton, { force: true });
    await MSBPage.click(getSaveButton, { force: true });
    await wait(TIMEOUT_4_SECONDS);

    await wait(2000);
    console.log("MSB popup capturing Image Now.");
    if (await isElementVisible(getMSBAlertCloseButton)) {
      await MSBPage.click(getMSBAlertCloseButton);
    }
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window after update');
    await wait(SMALL_TIMEOUT);
    if( await isElementVisible(getCalculateButton)){
    await MSBPage.click(getCalculateButton);
    await wait(2000);
    }
    await MSBPage.click(getFinishButton);
    await wait(2000);
    await MSBPage.click(getSaveButton_MSB);
  } catch (error) {
    await captureAndAttach(MSBPage, testInfo, 'MSB popup window on error');
    console.error("Error occurred during MSB page interaction:", error);
  } 
  finally {
    if (!MSBPage.isClosed()) {
      await MSBPage.close();
      console.log("MSB popup closed in finally block.");
    }
  }
}
//   if (await isElementVisible(getViewMSBbutton())) {
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
//       await getViewMSBbutton().click({ force: true });
//       console.log(`📝 MSB button clicked on attempt ${popupAttempt}`);
      
//       // Wait for popup to open
//       MSBPage = await popupPromise;
      
//       if (MSBPage && !MSBPage.isClosed()) {
//         console.log(`✅ MSB popup opened successfully on attempt ${popupAttempt}`);
//         popupOpened = true;
//         break;
//       }
      
//     } catch (popupError) {
//       console.log(`⚠️ Popup not opened on attempt ${popupAttempt}: ${popupError}`);
      
//       if (popupAttempt < maxPopupAttempts) {
//         console.log(`⏳ Waiting 3 seconds before retry...`);
//         await wait(3000);
        
//         // Check if button is still visible before next attempt
//         if (!(await isElementVisible(getViewMSBbutton()))) {
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
//       await wait(5000);
//       await MSBPage.bringToFront();
//       console.log("📋 MSB popup brought to front");
      
//       // ✅ Wait for Finish button to be available in popup
//       let finishButtonVisible = false;
//       for (let finishAttempt = 0; finishAttempt < 5; finishAttempt++) {
//         try {
//           await MSBPage.waitForLoadState("load", { timeout: 5000 });
//           await wait(2000);
//            await captureAndAttach(MSBPage, testInfo, 'MSB popup window');

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
//         // await captureAndAttach(page, testInfo, 'MSB screen');
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


if(await isElementVisible(getRetriveFromMSB_Button())){
await getRetriveFromMSB_Button().click({ force: true });
await wait(5000);
}
await selectModularHomeOption(valuationMH["Modular_Home"] || valuationMH["Unit_Modular_Home"], page);

const mismatchSummary = await assertAllTextsValuationMH(page, valuationMH);
  
// if(await getFoundationTypeErrorMsg().isVisible()){
//   await selectByText(selectFoundationType(), valuationDWS["Foundation_Type"]);
// }

await captureAndAttach(page, testInfo, 'Enter details in valuation page after clicking on Retrive from MSB');
await getNextButton().scrollIntoViewIfNeeded();
  await getNextButton().click({ force: true });

  await page.waitForLoadState();
//   const textContent = await HeaderPageContent().textContent();
// if (textContent && textContent.includes('Discounts / Surcharges')) {
//   if(await isElementVisible(getErrorinValuationPage())){
//   await warningsWordingValidation(ruleMatrix, page, testInfo);

//   // Check for validation errors
//   blockingContext === "Valuation";
//   const errorValidationPassed = await errorWordingValidation(ruleMatrix, page, testInfo, blockingContext);
//   if (!errorValidationPassed) {
//     console.log("❌ Error wording validation failed. Stopping test.");
//     return mismatchSummary || "Validation Error Failed";
//   }
//     if (await isElementVisible(getNextButton())) {
//       await getNextButton().click({ timeout: 4000 });
//       await wait(TIMEOUT_4_SECONDS);
//     }
//     await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
//   await wait(3000);
//   return mismatchSummary;
//   }
// }
// }
console.log("🔍 Performing rule-based validation for Valuation Details...");
  const validationResult = await validateRulesForTestCase(
    testcaseID,
    blockingContext,
    ruleMatrix,
    page,
    testInfo
  );
   if (await isElementVisible(getNextButton())) {
      await getNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
        
  console.log("Valuation Details validation result:", validationResult);
  return {validationResult,mismatchSummary};
} catch (error) {
      console.error("Operation failed:", error);
      throw error;

    }
}