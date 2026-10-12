// INTEGRATED TERMINAL APPROACH - Show terminal-like interface in UI itself
class TestRunner {
    constructor() {
        this.uploadedFileName = null;
        this.isWaitingForRestart = false;
        this.sessionId = null;
        this.initializeElements();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.initializeSession();
        this.filterLOBsByEnvironment();
    }

    // Initialize integrated terminal interface for better UX
    initializeIntegratedTerminal() {
        // Check if terminal already initialized
        if (this.statusSection.querySelector('.terminal-container')) {
            return;
        }
        
        console.log('🖥️ Initializing integrated terminal interface...');
        
        // Create terminal-like interface in status section
        this.statusSection.innerHTML = `
            <div class="terminal-container">
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
        
        // Add terminal styling
        this.addTerminalCSS();
        
        console.log('✅ Integrated terminal initialized successfully');
    }

    // Add CSS for terminal-like appearance  
    addTerminalCSS() {
        if (document.getElementById('terminal-css')) return;
        
        const style = document.createElement('style');
        style.id = 'terminal-css';
        style.textContent = `
            .terminal-container {
                background: #0c0c0c;
                color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                margin: 16px 0;
                border: 1px solid #333;
            }
            
            .terminal-header {
                background: linear-gradient(135deg, #1e1e1e, #2d2d2d);
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #444;
            }
            
            .terminal-title {
                font-weight: bold;
                color: #00d4ff;
                font-size: 14px;
            }
            
            .terminal-controls {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .terminal-btn {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: all 0.2s;
                font-family: inherit;
            }
            
            .abort-btn {
                background: #ff3d71;
                color: white;
            }
            
            .abort-btn:hover {
                background: #ff1744;
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(255, 61, 113, 0.4);
            }
            
            .abort-btn:active {
                transform: scale(0.98);
            }
            
            .terminal-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .terminal-status.ready {
                background: #2e7d32;
                color: white;
            }
            
            .terminal-status.running {
                background: #ff6f00;
                color: white;
                animation: pulse 1.5s infinite;
            }
            
            .terminal-status.aborted {
                background: #d32f2f;
                color: white;
            }
            
            .terminal-status.completed {
                background: #388e3c;
                color: white;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            
            .terminal-log {
                height: 350px;
                max-height: 350px;
                overflow-y: auto;
                padding: 16px;
                background: #0c0c0c;
                font-size: 13px;
                line-height: 1.4;
                border-bottom: 1px solid #333;
            }
            
            .log-line {
                margin-bottom: 4px;
                word-wrap: break-word;
                display: flex;
                align-items: flex-start;
                gap: 8px;
            }
            
            .log-line.welcome .log-text {
                color: #4caf50;
            }
            
            .log-line.error .log-text {
                color: #ff5252;
            }
            
            .log-line.success .log-text {
                color: #4caf50;
            }
            
            .log-line.warning .log-text {
                color: #ff9800;
            }
            
            .log-line.info .log-text {
                color: #2196f3;
            }
            
            .log-timestamp {
                color: #666;
                font-size: 11px;
                min-width: 80px;
                flex-shrink: 0;
            }
            
            .log-text {
                color: #e0e0e0;
                flex-grow: 1;
            }
            
            .terminal-footer {
                background: linear-gradient(135deg, #1e1e1e, #2d2d2d);
                padding: 16px;
                border-top: 1px solid #444;
            }
            
            .download-section {
                margin-bottom: 12px;
            }
            
            .download-section .download-btn {
                background: #4caf50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.2s;
                margin-right: 10px;
            }
            
            .download-section .download-btn:hover {
                background: #45a049;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }
            
            .download-section .download-btn.preparing {
                background: #ff9800;
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .action-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .action-btn {
                background: #2196f3;
                color: white;
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: all 0.2s;
            }
            
            .action-btn:hover {
                background: #1976d2;
                transform: translateY(-1px);
            }
            
            .terminal-log::-webkit-scrollbar {
                width: 8px;
            }
            
            .terminal-log::-webkit-scrollbar-track {
                background: #1e1e1e;
            }
            
            .terminal-log::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 4px;
            }
            
            .terminal-log::-webkit-scrollbar-thumb:hover {
                background: #777;
            }
        `;
        document.head.appendChild(style);
    }

    // Update terminal with real-time test output
    updateTestProgress(data) {
        console.log('📊 Terminal: Updating test progress:', data.lob);
        
        // Initialize terminal if not done
        this.initializeIntegratedTerminal();
        this.statusSection.style.display = 'block';
        
        // Update terminal header status
        const terminalStatus = this.statusSection.querySelector('.terminal-status');
        const abortBtn = this.statusSection.querySelector('#terminalAbort');
        
        if (terminalStatus) {
            terminalStatus.textContent = '🔴 RUNNING';
            terminalStatus.className = 'terminal-status running';
        }
        
        if (abortBtn) {
            abortBtn.style.display = 'inline-block';
        }
        
        // Add real-time output to terminal log
        const terminalLog = this.statusSection.querySelector('.terminal-log');
        if (terminalLog && data.output) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-line info';
            logEntry.innerHTML = `
                <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span> 
                <span class="log-text">${this.escapeHtml(data.output.trim())}</span>
            `;
            terminalLog.appendChild(logEntry);
            
            // Auto-scroll to bottom for terminal feel
            terminalLog.scrollTop = terminalLog.scrollHeight;
            
            // Limit terminal output lines for performance (keep last 150 lines)
            const maxLines = 150;
            while (terminalLog.children.length > maxLines) {
                terminalLog.removeChild(terminalLog.firstChild);
            }
        }
    }

    // Handle test completion in integrated terminal
    handleTestCompletion(data) {
        console.log('✅ Terminal: Test completed:', data.lob);
        
        const terminalLog = this.statusSection.querySelector('.terminal-log');
        const terminalStatus = this.statusSection.querySelector('.terminal-status');
        const terminalFooter = this.statusSection.querySelector('.terminal-footer');
        const abortBtn = this.statusSection.querySelector('#terminalAbort');
        
        // Update terminal status
        if (terminalStatus) {
            terminalStatus.textContent = '🟢 COMPLETED';
            terminalStatus.className = 'terminal-status completed';
        }
        
        // Hide abort button
        if (abortBtn) {
            abortBtn.style.display = 'none';
        }
        
        // Add completion message to terminal
        if (terminalLog) {
            const completionMsg = document.createElement('div');
            completionMsg.className = 'log-line success';
            completionMsg.innerHTML = `
                <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                <span class="log-text">✅ ${data.lob} tests completed ${data.success ? 'successfully' : 'with issues'}!</span>
            `;
            terminalLog.appendChild(completionMsg);
            terminalLog.scrollTop = terminalLog.scrollHeight;
        }
        
        // Show download section in terminal footer
        if (terminalFooter) {
            this.showIntegratedDownloadSection(data, terminalFooter);
        }
    }

    // Handle test abort in integrated terminal - OPTIMIZED FOR 30 SECONDS
    handleTestAborted(data) {
        console.log('🛑 Terminal: Test aborted:', data);
        
        const terminalLog = this.statusSection.querySelector('.terminal-log');
        const terminalStatus = this.statusSection.querySelector('.terminal-status');
        const terminalFooter = this.statusSection.querySelector('.terminal-footer');
        const abortBtn = this.statusSection.querySelector('#terminalAbort');
        
        // Update terminal status
        if (terminalStatus) {
            terminalStatus.textContent = '🔴 ABORTED';
            terminalStatus.className = 'terminal-status aborted';
        }
        
        // Hide abort button
        if (abortBtn) {
            abortBtn.style.display = 'none';
        }
        
        // Reset UI state
        this.runButton.disabled = false;
        this.abortButton.style.display = 'none';
        this.progressBar.style.display = 'none';
        
        const selectedLOB = this.lobSelect.value || data.lob || 'Unknown';
        
        // Add abort message to terminal
        if (terminalLog) {
            const abortMsg = document.createElement('div');
            abortMsg.className = 'log-line warning';
            abortMsg.innerHTML = `
                <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                <span class="log-text">🛑 Tests aborted by user! Preparing partial results...</span>
            `;
            terminalLog.appendChild(abortMsg);
            terminalLog.scrollTop = terminalLog.scrollHeight;
        }
        
        // Show immediate download preparation in terminal footer
        if (terminalFooter) {
            this.showIntegratedAbortDownloadSection(selectedLOB, terminalFooter, terminalLog);
        }
    }

    // Show integrated download section after test completion
    showIntegratedDownloadSection(data, terminalFooter) {
        terminalFooter.style.display = 'block';
        
        const downloadSection = terminalFooter.querySelector('.download-section');
        downloadSection.innerHTML = `
            <div style="margin-bottom: 12px;">
                <strong style="color: #4caf50;">📦 Download Complete Reports</strong>
            </div>
            <button class="download-btn" onclick="testRunner.downloadFile('/api/results/${this.sessionId}/${data.lob}/complete', '${data.lob}-complete-reports.zip')">
                📥 Download ${data.lob} Reports (ZIP)
            </button>
        `;
        
        const actionButtons = terminalFooter.querySelector('.action-buttons');
        actionButtons.innerHTML = `
            <button class="action-btn" onclick="window.location.reload()">
                🔄 Ready for Next Upload
            </button>
        `;
        
        // Auto-refresh after 25 seconds
        let countdown = 25;
        const countdownInterval = setInterval(() => {
            countdown--;
            actionButtons.querySelector('.action-btn').textContent = `🔄 Auto-refresh in ${countdown}s`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.reload();
            }
        }, 1000);
    }

    // Show integrated download section after test abort - 30 SECOND OPTIMIZATION
    showIntegratedAbortDownloadSection(selectedLOB, terminalFooter, terminalLog) {
        terminalFooter.style.display = 'block';
        
        const downloadSection = terminalFooter.querySelector('.download-section');
        downloadSection.innerHTML = `
            <div style="margin-bottom: 12px;">
                <strong style="color: #ff9800;">⏳ Preparing Partial Reports</strong>
            </div>
            <button class="download-btn preparing" disabled>
                ⏳ Report will be ready in 30s...
            </button>
        `;
        
        // 30-second countdown with terminal updates
        let countdown = 30;
        const countdownInterval = setInterval(() => {
            countdown--;
            
            // Update terminal log
            if (terminalLog && countdown % 5 === 0) { // Update every 5 seconds
                const progressMsg = document.createElement('div');
                progressMsg.className = 'log-line info';
                progressMsg.innerHTML = `
                    <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                    <span class="log-text">⏱️ Report preparation: ${countdown} seconds remaining...</span>
                `;
                terminalLog.appendChild(progressMsg);
                terminalLog.scrollTop = terminalLog.scrollHeight;
            }
            
            // Update download button
            const downloadBtn = downloadSection.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.textContent = `⏳ Report ready in ${countdown}s...`;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                
                // Enable download after 30 seconds
                downloadSection.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <strong style="color: #4caf50;">✅ Partial Reports Ready!</strong>
                    </div>
                    <button class="download-btn" onclick="testRunner.downloadFile('/api/results/${this.sessionId}/${selectedLOB}/complete', '${selectedLOB}-partial-reports.zip')">
                        📥 Download ${selectedLOB} Partial Reports
                    </button>
                `;
                
                // Add completion message to terminal
                const readyMsg = document.createElement('div');
                readyMsg.className = 'log-line success';
                readyMsg.innerHTML = `
                    <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                    <span class="log-text">✅ Partial reports ready for download!</span>
                `;
                terminalLog.appendChild(readyMsg);
                terminalLog.scrollTop = terminalLog.scrollHeight;
                
                // Auto-refresh after another 60 seconds
                const actionButtons = terminalFooter.querySelector('.action-buttons');
                actionButtons.innerHTML = `
                    <button class="action-btn" onclick="window.location.reload()">
                        🔄 Ready for Next Upload (Auto-refresh in 60s)
                    </button>
                `;
                
                setTimeout(() => {
                    window.location.reload();
                }, 60000);
            }
        }, 1000);
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize terminal when starting tests
    async runTests() {
        try {
            // Initialize integrated terminal first
            this.initializeIntegratedTerminal();
            this.statusSection.style.display = 'block';
            
            // Update terminal status
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
                    <span class="log-text">🚀 Starting test execution...</span>
                `;
                terminalLog.appendChild(startMsg);
                terminalLog.scrollTop = terminalLog.scrollHeight;
            }
            
            this.showStatus('running', '🚀 Initializing test execution...');
            this.progressBar.style.display = 'block';
            this.runButton.disabled = true;
            this.abortButton.style.display = 'block';
            
            const selectedLOB = this.lobSelect.value;
            const selectedEnv = this.envSelect.value;
            const file = this.fileInput.files[0];

            // Continue with existing test execution logic...
            this.updateProgress(20, '📤 Uploading Excel file...');
            await this.uploadFile(file);

            this.updateProgress(40, '🔍 Processing Excel data...');
            await this.delay(1000);

            this.updateProgress(60, `⚙️ Setting up ${this.getEnvDisplayName(selectedEnv)} environment...`);
            await this.delay(1000);

            this.updateProgress(80, `🧪 Running ${this.getLOBDisplayName(selectedLOB)} tests...`);
            const result = await this.executePlaywrightTests(selectedLOB, selectedEnv);

            this.updateProgress(100, '✅ Tests completed successfully!');
            await this.delay(500);

            this.showStatus('success', `🎉 ${this.getLOBDisplayName(selectedLOB)} tests completed successfully!`);

        } catch (error) {
            console.error('Test execution failed:', error);
            this.showStatus('error', `❌ Test execution failed: ${error.message}`);
        } finally {
            this.runButton.disabled = false;
            this.abortButton.style.display = 'none';
            this.progressBar.style.display = 'none';
        }
    }

    // ... (rest of the existing methods remain the same)
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing AMOD Test Runner with Integrated Terminal...');
    window.testRunner = new TestRunner();
});
