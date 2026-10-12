/**
 * Universal Excel Path Resolver
 * Handles both UI uploads and hardcoded fallback paths for all LOB tests
 */

import * as path from 'path';
import * as fs from 'fs';

export interface ExcelPathConfig {
  fallbackFileName: string;
  resultFileName: string;
  searchPatterns?: string[];
  clearSessionCache?: boolean; // New option for cache clearing
}

/**
 * ✅ CENTRAL FILE PATTERN MAPPING - UPDATED
 * All test files automatically mapped to correct Excel files using exact keywords
 * 🎯 PRIORITY ORDER: Core (PolicyChange) patterns checked BEFORE GPA (Issuance) patterns
 */
const FILE_PATTERN_MAPPING: Record<string, string[]> = {  
  // 🎯 Core Tests - HIGHER PRIORITY (PolicyChange/Renewal sheets)
  // Keep base tokens to support both Policy Change and Renewal filenames
  "Core_Dwelling_Basic.spec.ts": ["dwelling", "basic", "test", "case", "generator"],
  "Core_Dwelling_Special.spec.ts": ["dwelling", "special", "test", "case", "generator"],
  "Core_HomeOwners.spec.ts": ["homeowners", "test", "case", "generator"],
  "Core_Manufactured_Home.spec.ts": ["manufactured", "home", "test", "case", "generator"],
  "Core_CV.spec.ts": ["collectorvehicle", "test", "case", "generator"],
  "Core_MS.spec.ts": ["motorsports", "test", "case", "generator"],
  "Core_BT.spec.ts": ["boat", "test", "case", "generator"],
  "Core_YT.spec.ts": ["yacht", "test", "case", "generator"],

  // 🎯 GPA Tests - LOWER PRIORITY (Issuance sheets)
  "GPA_Dwelling_Basic.spec.ts": ["dwellingbasic", "test", "case", "generator", "issuance"],
  "GPA_Dwelling_Special.spec.ts": ["dwellingspecial", "test", "case", "generator", "issuance"],
  "GPA_HomeOwners.spec.ts": ["homeowners", "test", "case", "generator", "issuance"],
  "GPA_Manufactured_Home.spec.ts": ["manufactured", "home", "test", "case", "generator", "issuance"],
  "GPA_CV.spec.ts": ["collectorvehicle", "test", "case", "generator", "issuance"],
  "GPA_MS.spec.ts": ["motorsports", "test", "case", "generator", "issuance"],
  "GPA_Boat.spec.ts": ["boat", "test", "case", "generator", "issuance"],
  "GPA_Yacht.spec.ts": ["yacht", "test", "case", "generator", "issuance"]
};

/**
 * Get search patterns for current test file automatically
 */
function getTestFilePatterns(testFileName?: string): string[] {
  if (!testFileName) {
    // Try to detect from call stack
    const stack = new Error().stack || "";
    const testFileMatch = stack.match(/([^\/\\]+\.spec\.ts)/);
    if (testFileMatch) {
      testFileName = testFileMatch[1];
    }
  }
  if (testFileName && FILE_PATTERN_MAPPING[testFileName]) {
    console.log(`🎯 Auto-detected patterns for ${testFileName}:`, FILE_PATTERN_MAPPING[testFileName]);
    return FILE_PATTERN_MAPPING[testFileName];
  }

  console.log(`⚠️ No pattern mapping found for: ${testFileName}`);
  return [];
}

/**
 * 🎯 INTELLIGENT FILE MATCHING - EXPORTED
 * Determines the correct test suite based on file name content and sheet type
 * Can be used by UI components for file upload validation
 */
export function findBestMatchingTestSuite(fileName: string): string | null {
  if (!fileName) return null;
  
  const normalizedName = fileName.toLowerCase().replace(/[_\-\s]+/g, '');
  console.log(`🔍 Analyzing file: "${fileName}" → normalized: "${normalizedName}"`);
  
  // 🎯 UNIFIED PATTERN MATCHING RULES - Ordered by priority (Core first) 
  const patternRules = [
    // === CORE (POLICY CHANGE / RENEWAL) PATTERNS - HIGHEST PRIORITY ===
    { pattern: /dwellingbasic.*test.*case.*generator.*policy.*change|dwelling.*basic.*test.*case.*generator.*renewal/i, lob: 'Core_Dwelling_Basic.spec.ts', type: 'core' },
    { pattern: /dwellingspecial.*test.*case.*generator.*policy.*change|dwelling.*special.*test.*case.*generator.*renewal/i, lob: 'Core_Dwelling_Special.spec.ts', type: 'core' },
    { pattern: /homeowners.*test.*case.*generator.*policy.*change|homeowners.*test.*case.*generator.*renewal/i, lob: 'Core_HomeOwners.spec.ts', type: 'core' },
    { pattern: /manufactured.*home.*test.*case.*generator.*policy.*change|manufactured.*home.*test.*case.*generator.*renewal/i, lob: 'Core_Manufactured_Home.spec.ts', type: 'core' },
    { pattern: /collectorvehicle.*test.*case.*generator.*policy.*change|collectorvehicle.*test.*case.*generator.*renewal/i, lob: 'Core_CV.spec.ts', type: 'core' },
    { pattern: /motorsports.*test.*case.*generator.*policy.*change|motorsports.*test.*case.*generator.*renewal/i, lob: 'Core_MS.spec.ts', type: 'core' },
    { pattern: /boat.*test.*case.*generator.*policy.*change|boat.*test.*case.*generator.*renewal/i, lob: 'Core_BT.spec.ts', type: 'core' },
    { pattern: /yacht.*test.*case.*generator.*policy.*change|yacht.*test.*case.*generator.*renewal/i, lob: 'Core_YT.spec.ts', type: 'core' },
    
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
      console.log(`✅ EXACT MATCH (Rule ${i + 1}): ${fileName} → ${rule.lob} (${rule.type.toUpperCase()})`);
      return rule.lob;
    }
  }
  
  // Fallback: keyword scoring for partial matches
  console.log(`⚠️ No exact pattern match, trying keyword scoring...`);
  const keywordMap = {
    'Core_Dwelling_Basic.spec.ts': ['dwellingbasic', 'test', 'case', 'generator', 'policy', 'change', 'dwelling', 'basic', 'test', 'case', 'generator', 'renewal'],
    'Core_Dwelling_Special.spec.ts': ['dwellingspecial', 'test', 'case', 'generator', 'policy', 'change', 'dwelling', 'special', 'test', 'case', 'generator', 'renewal'],
    'Core_HomeOwners.spec.ts': ['homeowners', 'test', 'case', 'generator', 'policy', 'change', 'homeowners', 'test', 'case', 'generator', 'renewal'],
    'Core_Manufactured_Home.spec.ts': ['manufactured', 'home', 'test', 'case', 'generator', 'policy', 'change', 'manufactured', 'home', 'test', 'case', 'generator', 'renewal'],
    'Core_CV.spec.ts': ['collectorvehicle', 'test', 'case', 'generator', 'policy', 'change', 'collectorvehicle', 'test', 'case', 'generator', 'renewal'],
    'Core_MS.spec.ts': ['motorsports', 'test', 'case', 'generator', 'policy', 'change', 'motorsports', 'test', 'case', 'generator', 'renewal'],
    'Core_BT.spec.ts': ['boat', 'test', 'case', 'generator', 'policy', 'change', 'boat', 'test', 'case', 'generator', 'renewal'],
    'Core_YT.spec.ts': ['yacht', 'test', 'case', 'generator', 'policy', 'change', 'yacht', 'test', 'case', 'generator', 'renewal'],
    'GPA_Dwelling_Basic.spec.ts': ['dwellingbasic', 'test', 'case', 'generator', 'issuance'],
    'GPA_Dwelling_Special.spec.ts': ['dwellingspecial', 'test', 'case', 'generator', 'issuance'],
    'GPA_HomeOwners.spec.ts': ['homeowners', 'test', 'case', 'generator', 'issuance'],
    'GPA_Manufactured_Home.spec.ts': ['manufactured', 'home', 'test', 'case', 'generator', 'issuance'],
    'GPA_CV.spec.ts': ['collectorvehicle', 'test', 'case', 'generator', 'issuance'],
    'GPA_MS.spec.ts': ['motorsports', 'test', 'case', 'generator', 'issuance'],
    'GPA_Boat.spec.ts': ['boat', 'test', 'case', 'generator', 'issuance'],
    'GPA_Yacht.spec.ts': ['yacht', 'test', 'case', 'generator', 'issuance']
  };
    // Define type for scoring results
  interface ScoreResult {
    score: number;
    matchedKeywords: string[];
    type: 'core' | 'gpa';
  }

  const scores: Record<string, ScoreResult> = {};
  for (const [lob, keywords] of Object.entries(keywordMap)) {
    let score = 0;
    const matchedKeywords: string[] = [];
    
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        score++;
        matchedKeywords.push(keyword);
      }
    }
    
    if (score > 0) {
      scores[lob] = { score, matchedKeywords, type: lob.startsWith('Core_') ? 'core' : 'gpa' };
    }
  }
    if (Object.keys(scores).length > 0) {
    // Find the highest scoring LOB, preferring Core over GPA when scores are equal
    const bestMatch = Object.entries(scores).reduce((best: [string, ScoreResult], current: [string, ScoreResult]): [string, ScoreResult] => {
      const [lobName, data] = current;
      const [bestLobName, bestData] = best;
      
      if (data.score > bestData.score || 
          (data.score === bestData.score && data.type === 'core' && bestData.type === 'gpa')) {
        return current;
      }
      return best;
    });
    
    const [bestLOB, bestData] = bestMatch;
    console.log(`🎯 KEYWORD MATCH: ${fileName} → ${bestLOB} (${bestData.type.toUpperCase()})`);
    console.log(`   Score: ${bestData.score}, Keywords: ${bestData.matchedKeywords.join(', ')}`);
    return bestLOB;
  }
  
  console.log(`❌ No LOB detected for: ${fileName}`);
  return null;
}

/**
 * Clear session cache to ensure fresh Excel file mapping
 * Call this at the beginning of each test to avoid cross-test contamination
 */
export function clearSessionCache(): void {
  try {
    // Clear environment variables that store file paths
    if (process.env.EXCEL_FILE_PATH) {
      delete process.env.EXCEL_FILE_PATH;
      console.log(`🧹 Cleared EXCEL_FILE_PATH environment variable`);
    }

    // Optionally clear session directory (commented out for safety)
    // const sessionTestDataDir = process.env.REPORTS_DIR 
    //   ? path.join(process.env.REPORTS_DIR, '..', 'testdata') 
    //   : null;
    
    // if (sessionTestDataDir && fs.existsSync(sessionTestDataDir)) {
    //   const sessionFiles = fs.readdirSync(sessionTestDataDir);
    //   sessionFiles.forEach(file => {
    //     if (file.endsWith('.xlsx') || file.endsWith('.xlsm')) {
    //       fs.unlinkSync(path.join(sessionTestDataDir, file));
    //       console.log(`🗑️ Removed session file: ${file}`);
    //     }
    //   });
    // }    console.log(`🧹 Clearing session cache for fresh test execution...`);
  } catch (error) {
    console.log(`⚠️ Cache clear warning:`, error instanceof Error ? error.message : String(error));
  }
}

/**
 * 🎯 SESSION-AWARE EXCEL PATH RESOLUTION
 * Automatically detects and uses filtered Excel files from session directories
 */

/**
 * Get current session ID from environment or server context
 */
function getCurrentSessionId(): string | null {
  // Try environment variable first
  if (process.env.SESSION_ID) {   //
    return process.env.SESSION_ID;
  }
  
  // Try reading from temporary session file if exists
  const tempSessionFile = path.join(__dirname, '..', 'temp-files', 'current-session-id.txt');
  if (fs.existsSync(tempSessionFile)) {
    try {
      return fs.readFileSync(tempSessionFile, 'utf-8').trim();
    } catch (error) {
      console.warn('Failed to read session ID from temp file:', error);
    }
  }
  
  return null;
}

/**
 * 🎯 ENHANCED: Session-aware Excel path resolution
 * Checks for filtered Excel files in session directories first
 */
export function resolveExcelPath(config: ExcelPathConfig): string {
  if (process.env.EXCEL_FILE_PATH && fs.existsSync(process.env.EXCEL_FILE_PATH)) {
    console.log(`✅ Using session uploaded file: ${process.env.EXCEL_FILE_PATH}`);
    return process.env.EXCEL_FILE_PATH;
  }

  // First, try to get session-specific filtered Excel file
  const sessionId = getCurrentSessionId();
  if (sessionId) {
    const sessionDir = path.join(__dirname, '..', 'sessions', sessionId);
    const sessionTestDataDir = path.join(sessionDir, 'testdata'); // 🎯 FIX: Look in testdata subfolder
    
    if (fs.existsSync(sessionTestDataDir)) {
      console.log(`🔍 Checking session directory for filtered files: ${sessionTestDataDir}`);
      
      // Look for raw Excel files in session/testdata directory
      // ✅ Explicitly skip filtered_ files — those are for preview only, not execution
      const files = fs.readdirSync(sessionTestDataDir);
      const rawFile = files.find(file =>
        !file.startsWith('filtered_') &&
        (file.endsWith('.xlsx') || file.endsWith('.xlsm'))
      );
      
      if (rawFile) {
        const rawPath = path.join(sessionTestDataDir, rawFile);
        console.log(`🎯 SUCCESS: Using raw Excel file for execution: ${rawPath}`);
        console.log(`📊 File exists: ${fs.existsSync(rawPath)}`);
        console.log(`📊 File size: ${fs.existsSync(rawPath) ? fs.statSync(rawPath).size : 'N/A'} bytes`);
        return rawPath;
      } else {
        console.log(`⚠️ No raw Excel files found in session directory (filtered_ files excluded)`);
        console.log(`📁 Available files: ${files.join(', ')}`);
      }
    } else {
      console.log(`⚠️ Session testdata directory does not exist: ${sessionTestDataDir}`);
    }
  } else {
    console.log(`⚠️ No session ID available for filtered Excel lookup`);
  }
  
  // Auto-clear cache if requested (for fresh test execution)
  if (config.clearSessionCache) {
    clearSessionCache();
  }
  
  // ✅ AUTO-DETECT PATTERNS if not provided
  if (!config.searchPatterns || config.searchPatterns.length === 0) {
    config.searchPatterns = getTestFilePatterns();
  }
  const sessionTestDataDir = process.env.REPORTS_DIR 
    ? path.join(process.env.REPORTS_DIR, '..', 'testdata') 
    : path.join(__dirname, "..", "testdata");
  
  const defaultTestDataDir = path.join(__dirname, "..", "testdata");

  console.log(`🔍 Excel Path Resolution:`);
  console.log(`   Session TestData Dir: ${sessionTestDataDir}`);
  console.log(`   Default TestData Dir: ${defaultTestDataDir}`);
  console.log(`   Fallback File: ${config.fallbackFileName}`);

  // Priority 2: Check session testdata directory for uploaded files
  if (fs.existsSync(sessionTestDataDir)) {
    try {
      const sessionFiles = fs.readdirSync(sessionTestDataDir);
      // ✅ Exclude filtered_ files — raw Excel only for execution
      const excelFiles = sessionFiles.filter(f =>
        !f.startsWith('filtered_') && (f.endsWith('.xlsx') || f.endsWith('.xlsm')));
        if (excelFiles.length > 0) {
        // 🎯 ENHANCED: Use intelligent file matching instead of simple pattern matching
        if (config.searchPatterns) {
          console.log(`🔍 Trying intelligent file matching for uploaded files...`);
          
          // Try intelligent matching first
          for (const file of excelFiles) {
            const bestMatch = findBestMatchingTestSuite(file);
            if (bestMatch && FILE_PATTERN_MAPPING[bestMatch]) {
              const requiredPatterns = FILE_PATTERN_MAPPING[bestMatch];
              const lowerFile = file.toLowerCase();
              
              // Check if this file matches the patterns for the best match
              const matches = requiredPatterns.every(pattern => 
                lowerFile.includes(pattern.toLowerCase())
              );
              
              if (matches) {
                const filePath = path.join(sessionTestDataDir, file);
                console.log(`✅ Intelligent match found: ${file} → ${bestMatch}`);
                return filePath;
              }
            }
          }
          
          // Fallback: Try original pattern matching
          const matchingFiles = excelFiles.filter(file => {
            const lowerFile = file.toLowerCase();
            // ALL patterns must match for precise selection
            return config.searchPatterns!.every(pattern => 
              lowerFile.includes(pattern.toLowerCase())
            );
          });
          
          if (matchingFiles.length > 0) {
            // Use the most recently uploaded matching file
            const mostRecentMatching = matchingFiles
              .map(file => {
                const filePath = path.join(sessionTestDataDir, file);
                const stats = fs.statSync(filePath);
                return { name: file, path: filePath, mtime: stats.mtime.getTime() };
              })
              .sort((a, b) => b.mtime - a.mtime)[0];
            
            console.log(`✅ Using pattern-matched session Excel file: ${mostRecentMatching.name}`);
            return mostRecentMatching.path;
          }
        }
        
        // Fallback: Use the most recently uploaded file
        // const mostRecent = excelFiles
        //   .map(file => {
        //     const filePath = path.join(sessionTestDataDir, file);
        //     const stats = fs.statSync(filePath);
        //     return { name: file, path: filePath, mtime: stats.mtime.getTime() };
        //   })
        //   .sort((a, b) => b.mtime - a.mtime)[0];
        
        // console.log(`✅ Using most recent session Excel file: ${mostRecent.name}`);
        // return mostRecent.path;
      }
    } catch (error) {
      console.log(`⚠️ Error reading session testdata directory: ${error}`);
    }
  }

  // Priority 3: Check for fallback file in default testdata directory
  const fallbackPath = path.join(defaultTestDataDir, config.fallbackFileName);
  if (fs.existsSync(fallbackPath)) {
    console.log(`✅ Using fallback Excel file: ${config.fallbackFileName}`);
    return fallbackPath;
  }
  // Priority 4: Search for matching files using intelligent matching
  if (config.searchPatterns && fs.existsSync(defaultTestDataDir)) {
    try {
      const allFiles = fs.readdirSync(defaultTestDataDir);
      const excelFiles = allFiles.filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm'));
      
      console.log(`🔍 Trying intelligent file matching in default directory...`);
      
      // Try intelligent matching first
      for (const file of excelFiles) {
        const bestMatch = findBestMatchingTestSuite(file);
        if (bestMatch && FILE_PATTERN_MAPPING[bestMatch]) {
          const requiredPatterns = FILE_PATTERN_MAPPING[bestMatch];
          const lowerFile = file.toLowerCase();
          
          // Check if this file matches the patterns for the best match
          const matches = requiredPatterns.every(pattern => 
            lowerFile.includes(pattern.toLowerCase())
          );
          
          if (matches) {
            const selectedPath = path.join(defaultTestDataDir, file);
            console.log(`✅ Intelligent match found in default dir: ${file} → ${bestMatch}`);
            return selectedPath;
          }
        }
      }
      
      // Fallback: Try original pattern matching
      const matchingFiles = excelFiles.filter(file => {
        const lowerFile = file.toLowerCase();
        return config.searchPatterns!.every(pattern => 
          lowerFile.includes(pattern.toLowerCase())
        );
      });

      if (matchingFiles.length > 0) {
        const selectedFile = matchingFiles[0];
        const selectedPath = path.join(defaultTestDataDir, selectedFile);
        console.log(`✅ Using pattern-matched Excel file: ${selectedFile}`);
        return selectedPath;
      }
    } catch (error) {
      console.log(`⚠️ Error searching for pattern-matched files: ${error}`);
    }
  }
  // If nothing found, return the fallback path anyway (will cause error later with proper message)
  console.log(`❌ No Excel file found, returning fallback path: ${fallbackPath}`);
  return fallbackPath;
}

/**
 * ✅ SIMPLIFIED CONFIG CREATOR
 * Test files just need to provide fallback and result filenames
 * Patterns will be auto-detected based on test filename
 */
export function createAutoConfig(fallbackFileName: string, resultFileName: string): ExcelPathConfig {
  return {
    fallbackFileName,
    resultFileName,
    searchPatterns: [], // Will be auto-filled by resolveExcelPath
    clearSessionCache: true // Always clear cache for fresh mapping
  };
}

/**
 * Resolve result Excel file path with session support
 */
export function resolveResultPath(config: ExcelPathConfig): string {
  const sessionReportsDir = process.env.REPORTS_DIR || path.join(__dirname, "..", "reports");
  const resultPath = path.join(sessionReportsDir, config.resultFileName);
  
  console.log(`📊 Result path: ${resultPath}`);
  
  // Ensure reports directory exists
  if (!fs.existsSync(sessionReportsDir)) {
    fs.mkdirSync(sessionReportsDir, { recursive: true });
    console.log(`📁 Created reports directory: ${sessionReportsDir}`);
  }
  
  return resultPath;
}

/**
 * Validate Excel file exists and provide helpful error message
 */
export function validateExcelFile(excelPath: string): void {
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found: ${excelPath}`);
    
    // List available Excel files for debugging
    const dir = path.dirname(excelPath);
    console.log(`📂 Available files in directory ${dir}:`);
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const excelFiles = files.filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm'));
        if (excelFiles.length > 0) {
          console.log(`   Excel files: ${excelFiles.join(', ')}`);
        } else {
          console.log(`   No Excel files found`);
        }
        console.log(`   Total files: ${files.length}`);
      } else {
        console.log(`   Directory does not exist`);
      }
    } catch (err) {
      console.log(`   Error reading directory: ${err}`);
    }
    throw new Error(`Excel file not found: ${excelPath}`);
    
  }

  // Log file info
  const stats = fs.statSync(excelPath);
  console.log(`✅ Excel file validated: ${path.basename(excelPath)} (${stats.size} bytes)`);
}
