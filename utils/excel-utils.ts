import * as xlsx from "xlsx";
import * as path from "path";
import ExcelJS from "exceljs";
import * as fs from "fs"; // ✅ ADDED: Import fs module to check file existence

const excelWriteQueues = new Map<string, Promise<void>>();
 
export interface ExcelRow{
  [key: string]: any;
}

export function parseExcelToJson(
  filePath:string,
  sheetName:string,
  selectedTests: (string | number)[] = []
): ExcelRow[] {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];
  if(!sheet) throw new Error (`Sheet "${sheetName}" not found in ${filePath}`);
  const rows = xlsx.utils.sheet_to_json<ExcelRow>(sheet, {defval: ""});

  const merges = (sheet["!merges"] || []) as xlsx.Range[];
  const mergedMap: Record<number,any> = {};

  merges.forEach((merge:xlsx.Range) => {
    if(merge.s.c === 0){
      const cellAddress = xlsx.utils.encode_cell({r:merge.s.r,c:0});
      const value = sheet[cellAddress]?.v;
      for(let r = merge.s.r; r<=merge.e.r;r++) mergedMap[r] = value;
    }
  });
  const result: ExcelRow[] = [];
  rows.forEach((row, idx) => {
    const excelRowIndex = idx;
    const testNumber = mergedMap[excelRowIndex] || row["Test#"] || "";
    if(selectedTests.length>0 && !selectedTests.map(String).includes(String(testNumber))){
      return;
    }
    const hasData = Object.values(row).some(
      (v) => v! == "" && v!==null && v!==undefined
    );
    if(!hasData) return;

    const cleanRow: ExcelRow = {"Test#":testNumber};
    for(const[key,value] of Object.entries(row)){
      if(key && key.trim()!== ""){
        cleanRow[key.trim()] = value;
    }
   
    }
    result.push(cleanRow);

  });
  return result;
}

export function readExcelfile(filepath: string, sheetName: string): any[] {
  let data: any[] = [];
  try {
    const absolutePath = path.resolve(__dirname, filepath);
    const workbook = xlsx.readFile(absolutePath);
    //const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(sheet, { raw: false });
  } catch (error) {
    console.log("Failed to read Excel file:", error);
  }
  return data;
}

/**
 * Reads the Drivers_Page sheet and groups driver rows by TEST#.
 * Each test case may have multiple driver rows (Driver 1, Driver 2, etc.).
 *
 * @param filepath - Relative path to the Excel file
 * @param sheetName - Name of the sheet (e.g., "Drivers_Page")
 * @returns An object where each key is a TEST# and value is an array of driver rows
 */

export function readExcelfileData(filepath: string, sheetName: string): any[] {
  let data: any[] = [];
  try {
    const absolutePath = path.resolve(__dirname, filepath);
    const workbook = xlsx.readFile(absolutePath);
    //const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(sheet, { raw: false });
  } catch (error) {
    console.log("Failed to read Excel file:", error);
  }
  return data;
}


export async function writeTestResultsToExcel(
  filePath: string,
  sheetName: string,
  testResults: {
    executionTimestamp?: string | Date;
    testCase: string;
    status: string;
    Account_number: string;
    Submission_number: string;
    Policy_number: string;
    Validation_Error: string[];
    UWIDescription: string[];
  }[]
): Promise<void> {
  const previousWrite = excelWriteQueues.get(filePath) || Promise.resolve();
  const currentWrite = previousWrite.catch(() => undefined).then(async () => {
    await writeTestResultsToExcelLocked(filePath, sheetName, testResults);
  });
  excelWriteQueues.set(filePath, currentWrite);

  try {
    await currentWrite;
  } finally {
    if (excelWriteQueues.get(filePath) === currentWrite) {
      excelWriteQueues.delete(filePath);
    }
  }
}

async function writeTestResultsToExcelLocked(
  filePath: string,
  sheetName: string,
  testResults: {
    executionTimestamp?: string | Date;
    testCase: string;
    status: string;
    Account_number: string;
    Submission_number: string;
    Policy_number: string;
    Validation_Error: string[];
    UWIDescription: string[];
  }[]
): Promise<void> {
  const { v4: uuidv4 } = require('uuid'); // For unique TestInstanceID
  console.log(`📝 Writing ${testResults.length} test results to Excel`);
  const lockPath = `${filePath}.lock`;
  let lockHandle: number | null = null;

  for (let attempt = 0; attempt < 100 && lockHandle === null; attempt++) {
    try {
      lockHandle = fs.openSync(lockPath, 'wx');
    } catch (error: any) {
      if (error.code !== 'EEXIST') throw error;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  if (lockHandle === null) {
    throw new Error(`Timed out waiting for Excel result lock: ${filePath}`);
  }

  try {
    // ✅ CRITICAL: Create directory if it doesn't exist
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`📁 Created directory: ${directory}`);
    }
    let workbook: ExcelJS.Workbook;
    let sheet: ExcelJS.Worksheet;
    // ✅ ADDED: Check if file exists to append or create new
    if (fs.existsSync(filePath)) {
      console.log(`📂 File exists, loading: ${filePath}`);
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const existingSheet = workbook.getWorksheet(sheetName);
      if (existingSheet) {
        sheet = existingSheet;
        // Update columns if needed
        setupSheetHeaders(sheet, testResults);
      } else {
        sheet = workbook.addWorksheet(sheetName);
        setupSheetHeaders(sheet, testResults);
      }
    } else {
      workbook = new ExcelJS.Workbook();
      sheet = workbook.addWorksheet(sheetName);
      setupSheetHeaders(sheet, testResults);
    }
    // ✅ CHANGED: Write ALL test results, no deduplication
    // Keep a base time so fallback timestamps are always unique per row.
    const baseWriteTime = Date.now();
    testResults.forEach((result, idx) => {
      // const executionTimestamp = result.executionTimestamp
      //   ? new Date(result.executionTimestamp).toISOString()
      //   : new Date(baseWriteTime + idx).toISOString();

      const date = result.executionTimestamp
        ? new Date(result.executionTimestamp)
        : new Date(Date.now() + (idx * 1000));
      const executionTimestamp = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

      const rowData = [
       
        executionTimestamp,                // ExecutionTimestamp
        result.testCase,                    // Test Case Title
        result.status,                      // Status  
        result.Account_number,              // Account Number
        result.Submission_number,           // Submission Number
        result.Policy_number,               // Policy Number
        Array.isArray(result.Validation_Error) ? result.Validation_Error.join('; ') : result.Validation_Error, // Validation Error
        ...result.UWIDescription            // UWI columns
      ];
      sheet.addRow(rowData);
    });
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Excel file updated successfully: ${filePath}`);
  } catch (error) {
    console.log("❌ Failed to write Excel file:", error);
  } finally {
    fs.closeSync(lockHandle);
    fs.rmSync(lockPath, { force: true });
  }
}

// ✅ UPDATED: Helper function with better column handling
function setupSheetHeaders(sheet: ExcelJS.Worksheet, testResults: any[]) {
  const maxUWI = testResults.length > 0 ? Math.max(...testResults.map(r => r.UWIDescription.length), 0) : 0;

  const baseColumns = [
   
    { header: "ExecutionTimestamp", key: "ExecutionTimestamp", width: 5 },
    { header: "Test Case Title", key: "testCase", width: 45 },
    { header: "Status", key: "status", width: 20 },
    { header: "Account Number", key: "Account_number", width: 15 },
    { header: "Submission Number", key: "Submission_number", width: 18 },
    { header: "Policy Number", key: "Policy_number", width: 15 },
    { header: "Validation Error", key: "Validation_Error", width: 50}
  ];
 
  const uwiColumns = Array.from({ length: maxUWI }, (_, i) => ({
    header: `UWI_${i + 1}`,
    key: `UWI_${i + 1}`,
    width: 30,
  }));
 
  // ✅ FIX: Always set columns structure
  sheet.columns = [...baseColumns, ...uwiColumns];
 
  // ✅ Style headers
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
 
  console.log(`📋 Sheet setup with ${baseColumns.length + uwiColumns.length} columns`);
}
 
export async function appendTestResultsToExcel(
  filePath: string,
  sheetName: string,
  testResults: {
    testCase: string;
    status: string;
    First_Name: string;
    Account_number: string;
    Submission_number: string;
    Policy_number: string;
  }[]
): Promise<void> {
  try {
    let workbook: ExcelJS.Workbook;
    let sheet: ExcelJS.Worksheet;
 
    // ✅ CHANGED: Check if file exists instead of always creating new workbook
    if (fs.existsSync(filePath)) {
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
     
      const existingSheet = workbook.getWorksheet(sheetName);
      if (existingSheet) {
        sheet = existingSheet;
      } else {
        sheet = workbook.addWorksheet(sheetName);
        // ✅ ADDED: Setup columns only for new sheet
        sheet.columns = [
          { header: "Test Case", key: "testCase", width: 30 },
          { header: "Status", key: "status", width: 15 },
          { header: "Account_number", key: "Account_number", width: 15 },
          { header: "Submission_number", key: "Submission_number", width: 15 },
          { header: "Policy_number", key: "Policy_number", width: 50 },
        ];
      }
    } else {
      workbook = new ExcelJS.Workbook();
      sheet = workbook.addWorksheet(sheetName);
      sheet.columns = [
        { header: "Test Case", key: "testCase", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Account_number", key: "Account_number", width: 15 },
        { header: "Submission_number", key: "Submission_number", width: 15 },
        { header: "Policy_number", key: "Policy_number", width: 50 },
      ];
    }
 
    // ✅ UNCHANGED: Add test results to sheet
    testResults.forEach((result) => {
      sheet.addRow(result);
    });
 
    // ✅ REMOVED: Deleted irrelevant hardcoded data and xlsx operations
    // ✅ BEFORE: Had hardcoded "Alice", "Bob" data and xlsx operations
    // ✅ AFTER: Only ExcelJS operations for consistency
 
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Excel file updated successfully: ${filePath}`);
  } catch (error) {
    console.log("❌ Failed to write Excel file:", error);
  }
}

export function getQuotePageByTestCase(
  filepath: string,
  sheetName: string
): Record<string, Record<string, string |number | null>[]>{
  const absolutePath = path.resolve(__dirname, filepath);
  const workbook = xlsx.readFile(absolutePath);
  const sheet = workbook.Sheets[sheetName];

  // Legacy/default parser behavior (kept for non-coverage consumers)
  const rawData = xlsx.utils.sheet_to_json<Record<string, string | number | null>>(sheet, {
    range: 2,
    defval: null,
  });

  const grouped: Record<string, Record<string, string | number | null>[]> = {};
  let currentTestCase = '';

  for (const row of rawData) {
    const testCase = row['TEST#'];
    if (testCase !== null && testCase !== undefined && testCase !== '') {
      currentTestCase = testCase.toString();
    }

    if (!currentTestCase) continue;

    if (!grouped[currentTestCase]) {
      grouped[currentTestCase] = [];
    }
    grouped[currentTestCase].push(row);
   
  }

  return grouped;
}

// YT-only parser for quote sheets where duplicate display headers may exist.
// It keeps normal display headers unchanged and adds row-2 technical key suffix
// only when the same display header appears more than once.
export function getQuotePageByTestCaseYT(
  filepath: string,
  sheetName: string
): Record<string, Record<string, string | number | null>[]> {
  const absolutePath = path.resolve(__dirname, filepath);
  const workbook = xlsx.readFile(absolutePath);
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in ${filepath}`);
  }

  const matrix = xlsx.utils.sheet_to_json<any[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
  });

  // Header rows for YT quote layout:
  // row index 1: technical key, row index 2: display header
  const technicalHeaders = (matrix[1] || []).map((v: any) => String(v ?? "").trim());
  const displayHeaders = (matrix[2] || []).map((v: any) => String(v ?? "").trim());

  const duplicateCount: Record<string, number> = {};
  for (const label of displayHeaders) {
    if (!label) continue;
    duplicateCount[label] = (duplicateCount[label] || 0) + 1;
  }

  const seenCount: Record<string, number> = {};
  const normalizedHeaders: string[] = displayHeaders.map((display, idx) => {
    const displayLabel = String(display || "").trim();
    const techKey = String(technicalHeaders[idx] || "").trim();

    if (!displayLabel && !techKey) {
      return `COL_${idx}`;
    }

    if (!displayLabel) {
      return techKey || `COL_${idx}`;
    }

    // Non-duplicate header: keep as-is.
    if ((duplicateCount[displayLabel] || 0) <= 1) {
      return displayLabel;
    }

    // Duplicate header: first keeps plain label, later ones get technical-key suffix.
    seenCount[displayLabel] = (seenCount[displayLabel] || 0) + 1;
    if (seenCount[displayLabel] === 1) {
      return displayLabel;
    }

    return techKey ? `${displayLabel} [${techKey}]` : `${displayLabel} (${seenCount[displayLabel]})`;
  });

  const dataRows = matrix.slice(3);
  const rawData: Record<string, string | number | null>[] = dataRows.map((row: any[]) => {
    const obj: Record<string, string | number | null> = {};
    normalizedHeaders.forEach((key, idx) => {
      if (!key) return;
      obj[key] = row?.[idx] ?? null;
    });
    return obj;
  });

  const grouped: Record<string, Record<string, string | number | null>[]> = {};
  let currentTestCase = "";

  for (const row of rawData) {
    const testCase = row["TEST#"];
    if (testCase !== null && testCase !== undefined && testCase !== "") {
      currentTestCase = testCase.toString();
    }

    if (!currentTestCase) continue;

    if (!grouped[currentTestCase]) {
      grouped[currentTestCase] = [];
    }
    grouped[currentTestCase].push(row);
  }

  return grouped;
}

export function getDriversByTestCase(
  filepath: string,
  sheetName: string
): Record<string, Record<string, string>[]> {
  const absolutePath = path.resolve(__dirname, filepath);
  const workbook = xlsx.readFile(absolutePath);
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON rows
  const rawData = xlsx.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "", // Fill empty cells with empty string
  });

  // Group rows by TEST#
  const grouped: Record<string, Record<string, string>[]> = {};
  let currentTestCase = "";

  for (const row of rawData) {
    // If TEST# is present, update currentTestCase
    if (row["TEST#"]) {
      currentTestCase = row["TEST#"].toString();
    }

    // Initialize array if not already present
    if (!grouped[currentTestCase]) {
      grouped[currentTestCase] = [];
    }

    // Add the row to the current test case group
    grouped[currentTestCase].push(row);
  }

  return grouped;
}

/**
 * Returns a mapping of sheetName -> TEST# -> Submission row for each test case in summaryRecords.
 * Only includes rows where Transaction === 'Submission'.
 *
 * @param filePath - Path to the Excel file
 * @param summaryRecords - Array of summary records (from Summary sheet), each with TEST#
 * @returns Record<sheetName, Record<TEST#, SubmissionRow>>
 */
export function getSubmissionRowsDataRecCore(
  filePath: string,
  summaryRecords: any[]
): Record<string, Record<string, any>> {
  const workbook = xlsx.readFile(filePath);
  const submissionData: Record<string, Record<string, any>> = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    // Build a map of TEST# -> Submission row for this sheet
    const submissionRowsByTestNum: Record<string, any> = {};
    jsonData.forEach((row: any) => {
      if (row['Transaction'] === 'Submission') {
        const testNum = (row['TEST#'] || row['Test#'] || '').toString().trim();
        if (testNum) {
          submissionRowsByTestNum[testNum] = row;
        }
      }
    });

    // For each summary record, get the Submission row for its TEST#
    const sheetResult: Record<string, any> = {};
    summaryRecords.forEach(summary => {
      const testNum = (summary['TEST#'] || summary['Test#'] || '').toString().trim();
      if (!testNum) return;
      if (submissionRowsByTestNum[testNum]) {
        sheetResult[testNum] = submissionRowsByTestNum[testNum];
        // Print the data for the testcase being fetched
        console.log(`\n📄 ========== [${sheetName}] Submission Row for TEST# ${testNum} ==========`);
        console.log(JSON.stringify(submissionRowsByTestNum[testNum], null, 2));
        console.log(`========== End of TEST# ${testNum} Data ==========\n`);
      } else {
        // Optionally: log missing Submission row for this TEST#
        console.warn(`⚠️ [${sheetName}] No Submission row found for TEST# ${testNum}`);
        // sheetResult[testNum] = {};
      }
    });
    submissionData[sheetName] = sheetResult;
  });

  return submissionData;
}

// ---------------------------------------------------------------------------
// LEGACY: getSubmissionRowsDataCore (no summaryRecords, returns all Submission rows per sheet)
// ---------------------------------------------------------------------------
// export function getSubmissionRowsDataCore(filePath: string): Record<string, any[]> {
//   const workbook = xlsx.readFile(filePath);
//   const submissionData: Record<string, any[]> = {};
//
//   workbook.SheetNames.forEach(sheetName => {
//     const sheet = workbook.Sheets[sheetName];
//     const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: '' });
//
//     const filteredRows = jsonData.filter((row: any) => row['Transaction'] === 'Submission');
//     if (filteredRows.length > 0) {
//       submissionData[sheetName] = filteredRows;
//     }
//   });
//
//   return submissionData;
// }

//current script is down here 
export function getSubmissionRowsDataCore(filePath: string, 
  summaryRecords: any[]): Record<string, any> {
  const workbook = xlsx.readFile(filePath);
  const submissionData: Record<string, any> = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    // ✅ Index by TEST# instead of array index
    // This ensures policyInfoRecords["5"] returns the row for TEST#=5, regardless of filter
    submissionData[sheetName] = {};
    
    summaryRecords.forEach(summary => {
      const testNum = summary["TEST#"]?.toString() || summary["Test#"]?.toString() || '';
      if (!testNum) {
        // console.warn(`⚠️ No TEST# found in summary:`, summary);
        return;
      }
      
      const row = getRowForTestCase(jsonData, testNum, sheetName);
      if (!row) {
        // console.warn(`❌ No row found for TEST# ${testNum} in sheet '${sheetName}'.`);
        submissionData[sheetName][testNum] = {};
      } else {
        submissionData[sheetName][testNum] = row;
      }
    });
  });
  return submissionData;
}

// export function BT_readQuotePageDataGrouped(filepath: string, sheetName: string): any {
//   const absolutePath = path.resolve(__dirname, filepath);
//   const workbook = xlsx.readFile(absolutePath);
//   const sheet = workbook.Sheets[sheetName];

//   const rawData: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

//   const headerRow1 = rawData[0]; // Vehicle grouping
//   const headerRow2 = rawData[1]; // UI names
//   const dataRows = rawData.slice(2);

//   // Assuming one test case per row
//   const record: any = {};

//   headerRow1.forEach((vehicle: string, i: number) => {
//     const uiName = headerRow2[i] || "";
//     if (!record[vehicle]) record[vehicle] = {};
//     record[vehicle][uiName] = dataRows[0][i] || ""; // First data row
//   });

//   return record;
// }


export interface RuleMatrixRow {
  [key: string]: string | number | null;
}

export function getQuotePageByTestCase_SingleRow(
  filepath: string,
  sheetName: string
): Record<string, Record<string, string | number | null>> {
  const absolutePath = path.resolve(__dirname, filepath);
  const workbook = xlsx.readFile(absolutePath);
  const sheet = workbook.Sheets[sheetName];
 
  // ✅ Add error handling for missing sheet
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in ${filepath}`);
  }
 
  console.log(`🔍 Processing sheet: "${sheetName}" for single-row test cases`);
 
  // ✅ Convert sheet to JSON starting from row 3 (index 2) - no merged cells handling
  const rawData = xlsx.utils.sheet_to_json<Record<string, string | number | null>>(sheet, {
    range: 2, // Start from row 3 (index 2)
    defval: null,
  });
 
  if (rawData.length === 0) {
    console.warn(`⚠️ No data found in sheet "${sheetName}" starting from row 3`);
    return {};
  }
 
  console.log(`📊 Found ${rawData.length} data rows starting from row 3`);
  console.log(`📋 Sample data row:`, rawData[0]);
 
  const grouped: Record<string, Record<string, string | number | null>> = {};
  let processedRows = 0;
  let skippedRows = 0;
 
  for (const row of rawData) {
    // ✅ Enhanced TEST# detection with multiple column name variations
    const testCaseVariations = [
      row['TEST#'],
      row['Test#'],
      row['TEST_#'],
      row['Test_#'],
      row['TestNumber'],
      row['TC#'],
      row['TC'],
      row['Test Case'],
      row['TestCase']
    ];
   
    const testCaseValue = testCaseVariations.find(val =>
      val !== null && val !== undefined && val !== ''
    );
   
    if (testCaseValue === null || testCaseValue === undefined || testCaseValue === '') {
      skippedRows++;
      console.log(`⚠️ Skipping row with no valid TEST# value`);
      continue;
    }
 
    const testCaseKey = testCaseValue.toString();
   
    // ✅ Clean the row data - remove null/empty values and TEST# columns
    const cleanRow: Record<string, string | number | null> = {};
    for (const [key, value] of Object.entries(row)) {
      // Skip TEST# columns and null/empty values
      if (!key.toLowerCase().includes('test') &&
          value !== null &&
          value !== undefined &&
          value !== '') {
        cleanRow[key] = value;
      }
    }
   
    // ✅ Store as single object (not array) - each test case gets one data object
    if (Object.keys(cleanRow).length > 0) {
      grouped[testCaseKey] = cleanRow; // Single object, not array
      processedRows++;
      console.log(`✅ Added single-row data for test ${testCaseKey}:`, Object.keys(cleanRow));
    } else {
      console.log(`⚠️ Skipping test case ${testCaseKey} - no meaningful data after cleaning`);
    }
  }
 
  // ✅ Enhanced logging for debugging
  console.log(`✅ Single-row processing complete:`);
  console.log(`   - Total rows processed: ${processedRows}`);
  console.log(`   - Rows skipped (no test case or data): ${skippedRows}`);
  console.log(`   - Test cases found: ${Object.keys(grouped).length}`);
  console.log(`   - Test case numbers: [${Object.keys(grouped).join(', ')}]`);
 
  // ✅ Show sample data for first test case
  if (Object.keys(grouped).length > 0) {
    const firstTestCase = Object.keys(grouped)[0];
    console.log(`📋 Sample single-row data for test ${firstTestCase}:`, grouped[firstTestCase]);
  }
 
  return grouped;
}

export function getRuleMatrixByTestCase(
  filepath: string,
  sheetName: string
): Record<string, Record<string, RuleMatrixRow>> {
  const absolutePath = path.resolve(__dirname, filepath);
  const workbook = xlsx.readFile(absolutePath);
  const sheet = workbook.Sheets[sheetName];

  const rawData = xlsx.utils.sheet_to_json<RuleMatrixRow>(sheet, {
    range: 1, // Skip header row
    defval: null,
  });

  const grouped: Record<string, Record<string, RuleMatrixRow>> = {};
  let currentTestCase = '';

  for (const row of rawData) {
    const testCase = row['TEST#'];
    if (testCase !== null && testCase !== undefined && testCase !== '') {
      currentTestCase = testCase.toString();
    }

    if (!currentTestCase) continue;

    const ruleName = row['Rule']?.toString() || '';
    if (!ruleName) continue;

    if (!grouped[currentTestCase]) {
      grouped[currentTestCase] = {};
    }

    grouped[currentTestCase][ruleName] = row;
  }

  return grouped;
}

// ============================================================================
// 🎯 GENERIC ERROR HANDLING FUNCTIONS FOR EXCEL REPORTING
// ============================================================================
// These functions help build standardized, detailed error messages for Excel
// Can be used across all spec files (GPA, BT, YT) for consistent reporting
// ============================================================================
 
/**
 * Extracts a clean, specific UW issue name from UW descriptions
 * Recognizes 15+ common UW issue patterns and returns a readable name
 *
 * @param uwiDescriptions - Array of UW issue descriptions from UI
 * @param preferredIndex - Which description to extract from (default: 0 = first)
 * @returns Clean UW issue name (e.g., "Storm Mitigation Discount")
 *
 * @example
 * const uwi = ["Storm Mitigation Discount - Missing documentation"];
 * extractSpecificUWIssue(uwi); // Returns: "Storm Mitigation Discount"
 */
export function extractSpecificUWIssue(
  uwiDescriptions: string[] | undefined,
  preferredIndex: number = 0
): string {
  if (!uwiDescriptions || uwiDescriptions.length === 0) {
    return "Unknown UW Issue";
  }
 
  const firstIssue = uwiDescriptions[preferredIndex] || uwiDescriptions[0];
  const lower = firstIssue.toLowerCase();
 
  // ✅ Recognize common UW issue patterns
  if (lower.includes("storm mitigation discount")) return "Storm Mitigation Discount";
  if (lower.includes("fortified")) return "Fortified Standards Certification";
  if (lower.includes("age of home") || lower.includes("home age")) return "Age of Home";
  if (lower.includes("construction type") || lower.includes("frame type")) return "Construction Type";
  if (lower.includes("roof")) return "Roof Related Issue";
  if (lower.includes("location") || lower.includes("territory")) return "Location Related Issue";
  if (lower.includes("wind mitigation")) return "Wind Mitigation";
  if (lower.includes("opening protection")) return "Opening Protection";
  if (lower.includes("secondary water resistance")) return "Secondary Water Resistance";
  if (lower.includes("roof deck attachment")) return "Roof Deck Attachment";
  if (lower.includes("roof to wall connection")) return "Roof to Wall Connection";
  if (lower.includes("loss history")) return "Loss History";
  if (lower.includes("claims") || lower.includes("prior loss")) return "Prior Claims/Loss";
  if (lower.includes("occupancy")) return "Occupancy Type";
  if (lower.includes("coverage") || lower.includes("limit")) return "Coverage/Limit Issue";
 
  // ✅ Fallback: Extract first 4 words as issue name
  const words = firstIssue.split(' ').slice(0, 4);
  return words.join(' ') + (firstIssue.split(' ').length > 4 ? '...' : '');
}
 
/**
 * Builds a standardized failure status message for Excel reporting
 * Format: "FAIL - {Page} - {Field/Element} - {Error Type}"
 *
 * @param pageName - Name of the page where error occurred (e.g., "Risk Analysis Page", "Property")
 * @param fieldOrElement - Optional field/element name (e.g., "Roof Type Dropdown", "Submit Button")
 * @param errorType - Optional error type (e.g., "Timeout", "Element not found")
 * @param prefix - Optional prefix (default: "FAIL")
 * @returns Formatted status string for Excel
 *
 * @example
 * buildFailureStatus("Property", "Roof Type Dropdown", "Timeout");
 * // Returns: "FAIL - Property - Roof Type Dropdown - Timeout"
 */
export function buildFailureStatus(
  pageName: string,
  fieldOrElement?: string,
  errorType?: string,
  prefix: string = "FAIL"
): string {
  const parts = [prefix, pageName];
 
  if (fieldOrElement) {
    parts.push(fieldOrElement);
  }
 
  if (errorType) {
    parts.push(errorType);
  }
   const result = parts.join(" - ");
  // ✅ Truncate if too long (Excel cell limit considerations)
  return result.length > 200 ? result.substring(0, 197) + "..." : result;
}

export function buildFailureStatusREC(
  pageName: string,
  fieldOrElement?: string,
  errorType?: string
): string {
  const parts = ["FAIL", pageName];  // 🎯 FIX: Add "FAIL" prefix
 
  if (fieldOrElement) {
    parts.push(fieldOrElement);
  }
 
  if (errorType) {
    parts.push(errorType);
  }
 
  const result = parts.join(" - ");
  // ✅ Truncate if too long (Excel cell limit considerations)
  return result.length > 200 ? result.substring(0, 197) + "..." : result;
}
/**
 * Specialized function for building UW validation failure messages
 * Automatically extracts UW issue name and formats for Excel
 *
 * @param pageName - Name of the page (typically "Risk Analysis Page")
 * @param uwiDescriptions - Array of UW issue descriptions from UI
 * @param errorType - Optional error type (default: "UW wording doesn't match")
 * @returns Formatted UW failure status for Excel
 *
 * @example
 * const uwi = ["Storm Mitigation Discount - Documentation required"];
 * buildUWFailureStatus("Risk Analysis Page", uwi);
 * // Returns: "FAIL - Risk Analysis Page - Storm Mitigation Discount UW - UW wording doesn't match"
 */
export function buildUWFailureStatus(
  pageName: string,
  uwiDescriptions: string[] | undefined,
  errorType: string = "UW wording doesn't match"
): string {
  return buildFailureStatus(pageName, errorType);
}
 
/**
 * Extracts field/element name from error descriptions or selectors
 * Recognizes Playwright locator patterns and page-specific field names
 * Automatically adds appropriate suffix (Dropdown/Field/Button)
 *
 * @param errorDescription - Error message or description containing selector info
 * @param pageName - Optional page name for context-aware extraction
 * @returns Clean field name with appropriate suffix
 *
 * @example
 * extractFieldNameFromError("locator('select[placeholder=\"Roof Type\"]') timeout");
 * // Returns: "Roof Type Dropdown"
 *
 * extractFieldNameFromError("Cannot find element with text 'Submit'");
 * // Returns: "Submit Button"
 */
export function extractFieldNameFromError(
  errorDescription: string,
  pageName?: string,
  testInfo?: any
): string {
  // ✅ Add debug logging to see what we're working with
  console.log(`🔍 Extracting field from error: "${errorDescription.substring(0, 200)}"`);
  console.log(`🔍 Page context: "${pageName}"`);
   // ✅ PRIORITY 0: Question Text Mapper errors - return empty string since error type has full details
  if (errorDescription.includes("not found in UI for screen") || 
      errorDescription.includes("not found in Excel for screen")) {
    console.log(`✅ Question Text Mapper error detected - returning empty field name`);
    return "";
  }
 
  let fieldName = "";
 
  // ✅ NEW PRIORITY 0: Check for "No data provided" errors - Extract field from context
  if (errorDescription.includes("No data provided") || errorDescription.includes("test case generator") ||
      errorDescription.includes("expected string, got undefined") || errorDescription.includes("locator.fill")) {
    // Try to extract from stack trace which field had no data
    if (testInfo?.error?.stack || testInfo?.errors?.[0]?.stack) {
      const stack = testInfo?.error?.stack || testInfo?.errors?.[0]?.stack || '';
      console.log(`🔍 Stack trace for no-data error: ${stack.substring(0, 800)}`);
     
      // ✅ PRIORITY 1: Try getter functions first (getFirstName, getLastName, getCity, etc.)
      // Look for the FIRST occurrence of get* function (closest to error)
      const getterMatches = stack.matchAll(/\bget([A-Z]\w+)\(/g);
      const getterArray = Array.from(getterMatches);
     
      if (getterArray.length > 0) {
        // Get the first getter (closest to error line)
        const firstGetter = getterArray[0] as RegExpMatchArray;
        let fieldNameFromGetter = firstGetter[1];
       
        // ✅ Clean up common suffixes from getter names
        fieldNameFromGetter = fieldNameFromGetter
          .replace(/Dropdown$/i, '')
          .replace(/Field$/i, '')
          .replace(/Button$/i, '')
          .replace(/Input$/i, '');
       
        // Convert camelCase to Title Case
        fieldName = fieldNameFromGetter
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .split(' ')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
       
        console.log(`✅ Extracted field from getter function: get${firstGetter[1]}() → "${fieldName}"`);
        return fieldName + " Field/Option";
      }
     
      // ✅ PRIORITY 2: Look for Excel field access patterns like AccountDetails["First_Name"]
      const excelFieldMatch = stack.match(/\["([^"]+)"\]/);
      if (excelFieldMatch && excelFieldMatch[1]) {
        fieldName = excelFieldMatch[1]
          .replace(/_/g, ' ') // Replace underscores with spaces
          .split(' ')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        console.log(`✅ Extracted field from Excel accessor: ["${excelFieldMatch[1]}"] → "${fieldName}"`);
        return fieldName + " Field/Option";
      }
     
      // ✅ PRIORITY 3: Look for method calls like searchAccountDetails, fillFirstName, etc.
      const methodPatterns = [
        /at.*\.(search|enter|fill|select|set|input)([A-Z]\w+)/i,  // "at searchAccountDetails"
        /Object\.(search|enter|fill|select|set|input)([A-Z]\w+)/i, // "at Object.searchAccountDetails"
      ];
     
      for (const pattern of methodPatterns) {
        const match = stack.match(pattern);
        if (match && match[2]) {
          const methodName = match[2]; // Get the part after search/enter/fill
          // Convert camelCase to Title Case
          fieldName = methodName
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
          console.log(`✅ Extracted field from method name: "${fieldName}"`);
          return fieldName + " Field/Option";
        }
      }
    }
   
    // ✅ PRIORITY 3: Check error message for field hints
    const fieldHints = [
      { pattern: /first\s*name/i, name: "First Name" },
      { pattern: /last\s*name/i, name: "Last Name" },
      { pattern: /address/i, name: "Address" },
      { pattern: /city/i, name: "City" },
      { pattern: /state/i, name: "State" },
      { pattern: /zip/i, name: "Zip Code" },
      { pattern: /email/i, name: "Email" },
      { pattern: /phone/i, name: "Phone" },
      { pattern: /producer/i, name: "Producer" },
      { pattern: /product/i, name: "Product" },
    ];
   
    for (const hint of fieldHints) {
      if (errorDescription.match(hint.pattern)) {
        console.log(`✅ Extracted field from error hint: "${hint.name}"`);
        return hint.name + " Field/Option";
      }
    }
  }
 
  // ✅ REMOVED Strategy 0 - Don't extract from stack trace as it gives technical function names
  // like "toString", "fill", "click" which are not helpful for Excel reporting
 
  // ✅ NEW PRIORITY: Strategy 0.5 - Extract from Playwright role-based selectors (getByRole)
  // Examples: "waiting for getByRole('button', { name: 'Continue quote' })"
  //           "waiting for getByRole('button', { name: 'Calculate' })"
  const roleBasedMatch = errorDescription.match(/getByRole\(['"](.*?)['"],\s*{\s*name:\s*['"](.*?)['"]/i);
  if (roleBasedMatch && roleBasedMatch[2]) {
    const elementRole = roleBasedMatch[1];  // 'button', 'textbox', 'combobox', etc.
    const elementName = roleBasedMatch[2];  // 'Continue quote', 'Calculate', etc.
   
    fieldName = elementName.trim();
    console.log(`✅ Extracted from getByRole: role="${elementRole}", name="${fieldName}"`);
   
    // Add appropriate suffix based on role
    const roleLower = elementRole.toLowerCase();
    if (roleLower === 'button' && !fieldName.toLowerCase().includes('button')) {
      fieldName = `${fieldName} Button`;
    } else if ((roleLower === 'combobox' || roleLower === 'listbox') && !fieldName.toLowerCase().includes('dropdown')) {
      fieldName = `${fieldName} Dropdown`;
    } else if (roleLower === 'textbox' && !fieldName.toLowerCase().includes('field')) {
      fieldName = `${fieldName} Field`;
    } else if (roleLower === 'checkbox' && !fieldName.toLowerCase().includes('checkbox')) {
      fieldName = `${fieldName} Checkbox`;
    } else if (roleLower === 'link' && !fieldName.toLowerCase().includes('link')) {
      fieldName = `${fieldName} Link`;
    }
   
    console.log(`✅ Final field name from getByRole: "${fieldName}"`);
    return fieldName;  // ✅ Return immediately when found
  }
 
  // ✅ Strategy 1: Extract from Playwright locator/selector patterns (XPath-based)
  // CRITICAL: Only use "waiting for locator" line - it has the COMPLETE selector
  let waitingForMatchResult: RegExpMatchArray | null = null;
  if (!fieldName) {
    const waitingForMatch = errorDescription.match(/waiting for locator\(['"](.*?)['"][),]/i);
    waitingForMatchResult = waitingForMatch;  // Store for later use
   
    if (waitingForMatch && waitingForMatch[1]) {
      let selector = waitingForMatch[1];
      console.log(`🔍 Complete selector from 'waiting for': "${selector.substring(0, 150)}"`);
     
      // Clean up escaped characters
      selector = selector.replace(/\\\\/g, '\\').replace(/\\'/g, "'").replace(/\\"/g, '"');
       // ✅ NEW PRIORITY: Extract specific label/question text from XPath
      const labelPatterns = [
        /contains\(@label,\s*['"](.*?)['"]\)/i,  // @label contains
        /@label\s*=\s*['"](.*?)['"]/i,           // @label=
        /\[@label=['"](.*?)['"]\]/i,              // [@label='...']
      ];
     
      for (const pattern of labelPatterns) {
        const labelMatch = selector.match(pattern);
        if (labelMatch && labelMatch[1]) {
          fieldName = labelMatch[1].trim();
          console.log(`✅ Extracted from @label: "${fieldName}"`);
         
          // Clean up common suffixes
          fieldName = fieldName
            .replace(/\s*\*\s*$/,'')  // Remove * at end
            .replace(/\s*\?$/,'')     // Remove ? at end
            .trim();

          // 🎯 NEW: Detect radio button from class attributes
          if (selector.includes('gw-radios-binary') || selector.includes('@title1=')) {
            fieldName = fieldName + " Radio Button";
            console.log(`✅ Detected radio button: "${fieldName}"`);
          }
         
          break;
        }
      }
   
    // ✅ Strategy 1A: Extract from text() in XPath
    if (!fieldName) {
      let textMatch = selector.match(/text\(\)\s*=\s*['"](.*?)['"]/i);
      if (textMatch && textMatch[1]) {
        fieldName = textMatch[1].trim();
        console.log(`✅ Extracted element text: "${fieldName}"`);
      }
    }
   
    // ✅ NEW: Extract context from XPath structure (parent labels)
    // Example: //span[text()='Settlement Option']/parent::label/parent::div//select
    if (!fieldName) {
      const parentLabelMatch = selector.match(/span\[text\(\)\s*=\s*['"](.*?)['"].*?parent/i);
      if (parentLabelMatch && parentLabelMatch[1]) {
        fieldName = parentLabelMatch[1].trim();
        console.log(`✅ Extracted from parent label structure: "${fieldName}"`);
      }
    }
   
    // ✅ NEW: Extract from "Dwelling Limit", "Year Built", etc. common field patterns
    if (!fieldName) {
      const commonFieldPatterns = [
        /Dwelling\s+Limit/i,
        /Year\s+Built/i,
        /Roof\s+Type/i,
        /Construction\s+Type/i,
        /Number\s+of\s+Stories/i,
        /Square\s+Feet/i,
        /Distance\s+to\s+Fire/i,
        /Protection\s+Class/i,
        /Territory/i,
        /Valuation\s+Type/i,
        /Settlement\s+Option/i,
        /Deductible/i,
        /Premium/i,
      ];
     
      for (const pattern of commonFieldPatterns) {
        const match = selector.match(pattern);
        if (match) {
          fieldName = match[0];
          console.log(`✅ Extracted common field pattern: "${fieldName}"`);
          break;
        }
      }
    }
     // ✅ Strategy 1B: Extract from ng-model, ng-click, or Angular attributes
    if (!fieldName) {      // 🎯 NEW: Check for common dropdown attribute patterns first
      const commonDropdownPatterns = [
        { pattern: /maritalStatusOptions/i, name: "Marital Status" },
        { pattern: /genderOptions/i, name: "Gender" },
        { pattern: /stateOptions/i, name: "State" },
        { pattern: /countryOptions/i, name: "Country" },
        { pattern: /licenseStateOptions/i, name: "License State" },
        { pattern: /relationshipOptions/i, name: "Relationship" },
        { pattern: /territoryOptions/i, name: "Territory" },
        { pattern: /roofTypeOptions/i, name: "Roof Type" },
        { pattern: /constructionTypeOptions/i, name: "Construction Type" },
        { pattern: /productOptions/i, name: "Product" },
        { pattern: /policyTypeOptions/i, name: "Policy Type" },
      ];
      
      for (const pattern of commonDropdownPatterns) {
        if (selector.match(pattern.pattern)) {
          fieldName = pattern.name;
          console.log(`✅ Extracted from common dropdown pattern: "${fieldName}"`);
          break;
        }
      }
      
      // ✅ NEW: Support both XPath and CSS selector formats for ng-model
      if (!fieldName) {
        const ngModelMatch = selector.match(/ng-model\s*=\s*['"](.*?)['"]/i);
        const ngClickMatch = selector.match(/ng-click\s*=\s*['"](.*?)['"]/i);
       
        if (ngModelMatch && ngModelMatch[1]) {
          // Clean up Angular model names
          let modelPath = ngModelMatch[1];
          console.log(`🔍 Found ng-model path: "${modelPath}"`);
         
          // Extract the meaningful part from the path
          // Examples:
          // "view.paymentsInformation.billingType.value" → "billingType"
          // "vm.dwellingLimit.value" → "dwellingLimit"
          // "ctrl.settlementOption.value" → "settlementOption"
         
          // Split by dots and find the meaningful field name
          const parts = modelPath.split('.');
          let fieldNamePart = '';
         
          // Find the second-to-last part (before "value"), or last part if no "value"
          if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === 'value') {
            fieldNamePart = parts[parts.length - 2]; // Get part before "value"
          } else if (parts.length >= 1) {
            fieldNamePart = parts[parts.length - 1]; // Get last part
          }
         
          // Clean up common prefixes
          fieldNamePart = fieldNamePart
            .replace(/^(vm|ctrl|view|model|data)\./i, '') // Remove common prefixes
            .replace(/^(vm|ctrl|view|model|data)$/i, '') // Remove if it's just the prefix
            .trim();
         
          // If we got a meaningful name, convert camelCase to readable format
          if (fieldNamePart && fieldNamePart.length > 1 && fieldNamePart.toLowerCase() !== 'value') {
            fieldName = fieldNamePart
              .replace(/([A-Z])/g, ' $1') // Add space before capitals
              .trim();
            fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
            console.log(`✅ Extracted from ng-model: "${fieldName}"`);
          } else {
            console.log(`⚠️ Could not extract meaningful name from ng-model: "${modelPath}"`);
          }
        } else if (ngClickMatch && ngClickMatch[1]) {
          const clickName = ngClickMatch[1]
            .replace(/\(.*\)/, '') // Remove function parameters
            .replace(/([A-Z])/g, ' $1')
            .trim();
          fieldName = clickName.charAt(0).toUpperCase() + clickName.slice(1);
          console.log(`✅ Extracted from ng-click: "${fieldName}"`);
        }
      }
    }    // ✅ Strategy 1C: Extract from placeholder
    if (!fieldName) {
      const placeholderMatch = selector.match(/placeholder\s*=\s*['"](.*?)['"]/i);
      if (placeholderMatch && placeholderMatch[1]) {
        let rawPlaceholder = placeholderMatch[1];
        console.log(`🔍 Raw placeholder found: "${rawPlaceholder}"`);
        
        // Clean up placeholder text step by step
        fieldName = rawPlaceholder
          .replace(/^--\s*/i, '')        // Remove leading --
          .replace(/\s*--$/i, '')        // Remove trailing --
          .replace(/^Choose\s+/i, '')    // Remove "Choose " at start
          .replace(/^Select\s+/i, '')    // Remove "Select " at start
          .replace(/Please\s+Select\s*/i, '') // Remove "Please Select"
          .trim();
        
        console.log(`✅ Cleaned placeholder: "${fieldName}"`);
        
        // 🎯 NEW: Handle specific field patterns
        const fieldLower = fieldName.toLowerCase();
        
        if (fieldLower === 'marital status' || fieldLower === 'marital') {
          fieldName = 'Marital Status';
        } else if (fieldLower === 'license state' || fieldLower.includes('license state')) {
          fieldName = 'License State';
        } else if (fieldLower === 'policy type' || fieldLower.includes('policy type')) {
          fieldName = 'Policy Type';
        }
        
        console.log(`✅ Final placeholder field name: "${fieldName}"`);
        
        if (fieldName) {
          console.log(`✅ Extracted from placeholder: "${fieldName}"`);
        }
      }
    }
   
    // ✅ Strategy 1D: Extract from aria-label or title
    if (!fieldName) {
      const ariaMatch = selector.match(/(?:aria-label|title)\s*=\s*['"](.*?)['"]/i);
      if (ariaMatch && ariaMatch[1]) {
        fieldName = ariaMatch[1].trim();
        console.log(`✅ Extracted from aria-label/title: "${fieldName}"`);
      }
    }
   
    // ✅ Strategy 1E: Extract from ID
    if (!fieldName) {
      const idMatch = selector.match(/id\s*=\s*['"](.*?)['"]/i) || selector.match(/#([\w-]+)/);
      if (idMatch && idMatch[1]) {
        fieldName = idMatch[1]
          .replace(/_/g, ' ')
          .replace(/DV|Ext|ID|_id|_input|_button|_dropdown|Btn|Drp/gi, '')
          .replace(/([A-Z])/g, ' $1')
          .trim();
        console.log(`✅ Extracted from ID: "${fieldName}"`);
      }
    }     // ✅ Strategy 1F: DON'T use generic element type unless no field name found
    // Only use this as absolute fallback - placeholder should take priority
    if (!fieldName) {
      // Extract element from start of XPath  
      const elementMatch = selector.match(/^\/\/(\w+)\[/);
      if (elementMatch && elementMatch[1]) {
        const elementMap: Record<string, string> = {
          'div': 'Element',
          'span': 'Element',
          'a': 'Link',
          'button': 'Button', 
          'input': 'Field',
          'select': 'Dropdown',
          'textarea': 'Text Area',
          'img': 'Image'
        };

        fieldName = elementMap[elementMatch[1].toLowerCase()] || 'Element';
        console.log(`✅ Using generic element type from XPath: "${fieldName}"`);
      }
    }
    }  // ✅ Close the "if (waitingForMatch && waitingForMatch[1])" block
  }  // ✅ Close the "if (!fieldName)" block
 
  // ✅ If we successfully extracted from "waiting for locator", skip other strategies
  if (fieldName) {
    console.log(`✅ SUCCESS: Using fieldName from XPath selector: "${fieldName}"`);
  } else {
    console.log(`⚠️ WARNING: Could not extract from selectors, trying fallback...`);
  }
 
  // ✅ Strategy 1.5: Page-specific element detection
  if (!fieldName && pageName) {
    const pageUpper = (pageName || '').toUpperCase();
    const descLower = errorDescription.toLowerCase();
   
    // Check for page-specific patterns in error description
    if (pageUpper.includes("RISK") || pageUpper.includes("ANALYSIS")) {
      if (descLower.includes('approve') || descLower.includes('//a[')) {
        fieldName = "Approve UW Issue Checkbox";
        console.log(`✅ Inferred from page context: "${fieldName}"`);
      }
    }
   
    if (pageUpper.includes("ISSUANCE")) {
      if (descLower.includes('bind')) {
        fieldName = "Bind Button";
        console.log(`✅ Inferred from page context: "${fieldName}"`);
      }
    }
  }
 
  // ✅ Strategy 2: Extract from error message text
  if (!fieldName) {
    // ✅ NEW: Check for validation error patterns specific to min/max
    // Example: "Dwelling #1: Dwelling Limit is above the maximum acceptable value"
    const validationPatterns = [
      /Dwelling #\d+:\s*([^:]+?)\s+is (?:above|below)/i,  // "Dwelling #1: Dwelling Limit is above..."
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is (?:above|below|required)/i,  // "Dwelling Limit is above..."
      /Field\s+'([^']+)'/i,  // "Field 'Dwelling Limit'"
      /element\s+'([^']+)'/i,  // "element 'Dwelling Limit'"
    ];
   
    for (const pattern of validationPatterns) {
      const validMatch = errorDescription.match(pattern);
      if (validMatch && validMatch[1]) {
        fieldName = validMatch[1].trim();
        console.log(`✅ Extracted from validation error pattern: "${fieldName}"`);
        break;
      }
    }
   
    // Look for quoted text that might be element text (if validation patterns didn't work)
    if (!fieldName) {
      const quotedTextMatch = errorDescription.match(/['"]([^'"]{3,50})['"]/);
      if (quotedTextMatch && quotedTextMatch[1]) {
        const quotedText = quotedTextMatch[1];
        // ✅ ENHANCED: Filter out technical terms, CSS selectors, and XPath syntax
        if (!quotedText.includes('locator') &&
            !quotedText.includes('selector') &&
            !quotedText.includes('ng-model') &&      // ✅ NEW: Skip ng-model syntax
            !quotedText.includes('ng-click') &&      // ✅ NEW: Skip ng-click syntax
            !quotedText.includes('[@') &&            // ✅ NEW: Skip XPath attribute syntax
            !quotedText.startsWith('[') &&           // ✅ NEW: Skip CSS selector brackets
            !quotedText.includes('//') &&            // ✅ NEW: Skip XPath slashes
            !quotedText.match(/^[a-f0-9-]+$/i)) {    // Not a UUID or hex
          fieldName = quotedText;
          console.log(`✅ Extracted from quoted text: "${fieldName}"`);
        } else {
          console.log(`⚠️ Skipped technical quoted text: "${quotedText}"`);
        }
      }
    }
  }   // ✅ Strategy 3: Add appropriate suffix based on field type - SIMPLIFIED
  if (fieldName) {
    const fieldLower = fieldName.toLowerCase();
 
    // 🎯 FIX: Don't add suffix if field already IS the element type
    if (fieldLower === "dropdown" ||
        fieldLower === "button" || 
        fieldLower === "field" ||
        fieldLower === "checkbox" ||
        fieldLower === "element" ||
        fieldLower === "link" ||
        fieldLower === "text area" ||
        fieldLower.endsWith("dropdown") ||
        fieldLower.endsWith("button") ||
        fieldLower.endsWith("field") ||
        fieldLower.endsWith("checkbox") ||
        fieldLower.endsWith("?")) {  // Questions end with ?
      return fieldName;  // 🎯 Return as-is, no suffix needed
    }
 
    // ✅ Detect from error description and selector for complex field names
    const descLower = errorDescription.toLowerCase();
    const selectorLower = waitingForMatchResult ? waitingForMatchResult[1].toLowerCase() : '';
 
    // Check if it's a dropdown/select - Combine field name with type
    if (descLower.includes("<select") ||
        descLower.includes("select[") ||
        selectorLower.includes("select") ||
        selectorLower.includes("dropdown") ||
        selectorLower.includes("combobox")) {
      return `${fieldName} Dropdown`;  // 🎯 FIX: Combine field name + type
    }
 
    // Check if it's a button - Combine field name with type
    else if (descLower.includes("<button") ||
             descLower.includes("button[") ||
             selectorLower.includes("button") ||
             selectorLower.includes("@ng-click")) {
      return `${fieldName} Button`;  // 🎯 FIX: Combine field name + type
    }
 
    // Check if it's a checkbox/radio - Combine field name with type
    else if (selectorLower.includes("checkbox") ||
             selectorLower.includes("radio") ||
             descLower.includes("checkbox") ||
             descLower.includes("radio")) {
      return `${fieldName} Checkbox`;  // 🎯 FIX: Combine field name + type
    }
 
    // Check if it's an input field - Combine field name with type
    else if (descLower.includes("<input") ||
             descLower.includes("input[") ||
             selectorLower.includes("input[")) {
      return `${fieldName} Field`;  // 🎯 FIX: Combine field name + type
    }
 
    // Default: If we can't determine, return the field name with suffix
    return `${fieldName} Field`;
  }
   // ✅ Final fallback: If we have page context but no field name, provide more context
  if (!fieldName && pageName && pageName !== "Unknown Page") {
    // Check if error mentions any generic element type
    const descLower = errorDescription.toLowerCase();
    if (descLower.includes("button")) return "Button";
    if (descLower.includes("input") || descLower.includes("field")) return "Field";
    if (descLower.includes("select") || descLower.includes("dropdown")) return "Dropdown";
    if (descLower.includes("checkbox")) return "Checkbox";
    if (descLower.includes("radio")) return "Radio Button";
    if (descLower.includes("link") || descLower.includes("anchor")) return "Link";
    if (descLower.includes("text") || descLower.includes("label")) return "Text";
   
    // 🎯 NEW: Check for specific UI element errors
    if (descLower.includes("not found") || descLower.includes("element not found")) {
      return "Missing Element";
    }
   
    if (descLower.includes("timeout") || descLower.includes("exceeded")) {
      return "Timeout Element";
    }
   
    // If still no match, return page-specific generic element
    return "Unknown Element";
  }
 
  // ✅ Final fallback: Return generic name
  return "Unknown Element";
}
 
/**
 * Categorizes error type from error description with detailed, human-readable explanations
 * Provides context about WHY the error occurred and WHAT to check
 *
 * @param errorDescription - Full error message/description
 * @param fieldName - Optional field name for more specific error context
 * @returns Human-readable, detailed error explanation
 *
 * @example
 * categorizeErrorType("Timeout 30000ms exceeded", "State Dropdown");
 * // Returns: "Timeout waiting for State Dropdown - Element may not exist or page loading issue"
 *
 * categorizeErrorType("No data provided in Test case generator");
 * // Returns: "No data in Excel - Check First Name field has valid data in test case"
 */
export function categorizeErrorType(errorDescription: string, fieldName?: string): string {
  const cleanError = errorDescription
    .replace(/Error:/gi, "")
    .replace(/locator\.[^:]+:/gi, "")
    .replace(/Call log:.*$/gi, "")
    .replace(/\[2m.*?\[22m/g, "") // Remove ANSI codes
    .replace(/waiting for locator.*$/i, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
   
 
  const lower = cleanError.toLowerCase();
    // ✅ HIGHEST PRIORITY: Question Text Mapper errors
  // Pattern: "⚠️ Question "..." not found in UI for screen 'ScreenName'"
  const questionMapperUIMatch = cleanError.match(/not found in UI for screen\s*['"]([^'"]+)['"]/i);
  if (questionMapperUIMatch) {
    return "New question occurred";
  }
  
  // Pattern: "❌ Question code '...' not found in Excel for screen '...'"
  const questionMapperExcelMatch = cleanError.match(/Question code\s*['"]([^'"]+)['"]\s*not found in Excel for screen\s*['"]([^'"]+)['"]/i);
  if (questionMapperExcelMatch) {
    const questionCode = questionMapperExcelMatch[1];
    return `Question code "${questionCode}" missing from Excel`;
  }
 
  // ✅ Null/undefined reference errors
  // ✅ No data / Missing Excel data errors
  if (lower.includes("no data provided") ||
      lower.includes("test case generator") ||
      lower.includes("missing data") ||
      lower.includes("cannot read property") ||
      lower.includes("undefined") ||
      lower.includes("null") ||
      lower.includes("required") && !lower.includes("property") ||
      lower.includes("undefined") && lower.includes("excel")) {
    return "No data is provided in Testcase Generator";
  }  // ✅ Dropdown/Select mismatch errors & "did not find some options"
  if (lower.includes("'TimeoutError: locator.selectOption:") ||
      lower.includes("option not found") ||
      lower.includes("dropdown mismatch") ||
      lower.includes("not found in dropdown") ||
      lower.includes("did not find some options") ||
      lower.includes("retrying select option action") ||
      (lower.includes("select") && (lower.includes("not found") || lower.includes("invalid")))) {
   
    // 🎯 SPECIFIC: If "did not find some options", it's usually a data issue
    if (lower.includes("did not find some options")) {
      return "No data provided in Test case generator";
    }
   
    // Extract expected vs actual values if available
    const valueMatch = cleanError.match(/expected[:\s]+['"]([^'"]+)['"]|value[:\s]+['"]([^'"]+)['"]/i);
    if (valueMatch) {
      const value = valueMatch[1] || valueMatch[2];
      return `Dropdown option "${value}" not available in UI`;
    }
   
    return `Dropdown option given not available in UI`;
  }
 
  // ✅ Min/Max validation errors with specific limits
  if (lower.includes("above the maximum") || lower.includes("below the minimum") ||
      lower.includes("exceeds maximum") || lower.includes("less than minimum")) {
   
    // Extract the limit values
    const maxMatch = cleanError.match(/maximum.*?(\$?[\d,]+)/i);
    const minMatch = cleanError.match(/minimum.*?(\$?[\d,]+)/i);
   
    if (lower.includes("above the maximum") && maxMatch) {
      const maxValue = maxMatch[1];
      return `Value exceeds maximum limit of ${maxValue}`;
    }
   
    if (lower.includes("below the minimum") && minMatch) {
      const minValue = minMatch[1];
      return `Value is below minimum limit of ${minValue}`;
    }
   
    return "Value doesn't meet min/max limit";
  }
 
  // // ✅ Required field errors
  // if (lower.includes("required") && !lower.includes("property")) {
  //   return "Required field is empty";
  // }
 
  // ✅ Disabled/Readonly element errors
  if (lower.includes("disabled") || lower.includes("readonly") || lower.includes("not editable")) {
    return "Element is disabled";
  }
 
  // ✅ Element not visible/attached errors
  if (lower.includes("not attached") || lower.includes("detached")) {
    return "Element detached from page";
  }
 
  if (lower.includes("not visible") || lower.includes("hidden")) {
    return "Element is not visible";
  }
 
  // ✅ PRIORITY: Check for "did not find some options" BEFORE generic timeout
  if (lower.includes("did not find some options") || lower.includes("not found in dropdown")) {
    return "Given option is not found in UI";
  }
   // ✅ Timeout errors - Identify specific cause
  if (lower.includes("timeout")) {
    const timeoutMatch = cleanError.match(/(\d+)ms/);
 
    // 🎯 NEW: Check for "element is not visible" in call log
    if (lower.includes("element is not visible")) {
      return "Element is not visible on UI";
    }
    
    // ✅ Check if timeout is waiting for element to be visible
    if (lower.includes("visible") || lower.includes("to be visible")) {
      return "Element not visible on page";
    }
    
    if (lower.includes("did not find some options") || lower.includes("not found in dropdown")) {
      return "Given option is not found in UI";
    }
    
    // ✅ Check if timeout is waiting for element to be attached
    if (lower.includes("attached") || lower.includes("to be attached")) {
      return "Element not attached to page";
    }
   
    // ✅ Check if timeout is waiting for element to be enabled
    if (lower.includes("enabled") || lower.includes("to be enabled")) {
      return "Element is disabled";
    }
   
    // ✅ Check if timeout is waiting for element to exist
    if (lower.includes("locator") || lower.includes("waiting for")) {
      return "Element not found on page";
    }
   
    // ✅ Check if timeout is for page navigation/loading
    if (lower.includes("navigation") || lower.includes("load") || lower.includes("goto")) {
      return "Page loading issue";
    }
     
    // ✅ Check if timeout is for network request
    if (lower.includes("network") || lower.includes("request") || lower.includes("response")) {
      return "Network request taking too long";
    }
   
    // ✅ Generic timeout with value
    return "Element not found on UI";
  }
 
  // ✅ Element not found errors
  if (lower.includes("not found") ||
      lower.includes("no element") ||
      lower.includes("unable to find")) {
    return "Element not found on UI";
  }
 
  // ✅ Click intercepted errors
  if (lower.includes("click") && (lower.includes("intercept") || lower.includes("blocking"))) {
    return "Click blocked by another element";
  }
 
  // ✅ Navigation errors
  if (lower.includes("navigation") ||
      lower.includes("net::err") ||
      lower.includes("failed to load")) {
    return "Page navigation failed";
  }
 
  // ✅ Validation wording mismatch
  if (lower.includes("validation") && (lower.includes("mismatch") || lower.includes("doesn't match"))) {
    return "Validation error text doesn't match";
  }
 
  // ✅ Network errors
  if (lower.includes("network") ||
      lower.includes("connection") ||
      lower.includes("econnrefused")) {
    return "Network connection error";
  }
 
  // ✅ Generic fallback - return simple error description
  return cleanError.substring(0, 100);
}
 
/**
 * Extract the page name from Playwright TestInfo with multiple fallback strategies
 * This helps identify which page/step the error occurred on for better Excel reporting
 *
 * @param testInfo - Playwright TestInfo object
 * @returns Page name (e.g., "Property Page", "Issuance Page") or "Unknown Page"
 *
 * @example
 * const pageName = extractPageFromTestInfo(testInfo);
 * // Returns: "Property Page" or "Issuance Page" etc.
 */
export function extractPageFromTestInfo(testInfo: any): string {
  console.log('🔍 Starting page detection...');
  
  // ✅ STRATEGY 0 (HIGHEST PRIORITY): Check for Question Text Mapper errors first
  const errorMessages = [];
  
  // Collect all error messages from various sources
  if (testInfo?.errors && Array.isArray(testInfo.errors)) {
    testInfo.errors.forEach((error: any) => {
      if (error.message) errorMessages.push(error.message);
    });
  }
  
  if (testInfo?.error?.message) {
    errorMessages.push(testInfo.error.message);
  }
  
  // Check test steps for errors
  if (testInfo?.steps && Array.isArray(testInfo.steps)) {
    testInfo.steps.forEach((step: any) => {
      if (step.error?.message) {
        errorMessages.push(step.error.message);
      }
    });
  }
  
  // Look for Question Text Mapper errors
  for (const errorMessage of errorMessages) {
    console.log(`🔍 Checking error message: ${errorMessage.substring(0, 200)}...`);
    
    // Pattern: "⚠️ Question "..." not found in UI for screen 'ScreenName'"
    const questionMapperMatch = errorMessage.match(/not found in UI for screen\s*['"]([^'"]+)['"]/i);
    if (questionMapperMatch) {
      const screenName = questionMapperMatch[1];
      console.log(`✅ Found Question Text Mapper error for screen: "${screenName}"`);
      
      // Convert screen name to readable page name
      const pageName = convertScreenNameToPageName(screenName);
      console.log(`✅ Converted screen name to page: "${pageName}"`);
      return pageName;
    }
    
    // Also check for error code pattern: "❌ Question code '...' not found in Excel for screen '...'"
    const questionCodeMatch = errorMessage.match(/not found in Excel for screen\s*['"]([^'"]+)['"]/i);
    if (questionCodeMatch) {
      const screenName = questionCodeMatch[1];
      console.log(`✅ Found Question Text Mapper Excel error for screen: "${screenName}"`);
      
      // Convert screen name to readable page name
      const pageName = convertScreenNameToPageName(screenName);
      console.log(`✅ Converted screen name to page: "${pageName}"`);
      return pageName;
    }
  }
 
  // ✅ STRATEGY 1: Check testInfo.steps for the last executed step
  if (testInfo?.steps && Array.isArray(testInfo.steps)) {
    const steps = testInfo.steps.filter((s: any) => s.category === 'test.step');
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      const stepTitle = (lastStep.title || '').toLowerCase();
      console.log(`📍 Last test step: "${stepTitle}"`);
     
      // ✅ HIGHEST PRIORITY: Explicit string matching for known pages (checks before regex)
      // This ensures consistent, reliable page detection for common test steps
      if (stepTitle.includes('account creation')) {
        console.log(`✅ Matched explicit string: "Account Creation Page"`);
        return "Account Creation Page";
      }
     
      if (stepTitle.includes('risk analysis') || stepTitle.includes('riskanalysis')) {
        console.log(`✅ Matched explicit string: "Risk Analysis Page"`);
        return "Risk Analysis Page";
      }
     
      if (stepTitle.includes('issuance')) {
        console.log(`✅ Matched explicit string: "Issuance Page"`);
        return "Issuance Page";
      }
     
      if (stepTitle.includes('payment')) {
        console.log(`✅ Matched explicit string: "Payment Page"`);
        return "Payment Page";
      }
     
      if (stepTitle.includes('quote') && stepTitle.includes('property')) {
        console.log(`✅ Matched explicit string: "Quote Page"`);
        return "Quote Page";
      }
     
      if (stepTitle.includes('policy details') || stepTitle.includes('policydetails')) {
        console.log(`✅ Matched explicit string: "Policy Details Page"`);
        return "Policy Details Page";
      }
     
      if (stepTitle.includes('property details') || stepTitle.includes('propertydetails')) {
        console.log(`✅ Matched explicit string: "Property Page"`);
        return "Property Page";
      }
     
      if (stepTitle.includes('valuation')) {
        console.log(`✅ Matched explicit string: "Valuation Page"`);
        return "Valuation Page";
      }
     
      if (stepTitle.includes('discount') || stepTitle.includes('surcharge')) {
        console.log(`✅ Matched explicit string: "Discount/Surcharge Page"`);
        return "Discount/Surcharge Page";
      }
     
      // ✅ FALLBACK: Dynamic regex patterns (only if explicit matches fail)
      // Pattern: "GPA DWS enter property details" → extract "property" → "Property Page"
      const enterDetailsMatch = stepTitle.match(/enter\s+(\w+(?:\s+\w+)?)\s+details/i);
      if (enterDetailsMatch) {
        const pageName = toTitleCase(enterDetailsMatch[1]) + ' Page';
        console.log(`✅ Extracted from step "enter...details" pattern: "${pageName}"`);
        return pageName;
      }
     
      // Pattern: "GPA Account creation" → "Account Creation Page"
      const creationMatch = stepTitle.match(/(\w+)\s+creation/i);
      if (creationMatch) {
        const pageName = toTitleCase(creationMatch[1]) + ' Creation Page';
        console.log(`✅ Extracted from step "...creation" pattern: "${pageName}"`);
        return pageName;
      }
     
      // Pattern: "GPA enter and validate payment details" → "Payment Page"
      const validateMatch = stepTitle.match(/enter\s+and\s+validate\s+(\w+)/i);
      if (validateMatch) {
        const pageName = toTitleCase(validateMatch[1]) + ' Page';
        console.log(`✅ Extracted from step "enter and validate" pattern: "${pageName}"`);
        return pageName;
      }
     
      // Pattern: "validate risk analysis" → "Risk Analysis Page"
      const validateRiskMatch = stepTitle.match(/validate\s+(\w+(?:\s+\w+)?)/i);
      if (validateRiskMatch) {
        const pageName = toTitleCase(validateRiskMatch[1]) + ' Page';
        console.log(`✅ Extracted from step "validate..." pattern: "${pageName}"`);
        return pageName;
      }
    }
  }
 
  // ✅ STRATEGY 2: Extract from file path in error stack trace
  // Try multiple sources for the stack trace
  let errorStack = '';
 
  // Source 1: testInfo.errors array (Playwright's error collection)
  if (testInfo?.errors && Array.isArray(testInfo.errors) && testInfo.errors.length > 0) {
    errorStack = testInfo.errors[0].stack || '';
  }
 
  // Source 2: testInfo.error (single error object we attached)
  if (!errorStack && testInfo?.error?.stack) {
    errorStack = testInfo.error.stack;
  }
 
  // Source 3: Look for error in test step info
  if (!errorStack && testInfo?.steps) {
    for (const step of testInfo.steps) {
      if (step.error?.stack) {
        errorStack = step.error.stack;
        break;
      }
    }
  }
 
  console.log(`📂 Checking error stack for file path...`);
  console.log(`📋 Stack trace length: ${errorStack.length} characters`);
  if (errorStack) {
    console.log(`📋 Stack trace preview: ${errorStack.substring(0, 300)}...`);
  } else {
    console.log(`⚠️ No stack trace found in testInfo`);
  }
 
  if (errorStack) {
    // ✅ CRITICAL FIX: Skip utility files and find actual page files
    const UTILITY_FILES = [
      'wordingValidation',
      'action-utils',
      'element-utils',
      'report-utils',
      'locator-utils',
      'timeout-constants',
      'excel-utils',
    ];
   
    // Try multiple regex patterns to catch different stack trace formats
    const patterns = [
      // Pattern 1: "at errorValidation (C:\...\quotePage.ts:509:41)"
      /at\s+\w+\s+\([^)]*[\/\\](\w+)\.ts:\d+:\d+\)/gi,
     
      // Pattern 2: "at Object.enterQuoteDetails (C:\...\quotePage.ts:568:3)"
      /at\s+(?:Object\.)?\w+\s+\([^)]*[\/\\](\w+)\.ts:\d+:\d+\)/gi,
     
      // Pattern 3: Simple path match "quotePage.ts:509:41"
      /[\/\\](\w+)\.ts:\d+:\d+/gi,
     
      // Pattern 4: Even simpler "quotePage.ts:509"
      /[\/\\](\w+)\.ts:\d+/gi,
    ];
   
    for (const pattern of patterns) {
      // ✅ Use matchAll to get ALL matches, not just first one
      const matches = Array.from(errorStack.matchAll(pattern));
     
      for (const match of matches) {
        if (match && match[1]) {
          const fileName = match[1];
         
          // ✅ Skip utility files - look for actual page files
          if (UTILITY_FILES.includes(fileName)) {
            console.log(`⏭️ Skipping utility file: "${fileName}"`);
            continue;
          }
         
          console.log(`📄 Found page file in stack: "${fileName}"`);
         
          // ✅ Convert filename to page name
          const pageName = fileNameToPageName(fileName);
          console.log(`✅ Converted file name to page: "${pageName}"`);
          return pageName;
        }
      }
    }
  }
 
  console.log('❌ No page detected from steps or file path');
  return "Unknown Page";
}
 
/**
 * Helper function to convert screen name to readable page name
 * @example convertScreenNameToPageName("Discount_Surcharges") → "Discount And Surcharges Page"
 * @example convertScreenNameToPageName("Property") → "Property Page"
 * @example convertScreenNameToPageName("Policy_Details_Page") → "Policy Details Page"
 */
function convertScreenNameToPageName(screenName: string): string {
  // Remove trailing _Page if present
  const withoutPageSuffix = screenName.replace(/_Page$/i, '');
  
  // Convert underscores to spaces
  const withSpaces = withoutPageSuffix.replace(/_/g, ' ');
  
  // Convert camelCase/PascalCase to spaces
  const withAllSpaces = withSpaces
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');  // PascalCase
  
  // Capitalize each word and handle special cases
  const titleCased = withAllSpaces
    .split(/\s+/)
    .map(word => {
      const lowerWord = word.toLowerCase();
      // Special case: "surcharges" becomes "Surcharges"
      if (lowerWord === 'surcharges') return 'Surcharges';
      // Special case: "and" remains lowercase unless it's the first word
      if (lowerWord === 'and') return 'And';
      // Standard title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return titleCased + ' Page';
}

/**
 * Helper function to convert camelCase/PascalCase to Title Case
 * @example toTitleCase("propertyDetails") → "Property Details"
 */
function toTitleCase(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')  // Add space before capitals
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
 
/**
 * Helper function to convert filename to readable page name
 * @example fileNameToPageName("PropertyPage") → "Property Page"
 * @example fileNameToPageName("issuanceDetailsPage") → "Issuance Details Page"
 */
function fileNameToPageName(fileName: string): string {
  // Remove "Page" suffix if present
  const withoutPageSuffix = fileName.replace(/Page$/i, '');
 
  // Convert camelCase/PascalCase to spaces
  const withSpaces = withoutPageSuffix
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');  // PascalCase
 
  // Capitalize each word
  const titleCased = withSpaces
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
 
  return titleCased + ' Page';
}
 
// Utility: Get the correct row for a given TEST# and sheet context
export function getRowForTestCase(data: any[], testCaseNumber: string | number, sheetName: string) {
  const testNum = testCaseNumber.toString().trim();
  // Helper to get TEST# value robustly
  function getTestNum(row: any) {
    // Try both 'TEST#' and 'Test#', ignore case, trim
    const keys = Object.keys(row);
    let testKey = keys.find(k => k.trim().toLowerCase() === 'test#');
    if (!testKey) return '';
    return row[testKey]?.toString().trim();
  }
  // Helper to get Transaction value robustly
  function getTransaction(row: any) {
    const keys = Object.keys(row);
    let transKey = keys.find(k => k.trim().toLowerCase() === 'transaction');
    if (!transKey) return '';
    return row[transKey]?.toString().toLowerCase().trim();
  }
  // For Policy Info and similar, prefer Submission, fallback to Dwelling 1 if not found
  if (sheetName.toLowerCase().includes("policy_info") || sheetName.toLowerCase().includes("policy_info_page")) {
    // Try Submission first
    let row = data.find(row =>
      (getTestNum(row) === testNum) &&
      (getTransaction(row) === "submission" || getTransaction(row) === "submiission")
    );
    // Fallback to Dwelling 1 if not found
    if (!row) {
      row = data.find(row =>
        (getTestNum(row) === testNum) &&
        (getTransaction(row) === "dwelling 1")
      );
    }
    return row;
  }
  // For Dwelling, prefer Dwelling 1, fallback to Submission if not found
  if (sheetName.toLowerCase().includes("dwelling_page")) {
    // Try Dwelling 1 first
    let row = data.find(row =>
      (getTestNum(row) === testNum) &&
      (getTransaction(row) === "dwelling 1")
    );
    // Fallback to Submission or Submiission if not found
    if (!row) {
      row = data.find(row =>
        (getTestNum(row) === testNum) &&
        (getTransaction(row) === "submission" || getTransaction(row) === "submiission")
      );
    }
    return row;
  }
  // Default: just match TEST# robustly
  return data.find(row => getTestNum(row) === testNum);
}
 