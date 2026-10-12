import { expect, Locator, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
} from "../../../utils/locator-utils";
import {
  click,
  fill,
  wait,
  reloadPage,
  clear
} from "../../../utils/action-utils";
import { captureAndAttachforCore, captureFullPage2D } from "../../../utils/report-utils";
import {
  BIG_TIMEOUT,
  MAX_TIMEOUT,
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../../utils/timeout-constants";
import { getText, isElementVisible } from "../../../utils/element-utils";
import { validateRulesForTestCase, ValidationResult } from "../../../utils/coreRuleBasedValidation";
import { selectDropdownWithRetry } from "../HO_Coverages_CorePage";
import { selectYesNo } from "../../../utils/question-helper";
import { getRoofBenefitSchedule, getPageCountIndicator, getFormsNextButton } from "../DB_Coverages_CorePage";


const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getCoveragesSaveAndNextButton = () => getLocator('//span[contains(text(), "Coverages")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getExclusionsTab = () => getLocator("//a[contains(@id, 'HOLevelExclusionsCardTab')]");
const getLiabilitydropdown = () => getLocator("//td[contains(@id, 'LiabilityTermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getMedicalPaymentCheckbox = () => getLocator("//div[contains(text(), 'Medical Payments')]/parent::div//input[@role='checkbox']");
const getMedicalPaymentLimitDropdown = () => getLocator("//td[contains(@id, 'PAMedPayCov-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getUninsuredMotoristsCheckbox = () => getLocator("//div[contains(text(), 'Uninsured Motorists')]/parent::div//input[@role='checkbox']");
const getUninsuredMootoristsDropdown = () => getLocator("//td[contains(@id, 'UMBITermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getUnderinsuredMotoristsCheckbox = () => getLocator("//div[contains(text(), 'Underinsured Motorists')]/parent::div//input[@role='checkbox']");
const getUnderinsuredMootoristsDropdown = () => getLocator("//td[contains(@id, 'UIMBITermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getSpareLimitInputBox = () => getLocator("//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getCollectorCoverageLimitInputBox = () => getLocator("//input[contains(@id, 'CollectorCoverageLimitTerm-inputEl')]");
const getComprehensiveSettlementOptionDropdown = () => getLocator("//input[contains(@id, 'CovPatternInputGroup:CompSettlementOpt-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getCoverageDeductibleOption = () => getLocator("//td[contains(@id, 'PACompDollarOrPercentDeductibleOptTerm-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getComprehensiveDeductibleOptionDollarDropdown = () => getLocator("//td[contains(@id, 'CovPatternInputGroup:PACompDollarOrPercentDeductibleOptTerm-labelCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getComprehensiveDeductibleOptionDirectDropdown = () => getLocator("//td[contains(@id, 'CovPatternInputGroup:CompDeductible-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getComprehensiveDiminishingYes = () => getLocator("//label[text()='Diminishing Deductible']/following::label[text()='Yes']/preceding-sibling::input");
const getComprehensiveDiminishingNo = () => getLocator("//label[text()='Diminishing Deductible']/following::label[text()='No']/preceding-sibling::input");
const getCollisionCheckbox = () => getLocator("//div[text()='Collision' and contains(@class, 'x-fieldset-header-text')]/parent::div//input[@role='checkbox' and @type='button']");
const getCollisionDeductibleOptionDollarDropdown = () => getLocator("//td[contains(@id, 'PACollisionDollarOrPercentDeductibleOptTerm-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getCollisionDeductibleOptionDirectDropdown = () => getLocator("//td[contains(@id, 'CovPatternInputGroup:CollDeductible-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTowingandEmergencyExpenseDropdown = () => getLocator(" //div[text()='Towing and Emergency Expense'] /ancestor::fieldset //div[contains(@class,'x-form-arrow-trigger')]");
const getTrailerLimit = () => getLocator("//input[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PersonalAuto_VehicleCoverageDetailDV:0:0:CoverageInputSet:CovPatternInputGroup:0:CovTermInputSet:DirectTermInput-inputEl')]");
const getTrailerStttlementOption = () => getLocator("//input[contains(@id, 'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PersonalAuto_VehicleCoverageDetailDV:0:0:CoverageInputSet:CovPatternInputGroup:2:CovTermInputSet:OptionTermInput-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTrailerPhysicalDamage = `//div[contains(@id,'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PersonalAuto_VehicleCoverageDetailDV:0:0:CoverageInputSet:CovPatternInputGroup-legendTitle')]`;
const getVehicle1 = () => getLocator("//tbody[contains(@id,'gridview-1435-body')]//tr[1]//td[1]");
const getVehicle2 = () => getLocator("//tbody[contains(@id,'gridview')]//tr[2]//td[1]");
const getVehicle3 = () => getLocator("//tbody[contains(@id,'gridview')]//tr[3]//td[1]");
const getCoverageExclusionsButton = () => getLocator("//span[contains(text(),'Exclusions')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PAVehicleExclusionCoveragesCardTab']");
const getCoverageExclusionsAllVehiclesButton = () => getLocator("//span[contains(text(),'Exclusions')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PolicyExclusionsTab']");
const getCoverage = () => getLocator("//span[contains(text(),'Coverages')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:VehicleCoverageDetailsCardTab']");
const getPersonalEffectsLimitdropdown = () => getLocator("//td[contains(@id, 'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PersonalAuto_VehicleCoverageDetailDV:2:1:CoverageInputSet:CovPatternInputGroup:0:CovTermInputSet:OptionTermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPersonalEffectsSettlementOptionDropdown = () => getLocator("//input[contains(@id, 'SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PersonalAuto_VehicleCoverageDetailDV:2:1:CoverageInputSet:CovPatternInputGroup:2:CovTermInputSet:OptionTermInput-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHullDropDown = () => getLocator("//td[contains(@id, 'HullDeductibleMoney-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHullCheckBox = () => getLocator("//div[contains(text(), 'Hull')]/parent::div//td//div//input[contains(@class, 'x-form-checkbox')]");

// Additional locators for coverages
const getUninsuredMotoristsPropertyDamageLimitDropdown = () => getLocator("//td[contains(@id, 'PAUMPDlimit-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getUnderinsuredMotoristsPropertyDamageCheckbox = () => getLocator("//div[contains(text(), 'Underinsured Motorists Property Damage')]/parent::div//input[@role='checkbox']");
const getAutomobiliaLimitInputBox = () => getLocator("//fieldset[.//div[text()='Automobilia']]//label[text()='Limit']/following::input[contains(@id,'CovTermInputSet:DirectTermInput')]");
const getAutomobiliaCheckbox = () => getLocator("//div[contains(text(), 'Automobilia')]/parent::div//input[@role='checkbox']");
const getAutomobiliaDeductibleDropdown = () => getLocator(" //input[@role='combobox' and @name[contains(.,'1:CovTermInputSet')]]   /ancestor::td/following-sibling::td   //div[contains(@class,'x-form-arrow-trigger')]");
const getAutomobiliaSettlementOptionDropdown = () => getLocator(" //input[@role='combobox' and @name[contains(.,'2:CovTermInputSet')]]   /ancestor::td/following-sibling::td   //div[contains(@class,'x-form-arrow-trigger')]");
const getPetProtectionLimitDropdown = () => getLocator("//td[contains(@id, 'PAPetProtectionLimitTerm-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getAppreciationSecurityCheckbox = () => getLocator("//div[contains(text(), 'Appreciation Security')]/parent::div//input[@role='checkbox']");
const getLiabilityExclusionCheckbox = () => getLocator("//div[contains(text(), 'Liability Exclusion')]/parent::div//input[@role='checkbox']");
const getStorageLimitationExclusionCheckbox = () => getLocator("//div[contains(text(), 'Storage Limitation Exclusion')]/parent::div//input[@role='checkbox']");
const getSubrogationWaiverExclusionCheckbox = () => getLocator("//div[contains(text(), 'Subrogation Waiver Exclusion')]/parent::div//input[@role='checkbox']");
const getTrailerPhysicalDamageSettlementOptionDropdown = () => getLocator(" //fieldset[.//div[text()='Trailer Physical Damage']]  //label[normalize-space()='Settlement Option']  /ancestor::table[contains(@class,'x-form-item')]  //div[contains(@class,'x-form-arrow-trigger')]");
const getTrailerPhysicalDamageLimitInputBox = () => getLocator(" //fieldset[.//div[text()='Trailer Physical Damage']]  //label[normalize-space()='Limit']  /ancestor::table[contains(@class,'x-form-item')]  //input[@role='textbox']");

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
  
  // Check if value starts with $
  const hasDollarSign = value.startsWith("$");
  const numericCandidate = value.replace(/[$,]/g, "");
  const isNumeric = numericCandidate !== "" && /^-?\d+(\.\d+)?$/.test(numericCandidate);

  if (isNumeric) {
    const numValue = Number(numericCandidate);
    
    // If it's a decimal between 0 and 1, convert to percentage
    if (numValue > 0 && numValue < 1) {
      return `${Math.round(numValue * 100)}%`;
    }
    
    const formattedNumber = numValue.toLocaleString('en-US');
    return hasDollarSign ? `$${formattedNumber}` : formattedNumber;
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
    // Check current state via control visibility (if control provided)
    let isCurrentlySelected = false;
    if (control) {
      isCurrentlySelected = await isElementVisible(control);
      console.log(`🔍 Control visibility check: ${isCurrentlySelected ? "visible (selected)" : "hidden (unselected)"}`);
    }
    else {
      // No control provided, check checkbox's own checked state using robust method
      isCurrentlySelected = await getCheckboxState();
      console.log(`🔍 Attempt ${attempt}: Checkbox state = ${isCurrentlySelected ? "checked" : "unchecked"}`);
    }
 
    // If already in desired state, return early
    if (control && isCurrentlySelected === shouldSelect) {
      console.log(`ℹ️ Checkbox already in desired state: ${shouldSelect ? "selected" : "unselected"}`);
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
//     : getLocator(`//ul[@class='x-list-plain']//li[text()='${dropdownValue}']`);

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

// Wrapper functions using standardized handlers
async function selectLiabilityLimit(value: any) {
  if (value != null && await isElementVisible(getLiabilitydropdown())) {
    await selectDropdownWithRetry(
      getLiabilitydropdown,
      String(value),
      { maxAttempts: 5, label: "Liability - Bodily Injury and Property Damage: Limit" }
    );
  }
}

async function selectMedicalPaymentsLimit(value: any) {
  if (value != null && await isElementVisible(getMedicalPaymentCheckbox())) {
    await handleCoverageSectionSelection(
      getMedicalPaymentCheckbox,
      getMedicalPaymentLimitDropdown,
      String(value),
      { controlType: "dropdown", maxDropdownAttempts: 5 }
    );
  }
}

async function selectUninsuredMotoristsLimit(value: any) {
  if (value != null && await isElementVisible(getUninsuredMootoristsDropdown())) {
    await selectDropdownWithRetry(
      getUninsuredMootoristsDropdown,
      String(value),
      { maxAttempts: 5, label: "Uninsured Motorists: Limit" }
    );
  }
}

async function selectUninsuredMotoristsPropertyDamageLimit(value: any) {
  if (value != null && await isElementVisible(getUninsuredMotoristsPropertyDamageLimitDropdown())) {
    await selectDropdownWithRetry(
      getUninsuredMotoristsPropertyDamageLimitDropdown,
      String(value),
      { maxAttempts: 5, label: "Uninsured Motorists Property Damage: Limit" }
    );
  }
}

async function selectUnderinsuredMotoristsLimit(value: any) {
  if (value != null && await isElementVisible(getUnderinsuredMotoristsCheckbox())) {
    await handleCoverageSectionSelection(
      getUnderinsuredMotoristsCheckbox,
      getUnderinsuredMootoristsDropdown,
      String(value),
      { controlType: "dropdown", maxDropdownAttempts: 5 }
    );
  }
}

async function selectUnderinsuredMotoristsPropertyDamage(value: any) {
  if (value != null && await isElementVisible(getUnderinsuredMotoristsPropertyDamageCheckbox())) {
    await handleCheckboxOnlySelection(
      getUnderinsuredMotoristsPropertyDamageCheckbox,
      String(value)
    );
  }
}

async function selectAutomobiliaLimit(value: any) {
  if (value != null && await isElementVisible(getAutomobiliaCheckbox())) {
    // await handleCheckboxOnlySelection(
    //   getAutomobiliaCheckbox,
    //   "Select"
    // );
    // await setCoverageInputValue(
    //   getAutomobiliaLimitInputBox,
    //   String(value),
    //   "Automobilia: Limit"
    // );
    await handleCoverageSectionSelection(
      getAutomobiliaCheckbox,
      getAutomobiliaLimitInputBox,
      String(value),
      { controlType: "input" }
    );
  }
}

async function selectAutomobiliaDeductible(value: any) {
  if (value != null && await isElementVisible(getAutomobiliaDeductibleDropdown())) {
    await selectDropdownWithRetry(
      getAutomobiliaDeductibleDropdown,
      String(value),
      { maxAttempts: 5, label: "Automobilia: Deductible" }
    );
  }
}

async function selectAutomobiliaSettlementOption(value: any) {
  if (value != null && await isElementVisible(getAutomobiliaSettlementOptionDropdown())) {
    await selectDropdownWithRetry(
      getAutomobiliaSettlementOptionDropdown,
      String(value),
      { maxAttempts: 5, label: "Automobilia: Settlement Option" }
    );
  }
}

async function selectPetProtectionLimit(value: any) {
  if (value != null && await isElementVisible(getPetProtectionLimitDropdown())) {
    await selectDropdownWithRetry(
      getPetProtectionLimitDropdown,
      String(value),
      { maxAttempts: 5, label: "Pet Protection: Limit" }
    );
  }
}

async function selectComprehensiveDeductibleDollar(value: any) {
  if (value != null && await isElementVisible(getComprehensiveDeductibleOptionDollarDropdown())) {
    await selectDropdownWithRetry(
      getComprehensiveDeductibleOptionDollarDropdown,
      String(value),
      { maxAttempts: 5, label: "Comprehensive: Deductible" }
    );
  }
}

async function selectComprehensiveDeductibleDirect(value: any) {
  if (value != null && await isElementVisible(getComprehensiveDeductibleOptionDirectDropdown())) {
    await selectDropdownWithRetry(
      getComprehensiveDeductibleOptionDirectDropdown,
      String(value),
      { maxAttempts: 5, label: "Comprehensive: Deductible" }
    );
  }
}

async function selectComprehensiveSettlement(value: any) {
  if (value != null && await isElementVisible(getComprehensiveSettlementOptionDropdown())) {
    await selectDropdownWithRetry(
      getComprehensiveSettlementOptionDropdown,
      String(value),
      { maxAttempts: 5, label: "Comprehensive: Settlement Option" }
    );
  }
}

async function selectComprehensiveDiminishingDeductible(value: any) {
  if (value == null) return;
  const v = String(value ?? '').trim().toLowerCase();
  // prefer using the 'Yes'/'No' inputs near the Diminishing Deductible label
  if (v === 'yes') {
    if (await isElementVisible(getComprehensiveDiminishingYes())) {
      await getComprehensiveDiminishingYes().scrollIntoViewIfNeeded();
      await getComprehensiveDiminishingYes().click({ force: true });
      await wait(1000);
      return;
    }
  }
  if (v === 'no') {
    if (await isElementVisible(getComprehensiveDiminishingNo())) {
      await getComprehensiveDiminishingNo().scrollIntoViewIfNeeded();
      await getComprehensiveDiminishingNo().click({ force: true });
      await wait(1000);
      return;
    }
  }
  console.log(`selectComprehensiveDiminishingDeductible: unsupported value '${value}'`);
}

async function selectCollisionDeductibleDollar(value: any) {
  if (value != null && await isElementVisible(getCollisionCheckbox())) {
    await handleCoverageSectionSelection(
      getCollisionCheckbox,
      getCollisionDeductibleOptionDollarDropdown,
      String(value),
      { controlType: "dropdown", maxDropdownAttempts: 5 }
    );
  }
}

async function selectCollisionDeductibleDirect(value: any) {
  if (value != null && await isElementVisible(getCollisionCheckbox())) {
    await handleCoverageSectionSelection(
      getCollisionCheckbox,
      getCollisionDeductibleOptionDirectDropdown,
      String(value),
      { controlType: "dropdown", maxDropdownAttempts: 5 }
    );
  }
}

async function selectAppreciationSecurityCheckBox(value: any) {
  if (value != null && await isElementVisible(getAppreciationSecurityCheckbox())) {
    await handleCheckboxOnlySelection(
      getAppreciationSecurityCheckbox,
      String(value)
    );
  }
}

async function selectLiabilityExclusion(value: any) {
  if (value != null && await isElementVisible(getLiabilityExclusionCheckbox())) {
    await handleCheckboxOnlySelection(
      getLiabilityExclusionCheckbox,
      String(value)
    );
  }
}

async function selectStorageLimitationExclusion(value: any) {
  if (value != null && await isElementVisible(getStorageLimitationExclusionCheckbox())) {
    await handleCheckboxOnlySelection(
      getStorageLimitationExclusionCheckbox,
      String(value)
    );
  }
}

async function selectSubrogationWaiverExclusion(value: any) {
  if (value != null && await isElementVisible(getSubrogationWaiverExclusionCheckbox())) {
    await handleCheckboxOnlySelection(
      getSubrogationWaiverExclusionCheckbox,
      String(value)
    );
  }
}

async function selectTrailerPhysicalDamageLimit(value: any) {
  if (value != null && await isElementVisible(getTrailerPhysicalDamageLimitInputBox())) {
    await setCoverageInputValue(
      getTrailerPhysicalDamageLimitInputBox,
      String(value),
      "Trailer Physical Damage: Limit"
    );
  }
}

async function selectTrailerPhysicalDamageSettlement(value: any) {
  if (value != null && await isElementVisible(getTrailerPhysicalDamageSettlementOptionDropdown())) {
    await selectDropdownWithRetry(
      getTrailerPhysicalDamageSettlementOptionDropdown,
      String(value),
      { maxAttempts: 5, label: "Trailer Physical Damage: Settlement Option" }
    );
  }
}



async function fillTrailerLimitValue(make: number) {
  await getTrailerLimit().click({ force: true });
  await fill(getTrailerLimit(), make.toString());
  await wait(2000);
}

async function selectTrailerSettlementOption(value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getTrailerStttlementOption().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectTrailerStttlementOption: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectTrailerStttlementOption: option '${value}' not found after ${maxAttempts} attempts`);
}
async function selectLiablityLimit(value: any) {
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${value}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getLiabilitydropdown().click({ force: true }).catch(() => { });

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
async function selectMedicalPayment(value: number) {

  if (value != null) {
    if (await isElementVisible(getMedicalPaymentLimitDropdown())) {
      // await getMedicalPaymentCheckbox().click({ force: true });
      const valueString = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueString}']`);
      const maxAttempts = 8;
      const attemptDelay = 500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Click to open the drop-down / refresh list
        await getMedicalPaymentLimitDropdown().click({ force: true }).catch(() => { });

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

      throw new Error(`selectMedicalPayment: option '${valueString}' not found after ${maxAttempts} attempts`);
    }
  }

}
async function selectUninsuredMotorists(
  uninsuredMotoristscheck: string,
  uninsuredMotoristsOption: string
) {

  if (uninsuredMotoristscheck === "Select") {
    if (await isElementVisible(getUninsuredMotoristsCheckbox())) {
      await getUninsuredMotoristsCheckbox().click({ force: true });
      const valueString = uninsuredMotoristsOption.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueString}']`);
      const maxAttempts = 8;
      const attemptDelay = 500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Click to open the drop-down / refresh list
        await getUninsuredMootoristsDropdown().click({ force: true }).catch(() => { });

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
      await getUnderinsuredMotoristsCheckbox().click({ force: true });
      const valueString = underinsuredMotoristsOption.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueString}']`);
      const maxAttempts = 8;
      const attemptDelay = 500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Click to open the drop-down / refresh list
        await getUnderinsuredMootoristsDropdown().click({ force: true }).catch(() => { });

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
async function clickCoverageExclusionButton() {
  await getCoverageExclusionsButton().click({ force: true });
}
async function clickCoverageAllVehiclesExclusionButton() {
  await getCoverageExclusionsAllVehiclesButton().click({ force: true });
}

async function enterSparePartsLimit(limit: number) {
  console.log("Spare parts limit from excel:", limit);
  if (limit != null) {
    await setCoverageInputValue(getSpareLimitInputBox, limit.toString().replace(/[$,]/g, ""), "Spare Parts: Limit");
    await wait(2000);
  }
}

async function enterCollectorCoverageLimit(coveragelimit: number) {
  console.log("Collector Coverage limit from excel:", coveragelimit);
  if (coveragelimit != null) {
    await setCoverageInputValue(getCollectorCoverageLimitInputBox, coveragelimit.toString().replace(/[$,]/g, ""), "Collector Coverage: Limit");
    await wait(2000);
  }
}

async function selectPersonalEffectsLimit(value: any) {
 const valueString = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueString}']`);
  const maxAttempts = 8;
  const attemptDelay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Click to open the drop-down / refresh list
    await getPersonalEffectsLimitdropdown().click({ force: true }).catch(() => { });

    try {
      // Small wait for the option to appear
      await optionLocator.waitFor({ state: "visible", timeout: 1000 });
      // Option is present and visible, click it and return
      await click(optionLocator);
      console.log(`selectAccessoriesLimit: selected '${value}' on attempt ${attempt}`);
      return;
    } catch {
      // Not yet visible — wait and try again
      await wait(attemptDelay);
    }
  }

  throw new Error(`selectAccessoriesLimit: option '${value}' not found after ${maxAttempts} attempts`);
}

async function selectPersonalEffectsSettlementOption(
  accessoriessettlementoption: string
) {
  if (accessoriessettlementoption != null) {
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${accessoriessettlementoption}']`);
    const maxAttempts = 8;
    const attemptDelay = 500; // ms

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Click to open the drop-down / refresh list
      await getPersonalEffectsSettlementOptionDropdown().click({ force: true }).catch(() => { });

      try {
        // Small wait for the option to appear
        await optionLocator.waitFor({ state: "visible", timeout: 1000 });
        // Option is present and visible, click it and return
        await click(optionLocator);
        console.log(`selectPersonalEffectsSettlementOption: selected '${accessoriessettlementoption}' on attempt ${attempt}`);
        return;
      } catch {
        // Not yet visible — wait and try again
        await wait(attemptDelay);
      }
    }

    throw new Error(`selectPersonalEffectsSettlementOption: option '${accessoriessettlementoption}' not found after ${maxAttempts} attempts`);
  }
}
async function selectHullDeductible(value: number) {

  if (value != null) {
if( await !isElementVisible(getHullDropDown())){
  await getHullCheckBox().click({force:true});
}
await wait(2000);
    if (await isElementVisible(getHullDropDown())) {
      
      const valueString = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${valueString}']`);
      const maxAttempts = 8;
      const attemptDelay = 500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Click to open the drop-down / refresh list
        await getHullDropDown().click({ force: true }).catch(() => { });

        try {
          // Small wait for the option to appear
          await optionLocator.waitFor({ state: "visible", timeout: 1000 });
          // Option is present and visible, click it and return
          await click(optionLocator);
          console.log(`selectComprehensiveDeductible: selected '${valueString}' on attempt ${attempt}`);
          return;
        } catch {
          // Not yet visible — wait and try again
          await wait(attemptDelay);
        }
      }

      throw new Error(`selectComprehensiveDeductible: option '${valueString}' not found after ${maxAttempts} attempts`);
    }
  }

}
async function selectTowingAndEmergencyExpense(
  towing: number,

) {

  // if (towing != null) {
  //   const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${towing}']`);
  //   const maxAttempts = 8;
  //   const attemptDelay = 500; // ms

  //   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  //     // Click to open the drop-down / refresh list
  //     await getTowingandEmergencyExpenseDropdown().click({ force: true }).catch(() => { });

  //     try {
  //       // Small wait for the option to appear
  //       await optionLocator.waitFor({ state: "visible", timeout: 1000 });
  //       // Option is present and visible, click it and return
  //       await click(optionLocator);
  //       console.log(`selectTowingAndEmergencyExpense: selected '${towing}' on attempt ${attempt}`);
  //       return;
  //     } catch {
  //       // Not yet visible — wait and try again
  //       await wait(attemptDelay);
  //     }
  //   }

  //   throw new Error(`selectTowingAndEmergencyExpense: option '${towing}' not found after ${maxAttempts} attempts`);
  // }

  if(await isElementVisible(getTowingandEmergencyExpenseDropdown())){
    await selectDropdownWithRetry(
      getTowingandEmergencyExpenseDropdown,
      String(towing),
      { maxAttempts: 8, label: "Towing and Emergency Expense" }
    );
  }
}

async function selectComprehensiveDeductibleOption(
  comprehensivedeductibleoption: number,
) {
  if (comprehensivedeductibleoption != null) {
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${"$" + comprehensivedeductibleoption.toString()}']`);
    const maxAttempts = 8;
    const attemptDelay = 500; // ms

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Click to open the drop-down / refresh list
      await getCoverageDeductibleOption().click({ force: true }).catch(() => { });

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

    throw new Error(`selectcomprehensivedeductibleoption: option '${comprehensivedeductibleoption}' not found after ${maxAttempts} attempts`);
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
      await getComprehensiveSettlementOptionDropdown().click({ force: true }).catch(() => { });

      try {
        // Small wait for the option to appear
        await optionLocator.waitFor({ state: "visible", timeout: 1000 });
        // Option is present and visible, click it and return
        await click(optionLocator);
        console.log(`selectcomprehensivesettlementoption: selected '${comprehensivesettlementoption}' on attempt ${attempt}`);
        return;
      } catch {
        // Not yet visible — wait and try again
        await wait(attemptDelay);
      }
    }

    throw new Error(`selectcomprehensivesettlementoption: option '${comprehensivesettlementoption}' not found after ${maxAttempts} attempts`);
  }
}

async function selectCollisionDeductibleOption(
  collisionDeductibleoption: number,
) {
  if(collisionDeductibleoption){
    await getCollisionCheckbox().click({force:true});
  }
  if (collisionDeductibleoption != null) {
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${"$" + collisionDeductibleoption.toString()}']`);
    const maxAttempts = 8;
    const attemptDelay = 500; // ms

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Click to open the drop-down / refresh list
      await getCollisionDeductibleOptionDirectDropdown().click({ force: true }).catch(() => { });

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

    throw new Error(`selectcomprehensivedeductibleoption: option '${collisionDeductibleoption}' not found after ${maxAttempts} attempts`);
  }
}

// Main function to fill all coverages fields
export async function fillCoveragesCorePage(
  page: Page,
  testInfo: TestInfo,
  Quote: any[],
  ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any
): Promise<ValidationResult> {
try {


  for (let i = 0; i < 5; i++) {
    if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
      await getClearButtoninRiskAnalysisCore().click({ force: true });
      await wait(3000);
    } else {
      break; // stop the loop if not visible
    }
  }

  for (let [index, QuoteData] of Quote.entries()) {


    if (QuoteData["Transaction"]?.includes("Vehicle 1")) {
      // Liability - Bodily Injury and Property Damage: Limit
      if (QuoteData["Liability - Bodily Injury and Property Damage: Limit"] != null) {
        await selectLiabilityLimit(QuoteData["Liability - Bodily Injury and Property Damage: Limit"]);
      }
      
      // Medical Payments: Limit (checkbox + dropdown)
      if (QuoteData["Medical Payments: Limit"] != null) {
        await selectMedicalPaymentsLimit(QuoteData["Medical Payments: Limit"]);
      }
      
      // Uninsured Motorists: Limit (dropdown only)
      if (QuoteData["Uninsured Motorists: Limit"] != null) {
        await selectUninsuredMotoristsLimit(QuoteData["Uninsured Motorists: Limit"]);
      }
      
      // Uninsured Motorists Property Damage: Limit (dropdown only)
      if (QuoteData["Uninsured Motorists Property Damage: Limit"] != null) {
        await selectUninsuredMotoristsPropertyDamageLimit(QuoteData["Uninsured Motorists Property Damage: Limit"]);
      }
      
      // Underinsured Motorists: Limit (checkbox + dropdown)
      if (QuoteData["Underinsured Motorists: Limit"] != null) {
        await selectUnderinsuredMotoristsLimit(QuoteData["Underinsured Motorists: Limit"]);
      }
      
      // Underinsured Motorists Property Damage: Limit (checkbox only)
      if (QuoteData["Underinsured Motorists Property Damage: Limit"] != null) {
        await selectUnderinsuredMotoristsPropertyDamage(QuoteData["Underinsured Motorists Property Damage: Limit"]);
      }
      
      // Spare Parts: Limit (input field)
      if (QuoteData["Spare Parts: Limit"] != null) {
        await enterSparePartsLimit(QuoteData["Spare Parts: Limit"]);
      }
      
      // Collector Coverage: Limit (input field)
      if (QuoteData["Collector Coverage: Limit"] != null) {
        await enterCollectorCoverageLimit(QuoteData["Collector Coverage: Limit"]);
      }
      
      // Automobilia: Limit (input field)
      if (QuoteData["Automobilia: Limit"] != null) {
        await selectAutomobiliaLimit(QuoteData["Automobilia: Limit"]);
      }
      
      // Automobilia: Deductible (dropdown)
      if (QuoteData["Automobilia: Deductible"] != null) {
        await selectAutomobiliaDeductible(QuoteData["Automobilia: Deductible"]);
      }
      
      // Automobilia: Settlement Option (dropdown)
      if (QuoteData["Automobilia: Settlement Option"] != null) {
        await selectAutomobiliaSettlementOption(QuoteData["Automobilia: Settlement Option"]);
      }

      if(QuoteData["Pet Protection: Limit"] != null){
        await selectPetProtectionLimit(QuoteData["Pet Protection: Limit"]);
      }

      await wait(5000);
      
      // Comprehensive: Deductible (dropdown)
      let comprehensiveDeductible = QuoteData["Comprehensive: Deductible Option "];
      if (comprehensiveDeductible === null || comprehensiveDeductible === undefined || comprehensiveDeductible === "") {
        comprehensiveDeductible = QuoteData["Comprehensive: Deductible Option _1"];
      }
      if (QuoteData["Comprehensive: Deductible Option "] != null || QuoteData["Comprehensive: Deductible"] != null) {
        await selectComprehensiveDeductibleDirect(QuoteData["Comprehensive: Deductible Option "]);
      }
      if (QuoteData["Comprehensive: Deductible Option _1"] != null) {
        await selectComprehensiveDeductibleDollar(QuoteData["Comprehensive: Deductible Option _1"]);
      }
      
      // Comprehensive: Settlement Option (dropdown)
      if (QuoteData["Comprehensive: Settlement Option"] != null) {
        await selectComprehensiveSettlement(QuoteData["Comprehensive: Settlement Option"]);
      }

      if(QuoteData["Comprehensive: Diminishing Deductible"] != null){
        await selectComprehensiveDiminishingDeductible(QuoteData["Comprehensive: Diminishing Deductible"]);
      }
      
      // Collision: Deductible (checkbox + dropdown)
      let collisionDeductible = QuoteData["Collision: Deductible Option "];
      if (collisionDeductible === null || collisionDeductible === undefined || collisionDeductible === "") {
        collisionDeductible = QuoteData["Collision: Deductible Option _1"];
      }
      if( QuoteData["Collision: Deductible Option "] != null) {
        await selectCollisionDeductibleDirect(QuoteData["Collision: Deductible Option "]);
      }
      if (QuoteData["Collision: Deductible Option _1"] != null) {
        await selectCollisionDeductibleDollar(QuoteData["Collision: Deductible Option _1"]);
      }

      if (QuoteData["Towing and Emergency Expense: Limit"] != null) {
        await selectTowingAndEmergencyExpense(QuoteData["Towing and Emergency Expense: Limit"]);
      }
      
      // Appreciation Security (checkbox only)
      if (QuoteData["Appreciation Security"] != null) {
        await selectAppreciationSecurityCheckBox(QuoteData["Appreciation Security"]);
      }    
      
      await wait(3000);
      // Scroll to top of the panel before capturing screenshot for Vehicle 1
      await page.locator("#centerPanel").evaluate(el => el.scrollTop = 0);
      await wait(1000);
      await captureFullPage2D(page, testInfo, `Coverage Details for Vehicle${index+1}`, "#centerPanel");
      await wait(3000);
      await clickCoverageExclusionButton();
      await wait(5000);
      
      // Validate Exclusions tab is active for Vehicle 1 - with 5 retry attempts
      for (let attempt = 1; attempt <= 5; attempt++) {
        let activeTabVehicle1 = page.locator(
          "xpath=(//div[starts-with(@id,'tabbar-')]//a[contains(@class,'x-active')])[last()]"
        );
        let tabTextVehicle1 = await activeTabVehicle1.textContent().catch(() => '');
        tabTextVehicle1 = tabTextVehicle1 ? tabTextVehicle1.trim() : '';
        console.log(`Vehicle 1 - Exclusions - Attempt ${attempt}/5 - Active tab: ${tabTextVehicle1}`);
        
        if (tabTextVehicle1 && (tabTextVehicle1.includes('Exclusions') || tabTextVehicle1.includes('Exclusion'))) {
          console.log('✅ Vehicle 1 - Exclusions tab selected successfully');
          break;
        } else {
          if (attempt < 5) {
            console.log(`❌ Vehicle 1 - Exclusions Attempt ${attempt} failed. Clicking Exclusions again...`);
            await clickCoverageExclusionButton();
            await wait(2000);
          } else {
            console.log('❌ Vehicle 1 - Failed to select Exclusions tab after 5 attempts. Current tab: ' + tabTextVehicle1);
          }
        }
      }
      
      // Liability Exclusion (checkbox only)
      if (QuoteData["Liability Exclusion"] != null) {
        await selectLiabilityExclusion(QuoteData["Liability Exclusion"]);
      }
      
      // Storage Limitation Exclusion (checkbox only)
      if (QuoteData["Storage Limitation Exclusion"] != null) {
        await selectStorageLimitationExclusion(QuoteData["Storage Limitation Exclusion"]);
      }

       if (QuoteData["Subrogation Waiver Exclusion"] != null) {
        await selectSubrogationWaiverExclusion(QuoteData["Subrogation Waiver Exclusion"]);
      }
      await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For Vehicle${index+1}`, "#centerPanel");
    }

    if (QuoteData["Transaction"]?.includes("Vehicle 2")) {
      await wait(5000);
      if (await getVehicle2().isVisible()) {
        await getVehicle2().dblclick({force:true});
        await wait(5000);
        await getCoverage().waitFor({ state: "visible", timeout: 10000 });
        await getCoverage().scrollIntoViewIfNeeded();
        await getCoverage().click({force:true});
        await wait(5000);
        
        // Validate Coverages tab is active for Vehicle 2 - with 5 retry attempts
        let coveragesSelectedVehicle2 = false;
        for (let attempt = 1; attempt <= 5; attempt++) {
          let activeTabVehicle2 = page.locator(
            "xpath=(//div[starts-with(@id,'tabbar-')]//a[contains(@class,'x-active')])[last()]"
          );
          let tabTextVehicle2 = await activeTabVehicle2.textContent().catch(() => '');
          tabTextVehicle2 = tabTextVehicle2 ? tabTextVehicle2.trim() : '';
          console.log(`Vehicle 2 - Attempt ${attempt}/5 - Active tab: ${tabTextVehicle2}`);
          
          if (tabTextVehicle2 && tabTextVehicle2.includes('Coverages')) {
            console.log('✅ Vehicle 2 - Coverages tab selected successfully');
            coveragesSelectedVehicle2 = true;
            break;
          } else {
            if (attempt < 5) {
              console.log(`❌ Vehicle 2 - Attempt ${attempt} failed. Clicking Coverages again...`);
              await getCoverage().click({force:true});
              await wait(2000);
            } else {
              console.log('❌ Vehicle 2 - Failed to select Coverages tab after 5 attempts. Current tab: ' + tabTextVehicle2);
            }
          }
        }
        
        // if (await isElementVisible(getTrailerPhysicalDamage)) {
          await wait(3000);
          // Trailer Physical Damage Collision: Limit (input)
          if (QuoteData["Trailer Physical Damage: Limit"] != null) {
            await selectTrailerPhysicalDamageLimit(QuoteData["Trailer Physical Damage: Limit"]);
          }
          // Trailer Physical Damage Comprehensive: Settlement Option (dropdown)
          if (QuoteData["Trailer Physical Damage: Settlement Option"] != null) {
            await selectTrailerPhysicalDamageSettlement(QuoteData["Trailer Physical Damage: Settlement Option"]);
          }
        // }
        // else {
          await wait(5000);
          
          // Comprehensive: Deductible (dropdown)
          let comprehensiveDeductible = QuoteData["Comprehensive: Deductible Option "];
          if (comprehensiveDeductible === null || comprehensiveDeductible === undefined || comprehensiveDeductible === "") {
            comprehensiveDeductible = QuoteData["Comprehensive: Deductible Option _1"];
          }
          if (QuoteData["Comprehensive: Deductible Option "] != null) {
          await selectComprehensiveDeductibleDirect(QuoteData["Comprehensive: Deductible Option "]);
          }
          if (QuoteData["Comprehensive: Deductible Option _1"] != null) {
            await selectComprehensiveDeductibleDollar(QuoteData["Comprehensive: Deductible Option _1"]);
          }
          
          // Comprehensive: Settlement Option (dropdown)
          if (QuoteData["Comprehensive: Settlement Option"] != null) {
            await selectComprehensiveSettlement(QuoteData["Comprehensive: Settlement Option"]);
          }

          if(QuoteData["Comprehensive: Diminishing Deductible"] != null){
            await selectComprehensiveDiminishingDeductible(QuoteData["Comprehensive: Diminishing Deductible"]);
          }
          
          // Collision: Deductible (checkbox + dropdown)
          let collisionDeductible = QuoteData["Collision: Deductible Option "];
          if (collisionDeductible === null || collisionDeductible === undefined || collisionDeductible === "") {
            collisionDeductible = QuoteData["Collision: Deductible Option _1"];
          }
          if( QuoteData["Collision: Deductible Option "] != null) {
            await selectCollisionDeductibleDirect(QuoteData["Collision: Deductible Option "]);
          }
          if (QuoteData["Collision: Deductible Option _1"] != null) {
            await selectCollisionDeductibleDollar(QuoteData["Collision: Deductible Option _1"]);
          }
          
          // Hull: Deductible
          if (QuoteData["Hull: Deductible"] != null) {
            await selectHullDeductible(QuoteData["Hull: Deductible"]);
          }
          
          // Personal Effects: Limit
          if (QuoteData["Personal Effects: Limit"] != null) {
            await selectPersonalEffectsLimit(QuoteData["Personal Effects: Limit"]);
          }
          
          // Personal Effects: Settlement Option
          if (QuoteData["Personal Effects: Settlement Option"] != null) {
            await selectPersonalEffectsSettlementOption(QuoteData["Personal Effects: Settlement Option"]);
          }
          
          if (QuoteData["Towing and Emergency Expense: Limit"] != null) {
            await selectTowingAndEmergencyExpense(QuoteData["Towing and Emergency Expense: Limit"]);
          }
          
          await wait(3000);
        // }
        
        await captureFullPage2D(page, testInfo, `Coverage Details for Vehicle${index+1}`, "#centerPanel");
        await wait(3000);
        await clickCoverageExclusionButton();
        await wait(3000);
        
        // Validate Exclusions tab is active for Vehicle 2 - with 5 retry attempts
        for (let attempt = 1; attempt <= 5; attempt++) {
          let activeTabVehicle2Excl = page.locator(
            "xpath=(//div[starts-with(@id,'tabbar-')]//a[contains(@class,'x-active')])[last()]"
          );
          let tabTextVehicle2Excl = await activeTabVehicle2Excl.textContent().catch(() => '');
          tabTextVehicle2Excl = tabTextVehicle2Excl ? tabTextVehicle2Excl.trim() : '';
          console.log(`Vehicle 2 - Exclusions - Attempt ${attempt}/5 - Active tab: ${tabTextVehicle2Excl}`);
          
          if (tabTextVehicle2Excl && (tabTextVehicle2Excl.includes('Exclusions') || tabTextVehicle2Excl.includes('Exclusion'))) {
            console.log('✅ Vehicle 2 - Exclusions tab selected successfully');
            break;
          } else {
            if (attempt < 5) {
              console.log(`❌ Vehicle 2 - Exclusions Attempt ${attempt} failed. Clicking Exclusions again...`);
              await clickCoverageExclusionButton();
              await wait(2000);
            } else {
              console.log('❌ Vehicle 2 - Failed to select Exclusions tab after 5 attempts. Current tab: ' + tabTextVehicle2Excl);
            }
          }
        }
        
        // Liability Exclusion (checkbox only)
        if (QuoteData["Liability Exclusion"] != null) {
          await selectLiabilityExclusion(QuoteData["Liability Exclusion"]);
        }
        
        // Storage Limitation Exclusion (checkbox only)
        if (QuoteData["Storage Limitation Exclusion"] != null) {
          await selectStorageLimitationExclusion(QuoteData["Storage Limitation Exclusion"]);
        }
        await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For Vehicle${index+1}`, "#centerPanel");
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
        
        // Validate Coverages tab is active for Vehicle 3 - with 5 retry attempts
        let coveragesSelectedVehicle3 = false;
        for (let attempt = 1; attempt <= 5; attempt++) {
          let activeTabVehicle3 = page.locator(
            "xpath=(//div[starts-with(@id,'tabbar-')]//a[contains(@class,'x-active')])[last()]"
          );
          let tabTextVehicle3 = await activeTabVehicle3.textContent().catch(() => '');
          tabTextVehicle3 = tabTextVehicle3 ? tabTextVehicle3.trim() : '';
          console.log(`Vehicle 3 - Attempt ${attempt}/5 - Active tab: ${tabTextVehicle3}`);
          
          if (tabTextVehicle3 && tabTextVehicle3.includes('Coverages')) {
            console.log('✅ Vehicle 3 - Coverages tab selected successfully');
            coveragesSelectedVehicle3 = true;
            break;
          } else {
            if (attempt < 5) {
              console.log(`❌ Vehicle 3 - Attempt ${attempt} failed. Clicking Coverages again...`);
              await getCoverage().click({force:true});
              await wait(2000);
            } else {
              console.log('❌ Vehicle 3 - Failed to select Coverages tab after 5 attempts. Current tab: ' + tabTextVehicle3);
            }
          }
        }
        
        if(await getComprehensiveDeductibleOptionDollarDropdown().isVisible() || await getComprehensiveDeductibleOptionDirectDropdown().isVisible()){
          await wait(5000);
          
          // Comprehensive: Deductible (dropdown)
          let comprehensiveDeductible = QuoteData["Comprehensive: Deductible Option "];
          if (comprehensiveDeductible === null || comprehensiveDeductible === undefined || comprehensiveDeductible === "") {
            comprehensiveDeductible = QuoteData["Comprehensive: Deductible Option _1"];
          }
          if (QuoteData["Comprehensive: Deductible Option "] != null) {
            await selectComprehensiveDeductibleDirect(QuoteData["Comprehensive: Deductible Option "]);
          }
          if (QuoteData["Comprehensive: Deductible Option _1"] != null) {
            await selectComprehensiveDeductibleDollar(QuoteData["Comprehensive: Deductible Option _1"]);
          }
          
          // Comprehensive: Settlement Option (dropdown)
          if (QuoteData["Comprehensive: Settlement Option"] != null) {
            await selectComprehensiveSettlement(QuoteData["Comprehensive: Settlement Option"]);
          }

          if(QuoteData["Comprehensive: Diminishing Deductible"] != null){
            await selectComprehensiveDiminishingDeductible(QuoteData["Comprehensive: Diminishing Deductible"]);
          }
          
          await wait(3000);
        }

        // Collision: Deductible (checkbox + dropdown)
          let collisionDeductible = QuoteData["Collision: Deductible Option "];
          if (collisionDeductible === null || collisionDeductible === undefined || collisionDeductible === "") {
            collisionDeductible = QuoteData["Collision: Deductible Option _1"];
          }
          if( QuoteData["Collision: Deductible Option "] != null) {
            await selectCollisionDeductibleDirect(QuoteData["Collision: Deductible Option "]);
          }
          if (QuoteData["Collision: Deductible Option _1"] != null) {
            await selectCollisionDeductibleDollar(QuoteData["Collision: Deductible Option _1"]);
          }
             
          // Hull: Deductible
          if (QuoteData["Hull: Deductible"] != null) {
            await selectHullDeductible(QuoteData["Hull: Deductible"]);
          }
          
          if (QuoteData["Towing and Emergency Expense: Limit"] != null) {
            await selectTowingAndEmergencyExpense(QuoteData["Towing and Emergency Expense: Limit"]);
          }
          
        
        if (await isElementVisible(getTrailerPhysicalDamage)) {
          // Trailer Physical Damage Collision: Limit (input)
          if (QuoteData["Trailer Physical Damage: Limit"] != null) {
            await selectTrailerPhysicalDamageLimit(QuoteData["Trailer Physical Damage: Limit"]);
          }
          // Trailer Physical Damage Comprehensive: Settlement Option (dropdown)
          if (QuoteData["Trailer Physical Damage: Settlement Option"] != null) {
            await selectTrailerPhysicalDamageSettlement(QuoteData["Trailer Physical Damage: Settlement Option"]);
          }
        }
        
        await captureFullPage2D(page, testInfo, `Coverage Details for Vehicle${index+1}`, "#centerPanel");
        await wait(3000);
        await clickCoverageExclusionButton();
        await clickCoverageExclusionButton();
        await wait(3000);
        
        // Validate Exclusions tab is active for Vehicle 3 - with 5 retry attempts
        for (let attempt = 1; attempt <= 5; attempt++) {
          let activeTabVehicle3Excl = page.locator(
            "xpath=(//div[starts-with(@id,'tabbar-')]//a[contains(@class,'x-active')])[last()]"
          );
          let tabTextVehicle3Excl = await activeTabVehicle3Excl.textContent().catch(() => '');
          tabTextVehicle3Excl = tabTextVehicle3Excl ? tabTextVehicle3Excl.trim() : '';
          console.log(`Vehicle 3 - Exclusions - Attempt ${attempt}/5 - Active tab: ${tabTextVehicle3Excl}`);
          
          if (tabTextVehicle3Excl && (tabTextVehicle3Excl.includes('Exclusions') || tabTextVehicle3Excl.includes('Exclusion'))) {
            console.log('✅ Vehicle 3 - Exclusions tab selected successfully');
            break;
          } else {
            if (attempt < 5) {
              console.log(`❌ Vehicle 3 - Exclusions Attempt ${attempt} failed. Clicking Exclusions again...`);
              await clickCoverageExclusionButton();
              await wait(2000);
            } else {
              console.log('❌ Vehicle 3 - Failed to select Exclusions tab after 5 attempts. Current tab: ' + tabTextVehicle3Excl);
            }
          }
        }

        // Liability Exclusion (checkbox only)
        if (QuoteData["Liability Exclusion"] != null) {
          await selectLiabilityExclusion(QuoteData["Liability Exclusion"]);
        }
        
        // Storage Limitation Exclusion (checkbox only)
        if (QuoteData["Storage Limitation Exclusion"] != null) {
          await selectStorageLimitationExclusion(QuoteData["Storage Limitation Exclusion"]);
        }
        await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For Vehicle${index+1}`, "#centerPanel");
      }
    }
    
  }
  if(await isElementVisible(getCoverageExclusionsAllVehiclesButton()))
  {
    await clickCoverageAllVehiclesExclusionButton();
    await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For All Vehicles`, "#centerPanel");
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
  await wait(5000);
  await wait(3000);
    await wait(2000);
    await getCoveragesSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(TIMEOUT_8_SECONDS); 

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

// const pageFlow = [
//   "Risk Analysis",
//   "Policy Review",
//   "Quote",
//   "Forms",
//   "Payments",
//   "Payments & Signatures"
// ];

// const currentPage = "Coverages";

// const nextPages = pageFlow.slice(
//   pageFlow.indexOf(currentPage) + 1
// );

// if (await isElementVisible(getErrorIconCore().first())) {

//   const validationErrors = await getErrorIconCore().allInnerTexts();

//   console.log("Validation Errors:", validationErrors);

//   const canBeResolvedInFuturePage = validationErrors.some(error =>
//     nextPages.some(page =>
//       error.toLowerCase().includes(page.toLowerCase())
//     )
//   );

//   if (canBeResolvedInFuturePage) {

//     console.log(
//       "✅ Validation references a future page. Clicking Save & Next."
//     );

//     await getCoveragesSaveAndNextButton().click();
//     await wait(TIMEOUT_4_SECONDS);
//     if(await isElementVisible(getWarningMsgCore())){
//       await getCoveragesSaveAndNextButton().click();
//     }
//     await wait(TIMEOUT_4_SECONDS);
//     validationResult.success = true;
//     validationResult.errorType = "none";
//     validationResult.message="";
//     validationResult.shouldStop=false;
//     validationResult.status= "PASS";
//     validationResult.validationErrors=[];
//   }
// }
if(validationResult.errorType == 'none'){
    if(await isElementVisible(getClearButton())){
          console.log("Clear button is visible, clicking on it");
          await getClearButton().click();
        }
      }

    await wait(TIMEOUT_4_SECONDS);
    await wait(5000);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
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
