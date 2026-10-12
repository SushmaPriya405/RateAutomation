// utils/excel-dynamic-filter.js
// 🎯 SERVER-SIDE DYNAMIC EXCEL FILTERING
// This utility processes uploaded Excel files and filters test data based on GEN_TC column
// Making it completely dynamic and transparent to test files

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * 🎯 MAIN FUNCTION: Process uploaded Excel file and create filtered test data
 * This function reads the original Excel file, filters based on GEN_TC column,
 * and creates new filtered Excel file that test files will read
 */
function processExcelForDynamicFiltering(originalFilePath, sessionId, lob) {
    try {
        console.log(`🔍 Processing Excel for dynamic filtering: ${originalFilePath}`);
        console.log(`📊 Session: ${sessionId}, LOB: ${lob}`);
        
        // Read original Excel file
        const workbook = xlsx.readFile(originalFilePath);
        
        // Get Summary sheet to check GEN_TC column
        if (!workbook.SheetNames.includes('Summary')) {
            console.warn('⚠️ No Summary sheet found, skipping GEN_TC filtering');
            return {
                success: false,
                error: 'No Summary sheet found for GEN_TC filtering',
                originalFilePath: originalFilePath,
                filteredFilePath: originalFilePath, // Use original if no filtering possible
                totalTests: 0,
                includedTests: 0,
                testCaseNames: []
            };
        }
        
        // Read Summary sheet data
        const summarySheet = workbook.Sheets['Summary'];
        const summaryData = xlsx.utils.sheet_to_json(summarySheet, { raw: false });
        
        // Find GEN_TC column and filter rows
        const { includedRowNumbers, testCaseNames, totalTests } = filterTestsByGenTC(summaryData);
        
        if (includedRowNumbers.length === 0) {
            console.warn('⚠️ No tests marked as "Y" in GEN_TC column');
            return {
                success: false,
                error: 'No tests marked as "Y" in GEN_TC column',
                originalFilePath: originalFilePath,
                filteredFilePath: originalFilePath,
                totalTests: summaryData.length,
                includedTests: 0,
                testCaseNames: []
            };
        }
          // Create filtered workbook
        const filteredWorkbook = createFilteredWorkbook(workbook, includedRowNumbers);
        
        // 🎯 FIX: Save filtered Excel to session testdata directory (where path resolver looks)
        const sessionDir = path.join(__dirname, '..', 'sessions', sessionId);
        const sessionTestDataDir = path.join(sessionDir, 'testdata');
        // ✅ Save filtered file with "filtered_" prefix so raw Excel is NEVER overwritten
        const originalBaseName = path.basename(originalFilePath);
        const filteredFileName = `filtered_${originalBaseName}`;
        const filteredFilePath = path.join(sessionTestDataDir, filteredFileName);
        
        // Ensure session directories exist
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        if (!fs.existsSync(sessionTestDataDir)) {
            fs.mkdirSync(sessionTestDataDir, { recursive: true });
        }
        
        // Write filtered Excel file (raw Excel at originalFilePath stays untouched)
        xlsx.writeFile(filteredWorkbook, filteredFilePath);
        
        console.log(`✅ Created filtered Excel (preview only): ${filteredFilePath}`);
        console.log(`📁 Raw Excel untouched (used for execution): ${originalFilePath}`);
        console.log(`📊 Filtered ${includedRowNumbers.length} out of ${totalTests} tests`);
          return {
            success: true,
            originalFilePath: originalFilePath,   // Raw Excel — used for execution
            filteredFilePath: filteredFilePath,    // filtered_<name> — used for preview only
            totalTests: totalTests,
            includedTests: includedRowNumbers.length,
            includedRowNumbers: includedRowNumbers, // Original row numbers (e.g., [4, 7])
            testCaseNames: testCaseNames,
            sessionId: sessionId,
            // 🎯 NEW: Add mapping information for UI display
            rowMapping: includedRowNumbers.map((originalRow, index) => ({
                originalRow: originalRow,      // e.g., 4
                newRow: index + 1,            // e.g., 1
                testName: testCaseNames[index] || `Test_${originalRow}`
            }))
        };
        
    } catch (error) {
        console.error('❌ Error processing Excel for dynamic filtering:', error);
        return {
            success: false,
            error: error.message,
            originalFilePath: originalFilePath,
            filteredFilePath: originalFilePath,
            totalTests: 0,
            includedTests: 0,
            testCaseNames: []
        };
    }
}

/**
 * 🎯 FILTER TESTS BY GEN_TC COLUMN
 * Finds GEN_TC column and returns row numbers where GEN_TC = "Y"
 */
function filterTestsByGenTC(summaryData) {
    const includedRowNumbers = [];
    const testCaseNames = [];
    
    // Check each row for GEN_TC column variants
    for (let i = 0; i < summaryData.length; i++) {
        const row = summaryData[i];
        
        // Support multiple GEN_TC column name variations
        const genTCVariations = [
            row["GEN_TC"], row["gen_tc"], row["Gen_TC"], row["GEN_tc"], 
            row["gen_TC"], row["GenTC"], row["Gen_Tc"], row["GENTC"],
            row["Gen_TCi"], row["Gen_TCin"]
        ];
        
        let genTC = "";
        for (const variation of genTCVariations) {
            if (variation !== undefined && variation !== null && variation !== "") {
                genTC = variation;
                break;
            }
        }
        
        // Check if this test should be included
        const normalized = String(genTC).trim().toLowerCase();
        const shouldInclude = ["yes", "y", "true", "1"].includes(normalized);
        
        if (shouldInclude) {
            includedRowNumbers.push(i + 1); // 1-based row numbers
            testCaseNames.push(row["TC_Title"] || row["Test case Title"] || row["Suggested Test Case Title"] ||  `Test_${i + 1}`);
        }
    }
    
    console.log(`🎯 GEN_TC Filtering Results:`);
    console.log(`   📋 Total rows in Summary: ${summaryData.length}`);
    console.log(`   ✅ Tests marked as 'Y': ${includedRowNumbers.length}`);
    console.log(`   📝 Test names: ${testCaseNames.slice(0, 5).join(', ')}${testCaseNames.length > 5 ? '...' : ''}`);
    
    return {
        includedRowNumbers,
        testCaseNames,
        totalTests: summaryData.length
    };
}

/**
 * 🎯 CREATE FILTERED WORKBOOK WITH PRESERVED ROW NUMBERS
 * Creates a new workbook with only the rows where GEN_TC = "Y"
 * BUT preserves original row numbers by adding index mapping
 * 🔧 FIX: Reference sheets (Help, RuleMatrix, etc.) should NOT be filtered
 */
function createFilteredWorkbook(originalWorkbook, includedRowNumbers) {
    const filteredWorkbook = xlsx.utils.book_new();
    
    // Convert 1-based row numbers to 0-based for array indexing
    const zeroBasedRowNumbers = includedRowNumbers.map(row => row - 1);    // 🎯 FIX: Define reference sheets that should be copied entirely (NOT filtered)
    const referenceSheets = ['Help', 'Rates', 'Coverages_Options_Validations', 
                           'Forms', 'Forms_Configuration', 'Forms_Logic', 'Terr', 'DecAppQuote', 
                           'Default_Removed_Option', 'QuestionSet', 'Discounts', 'Output_Preview', 
                           'Configuration', 'Sheets_Help', 'Sheet_Help', 'HelpSheet', 'Help_Sheet',
                           'Reference', 'Constants', 'Lookup', 'Mappings', 'Settings', 'Drivers_Page', 'Vehicles_Page', 'Quote_Page', 'RuleMatrix_Validation'];
      // 🎯 ENHANCED: Function to check if a sheet is a reference sheet (case-insensitive and pattern matching)
    const isReferenceSheetCheck = (sheetName) => {
        const normalizedSheetName = sheetName.toLowerCase().trim();
        
        // console.log(`   🔍 Checking if "${sheetName}" (normalized: "${normalizedSheetName}") is a reference sheet...`);
        
        // Direct match (case-insensitive)
        const matchingRef = referenceSheets.find(ref => ref.toLowerCase() === normalizedSheetName);
        if (matchingRef) {
            // console.log(`   ✅ EXACT MATCH: "${sheetName}" matches reference sheet "${matchingRef}"`);
            return true;
        }
        
        // Pattern-based matching for common reference sheet variations
        const referencePatterns = [
            { pattern: /^help$/i, name: 'Help (exact)' },
            { pattern: /^sheets?_help$/i, name: 'Sheets_Help variations' },
            { pattern: /^help_sheets?$/i, name: 'Help_Sheets variations' },
            { pattern: /^sheet_help$/i, name: 'Sheet_Help' },
            { pattern: /^helpsheet$/i, name: 'HelpSheet' },
            { pattern: /^help_sheet$/i, name: 'Help_Sheet' },
            { pattern: /.*help.*/i, name: 'Contains "help"' },  
            { pattern: /^config/i, name: 'Configuration sheets' },
            { pattern: /^reference/i, name: 'Reference sheets' },
            { pattern: /^lookup/i, name: 'Lookup sheets' },
            { pattern: /^constant/i, name: 'Constants sheets' },
            { pattern: /^mapping/i, name: 'Mapping sheets' },
            { pattern: /^setting/i, name: 'Settings sheets' },
                { pattern: /^drivers?_page$/i, name: 'Drivers_Page variations' },
            { pattern: /^vehicles?_page$/i, name: 'Vehicles_Page variations' },
            { pattern: /^quote_page$/i, name: 'Quote_Page' },
            { pattern: /^rulematrix_validation$/i, name: 'RuleMatrix_Validation' }
        ];
        
        for (const { pattern, name } of referencePatterns) {
            if (pattern.test(normalizedSheetName)) {
                console.log(`   ✅ PATTERN MATCH: "${sheetName}" matches pattern "${name}" (${pattern})`);
                return true;
            }
        }
        
        // console.log(`   ❌ NO MATCH: "${sheetName}" is not a reference sheet - will be filtered`);
        return false;
    };
    
    // Process each sheet in the workbook
    originalWorkbook.SheetNames.forEach(sheetName => {
        // console.log(`🔄 Processing sheet: ${sheetName}`);
        
        const originalSheet = originalWorkbook.Sheets[sheetName];
        const originalData = xlsx.utils.sheet_to_json(originalSheet, { raw: false });            // 🎯 ENHANCED: Use improved reference sheet detection
        const isReferenceSheet = isReferenceSheetCheck(sheetName);
          
        if (isReferenceSheet) {            
            // console.log(`   📋 REFERENCE SHEET: "${sheetName}" - copying all ${originalData.length} rows (NO FILTERING)`);
            // console.log(`   🔒 This sheet will NOT have __ORIGINAL_ROW__ or __NEW_ROW__ properties added`);
            
            // Copy the entire sheet without filtering
            const completeSheet = xlsx.utils.json_to_sheet(originalData);
            xlsx.utils.book_append_sheet(filteredWorkbook, completeSheet, sheetName);
        } else {
            // console.log(`   📊 TEST DATA SHEET: "${sheetName}" - applying GEN_TC filtering`);
            // console.log(`   🏷️ This sheet will have __ORIGINAL_ROW__ and __NEW_ROW__ properties added`);
            
            // 🎯 FILTER: Apply filtering logic to test data sheets
            const filteredData = zeroBasedRowNumbers.map((originalRowIndex, newIndex) => {
                if (originalRowIndex < originalData.length) {
                    const rowData = { ...originalData[originalRowIndex] };
                    
                    // 🎯 ADD ORIGINAL ROW NUMBER FOR MAPPING
                    rowData['__ORIGINAL_ROW__'] = originalRowIndex + 1; // Store 1-based original row number
                    rowData['__NEW_ROW__'] = newIndex + 1; // Store 1-based new row number for reference
                    
                    return rowData;
                }
                return null; // Handle missing data gracefully
            }).filter(row => row !== null);
            //   console.log(`   📊 ${sheetName}: TEST DATA SHEET - ${originalData.length} → ${filteredData.length} rows (filtered by GEN_TC)`);
            // console.log(`   🎯 Original row numbers preserved: ${includedRowNumbers.slice(0, 10).join(', ')}${includedRowNumbers.length > 10 ? '...' : ''}`);
            
            // Create new sheet with filtered data
            const filteredSheet = xlsx.utils.json_to_sheet(filteredData);
            xlsx.utils.book_append_sheet(filteredWorkbook, filteredSheet, sheetName);
        }
    });
    
    // 🎯 SUMMARY: Log final processing results
    console.log(`\n📋 EXCEL FILTERING SUMMARY:`);
    console.log(`   📄 Total sheets processed: ${originalWorkbook.SheetNames.length}`);
    console.log(`   📚 Reference sheets (copied entirely): ${originalWorkbook.SheetNames.filter(name => isReferenceSheetCheck(name)).join(', ')}`);
    console.log(`   📊 Test data sheets (GEN_TC filtered): ${originalWorkbook.SheetNames.filter(name => !isReferenceSheetCheck(name)).join(', ')}`);
    
    return filteredWorkbook;
}

/**
 * 🎯 GET FILTERED TEST PREVIEW
 * Returns preview information for UI display
 */
function getFilteredTestPreview(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        if (!workbook.SheetNames.includes('Summary')) {
            return { success: false, error: 'No Summary sheet found' };
        }
        
        const summarySheet = workbook.Sheets['Summary'];
        const summaryData = xlsx.utils.sheet_to_json(summarySheet, { raw: false });
        
        const { includedRowNumbers, testCaseNames, totalTests } = filterTestsByGenTC(summaryData);
        
        return {
            success: true,
            totalTests: totalTests,
            includedTests: includedRowNumbers.length,
            testCaseNames: testCaseNames,
            includedRowNumbers: includedRowNumbers
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 🎯 CLEANUP FILTERED FILES
 * Removes session-specific filtered files when session ends
 */
function cleanupFilteredFiles(sessionId) {
    try {
        const sessionDir = path.join(__dirname, '..', 'sessions', sessionId);
        if (fs.existsSync(sessionDir)) {
            const files = fs.readdirSync(sessionDir);
            files.forEach(file => {
                if (file.startsWith('filtered_')) {
                    const filePath = path.join(sessionDir, file);
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Cleaned up filtered file: ${filePath}`);
                }
            });
        }
    } catch (error) {
        console.error('⚠️ Error cleaning up filtered files:', error);
    }
}

module.exports = {
    processExcelForDynamicFiltering,
    getFilteredTestPreview,
    cleanupFilteredFiles,
    filterTestsByGenTC
};
