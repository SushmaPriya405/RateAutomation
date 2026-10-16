/**
 * 🎯 UNIFIED LOB PATTERN CONFIGURATION
 * This file contains the standardized mapping between Excel filenames and LOB test suites
 * Used by both frontend (script.js) and backend (excel-path-resolver.ts)
 * 
 * IMPORTANT: Keep this file synchronized across all components!
 */

// 🎯 EXACT FILE PATTERNS - These must match exactly with the provided patterns
export const EXACT_FILE_PATTERNS = {
    // GPA (Issuance) Patterns
    'GPA_Dwelling_Basic': 'DwellingBasic_Test_Case_Generator_Issuance_*.xlsm',
    'GPA_Dwelling_Special': 'DwellingSpecial_Test_Case_Generator_Issuance_*.xlsm',
    'GPA_HomeOwners': 'Homeowners_Test_Case_Generator_Issuance_*.xlsm',
    'GPA_Manufactured_Home': 'Manufactured_Home_Test_Case_Generator_Issuance_*.xlsm',
    'GPA_Boat': 'Boat_Test_Case_Generator_Issuance_*.xlsm',
    'GPA_Yacht': 'Yacht_Test_Case_Generator_Issuance_*.xlsm',
    'GPA_CV': 'CollectorVehicle_Test_Case_Generator_Issuance_*.xlsm',
    'GPA_MS': 'Motorsports_Test_Case_Generator_Issuance_*.xlsm',
    
    // Core (Policy Change / Renewal) Patterns
    'Core_Dwelling_Basic': 'DwellingBasic_Test_Case_Generator_Policy_Change_*.xlsm OR DwellingBasic_Test_Case_Generator_Renewal_*.xlsm',
    'Core_Dwelling_Special': 'DwellingSpecial_Test_Case_Generator_Policy_Change_*.xlsm OR DwellingSpecial_Test_Case_Generator_Renewal_*.xlsm',
    'Core_Manufactured_Home': 'Manufactured_Home_Test_Case_Generator_Policy_Change_*.xlsm OR Manufactured_Home_Test_Case_Generator_Renewal_*.xlsm',
    'Core_HomeOwners': 'Homeowners_Test_Case_Generator_Policy_Change_*.xlsm OR Homeowners_Test_Case_Generator_Renewal_*.xlsm',
    'Core_CV': 'CollectorVehicle_Test_Case_Generator_Policy_Change_*.xlsm OR CollectorVehicle_Test_Case_Generator_Renewal_*.xlsm',
    'Core_MS': 'Motorsports_Test_Case_Generator_Policy_Change_*.xlsm OR Motorsports_Test_Case_Generator_Renewal_*.xlsm',
    'Core_BT': 'Boat_Test_Case_Generator_Policy_Change_*.xlsm OR Boat_Test_Case_Generator_Renewal_*.xlsm',
    'Core_YT': 'Yacht_Test_Case_Generator_Policy_Change_*.xlsm OR Yacht_Test_Case_Generator_Renewal_*.xlsm'
};

// 🎯 PATTERN MATCHING RULES - Ordered by priority (most specific first)
export const PATTERN_MATCHING_RULES = [
    // === CORE (POLICY CHANGE / RENEWAL) PATTERNS - HIGHEST PRIORITY ===
    // These must be checked FIRST to avoid collision with GPA patterns
    
    // Dwelling patterns with Policy Change
    {
        pattern: /dwellingbasic.*test.*case.*generator.*policy.*change|dwelling.*basic.*test.*case.*generator.*renewal/i,
        lob: 'Core_Dwelling_Basic',
        keywords: ['dwellingbasic', 'test', 'case', 'generator', 'policy', 'change', 'dwelling', 'basic', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    {
        pattern: /dwellingspecial.*test.*case.*generator.*policy.*change|dwelling.*special.*test.*case.*generator.*renewal/i,
        lob: 'Core_Dwelling_Special', 
        keywords: ['dwellingspecial', 'test', 'case', 'generator', 'policy', 'change', 'dwelling', 'special', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    
    // Other LOBs with Policy Change
    {
        pattern: /homeowners.*test.*case.*generator.*policy.*change|homeowners.*test.*case.*generator.*renewal/i,
        lob: 'Core_HomeOwners',
        keywords: ['homeowners', 'test', 'case', 'generator', 'policy', 'change', 'homeowners', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    {
        pattern: /manufactured.*home.*test.*case.*generator.*policy.*change|manufactured.*home.*test.*case.*generator.*renewal/i,
        lob: 'Core_Manufactured_Home',
        keywords: ['manufactured', 'home', 'test', 'case', 'generator', 'policy', 'change', 'manufactured', 'home', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    {
        pattern: /collectorvehicle.*test.*case.*generator.*policy.*change|collectorvehicle.*test.*case.*generator.*renewal/i,
        lob: 'Core_CV',
        keywords: ['collectorvehicle', 'test', 'case', 'generator', 'policy', 'change', 'collectorvehicle', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    {
        pattern: /motorsports.*test.*case.*generator.*policy.*change|motorsports.*test.*case.*generator.*renewal/i,
        lob: 'Core_MS',
        keywords: ['motorsports', 'test', 'case', 'generator', 'policy', 'change', 'motorsports', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    {
        pattern: /boat.*test.*case.*generator.*policy.*change|boat.*test.*case.*generator.*renewal/i,
        lob: 'Core_BT',
        keywords: ['boat', 'test', 'case', 'generator', 'policy', 'change', 'boat', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    {
        pattern: /yacht.*test.*case.*generator.*policy.*change|yacht.*test.*case.*generator.*renewal/i,
        lob: 'Core_YT',
        keywords: ['yacht', 'test', 'case', 'generator', 'policy', 'change', 'yacht', 'test', 'case', 'generator', 'renewal'],
        type: 'core'
    },
    
    // === GPA (ISSUANCE) PATTERNS - LOWER PRIORITY ===
    
    // Dwelling patterns with Issuance
    {
        pattern: /dwellingbasic.*test.*case.*generator.*issuance/i,
        lob: 'GPA_Dwelling_Basic',
        keywords: ['dwellingbasic', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    },
    {
        pattern: /dwellingspecial.*test.*case.*generator.*issuance/i,
        lob: 'GPA_Dwelling_Special',
        keywords: ['dwellingspecial', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    },
    
    // Other LOBs with Issuance
    {
        pattern: /homeowners.*test.*case.*generator.*issuance/i,
        lob: 'GPA_HomeOwners',
        keywords: ['homeowners', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    },
    {
        pattern: /manufactured.*home.*test.*case.*generator.*issuance/i,
        lob: 'GPA_Manufactured_Home',
        keywords: ['manufactured', 'home', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    },
    {
        pattern: /collectorvehicle.*test.*case.*generator.*issuance/i,
        lob: 'GPA_CV',
        keywords: ['collectorvehicle', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    },
    {
        pattern: /motorsports.*test.*case.*generator.*issuance/i,
        lob: 'GPA_MS',
        keywords: ['motorsports', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    },
    {
        pattern: /boat.*test.*case.*generator.*issuance/i,
        lob: 'GPA_Boat',
        keywords: ['boat', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    },
    {
        pattern: /yacht.*test.*case.*generator.*issuance/i,
        lob: 'GPA_Yacht',
        keywords: ['yacht', 'test', 'case', 'generator', 'issuance'],
        type: 'gpa'
    }
];

/**
 * 🎯 UNIFIED PATTERN MATCHING FUNCTION
 * Use this function in both frontend and backend for consistent results
 */
export function detectLOBFromFilename(filename) {
    if (!filename) return null;
    
    const normalizedName = filename.toLowerCase().replace(/[_\-\s]+/g, '');
    console.log(`🔍 Analyzing file: "${filename}" → normalized: "${normalizedName}"`);
    
    // Try pattern matching rules in priority order
    for (let i = 0; i < PATTERN_MATCHING_RULES.length; i++) {
        const rule = PATTERN_MATCHING_RULES[i];
        
        if (rule.pattern.test(normalizedName)) {
            console.log(`✅ MATCH FOUND (Rule ${i + 1}): ${filename} → ${rule.lob}`);
            console.log(`   Pattern: ${rule.pattern.source}`);
            console.log(`   Type: ${rule.type.toUpperCase()}`);
            return rule.lob;
        }
    }
    
    // Fallback: keyword scoring for partial matches
    console.log(`⚠️ No exact pattern match, trying keyword scoring...`);
    const scores = {};
    
    for (const rule of PATTERN_MATCHING_RULES) {
        let score = 0;
        const matchedKeywords = [];
        
        for (const keyword of rule.keywords) {
            if (normalizedName.includes(keyword.toLowerCase())) {
                score++;
                matchedKeywords.push(keyword);
            }
        }
        
        if (score > 0) {
            scores[rule.lob] = { score, matchedKeywords, type: rule.type };
        }
    }
    
    if (Object.keys(scores).length > 0) {
        // Find the highest scoring LOB
        const bestMatch = Object.entries(scores).reduce((best, current) => {
            const [lobName, data] = current;
            const [bestLobName, bestData] = best;
            
            // Prefer higher scores, and prefer Core over GPA when scores are equal
            if (data.score > bestData.score || 
                (data.score === bestData.score && data.type === 'core' && bestData.type === 'gpa')) {
                return current;
            }
            return best;
        });
        
        const [bestLOB, bestData] = bestMatch;
        console.log(`🎯 KEYWORD MATCH: ${filename} → ${bestLOB}`);
        console.log(`   Score: ${bestData.score}/${bestData.matchedKeywords.length}`);
        console.log(`   Keywords: ${bestData.matchedKeywords.join(', ')}`);
        console.log(`   Type: ${bestData.type.toUpperCase()}`);
        return bestLOB;
    }
    
    console.log(`❌ No LOB detected for: ${filename}`);
    return null;
}

/**
 * Get expected file pattern for a LOB
 */
export function getExpectedFilePattern(lob) {
    return EXACT_FILE_PATTERNS[lob] || `${lob}_*.xlsm`;
}

/**
 * Get LOB display name
 */
export function getLOBDisplayName(lob) {
    const displayNames = {
        'Core_Dwelling_Basic': 'Core Dwelling Basic',
        'Core_Dwelling_Special': 'Core Dwelling Special',
        'Core_Manufactured_Home': 'Core Manufactured Home',
        'Core_HomeOwners': 'Core HomeOwners',
        'Core_CV': 'Core Collector Vehicle',
        'Core_MS': 'Core Motorsports',
        'Core_BT': 'Core Boat',
        'Core_YT': 'Core Yacht'
    };
    
    return displayNames[lob] || lob;
}
