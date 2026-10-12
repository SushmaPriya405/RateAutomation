import fs from 'fs';
import path from 'path';

/**
 * Get the most recent Excel file from testdata directory that matches the pattern
 * @param pattern - Pattern to match (e.g., "Dwelling_Basic", "Dwelling_Special")
 * @returns Full path to the most recent matching file
 */
export function getLatestExcelFile(pattern?: string): string {
    const testDataDir = path.join(__dirname, '..', 'testdata');
    
    if (!fs.existsSync(testDataDir)) {
        throw new Error(`Test data directory not found: ${testDataDir}`);
    }

    const files = fs.readdirSync(testDataDir);
    
    // Filter Excel files
    const excelFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.xlsx', '.xlsm', '.xls'].includes(ext);
    });

    if (excelFiles.length === 0) {
        throw new Error(`No Excel files found in ${testDataDir}`);
    }

    let filteredFiles = excelFiles;

    // Apply pattern filter if provided
    if (pattern) {
        filteredFiles = excelFiles.filter(file => 
            file.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (filteredFiles.length === 0) {
            console.warn(`No files found matching pattern "${pattern}". Available files:`, excelFiles);
            // Fallback to all Excel files if pattern doesn't match
            filteredFiles = excelFiles;
        }
    }

    // Get the most recent file by modification time
    const mostRecentFile = filteredFiles
        .map(file => ({
            name: file,
            fullPath: path.join(testDataDir, file),
            mtime: fs.statSync(path.join(testDataDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.mtime - a.mtime)[0];

    console.log(`📁 Using Excel file: ${mostRecentFile.name}`);
    return mostRecentFile.fullPath;
}

/**
 * Get latest file for specific test type
 */
export function getExcelFileForTest(testType: 'dwelling_basic' | 'dwelling_special' | 'homeowners' | 'dwb_separator'): string {
    const patterns: Record<string, string> = {
        'dwelling_basic': 'Dwelling_Basic',
        'dwelling_special': 'Dwelling_Special', 
        'homeowners': 'HomeOwners',
        'dwb_separator': 'Dwelling_Basic'
    };

    return getLatestExcelFile(patterns[testType]);
}
