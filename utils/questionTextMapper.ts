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
// ✅ DYNAMIC CONFIGURATION - Can be initialized with different Excel files
let configuredExcelPath: string | null = null;
let configuredSheetName: string = "Help";
let helpSheet: any[] = [];
let rawHelpSheet: any[] = [];

// ✅ DEFAULT FALLBACK - For backward compatibility
const defaultExcelPath = path.join(__dirname, "..", "testdata", "");

function loadHelpSheet(excelFilePath: string, sheetName: string) {
  try {
    console.log(`📊 Loading question mapper from: ${excelFilePath}, Sheet: ${sheetName}`);
    const workbook = xlsx.readFile(excelFilePath);
    
    if (!workbook.Sheets[sheetName]) {
      console.warn(`⚠️ Sheet '${sheetName}' not found in Excel file. Available sheets:`, Object.keys(workbook.Sheets));
      rawHelpSheet = [];
      return;
    }
    const rawSheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
    rawHelpSheet = rawSheet;
    console.log("📋 Help sheet raw data sample:", rawSheet.slice(0, 3));
    
    // Forward fill 'Sheets' and 'Field' columns to handle merged cells
    let lastScreen = "";
    let lastShortCode = "";
    
    helpSheet = rawSheet.map((row: any) => {
      // Support multiple column name variations for Page/Screen
      if (row["Sheets"] || row["Screens"] || row["Page"]) {
        lastScreen = (row["Sheets"] || row["Screens"] || row["Page"])?.toString().trim().replace(/\s+/g, "_") || lastScreen;
      }
      
      // Forward fill Short Code for merged cells (multiple questions per code)
      // Priority: Field > Short Code > Question Code
      const currentShortCode = row["Field"]?.toString().trim() || row["Short Code"]?.toString().trim() || row["Question Code"]?.toString().trim();
      if (currentShortCode) {
        lastShortCode = currentShortCode;
      }
      
      return {
        screen: lastScreen,
        questionCode: lastShortCode, // Use forward-filled value for merged cells
        // Question text from "Description" or "Question" column
        question: row["Description"]?.toString().trim() || row["Question"]?.toString().trim()
      };
    }).filter(row => row.questionCode && row.question); // Only keep rows with both code and question
    
    console.log(`✅ Question mapper loaded: ${helpSheet.length} entries from ${excelFilePath}`);
    console.log(`📋 Sample entries:`, helpSheet.slice(0, 3));
    
    // ✅ DIAGNOSTIC: Log all Issuance questions to help debug
    const issuanceQuestions = helpSheet.filter(r => r.screen === "Issuance");
    console.log(`🔍 Found ${issuanceQuestions.length} questions for Issuance screen`);
    if (issuanceQuestions.length > 0) {
      console.log(`📋 Issuance questions sample:`, issuanceQuestions.slice(0, 5).map(r => ({ code: r.questionCode, question: r.question?.substring(0, 50) })));
    }
    
    // Log Short Codes with multiple variants
    const codeGroups = helpSheet.reduce((acc: any, row: any) => {
      acc[row.questionCode] = (acc[row.questionCode] || 0) + 1;
      return acc;
    }, {});
    const multiVariantCodes = Object.entries(codeGroups).filter(([_, count]) => (count as number) > 1);
    if (multiVariantCodes.length > 0) {
      console.log(`📋 Short Codes with multiple variants:`, multiVariantCodes.map(([code, count]) => `${code}(${count})`).slice(0, 5));
    }
  } catch (error) {
    console.error(`❌ Failed to load question mapper from ${excelFilePath}:`, error);
    helpSheet = []; // Initialize empty to prevent crashes
    rawHelpSheet = [];
  }
}

// ✅ DYNAMIC INITIALIZATION FUNCTION
export function initQuestionMapper(excelFilePath: string, sheetName: string = "Help") {
  configuredExcelPath = excelFilePath;
  configuredSheetName = sheetName;
  loadHelpSheet(configuredExcelPath, configuredSheetName);
}

// ✅ LAZY INITIALIZATION - Load default if not configured
function ensureHelpSheetLoaded() {
  if (helpSheet.length === 0 && !configuredExcelPath) {
    console.log("📊 Loading default question mapper (backward compatibility)");
    loadHelpSheet(defaultExcelPath, "Help");
  }
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
  
  const match = helpSheet.find((row: any) =>
    row.screen === normalizedScreen &&
    row.questionCode?.toString().trim() === normalizedCode
  );
  
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
  return helpSheet
    .filter(row => row.screen === normalizedScreen && row.question)
    .map(row => row.question!);
}

export function getQuestionCodesForScreen(screenName: string): string[] {
  ensureHelpSheetLoaded();
  const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
  return helpSheet
    .filter(row => row.screen === normalizedScreen && row.questionCode)
    .map(row => row.questionCode!);
}

export function getQuestionMeta(screenName: string): { code: string; question: string }[] {
  ensureHelpSheetLoaded();
  const normalizedScreen = screenName.trim().replace(/\s+/g, "_");
  return helpSheet
    .filter(row => row.screen === normalizedScreen && row.question && row.questionCode)
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
    // const locator = page.locator(`//*[contains(normalize-space(text()), "${questionText}")]`);
    const locator = page.locator(`//*[contains(normalize-space(text()), ${xpathLiteral(questionText.trim())})]`);
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
  // Always fetch from Excel first
  const questionText = getQuestionTextByCode(screen, code);
  if (!questionText) {
    const msg = `❌ Question code '${code}' not found in Excel for screen '${screen}'`;
    if (options?.optional) {
      console.warn(msg);
      return null;
    } else {
      throw new Error(msg);
    }
  }

  // Validate UI presence
  const locator = page.locator(`//*[contains(normalize-space(text()), "${questionText}")]`);
  const count = await locator.count();

  if (count === 0) {
    const msg = `⚠️ Question "${questionText}" not found in UI for screen '${screen}'`;
    if (options?.optional) {
      console.warn(msg);
      // ✅ Return Excel text instead of null so locators can still be built
      return questionText;
    } else {
      throw new Error(msg);
    }
  }

  return questionText;
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