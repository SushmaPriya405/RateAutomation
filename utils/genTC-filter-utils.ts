
// utils/genTc-filter.ts
import * as xlsx from "xlsx";

/**
 * Reads the "Summary" sheet of an Excel file and returns
 * only the test case names/row numbers where Gen_TC is truthy.
 *
 * Truthy values: "yes", "y", "true", "1" (case-insensitive)
 * Column name variations supported: GEN_TC, Gen_TC, Gen_Tc, gen_tc, Gen_TCi, Gen_TCin, GenTC, GENTC
 */
export function readTestCaseNamesFromExcel(filePath: string, maxRecord = 10) {
  const testCaseNames: string[] = [];
  const includeFlags: boolean[] = [];

  try {
    const workbook = xlsx.readFile(filePath);

    if (!workbook.SheetNames.includes("Summary")) {
      // Fallback if "Summary" does not exist
      for (let i = 1; i <= maxRecord; i++) {
        testCaseNames.push(`Test_${i}`);
        includeFlags.push(true);
      }
      return {
        testCaseNames,                              // included names (default all)
        includeFlags,                               // flags aligned to first maxRecord rows
        includedTests: Array.from({ length: maxRecord }, (_, i) => i + 1), // 1-based rows
        allTestCaseNames: testCaseNames,
        totalTests: maxRecord,
        allTestsCount: maxRecord,
      };
    }

    const summarySheet = workbook.Sheets["Summary"];
    const summaryData = xlsx.utils.sheet_to_json<Record<string, any>>(summarySheet, { raw: false });

    for (let i = 0; i < Math.min(maxRecord, summaryData.length); i++) {
      const row = summaryData[i];

      const testCaseTitle =
        row["TC_Title"] || row["tc_Title"] || row["Suggested Test Case Title"] || row["Test_Title"] || `Test_${i + 1}`;

      // Check a range of possible Gen_TC column names
      const genTCVariations = [
        row["GEN_TC"],
        row["gen_tc"],
        row["Gen_TC"],
        row["GEN_tc"],
        row["gen_TC"],
        row["GenTC"],
        row["Gen_Tc"],
        row["GENTC"],
        row["Gen_TCi"],
        row["Gen_TCin"],
      ];

      let genTC: any = "";
      for (const variation of genTCVariations) {
        if (variation !== undefined && variation !== null && variation !== "") {
          genTC = variation;
          break;
        }
      }

      const normalized = String(genTC).trim().toLowerCase();
      const shouldInclude = ["yes", "y", "true", "1"].includes(normalized);

      testCaseNames.push(testCaseTitle);
      includeFlags.push(shouldInclude);
    }

    // Build included results
    const includedNames: string[] = [];
    const includedTests: number[] = []; // 1-based row numbers in Summary

    for (let i = 0; i < testCaseNames.length; i++) {
      if (includeFlags[i]) {
        includedNames.push(testCaseNames[i]);
        includedTests.push(i + 1);
      }
    }

    return {
      testCaseNames: includedNames,
      includeFlags,
      includedTests,
      allTestCaseNames: testCaseNames,
      totalTests: includedNames.length,
      allTestsCount: testCaseNames.length,
    };
  } catch (error) {
    // Graceful fallback: default to first maxRecord rows all included
    for (let i = 1; i <= maxRecord; i++) {
      testCaseNames.push(`Test_${i}`);
      includeFlags.push(true);
    }
    return {
      testCaseNames,
      includeFlags,
      includedTests: Array.from({ length: maxRecord }, (_, i) => i + 1),
      allTestCaseNames: testCaseNames,
      totalTests: maxRecord,
      allTestsCount: maxRecord,
    };
  }
}