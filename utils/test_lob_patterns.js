/**
 * 🧪 COMPREHENSIVE LOB PATTERN TESTING
 * Test all possible file name patterns to ensure correct LOB detection
 */

// Simulate the detectLOBFromFilename function from script.js
function detectLOBFromFilename_Frontend(filename) {
    if (!filename) return null;
    
    const normalizedName = filename.toLowerCase().replace(/[_\-\s]+/g, '');
    console.log(`🔍 FRONTEND - Analyzing file: "${filename}" → normalized: "${normalizedName}"`);
    
    // 🎯 UNIFIED PATTERN MATCHING RULES - Ordered by priority (Core first)
    const patternRules = [
        // === CORE (POLICY CHANGE) PATTERNS - HIGHEST PRIORITY ===
        { pattern: /dwellingbasic.*test.*case.*generator.*policy.*change/i, lob: 'Core_Dwelling_Basic', type: 'core' },
        { pattern: /dwellingspecial.*test.*case.*generator.*policy.*change/i, lob: 'Core_Dwelling_Special', type: 'core' },
        { pattern: /homeowners.*test.*case.*generator.*policy.*change/i, lob: 'Core_HomeOwners', type: 'core' },
        { pattern: /manufactured.*home.*test.*case.*generator.*policy.*change/i, lob: 'Core_Manufactured_Home', type: 'core' },
        { pattern: /collectorvehicle.*test.*case.*generator.*policy.*change/i, lob: 'Core_CV', type: 'core' },
        { pattern: /motorsports.*test.*case.*generator.*policy.*change/i, lob: 'Core_MS', type: 'core' },
        { pattern: /boat.*test.*case.*generator.*policy.*change/i, lob: 'Core_BT', type: 'core' },
        { pattern: /yacht.*test.*case.*generator.*policy.*change/i, lob: 'Core_YT', type: 'core' },
        
        // === GPA (ISSUANCE) PATTERNS - LOWER PRIORITY ===
        { pattern: /dwellingbasic.*test.*case.*generator.*issuance/i, lob: 'GPA_Dwelling_Basic', type: 'gpa' },
        { pattern: /dwellingspecial.*test.*case.*generator.*issuance/i, lob: 'GPA_Dwelling_Special', type: 'gpa' },
        { pattern: /homeowners.*test.*case.*generator.*issuance/i, lob: 'GPA_HomeOwners', type: 'gpa' },
        { pattern: /manufactured.*home.*test.*case.*generator.*issuance/i, lob: 'GPA_Manufactured_Home', type: 'gpa' },
        { pattern: /collectorvehicle.*test.*case.*generator.*issuance/i, lob: 'GPA_CV', type: 'gpa' },
        { pattern: /motorsports.*test.*case.*generator.*issuance/i, lob: 'GPA_MS', type: 'gpa' },
        { pattern: /boat.*test.*case.*generator.*issuance/i, lob: 'GPA_Boat', type: 'gpa' },
        { pattern: /yacht.*test.*case.*generator.*issuance/i, lob: 'GPA_Yacht', type: 'gpa' }
    ];
    
    // Try exact pattern matching first (priority order)
    for (let i = 0; i < patternRules.length; i++) {
        const rule = patternRules[i];
        if (rule.pattern.test(normalizedName)) {
            console.log(`✅ FRONTEND EXACT MATCH (Rule ${i + 1}): ${filename} → ${rule.lob} (${rule.type.toUpperCase()})`);
            return rule.lob;
        }
    }
    
    console.log(`❌ FRONTEND: No LOB detected for: ${filename}`);
    return null;
}

// Simulate the findBestMatchingTestSuite function from excel-path-resolver.ts
function detectLOBFromFilename_Backend(filename) {
    if (!filename) return null;
    
    const normalizedName = filename.toLowerCase().replace(/[_\-\s]+/g, '');
    console.log(`🔍 BACKEND - Analyzing file: "${filename}" → normalized: "${normalizedName}"`);
    
    // 🎯 UNIFIED PATTERN MATCHING RULES - Ordered by priority (Core first) 
    const patternRules = [
        // === CORE (POLICY CHANGE) PATTERNS - HIGHEST PRIORITY ===
        { pattern: /dwellingbasic.*test.*case.*generator.*policy.*change/i, lob: 'Core_Dwelling_Basic.spec.ts', type: 'core' },
        { pattern: /dwellingspecial.*test.*case.*generator.*policy.*change/i, lob: 'Core_Dwelling_Special.spec.ts', type: 'core' },
        { pattern: /homeowners.*test.*case.*generator.*policy.*change/i, lob: 'Core_HomeOwners.spec.ts', type: 'core' },
        { pattern: /manufactured.*home.*test.*case.*generator.*policy.*change/i, lob: 'Core_Manufactured_Home.spec.ts', type: 'core' },
        { pattern: /collectorvehicle.*test.*case.*generator.*policy.*change/i, lob: 'Core_CV.spec.ts', type: 'core' },
        { pattern: /motorsports.*test.*case.*generator.*policy.*change/i, lob: 'Core_MS.spec.ts', type: 'core' },
        { pattern: /boat.*test.*case.*generator.*policy.*change/i, lob: 'Core_BT.spec.ts', type: 'core' },
        { pattern: /yacht.*test.*case.*generator.*policy.*change/i, lob: 'Core_YT.spec.ts', type: 'core' },
        
        // === GPA (ISSUANCE) PATTERNS - LOWER PRIORITY ===
        { pattern: /dwellingbasic.*test.*case.*generator.*issuance/i, lob: 'GPA_Dwelling_Basic.spec.ts', type: 'gpa' },
        { pattern: /dwellingspecial.*test.*case.*generator.*issuance/i, lob: 'GPA_Dwelling_Special.spec.ts', type: 'gpa' },
        { pattern: /homeowners.*test.*case.*generator.*issuance/i, lob: 'GPA_HomeOwners.spec.ts', type: 'gpa' },
        { pattern: /manufactured.*home.*test.*case.*generator.*issuance/i, lob: 'GPA_Manufactured_Home.spec.ts', type: 'gpa' },
        { pattern: /collectorvehicle.*test.*case.*generator.*issuance/i, lob: 'GPA_CV.spec.ts', type: 'gpa' },
        { pattern: /motorsports.*test.*case.*generator.*issuance/i, lob: 'GPA_MS.spec.ts', type: 'gpa' },
        { pattern: /boat.*test.*case.*generator.*issuance/i, lob: 'GPA_Boat.spec.ts', type: 'gpa' },
        { pattern: /yacht.*test.*case.*generator.*issuance/i, lob: 'GPA_Yacht.spec.ts', type: 'gpa' }
    ];
    
    // Try exact pattern matching first (priority order)
    for (let i = 0; i < patternRules.length; i++) {
        const rule = patternRules[i];
        if (rule.pattern.test(normalizedName)) {
            console.log(`✅ BACKEND EXACT MATCH (Rule ${i + 1}): ${filename} → ${rule.lob} (${rule.type.toUpperCase()})`);
            return rule.lob;
        }
    }
    
    console.log(`❌ BACKEND: No LOB detected for: ${filename}`);
    return null;
}

// Test cases based on exact file pattern specifications
const testCases = [
    // Core (Policy Change) Files
    {
        filename: "DwellingBasic_Test_Case_Generator_Policy_Change_v1.0.xlsm",
        expectedFrontend: "Core_Dwelling_Basic",
        expectedBackend: "Core_Dwelling_Basic.spec.ts"
    },
    {
        filename: "DwellingSpecial_Test_Case_Generator_Policy_Change_v2.1.xlsm", 
        expectedFrontend: "Core_Dwelling_Special",
        expectedBackend: "Core_Dwelling_Special.spec.ts"
    },
    {
        filename: "Homeowners_Test_Case_Generator_Policy_Change_Latest.xlsm",
        expectedFrontend: "Core_HomeOwners", 
        expectedBackend: "Core_HomeOwners.spec.ts"
    },
    {
        filename: "Manufactured_Home_Test_Case_Generator_Policy_Change_v1.5.xlsm",
        expectedFrontend: "Core_Manufactured_Home",
        expectedBackend: "Core_Manufactured_Home.spec.ts"
    },
    {
        filename: "CollectorVehicle_Test_Case_Generator_Policy_Change_Final.xlsm",
        expectedFrontend: "Core_CV",
        expectedBackend: "Core_CV.spec.ts"
    },
    {
        filename: "Motorsports_Test_Case_Generator_Policy_Change_v3.0.xlsm",
        expectedFrontend: "Core_MS",
        expectedBackend: "Core_MS.spec.ts"
    },
    {
        filename: "Boat_Test_Case_Generator_Policy_Change_Updated.xlsm",
        expectedFrontend: "Core_BT",
        expectedBackend: "Core_BT.spec.ts"
    },
    {
        filename: "Yacht_Test_Case_Generator_Policy_Change_New.xlsm",
        expectedFrontend: "Core_YT",
        expectedBackend: "Core_YT.spec.ts"
    },
    
    // GPA (Issuance) Files
    {
        filename: "DwellingBasic_Test_Case_Generator_Issuance_v1.0.xlsm",
        expectedFrontend: "GPA_Dwelling_Basic",
        expectedBackend: "GPA_Dwelling_Basic.spec.ts"
    },
    {
        filename: "DwellingSpecial_Test_Case_Generator_Issuance_v2.1.xlsm",
        expectedFrontend: "GPA_Dwelling_Special",
        expectedBackend: "GPA_Dwelling_Special.spec.ts"
    },
    {
        filename: "Homeowners_Test_Case_Generator_Issuance_Latest.xlsm",
        expectedFrontend: "GPA_HomeOwners",
        expectedBackend: "GPA_HomeOwners.spec.ts"
    },
    {
        filename: "Manufactured_Home_Test_Case_Generator_Issuance_v1.5.xlsm",
        expectedFrontend: "GPA_Manufactured_Home",
        expectedBackend: "GPA_Manufactured_Home.spec.ts"
    },
    {
        filename: "CollectorVehicle_Test_Case_Generator_Issuance_Final.xlsm",
        expectedFrontend: "GPA_CV",
        expectedBackend: "GPA_CV.spec.ts"
    },
    {
        filename: "Motorsports_Test_Case_Generator_Issuance_v3.0.xlsm",
        expectedFrontend: "GPA_MS",
        expectedBackend: "GPA_MS.spec.ts"
    },
    {
        filename: "Boat_Test_Case_Generator_Issuance_Updated.xlsm",
        expectedFrontend: "GPA_Boat",
        expectedBackend: "GPA_Boat.spec.ts"
    },
    {
        filename: "Yacht_Test_Case_Generator_Issuance_New.xlsm",
        expectedFrontend: "GPA_Yacht",
        expectedBackend: "GPA_Yacht.spec.ts"
    }
];

// Run comprehensive tests
console.log("🧪 COMPREHENSIVE LOB PATTERN TESTING");
console.log("=====================================\n");

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test ${index + 1}: ${testCase.filename}`);
    console.log(`   Expected Frontend: ${testCase.expectedFrontend}`);
    console.log(`   Expected Backend:  ${testCase.expectedBackend}`);
    
    // Test Frontend
    const frontendResult = detectLOBFromFilename_Frontend(testCase.filename);
    const frontendPass = frontendResult === testCase.expectedFrontend;
    
    // Test Backend  
    const backendResult = detectLOBFromFilename_Backend(testCase.filename);
    const backendPass = backendResult === testCase.expectedBackend;
    
    // Overall test result
    const testPassed = frontendPass && backendPass;
    
    if (testPassed) {
        console.log(`   ✅ PASS - Both frontend and backend matched correctly`);
        passedTests++;
    } else {
        console.log(`   ❌ FAIL`);
        if (!frontendPass) {
            console.log(`      Frontend: Expected "${testCase.expectedFrontend}", got "${frontendResult}"`);
        }
        if (!backendPass) {
            console.log(`      Backend: Expected "${testCase.expectedBackend}", got "${backendResult}"`);
        }
        failedTests++;
    }
});

// Summary
console.log(`\n📊 TEST SUMMARY`);
console.log(`================`);
console.log(`✅ Passed: ${passedTests}/${testCases.length}`);
console.log(`❌ Failed: ${failedTests}/${testCases.length}`);
console.log(`📈 Success Rate: ${Math.round((passedTests / testCases.length) * 100)}%`);

if (failedTests === 0) {
    console.log(`\n🎉 ALL TESTS PASSED! LOB pattern matching is working correctly.`);
} else {
    console.log(`\n⚠️ Some tests failed. Please review the pattern matching logic.`);
}
