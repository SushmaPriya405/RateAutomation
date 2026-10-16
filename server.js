const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const archiver = require('archiver');
const xlsx = require('xlsx'); // 🎯 NEW: Add Excel reading capability

const { 
    processExcelForDynamicFiltering, 
    getFilteredTestPreview, 
    cleanupFilteredFiles 
} = require('./utils/excel-dynamic-filter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]    }
});
const PORT = process.env.PORT || 3003;
const executionAbortFile = path.join(process.cwd(), 'execution-aborted.flag');

// Session management for 30 concurrent users
const activeSessions = new Map();
const sessionWindows = new Map(); // Track session-specific terminal windows
const MAX_CONCURRENT_USERS = 300;
const EXECUTION_EVENT_PREFIX = 'EXECUTION_EVENT:';

// Generate unique session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Create session directories
function createSessionDirectories(sessionId) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    const testDataDir = path.join(sessionDir, 'testdata');
    const reportsDir = path.join(sessionDir, 'reports');
    
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }
    if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir, { recursive: true });
    }
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }
      return { sessionDir, testDataDir, reportsDir };
}

function clearSessionReports(sessionId) {
    const reportsDir = path.join(__dirname, 'sessions', sessionId, 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
        return;
    }

    for (const entry of fs.readdirSync(reportsDir)) {
        fs.rmSync(path.join(reportsDir, entry), { recursive: true, force: true });
    }
    console.log(`🧹 Cleared previous reports for session ${sessionId}`);
}

// 🎯 NEW: Excel reading function to extract test case names and check GEN_TC inclusion
function readTestCaseNamesFromExcel(filePath, maxRecord = 10) {
    const allTestCaseNames = [];
    const allIncludeFlags = []; // Track which tests to include/exclude
    
    try {
        console.log(`📊 Reading test case names from Excel: ${filePath}`);
        
        // Read Excel file
        const workbook = xlsx.readFile(filePath);
        
        // Check if Summary sheet exists
        if (!workbook.SheetNames.includes('Summary')) {
            console.log('⚠️ Summary sheet not found, returning default names');
            // Return default names if Summary sheet not found
            for (let i = 1; i <= maxRecord; i++) {
                allTestCaseNames.push(`Test_${i}`);
                allIncludeFlags.push(true); // Include all by default
            }
            return { testCaseNames: allTestCaseNames, includeFlags: allIncludeFlags };
        }
        
        // Read Summary sheet
        const summarySheet = workbook.Sheets['Summary'];
        const summaryData = xlsx.utils.sheet_to_json(summarySheet, { raw: false });
        
        console.log(`📋 Found ${summaryData.length} rows in Summary sheet`);
        
        // 🎯 STEP 1: Read ALL test cases from Excel (not limited by maxRecord)
        for (let i = 0; i < summaryData.length; i++) {
            const row = summaryData[i];
            const testCaseTitle = row['TC_Title'] || row["Suggested Test Case Title"] || row['tc_title'] || row['Test_Title'] || `Test_${i + 1}`;
            
            // Check GEN_TC column for include/exclude flag
            const genTC = row['GEN_TC'] || row['gen_tc'] || row['Gen_TC'] || '';
            const shouldInclude = ['Yes', 'Y', 'yes', 'y', 'YES'].includes(genTC.toString().trim());
            
            allTestCaseNames.push(testCaseTitle);
            allIncludeFlags.push(shouldInclude);
            
            if (i < 20) { // Only log first 20 for debugging
                console.log(`📝 Test ${i + 1}: ${testCaseTitle} | GEN_TC: ${genTC} | Include: ${shouldInclude ? '✅' : '❌'}`);
            }
        }
        
        // 🎯 STEP 2: Filter to get only included tests
        const includedTestCaseNames = [];
        const includedFlags = [];
        
        for (let i = 0; i < allTestCaseNames.length; i++) {
            if (allIncludeFlags[i]) {
                includedTestCaseNames.push(allTestCaseNames[i]);
                includedFlags.push(true);
            }
        }
        
        console.log(`🎯 Filter Results: Total=${allTestCaseNames.length}, Included=${includedTestCaseNames.length}, MaxRecord=${maxRecord}`);
          // 🎯 STEP 3: Apply maxRecord limit to the INCLUDED tests only
        const finalTestCaseNames = includedTestCaseNames.slice(0, Math.min(maxRecord, includedTestCaseNames.length));
        const finalIncludeFlags = includedFlags.slice(0, Math.min(maxRecord, includedTestCaseNames.length));
        
        // 🎯 DON'T fill remaining slots - only return actual included tests
        console.log(`✅ Final result: ${finalTestCaseNames.length} test cases (included=${includedTestCaseNames.length}, maxRecord: ${maxRecord})`);
        return { testCaseNames: finalTestCaseNames, includeFlags: finalIncludeFlags };
        
    } catch (error) {
        console.error('❌ Error reading test case names from Excel:', error.message);
        // Return default names on error
        const errorTestCaseNames = [];
        const errorIncludeFlags = [];
        for (let i = 1; i <= maxRecord; i++) {
            errorTestCaseNames.push(`Test_${i}`);
            errorIncludeFlags.push(true);
        }
        return { testCaseNames: errorTestCaseNames, includeFlags: errorIncludeFlags };
    }
}

// Middleware
app.use(express.json());
app.use(express.static('web-interface'));

// Session-based storage configuration
const createSessionStorage = (sessionId) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const sessionDirs = createSessionDirectories(sessionId);
            cb(null, sessionDirs.testDataDir);
        },
        filename: (req, file, cb) => {
            const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext);
            cb(null, `${name}_${timestamp}${ext}`);
        }
    });
};

// Create session-based multer instance
const createSessionUpload = (sessionId) => {
    return multer({ 
        storage: createSessionStorage(sessionId),
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['.xlsx', '.xlsm', '.xls'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowedTypes.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only Excel files are allowed.'));
            }
        },
        limits: {
            fileSize: 50 * 1024 * 1024 // 50MB limit
        }
    });
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-interface', 'index.html'));
});

// Get available environments endpoint
app.get('/api/environments', (req, res) => {
    try {
        const environments = [
            {
                name: 'test',
                displayName: 'Test Environment',
                description: 'Default testing environment',
                icon: '🧪'
            },
            {
                name: 'staging',
                displayName: 'Staging Environment', 
                description: 'Staging environment for pre-production testing',
                icon: '🔄'
            },
            {
                name: 'dev',
                displayName: 'Development Environment',
                description: 'Development environment for feature testing',
                icon: '⚙️'
            },
            {
                name: 'prod',
                displayName: 'Production Environment',
                description: 'Production environment - use with caution',
                icon: '🚨'
            }
        ];
        
        res.json({
            success: true,
            environments: environments,
            default: 'test'
        });
    } catch (error) {
        console.error('Environments API error:', error);
        res.status(500).json({ error: 'Failed to get environments' });
    }
});

// API to get maxrecord for a specific LOB
app.get('/api/maxrecord/:lob', (req, res) => {
    try {
        const lob = req.params.lob;
        const maxRecord = readMaxRecordFromTestFile(lob);
        res.json({ 
            success: true, 
            lob: lob,
            maxrecord: maxRecord 
        });
    } catch (error) {
        console.error('Error getting maxrecord:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            maxrecord: 1 // Default fallback
        });
    }
});

// Session initialization endpoint
app.get('/api/session', (req, res) => {
    try {
        // Check if we're at max capacity
        if (activeSessions.size >= MAX_CONCURRENT_USERS) {
            return res.status(503).json({ 
                error: 'Maximum concurrent users reached. Please try again later.',
                maxUsers: MAX_CONCURRENT_USERS,
                currentUsers: activeSessions.size
            });
        }

        const sessionId = generateSessionId();
        const sessionData = {
            id: sessionId,
            createdAt: new Date(),
            lastActivity: new Date(),
            status: 'active',

            executionState: {
                status: 'NOT_STARTED',
                currentRunningTest: null,
                currentTestName: null,
                completed: false,
                reportsReady: false,
                completionEventSent: false,
                tests: {}
            }
        };
        
        activeSessions.set(sessionId, sessionData);
        createSessionDirectories(sessionId);
        
        console.log(`👤 New session created: ${sessionId} (${activeSessions.size}/${MAX_CONCURRENT_USERS} users)`);
        
        res.json({
            success: true,
            sessionId: sessionId,
            activeUsers: activeSessions.size,
            maxUsers: MAX_CONCURRENT_USERS
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Session-based file upload endpoint
app.post('/api/upload/:sessionId', (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Update last activity
        const session = activeSessions.get(sessionId);
        session.lastActivity = new Date();
        activeSessions.set(sessionId, session);

        // Create session-specific upload handler
        const sessionUpload = createSessionUpload(sessionId);
        
        sessionUpload.single('excelFile')(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).json({ error: 'File upload failed' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }            console.log(`📁 File uploaded for session ${sessionId}: ${req.file.filename}`);

            const sessionTestDataDir = path.dirname(req.file.path);
            for (const entry of fs.readdirSync(sessionTestDataDir)) {
                if (entry === req.file.filename || !/\.(xlsx|xlsm|xls)$/i.test(entry)) continue;
                fs.rmSync(path.join(sessionTestDataDir, entry), { force: true });
            }
            
            // 🎯 DYNAMIC FILTERING: Process Excel file and create filtered version
            try {
                console.log(`🔍 Processing Excel for dynamic GEN_TC filtering...`);
                
                // Detect LOB from filename for proper processing
                const fileName = req.file.filename;
                const normalizedFileName = fileName.toLowerCase().replace(/[_\-\s]+/g, '');
                let detectedLOB = 'Unknown';

                const convertedTableLobs = {
                    db: 'Core_Dwelling_Basic',
                    dwb: 'Core_Dwelling_Basic',
                    ds: 'Core_Dwelling_Special',
                    dws: 'Core_Dwelling_Special',
                    dwsp: 'Core_Dwelling_Special',
                    ho: 'Core_HomeOwners',
                    mh: 'Core_Manufactured_Home',
                    cv: 'Core_CV',
                    ms: 'Core_MS',
                    bt: 'Core_BT',
                    yt: 'Core_YT'
                };
                const convertedTableMatch = normalizedFileName.match(/^[a-z]{2}(dwb|db|dwsp|dws|ds|ho[a-z0-9]*|mh|cv|ms|bt|yt)convertedtable\d*\.(?:xlsm|xlsx|xls)$/i);
                if (convertedTableMatch) {
                    const code = convertedTableMatch[1].toLowerCase();
                    detectedLOB = code.startsWith('ho') ? convertedTableLobs.ho : convertedTableLobs[code];
                }

                const lobRules = [
                    // Core (Policy Change / Renewal)
                    { pattern: /dwellingbasic.*test.*case.*generator.*policy.*change|dwelling.*basic.*test.*case.*generator.*renewal/i, lob: 'Core_Dwelling_Basic' },
                    { pattern: /dwellingspecial.*test.*case.*generator.*policy.*change|dwelling.*special.*test.*case.*generator.*renewal/i, lob: 'Core_Dwelling_Special' },
                    { pattern: /homeowners.*test.*case.*generator.*policy.*change|homeowners.*test.*case.*generator.*renewal/i, lob: 'Core_HomeOwners' },
                    { pattern: /manufactured.*home.*test.*case.*generator.*policy.*change|manufactured.*home.*test.*case.*generator.*renewal/i, lob: 'Core_Manufactured_Home' },
                    { pattern: /collectorvehicle.*test.*case.*generator.*policy.*change|collectorvehicle.*test.*case.*generator.*renewal/i, lob: 'Core_CV' },
                    { pattern: /motorsports.*test.*case.*generator.*policy.*change|motorsports.*test.*case.*generator.*renewal/i, lob: 'Core_MS' },
                    { pattern: /boat.*test.*case.*generator.*policy.*change|boat.*test.*case.*generator.*renewal/i, lob: 'Core_BT' },
                    { pattern: /yacht.*test.*case.*generator.*policy.*change|yacht.*test.*case.*generator.*renewal/i, lob: 'Core_YT' },

                ];

                if (detectedLOB === 'Unknown') {
                    for (const rule of lobRules) {
                        if (rule.pattern.test(normalizedFileName)) {
                            detectedLOB = rule.lob;
                            break;
                        }
                    }
                }
                
                console.log(`🎯 Detected LOB: ${detectedLOB} from filename: ${fileName}`);
                
                // Process Excel file for dynamic filtering
                const filterResult = processExcelForDynamicFiltering(req.file.path, sessionId, detectedLOB);
                
                if (filterResult.success) {
                    console.log(`✅ Dynamic filtering successful!`);
                    console.log(`   📊 Total tests: ${filterResult.totalTests}`);
                    console.log(`   ✅ Included tests: ${filterResult.includedTests}`);
                    console.log(`   📝 Test names: ${filterResult.testCaseNames.slice(0, 3).join(', ')}${filterResult.testCaseNames.length > 3 ? '...' : ''}`);
                      // 🎯 STORE filtering results in session for progress tracking and test execution
                    const session = activeSessions.get(sessionId);
                    session.originalExcelPath = filterResult.originalFilePath;
                    session.filteredExcelPath = filterResult.filteredFilePath;
                    session.totalTestsInExcel = filterResult.totalTests;
                    session.includedTestsCount = filterResult.includedTests;
                    session.includedRowNumbers = filterResult.includedRowNumbers; // e.g., [4, 7]
                    session.testCaseNames = filterResult.testCaseNames;
                    session.detectedLOB = detectedLOB;
                    session.dynamicFilteringEnabled = true;
                    session.rowMapping = filterResult.rowMapping; // 🎯 NEW: Store row mapping
                    activeSessions.set(sessionId, session);
                    
                    // Legacy support for existing readTestCaseNamesFromExcel calls
                    const includedTests = filterResult.includedRowNumbers;
                    const includedNames = filterResult.testCaseNames;
                    
                } else {
                    console.log(`⚠️ Dynamic filtering failed: ${filterResult.error}`);
                    console.log(`📝 Falling back to original Excel file processing...`);
                    
                    // Fallback to original method
                    const excelData = readTestCaseNamesFromExcel(req.file.path, 10);
                    const testCaseNames = excelData.testCaseNames;
                    const includeFlags = excelData.includeFlags;
                    
                    // Filter only included test cases
                    const includedTests = [];
                    const includedNames = [];
                    for (let i = 0; i < testCaseNames.length; i++) {
                        if (includeFlags[i]) {
                            includedTests.push(i + 1); // Test numbers (1-based)
                            includedNames.push(testCaseNames[i]);
                        }
                    }
                    
                    console.log(`✅ Fallback processing - Total: ${testCaseNames.length}, Included: ${includedNames.length}`);
                    
                    // Store fallback results
                    const session = activeSessions.get(sessionId);
                    session.includedTestsCount = includedNames.length;
                    session.testCaseNames = includedNames;
                    session.dynamicFilteringEnabled = false;
                    activeSessions.set(sessionId, session);
                }
                // 🎯 Get session for response
                const session = activeSessions.get(sessionId);
                
                // 🎯 ENHANCED RESPONSE: Include dynamic filtering information
                const responseData = {
                    success: true,
                    message: 'File uploaded and processed successfully',
                    filename: req.file.filename,
                    sessionId: sessionId,
                      // 🎯 DYNAMIC FILTERING DATA
                    dynamicFiltering: {
                        enabled: session.dynamicFilteringEnabled || false,
                        totalTestsInExcel: session.totalTestsInExcel || 0,
                        includedTestsCount: session.includedTestsCount || 0,
                        excludedCount: (session.totalTestsInExcel || 0) - (session.includedTestsCount || 0),
                        detectedLOB: session.detectedLOB || 'Unknown',
                        testCaseNames: session.testCaseNames || [],
                        includedRowNumbers: session.includedRowNumbers || [], // e.g., [4, 7]
                        rowMapping: session.rowMapping || [], // 🎯 NEW: Row mapping info
                        filteredFilePath: session.filteredExcelPath || req.file.path
                    },
                    
                    // Legacy compatibility
                    testCases: {
                        total: session.totalTestsInExcel || 0,
                        included: session.includedTestsCount || 0,
                        names: session.testCaseNames || []
                    }
                };
                  console.log(`💾 Session data updated for ${sessionId}:`);
                console.log(`   🎯 Dynamic filtering: ${responseData.dynamicFiltering.enabled ? 'ENABLED' : 'DISABLED'}`);
                console.log(`   📊 Tests: ${responseData.dynamicFiltering.includedTestsCount}/${responseData.dynamicFiltering.totalTestsInExcel}`);
                console.log(`   🎭 LOB: ${responseData.dynamicFiltering.detectedLOB}`);
                
                // Send enhanced response
                res.json(responseData);
                
            } catch (excelError) {
                console.error('❌ Error processing Excel file:', excelError);
                res.json({
                    success: true,
                    message: 'File uploaded but Excel processing failed',
                    filename: req.file.filename,
                    sessionId: sessionId,
                    dynamicFiltering: { enabled: false },                    dynamicFiltering: { enabled: false },
                    testCases: { total: 0, included: 0, names: [] }
                });
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Environment validation function
function validateEnvironment(requestedEnv) {
    const validEnvironments = ['test', 'test2', 'datemove', 'lab2', 'preprod'];
    const defaultEnv = 'test';
    
    console.log(`🔍 Server-side Environment Validation:`);
    console.log(`   Requested: "${requestedEnv || 'not specified'}"`);
    
    // If no environment specified, use default
    if (!requestedEnv || requestedEnv.trim() === '') {
        console.log(`   ✅ No environment specified, using default: ${defaultEnv}`);
        return defaultEnv;
    }
    
    // Normalize environment name
    const normalizedEnv = requestedEnv.toLowerCase();
    
    // Check if environment is valid
    if (validEnvironments.includes(normalizedEnv)) {
        if (normalizedEnv === 'prod') {
            console.warn(`   🚨 WARNING: Production environment selected!`);
        }
        console.log(`   ✅ Valid environment: ${normalizedEnv}`);
        return normalizedEnv;
    }
    
    // Invalid environment - fallback to default
    console.log(`   ⚠️  Invalid environment "${requestedEnv}", falling back to: ${defaultEnv}`);
    console.log(`   📋 Valid environments: ${validEnvironments.join(', ')}`);
    return defaultEnv;
}

// Session-based test execution endpoint
app.post('/api/run-tests/:sessionId', async (req, res) => {
    try {        const sessionId = req.params.sessionId;
        const { testFile, lob, environment = 'test', uploadedFileName } = req.body;
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        // Validate and normalize environment
        const validatedEnvironment = validateEnvironment(environment);        // Update last activity
        const session = activeSessions.get(sessionId);

        // A previous abort can leave the legacy process-wide flag behind if
        // the runner was closed before its close handler cleaned it up. Never
        // let that stale flag abort a newly started run.
        if (fs.existsSync(executionAbortFile)) {
            fs.rmSync(executionAbortFile, { force: true });
            console.log(`🧹 Cleared stale execution abort flag before starting ${sessionId}`);
        }

        clearSessionReports(sessionId);
        session.lastActivity = new Date();
        session.status = 'running_tests';
        session.executionState = {
            status: 'RUNNING',
            currentRunningTest: null,
            currentTestName: null,
            completed: false,
            reportsReady: false,
            completionEventSent: false,
            tests: {}
        };
        session.environment = validatedEnvironment; // Store validated environment in session
        session.uploadedFileName = uploadedFileName; // 🔧 Store uploaded file name for abort scenarios
        session.abortRequested = false;
        session.abortFinalized = false;
        session.abortedTestNumber = null;
        session.runToken = crypto.randomBytes(16).toString('hex');
        session.currentTestIndex = 0;
        session.currentTestCaseName = '';
        activeSessions.set(sessionId, session);
        emitSessionChanged(sessionId);
        
        console.log(`🚀 Starting tests for session ${sessionId}, LOB: ${lob}, Environment: ${validatedEnvironment}, Test file: ${testFile}`);
        
        // Map LOB to test file (using exact test names)
        const testMappings = {
            'Core_Dwelling_Basic': './tests/Core_Dwelling_Basic.spec.ts',
            'Core_Dwelling_Special': './tests/Core_Dwelling_Special.spec.ts',
            'Core_HomeOwners': './tests/Core_HomeOwners.spec.ts',
            'Core_CV': './tests/Core_CV.spec.ts',
            'Core_MS': './tests/Core_MS.spec.ts',
            'Core_Manufactured_Home': './tests/Core_Manufactured_Home.spec.ts',
            'Core_BT': './tests/Core_BT.spec.ts',
            'Core_YT': './tests/Core_YT.spec.ts',
            // Backward compatibility alias: Renewal now executes with Core spec
            'Renewal_DB': './tests/Core_Dwelling_Basic.spec.ts'
        };

        const testFilePath = testMappings[lob];
        
        if (!testFilePath) {
            return res.status(400).json({ error: 'Invalid LOB selected' });
        }

        // Check if test file exists
        if (!fs.existsSync(testFilePath)) {
            return res.status(404).json({ error: `Test file not found: ${testFilePath}` });
        }        // Execute Playwright tests with session isolation
        const result = await runSessionBasedTests(sessionId, testFilePath, lob, validatedEnvironment, uploadedFileName, session.runToken);
        
        // console.log('RUN TEST RESULT:', result);
        
        
        res.json({
            success: true,
            message: 'Tests executed successfully',
            lob: lob,
            testFile: testFilePath,
            results: result,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Test execution error:', error);
        res.status(500).json({ 
            error: 'Test execution failed', 
            details: error.message 
        });
    }
});

// Abort tests endpoint
app.post('/api/abort-tests/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        console.log(`🛑 Abort requested for session ${sessionId}`);
        console.log(`📊 Active sessions count: ${activeSessions.size}`);
        console.log(`📋 Available sessions: ${Array.from(activeSessions.keys()).join(', ')}`);
        // Validate session
        if (!activeSessions.has(sessionId)) {
            console.error(`❌ Session not found: ${sessionId}`);
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        const session = activeSessions.get(sessionId);
        console.log(`📦 Session found:`, {
            status: session.status,
            hasProcess: !!session.process,
            processKilled: session.process ? session.process.killed : 'N/A',
            processPid: session.process ? session.process.pid : 'N/A'
        });
          // AGGRESSIVE BROWSER KILLING - Check if there's a running process for this session
        if (session.process && !session.process.killed) {
            console.log(`🛑 FORCE KILLING ALL BROWSERS for session ${sessionId}, PID: ${session.process.pid}`);
            
            // STEP 1: Kill main process tree first
            try {
                session.abortRequested = true;
                const runningTestNumber = session.executionState?.currentRunningTest || session.currentTestIndex;
                session.abortedTestNumber = runningTestNumber || null;
                if (runningTestNumber) {
                    handleExecutionEvent(sessionId, {
                        type: 'TEST_ABORTED',
                        testNumber: runningTestNumber,
                        testName: session.currentTestCaseName || ''
                    });
                }
                activeSessions.set(sessionId, session);

                // Persistent execution flag
                fs.writeFileSync(
                    executionAbortFile,
                    'ABORTED',
                    'utf8'
                );
                
                
            } catch (killError) {
                console.error(`❌ Error in aggressive browser killing: ${killError.message}`);
            }
            
        } else {
            console.log(`⚠️ No active process found for session ${sessionId}`);
            if (session.process && session.process.killed) {
                console.log(`   Process already killed`);
            } else {
                console.log(`   No process reference in session`);
            }
        }
        session.status = 'abort_requested';
        session.lastActivity = new Date();        // 🔧 NEW SEPARATE PARTIAL REPORTING SYSTEM (NOT TOUCHING EXISTING LOGIC)
        let lobForReports = session.currentLOB;
        
        console.log(`🔍 Debug - Session details for ${sessionId}:`, {
            currentLOB: session.currentLOB,
            uploadedFileName: session.uploadedFileName,
            status: session.status,
            hasProcess: !!session.process,
            hasOutput: !!session.fullOutput
        });
        
        // Fallback: Try to detect LOB from uploaded filename if currentLOB is not set
        if (!lobForReports && session.uploadedFileName) {
            if (session.uploadedFileName.includes('Core') || session.uploadedFileName.includes('CORE')) {
                lobForReports = 'CORE_DB';
            } else if (session.uploadedFileName.includes('DWB')) {
                lobForReports = 'DWB_CORE';
            } else {
                lobForReports = 'Test'; // Generic fallback
            }
            console.log(`📊 LOB detected from filename: ${lobForReports} (from: ${session.uploadedFileName})`);
        }        if (lobForReports) {
            console.log(`🛑 NEW ABORT FLOW: Generating dedicated abort reports for: ${lobForReports}`);
            console.log(`🔧 DEBUG: About to call generateAbortReports(${sessionId}, ${lobForReports})`);
            
        } else {
            console.log(`⚠️ No LOB identified for partial reports. Session: ${sessionId}`);
            console.log(`🔧 DEBUG: session.currentLOB = ${session.currentLOB}`);
            console.log(`🔧 DEBUG: session.uploadedFileName = ${session.uploadedFileName}`);
        }
        
        activeSessions.set(sessionId, session);
        finalizeSessionAbort(sessionId, session.abortedTestNumber);

        if (lobForReports) {
            copyPartialReportsToSession(sessionId, lobForReports, session.runToken).catch((error) => {
                console.error(`❌ Immediate abort report copy failed for ${sessionId}:`, error);
            });
        }
        
        console.log(`📝 Session status updated to 'abort_requested' for ${sessionId}`);// STEP 3: Targeted cleanup after 2 seconds to ensure test browsers are killed
        
        console.log(
            `🛑 Sending aborted status for test ${session.currentTestIndex}`
        );
        const runningTestNumber = session.executionState?.currentRunningTest || session.currentTestIndex;
        session.abortedTestNumber = session.abortedTestNumber || runningTestNumber || null;
        if (runningTestNumber) {
            handleExecutionEvent(sessionId, {
                type: 'TEST_ABORTED',
                testNumber: runningTestNumber,
                testName: session.currentTestCaseName || ''
            });
        }
        
        res.json({
            success: true,
            message: 'Tests aborted successfully - All browser windows closed',
            sessionId: sessionId,
            processWasRunning: !!session.process,
            browsersClosed: true
        });
        
        console.log(`✅ Abort response sent for session ${sessionId} - Browsers forced closed`);
        
    } catch (error) {
        console.error('❌ Abort tests error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to abort tests',
            details: error.message 
        });    }
});


function generateAbortReports(sessionId, lob) {
    try {
        console.log(`🛑 ABORT: Generating separate abort reports for ${lob}, session: ${sessionId}`);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const baseReportsDir = path.join(__dirname, 'reports');
        const basePdfDir = path.join(baseReportsDir, 'pdf-report');
        
        // 🎯 NEW: Get session data for real-time captured information
        const session = activeSessions.get(sessionId);
        const capturedData = session?.capturedData || {
            accountNumber: 'Not Generated - Test Aborted',
            submissionNumber: 'Not Generated - Test Aborted', 
            policyNumber: 'Not Generated - Test Aborted'
        };
        
        console.log(`🔍 ABORT: Using captured data:`, capturedData);
         
        console.log(`✅ ABORT: Reports generated for ${lob} with timestamp ${timestamp}`);
        
    } catch (error) {
        console.error(`❌ ABORT: Error generating abort reports for ${lob}:`, error);
    }
}

// 📊 Generate Excel report for aborted test
function generateAbortExcelReport(sessionId, lob, timestamp, reportsDir, capturedData, session = null) {
    try {
        const excelFileName = `${lob}_ABORTED_${timestamp}.xlsx`;
        const excelPath = path.join(reportsDir, excelFileName);
        
        // 🎯 ENHANCED: Use real captured data instead of dummy data
        const accountNumber = capturedData.accountNumber === '##' ? 'Not Generated - Test Aborted' : capturedData.accountNumber;
        const submissionNumber = capturedData.submissionNumber === '##' ? 'Not Generated - Test Aborted' : capturedData.submissionNumber;
        const policyNumber = capturedData.policyNumber === '##' ? 'Not Generated - Test Aborted' : capturedData.policyNumber;
        
        // 🎯 NEW: Get current test case name and number from session
        let testCaseTitle = lob; // Default fallback
        let currentTestNumber = 'Unknown';
        
        if (session && session.currentTestCaseName) {
            testCaseTitle = session.currentTestCaseName;
        } else if (session && session.testCaseNames && session.currentTestIndex) {
            testCaseTitle = session.testCaseNames[session.currentTestIndex - 1] || lob;
        }
        
        if (session && session.currentTestIndex) {
            currentTestNumber = session.currentTestIndex;
        }
        
        console.log(`📊 Excel Title Info - Test Case: ${testCaseTitle}, Current Test: ${currentTestNumber}`);
        
        // 🔍 Log what data we're using
        console.log(`📊 ABORT Excel Generation - Using Data:`);
        console.log(`   Account Number: ${accountNumber}`);
        console.log(`   Submission Number: ${submissionNumber}`);
        console.log(`   Policy Number: ${policyNumber}`);
        
        // Create proper Excel file using existing Excel utils
        try {
            // Try to use existing Excel utils for proper formatting
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('ABORT REPORT');
            
            // Add abort data
            worksheet.columns = [
                { header: 'Test Case', key: 'testCase', width: 30 },
                { header: 'Status', key: 'status', width: 25 },
                { header: 'Timestamp', key: 'timestamp', width: 20 },
                { header: 'Account Number', key: 'accountNumber', width: 20 },
                { header: 'Submission Number', key: 'submissionNumber', width: 20 },
                { header: 'Policy Number', key: 'policyNumber', width: 20 },
                { header: 'Notes', key: 'notes', width: 50 }
            ];
              // 🎯 ENHANCED: Add abort data row with REAL captured data and proper title
            const testCaseDisplayTitle = submissionNumber !== 'Not Generated - Test Aborted' 
                ? `${submissionNumber} - ${testCaseTitle}` 
                : testCaseTitle;
                
            worksheet.addRow({
                testCase: `${testCaseDisplayTitle} - ABORTED`,
                status: 'ABORTED - Test manually stopped',
                timestamp: new Date().toLocaleString(),
                accountNumber: accountNumber,
                submissionNumber: submissionNumber, 
                policyNumber: policyNumber,
                notes: `Test was manually aborted before completion. Current Test: ${currentTestNumber}. ${accountNumber !== 'Not Generated - Test Aborted' ? 'Account creation was successful.' : ''} ${submissionNumber !== 'Not Generated - Test Aborted' ? 'Submission was generated.' : ''} ${policyNumber !== 'Not Generated - Test Aborted' ? 'Policy was created.' : ''} Partial data may be available in base reports.`.trim()
            });
            
            // Style the header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE3F2FD' }
            };
            
            // 🎯 ENHANCED: Color coding for data availability
            const dataRow = worksheet.getRow(2);
            
            // Green cells for successfully generated data, red for missing data
            if (accountNumber !== 'Not Generated - Test Aborted') {
                dataRow.getCell('accountNumber').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE8F5E8' } // Light green
                };
            } else {
                dataRow.getCell('accountNumber').fill = {
                    type: 'pattern',
                    pattern: 'solid', 
                    fgColor: { argb: 'FFFFEAEA' } // Light red
                };
            }
            
            if (submissionNumber !== 'Not Generated - Test Aborted') {
                dataRow.getCell('submissionNumber').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE8F5E8' } // Light green
                };
            } else {
                dataRow.getCell('submissionNumber').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFEAEA' } // Light red
                };
            }
            
            if (policyNumber !== 'Not Generated - Test Aborted') {
                dataRow.getCell('policyNumber').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE8F5E8' } // Light green
                };
            } else {
                dataRow.getCell('policyNumber').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFEAEA' } // Light red
                };
            }
            
            // Save as proper Excel file
            workbook.xlsx.writeFile(excelPath);
            console.log(`📊 ABORT Excel created with real data (proper format): ${excelFileName}`);
            
        } catch (excelError) {
            console.log(`⚠️ ExcelJS not available, using simple CSV format...`);
            
            // Fallback: Create simple CSV file with .csv extension
            const csvFileName = `${lob}_ABORTED_${timestamp}.csv`;
            const csvPath = path.join(reportsDir, csvFileName);
              const testCaseDisplayTitleCsv = submissionNumber !== 'Not Generated - Test Aborted' 
                ? `${submissionNumber} - ${testCaseTitle}` 
                : testCaseTitle;
                
            const csvContent = `Test Case,Status,Timestamp,Account Number,Submission Number,Policy Number,Notes
"${testCaseDisplayTitleCsv} - ABORTED","ABORTED - Test manually stopped","${new Date().toLocaleString()}","${accountNumber}","${submissionNumber}","${policyNumber}","Test was manually aborted before completion. Current Test: ${currentTestNumber}. ${accountNumber !== 'Not Generated - Test Aborted' ? 'Account creation was successful. ' : ''}${submissionNumber !== 'Not Generated - Test Aborted' ? 'Submission was generated. ' : ''}${policyNumber !== 'Not Generated - Test Aborted' ? 'Policy was created. ' : ''}Partial data may be available."`;
              fs.writeFileSync(csvPath, csvContent, 'utf8');
            console.log(`📊 ABORT CSV created with real data: ${csvFileName}`);
        }        
    } catch (error) {
        console.error(`❌ ABORT Excel generation error:`, error);
    }
}

// 📋 Generate PDF report for aborted test  
function generateAbortPdfReport(sessionId, lob, timestamp, pdfDir, capturedData) {
    try {
        const pdfFileName = `${lob}_ABORTED_${timestamp}.pdf`;
        const pdfPath = path.join(pdfDir, pdfFileName);
        
        // 🎯 ENHANCED: Use real captured data instead of dummy data
        const accountNumber = capturedData.accountNumber === '##' ? 'Not Generated - Test Aborted' : capturedData.accountNumber;
        const submissionNumber = capturedData.submissionNumber === '##' ? 'Not Generated - Test Aborted' : capturedData.submissionNumber;
        const policyNumber = capturedData.policyNumber === '##' ? 'Not Generated - Test Aborted' : capturedData.policyNumber;
          // 🎯 NEW: Get current test case name from session
        const session = activeSessions.get(sessionId);
        let testCaseTitle = lob; // Default fallback
        let currentTestNumber = 'Unknown';
        
        console.log(`🔍 PDF Debug - Session data for ${sessionId}:`, {
            hasSession: !!session,
            currentTestCaseName: session?.currentTestCaseName,
            currentTestIndex: session?.currentTestIndex,
            testCaseNamesLength: session?.testCaseNames?.length,
            firstThreeTestNames: session?.testCaseNames?.slice(0, 3)
        });
        
        if (session && session.currentTestCaseName) {
            testCaseTitle = session.currentTestCaseName;
            console.log(`✅ Using currentTestCaseName: ${testCaseTitle}`);
        } else if (session && session.testCaseNames && session.currentTestIndex) {
            // Try to get from stored test case names
            testCaseTitle = session.testCaseNames[session.currentTestIndex - 1] || lob;
            console.log(`✅ Using testCaseNames[${session.currentTestIndex - 1}]: ${testCaseTitle}`);
        } else if (session && session.testCaseNames && session.testCaseNames.length > 0) {
            // Fallback to first test case if we have test names
            testCaseTitle = session.testCaseNames[0];
            console.log(`⚠️ Fallback to first test case: ${testCaseTitle}`);
        } else {
            console.log(`❌ No test case name found, using LOB: ${lob}`);
        }        
        if (session && session.currentTestIndex) {
            currentTestNumber = session.currentTestIndex;
        } else {
            currentTestNumber = 1; // Default fallback
        }
        
        console.log(`📋 PDF Title Info - Test Case: ${testCaseTitle}, Current Test: ${currentTestNumber}, Submission: ${submissionNumber}`);
        
        // 🔍 Log what data we're using
        console.log(`📋 ABORT PDF Generation - Using Data:`);
        console.log(`   Account Number: ${accountNumber}`);
        console.log(`   Submission Number: ${submissionNumber}`);
        console.log(`   Policy Number: ${policyNumber}`);
          // Collect available screenshots from current test run
        const screenshotDataDir = path.join(pdfDir, 'data');
        let screenshotInfo = 'No screenshots captured before abort';
        let screenshotCount = 0;
          // Collect and sort available screenshots
        let screenshotPaths = [];
        let screenshotFiles = [];
        
        if (fs.existsSync(screenshotDataDir)) {
            try {
                const subdirs = fs.readdirSync(screenshotDataDir);
                const latestDir = subdirs
                    .map(dir => {
                        const dirPath = path.join(screenshotDataDir, dir);
                        const stats = fs.statSync(dirPath);
                        return { name: dir, mtime: stats.mtime.getTime() };
                    })
                    .sort((a, b) => b.mtime - a.mtime)[0];
                
                if (latestDir) {
                    const latestDirPath = path.join(screenshotDataDir, latestDir.name);
                    const pngFiles = fs.readdirSync(latestDirPath)
                        .filter(file => file.toLowerCase().endsWith('.png'))
                        .sort((a, b) => {
                            // Sort by number prefix (1_, 2_, etc.)
                            const aNum = parseInt(a.split('_')[0]);
                            const bNum = parseInt(b.split('_')[0]);
                            return aNum - bNum;
                        });
                    
                    screenshotFiles = pngFiles;
                    screenshotPaths = pngFiles.map(file => path.join(latestDirPath, file));
                    screenshotCount = pngFiles.length;
                    screenshotInfo = `${screenshotCount} screenshots captured before abort`;
                    console.log(`📸 ABORT: Found ${screenshotCount} screenshots in ${latestDir.name}`);
                }
            } catch (err) {
                console.log(`⚠️ ABORT: Error reading screenshots: ${err.message}`);
            }
        }

        // Create proper PDF using PDFMake
        try {
            const pdfMake = require('pdfmake/build/pdfmake');
            const pdfFonts = require('pdfmake/build/vfs_fonts');
            pdfMake.vfs = pdfFonts.vfs;            // Start with summary page content
            const docContent = [
                { 
                    text: submissionNumber !== 'Not Generated - Test Aborted' 
                        ? `${submissionNumber} - ${testCaseTitle} - ABORT REPORT` 
                        : `🛑 ${testCaseTitle} - ABORT REPORT`, 
                    style: 'header' 
                },
                { text: ' ', margin: [0, 10] },
                { text: 'Test Information:', style: 'subheader' },
                {
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            ['Test Case Title:', testCaseTitle],
                            ['LOB:', lob],
                            ['Current Test Number:', currentTestNumber],
                            ['Status:', 'ABORTED - Test manually stopped'],
                            ['Timestamp:', new Date().toLocaleString()],
                            ['Report Generated:', timestamp],
                            ['Session ID:', sessionId?.substring(0, 8) || 'Unknown']
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: ' ', margin: [0, 10] },
                { text: '📊 Captured Test Data:', style: 'subheader' },
                {
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            ['Account Number:', accountNumber],
                            ['Submission Number:', submissionNumber],
                            ['Policy Number:', policyNumber]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: ' ', margin: [0, 10] },
                { text: 'Test Execution Summary:', style: 'subheader' },
                {
                    ul: [
                        'Test was manually aborted before completion',
                        screenshotInfo,
                        accountNumber !== 'Not Generated - Test Aborted' ? '✅ Account creation was successful' : '❌ Account creation not completed',
                        submissionNumber !== 'Not Generated - Test Aborted' ? '✅ Submission was generated successfully' : '❌ Submission not generated',
                        policyNumber !== 'Not Generated - Test Aborted' ? '✅ Policy creation was successful' : '❌ Policy creation not completed',
                        'Partial execution data may be available'
                    ]
                },
                { text: ' ', margin: [0, 10] },
                { text: 'Screenshots Information:', style: 'subheader' },
                {
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            ['Total Screenshots:', screenshotCount.toString()],
                            ['Location:', 'reports/pdf-report/data/'],
                            ['Status:', screenshotCount > 0 ? 'Available for review' : 'None captured']
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: ' ', margin: [0, 15] },
                { text: 'Important Notes:', style: 'subheader' },
                {
                    ul: [
                        'This is a partial report from an aborted test execution',
                        'Captured data shows the progress made before abort',
                        accountNumber !== 'Not Generated - Test Aborted' ? 'Account data can be used for reference' : 'Account creation was not completed',
                        submissionNumber !== 'Not Generated - Test Aborted' ? 'Submission data is available for review' : 'No submission was generated',
                        policyNumber !== 'Not Generated - Test Aborted' ? 'Policy data is available in system' : 'Policy was not created',
                        'For complete results, please re-run the test',
                        'All test data and screenshots are preserved',
                        'Abort was triggered manually by user action'
                    ],
                    margin: [0, 0, 0, 15]
                },
                { text: ' ', margin: [0, 10] },
                { text: 'System Information:', style: 'subheader' },
                {
                    table:{
                        widths: ['30%', '70%'],
                        body: [
                            ['Framework:', 'AMOD Test Automation'],
                            ['Session:', 'Individual test execution'],
                            ['Environment:', process.env.TEST_ENV || 'test'],
                            ['Generated:', new Date().toISOString()]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                }
            ];

            // Add screenshots section if any exist
            if (screenshotCount > 0) {
                docContent.push({ text: ' ', pageBreak: 'before' });
                docContent.push({ text: 'Screenshots Captured Before Abort', style: 'header' });
                docContent.push({ text: `${screenshotCount} screenshots captured during test execution (chronological order)`, style: 'subheader' });
                
                // Add each screenshot as a full page
                screenshotPaths.forEach((screenshotPath, index) => {
                    try {
                        const imageBuffer = fs.readFileSync(screenshotPath);
                        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
                        
                        // Get a clean caption from filename
                        const fileName = screenshotFiles[index];
                        const stepNum = fileName.split('_')[0];
                        const cleanName = fileName.replace(/^\d+_/, '').replace(/\.png$/i, '').replace(/_/g, ' ');
                        
                        if (index > 0) {
                            docContent.push({ text: ' ', pageBreak: 'before' });
                        } else {
                            docContent.push({ text: ' ', margin: [0, 10] });
                        }
                        
                        docContent.push({
                            text: `Step ${stepNum}: ${cleanName}`,
                            style: 'screenshotCaption',
                            margin: [0, 0, 0, 10]
                        });
                        
                        docContent.push({
                            image: base64Image,
                            width: 500, // Full page width (accounting for margins)
                            alignment: 'center'
                        });
                        
                    } catch (imgError) {
                        console.log(`⚠️ ABORT: Could not load screenshot ${screenshotFiles[index]}: ${imgError.message}`);
                        docContent.push({
                            text: `Screenshot ${index + 1}: ${screenshotFiles[index]} (could not load)`,
                            style: 'errorText',
                            margin: [0, 10]
                        });
                    }
                });
            }
            
            const docDefinition = {
                content: docContent,
                styles: {
                    header: { fontSize: 18, bold: true, alignment: 'center', color: '#d32f2f' },
                    subheader: { fontSize: 14, bold: true, color: '#1976d2', margin: [0, 10, 0, 5] },
                    screenshotCaption: { fontSize: 12, bold: true, color: '#333333', alignment: 'center' },
                    errorText: { fontSize: 10, italics: true, color: '#ff0000' }
                },
                pageMargins: [40, 60, 40, 60]
            };
            
            // Generate proper PDF
            const pdfDoc = pdfMake.createPdf(docDefinition);
            pdfDoc.getBuffer((buffer) => {
                fs.writeFileSync(pdfPath, buffer);
                console.log(`📋 ABORT PDF created (proper format): ${pdfFileName}`);
            });
            
        } catch (pdfError) {
            console.log(`⚠️ PDFMake not available, creating text file...`);
              // Fallback: Create simple text file with screenshot list
            const txtFileName = `${lob}_ABORTED_${timestamp}.txt`;
            const txtPath = path.join(pdfDir, txtFileName);
            
            let screenshotList = '';
            if (screenshotCount > 0 && screenshotFiles && screenshotFiles.length > 0) {
                screenshotList = '\n\nScreenshots Captured (chronological order):\n';
                screenshotList += '===========================================\n';
                screenshotFiles.forEach((file, index) => {
                    const stepNum = file.split('_')[0];
                    const cleanName = file.replace(/^\d+_/, '').replace(/\.png$/i, '').replace(/_/g, ' ');
                    screenshotList += `${index + 1}. Step ${stepNum}: ${cleanName}\n`;
                });
            }              const textContent = `
${submissionNumber !== 'Not Generated - Test Aborted' ? `${submissionNumber} - ` : ''}${testCaseTitle} - ABORT REPORT
====================================

Test Information:
- Test Case Title: ${testCaseTitle}
- LOB: ${lob}
- Current Test Number: ${currentTestNumber}
- Status: ABORTED BY USER
- Timestamp: ${new Date().toLocaleString()}
- Report Generated: ${timestamp}
- Session ID: ${sessionId?.substring(0, 8) || 'Unknown'}

📊 Captured Test Data:
- Account Number: ${accountNumber}
- Submission Number: ${submissionNumber}
- Policy Number: ${policyNumber}

Test Execution Summary:
- Test was manually aborted before completion
- ${screenshotInfo}
- ${accountNumber !== 'Not Generated - Test Aborted' ? '✅ Account creation was successful' : '❌ Account creation not completed'}
- ${submissionNumber !== 'Not Generated - Test Aborted' ? '✅ Submission was generated successfully' : '❌ Submission not generated'}
- ${policyNumber !== 'Not Generated - Test Aborted' ? '✅ Policy creation was successful' : '❌ Policy creation not completed'}
- Partial execution data may be available

Screenshots Information:
- Total Screenshots: ${screenshotCount}
- Location: reports/pdf-report/data/
- Status: ${screenshotCount > 0 ? 'Available for review' : 'None captured'}${screenshotList}

Notes:
- This is a partial report from an aborted test execution
- Captured data shows the progress made before abort
- ${accountNumber !== 'Not Generated - Test Aborted' ? 'Account data can be used for reference' : 'Account creation was not completed'}
- ${submissionNumber !== 'Not Generated - Test Aborted' ? 'Submission data is available for review' : 'No submission was generated'}
- ${policyNumber !== 'Not Generated - Test Aborted' ? 'Policy data is available in system' : 'Policy was not created'}
- For complete results, please re-run the test
- All test data and screenshots are preserved
- Abort was triggered manually by user action

System Information:
- Framework: AMOD Test Automation
- Session: Individual test execution
- Environment: ${process.env.TEST_ENV || 'test'}
- Generated: ${new Date().toISOString()}

====================================
End of Abort Report
            `;
            
            fs.writeFileSync(txtPath, textContent, 'utf8');
            console.log(`📋 ABORT Text file created: ${txtFileName}`);
        }
        
    } catch (error) {
        console.error(`❌ ABORT PDF generation error:`, error);
    }
}

// Session-based Excel results download
app.get('/api/results/:sessionId/:lob/excel', (req, res) => {
    try {
        const { sessionId, lob } = req.params;
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        console.log(`🔍 Excel download request for session ${sessionId}, LOB: ${lob}`);        // Map LOB to Excel file names (using exact result file names)
        const excelMappings = {
            'Core_Dwelling_Basic': 'DWB_CORE-Result.xlsx',
            'Core_Dwelling_Special': 'Dwelling_Special_CORE-Result.xlsx',
            'Renewal_DB': 'DWB_CORE-Result.xlsx'
        };
        
        const fileName = excelMappings[lob] || `${lob}-Result.xlsx`;
        const sessionReportsDir = path.join(__dirname, 'sessions', sessionId, 'reports');
        const resultsPath = path.join(sessionReportsDir, fileName);
        console.log(`📂 Session reports directory: ${sessionReportsDir}`);
        console.log(`📂 Looking for session ${sessionId} file: ${fileName} at path: ${resultsPath}`);
          // Check if the main file exists, if not search for dynamic file names
        let finalPath = resultsPath;
        let finalFileName = fileName;
        
        // 🛑 FIRST: Check for ABORT Excel files in base reports directory
        const baseReportsDir = path.join(__dirname, 'reports');
        const abortExcelPattern = `${lob}_ABORTED_`;
        
        if (!fs.existsSync(resultsPath)) {
            console.log(`📂 Main session file not found, checking for ABORT files...`);
              // Look for abort Excel files in base reports directory
            try {
                const baseFiles = fs.readdirSync(baseReportsDir);
                const abortFiles = baseFiles.filter(file => 
                    file.startsWith(abortExcelPattern) && (file.endsWith('.xlsx') || file.endsWith('.csv'))
                );
                
                if (abortFiles.length > 0) {
                    // Get the most recent abort file
                    const mostRecentAbort = abortFiles
                        .map(file => {
                            const filePath = path.join(baseReportsDir, file);
                            const stats = fs.statSync(filePath);
                            return {
                                name: file,
                                time: stats.mtime.getTime(),
                                size: stats.size
                            };
                        })
                        .sort((a, b) => b.time - a.time)[0];
                    
                    finalPath = path.join(baseReportsDir, mostRecentAbort.name);
                    finalFileName = mostRecentAbort.name;
                    console.log(`🛑 ABORT: Found abort Excel file: ${mostRecentAbort.name} (${mostRecentAbort.size} bytes)`);
                }
            } catch (error) {
                console.log(`⚠️ Error checking for abort Excel files: ${error.message}`);
            }
        }
        
        if (!fs.existsSync(finalPath)) {
            // Search for files with dynamic names (like DWB_GPA_timestamp) in session directory
            const reportsDir = sessionReportsDir;
            console.log(`📂 Main file not found, searching in: ${reportsDir}`);
            
            if (fs.existsSync(reportsDir)) {
                let files;
                try {
                    files = fs.readdirSync(reportsDir);
                    console.log(`📂 Found ${files.length} files in reports directory: ${files.join(', ')}`);
                } catch (error) {
                    console.error(`❌ Error reading reports directory: ${error.message}`);
                    return res.status(500).json({ error: 'Error reading reports directory' });
                }                let searchPattern = '';
                if (lob === 'GPA_Dwelling_Basic') {
                    searchPattern = 'GPA_DwellingBasic';
                } else if (lob === 'GPA_Dwelling_Special') {
                    searchPattern = 'GPA_DwellingSpecial';
                } else if (lob === 'GPA_HomeOwners') {
                    searchPattern = 'GPA_HomeOwners';
                } else if (lob === 'Core_Dwelling_Basic') {
                    searchPattern = 'DWB_CORE';
                } else if (lob === 'Core_Dwelling_Special') {
                    searchPattern = 'Dwelling_Special_CORE';
                } else if (lob === 'GPA_CV') {
                    searchPattern = 'Collector';
                } else if (lob === 'GPA_Boat') {
                    searchPattern = 'BT';
                } else if (lob === 'GPA_Yacht') {
                    searchPattern = 'YT';
                } else if (lob === 'GPA_MS') {
                    searchPattern = 'MS';
                } else if (lob === 'GPA_Manufactured_Home') {
                    searchPattern = 'GPA_ManufacturedHome';
                } else if (lob === 'Renewal_DB') {
                    searchPattern = 'DWB_CORE';
                }
                
                console.log(`🔍 Searching for Excel files with pattern: ${searchPattern}`);
                
                const matchingFiles = files.filter(file => 
                    file.toLowerCase().includes(searchPattern.toLowerCase()) && 
                    file.endsWith('.xlsx')
                );
                
                console.log(`📊 Found ${matchingFiles.length} matching Excel files: ${matchingFiles.join(', ')}`);
                
                if (matchingFiles.length > 0) {
                    // Get the most recent file
                    const mostRecent = matchingFiles
                        .map(file => {
                            const filePath = path.join(reportsDir, file);
                            const stats = fs.statSync(filePath);
                            return {
                                name: file,
                                time: stats.mtime.getTime(),
                                size: stats.size
                            };
                        })
                        .sort((a, b) => b.time - a.time)[0];
                    
                    finalPath = path.join(reportsDir, mostRecent.name);
                    finalFileName = mostRecent.name;
                    console.log(`📊 Selected most recent Excel file: ${mostRecent.name} (${mostRecent.size} bytes)`);
                }
            }
        }
        
        if (!fs.existsSync(finalPath)) {
            console.error(`❌ Excel file not found: ${finalPath}`);
            
            // Try to find ANY Excel file in the session reports directory
            try {
                const files = fs.readdirSync(sessionReportsDir);
                const allExcelFiles = files.filter(file => file.endsWith('.xlsx'));
                
                if (allExcelFiles.length > 0) {
                    console.log(`📊 Found ${allExcelFiles.length} Excel files, using most recent`);
                    const mostRecent = allExcelFiles
                        .map(file => {
                            const filePath = path.join(sessionReportsDir, file);
                            const stats = fs.statSync(filePath);
                            return {
                                name: file,
                                time: stats.mtime.getTime(),
                                size: stats.size
                            };
                        })
                        .sort((a, b) => b.time - a.time)[0];
                    
                    finalPath = path.join(sessionReportsDir, mostRecent.name);
                    finalFileName = mostRecent.name;
                    console.log(`📊 Using fallback Excel file: ${finalFileName}`);
                } else {
                    return res.status(404).json({ error: 'No Excel results found in session directory' });
                }
            } catch (error) {
                console.error(`❌ Error scanning for Excel files: ${error.message}`);
                return res.status(404).json({ error: 'Excel results file not found' });
            }
        }

        console.log(`📊 Downloading Excel report: ${finalFileName} from ${finalPath}`);
        
        // Create timestamp for download filename
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const downloadFileName = `${lob}_Results_${timestamp}.xlsx`;
        
        console.log(`📊 Download filename: ${downloadFileName}`);
        res.download(finalPath, downloadFileName);
    } catch (error) {
        console.error('Excel download error:', error);
        res.status(500).json({ error: 'Failed to download Excel results' });
    }
});

// Session-based PDF results download
app.get('/api/results/:sessionId/:lob/pdf', (req, res) => {
    try {
        const { sessionId, lob } = req.params;
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        // Look for PDF files in session's pdf-report directory
        const pdfDir = path.join(__dirname, 'sessions', sessionId, 'reports', 'pdf-report');
        
        if (!fs.existsSync(pdfDir)) {
            return res.status(404).json({ error: 'PDF reports directory not found' });
        }
        
        // 🚀 IMPROVED: Get the most recent PDF file with better error handling
        let files;
        try {
            files = fs.readdirSync(pdfDir);
            console.log(`📂 Found ${files.length} files in PDF directory: ${pdfDir}`);
        } catch (error) {
            console.error(`❌ Error reading PDF directory: ${error.message}`);
            return res.status(500).json({ error: 'Error reading PDF directory' });
        }
        
        // Get all PDF files
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        console.log(`📋 Found ${pdfFiles.length} PDF files: ${pdfFiles.join(', ')}`);
          if (pdfFiles.length === 0) {
            console.log(`❌ No PDF files found in session directory: ${pdfDir}`);
            
            // 🛑 CHECK FOR ABORT PDF FILES in base reports directory
            console.log(`🛑 ABORT: Checking for abort PDF files...`);
            const baseReportsDir = path.join(__dirname, 'reports');
            const basePdfDir = path.join(baseReportsDir, 'pdf-report');
            const abortPdfPattern = `${lob}_ABORTED_`;
            
            try {
                if (fs.existsSync(basePdfDir)) {
                    const basePdfFiles = fs.readdirSync(basePdfDir);                    const abortPdfFiles = basePdfFiles.filter(file => 
                        file.startsWith(abortPdfPattern) && (file.endsWith('.pdf') || file.endsWith('.txt'))
                    );
                    
                    if (abortPdfFiles.length > 0) {
                        // Get the most recent abort PDF file
                        const mostRecentAbortPdf = abortPdfFiles
                            .map(file => {
                                const filePath = path.join(basePdfDir, file);
                                const stats = fs.statSync(filePath);
                                return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
                            })
                            .sort((a, b) => b.mtime - a.mtime)[0];
                        
                        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
                        const downloadFileName = `${lob}_ABORT_Report_${timestamp}.pdf`;
                        
                        console.log(`🛑 ABORT: Using abort PDF: ${mostRecentAbortPdf.name} (${mostRecentAbortPdf.size} bytes)`);
                        console.log(`📋 Download filename: ${downloadFileName}`);
                        return res.download(mostRecentAbortPdf.path, downloadFileName);
                    }
                }
            } catch (error) {
                console.error(`❌ Error checking for abort PDF files: ${error.message}`);
            }
            
            console.log(`❌ No PDF files found in: ${pdfDir}`);
            
            // Also check if there are PDF files in the parent reports directory
            const parentReportsDir = path.join(__dirname, 'sessions', sessionId, 'reports');
            console.log(`📂 Checking parent reports directory: ${parentReportsDir}`);
            
            try {
                if (fs.existsSync(parentReportsDir)) {
                    const parentFiles = fs.readdirSync(parentReportsDir);
                    const parentPdfFiles = parentFiles.filter(file => file.endsWith('.pdf'));
                    
                    if (parentPdfFiles.length > 0) {
                        console.log(`📋 Found ${parentPdfFiles.length} PDF files in parent directory`);
                        // Use the most recent PDF from parent directory
                        const mostRecentParent = parentPdfFiles
                            .map(file => {
                                const filePath = path.join(parentReportsDir, file);
                                const stats = fs.statSync(filePath);
                                return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
                            })
                            .sort((a, b) => b.time - a.time)[0];
                        
                        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
                        const downloadFileName = `${lob}_Report_${timestamp}.pdf`;
                        
                        console.log(`📋 Using PDF from parent directory: ${mostRecentParent.name}`);
                        console.log(`📋 Download filename: ${downloadFileName}`);
                        return res.download(mostRecentParent.path, downloadFileName);
                    }
                }
            } catch (error) {
                console.error(`❌ Error checking parent directory: ${error.message}`);
            }
            
            return res.status(404).json({ error: 'No PDF results found in session directories' });
        }
        
        // Get the most recent file (by modification time) - whatever was generated last
        const mostRecent = pdfFiles
            .map(file => {
                const filePath = path.join(pdfDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    time: stats.mtime.getTime(),
                    size: stats.size,
                    created: stats.birthtime
                };
            })
            .sort((a, b) => b.time - a.time)[0];
            
        const pdfPath = path.join(pdfDir, mostRecent.name);
        console.log(`📋 Selected most recent PDF: ${mostRecent.name} (${mostRecent.size} bytes, modified: ${new Date(mostRecent.time).toLocaleString()})`);
        
        console.log(`📋 Downloading PDF report: ${mostRecent.name} from ${pdfPath}`);
        console.log(`📋 File exists: ${fs.existsSync(pdfPath)}`);
        console.log(`📋 File size: ${fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size : 'N/A'} bytes`);
        
        // Create timestamp for download filename
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const downloadFileName = `${lob}_Report_${timestamp}.pdf`;
        
        console.log(`📋 Download filename: ${downloadFileName}`);
        res.download(pdfPath, downloadFileName);
    } catch (error) {
        console.error('PDF download error:', error);
        res.status(500).json({ error: 'Failed to download PDF results' });
    }
});

// Session-based complete reports folder download as ZIP
app.get('/api/results/:sessionId/:lob/complete', (req, res) => {
    try {
        const { sessionId, lob } = req.params;
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        console.log(`📦 Complete reports download request for session ${sessionId}, LOB: ${lob}`);
        
        const sessionReportsDir = path.join(__dirname, 'sessions', sessionId, 'reports');
        
        if (!fs.existsSync(sessionReportsDir)) {
            return res.status(404).json({ error: 'Reports directory not found' });
        }
        
        // Create ZIP file with timestamp
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const zipFileName = `${lob}_Complete_Reports_${timestamp}.zip`;
        
        console.log(`📦 Creating ZIP archive: ${zipFileName}`);
        
        // Set response headers for ZIP download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        
        // Create archiver instance
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });
        
        // Handle archiver errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            res.status(500).json({ error: 'Failed to create reports archive' });
        });
        
        // Pipe archive to response
        archive.pipe(res);
        
        // Add session info file
        const sessionInfo = {
            sessionId: sessionId,
            lob: lob,
            timestamp: new Date().toISOString(),
            downloadTime: new Date().toLocaleString(),
            reports: []
        };        // 🔧 ENHANCED: Ensure LOB-specific PDF is included in folder download
        const ensureLOBSpecificPDFInFolder = () => {
            try {
                const sessionPdfDir = path.join(sessionReportsDir, 'pdf-report');
                const parentReportsDir = path.join(__dirname, 'sessions', sessionId, 'reports');
                
                // Check if there's a good PDF in parent directory that should be copied to pdf-report folder
                if (fs.existsSync(parentReportsDir)) {
                    const parentFiles = fs.readdirSync(parentReportsDir);
                    
                    // First, look for LOB-specific partial reports
                    let lobSpecificPdfs = parentFiles.filter(file => 
                        file.endsWith('.pdf') && 
                        (file.includes(lob) || file.includes('Partial'))
                    );
                    
                    // If no LOB-specific, get any recent PDFs
                    if (lobSpecificPdfs.length === 0) {
                        lobSpecificPdfs = parentFiles.filter(file => file.endsWith('.pdf'));
                    }
                    
                    if (lobSpecificPdfs.length > 0) {
                        // Get the most recent LOB-specific PDF
                        const mostRecentPdf = lobSpecificPdfs
                            .map(file => {
                                const filePath = path.join(parentReportsDir, file);
                                const stats = fs.statSync(filePath);
                                return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
                            })
                            .sort((a, b) => b.mtime - a.mtime)[0];
                        
                        // Ensure pdf-report directory exists
                        if (!fs.existsSync(sessionPdfDir)) {
                            fs.mkdirSync(sessionPdfDir, { recursive: true });
                        }
                        
                        // Copy the correct PDF to pdf-report folder with LOB name
                        const targetFileName = mostRecentPdf.name.includes(lob) ? 
                            mostRecentPdf.name : 
                            `${lob}_${mostRecentPdf.name}`;
                        const targetPath = path.join(sessionPdfDir, targetFileName);
                        
                        fs.copyFileSync(mostRecentPdf.path, targetPath);
                        console.log(`📋 ✅ Copied LOB-specific PDF: ${mostRecentPdf.name} → ${targetFileName} (${mostRecentPdf.size} bytes)`);
                    }
                }
            } catch (error) {
                console.error('Error ensuring LOB-specific PDF in folder:', error);
            }
        };
        
        // Add all files from reports directory
        const addFilesToArchive = (dir, baseName = '') => {
            try {
                const files = fs.readdirSync(dir);
                
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    const archivePath = baseName ? `${baseName}/${file}` : file;
                    
                    if (stat.isDirectory()) {
                        // Recursively add subdirectory
                        addFilesToArchive(filePath, archivePath);
                    } else {
                        // Add file to archive
                        archive.file(filePath, { name: archivePath });
                        sessionInfo.reports.push({
                            file: archivePath,
                            size: stat.size,
                            modified: stat.mtime.toISOString()
                        });
                        console.log(`📄 Added to archive: ${archivePath} (${stat.size} bytes)`);
                    }
                });
            } catch (error) {
                console.error(`Error reading directory ${dir}:`, error);
            }
        };
          // 🔧 First ensure LOB-specific PDF is in the folder
        ensureLOBSpecificPDFInFolder();
        
        // Add all reports from session directory
        addFilesToArchive(sessionReportsDir);
        
        // Also check base reports directory for recent files (for backward compatibility)
        const baseReportsDir = path.join(__dirname, 'reports');
        if (fs.existsSync(baseReportsDir)) {
            // Get files from the last hour (3600000 ms)
            const oneHourAgo = Date.now() - 3600000;
            
            // Check PDF reports
            const basePdfDir = path.join(baseReportsDir, 'pdf-report');
            if (fs.existsSync(basePdfDir)) {
                try {
                    const pdfFiles = fs.readdirSync(basePdfDir)
                        .filter(file => file.toLowerCase().endsWith('.pdf'))
                        .map(file => {
                            const filePath = path.join(basePdfDir, file);
                            const stats = fs.statSync(filePath);
                            return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
                        })
                        .filter(file => file.mtime > oneHourAgo); // Only recent files
                    
                    pdfFiles.forEach(file => {
                        archive.file(file.path, { name: `pdf-reports/${file.name}` });
                        sessionInfo.reports.push({
                            file: `pdf-reports/${file.name}`,
                            size: file.size,
                            modified: new Date(file.mtime).toISOString(),
                            source: 'base-reports'
                        });
                        console.log(`📄 Added PDF from base reports: ${file.name} (${file.size} bytes)`);
                    });
                } catch (error) {
                    console.error('Error reading base PDF directory:', error);
                }
            }
            
            // Check Excel reports
            try {
                const excelFiles = fs.readdirSync(baseReportsDir)
                    .filter(file => file.toLowerCase().endsWith('.xlsx'))
                    .map(file => {
                        const filePath = path.join(baseReportsDir, file);
                        const stats = fs.statSync(filePath);
                        return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
                    })
                    .filter(file => file.mtime > oneHourAgo); // Only recent files
                
                excelFiles.forEach(file => {
                    archive.file(file.path, { name: `excel-reports/${file.name}` });
                    sessionInfo.reports.push({
                        file: `excel-reports/${file.name}`,
                        size: file.size,
                        modified: new Date(file.mtime).toISOString(),
                        source: 'base-reports'
                    });
                    console.log(`📄 Added Excel from base reports: ${file.name} (${file.size} bytes)`);
                });
            } catch (error) {
                console.error('Error reading base Excel files:', error);
            }
            
            // Check HTML reports
            const baseHtmlDir = path.join(baseReportsDir, 'html');
            if (fs.existsSync(baseHtmlDir)) {
                try {
                    const htmlStat = fs.statSync(baseHtmlDir);
                    if (htmlStat.mtime.getTime() > oneHourAgo) {
                        addFilesToArchive(baseHtmlDir, 'html-reports');
                        console.log(`📄 Added HTML reports from base directory`);
                    }
                } catch (error) {
                    console.error('Error reading base HTML directory:', error);
                }
            }
        }
        
        // Add session info as JSON file
        archive.append(JSON.stringify(sessionInfo, null, 2), { name: 'session-info.json' });
        
        // Add README file
        const readmeContent = `
# Test Reports Package
Session ID: ${sessionId}
LOB: ${lob}
Generated: ${new Date().toLocaleString()}

## Contents:
- Excel reports (.xlsx files)
- PDF reports (.pdf files) 
- HTML reports (html/ folder)
- Session information (session-info.json)

## Files in this package:
${sessionInfo.reports.map(r => `- ${r.file} (${r.size} bytes)`).join('\n')}

Generated by AMOD Test Automation System
        `.trim();
        
        archive.append(readmeContent, { name: 'README.txt' });
        
        console.log(`📦 Archive contains ${sessionInfo.reports.length} files`);
        
        // Finalize the archive
        archive.finalize();
        
    } catch (error) {
        console.error('Complete reports download error:', error);
        res.status(500).json({ error: 'Failed to download complete reports' });
    }
});

// Download reports endpoint - Alternative URL pattern for UI integration
app.get('/api/download-reports/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const lob = req.query.lob || 'Unknown';
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        console.log(`📦 Download reports request for session ${sessionId}, LOB: ${lob}`);
        
        const sessionReportsDir = path.join(__dirname, 'sessions', sessionId, 'reports');
        
        if (!fs.existsSync(sessionReportsDir)) {
            return res.status(404).json({ error: 'No reports found for this session' });
        }
        
        // Create timestamp for filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const zipFileName = `${lob}_Reports_${timestamp}.zip`;
        
        console.log(`📦 Creating ZIP archive: ${zipFileName}`);
        
        // Set response headers for ZIP download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        
        // Create archiver instance
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });
        
        // Handle archiver errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            res.status(500).json({ error: 'Failed to create reports archive' });
        });
        
        // Pipe archive to response
        archive.pipe(res);
        
        // Add all files from reports directory
        // archive.directory(sessionReportsDir, false);
            const files = fs.readdirSync(sessionReportsDir);
 
        files.forEach(file => {
            if (file === 'html' || file === 'session-info.json') {
                return; // Skip these
            }
 
            const fullPath = path.join(sessionReportsDir, file);
 
            if (fs.statSync(fullPath).isDirectory()) {
                archive.directory(fullPath, file);
            } else {
                archive.file(fullPath, { name: file });
            }
        });
        // Add session info file
        const sessionInfo = {
            sessionId: sessionId,
            lob: lob,
            timestamp: new Date().toISOString(),
            downloadTime: new Date().toLocaleString()
        };
        
        const sessionInfoContent = JSON.stringify(sessionInfo, null, 2);
        // archive.append(sessionInfoContent, { name: 'session-info.json' });
        
        console.log(`📦 Archive ready for download: ${zipFileName}`);
        
        // Finalize the archive
        archive.finalize();
        
    } catch (error) {
        console.error('Download reports error:', error);
        res.status(500).json({ error: 'Failed to download reports' });
    }
});

// Session-based HTML test reports
app.get('/api/results/:sessionId/:lob/html', (req, res) => {
    try {
        const { sessionId, lob } = req.params;
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        // Look for HTML reports in session's html directory
        const htmlDir = path.join(__dirname, 'sessions', sessionId, 'reports', 'html');
        
        if (!fs.existsSync(htmlDir)) {
            return res.status(404).json({ error: 'HTML reports directory not found' });
        }
        
        // Find index.html or the most recent HTML file
        const indexPath = path.join(htmlDir, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            // Find any HTML files
            const files = fs.readdirSync(htmlDir);
            const htmlFiles = files.filter(file => file.endsWith('.html'));
            
            if (htmlFiles.length === 0) {
                return res.status(404).json({ error: 'No HTML reports found' });
            }
            
            // Get the most recent HTML file
            const mostRecent = htmlFiles
                .map(file => ({
                    name: file,
                    time: fs.statSync(path.join(htmlDir, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time)[0];
                
            const htmlPath = path.join(htmlDir, mostRecent.name);
            res.sendFile(htmlPath);
        }
    } catch (error) {
        console.error('HTML report error:', error);
        res.status(500).json({ error: 'Failed to load HTML report' });
    }
});

// Get test mapping information
app.get('/api/test-mapping', (req, res) => {
    try {
        const mappingInfo = {
            'GPA_Dwelling_Basic': {
                testFile: './tests/GPA_Dwelling_Basic.spec.ts',
                excelDataSource: 'Dwelling_Basic_GPA_Issuance_Test_Generator_V3.1_new_1.xlsm',
                excelSheets: [
                    'Account_Creation', 'Policy_Details', 'Property', 'Valuation', 
                    'Discount_Surcharges', 'Issuance', 'Payment Details', 
                    'RuleMatrix', 'Quote', 'Summary', 'Min_Max'
                ],
                resultFile: 'DWB-Result.xlsx',
                resultPattern: 'DWB_GPA_*',
                maxRecords: 10,
                testSteps: [
                    'Login Page',
                    'GPA Account Creation', 
                    'Policy Details Entry',
                    'Property Details Entry',
                    'Valuation Details Entry',
                    'Discount/Surcharge Details',
                    'Quote Generation',
                    'Issuance Details',
                    'Risk Analysis Validation',
                    'Payment Details & Policy Issuance'
                ]
            },
            'GPA_Dwelling_Special': {
                testFile: './tests/GPA_Dwelling_Special.spec.ts',
                excelDataSource: 'Dwelling_Special_GPA_Issuance_Test_Generator_V3.3_*.xlsm',
                resultFile: 'DWS-result.xlsx',
                resultPattern: 'DWS_GPA*',
                description: 'GPA Dwelling Special test automation'
            },            'GPA_HomeOwners': {
                testFile: './tests/GPA_HomeOwners.spec.ts',
                excelDataSource: 'HomeOwners_GPA_Issuance_Test_Generator_*.xlsm',
                resultFile: 'HO-Result.xlsx',
                resultPattern: 'HO*',
                description: 'GPA HomeOwners test automation'
            },
            'Core_Dwelling_Basic': {
                testFile: './tests/Core_Dwelling_Basic.spec.ts',
                excelDataSource: '{State}_DB_ConvertedTable.xls or {State}_DWB_ConvertedTable.xls',
                resultFile: 'DWB_CORE-Result.xlsx',
                resultPattern: 'DWB_CORE*',
                description: 'Core Dwelling Basic test automation'
            },
            'Core_Dwelling_Special': {
                testFile: './tests/Core_Dwelling_Special.spec.ts',
                excelDataSource: '{State}_DS/DWS/DWSP_ConvertedTable.xls',
                resultFile: 'Dwelling_Special_CORE-Result.xlsx',
                resultPattern: 'DWS_CORE*',
                description: 'Core Dwelling Special test automation'
            },
            'GPA_CV': {
                testFile: './tests/GPA_CV.spec.ts',
                excelDataSource: 'CollectorVehicle_Test_Case_Generator_Issuance_V4.xlsm',
                resultFile: 'Collector-Vehicles-Result.xlsx',
                resultPattern: 'Collector*',
                description: 'GPA Collector Vehicles test automation'
            },
            'GPA_Boat': {
                testFile: './tests/GPA_Boat.spec.ts',
                excelDataSource: 'Boat_Test_Case_Generator_Issuance_1.xlsm',
                resultFile: 'BT-Result.xlsx',
                resultPattern: 'BT*',
                description: 'GPA Boat test automation'
            },
            'GPA_Yacht': {
                testFile: './tests/GPA_Yacht.spec.ts',
                excelDataSource: 'Yacht_Test_Case_Generator_Issuance_1.xlsm',
                resultFile: 'YT-Result.xlsx',
                resultPattern: 'YT*',
                description: 'GPA Yacht test automation'
            },
            'GPA_Manufactured_Home': {
                testFile: './tests/GPA_Manufactured_Home.spec.ts',
                excelDataSource: 'Manufactured_Home_GPA_Issuance_Test_Generator_v4_Finalised.xlsm',
                resultFile: 'GPA_ManufacturedHome-result.xlsx',
                resultPattern: 'ManufacturedHome*',
                description: 'GPA Manufactured Home test automation'
            },
            'GPA_MS': {
                testFile: './tests/GPA_MS.spec.ts',
                excelDataSource: 'Motorsports_Test_Case_Generator_Issuance_Updated.xlsm',
                resultFile: 'MS-Result.xlsx',
                resultPattern: 'MS*',
                description: 'GPA Motorsports test automation'
            },
            'Renewal_DB': {
                testFile: './tests/Core_Dwelling_Basic.spec.ts',
                excelDataSource: 'DwellingBasic_Test_Case_Generator_Renewal_*.xlsm',
                resultFile: 'DWB_CORE-Result.xlsx',
                resultPattern: 'DWB_CORE*',
                description: 'Renewal Dwelling Basic test automation (reuses Core Dwelling Basic spec)'
            }
        };

        const testFilesList = [];
        Object.keys(mappingInfo).forEach(testKey => {
            const info = mappingInfo[testKey];
            testFilesList.push({
                key: testKey,
                name: testKey.replace(/_/g, ' '),
                testFile: info.testFile,
                exists: fs.existsSync(info.testFile),
                excelDataSource: info.excelDataSource,
                resultFile: info.resultFile,
                resultPattern: info.resultPattern,
                testSteps: info.testSteps || [],
                excelSheets: info.excelSheets || [],
                maxRecords: info.maxRecords || 'Not specified',
                description: info.description || 'Test automation suite'
            });
        });

        res.json({
            success: true,
            totalTests: testFilesList.length,
            availableTests: testFilesList.filter(t => t.exists).length,
            testMappings: testFilesList,
            directories: {
                testDir: './tests',
                dataDir: './testdata', 
                resultsDir: './reports',
                pdfDir: './reports/pdf-report'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Mapping info error:', error);
        res.status(500).json({ error: 'Failed to get mapping information' });
    }
});

// Legacy endpoint (for backward compatibility)
app.get('/api/results/:lob', (req, res) => {
    // Redirect to Excel endpoint
    res.redirect(`/api/results/${req.params.lob}/excel`);
});

// Session status endpoint for polling-based updates (WebSocket fallback)
// app.get('/api/session-status/:sessionId', (req, res) => {
//     try {
//         const sessionId = req.params.sessionId;
        
//         // Validate session
//         if (!activeSessions.has(sessionId)) {
//             return res.status(401).json({ error: 'Invalid or expired session' });
//         }
        
//         const session = activeSessions.get(sessionId);
//         const sessionData = {
//             sessionId: sessionId,

//             testRunning:
//                 session.status === 'running' ||
//                 session.status === 'running_tests',

//             testCompleted:
//                 session.status === 'completed',

//             success: session.success || false,
//             lob: session.currentLOB || null,
//             message: session.statusMessage || null,
//             progress: session.progress || 0,
//             logs: session.logs || []
//         };
        
//         console.log(`📊 Session ${sessionId} status: ${session.status}`);
//         res.json(sessionData);
//     } catch (error) {
//         console.error('Session status error:', error);
//         res.status(500).json({ error: 'Failed to get session status' });
//     }
// });

// Session-based test execution function
function runSessionBasedTests(sessionId, testFile, lob, environment = 'test', uploadedFileName = null, runToken = null) {
    return new Promise((resolve, reject) => {
        console.log(`🧪 Executing for session ${sessionId}: npx playwright test ${testFile} on ${environment} environment`);
        let completionEmitted = false;

        const emitCompletion = (payload, source = 'unknown') => {

            const room = io.sockets.adapter.rooms.get(`session_${sessionId}`);
            console.log(`📡 emitCompletion from: ${source}`);
            console.log(`👥 Room session_${sessionId} size: ${room ? room.size : 0}`);

            if (completionEmitted) {
                console.log(`⚠️ Duplicate completion ignored for ${sessionId}`);
                return;
            }
            completionEmitted = true;

            console.log(`✅ EMITTING testCompleted`);
            const session = activeSessions.get(sessionId);
            io.to(`session_${sessionId}`).emit('testCompleted', payload);
        };
        // Session-specific paths
        const sessionDir = path.join(__dirname, 'sessions', sessionId);
        const sessionTestDataDir = path.join(sessionDir, 'testdata');
        const sessionReportsDir = path.join(sessionDir, 'reports');        // Set environment variables for the test process with session paths
        const executionEventsPath = path.join(sessionDir, 'execution-events.ndjson');
        if (fs.existsSync(executionEventsPath)) fs.unlinkSync(executionEventsPath);
        const env = { ...process.env };
        
        // 🎯 NEW: Get session data for filtered file path
        let session = activeSessions.get(sessionId);
          if (uploadedFileName) {
            // 🎯 MODIFIED: Always use original Excel file for execution (no filtered sheets)
            // Keep filtering for UI preview only, but execute tests with full dataset
            let excelFilePath;
            excelFilePath = path.join(sessionTestDataDir, uploadedFileName);
            
            if (session && session.dynamicFilteringEnabled && session.filteredExcelPath) {
                console.log(`🎯 Filtering is active but EXECUTION will use original Excel file: ${excelFilePath}`);
                console.log(`📋 Filtered file exists for UI preview only: ${session.filteredExcelPath}`);
            } else {
                console.log(`📁 Using original Excel file: ${excelFilePath}`);
            }
            
            env.EXCEL_FILE_PATH = excelFilePath;
            console.log(`📁 Setting Excel file path for execution: ${env.EXCEL_FILE_PATH}`);
            
            // ✅ VALIDATION: Check if Excel file exists
            if (!fs.existsSync(env.EXCEL_FILE_PATH)) {
                console.error(`❌ Excel file not found: ${env.EXCEL_FILE_PATH}`);
                console.log(`📂 Available files in session testdata directory:`);
                try {
                    const files = fs.readdirSync(sessionTestDataDir);
                    console.log(files.filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm')).join(', '));
                } catch (err) {
                    console.log(`Directory ${sessionTestDataDir} is empty or doesn't exist`);
                }
            } else {
                const stats = fs.statSync(env.EXCEL_FILE_PATH);
                console.log(`✅ Excel file validated: ${path.basename(env.EXCEL_FILE_PATH)} (${stats.size} bytes)`);
            }
        }
          // Override report paths for this session
        env.REPORTS_DIR = sessionReportsDir;
        env.SESSION_ID = sessionId;
        env.TEST_SESSION_ID = sessionId; // 🎯 NEW: Additional session ID for path resolver
        
        console.log(`📊 Environment Variables Set:`);
        console.log(`   EXCEL_FILE_PATH: ${env.EXCEL_FILE_PATH || 'Not set'}`);
        console.log(`   REPORTS_DIR: ${env.REPORTS_DIR}`);
        console.log(`   SESSION_ID: ${env.SESSION_ID}`);
        console.log(`   TEST_SESSION_ID: ${env.TEST_SESSION_ID}`);
        console.log(`   TEST_ENV: ${environment}`);
        
        // 🌍 Set TEST_ENV environment variable for Playwright
        env.TEST_ENV = environment;
        console.log(`🌍 Setting environment: ${environment}`);
        
        // Create session-specific report directories
        const pdfReportsDir = path.join(sessionReportsDir, 'pdf-report');
        const htmlReportsDir = path.join(sessionReportsDir, 'html');
        
        if (!fs.existsSync(pdfReportsDir)) {
            fs.mkdirSync(pdfReportsDir, { recursive: true });
        }
        if (!fs.existsSync(htmlReportsDir)) {
            fs.mkdirSync(htmlReportsDir, { recursive: true });
        }
          // 🎯 NEW: Create session-specific terminal window with custom title
        const sessionWindowTitle = `Session ${sessionId.substring(0, 8)} - ${lob} Test on ${environment.toUpperCase()}`;
        const command = `npx playwright test ${testFile}`;
        const runStartTime = Date.now();
        session = activeSessions.get(sessionId);
        if (session) {
            session.playwrightStartTime = runStartTime;
            activeSessions.set(sessionId, session);
        }
        console.log(`🚀 Playwright started at ${new Date().toLocaleTimeString()}`);
        // Open new terminal window for this session with custom title and keep it open
        const playwrightProcess = spawn('cmd', [
            '/c', 
            `title ${sessionWindowTitle} && echo. && echo ========================================= && echo 🎯 SESSION: ${sessionId.substring(0, 8)} && echo 📋 LOB: ${lob} && echo 🌍 ENVIRONMENT: ${environment.toUpperCase()} && echo 🧪 TEST: ${testFile} && echo ========================================= && echo. && ${command} && echo. && echo ========================================= && echo ✅ TEST COMPLETED FOR SESSION ${sessionId.substring(0, 8)} && echo 📊 Results saved in session directory && echo ⏳ This window will close in 10 seconds... && timeout /t 10 /nobreak`
        ], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: false,
            cwd: __dirname,
            env: env,
            detached: false,
            windowsHide: false
        });         
        // const pathToCli = path.join(
        //     __dirname,
        //     'node_modules',
        //     '@playwright',
        //     'test',
        //     'cli.js'
        // );

        // console.log('CLI PATH:', pathToCli);
        // const playwrightProcess = spawn(
        //     process.execPath,
        //     [
        //         pathToCli,
        //         'test',
        //         testFile
        //     ],
        //     {
        //         cwd: __dirname,
        //         env,
        //         windowsHide: true
        //     }
        // );
// console.log(playwrightProcess.spawnfile);

//         console.log('='.repeat(80));
//         console.log('🚀 PLAYWRIGHT SPAWNED');
//         console.log(`Session: ${sessionId}`);
//         console.log(`LOB: ${lob}`);
//         console.log(`PID: ${playwrightProcess.pid}`);
//         console.log(`PPID: ${process.pid}`);
//         console.log(`Time: ${new Date().toISOString()}`);
//         console.log('='.repeat(80));
//         playwrightProcess.on('exit', (code, signal) => {
//             console.log('='.repeat(80));
//             console.log('💀 PLAYWRIGHT EXIT EVENT');
//             console.log(`PID: ${playwrightProcess.pid}`);
//             console.log(`Code: ${code}`);
//             console.log(`Signal: ${signal}`);
//             console.log(`Time: ${new Date().toISOString()}`);
//             console.log('='.repeat(80));
//         });
              // Store process in session for abort functionality
        if (activeSessions.has(sessionId)) {
            const session = activeSessions.get(sessionId);
            session.process = playwrightProcess;
            session.status = 'running_tests';
            session.currentLOB = lob; // 🔧 CRITICAL: Track current LOB for abort scenarios
            activeSessions.set(sessionId, session);
            console.log(`💾 Process stored for session ${sessionId}, PID: ${playwrightProcess.pid}, LOB: ${lob}`);
        }

        let output = '';
        let errorOutput = '';
        let executionEventBuffer = '';
        let executionEventsOffset = 0;
        const processExecutionEventFile = () => {
            if (!fs.existsSync(executionEventsPath)) return;
            const file = fs.readFileSync(executionEventsPath, 'utf8');
            const unread = file.slice(executionEventsOffset);
            executionEventsOffset = file.length;
            for (const line of unread.split(/\r?\n/)) {
                if (!line.trim()) continue;
                try {
                    handleExecutionEvent(sessionId, JSON.parse(line));
                } catch (error) {
                    console.error(`Invalid event file entry for session ${sessionId}:`, error.message);
                }
            }
        };
        const executionEventFileTimer = setInterval(processExecutionEventFile, 100);
        const consumeExecutionEventLine = (line) => {
            const normalizedLine = line.trim();
            if (!normalizedLine.startsWith(EXECUTION_EVENT_PREFIX)) return;
            try {
                handleExecutionEvent(sessionId, JSON.parse(normalizedLine.slice(EXECUTION_EVENT_PREFIX.length)));
            } catch (error) {
                console.error(`Invalid execution event for session ${sessionId}:`, error.message);
            }
        };
        const consumeCompleteBufferedEvent = () => {
            const normalizedBuffer = executionEventBuffer.trim();
            if (!normalizedBuffer.startsWith(EXECUTION_EVENT_PREFIX)) return;
            try {
                const event = JSON.parse(normalizedBuffer.slice(EXECUTION_EVENT_PREFIX.length));
                handleExecutionEvent(sessionId, event);
                executionEventBuffer = '';
            } catch (error) {
                // The JSON may still be split across stdout chunks. Keep buffering it.
                if (!(error instanceof SyntaxError)) {
                    console.error(`Invalid execution event for session ${sessionId}:`, error.message);
                    executionEventBuffer = '';
                }
            }
        };
        playwrightProcess.stdout.on('data', (data) => {

            const chunk = data.toString();
            console.log(chunk);
            output += chunk;
            executionEventBuffer += chunk;
            const eventLines = executionEventBuffer.split(/\r?\n/);
            executionEventBuffer = eventLines.pop() || '';
            for (const line of eventLines) {
                consumeExecutionEventLine(line);
            }
            consumeCompleteBufferedEvent();

            // Update session logs and diagnostics without inferring test status.
            // Update session with current progress and logs
                        let currentSession = activeSessions.get(sessionId);
 
if (currentSession?.status === 'aborted' || currentSession?.status === 'abort_requested') {
// console.log('🚨 OUTPUT RECEIVED AFTER ABORT 🚨');
// console.log(`Session: ${sessionId}`);
// console.log(`PID: ${playwrightProcess.pid}`);
// console.log(`Chunk Length: ${data.length}`);
//  
// console.log('FIRST 300 CHARS BELOW');
// console.log(chunk.substring(0, 300));
return;
}
            const session = activeSessions.get(sessionId);
//             console.log('📦 PROCESS DETAILS');
// console.log({
// pid: session.process?.pid,
// spawnfile: session.process?.spawnfile,
// spawnargs: session.process?.spawnargs,
// killed: session.process?.killed,
// connected: !session.process?.destroyed
// });
            if (session) {
                session.status = 'running';
                session.currentLOB = lob;
                session.logs = session.logs || [];
                session.logs.push(chunk.trim());
                session.fullOutput = output; // 🔧 NEW: Store full output for abort scenarios
                
                // 🔧 CAPTURE REAL-TIME DATA for partial reports
                if (!session.capturedData) {
                    session.capturedData = {
                        accountNumber: '##',
                        submissionNumber: '##',
                        policyNumber: '##'
                    };
                }
                
                // Extract numbers in real-time from output
                captureRealTimeData(chunk, session);
                
                // Keep only last 50 log entries to avoid memory issues
                if (session.logs.length > 50) {
                    session.logs = session.logs.slice(-50);
                }
                
                // Update progress based on output patterns
                if (chunk.includes('Running')) {
                    session.progress = 20;
                    session.statusMessage = 'Running tests...';
                } else if (chunk.includes('passed') || chunk.includes('failed')) {
                    session.progress = 90;
                    session.statusMessage = 'Tests completing...';
                }
                
                activeSessions.set(sessionId, session);
            }

            // Legacy stdout status detection is retained below only as historical logging code.
            // It must never mutate execution state or notify the UI.
            if (false) {
            // Parse test case progress from playwright output
            const testCaseProgress = parseTestCaseProgress(chunk, lob, sessionId);


            // 🎯 DEBUG: Enhanced logging for test status transitions
            if (testCaseProgress && testCaseProgress.testCaseNumber) {
                console.log(`📊 WebSocket Emit - Test ${testCaseProgress.testCaseNumber}: ${testCaseProgress.testStatus?.toUpperCase()} | ${testCaseProgress.testDescription || 'No description'}`);
            }
            
            // Send real-time test progress to ONLY session-specific clients
            io.to(`session_${sessionId}`).emit('testProgress', {
                sessionId: sessionId,
                lob: lob,
                output: chunk,
                timestamp: new Date().toISOString(),
                ...testCaseProgress // Include test case progress if available
            });// 🎯 FIX: Enhanced test completion detection patterns - ONLY for final completion
            const finalCompletionPatterns = [
                'npx playwright show-report',    // HTML report generation (final step)
                'Tests completed with issues',   // Error completion
                'test completed with issues but ready',  // Session ready pattern
                /\d+ passed.*in \d+/i,          // Pattern like "5 passed, 0 failed in 30s" (final summary)
                // 'Final Excel report saved',      // Custom final completion pattern
                // /afterAll.*Final Excel report/i  // test.afterAll completion
            ];
            
            // 🎯 NEW: Individual test completion patterns (for progress tracking only)
            const individualTestPatterns = [
                /Test_\d+.*passed/i,             // Individual test passed
                /Test_\d+.*failed/i,             // Individual test failed
                /Test_\d+.*✅/i,                 // Individual test success
                /Test_\d+.*❌/i,                 // Individual test failure
                /(\d+)\s+failed/i,
                /Expected\s+to\s+fail,\s+but\s+passed/i,
                /PDF report created:/i
            ];
            
            
            // Check for individual test completion (for progress updates only)
            let individualTestComplete = false;
            let individualTestData = null;
            // for (const pattern of individualTestPatterns) {
            //     const match = chunk.match(pattern);
            //     if (match) {
            //         individualTestComplete = true;
            //         // Extract test number and status
            //         const testMatch = chunk.match(/Test_(\d+)/);
            //         if (testMatch) {
            //             individualTestData = {
            //                 testCaseNumber: parseInt(testMatch[1]),
            //                 testStatus: chunk.includes('passed') || chunk.includes('✅') ? 'passed' : 'failed',
            //                 isIndividualTest: true
            //             };
            //         }
            //         break;
            //     }
            // }
                        // const failedMatch = chunk.match(/(\d+)\s+failed/i);
            // session = activeSessions.get(sessionId);
            const currentTestNumber = session?.currentTestIndex || 1;
            const passDetected =
                chunk.includes('Result.status: passed') &&
                chunk.includes('Has failed filtered steps: false') &&
                chunk.includes('Has any failed steps: false');

            const failDetected =
                chunk.includes('Has failed filtered steps: true') ||
                chunk.includes('Has any failed steps: true') ||
                chunk.includes('Unexpected underwriting') ||
                chunk.includes('Unexpected validation errors') 
                //|| /(\d+)\s+failed/i.test(chunk);
            if (failDetected) {
                individualTestComplete = true;
                individualTestData = {
                    testCaseNumber: currentTestNumber,
                    testStatus: 'failed',
                    isIndividualTest: true
                };
            }
            else if (passDetected) {
                individualTestComplete = true;
                individualTestData = {
                    testCaseNumber: currentTestNumber,
                    testStatus: 'passed',
                    isIndividualTest: true
                };
            }

            // console.log('TEST STATUS DETECTION', {
            //     currentTestNumber,
            //     individualTestComplete,
            //     individualTestData
            // });
            // Check for final completion (all tests done)
            let isFinalCompletion = false;
            for (const pattern of finalCompletionPatterns) {
                if (typeof pattern === 'string' ? chunk.includes(pattern) : pattern.test(chunk)) {
                    isFinalCompletion = true;
                    break;
                }
            }    
            // Handle individual test completion (progress update only)
            if (individualTestComplete && individualTestData) {
                console.log(`📊 Individual test ${individualTestData.testCaseNumber} completed: ${individualTestData.testStatus}`);
                // Send progress update, not completion event
                io.to(`session_${sessionId}`).emit('testProgress', {
                    sessionId: sessionId,
                    lob: lob,
                    testCaseNumber: individualTestData.testCaseNumber,
                    testStatus: individualTestData.testStatus,
                    totalTests: session?.includedTestsCount || progressData.totalTests || readMaxRecordFromTestFile(lob),
                    output: chunk,
                    timestamp: new Date().toISOString(),
                    individualTestComplete: true
                });
            }
            
            // Handle final completion (all tests done)
            // if (isFinalCompletion) {
            //     console.log(`🎯 FINAL test completion detected for session ${sessionId}`);
                
            //     // 🎯 FIX: Check if completion already emitted to prevent duplicates
            //     const session = activeSessions.get(sessionId);
            //     if (session && session.status !== 'completed') {
            //         console.log(`✅ ALL TESTS completed successfully for session ${sessionId}, LOB: ${lob}`);
                    
            //         // Update session with completion status
            //         session.status = 'completed';
            //         session.success = true;
            //         session.progress = 100;
            //         session.statusMessage = 'All tests completed successfully';
            //         session.lastActivity = new Date();
            //         activeSessions.set(sessionId, session);
                    
            //         // Notify ONLY session-specific clients about FINAL test completion
            //         emitCompletion( {
            //             sessionId: sessionId,
            //             lob: lob,
            //             success: true,
            //             timestamp: new Date().toISOString(),
            //             message: 'All tests completed successfully! Download your reports.',
            //             allTestsComplete: true,
            //             finalCompletion: true
            //         });
            //     }
            // }
            currentSession = activeSessions.get(sessionId);
            if (!currentSession?.abortRequested && isFinalCompletion) {
                const totalTests =
                    currentSession?.includedTestsCount ||
                    readMaxRecordFromTestFile(lob);
                if (currentSession && currentSession.currentTestIndex >= totalTests) {
                    console.log(`🎯 FINAL test completion detected for session ${sessionId}`);

                    emitCompletion({
                        sessionId,
                        lob,
                        success: true,
                        timestamp: new Date().toISOString(),
                        message: 'All tests completed successfully!',
                        allTestsComplete: true,
                        finalCompletion: true
                    });
                } else {
                    console.log(`⏳ Ignoring premature completion signal. Current=${currentSession?.currentTestIndex}, Total=${currentSession?.includedTestsCount}`);
                }
            }
            }
        });

        playwrightProcess.stderr.on('data', (data) => {
            const currentSession = activeSessions.get(sessionId);
            const chunk = data.toString();
            console.error(chunk);
            errorOutput += chunk;
            if (currentSession?.abortRequested || currentSession?.status === 'aborted' || currentSession?.status === 'abort_requested') {
                console.log('🚨 STDERR RECEIVED AFTER ABORT 🚨');
                console.log(chunk);
                return;
            }
        });        playwrightProcess.on('close', (code) => {

            const closeSession = activeSessions.get(sessionId);
            if (!closeSession || (runToken && closeSession.runToken !== runToken)) {
                console.log(`⏭️ Ignoring close event from stale run for session ${sessionId}`);
                clearTimeout(timeoutId);
                clearInterval(executionEventFileTimer);
                return resolve({ success: false, staleRun: true });
            }

            if (fs.existsSync(executionAbortFile)) {
                fs.unlinkSync(executionAbortFile);
                console.log('🧹 execution-aborted.flag cleaned up');
            }

            clearTimeout(timeoutId);
            processExecutionEventFile();
            clearInterval(executionEventFileTimer);
            if (executionEventBuffer.trim()) {
                consumeExecutionEventLine(executionEventBuffer);
                executionEventBuffer = '';
            }
            const wasAborted = Boolean(closeSession.abortRequested);
            const closeState = closeSession.executionState || {};
            if (wasAborted && closeState.currentRunningTest) {
                const runningTest = closeState.tests[closeState.currentRunningTest] || {};
                closeState.tests[closeState.currentRunningTest] = {
                    ...runningTest,
                    testNumber: closeState.currentRunningTest,
                    status: 'ABORTED',
                    name: runningTest.name || closeState.currentTestName || `Test_${closeState.currentRunningTest}`
                };
            }
            closeState.status = wasAborted ? 'ABORTED' : 'COMPLETED';
            closeState.completed = true;
            closeState.reportsReady = true;
            closeState.currentRunningTest = null;
            closeState.currentTestName = null;
            closeState.completionEventSent = true;
            closeSession.executionState = closeState;
            closeSession.status = wasAborted ? 'aborted' : 'completed';
            closeSession.progress = 100;
            closeSession.reportsReady = true;
            closeSession.lastActivity = new Date();
            closeSession.process = null;
            activeSessions.set(sessionId, closeSession);
            emitSessionChanged(sessionId);

            setTimeout(async () => {
                await copyPartialReportsToSession(sessionId, lob, runToken);
            }, wasAborted ? 3000 : 500);

            return resolve({
                exitCode: code,
                success: !wasAborted,
                aborted: wasAborted,
                resultsPath: `./sessions/${sessionId}/reports/${lob}-Result.xlsx`
            });

            // Kept below temporarily for report-generation reference while the
            // process completion path is migrated away from legacy emitters.
            /* istanbul ignore next */
            const completedSession = activeSessions.get(sessionId);

            if (completedSession && !completedSession.abortRequested) {

                completedSession.status = 'completed';
                completedSession.progress = 100;
                completedSession.lastActivity = new Date();
                completedSession.executionState.completed = true;
                completedSession.executionState.currentRunningTest = null;
                completedSession.reportsReady = true;
                activeSessions.set(sessionId, completedSession);
            }
            let session = activeSessions.get(sessionId);
            if (session?.abortRequested) {

                console.log(`🛑 Session ${sessionId} aborted`);
                session.status = 'aborted';
                activeSessions.set(sessionId, session);
                setTimeout(async () => {
                    await copyPartialReportsToSession(sessionId, lob, runToken);
                }, 3000);

                emitCompletion({
                    sessionId,
                    lob,
                    success: false,
                    aborted: true,
                    message: 'Execution aborted by user'
                });


                return resolve({
                    success: true,
                    aborted: true
                });
            }
            const runEndTime = Date.now();
            session = activeSessions.get(sessionId);
            if (session) {
                session.playwrightEndTime = runEndTime;
                activeSessions.set(sessionId, session);
            }
            console.log(
                `🏁 Playwright exited at ${new Date().toLocaleTimeString()}`
            );
            const summary = parseTestOutput(output);
            
            // Clean up process from session
            if (activeSessions.has(sessionId)) {
                const session = activeSessions.get(sessionId);
                if (session.process) {
                    session.process = null;
                    activeSessions.set(sessionId, session);
                    console.log(`🧹 Process cleaned up for session ${sessionId}`);
                }
            }
            
            // Clean up session window tracking
            if (sessionWindows.has(sessionId)) {
                console.log(`🪟 Closing terminal window for session ${sessionId}`);
                sessionWindows.delete(sessionId);
            }            // 🎯 FIX: Enhanced completion detection for all scenarios
            const isTestCompleted = 
                code === 0 ||  // Normal success
                output.includes('Expected to fail, but passed') ||  // From your logs
                output.includes('Tests completed with issues') ||
                output.includes('test completed with issues but ready') ||
                /\d+\s+(passed|failed)/i.test(output) ||  // "1 failed", "2 passed" etc
                output.includes('show-report') ||  // HTML report generation 
                (code === 1 && (
                    output.includes('passed') || 
                    output.includes('failed') ||
                    output.includes('attachment #')  // Test attachments indicate completion
                ));
            
            console.log(`🔍 DETAILED COMPLETION CHECK for session ${sessionId}:`);
            console.log(`   Exit code: ${code}`);
            console.log(`   Output length: ${output.length} chars`);
            console.log(`   Contains "Expected to fail": ${output.includes('Expected to fail, but passed')}`);
            console.log(`   Contains "1 failed": ${/\d+\s+(passed|failed)/i.test(output)}`);
            console.log(`   Contains "show-report": ${output.includes('show-report')}`);
            console.log(`   Contains "passed": ${output.includes('passed')}`);
            console.log(`   Contains "failed": ${output.includes('failed')}`);
            console.log(`   Contains "attachment #": ${output.includes('attachment #')}`);
            console.log(`   Final isTestCompleted: ${isTestCompleted}`);
            
            // 🎯 ALWAYS EMIT COMPLETION EVENT for any test that finishes
            console.log(`🚀 FORCE EMITTING testCompleted event for session ${sessionId}`);
            
            if (isTestCompleted) {console.log(`✅ Tests completed successfully for session ${sessionId}, LOB: ${lob}`);
                  // Notify ONLY session-specific clients about test completion
                emitCompletion( {
                    sessionId: sessionId,
                    lob: lob,
                    success: true,
                    summary: summary,
                    timestamp: new Date().toISOString(),
                    message: 'Test completed successfully! Download your reports and refresh the page.',
                    autoRefreshOption: true
                });                  // 🎯 FIX: Copy PDF reports to session directory for normal completion
                // Try immediate copy first
                setTimeout(async () => {
                    console.log(`📋 First attempt: Copying completion reports to session ${sessionId} for LOB: ${lob}`);
                    await copyPartialReportsToSession(sessionId, lob, runToken);
                }, 500); // Quick attempt
                
                // Follow up copy to ensure everything is captured
                setTimeout(async () => {
                    console.log(`📋 Second attempt: Copying completion reports to session ${sessionId} for LOB: ${lob}`);
                    await copyPartialReportsToSession(sessionId, lob, runToken);
                }, 5000); // Give 5 seconds for reports to be generated
                
                // Optional: Send auto-refresh signal after 25 seconds (gives more time for download)
                setTimeout(() => {
                    console.log(`🔄 Sending auto-refresh signal for session ${sessionId}`);
                    io.to(`session_${sessionId}`).emit('autoRefreshReady', {
                        sessionId: sessionId,
                        lob: lob,
                        message: 'Server is ready for next test. You can refresh now or wait for auto-refresh.'
                    });
                }, 25000); // 25 seconds delay
                
                // Update session status to ready for next test
                const session = activeSessions.get(sessionId);
                if (session) {
                    session.status = 'completed';
                    session.success = true;
                    session.progress = 100;
                    session.lastActivity = new Date();
                    activeSessions.set(sessionId, session);
                }
                
                console.log(`🎯 Session ${sessionId} test completed successfully and ready for next upload`);
                
                resolve({
                    exitCode: code,
                    success: true,
                    summary: summary,
                    output: output,
                    resultsPath: `./sessions/${sessionId}/reports/${lob}-Result.xlsx`
                });
            } else {                console.log(`⚠️ Tests completed with issues for session ${sessionId}, LOB: ${lob} (exit code: ${code})`);
                
                // Notify ONLY session-specific clients about test completion with issues
                emitCompletion( {
                    sessionId: sessionId,
                    lob: lob,
                    success: false,
                    summary: summary,
                    timestamp: new Date().toISOString(),
                    exitCode: code,
                    message: 'Test completed with issues. Your session is ready for next upload.'
                });
                  // 🎯 FIX: Copy PDF reports to session directory for completion with issues too
                setTimeout(async () => {
                    console.log(`📋 Copying completion reports to session ${sessionId} for LOB: ${lob} (with issues)`);
                    await copyPartialReportsToSession(sessionId, lob, runToken);
                }, 2000); // Give 2 seconds for reports to be generated
                
                // Update session status to ready for next test
                const session = activeSessions.get(sessionId);
                if (session) {
                    session.status = 'completed';
                    session.success = false;
                    session.progress = 100;
                    session.lastActivity = new Date();

                    activeSessions.set(sessionId, session);
                }
                  console.log(`⚠️ Session ${sessionId} test completed with issues but ready for next upload`);
                
                // Even if tests fail, we still consider it a successful execution
                resolve({
                    exitCode: code,
                    success: true,
                    summary: summary,
                    output: output,
                    errorOutput: errorOutput,
                    resultsPath: `./sessions/${sessionId}/reports/${lob}-Result.xlsx`
                });
            }
            
            // 🛡️ SAFETY NET: Always ensure completion event fires for ANY process exit
            setTimeout(() => {
                console.log(`🛡️ SAFETY NET: Ensuring completion event for session ${sessionId}`);
                const session = activeSessions.get(sessionId);

                if (session?.abortRequested) {
                    console.log(
                        `🛑 Safety net skipped because execution was aborted`
                    );
                    return;
                }
                emitCompletion( {
                    sessionId: sessionId,
                    lob: lob,
                    success: summary.failed === 0,
                    summary: summary,
                    timestamp: new Date().toISOString(),
                    exitCode: code,
                    message: summary.failed === 0 ? 'Test completed successfully!' : 'Test completed. Download your reports.',
                    safetyNet: true
                });
            }, 3000); // Wait 3 seconds to ensure main events fire first
        });

        // Track the session window
        sessionWindows.set(sessionId, {
            process: playwrightProcess,
            title: sessionWindowTitle,
            lob: lob,
            startTime: new Date(),
            pid: playwrightProcess.pid
        });
        
        console.log(`🪟 Opened new terminal window for session ${sessionId}: "${sessionWindowTitle}"`);
        
        playwrightProcess.on('error', (error) => {
            console.error(`❌ Failed to start tests for ${lob}:`, error);
            // Clean up session window tracking on error
            if (sessionWindows.has(sessionId)) {
                sessionWindows.delete(sessionId);
            }
            reject(new Error(`Failed to execute tests: ${error.message}`));
        });

        // Set timeout for test execution (30 minutes)
        // setTimeout(() => {
        //     playwrightProcess.kill();
        //     reject(new Error('Test execution timed out after 30 minutes'));
        // }, 30 * 60 * 1000);
        const timeoutId = setTimeout(() => {
            console.error(`⏰ Session ${sessionId} timed out`);
            try {
                playwrightProcess.kill('SIGKILL');
            } catch (e) {
                console.error(e);
            }
            reject(new Error('Test execution timed out after 30 minutes'));
        }, 120 * 60 * 1000); //2 hours
    });
}

// Parse test output to extract summary
function parseTestOutput(output) {
    const summary = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
    };

    // Try to extract test results from Playwright output
    const lines = output.split('\n');
    
    for (const line of lines) {
        if (line.includes('passed') || line.includes('failed') || line.includes('skipped')) {
            // Extract numbers from lines like "1 passed (2s)" or "2 failed"
            const passedMatch = output.match(/(\d+)\s+passed\s+\(/);
            const failedMatch = output.match(/(\d+)\s+failed\s+\(/);
            const skippedMatch = output.match(/(\d+)\s+skipped\s+\(/);
            
            if (passedMatch) summary.passed = parseInt(passedMatch[1]);
            if (failedMatch) summary.failed = parseInt(failedMatch[1]);
            if (skippedMatch) summary.skipped = parseInt(skippedMatch[1]);
        }
    }
    
    summary.total = summary.passed + summary.failed + summary.skipped;
    
    // If we couldn't parse anything, assume at least 1 test ran
    if (summary.total === 0) {
        summary.total = 1;
        summary.passed = output.includes('failed') ? 0 : 1;
        summary.failed = output.includes('failed') ? 1 : 0;
    }
    
    return summary;
}
function emitSessionChanged(sessionId) {
    io.to(`session_${sessionId}`).emit('sessionChanged');
}

function finalizeSessionAbort(sessionId, abortedTestNumber = null) {
    const session = activeSessions.get(sessionId);
    if (!session || session.abortFinalized) return;

    const executionState = session.executionState || {
        status: 'RUNNING',
        currentRunningTest: null,
        currentTestName: null,
        completed: false,
        reportsReady: false,
        completionEventSent: false,
        tests: {}
    };
    const runningTestNumber = executionState.currentRunningTest || abortedTestNumber || session.abortedTestNumber || session.currentTestIndex;
    const runningTestNumbers = Object.entries(executionState.tests)
        .filter(([, test]) => test.status === 'RUNNING')
        .map(([testNumber]) => Number(testNumber))
        .filter(Number.isInteger);

    if (runningTestNumber && !runningTestNumbers.includes(runningTestNumber)) {
        runningTestNumbers.push(runningTestNumber);
    }

    for (const testNumber of runningTestNumbers) {
        const runningTest = executionState.tests[testNumber] || {};
        executionState.tests[testNumber] = {
            ...runningTest,
            testNumber,
            status: 'ABORTED',
            name: runningTest.name || executionState.currentTestName || session.currentTestCaseName || `Test_${testNumber}`
        };
    }

    executionState.status = 'ABORTED';
    executionState.completed = true;
    executionState.reportsReady = true;
    executionState.currentRunningTest = null;
    executionState.currentTestName = null;
    executionState.completionEventSent = true;
    session.executionState = executionState;
    session.status = 'aborted';
    session.progress = 100;
    session.reportsReady = true;
    session.abortFinalized = true;
    session.lastActivity = new Date();
    activeSessions.set(sessionId, session);
    emitSessionChanged(sessionId);
}

function handleExecutionEvent(sessionId, event) {
    const session = activeSessions.get(sessionId);
    if (!session || !event || !event.type) return;

    // Do not allow buffered stdout or event-file messages to replace the
    // terminal aborted state with RUNNING/PASSED after the abort click.
    if (session.abortFinalized) return;

    if (!session.processedExecutionEventIds) {
        session.processedExecutionEventIds = new Set();
    }
    if (event.eventId && session.processedExecutionEventIds.has(event.eventId)) return;
    if (event.eventId) session.processedExecutionEventIds.add(event.eventId);

    if (!session.executionState) {
        session.executionState = {
            status: 'RUNNING',
            currentRunningTest: null,
            currentTestName: null,
            completed: false,
            reportsReady: false,
            completionEventSent: false,
            tests: {}
        };
    }

    const testNumber = Number(event.executionIndex || event.testNumber);
    if (!Number.isInteger(testNumber) || testNumber < 1) return;

    console.log(`📡 Execution event received for ${sessionId}: ${event.type} test ${testNumber}`);

    const testName = event.testName || event.testDescription || `Test_${testNumber}`;
    const existingTest = session.executionState.tests[testNumber] || {};

    switch (event.type) {
        case 'TEST_STARTED':
            if (session.executionState.completed) return;
            session.executionState.status = 'RUNNING';
            session.executionState.currentRunningTest = testNumber;
            session.executionState.currentTestName = testName;
            session.executionState.tests[testNumber] = {
                ...existingTest,
                testNumber,
                sourceTestNumber: event.sourceTestNumber,
                status: 'RUNNING',
                name: testName,
                testName
            };
            break;
        case 'TEST_PASSED':
            session.executionState.tests[testNumber] = {
                ...existingTest,
                testNumber,
                sourceTestNumber: event.sourceTestNumber,
                status: 'PASSED',
                name: testName,
                testName,
                submissionNumber: event.submissionNumber,
                policyNumber: event.policyNumber
            };
            if (session.executionState.currentRunningTest === testNumber) {
                session.executionState.currentRunningTest = null;
                session.executionState.currentTestName = null;
            }
            break;
        case 'TEST_FAILED':
            session.executionState.tests[testNumber] = {
                ...existingTest,
                testNumber,
                sourceTestNumber: event.sourceTestNumber,
                status: 'FAILED',
                name: testName,
                testName,
                error: event.error
            };
            if (session.executionState.currentRunningTest === testNumber) {
                session.executionState.currentRunningTest = null;
                session.executionState.currentTestName = null;
            }
            break;
        case 'TEST_ABORTED':
            session.executionState.status = 'ABORTED';
            session.executionState.tests[testNumber] = {
                ...existingTest,
                testNumber,
                sourceTestNumber: event.sourceTestNumber,
                status: 'ABORTED',
                name: testName,
                testName
            };
            if (session.executionState.currentRunningTest === testNumber) {
                session.executionState.currentRunningTest = null;
                session.executionState.currentTestName = null;
            }
            break;
        default:
            return;
    }

    session.lastActivity = new Date();
    activeSessions.set(sessionId, session);
    emitSessionChanged(sessionId);
}

// Read maxrecord value from test file
function readMaxRecordFromTestFile(lob) {
    try {
        const normalizedLob = lob === 'Renewal_DB' ? 'Core_Dwelling_Basic' : lob;
        const testFileName = `${normalizedLob}.spec.ts`;
        const testFilePath = path.join(__dirname, 'tests', testFileName);
        
        if (!fs.existsSync(testFilePath)) {
            console.warn(`Test file not found: ${testFilePath}`);
            return 1; // Default fallback
        }
        
        const fileContent = fs.readFileSync(testFilePath, 'utf8');
        
        // Look for maxrecord declaration patterns
        const maxRecordPatterns = [
            /const\s+maxrecord\s*=\s*(\d+)/i,
            /let\s+maxrecord\s*=\s*(\d+)/i,
            /var\s+maxrecord\s*=\s*(\d+)/i,
            /maxrecord\s*=\s*(\d+)/i
        ];
        
        for (const pattern of maxRecordPatterns) {
            const match = fileContent.match(pattern);
            if (match && match[1]) {
                const maxRecord = parseInt(match[1]);
                // console.log(`Found maxrecord=${maxRecord} in ${testFileName}`);
                return maxRecord;
            }
        }
        
        // console.warn(`maxrecord not found in ${testFileName}, using default: 1`);
        return 1; // Default if not found
    } catch (error) {
        console.error(`Error reading maxrecord from test file ${lob}:`, error);
        return 1; // Default on error
    }
}

// Parse test case progress from playwright output
function parseTestCaseProgress(output, lob, sessionId) {
    const progressData = {};
    
    // 🎯 FIXED: Always use maxrecord from test file for execution (full dataset)
    // Don't use filtered count for execution progress
    let totalTests = readMaxRecordFromTestFile(lob); // Always use full count
    
    if (sessionId && activeSessions.has(sessionId)) {
        const session = activeSessions.get(sessionId);
        // 🎯 COMMENT OUT: Don't override with filtered count for execution
        if (session.includedTestsCount) {
            totalTests = session.includedTestsCount; // Use actual included tests count
            // console.log(`📊 Using included tests count from session: ${totalTests} (instead of maxrecord)`);
        }
        // console.log(`📊 Using maxrecord for execution progress: ${totalTests} (full dataset)`);
    }

    let currentTest = 0;
    let testDescription = '';
    let testCaseName = null;
    let isTestStarting = false;
    let isTestCompleting = false;

    // Parse multiple lines if this is a multiline output
    const outputLines = output.split('\n').filter(line => line.trim());
    for (let line of outputLines) {
        // Pattern 1: Test title at start (indicates test beginning)
        const testTitleMatch = line.match(/Test title:\s*(.+)/);
        if (testTitleMatch) {
            testCaseName = testTitleMatch[1].trim();
            isTestStarting = true;
            console.log(`📋 TEST STARTING: ${testCaseName}`);
        }
        // Pattern 2: Playwright execution line pattern "[1/5] [browser] › Test_1" - STRICT MATCHING
        // const playwrightExecMatch = line.match(/\[(\d+)\/\d+\]\s*\[.+?\]\s*›.*?([^\/]+\.spec\.ts).*?Test_(\d+)/);
        const playwrightExecMatch = line.match(
            /\[(\d+)\/(\d+)\]\s+\[(.*?)\]\s+›\s+.*?›\s+(.+)$/i
        );

        line = line.replace(
            /\u001b\[[0-9;]*[A-Za-z]/g,
            ''
        );

        if (playwrightExecMatch) {
            const testNumber = parseInt(playwrightExecMatch[1], 10);
            totalTests = parseInt(playwrightExecMatch[2], 10);
            const browser = playwrightExecMatch[3];
            const testName = playwrightExecMatch[4].trim();
            console.log(`🎯 browser=${browser}, currentTest=${currentTest}/${totalTests}, testName=${testName}`);

            // CRITICAL FIX: Only accept if sequence matches test number AND it's the actual execution line
            if (testNumber && line.includes('›')) {
                currentTest = testNumber;
                isTestStarting = true;
                console.log(`🚀 PLAYWRIGHT EXEC: Test_${currentTest} STARTING (sequence ) - CONFIRMED`);
                break; // Use this as primary detection
            } else {
                console.log(`⚠️ SEQUENCE MISMATCH: Found sequence for Test_${testNumber} - IGNORING`);
            }
        }
          // Pattern 3: Playwright test names "Test_1", "Test_2" etc (fallback with strict validation)
        if (!currentTest) {
            const testNameMatch = line.match(/Test_(\d+)/);
            if (testNameMatch) {
                const detectedTest = parseInt(testNameMatch[1]);
                
                // Check if test is completing (has ✓ or ✗)
                if (line.match(/✓/) || line.match(/✗/) || line.includes('passed') || line.includes('failed')) {
                    currentTest = detectedTest;
                    isTestCompleting = true;
                    console.log(`📊 TEST COMPLETING: Test_${currentTest} ${line.includes('✓') || line.includes('passed') ? 'PASSED' : 'FAILED'}`);
                    break;
                } 
                // Only detect as starting if we see clear execution indicators
                else if (line.includes('Test title:') || line.includes('›')) {
                    currentTest = detectedTest;
                    isTestStarting = true;
                    console.log(`📊 TEST STARTING: Test_${currentTest} (from title/execution)`);
                    break;
                }
                // CRITICAL: Ignore random Test_X mentions in logs/filenames
                else {
                    console.log(`⚠️ IGNORING: Random Test_${detectedTest} mention in: ${line.substring(0, 100)}...`);
                }
            }
        }
    }
    
    // If no current test detected from patterns above, fallback to basic detection
    if (!currentTest) {
        const basicTestMatch = output.match(/Test_(\d+)/);
        if (basicTestMatch) {
            currentTest = parseInt(basicTestMatch[1]);
            console.log(`📊 BASIC TEST DETECTED: Test_${currentTest}`);
        }
    }
    
    // Build description
    if (currentTest > 0) {
        if (testCaseName) {
            testDescription = `${testCaseName} (${currentTest}/${totalTests})`;
        } else {
            testDescription = `Test ${currentTest} of ${totalTests}`;
        }
    }
    
    // Pattern 2: Look for test steps like "GPA HO Account creation", "enter policy details" etc
    const stepPatterns = [
        { pattern: /loginPage/i, step: 'Login Page' },
        { pattern: /Account creation/i, step: 'Account Creation' },
        { pattern: /enter policy details/i, step: 'Policy Details' },
        { pattern: /enter property details/i, step: 'Property Details' },
        { pattern: /enter valuation details/i, step: 'Valuation Details' },
        { pattern: /enter discount surcharge details/i, step: 'Discount/Surcharge' },
        { pattern: /quote property details/i, step: 'Quote Generation' },
        { pattern: /enter and validate riskanalysis details/i, step: 'Risk Analysis' },
        { pattern: /enter Issuance details/i, step: 'Issuance Details' },
        { pattern: /enter and validate payment details/i, step: 'Payment & Completion' }
    ];
    
    for (const { pattern, step } of stepPatterns) {
        if (pattern.test(output)) {
            if (!currentTest) {
                currentTest = 1; // Default to first test case
            }
            if (testCaseName) {
                testDescription = `${testCaseName}: ${step}`;
            } else {
                testDescription = `Test ${currentTest}: ${step}`;
            }
            break;
        }
    }
    
    // Pattern 3: Look for test completion patterns
    const completedMatch = output.match(/(\d+)\s*passed|(\d+)\s*failed/);
    if (completedMatch && !currentTest) {
        currentTest = totalTests; // Mark as completed
        if (testCaseName) {
            testDescription = `✅ ${testCaseName} completed successfully!`;
        } else {
            testDescription = `✅ All ${totalTests} test cases completed!`;
        }
    }
    
    // Pattern 4: Fallback - look for any numbers that might indicate progress
    if (!currentTest) {
        const numberMatch = output.match(/(\d+)/);
        if (numberMatch) {
            const num = parseInt(numberMatch[1]);
            if (num > 0 && num <= totalTests) {
                currentTest = num;
                if (testCaseName) {
                    testDescription = `${testCaseName}: Processing...`;
                } else {
                    testDescription = `Processing test case ${currentTest} of ${totalTests}`;
                }
            }
        }
    }      // 🎯 ENHANCED: Smart status detection based on sequence and patterns
    let testStatus = 'running'; // Default status
    
    // 🎯 PRIORITY 1: Check for explicit test starting patterns
    if (isTestStarting) {
        testStatus = 'running';
        console.log(`🚀 TEST STARTING CONFIRMED: Test ${currentTest} -> RUNNING`);
    }
    // 🎯 PRIORITY 2: Check for explicit test completion patterns
    else if (isTestCompleting) {
        if (output.includes('✓') || output.includes('passed') || output.includes('passed')) {
            testStatus = 'passed';
            console.log(`✅ TEST COMPLETION CONFIRMED: Test ${currentTest} -> PASSED`);
        } else if (output.includes('✗') || output.includes('failed')) {
            testStatus = 'failed';
            console.log(`❌ TEST COMPLETION CONFIRMED: Test ${currentTest} -> FAILED`);
        }
    }    // 🎯 PRIORITY 3: Strict context analysis for status
    else if (currentTest > 0) {
        // Check for PDF generation (indicates test completion)
        if (output.includes(`Test_${currentTest}_`) && output.includes('.pdf')) {
            testStatus = 'passed';
            console.log(`📄 PDF GENERATION DETECTED: Test ${currentTest} -> PASSED (PDF created)`);
        }
        // Check for step patterns (indicates test is actually running)
        else if ((output.includes('loginPage') || output.includes('Account creation') || 
                 output.includes('Policy details') || output.includes('Property details')) &&
                 output.includes(`Test title:`)) {
            testStatus = 'running';
            console.log(`🔄 TEST STEP DETECTED: Test ${currentTest} -> RUNNING`);
        }
        // 🎯 CRITICAL FIX: Only mark as running if we see ACTUAL execution patterns
        else if (output.includes(`[${currentTest}/${totalTests}]`) || 
                 output.includes(`Test_${currentTest}`) && output.includes(`msedge`)) {
            testStatus = 'running';
            console.log(`🚀 PLAYWRIGHT EXEC: Test_${currentTest} STARTING (sequence ${currentTest})`);
        }
        // 🎯 NEW: Don't default to running - ignore if no clear evidence
        else {
            console.log(`⚠️ IGNORING: Test ${currentTest} - No clear execution evidence`);
            return {}; // Return empty to avoid false status
        }
    }    // 🎯 CRITICAL: Only emit if we have a REAL test number from actual execution patterns
    if (currentTest > 0 && currentTest <= totalTests) {
        
        // 🎯 SEQUENCE VALIDATION: Only allow sequential test execution
        // Store last processed test per session to prevent wrong sequence
        if (!global.sessionTestSequence) global.sessionTestSequence = {};
        const lastProcessedTest = global.sessionTestSequence[sessionId] || 0;
        
        // ❌ PREVENT OUT-OF-SEQUENCE DETECTION
        if (testStatus === 'running') {
            // Only allow next sequential test or restart from test 1
            if (currentTest !== lastProcessedTest + 1 && !(lastProcessedTest === 0 && currentTest === 1)) {
                console.log(`⚠️ SEQUENCE BLOCK: Test ${currentTest} wants to run but last processed was ${lastProcessedTest}. Expected ${lastProcessedTest + 1}. Ignoring.`);
                return {}; // Don't emit out-of-sequence tests
            }
            
            // ✅ ALLOW PROPER SEQUENCE
            global.sessionTestSequence[sessionId] = currentTest;
            console.log(`📊 SEQUENCE CONFIRMED: Test ${currentTest} now running (Previous: ${lastProcessedTest})`);
        }
         else if (testStatus === 'passed' || testStatus === 'failed') {
            // Completion is always allowed for the current running test
            console.log(`📊 SEQUENCE COMPLETE: Test ${currentTest} finished with ${testStatus}`);
        }
        
        progressData.testCaseNumber = currentTest;
        progressData.totalTests = totalTests;
        progressData.testDescription = testDescription;
        progressData.testCaseName = testCaseName; 
        progressData.testStatus = testStatus; 
        
        // 🎯 FIX: Progressive percentage 
        if (currentTest < totalTests) {
            progressData.percentage = Math.floor((currentTest / totalTests) * 90); 
        } else if (output.includes('passed') || output.includes('completed')) {
            progressData.percentage = 100; 
            progressData.testDescription = testCaseName ? 
                `🎉 ${testCaseName} completed successfully!` : 
                `🎉 All ${totalTests} test cases completed successfully!`;
        } else {
            progressData.percentage = Math.floor((currentTest / totalTests) * 95); 
        }
          console.log(`📊 WebSocket Emit - Test ${currentTest}: ${testStatus.toUpperCase()} | ${progressData.testDescription}`);
        
        // 🎯 NEW: Update session with current test case information for PDF reports
        if (sessionId && activeSessions.has(sessionId)) {
            const session = activeSessions.get(sessionId);
            if (testStatus === 'running' || testStatus === 'passed' || testStatus === 'failed') {
                session.currentTestIndex = currentTest;
                session.lastKnownTestStatus = testStatus;
                session.lastKnownTestDescription = testDescription;

                if (testCaseName) {
                    session.currentTestCaseName = testCaseName;
                    console.log(`📋 Session Updated - Current Test: ${currentTest}, Name: ${testCaseName}`);
                } else if (session.testCaseNames && session.testCaseNames[currentTest - 1]) {
                    session.currentTestCaseName = session.testCaseNames[currentTest - 1];
                    console.log(`📋 Session Updated - Current Test: ${currentTest}, Name from stored: ${session.currentTestCaseName}`);
                }
                activeSessions.set(sessionId, session);
            }
        }
    }

    return progressData;
}

// 🎯 NEW: Enhanced Excel copy function with retry mechanism for UI timing
async function copyExcelReportsWithRetry(baseReportsDir, sessionReportsDir, lob, twentyFourHoursAgo) {
    console.log(`📊 Starting Excel copy with retry for LOB: ${lob}`);
    console.log(`📊 Base dir: ${baseReportsDir}`);
    console.log(`📊 Session dir: ${sessionReportsDir}`);
    
    // 🎯 FIRST: Check if Excel files already exist in session directory (from UI run)
    console.log(`📊 First checking session directory for existing Excel files...`);
    if (fs.existsSync(sessionReportsDir)) {
        const sessionExcelFiles = fs.readdirSync(sessionReportsDir)
            .filter(file => file.toLowerCase().endsWith('.xlsx'))
            .map(file => {
                const filePath = path.join(sessionReportsDir, file);
                const stats = fs.statSync(filePath);
                return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
            })
            .filter(file => file.mtime > twentyFourHoursAgo)
            .sort((a, b) => b.mtime - a.mtime);
            
        console.log(`📊 Found ${sessionExcelFiles.length} recent Excel files in session directory`);
        if (sessionExcelFiles.length > 0) {
            sessionExcelFiles.forEach((file, index) => {
                console.log(`   SESSION ${index + 1}. ${file.name} (${file.size} bytes, ${new Date(file.mtime).toLocaleString()})`);
            });
            
            // Files already exist in session directory, no need to copy
            console.log(`📊 ✅ Excel files already exist in session directory, skipping copy`);
            return;
        }
    }
    
    if (!fs.existsSync(baseReportsDir)) {
        console.log(`📊 ❌ Base reports directory doesn't exist: ${baseReportsDir}`);
        return;
    }
    
    // Retry mechanism for UI-generated Excel files (may take time to write)
    const maxRetries = 5;
    let attempt = 0;
    let excelFiles = [];
    
    while (attempt < maxRetries) {
        attempt++;
        console.log(`📊 Attempt ${attempt}/${maxRetries} - Looking for Excel files in base directory...`);
        
        try {
            excelFiles = fs.readdirSync(baseReportsDir)
                .filter(file => file.toLowerCase().endsWith('.xlsx'))
                .map(file => {
                    const filePath = path.join(baseReportsDir, file);
                    const stats = fs.statSync(filePath);
                    return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
                })
                .filter(file => file.mtime > twentyFourHoursAgo)
                .sort((a, b) => b.mtime - a.mtime); // Most recent first
                
            console.log(`📊 Found ${excelFiles.length} recent Excel files on attempt ${attempt}`);
            if (excelFiles.length > 0) {
                excelFiles.forEach((file, index) => {
                    console.log(`   ${index + 1}. ${file.name} (${file.size} bytes, ${new Date(file.mtime).toLocaleString()})`);
                });
            }
            
            if (excelFiles.length > 0) {
                // Found files, break out of retry loop
                break;
            }
            
            if (attempt < maxRetries) {
                console.log(`📊 No Excel files found yet, waiting 2 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            }
        } catch (error) {
            console.log(`📊 Error during attempt ${attempt}:`, error.message);
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    if (excelFiles.length > 0) {
        // Copy the most recent Excel
        const latestExcel = excelFiles[0];
        const targetPath = path.join(sessionReportsDir, `${lob}_Partial_Results.xlsx`);
        try {
            fs.copyFileSync(latestExcel.path, targetPath);
            console.log(`📊 ✅ Copied partial Excel: ${latestExcel.name} → ${lob}_Partial_Results.xlsx (${latestExcel.size} bytes)`);
            
            // Also copy with original name for reference
            const originalTargetPath = path.join(sessionReportsDir, latestExcel.name);
            if (!fs.existsSync(originalTargetPath)) {
                fs.copyFileSync(latestExcel.path, originalTargetPath);
                console.log(`📊 ✅ Also copied as: ${latestExcel.name}`);
            }
        } catch (copyError) {
            console.log(`📊 ❌ Error copying Excel file:`, copyError.message);
        }
    } else {
        console.log(`📊 ⚠️ No recent Excel files found after ${maxRetries} attempts`);
        
        console.log(`📊 ❌ No current-run Excel file found; leaving the session without an Excel report`);
    }
}

// Function to copy partial reports to session directory (for aborted tests)
async function copyPartialReportsToSession(sessionId, lob, expectedRunToken = null) {
    try {
        console.log(`📊 Starting partial reports copy for session ${sessionId}, LOB: ${lob}`);

        const sessionToGetTime = activeSessions.get(sessionId);
        if (expectedRunToken && sessionToGetTime?.runToken !== expectedRunToken) {
            console.log(`⏭️ Skipping stale report copy for session ${sessionId}`);
            return;
        }
        const runStartTime = sessionToGetTime?.playwrightStartTime || (Date.now() - (2 * 60 * 60 * 1000));
        const runEndTime = sessionToGetTime?.playwrightEndTime || Date.now();
        console.log(`📅 PDF filter range: ${new Date(runStartTime).toLocaleString()} -> ${new Date(runEndTime).toLocaleString()}`);
        
        const sessionReportsDir = path.join(__dirname, 'sessions', sessionId, 'reports');
        const sessionPdfDir = path.join(sessionReportsDir, 'pdf-report');
        const baseReportsDir = path.join(__dirname, 'reports');
        const basePdfDir = path.join(baseReportsDir, 'pdf-report');
        
        console.log(`📂 Session reports dir: ${sessionReportsDir}`);
        console.log(`📂 Session PDF dir: ${sessionPdfDir}`);
        console.log(`📂 Base reports dir: ${baseReportsDir}`);
        console.log(`📂 Base PDF dir: ${basePdfDir}`);
        
        // Ensure session directories exist
        if (!fs.existsSync(sessionReportsDir)) {
            fs.mkdirSync(sessionReportsDir, { recursive: true });
            console.log(`📁 Created session reports directory`);
        }
        if (!fs.existsSync(sessionPdfDir)) {
            fs.mkdirSync(sessionPdfDir, { recursive: true });
            console.log(`📁 Created session PDF directory`);
        }
          // Get the most recent reports (within last 24 hours or any available)
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);          // Copy PDF reports (enhanced for abort scenario)
        console.log(`🔍 Checking for PDF files in: ${basePdfDir}`);
        console.log(`📂 Base PDF directory exists: ${fs.existsSync(basePdfDir)}`);
        
        if (fs.existsSync(basePdfDir)) {
            const allFiles = fs.readdirSync(basePdfDir);
            console.log(`📂 All files in base PDF dir: ${allFiles.join(', ')}`);
            
            const pdfFiles = fs.readdirSync(basePdfDir)
                .filter(file => file.toLowerCase().endsWith('.pdf'))
                .map(file => {
                    const filePath = path.join(basePdfDir, file);
                    const stats = fs.statSync(filePath);
                    return { name: file, path: filePath, mtime: stats.mtime.getTime(), size: stats.size };
                })
                .filter(file => file.mtime >= runStartTime && file.mtime <= runEndTime)
                .sort((a, b) => b.mtime - a.mtime); // Most recent first
            
            console.log(`📊 Found ${pdfFiles.length} recent PDF files (within 24 hours)`);
            pdfFiles.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name} (${file.size} bytes, ${new Date(file.mtime).toLocaleString()})`);
            });
              if (pdfFiles.length > 0) {
                // // Copy the most recent PDF with better naming convention
                // const latestPdf = pdfFiles[0];
                
                // // Extract timestamp from original filename or use current time
                // const timestampMatch = latestPdf.name.match(/(\d{2}_\d{2}_\d{4}_\d{2}_\d{2})/);
                // const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14).replace(/(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})/, '$3_$2_$1_$4_$5');
                
                // // Create single PDF with meaningful name including timestamp
                // const betterName = `${latestPdf.name}`;
                // const targetPath = path.join(sessionPdfDir, betterName);
                // fs.copyFileSync(latestPdf.path, targetPath);
                // console.log(`📋 ✅ Created single PDF report: ${latestPdf.name} → ${betterName} (${latestPdf.size} bytes)`);
                // console.log(`📋 🎯 No duplicate files - Single report ready for download!`); 
                  pdfFiles.forEach(pdf => {
                      const targetPath = path.join(sessionPdfDir, pdf.name);

                      fs.copyFileSync(pdf.path, targetPath);

                      console.log(`📋 ✅ Copied PDF: ${pdf.name} (${pdf.size} bytes)`);
                  });
                  console.log(`📋 🎯 Copied ${pdfFiles.length} PDF report(s) to session directory`                  );
            } else {
                console.log(`📋 ⚠️ No recent PDF files found in base directory for LOB: ${lob}`);
                
                console.log(`📋 ❌ No current-run PDF files found; leaving the session without a PDF report`);
            }
        }          // Copy Excel reports (enhanced with retry mechanism for UI timing)
        await copyExcelReportsWithRetry(baseReportsDir, sessionReportsDir, lob, runStartTime);
        
        // Copy HTML reports
        const baseHtmlDir = path.join(baseReportsDir, 'html');
        const sessionHtmlDir = path.join(sessionReportsDir, 'html');
          if (fs.existsSync(baseHtmlDir)) {
            const htmlStat = fs.statSync(baseHtmlDir);
            if (htmlStat.mtime.getTime() > twentyFourHoursAgo) {
                // Copy entire HTML directory
                if (!fs.existsSync(sessionHtmlDir)) {
                    fs.mkdirSync(sessionHtmlDir, { recursive: true });
                }
                
                const copyHtmlFiles = (srcDir, destDir) => {
                    const files = fs.readdirSync(srcDir);
                    files.forEach(file => {
                        const srcFile = path.join(srcDir, file);
                        const destFile = path.join(destDir, file);
                        const stat = fs.statSync(srcFile);
                        
                        if (stat.isDirectory()) {
                            if (!fs.existsSync(destFile)) {
                                fs.mkdirSync(destFile, { recursive: true });
                            }
                            copyHtmlFiles(srcFile, destFile);
                        } else {
                            fs.copyFileSync(srcFile, destFile);
                        }
                    });
                };
                
                copyHtmlFiles(baseHtmlDir, sessionHtmlDir);
                console.log(`🌐 ✅ Copied HTML reports to session directory`);
            }
        }
        
        console.log(`✅ Partial reports copy completed for session ${sessionId}, LOB: ${lob}`);
        
    } catch (error) {
        console.error(`❌ Error copying partial reports for session ${sessionId}:`, error);
    }
}

// ✅ NEW: Generate REAL-TIME partial reports from current test run data
async function generateRealTimePartialReports(sessionId, lob, session) {
    try {
        console.log(`📊 GENERATING REAL-TIME partial reports for session ${sessionId}, LOB: ${lob}`);
        
        const sessionDir = path.join(__dirname, 'sessions', sessionId);
        const sessionReportsDir = path.join(sessionDir, 'reports');
        const sessionPdfDir = path.join(sessionReportsDir, 'pdf-report');
        
        // Ensure directories exist
        [sessionReportsDir, sessionPdfDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
          // 1. First try to copy any existing reports (fallback)
        await copyPartialReportsToSession(sessionId, lob);
        
        // 2. Generate real-time reports from current test execution data
        const timestamp = new Date().toLocaleString();
        const currentTestOutput = session.logs ? session.logs.join('\n') : 'No test output captured';
        
        // Parse current test results from output
        const testResults = parseCurrentTestResults(currentTestOutput, session);
        
        // Generate PDF report from current test data
        generateRealTimePDF(sessionId, lob, testResults, timestamp, sessionPdfDir);
        
        // Generate Excel report from current test data  
        generateRealTimeExcel(sessionId, lob, testResults, timestamp, sessionReportsDir);
        
        console.log(`✅ Real-time partial reports generated successfully for ${lob}`);
        
    } catch (error) {
        console.error(`❌ Error generating real-time partial reports for session ${sessionId}:`, error);
          // Fallback to old method if real-time fails
        console.log(`🔄 Falling back to file copy method...`);
        await copyPartialReportsToSession(sessionId, lob);
    }
}

// Parse test results from current Playwright output
function parseCurrentTestResults(output, session) {
    const results = {
        testCase: 'Unknown Test',
        accountNumber: '##',
        submissionNumber: '##', 
        policyNumber: '##',
        status: 'ABORTED - Test was manually stopped',
        completedSteps: [],
        errors: [],
        timestamp: new Date().toLocaleString()
    };
    
    // 🔧 NEW: First check if session already has captured data
    if (session.capturedData) {
        console.log(`📊 Using session captured data:`, session.capturedData);
        results.accountNumber = session.capturedData.accountNumber || results.accountNumber;
        results.submissionNumber = session.capturedData.submissionNumber || results.submissionNumber;
        results.policyNumber = session.capturedData.policyNumber || results.policyNumber;
    }
    
    // Try to extract info from session or output
    if (session.uploadedFileName) {
        results.testCase = session.uploadedFileName.replace('.xlsm', '').replace('.xlsx', '');
    }
      // Parse output for completed steps
    const lines = output.split('\n');
    lines.forEach(line => {
        // Look for step completions
        if (line.includes('✅') || line.includes('Account created') || line.includes('Submission created')) {
            results.completedSteps.push(line.trim());
        }
        
        // 🔧 IMPROVED: Better patterns to extract account/submission numbers
        // Pattern 1: Account Number patterns
        const accountPatterns = [
            /Account.*Number[:\s]*:?\s*([A-Z0-9\-]+)/i,
            /Account.*created[:\s]*:?\s*([A-Z0-9\-]+)/i,
            /Account[:\s]*([A-Z0-9\-]+)/i,
            /acc_created[:\s]*=?\s*"?([A-Z0-9\-]+)"?/i
        ];
        
        for (const pattern of accountPatterns) {
            const match = line.match(pattern);
            if (match && match[1] && match[1] !== '##' && match[1] !== 'Not Generated') {
                results.accountNumber = match[1].trim();
                console.log(`🔍 Found Account Number: ${results.accountNumber} from line: ${line.substring(0, 100)}...`);
                break;
            }
        }
        
        // Pattern 2: Submission Number patterns  
        const submissionPatterns = [
            /Submission.*Number[:\s]*:?\s*([A-Z0-9\-]+)/i,
            /submissionNumber[:\s]*=?\s*"?([A-Z0-9\-]+)"?/i,
            /Submission[:\s]*([A-Z0-9\-]+)/i,
            /Sub.*No[:\s]*([A-Z0-9\-]+)/i,
            /getSubmissionNumberGenerated.*([A-Z0-9\-]+)/i
        ];
        
        for (const pattern of submissionPatterns) {
            const match = line.match(pattern);
            if (match && match[1] && match[1] !== '##' && match[1] !== 'Not Generated') {
                results.submissionNumber = match[1].trim();
                console.log(`🔍 Found Submission Number: ${results.submissionNumber} from line: ${line.substring(0, 100)}...`);
                break;
            }
        }
        
        // Pattern 3: Policy Number patterns
        const policyPatterns = [
            /Policy.*Number[:\s]*:?\s*([A-Z0-9\-]+)/i,
            /policy_number[:\s]*=?\s*"?([A-Z0-9\-]+)"?/i,
            /Policy Number[:\s]*([A-Z0-9\-]+)/i,
            /getPolicyNumberGenerated.*([A-Z0-9\-]+)/i
        ];
        
        for (const pattern of policyPatterns) {
            const match = line.match(pattern);
            if (match && match[1] && match[1] !== '##' && match[1] !== 'Not Generated') {
                results.policyNumber = match[1].trim();
                console.log(`🔍 Found Policy Number: ${results.policyNumber} from line: ${line.substring(0, 100)}...`);
                break;
            }
        }
        
        // Look for errors
        if (line.includes('❌') || line.includes('Error') || line.includes('Failed')) {
            results.errors.push(line.trim());
        }
    });
      return results;
}

// 🔧 NEW: Capture real-time data from test output
function captureRealTimeData(output, session) {
    try {
        const line = output.toString();
        
        // 🚨 SKIP INVALID PATTERNS: Don't capture [object Promise] or similar
        if (line.includes('[object Promise]') || line.includes('undefined') || line.includes('null')) {
            return; // Skip invalid data
        }
        
        // Pattern 1: Account Number patterns - ENHANCED
        const accountPatterns = [
            /Account.*Number[:\s]*:?\s*([A-Z0-9]{6,})/i,  // At least 6 alphanumeric chars
            /Account.*created[:\s]*:?\s*([A-Z0-9]{6,})/i,
            /acc_created[:\s]*=?\s*"?([A-Z0-9]{6,})"?/i,
            /🎯.*Account.*Number[:\s]*([A-Z0-9]{6,})/i,  // Real-time capture pattern
            /Account[:\s]*([A-Z0-9]{8,})/i // At least 8 chars for strong match
        ];
        
        for (const pattern of accountPatterns) {
            const match = line.match(pattern);
            if (match && match[1] && match[1] !== '##' && match[1] !== 'Not Generated' && 
                match[1].length >= 6 && !match[1].includes('object') && !match[1].includes('Promise')) {
                const newAccountNumber = match[1].trim();
                if (session.capturedData.accountNumber === '##') {
                    session.capturedData.accountNumber = newAccountNumber;
                    console.log(`🎯 REAL-TIME: Captured Account Number: ${newAccountNumber}`);
                    console.log(`🔍 From line: ${line.trim()}`);
                }
                break;
            }
        }
        
        // Pattern 2: Submission Number patterns - ENHANCED
        const submissionPatterns = [
            /Submission.*Number[:\s]*:?\s*([A-Z0-9]{6,})/i,  // At least 6 alphanumeric chars
            /submissionNumber[:\s]*=?\s*"?([A-Z0-9]{6,})"?/i,
            /🎯.*Submission.*Number[:\s]*([A-Z0-9]{6,})/i,  // Real-time capture pattern
            /getSubmissionNumberGenerated[:\s]*([A-Z0-9]{6,})/i,
            /Submission[:\s]*([A-Z0-9]{8,})/i // At least 8 chars for strong match
        ];
        
        for (const pattern of submissionPatterns) {
            const match = line.match(pattern);
            if (match && match[1] && match[1] !== '##' && match[1] !== 'Not Generated' && 
                match[1].length >= 6 && !match[1].includes('object') && !match[1].includes('Promise')) {
                const newSubmissionNumber = match[1].trim();
                if (session.capturedData.submissionNumber === '##') {
                    session.capturedData.submissionNumber = newSubmissionNumber;
                    console.log(`🎯 REAL-TIME: Captured Submission Number: ${newSubmissionNumber}`);
                    console.log(`🔍 From line: ${line.trim()}`);
                }
                break;
            }
        }
        
        // Pattern 3: Policy Number patterns - ENHANCED
        const policyPatterns = [
            /Policy.*Number[:\s]*:?\s*([A-Z0-9]{6,})/i,  // At least 6 alphanumeric chars
            /policy_number[:\s]*=?\s*"?([A-Z0-9]{6,})"?/i,
            /🎯.*Policy.*Number[:\s]*([A-Z0-9]{6,})/i,  // Real-time capture pattern
            /getPolicyNumberGenerated[:\s]*([A-Z0-9]{6,})/i,
            /Policy[:\s]*([A-Z0-9]{8,})/i // At least 8 chars for strong match
        ];
        
        for (const pattern of policyPatterns) {
            const match = line.match(pattern);
            if (match && match[1] && match[1] !== '##' && match[1] !== 'Not Generated' && 
                match[1].length >= 6 && !match[1].includes('object') && !match[1].includes('Promise')) {
                const newPolicyNumber = match[1].trim();
                if (session.capturedData.policyNumber === '##') {
                    session.capturedData.policyNumber = newPolicyNumber;
                    console.log(`🎯 REAL-TIME: Captured Policy Number: ${newPolicyNumber}`);
                    console.log(`🔍 From line: ${line.trim()}`);
                }
                break;
            }
        }
        
    } catch (error) {
        console.error('Error in captureRealTimeData:', error);
    }
}

// Generate PDF report from real-time data
function generateRealTimePDF(sessionId, lob, results, timestamp, pdfDir) {
    try {
        const pdfContent = `
AMOD TEST EXECUTION REPORT (PARTIAL)
Generated: ${timestamp}
Status: ABORTED BY USER

═══════════════════════════════════════════════════════
TEST INFORMATION
═══════════════════════════════════════════════════════
Test Case: ${results.testCase}
LOB: ${lob}  
Session ID: ${sessionId}
Abort Time: ${timestamp}
Status: ${results.status}

═══════════════════════════════════════════════════════
RESULTS CAPTURED BEFORE ABORT
═══════════════════════════════════════════════════════
Account Number: ${results.accountNumber}
Submission Number: ${results.submissionNumber}
Policy Number: ${results.policyNumber}

═══════════════════════════════════════════════════════
COMPLETED STEPS BEFORE ABORT
═══════════════════════════════════════════════════════
${results.completedSteps.length > 0 ? results.completedSteps.join('\n') : 'No completed steps captured'}

${results.errors.length > 0 ? `
═══════════════════════════════════════════════════════
ERRORS/ISSUES ENCOUNTERED
═══════════════════════════════════════════════════════
${results.errors.join('\n')}
` : ''}

═══════════════════════════════════════════════════════
SUMMARY
═══════════════════════════════════════════════════════
✓ This is a PARTIAL report from an aborted test
✓ Data shown is what was captured before manual abort
✓ Test was stopped by user action at ${timestamp}
✓ Session ID: ${sessionId}

═══════════════════════════════════════════════════════
End of Report - Generated by AMOD Framework
═══════════════════════════════════════════════════════
        `;
        
        const pdfPath = path.join(pdfDir, `${lob}_Partial_Report.pdf`);
        fs.writeFileSync(pdfPath, pdfContent, 'utf8');
        console.log(`📋 ✅ Generated real-time PDF report: ${pdfPath}`);
        
    } catch (error) {
        console.error(`❌ Error generating real-time PDF:`, error);
    }
}

// Generate Excel report from real-time data
function generateRealTimeExcel(sessionId, lob, results, timestamp, reportsDir) {
    try {
        console.log(`📊 Generating real-time Excel with data:`, {
            accountNumber: results.accountNumber,
            submissionNumber: results.submissionNumber,
            policyNumber: results.policyNumber
        });
        
        const excelPath = path.join(reportsDir, `${lob}_Partial_Results.xlsx`);
        
        // Try to use ExcelJS for proper Excel format
        try {
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('PARTIAL REPORT');
            
            // Add columns
            worksheet.columns = [
                { header: 'Test Case', key: 'testCase', width: 30 },
                { header: 'Status', key: 'status', width: 25 },
                { header: 'Account Number', key: 'accountNumber', width: 20 },
                { header: 'Submission Number', key: 'submissionNumber', width: 20 },
                { header: 'Policy Number', key: 'policyNumber', width: 20 },
                { header: 'Abort Time', key: 'abortTime', width: 25 },
                { header: 'LOB', key: 'lob', width: 15 },
                { header: 'Session ID', key: 'sessionId', width: 30 },
                { header: 'Notes', key: 'notes', width: 50 }
            ];
            
            // Add data row
            worksheet.addRow({
                testCase: results.testCase,
                status: results.status,
                accountNumber: results.accountNumber,
                submissionNumber: results.submissionNumber,
                policyNumber: results.policyNumber,
                abortTime: timestamp,
                lob: lob,
                sessionId: sessionId,
                notes: `PARTIAL REPORT: Test aborted manually. ${results.completedSteps.length} steps completed before abort.`
            });
            
            // Style the header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE3F2FD' }
            };
            
            // Save Excel file
            workbook.xlsx.writeFile(excelPath);
            console.log(`📊 ✅ Generated proper Excel report: ${excelPath}`);
            console.log(`📊 ✅ Data written - Account: ${results.accountNumber}, Submission: ${results.submissionNumber}, Policy: ${results.policyNumber}`);
            
        } catch (excelError) {
            console.log(`⚠️ ExcelJS not available, using CSV format...`);
            
            // Fallback: CSV format
            const csvContent = `Test Case,Status,Account Number,Submission Number,Policy Number,Abort Time,LOB,Session ID,Notes
"${results.testCase}","${results.status}","${results.accountNumber}","${results.submissionNumber}","${results.policyNumber}","${timestamp}","${lob}","${sessionId}","PARTIAL REPORT: Test aborted manually"`;
            
            fs.writeFileSync(excelPath, csvContent, 'utf8');
            console.log(`📊 ✅ Generated CSV fallback: ${excelPath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error generating real-time Excel:`, error);
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoint for Azure/Docker
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        activeSessions: activeSessions.size,
        maxSessions: MAX_CONCURRENT_USERS
    });
});

// Debug endpoints for session management
app.get('/api/debug/sessions', (req, res) => {
    const sessionData = Array.from(activeSessions.entries()).map(([id, data]) => {
        const windowInfo = sessionWindows.get(id);
        return {
            id,
            status: data.status,
            createdAt: data.createdAt,
            lastActivity: data.lastActivity,
            age: Date.now() - data.lastActivity.getTime(),
            hasTerminalWindow: !!windowInfo,
            windowTitle: windowInfo?.title,
            windowLOB: windowInfo?.lob,
            windowPID: windowInfo?.pid
        };
    });
    
    res.json({
        totalSessions: activeSessions.size,
        maxSessions: MAX_CONCURRENT_USERS,
        activeWindows: sessionWindows.size,
        sessions: sessionData
    });
});

app.delete('/api/debug/sessions/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    
    if (activeSessions.has(sessionId)) {
        // Close terminal window if exists
        if (sessionWindows.has(sessionId)) {
            const windowInfo = sessionWindows.get(sessionId);
            try {
                console.log(`🪟 Forcefully closing terminal window for session ${sessionId}`);
                windowInfo.process.kill('SIGTERM');
            } catch (error) {
                console.error(`Failed to close window for session ${sessionId}:`, error);
            }
            sessionWindows.delete(sessionId);
        }
        
        // Clean up session directory
        const sessionDir = path.join(__dirname, 'sessions', sessionId);
        if (fs.existsSync(sessionDir)) {
            try {
                fs.rmSync(sessionDir, { recursive: true });
            } catch (error) {
                console.error(`Failed to delete session directory ${sessionId}:`, error);
            }
        }
        
        activeSessions.delete(sessionId);
        res.json({ 
            message: `Session ${sessionId} deleted successfully`,
            windowClosed: true
        });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// New endpoint to list all active terminal windows
app.get('/api/debug/windows', (req, res) => {
    const windowData = Array.from(sessionWindows.entries()).map(([sessionId, windowInfo]) => ({
        sessionId,
        title: windowInfo.title,
        lob: windowInfo.lob,
        startTime: windowInfo.startTime,
        pid: windowInfo.pid,
        age: Date.now() - windowInfo.startTime.getTime()
    }));
    
    res.json({
        totalWindows: sessionWindows.size,
        windows: windowData
    });
});

// Optional: Close console endpoint (for auto-close functionality)
app.post('/api/close-console', (req, res) => {
    console.log('🔄 Console close requested by client');
    // In a real implementation, you could terminate specific processes
    // For now, just acknowledge the request
    res.json({ message: 'Console close request acknowledged' });
});

// Function to handle session-specific test completion (DEPRECATED - No longer used)
function restartServer() {
    // This function is deprecated in multi-user mode
    // Each session handles its own completion without global server restart
    console.log('⚠️ restartServer() called but deprecated in session-based mode');
    console.log('🔄 Sessions handle their own completion individually');
}

// Session cleanup function
function cleanupOldSessions() {
    const now = new Date();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours
    
    for (const [sessionId, sessionData] of activeSessions.entries()) {
        const age = now - sessionData.lastActivity;
        if (age > maxAge) {
            console.log(`🧹 Cleaning up old session: ${sessionId}`);
            
            // Close any open terminal windows for this session
            if (sessionWindows.has(sessionId)) {
                const windowInfo = sessionWindows.get(sessionId);
                try {
                    console.log(`🪟 Terminating terminal window for session ${sessionId}`);
                    windowInfo.process.kill('SIGTERM');
                } catch (error) {
                    console.error(`Failed to terminate window for session ${sessionId}:`, error);
                }
                sessionWindows.delete(sessionId);
            }
            
            // Remove session directory
            const sessionDir = path.join(__dirname, 'sessions', sessionId);
            if (fs.existsSync(sessionDir)) {
                try {
                    fs.rmSync(sessionDir, { recursive: true });
                    console.log(`🗑️ Deleted session directory: ${sessionId}`);
                } catch (error) {
                    console.error(`Failed to delete session directory ${sessionId}:`, error);
                }
            }
            
            activeSessions.delete(sessionId);
        }
    }
}

// Clean up old sessions every 30 minutes
setInterval(cleanupOldSessions, 30 * 60 * 1000);

// WebSocket connection handling with session support
io.on('connection', (socket) => {
    console.log('🔌 Client connected for real-time updates');
    
    // Handle session joining
    socket.on('joinSession', (sessionId) => {

        console.log(`🔄 joinSession received: ${sessionId}`);

        if (!activeSessions.has(sessionId)) {
            console.log(`❌ Invalid session: ${sessionId}`);
            return;
        }

        socket.join(`session_${sessionId}`);

        const room = io.sockets.adapter.rooms.get(`session_${sessionId}`);

        console.log(`✅ Socket joined room session_${sessionId}`);
        console.log(`👥 Room size now: ${room ? room.size : 0}`);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected');
    });
});

// Session status endpoint
app.get('/api/session-status/:sessionId', (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        
        if (!activeSessions.has(sessionId)) {
            return res.status(404).json({ 
                success: false,
                error: 'Session not found or expired' 
            });
        }
        
        const session = activeSessions.get(sessionId);
        const executionState = session.executionState || {
            status: 'NOT_STARTED',
            currentRunningTest: null,
            currentTestName: null,
            completed: false,
            reportsReady: false,
            completionEventSent: false,
            tests: {}
        };
        
        res.json({
            success: true,
            ...executionState,
            status: executionState.status,
            reportsReady: executionState.reportsReady,
            currentRunningTest: executionState.currentRunningTest,
            currentTestName: executionState.currentTestName,
            completed: executionState.completed,
            tests: executionState.tests,
            currentLOB: session.currentLOB || null,
            currentTestIndex: session.currentTestIndex || 0,
            currentTestCaseName: session.currentTestCaseName || ''
        });
        
    } catch (error) {
        console.error('Session status check error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to check session status' 
        });
    }
});

// Clear only the in-memory execution state after a completed run. Reports remain available.
app.post('/api/session-reset/:sessionId', (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const session = activeSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found or expired' });
        }

        session.executionState = {
            status: 'NOT_STARTED',
            currentRunningTest: null,
            currentTestName: null,
            completed: false,
            reportsReady: false,
            completionEventSent: false,
            tests: {}
        };
        session.status = 'ready';
        session.abortRequested = false;
        session.abortFinalized = false;
        session.abortedTestNumber = null;
        session.currentTestIndex = 0;
        session.currentTestCaseName = '';
        session.currentRunningTest = null;
        session.currentTestName = null;
        if (fs.existsSync(executionAbortFile)) {
            fs.rmSync(executionAbortFile, { force: true });
        }
        session.lastActivity = new Date();
        activeSessions.set(sessionId, session);
        emitSessionChanged(sessionId);

        res.json({ success: true, sessionId });
    } catch (error) {
        console.error('Session reset error:', error);
        res.status(500).json({ success: false, error: 'Failed to reset session state' });
    }
});

// 🎯 NEW: API endpoint for updating test case names manually
app.post('/api/update-test-name', (req, res) => {
    try {
        const { testCaseNumber, testCaseName, totalTests, sessionId } = req.body;
        
        console.log(`📝 Manual test name update: Test ${testCaseNumber} -> "${testCaseName}"`);
        
        const session = activeSessions.get(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        session.executionState = session.executionState || {
            status: 'NOT_STARTED',
            currentRunningTest: null,
            currentTestName: null,
            completed: false,
            reportsReady: false,
            completionEventSent: false,
            tests: {}
        };
        const number = parseInt(testCaseNumber, 10);
        session.executionState.tests[number] = {
            ...(session.executionState.tests[number] || {}),
            testNumber: number,
            status: session.executionState.tests[number]?.status || 'NOT_STARTED',
            name: testCaseName,
            testName: testCaseName
        };
        activeSessions.set(sessionId, session);
        emitSessionChanged(sessionId);
        
        console.log(`📡 Test name update broadcasted: Test ${testCaseNumber} -> "${testCaseName}"`);
        
        res.json({
            success: true,
            message: `Test case ${testCaseNumber} name updated to "${testCaseName}"`,
            testCaseNumber: testCaseNumber,
            testCaseName: testCaseName
        });
        
    } catch (error) {
        console.error('❌ Error updating test case name:', error);
        res.status(500).json({ 
            error: 'Failed to update test case name',
            details: error.message 
        });
    }
});

// 🎯 DYNAMIC FILTERING: API endpoint to get filtered test preview
app.get('/api/test-preview/:sessionId', (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        
        // Validate session
        if (!activeSessions.has(sessionId)) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        const session = activeSessions.get(sessionId);
        
        // Check if we have dynamic filtering data
        if (session.dynamicFilteringEnabled && session.filteredExcelPath) {
            const previewData = getFilteredTestPreview(session.filteredExcelPath);
            
            res.json({
                success: true,
                sessionId: sessionId,
                dynamicFiltering: {
                    enabled: true,
                    totalTests: session.totalTestsInExcel || 0,
                    includedTests: session.includedTestsCount || 0,
                    excludedTests: (session.totalTestsInExcel || 0) - (session.includedTestsCount || 0),
                    testCaseNames: session.testCaseNames || [],
                    detectedLOB: session.detectedLOB || 'Unknown'
                },
                preview: previewData
            });
        } else {
            // Fallback for sessions without dynamic filtering
            res.json({
                success: true,
                sessionId: sessionId,
                dynamicFiltering: {
                    enabled: false,
                    totalTests: session.totalTestsInExcel || 0,
                    includedTests: session.includedTestsCount || 0,
                    excludedTests: 0,
                    testCaseNames: session.testCaseNames || [],
                    detectedLOB: 'Unknown'
                },
                preview: { success: false, error: 'No dynamic filtering available' }
            });
        }
        
    } catch (error) {
        console.error('❌ Error getting test preview:', error);
        res.status(500).json({ error: 'Failed to get test preview' });
    }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = 'localhost';
    
    // Find local IP address
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                localIP = interface.address;
                break;
            }
        }
    }
    
    console.log(`🚀 Multi-User Test Automation Server running on:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${localIP}:${PORT}`);
    console.log(`� Max concurrent users: ${MAX_CONCURRENT_USERS}`);
    console.log(`📁 Sessions directory: ${path.join(__dirname, 'sessions')}`);
    console.log(`📊 Base reports directory: ${path.join(__dirname, 'reports')}`);
    console.log(`\n🔗 Multiple users can access simultaneously via: http://${localIP}:${PORT}`);
    
    // Create required directories
    const dirs = [
        'testdata',           // Legacy directory
        'reports',            // Legacy directory
        'reports/pdf-report', // Legacy directory
        'sessions'            // New session directory
    ];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });
    
    console.log(`\n✨ Session-based multi-user support enabled!`);
    console.log(`🔄 Each user gets isolated test environment`);
    console.log(`🪟 Each session opens dedicated terminal window`);
    console.log(`📊 Session cleanup: 2 hours of inactivity`);
});

module.exports = app;
