// Standalone AMOD Automation Launcher
const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 AMOD Automation - Standalone Launcher');
console.log('=' .repeat(50));

// Start the server
console.log('📡 Starting server...');
const serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
    stdio: 'inherit'
});

// Wait for server to start, then open browser
setTimeout(() => {
    console.log('🌐 Opening browser...');
    const url = 'http://localhost:3003';
    
    // Open in default browser
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    exec(`${start} ${url}`, (error) => {
        if (error) {
            console.log(`✅ Server running at: ${url}`);
            console.log('💡 Please open this URL manually in your browser');
        }
    });
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down AMOD Automation...');
    serverProcess.kill();
    process.exit(0);
});
