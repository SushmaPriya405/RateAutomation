# 🔧 AMOD AUTOMATION - TROUBLESHOOTING GUIDE FOR MANUAL TEAM

## 🚨 Common Issues & Quick Solutions

### **For Manual Testing Team - When Things Don't Work**

---

## 🔍 **QUICK DIAGNOSIS**

### Step 1: Run Requirements Check
```
Double-click: REQUIREMENTS-CHECK.bat
This will tell you exactly what's missing or wrong
```

### Step 2: Check Error Messages
Look for these common error patterns and follow solutions below.

---

## ❌ **CRITICAL ERRORS (Must Fix)**

### **Error 1: "Node.js is not recognized"**
**Symptoms**: 
- START-AMOD.bat shows "node is not recognized as internal command"
- REQUIREMENTS-CHECK shows Node.js not installed

**Solution**:
```
1. Download Node.js from: https://nodejs.org/
2. Install the LTS version (18.x or higher)
3. RESTART your computer after installation
4. Run REQUIREMENTS-CHECK.bat again to verify
```

### **Error 2: "Port 3003 already in use"**
**Symptoms**:
- Server fails to start
- Error message mentions "EADDRINUSE" or "port 3003"

**Solution**:
```
Method 1 (Restart):
1. Restart your computer
2. Try starting AMOD again

Method 2 (Kill Process):
1. Press Ctrl+Shift+Esc (Task Manager)
2. End any "Node.js" or "Chrome" processes
3. Try starting AMOD again

Method 3 (Find Conflicting App):
1. Open Command Prompt
2. Type: netstat -ano | findstr :3003
3. Kill the process using that port
```

### **Error 3: "AMOD-Automation.exe blocked by antivirus"**
**Symptoms**:
- EXE file won't run
- Antivirus shows warning/quarantine
- Files mysteriously disappear

**Solution**:
```
Windows Defender:
1. Open Windows Security
2. Go to Virus & threat protection
3. Add exclusion for AMOD folder
4. Whitelist AMOD-Automation.exe

Other Antivirus:
1. Open your antivirus software
2. Add AMOD folder to exceptions/whitelist
3. Restore quarantined files if needed
```

---

## ⚠️ **COMMON WARNINGS (Can Usually Ignore)**

### **Warning 1: "Browser doesn't open automatically"**
**Symptoms**:
- AMOD starts but browser doesn't open
- You see "Server running" but no web page

**Solution**:
```
Manual Fix:
1. Open Chrome or Edge browser
2. Go to: http://localhost:3003
3. AMOD interface should load normally
```

### **Warning 2: "Old Node.js version"**
**Symptoms**:
- REQUIREMENTS-CHECK shows version warning
- AMOD works but may be slower

**Solution**:
```
Optional Update:
1. Download latest Node.js from: https://nodejs.org/
2. Install to replace old version
3. Restart computer
4. Improved performance expected
```

---

## 🌐 **BROWSER ISSUES**

### **Issue 1: "Web page won't load"**
**Symptoms**:
- Browser opens but shows "Can't reach this page"
- http://localhost:3003 not accessible

**Solution**:
```
Check Order:
1. Ensure AMOD server started first (START-AMOD.bat)
2. Wait 10-15 seconds for server to initialize  
3. THEN open browser to http://localhost:3003

Firewall Check:
1. Windows may ask to allow Node.js through firewall
2. Click "Allow" when prompted
```

### **Issue 2: "Excel upload fails"**
**Symptoms**:
- Can't upload Excel files
- Upload button doesn't work
- Error during file processing

**Solution**:
```
File Format Check:
1. Ensure Excel file is .xlsm format
2. File should not be password protected
3. Try with a sample Excel file first

Browser Check:
1. Refresh the page (F5)
2. Try in a different browser (Edge if using Chrome)
3. Clear browser cache (Ctrl+Shift+Delete)
```

---

## 🔄 **RESTART PROCEDURES**

### **Clean Restart (Recommended for most issues)**
```
1. Double-click STOP-AMOD.bat
2. Close all browser windows
3. Wait 30 seconds
4. Double-click START-AMOD.bat
5. Wait for browser to open automatically
```

### **Full System Restart (For persistent issues)**
```
1. Close all AMOD windows
2. Restart your computer
3. Run REQUIREMENTS-CHECK.bat
4. If all green ✅, start AMOD normally
```

---

## 💻 **PERFORMANCE ISSUES**

### **Issue: "AMOD runs very slowly"**
**Symptoms**:
- Long delays during testing
- Browser becomes unresponsive
- Excel processing takes forever

**Solution**:
```
System Resources:
1. Close other heavy applications (video calls, large Excel files)
2. Ensure at least 2GB free RAM
3. Check Task Manager for high CPU usage

Optimization:
1. Use smaller Excel files for testing
2. Test one Excel file at a time
3. Clear browser cache regularly
```

---

## 📁 **FILE & FOLDER ISSUES**

### **Issue: "Missing files in AMOD package"**
**Symptoms**:
- REQUIREMENTS-CHECK shows missing files
- Features don't work as expected

**Solution**:
```
Package Verification:
1. Ensure you have complete AMOD package
2. Don't move individual files around
3. Keep entire folder structure intact

Re-extract Package:
1. Download fresh AMOD package
2. Extract to new location
3. Run REQUIREMENTS-CHECK.bat
```

---

## 🔐 **SECURITY & PERMISSIONS**

### **Issue: "Access denied" or "Permission error"**
**Symptoms**:
- Can't create files/folders
- Reports don't get generated
- Settings won't save

**Solution**:
```
Administrator Rights:
1. Right-click START-AMOD.bat
2. Select "Run as administrator"  
3. Click "Yes" when prompted

Folder Permissions:
1. Extract AMOD to Desktop or Documents
2. Avoid Program Files folder
3. Ensure user has write permissions
```

---

## 🆘 **EMERGENCY PROCEDURES**

### **When Nothing Works - Nuclear Option**
```
Complete Reset:
1. Stop all AMOD processes (STOP-AMOD.bat)
2. Restart computer
3. Run REQUIREMENTS-CHECK.bat
4. Install any missing software
5. Get fresh AMOD package from development team
6. Extract to Desktop
7. Run START-AMOD.bat
```

### **When Excel Files Won't Process**
```
File Troubleshooting:
1. Try with a different Excel file
2. Ensure file is not open in Excel
3. Check file size (should be under 50MB)
4. Verify LOB selection matches file type
5. Contact development team with specific file name
```

---

## 📞 **ESCALATION GUIDE**

### **Level 1: Self-Help (Try First)**
1. Run REQUIREMENTS-CHECK.bat
2. Follow solutions in this guide
3. Try clean restart procedure

### **Level 2: IT Support (For Installation Issues)**
Contact IT support for:
- Node.js installation problems
- Antivirus configuration
- Windows firewall settings
- Administrator permissions

### **Level 3: Automation Team (For AMOD Issues)**
Contact automation development team for:
- Excel processing errors
- Test execution failures
- Feature not working as expected
- New error messages not covered here

### **What to Include in Support Request**
```
Essential Information:
1. Screenshot of error message
2. Results from REQUIREMENTS-CHECK.bat
3. Excel file name (if upload issue)
4. Step-by-step description of what you did
5. When the issue started occurring
```

---

## 🔍 **DIAGNOSTIC COMMANDS**

### **Quick System Check Commands**
```
Open Command Prompt and run these:

Check Node.js: node --version
Check NPM: npm --version
Check Chrome: chrome --version
Check Port: netstat -an | findstr :3003
```

### **AMOD Health Check**
```
1. Run REQUIREMENTS-CHECK.bat
2. Check all items are green ✅  
3. If any red ❌, follow installation guide
4. If any yellow ⚠️, note but can proceed
```

---

## ✅ **SUCCESS INDICATORS**

### **AMOD is Working Correctly When:**
- ✅ START-AMOD.bat runs without errors
- ✅ Browser opens automatically to localhost:3003
- ✅ AMOD web interface loads properly
- ✅ Excel files upload successfully
- ✅ Test execution starts without issues
- ✅ Reports are generated after tests

### **You Can Begin Testing When:**
- ✅ All requirements check green
- ✅ Web interface responsive
- ✅ Sample Excel upload works
- ✅ No error messages in console

---

## 📝 **QUICK REFERENCE**

### **Essential Files in AMOD Package:**
- `START-AMOD.bat` - Main startup
- `STOP-AMOD.bat` - Clean shutdown  
- `REQUIREMENTS-CHECK.bat` - System verification
- `INSTALL-GUIDE.md` - Setup instructions
- `TROUBLESHOOTING.md` - This guide

### **Important URLs:**
- **AMOD Interface**: http://localhost:3003
- **Node.js Download**: https://nodejs.org/
- **Chrome Download**: https://www.google.com/chrome/

### **Emergency Contacts:**
- **IT Support**: For software installation
- **Automation Team**: For AMOD functionality
- **Team Lead**: For escalation

---

**Last Updated**: December 30, 2025  
**Version**: 1.0  
**For**: Manual Testing Team  
**Support Level**: Self-Service + IT + Development Team
