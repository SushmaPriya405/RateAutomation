let latestSessionState = null;
let completionHandled = false;
let sessionStatePollTimer = null;

class TestRunner {    constructor() {
        this.uploadedFileName = null;
        this.isWaitingForRestart = false;
        this.sessionId = null;
        this.currentRunningTest = null;
        this.testCaseNames = new Map(); // 🎯 NEW: Store actual test case names mapped by test number
        this.displayTestNumbers = [];
        this.includedTestNumbers = []; // 🎯 NEW: Store which test numbers to include based on GEN_TC
        this.allTestsCount = 0; // 🎯 NEW: Total tests in Excel file
        this.rowMapping = []; // 🎯 NEW: Store row mapping info {originalRow, newRow, testName}
        this.initializeElements();
        this.setupEventListeners();
        this.setupDragAndDrop();
        // Restore the session before connecting so refresh/reconnect reads server state.
        this.initializeSession();
        // Initial LOB filtering based on default environment
        this.filterLOBsByEnvironment();
    }
            async initializeSession() {
        try {
                        const storedSessionId = localStorage.getItem('amodSessionId');
                        let data = storedSessionId ? { success: true, sessionId: storedSessionId } : null;
                        let completedOnLoad = false;
                        if (storedSessionId) {
                                const stateResponse = await fetch(`/api/session-status/${storedSessionId}`);
                                if (!stateResponse.ok) {
                                    data = null;
                                } else {
                                    const state = await stateResponse.json();
                                    completedOnLoad = Boolean(state.success && state.completed && state.reportsReady);
                                }
                        }
                        if (!data) {
                                const response = await fetch('/api/session');
                                data = await response.json();
                        }
              if (data.success) {
                this.sessionId = data.sessionId;
                                localStorage.setItem('amodSessionId', this.sessionId);
                console.log(`👤 Session initialized: ${this.sessionId}`);
                console.log(`👥 Active users: ${data.activeUsers}/${data.maxUsers}`);
                
                if (completedOnLoad) {
                    const resetResponse = await fetch(`/api/session-reset/${this.sessionId}`, { method: 'POST' });
                    if (!resetResponse.ok) {
                        throw new Error(`Failed to reset session state (${resetResponse.status})`);
                    }
                    this.resetForNextRun();
                } else {
                    await this.refreshSessionState();
                }
                // Show session info in UI (optional)
                this.showSessionInfo(data);
                this.setupWebSocket();
                this.startSessionStatePolling();
            } else {
                throw new Error(data.error || 'Failed to initialize session');
            }
        } catch (error) {
            console.error('Session initialization error:', error);
            alert(`❌ Failed to start session: ${error.message}\n\nPlease refresh the page to try again.`);
        }
    }
    
    showSessionInfo(data) {
        // Add session info to header (subtle)
        const header = document.querySelector('.header');
        if (header && data.activeUsers > 1) {
            const sessionInfo = document.createElement('div');
            sessionInfo.style.cssText = 'font-size: 0.8rem; color: #666; margin-top: 0.5rem;';
            sessionInfo.innerHTML = `👥 ${data.activeUsers} of ${data.maxUsers} users online`;
            header.appendChild(sessionInfo);
        }
    }    initializeElements() {
        this.form = document.getElementById('testForm');
        this.fileUpload = document.getElementById('fileUpload');
        this.fileInput = document.getElementById('excelFile');
        this.fileInfo = document.getElementById('fileInfo');        this.envSelect = document.getElementById('envSelect');
        this.lobSelect = document.getElementById('lobSelect');
        this.runButton = document.getElementById('runButton');
        this.abortButton = document.getElementById('abortButton');
        this.status = document.getElementById('status');
        this.statusMessage = document.getElementById('statusMessage');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.resultsSection = document.getElementById('resultsSection');
        this.statusSection = document.getElementById('statusSection');
        this.progressLog = document.getElementById('progressLog');        this.downloadComplete = document.getElementById('downloadComplete');
        
        // Test case progress elements
        this.testCaseProgress = document.getElementById('testCaseProgress');
        this.progressCounter = document.getElementById('progressCounter');
        this.testProgressFill = document.getElementById('testProgressFill');
        this.currentTestInfo = document.getElementById('currentTestInfo');
        
        // 🎯 NEW: Test List Window elements
        this.testListWindow = document.getElementById('testListWindow');
        this.testListCounter = document.getElementById('testListCounter');
        this.testListContainer = document.getElementById('testListContainer');
    }

    setupEventListeners() {
        this.fileUpload.addEventListener('click', () => {
            this.fileInput.click();
        });        this.fileInput.addEventListener('change', async (e) => {
            await this.handleFileSelect(e.target.files[0]);        });        this.envSelect.addEventListener('change', () => {
            // ✅ DON'T clear test preview when environment changes
            // Test preview should persist until new file is uploaded
            this.filterLOBsByEnvironment();
            this.validateForm();
            this.updateEnvironmentInfo();        });this.lobSelect.addEventListener('change', () => {
            // ✅ DON'T clear uploaded file when LOB changes
            // Only validate compatibility
            this.validateLOBFileCompatibility();
            this.validateForm();
            this.updateDownloadButtonText();
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.runTests();
        });

        this.abortButton.addEventListener('click', () => {
            this.abortTests();
        });

        // Auto action event listeners removed as requested
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.fileUpload.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.fileUpload.addEventListener(eventName, () => {
                this.fileUpload.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.fileUpload.addEventListener(eventName, () => {
                this.fileUpload.classList.remove('dragover');
            }, false);
        });        this.fileUpload.addEventListener('drop', async (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                await this.handleFileSelect(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }    async handleFileSelect(file) {
        if (!file) return;

        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                           'application/vnd.ms-excel.sheet.macroEnabled.12',
                           'application/vnd.ms-excel'];
        
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xlsm|xls)$/i)) {
            this.showStatus('error', '❌ Please select a valid Excel file (.xlsx, .xlsm, .xls)');
            return;
        }

        // Reset stale execution state before rendering any feedback for the
        // newly selected file. This keeps the LOB suggestion visible.
        completionHandled = false;
        latestSessionState = null;
        this.currentRunningTest = null;
        this.testCaseNames.clear();
        this.displayTestNumbers = [];
        this.includedTestNumbers = [];
        this.allTestsCount = 0;
        this.rowMapping = [];
        this.clearTestPreview();
        this.hideDownloadSection();
        this.clearStatus();

        // Strong file-LOB validation
        const detectedLOB = this.detectLOBFromFilename(file.name);
        const currentLOB = this.lobSelect.value;
        
        // If LOB is selected, MUST match the file
        if (currentLOB) {
            if (!detectedLOB) {
                // File pattern not recognized
                this.showUploadCorrectFilePopup(currentLOB, file.name, 'unrecognized');
                return;
            } else if (detectedLOB !== currentLOB) {
                // File doesn't match selected LOB
                this.showUploadCorrectFilePopup(currentLOB, file.name, 'mismatch', detectedLOB);
                return;
            }
            // Perfect match - proceed silently
        } else {
            // No LOB selected - show smart suggestion if file is recognized
            if (detectedLOB) {
                this.showSmartLOBSuggestion(file.name, detectedLOB);
            }
        }

        this.fileInput.files = this.createFileList(file);
        
        // Upload file and get filtering information
        try {
            this.showFileInfo(file); // Show file info first
            
            // Upload file to get dynamic filtering information
            const uploadResult = await this.uploadFileForPreview(file);
            
            // Update file info with filtering data if available
            if (uploadResult && uploadResult.dynamicFiltering) {
                this.showFileInfo(file, uploadResult.dynamicFiltering);
                
                // Show test preview if filtering is enabled
                if (uploadResult.dynamicFiltering.enabled) {
                    this.showTestPreview(uploadResult);
                }
            }
        } catch (error) {
            console.log('File preview failed, showing basic file info:', error.message);
            this.showFileInfo(file); // Fallback to basic file info
        }
        
        this.validateForm();
    }    // Smart LOB detection from filename with unified patterns
    detectLOBFromFilename(filename) {
        if (!filename) return null;
        
        const normalizedName = filename.toLowerCase().replace(/[_\-\s]+/g, '');
        console.log(`🔍 Analyzing file: "${filename}" → normalized: "${normalizedName}"`);

        if (normalizedName.includes('issuance')) return null;

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
        const convertedTableMatch = normalizedName.match(/^[a-z]{2}(dwb|db|dwsp|dws|ds|ho[a-z0-9]*|mh|cv|ms|bt|yt)convertedtable\d*\.(?:xlsm|xlsx|xls)$/i);
        if (convertedTableMatch) {
            const code = convertedTableMatch[1].toLowerCase();
            return code.startsWith('ho') ? convertedTableLobs.ho : convertedTableLobs[code];
        }
        
        // 🎯 UNIFIED PATTERN MATCHING RULES - Ordered by priority (Core first)
        const patternRules = [
            // === CORE (POLICY CHANGE / RENEWAL) PATTERNS - HIGHEST PRIORITY ===
            { pattern: /dwellingbasic.*test.*case.*generator.*policy.*change|dwelling.*basic.*test.*case.*generator.*renewal/i, lob: 'Core_Dwelling_Basic', type: 'core' },
            { pattern: /dwellingspecial.*test.*case.*generator.*policy.*change|dwelling.*special.*test.*case.*generator.*renewal/i, lob: 'Core_Dwelling_Special', type: 'core' },
            { pattern: /homeowners.*test.*case.*generator.*policy.*change|homeowners.*test.*case.*generator.*renewal/i, lob: 'Core_HomeOwners', type: 'core' },
            { pattern: /manufactured.*home.*test.*case.*generator.*policy.*change|manufactured.*home.*test.*case.*generator.*renewal/i, lob: 'Core_Manufactured_Home', type: 'core' },
            { pattern: /collectorvehicle.*test.*case.*generator.*policy.*change|collectorvehicle.*test.*case.*generator.*renewal/i, lob: 'Core_CV', type: 'core' },
            { pattern: /motorsports.*test.*case.*generator.*policy.*change|motorsports.*test.*case.*generator.*renewal/i, lob: 'Core_MS', type: 'core' },
            { pattern: /boat.*test.*case.*generator.*policy.*change|boat.*test.*case.*generator.*renewal/i, lob: 'Core_BT', type: 'core' },
            { pattern: /yacht.*test.*case.*generator.*policy.*change|yacht.*test.*case.*generator.*renewal/i, lob: 'Core_YT', type: 'core' }
        ];
        
        // Try exact pattern matching first (priority order)
        for (let i = 0; i < patternRules.length; i++) {
            const rule = patternRules[i];
            if (rule.pattern.test(normalizedName)) {
                console.log(`✅ EXACT MATCH (Rule ${i + 1}): ${filename} → ${rule.lob}`);
                return rule.lob;
            }
        }
        
        // Fallback: keyword scoring for partial matches
        console.log(`⚠️ No exact pattern match, trying keyword scoring...`);
        const keywordMap = {
            'Core_Dwelling_Basic': ['dwellingbasic', 'test', 'case', 'generator', 'policy', 'change','dwelling', 'basic', 'test', 'case', 'generator', 'renewal'],
            'Core_Dwelling_Special': ['dwellingspecial', 'test', 'case', 'generator', 'policy', 'change', 'dwelling', 'special', 'test', 'case', 'generator', 'renewal'],
            'Core_HomeOwners': ['homeowners', 'test', 'case', 'generator', 'policy', 'change', 'homeowners', 'test', 'case', 'generator', 'renewal'],
            'Core_Manufactured_Home': ['manufactured', 'home', 'test', 'case', 'generator', 'policy', 'change', 'manufactured', 'home', 'test', 'case', 'generator', 'renewal'],
            'Core_CV': ['collectorvehicle', 'test', 'case', 'generator', 'policy', 'change', 'collectorvehicle', 'test', 'case', 'generator', 'renewal'],
            'Core_MS': ['motorsports', 'test', 'case', 'generator', 'policy', 'change', 'motorsports', 'test', 'case', 'generator', 'renewal'],
            'Core_BT': ['boat', 'test', 'case', 'generator', 'policy', 'change', 'boat', 'test', 'case', 'generator', 'renewal'],
            'Core_YT': ['yacht', 'test', 'case', 'generator', 'policy', 'change', 'yacht', 'test', 'case', 'generator', 'renewal'],
        };
        
        const scores = {};
        for (const [lob, keywords] of Object.entries(keywordMap)) {
            let score = 0;
            const matchedKeywords = [];
            
            for (const keyword of keywords) {
                if (normalizedName.includes(keyword.toLowerCase())) {
                    score++;
                    matchedKeywords.push(keyword);
                }
            }
            
            if (score > 0) {
                scores[lob] = {
                    score,
                    matchedKeywords
                };
            }
        }
        
        if (Object.keys(scores).length > 0) {
            const bestMatch = Object.entries(scores).reduce((best, current) =>
                current[1].score > best[1].score ? current : best
            );
            
            const [bestLOB, bestData] = bestMatch;
            console.log(`🎯 KEYWORD MATCH: ${filename} → ${bestLOB}`);
            console.log(`   Score: ${bestData.score}, Keywords: ${bestData.matchedKeywords.join(', ')}`);
            return bestLOB;
        }
        
        console.log(`❌ No LOB detected for: ${filename}`);
        return null;
    }// Strong popup for incorrect file upload
    showUploadCorrectFilePopup(selectedLOB, uploadedFilename, errorType, detectedLOB = null) {
        const selectedName = this.getLOBDisplayName(selectedLOB);
        const expectedFilePattern = this.getExpectedFilePattern(selectedLOB);
          let errorMessage = '';
        
        if (errorType === 'mismatch' && detectedLOB) {
            const detectedName = this.getLOBDisplayName(detectedLOB);
            errorMessage = `
                <strong>🚨 Wrong Excel File Uploaded!</strong><br><br>
                <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin: 10px 0;">
                    🎯 <strong>Selected Test:</strong> ${selectedName}<br>
                    📁 <strong>Uploaded File:</strong> ${uploadedFilename}<br>
                    🔍 <strong>File is for:</strong> ${detectedName}
                </div>`;
        } else {
            errorMessage = `
                <strong>🚨 Please Upload Correct Excel File!</strong><br><br>
                <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin: 10px 0;">
                    🎯 <strong>Selected Test:</strong> ${selectedName}<br>
                    📁 <strong>Uploaded File:</strong> ${uploadedFilename}<br>
                    ❌ <strong>Status:</strong> File not recognized for this test
                </div>`;
        }
        
        // Clear the file input
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        
        // Show prominent error popup
        this.showStatus('error', `
            <div style="text-align: center; padding: 10px;">
                ${errorMessage}
                
                <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: left;">
                    <strong>💡 Expected File Pattern for ${selectedName}:</strong><br>
                    <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${expectedFilePattern}</code>
                </div>
                  <div style="margin-top: 15px; font-size: 1rem; color: #d69e2e; font-weight: bold; text-align: center;">
                    💡 Please upload the correct Excel file for your selected test
                </div>
            </div>
        `);
    }    // Get expected file pattern for each LOB
    getExpectedFilePattern(lob) {
        const patterns = {
            'Core_Dwelling_Basic': '{State}_DB_ConvertedTable.xls or {State}_DWB_ConvertedTable.xls',
            'Core_Dwelling_Special': '{State}_DS_ConvertedTable.xls, {State}_DWS_ConvertedTable.xls, or {State}_DWSP_ConvertedTable.xls',
            'Core_Manufactured_Home': '{State}_MH_ConvertedTable.xls',
            'Core_HomeOwners': '{State}_HO*_ConvertedTable.xls',
            'Core_CV': '{State}_CV_ConvertedTable.xls',
            'Core_MS': '{State}_MS_ConvertedTable.xls',
            'Core_BT': '{State}_BT_ConvertedTable.xls',
            'Core_YT': '{State}_YT_ConvertedTable.xls'
        };
        
        return patterns[lob] || `${lob}_*.xlsm`;
    }

    // INTEGRATED TERMINAL APPROACH - Initialize terminal interface
    initializeIntegratedTerminal() {
        if (this.statusSection.querySelector('.terminal-container')) {
            return;
        }
        
        console.log('🖥️ Initializing integrated terminal interface...');
          this.statusSection.innerHTML = `
            <div class="terminal-container" style="display: none;">
                <div class="terminal-header">
                    <div class="terminal-title">🧪 AMOD Test Execution Terminal</div>
                    <div class="terminal-controls">
                        <button id="terminalAbort" class="terminal-btn abort-btn" onclick="testRunner.abortTests()" style="display: none;">
                            🛑 Abort Tests
                        </button>
                        <div class="terminal-status ready">⚪ READY</div>
                    </div>
                </div>
                <div class="terminal-log" id="terminalLog">
                    <div class="log-line welcome">
                        <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span> 
                        <span class="log-text">🚀 Terminal ready for test execution...</span>
                    </div>
                </div>
                <div class="terminal-footer" style="display: none;">
                    <div class="download-section"></div>
                    <div class="action-buttons"></div>
                </div>
            </div>
        `;
        
        this.addTerminalCSS();
    }    // Add terminal CSS styling - Hidden but functional
    addTerminalCSS() {
        if (document.getElementById('terminal-css')) return;
        
        const style = document.createElement('style');
        style.id = 'terminal-css';
        style.textContent = `
            .terminal-container {
                display: none; /* Hide terminal but allow override for completion */
                background: #0c0c0c;
                color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                margin: 16px 0;
                border: 1px solid #333;
            }            
            /* Terminal styles hidden but kept for functionality - removed !important to allow override */
            .terminal-header, .terminal-title, .terminal-controls, .terminal-btn, 
            .abort-btn, .terminal-status, .terminal-log, .log-line, .log-timestamp, 
            .log-text, .terminal-footer, .download-btn, .action-btn {
                display: none;
            }        `;
        document.head.appendChild(style);    }

    // 🎯 NEW: Test List Window Functions
    
    initializeTestListWindow(totalTests, testCases = []) {
        this.totalTestCases = totalTests;
        this.testCases = testCases;
        if (!this.displayTestNumbers.length || this.displayTestNumbers.length !== totalTests) {
            this.displayTestNumbers = Array.from({ length: totalTests }, (_, index) => index + 1);
        }
        
        // 🎯 NEW: Store actual test case names if provided
        if (testCases.length > 0) {
            console.log(`📝 Storing ${testCases.length} actual test case names`);
            testCases.forEach((name, index) => {
                this.storeTestCaseName(index + 1, name);
            });
        }
        
        // 🎯 NEW: Clear any previously stored test case names for a fresh start
        this.currentRunningTest = null;
        
        // Show the test list window
        if (this.testListWindow) {
            this.testListWindow.style.display = 'block';
        }
        
        // Update counter
        if (this.testListCounter) {
            this.testListCounter.textContent = `0 / ${totalTests}`;
        }
        
        // Populate test cases
        this.populateTestCases();
        
        console.log(`🎯 Test List Window initialized with ${totalTests} test cases`);
    }
      populateTestCases() {
        if (!this.testListContainer) return;
        
        // Clear existing content
        this.testListContainer.innerHTML = '';
        
        // Create test case items
        for (let i = 0; i < this.totalTestCases; i++) {
            const testNumber = this.displayTestNumbers[i] || i + 1;
            // Use actual test case name if available, otherwise fallback to generic name
            const actualTestName = this.testCaseNames.get(testNumber);
            const testName = actualTestName || `Test_${testNumber}`;
            
            const testItem = document.createElement('div');
            testItem.className = 'test-case-item';
            testItem.id = `test-case-${testNumber}`;
            
            testItem.innerHTML = `
                <span class="test-case-name" title="${testName}">
                    ${testNumber}. ${testName}
                </span>
                <span class="test-case-status not-started" id="status-${testNumber}">
                    ⏳ NOT STARTED
                </span>
            `;
            
            this.testListContainer.appendChild(testItem);
        }
        
        console.log(`📋 Populated ${this.totalTestCases} test cases in list window`);
    }
    // 🎯 NEW: Store actual test case name for a specific test number
    storeTestCaseName(testNumber, testName) {
        if (testName && testName.trim() && !testName.startsWith('Test_')) {
            this.testCaseNames.set(testNumber, testName.trim());
            console.log(`📝 Stored test case name: Test ${testNumber} -> "${testName}"`);
            
            // Update the display name if the test item already exists
            this.updateTestCaseDisplayName(testNumber, testName.trim());
        }
    }
    
    // 🎯 NEW: Update the display name of a test case in the list
    updateTestCaseDisplayName(testNumber, testName) {
        const testCaseElement = document.getElementById(`test-case-${testNumber}`);
        if (testCaseElement) {
            const nameElement = testCaseElement.querySelector('.test-case-name');
            if (nameElement) {
                nameElement.textContent = `${testNumber}. ${testName}`;
                nameElement.title = testName;
                console.log(`🔄 Updated display name for Test ${testNumber}: "${testName}"`);
            }
        }
    }

      // 🎯 ENHANCED: Track and set current running test (ensures only one RUNNING status)
    setCurrentRunningTest(testNumber, testName) {
        console.log(`🎯 setCurrentRunningTest called: ${testNumber} (${testName})`);
        console.log(`   Previous running test: ${this.currentRunningTest}`);
        // If a new test starts while previous one is still RUNNING,
        // mark previous as FAILED
        if (this.currentRunningTest === testNumber) {
            return;
        }
        if (
            this.currentRunningTest &&
            this.currentRunningTest !== testNumber
        ) {
            const prevElement = document.getElementById(
                `status-${this.currentRunningTest}`
            );

            if (prevElement) {
                // Only fail if it's STILL running
                if (prevElement.classList.contains('running')) {
                    console.warn(
                        `⚠️ Test ${this.currentRunningTest} was abandoned. Marking FAILED.`
                    );

                    // this.updateTestListStatus(
                    //     this.currentRunningTest,
                    //     'completed-unknown',
                    //     testName
                    // );
                }
            }
        }
        // First, clear ANY previous running status (including the old currentRunningTest)
        const allRunningTests = document.querySelectorAll('.test-case-status.running');
        console.log(`   Found ${allRunningTests.length} tests currently marked as RUNNING`);
        
        allRunningTests.forEach((element, index) => {
            const testId = element.id.replace('status-', '');
            console.log(`   Clearing RUNNING status from Test ${testId}`);
            if(!element.classList.contains('passed') && !element.classList.contains('failed')){
            element.classList.remove('running');
            element.classList.add('yet-to-start');
            element.textContent = '⏳ YET TO START';
        }
        });
        
        // Special case: if previous test just completed, mark it properly
        // if (this.currentRunningTest && this.currentRunningTest !== testNumber) {
        //     console.log(`   Previous test ${this.currentRunningTest} should be marked as completed`);
        //     const prevTestElement = document.getElementById(`status-${this.currentRunningTest}`);
        //     if (prevTestElement && prevTestElement.classList.contains('yet-to-start')) {
        //         // If previous test was reset to "yet-to-start", mark it as passed
        //         console.log(`   Marking previous test ${this.currentRunningTest} as PASSED`);
        //         this.updateTestListStatus(this.currentRunningTest, 'passed', `Test_${this.currentRunningTest}`);
        //     }
        // }
        
        // Set the new test as running
        console.log(`   Setting Test ${testNumber} as RUNNING`);
        this.updateTestListStatus(testNumber, 'running', testName);
        this.currentRunningTest = testNumber;
        
        console.log(`✅ Current running test updated: Test ${testNumber} (${testName})`);
    }
    
    updateTestListStatus(testNumber, status, testName = '') {
        // console.log(
        //     `[STATUS] Test=${testNumber}, Status=${status}, CurrentRunning=${this.currentRunningTest}`
        // );
        const statusElement = document.getElementById(`status-${testNumber}`);
        if (!statusElement) return;
        // If a test was running and another test starts before
        // we receive PASS/FAIL, treat previous test as FAILED
        // if (previousTestId !== testNumber) {
        //     this.updateTestListStatus(previousTestId, 'failed');
        // }
        // Remove all status classes
        const normalizedStatus = String(status).toUpperCase();
        statusElement.classList.remove('not-started', 'running', 'passed', 'failed', 'aborted');
        
        // Add appropriate status class and update text
        switch (normalizedStatus) {
            case 'RUNNING':
                statusElement.classList.add('running');
                statusElement.textContent = '🔄 RUNNING';
                break;
            case 'PASSED':
                statusElement.classList.add('passed');
                statusElement.textContent = '✅ PASSED';
                break;
            case 'FAILED':
                statusElement.classList.add('failed');
                statusElement.textContent = '❌ FAILED';
                break;
            case 'ABORTED':
                statusElement.classList.add('aborted');
                statusElement.textContent = '🛑 ABORTED';
                break;
            default:
                statusElement.classList.add('not-started');
                statusElement.textContent = '⏳ NOT STARTED';
        }
        
        // Update test name if provided
        if (testName) {
            const nameElement = statusElement.parentElement.querySelector('.test-case-name');
            if (nameElement) {
                nameElement.textContent = `${testNumber}. ${testName}`;
                nameElement.title = testName;
            }
        }
        
        // Update counter
        this.updateTestListCounter();
        
        console.log(`📊 Test ${testNumber} status updated to: ${status.toUpperCase()}`);
    }
      updateTestListCounter() {
        if (!this.testListCounter) return;
        
        const passedCount = document.querySelectorAll('.test-case-status.passed').length;
        const failedCount = document.querySelectorAll('.test-case-status.failed').length;
        const runningCount = document.querySelectorAll('.test-case-status.running').length;
        const abortedCount =document.querySelectorAll('.test-case-status.aborted').length;
        const totalTestCasesCountFromStatus = passedCount+failedCount+runningCount+abortedCount;
        // 🎯 FIX: Total progress = passed + failed + running (tests that started)
        const totalProgress = passedCount + failedCount + runningCount+abortedCount;
        
        this.testListCounter.innerHTML = `
            <span style="color: #4caf50;">✅ ${passedCount}</span> | 
            <span style="color: #f44336;">❌ ${failedCount}</span> | 
            <span style="color: #2196f3;">🔄 ${runningCount}</span> | 
            <span style="color:#ff9800;">🛑 ${abortedCount}</span>
            <span style="color: #ffff00;">${totalProgress}/${Math.max(this.totalTestCases,totalTestCasesCountFromStatus)}</span>
        `;
    }
      hideTestListWindow() {
        if (this.testListWindow) {
            this.testListWindow.style.display = 'none';
        }
        // 🎯 NEW: Clear stored test case names when hiding the window
        this.testCaseNames.clear();
        console.log('📋 Test List Window hidden and test case names cleared');
    }
    
    // Clear test preview section
    clearTestPreview() {
        const previewSection = document.getElementById('testPreviewSection');
        if (previewSection) {
            previewSection.remove();
        }
    }

    // Clear file info and preview when LOB changes
    clearFileInfoAndPreview() {
        this.fileInfo.style.display = 'none';
        this.clearTestPreview();
        this.fileInput.value = '';
        this.uploadedFileName = null;
    }

    resetForNextRun() {
        completionHandled = true;
        latestSessionState = null;
        this.uploadedFileName = null;
        this.currentRunningTest = null;
        this.displayTestNumbers = [];
        this.testCaseNames.clear();
        this.includedTestNumbers = [];
        this.allTestsCount = 0;
        this.rowMapping = [];

        if (this.fileInput) this.fileInput.value = '';
        if (this.fileInfo) this.fileInfo.style.display = 'none';
        this.clearTestPreview();
        this.hideTestCaseProgress();
        this.hideDownloadSection();
        this.clearStatus();
        if (this.progressBar) this.progressBar.style.display = 'none';
        if (this.runButton) {
            this.runButton.disabled = true;
            this.runButton.textContent = '🚀 Run Tests';
        }
        if (this.abortButton) this.abortButton.style.display = 'none';
        console.log('🔄 Completed session reset for next test run');
    }

    // ...existing code...
    async runTests() {        
        let selectedLOB = null; // Declare at function scope
        
        try {
            completionHandled = false;
            // Initialize integrated terminal FIRST
            this.initializeIntegratedTerminal();
            // this.statusSection.style.display = 'block'; // Hidden terminal            
            
            selectedLOB = this.lobSelect.value;
            const selectedEnv = this.envSelect.value;
            const file = this.fileInput.files[0];            // Initialize test case progress with actual maxrecord from server
            const estimatedTests = await this.getEstimatedTestCount(selectedLOB);
            this.initializeTestCaseProgress(estimatedTests, this.getLOBDisplayName(selectedLOB));
              // 🎯 NEW: Initialize Test List Window
            this.currentRunningTest = null; // Reset current running test
                        this.displayTestNumbers = [];
            this.initializeTestListWindow(estimatedTests);
            
            // Update terminal status to starting
            const terminalStatus = this.statusSection.querySelector('.terminal-status');
            const terminalLog = this.statusSection.querySelector('.terminal-log');
            const abortBtn = this.statusSection.querySelector('#terminalAbort');
            
            if (terminalStatus) {
                terminalStatus.textContent = '🟡 STARTING';
                terminalStatus.className = 'terminal-status running';
            }
            
            if (abortBtn) {
                abortBtn.style.display = 'inline-block';
            }
            
            // Add start message to terminal
            if (terminalLog) {
                const startMsg = document.createElement('div');
                startMsg.className = 'log-line info';
                startMsg.innerHTML = `
                    <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                    <span class="log-text">🚀 Starting ${this.getLOBDisplayName(this.lobSelect.value)} tests...</span>
                `;
                terminalLog.appendChild(startMsg);
                terminalLog.scrollTop = terminalLog.scrollHeight;
            }            this.showStatus('running', '🚀 Initializing test execution...');
            this.progressBar.style.display = 'block';
            this.runButton.disabled = true;
            this.abortButton.style.display = 'block';

            // Step 1: Upload file
            this.updateProgress(20, '📤 Uploading Excel file...');
            this.updateTestCaseProgress(0, '📤 Uploading and validating Excel file...');
            await this.uploadFile(file);

            // Step 2: Process file
            this.updateProgress(40, '🔍 Processing Excel data...');
            this.updateTestCaseProgress(0, '🔍 Processing Excel data and extracting test cases...');
            await this.delay(1000);

            // Step 3: Setup environment
            this.updateProgress(60, `⚙️ Setting up ${this.getEnvDisplayName(selectedEnv)} environment...`);
            this.updateTestCaseProgress(0, `⚙️ Setting up ${this.getEnvDisplayName(selectedEnv)} environment...`);
            await this.delay(1000);

            // Step 4: Run tests
            this.updateProgress(80, `🧪 Running ${this.getLOBDisplayName(selectedLOB)} tests...`);
            this.updateTestCaseProgress(1, `🧪 Starting test execution for ${this.getLOBDisplayName(selectedLOB)}...`);
            const result = await this.executePlaywrightTests(selectedLOB, selectedEnv);       
            // Step 5: Complete - removed immediate completion message
            if(!result?.aborted || result?.results?.aborted){
            this.updateProgress(100, '✅ Tests completed successfully!');
            
            // Remove immediate completion message - will be handled by WebSocket events
            await this.delay(500);this.showStatus('success', `🎉 ${this.getLOBDisplayName(selectedLOB)} tests completed successfully!`);
            }

        } catch (error) {
            console.error('Test execution failed:', error);
            // console.error('RUNTESTS CATCH:', error);
            // console.error('STACK:', error.stack);
            const lobDisplayName = selectedLOB ? this.getLOBDisplayName(selectedLOB) : 'Test';
            this.showStatus('error', `❌ ${lobDisplayName} execution failed: ${error.message}`);
            
            // Hide test case progress on error
            // this.hideTestCaseProgress();
            
            // Add error to terminal
            const terminalLog = this.statusSection.querySelector('.terminal-log');
            if (terminalLog) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'log-line error';
                errorMsg.innerHTML = `
                    <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                    <span class="log-text">❌ Test execution failed: ${error.message}</span>
                `;
                terminalLog.appendChild(errorMsg);
                terminalLog.scrollTop = terminalLog.scrollHeight;
            }  
              }
               finally {
            this.runButton.disabled = false;
            this.abortButton.style.display = 'none';
            this.progressBar.style.display = 'none';
            // Hide test case progress when done
            // this.hideTestCaseProgress();
        }
    }

    async abortTests() {
        try {
            console.log('🛑 User requested test abort');
            
            // Disable abort button to prevent multiple clicks
            this.abortButton.disabled = true;
            this.abortButton.textContent = '⏸️ Aborting...';
            
            // Update terminal status immediately
            const terminalStatus = this.statusSection.querySelector('.terminal-status');
            if (terminalStatus) {
                terminalStatus.textContent = '🟠 ABORTING';
                terminalStatus.className = 'terminal-status aborted';
            }
            
            // Call abort API
            const response = await fetch(`/api/abort-tests/${this.sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Tests aborted successfully:', result);
                
                // Terminal will be updated via WebSocket event
                this.showStatus('error', '🛑 Tests aborted by user');
                this.updateProgress(0, '🛑 Tests aborted - Generating partial results...');
                
            } else {
                throw new Error('Failed to abort tests');
            }
            
        } catch (error) {
            console.error('Abort failed:', error);
            this.showStatus('error', `❌ Failed to abort tests: ${error.message}`);
            
            // Re-enable abort button if abort failed
            this.abortButton.disabled = false;
            this.abortButton.textContent = '🛑 Abort Tests';
        }
    }    async uploadFile(file) {
        if (!this.sessionId) {
            throw new Error('Session not initialized');
        }
        
        // Check if we've already uploaded this file for preview
        const currentFileName = file.name;
        if (this.uploadedFileName === currentFileName) {
            console.log('📁 File already uploaded, reusing existing upload');
            return; // File already uploaded in preview
        }
        
        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const response = await fetch(`/api/upload/${this.sessionId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }            

            const result = await response.json();
            this.uploadedFileName = result.filename || currentFileName;
            console.log(`📁 File uploaded as: ${this.uploadedFileName}`);
            
            // 🎯 Handle dynamic filtering results
            if (result.dynamicFiltering && result.dynamicFiltering.enabled) {
                const { testCaseNames, includedTestsCount, totalTestsInExcel, excludedCount } = result.dynamicFiltering;
                
                console.log(`📋 Dynamic Filtering Active:`);
                console.log(`   Total tests in Excel: ${totalTestsInExcel}`);
                console.log(`   Tests to run (GEN_TC=Y): ${includedTestsCount} ✅`);
                console.log(`   Tests excluded (GEN_TC=N): ${excludedCount} ❌`);
                
                if (testCaseNames && testCaseNames.length > 0) {
                    console.log(`📋 Test cases that will run:`);
                    testCaseNames.forEach((name, index) => {
                        console.log(`   ${index + 1}. ${name} ✅`);
                        this.storeTestCaseName(index + 1, name);
                    });
                }
                
                // Store filtering data for reference
                this.allTestsCount = totalTestsInExcel;
                this.includedTestNumbers = Array.from({length: includedTestsCount}, (_, i) => i + 1);
                
                // Initialize Test List Window with filtered test names
                if (includedTestsCount > 0) {
                    this.initializeTestListWindow(includedTestsCount, testCaseNames);
                }
            } else {
                // Handle legacy format or no filtering
                if (result.testCaseNames && result.testCaseNames.length > 0) {
                    console.log(`📋 Received ${result.testCaseNames.length} test case names from Excel:`);
                    
                    result.testCaseNames.forEach((name, index) => {
                        console.log(`   ${index + 1}. ${name}`);
                        this.storeTestCaseName(index + 1, name);
                    });
                    
                    // Initialize Test List Window
                    if (result.totalTests || result.testCaseNames.length) {
                        this.initializeTestListWindow(result.totalTests || result.testCaseNames.length, result.testCaseNames);
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    // Upload file for preview without triggering test execution
    async uploadFileForPreview(file) {
        if (!this.sessionId) {
            throw new Error('Session not initialized');
        }
        
        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            const response = await fetch(`/api/upload/${this.sessionId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }            

            const result = await response.json();
            console.log('📁 File uploaded for preview:', result);
            return result;
        } catch (error) {
            console.error('File preview upload failed:', error);
            throw error;
        }
    }    // Show test preview with filtering information
    showTestPreview(uploadResult) {
        if (!uploadResult.dynamicFiltering || !uploadResult.dynamicFiltering.enabled) {
            return;
        }

        const { testCaseNames, includedTestsCount, excludedCount, rowMapping, includedRowNumbers } = uploadResult.dynamicFiltering;
        
        // Create preview section if it doesn't exist
        let previewSection = document.getElementById('testPreviewSection');
        if (!previewSection) {
            previewSection = document.createElement('div');
            previewSection.id = 'testPreviewSection';
            previewSection.style.cssText = `
                background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
                border: 2px solid #2196f3;
                border-radius: 12px;
                padding: 1.5rem;
                margin: 1rem 0;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
            `;
            
            // Insert after file info section
            const fileInfo = document.getElementById('fileInfo');
            if (fileInfo && fileInfo.parentNode) {
                fileInfo.parentNode.insertBefore(previewSection, fileInfo.nextSibling);
            }
        }

        const displayTestCases = testCaseNames?.slice(0, 10) || []; // Show first 10
        const remainingCount = Math.max(0, includedTestsCount - displayTestCases.length);
        const displayRowMapping = rowMapping?.slice(0, 10) || [];

        previewSection.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem;">
                <span style="font-size: 1.5rem;">🔍</span>
                <h3 style="margin: 0; color: #1976d2; font-size: 1.1rem;">Test Preview</h3>
                <div style="margin-left: auto; background: #1976d2; color: white; padding: 4px 12px; border-radius: 15px; font-weight: bold; font-size: 0.9rem;">
                    ${includedTestsCount} tests will run
                </div>
            </div>
            
            ${includedRowNumbers && includedRowNumbers.length > 0 ? `
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.5); border-radius: 6px; padding: 0.8rem; margin-bottom: 1rem;">
                    <div style="font-weight: 600; color: #f57c00; margin-bottom: 4px;">📋 Excel Row Numbers Selected:</div>
                    <div style="font-family: monospace; color: #e65100; font-weight: bold;">
                        Rows: ${includedRowNumbers.join(', ')} marked with GEN_TC=Y
                    </div>
                </div>
            ` : ''}
            
            <div style="background: rgba(255,255,255,0.8); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div style="font-weight: 600; color: #333; margin-bottom: 0.5rem;">Tests that will be executed:</div>
                <div style="max-height: 200px; overflow-y: auto; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85rem;">
                    ${displayTestCases.map((name, index) => {
                        const originalRow = includedRowNumbers ? includedRowNumbers[index] : index + 1;
                        const mappingInfo = displayRowMapping[index];
                        return `
                        <div style="padding: 6px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px;">
                            <span style="color: #4caf50; font-weight: bold; min-width: 25px; font-size: 0.9rem;">${index + 1}.</span>
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                                <span style="color: #333; font-size: 0.9rem;">${name}</span>
                                <span style="color: #666; font-size: 0.75rem;">📍 Excel Row ${originalRow}</span>
                            </div>
                            <span style="color: #4caf50; font-size: 0.8rem; background: rgba(76, 175, 80, 0.1); padding: 2px 6px; border-radius: 4px;">✓ Y</span>
                        </div>
                    `;
                    }).join('')}
                    ${remainingCount > 0 ? `
                        <div style="padding: 8px 0; color: #666; font-style: italic; text-align: center; background: #f9f9f9; border-radius: 4px; margin-top: 4px;">
                            ... and ${remainingCount} more tests
                        </div>
                    ` : ''}
                </div>
            </div>

            ${excludedCount > 0 ? `
                <div style="background: rgba(244, 67, 54, 0.1); border: 1px solid rgba(244, 67, 54, 0.3); border-radius: 6px; padding: 0.8rem; color: #d32f2f; font-size: 0.9rem;">
                    <strong>ℹ️ Note:</strong> ${excludedCount} test(s) marked with GEN_TC=N or No will be skipped
                </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; color: #666;">
                💡 <strong>Tip:</strong> You can modify the GEN_TC column in your Excel file to include/exclude specific tests
            </div>
        `;
    }    async executePlaywrightTests(lob, environment = 'test') {
        const testMappings = {
            'Core_Dwelling_Basic': 'Core_Dwelling_Basic.spec.ts',
            'Core_Dwelling_Special': 'Core_Dwelling_Special.spec.ts',
            'Core_Manufactured_Home': 'Core_Manufactured_Home.spec.ts',
            'Core_BT': 'Core_BT.spec.ts',
            'Core_YT': 'Core_YT.spec.ts',
        };

        const testFile = testMappings[lob];
        
        try {
            if (!this.sessionId) {
                throw new Error('Session not initialized');
            }
            
            const response = await fetch(`/api/run-tests/${this.sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    testFile: testFile,
                    lob: lob,
                    environment: environment,
                    uploadedFileName: this.uploadedFileName
                })
            });

            if (!response.ok) {
                throw new Error('Test execution failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Test execution failed:', error);
            throw error;
        }
    }    updateProgress(percentage, message) {
        this.progressFill.style.width = percentage + '%';
        this.statusMessage.innerHTML = message;
    }

    // New enhanced test case progress methods
    initializeTestCaseProgress(totalTests, lobName) {
        this.totalTestCases = totalTests;
        this.currentTestCase = 0;
        
        if (this.testCaseProgress) {
            this.testCaseProgress.style.display = 'block';
            this.updateTestCaseProgress(0, `Preparing to run ${totalTests} test cases for ${lobName}...`);
        }
    }    updateTestCaseProgress(currentTest, testDescription = '') {
        this.currentTestCase = currentTest;
        
        if (this.progressCounter) {
            this.progressCounter.textContent = `${currentTest} / ${this.totalTestCases}`;
        }
        
        // 🎯 FIX: Progressive percentage, not immediate 100%
        let percentage = 0;
        if (this.totalTestCases > 0) {
            if (currentTest < this.totalTestCases) {
                percentage = (currentTest / this.totalTestCases) * 90; // Max 90% until complete
            } else if (currentTest === this.totalTestCases) {
                // Only show 100% if explicitly completed
                if (testDescription && testDescription.includes('🎉')) {
                    percentage = 100;
                } else {
                    percentage = 95; // 95% for last test processing
                }
            }
        }
        
        if (this.testProgressFill) {
            this.testProgressFill.style.width = percentage + '%';
        }
        
        if (this.currentTestInfo) {
            if (currentTest === 0) {
                this.currentTestInfo.textContent = testDescription || 'Initializing tests...';
            } else {
                this.currentTestInfo.textContent = testDescription || `Running test case ${currentTest} of ${this.totalTestCases}...`;
            }
        }
        
        console.log(`📊 Test Progress: ${currentTest}/${this.totalTestCases} (${percentage.toFixed(1)}%) - ${testDescription}`);
    }    hideTestCaseProgress() {
        console.log('🙈 hideTestCaseProgress called');
        if (this.testCaseProgress) {
            this.testCaseProgress.style.display = 'none';
        }
        // 🎯 NEW: Also hide Test List Window
        this.hideTestListWindow();
    }

    showStatus(type, message) {
        this.status.className = `status ${type}`;
        this.status.style.display = 'block';
        this.statusMessage.innerHTML = message;
    }

    async downloadFile(url, filename) {
        try {
            console.log(`🔍 Attempting download from: ${url}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to download ${filename}. Status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
            
            console.log(`✅ Download initiated successfully for ${filename}`);
            
        } catch (error) {
            console.error('Download error:', error);
            alert(`❌ Failed to download ${filename}. Please try again.`);
        }
    }

    setupWebSocket() {
        if (typeof io === 'undefined') {
            console.error('🚨 Socket.IO not loaded!');
            return;
        }
        
        try {
            this.socket = io();
            console.log('🔌 WebSocket connection initialized');
            this.socket.onAny((eventName, data) => {
console.log('🔥 SOCKET EVENT:', eventName, data);
});
            this.socket.on('connect', () => {
                console.log('🔗 WebSocket connected');
                if (this.sessionId) {
                    this.socket.emit('joinSession', this.sessionId);
                    console.log(`🏠 Joined session room: ${this.sessionId}`);
                }
                this.refreshSessionState();
            });
            
            this.socket.on('disconnect', (reason) => {
                console.warn('🔌 WebSocket disconnected: ', reason);
            });
            this.socket.on('sessionChanged', () => this.refreshSessionState());
            //   if (this.sessionId) {
            //     setTimeout(() => {
            //         this.socket.emit('joinSession', this.sessionId);
            //         console.log(`🏠 Joined session room: ${this.sessionId}`);
                    
            //         // Check for missed completion events
            //         this.checkForMissedCompletion();
            //     }, 100);
            // }
            this.socket.io.on('reconnect_attempt', () => {
                console.log('🔄 Attempting reconnect...');
            });
            this.socket.io.on('reconnect', (attempt) => {

                console.log(`♻️ Reconnected after ${attempt} attempts`);

                if (this.sessionId) {
                    this.socket.emit(
                        'joinSession',
                        this.sessionId
                    );
                    this.refreshSessionState();
                }
            });

        } catch (error) {
            console.error('🚨 WebSocket setup failed:', error);
        }
    }

    async refreshSessionState() {
        if (!this.sessionId) return;
        try {
            const response = await fetch(`/api/session-status/${this.sessionId}`);
            if (!response.ok) return;
            const state = await response.json();
            if (!state.success) return;
            latestSessionState = state;
            this.renderSessionState(state);
        } catch (error) {
            console.error('Failed to refresh session state:', error);
        }
    }

    startSessionStatePolling() {
        if (sessionStatePollTimer) return;
        sessionStatePollTimer = window.setInterval(() => {
            this.refreshSessionState();
        }, 1000);
    }

    stopSessionStatePolling() {
        if (!sessionStatePollTimer) return;
        window.clearInterval(sessionStatePollTimer);
        sessionStatePollTimer = null;
    }

    renderSessionState(state) {
        if (state.completed && completionHandled) return;

        const tests = state.tests || {};
        const testNumbers = Object.keys(tests).map(Number).filter(Number.isInteger);
        const totalTests = Math.max(this.totalTestCases || 0, testNumbers.length);
        if (totalTests > 0 && (!this.testListContainer || this.testListContainer.children.length !== totalTests)) {
            this.displayTestNumbers = [];
            this.initializeTestListWindow(totalTests);
        }

        Object.values(tests).forEach(test => {
            const status = ['NOT_STARTED', 'RUNNING', 'PASSED', 'FAILED', 'ABORTED'].includes(test.status)
                ? test.status
                : 'NOT_STARTED';
            this.updateTestListStatus(test.testNumber, status, test.name || test.testName || `Test_${test.testNumber}`);
        });

        if (state.status === 'RUNNING') {
            this.showStatus('running', '🧪 Running Tests...');
        } else if (state.status === 'ABORTED') {
            this.showStatus('error', '🛑 Test execution aborted by user');
        }

        if (state.completed && !completionHandled) {
            completionHandled = true;
            this.stopSessionStatePolling();
            this.showDownloadSection(state.currentLOB || this.lobSelect.value || 'Unknown');
            if (this.runButton) this.runButton.disabled = false;
            if (this.abortButton) this.abortButton.style.display = 'none';
            setTimeout(() => this.hideTestCaseProgress(), 20000);
        }
    }    getLOBDisplayName(lob) {
        const displayNames = {
            'Core_Dwelling_Basic': 'Core Dwelling Basic',
            'Core_Dwelling_Special': 'Core Dwelling Special',
            'Core_HomeOwners': 'Core Homeowners',
            'Core_CV': 'Core Collector Vehicle',
            'Core_MS': 'Core Motorsports',
            'Core_Manufactured_Home': 'Core Manufactured Home',
            'Core_BT': 'Core Boat (BT)',
            'Core_YT': 'Core Yacht (YT)'
        };
        return displayNames[lob] || lob;
    }

    getEnvDisplayName(env) {
        const envDisplayNames = {
            'test': 'Test Environment',
            'test2': 'Test2 Environment', 
            'datemove': 'Datemove Environment',
            'lab2': 'Lab2 Environment',
            'preprod': 'PreProd Environment'
        };
        return envDisplayNames[env] || env;
    }    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }    // Get actual test count from server based on LOB type
    async getEstimatedTestCount(lob) {
        try {
            // First try to get actual maxrecord from server
            const response = await fetch(`/api/maxrecord/${lob}`);
            const data = await response.json();
            
            if (data.success && data.maxrecord) {
                console.log(`✅ Got actual maxrecord=${data.maxrecord} for LOB: ${lob}`);
                return data.maxrecord;
            } else {
                console.warn(`⚠️ Failed to get maxrecord for ${lob}, using fallback`);
            }
        } catch (error) {
            console.error(`❌ Error fetching maxrecord for ${lob}:`, error);
        }        // Fallback: Default estimated counts for different LOB types
        const testCounts = {
            'Core_Dwelling_Basic': 5,
            'Core_Dwelling_Special': 5,
            'Core_HomeOwners': 4,
            'Core_CV': 3,
            'Core_MS': 3,
            'Core_Manufactured_Home': 4,
            'Core_BT': 3,
            'Core_YT': 3
        };
        
        const fallbackCount = testCounts[lob] || 5; // Default to 5 if LOB not found
        console.log(`📊 Using fallback count=${fallbackCount} for LOB: ${lob}`);
        return fallbackCount;
    }

    // Missing essential methods for file upload and validation
    
    createFileList(file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        return dt.files;
    }    showFileInfo(file, dynamicFilteringData = null) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        
        let filteringInfo = '';
        if (dynamicFilteringData && dynamicFilteringData.enabled) {
            const { totalTestsInExcel, includedTestsCount, excludedCount } = dynamicFilteringData;
            
            filteringInfo = `
                <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border: 2px solid #4caf50; border-radius: 8px; padding: 12px; margin-top: 10px;">
                    <div style="font-weight: 600; color: #2e7d32; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2rem;">🎯</span>
                        <span>Dynamic Test Filtering Active</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                        <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 8px; border-radius: 6px;">
                            <div style="font-weight: bold; color: #1976d2;">${totalTestsInExcel}</div>
                            <div style="color: #666; font-size: 0.8rem;">Total in Excel</div>
                        </div>
                        <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 8px; border-radius: 6px;">
                            <div style="font-weight: bold; color: #4caf50;">${includedTestsCount}</div>
                            <div style="color: #666; font-size: 0.8rem;">Will Run (Y)</div>
                        </div>
                        <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 8px; border-radius: 6px;">
                            <div style="font-weight: bold; color: #f44336;">${excludedCount}</div>
                            <div style="color: #666; font-size: 0.8rem;">Excluded (N)</div>
                        </div>
                    </div>
                    <div style="margin-top: 8px; text-align: center; font-size: 0.85rem; color: #2e7d32;">
                        ✅ GEN_TC column detected - only tests marked "Y" or "Yes" will run
                    </div>
                </div>
            `;
        }
        
        this.fileInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 2rem;">📊</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${file.name}</div>
                    <div style="font-size: 0.9rem; color: #666;">Size: ${sizeInMB} MB</div>
                </div>
                <div style="margin-left: auto;">
                    <div style="width: 20px; height: 20px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;">✓</div>
                </div>
            </div>
            ${filteringInfo}
        `;
        this.fileInfo.style.display = 'block';
    }

    validateForm() {
        const hasFile = this.fileInput.files.length > 0;
        const hasLOB = this.lobSelect.value !== '';
        const selectedEnv = this.envSelect.value;
        const isValidEnv = this.validateEnvironment(selectedEnv);
        
        this.runButton.disabled = !(hasFile && hasLOB && isValidEnv);
    }

    filterLOBsByEnvironment() {
        const selectedEnv = this.envSelect.value;
        
        const coreSuiteLOBs = [
            'Core_Dwelling_Basic',
            'Core_Dwelling_Special',
            'Core_HomeOwners',
            'Core_CV',
            'Core_MS',
            'Core_Manufactured_Home',
            'Core_BT',
            'Core_YT'
        ];
        
        // Get current selection
        const currentSelection = this.lobSelect.value;
        
        // Clear current options except the first one
        this.lobSelect.innerHTML = '<option value="">-- Select Test --</option>';
        // Add Core options for supported environments
        if (selectedEnv === 'test' || selectedEnv === 'test2' || selectedEnv === 'datemove' || selectedEnv === 'lab2' || selectedEnv === 'preprod') {
            coreSuiteLOBs.forEach(lob => {
                this.addLOBOption(lob);
            });
        }
        
        // Try to restore previous selection if still available
        if (currentSelection && [...Array.from(this.lobSelect.options)].some(opt => opt.value === currentSelection)) {
            this.lobSelect.value = currentSelection;
        }
        
        console.log(`🔄 Filtered LOBs for environment: ${selectedEnv}`);
    }
    
    addLOBOption(lobValue) {
        const option = document.createElement('option');
        option.value = lobValue;        // Convert technical names to display names
        const displayNames = {
            'Core_Dwelling_Basic': 'Core Dwelling Basic',
            'Core_Dwelling_Special': 'Core Dwelling Special',
            'Core_HomeOwners': 'Core HomeOwners',
            'Core_CV': 'Core Collector Vehicle',
            'Core_MS': 'Core Motorsports',
            'Core_Manufactured_Home': 'Core Manufactured Home',
            'Core_BT': 'Core Boat (BT)',
            'Core_YT': 'Core Yacht (YT)'
        };
        
        option.textContent = displayNames[lobValue] || lobValue;
        this.lobSelect.appendChild(option);
    }

    validateEnvironment(selectedEnv) {
        // List of valid environments
        const validEnvironments = ['test', 'test2', 'datemove', 'lab2', 'preprod'];
        
        console.log(`🔍 UI Environment Validation:`);
        console.log(`   Requested: "${selectedEnv || 'not specified'}"`);
        
        // If no environment selected
        if (!selectedEnv || selectedEnv.trim() === '') {
            console.log(`   ⚠️ No environment selected, will default to: test`);
            return false; // Form invalid until user selects
        }
        
        // Check if environment is valid (case insensitive)
        const normalizedEnv = selectedEnv.toLowerCase();
        if (!validEnvironments.includes(normalizedEnv)) {
            console.log(`   ❌ Invalid environment: ${selectedEnv}`);
            console.log(`   🔄 Auto-switching to Test environment`);
            
            // Auto-switch to test environment
            this.envSelect.value = 'test';
            
            // Call validation again with the corrected value
            return this.validateEnvironment('test');
        }
        
        // If valid but case doesn't match, normalize it
        if (selectedEnv !== normalizedEnv) {
            console.log(`   🔄 Normalizing case: "${selectedEnv}" → "${normalizedEnv}"`);
            this.envSelect.value = normalizedEnv;
            selectedEnv = normalizedEnv; // Update for further processing
        }
        
        console.log(`   ✅ Valid environment confirmed: ${selectedEnv}`);
        return true;
    }

    updateDownloadButtonText() {
        const selectedLOB = this.lobSelect.value;
        
        if (selectedLOB) {
            // Update Complete download button text
            this.downloadComplete.innerHTML = `📦 Download Complete Reports for ${selectedLOB}`;
        } else {
            // Default text when no LOB selected
            this.downloadComplete.innerHTML = '📦 Download Complete Reports (ZIP)';
        }
    }

    updateEnvironmentInfo() {
        const selectedEnv = this.envSelect.value;
        
        const envDisplayNames = {
            'test': 'Test Environment',
            'test2': 'Test2 Environment',
            'datemove': 'Datemove Environment',
            'lab2': 'Lab2 Environment',
            'preprod': 'Preprod Environment'
        };
        
        const envName = envDisplayNames[selectedEnv] || selectedEnv;
        console.log(`🌍 Environment: ${envName}`);
        
        // Update UI to show environment info if needed
        this.updateDownloadButtonText();
    }

    // Show smart LOB suggestion
    showSmartLOBSuggestion(filename, detectedLOB) {
        const detectedName = this.getLOBDisplayName(detectedLOB);
        
        // Check if detected LOB is available in current environment
        const availableOptions = Array.from(this.lobSelect.options).map(opt => opt.value).filter(val => val);
        
        if (!availableOptions.includes(detectedLOB)) {
            console.log(`⚠️ Detected LOB ${detectedLOB} not available in current environment`);
            return;
        }
        
        this.showStatus('success', `
            <div style="text-align: left;">
                <strong>🎯 Smart File Detection!</strong><br><br>
                📁 <strong>File:</strong> ${filename}<br>
                🔍 <strong>Suggested LOB:</strong> ${detectedName}<br><br>
                <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button onclick="testRunner.autoCorrectLOB('${detectedLOB}')" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                        ✅ Use Suggested LOB
                    </button>
                    <button onclick="testRunner.clearStatus()" style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                        ↩️ Select Manually
                    </button>
                </div>
            </div>
        `);
    }

    // Auto-correct LOB selection
    autoCorrectLOB(newLOB) {
        this.lobSelect.value = newLOB;
        this.validateForm();
        this.updateDownloadButtonText();
        this.clearStatus();
        
        // Show confirmation
        setTimeout(() => {
            this.showStatus('success', `✅ LOB automatically set to: ${this.getLOBDisplayName(newLOB)}`);
            setTimeout(() => this.clearStatus(), 3000);
        }, 100);
    }

    // Clear status method
    clearStatus() {
        this.status.style.display = 'none';
    }

    // Validate LOB-File compatibility when LOB changes
    validateLOBFileCompatibility() {
        const currentFile = this.fileInput.files[0];
        const selectedLOB = this.lobSelect.value;
        
        // If no file uploaded or no LOB selected, nothing to validate
        if (!currentFile || !selectedLOB) {
            this.clearStatus();
            return;
        }
        
        // Check if current file matches new LOB selection
        const detectedLOB = this.detectLOBFromFilename(currentFile.name);
        
        if (!detectedLOB) {
            this.showUploadCorrectFilePopup(selectedLOB, currentFile.name, 'unrecognized');
        } else if (detectedLOB !== selectedLOB) {
            this.showUploadCorrectFilePopup(selectedLOB, currentFile.name, 'mismatch', detectedLOB);
        } else {
            // Perfect match
            this.clearStatus();
            this.showStatus('success', `✅ File matches selected test: ${this.getLOBDisplayName(selectedLOB)}`);
            setTimeout(() => this.clearStatus(), 2000);
        }
    }

    // 🎯 NEW: Update test progress with Test List Window support
    updateTestProgress(data) {
        this.initializeIntegratedTerminal();
        // this.statusSection.style.display = 'block'; // Hidden terminal
        console.log("before console log of debug event")
console.log("FULL DATA RECEIVED", data);
        // Update terminal status
        const terminalStatus = this.statusSection.querySelector('.terminal-status');
        const abortBtn = this.statusSection.querySelector('#terminalAbort');
        
        if (terminalStatus) {
            terminalStatus.textContent = '🔴 RUNNING';
            terminalStatus.className = 'terminal-status running';
        }
        
        if (abortBtn) {
            abortBtn.style.display = 'inline-block';
        }            // Handle test case progress updates from server
        if (data.testCaseNumber !== undefined && data.totalTests !== undefined) {
            // 🎯 FIX: Update totalTestCases with real-time data from server
            this.totalTestCases = data.totalTests;
            
            let progressDescription = data.testDescription;
            
            // If we have test case name, use it for better display
            if (data.testCaseName) {
                progressDescription = data.testCaseName;
                // 🎯 NEW: Store the actual test case name
                this.storeTestCaseName(data.testCaseNumber, data.testCaseName);
            } else if (data.testDescription && !data.testDescription.startsWith('Test case') && !data.testDescription.startsWith('Test ')) {
                // 🎯 NEW: If testDescription contains actual test name, store it
                this.storeTestCaseName(data.testCaseNumber, data.testDescription);
                progressDescription = data.testDescription;
            } else if (!progressDescription) {
                progressDescription = `Test case ${data.testCaseNumber} of ${data.totalTests}`;
            }              // Extract status from server data and normalize it
            let testStatus = data.testStatus || data.status || data.state || '';
              // 🎯 ENHANCED: Normalize status values for Test List Window
            if (testStatus) {
                testStatus = testStatus.toLowerCase();
                
                // Map various possible status values to our standard format
                if (testStatus.includes('running') || testStatus.includes('active') || testStatus.includes('executing')) {
                    testStatus = 'running';
                } else if (testStatus.includes('pass') || testStatus.includes('success') || testStatus.includes('complete')) {
                    testStatus = 'passed';
                } else if (testStatus.includes('abort')) {
                    testStatus = 'aborted';
                }
                else if (testStatus.includes('fail') || testStatus.includes('error') || testStatus.includes('abort')) {
                    testStatus = 'failed';
                } else {
                    // 🎯 FIX: Don't default to 'running' - use 'yet-to-start' if status is unclear
                    testStatus = 'yet-to-start';
                }
            } else if (data.testCaseNumber) {
                // 🎯 FIX: Only mark as running if this is actually the current test being executed
                // Check if this test number is sequential (current + 1) or if no test is currently running
                if (!this.currentRunningTest || data.testCaseNumber === this.currentRunningTest + 1 || data.testCaseNumber === 1) {
                    testStatus = 'running';
                } else {
                    testStatus = 'yet-to-start';
                }
            }            // 🎯 ENHANCED: Better status handling to ensure proper test transitions
            if (data.testCaseNumber) {
                console.log(`📊 WebSocket Received - Test ${data.testCaseNumber}: ${testStatus.toUpperCase()} | Current Running: ${this.currentRunningTest}`);
                console.log(`   Raw data:`, { status: data.testStatus, testCaseNumber: data.testCaseNumber, testDescription: data.testDescription });
                
                // 🎯 NEW: Store actual test case name if provided
                if (data.testCaseName && data.testCaseName.trim() && !data.testCaseName.startsWith('Test_')) {
                    this.storeTestCaseName(data.testCaseNumber, data.testCaseName);
                }
                
                // 🎯 CRITICAL FIX: Handle status transitions properly
                if (testStatus === 'running') {
                    // 🔥 If a new test starts, switch the status banner back to RUNNING
                    this.showStatus(
                    'running',
                    `🧪 Running Tests...`
                    );
                    // Only set as running if no other test is currently running OR this is the next test in sequence
                    const shouldSetAsRunning = !this.currentRunningTest || 
                                             data.testCaseNumber === this.currentRunningTest + 1 || 
                                             data.testCaseNumber === 1;
                    
                    if (shouldSetAsRunning) {
                        console.log(`🚀 ✅ ACCEPTING: Test ${data.testCaseNumber} as RUNNING`);
                        const displayName = this.testCaseNames.get(data.testCaseNumber) || data.testCaseName || `Test_${data.testCaseNumber}`;
                        this.setCurrentRunningTest(data.testCaseNumber, displayName);
                    } else {
                        console.log(`⚠️ ❌ REJECTING: Test ${data.testCaseNumber} wants to run, but Test ${this.currentRunningTest} is still running. Keeping as YET TO START.`);
                        // Don't change status if another test is running
                        return;
                    }
                } else if (testStatus === 'passed' || testStatus === 'failed') {
                    console.log(`✅ ✅ COMPLETING: Test ${data.testCaseNumber} with status: ${testStatus.toUpperCase()}`);
                    
                    // Update this specific test's status
                    const displayName = this.testCaseNames.get(data.testCaseNumber) || data.testCaseName || `Test_${data.testCaseNumber}`;
                    this.updateTestListStatus(data.testCaseNumber, testStatus, displayName);
                    
                    // 🎯 CRITICAL: Clear current running test if this was the running test
                    if (this.currentRunningTest === data.testCaseNumber) {
                        console.log(`🔄 ✅ CLEARING: Current running test ${this.currentRunningTest} (now ${testStatus})`);
                        this.currentRunningTest = null;
                        
                        // 🎯 AUTO-START NEXT TEST: Check if next test should start immediately
                        const nextTestNumber = data.testCaseNumber + 1;
                        if (nextTestNumber <= this.totalTestCases) {
                            console.log(`🚀 ⏳ PREPARING: Next test ${nextTestNumber} (total: ${this.totalTestCases})`);
                            
                            // Wait a brief moment, then check for next test start
                            setTimeout(() => {
                                const nextTestElement = document.getElementById(`status-${nextTestNumber}`);
                                if (nextTestElement && nextTestElement.classList.contains('yet-to-start')) {
                                    console.log(`🎯 ⏳ WAITING: Test ${nextTestNumber} ready to start when server sends signal...`);
                                    // The next test start will be handled by subsequent WebSocket messages
                                }
                            }, 100);
                        } else {
                            console.log(`🎉 🏁 FINAL: Test ${data.testCaseNumber} was the final test! All tests completed.`);
                        }
                    }
                } else {
                    // For 'yet-to-start' or unknown statuses, only update if test is not currently running
                    if (this.currentRunningTest !== data.testCaseNumber) {
                        console.log(`📝 ✏️ UPDATING: Test ${data.testCaseNumber} status to: ${testStatus.toUpperCase()}`);
                        this.updateTestListStatus(data.testCaseNumber, testStatus, data.testCaseName || `Test_${data.testCaseNumber}`);
                    } else {
                        console.log(`⚠️ 🚫 IGNORING: '${testStatus}' for currently running Test ${data.testCaseNumber}`);
                    }
                }
            }
            
            this.updateTestCaseProgress(data.testCaseNumber, progressDescription, testStatus);
        }
        
        // Update main progress if provided
        if (data.percentage !== undefined) {
            this.updateProgress(data.percentage, data.message || '🧪 Running tests...');
        }
        
        // Add real-time output to terminal
        const terminalLog = this.statusSection.querySelector('.terminal-log');
        if (terminalLog && data.output) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-line info';
            logEntry.innerHTML = `
                <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span> 
                <span class="log-text">${this.escapeHtml(data.output.trim())}</span>
            `;
            terminalLog.appendChild(logEntry);
            terminalLog.scrollTop = terminalLog.scrollHeight;
              // Keep only last 150 lines for performance
            while (terminalLog.children.length > 150) {
                terminalLog.removeChild(terminalLog.firstChild);
            }
        }
    }    // 🎯 NEW: Handle test completion events and update Test List Window
    handleTestCompletion(data) {
        console.log('🎯 🚨 CRITICAL: Processing test completion:', data);
        // 🛑 ABORT HANDLING FIRST
        if (data.aborted) {
            console.log('🛑 Execution aborted by user');

            // mark currently running test as aborted
            if (this.currentRunningTest) {
                const displayName =
                    this.testCaseNames.get(this.currentRunningTest) ||
                    `Test_${this.currentRunningTest}`;

                this.updateTestListStatus(
                    this.currentRunningTest,
                    'aborted',
                    displayName
                );

                this.currentRunningTest = null;
            }

            this.showStatus(
                'error',
                '🛑 Test execution aborted by user'
            );

            // Re-enable UI
            this.runButton.disabled = false;
            this.abortButton.style.display = 'none';

            // show partial reports
            this.showDownloadSection(data.lob || 'Unknown');

            console.log('✅ All tests finished. Hiding in 20 seconds...');
            setTimeout(() => {
                console.log('🙈 Hiding Test List Window');
                this.hideTestCaseProgress();
            }, 20000);

            return; // ✅ VERY IMPORTANT
        }
        console.log('📊 Complete data object:', JSON.stringify(data, null, 2));
        console.log(`📊 🕐 Timestamp: ${new Date().toLocaleTimeString()}`);
        
        // 🎯 FIXED LOGIC: If data has sessionId and lob, it's a FINAL completion from server
        // Individual test completions wouldn't have sessionId from server
        const isServerCompletion = !!(data.sessionId && data.lob);
        const isIndividualTestComplete = data.testCaseNumber && !isServerCompletion;
        
        console.log(`📊 🎯 Completion type: ${isServerCompletion ? 'SERVER FINAL' : 'INDIVIDUAL TEST'}`);
        console.log(`📊 isServerCompletion: ${isServerCompletion}`);
        console.log(`📊 isIndividualTestComplete: ${isIndividualTestComplete}`);
        console.log(`📊 data.sessionId: ${data.sessionId}`);
        console.log(`📊 data.lob: ${data.lob}`);
        console.log(`📊 data.success: ${data.success}`);
        
        // Handle individual test completion
        if (isIndividualTestComplete) {
            console.log(`✅ Individual test ${data.testCaseNumber} completed with status: ${data.testStatus || 'unknown'}`);
            
            // 🎯 NEW: Store test case name if provided
            if (data.testCaseName) {
                this.storeTestCaseName(data.testCaseNumber, data.testCaseName);
            }
            
            // Update only this specific test's status
            if (data.testCaseNumber && data.testStatus) {
                const displayName = this.testCaseNames.get(data.testCaseNumber) || data.testCaseName || `Test_${data.testCaseNumber}`;
                this.updateTestListStatus(data.testCaseNumber, data.testStatus, displayName);
            }
            
            // DON'T hide Test List Window - more tests are coming
            console.log('🔄 Waiting for next test to start...');
            return; // Exit early, keep UI visible
        }        // Handle SERVER completion (FINAL) - ALWAYS show download section
        if (isServerCompletion) {
            console.log('🎉 🚨 SERVER COMPLETION DETECTED - Final processing');
            console.log('📦 🎯 About to show download section...');
            console.log(`📦 🕐 Server completion at: ${new Date().toLocaleTimeString()}`);
            
            // Update overall status
            const terminalStatus = this.statusSection?.querySelector('.terminal-status');
            const abortBtn = this.statusSection?.querySelector('#terminalAbort');
            
            if (terminalStatus) {
                terminalStatus.textContent = data.success ? '✅ COMPLETED' : '❌ FAILED';
                terminalStatus.className = `terminal-status ${data.success ? 'completed' : 'failed'}`;
                console.log(`📊 ✅ Terminal status updated: ${terminalStatus.textContent}`);
            }
              if (abortBtn) {
                abortBtn.style.display = 'none';
                console.log(`📊 ✅ Abort button hidden`);
            }
            
            // Update individual test case results in Test List Window if provided
            if (data.testResults && Array.isArray(data.testResults)) {
                data.testResults.forEach((testResult, index) => {
                    const testNumber = index + 1;
                    const status = testResult.success || testResult.passed ? 'passed' : 'failed';
                    const testName = testResult.testName || testResult.name || `Test_${testNumber}`;
                    
                    this.updateTestListStatus(testNumber, status, testName);
                });
                console.log(`📊 ✅ Updated ${data.testResults.length} test results in Test List`);
            }
            
            // Re-enable run button
            if (this.runButton) {
                this.runButton.disabled = false;
                this.runButton.textContent = '🚀 Run Tests';
                console.log(`📊 ✅ Run button re-enabled`);
            }
              // 🚨🚨 CRITICAL: Show download section for completed tests
            console.log('📦 🎯 🚨 CRITICAL: Calling showDownloadSection...');
            console.log(`📦 🎯 LOB: ${data.lob || 'Unknown'}`);
            console.log(`📦 🎯 SessionId: ${this.sessionId}`);
            
            // 🎯 FORCE show download section with extra delay to ensure DOM is ready
            setTimeout(() => {
                console.log('📦 🎯 🚨 EXECUTING showDownloadSection after 100ms delay...');
                this.showDownloadSection(data.lob || 'Unknown');
                console.log('📦 ✅ showDownloadSection call completed');
            }, 100);
            
            // 🎯 Additional safety net - try again after 1 second if still not visible
            setTimeout(() => {
                const resultsSection = document.getElementById('resultsSection');
                if (!resultsSection || resultsSection.style.display === 'none') {
                    console.log('🚨 ⚠️ SAFETY NET: Download section still not visible, trying again...');
                    this.showDownloadSection(data.lob || 'Unknown');
                } else {
                    console.log('📦 ✅ SAFETY NET: Download section is visible, all good!');
                }
            }, 1000);
            
            // Hide Test List Window after ALL tests are done
            // setTimeout(() => {
            //     this.hideTestListWindow();
            // }, 20000);
            // const completedTests =
            //     document.querySelectorAll(
            //         '.test-case-status.passed, .test-case-status.failed'
            //     ).length;

            // if (completedTests >= this.totalTestCases) {
            //     const message = this.statusMessage?.innerHTML || '';
            //     if(message.toLowerCase().includes("running")){
            //         this.showStatus('success', `🎉 ${this.getLOBDisplayName(selectedLOB)} tests completed successfully!`);
            //     }
            //     setTimeout(() => {
            //         this.hideTestCaseProgress();
            //     }, 20000);
            // }

            // const allFinished = document.querySelectorAll('.test-case-status.running').length === 0;
            // console.log('allFinished=', allFinished);
            // if (allFinished) {
                console.log('✅ All tests finished. Hiding in 20 seconds...');
                setTimeout(() => {
                    console.log('🙈 Hiding Test List Window');
                    this.hideTestCaseProgress();
                }, 20000);
            // }

            
            console.log('✅ 🎯 Final test completion handling finished');
        } else {
            console.log('⚠️ Not a server completion event, ignoring...');
            console.log('📊 data.sessionId:', data.sessionId);
            console.log('📊 data.lob:', data.lob);
        }
    }
    async syncSessionState() {
        return this.refreshSessionState();
    }
    // 🎯 NEW: Handle test abortion events
    handleTestAborted(data) {
        console.log('🛑 Processing test abortion:', data);
        
        // Update overall status
        const terminalStatus = this.statusSection?.querySelector('.terminal-status');
        const abortBtn = this.statusSection?.querySelector('#terminalAbort');
        
        if (terminalStatus) {
            terminalStatus.textContent = '🛑 ABORTED';
            terminalStatus.className = 'terminal-status aborted';
        }
        
        if (abortBtn) {
            abortBtn.style.display = 'none';
        }
          // Mark currently running test as failed in Test List Window
        if (data.testCaseNumber) {
            // 🎯 NEW: Store test case name if provided
            if (data.testCaseName) {
                this.storeTestCaseName(data.testCaseNumber, data.testCaseName);
            }
            const displayName = this.testCaseNames.get(data.testCaseNumber) || data.testCaseName || `Test_${data.testCaseNumber}`;
            if (this.currentRunningTest) {
                const displayName =
                    this.testCaseNames.get(this.currentRunningTest) ||
                    `Test_${this.currentRunningTest}`;

                this.updateTestListStatus(
                    this.currentRunningTest,
                    'aborted',
                    displayName
                );

                this.currentRunningTest = null;
            }
        }
          // Re-enable run button
        if (this.runButton) {
            this.runButton.disabled = false;
            this.runButton.textContent = '🚀 Run Tests';
        }
          // Show download section for aborted tests (partial results)
        console.log('📦 🛑 Calling showDownloadSection for aborted test...');
        setTimeout(() => {
            this.showDownloadSection(data.lob || 'Unknown');
        }, 100);
        
        // Hide Test List Window after a delay
        // setTimeout(() => {
        //     this.hideTestListWindow();
        // }, 3000);
        const completedTests =
            document.querySelectorAll(
                '.test-case-status.passed, .test-case-status.failed'
            ).length;

        if (completedTests >= this.totalTestCases) {
            setTimeout(() => {
                this.hideTestCaseProgress();
            }, 20000);
        }
        console.log('🛑 Test abortion handling finished');    }    // Show download section after test completion or abort
    showDownloadSection(lob = 'Unknown') {
        console.log(`📦 🎯 CRITICAL: Showing download section for LOB: ${lob}`);
        console.log(`📦 DOM Ready State: ${document.readyState}`);
        console.log(`📦 this.resultsSection exists:`, !!this.resultsSection);
        console.log(`📦 this.downloadComplete exists:`, !!this.downloadComplete);
        console.log(`📦 this.sessionId:`, this.sessionId);
        
        // 🚨 FORCE re-initialize ALL elements EVERY TIME
        console.log(`🔄 🎯 FORCE re-initializing ALL download elements...`);
        this.resultsSection = document.getElementById('resultsSection');
        this.downloadComplete = document.getElementById('downloadComplete');
        
        // Debug current DOM state
        console.log(`📦 🔍 DOM Check Results:`);
        console.log(`   - resultsSection found:`, !!this.resultsSection);
        console.log(`   - downloadComplete found:`, !!this.downloadComplete);
        
        if (this.resultsSection) {
            console.log(`📦 🎯 SETTING resultsSection display to BLOCK...`);
            
            // 🚨 Multiple approaches to ensure visibility
            this.resultsSection.style.display = 'block';
            this.resultsSection.style.visibility = 'visible';
            this.resultsSection.style.opacity = '1';
            this.resultsSection.classList.remove('hidden');
            
            // 🔍 Verify the change was applied
            const computedStyle = window.getComputedStyle(this.resultsSection);
            console.log(`📦 ✅ Results after setting:`);
            console.log(`   - style.display: "${this.resultsSection.style.display}"`);
            console.log(`   - computed display: "${computedStyle.display}"`);
            console.log(`   - visibility: "${computedStyle.visibility}"`);
            console.log(`   - opacity: "${computedStyle.opacity}"`);
            
            // Set download URL based on LOB
            const selectedLOB = this.lobSelect?.value || lob;
            if (this.downloadComplete) {
                this.downloadComplete.href = `/api/download-reports/${this.sessionId}?lob=${selectedLOB}`;
                console.log(`📦 ✅ Download URL set: /api/download-reports/${this.sessionId}?lob=${selectedLOB}`);
                
                // 🎯 Add visual feedback - make button more visible
                this.downloadComplete.style.background = '#28a745';
                this.downloadComplete.style.color = 'white';
                this.downloadComplete.style.padding = '10px 20px';
                this.downloadComplete.style.borderRadius = '5px';
                this.downloadComplete.style.textDecoration = 'none';
                this.downloadComplete.style.display = 'inline-block';
                this.downloadComplete.style.fontWeight = 'bold';
                
            } else {
                console.error(`❌ 🚨 downloadComplete element NOT FOUND!`);
                console.log(`📦 🔍 All available elements with 'download' in ID:`, 
                    Array.from(document.querySelectorAll('[id*="download"]')).map(el => el.id));
            }
            
            // 🎯 FORCE scroll and highlight
            setTimeout(() => {
                console.log(`📦 🎯 FORCE scrolling to results section...`);
                this.resultsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // 🎯 Add visual flash to make it obvious
                this.resultsSection.style.border = '3px solid #28a745';
                setTimeout(() => {
                    if (this.resultsSection) {
                        this.resultsSection.style.border = '';
                    }
                }, 3000);
                
            }, 200);
            
        } else {
            console.error(`❌ 🚨 CRITICAL: resultsSection element NOT FOUND!`);
            console.log(`📦 🔍 All available elements with 'result' in ID:`, 
                Array.from(document.querySelectorAll('[id*="result"]')).map(el => el.id));
            console.log(`📦 🔍 All available elements with 'download' in ID:`, 
                Array.from(document.querySelectorAll('[id*="download"]')).map(el => el.id));
            
            // 🚨 EMERGENCY: Create the section if it doesn't exist
            console.log(`🚨 🆘 EMERGENCY: Creating download section dynamically...`);
            this.createDownloadSectionDynamically(lob);
        }
    }
    
    // 🆘 EMERGENCY: Create download section if it doesn't exist
    createDownloadSectionDynamically(lob) {
        console.log(`🆘 Creating download section dynamically for LOB: ${lob}`);
        
        // Find a good place to insert it (after form or status)
        const insertAfter = document.getElementById('status') || 
                           document.getElementById('testForm') || 
                           document.querySelector('.container');
        
        if (!insertAfter) {
            console.error(`🚨 Cannot find insertion point for download section!`);
            return;
        }
        
        // Create the download section
        const resultsSection = document.createElement('div');
        resultsSection.id = 'resultsSection';
        resultsSection.style.cssText = `
            display: block !important;
            background: #d4edda;
            border: 2px solid #28a745;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        `;
        
        const selectedLOB = this.lobSelect?.value || lob;
        resultsSection.innerHTML = `
            <h3 style="color: #28a745; margin: 0 0 15px 0;">✅ Test Completed Successfully!</h3>
            <p style="margin: 10px 0;">Your test results are ready for download.</p>
            <a id="downloadComplete" 
               href="/api/download-reports/${this.sessionId}?lob=${selectedLOB}"
               style="background: #28a745; color: white; padding: 12px 24px; 
                      border-radius: 6px; text-decoration: none; display: inline-block;
                      font-weight: bold; margin: 10px;">
                📦 Download Complete Reports for ${selectedLOB}
            </a>
        `;
        
        // Insert after the target element
        insertAfter.parentNode.insertBefore(resultsSection, insertAfter.nextSibling);
        
        // Update references
        this.resultsSection = resultsSection;
        this.downloadComplete = document.getElementById('downloadComplete');
        
        // Scroll to it
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        console.log(`🆘 ✅ Dynamic download section created and displayed!`);
    }
      // Hide download section
    hideDownloadSection() {
        console.log('📦 Hiding download section');
        if (this.resultsSection) {
            this.resultsSection.style.display = 'none';
        }
    }

    // Helper method to escape HTML for safe insertion
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    
    // ...existing code...
    // Handle test completion in integrated terminal
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing AMOD Test Runner with Integrated Terminal...');
    window.testRunner = new TestRunner();
    
    // 🎯 DEBUG: Add test button for download section (only in debug mode)
    if (window.location.hash === '#debug' || window.location.search.includes('debug=1')) {
        setTimeout(() => {
            const debugBtn = document.createElement('button');
            debugBtn.textContent = '🔧 Test Download Section';
            debugBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px; border-radius: 5px; border: none; cursor: pointer;';
            debugBtn.onclick = () => {
                console.log('🔧 DEBUG: Testing download section...');
                window.testRunner.sessionId = 'debug-session-123';
                window.testRunner.showDownloadSection('TEST_LOB');
            };
            document.body.appendChild(debugBtn);
            console.log('🔧 DEBUG: Debug button added. Test download section is available.');
        }, 1000);
    }
});

// Prevent page reload during tests
window.addEventListener('beforeunload', (e) => {
    const runButton = document.getElementById('runButton');
    if (runButton && runButton.disabled) {
        e.preventDefault();
        e.returnValue = 'Tests are currently running. Are you sure you want to leave?';
    }
});
window.addEventListener('pageshow', (event) => {

    if (event.persisted && window.testRunner && window.testRunner.sessionId) {

        console.log('BFCache restore detected');
        window.testRunner.syncSessionState();
    }
});
document.addEventListener('visibilitychange', async () => {

    if (document.visibilityState === 'visible' && window.testRunner) {
        await window.testRunner.syncSessionState();
    }
});
