import { Page, TestInfo } from "@playwright/test";
import { getValidationErrorUI, getValidationErrorUICore } from "./wordingValidation";
import { captureAndAttach, captureAndAttachforCore, captureFullPage2D } from "./report-utils";
import { isElementVisible } from "./element-utils";
import { getLocator } from "./locator-utils";
import { getHelpSheetRows } from "./questionTextMapper";

// UI element selectors
const getWarningMsgUI = () => getLocator("//img[@class='warning_icon']/parent::div[@class='message']");
const getValidationErrorMSGUI = () => getLocator('[ng-repeat="err in getMessages(error.errorMessage) track by $index"]');
const getUnderwritingIssueUI = () => getLocator('//gw-displaykey-format[text() = "There are underwriting issues associated with this offering. "]');

const DEFAULT_STANDARD_UW_KEY_PHRASES = [
  'Unit Photos must be uploaded',
  'A Prefill Report could not be obtained',
  'The number of drivers on the policy is fewer',
  'This policy requires review by Underwriting',
  'Vehicle 1: Unit type/year falls outside automated underwriting parameters',
  'Vehicle #1: Storage Type: Carport requires underwriting review. Please upload photos',
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
  'Unit Photos must be uploaded per Program Manual guidelines.', 
  'Collector Coverage  requires underwriting review.'
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

// Helper function to return ALL UW messages without any filtering
function getAllUWMessages(messages: string[]): string[] {
  console.log(`🔍 Collecting ALL UW messages without filtering. Input: ${messages.length} messages`);

  messages.forEach((msg, index) => {
    console.log(`✅ Including UW message ${index + 1}: "${msg}"`);
  });

  console.log(`📊 Collection result: ${messages.length} total UW messages (no filtering applied)`);
  return messages; // Return all messages without any filtering
}

export interface ValidationResult {
  success: boolean;
  errorType: 'warning' | 'underwriting' | 'validation' | 'none' | string;
  message: string;
  shouldStop: boolean;
  status: 'PASS' | 'FAIL' | string;
  validationErrors?: string[];  // Validation errors found in UI
  uwMessages?: string[];  // ALL non-standard UW messages found in UI (expected + unexpected + additional)
  

}

async function getWarningMsgfromUI(): Promise<string[]> {
  const count = await getWarningMsgUI().count();
  const uiWarnings: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await getWarningMsgUI().nth(i).textContent();
    if (text) {
      uiWarnings.push(text.trim().replace("Vehicle ##:", ''));
    }
  }
  return uiWarnings;
}

async function getUnderwritingMsgfromUI(page: Page, testInfo: TestInfo): Promise<string[]> {
  // Check for general underwriting message
//   const generalUWVisible = await isElementVisible(getUnderwritingIssueUI());

  // Check for specific UW issue descriptions in CV
  const uwDescriptionSelector = getLocator('//a[contains(@id,"UWIssueRowSet:ShortDescription")]');
  const uwDescriptionVisible = await isElementVisible(uwDescriptionSelector);

  const uwMessages: string[] = [];

  if (uwDescriptionVisible) {
    // await captureAndAttach(page, testInfo, 'Underwriting Issues Detected');
    const count = await uwDescriptionSelector.count();
    for (let i = 0; i < count; i++) {
      const desc = await uwDescriptionSelector.nth(i).textContent();
      if (desc) {
        uwMessages.push(desc.trim());
      }
    }
  }

  return uwMessages;
}

export async function validateRulesForTestCase(
  testCaseId: string,
  blockingContext: string,
  ruleMatrix: Record<string, Record<string, any>>,
  page: Page,
  testInfo: TestInfo
): Promise<ValidationResult> {

  console.log(`🔍 Validating rules for Test Case ${testCaseId} on ${blockingContext}`);
  console.log(`📊 Available test cases in ruleMatrix:`, Object.keys(ruleMatrix));

  const rulesForTestCase = ruleMatrix[testCaseId];
  if (!rulesForTestCase) {
    console.log(`⚠️ No rules found for Test Case ${testCaseId}`);
    console.log(`📋 RuleMatrix structure:`, ruleMatrix);
    return {
      success: true,
      errorType: 'none',
      message: 'No validation errors expected or found',
      shouldStop: false,
      status: 'PASS'
    };
  }
  // Get UI messages
  const uiWarnings = await getWarningMsgfromUI();
  const uiUnderwriting = await getUnderwritingMsgfromUI(page, testInfo);
  const uiValidationErrors = await getValidationErrorUICore();

  console.log("UI Warnings:", uiWarnings);
  console.log("UI Underwriting:", uiUnderwriting);
  console.log("UI Validation Errors:", uiValidationErrors);

  // Track if any expected UW messages were found
  let expectedUWMessagesFound = false;
  let allFoundExpectedMessages: string[] = [];

  // Check all rules for this test case
  for (const [ruleName, ruleData] of Object.entries(rulesForTestCase)) {
    console.log(`🔍 Checking ${ruleName}...`);

    const warningWording = ruleData['Warning_Wording']?.toString()?.trim() || '';
    const uwWording = ruleData['UW_Wording']?.toString()?.trim() || '';
    const validationWording = ruleData['Validation_Wording']?.toString()?.trim() || '';
    const triggerPage = ruleData['TriggerPage_1']?.toString()?.trim() || '';
    const blockingPage = ruleData['BlockingPage']?.toString()?.trim() || '';

    console.log(`Rule ${ruleName} data:`, {
      warningWording,
      uwWording,
      validationWording,
      triggerPage,
      blockingPage,
      currentContext: blockingContext
    });

    // Only check rules that apply to current context
    if (triggerPage && !triggerPage.toLowerCase().includes(blockingContext.toLowerCase())) {
      console.log(`Skipping ${ruleName} - not applicable to ${blockingContext}`);
      continue;
    }    // Scenario 1 & 2: Underwriting Issue Validation
    if (uiUnderwriting.length > 0) {
      const cleanUwWording = uwWording ? uwWording.replace("Vehicle ##:", '').trim() : '';
      
      // Categorize UI messages using flexible matching for standard messages
      const standardMessages: string[] = [];
      const expectedMatchedMessages: string[] = [];
      const additionalExpectedMessages: string[] = [];
      const unexpectedMessages: string[] = [];
      const additionalUnexpectedMessages: string[] = [];

      // Enhanced standard key phrases matching
      const standardKeyPhrases = getStandardUWKeyPhrasesFromHelpSheet();
      // [
      //   'Unit Photos must be uploaded per Program Manual guidelines',
      //   'A Prefill Report could not be obtained',
      //   'Use document type "UNIT PHOTOS" for upload',
      //   'Unit photos are not yet uploaded for vehicle(s)',
      //   'The number of drivers on the policy is fewer than the number of drivers reported by prefill. Add all household members as Drivers. Underwriting review is required.',
      //   'This policy requires review by Underwriting.  Please upload photos of the vehicle(s) and ensure that the daily use automobile policy details are entered.  If the daily use automobile policy details were not returned by Customer Prefill, please upload a current declarations page.  Upload documents before referring to Underwriting.',
        
      //   'Driver merit points require underwriting review.',
      //   'Unverifiable Motor Vehicle Record requires underwriting review.',
      //   'The size of this boat requires the Ownership Resume to be submitted for underwriting review.',
      //   'Antique vessels require underwriting review. Please upload photos of the vehicle(s) by going to Actions and choosing New Document, then "Link to an existing document." Then browse your saved files to upload the photos.',
      //   'Requires an acceptable out-of-the-water survey by a NAMS/SAMS professional. This must be approved by underwriting.'
      // ];

      // Collect all expected UW messages from this test case (not just current rule)
      const allExpectedUWMessages: string[] = [];
      for (const [otherRuleName, otherRuleData] of Object.entries(rulesForTestCase)) {
        const otherUwWording = otherRuleData['UW_Wording']?.toString()?.trim();
        if (otherUwWording) {
          const cleanOtherUwWording = otherUwWording.replace("Vehicle ##:", '').trim();
          if (cleanOtherUwWording) {
            allExpectedUWMessages.push(cleanOtherUwWording);
          }
        }
      }

      console.log(`📋 All Expected UW Messages for Test Case ${testCaseId}:`, allExpectedUWMessages);

      // Enhanced categorization logic
      for (const msg of uiUnderwriting) {
        const isStandard = standardKeyPhrases.some(keyPhrase => msg.includes(keyPhrase));
        const isCurrentExpected = cleanUwWording && msg.includes(cleanUwWording);
        const isAnyExpected = allExpectedUWMessages.some(expectedMsg => msg.includes(expectedMsg));

        console.log(`🔍 Analyzing UW message: "${msg}"`);
        console.log(`   - Is Standard: ${isStandard}`);
        console.log(`   - Is Current Expected: ${isCurrentExpected}`);
        console.log(`   - Is Any Expected: ${isAnyExpected}`);

        if (isStandard) {
          standardMessages.push(msg);
          console.log(`   ✅ Categorized as: Standard`);
        } else if (isCurrentExpected) {
          expectedMatchedMessages.push(msg);
          console.log(`   ✅ Categorized as: Current Expected Match`);
        } else if (isAnyExpected) {
          additionalExpectedMessages.push(msg);
          console.log(`   ✅ Categorized as: Additional Expected`);
        } else {
          // This is an unexpected message - could be additional unexpected
          if (standardMessages.length > 0 || expectedMatchedMessages.length > 0 || additionalExpectedMessages.length > 0) {
            additionalUnexpectedMessages.push(msg);
            console.log(`   ⚠️ Categorized as: Additional Unexpected`);
          } else {
            unexpectedMessages.push(msg);
            console.log(`   ⚠️ Categorized as: Primary Unexpected`);
          }
        }
      }

      // await captureAndAttach(page, testInfo, `UW Issue Check - ${ruleName}`);

      console.log(`📊 UW Message Analysis for ${ruleName}:`);
      console.log(`   Standard messages: ${standardMessages.length}`, standardMessages);
      console.log(`   Expected matched messages: ${expectedMatchedMessages.length}`, expectedMatchedMessages);
      console.log(`   Additional expected messages: ${additionalExpectedMessages.length}`, additionalExpectedMessages);
      console.log(`   Unexpected messages: ${unexpectedMessages.length}`, unexpectedMessages);
      console.log(`   Additional unexpected messages: ${additionalUnexpectedMessages.length}`, additionalUnexpectedMessages);
      // Scenario 1: Only standard UW messages - Accept and proceed
      if (standardMessages.length > 0 && unexpectedMessages.length === 0 && expectedMatchedMessages.length === 0 && additionalExpectedMessages.length === 0 && additionalUnexpectedMessages.length === 0) {
        console.log(`✅ Scenario 1: Only standard UW messages found - Accept and continue`);
        console.log(`📝 Storing standard UW messages for Excel: ${standardMessages.join(', ')}`);

        // Mark that standard messages were found and store them for Excel
        expectedUWMessagesFound = true;
        allFoundExpectedMessages.push(...standardMessages);

        continue;
      }// Scenario 2: Standard + Expected UW messages (current or additional) - Accept, log, and proceed
      if ((expectedMatchedMessages.length > 0 || additionalExpectedMessages.length > 0) && unexpectedMessages.length === 0 && additionalUnexpectedMessages.length === 0) {
        console.log(`✅ Scenario 2: Expected UW wording matched (+ standard messages) - Accept and continue`);
        console.log(`   Expected: ${cleanUwWording}`);
        console.log(`   Current Expected Found: ${expectedMatchedMessages.join(', ')}`);
        console.log(`   Additional Expected Found: ${additionalExpectedMessages.join(', ')}`);

        // Store matched expected messages for final result collection
        const allExpectedFound = [...expectedMatchedMessages, ...additionalExpectedMessages, ...standardMessages];
        console.log(`📝 Storing ALL UW messages for Excel (expected + standard): ${allExpectedFound.join(', ')}`);

        // Mark that expected messages were found
        expectedUWMessagesFound = true;
        allFoundExpectedMessages.push(...allExpectedFound);

        continue;
      }// Scenario 3: Any unexpected UW messages present - Fail and stop
      if (unexpectedMessages.length > 0 || additionalUnexpectedMessages.length > 0) {
        console.log(`❌ Scenario 3: Unexpected UW messages found - Failing test`);
        console.log(`   Primary Unexpected: ${unexpectedMessages.join(', ')}`);
        console.log(`   Additional Unexpected: ${additionalUnexpectedMessages.join(', ')}`);

        const allUnexpected = [...unexpectedMessages, ...additionalUnexpectedMessages];
        // Collect ALL UW messages for Excel (expected + unexpected + additional) - NO FILTERING
        const allUWMessages = [
          ...expectedMatchedMessages,
          ...additionalExpectedMessages,
          ...unexpectedMessages,  // Include unexpected messages
          ...additionalUnexpectedMessages  // Include additional unexpected messages
        ];
        await captureFullPage2D(page,testInfo,"Unexpected UW Messages Found",'#centerPanel');
        return {
          success: false,
          errorType: 'underwriting',
          message: `Unexpected UW messages found: ${allUnexpected.join(', ')}. Expected: ${cleanUwWording || 'none'}`,
          shouldStop: true,
          status: 'FAIL',
          validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,
          
        };
      }

      // If we have expected UW wording defined but no match found
      if (cleanUwWording && expectedMatchedMessages.length === 0 && additionalExpectedMessages.length === 0) {
        console.log(`❌ Scenario 4: Expected UW wording not found - Failing test`);
        console.log(`   Expected: ${cleanUwWording}`);
        console.log(`   Found: ${uiUnderwriting.join(', ')}`);
        // Collect ALL UW messages for Excel
        const allUWMessages = getAllUWMessages(uiUnderwriting);

        return {
          success: false,
          errorType: 'underwriting',
          message: `Expected UW wording not found. Expected: ${cleanUwWording}, Found: ${uiUnderwriting.join(', ')}`,
          shouldStop: true,
          status: 'FAIL',
          validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,

        };
      }
    }// Store validation wording for later checking (don't return immediately)
    if (validationWording && uiValidationErrors.length > 0) {
      const cleanValidationWording = validationWording.replace("Vehicle ##:", '').trim();
      const matchFound = uiValidationErrors.some(err => err.includes(cleanValidationWording));

      await captureAndAttachforCore(page, testInfo, `Validation Error Check ${ruleName}`);
      if (matchFound) {
        console.log(`✅ Scenario 3: Validation wording matched for ${ruleName} - Test passed, stopping`);

        // Collect ALL UW messages for Excel (even when validation passes)
        const allUWMessages = getAllUWMessages(uiUnderwriting);
        console.log(`📝 Including UW messages in validation success result: ${allUWMessages.join(', ')}`);

        return {
          success: true,
          errorType: 'validation',
          message: `Validation wording matched`,
          shouldStop: true,
          status: 'PASS',
          validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,
        };
      } else {
        console.log(`⚠️ Validation wording mismatch for ${ruleName} - but continuing to check other rules`);
        console.log(`   Expected: ${cleanValidationWording}`);
        console.log(`   Found: ${uiValidationErrors.join(', ')}`);
        // Don't return here - continue checking other rules
      }
    }

    // Check for warnings (non-blocking usually)
    if (warningWording && uiWarnings.length > 0) {
      const cleanWarningWording = warningWording.replace("Vehicle ##:", '').trim();
      const matchFound = uiWarnings.some(warn => warn.includes(cleanWarningWording));

      if (matchFound) {
        console.log(`✅ Warning wording matched for ${ruleName}`);
      } else {
        console.log(`⚠️ Warning wording mismatch for ${ruleName} - but continuing`);
      }
    }
  }  // Check for unexpected errors at the end
  if (uiValidationErrors.length > 0) {
    console.log("❌ Scenario 4: Unexpected validation errors found in UI");
    await captureAndAttachforCore(page, testInfo, 'Unexpected Validation Errors'); return {
      success: false,
      errorType: 'validation',
      message: `Unexpected validation errors: ${uiValidationErrors.join(', ')}`,
      shouldStop: true,
      status: 'FAIL',
      validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,
    };
  }  // Check for unexpected UW issues at the end (only if no rules were processed)
  if (uiUnderwriting.length > 0) {
    const standardKeyPhrases = getStandardUWKeyPhrasesFromHelpSheet();
    // [
    //   'Unit Photos must be uploaded per Program Manual guidelines',
    //   'A Prefill Report could not be obtained',
    //   'The size of this boat requires the Ownership Resume to be submitted for underwriting review.',
    //   'Antique vessels require underwriting review. Please upload photos of the vehicle(s) by going to Actions and choosing New Document, then "Link to an existing document." Then browse your saved files to upload the photos.',
    //   'Requires an acceptable out-of-the-water survey by a NAMS/SAMS professional. This must be approved by underwriting.',
    //   'The number of drivers on the policy is fewer than the number of drivers reported by prefill.',
    //   'Driver merit points require underwriting review.',
    //   'Unverifiable Motor Vehicle Record requires underwriting review.',
    //   'Requires an acceptable out-of-the-water survey by a NAMS/SAMS professional. This must be approved by underwriting.'
    // ];

    const hasOnlyStandardMessages = uiUnderwriting.every(msg =>
      standardKeyPhrases.some(keyPhrase => msg.includes(keyPhrase))
    ); if (hasOnlyStandardMessages) {
      console.log("✅ Only standard UW messages found - Accept and continue");
      // Store standard messages for Excel
      const allUWMessages = getAllUWMessages(uiUnderwriting);
      return {
        success: true,
        errorType: 'none',
        message: 'Only standard UW messages found',
        shouldStop: false,
        status: 'PASS',
        validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,
      };
    } else if (expectedUWMessagesFound) {
      console.log("✅ Expected UW messages were found during rule processing - Accept and continue");
      console.log(`   Expected messages found: ${allFoundExpectedMessages.join(', ')}`);

      // Collect ALL UW messages from UI (not just expected ones) for Excel
      const allUWMessages = getAllUWMessages(uiUnderwriting);
      console.log(`📝 Capturing ALL UW messages for Excel (expected approval case): ${allUWMessages.join(', ')}`);

      return {
        success: true,
        errorType: 'none',
        message: 'Expected UW messages found and approved',
        shouldStop: false,
        status: 'PASS',
        validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,
      };
    } else {
      console.log("❌ Scenario 2: Unexpected underwriting issues found in UI");
      await captureFullPage2D(page, testInfo, 'Unexpected UW Issues');
      const unexpectedFound = uiUnderwriting.filter(msg =>
        !standardKeyPhrases.some(keyPhrase => msg.includes(keyPhrase))
      );
      return {
        success: false,
        errorType: 'underwriting',
        message: `Unexpected underwriting issues: ${unexpectedFound.join(', ')}`,
        shouldStop: true,
        status: 'FAIL',
        validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,
      };
    }
  }  // Scenario 5: No warnings, errors, or UW issues - continue to end
  console.log("✅ Scenario 5: No validation issues found - Continue to end of test");

  // Collect ALL UW messages found during validation for reporting (no filtering)
  const allFoundUWMessages = uiUnderwriting;
  let allUWMessages: string[] = [];

  // Always capture ALL UW messages from UI regardless of expected/unexpected categorization
  if (allFoundUWMessages.length > 0) {
    console.log(`🔍 Final collection - Collecting ALL ${allFoundUWMessages.length} UW messages (no filtering)`);

    // Use the getAllUWMessages function to ensure no filtering is applied
    allUWMessages = getAllUWMessages(allFoundUWMessages);

    // Log what we found for informational purposes (but don't filter)
    if (expectedUWMessagesFound) {
      console.log(`📋 Expected messages were found during rule processing: ${allFoundExpectedMessages.join(', ')}`);
    }

    console.log(`📊 Final ALL UW Messages for Excel: ${allUWMessages.length} messages (no filtering applied)`);
    allUWMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. "${msg}"`);
    });
  } else {
    console.log(`ℹ️ No UW messages found in UI`);
  }

  return {
    success: true,
    errorType: 'none',
    message: 'No validation errors expected or found',
    shouldStop: false,
    status: 'PASS',
    validationErrors: uiValidationErrors,
          uwMessages: uiUnderwriting,
  };
}