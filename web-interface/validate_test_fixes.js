// Simple validation script for TEST# data alignment fixes
const fs = require('fs');

console.log("🔍 VALIDATING TEST# DATA ALIGNMENT FIXES");
console.log("========================================");

const testFiles = [
  { name: 'GPA_Boat.spec.ts', path: './tests/GPA_Boat.spec.ts' },
  { name: 'GPA_Yacht.spec.ts', path: './tests/GPA_Yacht.spec.ts' },
  { name: 'GPA_MS.spec.ts', path: './tests/GPA_MS.spec.ts' },
  { name: 'GPA_CV.spec.ts', path: './tests/GPA_CV.spec.ts' }
];

let allFixed = true;

testFiles.forEach(file => {
  console.log(`\n📁 Checking ${file.name}:`);
  
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Check for old problematic patterns
    const hasOldPattern = content.includes('test_num = originalRowIndex + 1') ||
                          (content.includes('excelRowNumber.toString()]') && 
                           !content.includes('actualTestNumber.toString()]'));
    
    // Check for new fixed patterns  
    const hasNewPattern = content.includes('actualTestNumber = summary["Test#"]');
    const hasDebugLogging = content.includes('DATA ALIGNMENT DEBUG:');
    const hasValidation = content.includes('WARNING: No driver data found for TEST#');
    
    console.log(`   Old problematic pattern: ${hasOldPattern ? '❌ FOUND' : '✅ FIXED'}`);
    console.log(`   New actualTestNumber pattern: ${hasNewPattern ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`   Debug logging: ${hasDebugLogging ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`   Data validation: ${hasValidation ? '✅ FOUND' : '❌ MISSING'}`);
    
    const isFixed = !hasOldPattern && hasNewPattern;
    console.log(`   Status: ${isFixed ? '✅ FIXED' : '❌ NEEDS WORK'}`);
    
    if (!isFixed) allFixed = false;
    
  } catch (error) {
    console.log(`   ❌ ERROR reading file: ${error.message}`);
    allFixed = false;
  }
});

console.log(`\n📊 OVERALL RESULT: ${allFixed ? '✅ ALL FILES FIXED' : '❌ SOME FILES NEED WORK'}`);

if (allFixed) {
  console.log(`\n🎉 SUCCESS! All recreational test files have been updated with TEST# data alignment fixes.`);
  console.log(`\n🧪 Next Steps:`);
  console.log(`   1. Test individual test case execution`);
  console.log(`   2. Verify driver page data alignment`);  
  console.log(`   3. Check console logs for debug information`);
  console.log(`   4. Confirm results are consistent with full suite runs`);
} else {
  console.log(`\n⚠️  Some files still need fixes. Please review the individual file status above.`);
}

process.exit(allFixed ? 0 : 1);
