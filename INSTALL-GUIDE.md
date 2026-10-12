# 🚀 AMOD AUTOMATION - MANUAL TESTING TEAM SETUP GUIDE

## 📋 Pre-Requirements for Manual Testing Team Laptops

### Essential Software Required on Each Manual Tester's Laptop:

---

## 🔧 **MANDATORY INSTALLATIONS**

### 1. **Node.js** ⭐ **MOST IMPORTANT**
**Download**: https://nodejs.org/
- **Version**: Node.js 18.x or higher
- **Why needed**: AMOD server runs on Node.js
- **Installation**: 
  - Download LTS version (Long Term Support)
  - Run installer with default settings
  - Restart computer after installation

**Verify Installation:**
```cmd
node --version
npm --version
```

### 2. **Chrome Browser** ⭐ **REQUIRED**
**Download**: https://www.google.com/chrome/
- **Version**: Latest version
- **Why needed**: Playwright automation runs tests on Chrome
- **Alternative**: Microsoft Edge also works

### 3. **Microsoft Edge** (Optional but recommended)
- Usually pre-installed on Windows
- **Why needed**: Backup browser for automation

---

## 🎯 **RECOMMENDED INSTALLATIONS**

### 4. **7-Zip** (For extracting packages)
**Download**: https://www.7-zip.org/
- **Why needed**: To extract AMOD distribution ZIP files
- **Alternative**: WinRAR or built-in Windows extraction

### 5. **Visual Studio Code** (Optional)
**Download**: https://code.visualstudio.com/
- **Why needed**: If manual team wants to view/edit configuration files
- **Not mandatory**: For basic usage

---

## 🔒 **SECURITY SETTINGS**

### Windows Defender / Antivirus Settings:
1. **Add Exception** for AMOD folder
2. **Allow** Node.js through firewall
3. **Whitelist** AMOD-Automation.exe file

### Firewall Settings:
- **Allow port 3003** for local testing
- **Allow Node.js** application through Windows Firewall

---

## 📦 **AMOD PACKAGE CONTENTS**

### What Manual Team Gets:
```
AMOD-Complete-Package/
├── AMOD-Automation.exe         ⭐ Main application
├── START-AMOD.bat             🚀 Double-click to start
├── QUICK-START.bat            ⚡ Quick launcher
├── STOP-AMOD.bat              🛑 Stop application
├── REQUIREMENTS-CHECK.bat      🔍 Check if laptop ready
├── INSTALL-GUIDE.md           📋 This guide
├── TROUBLESHOOTING.md         🔧 Common issues
└── [All automation files]     📁 Complete setup
```

---

## ✅ **STEP-BY-STEP SETUP FOR MANUAL TEAM**

### Step 1: Check Current Laptop
1. Run `REQUIREMENTS-CHECK.bat` (we'll create this)
2. Install missing software as per checklist

### Step 2: Install Node.js
```
1. Go to: https://nodejs.org/
2. Download: LTS version (18.x or higher)
3. Install: Run installer with default settings
4. Restart: Computer after installation
5. Verify: Open Command Prompt, type: node --version
```

### Step 3: Install Chrome Browser
```
1. Go to: https://www.google.com/chrome/
2. Download: Latest Chrome
3. Install: Run installer
4. Set as default (optional)
```

### Step 4: Configure Windows Security
```
1. Open Windows Defender
2. Add exclusion for AMOD folder
3. Allow Node.js through firewall when prompted
```

### Step 5: Test AMOD Setup
```
1. Extract AMOD package to Desktop
2. Double-click START-AMOD.bat
3. Wait for browser to open
4. Verify web interface loads at http://localhost:3003
```

---

## 🚀 **DAILY USAGE WORKFLOW**

### For Manual Testing Team:

#### Starting AMOD:
```
1. Go to AMOD package folder
2. Double-click START-AMOD.bat
3. Wait for browser to open automatically
4. Start uploading Excel files and testing
```

#### Stopping AMOD:
```
1. Double-click STOP-AMOD.bat, OR
2. Close the command window, OR  
3. Press Ctrl+C in the running window
```

#### If Issues Occur:
```
1. Run TROUBLESHOOTING.bat
2. Check TROUBLESHOOTING.md guide
3. Contact automation development team
```

---

## ⚠️ **COMMON ISSUES & SOLUTIONS**

### Issue 1: "Node.js not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue 2: "Port 3003 already in use"  
**Solution**: 
- Close other applications using port 3003
- Or restart computer

### Issue 3: "Browser doesn't open automatically"
**Solution**: 
- Manually open browser
- Go to: http://localhost:3003

### Issue 4: "EXE file blocked by antivirus"
**Solution**:
- Add AMOD folder to antivirus exclusions
- Whitelist AMOD-Automation.exe

### Issue 5: "Excel upload fails"
**Solution**:
- Check Excel file format (must be .xlsm)
- Verify file is not corrupted
- Try with sample Excel file

---

## 💻 **MINIMUM SYSTEM REQUIREMENTS**

### Hardware:
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space for AMOD package
- **Processor**: Intel Core i3 or equivalent
- **Internet**: Required for initial browser setup

### Operating System:
- **Windows 10** or higher
- **64-bit architecture**

### Network:
- **Port 3003** available for local server
- **Internet access** for downloading dependencies (if needed)

---

## 📞 **SUPPORT CONTACTS**

### For Manual Testing Team Issues:
1. **First**: Check TROUBLESHOOTING.md
2. **Second**: Run REQUIREMENTS-CHECK.bat
3. **Third**: Contact automation development team

### Development Team Contact:
- **Technical Issues**: Contact automation team
- **Excel Template Questions**: Contact automation team  
- **Feature Requests**: Contact automation team
- **Installation Help**: Contact IT support + automation team

---

## 🔄 **UPDATE PROCESS**

### When New AMOD Version Available:
```
1. Stop current AMOD (STOP-AMOD.bat)
2. Extract new package to new folder
3. Run new START-AMOD.bat
4. Continue testing with new version
```

### No Uninstall Needed:
- AMOD is portable
- Just delete old folder when new version working
- No registry changes required

---

## ✅ **QUICK VERIFICATION CHECKLIST**

Before starting work each day, verify:

- [ ] **Node.js installed** (`node --version` shows 18.x+)
- [ ] **Chrome browser available**
- [ ] **AMOD package extracted to accessible location**  
- [ ] **Windows Defender exclusion set** for AMOD folder
- [ ] **Port 3003 is free** (no other applications using it)
- [ ] **START-AMOD.bat runs without errors**
- [ ] **Browser opens to http://localhost:3003**
- [ ] **Web interface loads properly**

---

## 🎯 **SUCCESS CRITERIA**

Manual testing team setup is successful when:

✅ **START-AMOD.bat** runs without errors
✅ **Browser opens automatically** to AMOD interface
✅ **Excel files can be uploaded** successfully  
✅ **Tests can be started** through web interface
✅ **Reports are generated** after test completion
✅ **STOP-AMOD.bat** cleanly shuts down the application

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2025  
**Target Audience**: Manual Testing Team  
**Prerequisites**: Windows laptop with admin rights
