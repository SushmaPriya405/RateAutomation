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
import { get } from "http";
import { selectDropdownWithRetry } from "../HO_Coverages_CorePage";
import { waitForPageReady } from "../RiskAnalysis_CorePage";

const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getCoverageHeading = () => getLocator("(//span[@class = 'g-title' and contains(text(), 'Coverages')])[1]");
const getCoveragesSaveAndNextButton = () => getLocator('//span[contains(text(), "Coverages")]/ancestor::*//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getExclusionsTab = () => getLocator("//a[contains(@id, 'VehicleExclusionCoveragesCardTab')]");
const getLiabilitydropdown = () => getLocator("//td[contains(@id, 'LiabilityTermInput-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getMedicalPaymentCheckbox = () => getLocator("//div[contains(text(), 'Medical Payments')]/parent::div//input[@role='checkbox']");
const getProtectionIndemnityLimitDropdown = () => getLocator("//div[contains(text(), 'Protection and Indemnity')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getProtectionIndemnityWreckRemovalDropdown = () => getLocator("//div[contains(text(), 'Protection and Indemnity')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Wreck Removal')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getProtectionIndemnityLongshoremanDropdown = () => getLocator("//div[contains(text(), 'Protection and Indemnity')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Longshoreman')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getAccidentalSpillPollutionDropdown = () => getLocator("//div[contains(text(), 'Accidental Spill Pollution')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
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
const getUninsuredUnderinsuredBoatersLimitDropdown = () => getLocator("//div[contains(text(), 'Uninsured Boaters/Underinsured Boaters')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPetProtectionLimitDropdown = () => getLocator("//div[contains(text(), 'Pet Protection')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTravelLossCheckbox = () => getLocator("//div[contains(text(), 'Travel Loss')]/parent::div//input[@role='checkbox']");
const getNauticalCollectiblesCheckbox = () => getLocator("//div[contains(text(), 'Nautical Collectibles')]/parent::div//input[@role='checkbox']");
const getNauticalCollectiblesLimitInputBox = () => getLocator("//div[contains(text(), 'Nautical Collectibles')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getNauticalCollectiblesDeductibleDropdown = () => getLocator("//div[contains(text(), 'Nautical Collectibles')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Deductible')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHullCheckbox = () => getLocator("//div[contains(text(), 'Hull')]/parent::div//input[@role='checkbox']");
const getHullDeductibleOptionDropdown = () => getLocator("//input[contains(@id, 'HullDeductiblePercent-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getYesHullDiminishingDeductibleRadioButton = () => getLocator("//div[contains(text(), 'Hull')] /parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Diminishing Deductible')]/parent::td/following-sibling::td//input[contains(@id,'HullDiminishingDeductible_true')]");
const getNoHullDiminishingDeductibleRadioButton = () => getLocator("//div[contains(text(), 'Hull')] /parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Diminishing Deductible')]/parent::td/following-sibling::td//input[contains(@id,'HullDiminishingDeductible_false')]");
const getHullSettlementOptionDropdown = () => getLocator("//input[contains(@id, 'HullSettlementOpt-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHullLayupPeriodDropdown = () => getLocator("//input[contains(@id, 'HullLayUpPeriod-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHullLayupTypeDropdown = () => getLocator("//input[contains(@id, 'HullLayUpType-inputEl')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getHaulOutLimitDropdown = () => getLocator("//div[contains(text(), 'Haul Out')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getSearchRescueLimitDropdown = () => getLocator("//div[contains(text(), 'Search and Rescue')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getDinghyLimitInputBox = () => getLocator("//div[contains(text(), 'Dinghy')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//input[contains(@id,'DinghyLimit-inputEl')]");
const getDinghyDeductubleDropdown = () => getLocator("//div[contains(text(), 'Dinghy')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Deductible')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPersonalEffectsLimitDropdown = () => getLocator("//div[contains(text(), 'Personal Effects')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPersonalEffectsDeductibleDropdown = () => getLocator("//div[contains(text(), 'Personal Effects')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Deductible')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getPersonalEffectsSettlementOptionDropdown = () => getLocator("//div[contains(text(), 'Personal Effects')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Settlement Option')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTowingLimitDropdown = () => getLocator("//div[contains(text(), 'Additional Living Expense')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTournamentFeeCheckBox = () => getLocator("//div[contains(text(), 'Tournament Fee Reimbursement')]/parent::div//input[@role='checkbox']");
const getTowingAndEmergencyExpenseLimitDropdown = () => getLocator("//div[contains(text(), 'Towing and Emergency Expense')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getTournamentFeeLimitDropdown = () => getLocator("//div[contains(text(), 'Tournament Fee Reimbursement')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getBoatLiftCheckBox = () => getLocator("//div[contains(text(), 'Boat Lift')]/parent::div//input[@role='checkbox']");
const getBoatLiftInputBox = () => getLocator("//div[contains(text(), 'Boat Lift')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getLiveaboardCheckBox = () => getLocator("//div[contains(text(), 'Liveaboard')]/parent::div//input[@role='checkbox']");
const getAdditionalLivingExpenseCheckBox = () => getLocator("//div[contains(text(), 'Additional Living Expense')]/parent::div//input[@role='checkbox']");
const getAdditionalLivingExpenseLimitDropdown = () => getLocator("//div[contains(text(), 'Additional Living Expense')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getCaptainAndCrewCheckBox = () => getLocator("//div[contains(text(), 'Captain and Crew')]/parent::div//input[@role='checkbox']");
const getCaptainAndCrewLimitInputBox = () => getLocator("//div[contains(text(), 'Captain and Crew')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Limit')]/parent::td/following-sibling::td//div[contains(@id, 'CoverageInputSet:CovPatternInputGroup')]");
const getCaptainAndCrewCrewInputBox = () => getLocator("//div[contains(text(), 'Captain and Crew')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), '# Crew')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
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
const getBowToSternCheckBox = () => getLocator("//div[contains(text(), 'Bow To Stern')]/parent::div//input[@role='checkbox']");
const getExcessSaleOfFishCheckBox = () => getLocator("//div[contains(text(), 'Excess Sale of Fish')]/parent::div//input[@role='checkbox']");
const getCharteredFishingCheckBox = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div//input[@role='checkbox']");
const getDaysofChartedFishingInput = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Days')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getPassengerChartedFishingInput = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Passengers')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getUseChartedFishingDropdown = () => getLocator("//div[contains(text(), 'Chartered Fishing Guide')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Use')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getOccasionalCharterCheckBox = () => getLocator("//div[contains(text(), 'Occasional Charter')]/parent::div//input[@role='checkbox']");
const getDaysofOccasionalCharterInput = () => getLocator("//div[contains(text(), 'Occasional Charter')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Days')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getPassengerOccasionalCharterInput = () => getLocator("//div[contains(text(), 'Occasional Charter')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Passengers')]/parent::td/following-sibling::td//input[contains(@id, 'CovTermInputSet:DirectTermInput-inputEl')]");
const getExtendedPartsReplacementCheckBox = () => getLocator("//div[contains(text(), 'Extended Parts Replacement')]/parent::div//input[@role='checkbox']");
const getExtendedPartsReplacementDropDown = () => getLocator("//div[contains(text(), 'Extended Parts Replacement')]/parent::div/parent::span/parent::legend/parent::fieldset/parent::td//div//label[contains(text(), 'Years')]/parent::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getVehicle1 = () => getLocator("//tbody[contains(@id,'gridview')]//tr[1]//td[1]");
const getVehicle2 = () => getLocator("//tbody[contains(@id,'gridview')]//tr[2]//td[1]");
const getVehicle3 = () => getLocator("//tbody[contains(@id,'gridview')]//tr[3]//td[1]");
const getCoverageExclusionsButton = () => getLocator("//span[contains(text(),'Exclusions')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:PAVehicleExclusionCoveragesCardTab']");
const getCoverageExclusionsAllVehiclesButton = () => getLocator("//span[contains(text(),'Exclusions')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PolicyExclusionsTab']");
const getCoverage = () => getLocator("//span[contains(text(),'Coverages')]/parent::span/parent::span/parent::a[@id='SubmissionWizard:LOBWizardStepGroup:LineWizardStepSet:PersonalAutoScreen:PAPerVehiclePanelSet:VehicleCoverageDetailsCV:VehicleCoverageDetailsCardTab']");
const getValidationErrorMsgCore = ()=> getLocator("//img[@class='error_icon']/parent::div[@class='message']");


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

function isBlankValue(value: any): boolean {
  return value === null || value === undefined || String(value).trim() === "";
}

function normalizeSelectionAction(rawValue: any): "select" | "do not select" | undefined {
  const value = String(rawValue ?? "").trim().toLowerCase();
  if (!value) return undefined;

  const actionKey = value.replace(/[\s_-]/g, "");

  if (["select", "slect", "yes", "true", "y", "1"].includes(actionKey)) {
    return "select";
  }

  if (["donotselect", "donotslect", "unselect", "deselect", "no", "false", "n", "0"].includes(actionKey)) {
    return "do not select";
  }

  return undefined;
}

function resolveToggleAndValue(toggleRaw: any, valueRaw: any): any {
  const toggle = String(toggleRaw ?? "").trim();
  const value = String(valueRaw ?? "").trim();
  const normalizedToggle = toggle.toLowerCase();
  const normalizedValue = value.toLowerCase();

  // Explicit unselect always wins.
  if (normalizedToggle === "do not select" || normalizedValue === "do not select") {
    return "Do not Select";
  }

  // Prefer concrete value if provided (non Select/Do not Select text).
  const isActionWord = (v: string) => v === "select" || v === "do not select";
  if (value && !isActionWord(normalizedValue)) {
    return valueRaw;
  }
  if (toggle && !isActionWord(normalizedToggle)) {
    return toggleRaw;
  }

  // Fallback to explicit Select when no concrete value is provided.
  if (normalizedToggle === "select" || normalizedValue === "select") {
    return "Select";
  }

  return undefined;
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
//handle radeip selection genric function
// async function handleRadioSelection(
//   yesRef: LocatorOrFactory,
//   noRef: LocatorOrFactory,
//   rawValue: string,
//   label = "Radio Option"
// ): Promise<void> {

//   const yesRadio = resolveLocator(yesRef);
//   const noRadio = resolveLocator(noRef);

//   const value = String(rawValue ?? "").trim().toLowerCase();

//   if (!(await isElementVisible(yesRadio)) || !(await isElementVisible(noRadio))) {
//     console.log(`ℹ️ ${label} radios not visible. Skipping.`);
//     return;
//   }

//   // Determine currently selected state using aria-checked or class
//   const isYesSelected = await yesRadio.getAttribute("aria-checked")
//     .then(v => v === "true")
//     .catch(() => false);

//   const isNoSelected = await noRadio.getAttribute("aria-checked")
//     .then(v => v === "true")
//     .catch(() => false);

//   console.log(`🔍 ${label} | value='${value}' | yesSelected=${isYesSelected} | noSelected=${isNoSelected}`);

//   // ✅ YES selection
//   if (["yes", "true", "y"].includes(value)) {
//     if (isYesSelected) {
//       console.log(`ℹ️ ${label}: Yes already selected.`);
//       return;
//     }

//     await click(yesRadio);
//     console.log(`✅ ${label}: Yes selected`);
//     return;
//   }

//   // ❌ NO selection
//   if (["no", "false", "n"].includes(value)) {
//     if (isNoSelected) {
//       console.log(`ℹ️ ${label}: No already selected.`);
//       return;
//     }

//     await click(noRadio);
//     console.log(`✅ ${label}: No selected`);
//     return;
//   }

//   throw new Error(`❌ Invalid value '${rawValue}' for ${label}. Expected Yes/No`);
// }

// async function handleRadioSelection(
//   yesRef: LocatorOrFactory,
//   noRef: LocatorOrFactory,
//   rawValue: string,
//   label = "Radio Option"
// ): Promise<void> {

//   const yesRadio = resolveLocator(yesRef);
//   const noRadio = resolveLocator(noRef);

//   const value = String(rawValue ?? "").trim().toLowerCase();

//   // ✅ Wait for radios to load/render
//   try {
//     await yesRadio.waitFor({
//       state: "attached",
//       timeout: 5000
//     });
//   } catch {
//     console.log(`⏳ ${label} radio did not load within 5 seconds.`);
//   }

//   const yesCount = await yesRadio.count();
//   const noCount = await noRadio.count();

//   const isYesVisible = yesCount > 0 ? await isElementVisible(yesRadio) : false;
//   const isNoVisible = noCount > 0 ? await isElementVisible(noRadio) : false;

//   console.log(`
// 🔍 ${label}
// YES Count     : ${yesCount}
// NO Count      : ${noCount}
// YES Visible   : ${isYesVisible}
// NO Visible    : ${isNoVisible}
// `);

//   if (yesCount === 0 && noCount === 0) {
//     console.log(`ℹ️ ${label} radios not rendered. Skipping.`);
//     return;
//   }

//   const isYesSelected = await yesRadio
//     .getAttribute("aria-checked")
//     .then(v => v === "true")
//     .catch(() => false);

//   const isNoSelected = await noRadio
//     .getAttribute("aria-checked")
//     .then(v => v === "true")
//     .catch(() => false);

//   console.log(
//     `🔍 ${label} | value='${value}' | yesSelected=${isYesSelected} | noSelected=${isNoSelected}`
//   );

//   if (["yes", "true", "y"].includes(value)) {

//     if (isYesSelected) {
//       console.log(`ℹ️ ${label}: Yes already selected.`);
//       return;
//     }

//     await click(yesRadio);
//     console.log(`✅ ${label}: Yes selected`);
//     return;
//   }

//   if (["no", "false", "n"].includes(value)) {

//     if (isNoSelected) {
//       console.log(`ℹ️ ${label}: No already selected.`);
//       return;
//     }

//     await click(noRadio);
//     console.log(`✅ ${label}: No selected`);
//     return;
//   }

//   throw new Error(
//     `❌ Invalid value '${rawValue}' for ${label}. Expected Yes/No`
//   );
// }
async function handleRadioSelection(
  yesRef: LocatorOrFactory,
  noRef: LocatorOrFactory,
  rawValue: string,
  label = "Radio Option"
): Promise<void> {

  const yesRadio = resolveLocator(yesRef);
  const noRadio = resolveLocator(noRef);

  const value = String(rawValue ?? "").trim().toLowerCase();

  // ✅ Wait for radios to render (Guidewire dynamic loading)
  let radiosRendered = false;

  for (let attempt = 1; attempt <= 5; attempt++) {

    const yesCount = await yesRadio.count();
    const noCount = await noRadio.count();

    const isYesVisible =
      yesCount > 0
        ? await isElementVisible(yesRadio).catch(() => false)
        : false;

    const isNoVisible =
      noCount > 0
        ? await isElementVisible(noRadio).catch(() => false)
        : false;

    console.log(`
🔍 ${label} - Attempt ${attempt}
YES Count     : ${yesCount}
NO Count      : ${noCount}
YES Visible   : ${isYesVisible}
NO Visible    : ${isNoVisible}
`);

    if (yesCount > 0 || noCount > 0) {
      radiosRendered = true;
      break;
    }

    console.log(`⏳ Waiting for ${label} radios to render...`);
    await wait(1000);
  }

  if (!radiosRendered) {
    console.log(`ℹ️ ${label} radios not rendered after 5 attempts. Skipping.`);
    return;
  }

  // Determine selected state
  const isYesSelected = await yesRadio
    .getAttribute("aria-checked")
    .then(v => v === "true")
    .catch(() => false);

  const isNoSelected = await noRadio
    .getAttribute("aria-checked")
    .then(v => v === "true")
    .catch(() => false);

  console.log(
    `🔍 ${label} | value='${value}' | yesSelected=${isYesSelected} | noSelected=${isNoSelected}`
  );

  // ✅ YES
  if (["yes", "true", "y"].includes(value)) {

    if (isYesSelected) {
      console.log(`ℹ️ ${label}: Yes already selected.`);
      return;
    }

    await click(yesRadio);
    console.log(`✅ ${label}: Yes selected`);
    return;
  }

  // ✅ NO
  if (["no", "false", "n"].includes(value)) {

    if (isNoSelected) {
      console.log(`ℹ️ ${label}: No already selected.`);
      return;
    }

    await click(noRadio);
    console.log(`✅ ${label}: No selected`);
    return;
  }

  throw new Error(
    `❌ Invalid value '${rawValue}' for ${label}. Expected Yes/No`
  );
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
    // throw new Error(`${label} input is not visible`);
    console.log(`ℹ️ ${label} input is not visible. Skipping action.`);
    return;
  }
 
  await clear(control);
  await wait(500);
  await click(control);
  await fill(control, value);
  console.log(`✅ ${label} set to: ${value}`);
}
 


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

async function selectUninsuredUnderinsuredBoatersLimit(value: any) {
  await selectDropdownWithRetry(
    getUninsuredUnderinsuredBoatersLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Uninsured/Underinsured Boaters Limit" }
  );
}

async function selectPetProtectiuonLimit(value: any) {
  await selectDropdownWithRetry(
    getPetProtectionLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Pet Protection Limit" }
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

async function selectNauticalCollectiblesDeductible(value: any) {
  await handleCoverageSectionSelection(//cb with child
    getNauticalCollectiblesCheckbox,
    getNauticalCollectiblesDeductibleDropdown,
    String(value ?? ""),
   { controlType: "dropdown", maxDropdownAttempts: 5}
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
async function selectOccasionalCharterCheckBox(value: any) {
  await handleCoverageSectionSelection(
    getOccasionalCharterCheckBox(),
    getDaysofOccasionalCharterInput(),
    String(value ?? ""),
    { controlType: "input"}
  );
}
async function selectOccasionalCharterPassengersInput(value: any) {
  await setCoverageInputValue(// i/p, dd
    getPassengerOccasionalCharterInput,
    String(value ?? ""),
    "Passengers of Occasional Charter"
  );
}
async function selectExtendedPartsReplacement(value: any) {
  await handleCoverageSectionSelection(
    getExtendedPartsReplacementCheckBox,
    getExtendedPartsReplacementDropDown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
  )
}
async function selectHullDeductibleOption(value: any) {
  await handleCoverageSectionSelection(
    getHullCheckbox(),
    getHullDeductibleOptionDropdown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
  )
}

async function handleHullDeductibleSelection(
  toggleRaw: any,
  deductiblePercentRaw: any
) {
  const toggleAction = normalizeSelectionAction(toggleRaw);
  const deductiblePercent = String(deductiblePercentRaw ?? "").trim();
  const hasDeductiblePercent = deductiblePercent !== "";

  // Action column controls checkbox state first.
  if (toggleAction === "do not select") {
    await clickCheckboxWithVerification(getHullCheckbox(), false);
    console.log("✅ Hull Deductible action is Do Not Select - checkbox unselected");
    return;
  }

  if (toggleAction === "select") {
    await clickCheckboxWithVerification(getHullCheckbox(), true);
    console.log("✅ Hull Deductible action is Select - checkbox selected");
  }

  // If no percentage value is provided, stop after action handling.
  if (!hasDeductiblePercent) {
    console.log("ℹ️ Hull Deductible percentage value is empty - skipping dropdown selection");
    return;
  }

  // Percentage value column: ensure checkbox selected, then pick option.
  await clickCheckboxWithVerification(getHullCheckbox(), true);
  await selectDropdownWithRetry(
    getHullDeductibleOptionDropdown,
    deductiblePercent,
    { maxAttempts: 5, label: "Hull Deductible Percentage Option" }
  );
}

async function selectHullDiminishingDeductibleOption(value: any) {
  if (!value) {
    console.log("ℹ️ No value provided for Hull Diminishing Deductible. Skipping.");
    return;
  }
      await clickCheckboxWithVerification(
        getHullCheckbox(),
        true
      );
  await handleRadioSelection(
    getYesHullDiminishingDeductibleRadioButton,
    getNoHullDiminishingDeductibleRadioButton,
    String(value).trim(),
    "Hull Diminishing Deductible Option"
  );
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

async function selectHullLayupPeriod(value: any) {
  // Check if Hull checkbox is already selected by checking if layup period dropdown is visible
  const isDropdownVisible = await isElementVisible(getHullLayupPeriodDropdown());
  
  if (!isDropdownVisible) {
    console.log("⚠️ Hull Layup Period dropdown not visible - selecting Hull checkbox first...");
    
    // Select Hull checkbox to make the settlement dropdown visible
    const checkboxSelected = await clickCheckboxWithVerification(
      getHullCheckbox(), 
      true, 
      getHullLayupPeriodDropdown
    );
    
    if (!checkboxSelected) {
      throw new Error("Failed to select Hull checkbox for Hull Layup Period");
    }
    
    console.log("✅ Hull checkbox selected, Hull Layup Period dropdown should now be visible");
    await wait(1500); // Wait for UI to update
  } else {
    console.log("✅ Hull Layup Period dropdown already visible (Hull checkbox already selected)");
  }
  
  // Now select the settlement option
  await selectDropdownWithRetry(
    getHullLayupPeriodDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Hull Layup Period", postClickWaitMs: 1500 }
  )
}

async function selectHullLayupType(value: any) {
  // Check if Hull checkbox is already selected by checking if layup type dropdown is visible
  const isDropdownVisible = await isElementVisible(getHullLayupTypeDropdown());
  
  if (!isDropdownVisible) {
    console.log("⚠️ Hull Layup Type dropdown not visible - selecting Hull checkbox first...");
    
    // Select Hull checkbox to make the settlement dropdown visible
    const checkboxSelected = await clickCheckboxWithVerification(
      getHullCheckbox(), 
      true, 
      getHullLayupTypeDropdown
    );
    
    if (!checkboxSelected) {
      throw new Error("Failed to select Hull checkbox for Hull Layup Type");
    }
    
    console.log("✅ Hull checkbox selected, Hull Layup Type dropdown should now be visible");
    await wait(1500); // Wait for UI to update
  } else {
    console.log("✅ Hull Layup Type dropdown already visible (Hull checkbox already selected)");
  }
  
  // Now select the layup type option
  await selectDropdownWithRetry(
    getHullLayupTypeDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Hull Layup Type", postClickWaitMs: 1500 }
  )
}

async function selectPersonalEffectsLimit(value: any) {
  await selectDropdownWithRetry(
    getPersonalEffectsLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Personal Effects Limit" }
  )
}

async function selectPersonalEffectsDeductible(value: any) {
  await selectDropdownWithRetry(
    getPersonalEffectsDeductibleDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Personal Effects Deductible" }
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

async function selectSearchRescueLimit(value: any) {
  await selectDropdownWithRetry(
    getSearchRescueLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Search and Rescue Limit" }
  )
}

async function selectDinghyLimit(value: any) {
  await setCoverageInputValue(
    getDinghyLimitInputBox,
    String(value ?? ""),
      "Dinghy Limit"
    );
}

async function selectDinghyDeductible(value: any) {
  await selectDropdownWithRetry(
    getDinghyDeductubleDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Dinghy Deductible" }
  )
}

async function selectTowingAndEmergencyExpense(value: any) {
  await selectDropdownWithRetry(
    getTowingAndEmergencyExpenseLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 5, label: "Towing and Emergency Expense", postClickWaitMs: 1500 }
  )
}

async function selectTournamentFeeReimbursement(value: any) {
  await handleCoverageSectionSelection(
    getTournamentFeeCheckBox(),
    getTournamentFeeLimitDropdown,
    String(value ?? ""),
    { controlType: "dropdown", maxDropdownAttempts: 5 }
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

async function selectGenuinePartsSecurity(value: any) {
  await handleCheckboxOnlySelection(
    getGenuinePartsSecurityCheckBox(),
    String(value ?? "")
  );
}

async function selectLiveaboard(Liveaboardvalue: any, AdditionalLivingExpenseValue: any) {
  await handleCheckboxOnlySelection
  (
    getLiveaboardCheckBox,
    String(Liveaboardvalue ?? "")
  );
  if (AdditionalLivingExpenseValue) {
    await handleCoverageSectionSelection(
      getAdditionalLivingExpenseCheckBox,
      getAdditionalLivingExpenseLimitDropdown,
      String(AdditionalLivingExpenseValue ?? ""),
        { controlType: "dropdown", maxDropdownAttempts: 5 }
    );
  }
}
  
async function selectCaptainAndCrew(limitValue: any, crewValue: any) {
  const checkbox = getCaptainAndCrewCheckBox();

  const shouldSelect = !!(limitValue || crewValue);

  // ✅ Step 1: Handle checkbox
  await clickCheckboxWithVerification(checkbox, shouldSelect, getCaptainAndCrewLimitInputBox);

  if (!shouldSelect) {
    console.log("Captain and Crew not selected, skipping further inputs");
    return;
  }

  // ✅ Step 2: Select LIMIT (dropdown)
  if (limitValue) {
    await selectDropdownWithRetry(
      getCaptainAndCrewLimitInputBox,
      String(limitValue),
      { label: "Captain and Crew Limit" }
    );
  }

  // ✅ Step 3: Enter CREW count (input)
  if (crewValue) {
    await setCoverageInputValue(
      getCaptainAndCrewCrewInputBox,
      String(crewValue),
      "Captain and Crew Count"
    );
  }

  console.log("✅ Captain and Crew handled successfully");
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

async function selectProtectionAndIndemnityLimit(value: number) {
  await selectDropdownWithRetry(
    getProtectionIndemnityLimitDropdown,
    String(value ?? ""),
    { maxAttempts: 8, label: "Protection and Indemnity Limit" }
  );
}

async function selectProtectionIndemnityWreckRemoval(value: number) {
  await selectDropdownWithRetry(
    getProtectionIndemnityWreckRemovalDropdown,
    String(value ?? ""),
    { maxAttempts: 8, label: "Protection and Indemnity Wreck Removal" }
  );
}

async function selectProtectionAndIndemnityLongshoreman(value: number) {
  await selectDropdownWithRetry(
    getProtectionIndemnityLongshoremanDropdown,
    String(value ?? ""),
    { maxAttempts: 8, label: "Protection and Indemnity Longshoreman" }
  );
}

async function selectAccidentalSpillPollution(value: number) {
  await selectDropdownWithRetry(
    getAccidentalSpillPollutionDropdown,
    String(value ?? ""),
    { maxAttempts: 8, label: "Accidental Spill Pollution" }
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

// async function selectTowingAndEmergencyExpense(
//   towing: number,

// ) {

//   if (towing != null) {
//     const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${towing}']`);
//         const maxAttempts = 8;
//         const attemptDelay = 500; // ms
     
//         for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//             // Click to open the drop-down / refresh list
//             await getTowingandEmergencyExpenseDropdown().click({ force: true }).catch(() => {});
     
//             try {
//                 // Small wait for the option to appear
//                 await optionLocator.waitFor({ state: "visible", timeout: 1000 });
//                 // Option is present and visible, click it and return
//                 await click(optionLocator);
//                 console.log(`selectConstructionType: selected '${towing}' on attempt ${attempt}`);
//                 return;
//             } catch {
//                 // Not yet visible — wait and try again
//                 await wait(attemptDelay);
//             }
//         }
     
//         throw new Error(`selectMake: option '${towing}' not found after ${maxAttempts} attempts`);
//   }
//   }

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

//   async function switchToVehicleIfNeeded(page: Page, QuoteData: any) {
//   const transaction = QuoteData["Transaction"];

//   if (!transaction) return;

//   if (transaction.includes("Vehicle 2")) {
//     console.log("🚗 Switching to Vehicle 2");

//     if (await getVehicle2().isVisible()) {
//       await getVehicle2().dblclick({ force: true });
//       await wait(2000);

//       await getCoverage().scrollIntoViewIfNeeded();
//       await getCoverage().click({ force: true });

//       await wait(3000);
//     }
//   }

//   if (transaction.includes("Vehicle 3")) {
//     console.log("🚗 Switching to Vehicle 3");

//     if (await getVehicle3().isVisible()) {
//       await getVehicle3().dblclick({ force: true });
//       await wait(2000);

//       await getCoverage().scrollIntoViewIfNeeded();
//       await getCoverage().click({ force: true });

//       await wait(3000);
//     }
//   }
// }

async function switchToVehicle(
  vehicleLocator: Locator,
  vehicleName: string
): Promise<boolean> {
  try {
    if (!(await vehicleLocator.isVisible())) {
      console.log(`⏭️ ${vehicleName} not visible`);
      return false;
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔄 Switching to ${vehicleName} - Attempt ${attempt}`);

      await vehicleLocator.scrollIntoViewIfNeeded();
      await vehicleLocator.click({ force: true });

      await wait(1200);

      const row = vehicleLocator.locator("xpath=ancestor::tr[1]");
      let classes = await row.getAttribute("class");

      console.log(`${vehicleName} row classes after click: ${classes}`);

      if (classes?.includes("x-grid-row-selected")) {
        console.log(`✅ ${vehicleName} selected successfully`);
        return true;
      }

      // Some grids bind details only on double click; retry with dblclick before failing attempt.
      await vehicleLocator.dblclick({ force: true }).catch(() => {});
      await wait(1800);

      classes = await row.getAttribute("class");
      console.log(`${vehicleName} row classes after dblclick: ${classes}`);

      if (classes?.includes("x-grid-row-selected")) {
        console.log(`✅ ${vehicleName} selected successfully after dblclick`);
        return true;
      }
    }

    console.log(`❌ Failed to select ${vehicleName}`);
    return false;

  } catch (error) {
    console.log(`❌ Error while selecting ${vehicleName}:`, error);
    return false;
  }
}
export async function fillCoveragesCorePage(
  page: Page,
  testInfo: TestInfo,
  Quote: any[],
  ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any,
): Promise<ValidationResult> {

  await wait(TIMEOUT_4_SECONDS);

  try {

    // =========================
    // ✅ CLEAR DATA
    // =========================
    for (let i = 0; i < 5; i++) {
      if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
        await getClearButtoninRiskAnalysisCore().click();
        await waitForPageReady(page);
      } else break;
    }

    const processed = new Set<string>();
    // =========================
    // ✅ MAIN LOOP
    // =========================
    let genericApplied = false;
    for (let QuoteData of Quote) {

      const transaction = QuoteData["Transaction"];
      const testNo = QuoteData["TEST#"];

      // ✅ Skip invalid rows
      if (!transaction ||
        transaction.includes("Add Vehicle") ||
        !transaction.includes("Vehicle")) {
        continue;
      }

console.log(`⚙️ Running GENERIC COVERAGES for TEST ${testNo}`);

// =========================
// ✅ GENERIC COVERAGES (RUN ONCE ✅ FIXED)
// =========================
if (!genericApplied) {

  console.log(`⚙️ Running GENERIC COVERAGES for TEST ${testNo}`);

  // ✅ Open coverage tab BEFORE applying
  await getCoverage().scrollIntoViewIfNeeded();
  await getCoverage().click({ force: true });
  await wait(2000);

  // ✅ GENERIC COVERAGES
  if (QuoteData["Protection and Indemnity: Limit"]) {
    await selectProtectionAndIndemnityLimit(QuoteData["Protection and Indemnity: Limit"]);
  }

  if (QuoteData["Protection and Indemnity: Wreck Removal"]) {
    await selectProtectionIndemnityWreckRemoval(QuoteData["Protection and Indemnity: Wreck Removal"]);
  }

  if (QuoteData["Protection and Indemnity: Longshoreman and Harbor Workers' Compensation"]) {
    await selectProtectionAndIndemnityLongshoreman(
      QuoteData["Protection and Indemnity: Longshoreman and Harbor Workers' Compensation"]
    );
  }

  if (QuoteData["Accidental Spill Pollution: Limit"]) {
    await selectAccidentalSpillPollution(QuoteData["Accidental Spill Pollution: Limit"]);
  }

  if (QuoteData["Medical Payments: Limit"]) {
    await selectMedicalPayment(QuoteData["Medical Payments: Limit"]);
  }

  if (QuoteData["Uninsured Boaters / Underinsured Boaters: Limit"]) {
    await selectUninsuredUnderinsuredBoatersLimit(
      QuoteData["Uninsured Boaters / Underinsured Boaters: Limit"]
    );
  }

  if (QuoteData["Pet Protection: Limit"]) {
    await selectPetProtectiuonLimit(QuoteData["Pet Protection: Limit"]);
  }



  if (QuoteData["Nautical Collectibles: Limit"]) {
    await selectNauticalCollectiblesCheckBox(QuoteData["Nautical Collectibles: Limit"]);
    await selectNauticalCollectiblesLimit(QuoteData["Nautical Collectibles: Limit"]);
  }

  if (QuoteData["Nautical Collectibles: Deductible"]) {
    await selectNauticalCollectiblesDeductible(QuoteData["Nautical Collectibles: Deductible"]);
  }

  // ✅ Mark as applied so it won't run again
  genericApplied = true;
}

     // =========================
      // ✅ DUPLICATE PROTECTION
      // =========================
      const key = `${testNo}-${transaction}`;
      if (processed.has(key)) continue;
      processed.add(key);

      // =========================
      // ✅ VEHICLE IDENTIFICATION
      // =========================
      let vehicleLabel = "1";
      if (transaction.includes("Vehicle 2")) vehicleLabel = "2";
      else if (transaction.includes("Vehicle 3")) vehicleLabel = "3";

      console.log(`🚤 Processing ${vehicleLabel}`);

      // =========================
      // ✅ VEHICLE SWITCH (VERIFIED)
      // =========================
      if (vehicleLabel !== "1") {
        const targetVehicleLocator = vehicleLabel === "2" ? getVehicle2() : getVehicle3();
        const switched = await switchToVehicle(targetVehicleLocator, `Vehicle ${vehicleLabel}`);
        if (!switched) {
          console.log(`⏭️ Unable to switch to Vehicle ${vehicleLabel}`);
          continue;
        }
      }

      // =========================
      // ✅ COVERAGE TAB
      // =========================
      await getCoverage().scrollIntoViewIfNeeded();
      await getCoverage().click({ force: true });
      await wait(2000);

      // =========================
      // ✅ VEHICLE COVERAGES
      // =========================
      await handleHullDeductibleSelection(
        QuoteData["Hull: Deductible"],
        QuoteData["Hull: Deductible [PAHullDeductiblePercent]"]
      );
      console.log(
      "Hull Diminishing Deductible Value =>",
      JSON.stringify(QuoteData["Hull: Diminishing Deductible"])
      );

      if (QuoteData["Hull: Diminishing Deductible"]) {
        await wait(3000);
        await selectHullDiminishingDeductibleOption(QuoteData["Hull: Diminishing Deductible"]);
      }

      if (QuoteData["Hull: Settlement Option"]) {
        await selectHullSettlementOption(QuoteData["Hull: Settlement Option"]);
      }

      if (QuoteData["Hull: Lay-up Period"]) {
        await selectHullLayupPeriod(QuoteData["Hull: Lay-up Period"]);
      }

      if (QuoteData["Hull: Lay-up Type"]) {
        await selectHullLayupType(QuoteData["Hull: Lay-up Type"]);
      }

      if (QuoteData["Haul Out: Limit"]) {
        await selectHaulOutLimit(QuoteData["Haul Out: Limit"]);
      }

      if (QuoteData["Travel Loss: Per day/Per occurrence"]) {
        await selectTravelLossCheckBox(
          QuoteData["Travel Loss: Per day/Per occurrence"]
        );
      }

      if (QuoteData["Search and Rescue: Limit"]) {
        await selectSearchRescueLimit(QuoteData["Search and Rescue: Limit"]);
      }

      if (QuoteData["Dinghy: Limit"]) {
        await selectDinghyLimit(QuoteData["Dinghy: Limit"]);
      }

      if (QuoteData["Dinghy: Deductible"]) {
        await selectDinghyDeductible(QuoteData["Dinghy: Deductible"]);
      }

      if (QuoteData["Personal Effects: Limit"]) {
        await selectPersonalEffectsLimit(QuoteData["Personal Effects: Limit"]);
      }

      if (QuoteData["Personal Effects: Deductible"]) {
        await selectPersonalEffectsDeductible(QuoteData["Personal Effects: Deductible"]);
      }

      if (QuoteData["Personal Effects: Settlement Option"]) {
        await selectPersonalEffectsSettlementOption(QuoteData["Personal Effects: Settlement Option"]);
      }

      if (QuoteData["Towing and Emergency Expense: Limit"]) {
        await selectTowingAndEmergencyExpense(QuoteData["Towing and Emergency Expense: Limit"]);
      }

      if (QuoteData["Tournament Fee Reimbursement: Limit"]) {
        await selectTournamentFeeReimbursement(QuoteData["Tournament Fee Reimbursement: Limit"]);
      }

      if (QuoteData["Boat Lift: Limit"]) {
        await selectBoatLift(QuoteData["Boat Lift: Limit"]);
      }

      if (QuoteData["Genuine Parts Security"]) {
        await selectGenuinePartsSecurity(QuoteData["Genuine Parts Security"]);
      }

      if (QuoteData["Liveaboard"]) {
        await selectLiveaboard(
          QuoteData["Liveaboard"],
          QuoteData["Additional Living Expense: Limit"]
        );
      }

      if (QuoteData["Captain and Crew: Limit"] || QuoteData["Captain and Crew: # Crew"]) {
        await selectCaptainAndCrew(
          QuoteData["Captain and Crew: Limit"],
          QuoteData["Captain and Crew: # Crew"]
        );
      }

      if (QuoteData["Rental Reimbursement: Days/limit per day"]) {
        await selectRentalReimbursement(
          QuoteData["Rental Reimbursement: Days/limit per day"]
        );
      }

      if (QuoteData["Port Risk: In / Out of Water"]) {
        await selectPortRiskInOutWater(
          QuoteData["Port Risk: In / Out of Water"]
        );
      }

      if (QuoteData["Named Driver"]) {
        await selectNamedDriverCheckBox(QuoteData["Named Driver"]);
      }

      if (QuoteData["Extended Parts Replacement: Years"]) {
        await selectExtendedPartsReplacement(
          QuoteData["Extended Parts Replacement: Years"]
        );
      }

      if (QuoteData["Professional Angler"]) {
        await selectProfessionalAnglerCheckBox(QuoteData["Professional Angler"]);
      }

      if (QuoteData["Bow To Stern"]) {
        await selectBowToSSternCheckBox(QuoteData["Bow To Stern"]);
      }

      if (QuoteData["Excess Sale of Fish"]) {
        await selectExcessSaleOfFishCheckBox(QuoteData["Excess Sale of Fish"]);
      }

      if (QuoteData["Chartered Fishing Guide: # Days"]) {
        await selectCharteredFishingCheckBox(
          QuoteData["Chartered Fishing Guide: # Days"]
        );
      }

      if (QuoteData["Chartered Fishing Guide: # Passengers"]) {
        await selectgetPassengerChartedFishingInput(
          QuoteData["Chartered Fishing Guide: # Passengers"]
        );
      }

      if (QuoteData["Chartered Fishing Guide: Use"]) {
        await selectUseChartedFishingDropdown(
          QuoteData["Chartered Fishing Guide: Use"]
        );
      }

      if (QuoteData["Occasional Charter: # Days"]) {
        await selectOccasionalCharterCheckBox(
          QuoteData["Occasional Charter: # Days"]
        );
      }

      if (QuoteData["Occasional Charter: # Passengers"]) {
        await selectOccasionalCharterPassengersInput(
          QuoteData["Occasional Charter: # Passengers"]
        );
      }

      // ✅ COVERAGE SS
      console.log(`waiting before capturing screenshots of vehicle ${vehicleLabel} coverages`);
      await wait(8000);
      const screenshotVehicleLocator =
        vehicleLabel === "1" ? getVehicle1() : vehicleLabel === "2" ? getVehicle2() : getVehicle3();
      const screenshotVehicleVerified = await switchToVehicle(screenshotVehicleLocator, `Vehicle ${vehicleLabel}`);
      //await captureFullPage2D(page, testInfo, `FillCoveragesCorePage of ${vehicleLabel}`, "#centerPanel");
      if (screenshotVehicleVerified) {
        await getCoverage().scrollIntoViewIfNeeded();
        await getCoverage().click({ force: true });
        await wait(2000);
        await captureFullPage2D(page, testInfo, `Coverage Details For Vehicle${vehicleLabel}`, "#centerPanel");
      } else {
        console.log(`⚠️ Skipping coverage screenshot: Vehicle ${vehicleLabel} selection not verified`);
      }
      // =========================
      // ✅ EXCLUSIONS
      // =========================
      await wait(5000);
      await getExclusionsTab().click();
      await wait(5000);

      if (QuoteData["Water Sports Liability Exclusion"]) {
        await selectWaterSportsLiabilityExclusionCheckBox(
          QuoteData["Water Sports Liability Exclusion"]
        );
      }

      if (QuoteData["Sailboat Rigging Exclusion"]) {
        await selectSailBoatRiggingExclusionCheckBox(
          QuoteData["Sailboat Rigging Exclusion"]
        );
      }

      // ✅ EXCLUSION SS
      console.log(`waiting before capturing exclusion screenshots of vehicle ${vehicleLabel}`);
      await wait(8000);
      const exclusionVehicleVerified = await switchToVehicle(screenshotVehicleLocator, `Vehicle ${vehicleLabel}`);
      //await captureFullPage2D(page, testInfo, `Exclusions in Coverages Core Page of ${vehicleLabel}`, "#centerPanel");
      if (exclusionVehicleVerified) {
        await getExclusionsTab().click({ force: true });
        await wait(2000);
        await captureFullPage2D(page, testInfo, `Coverage Exclusion Details For Vehicle${vehicleLabel}`, "#centerPanel");
      } else {
        console.log(`⚠️ Skipping exclusion screenshot: Vehicle ${vehicleLabel} selection not verified`);
      }
    }

    // =========================
    // ✅ VALIDATION
    // =========================
    await getCoveragesSaveAndNextButton().scrollIntoViewIfNeeded();
    await wait(500);

    await wait(2000);
    
    const getQuoteinCoveragesButton = () => getLocator("//span[contains(@id, 'PersonalAutoScreen') and contains(text(), 'Coverages')]/ancestor::*//span[contains(@id, 'QuoteOrReview-btnWrap')]");
    const getClearButton = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");

    await wait(TIMEOUT_4_SECONDS);
    // await getCoveragesSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
    await getQuoteinCoveragesButton().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(TIMEOUT_4_SECONDS);

    if (await isElementVisible(getValidationErrorMsgCore())) {
      await getClearButtoninRiskAnalysisCore().click({ force: true });
      await getCoveragesSaveAndNextButton().scrollIntoViewIfNeeded();
      await wait(500);
      await getCoveragesSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(TIMEOUT_4_SECONDS);
    }
 
    console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );
    
    if(validationResult.errorType == 'none'){
    if(await isElementVisible(getClearButton())){
          console.log("Clear button is visible, clicking on it");
          await getClearButton().click({ timeout: TIMEOUT_8_SECONDS });
        }
      }

    await wait(TIMEOUT_4_SECONDS);
    await wait(5000);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if (await isElementVisible(getQuoteinCoveragesButton())) {
      await wait(2000);
      if (await isElementVisible(getQuoteinCoveragesButton())) {
      await getQuoteinCoveragesButton().click({ timeout: 4000 });
      await wait(TIMEOUT_4_SECONDS);
      }
    }
 
    console.log("Coverage page validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;
  }
 
}
