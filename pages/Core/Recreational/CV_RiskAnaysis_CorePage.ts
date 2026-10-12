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
import { getHelpSheetRows } from "../../../utils/questionTextMapper";
import { log } from "console";
const getQuoteButtonRiskAnalysis = () => getLocator('//a[contains(@id,"SubmissionWizard:Job_RiskAnalysisScreen:JobWizardToolbarButtonSet:QuoteOrReview")]');
const getRiskAnalysisTab = () => getLocator("//div[contains(@class, 'treecolumn')]//span[text()='Risk Analysis']");
const getFirstApproval = () => getLocator("//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn']");
const getFirstCheckbox = () => getLocator("//a[text()='Approve']/parent::div/parent::td/parent::tr[@data-recordindex='1']//img[@class='x-grid-checkcolumn']");
const getCV_FirstApproval = () => getLocator("//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[contains(@class, 'x-grid-checkcolumn')]");
const getSaveandNext = () => getLocator("//a[contains(@id,'SubmissionWizard:Next')]//span[contains(text(),'Save and Next')]");
const getApproveBtn = () =>
  getLocator(
    '[id="SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:RiskEvaluationPanelSet:Approve-btnInnerEl"]'
  );
const getAlreadyApprovedCheckBox = () => getLocator("//a[text()='Reopen']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn x-grid-checkcolumn-checked']");
const getApproveOkBtn = () =>
  getLocator('[id="RiskApprovalDetailsPopup:Update"]');
const getUWIDescription = () =>
  getLocator('//a[contains(@id,"UWIssueRowSet:ShortDescription")]');
export const getWarningMsgCore = () => getLocator("//img[@class='warning_icon']/parent::div[@class='message']");
const getRiskAnalysisText = () => getLocator("//span[contains(@id, 'RiskAnalysisScreen') and contains(text(), 'Risk Analysis')]");
const getSaveAndNextButton = () => getLocator('//span[@id="SubmissionWizard:Next-btnInnerEl"]');
const getQuoteinPolicyReviewPage = () => getLocator("//span[contains(@id, 'SubmissionWizard:SubmissionWizard_PolicyReviewScreen:JobWizardToolbarButtonSet:QuoteOrReview-btnEl')]");
const getBindOptionsDropDown = () => getLocator("//span[contains(@id, 'BindOptions-btnWrap')]");
const getProceedToIssuanceOption = () => getLocator("//span[contains(@id, 'BindOptions:BindOnly-textEl') and contains(text(), 'Proceed To Issuance')]");
const getClueResultsPopUp = () => getLocator("//div[contains(text(), 'CLUE results have been applied. To continue issuance click Quote then Proceed to Issue')]");
const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const getReturnToRiskAnalysisButton = () => getLocator("//a[@id = 'Policy_IssuanceChecklistPopup:__crumb__' and contains(text(), 'Return to Risk Analysis') or contains(@id,  'Policy_IssuanceChecklistPopup:__crumb__')]");
const getReturnButton = () => getLocator("//a[@id = 'Policy_IssuanceChecklistPopup:__crumb__' and contains(text(), 'Return')]");
const getReturnToPolicyReviewButton = () => getLocator("//a[@id = 'Policy_IssuanceChecklistPopup:__crumb__' and contains(text(), 'Return to Policy Review')]");
const getQuoteButtonInCoreRiskAnalysis = () => getLocator("//span[contains(@id, 'QuoteOrReview-btnInnerEl')]/parent::span/parent::span/parent::a");
const getCLearButtoninPolicyIssuance = () => getLocator("//span[contains(@id,'WebMessageWorksheet_ClearButton-btnInnerEl')]")
const getReturntoApprovalRequired = () => getLocator("//a[contains(@id,'Policy_IssuanceChecklistPopup:__crumb__')]");
const getReturntoRiskAnalysis = () => getLocator("//a[contains(@id,'UWBlockProgressIssuesPopup:__crumb__')]");
const getWarningInIssuance = () => getLocator("//div[contains(text(),'Please verify results from the ordered reports.')]")
const getResolveButton = () => getLocator("//a[contains(@id,'UWBlockProgressIssuesPopup:IssuesScreen:DetailsButton')]");
const getUWMessage = () => getLocator("//label[contains(text(),'This quote will require underwriting approval prior to issuance.')]");
const getUWIssues = () => getLocator("//span[contains(@id,'EvaluationIssuesCardTab-btnInnerEl')]");
const getSaveAndNextInRiskAnalysis = () => getLocator("//a[contains(@id,'SubmissionWizard:Next')]");
const getphotoUploadUWMessage = () => getLocator("//label[contains(text(),'Photos must be uploaded for each vehicle according to program manual guidelines.')]");
const getLastUWErrorMessage = () => getLocator('//div[contains(text(),"(Please review underwriting issue on the Risk Analysis page.")]');
const getWarningMessage = () => getLocator("//div[@id='SubmissionWizard:Job_RiskAnalysisScreen:_msgs']");
const getRiskAnalysisWord = () => getLocator("//span[contains(@id,'SubmissionWizard:Job_RiskAnalysisScreen')]");
const getSaveButtoninCore = () => getLocator('[id="SubmissionWizard:Job_RiskAnalysisScreen:JobWizardToolbarButtonSet:Draft"]');
const getQuoteButton = () => getLocator('[id="SubmissionWizard:Job_RiskAnalysisScreen:JobWizardToolbarButtonSet:QuoteOrReview"]');
const getPriorPolicies = () => getLocator("//span[contains(@id,'SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:PriorPolicyCardTab-btnInnerEl')]");
const getLosses = () => getLocator("//span[contains(@id,'SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:LossHistoryCardTab-btnInnerEl')]/parent::span/parent::span/parent::a");
const getMotorVehicleRecord = () => getLocator("//span[contains(@id,'SubmissionWizard:Job_RiskAnalysisScreen:RiskAnalysisCV:MotorVehicleRecordTab-btnInnerEl')]");
const getDiscountApplied = () => getLocator("//span[contains(text(),'Discounts Applied')]/parent::span/parent::span/parent::a[contains(@id,'SubmissionWizard:SubmissionWizard_QuoteScreen:SubmissionWizard_QuoteScreen_DiscountsCardTab')]");
const getRA = () => getLocator("//span[contains(@id,'SubmissionWizard:Job_RiskAnalysisScreen:0') and contains(text(), 'Risk Analysis')]/ancestor::*//span[@id='SubmissionWizard:Next-btnInnerEl']");
const clearrisk = () => getLocator("//span[text()='Clear']")
const getUWIssuesHeading = () => getLocator("//span[contains(@id, 'EvaluationIssuesCardTab-btnInnerEl') and contains(text(), 'UW Issues')]");

export async function getIssueDescriptions(): Promise<string[]> {
  const count = await getUWIDescription().count();
  const descriptions: string[] = [];
  for (let i = 0; i < count; i++) {
    descriptions.push((await getUWIDescription().nth(i).textContent()) ?? "");
  }
  return descriptions.map((desc) => desc.trim());
}

export async function CV_UWIWording_Validation(
  testCaseId: string,
  ruleMatrix: Record<string, Record<string, any>>,
  page: Page,
  testInfo: TestInfo
): Promise<ValidationResult> {
  const blockingContext = "RiskAnalysis";
  return await validateRulesForTestCase(testCaseId, blockingContext, ruleMatrix, page, testInfo);
}

const DEFAULT_STANDARD_UW_KEY_PHRASES = [
  'Unit Photos must be uploaded',
  'A Prefill Report could not be obtained',
  'The number of drivers on the policy is fewer',
  'This policy requires review by Underwriting',
  'Vehicles under restoration require underwriting review',
  'Vehicle 1: Unit type/year falls outside automated underwriting parameters',
  'Vehicle #1: Storage Type: Carport requires underwriting review',
  'Vehicle 2: The make and model of this vehicle is generally unacceptable',
  'Driver merit points require underwriting review.',
  'Unverifiable Motor Vehicle Record requires underwriting review.',
  'The size of this boat requires',
  'Ownership Resume',
  ' NAMS/SAMS professional',
  'All Other',
  'The speed of this boat',
  'The age and speed capacity',
  'Construction Other requires underwriting review.',
  'the speed capacity',
  'Antique vessels require underwriting review',
  'Is not eligible due to the speed capacity of',
  'Risk is ineligible. Do not submit.',
  'Value must be between',
  'This risk may not be submitted.',
  'Risk is ineligible. Do not submit.',
  'The speed of this boat classifies it as high performance.',
  '"All Other" requires underwriting review.',
  'require underwriting review'
];

function getStandardUWKeyPhrasesFromHelpSheet(): string[] {
  try {
    const helpRows = getHelpSheetRows();
    if (!Array.isArray(helpRows) || helpRows.length === 0) {
      console.log("⚠️ Help sheet rows not available. Using default standard UW key phrases.");
      return DEFAULT_STANDARD_UW_KEY_PHRASES;
    }

    const normalize = (value: any) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const splitPhrases = (value: string): string[] =>
      value
        .split(/\r?\n|\||;/)
        .map((p) => p.trim())
        .filter(Boolean);

    const sectionColumns = ["Sheets", "Screens", "Page"];

    const targetSection = "Pre-Approvable UVR";
    const extracted: string[] = [];
    let currentSection = "";
    let preApprovableRowCount = 0;

    for (const [rowIndex, row] of helpRows.entries()) {
      const sectionValue = sectionColumns
        .map((col) => String(row[col] ?? "").trim())
        .find((value) => value.length > 0);

      if (sectionValue) {
        currentSection = normalize(sectionValue);
      }

      if (currentSection !== normalize(targetSection)) continue;
      preApprovableRowCount++;

      // For Pre-Approvable UVR, only extract from the "Field" column
      const fieldValue = String(row["Field"] ?? "").trim();
      if (fieldValue && normalize(fieldValue) !== targetSection) {
        extracted.push(fieldValue);
        console.log(`🧾 Pre-Approvable UVR rule ${preApprovableRowCount}: "${fieldValue.substring(0, 100)}..."`);
      }
    }

    if (preApprovableRowCount === 0) {
      console.log("⚠️ No rows found for section 'Pre-Approvable UVR' in Help sheet.");
    }

    const uniqueHelpPhrases = Array.from(
      new Set(extracted.map((phrase) => phrase.trim()).filter((phrase) => phrase.length > 2))
    );

    if (uniqueHelpPhrases.length === 0) {
      console.log("⚠️ No UW phrases found under 'Pre-Approvable UVR' in Help sheet. Using defaults.");
      return DEFAULT_STANDARD_UW_KEY_PHRASES;
    }

    const normalizePhrase = (value: string) =>
      value.toLowerCase().replace(/\s+/g, " ").trim();

    const mergedPhrases: string[] = [...DEFAULT_STANDARD_UW_KEY_PHRASES];
    const seen = new Set(mergedPhrases.map(normalizePhrase));

    for (const phrase of uniqueHelpPhrases) {
      const key = normalizePhrase(phrase);
      if (!seen.has(key)) {
        mergedPhrases.push(phrase);
        seen.add(key);
      }
    }

    console.log(
      `✅ Loaded standard UW key phrases. Defaults: ${DEFAULT_STANDARD_UW_KEY_PHRASES.length}, Help: ${uniqueHelpPhrases.length}, Merged: ${mergedPhrases.length}`
    );
    return mergedPhrases;
  } catch (error) {
    console.log("⚠️ Failed to load standard UW key phrases from Help sheet. Using defaults.", error);
    return DEFAULT_STANDARD_UW_KEY_PHRASES;
  }
}
export async function navigatetoRiskAnalysis(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getRiskAnalysisTab())) {
    await wait(5000);
    await getRiskAnalysisTab().click({ force: true });
    await wait(5000);
    await captureFullPage2D(page, testInfo, 'Risk Analysis Page Before Approval',"#centerPanel");
  }
}

export async function firstMandatoryUWIssue(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getQuoteButtonRiskAnalysis())) {
    await getQuoteButtonRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });

  }
  if (await isElementVisible(getUWMessage())) {
    await navigatetoRiskAnalysis(page, testInfo);
  }

  await captureAndAttachforCore(page, testInfo, 'First Mandatory UW Issue before approval')
}
// export async function CV_saveAndQuote(
//   testCaseId: string,
//   ruleMatrix: Record<string, Record<string, any>>,
//   page: Page, 
//   testInfo: TestInfo
// ): Promise<ValidationResult> {
//   if (await isElementVisible(getClearButtoninRiskAnalysisCore())){
//     await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
//   }
//   if (await isElementVisible(getFirstCheckbox())) {
//     await wait(5000);
//     const validationResult = await CV_UWIWording_Validation(testCaseId, ruleMatrix, page, testInfo);
//     if (validationResult.success && !validationResult.shouldStop) {
//       if (await isElementVisible(getFirstCheckbox())) {
//         const count = await getCV_FirstApproval().count();
//         console.log("🔍 Analyzing each UW issue for selective approval...");
//         await captureAndAttachforCore(page, testInfo, 'First Mandatory UW Issue before approval')
//         // Get all UW descriptions to validate each one individually
//         const uwDescriptions = await getIssueDescriptions();
//         console.log("UW Descriptions found:", uwDescriptions);

//         // Standard UW messages that are always acceptable
//         const standardKeyPhrases = [
//           'Unit Photos must be uploaded per Program Manual guidelines',
//           'A Prefill Report could not be obtained.',
//           'The number of drivers on the policy is fewer than the number of drivers reported by prefill.',
//           'This policy requires review by Underwriting.  ',
//           'Vehicle 2: The make and model of this vehicle is generally unacceptable ',
//           ' Driver merit points require underwriting review.',
//           'Unverifiable Motor Vehicle Record requires underwriting review.',
//           'The size of this boat requires the Ownership Resume to be submitted',
//           'Requires an acceptable out-of-the-water survey by a NAMS/SAMS professional. This must be approved by underwriting.',
//           'Antique vessels require underwriting review. Please upload photos of the vehicle(s) by going to Actions and choosing New Document, then "Link to an existing document." Then browse your saved files to upload the photos.',
//           'currently does not have working utilities.'
//         ];

//         // Get expected UW wording from Excel for this test case
//         const rulesForTestCase = ruleMatrix[testCaseId];
//         let expectedUWMessages: string[] = [];

//         if (rulesForTestCase) {
//           for (const [ruleName, ruleData] of Object.entries(rulesForTestCase)) {
//             const uwWording = ruleData['UW_Wording']?.toString()?.trim();
//             if (uwWording) {
//               const cleanUwWording = uwWording.replace("Vehicle ##:", '').trim();
//               expectedUWMessages.push(cleanUwWording);
//             }
//           }
//         }

//         console.log("Expected UW messages from Excel:", expectedUWMessages);
//           // First, identify and log additional (non-standard) UW messages
//         const additionalMessages: string[] = [];
//         const standardMessages: string[] = [];

//         for (let i = 0; i < count; i++) {
//           const uwDescription = uwDescriptions[i] || '';
//           const isStandard = standardKeyPhrases.some(keyPhrase => uwDescription.includes(keyPhrase));

//           if (isStandard) {
//             standardMessages.push(uwDescription);
//           } else {
//             additionalMessages.push(uwDescription);
//           }
//         }

//         console.log("📊 UW Message Analysis:");
//         console.log("   Standard messages:", standardMessages);
//         console.log("   Additional messages:", additionalMessages);

//         // If we have additional messages, log them to Excel first
//         if (additionalMessages.length > 0) {
//           console.log("📝 Logging additional UW messages to Excel first...");

//           // Check if additional messages are expected
//           const expectedAdditionalMessages: string[] = [];
//           const unexpectedAdditionalMessages: string[] = [];

//           for (const additionalMsg of additionalMessages) {
//             const isExpected = expectedUWMessages.some(expectedMsg => additionalMsg.includes(expectedMsg));
//             if (isExpected) {
//               expectedAdditionalMessages.push(additionalMsg);
//             } else {
//               unexpectedAdditionalMessages.push(additionalMsg);
//             }
//           }

//           console.log("   Expected additional messages:", expectedAdditionalMessages);
//           console.log("   Unexpected additional messages:", unexpectedAdditionalMessages);
//             // If we have unexpected additional messages, fail immediately
//           if (unexpectedAdditionalMessages.length > 0) {
//             console.log("❌ Found unexpected additional UW messages - Failing test");

//             return {
//               success: false,
//               errorType: 'underwriting',
//               message: `Unexpected additional UW messages found: ${unexpectedAdditionalMessages.join(', ')}`,
//               shouldStop: true,
//               status: 'FAIL',
//               uwMessages: uwDescriptions // Log all additional messages to Excel
//             };
//           }

//           // If all additional messages are expected, continue with approval
//           console.log("✅ All additional messages are expected - Proceeding with approval");
//         }

//         // Now proceed with selective approval
//         let approvedCount = 0;
//         for (let i = 0; i < count; i++) {
//           const uwDescription = uwDescriptions[i] || '';
//           console.log(`🔍 Checking UW issue ${i + 1}: "${uwDescription}"`);

//           // Check if this is a standard message
//           const isStandard = standardKeyPhrases.some(keyPhrase => uwDescription.includes(keyPhrase));

//           // Check if this matches expected UW wording
//           const isExpected = expectedUWMessages.some(expectedMsg => uwDescription.includes(expectedMsg));

//           if (isStandard || isExpected) {
//             console.log(`✅ Approving UW issue ${i + 1}: ${isStandard ? 'Standard' : 'Expected'} message`);
//             await getCV_FirstApproval().nth(i).click({ force: true });
//             approvedCount++;
//             await wait(500);
//           } else {
//             console.log(`🚫 NOT approving UW issue ${i + 1}: Unexpected message - "${uwDescription}"`);
//           }
//         }

//         if (approvedCount > 0) {
//           console.log(`✅ Approved ${approvedCount} out of ${count} UW issues`);
//             await wait(5000);
//           await click(getApproveBtn());
//           await wait(5000);
//           await click(getApproveOkBtn());
//           await wait(5000);
//           await captureAndAttachforCore(page, testInfo, 'Risk Analysis Page after approval')
//           // Return success with additional message info for Excel logging
//           return {
//             ...validationResult,
//             success: true,
//             uwMessages: additionalMessages.length > 0 ? additionalMessages : []
//           };
//         } else {
//           console.log("❌ No UW issues were approved - all were unexpected");

//           // Return failure since we found unexpected UW issues
//           return {
//             success: false,
//             errorType: 'underwriting',
//             message: `All ${count} UW issues were unexpected and not approved`,
//             shouldStop: true,
//             status: 'FAIL',
//             uwMessages: uwDescriptions
//           };
//         }
//       }

//       await getSaveAndNextInRiskAnalysis().click({ force: true });
//       await wait(5000);
//       // await captureAndAttach(page, testInfo, 'Risk Analysis Page after approval');
//       await getSaveAndNextButton().click({ force: true });
//       await wait(5000);
//     }

//     return validationResult;
//   }

//   // No save button visible
//   return {
//     success: true,
//     errorType: 'none',
//     message: 'No save button visible - continuing',
//     shouldStop: false,
//     status: 'PASS'
//   };
// }
function normalizeDescription(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ") // Replace special chars with a space
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim(); // Remove leading/trailing spaces
}
export async function CV_saveAndQuote(
  testCaseId: string,
  ruleMatrix: Record<string, Record<string, any>>,
  page: Page,
  testInfo: TestInfo
): Promise<ValidationResult> {
  console.log("🔄 Starting CV_saveAndQuote function...");
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  
  // await getUWIssues().click({ timeout: TIMEOUT_8_SECONDS });

  // Check for approval elements with better error handling
  let hasApprovalElements = false;
  try {
    const approvalCount = await getCV_FirstApproval().count();
    hasApprovalElements = approvalCount > 0;
    console.log(`📊 Found ${approvalCount} approval elements`);
  } catch (error) {
    console.log("⚠️ Error checking approval elements:", error);
    hasApprovalElements = false;
  }

  if (hasApprovalElements) {
    await wait(5000);
    console.log("✅ UW approval elements found - proceeding with validation");

    const validationResult = await validateRulesForTestCase(testCaseId, "PolicyInfo", ruleMatrix, page, testInfo);

    if (validationResult.success && !validationResult.shouldStop) {
      console.log("✅ Validation passed - proceeding with UW approval process");

      // Get count of UW issues
      const count = await getCV_FirstApproval().count();
      console.log(`🔍 Analyzing ${count} UW issues for selective approval...`);

      if (count > 0) {
        await captureFullPage2D(page, testInfo, 'Risk Analysis Page Before Approval',"#centerPanel");
        // Get all UW descriptions to validate each one individually
        const uwDescriptions = await getIssueDescriptions();
        console.log("UW Descriptions found:", uwDescriptions);
        // Standard UW messages that are always acceptable
        const standardKeyPhrases = getStandardUWKeyPhrasesFromHelpSheet();
        // [
        //   'Unit Photos must be uploaded',
        //   'A Prefill Report could not be obtained',
        //   'The number of drivers on the policy is fewer',
        //   'This policy requires review by Underwriting',
        //   'Vehicle 2: The make and model of this vehicle is generally unacceptable',
        //   'Driver merit points require underwriting review.',
        //   'Unverifiable Motor Vehicle Record requires underwriting review.',
        //   'The size of this boat requires',
        //   'Ownership Resume',
        //   ' NAMS/SAMS professional',
        //   'All Other',
        //   'The speed of this boat',
        //   'The age and speed capacity',
        //   'Construction Other requires underwriting review.',
        //   'the speed capacity',
        //   'Antique vessels require underwriting review',
        //   'Is not eligible due to the speed capacity of',
        //   'Risk is ineligible. Do not submit.',
        //   'Value must be between',
        //   'This risk may not be submitted.',
        //   'Risk is ineligible. Do not submit.'
        // ];

        // Get expected UW wording from Excel for this test case
        const rulesForTestCase = ruleMatrix[testCaseId];
        let expectedUWMessages: string[] = [];

        if (rulesForTestCase) {
          for (const [ruleName, ruleData] of Object.entries(rulesForTestCase)) {
            const uwWording = ruleData['UW_Wording']?.toString()?.trim();
            if (uwWording) {
              const cleanUwWording = uwWording.replace("Vehicle ##:", '').trim();
              expectedUWMessages.push(normalizeDescription(cleanUwWording));
            }
          }
        }

        console.log("Expected UW messages from Excel:", expectedUWMessages);

        // First, identify and log additional (non-standard) UW messages
        const additionalMessages: string[] = [];
        const standardMessages: string[] = [];

        for (let i = 0; i < count; i++) {
          const uwDescription = normalizeDescription(uwDescriptions[i]) || '';
          const isStandard = standardKeyPhrases.some(keyPhrase => uwDescription.includes(keyPhrase));

          if (isStandard) {
            standardMessages.push(uwDescription);
          } else {
            additionalMessages.push(uwDescription);
          }
        }

        console.log("📊 UW Message Analysis:");
        console.log("   Standard messages:", standardMessages);
        console.log("   Additional messages:", additionalMessages);

        // If we have additional messages, log them to Excel first
        if (additionalMessages.length > 0) {
          console.log("📝 Logging additional UW messages to Excel first...");

          // Check if additional messages are expected
          const expectedAdditionalMessages: string[] = [...standardMessages]; // Add standard messages as already expected
          const unexpectedAdditionalMessages: string[] = [];

          for (const additionalMsg of additionalMessages) {
            const isExpected = expectedUWMessages.some(expectedMsg => additionalMsg.includes(expectedMsg));
            if (isExpected) {
              expectedAdditionalMessages.push(additionalMsg);
            } else {
              unexpectedAdditionalMessages.push(additionalMsg);
            }
          }

          console.log("   Expected additional messages:", expectedAdditionalMessages);
          console.log("   Unexpected additional messages:", unexpectedAdditionalMessages);

          // If we have unexpected additional messages, fail immediately
          if (unexpectedAdditionalMessages.length > 0) {
            console.log("❌ Found unexpected additional UW messages - Failing test");

            return {
              success: false,
              errorType: 'underwriting',
              message: `Unexpected additional UW messages found: ${unexpectedAdditionalMessages.join(', ')}`,
              shouldStop: true,
              status: 'FAIL',
              uwMessages: uwDescriptions // Log all additional messages to Excel
            };
          }

          // If all additional messages are expected, continue with approval
          console.log("✅ All additional messages are expected - Proceeding with approval");
        }

        // Now proceed with selective approval
        let approvedCount = 0;
        for (let i = 0; i < count; i++) {
          const uwDescription = uwDescriptions[i] || '';
          console.log(`🔍 Checking UW issue ${i + 1}: "${uwDescription}"`);

          // Check if this is a standard message
          const isStandard = standardKeyPhrases.some(keyPhrase => normalizeDescription(uwDescription).includes(keyPhrase));

          // Check if this matches expected UW wording
          const isExpected = expectedUWMessages.some(expectedMsg => normalizeDescription(uwDescription).includes(expectedMsg));

          if (isStandard || isExpected) {
            console.log(`✅ Approving UW issue ${i + 1}: ${isStandard ? 'Standard' : 'Expected'} message`);
            try {
              await getCV_FirstApproval().nth(i).click({ force: true });
              approvedCount++;
              await wait(500);
            } catch (error) {
              console.log(`⚠️ Error clicking approval checkbox ${i + 1}:`, error);
            }
          } else {
            console.log(`🚫 NOT approving UW issue ${i + 1}: Unexpected message - "${uwDescription}"`);
          }
        }

        if (approvedCount > 0) {
          console.log(`✅ Approved ${approvedCount} out of ${count} UW issues - Submitting approval`);
          await wait(5000);

          try {
            await click(getApproveBtn(), { force: true });
            await wait(5000);
            await click(getApproveOkBtn(), { force: true });
            await wait(5000);
            await captureFullPage2D(page, testInfo, 'Risk Analysis Page After Approval',"#centerPanel");
          } catch (error) {
            console.log("⚠️ Error during approval submission:", error);
          }

          // Return success with additional message info for Excel logging
          return {
            ...validationResult,
            success: true,
            uwMessages: additionalMessages.length > 0 ? additionalMessages : []
          };
        } else {
          console.log("❌ No UW issues were approved - all were unexpected");

          // Return failure since we found unexpected UW issues
          return {
            success: false,
            errorType: 'underwriting',
            message: `All ${count} UW issues were unexpected and not approved`,
            shouldStop: true,
            status: 'FAIL',
            uwMessages: uwDescriptions
          };
        }
      } else {
        console.log("ℹ️ No UW issues found to approve");
      }

      // Continue with save and quote if no UW issues or after approval
      try {
        if (await getSaveButtoninCore().isVisible()) {
          await getSaveButtoninCore().click({ force: true });
          await wait(5000);
          console.log("💾 Clicked Save button");
        }

        if (await getQuoteButton().isVisible()) {
          await getQuoteButton().click({ force: true });
          await wait(5000);
          console.log("📋 Clicked Quote button");
        }
      } catch (error) {
        console.log("⚠️ Error during save/quote:", error);
      }
    } else {
      console.log("❌ Validation failed or indicated to stop");
    }

    return validationResult;
  } else {
    console.log("ℹ️ No UW approval elements visible");
  }

  // No approval elements visible - try save and quote anyway
  try {
    if (await getSaveButtoninCore().isVisible()) {
      await getSaveButtoninCore().click({ force: true });
      await wait(5000);
      console.log("💾 Clicked Save button (no UW approval needed)");
    }

    if (await getQuoteButton().isVisible()) {
      await getQuoteButton().click({ force: true });
      await wait(5000);
      console.log("📋 Clicked Quote button (no UW approval needed)");
    }
  } catch (error) {
    console.log("⚠️ Error during save/quote (no UW):", error);
  }

  return {
    success: true,
    errorType: 'none',
    message: 'No UW approval elements visible - continuing',
    shouldStop: false,
    status: 'PASS'
  };
}

export async function clickSaveandNextFromRiskAnlyasisPage(page: Page, testInfo: TestInfo) {

  await wait(2000);
  if (await isElementVisible(getWarningMsgCore())) {
    await getRiskAnalysisTab().click({ timeout: TIMEOUT_8_SECONDS });
  }
  //expect(await isElementVisible(getRiskAnalysisText())).toBeTruthy();
  // await captureAndAttachforCore(page, testInfo, "ClickSaveandNextFromRiskAnlyasisPage");
  await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });

  await wait(TIMEOUT_4_SECONDS);
}
/*export async function generateQuoteFromPolilcyReviewPage(page: Page, testInfo: TestInfo,
  
) {
  
  
  if (await isElementVisible(getQuoteButton())) {
  await getQuoteButton().click({ timeout: TIMEOUT_8_SECONDS });
  
  }
  await wait(TIMEOUT_4_SECONDS);
  /*if(await isElementVisible(getSaveAndNextButton())){
    await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
  }
  //await wait(TIMEOUT_4_SECONDS);
  await captureAndAttachforCore(page, testInfo, "GenerateQuoteFromPolilcyReviewPage");
}*/
let screenshotTaken_generateQuote = false;
//let screenshotTaken_proceedToIssuance = false;

export async function generateQuoteFromPolilcyReviewPage(page: Page, testInfo: TestInfo) {
  // if (await isElementVisible(getQuoteButton())) {
  //   await getQuoteButton().click({ timeout: TIMEOUT_8_SECONDS });
  // }
  await wait(10000);
  //await captureAndAttachforCore(page, testInfo, "GenerateQuoteFromPolilcyReviewPage");
  // Screenshot only once across the entire run
  if (!screenshotTaken_generateQuote) {
    await captureAndAttachforCore(page, testInfo, "GenerateQuoteFromPolilcyReviewPage");
    screenshotTaken_generateQuote = true;
  }
}


export async function proceedToIssuanceFromPolicyReviewPage(page: Page, testInfo: TestInfo, ruleMatrix: any, blockingContext: string) {
  await wait(TIMEOUT_4_SECONDS);
  // // if(await isElementVisible(getRA())){
  if (await isElementVisible(getSaveAndNextButton())) {
    await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
    //await captureAndAttachforCore(page, testInfo, "ProceedToIssuanceFromPolicyReviewPage");
  }
  if (await isElementVisible(getWarningMessage())) {
    await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await wait(4000);
  if (await isElementVisible(getQuoteinPolicyReviewPage())) {
    await getQuoteinPolicyReviewPage().click({ timeout: TIMEOUT_8_SECONDS });
  }
  if (await isElementVisible(getCLearButtoninPolicyIssuance())) {
    await getCLearButtoninPolicyIssuance().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(5000);
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  if (await isElementVisible(getDiscountApplied())) {
    await wait(2000);
    //await getDiscountApplied().click({force:true});
    await wait(1000);
    await captureAndAttachforCore(page, testInfo, 'Quote Page');
  }

  await wait(5000);
  if (await isElementVisible(getDiscountApplied())) {
    await wait(2000);
    await getDiscountApplied().click({ force: true });
    await wait(1000);
    await captureAndAttachforCore(page, testInfo, 'Quote Page Discount Applied'); //commented for BT execution
  }
    await wait(5000);
    if (await isElementVisible(getSaveAndNextButton())) {

      await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await wait(4000);

  await forms(page, testInfo);
  await wait(5000);

  if (await isElementVisible(getBindOptionsDropDown())) {

    await getBindOptionsDropDown().click();
    await wait(1000);

    if (await isElementVisible(getProceedToIssuanceOption())) {
      await getProceedToIssuanceOption().click();
      await wait(TIMEOUT_4_SECONDS);
    }
  }
  if (await isElementVisible(getReturntoApprovalRequired())) {
    await getReturntoApprovalRequired().click({ timeout: TIMEOUT_8_SECONDS });
  }
  // await captureAndAttachforCore(page, testInfo, "ProceedToIssuanceFromPolicyReviewPage"); // for bt execution
  await warningsWordingValidationCore(ruleMatrix, page, testInfo);
  blockingContext = "PolicyReview";
  const errorValidationPassed = await errorWordingValidationCore(ruleMatrix, page, testInfo, blockingContext);
  if (!errorValidationPassed) {
    console.log("❌ Error wording validation failed. Stopping test.");
    return false;
  }

  if (await isElementVisible(getBindOptionsDropDown())) {
    await getBindOptionsDropDown().click();
    await wait(1000);
    if (await isElementVisible(getProceedToIssuanceOption())) {
      await getProceedToIssuanceOption().click();
      await wait(TIMEOUT_4_SECONDS);
    }
  }
  if (await isElementVisible(getCLearButtoninPolicyIssuance())) {
    await getCLearButtoninPolicyIssuance().click({ timeout: TIMEOUT_8_SECONDS });
  }

  //await ifCLuePopUpAppears_ClickReturnToRiskAnalysis(page, testInfo);
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(3000);
  return true;
}
export async function ifCLuePopUpAppears_ClickReturnToRiskAnalysis(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getClueResultsPopUp())) {
    console.log("CLUE Results PopUp appeared.");
    await captureAndAttachforCore(page, testInfo, "CLUEResultsPopUp",{fullPage:true});
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    await getReturnToRiskAnalysisButton().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(TIMEOUT_4_SECONDS);
    await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(3000);
    if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
      await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    }
    if (await isElementVisible(getBindOptionsDropDown())) {
      await getBindOptionsDropDown().click();
      await wait(1000);

      await getProceedToIssuanceOption().click();
      await wait(TIMEOUT_4_SECONDS);
    }
    if(await isElementVisible(getReturnToRiskAnalysisButton())){
      await wait(2000);
      await getReturnToRiskAnalysisButton().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(TIMEOUT_4_SECONDS);
      await getResolveButton().click({ timeout: TIMEOUT_8_SECONDS });

      await getUWIssuesHeading().click({ timeout: TIMEOUT_8_SECONDS });
      await wait(2000);
    }
  }


}

export async function CV_RiskAnaysisTabFromPolicyInfoPage(page: Page, testInfo: TestInfo) {
  await wait(5000);
  await captureAndAttachforCore(page, testInfo, 'Mandatory UW issue list before approval')



  if (await isElementVisible(getFirstApproval().first())) {
    const descriptions = await getIssueDescriptions();
    console.log("Descriptions:", descriptions);
    const clean = (str: string) => str.replace(/\s+/g, ' ').split("[")[0].trim();;

    const count = await getCV_FirstApproval().count();
    console.log("count: ", count);


    for (let i = 0; i < count; i++) {
      // if(clean(descriptions[i])==='Unit Photos must be uploaded per Program Manual guidelines. Use document type "UNIT PHOTOS" for upload. Unit photos are not yet uploaded for vehicle(s)'){
      await getCV_FirstApproval().nth(i).click({ force: true });
      await wait(500);
    }
    if (await isElementVisible(getAlreadyApprovedCheckBox())) {
      const alreadyApprovedCount = await getAlreadyApprovedCheckBox().count();
      console.log("Already Approved Count:", alreadyApprovedCount);
      for (let i = 0; i < alreadyApprovedCount; i++) {
        await getAlreadyApprovedCheckBox().click({ force: true });
      }
    }
    if (count != 0) {
      await wait(5000);
      await click(getApproveBtn());
      await wait(5000);
      await click(getApproveOkBtn());
      await wait(5000);
      await captureAndAttachforCore(page, testInfo, 'Mandatory UW issue approved -2');
    }
  }
}
export async function ClickReturnToRiskAnalysis(page: Page, testInfo: TestInfo) {

  await getReturntoApprovalRequired().click({ timeout: TIMEOUT_8_SECONDS });
  //await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(5000);
  //await getReturntoRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  //await wait(5000);
  await getUWIssues().click({ timeout: TIMEOUT_8_SECONDS });

  if (await isElementVisible(getFirstApproval().first())) {
    const descriptions = await getIssueDescriptions();
    console.log("Descriptions:", descriptions);
    const clean = (str: string) => str.replace(/\s+/g, ' ').split("[")[0].trim();;

    const count = await getCV_FirstApproval().count();
    console.log("count: ", count);


    for (let i = 0; i < count; i++) {
      // if(clean(descriptions[i])==='Unit Photos must be uploaded per Program Manual guidelines. Use document type "UNIT PHOTOS" for upload. Unit photos are not yet uploaded for vehicle(s)'){
      await getCV_FirstApproval().nth(i).click({ force: true });
      await wait(500);
    }
    if (await isElementVisible(getAlreadyApprovedCheckBox())) {
      const alreadyApprovedCount = await getAlreadyApprovedCheckBox().count();
      console.log("Already Approved Count:", alreadyApprovedCount);
      for (let i = 0; i < alreadyApprovedCount; i++) {
        await getAlreadyApprovedCheckBox().click({ force: true });
      }
    }
    if (count != 0) {
      await wait(5000);
      await click(getApproveBtn());
      await wait(5000);
      await click(getApproveOkBtn());
      await wait(5000);
      await captureAndAttachforCore(page, testInfo, 'Mandatory UW issue approved -2');
    }
  }
  await wait(5000);
  await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });



}

export async function ClickReturnToRiskAnalysisAgain(page: Page, testInfo: TestInfo) {

  await getReturntoApprovalRequired().click({ timeout: TIMEOUT_8_SECONDS });
  //await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(5000);
  await getReturntoRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(5000);
  //await getUWIssues().click({ timeout: TIMEOUT_8_SECONDS });

  await CV_RiskAnaysisTabFromPolicyInfoPage(page, testInfo);
  await wait(5000);
  //await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
  /*await getReturnToRiskAnalysisButton().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(TIMEOUT_4_SECONDS);
  await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(3000);
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())){
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  if (await isElementVisible(getBindOptionsDropDown())) {
      await getBindOptionsDropDown().click();
await wait(1000);
 
await getProceedToIssuanceOption().click();
await wait(TIMEOUT_4_SECONDS);
    }*/


}

export async function MS_ClickReturnToRiskAnalysisAgain(page: Page, testInfo: TestInfo, ruleMatrix: any, AccountDetails: any) {

  await getReturntoApprovalRequired().click({ timeout: TIMEOUT_8_SECONDS });
  //await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(5000);
  //await getReturntoRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  //await wait(5000);
  await getUWIssues().click({ timeout: TIMEOUT_8_SECONDS });

  //await CV_RiskAnaysisTabFromPolicyInfoPage(page,testInfo);
  await wait(5000);
  await getSaveAndNextButton().click({ timeout: TIMEOUT_8_SECONDS });
  /*await getReturnToRiskAnalysisButton().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(TIMEOUT_4_SECONDS);*/
  await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  await wait(3000);
  if (await isElementVisible(getResolveButton())) {
    await getResolveButton().click({ force: true });
    await wait(5000);
    await CV_saveAndQuote(ruleMatrix, AccountDetails, page, testInfo);
    await wait(5000);
    await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
    await wait(10000);
  }

  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  if (await isElementVisible(getBindOptionsDropDown())) {
    await getBindOptionsDropDown().click();
    await wait(1000);

    await getProceedToIssuanceOption().click();
    await wait(TIMEOUT_4_SECONDS);
  }

  await captureAndAttachforCore(page, testInfo, "Issuance page before Payment");


}
const getForms = () => getLocator("//span[contains(@id, 'SubmissionWizard:FormsScreen:0')]");
const getFormsNextButton = () => getLocator("//span[contains(@class, 'x-btn-icon-el x-tbar-page-next ')]");
const getPageCountIndicator = () => getLocator("//div[contains(@class, 'x-toolbar-text') and contains(text(), 'of')]");

export async function forms(page: Page, testInfo: TestInfo) {
  log("---------------------Navigated to Forms page---------------------");
  
  if (await isElementVisible(getForms())) {
    const pageIndicatorText = await getPageCountIndicator().innerText();
    const pageCountMatch = pageIndicatorText.match(/of\s+(\d+)/);
    const totalPages = pageCountMatch ? parseInt(pageCountMatch[1]) : 1;

    console.log(`📄 Total form pages to capture: ${totalPages}`);

    // Capture all pages starting from page 1
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log(`Capturing form page ${pageNum} of ${totalPages}...`);
      
      // Capture screenshot with proper title
      await captureAndAttachforCore(page, testInfo, `Forms page ${pageNum}`);
      
      // Click next button to go to next page (skip for last page)
      if (pageNum < totalPages && await isElementVisible(getFormsNextButton())) {
        await getFormsNextButton().click({ timeout: TIMEOUT_8_SECONDS });
        await wait(2000); // Wait for page to load
      } else if (pageNum < totalPages) {
        console.log("Forms next button not visible, stopping pagination");
        break;
      }
    }

    console.log(`✅ Captured all ${totalPages} form pages`);
  } else {
    console.log("Forms element not visible");
  }
}
export async function CV_BindOptions(page: Page, testInfo: TestInfo) {
  if (await isElementVisible(getBindOptionsDropDown())) {
if (await isElementVisible(getBindOptionsDropDown())) {
      // await forms(page, testInfo);
      await getBindOptionsDropDown().click();
      await wait(1000);

      await getProceedToIssuanceOption().click();
      await wait(TIMEOUT_4_SECONDS);
    }

    // await getBindOptionsDropDown().click();
    // await wait(1000);

    // await getProceedToIssuanceOption().click();
    // await wait(TIMEOUT_4_SECONDS);
  }else{
    await getSaveAndNextButton().click();
  }
}

export async function CV_BindOptionstoRiskAnalysis(page: Page, testInfo: TestInfo) {
  await CV_BindOptions(page, testInfo);//CLick on Bind Options or it will click on quote
  // If clear button is there in Issuance CHecklist click on it.
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await wait(5000);
  let clicked = false;
  let attempts = 0;

  while (!clicked && attempts < 5) {
    console.log("Attempt number is: " + attempts);
    if (await isElementVisible(getReturnToRiskAnalysisButton())) {
      await getReturnToRiskAnalysisButton().click({ force: true });
      await wait(800);
      clicked = true;
    } else {
      await page.waitForTimeout(800);
      attempts++;
    }
  }
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }

  if(await isElementVisible(getReturnToPolicyReviewButton())){
    await getRiskAnalysisTab().click();
  }

  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  if (await isElementVisible(getPriorPolicies())) {
    await wait(2000);
    await getPriorPolicies().click({ force: true });
    await wait(1000);
    await captureAndAttachforCore(page, testInfo, 'Prior Policies');
  }
  if (await isElementVisible(getLosses())) {
    await wait(2000);
    await getLosses().click({ force: true });
    await wait(1000)
    await captureAndAttachforCore(page, testInfo, 'Losses Accidents Violations');
  }

  await wait(2000);
  if (await isElementVisible(getMotorVehicleRecord())) {
    await getMotorVehicleRecord().click({ force: true });
    await wait(1000);
    await captureAndAttachforCore(page, testInfo, 'Motor Vehicle Record');
  }


  if (await isElementVisible(getUWIssues())) {
    await getUWIssues().click({ force: true });

  }
  if (await isElementVisible(getQuoteButtonInCoreRiskAnalysis())) {
    await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await wait(5000);
    if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
      await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    }
    await wait(5000);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if (await isElementVisible(getDiscountApplied())) {
      await wait(2000);
      //await getDiscountApplied().click({force:true});
      await wait(1000);
      await captureAndAttachforCore(page, testInfo, 'Quote Page');
    }

    await wait(5000);
    if (await isElementVisible(getDiscountApplied())) {
      await wait(2000);
      await getDiscountApplied().click({ force: true });
      await wait(1000);
      await captureAndAttachforCore(page, testInfo, 'Quote Page Discount Applied');
    }
    await CV_BindOptions(page, testInfo);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
      await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    }
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await wait(3000);
    if (await isElementVisible(getReturntoApprovalRequired())) {
      await getReturntoApprovalRequired().click({ timeout: TIMEOUT_8_SECONDS });
    }
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  }

  if (await isElementVisible(getResolveButton())) {
    await getResolveButton().click({ force: true });
  }
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await getUWIssuesHeading().click();
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  //   await CV_saveAndQuote(testcaseID, Rulematrix, page, testInfo);
  //   await wait(5000);
  //   if (await isElementVisible(getQuoteButtonInCoreRiskAnalysis())) {
  //   await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  //   await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  //   await wait(5000);
  //   if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
  //     await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  //   }
  //   }
  //   await wait(5000);
  //   await page.waitForLoadState("load", { timeout: MAX_TIMEOUT }); 
  //   await CV_BindOptions(page,testInfo);
  //   await wait(10000);

  // if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
  //   await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  // }
  // await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
}

export async function MS_clickonQuoteinRiskAnalysis(page: Page) {
  await wait(TIMEOUT_4_SECONDS);
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await wait(5000);
  await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(5000);
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  if (await isElementVisible(getResolveButton())) {
    await getResolveButton().click({ force: true });
    await wait(5000);

  }
  else if (!await isElementVisible(getResolveButton())) {
    await getRiskAnalysisTab().click();
    await wait(2000);
    if (await isElementVisible(getWarningMsgCore())) {
      await getRiskAnalysisTab().click({ timeout: TIMEOUT_8_SECONDS });
    }
  }
  //await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });

  await wait(2000);
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
}

export async function clickonQuoteinRiskAnalysis(page: Page) {
  await wait(TIMEOUT_4_SECONDS);
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await wait(5000);
  if(await isElementVisible(getQuoteButtonInCoreRiskAnalysis())){
  await getQuoteButtonInCoreRiskAnalysis().click({ timeout: TIMEOUT_8_SECONDS });
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  }
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  if(await isElementVisible(getResolveButton())){
    await getResolveButton().click({ force: true });
    await wait(5000);
  }
  await wait(5000);
}

export async function clearriskbutton(page: Page) {

  await page.waitForSelector("span", { timeout: 2000 })
  await clearrisk().click()

}







