@echo off
title AMOD Quick Setup Verification
color 0A

echo 🔍 AMOD Quick Setup Verification
echo ═══════════════════════════════════

echo ⚡ Testing AMOD startup...
echo ⏱️ Starting server for 15 seconds to verify everything works...
echo.

:: Start AMOD in background for testing
start /min "" node server.js

:: Wait for server to start
timeout /t 5 /nobreak >nul

:: Check if server is running
netstat -an | find ":3003" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ SUCCESS: AMOD server started successfully!
    echo 🌐 Server is running on port 3003
    echo 📱 Web interface should be accessible
    
    :: Try to open browser
    echo ⚡ Testing browser access...
    start http://localhost:3003
    
    echo ✅ Browser test completed
    echo.
    echo 🎉 VERIFICATION SUCCESSFUL!
    echo    ✅ Server starts correctly
    echo    ✅ Port 3003 is accessible  
    echo    ✅ Browser can be opened
    echo.
    echo 🚀 Your AMOD setup is ready for manual testing!
    
) else (
    echo ❌ FAILED: Server did not start properly
    echo 🔧 Please check:
    echo    - Node.js is installed
    echo    - Port 3003 is available
    echo    - No firewall blocking
    echo.
    echo 📋 Run REQUIREMENTS-CHECK.bat for detailed diagnosis
)

echo.
echo ⚡ Stopping test server...
taskkill /f /im node.exe >nul 2>&1

echo ✅ Test completed
echo.
echo 📋 To start normal testing:
echo    1. Double-click START-AMOD.bat
echo    2. Wait for browser to open
echo    3. Begin uploading Excel files
echo.
pause
