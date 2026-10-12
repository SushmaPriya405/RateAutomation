
import { expect, Locator, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
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
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../../utils/wordingValidation";
import { validateRulesForTestCase, ValidationResult } from "../../../utils/coreRuleBasedValidation";
import { isUtf8 } from "buffer";
import { selectDropdownWithRetry } from "../HO_Coverages_CorePage";
import { getRoofBenefitSchedule, getPageCountIndicator, getFormsNextButton } from "../DB_Coverages_CorePage";

const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
export const getCoverageHeading = () => getLocator("(//span[@class = 'g-title' and contains(text(), 'Coverages')])[1]");
const getCoveragesSaveAndNextButton = () => getLocator('//span[contains(text(), "Coverages")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getExclusionsTab = () => getLocator("//a[contains(@id, 'VehicleExclusionCoveragesCardTab')]");
const getLiabilitydropdown = () => getLocator("//td[contains(@id, 'LiabilityTermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getMedicalPaymentCheckbox = () => getLocator("//div[contains(text(), 'Medical Payments')]/parent::div//input[@role='checkbox']");
const getMedicalPaymentLimitDropdown = () => getLocator("//td[contains(@id, 'PAMedPayCov-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getUninsuredMotoristsCheckbox = () => getLocator("//div[contains(text(), 'Uninsured Motorists')]/parent::div//input[@role='checkbox']");
const getUninsuredMootoristsDropdown = () => getLocator("//td[contains(@id, 'UMBITermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getUnderinsuredMotoristsCheckbox = () => getLocator("//div[contains(text(), 'Underinsured Motorists')]/parent::div//input[@role='checkbox']");
const getUnderinsuredMootoristsDropdown = () => getLocator("//td[contains(@id, 'UIMBITermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getSpareLimitInputBox = () => getLocator("//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getCollectorCoverageLimitInputBox = () => getLocator("//input[contains(@id, 'CollectorCoverageLimitTerm-inputEl')]");
const getCoverageSettlementOptionDropdown = () => getLocator("//input[contains(@id, 'CovPatternInputGroup:CompSettlementOpt-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getCoverageDeductibleOption = () => getLocator("//td[contains(@id, 'PACompDollarOrPercentDeductibleOptTerm-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getCollisionCheckbox = () => getLocator("//div[contains(text(), 'Collision')]/parent::div//input[@role='checkbox']");
const getCollisionDeductibleOptionDropdown = () => getLocator("//td[contains(@id, 'PACollisionDollarOrPercentDeductibleOptTerm-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTowingandEmergencyExpenseDropdown = () => getLocator("//td[contains(@id, 'CovTermInputSet:OptionTermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTravelLossCheckbox = () => getLocator("//div[contains(text(), 'Travel Loss')]/parent::div//input[@role='checkbox']");
const getNauticalCollectiblesCheckbox = () => getLocator("//div[contains(text(), 'Nautical Collectibles')]/parent::div//input[@role='checkbox']");
const getNauticalCollectiblesLimitInputBox = () => getLocator("//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getHullCheckbox = () => getLocator("//div[contains(text(), 'Hull')]/parent::div//input[@role='checkbox']");
const getHullDeductibleOptionDropdown = () => getLocator("//input[contains(@id, 'HullDeductibleMoney-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHullSettlementOptionDropdown = () => getLocator("//input[contains(@id, 'HullSettlementOpt-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHaulOutLimitDropdown = () => getLocator("//input[contains(@id, ':CovTermInputSet:PackageTermInput-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPerosnalEffectsLimitDropdown = () => getLocator("//div[contains(text(), 'Personal Effects')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPersonalEffectsSettlementOptionDropdown = () => getLocator("//div[contains(text(), 'Personal Effects')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Settlement Option')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTowingLimitDropdown = () => getLocator("//div[contains(text(), 'Towing and Emergency Expense')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTournamentFeeCheckBox = () => getLocator("//div[contains(text(), 'Tournament Fee Reimbursement')]/parent::div//input[@role='checkbox']");
const getBoatLiftCheckBox = () => getLocator("//div[contains(text(), 'Boat Lift')]/parent::div//input[@role='checkbox']");
const getBoatLiftInputBox = () => getLocator("//div[contains(text(), 'Boat Lift')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getLiveaboard = () => getLocator("//div[contains(text(), 'Liveaboard')]/parent::div//input[@role='checkbox']");
const getGenuinePartsSecurityCheckBox = () => getLocator("//div[contains(text(), 'Genuine Parts Security')]/parent::div//input[@role='checkbox']");
const getRentalReimbursementCheckBox = () => getLocator("//div[contains(text(), 'Rental Reimbursement')]/parent::div//input[@role='checkbox']");
const getRentalReimbursementLimitDropdown = () => getLocator("//div[contains(text(), 'Rental Reimbursement')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Days/limit per day')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPortRiskCheckBox = () => getLocator("//div[contains(text(), 'Port Risk')]/parent::div//input[@role='checkbox']");
const getPortRiskInOutWaterDropDown = () => getLocator("//div[contains(text(), 'Port Risk')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'In / Out of Water')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getWaterSportsLiabilityExclusionCheckBox = () => getLocator("//div[contains(text(), 'Watersports Liability Exclusion')]/parent::div//input[@role='checkbox']");
const getSailBoatRiggingExclusioncheckbox = () => getLocator("//div[contains(text(), 'Sailboat Rigging Exclusion')]/parent::div//input[@role='checkbox']");
const getNamedDriverCheckbox = () => getLocator("//div[contains(text(), 'Named Driver')]/parent::div//input[@role='checkbox']");
const getTrailerPhysicalDamageLimitInputBox = () => getLocator("//div[contains(text(), 'Trailer Physical Damage')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getTrailerPhysicalDamageSettlementOptionDropdown = () => getLocator("//div[contains(text(), 'Trailer Physical Damage')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Settlement Option')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getProfessionalAnglerCheckBox = () => getLocator("//div[contains(text(), 'Professional Angler')]/parent::div//input[@role='checkbox']");
const getBowToSternCheckBox = () => getLocator("//div[contains(text(), 'Bow to Stern')]/parent::div//input[@role='checkbox']");
const getExcessSaleOfFishCheckBox = () => getLocator("//div[contains(text(), 'Excess Sale of Fish')]/parent::div//input[@role='checkbox']");
const getCharteredFishingCheckBox = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div//input[@role='checkbox']");
const getDaysofChartedFishingInput = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Days')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getPassengerChartedFishingInput = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Passengers')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getUseChartedFishingDropdown = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Use')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getExtendedPartsReplacementCheckBox = () => getLocator("//div[contains(text(), 'Extended Parts Replacement')]/parent::div//input[@role='checkbox']");
const getExtendedPartsReplacementDropDown = () => getLocator("//div[contains(text(), 'Extended Parts Replacement')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Years')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getVehicle2 = () => getLocator("//tbody[contains(@id,'gridview')]//tr[2]//td[1]");
const getVehicle3 = () => getLocator("//tbody[contains(@id,'gridview')]//tr[3]//td[1]");
const getCoverageExclusionsButton = () => getLocator("//span[contains(text(),'Exclusions')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PAVehicleExclusionCoveragesCardTab']");
const getCoverageExclusionsAllVehiclesButton = () => getLocator("//span[contains(text(),'Exclusions')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PolicyExclusionsTab']");
const getCoverage = () => getLocator("//span[contains(text(),'Coverages')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:VehicleCoverageDetailsCardTab']");
import { getYesDiminishingDeductible,getNoDiminishingDeductible } from "./MS_Coverage_CorePage";
import { getWarningMsgCore } from "./CV_RiskAnaysis_CorePage";
export const getQuoteinCoveragesButton = () => getLocator("//span[contains(@id, 'PersonalAutoScreen') and contains(text(), 'Coverages')]/ancestor::*//span[contains(@id, 'QuoteOrReview-btnWrap')]");
export const getClearButton = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
export const getErrorIconCore = () => getLocator("//img[@class='error_icon']/parent::div[@class='message']");

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
  const control = resolveLocator(controlRef);
  const value = String(rawValue ?? "").trim();
 
  if (!(await isElementVisible(control))) {
    throw new Error(`${label} input is not visible`);
  }
 
  await clear(control);
  await wait(500);
  await click(control);
  await fill(control, value);
  console.log(`✅ ${label} set to: ${value}`);
}
 
// async function selectDropdownWithRetry(
//   triggerRefs: LocatorOrFactory | LocatorOrFactory[],
//   rawValue: string,
//   options: DropdownHandlerOptions = {}
// ): Promise<void> {
//   const value = String(rawValue ?? "").trim();
//   const label = options.label ?? "Dropdown";
//   const dropdownValue = label.toLowerCase().includes("percentage")
//     ? normalizePercentageDropdownValue(value)
//     : normalizeDropdownValue(value);
//   const maxAttempts = options.maxAttempts ?? 5;
//   const postClickWaitMs = options.postClickWaitMs ?? 1000;
//   const retryWaitMs = options.retryWaitMs ?? 500;
//   const triggerList = Array.isArray(triggerRefs) ? triggerRefs : [triggerRefs];
 
//   const normalizedDropdownValue = dropdownValue.toLowerCase();
//   if (normalizedDropdownValue === "select" || normalizedDropdownValue === "do not select") {
//     console.log(`ℹ️ ${label} value='${dropdownValue}' is not an actionable dropdown selection. Skipping dropdown action.`);
//     return;
//   }

//   const optionLocator = options.optionLocator
//     ? options.optionLocator(dropdownValue)
//     : getLocator(`//ul[@class='x-list-plain']//li[text()='${dropdownValue}']` || `(//ul[@class='x-list-plain']//li[text()='${dropdownValue}'])[2]`);

//   let opened = false;
 
//   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//     let clickedAnyTrigger = false;
 
//     for (const triggerRef of triggerList) {
//       const trigger = resolveLocator(triggerRef);
//       if (await isElementVisible(trigger)) {
//         await trigger.click({ force: true }).catch(async () => {
//           await click(trigger);
//         });
//         await wait(2000);
//         clickedAnyTrigger = true;
//         await wait(postClickWaitMs);
 
//         if (await isElementVisible(optionLocator)) {
//           opened = true;
//           break;
//         }
//       }
//     }
 
//     if (opened) {
//       break;
//     }

//     console.log(`⚠️ ${label} option '${dropdownValue}' not visible on attempt ${attempt}${clickedAnyTrigger ? "" : " (no visible trigger)"}`);
//     await wait(retryWaitMs);
//   }
 
//   if (!(await isElementVisible(optionLocator))) {
//     throw new Error(`Failed to open ${label} dropdown for value '${dropdownValue}' after ${maxAttempts} attempts`);
//   }
 
//   await click(optionLocator);
//   console.log(`✅ ${label} selected: ${dropdownValue}`);
// }


async function selectCollisionCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getCollisionCheckbox(),
    String(value ?? "")
  );
}
async function selectProfessionalAnglerCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getProfessionalAnglerCheckBox(),
    String(value ?? "")
  );
}
async function selectExcessSaleOfFishCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getExcessSaleOfFishCheckBox(),
    String(value ?? "")
  );
}

async function selectBowToSSternCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getBowToSternCheckBox(),
    String(value ?? "")
  );
}

async function selectTravelLossCheckBox(value: any) {
  await handleCheckboxOnlySelection(//cb
    getTravelLossCheckbox(),
    String(value ?? "")
  );            
}

async function selectNauticalCollectiblesCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getNauticalCollectiblesCheckbox(),
    String(value ?? "")
  );
}
async function selectNauticalCollectiblesLimit(value: any) {
  await handleCoverageSectionSelection(//cb with child
    getNauticalCollectiblesCheckbox,
    getNauticalCollectiblesLimitInputBox,
    String(value ?? ""),
   { controlType: "input"}
  )
}
async function selectCharteredFishingCheckBox(value: any) {
  await handleCoverageSectionSelection(
    getCharteredFishingCheckBox(),
    getDaysofChartedFishingInput(),
    String(value ?? ""),
    { controlType: "input"}
  );
}
async function selectgetPassengerChartedFishingInput(value: any) {
  await setCoverageInputValue(// i/p, dd
    getPassengerChartedFishingInput,
    String(value ?? ""),
    "Passengers of Chartered Fishing"
  );
}
async function selectUseChartedFishingDropdown(value: any) {
  await selectDropdownWithRetry(
    getUseChartedFishingDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Use Chartered Fishing" }
  );
}

async function selectHullDeductibleOption(value: any) {
  await handleCoverageSectionSelection(
    getHullCheckbox,
    getHullDeductibleOptionDropdown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
  )
}
async function selectExtendedPartsReplacement(value: any) {
  await handleCoverageSectionSelection(
    getExtendedPartsReplacementCheckBox,
    getExtendedPartsReplacementDropDown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
  )
}
async function selectHullSettlementOption(value: any) {
  // Check if Hull checkbox is already selected by checking if settlement dropdown is visible
  const isDropdownVisible = await isElementVisible(getHullSettlementOptionDropdown());
  
  if (!isDropdownVisible) {
    console.log("⚠️ Hull Settlement Option dropdown not visible - selecting Hull checkbox first...");
    
    // Select Hull checkbox to make the settlement dropdown visible
    const checkboxSelected = await clickCheckboxWithVerification(
      getHullCheckbox(), 
      true, 
      getHullSettlementOptionDropdown
    );
    
    if (!checkboxSelected) {
      throw new Error("Failed to select Hull checkbox for Settlement Option");
    }
    
    console.log("✅ Hull checkbox selected, settlement dropdown should now be visible");
    await wait(1500); // Wait for UI to update
  } else {
    console.log("✅ Hull Settlement Option dropdown already visible (Hull checkbox already selected)");
  }
  
  // Now select the settlement option
  await selectDropdownWithRetry(
    getHullSettlementOptionDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Hull Settlement Option", postClickWaitMs: 1500 }
  )
}

async function selectPersonalEffectsLimit(value: any) {
  await selectDropdownWithRetry(
    getPerosnalEffectsLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Personal Effects Limit" }
  )
}

async function selectPersonalEffectsSettlementOption(value: any) {
  await selectDropdownWithRetry(
    getPersonalEffectsSettlementOptionDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Personal Effects Settlement Option" }
  )
}
async function selectTowingLimit(value: any) {
  await selectDropdownWithRetry(
    getTowingLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Towing Limit" }
  )
}


async function selectHaulOutLimit(value: any) {
  await selectDropdownWithRetry(
    getHaulOutLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Haul Out Limit" }
  )
}


async function selectTournamentFeeCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getTournamentFeeCheckBox(),
    String(value ?? "")
  );
}

async function selectBoatLift(value: any) {
  await handleCoverageSectionSelection
  (
    getBoatLiftCheckBox,
    getBoatLiftInputBox,
    String(value ?? "")
  );
}

async function selectLiveaboard(value: any){
  await handleCheckboxOnlySelection
  (
    getLiveaboard(),
    String(value ?? "")
  );
}

async function selectGenuinePartsSecurityCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getGenuinePartsSecurityCheckBox(),
    String(value ?? "")
  );
}


async function selectRentalReimbursement(value: any) {
  await handleCoverageSectionSelection(
    getRentalReimbursementCheckBox,
    getRentalReimbursementLimitDropdown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
  )
}

async function selectPortRiskInOutWater(value: any) {
  await handleCoverageSectionSelection(
    getPortRiskCheckBox,
    getPortRiskInOutWaterDropDown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
  )
}

async function selectWaterSportsLiabilityExclusionCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getWaterSportsLiabilityExclusionCheckBox(),
    String(value ?? "")
  );
}

async function selectSailBoatRiggingExclusionCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getSailBoatRiggingExclusioncheckbox(),
    String(value ?? "")
  );
}

async function selectNamedDriverCheckBox(value: any) {
  await handleCheckboxOnlySelection(
    getNamedDriverCheckbox(),
    String(value ?? "")
  );
}

async function selectTrailerPhysicalDamageLimit(value: any) {
  await setCoverageInputValue(
    getTrailerPhysicalDamageLimitInputBox,
   
    String(value ?? ""),
    "Trailer Physical Damage Limit"
  )
}

async function selectTrailerPhysicalDamageSettlementOption(value: any) {
  await selectDropdownWithRetry(
    getTrailerPhysicalDamageSettlementOptionDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Trailer Physical Damage Settlement Option" }
  )
}

// async function selectLiablityLimit(value: any) {
//   const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
//       const maxAttempts = 8;
//       const attemptDelay = 500; // ms
   
//       for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//           // Click to open the drop-down / refresh list
          // await getLiabilitydropdown().click({ force: true }).catch(() => {});
   
//           try {
//               // Small wait for the option to appear
//               await optionLocator.waitFor({ state: "visible", timeout: 1000 });
//               // Option is present and visible, click it and return
//               await click(optionLocator);
//               console.log(`selectConstructionType: selected '${value}' on attempt ${attempt}`);
//               return;
//           } catch {
//               // Not yet visible — wait and try again
//               await wait(attemptDelay);
//           }
//       }
   
//       throw new Error(`selectConstructionType: option '${value}' not found after ${maxAttempts} attempts`);
//   }

async function selectLiabilityLimit(value: number) {
  await selectDropdownWithRetry(
    getLiabilitydropdown,
    String(value ?? ""),
    { maxAttempts: 8, label: "Liability Limit" }
  );
}


async function selectMedicalPayment(value: number) {
  await selectDropdownWithRetry(
    getMedicalPaymentLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 8, label: "Medical Payment Limit" }
   );
}
 
//}

async function selectUninsuredMotorists(
  uninsuredMotoristscheck: string,
  uninsuredMotoristsOption: string
) {
 
    if (uninsuredMotoristscheck ==="Select") {
     if (await isElementVisible(getUninsuredMotoristsCheckbox())) {
      await getUninsuredMotoristsCheckbox().click({force:true});
  const valueString = uninsuredMotoristsOption.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueString}']`);
      const maxAttempts = 8;
      const attemptDelay = 500;
   
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          // Click to open the drop-down / refresh list
          await getUninsuredMootoristsDropdown().click({ force: true }).catch(() => {});
   
          try {
              // Small wait for the option to appear
              await optionLocator.waitFor({ state: "visible", timeout: 1000 });
              // Option is present and visible, click it and return
              await click(optionLocator);
              console.log(`selectConstructionType: selected '${valueString}' on attempt ${attempt}`);
              return;
          } catch {
              // Not yet visible — wait and try again
              await wait(attemptDelay);
          }
      }
   
      throw new Error(`selectUninsuredMotorists: option '${valueString}' not found after ${maxAttempts} attempts`);
  }
}
 
}

async function selectUnderinsuredMotorists(
  underinsuredMotoristscheck: string,
  underinsuredMotoristsOption: string
) {
 
    if (underinsuredMotoristscheck === "Select") {
     if (await isElementVisible(getUnderinsuredMotoristsCheckbox())) {
      await getUnderinsuredMotoristsCheckbox().click({force:true});
  const valueString = underinsuredMotoristsOption.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueString}']`);
      const maxAttempts = 8;
      const attemptDelay = 500;
   
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          // Click to open the drop-down / refresh list
          await getUnderinsuredMootoristsDropdown().click({ force: true }).catch(() => {});
   
          try {
              // Small wait for the option to appear
              await optionLocator.waitFor({ state: "visible", timeout: 1000 });
              // Option is present and visible, click it and return
              await click(optionLocator);
              console.log(`selectConstructionType: selected '${valueString}' on attempt ${attempt}`);
              return;
          } catch {
              // Not yet visible — wait and try again
              await wait(attemptDelay);
          }
      }
   
      throw new Error(`selectUnderinsuredMotorists: option '${valueString}' not found after ${maxAttempts} attempts`);
  }
}
 
}

async function enterSparePartsLimit(limit: number) {
  console.log("Spare parts limit from excel:", limit);
  if (limit != null) {
    await getSpareLimitInputBox().click({force: true});
      await fill(getSpareLimitInputBox(),limit.toString().replace(/[$,]/g, ""));
      await wait(2000);
  }
}

async function enterCollectorCoverageLimit(coveragelimit: number) {
  console.log("Collector Coverage limit from excel:", coveragelimit);
  if (coveragelimit != null) {
    await getCollectorCoverageLimitInputBox().click({force: true});
    await fill(getCollectorCoverageLimitInputBox(),coveragelimit.toString().replace(/[$,]/g, ""));
    await wait(2000);
  }
}

async function selectTowingAndEmergencyExpense(
  towing: number,

) {

  if (towing != null) {
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${towing}']`);
        const maxAttempts = 8;
        const attemptDelay = 500; // ms
     
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            // Click to open the drop-down / refresh list
            await getTowingandEmergencyExpenseDropdown().click({ force: true }).catch(() => {});
     
            try {
                // Small wait for the option to appear
                await optionLocator.waitFor({ state: "visible", timeout: 1000 });
                // Option is present and visible, click it and return
                await click(optionLocator);
                console.log(`selectConstructionType: selected '${towing}' on attempt ${attempt}`);
                return;
            } catch {
                // Not yet visible — wait and try again
                await wait(attemptDelay);
            }
        }
     
        throw new Error(`selectMake: option '${towing}' not found after ${maxAttempts} attempts`);
  }
  }

async function selectComprehensiveDeductibleOption(
  comprehensivedeductibleoption: number,
) {
  if (comprehensivedeductibleoption != null) {
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${"$"+comprehensivedeductibleoption.toString()}']`);
        const maxAttempts = 8;
        const attemptDelay = 500; // ms
     
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            // Click to open the drop-down / refresh list
            await getCoverageDeductibleOption().click({ force: true }).catch(() => {});
     
            try {
                // Small wait for the option to appear
                await optionLocator.waitFor({ state: "visible", timeout: 1000 });
                // Option is present and visible, click it and return
                await click(optionLocator);
                console.log(`selectcomprehensivedeductibleoption: selected '${comprehensivedeductibleoption}' on attempt ${attempt}`);
                return;
            } catch {
                // Not yet visible — wait and try again
                await wait(attemptDelay);
            }
        }
     
        throw new Error(`selectMake: option '${comprehensivedeductibleoption}' not found after ${maxAttempts} attempts`);
  }
  }

async function selectComprehensiveSettlementOption(
  comprehensivesettlementoption: string,
) {
  if (comprehensivesettlementoption != null) {
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${comprehensivesettlementoption}']`);
        const maxAttempts = 8;
        const attemptDelay = 500; // ms
     
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            // Click to open the drop-down / refresh list
            await getCoverageSettlementOptionDropdown().click({ force: true }).catch(() => {});
     
            try {
                // Small wait for the option to appear
                await optionLocator.waitFor({ state: "visible", timeout: 1000 });
                // Option is present and visible, click it and return
                await click(optionLocator);
                console.log(`selectcomprehensivedeductibleoption: selected '${comprehensivesettlementoption}' on attempt ${attempt}`);
                return;
            } catch {
                // Not yet visible — wait and try again
                await wait(attemptDelay);
            }
        }
     
        throw new Error(`selectMake: option '${comprehensivesettlementoption}' not found after ${maxAttempts} attempts`);
  }
  }

  async function selectCollisionDeductibleOption(
  collisionDeductibleoption: number,
) {
  if (collisionDeductibleoption != null) {
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${"$"+collisionDeductibleoption.toString()}']`);
        const maxAttempts = 8;
        const attemptDelay = 500; // ms
     
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            // Click to open the drop-down / refresh list
            await getCollisionDeductibleOptionDropdown().click({ force: true }).catch(() => {});
     
            try {
                // Small wait for the option to appear
                await optionLocator.waitFor({ state: "visible", timeout: 1000 });
                // Option is present and visible, click it and return
                await click(optionLocator);
                console.log(`selectcomprehensivedeductibleoption: selected '${collisionDeductibleoption}' on attempt ${attempt}`);
                return;
            } catch {
                // Not yet visible — wait and try again
                await wait(attemptDelay);
            }
        }
     
        throw new Error(`selectMake: option '${collisionDeductibleoption}' not found after ${maxAttempts} attempts`);
  }
  }
async function selectHullDimishingDeductible(value: any) {
  if (await getYesDiminishingDeductible().isVisible() || await isElementVisible(getYesDiminishingDeductible())) {
  await getYesDiminishingDeductible().scrollIntoViewIfNeeded();
  if (value === "Yes") {
    await getYesDiminishingDeductible().click({ force: true });
  } else {
    await getNoDiminishingDeductible().click({ force: true });
  }
}
}
// Main function to fill all coverages fields
export async function fillCoveragesCorePage(page: Page, testInfo: TestInfo, Quote: any[], ruleMatrix: Record<string, Record<string, any>>,
    blockingContext: string,
    testCaseId: any,): Promise<ValidationResult> {
  await wait(TIMEOUT_4_SECONDS);
    try {
  
  // Clear any previous risk analysis data first
  for (let i = 0; i < 5; i++) {
    if (await isElementVisible(getClearButton())) {
      // await captureFullPage2D(page, testInfo, `Warning In Coverages Page`, "#centerPanel");
      await captureAndAttachforCore(page,testInfo,`Warning In Coverages Page`,{fullPage:true});
      if(await isElementVisible(getClearButton())){
        console.log("Clear button is visible, clicking on it");
        await getClearButton().click();
      }
      await wait(5000);
    } else {
      break; // stop the loop if not visible
    }
  }
       
  for (let [index,QuoteData] of Quote.entries()) {
    //console.log(QuoteData);
    //await reloadPage();
      console.log("1");
        const liabilityValuefromexcel = QuoteData["Liability - Bodily Injury and Property Damage: Limit"];
        if (liabilityValuefromexcel) {
          await selectLiabilityLimit(liabilityValuefromexcel);
        }
        if(QuoteData["Medical Payments: Limit"]){
          console.log("Medical Payments Limit from excel:", QuoteData["Medical Payments: Limit"]);
          await selectMedicalPayment(QuoteData["Medical Payments: Limit"]);
        }
        //Travel Loss Should be after Hull Coverage.
        // if(QuoteData["Travel Loss: Per day/Per occurrence"]) {
        //   console.log("Travel Loss value from excel:", QuoteData["Travel Loss: Per day/Per occurrence"]);
        //   await selectTravelLossCheckBox(QuoteData["Travel Loss: Per day/Per occurrence"]);
        // }
        // if(QuoteData["Nautical Collectibles: Deductible"]){
        //   await selectNauticalCollectiblesCheckBox(QuoteData["Nautical Collectibles: Deductible"]);
        // }
        // if(QuoteData["Nautical Collectibles: Limit"]){
        //   console.log("Nautical Collectibles Limit from excel:", QuoteData["Nautical Collectibles: Limit"]);
        //   await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Limit"]);
        // }

       
      if (QuoteData["Transaction"]?.includes("Vehicle 1")) {

        if(QuoteData["Hull: Deductible"]){
          console.log("Hull Deductible from excel:", QuoteData["Hull: Deductible"]);
          await selectHullDeductibleOption(QuoteData["Hull: Deductible"]);
        }

        if(QuoteData["Hull: Settlement Option"]){
          console.log("Hull Settlement Option from excel:", QuoteData["Hull: Settlement Option"]);
          await selectHullSettlementOption(QuoteData["Hull: Settlement Option"])
        }
        if(QuoteData["Hull: Diminishing Deductible"]){
          console.log("Hull : Dimishing Deductible from excel:", QuoteData["Hull: Diminishing Deductible"]);
          await selectHullDimishingDeductible(QuoteData["Hull: Diminishing Deductible"])
        }
        if(QuoteData["Travel Loss: Per day/Per occurrence"]) {
          console.log("Travel Loss value from excel:", QuoteData["Travel Loss: Per day/Per occurrence"]);
          await selectTravelLossCheckBox(QuoteData["Travel Loss: Per day/Per occurrence"]);
        }
        if(QuoteData["Nautical Collectibles: Limit"]){
          console.log("Nautical Collectibles Limit from excel:", QuoteData["Nautical Collectibles: Limit"]);
          await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Limit"]);
        }
        if(QuoteData["Nautical Collectibles: Deductible"]){
          console.log("Nautical Collectibles: Deductible from excel:", QuoteData["Nautical Collectibles: Deductible"]);
          await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Deductible"]);
        }
        if(QuoteData["Personal Effects: Limit"]){
          console.log("Personal Effects Limit from excel:", QuoteData["Personal Effects: Limit"]);
          await selectPersonalEffectsLimit(QuoteData["Personal Effects: Limit"]);
        }
        if(QuoteData["Personal Effects: Settlement Option"]){
          console.log("Personal Effects Settlement Option from excel:", QuoteData["Personal Effects: Settlement Option"]);
          await selectPersonalEffectsSettlementOption(QuoteData["Personal Effects: Settlement Option"])
        }
        if(QuoteData["Towing and Emergency Expense: Limit"]){
            console.log("Towing and Emergency Expense Limit from excel:", QuoteData["Towing and Emergency Expense: Limit"]);
          await selectTowingLimit(QuoteData["Towing and Emergency Expense: Limit"]);
        }
        if(QuoteData["Haul Out: Limit"]){
          console.log("Haul Out Limit from excel:", QuoteData["Haul Out: Limit"]);
          await selectHaulOutLimit(QuoteData["Haul Out: Limit"]);
        }
       
        if(QuoteData["Tournament Fee Reimbursement: Limit"]){
          console.log("Tournament Fee Reimbursement Limit from excel:", QuoteData["Tournament Fee Reimbursement: Limit"]);
          await selectTournamentFeeCheckBox(QuoteData["Tournament Fee Reimbursement: Limit"]);
        }
        if(QuoteData["Professional Angler"]){
          console.log("Professional Angler from excel:", QuoteData["Professional Angler"]);
          await selectProfessionalAnglerCheckBox(QuoteData["Professional Angler"]);
        }
        if(QuoteData["Boat Lift: Limit"]){
          console.log("Boat Lift Limit from excel:", QuoteData["Boat Lift: Limit"]);
          await selectBoatLift(QuoteData["Boat Lift: Limit"]);
        }
        if(QuoteData["Extended Parts Replacement: Years"]){
          console.log("Extended Parts Replacement Years from excel:", QuoteData["Extended Parts Replacement: Years"]);
          await selectExtendedPartsReplacement(QuoteData["Extended Parts Replacement: Years"]);
        }
        if(QuoteData["Bow To Stern"]){
          console.log("Bow To Stern from excel:", QuoteData["Bow To Stern"]);
          await selectBowToSSternCheckBox(QuoteData["Bow To Stern"]);
        }
        if(QuoteData["Excess Sale of Fish"]){
          console.log("Excess Sale of Fish from excel:", QuoteData["Excess Sale of Fish"]);
          await selectExcessSaleOfFishCheckBox(QuoteData["Excess Sale of Fish"]);
        }
        if(QuoteData["Liveaboard"]){
          console.log("Liveaboard value from excel:", QuoteData["Liveaboard"]);
          await selectLiveaboard(QuoteData["Liveaboard"]);
        }
        if(QuoteData["Chartered Fishing Guide: # Days"]){
          console.log("Chartered Fishing Guide # Days from excel:", QuoteData["Chartered Fishing Guide: # Days"]);
          await selectCharteredFishingCheckBox(QuoteData["Chartered Fishing Guide: # Days"]);
        }
        if(QuoteData["Chartered Fishing Guide: # Passengers"]){
          console.log("Chartered Fishing Guide # Passengers from excel:", QuoteData["Chartered Fishing Guide: # Passengers"]);
          await selectgetPassengerChartedFishingInput(QuoteData["Chartered Fishing Guide: # Passengers"]);
        }
        if(QuoteData["Chartered Fishing Guide: Use"]){
          console.log("Chartered Fishing Guide Use from excel:", QuoteData["Chartered Fishing Guide: Use"]);
          await selectUseChartedFishingDropdown(QuoteData["Chartered Fishing Guide: Use"]);
        }
        if(QuoteData["Genuine Parts Security"]){
          console.log("Genuine Parts Security from excel:", QuoteData["Genuine Parts Security"]);
          await selectGenuinePartsSecurityCheckBox(QuoteData["Genuine Parts Security"]);
        }
        if(QuoteData["Rental Reimbursement: Days/limit per day"]){
          console.log("Rental Reimbursement from excel:", QuoteData["Rental Reimbursement: Days/limit per day"]);
          await selectRentalReimbursement(QuoteData["Rental Reimbursement: Days/limit per day"]);
        }
        if(QuoteData["Port Risk: In / Out of Water"]){
          console.log("Port Risk In/Out of Water from excel:", QuoteData["Port Risk: In / Out of Water"]);
          await selectPortRiskInOutWater(QuoteData["Port Risk: In / Out of Water"]);
        }
      if(QuoteData["Named Driver"]){
        console.log("Named Driver from excel:", QuoteData["Named Driver"]);
        await selectNamedDriverCheckBox(QuoteData["Named Driver"]);
      }
      if(QuoteData["Trailer Physical Damage: Limit"]){
        console.log("Trailer Physical Damage Limit from excel:", QuoteData["Trailer Physical Damage: Limit"]);
        await selectTrailerPhysicalDamageLimit(QuoteData["Trailer Physical Damage: Limit"]);
      }
      if(QuoteData["Trailer Physical Damage: Settlement Option"]){
        console.log("Trailer Physical Damage Settlement Option from excel:", QuoteData["Trailer Physical Damage: Settlement Option"]);
        await selectTrailerPhysicalDamageSettlementOption(QuoteData["Trailer Physical Damage: Settlement Option"])
      }
         console.log("waiting before capturing screenshots of vehicle 1 coverages");
      await wait(8000);
      // const container = page.locator('#centerPanel');
      //   await container.evaluate(el => el.scrollTop = 0);
      //   await page.waitForTimeout(300);
      //   await captureAndAttachforCore(page, testInfo, "FillCoveragesCorePage of 1st vehicle 1 of 2", {
      //     fullPage: true
      //   });
      //   await page.waitForTimeout(3000);
      //   await container.evaluate(el => {
      //     el.scrollTop = el.scrollHeight - el.clientHeight;
      //   });
      //   await page.waitForTimeout(300);
    
      //   await captureAndAttachforCore(page, testInfo, "FillCoveragesCorePage of 1st vehicle 2 of 2", {
      //     fullPage: false
      //   });
      await captureFullPage2D(page, testInfo, `Coverage Details For Vehicle${index+1}`, "#centerPanel");
        await wait(2000);

        await wait(5000);
        await getExclusionsTab().click({ timeout: TIMEOUT_8_SECONDS });
        await wait(5000);
        if (QuoteData["Watersports Liability Exclusion"]) {
          console.log("Water Sports Liability Exclusion from excel:", QuoteData["Watersports Liability Exclusion"]);
          await selectWaterSportsLiabilityExclusionCheckBox(QuoteData["Watersports Liability Exclusion"]);
        }
        if (QuoteData["Sailboat Rigging Exclusion"]) {
          console.log("Sailboat Rigging Exclusion from excel:", QuoteData["Sailboat Rigging Exclusion"]);
        }
        console.log("waiting before capturing screenshots of vehicle 1 coverages");
      await wait(8000);
        await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For Vehicle${index + 1}`, "#centerPanel");
      }

      if (QuoteData["Transaction"]?.includes("Vehicle 2")) {
        if (await getVehicle2().isVisible()) {
        await getVehicle2().dblclick();
        await wait(3000);
        await getCoverage().scrollIntoViewIfNeeded();
        console.log("Clicked on Vehicle 2 to open coverages");
        await getCoverage().click({force:true});
        await wait(2000);
        if(QuoteData["Hull: Deductible"]){
          console.log("Hull Deductible from excel:", QuoteData["Hull: Deductible"]);
          await selectHullDeductibleOption(QuoteData["Hull: Deductible"]);
        }

        if(QuoteData["Hull: Settlement Option"]){
          console.log("Hull Settlement Option from excel:", QuoteData["Hull: Settlement Option"]);
          await selectHullSettlementOption(QuoteData["Hull: Settlement Option"])
        }
        if (QuoteData["Hull: Diminishing Deductible"]) {
          console.log("Hull : Dimishing Deductible from excel:", QuoteData["Hull: Diminishing Deductible"]);
          await selectHullDimishingDeductible(QuoteData["Hull: Diminishing Deductible"])
        }
        if(QuoteData["Travel Loss: Per day/Per occurrence"]) {
          console.log("Travel Loss value from excel:", QuoteData["Travel Loss: Per day/Per occurrence"]);
          await selectTravelLossCheckBox(QuoteData["Travel Loss: Per day/Per occurrence"]);
        }
        if (QuoteData["Nautical Collectibles: Limit"]) {
          console.log("Nautical Collectibles Limit from excel:", QuoteData["Nautical Collectibles: Limit"]);
          await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Limit"]);
        }
        if (QuoteData["Nautical Collectibles: Deductible"]) {
          console.log("Nautical Collectibles: Deductible from excel:", QuoteData["Nautical Collectibles: Deductible"]);
          await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Deductible"]);
        }
        if(QuoteData["Personal Effects: Limit"]){
          console.log("Personal Effects Limit from excel:", QuoteData["Personal Effects: Limit"]);
          await selectPersonalEffectsLimit(QuoteData["Personal Effects: Limit"]);
        }
        if(QuoteData["Personal Effects: Settlement Option"]){
          console.log("Personal Effects Settlement Option from excel:", QuoteData["Personal Effects: Settlement Option"]);
          await selectPersonalEffectsSettlementOption(QuoteData["Personal Effects: Settlement Option"])
        }
        if(QuoteData["Towing and Emergency Expense: Limit"]){
          console.log("Towing and Emergency Expense Limit from excel:", QuoteData["Towing and Emergency Expense: Limit"]);
          await selectTowingLimit(QuoteData["Towing and Emergency Expense: Limit"]);
        }
        if(QuoteData["Haul Out: Limit"]){
          console.log("Haul Out Limit from excel:", QuoteData["Haul Out: Limit"]);
          await selectHaulOutLimit(QuoteData["Haul Out: Limit"]);
        }
        if(QuoteData["Tournament Fee Reimbursement: Limit"]){
          console.log("Tournament Fee Reimbursement Limit from excel:", QuoteData["Tournament Fee Reimbursement: Limit"]);
          await selectTournamentFeeCheckBox(QuoteData["Tournament Fee Reimbursement: Limit"]);
        }
        if(QuoteData["Boat Lift: Limit"]){
          console.log("Boat Lift Limit from excel:", QuoteData["Boat Lift: Limit"]);
          await selectBoatLift(QuoteData["Boat Lift: Limit"]);
        }
        if(QuoteData["Genuine Parts Security"]){
          console.log("Genuine Parts Security from excel:", QuoteData["Genuine Parts Security"]);
          await selectGenuinePartsSecurityCheckBox(QuoteData["Genuine Parts Security"]);
        }
        if(QuoteData["Rental Reimbursement: Days/limit per day"]){
          console.log("Rental Reimbursement from excel:", QuoteData["Rental Reimbursement: Days/limit per day"]);
          await selectRentalReimbursement(QuoteData["Rental Reimbursement: Days/limit per day"]);
        }
        if(QuoteData["Port Risk: In / Out of Water"]){
          console.log("Port Risk In/Out of Water from excel:", QuoteData["Port Risk: In / Out of Water"]);
          await selectPortRiskInOutWater(QuoteData["Port Risk: In / Out of Water"]);
        }
      if(QuoteData["Named Driver"]){
        console.log("Named Driver from excel:", QuoteData["Named Driver"]);
        await selectNamedDriverCheckBox(QuoteData["Named Driver"]);
      }
      if(QuoteData["Trailer Physical Damage: Limit"]){
        console.log("Trailer Physical Damage Limit from excel:", QuoteData["Trailer Physical Damage: Limit"]);
        await selectTrailerPhysicalDamageLimit(QuoteData["Trailer Physical Damage: Limit"]);
      }
      if(QuoteData["Trailer Physical Damage: Settlement Option"]){
        console.log("Trailer Physical Damage Settlement Option from excel:", QuoteData["Trailer Physical Damage: Settlement Option"]);
        await selectTrailerPhysicalDamageSettlementOption(QuoteData["Trailer Physical Damage: Settlement Option"])
      }

      console.log("waiting before capturing screenshots of vehicle 2 coverages");
      await wait(8000);
        //   const container = page.locator('#centerPanel');
        // await container.evaluate(el => el.scrollTop = 0);
        // await page.waitForTimeout(300);
        await captureFullPage2D(page, testInfo, `Coverage Details For Vehicle${index+1}`, "#centerPanel");
        // await page.waitForTimeout(3000);
        // await container.evaluate(el => {
        //   el.scrollTop = el.scrollHeight - el.clientHeight;
        // });
        // await page.waitForTimeout(300);
    
        // await captureAndAttachforCore(page, testInfo, "FillCoveragesCorePage of 2nd vehicle 2 of 2", {
        //   fullPage: false
        // });
        
      
        await wait(5000);
        
        await getExclusionsTab().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(5000);
      if(QuoteData["Watersports Liability Exclusion"]){
        console.log("Water Sports Liability Exclusion from excel:", QuoteData["Watersports Liability Exclusion"]);
          await selectWaterSportsLiabilityExclusionCheckBox(QuoteData["Watersports Liability Exclusion"]);
        }
if(QuoteData["Sailboat Rigging Exclusion"]){
    console.log("Sailboat Rigging Exclusion from excel:", QuoteData["Sailboat Rigging Exclusion"]);
    await selectSailBoatRiggingExclusionCheckBox(QuoteData["Sailboat Rigging Exclusion"]);
  }
  console.log("waiting before capturing screenshots of vehicle 2 coverages");
      await wait(8000);
        await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For Vehicle${index + 1}`, "#centerPanel");
      }
    }

      if (QuoteData["Transaction"]?.includes("Vehicle 3")) {
      await wait(5000);
      if (await getVehicle3().isVisible()) {
        await getVehicle3().dblclick();
        await wait(5000);
        await getCoverage().scrollIntoViewIfNeeded();
        await getCoverage().click({force:true});
        await wait(5000);
        
        if(QuoteData["Hull: Deductible"]){
          console.log("Hull Deductible from excel:", QuoteData["Hull: Deductible"]);
          await selectHullDeductibleOption(QuoteData["Hull: Deductible"]);
        }

        if(QuoteData["Hull: Settlement Option"]){
          console.log("Hull Settlement Option from excel:", QuoteData["Hull: Settlement Option"]);
          await selectHullSettlementOption(QuoteData["Hull: Settlement Option"])
        }
        if(QuoteData["Hull: Diminishing Deductible"]){
          console.log("Hull : Dimishing Deductible from excel:", QuoteData["Hull: Diminishing Deductible"]);
          await selectHullDimishingDeductible(QuoteData["Hull: Diminishing Deductible"])
        }
        if(QuoteData["Travel Loss: Per day/Per occurrence"]) {
          console.log("Travel Loss value from excel:", QuoteData["Travel Loss: Per day/Per occurrence"]);
          await selectTravelLossCheckBox(QuoteData["Travel Loss: Per day/Per occurrence"]);
        }
        if(QuoteData["Nautical Collectibles: Limit"]){
          console.log("Nautical Collectibles Limit from excel:", QuoteData["Nautical Collectibles: Limit"]);
          await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Limit"]);
        }
        if(QuoteData["Nautical Collectibles: Deductible"]){
          console.log("Nautical Collectibles: Deductible from excel:", QuoteData["Nautical Collectibles: Deductible"]);
          await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Deductible"]);
        }
        if(QuoteData["Personal Effects: Limit"]){
          console.log("Personal Effects Limit from excel:", QuoteData["Personal Effects: Limit"]);
          await selectPersonalEffectsLimit(QuoteData["Personal Effects: Limit"]);
        }
        if(QuoteData["Personal Effects: Settlement Option"]){
          console.log("Personal Effects Settlement Option from excel:", QuoteData["Personal Effects: Settlement Option"]);
          await selectPersonalEffectsSettlementOption(QuoteData["Personal Effects: Settlement Option"])
        }
        if(QuoteData["Towing and Emergency Expense: Limit"]){
          console.log("Towing and Emergency Expense Limit from excel:", QuoteData["Towing and Emergency Expense: Limit"]);
          await selectTowingLimit(QuoteData["Towing and Emergency Expense: Limit"]);
        }
        if(QuoteData["Haul Out: Limit"]){
          console.log("Haul Out Limit from excel:", QuoteData["Haul Out: Limit"]);
          await selectHaulOutLimit(QuoteData["Haul Out: Limit"]);
        }
        if(QuoteData["Tournament Fee Reimbursement: Limit"]){
          console.log("Tournament Fee Reimbursement Limit from excel:", QuoteData["Tournament Fee Reimbursement: Limit"]);
          await selectTournamentFeeCheckBox(QuoteData["Tournament Fee Reimbursement: Limit"]);
        }
        if(QuoteData["Boat Lift: Limit"]){
          console.log("Boat Lift Limit from excel:", QuoteData["Boat Lift: Limit"]);
          await selectBoatLift(QuoteData["Boat Lift: Limit"]);
        }
        if(QuoteData["Genuine Parts Security"]){
          console.log("Genuine Parts Security from excel:", QuoteData["Genuine Parts Security"]);
          await selectGenuinePartsSecurityCheckBox(QuoteData["Genuine Parts Security"]);
        }
        if(QuoteData["Rental Reimbursement: Days/limit per day"]){
          console.log("Rental Reimbursement from excel:", QuoteData["Rental Reimbursement: Days/limit per day"]);
          await selectRentalReimbursement(QuoteData["Rental Reimbursement: Days/limit per day"]);
        }
        if(QuoteData["Port Risk: In / Out of Water"]){
          console.log("Port Risk In/Out of Water from excel:", QuoteData["Port Risk: In / Out of Water"]);
          await selectPortRiskInOutWater(QuoteData["Port Risk: In / Out of Water"]);
        }
      if(QuoteData["Named Driver"]){
        console.log("Named Driver from excel:", QuoteData["Named Driver"]);
        await selectNamedDriverCheckBox(QuoteData["Named Driver"]);
      }
      if(QuoteData["Trailer Physical Damage: Limit"]){
        console.log("Trailer Physical Damage Limit from excel:", QuoteData["Trailer Physical Damage: Limit"]);
        await selectTrailerPhysicalDamageLimit(QuoteData["Trailer Physical Damage: Limit"]);
      }
      if(QuoteData["Trailer Physical Damage: Settlement Option"]){
        console.log("Trailer Physical Damage Settlement Option from excel:", QuoteData["Trailer Physical Damage: Settlement Option"]);
        await selectTrailerPhysicalDamageSettlementOption(QuoteData["Trailer Physical Damage: Settlement Option"])
      }
        await wait(5000);
        await captureFullPage2D(page, testInfo, `Coverage Details For Vehicle${index+1}`, "#centerPanel");
        await wait(2000);
              await getExclusionsTab().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(5000);
      if(QuoteData["Watersports Liability Exclusion"]){
        console.log("Water Sports Liability Exclusion from excel:", QuoteData["Watersports Liability Exclusion"]);
          await selectWaterSportsLiabilityExclusionCheckBox(QuoteData["Watersports Liability Exclusion"]);
        }
      if(QuoteData["Sailboat Rigging Exclusion"]){
        console.log("Sailboat Rigging Exclusion from excel:", QuoteData["Sailboat Rigging Exclusion"]);
        await selectSailBoatRiggingExclusionCheckBox(QuoteData["Sailboat Rigging Exclusion"]);
        }
        await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For Vehicle${index + 1}`, "#centerPanel");
      }

    }

        await wait(TIMEOUT_4_SECONDS);
        if(await isElementVisible(getRoofBenefitSchedule())) {
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
      await captureFullPage2D(page, testInfo, `Roof Benefit Schedule Page ${pageNum} Screenshot`,"#centerPanel");
      
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

  }
 
  await getCoveragesSaveAndNextButton().scrollIntoViewIfNeeded();
  await wait(500);
 
await wait(2000);

await wait(TIMEOUT_4_SECONDS);
  await getCoveragesSaveAndNextButton().scrollIntoViewIfNeeded();
  await wait(500);
 
await wait(2000);
 
await wait(TIMEOUT_4_SECONDS);
    await getCoveragesSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
    // await getQuoteinCoveragesButton().click();
    await wait(TIMEOUT_4_SECONDS);
   
 
 
 console.log("🔍 Performing rule-based validation for Coverage Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );

if(await isElementVisible(getWarningMsgCore()) && await isElementVisible(getCoverageHeading())){
  console.log("Warning message is visible, taking screen shot with warnings .");
       await captureFullPage2D(page, testInfo, `Warning In Coverages Page`, "#centerPanel");
        if(await isElementVisible(getClearButton())){
          console.log("Clear button is visible, clicking on it");
          await getClearButton().click();
        }
       console.log("Clicking on Save and Next button to proceed.");
       await getCoveragesSaveAndNextButton().click();
       await wait(TIMEOUT_4_SECONDS);
}
if(validationResult.errorType == 'none'){
    if(await isElementVisible(getClearButton())){
          console.log("Clear button is visible, clicking on it");
          await getClearButton().click();
        }
      }
 
    // await wait(TIMEOUT_4_SECONDS);
    // await wait(5000);
    // await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    // if (await isElementVisible(getQuoteinCoveragesButton())) {
    //   await wait(2000);
    //   if (await isElementVisible(getQuoteinCoveragesButton())) {
    //   await getQuoteinCoveragesButton().click({ timeout: 4000 });
    //   await wait(TIMEOUT_4_SECONDS);
    //   }
    // }
 
    console.log("Coverage page validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;
  }
 
}