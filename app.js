#!/usr/bin/env node

// AMOD Automation Desktop App
// This wrapper starts the server and opens the UI

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const net = require('net');

console.log('🚀 Starting AMOD Automation Tool...');

// Function to find available port
function findAvailablePort(startPort = 3003) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, (err) => {
      if (err) {
        server.listen(0, () => {
          const port = server.address().port;
          server.close(() => resolve(port));
        });
      } else {
        const port = server.address().port;
        server.close(() => resolve(port));
      }
    });
  });
}

// Function to get local IP
function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function startApp() {
  // Get available port and IP
  const port = await findAvailablePort(3003);
  const ip = getLocalIP();
  
  console.log(`🌐 Starting server on ${ip}:${port}...`);
  
  // Start the server with dynamic port
  const serverPath = path.join(__dirname, 'server.js');
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    detached: false,
    env: { ...process.env, PORT: port }
  });

  console.log(`✅ Server started on http://${ip}:${port}`);
  console.log('🌐 Opening web interface...');
  
  // Wait a moment for server to start
  setTimeout(() => {
    // Open the web interface in default browser
    const url = `http://${ip}:${port}`;
    const platform = os.platform();
    
    let cmd;
    if (platform === 'win32') {
      cmd = spawn('cmd', ['/c', 'start', url]);
    } else if (platform === 'darwin') {
      cmd = spawn('open', [url]);
    } else {
      cmd = spawn('xdg-open', [url]);
    }
    
    console.log('🎯 AMOD Automation Tool is ready!');
    console.log('📱 Web interface opened in your browser');
    console.log(`🔗 URL: http://${ip}:${port}`);
    console.log('');
    console.log('Press Ctrl+C to stop the application');
  }, 3000);

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping AMOD Automation Tool...');
    server.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping AMOD Automation Tool...');
    server.kill();
    process.exit(0);
  });

  // Keep the process alive
  server.on('exit', (code) => {
    console.log(`\n❌ Server exited with code ${code}`);
    process.exit(code);
  });
}

// Start the application
startApp().catch(console.error);
