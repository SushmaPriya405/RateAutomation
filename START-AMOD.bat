@echo off
title AMOD Automation Server
color 0A

echo.
echo ████████████████████████████████████████████████████████████████
echo █                                                              █
echo █              🚀 AMOD AUTOMATION STARTING 🚀                 █
echo █                  Complete Package Ready                     █
echo █                                                              █
echo ████████████████████████████████████████████████████████████████
echo.

echo ⚡ Starting AMOD Automation Server...
echo 🌐 Web Interface will open at: http://localhost:3003
echo 📱 Please wait while server initializes...
echo.

:: Wait a moment then open browser
:: timeout /t 3 /nobreak >nul
:: echo 🚀 Opening web interface in browser...
:: start http://localhost:3003

echo.
echo 📊 Server Console Output:
echo ════════════════════════════════════════════════════════════════
echo.

:: Start the AMOD server using launcher (proper way)
node launcher.js

echo.
echo ⚠️ Server stopped. Press any key to exit...
pause >nul
