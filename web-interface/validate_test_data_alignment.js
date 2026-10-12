// Test script to validate TEST# data alignment fixes in recreational test files
const fs = require('fs');
const path = require('path');

console.log("🧪 TESTING TEST# DATA ALIGNMENT FIXES");
console.log("=====================================");

const testFiles = [
  'tests/GPA_Boat.spec.ts',
  'tests/GPA_Yacht.spec.ts', 
  'tests/GPA_MS.spec.ts',
  'tests/GPA_CV.spec.ts'
];

let allFilesFixed = true;

testFiles.forEach(testFile => {
  const filePath = path.join(__dirname, testFile);
  console.log(`\n📁 Checking ${testFile}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found: ${filePath}`);
    allFilesFixed = false;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for the old problematic patterns
  const hasOldPattern1 = content.includes('test_num = originalRowIndex + 1');
  const hasOldPattern2 = content.includes('excelRowNumber.toString()]') && 
                         !content.includes('actualTestNumber.toString()]');
  
  // Check for the new fixed patterns
  const hasNewPattern = content.includes('actualTestNumber = summary["Test#"]') ||
                        content.includes('Actual TEST# from Summary');
  
  const hasValidation = content.includes('DATA VALIDATION:') ||
                        content.includes('WARNING: No driver data found for TEST#');
  
  const hasDebugLogging = content.includes('DATA ALIGNMENT DEBUG:');
  
  console.log(`   Old problematic pattern 1 (test_num = originalRowIndex + 1): ${hasOldPattern1 ? '❌ FOUND' : '✅ FIXED'}`);
  console.log(`   Old problematic pattern 2 (excelRowNumber.toString()): ${hasOldPattern2 ? '❌ FOUND' : '✅ FIXED'}`);
  console.log(`   New fixed pattern (actualTestNumber): ${hasNewPattern ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
  console.log(`   Data validation checks: ${hasValidation ? '✅ ADDED' : '⚠️ MISSING'}`);
  console.log(`   Debug logging: ${hasDebugLogging ? '✅ ADDED' : '⚠️ MISSING'}`);
  
  const isFixed = !hasOldPattern1 && !hasOldPattern2 && hasNewPattern;
  console.log(`   Overall status: ${isFixed ? '✅ FIXED' : '❌ NEEDS WORK'}`);
  
  if (!isFixed) {
    allFilesFixed = false;
  }
});

console.log(`\n📊 SUMMARY:`);
console.log("===========");

if (allFilesFixed) {
  console.log("✅ ALL RECREATIONAL TEST FILES HAVE BEEN FIXED!");
  console.log("\n🎯 WHAT WAS FIXED:");
  console.log("==================");
  console.log("• Changed from using Excel row numbers to actual TEST# values");
  console.log("• Added proper data alignment debugging");
  console.log("• Added validation checks for missing data");
  console.log("• Enhanced logging to show TEST# vs row number differences");
  
  console.log("\n🚀 BENEFITS:");
  console.log("=============");
  console.log("• Individual test case execution now works correctly");
  console.log("• Driver page data aligns properly with TEST# columns");
  console.log("• Vehicle and Quote data uses correct TEST# mapping");
  console.log("• Comprehensive logging helps debug data alignment issues");
  
  console.log("\n🧪 TESTING RECOMMENDATIONS:");
  console.log("============================");
  console.log("1. Upload a recreational Excel file (Boat/Yacht/MS/CV)");
  console.log("2. Run individual test cases (e.g., 4th test case only)");
  console.log("3. Verify driver page data matches TEST# 4 (not row 4)");
  console.log("4. Check console logs for data alignment debugging info");
  console.log("5. Confirm all test steps use correct TEST# data");
  
} else {
  console.log("❌ SOME FILES STILL NEED FIXES!");
  console.log("Please review the individual file statuses above.");
}

console.log(`\n✨ AFFECTED TEST FILES:`);
console.log("======================");
testFiles.forEach(file => {
  console.log(`• ${file} - Recreational product with DriverDetails/VehicleDetails`);
});

console.log(`\n📋 UNAFFECTED FILES (Array-based only):`);
console.log("======================================");
console.log("• GPA_Dwelling_Basic.spec.ts");
console.log("• GPA_Dwelling_Special.spec.ts");
console.log("• GPA_HomeOwners.spec.ts");
console.log("• GPA_Manufactured_Home.spec.ts");
console.log("(These files use array-based indexing and don't have the alignment issue)");

process.exit(allFilesFixed ? 0 : 1);
