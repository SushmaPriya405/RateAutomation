import { expect, TestInfo, type Locator, type Page } from "@playwright/test";
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
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { getText, isElementVisible } from "../../utils/element-utils";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../utils/wordingValidation";
import { validateRulesForTestCase, ValidationResult } from "../../utils/coreRuleBasedValidation";
import { get } from "http";
import { selectDropdownWithRetry } from "./HO_Coverages_CorePage";
import { getFormsNextButton, getPageCountIndicator, getRoofBenefitSchedule } from "./DB_Coverages_CorePage";
 
const getPersonalLiabilityCheckBox = () => getLocator("//div[contains(text(), 'Personal Liability')]/parent::div//input[@role='checkbox']");
const getPremisesLiabilityCheckBox = () => getLocator("//div[contains(text(), 'Premises Liability')]/parent::div//input[@role='checkbox']");
const getPersonalLiabilityLimitDropDown = () => getLocator("//td[contains(@id, 'PersLiabLimit-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPremisesLiabilityLimitDropDown = () => getLocator("//td[contains(@id, 'PremLiabLimit-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getMedicalPaymentsLimitDropDown = () => getLocator("//td[contains(@id, 'PackageTermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getDwellingLimitInputBox = () => getLocator("//input[contains(@id, 'CovPatternInputGroup:DwellingLimit-inputEl')]");
const getDwellingSettlementOptionDropDown = () => getLocator("//input[contains(@id, 'DwellingSettlementOption-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getOtherPerilDeductibleDropDown = () => getLocator("//td[contains(@id, 'DwellingAllOtherPerilDeductible-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getWindHailDropDown = () => getLocator("//td[contains(@id, 'DwellingWindHailDeductible-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getOtherStructuresCheckBox = () => getLocator("//div[contains(text(), 'Other Structures')]/parent::div//input[@role='checkbox']");
const getOtherStructuresLimitInputBox = () => getLocator("//input[contains(@id, 'OtherStructuresLimit-inputEl')]");
const getAdditionalLivingExpenseLimitInputBox = () => getLocator("//input[contains(@id, 'AdditionalLivingExpensFairRentalValueLimit-inputEl')]");
const getWaterDamageCheckBox = () => getLocator("//div[contains(text(), 'Water Damage')]/parent::div//input[@role='checkbox']");
const getTheftLimitInputBox = () => getLocator("//input[contains(@id, 'TheftCoverageLimit-inputEl')]");
const getAdditionalLivingExpenseCheckBox = () => getLocator("//div[contains(text(), 'Additional Living Expense/Fair Rental Value')]/parent::div//input[@role='checkbox']");
const getTheftCheckBox = () => getLocator("//div[contains(text(), 'Theft')]/parent::div//input[@role='checkbox']");
const getOrdinanceOrLawCheckBox = () => getLocator("//div[contains(text(), 'Ordinance or Law')]/parent::div//input[@role='checkbox']");
const getServiceLineCheckBox = () => getLocator("//div[contains(text(), 'Service Line')]/parent::div//input[@role='checkbox']");
const getResidenceBurglaryCheckBox = () => getLocator("//div[contains(text(), 'Residence Burglary')]/parent::div//input[@role='checkbox']");
const getEquipmentBreakdownCheckBox = () => getLocator("//div[contains(text(), 'Equipment Breakdown')]/parent::div//input[@role='checkbox']");
const getWindstormCheckBox = () => getLocator("//div[contains(text(), 'Windstorm and Hail Buy-Back for Antennas')]/parent::div//input[@role='checkbox']");
const getVandalismCheckBox = () => getLocator("//div[contains(text(), 'Vandalism or Malicious Mischief')]/parent::div//input[@role='checkbox']");
const getEarthquakeCheckBox = () => getLocator("//div[contains(text(), 'Earthquake')]/parent::div//input[@role='checkbox']");
const getPersonalPropertyCheckBox = () => getLocator("//div[contains(text(), 'Personal Property')]/parent::div//input[@role='checkbox']");
const getPersonalPropertyLimitInputBox = () => getLocator("//input[contains(@id, 'PersonalPropertyLimit-inputEl')]");
const getCoveragesSaveAndNextButton = () => getLocator('//span[contains(@id, "HOCoveragesHOEScreen") and contains(text(), "Coverages")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getExclusionsTab = () => getLocator("//a[contains(@id, 'HOLevelExclusionsCardTab')]");
const getSaveAndNextButton = () => getLocator('//span[contains(@id, "HODwellingConstructionHOEScreen") and contains(text(), "Dwelling Construction")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getWindHailInputBox = () => getLocator("//input[contains(@id, 'DwellingWindHailDeductible-inputEl')]");
const getAnimalLiabilityCheckBox = () => getLocator("//div[contains(text(), 'Animal Liability Exclusion')]/parent::div//input[@role='checkbox']");
const getMoldandRemedationProperty = () => getLocator("//input[contains(@id, 'MoldAndRemediationPropertyLimit-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]")
const getFireDepartmentServiceChargeDropDown = () => getLocator("//input[contains(@id, 'FireDepartmentServiceChargeLimit-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]")
const getWaterBackupSumpOverflowCheckBox = () => getLocator("//div[contains(text(), 'Water Backup and Sump Overflow')]/parent::div//input[@role='checkbox']");
const getFORTIFIEDCheckBox = () => getLocator("//div[contains(text(), 'FORTIFIED Roof Upgrade')]/parent::div//input[@role='checkbox']");
const getLandlordPersonalInjuryCheckBox = () => getLocator("//div[contains(text(), 'Landlord Personal Injury')]/parent::div//input[@role='checkbox']");
const getResidenceBurglaryLimitInputBox = () => getLocator(`//div[normalize-space(.)="Residence Burglary"]/ancestor::fieldset//input[@role="textbox"]`);
const getIdentityRecoveryCheckBox = () => getLocator("//div[contains(text(), 'Identity Recovery')]/parent::div//input[@role='checkbox']");
const getWaterDamagePercentageDropdown= () => getLocator("//input[contains(@id, 'WaterDamagePercentage-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]")
const getSpecificBuildingExclusionCheckBox = () => getLocator("//div[contains(text(), 'Specific Building Exclusion')]/parent::div//input[@role='checkbox']")
const getAddBuildingButton = () => getLocator("//a[contains(@id,'BuildingLV_tb:Add') and .//span[normalize-space()='Add']]")
const getBuildingTypeDropdown = () => getLocator("//td[contains(@class,'x-grid-cell')]//div[contains(@class,'x-grid-cell-inner') and normalize-space()='<none>']")
const getDescriptionInputBox = () => getLocator("//tr[contains(@class, 'x-grid-data-row')]//td[contains(@class, 'g-cell-edit')][2]//div[@class='x-grid-cell-inner ']")
const getDescriptionEditorInput = () => getLocator("//div[contains(@class, 'x-editor')]//input[@type='text' and contains(@class, 'x-form-field')]")
const getDICFireExtendedVandalismExclusionCheckBox = () => getLocator("//div[contains(text(), 'DIC - Fire, Extended Coverage, Vandalism Excl')]/parent::div//input[@role='checkbox']");
const getDICFireLightningInternalExplosionSmokeExclusionCheckBox = () => getLocator("//div[contains(text(), 'DIC - Fire, Lightning, Internal Explosion, Smoke Excl')]/parent::div//input[@role='checkbox']");
const getRoofExclusionCheckBox = () => getLocator("//div[contains(text(), 'Roof Exclusion')]/parent::div//input[@role='checkbox']");
const getMoldExclusionPersonalLiabilityCheckBox = () => getLocator("//div[contains(text(), 'Mold Exclusion - Personal Liability')]/parent::div//input[@role='checkbox']");
const getMoldExclusionPremisesLiabilityCheckBox = () => getLocator("//div[contains(text(), 'Mold Exclusion - Premises Liability')]/parent::div//input[@role='checkbox']");
const getOtherStructuresExclusionCheckBox = () => getLocator("//div[contains(text(), 'Other Structures Exclusion')]/parent::div//input[@role='checkbox']");
const getWindstormOrHailExclusionCheckBox = () => getLocator("//div[contains(text(), 'Windstorm or Hail Exclusion')]/parent::div//input[@role='checkbox']");
const getWindstormAndHailBuyBackForAntennasCheckBox = () => getLocator("//div[contains(text(), 'Windstorm and Hail Buy-Back for Antennas')]/parent::div//input[@role='checkbox']");
const getBuildersRiskRenovationNewConstructionCheckBox = () => getLocator('//div[contains(text(), "Builder\'s Risk Renovation and/or New Construction")]/parent::div//input[@role=\'checkbox\']');
const getBuildersRiskRenovationNewConstructionLimitInputBox = () => getLocator('//div[normalize-space(.)="Builder\'s Risk Renovation and/or New Construction"]' + '/ancestor::fieldset//input[@role="textbox"]');

const getSecondaryResidenceCheckBox = () => getLocator("//div[contains(text(), 'Secondary Residence Liability')]/parent::div//input[@role='checkbox']");

const getGolfCartCheckBox = () => getLocator("//div[contains(text(), 'Golf Cart Physical Damage and Liability Extension')]/parent::div//input[@role='checkbox']");
const getGolfCartLimitInputBox = () => getLocator("//div[contains(text(), 'Golf Cart Physical Damage and Liability Extension')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), '# of Carts')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");

const getHobbyFarmingCheckBox = () => getLocator("//div[contains(text(), 'Hobby Farming')]/parent::div//input[@role='checkbox']");
const getWaterDamageLimitInput = () => getLocator("//input[contains(@id, 'WaterDamageLimit-inputEl')]");
const getResidenceBurglaryLimitPersonalPropertyInputBox = () => getLocator("//input[contains(@id, 'DirectTermInput-inputEl')]");
const getMineSubsidenceDwellingStructureCheckbox = () => getLocator("//div[contains(text(), 'Mine Subsidence Dwelling Structures')]/parent::div//input[@role='checkbox']");
const getMineSubsidenceNonDwellingCheckbox = () => getLocator("//div[contains(text(), 'Mine Subsidence Non-Dwelling Structures')]/parent::div//input[@role='checkbox']");
const getEnhancedCheckBox = () => getLocator("//div[contains(text(), 'Enhanced')]/parent::div//input[@role='checkbox']");
const getScheduledPersonalProperty = () => getLocator("//div[contains(text(), 'Scheduled Personal Property')]/parent::div//input[@role='checkbox']")
const getLossAssessmentLimitDropDown = () => getLocator("//td[contains(@id, 'LossAssessmentOptionLimit-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getFireDepartmentServiceChargeInputBox = () => getLocator("//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getTripCollisionCheckBox = () => getLocator("//div[contains(text(), 'Trip Collision')]/parent::div//input[@role='checkbox']");
const getAddTripButton = () => getLocator("//div[contains(text(), 'Trip Collision')]/parent::div/ancestor::td//div//span[contains(@id, 'Add-btnInnerEl')]");
const getOfUnitsInputBox = () => getLocator("//div[contains(text(), 'Trip Collision')]/parent::div/ancestor::td//div[@class='x-grid-cell-inner ']/parent::td[contains(@class, 'g-cell-edit')]");
const getTripCheckboxInside = () => getLocator("//td[contains(@class, 'x-grid-cell-checkcolumn')]");
const getTripDeductible = () => getLocator("(//div[contains(text(), 'Trip Collision')]/parent::div/ancestor::td//div[@class='x-grid-cell-inner ']/parent::td)[7]");

const getMoldandRemediationLiabilityCheckbox = () => getLocator("//div[contains(text(), 'Mold and Remediation - Liability')]/parent::div//input[@role='checkbox']")
const getLiabilityAdditionalResidenceRentedtoOthersCheckBox = () => getLocator("//div[contains(text(), 'Liability - Additional Residence Rented to Others')]/parent::div//input[@role='checkbox']");
const getLossOfUseLimittextbox = () => getLocator("//input[contains(@id, 'LossOfUseLimit-inputEl')]")
const getaddaddressbutton = () => getLocator("//span[text()='A']");
const getMinimizeChatButton =() => getLocator('//div[@id="minimize-chat-button"]');

type LocatorOrFactory = Locator | (() => Locator);
 
interface CoverageHandlerOptions {
  controlType?: "auto" | "input" | "dropdown";
  maxDropdownAttempts?: number;
  dropdownOptionLocator?: (value: string) => Locator;
}
 
interface DropdownHandlerOptions {
  maxAttempts?: number;
  optionLocator?: (value: string) => Locator;
  label?: string;
  postClickWaitMs?: number;
  retryWaitMs?: number;
}
 
function resolveLocator(locatorOrFactory: LocatorOrFactory): Locator {
  return typeof locatorOrFactory === "function"
    ? (locatorOrFactory as () => Locator)()
    : locatorOrFactory;
}

function normalizeDropdownValue(rawValue: string): string {
  const value = String(rawValue ?? "").trim();
  
  // If value already contains %, return as-is
  if (value.includes("%")) {
    return value;
  }
  
  const numericCandidate = value.replace(/[$,]/g, "");
  const isNumeric = numericCandidate !== "" && /^-?\d+(\.\d+)?$/.test(numericCandidate);

  if (isNumeric) {
    const numValue = Number(numericCandidate);
    
    // If it's a decimal between 0 and 1, convert to percentage
    if (numValue > 0 && numValue < 1) {
      return `${Math.round(numValue * 100)}%`;
    }
    
    return numValue.toLocaleString('en-US');
  }

  return value;
}

function normalizePercentageDropdownValue(rawValue: string): string {
  const value = String(rawValue ?? "").trim();
  if (!value) return value;

  if (value.includes("%")) {
    return value;
  }

  const numericCandidate = value.replace(/[$,]/g, "");
  const isNumeric = numericCandidate !== "" && /^-?\d+(\.\d+)?$/.test(numericCandidate);

  if (!isNumeric) {
    return value;
  }

  const numericValue = Number(numericCandidate);
  const percentValue = numericValue >= 0 && numericValue <= 1 ? numericValue * 100 : numericValue;
  const normalizedPercent = Number.isInteger(percentValue)
    ? String(percentValue)
    : parseFloat(percentValue.toFixed(4)).toString();

  return `${normalizedPercent}%`;
}

async function clickCheckboxWithVerification(checkbox: Locator, shouldSelect: boolean, controlRef?: LocatorOrFactory): Promise<boolean> {
  const maxAttempts = 5;
  const control = controlRef ? resolveLocator(controlRef) : null;
 
  // Helper function to check checkbox state robustly
  const getCheckboxState = async (): Promise<boolean> => {
    try {
      // Method 1: Check for x-form-cb-checked class on the parent table (ExtJS checkbox style)
      const hasCheckedClass = await checkbox.evaluate((el: HTMLElement) => {
        // Find the parent table if this is the input element
        let tableEl = el;
        if (el.tagName === 'INPUT') {
          tableEl = el.closest('table') as HTMLElement;
        }
        return tableEl ? tableEl.classList.contains('x-form-cb-checked') : false;
      }).catch(() => null);
      
      if (hasCheckedClass !== null) {
        console.log(`  Using x-form-cb-checked class check: ${hasCheckedClass}`);
        return hasCheckedClass;
      }
      
      // Method 2: Try .isChecked()
      const isChecked = await checkbox.isChecked().catch(() => null);
      if (isChecked !== null) {
        console.log(`  Using isChecked() method: ${isChecked}`);
        return isChecked;
      }
      
      // Method 3: Check aria-checked attribute
      const ariaChecked = await checkbox.getAttribute('aria-checked').catch(() => null);
      if (ariaChecked !== null) {
        console.log(`  Using aria-checked attribute: ${ariaChecked}`);
        return ariaChecked === 'true';
      }
      
      // Method 4: Check checked attribute directly on input
      const checked = await checkbox.evaluate((el: HTMLInputElement) => el.checked).catch(() => false);
      console.log(`  Using direct element.checked property: ${checked}`);
      return checked;
    } catch (e) {
      console.log(`⚠️ Error checking checkbox state: ${e}`);
      return false;
    }
  };
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Check current state
    let isCurrentlySelected = false;
    if (control) {
      isCurrentlySelected = await isElementVisible(control);
      console.log(`🔍 Control visibility check: ${isCurrentlySelected ? "visible (selected)" : "hidden (unselected)"}`);
    } else {
      // No control provided, check checkbox's own checked state using robust method
      isCurrentlySelected = await getCheckboxState();
      console.log(`🔍 Attempt ${attempt}: Checkbox state = ${isCurrentlySelected ? "checked" : "unchecked"}`);
    }

 
    // If already in desired state, return early
    if (isCurrentlySelected === shouldSelect) {
      console.log(`✅ Checkbox already in desired state on attempt ${attempt}: ${shouldSelect ? "selected" : "unselected"}`);
      return true;
    }
 
    // Click the checkbox
    console.log(`Clicking checkbox on attempt ${attempt} to set state to ${shouldSelect ? "checked" : "unchecked"}...`);
    await checkbox.click({ force: true });
    await wait(1000);
    
    // Wait for website to react
    await wait(2500);
    console.log(`Waited for website to react, now verifying state...`);
 
    // Verify state changed
    let newState = false;
    if (control) {
      newState = await isElementVisible(control);
    } else {
      newState = await getCheckboxState();
    }
    
    console.log(`🔍 After click on attempt ${attempt}: Checkbox state = ${newState ? "checked" : "unchecked"} (wanted ${shouldSelect ? "checked" : "unchecked"})`);
    
    if (newState === shouldSelect) {
      console.log(`✅ Checkbox state verified on attempt ${attempt} -> ${shouldSelect ? "selected" : "unselected"}`);
      return true;
    }
    console.log(`⚠️ Checkbox state not matching on attempt ${attempt}, retrying...`);
 
    await wait(800);
  }
 
  console.log(`⚠️ Failed to verify checkbox state after ${maxAttempts} attempts, proceeding anyway`);
  return true;
}

// Handle checkbox-only coverage (e.g., Animal Liability Exclusion)
async function handleCheckboxOnlySelection(checkboxRef: LocatorOrFactory, rawValue: string): Promise<void> {
  const checkbox = resolveLocator(checkboxRef);
  const value = String(rawValue ?? "").trim();
  const normalized = value.toLowerCase();
 
  if(await isElementVisible(getMinimizeChatButton())) {
    await click(getMinimizeChatButton());
    console.log(`Chat minimized to avoid interference with dropdown selection`);
    await wait(1000);
  }
  if (!(await isElementVisible(checkbox))) {
    console.log(`ℹ️ Checkbox is not visible. Skipping action.`);
    return;
  }
 
  // Only "Select" and "Do Not Select" values are valid for checkbox-only coverage
  if (normalized === "select") {
    await clickCheckboxWithVerification(checkbox, true);
    console.log(`✅ Checkbox selected`);
    return;
  }
 
  if (normalized === "do not select") {
    await clickCheckboxWithVerification(checkbox, false);
    console.log(`✅ Checkbox unselected`);
    return;
  }
 
  // Any other value for checkbox-only doesn't make sense
  console.log(`⚠️ Checkbox-only coverage received invalid value: '${value}'. Expected 'Select' or 'Do Not Select'.`);
}
 
// Handle checkbox + control coverage (checkbox with limit/settlement)
async function handleCoverageSectionSelection(
  checkboxRef: LocatorOrFactory,
  controlRef: LocatorOrFactory,
  rawValue: string,
  options: CoverageHandlerOptions = {}
): Promise<void> {
  const checkbox = resolveLocator(checkboxRef);
  const control = resolveLocator(controlRef);
  const value = String(rawValue ?? "").trim();
  const normalized = value.toLowerCase();
 if(await isElementVisible(getMinimizeChatButton())) {
    await click(getMinimizeChatButton());
    console.log(`Chat minimized to avoid interference with dropdown selection`);
    await wait(1000);
  }
  if (!(await isElementVisible(checkbox))) {
    console.log(`ℹ️ Coverage checkbox is not visible. Skipping action.`);
    return;
  }
 
  // Check state via control visibility (true source of truth)
  const isSelected = await isElementVisible(control).catch(() => false);
  console.log(`🔍 Coverage handler start | value='${value}' | controlVisible(selected)=${isSelected}`);
 
  // 1) Select
  if (normalized === "select") {
    if (isSelected) {
      console.log(`ℹ️ Value='Select' and control already visible (selected). No action needed.`);
      return;
    }
 
    const selected = await clickCheckboxWithVerification(checkbox, true, controlRef);
    if (!selected) {
      throw new Error(`Failed to select checkbox for value='Select'`);
    }
    console.log(`✅ Checkbox selected for value='Select'`);
    return;
  }
 
  // 2) Do Not Select
  if (normalized === "do not select") {
    if (!isSelected) {
      console.log(`ℹ️ Value='Do Not Select' and control already hidden (unselected). No action needed.`);
      return;
    }
 
    const unselected = await clickCheckboxWithVerification(checkbox, false, controlRef);
    if (!unselected) {
      throw new Error(`Failed to unselect checkbox for value='Do Not Select'`);
    }
    console.log(`✅ Checkbox unselected for value='Do Not Select'`);
    return;
  }
 
  // 3) Any other value -> coverage must be selected, then set value in input/dropdown
  if (!isSelected) {
    const selected = await clickCheckboxWithVerification(checkbox, true, controlRef);
    if (!selected) {
      throw new Error(`Failed to select checkbox before entering coverage value '${value}'`);
    }
  }
 
  if (!(await isElementVisible(control))) {
    throw new Error(`Coverage control is not visible for value '${value}'`);
  }
 
  // Detect control type (auto/input/dropdown)
  const tagName = await control.evaluate(el => el.tagName.toLowerCase()).catch(() => "");
  const role = (await control.getAttribute("role").catch(() => ""))?.toLowerCase() || "";
  const isReadOnly = (await control.getAttribute("readonly").catch(() => null)) !== null;
 
  const inferredInput = tagName === "input" && role !== "combobox" && !isReadOnly;
  const requestedControlType = options.controlType ?? "auto";
  const controlType = requestedControlType === "auto"
    ? (inferredInput ? "input" : "dropdown")
    : requestedControlType;
 
  if (controlType === "input") {
    await clear(control);
    await click(control);
    await fill(control, value);
    console.log(`✅ Entered coverage input value: ${value}`);
    return;
  }
 
  // Dropdown flow with retries
  const maxAttempts = options.maxDropdownAttempts ?? 5;
  const dropdownValue = normalizeDropdownValue(value);
  const optionLocator = options.dropdownOptionLocator
    ? options.dropdownOptionLocator(dropdownValue)
    : getLocator(`//ul[@class='x-list-plain']//li[text()='${dropdownValue}']`);

  let opened = false;
  for (let attempts = 1; attempts <= maxAttempts; attempts++) {
    await click(control);
    console.log(`Clicked dropdown trigger - attempt ${attempts}`);
    await wait(1000);
 
    if (await isElementVisible(optionLocator)) {
      opened = true;
      break;
    }
 
    await wait(500);
  }
 
  if (!opened) {
    throw new Error(`Failed to open dropdown for value '${dropdownValue}' after ${maxAttempts} attempts`);
  }
 
  await click(optionLocator);
  console.log(`✅ Selected dropdown option: ${dropdownValue}`);
}
async function setCoverageInputValue(controlRef: LocatorOrFactory, rawValue: string, label = "Coverage Input"): Promise<void> {
  if(await isElementVisible(getMinimizeChatButton())) {
    await click(getMinimizeChatButton());
    console.log(`Chat minimized to avoid interference with dropdown selection`);
    await wait(1000);
  }
  const control = resolveLocator(controlRef);
  const value = String(rawValue ?? "").trim();
  try {
    if (!(await isElementVisible(control))) {
      console.log(`${label} input is not visible`);
      return;
    }
  } catch (e) {
    console.log(`Error checking visibility of ${label} input: ${e}`);
    return;
  }
 
  await clear(control);
  await wait(500);
  await click(control);
  await fill(control, value);
  console.log(`✅ ${label} set to: ${value}`);
}
 
async function selectDropdownWithRetryDS(
  triggerRefs: LocatorOrFactory | LocatorOrFactory[],
  rawValue: string,
  options: DropdownHandlerOptions = {}
): Promise<void> {
  if(await isElementVisible(getMinimizeChatButton())) {
    await click(getMinimizeChatButton());
    console.log(`Chat minimized to avoid interference with dropdown selection`);
    await wait(1000);
  }
  const value = String(rawValue ?? "").trim();
  const label = options.label ?? "Dropdown";
  const dropdownValue = label.toLowerCase().includes("percentage")
    ? normalizePercentageDropdownValue(value)
    : normalizeDropdownValue(value);
  const maxAttempts = options.maxAttempts ?? 5;
  const postClickWaitMs = options.postClickWaitMs ?? 1000;
  const retryWaitMs = options.retryWaitMs ?? 500;
  const triggerList = Array.isArray(triggerRefs) ? triggerRefs : [triggerRefs];
 
  const normalizedDropdownValue = dropdownValue.toLowerCase();
  if (normalizedDropdownValue === "select" || normalizedDropdownValue === "do not select") {
    console.log(`ℹ️ ${label} value='${dropdownValue}' is not an actionable dropdown selection. Skipping dropdown action.`);
    return;
  }

  const optionLocator = options.optionLocator
    ? options.optionLocator(dropdownValue)
    : getLocator(`//ul[@class='x-list-plain']//li[text()='${dropdownValue}']`);

  let opened = false;
 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let clickedAnyTrigger = false;
 
    for (const triggerRef of triggerList) {
      const trigger = resolveLocator(triggerRef);
      if (await isElementVisible(trigger)) {
        await trigger.click({ force: true }).catch(async () => {
          await click(trigger);
        });
        await wait(2000);
        clickedAnyTrigger = true;
        await wait(postClickWaitMs);
 
        if (await isElementVisible(optionLocator)) {
          opened = true;
          break;
        }
      }
    }
 
    if (opened) {
      break;
    }

    console.log(`⚠️ ${label} option '${dropdownValue}' not visible on attempt ${attempt}${clickedAnyTrigger ? "" : " (no visible trigger)"}`);
    await wait(retryWaitMs);
  }
 
  if (!(await isElementVisible(optionLocator))) {
    throw new Error(`Failed to open ${label} dropdown for value '${dropdownValue}' after ${maxAttempts} attempts`);
  }
 
  await click(optionLocator);
  console.log(`✅ ${label} selected: ${dropdownValue}`);
}
async function selectMoldandRemediationLiability(value: any) {
  await handleCheckboxOnlySelection(
    getMoldandRemediationLiabilityCheckbox,
    String(value ?? "")
  );
}
 
async function selectgetLiabilityAdditionalResidenceRentedtoOthersCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getLiabilityAdditionalResidenceRentedtoOthersCheckBox,
    String(value ?? "")
  );
}
 
async function entergetLossOfUseLimittextbox(value: any) {
  await setCoverageInputValue(getLossOfUseLimittextbox, String(value ?? ""), "Loss of Use Limit");
}
 
async function selectPersonalLiabilityLimit(value: any) {
  await handleCoverageSectionSelection(
    getPersonalLiabilityCheckBox,
    getPersonalLiabilityLimitDropDown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
  );
}

async function selectPremisesLiabilityLimit(value: any) {
  await selectDropdownWithRetry(
    getPremisesLiabilityLimitDropDown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Premises Liability" }
  )
}
 
async function selectPersonalPropertyLimit(value: any) {
  await handleCoverageSectionSelection(
    getPersonalPropertyCheckBox,
    getPersonalPropertyLimitInputBox,
    String(value ?? ""),
    { controlType: "input" }
  );
}

async function selectTheftLimit(value: any) {
  await handleCoverageSectionSelection(
    getTheftCheckBox,
    getTheftLimitInputBox,
    String(value ?? ""),
    { controlType: "input" }
  );
}

async function selectBuildersRiskRenovationNewConstructionCheckBox(value: any) {
  await handleCoverageSectionSelection(
    getBuildersRiskRenovationNewConstructionCheckBox,
    getBuildersRiskRenovationNewConstructionLimitInputBox,
    String(value ?? ""),
    { controlType: "input" }
  );
}
 

async function selectOtherStructuresLimit(value: any) {
  await handleCoverageSectionSelection(
    getOtherStructuresCheckBox,
    getOtherStructuresLimitInputBox,
    String(value ?? ""),
    { controlType: "input" }
  );
}

async function selectResidenceBurglaryLimit(value: any) {
  await handleCoverageSectionSelection(
    getResidenceBurglaryCheckBox,
    getResidenceBurglaryLimitPersonalPropertyInputBox,
    String(value ?? ""),
    { controlType: "input" }
  );
}

async function selectMedicalPaymentsLimit(value: any) {
  await selectDropdownWithRetry(
    getMedicalPaymentsLimitDropDown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Medical Payments" }
  );
}

async function selectLossAssessmentLimit(value: any) {
  await selectDropdownWithRetry(
    getLossAssessmentLimitDropDown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Loss Assessment" }
  );
}

async function enterDwellingLimit(value: any) {
  await setCoverageInputValue(getDwellingLimitInputBox, String(value ?? ""), "Dwelling Limit");
}
 
async function selectDwellingSettlementOption(value: any) {
  const settlementTriggers: LocatorOrFactory[] = [
    () => getLocator("//td[contains(@id, 'DwellingSettlementOption-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]"),
    () => getLocator("//input[contains(@id, 'DwellingSettlementOption-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]"),
    () => getLocator("//table[contains(@id, 'DwellingSettlementOption-triggerWrap')]//div[contains(@class,'x-form-arrow-trigger')]"),
    () => getLocator("//input[contains(@id, 'DwellingSettlementOption-inputEl')]")
  ];
 
  await selectDropdownWithRetry(
    settlementTriggers,
    String(value ?? ""),
    { maxAttempts: 5, label: "Dwelling: Settlement Option" }
  );
}
async function selectPersonalPropertySettlementOption(value: any) {
  const settlementTriggers: LocatorOrFactory[] = [
    () => getLocator("//td[contains(@id, 'PersonalPropertySettlementOption-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]"),
    () => getLocator("//input[contains(@id, 'PersonalPropertySettlementOption-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]"),
    () => getLocator("//table[contains(@id, 'PersonalPropertySettlementOption-triggerWrap')]//div[contains(@class,'x-form-arrow-trigger')]"),
    () => getLocator("//input[contains(@id, 'PersonalPropertySettlementOption-inputEl')]")
  ];
 
  await selectDropdownWithRetry(
    settlementTriggers,
    String(value ?? ""),
    { maxAttempts: 5, label: "Personal Property: Settlement Option" }
  );
}

async function selectLossofUsePercentage(value: any) {
  const getLossofUsePercentageDropDown = () => getLocator("//td[contains(@id, 'LossOfUsePercentage-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
  await selectDropdownWithRetry(
    getLossofUsePercentageDropDown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Loss of Use Percentage" }
  );
}
async function selectOtherPerilDeductible(value: any) {
  await selectDropdownWithRetry(
    getOtherPerilDeductibleDropDown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Other Peril Deductible" }
  );
}

async function selectMoldandRemedationPropertyDropdown(value: any) {
  await selectDropdownWithRetry(
    getMoldandRemedationProperty,
    String(value ?? ""),
    { maxAttempts: 5, label: "Mold and Remediation - Property" }
  );
}

async function getfireDepartmentServiceChargedropdown(value: any) {
  await selectDropdownWithRetry(
    getFireDepartmentServiceChargeDropDown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Fire Department Service Charge" }
  );
}

async function getWaterDamagePercentagedropdown(value: any) {
  await selectDropdownWithRetry(
    getWaterDamagePercentageDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Water Damage: Percentage" }
  );
}

async function addTripCollisionUnits(value: any, deductible: any = "") {
  const unitsValue = String(value ?? "").trim();
  const deductibleValue = String(deductible ?? "").trim();

  if (!unitsValue && !deductibleValue) {
    console.log("ℹ️ Trip Collision values are empty. Skipping add trip action.");
    return;
  }
  if(unitsValue.toString().toLowerCase() !=  "do not select") {
    console.log(`Trip Collision Units value to enter: '${unitsValue}'`);
  
  await handleCheckboxOnlySelection(getTripCollisionCheckBox, "Select");
  await wait(1000);
  

  const addTripButton = getAddTripButton();
  await scrollLocatorIntoView(addTripButton);
  if (await isElementVisible(addTripButton)) {
    await click(addTripButton);
    console.log("✅ Add Trip button clicked");
    await wait(1500);
  } else {
    console.log("⚠️ Add Trip button is not visible");
    return;
  }

  if (unitsValue) {
    const unitsCell = getOfUnitsInputBox();
    await scrollLocatorIntoView(unitsCell);
    if (!(await isElementVisible(unitsCell))) {
      console.log("⚠️ # of Units input cell is not visible");
      return;
    }

    await unitsCell.click({ force: true });
    await unitsCell.dblclick({ force: true });
    await wait(500);

    const unitsEditor = getLocator('//input[@name="TripNumberOfUnits"]');
    if (await isElementVisible(unitsEditor)) {
      await click(unitsEditor);
      await clear(unitsEditor);
      await fill(unitsEditor, unitsValue);
      await unitsEditor.press("Enter");
    } else {
      const page = getPage();
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");
      await page.keyboard.type(unitsValue);
      await page.keyboard.press("Enter");
    }

    console.log(`✅ Trip Collision # of Units entered: ${unitsValue}`);
  }
}

  // if (deductibleValue) {
  //   const deductibleCell = getTripDeductible();
  //   await scrollLocatorIntoView(deductibleCell);
  //   if (!(await isElementVisible(deductibleCell))) {
  //     console.log("⚠️ Trip Collision Deductible input cell is not visible");
  //     return;
  //   }

  //   await deductibleCell.click({ force: true });
  //   await deductibleCell.dblclick({ force: true });
  //   await wait(500);

  //   const deductibleEditor = getLocator("//div[contains(text(), 'Trip Collision')]/parent::div/ancestor::td//input[contains(@name, 'Deductible') or contains(@id, 'Deductible')]");
  //   if (await isElementVisible(deductibleEditor)) {
  //     await click(deductibleEditor);
  //     await clear(deductibleEditor);
  //     await fill(deductibleEditor, deductibleValue);
  //     await deductibleEditor.press("Enter");
  //   } else {
  //     const page = getPage();
  //     await page.keyboard.press("Control+A");
  //     await page.keyboard.press("Backspace");
  //     await page.keyboard.type(deductibleValue);
  //     await page.keyboard.press("Enter");
  //   }

  //   console.log(`✅ Trip Collision Deductible entered: ${deductibleValue}`);
  // }
}


async function selectSpecificBuildingExclusion(value: any, description: any) {
  // Step 1: Select the checkbox
  await handleCheckboxOnlySelection(getSpecificBuildingExclusionCheckBox, "Select");
  console.log("✅ Specific Building Exclusion checkbox selected");
  await wait(3000);
  
  // Step 2: Click Add button
  const addButton = getAddBuildingButton();
  await click(addButton);
  console.log("✅ Add Building button clicked");
  await wait(4000);
  
  // Step 3: Select Building Type from dropdown
  await selectDropdownWithRetryDS(
    getBuildingTypeDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Building Type" }
  );
  console.log("✅ Building Type selected:", value);
  await wait(3000);
  
  // Step 4: Fill Description input box
  const descriptionCell = getDescriptionInputBox();
  // Click the cell to activate edit mode
  try {
    await descriptionCell.waitFor({ state: 'attached', timeout: TIMEOUT_8_SECONDS });
    await scrollLocatorIntoView(descriptionCell);
    await click(descriptionCell);
    await wait(1000);
    
    // Type directly into the active cell using keyboard
    const page = getPage();
    await page.keyboard.type(String(description ?? ""));
    await wait(500);
    
    // Press Enter to confirm and move to next cell
    // await page.keyboard.press('Enter');
    console.log("✅ Description filled:", description);
  } catch (error) {
    console.error("❌ Description input box not found or timeout:", error);
    throw new Error(`Failed to locate description input box: ${error}`);
  }
}

async function selectDICFireExtendedVandalismExclusion(value: any) {
  await handleCheckboxOnlySelection(getDICFireExtendedVandalismExclusionCheckBox, String(value ?? ""));
}

async function selectDICFireLightningInternalExplosionSmokeExclusion(value: any) {
  await handleCheckboxOnlySelection(getDICFireLightningInternalExplosionSmokeExclusionCheckBox, String(value ?? ""));
}

async function selectRoofExclusion(value: any) {
  await handleCheckboxOnlySelection(getRoofExclusionCheckBox, String(value ?? ""));
}

async function selectMoldExclusionPersonalLiability(value: any) {
  await handleCheckboxOnlySelection(getMoldExclusionPersonalLiabilityCheckBox, String(value ?? ""));
}

async function selectMoldExclusionPremisesLiability(value: any) {
  await handleCheckboxOnlySelection(getMoldExclusionPremisesLiabilityCheckBox, String(value ?? ""));
}

async function selectOtherStructuresExclusion(value: any) {
  await handleCheckboxOnlySelection(getOtherStructuresExclusionCheckBox, String(value ?? ""));
}

async function selectWindstormOrHailExclusion(value: any) {
  await handleCheckboxOnlySelection(getWindstormOrHailExclusionCheckBox, String(value ?? ""));
}

async function enterFireDepartmentServiceCharge(value: any) {
  await setCoverageInputValue(getFireDepartmentServiceChargeInputBox, String(value ?? ""), "Fire Department Service Charge");
}

async function selectWaterDamagePercentageDropdown(value: any) {
  await selectDropdownWithRetry(
    getWaterDamagePercentageDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Water Damage: Percentage" }
  );
}

 
async function selectWindHailDeductible(value: any) {
  await wait(3000);
  await selectDropdownWithRetry(
    getWindHailDropDown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Wind/Hail Deductible" }
  );
}
 async function selectWaterDamageCheckBox(value: any) {
  if(await isElementVisible(getWaterDamageCheckBox())){
      await handleCoverageSectionSelection(
    getWaterDamageCheckBox,
    getWaterDamageLimitInput,
    String(value ?? ""),
    { controlType: "input" }
  );
}
 }


async function selectWaterBackupSumpOverflowCheckBox(value: any) {
  await handleCheckboxOnlySelection(getWaterBackupSumpOverflowCheckBox, String(value ?? ""));
}

async function selectIdentityRecoveryCheckBox(value: any) {
  await handleCheckboxOnlySelection(getIdentityRecoveryCheckBox, String(value ?? ""));
}

async function selectLandlordPersonalInjuryCheckBox(value: any) {
  await handleCheckboxOnlySelection(getLandlordPersonalInjuryCheckBox, String(value ?? ""));
}

async function selectFORTIFIEDRoofUpgradeCheckBox(value: any) {
  await handleCheckboxOnlySelection(getFORTIFIEDCheckBox, String(value ?? ""));
}

async function selectTheftCheckBox(value: any) {
  await handleCheckboxOnlySelection(getTheftCheckBox, String(value ?? ""));
}

async function selectOrdinanceOrLawCheckBox(value: any) {
  await handleCheckboxOnlySelection(getOrdinanceOrLawCheckBox, String(value ?? ""));
}

async function selectServiceLineCheckBox(value: any) {
  await handleCheckboxOnlySelection(getServiceLineCheckBox, String(value ?? ""));
}

async function selectResidenceBurglaryCheckBox(value: any) {
  await handleCheckboxOnlySelection(getResidenceBurglaryCheckBox, String(value ?? ""));
}
async function selectEquipmentBreakdownCheckBox(value: any) {
  await handleCheckboxOnlySelection(getEquipmentBreakdownCheckBox, String(value ?? ""));
}
async function selectWindstormCheckBox(value: any) {
  await handleCheckboxOnlySelection(getWindstormCheckBox, String(value ?? ""));
}
async function selectVandalismCheckBox(value: any) {
  await handleCheckboxOnlySelection(getVandalismCheckBox, String(value ?? ""));
}
async function selectEarthquakeCheckBox(value: any) {
  await handleCheckboxOnlySelection(getEarthquakeCheckBox, String(value ?? ""));
}

async function selectWindstormAndHailBuyBackForAntennasCheckBox(value: any) {
  await handleCheckboxOnlySelection(getWindstormAndHailBuyBackForAntennasCheckBox, String(value ?? ""));
}

async function enterOtherStructuresLimit(value: any) {
  await setCoverageInputValue(getOtherStructuresLimitInputBox, String(value ?? ""), "Other Structures Limit");
}
async function enterResidenceBurglaryLimitPersonalProperty(value: any) {
  await setCoverageInputValue(getResidenceBurglaryLimitInputBox, String(value ?? ""), "Residence Burglary: Limit - Personal Property");
}

async function enterAdditionalLivingExpenseLimit(value: any) {
  await handleCheckboxOnlySelection(getAdditionalLivingExpenseCheckBox, "Select");
  await setCoverageInputValue(getAdditionalLivingExpenseLimitInputBox, String(value ?? ""), "Additional Living Expense/Fair Rental Value Limit");
}

async function selectEnhancedCheckbox(value: any) {
  await handleCheckboxOnlySelection(getEnhancedCheckBox, String(value ?? ""));
}
async function selectMineSubsidenceNonDwellingCheckbox(value: any) {
  await handleCheckboxOnlySelection(getMineSubsidenceNonDwellingCheckbox, String(value ?? ""));
}
async function selectMineSubsidenceDwellingStructureCheckbox(value: any) {
  await handleCheckboxOnlySelection(getMineSubsidenceDwellingStructureCheckbox, String(value ?? ""));
}
async function selectScheduledPersonalPropertyCheckbox(value: any) {
  await handleCheckboxOnlySelection(getScheduledPersonalProperty, String(value ?? ""));
}
async function selectHobbyFarmingCheckbox(value: any) {
  await handleCheckboxOnlySelection(getHobbyFarmingCheckBox, String(value ?? ""));
}

async function selectAnimalLiabilityExclusion(value: any) {
  await handleCheckboxOnlySelection(
    getAnimalLiabilityCheckBox,
    String(value ?? "")
  );
}

async function selectIdentityRecovery(value: any) {
  await handleCheckboxOnlySelection(
    getIdentityRecoveryCheckBox,
    String(value ?? "")
  );
}
async function selectSecondaryResidenceLiability(value: any) {
  await handleCheckboxOnlySelection(
    getSecondaryResidenceCheckBox,
    String(value ?? "")
  );
}

async function selectGolfCartExtension(value: any) {
  await handleCoverageSectionSelection(
    getGolfCartCheckBox,
    getGolfCartLimitInputBox,
    String(value ?? ""),
    { controlType: "input" }
  );
}
// Main function to fill all coverages fields
export async function fillCoveragesCorePage(page: Page, testInfo: TestInfo, coverages: any[], ruleMatrix: Record<string, Record<string, any>>, blockingContext: string, testCaseId: any): Promise<ValidationResult> {
  try {
    await wait(TIMEOUT_4_SECONDS);
    if (await isElementVisible(getSaveAndNextButton())) {
      await getSaveAndNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
 
    for (let coveragesData of coverages) {

    if (coveragesData["Personal Liability: Limit"]) {
      console.log("Personal Liability Limit Value: ", coveragesData["Personal Liability: Limit"]);
      await selectPersonalLiabilityLimit(coveragesData["Personal Liability: Limit"]);
    }

    if (coveragesData["Identity Recovery: Limit"]) {
      console.log("Identity Recovery Limit Value: ", coveragesData["Identity Recovery: Limit"]);
      await selectIdentityRecoveryCheckBox(coveragesData["Identity Recovery: Limit"]);
    }

     if (coveragesData["Premises Liability: Limit"]) {
      console.log("Premises Liability Limit Value: ", coveragesData["Premises Liability: Limit"]);
      await selectPremisesLiabilityLimit(coveragesData["Premises Liability: Limit"]);
    }


    if (coveragesData["Medical Payments: Limit (per person/per occurrence)"]) {
      console.log("Medical Payments Limit Value: ", coveragesData["Medical Payments: Limit (per person/per occurrence)"]);
      await selectMedicalPaymentsLimit(coveragesData["Medical Payments: Limit (per person/per occurrence)"]);
    }
    if(coveragesData["Secondary Residence Liability: # of Residences"]){
      console.log("Secondary Residence Liability: # of Residences Value: ", coveragesData["Secondary Residence Liability: # of Residences"]);
      await selectSecondaryResidenceLiability(coveragesData["Secondary Residence Liability: # of Residences"]);
    }
    if (coveragesData["Animal Liability Exclusion"]) {
      console.log("Animal Liability Exclusion Value: ", coveragesData["Animal Liability Exclusion"]);
      await selectAnimalLiabilityExclusion(coveragesData["Animal Liability Exclusion"]);
    }
    if (coveragesData["Identity Recovery: Limit"]) {
      console.log("Identity Recovery Value: ", coveragesData["Identity Recovery: Limit"]);
      await selectIdentityRecovery(coveragesData["Identity Recovery: Limit"]);
    }
    if (coveragesData["Golf Cart Physical Damage and Liability Extension: # of Carts"]) {
      console.log("Golf Cart Physical Damage and Liability Extension: # of Carts Value: ", coveragesData["Golf Cart Physical Damage and Liability Extension: # of Carts"]);
      await selectGolfCartExtension(coveragesData["Golf Cart Physical Damage and Liability Extension: # of Carts"]);
    }
    if(coveragesData["Premises Liability: Limit"]){
      await selectPremisesLiabilityLimit(coveragesData["Premises Liability: Limit"]);
    }
    if (coveragesData["Dwelling: Limit"]) {
      console.log("Dwelling Limit Value: ", coveragesData["Dwelling: Limit"]);
      await enterDwellingLimit(coveragesData["Dwelling: Limit"]);
    }
 
    if (coveragesData["Dwelling: Settlement Option"]) {
      console.log("Dwelling Settlement Option Value: ", coveragesData["Dwelling: Settlement Option"]);
      await selectDwellingSettlementOption(coveragesData["Dwelling: Settlement Option"]);
    }
 
    if (coveragesData["Dwelling: All Other Peril Deductible"]) {
      console.log("Dwelling All Other Peril Deductible Value: ", coveragesData["Dwelling: All Other Peril Deductible"]);
      await selectOtherPerilDeductible(coveragesData["Dwelling: All Other Peril Deductible"]);
    }
    if (coveragesData["Dwelling: Wind and Hail Deductible"]) {
      console.log("Dwelling Wind and Hail Deductible Value: ", coveragesData["Dwelling: Wind and Hail Deductible"]);
      await selectWindHailDeductible(coveragesData["Dwelling: Wind and Hail Deductible"]);
    }
 
    // if (coveragesData["Other Structures: Limit"]) {
    //   console.log("Other Structures Limit Value: ", coveragesData["Other Structures: Limit"]);
    //   await enterOtherStructuresLimit(coveragesData["Other Structures: Limit"]);
    // }
    if(coveragesData["Other Structures: Limit"]){
      console.log("Other Structures Limit Value: ", coveragesData["Other Structures: Limit"]);
      await selectOtherStructuresLimit(coveragesData["Other Structures: Limit"]);
    }


    if (coveragesData["Personal Property: Limit"]) {
        console.log("Personal Property Limit Value: ", coveragesData["Personal Property: Limit"]);
        await selectPersonalPropertyLimit(coveragesData["Personal Property: Limit"]);
      }
      if (coveragesData["Personal Property: Settlement Option"]) {
        console.log("Personal Property Settlement Option Value: ", coveragesData["Personal Property: Settlement Option"]);
        await selectPersonalPropertySettlementOption(coveragesData["Personal Property: Settlement Option"]);
      }

    if(coveragesData["Mold and Remediation - Liability: Limit"]){
      console.log("Mold and Remediation - Liability Limit Value: ", coveragesData["Mold and Remediation - Liability: Limit"]);
      await selectMoldandRemediationLiability(coveragesData["Mold and Remediation - Liability: Limit"]);
    }

    if (coveragesData["Additional Living Expense/Fair Rental Value: Limit"]) {
      console.log("Additional Living Expense/Fair Rental Value Limit Value: ", coveragesData["Additional Living Expense/Fair Rental Value: Limit"]);
      await enterAdditionalLivingExpenseLimit(coveragesData["Additional Living Expense/Fair Rental Value: Limit"]);
    }

    if (coveragesData["Water Damage: Limit"]) {
      console.log("Water Damage Limit Value: ", coveragesData["Water Damage: Limit"]);
      await selectWaterDamageCheckBox(coveragesData["Water Damage: Limit"]);
    }

    
    if (coveragesData["Landlord Personal Injury"]) {
      console.log("Landlord Personal Injury Value: ", coveragesData["Landlord Personal Injury"]);
      await selectLandlordPersonalInjuryCheckBox(coveragesData["Landlord Personal Injury"]);
    }

    if (coveragesData["Theft: Limit"]) {
      console.log("Theft Limit Value: ", coveragesData["Theft: Limit"]);
      await selectTheftLimit(coveragesData["Theft: Limit"]);
    }

    if (coveragesData["Theft: Percentage"]) {
      console.log("Theft Percentage Value: ", coveragesData["Theft: Percentage"]);
      await selectTheftCheckBox(coveragesData["Theft: Percentage"]);
    }

    if (coveragesData["Theft: Limit - Personal Property"]) {
      console.log("Theft Limit Value: ", coveragesData["Theft: Limit - Personal Property"]);
      await selectTheftCheckBox(coveragesData["Theft: Limit - Personal Property"]);
    }

    if(coveragesData["Water Damage: Percentage"]){
      console.log("Water Damage Percentage Value: ", coveragesData["Water Damage: Percentage"]);
      await selectWaterDamagePercentageDropdown(coveragesData["Water Damage: Percentage"]);
    }
    if(coveragesData["Water Backup and Sump Overflow : Limit"] || coveragesData["Water Backup and Sump Overflow : Deductible"]){
      console.log("Water Backup and Sump Overflow Limit Value: ", coveragesData["Water Backup and Sump Overflow : Limit"] || coveragesData["Water Backup and Sump Overflow : Deductible"]);
      await selectWaterBackupSumpOverflowCheckBox(coveragesData["Water Backup and Sump Overflow : Limit"]  || coveragesData["Water Backup and Sump Overflow : Deductible"]);
    }
    if (coveragesData["Mine Subsidence Dwelling Structures: Limit"]) {
      console.log("Mine Subsidence Dwelling Structures Limit Value: ", coveragesData["Mine Subsidence Dwelling Structures: Limit"]);
      await selectMineSubsidenceDwellingStructureCheckbox(coveragesData["Mine Subsidence Dwelling Structures: Limit"]);
    }
    if (coveragesData["Mine Subsidence Non-Dwelling Structures: Limit"]) {
      console.log("Mine Subsidence Non-Dwelling Structures: Limit Value: ", coveragesData["Mine Subsidence Non-Dwelling Structures: Limit"]);
      await selectMineSubsidenceNonDwellingCheckbox(coveragesData["Mine Subsidence Non-Dwelling Structures: Limit"]);
    }
    if(coveragesData["Enhanced Coverage"]){
      console.log("Enhanced Coverage Value: ", coveragesData["Enhanced Coverage"]);
      await selectEnhancedCheckbox(coveragesData["Enhanced Coverage"]);
    }
    if(coveragesData["Scheduled Personal Property: Article or Property Type"]){
      console.log("Scheduled Personal Property Value: ", coveragesData["Scheduled Personal Property: Article or Property Type"]);
      await selectScheduledPersonalPropertyCheckbox(coveragesData["Scheduled Personal Property: Article or Property Type"]);
    }
    if(coveragesData["Loss Assessment: Limit"]){
      console.log("Loss Assessment Limit Value: ", coveragesData["Loss Assessment: Limit"]);
      await selectLossAssessmentLimit(coveragesData["Loss Assessment: Limit"]);
    }
    if(coveragesData["Hobby Farming"]){
      console.log("Hobby Farming Limit Value: ", coveragesData["Hobby Farming"]);
      await selectHobbyFarmingCheckbox(coveragesData["Hobby Farming"]);
    }
    if (coveragesData["Trip Collision: # of Units"] || coveragesData["Trip Collision: # of Unit"] || coveragesData["Trip Collision: Deductible"] || coveragesData["Trip Collision Deductible"]) {
      const tripUnits = coveragesData["Trip Collision: # of Units"] ?? coveragesData["Trip Collision: # of Unit"];
      const tripDeductible = coveragesData["Trip Collision: Deductible"] ?? coveragesData["Trip Collision Deductible"];
      console.log("Trip Collision # of Units Value: ", tripUnits);
      if (tripDeductible) {
        console.log("Trip Collision Deductible Value: ", tripDeductible);
      }
      await addTripCollisionUnits(tripUnits, tripDeductible);
    }
    if(coveragesData["Fire Department Service Charge: Limit"]){
      console.log("Fire Department Service Charge Limit Value: ", coveragesData["Fire Department Service Charge: Limit"]);
      await enterFireDepartmentServiceCharge(coveragesData["Fire Department Service Charge: Limit"]);
    }
     if (coveragesData["Residence Burglary: Limit"]) {
      console.log("Residence Burglary Limit Value: ", coveragesData["Residence Burglary: Limit"]);
      await selectResidenceBurglaryLimit(coveragesData["Residence Burglary: Limit"]);
    }

    if (coveragesData["Residence Burglary: Limit - Personal Property"]) {
      console.log("Residence Burglary Limit Value: ", coveragesData["Residence Burglary: Limit - Personal Property"]);
      await selectResidenceBurglaryLimit(coveragesData["Residence Burglary: Limit - Personal Property"]);
    }

    if (coveragesData["Ordinance or Law: Percentage"]) {
      console.log("Ordinance or Law Percentage Value: ", coveragesData["Ordinance or Law: Percentage"]);
      await selectOrdinanceOrLawCheckBox(coveragesData["Ordinance or Law: Percentage"]);
      await handleCheckboxOnlySelection(getOrdinanceOrLawCheckBox, String(coveragesData["Ordinance or Law: Percentage"] ?? ""));
    }

    if (coveragesData["Ordinance or Law: Limit"]) {
      console.log("Ordinance or Law Limit Value: ", coveragesData["Ordinance or Law: Limit"]);
      await selectOrdinanceOrLawCheckBox(coveragesData["Ordinance or Law: Limit"]);
      await handleCheckboxOnlySelection(getOrdinanceOrLawCheckBox, String(coveragesData["Ordinance or Law: Limit"] ?? ""));
    }

    if (coveragesData["Equipment Breakdown: Deductible"]) {
      console.log("Equipment Breakdown Deductible Value: ", coveragesData["Equipment Breakdown: Deductible"]);
      await selectEquipmentBreakdownCheckBox(coveragesData["Equipment Breakdown: Deductible"]);
    }

    if (coveragesData["Service Line: Deductible"]) {
      console.log("Service Line Deductible Value: ",coveragesData["Service Line: Deductible"]);
      await selectServiceLineCheckBox(coveragesData["Service Line: Deductible"]);
    }
    
    if (coveragesData["Service Line: Limit"]) {
      console.log("Service Line Limit Value: ", coveragesData["Service Line: Limit"]);
      await selectServiceLineCheckBox(coveragesData["Service Line: Limit"]);
    }

    if (coveragesData["Builder’s Risk Renovation and / or New Construction: Limit"]) {
      console.log("Builder’s Risk Renovation and / or New Construction: Limit Value: ", coveragesData["Builder’s Risk Renovation and / or New Construction: Limit"]);
      await selectBuildersRiskRenovationNewConstructionCheckBox(coveragesData["Builder’s Risk Renovation and / or New Construction: Limit"]);
    }

    if (coveragesData["Windstorm and Hail Buy-Back for Antennas"]) {
      console.log("Windstorm and Hail Buy-Back for Antennas Value: ", coveragesData["Windstorm and Hail Buy-Back for Antennas"]);
      await selectWindstormAndHailBuyBackForAntennasCheckBox(coveragesData["Windstorm and Hail Buy-Back for Antennas"]);
    }

    if (coveragesData["Vandalism or Malicious Mischief : Deductible"]) {
      console.log("Vandalism or Malicious Mischief Deductible Value: ", coveragesData["Vandalism or Malicious Mischief : Deductible"]);
      await selectVandalismCheckBox(coveragesData["Vandalism or Malicious Mischief : Deductible"]);
    }
    if (coveragesData["Earthquake: Deductible Percentage"]) {
      console.log("Earthquake Deductible Percentage Value: ", coveragesData["Earthquake: Deductible Percentage"]);
      await selectEarthquakeCheckBox(coveragesData["Earthquake: Deductible Percentage"]);
    }
    if (coveragesData["Earthquake: Limit - Dwelling"] || coveragesData["Earthquake: Deductible Percentage"]) {
      console.log("Earthquake Limit - Dwelling Value: ", coveragesData["Earthquake: Limit - Dwelling"] || coveragesData["Earthquake: Deductible Percentage"]);
      await selectEarthquakeCheckBox(coveragesData["Earthquake: Limit - Dwelling"] || coveragesData["Earthquake: Deductible Percentage"]);
    }
      if (coveragesData["Personal Property: Limit"]) {
        console.log("Personal Property Limit Value: ", coveragesData["Personal Property: Limit"]);
        await selectPersonalPropertyLimit(coveragesData["Personal Property: Limit"]);
      }
      if (coveragesData["Personal Property: Settlement Option"]) {
        console.log("Personal Property Settlement Option Value: ", coveragesData["Personal Property: Settlement Option"]);
        await selectPersonalPropertySettlementOption(coveragesData["Personal Property: Settlement Option"]);
      }
      if(coveragesData["Loss of Use: Percentage"]){
        console.log("Loss of Use Percentage Value: ", coveragesData["Loss of Use: Percentage"]);
        await selectLossofUsePercentage(coveragesData["Loss of Use: Percentage"]);
      }
      
       if (coveragesData["Mold and Remediation - Property: Limit"]) {
      console.log("Mold and Remediation - Property: Limit: ", coveragesData["Mold and Remediation - Property: Limit"]);
      await selectMoldandRemedationPropertyDropdown(coveragesData["Mold and Remediation - Property: Limit"]);
    }

     //todo me----------------------
    //   if (coveragesData["Mold and Remediation - Property: Limit-checkbox"]) {
    //   console.log("Dwelling All Other Peril Deductible Value: ", coveragesData["Mold and Remediation - Property: Limit-checkbox"]);
    //   await selectMoldandRemediationLiability(coveragesData["Mold and Remediation - Property: Limit-checkbox"]);
    //   await selectMoldandRemedationPropertyDropdown(coveragesData["Mold and Remediation - Property: Limit"]);
    // }

    //  if (coveragesData["Fire Department Service Charge: Limit"]) {
    //   console.log("Fire Department Service Charge: Limit", coveragesData["Fire Department Service Charge: Limit"]);
    //   await selectMoldandRemedationPropertyDropdown(coveragesData["Fire Department Service Charge: Limit"]);
    // }

    if (coveragesData["FORTIFIED Roof Upgrade"]) {
      console.log("FORTIFIED Roof Upgrade Value: ", coveragesData["FORTIFIED Roof Upgrade"]);
      await selectFORTIFIEDRoofUpgradeCheckBox(coveragesData["FORTIFIED Roof Upgrade"]);
    }

     //todo me----------------------
    //   if (coveragesData["Mold and Remediation - Property: Limit-checkbox"]) {
    //   console.log("Dwelling All Other Peril Deductible Value: ", coveragesData["Mold and Remediation - Property: Limit-checkbox"]);
    //   await selectMoldandRemediationLiability(coveragesData["Mold and Remediation - Property: Limit-checkbox"]);
    // }
    //      if (coveragesData["Mold and Remediation - Property: Limit-checkbox"]) {
    //   console.log("Mold and Remediation - Property: Limit-checkbox Value: ", coveragesData["Mold and Remediation - Property: Limit-checkbox"]);
    //   await selectgetLiabilityAdditionalResidenceRentedtoOthersCheckBox(coveragesData["Mold and Remediation - Property: Limit"]);
    // }
 
 
     if (coveragesData["Loss of Use: Limit"]) {
      console.log("Dwelling Limit Value: ", coveragesData["Loss of Use: Limit"]);
      await entergetLossOfUseLimittextbox(coveragesData["Loss of Use: Limit"]);
    }
 
    //------------------------------------------------
 
 
    //  if (coveragesData["Mold and Remediation - Property: Limit-checkbox"]) {
    //   console.log("Dwelling All Other Peril Deductible Value: ", coveragesData["Mold and Remediation - Property: Limit"]);
    //   await selectgetLiabilityAdditionalResidenceRentedtoOthersCheckBox(coveragesData["Mold and Remediation - Property: Limit"]);
    // }
 
 
   console.log(`✅ Completed processing coverage data`);
 
    }
    // await getDwellingLimitInputBox().scrollIntoViewIfNeeded();
    // const container = page.locator('#centerPanel');
    // await container.evaluate(el => el.scrollTop = 0);
    // await page.waitForTimeout(300);
    // await captureAndAttachforCore(page, testInfo, "FillCoveragesCorePage 1 of 2", {
    //   fullPage: true
    // });
    // await page.waitForTimeout(3000);
    // await container.evaluate(el => {
    //   el.scrollTop = el.scrollHeight - el.clientHeight;
    // });
    // await page.waitForTimeout(300);
 
    // await captureAndAttachforCore(page, testInfo, "FillCoveragesCorePage 2 of 2", {
    //   fullPage: false
    // });
      console.log(`📸 Capturing full vehicle form with all fields visible`);
  const originalViewport = page.viewportSize();
 
  // Scroll centerPanel to show all content
  // await page.locator('#centerPanel').evaluate(el => {
  //   el.scrollLeft = el.scrollWidth;
  //   el.scrollTop = el.scrollHeight;
  // });
  // await wait(500);
 
  // // Get actual content height from centerPanel
  // const coverageFormHeight = await page.evaluate(() => {
  //   const panel = document.querySelector('#centerPanel') as HTMLElement;
  //   if (panel) {
  //     console.log(`Panel scrollHeight: ${panel.scrollHeight}, clientHeight: ${panel.clientHeight}`);
  //     return Math.max(panel.scrollHeight, panel.clientHeight, document.documentElement.scrollHeight);
  //   }
  //   return document.documentElement.scrollHeight;
  // });
  // console.log(`📐 Calculated content height: ${coverageFormHeight}px`);
 
  // // Set viewport size to capture full page
  // const finalHeight = coverageFormHeight + 100; // Add buffer
  // await page.setViewportSize({
  //   width: 1950,
  //   height: finalHeight
  // });
  // await page.waitForLoadState('domcontentloaded');
  await wait(500);
 
  // // Validate viewport was set correctly
  // const setViewport = await page.viewportSize();
  // console.log(`📐 Set viewport to: ${setViewport?.width}x${setViewport?.height}`);
 
  // if (setViewport?.width !== 1950 || setViewport?.height !== finalHeight) {
  //   console.warn(`⚠️  Viewport mismatch detected! Expected 1950x${finalHeight}, got ${setViewport?.width}x${setViewport?.height}. Setting again...`);
  //   await page.setViewportSize({
  //     width: 1950,
  //     height: finalHeight
  //   });
  //   await page.waitForLoadState('domcontentloaded');
  //   await wait(500);
  //   const retryViewport = await page.viewportSize();
  //   console.log(`📐 Retry viewport: ${retryViewport?.width}x${retryViewport?.height}`);
  // } else {
  //   console.log(`✅ Viewport set correctly: 1950x${finalHeight}`);
  // }
 
  // console.log(`📸 Capturing full vehicle form with all fields visible`);
  // await captureAndAttachforCore(page, testInfo, "FillCoverageCorePage All Fields", {
  //   fullPage: true,
  //   viewportWidth: 1950,
  //   viewportHeight: finalHeight
  // });

  // console.log(`✅ Vehicle form screenshot captured with all fields visible`);

  // // Restore original viewport after screenshot
  // if (originalViewport) {
  //   await page.setViewportSize(originalViewport);
  //   console.log(`🔄 Viewport restored to original: ${originalViewport.width}x${originalViewport.height}`);
  // } else {
  //   await page.setViewportSize({ width: 1280, height: 720 });
  //   console.log(`🔄 Viewport restored to default: 1280x720`);
  // }

    await captureFullPage2D(page, testInfo, "Fill Coverage Core Page All Fields", "#centerPanel");
    await wait(2000);
    await getExclusionsTab().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(7000);
    for (let coveragesData of coverages) {
      if (coveragesData["Specific Building Exclusion: Building Type"] && coveragesData["Specific Building Exclusion: Description"]) {
        console.log("Specific Building Exclusion: Building Type Value: ", coveragesData["Specific Building Exclusion: Building Type"]);
        await selectSpecificBuildingExclusion(coveragesData["Specific Building Exclusion: Building Type"],coveragesData["Specific Building Exclusion: Description"]);
      }

      if (coveragesData["DIC - Fire, Extended Coverage, Vandalism Excl"]) {
        console.log("DIC - Fire, Extended Coverage, Vandalism Excl Value: ", coveragesData["DIC - Fire, Extended Coverage, Vandalism Excl"]);
        await selectDICFireExtendedVandalismExclusion(coveragesData["DIC - Fire, Extended Coverage, Vandalism Excl"]);
      }

      if (coveragesData["DIC - Fire, Lightning, Internal Explosion, Smoke Excl"]) {
        console.log("DIC - Fire, Lightning, Internal Explosion, Smoke Excl Value: ", coveragesData["DIC - Fire, Lightning, Internal Explosion, Smoke Excl"]);
        await selectDICFireLightningInternalExplosionSmokeExclusion(coveragesData["DIC - Fire, Lightning, Internal Explosion, Smoke Excl"]);
      }

      if (coveragesData["Roof Exclusion"]) {
        console.log("Roof Exclusion Value: ", coveragesData["Roof Exclusion"]);
        await selectRoofExclusion(coveragesData["Roof Exclusion"]);
      }

      if (coveragesData["Mold Exclusion - Personal Liability"]) {
        console.log("Mold Exclusion - Personal Liability Value: ", coveragesData["Mold Exclusion - Personal Liability"]);
        await selectMoldExclusionPersonalLiability(coveragesData["Mold Exclusion - Personal Liability"]);
      }

      if (coveragesData["Mold Exclusion - Premises Liability"]) {
        console.log("Mold Exclusion - Premises Liability Value: ", coveragesData["Mold Exclusion - Premises Liability"]);
        await selectMoldExclusionPremisesLiability(coveragesData["Mold Exclusion - Premises Liability"]);
      }

      if (coveragesData["Other Structures Exclusion"]) {
        console.log("Other Structures Exclusion Value: ", coveragesData["Other Structures Exclusion"]);
        await selectOtherStructuresExclusion(coveragesData["Other Structures Exclusion"]);
      }

      if (coveragesData["Windstorm or Hail Exclusion"]) {
        console.log("Windstorm or Hail Exclusion Value: ", coveragesData["Windstorm or Hail Exclusion"]);
        await selectWindstormOrHailExclusion(coveragesData["Windstorm or Hail Exclusion"]);
      }

      if (coveragesData["Animal Liability Exclusion"]) {
        console.log("Animal Liability Exclusion Value: ", coveragesData["Animal Liability Exclusion"]);
        await selectAnimalLiabilityExclusion(coveragesData["Animal Liability Exclusion"]);
      }
    }
    await captureFullPage2D(page, testInfo, "Exclusions In Coverages Core Page","#centerPanel");
    
    await wait(TIMEOUT_4_SECONDS);
    await getCoveragesSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(TIMEOUT_4_SECONDS);

    await wait(2000);

    if (await isElementVisible(getRoofBenefitSchedule())) {
      await getRoofBenefitSchedule().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(7000);
      const pageIndicatorText = await getPageCountIndicator().innerText();
      const pageCountMatch = pageIndicatorText.match(/of\s+(\d+)/);
      const totalPages = pageCountMatch ? parseInt(pageCountMatch[1]) : 1;

      console.log(`📄 Total Roof Benefit Schedule pages to capture: ${totalPages}`);

      // Capture all pages starting from page 1
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`Capturing Roof Benefit Schedule page ${pageNum} of ${totalPages}...`);

        // Capture screenshot with proper title
        await wait(4000);
        await captureFullPage2D(page, testInfo, `Roof Benefit Schedule Page ${pageNum} Screenshot`, "#centerPanel");

        // Click next button to go to next page (skip for last page)
        if (pageNum < totalPages && await isElementVisible(getFormsNextButton())) {
          await getFormsNextButton().click({ timeout: TIMEOUT_8_SECONDS });
          await wait(4000); // Wait for page to load
        } else if (pageNum < totalPages) {
          console.log("Roof Benefit Schedule next button not visible, stopping pagination");
          break;
        }
      }
      console.log(`✅ Captured all ${totalPages} Roof Benefit Schedule pages`);
    } else {
      console.log("Roof Benefit Schedule element not visible");
    }

 
 console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );
 
    if (await isElementVisible(getCoveragesSaveAndNextButton())) {
      await getCoveragesSaveAndNextButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
    }
 
    console.log("Coverage page validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;
  }
 
}
