import { test } from "../setup/page-setup";
import {
  buildFailureStatus,
  categorizeErrorType,
  extractFieldNameFromError,
  extractPageFromTestInfo,
  getQuotePageByTestCase,
  getRuleMatrixByTestCase,
  getSubmissionRowsDataCore,
  readExcelfile,
  writeTestResultsToExcel
} from "../utils/excel-utils";
import path from "path";
import * as AccountPage from "../pages/Core/AccountCreation_CorePage";
import * as LoginPage from "../pages/Core/LoginPage";
import * as QualificationPage from "../pages/Core/qualifications_CorePage";
import * as PolicyInfoPage from "../pages/Core/policyInfo_CorePage";
import * as DwellingPage from "../pages/Core/dwelling_CorePage";
import * as DwellingConstructionPage from "../pages/Core/dwellingConstruction_CorePage";
import * as CoveragePage from "../pages/Core/coverages_CorePage";
import * as DS_CoveragePage from "../pages/Core/DS_Coverages_CorePage";
import * as paymentDetailsPage from "../pages/Core/payments_CorePage";
import * as RiskAnalysisPage from "../pages/Core/RiskAnalysis_CorePage";
import * as CV_RiskAnaysis_CorePage from "../pages/Core/Recreational/CV_RiskAnaysis_CorePage";
import { MAX_TIMEOUT, PAUSE_TIMEOUT } from "../utils/timeout-constants";
import { results } from "../testdata/testData";
import { captureAndAttach, captureAndAttachforCore, captureFullPage2D } from "../utils/report-utils";
import { isElementVisible } from "../utils/element-utils";
import { errorWordingValidation, getActualUIValidationErrors, getValidationErrorUI, getValidationErrorUICore } from "../utils/wordingValidation";
import { wait } from "../utils/action-utils";
import { resolveExcelPath, resolveResultPath, validateExcelFile, createAutoConfig } from "../utils/excel-path-resolver";
import { initQuestionMapper, initQuestionMapperFromJson } from "../utils/questionTextMapper";
import { ValidationResult } from "../utils/coreRuleBasedValidation";
import { getLocator } from "../utils/locator-utils";
import { executionAbortFile, isExecutionAborted, markExecutionAborted } from "../utils/abort-helper";
import fs from "fs";
import { emitExecutionEvent } from "../utils/execution-event";
// ✅ ENHANCED: Session-aware auto-config that uses filtered Excel files
const excelConfig = createAutoConfig(
  "Dwelling_Special_Core_PolicyChange_Test_Generator_v1.xlsm",
  "Dwelling_Special_CORE-Result.xlsx"
);

let excelPath: string;
let excelResultPath: string;
let initialized = false;

let AccountDetails: any;
let Qualificationsrecords: any;
let allSubmissionData: any;
let policyInfoRecords: any;
let dwellingRecords: any;
let dwellingConstructionRecords: any;
let CoverageRecords: any;
let RiskAnalysisRecords: any;
let RuleMatrixRecords: any;
let PaymentDetailsRecords: any;
let SummaryRecord: any;
let RiskanalysisRecord: any;

function initializeExcelData() {
  if (initialized) return;

  excelPath = resolveExcelPath(excelConfig);
  excelResultPath = resolveResultPath(excelConfig);
  // Validate Excel file exists
  validateExcelFile(excelPath);
  initQuestionMapperFromJson();
  const allSummaryRecords = readExcelfile(excelPath, "Summary");

  // ✅ Filter with original indices: Sirf GEN_TC = "Y" wale test cases
  SummaryRecord = allSummaryRecords
    .map((record: any, originalIndex: number) => ({
      ...record,
      _originalRowIndex: originalIndex  // ✅ Track original row number
    }))
    .filter((record: any) => {

      const genTC = String(record["GEN_TC"] ?? "").trim().toLowerCase();
      return genTC === "y" || genTC === "yes";

    });

  console.log(`📊 Total records in Excel: ${allSummaryRecords.length}`);
  console.log(`✅ Filtered records (GEN_TC = Y): ${SummaryRecord.length}`);

  // Log which rows will be executed
  const rowNumbers = SummaryRecord.map((r: any) => r._originalRowIndex + 1).join(", ");
  console.log(`🎯 Running Excel rows: ${rowNumbers}`);

  // Load all data
  AccountDetails = readExcelfile(excelPath, "Account_Creation_Page");
  Qualificationsrecords = readExcelfile(excelPath, "New_Submission|PCR_Page");
  allSubmissionData = getSubmissionRowsDataCore(excelPath, SummaryRecord);
  console.log("📦 allSubmissionData keys:", Object.keys(allSubmissionData));
  console.log("🧪 policyInfoRecords:", !!policyInfoRecords, "len:", policyInfoRecords?.length);
  console.log("🧪 dwellingRecords:", !!dwellingRecords, "len:", dwellingRecords?.length);
  console.log("🧪 dwellingConstructionRecords:", !!dwellingConstructionRecords, "len:", dwellingConstructionRecords?.length);
  console.log("🧪 CoverageRecords:", !!CoverageRecords, "len:", CoverageRecords?.length);
  console.log("🧪 RuleMatrixRecords:", !!RuleMatrixRecords, "len:", RuleMatrixRecords?.length);
  console.log("🧪 RiskAnalysisRecords:", !!RiskAnalysisRecords, "len:", RiskAnalysisRecords?.length);
  policyInfoRecords = allSubmissionData["Policy_Info_Page"];
  dwellingRecords = allSubmissionData["Dwelling_Page"];
  dwellingConstructionRecords = allSubmissionData["Dwelling_Construction_Page"];
  CoverageRecords = getQuotePageByTestCase(excelPath, "Coverages_Page");
  RiskAnalysisRecords = allSubmissionData["Risk_Analysis_Page"];
  RuleMatrixRecords = getRuleMatrixByTestCase(excelPath, "RuleMatrix_Validation");
  PaymentDetailsRecords = readExcelfile(excelPath, "Payment_&_Signature_Page");
  RiskanalysisRecord = allSubmissionData["Risk_Analysis_Page"];

  initialized = true;
}
getSubmissionRowsDataCore

const getUnderWritingIssueMessage = `(//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn'])[1]`;
let allTestResults: any[] = [];
const FIXED_SHEET_NAME = "Test_Results";


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

const getAllUWMessagesFromUI = (messages: string[]): string[] => {
  console.log(`🔍 Collecting ALL UW messages from UI without filtering. Input: ${messages.length} messages`);

  messages.forEach((msg, index) => {
    console.log(`✅ UI - Including UW message ${index + 1}: "${msg}"`);
  });

  console.log(`📊 UI collection result: ${messages.length} total UW messages (no filtering applied)`);
  return messages; // Return all messages without any filtering
};

// ✅ IMPORTANT: This will be initialized AFTER filtering in beforeAll

// Generate tests dynamically - THIS MUST RUN AFTER beforeAll
const generateTests = () => {
  if (!initialized) {
    initializeExcelData();
  }

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
        status: detailedStatus, Account_number: acc_created,
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

  for (let i = 0; i < SummaryRecord.length; i++) {
    const summary = SummaryRecord[i];

    // Compute per-iteration values
    const originalRowIndex = summary._originalRowIndex;
    const excelRowNumber = originalRowIndex + 1;

    // Robust title extraction with fallbacks + trim
    const title = String(
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

      // let summary = SummaryRecord[i];

      //   const originalRowIndex = summary._originalRowIndex;
      //   const excelRowNumber = originalRowIndex + 1; // Excel row number (1-based)

      //   // let title = summary["TC_Title"] || summary["Suggested Test Case Title"];
      //   console.log(`✅ Running Test ${i + 1}: ${title} (Excel Row ${excelRowNumber}, GEN_TC = Y)`);

      // const Account = AccountDetails[originalRowIndex];
      // const Qualification = Qualificationsrecords[originalRowIndex];
      // const PolicyInfo = policyInfoRecords[originalRowIndex];
      // const Dwelling = dwellingRecords[originalRowIndex];
      // const DwellingConstruction = dwellingConstructionRecords[originalRowIndex];
      // const Coverage = CoverageRecords[originalRowIndex];
      // const Payment = PaymentDetailsRecords[originalRowIndex];
      // const Rulematrix = RuleMatrixRecords[originalRowIndex];

      // ✅ Fetch data by index (row selection now handled in getSubmissionRowsDataCore)
      let Account = AccountDetails[originalRowIndex];
      let Qualification = Qualificationsrecords[originalRowIndex];
      let Payment = PaymentDetailsRecords[originalRowIndex];
      let Rulematrix = RuleMatrixRecords;

      const rawTestNumber = summary["Test#"] || summary["TEST#"] || summary["Test_#"];
      const actualTestNumber = rawTestNumber !== undefined && !isNaN(Number(rawTestNumber))
        ? Number(rawTestNumber)
        : (originalRowIndex + 1);
      let test_num = actualTestNumber;
      testInfo.annotations.push({ type: "executionTestNumber", description: String(test_num) });
      testInfo.annotations.push({ type: "executionTestIndex", description: String(i + 1) });
      emitExecutionEvent({ type: "TEST_STARTED", testNumber: i + 1, sourceTestNumber: test_num, testName: title });
      // let PolicyInfo = policyInfoRecords[test_num.toString()];
      let PolicyInfo = policyInfoRecords[rawTestNumber];
      console.log(`Policy info page data fetched for rawTestNumber ${rawTestNumber}:`, PolicyInfo);
      let Dwelling = dwellingRecords[test_num.toString()];
      console.log(`Dwelling page data fetched for test_num ${test_num}:`, Dwelling);
      let DwellingConstruction = dwellingConstructionRecords[test_num.toString()];
      console.log(`Dwelling Construction page data fetched for test_num ${test_num}:`, DwellingConstruction);
      let Coverage = CoverageRecords[test_num.toString()];
      console.log(`Coverage page data fetched for test_num ${test_num}:`, Coverage);
      let Riskanalysis = RiskAnalysisRecords[test_num.toString()];
      console.log(`Risk Analysis page data fetched for test_num ${test_num}:`, Riskanalysis);
      console.log(`🔍 Data Mapping Debug: Attempting to map Excel row ${excelRowNumber} to test_num ${test_num} using rawTestNumber "${rawTestNumber}" and actualTestNumber ${actualTestNumber}`);
      console.log(`🔍 DATA ALIGNMENT DEBUG:`);

      console.log(`🔍 DATA ALIGNMENT DEBUG:`);
      console.log(`   - Loop index (i): ${i}`);
      console.log(`   - Excel row number: ${excelRowNumber}`);
      console.log(`   - Original row index: ${originalRowIndex}`);
      console.log(`   - Raw TEST# from Summary: ${rawTestNumber}`);
      console.log(`   - Actual TEST# from Summary: ${actualTestNumber}`);
      console.log(`   - Using test_num: ${test_num}`);
      console.log(`   - testcaseID will be: ${test_num.toString()}`);
      // console.log(`Coverage page data fetched for test_num ${test_num}:`, Coverage);

      const testcaseID = test_num.toString(); // Now uses actual TEST# from Excel    // ✅ ENHANCED DEBUG: Show data mapping alignment

      console.log(`✅ Running Test ${i + 1}: ${title} (Excel Row ${excelRowNumber}, GEN_TC = Y)`);
      console.log(`Running Summary row index: ${originalRowIndex} (Gen_TC=Yes)`);

      await test.step(`loginPage`, async () => {
        await LoginPage.navigateToAMSuiteLoginPage();
        await LoginPage.logInSuccesfully(RuleMatrixRecords, testcaseID);
      });

      try {
        await test.step(`Core Account creation - ${Account["First_Name"]} ${Account["Last_Name"]}`, async () => {
          await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });

          await AccountPage.navigateToCoreAccount_page(page, testInfo);
          await AccountPage.fillCoreAccountDetails_page(page, testInfo, Account);
          await AccountPage.enterCreateAccountDetails(page, testInfo, Account);

          acc_created = await AccountPage.getAccountNumberGenerated();
          console.log(`Account created with Account Number: ${acc_created}`);
        });

        await test.step(`DWS Core enter Qualification details `, async () => {
          await QualificationPage.createSubmissionQuote(page, testInfo, Qualification);
          submissionNumber = await QualificationPage.getSubmissionNumberGenerated();
          console.log(`Submission created with Submission Number: ${submissionNumber}`);
          // ✅ ADD: Pass submission number to PDF reporter via annotations
          test.info().annotations.push({
            type: 'submissionNumber',
            description: submissionNumber
          });
          const blockingContext = "Qualification";
          const validationResult: ValidationResult = await QualificationPage.answerDBQualificationQuestions_MHCore(page, testInfo, Qualification, Rulematrix, blockingContext, testcaseID);
          uiErrorSummary = await getValidationErrorUICore();
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

        await test.step(`DWS Core enter Policy Info details `, async () => {
          const blockingContext = "PolicyInfo";
          const validationResult: ValidationResult = await PolicyInfoPage.fillPolicyInfoCorePage(page, testInfo, PolicyInfo, Rulematrix, blockingContext, testcaseID);
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

        await test.step(`DWS Core enter Dwelling details `, async () => {
          await DwellingPage.fillDwellingDetails(page, testInfo, Dwelling);
          await DwellingPage.fillProtectionDetails(page, testInfo, Dwelling);
          const blockingContext = "Dwelling";
          const validationResult: ValidationResult = await DwellingPage.fillUnderwritingDetails_DWS(page, testInfo, Dwelling, Rulematrix, blockingContext, testcaseID);

          uiErrorSummary = await getValidationErrorUICore();
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

        await test.step(`DWS Core enter Dwelling Construction details `, async () => {

          const blockingContext = "DwellingConstruction";
          const validationResult: ValidationResult = await DwellingConstructionPage.fillDwellingConstruction_DWSPage(page, testInfo, DwellingConstruction, Rulematrix, blockingContext, testcaseID);
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

        await test.step(`DWS Core enter Coverages details `, async () => {
          const blockingContext = "Coverages";
          const validationResult: ValidationResult = await DS_CoveragePage.fillCoveragesCorePage(page, testInfo, Coverage, Rulematrix, blockingContext, testcaseID);
          uiErrorSummary = await getValidationErrorUICore();
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

        const getUnderWritingIssueMessage = `(//a[text()='Approve']/parent::div/parent::td/preceding-sibling::td//img[@class='x-grid-checkcolumn'])[1]`;
        await test.step(`DWS Core enter and validate riskanalysis details `, async () => {
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
        await test.step(`DWS Core generate quote and proceed to issuance from policy review page `, async () => {
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
          const validationResultFromPolicyReview: ValidationResult = await RiskAnalysisPage.proceedToIssuanceFromPolicyReviewPage(
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

        await test.step(`DWS Core enter Payment details `, async () => {
          const blockingContext = "Payments";
          const validationResult: ValidationResult = await paymentDetailsPage.enterPaymentDetails(page, testInfo, Payment, Account, Rulematrix, blockingContext, testcaseID);
          policy_number = await paymentDetailsPage.getPolicyNumberGenerated(page, testInfo);
          // ✅ ADD: Pass policy number to PDF reporter via annotations (overrides submission number)
          if (policy_number) {
            test.info().annotations.push({
              type: 'policyNumber',
              description: policy_number
            });
            console.log(`📝 Policy number ${policy_number} passed to PDF reporter`);
          }
          uiErrorSummary = await getValidationErrorUICore();
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

        console.log(`Policy Number: `, policy_number);

        console.log(`Submission Number: `, submissionNumber);
        allTestResults.push({
          testCase: title,
          status: acc_created === "" ? "FAIL" : "PASS",
          Account_number: acc_created,
          Submission_number: submissionNumber,
          Policy_number: policy_number,
          Validation_Error: uiErrorSummary,
          UWIDescription: UWI_Description,
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