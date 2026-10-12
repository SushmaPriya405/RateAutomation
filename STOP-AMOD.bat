@echo off
title Stop AMOD Automation - Manual Team
color 0C

echo.
echo ████████████████████████████████████████████████████████
echo █                                                      █
echo █              🛑 STOPPING AMOD AUTOMATION 🛑         █
echo █                   For Manual Testing Team           █
echo █                                                      █
echo ████████████████████████████████████████████████████████
echo.

echo ⚡ Gracefully stopping AMOD server processes...
echo.

:: Kill specific AMOD processes
echo 🔄 Stopping Node.js server...
taskkill /f /im node.exe /fi "WINDOWTITLE eq AMOD*" 2>nul
taskkill /f /im app.js 2>nul
taskkill /f /im server.js 2>nul

:: Additional cleanup for any remaining processes
taskkill /f /im node.exe 2>nul

echo.
echo ✅ AMOD server stopped successfully
echo 🌐 Web interface is now offline
echo 📱 You can close browser windows manually if needed
echo.
echo 💡 **To restart AMOD**: Double-click START-AMOD.bat
echo 📋 **For issues**: Run REQUIREMENTS-CHECK.bat
echo.
timeout /t 5 /nobreak >nul
