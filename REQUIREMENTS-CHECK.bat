@echo off
title AMOD Requirements Checker for Manual Testing Team
color 0E
mode con: cols=100 lines=35

echo.
echo ████████████████████████████████████████████████████████████████████████████████████████████████
echo █                                                                                                █
echo █                     🔍 AMOD REQUIREMENTS CHECKER FOR MANUAL TEAM 🔍                         █
echo █                          Check if your laptop is ready for AMOD                               █
echo █                                                                                                █
echo ████████████████████████████████████████████████████████████████████████████████████████████████
echo.

set ERRORS_FOUND=0
set WARNINGS_FOUND=0
set AUTO_INSTALL=0

echo 📋 **CHECKING MANUAL TESTING LAPTOP REQUIREMENTS**
echo ══════════════════════════════════════════════════════════════════════════════════════════════
echo.

echo ┌──────────────────────────────────────────────────────────────────────────────────────────┐
echo │                               🔧 ESSENTIAL SOFTWARE CHECK                               │
echo └──────────────────────────────────────────────────────────────────────────────────────────┘
echo.

:: Check 1: Node.js with AUTO-INSTALLATION
echo ⚡ Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js: INSTALLED
    for /f "tokens=*" %%i in ('node --version') do echo    📦 Version: %%i
    
    :: Check Node.js version (should be 18+)
    for /f "tokens=1 delims=v." %%i in ('node --version') do (
        if %%i LSS 18 (
            echo    ⚠️  WARNING: Node.js version is old. Recommended: v18+ 
            echo    🔄 Do you want to auto-install latest Node.js? ^(Y/N^)
            set /p UPGRADE_NODE=
            if /i "%UPGRADE_NODE%" == "Y" (
                call :INSTALL_NODEJS
            ) else (
                set /a WARNINGS_FOUND+=1
            )
        ) else (
            echo    ✅ Version is compatible
        )
    )
) else (
    echo ❌ Node.js: NOT INSTALLED
    echo    🔗 Node.js is required for AMOD to work
    echo.
    echo 🤖 **AUTO-INSTALLATION AVAILABLE!**
    echo    ✅ We can automatically install Node.js for you
    echo    🔄 Do you want to auto-install Node.js now? ^(Y/N^)
    set /p INSTALL_NODE=
    if /i "%INSTALL_NODE%" == "Y" (
        call :INSTALL_NODEJS
    ) else (
        echo    📋 Manual installation required: https://nodejs.org/
        set /a ERRORS_FOUND+=1
    )
)

:: Check 2: NPM
echo.
echo ⚡ Checking NPM (Node Package Manager)...
npm --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ NPM: INSTALLED
    for /f "tokens=*" %%i in ('npm --version') do echo    📦 Version: %%i
) else (
    echo ❌ NPM: NOT INSTALLED ^(Usually comes with Node.js^)
    if %AUTO_INSTALL% == 0 (
        set /a ERRORS_FOUND+=1
    )
)

:: Check 3: Chrome Browser with AUTO-INSTALLATION
echo.
echo ⚡ Checking Chrome Browser...
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Google Chrome: INSTALLED
) else (
    echo ❌ Google Chrome: NOT FOUND
    echo    🔗 Chrome is required for automation testing
    echo.
    echo 🤖 **AUTO-INSTALLATION AVAILABLE!**
    echo    ✅ We can automatically install Chrome for you
    echo    🔄 Do you want to auto-install Chrome now? ^(Y/N^)
    set /p INSTALL_CHROME=
    if /i "%INSTALL_CHROME%" == "Y" (
        call :INSTALL_CHROME
    ) else (
        echo    📋 Manual installation required: https://www.google.com/chrome/
        set /a ERRORS_FOUND+=1
    )
)

:: Check 4: Edge Browser (Alternative)
echo.
echo ⚡ Checking Microsoft Edge Browser...
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Microsoft Edge: INSTALLED ^(Good alternative^)
) else (
    echo ⚠️  Microsoft Edge: NOT FOUND ^(Optional^)
)

echo.
echo ┌──────────────────────────────────────────────────────────────────────────────────────────┐
echo │                                🔒 SYSTEM & SECURITY CHECK                               │
echo └──────────────────────────────────────────────────────────────────────────────────────────┘
echo.

:: Check 5: Windows Version
echo ⚡ Checking Windows Version...
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo ✅ Windows Version: %VERSION%
if "%VERSION%" == "10.0" (
    echo    ✅ Compatible with AMOD
) else (
    echo    ⚠️  Warning: Untested on this Windows version
    set /a WARNINGS_FOUND+=1
)

:: Check 6: Architecture
echo.
echo ⚡ Checking System Architecture...
if "%PROCESSOR_ARCHITECTURE%" == "AMD64" (
    echo ✅ Architecture: 64-bit ^(Compatible^)
) else (
    echo ❌ Architecture: %PROCESSOR_ARCHITECTURE% ^(32-bit not supported^)
    set /a ERRORS_FOUND+=1
)

:: Check 7: Available RAM
echo.
echo ⚡ Checking Available Memory...
for /f "skip=1" %%i in ('wmic computersystem get TotalPhysicalMemory') do (
    if not "%%i" == "" (
        set /a RAM_GB=%%i/1073741824
        goto :ram_checked
    )
)
:ram_checked
if %RAM_GB% GEQ 8 (
    echo ✅ RAM: %RAM_GB%GB ^(Excellent^)
) else if %RAM_GB% GEQ 4 (
    echo ⚠️  RAM: %RAM_GB%GB ^(Minimum requirement met^)
    set /a WARNINGS_FOUND+=1
) else (
    echo ❌ RAM: %RAM_GB%GB ^(Insufficient, need 4GB minimum^)
    set /a ERRORS_FOUND+=1
)

:: Check 8: Available Disk Space
echo.
echo ⚡ Checking Available Disk Space...
for /f "tokens=3" %%i in ('dir /-c ^| find "bytes free"') do set FREE_SPACE=%%i
set /a FREE_SPACE_GB=%FREE_SPACE:~0,-10%/1073741824
if %FREE_SPACE_GB% GEQ 5 (
    echo ✅ Free Space: %FREE_SPACE_GB%GB ^(Sufficient^)
) else if %FREE_SPACE_GB% GEQ 2 (
    echo ⚠️  Free Space: %FREE_SPACE_GB%GB ^(Minimum requirement^)
    set /a WARNINGS_FOUND+=1
) else (
    echo ❌ Free Space: %FREE_SPACE_GB%GB ^(Need 2GB minimum^)
    set /a ERRORS_FOUND+=1
)

:: Check 9: Port 3003 availability
echo.
echo ⚡ Checking Port 3003 availability...
netstat -an | find ":3003" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠️  Port 3003: IN USE ^(May need to close other applications^)
    set /a WARNINGS_FOUND+=1
) else (
    echo ✅ Port 3003: AVAILABLE
)

echo.
echo ┌──────────────────────────────────────────────────────────────────────────────────────────┐
echo │                                📁 AMOD PACKAGE CHECK                                    │
echo └──────────────────────────────────────────────────────────────────────────────────────────┘
echo.

:: Check 10: AMOD files
echo ⚡ Checking AMOD Package Files...
if exist "app.js" (
    echo ✅ app.js: FOUND
) else (
    echo ❌ app.js: MISSING ^(Core AMOD file^)
    set /a ERRORS_FOUND+=1
)

if exist "server.js" (
    echo ✅ server.js: FOUND
) else (
    echo ❌ server.js: MISSING ^(Core AMOD file^)
    set /a ERRORS_FOUND+=1
)

if exist "package.json" (
    echo ✅ package.json: FOUND
) else (
    echo ❌ package.json: MISSING ^(Configuration file^)
    set /a ERRORS_FOUND+=1
)

if exist "web-interface" (
    echo ✅ web-interface: FOUND
) else (
    echo ❌ web-interface: MISSING ^(Web UI folder^)
    set /a ERRORS_FOUND+=1
)

if exist "START-AMOD.bat" (
    echo ✅ START-AMOD.bat: FOUND
) else (
    echo ⚠️  START-AMOD.bat: MISSING ^(Startup script^)
    set /a WARNINGS_FOUND+=1
)

echo.
echo ┌──────────────────────────────────────────────────────────────────────────────────────────┐
echo │                                📊 FINAL ASSESSMENT                                      │
echo └──────────────────────────────────────────────────────────────────────────────────────────┘
echo.

if %ERRORS_FOUND% == 0 (
    if %WARNINGS_FOUND% == 0 (
        echo ████████████████████████████████████████████████████████████████████████████████████████
        echo █                                                                                      █
        echo █                        ✅ LAPTOP FULLY READY FOR AMOD! ✅                          █
        echo █                           No issues found - Ready to test!                          █
        echo █                                                                                      █
        echo ████████████████████████████████████████████████████████████████████████████████████████
        echo.
        echo 🎉 **PERFECT!** Your laptop meets all requirements for AMOD automation testing.
        echo.
        echo 🚀 **Next Steps:**
        echo    1. Double-click START-AMOD.bat to start testing
        echo    2. Browser will open automatically at http://localhost:3003
        echo    3. Upload Excel files and start automation testing
    ) else (
        echo ████████████████████████████████████████████████████████████████████████████████████████
        echo █                                                                                      █
        echo █                    ✅ LAPTOP READY WITH MINOR WARNINGS ⚠️                         █
        echo █                        Should work fine for testing                                 █
        echo █                                                                                      █
        echo ████████████████████████████████████████████████████████████████████████████████████████
        echo.
        echo 🟡 **GOOD!** Your laptop is ready with %WARNINGS_FOUND% minor warnings.
        echo.
        echo 🚀 **You can proceed with testing** - warnings are not critical.
    )
) else (
    echo ████████████████████████████████████████████████████████████████████████████████████████
    echo █                                                                                      █
    echo █                        ❌ LAPTOP NOT READY FOR AMOD ❌                             █
    echo █                         %ERRORS_FOUND% critical issues found                                   █
    echo █                                                                                      █
    echo ████████████████████████████████████████████████████████████████████████████████████████
    echo.
    echo 🔴 **ISSUES FOUND!** %ERRORS_FOUND% critical problems need to be fixed before testing.
    echo.
    echo 🔧 **Required Actions:**
)

if %ERRORS_FOUND% GTR 0 (
    echo.
    echo 📋 **TO FIX ISSUES:**
    echo.
    node --version >nul 2>&1 || echo    🔗 Install Node.js: https://nodejs.org/
    reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1 || echo    🔗 Install Chrome: https://www.google.com/chrome/
    echo    🔧 Follow INSTALL-GUIDE.md for detailed instructions
    echo    📞 Contact IT support if needed
    echo.
    echo 🔄 **After installing missing software:**
    echo    1. Restart computer
    echo    2. Run this checker again
    echo    3. Proceed with AMOD testing when all green ✅
)

echo.
echo 📋 **SUMMARY:**
echo    🔴 Critical Issues: %ERRORS_FOUND%
echo    🟡 Warnings: %WARNINGS_FOUND%
echo    📁 AMOD Package: Ready
echo.

if %ERRORS_FOUND% == 0 (
    echo 📞 **Support:** If you face any issues during testing, contact automation team.
    echo 📖 **Documentation:** See INSTALL-GUIDE.md for detailed setup instructions.
    echo.
    echo 🚀 **Starting AMOD now...**
    timeout /t 3 >nul
    call START-AMOD.bat
) else (
    echo 📞 **Support:** Contact IT support for software installation help.
    echo 📖 **Documentation:** See INSTALL-GUIDE.md for step-by-step installation guide.
    echo.
    echo Press any key to exit...
    pause >nul
)

echo.
echo ══════════════════════════════════════════════════════════════════════════════════════════════
echo 🔍 **Requirements check completed** - %date% %time%
echo ══════════════════════════════════════════════════════════════════════════════════════════════
goto :END

:: ===== AUTO-INSTALLATION FUNCTIONS =====

:INSTALL_NODEJS
echo.
echo ████████████████████████████████████████████████████████████████████████████████████████████████
echo █                                                                                                █
echo █                          🤖 AUTO-INSTALLING NODE.JS 🤖                                       █
echo █                                                                                                █
echo ████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo 🔄 Downloading Node.js LTS version...
echo    📦 This may take 2-5 minutes depending on your internet speed
echo.

:: Create temp directory
if not exist "%TEMP%\AMOD_Install" mkdir "%TEMP%\AMOD_Install"
cd /d "%TEMP%\AMOD_Install"

:: Download Node.js using PowerShell (works on Windows 10+)
echo 📥 Downloading Node.js installer...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'nodejs.msi'}"

if exist "nodejs.msi" (
    echo ✅ Download completed successfully!
    echo 🔧 Installing Node.js... ^(This may take 2-3 minutes^)
    echo    📋 Please click 'Next' and 'Install' when installer opens
    echo.
    
    :: Install Node.js silently
    msiexec /i nodejs.msi /quiet /norestart
    
    echo ⏳ Waiting for installation to complete...
    timeout /t 30 >nul
    
    :: Check if installation was successful
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Node.js installed successfully!
        for /f "tokens=*" %%i in ('node --version') do echo    📦 Installed Version: %%i
        set AUTO_INSTALL=1
    ) else (
        echo ❌ Installation failed. Please install manually from: https://nodejs.org/
        set /a ERRORS_FOUND+=1
    )
) else (
    echo ❌ Download failed. Please check internet connection and install manually.
    echo    🔗 Manual download: https://nodejs.org/
    set /a ERRORS_FOUND+=1
)

:: Cleanup
cd /d "%~dp0"
rd /s /q "%TEMP%\AMOD_Install" 2>nul
goto :eof

:INSTALL_CHROME
echo.
echo ████████████████████████████████████████████████████████████████████████████████████████████████
echo █                                                                                                █
echo █                         🤖 AUTO-INSTALLING CHROME 🤖                                         █
echo █                                                                                                █
echo ████████████████████████████████████████████████████████████████████████████████████████████████
echo.
echo 🔄 Downloading Google Chrome...
echo    📦 This may take 1-3 minutes depending on your internet speed
echo.

:: Create temp directory
if not exist "%TEMP%\AMOD_Install" mkdir "%TEMP%\AMOD_Install"
cd /d "%TEMP%\AMOD_Install"

:: Download Chrome using PowerShell
echo 📥 Downloading Chrome installer...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://dl.google.com/chrome/install/latest/chrome_installer.exe' -OutFile 'chrome_installer.exe'}"

if exist "chrome_installer.exe" (
    echo ✅ Download completed successfully!
    echo 🔧 Installing Chrome... ^(This may take 1-2 minutes^)
    echo.
    
    :: Install Chrome silently
    chrome_installer.exe /silent /install
    
    echo ⏳ Waiting for installation to complete...
    timeout /t 20 >nul
    
    :: Check if installation was successful
    reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Chrome installed successfully!
    ) else (
        echo ❌ Installation failed. Please install manually from: https://www.google.com/chrome/
        set /a ERRORS_FOUND+=1
    )
) else (
    echo ❌ Download failed. Please check internet connection and install manually.
    echo    🔗 Manual download: https://www.google.com/chrome/
    set /a ERRORS_FOUND+=1
)

:: Cleanup
cd /d "%~dp0"
rd /s /q "%TEMP%\AMOD_Install" 2>nul
goto :eof

:END