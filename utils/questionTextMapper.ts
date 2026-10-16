// import { Page } from "@playwright/test";
// import * as xlsx from "xlsx";
// import * as path from "path";

// export function readExcelfile(filepath: string, sheetName: string): any[] {
//   let data: any[] = [];
//   try {
//     const absolutePath = path.resolve(__dirname, filepath);
//     const workbook = xlsx.readFile(absolutePath);
//     //const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     data = xlsx.utils.sheet_to_json(sheet, { raw: false });
//   } catch (error) {
//     console.log("Failed to read Excel file:", error);
//   }
//   return data;
// }
// // ✅ DYNAMIC CONFIGURATION - Can be initialized with different Excel files
// let configuredExcelPath: string | null = null;
// let configuredSheetName: string = "Help";
// let helpSheet: any[] = [];

// // ✅ DEFAULT FALLBACK - For backward compatibility
// const defaultExcelPath = path.join(__dirname, "..", "testdata", "");

// function loadHelpSheet(excelFilePath: string, sheetName: string) {
//   try {
//     console.log(`📊 Loading question mapper from: ${excelFilePath}, Sheet: ${sheetName}`);
//     const workbook = xlsx.readFile(excelFilePath);
    
//     if (!workbook.Sheets[sheetName]) {
//       console.warn(`⚠️ Sheet '${sheetName}' not found in Excel file. Available sheets:`, Object.keys(workbook.Sheets));
//       return;
//     }    
//     const rawSheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });// Forward fill 'Screens' column to handle merged cells
//     // console.log("help sheet:", rawSheet);
//     let lastScreen = "";
//     helpSheet = rawSheet.map((row: any) => {
//       if (row["Screens"] || row["Sheets"]) {
//         lastScreen = row["Screens"] || row["Sheets"].trim().replace(/\s+/g, "_");
//       }
//       return {
//         screen: lastScreen,
//         questionCode: row["Field"]?.trim() || row["Question Code"]?.trim(),
//         question: row["Description"]?.trim() || row["Question"]?.trim()
//       };
//     });
    
//     console.log(`✅ Question mapper loaded: ${helpSheet.length} entries from ${excelFilePath}`);
//   } catch (error) {
//     console.error(`❌ Failed to load question mapper from ${excelFilePath}:`, error);
//     helpSheet = []; // Initialize empty to prevent crashes
//   }
// }

// // ✅ DYNAMIC INITIALIZATION FUNCTION
// export function initQuestionMapper(excelFilePath: string, sheetName: string = "Help") {
//   configuredExcelPath = excelFilePath;
//   configuredSheetName = sheetName;
//   loadHelpSheet(configuredExcelPath, configuredSheetName);
// }

// // ✅ LAZY INITIALIZATION - Load default if not configured
// function ensureHelpSheetLoaded() {
//   if (helpSheet.length === 0 && !configuredExcelPath) {
//     console.log("📊 Loading default question mapper (backward compatibility)");
//     loadHelpSheet(defaultExcelPath, "Help");
//   }
// }

// export function getQuestionTextByCode(screenName: string, questionCode: string): string | null {
//   ensureHelpSheetLoaded();
//   const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
//   const match = helpSheet.find((row: any) =>
//     row.screen === normalizedScreen &&
//     row.questionCode?.toString().trim() === questionCode.trim()
//   );
//   return match?.question || null;
// }

// export function getAllQuestions(screenName: string): string[] {
//   ensureHelpSheetLoaded();
//   const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
//   return helpSheet
//     .filter(row => row.screen === normalizedScreen && row.question)
//     .map(row => row.question!);
// }

// export function getQuestionCodesForScreen(screenName: string): string[] {
//   ensureHelpSheetLoaded();
//   const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
//   return helpSheet
//     .filter(row => row.screen === normalizedScreen && row.questionCode)
//     .map(row => row.questionCode!);
// }

// export function getQuestionMeta(screenName: string): { code: string; question: string }[] {
//   ensureHelpSheetLoaded();
//   const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
//   return helpSheet
//     .filter(row => row.screen === normalizedScreen && row.question && row.questionCode)
//     .map(row => ({
//       code: row.questionCode!,
//       question: row.question!
//     }));
// }

// /*
//  * Fetch question text from Excel and optionally validate UI presence.
//  * If UI check fails and `optional` is true, return the Excel text instead of null.
//  */
// export async function getMatchedQuestionText(
//   page: Page,
//   screen: string,
//   code: string,
//   options?: { optional?: boolean }
// ): Promise<string | null> {
//   // Always fetch from Excel first
//   const questionText = getQuestionTextByCode(screen, code);
//   if (!questionText) {
//     const msg = `❌ Question code '${code}' not found in Excel for screen '${screen}'`;
//     if (options?.optional) {
//       console.warn(msg);
//       return null;
//     } else {
//       throw new Error(msg);
//     }
//   }

//   // Validate UI presence
//   const locator = page.locator(`//*[contains(normalize-space(text()), "${questionText}")]`);
//   const count = await locator.count();

//   if (count === 0) {
//     const msg = `⚠️ Question "${questionText}" not found in UI for screen '${screen}'`;
//     if (options?.optional) {
//       console.warn(msg);
//       // ✅ Return Excel text instead of null so locators can still be built
//       return questionText;
//     } else {
//       throw new Error(msg);
//     }
//   }

//   return questionText;
// }

// /**
//  * Returns a screen-specific question fetcher to avoid repeating page and screen name.
//  */
// export function createQuestionFetcher(page: Page, screen: string) {
//   return async function getQuestion(code: string, options?: { optional?: boolean }): Promise<string | null> {
//     return await getMatchedQuestionText(page, screen, code, options);
//   };
// }

import { Page } from "@playwright/test";
import fs from "fs";
import * as xlsx from "xlsx";
import * as path from "path";
import { xpathLiteral } from "./question-helper";

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
let helpSheet: any[] = [];
let rawHelpSheet: any[] = [];

const sheetsHelpJsonPath = path.join(__dirname, "..", "testdata", "sheetsHelps.json");

function loadHelpSheetFromJson(jsonFilePath: string) {
  try {
    console.log(`📊 Loading question mapper from JSON: ${jsonFilePath}`);
    const entries = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    if (!Array.isArray(entries)) throw new Error("SheetsHelp JSON must contain an array");

    rawHelpSheet = entries;
    helpSheet = entries.flatMap((entry: any) => {
      const questionCode = String(entry?.Field ?? "").trim();
      const descriptions = Array.isArray(entry?.Description)
        ? entry.Description
        : entry?.Description == null ? [] : [entry.Description];

      return descriptions
        .map((question: unknown) => String(question ?? "").trim())
        .filter((question: string) => question.length > 0)
        .map((question: string) => ({ screen: "", questionCode, question }));
    }).filter((row: any) => row.questionCode);

    console.log(`✅ Question mapper loaded: ${helpSheet.length} variants across ${rawHelpSheet.length} fields`);
  } catch (error) {
    console.error(`❌ Failed to load question mapper from JSON:`, error);
    helpSheet = [];
    rawHelpSheet = [];
  }
}

function loadHelpSheetFromExcel(excelFilePath: string, sheetName: string) {
  try {
    console.log(`📊 Loading question mapper from: ${excelFilePath}, Sheet: ${sheetName}`);
    const workbook = xlsx.readFile(excelFilePath);
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet '${sheetName}' not found`);

    rawHelpSheet = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    let lastScreen = "";
    let lastShortCode = "";
    helpSheet = rawHelpSheet.map((row: any) => {
      const screen = row["Sheets"] || row["Screens"] || row["Page"];
      if (screen) lastScreen = String(screen).trim().replace(/\s+/g, "_");
      const shortCode = row["Field"] || row["Short Code"] || row["Question Code"];
      if (shortCode) lastShortCode = String(shortCode).trim();

      return {
        screen: lastScreen,
        questionCode: lastShortCode,
        question: String(row["Description"] || row["Question"] || "").trim()
      };
    }).filter((row: any) => row.questionCode && row.question);

    console.log(`✅ Question mapper loaded: ${helpSheet.length} entries from ${excelFilePath}`);
  } catch (error) {
    console.error(`❌ Failed to load question mapper from ${excelFilePath}:`, error);
    helpSheet = [];
    rawHelpSheet = [];
  }
}

export function initQuestionMapper(excelFilePath: string, sheetName: string = "Help") {
  loadHelpSheetFromExcel(excelFilePath, sheetName);
}

export function initQuestionMapperFromJson(jsonFilePath: string = sheetsHelpJsonPath) {
  loadHelpSheetFromJson(jsonFilePath);
}

function ensureHelpSheetLoaded() {
 initQuestionMapperFromJson();
}

export function getHelpSheetRows(): any[] {
  ensureHelpSheetLoaded();
  return rawHelpSheet;
}

export function getQuestionTextByCode(screenName: string, questionCode: string): string | null {
  ensureHelpSheetLoaded();
  const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
  const normalizedCode = questionCode.trim();
  
  console.log(`🔍 Looking for question: Screen="${normalizedScreen}", Code="${normalizedCode}"`);
  
  const codeMatches = helpSheet.filter((row: any) =>
    row.questionCode?.toString().trim() === normalizedCode
  );
  const match = codeMatches.find((row: any) => row.screen === normalizedScreen) ||
    codeMatches.find((row: any) => !row.screen);
  
  if (match) {
    console.log(`✅ Found question: "${match.question}"`);
    return match.question;
  } else {
    console.warn(`⚠️ Question not found: Screen="${normalizedScreen}", Code="${normalizedCode}"`);
    console.warn(`📋 Available codes for screen "${normalizedScreen}":`, 
      helpSheet.filter(r => r.screen === normalizedScreen).map(r => r.questionCode).slice(0, 5)
    );
    return null;
  }
}

/**
 * Get ALL question variants for a Short Code (handles multiple question texts per code).
 * Returns array of all question variations for states/products.
 */
export function getQuestionVariantsByShortCode(shortCode: string): string[] {
  ensureHelpSheetLoaded();
  const normalizedCode = shortCode.trim();
  
  const matches = helpSheet.filter((row: any) =>
    row.questionCode?.toString().trim() === normalizedCode
  );
  
  const questions = matches.map((row: any) => row.question).filter(Boolean);
  
  if (questions.length > 0) {
    console.log(`✅ Found ${questions.length} question variant(s) for "${normalizedCode}"`);
    return questions;
  } else {
    console.warn(`⚠️ No questions found for Short Code: "${normalizedCode}"`);
    return [];
  }
}

/**
 * Get question text by Short Code only (without specifying screen).
 * Returns FIRST matching question (for backward compatibility).
 * For multiple variants, use getQuestionVariantsByShortCode() or getMatchedQuestionFromUI()
 */
export function getQuestionByShortCode(shortCode: string): string | null {
  ensureHelpSheetLoaded();
  const normalizedCode = shortCode.trim();
  
  const match = helpSheet.find((row: any) =>
    row.questionCode?.toString().trim() === normalizedCode
  );
  
  if (match) {
    console.log(`✅ Found question for "${normalizedCode}": "${match.question}"`);
    return match.question;
  } else {
    console.warn(`⚠️ Question not found for Short Code: "${normalizedCode}"`);
    return null;
  }
}

export function getAllQuestions(screenName: string): string[] {
  ensureHelpSheetLoaded();
  const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
  const screenRows = helpSheet.filter(row => row.screen === normalizedScreen);
  return (screenRows.length ? screenRows : helpSheet.filter(row => !row.screen))
    .filter(row => row.question)
    .map(row => row.question!);
}

export function getQuestionCodesForScreen(screenName: string): string[] {
  ensureHelpSheetLoaded();
  const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
  const screenRows = helpSheet.filter(row => row.screen === normalizedScreen);
  return (screenRows.length ? screenRows : helpSheet.filter(row => !row.screen))
    .filter(row => row.questionCode)
    .map(row => row.questionCode!);
}

export function getQuestionMeta(screenName: string): { code: string; question: string }[] {
  ensureHelpSheetLoaded();
  const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
  const screenRows = helpSheet.filter(row => row.screen === normalizedScreen);
  return (screenRows.length ? screenRows : helpSheet.filter(row => !row.screen))
    .filter(row => row.question && row.questionCode)
    .map(row => ({
      code: row.questionCode!,
      question: row.question!
    }));
}

/**
 * AUTO-DETECT: Try all question variants for a Short Code and return the one that exists in UI.
 * This is the RECOMMENDED approach for handling multiple question variants across states/products.
 * 
 * @param page - Playwright Page object
 * @param shortCode - Short Code from Excel (e.g., "CreditReport", "SwimmingPoolPremises")
 * @param options - { optional: true } to not throw error if no variant found
 * @returns The question text that exists in the UI, or null if none found
 */
export async function getMatchedQuestionFromUI(
  page: Page,
  shortCode: string,
  options?: { optional?: boolean }
): Promise<string | null> {
  // Get all question variants for this Short Code
  const variants = getQuestionVariantsByShortCode(shortCode);
  
  if (variants.length === 0) {
    const msg = `❌ No question variants found for Short Code: "${shortCode}"`;
    if (options?.optional) {
      console.warn(msg);
      return null;
    } else {
      throw new Error(msg);
    }
  }
  
  console.log(`🔍 Trying ${variants.length} variant(s) for "${shortCode}" in UI...`);
  
  // Try each variant in UI until one matches
  for (let i = 0; i < variants.length; i++) {
    const questionText = variants[i];
    const normalizedQuestion = questionText.trim().replace(/\s+/g, " ");
    const locator = page.locator(`//*[contains(normalize-space(.), ${xpathLiteral(normalizedQuestion)})]`);
    const count = await locator.count();
    
    if (count > 0) {
      console.log(`✅ Matched variant ${i + 1}/${variants.length} in UI: "${questionText.substring(0, 60)}..."`);
      return questionText;
    } else {
      console.log(`⚠️ Variant ${i + 1}/${variants.length} not found in UI: "${questionText.substring(0, 60)}..."`);
    }
  }
  
  // No variant found in UI
  const msg = `❌ None of the ${variants.length} variant(s) for "${shortCode}" found in UI`;
  if (options?.optional) {
    console.warn(msg);
    // Return first variant as fallback for backward compatibility
    return variants[0] || null;
  } else {
    throw new Error(msg);
  }
}

/*
 * Fetch question text from Excel and optionally validate UI presence.
 * If UI check fails and `optional` is true, return the Excel text instead of null.
 * 
 * NOTE: For Short Codes with multiple variants, prefer using getMatchedQuestionFromUI()
 */
export async function getMatchedQuestionText(
  page: Page,
  screen: string,
  code: string,
  options?: { optional?: boolean }
): Promise<string | null> {
  return getMatchedQuestionFromUI(page, code, options);
}

/**
 * Returns a question fetcher that auto-detects which variant exists in UI.
 * RECOMMENDED: Use this for pages with multiple question variants.
 * 
 * @param page - Playwright Page object
 * @returns Function to get question text by Short Code with auto-detection
 */
export function createAutoQuestionFetcher(page: Page) {
  return async function getQuestion(shortCode: string, options?: { optional?: boolean }): Promise<string | null> {
    return await getMatchedQuestionFromUI(page, shortCode, options);
  };
}

/**
 * Returns a screen-specific question fetcher to avoid repeating page and screen name.
 * NOTE: For backward compatibility. For multiple variants, prefer createAutoQuestionFetcher()
 */
export function createQuestionFetcher(page: Page, screen: string) {
  return async function getQuestion(code: string, options?: { optional?: boolean }): Promise<string | null> {
    return await getMatchedQuestionText(page, screen, code, options);
  };
}