import { test } from "../setup/page-setup";
import { getSubmissionRowsDataRecCore, getDriversByTestCase, readExcelfile, writeTestResultsToExcel, getQuotePageByTestCase, getRuleMatrixByTestCase, buildFailureStatus, categorizeErrorType, extractFieldNameFromError, extractPageFromTestInfo } from "../utils/excel-utils";
import {
  getLocator,
} from "../utils/locator-utils";
import path from "path";
import * as AccountPage from "../pages/Core/AccountCreation_CorePage";
import * as LoginPage from "../pages/GPA/Residential/LoginPage";
import * as RiskAnalysisPage from "../pages/Core/RiskAnalysis_CorePage";
import * as CV_qualification_CorePage from "../pages/Core/Recreational/CV_qualification_CorePage";
import * as CV_policyInfo_CorePage from "../pages/Core/Recreational/CV_policyInfo_CorePage";
import * as CV_Drivers_CorePage from "../pages/Core/Recreational/CV_Drivers_CorePage";
import * as CV_Vehicle_CorePage from "../pages/Core/Recreational/CV_Vehicle_CorePage";
import * as CV_Coverage_CorePage from "../pages/Core/Recreational/CV_Coverage_CorePage";
import * as paymentDetailsPage from "../pages/Core/payments_CorePage";
import * as CV_RiskAnaysis_CorePage from "../pages/Core/Recreational/CV_RiskAnaysis_CorePage";
import { MAX_TIMEOUT, PAUSE_TIMEOUT } from "../utils/timeout-constants";
import { captureAndAttach, captureAndAttachforCore, captureFullPage2D } from "../utils/report-utils";
import { isElementVisible } from "../utils/element-utils";
import { errorWordingValidation, getActualUIValidationErrors, getValidationErrorUI, getValidationErrorUICore } from "../utils/wordingValidation";
import { resolveExcelPath, resolveResultPath, validateExcelFile, createAutoConfig } from "../utils/excel-path-resolver";
import { ValidationResult } from "../utils/ruleBasedValidation";
import { wait } from "../utils/action-utils";
import { initQuestionMapper } from "../utils/questionTextMapper";
import { executionAbortFile, isExecutionAborted, markExecutionAborted } from "../utils/abort-helper";
import fs from "fs";
import { emitExecutionEvent } from "../utils/execution-event";


const getAllUWMessagesFromUI = (messages: string[]): string[] => {
  console.log(`🔍 Collecting ALL UW messages from UI without filtering. Input: ${messages.length} messages`);

  messages.forEach((msg, index) => {
    console.log(`✅ UI - Including UW message ${index + 1}: "${msg}"`);
  });

  console.log(`📊 UI collection result: ${messages.length} total UW messages (no filtering applied)`);
  return messages; // Return all messages without any filtering
};

// Helper function to handle validation results
function handleValidationResult(
  validationResult: ValidationResult,
  summary: any,
  acc_created: string,
  submissionNumber: string,
  policy_number: string,
  uiErrorSummary: string[],
  UWI_Description: string[],
  testStartTime: string,
): { shouldStop: boolean; resultPushed: boolean } {
  if (!validationResult.success) {
    console.log(`❌ ${validationResult.message}`);

    // Use enhanced validation result data for logging
    const uwMessages = validationResult.uwMessages || [];
    const validationErrors = validationResult.validationErrors || uiErrorSummary;
    //const expectedUW = validationResult.expectedUW || ''; console.log("🔍 UW Messages for Excel:");
    console.log("   - uwMessages from ValidationResult:", uwMessages);
    console.log("   - UWI_Description from UI (fallback):", UWI_Description);

    // Use uwMessages from validation result, or fallback to filtered UWI_Description
    let finalUWMessages: string[] = [];
    if (uwMessages.length > 0) {
      finalUWMessages = uwMessages;
      console.log("✅ Using UW messages from ValidationResult");
      console.log(`   📊 ValidationResult contained ${uwMessages.length} UW messages:`, uwMessages);
    } else if (UWI_Description.length > 0) {
      finalUWMessages = getAllUWMessagesFromUI(UWI_Description);
      console.log("⚠️ Falling back to ALL UWI_Description messages");
      console.log(`   📊 UI fallback yielded ${finalUWMessages.length} total messages:`, finalUWMessages);
    } else {
      console.log("ℹ️ No UW messages found in either source");
    }

    // Remove duplicates while preserving order
    const uniqueUWMessages = [...new Set(finalUWMessages)];
    let detailedStatus = `${validationResult.status} - ${validationResult.message}`; console.log(`📊 Final UW Messages for Excel (${uniqueUWMessages.length} unique messages):`, uniqueUWMessages); allTestResults.push({
      testCase: summary["TC_Title"] || summary["Suggested Test Case Title"],
      status: detailedStatus,
      Account_number: acc_created,
      Submission_number: submissionNumber,
      Policy_number: policy_number,
      Validation_Error: validationErrors,
      UWIDescription: uniqueUWMessages, // ALL UW messages found in UI (no filtering applied)
      executionTimestamp: testStartTime
    });
    return { shouldStop: true, resultPushed: true };
  }

  if (validationResult.success && validationResult.shouldStop) {
    console.log(`✅ ${validationResult.message}`);    // Use enhanced validation result data for logging
    const uwMessages = validationResult.uwMessages || [];
    const validationErrors = validationResult.validationErrors || uiErrorSummary;
    ///const expectedUW = validationResult.expectedUW || '';

    console.log("🔍 UW Messages for Excel (Success Case):");
    console.log("   - uwMessages from ValidationResult:", uwMessages);
    console.log("   - UWI_Description from UI (fallback):", UWI_Description);

    // Use uwMessages from validation result, or fallback to filtered UWI_Description
    let finalUWMessages: string[] = [];
    if (uwMessages.length > 0) {
      finalUWMessages = uwMessages;
      console.log("✅ Using UW messages from ValidationResult (Success Case)");
      console.log(`   📊 ValidationResult contained ${uwMessages.length} UW messages:`, uwMessages);
    } else if (UWI_Description.length > 0) {
      finalUWMessages = getAllUWMessagesFromUI(UWI_Description);
      console.log("⚠️ Falling back to ALL UWI_Description messages (Success Case)");
      console.log(`   📊 UI fallback yielded ${finalUWMessages.length} total messages:`, finalUWMessages);
    } else {
      console.log("ℹ️ No UW messages found in either source (Success Case)");
    }

    const uniqueUWMessages = [...new Set(finalUWMessages)];
    let detailedStatus = `${validationResult.status} - ${validationResult.message}`; console.log(`📊 Final UW Messages for Excel (Success Case):`, uniqueUWMessages);

    allTestResults.push({
      testCase: summary["TC_Title"] || summary["Suggested Test Case Title"],
      status: detailedStatus,
      Account_number: acc_created,
      Submission_number: submissionNumber,
      Policy_number: policy_number,
      Validation_Error: validationErrors,
      UWIDescription: uniqueUWMessages, // ALL UW messages found in UI (no filtering applied)
      executionTimestamp: testStartTime
    });
    return { shouldStop: true, resultPushed: true };
  }

  console.log(`✅ ${validationResult.message} - Continuing to next step`);
  return { shouldStop: false, resultPushed: false };
}

// ✅ SIMPLIFIED AUTO-CONFIG - Patterns auto-detected from filename
const excelConfig = createAutoConfig(
  "CollectorVehicle_Test_Case_Generator_Policy_Change_1.xlsm",
  "Collector-Vehicles-Result.xlsx"
);

// ✅ LAZY INITIALIZATION - Excel data loaded after cache clearing
let excelPath: string;
let excelResultPath: string;
let initialized = false;

// Constants
const getUnderWritingIssueMessage = `//a[text()='Approve']/parent::div/parent::td/parent::tr[@data-recordindex='1']//img[@class='x-grid-checkcolumn']`;

// Excel data variables
let AccountDetails: any;
let Qualificationrecords: any;
let DriversRecords: any;
let VehiclesRecords: any;
let allSubmissionData: any;
let PolicyInfoRecords: any;
let PaymentDetailsRecords: any;
let RuleMatrixRecords: any;
let SummaryRecord: any;
let MinMaxRecords: any;
let CoverageRecords: any;
let RiskanalysisRecord: any;


function initializeExcelData() {
  if (initialized) return;

  excelPath = resolveExcelPath(excelConfig);
  excelResultPath = resolveResultPath(excelConfig);

  // Validate Excel file exists
  validateExcelFile(excelPath);

  initQuestionMapper(excelPath, "Sheets_Help");
  // Load all Excel data
  const allSummaryRecords = readExcelfile(excelPath, "Summary");

  // ✅ Check if this is already a filtered Excel file (from server-side filtering)
  const isFilteredExcel = excelPath.includes('filtered_');

  if (isFilteredExcel) {
    // Server already filtered - use all rows and preserve indices
    console.log(`🎯 Using pre-filtered Excel file from server`);
    SummaryRecord = allSummaryRecords.map((record: any, index: number) => ({
      ...record,
      _originalRowIndex: index  // Use sequential index for filtered file
    }));
  } else {
    // Manual filtering for non-server Excel files
    console.log(`🔍 Applying manual GEN_TC filtering`);
    SummaryRecord = allSummaryRecords
      .map((record: any, originalIndex: number) => ({
        ...record,
        _originalRowIndex: originalIndex
      }))
      .filter((record: any) => {
        const genTC = String(record["GEN_TC"] ?? "").trim().toLowerCase();
        return genTC === "y" || genTC === "yes";
      });
  }

  console.log(`📊 Total records in Excel: ${allSummaryRecords.length}`);
  console.log(`✅ Records to process: ${SummaryRecord.length}`);
  console.log(`🎯 Using ${isFilteredExcel ? 'pre-filtered' : 'manual filtered'} data`);

  // Log which rows will be executed
  const rowNumbers = SummaryRecord.map((r: any) => r._originalRowIndex + 1).join(", ");
  console.log(`🎯 Running Excel rows: ${rowNumbers}`);

  // Validate Excel file exists
  validateExcelFile(excelPath);
  const getUnderWritingIssueMessage = `//gw-displaykey-format[text() = 'There are underwriting issues associated with this offering. ']`;
  // Load other sheets (full data - we'll use indices later)
  AccountDetails = readExcelfile(excelPath, "Account_Creation_Page");

  Qualificationrecords = readExcelfile(excelPath, "New_Submission|PCR_Page");
  allSubmissionData = getSubmissionRowsDataRecCore(excelPath, SummaryRecord);
  PolicyInfoRecords = allSubmissionData["Policy_Info_Page"];
  DriversRecords = getDriversByTestCase(excelPath, "Drivers_Page");
  VehiclesRecords = getDriversByTestCase(excelPath, "Vehicles_Page");
  RiskanalysisRecord = allSubmissionData["Risk_Analysis_Page"];
  PaymentDetailsRecords = readExcelfile(excelPath, "Payment_&_Signature_Page");
  RuleMatrixRecords = getRuleMatrixByTestCase(excelPath, "RuleMatrix_Validation");
  MinMaxRecords = readExcelfile(excelPath, "Min_Max");

  CoverageRecords = getQuotePageByTestCase(excelPath, "Coverages_Page");


  initialized = true;
}

let allTestResults: any[] = [];
const FIXED_SHEET_NAME = "Test_Results"; // ✅ Add this constant



test.afterEach(async ({ }, testInfo) => {

  const abortError = testInfo.error?.message?.includes("TEST_ABORTED");
  const abortedDuringExecution = isExecutionAborted() && testInfo.status !== 'passed' && testInfo.status !== 'skipped';
  if (abortError || abortedDuringExecution) {

    const title = testInfo.title;

    // create result if nothing exists
    const existingResult = allTestResults.find(result => result.testCase === title);
    if (existingResult) {
      existingResult.status = abortError && existingResult.status === "NOT STARTED" ? "NOT STARTED" : "ABORTED";
    } else {
      allTestResults.push({
        testCase: title,
        status: abortError ? "NOT STARTED" : "ABORTED",
        Account_number: "##",
        Submission_number: "##",
        Policy_number: "##",
        Validation_Error: [],
        UWIDescription: [],
        executionTimestamp: new Date().toISOString()
      });
    }
  }

  await writeTestResultsToExcel(
    excelResultPath,
    FIXED_SHEET_NAME,
    allTestResults
  );

  allTestResults = [];
});

test.beforeEach(async () => {
  console.log("before each ..");
  if (isExecutionAborted()) {
    console.log("🛑 Found execution-aborted.flag");
    throw new Error("TEST_ABORTED");
  }
});

test.afterAll(async () => {
  console.log("Inside after all.");
  const sessionId = process.env.SESSION_ID;

  if (!sessionId) return;

});

// ✅ Initialize data before test loop
test.beforeAll(() => {
  console.log("beforeEach flag exists=", fs.existsSync(executionAbortFile));

  initializeExcelData();
  console.log(`🔄 Running ${SummaryRecord.length} test cases (GEN_TC = Y)`);
});

const generateTests = () => {
  if (!initialized) {
    initializeExcelData();
  }

  for (let i = 0; i < SummaryRecord.length; i++) {
    const summary = SummaryRecord[i];

    // Compute per-iteration values
    const originalRowIndex = summary._originalRowIndex;
    const excelRowNumber = originalRowIndex + 1;

    // Robust title extraction with fallbacks + trim
    let title = String(
      summary["TC_Title"] ??
      summary["TC Title"] ??
      summary["Title"] ??
      summary["Suggested Test Case Title"] ??
      ""
    ).trim() || `TC_Row_${excelRowNumber}`;

    // Use per-iteration title in the test name
    test(`${title}`, async ({ page }, testInfo) => {
      test.setTimeout(2_000_000);
      const testStartTime = new Date().toISOString();
      let acc_created: string = "##";
      let submissionNumber: string = "##";
      let policy_number: string = "##";
      let UWI_Description: string[] = [];
      let uiErrorSummary: string[] = [];
      let resultPushed = false;
      let skipRemainingSteps = false;

      let title = summary["TC_Title"] || summary["Suggested Test Case Title"];
      console.log(`✅ Running Test ${i + 1}: ${title} (Excel Row ${excelRowNumber}, GEN_TC = Y)`);

      const rawTestNumber = summary["Test#"] || summary["TEST#"] || summary["Test_#"];
      const actualTestNumber = rawTestNumber !== undefined && !isNaN(Number(rawTestNumber))
        ? Number(rawTestNumber)
        : (originalRowIndex + 1);
      let test_num = actualTestNumber;
      testInfo.annotations.push({ type: "executionTestNumber", description: String(test_num) });
      testInfo.annotations.push({ type: "executionTestIndex", description: String(i + 1) });
      emitExecutionEvent({ type: "TEST_STARTED", testNumber: i + 1, sourceTestNumber: test_num, testName: title });

      // ✅ Read data from ORIGINAL row index
      let Account = AccountDetails[originalRowIndex];

      let Qualification = Qualificationrecords[originalRowIndex];
      // let drivers = DriversRecords[test_num.toString()];
      // let Vehicle = VehiclesRecords[test_num.toString()];
      // let Coverage = CoverageRecords[test_num.toString()];
      // let PolicyInfo = PolicyInfoRecords[originalRowIndex];
      let Payment = PaymentDetailsRecords[originalRowIndex];
      let Rulematrix = RuleMatrixRecords; // Pass the full rule matrix structure
      let Min_Max = MinMaxRecords[originalRowIndex];

      // let PolicyInfo = policyInfoRecords[test_num.toString()];
      let PolicyInfo = PolicyInfoRecords[rawTestNumber];
      console.log(`Policy info page data fetched for rawTestNumber ${rawTestNumber}:`, PolicyInfo);
      let drivers = DriversRecords[test_num.toString()];
      console.log(`Dwelling page data fetched for test_num ${test_num}:`, drivers);
      let Vehicle = VehiclesRecords[test_num.toString()];
      console.log(`Dwelling Construction page data fetched for test_num ${test_num}:`, Vehicle);
      let Coverage = CoverageRecords[test_num.toString()];
      console.log(`Coverage page data fetched for test_num ${test_num}:`, Coverage);
      let Riskanalysis = RiskanalysisRecord[test_num.toString()];
      console.log(`Risk Analysis page data fetched for test_num ${test_num}:`, Riskanalysis);
      console.log(`🔍 Data Mapping Debug: Attempting to map Excel row ${excelRowNumber} to test_num ${test_num} using rawTestNumber "${rawTestNumber}" and actualTestNumber ${actualTestNumber}`);
      console.log(`🔍 DATA ALIGNMENT DEBUG:`);
      console.log(`   - Loop index (i): ${i}`);
      console.log(`   - Excel row number: ${excelRowNumber}`);
      console.log(`   - Original row index: ${originalRowIndex}`);
      console.log(`   - Raw TEST# from Summary: ${rawTestNumber}`);
      console.log(`   - Actual TEST# from Summary: ${actualTestNumber}`);
      console.log(`   - Using test_num: ${test_num}`);
      console.log(`   - testcaseID will be: ${test_num.toString()}`);
      // console.log(`Coverage page data fetched for test_num ${test_num}:`, Coverage);

      console.log(`✅ Running Test ${i + 1}: ${title} (Excel Row ${excelRowNumber}, GEN_TC = Y)`);

      const testcaseID = test_num.toString();
      console.log(`Running Summary row index: ${originalRowIndex} (Gen_TC=Yes)`);

      await test.step(`loginPage`, async () => {
        await LoginPage.navigateToAMSuiteLoginPage();
        await LoginPage.logInSuccesfully(RuleMatrixRecords, testcaseID);
      });

      try {
        await test.step(`CV Core Account creation - ${Account["First_Name"]} ${Account["Last_Name"]}`, async () => {
          await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });

          await AccountPage.navigateToCoreAccount_page(page, testInfo);
          await AccountPage.fillCoreAccountDetails_page(page, testInfo, Account);
          await AccountPage.enterCreateAccountDetails(page, testInfo, Account);

          acc_created = await AccountPage.getAccountNumberGenerated();
          console.log(`Account created with Account Number: ${acc_created}`);
        });

        await test.step(`CV Core enter Qualification details `, async () => {
          await CV_qualification_CorePage.createSubmissionQuote(page, testInfo, Qualification);
          submissionNumber = await CV_qualification_CorePage.getSubmissionNumberGenerated();
          console.log(`Submission created with Submission Number: ${submissionNumber}`);
          // ✅ ADD: Pass submission number to PDF reporter via annotations
          test.info().annotations.push({
            type: 'submissionNumber',
            description: submissionNumber
          });
          const blockingContext = "QualificationDetails";
          const validationResult: ValidationResult = await CV_qualification_CorePage.answerDBQualificationQuestions_CVCore(
            page,
            testInfo,
            Qualification,
            Rulematrix,
            blockingContext,
            testcaseID
          );

          uiErrorSummary = await getValidationErrorUI();
          console.log("uiErrorSummary:", uiErrorSummary);
          console.log("Validation Result:", validationResult);

          // Handle validation result based on the 5 scenarios
          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );
          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
        });
        if (skipRemainingSteps) return;

        await test.step(`CV Core enter Policy Info details`, async () => {
          const blockingContext = "PolicyInfo";
          const validationResult: ValidationResult = await CV_policyInfo_CorePage.fillPolicyInfoCorePage(
            page,
            testInfo,
            PolicyInfo,
            Rulematrix,
            blockingContext,
            testcaseID);

          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );
          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
        });
        if (skipRemainingSteps) return;

        await test.step(`CV Core enter Driver details `, async () => {
          const blockingContext = "DriverDetails";
          const validationResult: ValidationResult = await CV_Drivers_CorePage.fillDriverCorePage(
            page,
            testInfo,
            drivers,
            Rulematrix,
            blockingContext,
            testcaseID,
            Account
          );

          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );
          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
        });
        if (skipRemainingSteps) return;

        await test.step(`CV Core enter Vehicle details `, async () => {
          const blockingContext = "Vehicle";
          const validationResult: ValidationResult = await CV_Vehicle_CorePage.fillVehicleCorePage(
            page,
            testInfo,
            Vehicle,
            Rulematrix,
            blockingContext,
            test_num
          );

          uiErrorSummary = await getValidationErrorUICore();
          console.log("uiErrorSummary:", uiErrorSummary);
          console.log("Validation Result:", validationResult);

          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );
          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
        });
        if (skipRemainingSteps) return;

        await test.step(`CV Core enter Coverages details `, async () => {
          const blockingContext = "Coverages";
          const validationResult: ValidationResult = await CV_Coverage_CorePage.fillCoveragesCorePage(
            page,
            testInfo,
            Coverage,
            Rulematrix,
            blockingContext,
            testcaseID
          );

          uiErrorSummary = await getValidationErrorUICore();
          console.log("uiErrorSummary:", uiErrorSummary);
          console.log("Validation Result:", validationResult);

          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );
          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
        });
        if (skipRemainingSteps) return;

        const getUnderWritingIssueMessage = `(//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn'])[1]`;
        await test.step(`CV Core enter and validate riskanalysis details `, async () => {
          // await RiskAnalysisPage.clickonQuoteinRiskAnalysis(page, testInfo);
          let blockingContext = "Risk Analysis";
          const validationResult: ValidationResult = await RiskAnalysisPage.clickonBindOptionsinQuote(test_num, Rulematrix, page, testInfo, Riskanalysis, blockingContext);
          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );

          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
          if (skipRemainingSteps) return;
          await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
          if (await isElementVisible(getUnderWritingIssueMessage)) {
            UWI_Description = await RiskAnalysisPage.getIssueDescriptions();
            const validationResult: ValidationResult = await CV_RiskAnaysis_CorePage.CV_saveAndQuote(test_num, Rulematrix, page, testInfo);
            console.log("UW messages from Spec file", UWI_Description);
            if (await isElementVisible(getLocator('//a[contains(@id,"UWIssueRowSet:ShortDescription")]').first())) {
              UWI_Description = await RiskAnalysisPage.getIssueDescriptions();
              console.log("🔍 Raw UWI_Description from Risk Analysis:", UWI_Description);
              console.log("🔍 Validation Result UW Messages:", validationResult.uwMessages);
            } else {
              console.log("ℹ️ No UWI descriptions found in Risk Analysis");
            }

            // Handle validation result and determine if we should stop
            const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
              validationResult,
              summary,
              acc_created,
              submissionNumber,
              policy_number,
              uiErrorSummary,
              UWI_Description,
              testStartTime
            );

            skipRemainingSteps = shouldStop;
            resultPushed = validationResultPushed;
            if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
          }
          if (!skipRemainingSteps) {
            await RiskAnalysisPage.clickSaveandNextFromRiskAnlyasisPage(
              page,
              testInfo,
              Riskanalysis
            );
          }
        });
        if (skipRemainingSteps) return;

        //we can write another test step or we should handle validation result if we wright sepearate function .
        await test.step(`CV Core generate quote and proceed to issuance from policy review page `, async () => {
          let blockingContext = 'Policy Review'
          const validationResult: ValidationResult = await RiskAnalysisPage.generateQuoteFromPolilcyReviewPage(testcaseID, blockingContext, Rulematrix, page, testInfo);
          // Handle validation result based on the 5 scenarios
          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );
          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
          if (skipRemainingSteps) return;
          blockingContext = 'Quote Page';
          const validationResultFromPolicyReview : ValidationResult = await RiskAnalysisPage.proceedToIssuanceFromPolicyReviewPage(
            page,
            testInfo,
            Rulematrix,
            blockingContext,
            testcaseID
          );
          const { shouldStop: shouldStopInPolicyReview, resultPushed: policyReviewValidationResultPushed } = handleValidationResult(
            validationResultFromPolicyReview,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );
          skipRemainingSteps = shouldStopInPolicyReview;
          resultPushed = policyReviewValidationResultPushed;
          if (shouldStopInPolicyReview && !validationResultFromPolicyReview.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
          if (skipRemainingSteps) return;
          
          if (await isElementVisible(getUnderWritingIssueMessage)) {
            UWI_Description = await RiskAnalysisPage.getIssueDescriptions();
            const validationResult: ValidationResult = await CV_RiskAnaysis_CorePage.CV_saveAndQuote(test_num, Rulematrix, page, testInfo);
            console.log("UW messages from Spec file", UWI_Description);
            if (await isElementVisible(getLocator('//a[contains(@id,"UWIssueRowSet:ShortDescription")]').first())) {
              UWI_Description = await RiskAnalysisPage.getIssueDescriptions();
              console.log("🔍 Raw UWI_Description from Risk Analysis:", UWI_Description);
              console.log("🔍 Validation Result UW Messages:", validationResult.uwMessages);
            } else {
              console.log("ℹ️ No UWI descriptions found in Risk Analysis");
            }

            // Handle validation result and determine if we should stop
            const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
              validationResult,
              summary,
              acc_created,
              submissionNumber,
              policy_number,
              uiErrorSummary,
              UWI_Description,
              testStartTime
            );

            skipRemainingSteps = shouldStop;
            resultPushed = validationResultPushed;
            if (shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
          }

          if (!skipRemainingSteps) {
            await RiskAnalysisPage.clickonBindOptionsProceedToIssuance(
              page,
              testInfo
            );
          }
        });
        if (skipRemainingSteps) return;

        await test.step(`CV Core enter and validate payment details`, async () => {
          const blockingContext = "Payment";
          const validationResult: ValidationResult = await paymentDetailsPage.enterPaymentDetails(
            page,
            testInfo,
            Payment,
            Account,
            Rulematrix,
            blockingContext,
            testcaseID
          );

          policy_number = await paymentDetailsPage.getPolicyNumberGenerated(page, testInfo);
          // ✅ ADD: Pass policy number to PDF reporter via annotations (overrides submission number)
          if (policy_number) {
            test.info().annotations.push({
              type: 'policyNumber',
              description: policy_number
            });
            console.log(`📝 Policy number ${policy_number} passed to PDF reporter`);
          }
          uiErrorSummary = await getValidationErrorUI();
          console.log("uiErrorSummary:", uiErrorSummary);

          // Handle validation result using the helper function
          const { shouldStop, resultPushed: validationResultPushed } = handleValidationResult(
            validationResult,
            summary,
            acc_created,
            submissionNumber,
            policy_number,
            uiErrorSummary,
            UWI_Description,
            testStartTime
          );

          skipRemainingSteps = shouldStop;
          resultPushed = validationResultPushed;
          if(shouldStop && !validationResult.success) throw new Error('Unexpected Validation Error or Unexpected Underwriting occurred ,Failing Test.')
        }); 
        if (skipRemainingSteps) return;

        // Collect all UW messages from UI if no validation result was captured
        console.log("📊 Final test completion - collecting UW messages for Excel");
        console.log("   - Raw UWI_Description:", UWI_Description);
        let finalUWMessages: string[] = [];
        if (UWI_Description.length > 0) {
          finalUWMessages = getAllUWMessagesFromUI(UWI_Description);
          console.log("   - ALL UW Messages (no filtering):", finalUWMessages);
        } else {
          console.log("   - No UW messages found");
        }
        const uniqueUWMessages = [...new Set(finalUWMessages)];
        console.log("   - Unique UW Messages for Excel:", uniqueUWMessages); allTestResults.push({
          testCase: title,
          status: acc_created === "" ? "FAIL" : "PASS",
          Account_number: acc_created, Submission_number: submissionNumber,
          Policy_number: policy_number,
          Validation_Error: uiErrorSummary,
          UWIDescription: uniqueUWMessages, // ALL UW messages found in UI (no filtering applied)
          executionTimestamp: testStartTime
        });
        resultPushed = true;
      } catch (error) {
        const container = page.locator('#centerPanel');
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('TEST_ABORTED')) {
          console.log("TEST_ABORTED ENTERED CATCH BLOCK");
          markExecutionAborted();
          console.log("AFTER markExecutionAborted()", isExecutionAborted());
          console.log('🛑 Test aborted by user');

          // throw error;
        }
        const shouldSkipScreenshot = errorMessage.includes('Unexpected Validation') || errorMessage.includes('Unexpected Underwriting');
        if (shouldSkipScreenshot) {
          console.log('Skipping screenshot, already captured as Unexpected Validation/Underwriting result');
        } else {
          await captureFullPage2D(page, testInfo, "Capture Problem", "#centerPanel");
        }
        if (!resultPushed) {

          console.error(`Test failed for ${Account["First_Name"]}:`, error);
          console.log(`Submission Number: `, submissionNumber);

          // ✅ DEBUG: Log error structure for analysis
          console.log('🔍 DEBUG: Error type:', typeof error);
          console.log('🔍 DEBUG: Error has stack?', error instanceof Error && 'stack' in error);
          if (error instanceof Error) {
            console.log('🔍 DEBUG: Error stack preview:', error.stack?.substring(0, 200));
          }

          // ✅ ENHANCED: Attach error to testInfo for stack extraction
          if (error instanceof Error && !testInfo.error) {
            testInfo.error = error;
          }

          // ✅ Extract detailed error information
          const errorDescription = error instanceof Error ? error.message : String(error);
          const failedStep = extractPageFromTestInfo(testInfo);

          // ✅ Build detailed status with page, field, and error type
          const fieldName = extractFieldNameFromError(errorDescription, failedStep, testInfo);
          const errorType = categorizeErrorType(errorDescription, fieldName);
          const detailedStatus = buildFailureStatus(failedStep, fieldName, errorType);

          console.log(`📊 Field Name: "${fieldName}"`);
          console.log(`📊 Error Type: "${errorType}"`);
          console.log(`📊 Detailed Status: ${detailedStatus}`);

          // ✅ Extract validation errors from error message if applicable
          let validationErrors = uiErrorSummary;
          if (errorDescription.includes("validation error")) {
            const uiErrorsMatch = errorDescription.match(/validation error\s*(.+)$/);
            if (uiErrorsMatch && uiErrorsMatch[1]) {
              validationErrors = uiErrorsMatch[1].split(';').map(err => err.trim()).filter(err => err.length > 0);
              console.log(`📋 Extracted validation errors from error message:`, validationErrors);
            }
          }

          // Collect all UW messages for error case
          console.log("📊 Error case - collecting UW messages for Excel");
          console.log("   - Raw UWI_Description:", UWI_Description);
          let finalUWMessages: string[] = [];
          if (UWI_Description.length > 0) {
            finalUWMessages = getAllUWMessagesFromUI(UWI_Description);
            console.log("   - ALL UW Messages (no filtering):", finalUWMessages);
          } else {
            console.log("   - No UW messages found in error case");
          }
          const uniqueUWMessages = [...new Set(finalUWMessages)];
          console.log("   - Unique UW Messages for Excel:", uniqueUWMessages);

          allTestResults.push({
            testCase: title,
            status: detailedStatus,  // ✅ Use detailed status with page and field info
            Account_number: acc_created,
            Submission_number: submissionNumber,
            Policy_number: policy_number,
            Validation_Error: validationErrors,  // ✅ Use extracted validation errors
            UWIDescription: uniqueUWMessages, // ALL UW messages found in UI (no filtering applied)
            executionTimestamp: testStartTime
          });
        }
        resultPushed = true;
        throw error;
      } finally {
        // Always push a result if not already done
        if (!resultPushed) {
          // Collect all UW messages for final fallback case
          console.log("📊 Finally block - collecting UW messages for Excel");
          console.log("   - Raw UWI_Description:", UWI_Description);
          let finalUWMessages: string[] = [];
          if (UWI_Description.length > 0) {
            finalUWMessages = getAllUWMessagesFromUI(UWI_Description);
            console.log("   - ALL UW Messages (no filtering):", finalUWMessages);
          } else {
            console.log("   - No UW messages found in finally block");
          }
          const uniqueUWMessages = [...new Set(finalUWMessages)];
          console.log("   - Unique UW Messages for Excel:", uniqueUWMessages);

          allTestResults.push({
            testCase: title,
            status: "FAIL - Not Completed",
            Account_number: acc_created,
            Submission_number: submissionNumber,
            Policy_number: policy_number,
            Validation_Error: uiErrorSummary,
            UWIDescription: uniqueUWMessages, // ALL UW messages found in UI (no filtering applied)
            executionTimestamp: testStartTime
          });
        }
      }
    });
  }
};

// ✅ Call the function to generate tests
generateTests();