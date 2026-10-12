import { Reporter, TestCase, TestResult, TestStep, FullConfig } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import sizeOf from "image-size";
const Jimp = require("jimp");
const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");
import { TDocumentDefinitions } from "pdfmake/interfaces";
pdfMake.vfs = (pdfFonts as any).vfs;
interface PDFReporterOptions {
  outputDir?: string;
  saveToDownloads?: boolean;
  hideInternalSteps?: boolean;
}
export default class PDFReporter implements Reporter {
  private baseURL = "";
  private outputDir: string;
  private saveToDownloads: boolean;
  private hideInternalSteps: boolean;
  private static readonly MAX_RENDER_WIDTH_PT = 515;
  private static readonly MAX_RENDER_HEIGHT_PT = 700;
  private static readonly TILE_OVERLAP_PT = 60;  constructor(options: PDFReporterOptions = {}) {
    this.outputDir = options.outputDir || path.resolve(process.cwd(), "reports", "pdf-report");
    this.saveToDownloads = options.saveToDownloads !== false; // Default to true
    this.hideInternalSteps = options.hideInternalSteps ?? true; // Default to true
    if (!fs.existsSync(this.outputDir)) fs.mkdirSync(this.outputDir, { recursive: true });
  }  private getDownloadsDirectory(): string {
    // Get user's Downloads folder
    const homeDir = os.homedir();
    return path.join(homeDir, "Downloads");
  }

  onBegin(config: FullConfig) {
    this.baseURL = config.projects?.[0]?.use?.baseURL ?? "";
    const screenshotDir = path.join(this.outputDir, "data");
    if (fs.existsSync(screenshotDir)) {
      const entries = fs.readdirSync(screenshotDir);
      for (const entry of entries) {
        const entryPath = path.join(screenshotDir, entry);
        const stats = fs.statSync(entryPath);
        if (stats.isDirectory()) {
          fs.rmSync(entryPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(entryPath);
        }
      }
      // keep folder itself
    } else {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  }  private async sliceToTilesBase64(imgBuffer: Buffer, maxWidthPt: number, maxHeightPt: number, overlapPt: number): Promise<string[]> {
    try {
      const image = await Jimp.read(imgBuffer);
      const origWpx = image.bitmap.width;
      const origHpx = image.bitmap.height;
      const scale = maxWidthPt / origWpx;
      const tileHeightPx = Math.max(1, Math.floor(maxHeightPt / scale));
      const overlapPx = Math.max(0, Math.floor(overlapPt / scale));
      if (tileHeightPx >= origHpx) {
        const b64uri = await image.getBase64Async('image/png');
        return [b64uri];
      }
      const tiles: string[] = [];
      let y = 0;
      while (y < origHpx) {
        const h = Math.min(tileHeightPx, origHpx - y);
        const tile = image.clone().crop(0, y, origWpx, h);
        const b64uri = await tile.getBase64Async('image/png');
        tiles.push(b64uri);
        if (y + h >= origHpx) break;
        y += h - overlapPx;
      }
      return tiles;
    } catch (error) {
      // Fallback for compatibility
      const base64Image = imgBuffer.toString('base64');
      return [`data:image/png;base64,${base64Image}`];
    }
  }
  async onTestEnd(test: TestCase, result: TestResult) {
    try {
      //  FORCE CORRECT STATUS DETERMINATION
const determineTestStatus = (result: TestResult, filteredSteps: TestStep[]) => {
  // Check if any filtered steps failed
  const hasFailedFilteredSteps = filteredSteps.some(step => step.error);
  
  // Check if any steps failed (including filtered ones)
  const hasAnyFailedSteps = result.steps.some(step => step.error);
  
  console.log(`🔍 Status Analysis:`);
  console.log(`  - Result.status: ${result.status}`);
  console.log(`  - Has failed filtered steps: ${hasFailedFilteredSteps}`);
  console.log(`  - Has any failed steps: ${hasAnyFailedSteps}`);
  console.log(`TEST_RESULT|Result.status: ${result.status}|Has failed filtered steps: ${hasFailedFilteredSteps}|Has any failed steps: ${hasAnyFailedSteps}`);
  
  if (result.error?.message?.includes('TEST_ABORTED')) {
    return 'ABORTED';
  }
  // If any business logic step failed, test should be FAILED
  if (hasFailedFilteredSteps) {
    return 'FAILED';
  }
  
  // If only internal/screenshot steps failed but business logic passed
  if (hasAnyFailedSteps) {
    console.log(`❌ Step failures detected - marking as FAILED`);
    return 'FAILED';
  }
  
  // Use original result status
  return result.status === 'passed' ? 'PASSED' : 'FAILED';
};
 
const INTERNAL_TITLES = new Set([
      'Before Hooks', 
      'After Hooks', 
      'Worker Cleanup', 
      'Screenshot', 
      'Attach',
      'Issue Capture', //  Added explicit Issue Capture
      'Step: Issue',
      'Evaluate',
      'Set viewport size',
      'Wait for timeout',
      'Click',
      'Close browser'
    ]);
      const EXCLUDE_PATTERNS = [
      /screenshot/i,
      /capture/i,
      /issue capture/i,
      /validation failed.*test stopped/i,
      /validation matched.*test passed/i,
      /captureAndAttach/i,
      /attach.*screenshot/i,
      /wait for timeout/i,
      /wait for selector/i,
      /Evaluate/i,
      /Wait for load state/i,
      /Query count locator/i,
      /Close browser/i
    ];
    
    const steps = this.hideInternalSteps
      ? result.steps.filter(s => {
          // Filter out internal titles
          if (INTERNAL_TITLES.has(s.title)) return false;
          
          // Filter out steps matching exclude patterns
          if (EXCLUDE_PATTERNS.some(pattern => pattern.test(s.title))) return false;
          
          return true;
        })
      : result.steps;
const finalStatus = determineTestStatus(result, steps);

const content: any[] = [
  { text: "📄 Playwright Custom Report", style: "header" },
  { text: `Base URL: ${this.baseURL}`, margin: [0, 10, 0, 10] },
  { text: `Test Case: ${test.title}`, style: "subheader" },
  { text: `Overall Status: ${finalStatus === 'PASSED' ? ' PASSED' : (finalStatus === 'ABORTED' ? ' ABORTED' : ' FAILED')}`, margin: [0, 0, 0, 10] },
];
      const tableBody = [
        ["Step", "Status", "Time Taken (s)"],
        ...steps.map((step: TestStep) => [
          step.title,
          // step.error?.message?.includes('TEST_ABORTED') ? " Aborted" : step.error ? " Failed" : " Passed",
          finalStatus === 'ABORTED' && step.error ? " Aborted" : step.error ? " Failed" : " Passed",
          String((step.duration ?? 0) / 1000)
        ]),
        ["Total Test Duration", "", String((result.duration ?? 0) / 1000)]
      ];      content.push({
        table: { body: tableBody, widths: ["*", "*", "*"] },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 20]
      });
      
      const testFolder = test.title.replace(/\s+/g, "_");
      const screenshotDir = path.join(this.outputDir, "data", testFolder);      
      let sortedPngFiles: string[] = [];
      if (fs.existsSync(screenshotDir)) {
        const allFiles = fs.readdirSync(screenshotDir);
        const pngFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".png"));
        sortedPngFiles = pngFiles.sort((a, b) => {
          const aStats = fs.statSync(path.join(screenshotDir, a));
          const bStats = fs.statSync(path.join(screenshotDir, b));
          return aStats.birthtimeMs - bStats.birthtimeMs;
        });
      }
      
      // Add screenshots section only if screenshots exist
      if (sortedPngFiles.length > 0) {
        content.push({ text: "", pageBreak: "before" });
        content.push({ text: "📸 Test Screenshots", style: "subheader", margin: [0, 0, 0, 15] });
      } else {
        content.push({ text: "📝 No screenshots captured for this test", style: "caption", margin: [0, 20, 0, 10] });
      }
      for (let i = 0; i < sortedPngFiles.length; i++) {
        const file = sortedPngFiles[i];
        const imagePath = path.join(screenshotDir, file);
        const imageBuffer = fs.readFileSync(imagePath);
        let tilesBase64: string[] = [];
        try {
          const dimensions = sizeOf(imageBuffer);
          const imgW = dimensions.width!;
          const imgH = dimensions.height!;
          const scaledHeightPt = (imgH * PDFReporter.MAX_RENDER_WIDTH_PT) / imgW;          
          if (scaledHeightPt > PDFReporter.MAX_RENDER_HEIGHT_PT) {
            tilesBase64 = await this.sliceToTilesBase64(imageBuffer, PDFReporter.MAX_RENDER_WIDTH_PT, PDFReporter.MAX_RENDER_HEIGHT_PT, PDFReporter.TILE_OVERLAP_PT);
          } else {            try {
              const image = await Jimp.read(imageBuffer);
              const single = await image.getBase64Async('image/png');
              tilesBase64 = [single];
            } catch (error) {
              // Fallback for compatibility
              const base64Image = imageBuffer.toString('base64');
              tilesBase64 = [`data:image/png;base64,${base64Image}`];
            }
          }
        } catch (err) {
          const base64Image = imageBuffer.toString("base64");
          tilesBase64 = [`data:image/png;base64,${base64Image}`];
        }       
         for (let t = 0; t < tilesBase64.length; t++) {
          const partLabel = tilesBase64.length > 1 ? ` (part ${t + 1}/${tilesBase64.length})` : "";
          const isLastImage = (i === sortedPngFiles.length - 1 && t === tilesBase64.length - 1);
          
          content.push({ text: `Screenshot: ${file}${partLabel}`, style: "caption", margin: [0, 10, 0, 5] });
          content.push({
            image: tilesBase64[t],
            width: PDFReporter.MAX_RENDER_WIDTH_PT,
            margin: [0, 0, 0, isLastImage ? 10 : 20],
            pageBreak: isLastImage ? undefined : "after"
          });
        }
      }
      const docDefinition: TDocumentDefinitions = {
        pageSize: "A4",
        pageMargins: [40, 40, 40, 40],
        content,
        styles: {
          header: { fontSize: 18, bold: true },
          subheader: { fontSize: 14, bold: true },
          caption: { fontSize: 12, italics: true }
        }
      };
      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        (pdfMake.createPdf(docDefinition) as any).getBuffer((buffer: any) => {
          resolve(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
        });
      });      const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" }).split(",")[0].replace(/[\/:, ]+/g, "_");
      const safeTitle = test.title.replace(/[^\w\-]/g, "_").replace(/_[0-9]+$/, "");
      const workerId = process.env.PLAYWRIGHT_WORKER_ID ?? process.env.GITHUB_RUN_ID ?? "";
      // const fileName = `${safeTitle}${workerId ? "_" + workerId : ""}_${timestamp}.pdf`;
      
        let identifier = "";
    
    //  PRIORITY 1: Check annotations (most reliable)
    const annotations = test.annotations || [];
    for (const annotation of annotations) {
      if (annotation.type === 'policyNumber') {
        identifier = annotation.description || "";
        console.log(`📝 Found Policy Number in annotations: ${identifier}`);
        break; // Policy number takes priority
      } else if (annotation.type === 'submissionNumber' && !identifier) {
        identifier = annotation.description || "";
        console.log(`📝 Found Submission Number in annotations: ${identifier}`);
      }
    }
    
    //  PRIORITY 2: Extract from step descriptions (more detailed patterns)
    if (!identifier) {
      for (const step of result.steps) {
        console.log(`🔍 Checking step: "${step.title}"`);
        
        // Look for policy number patterns in step titles
        const policyPatterns = [
          /Policy.*?(\d{9,10})/i,
          /policy_number.*?(\d{9,10})/i,
          /Policy Number.*?(\d{9,10})/i,
          /generated.*?policy.*?(\d{9,10})/i
        ];
        
        // Look for submission number patterns in step titles
        const submissionPatterns = [
          /Submission.*?(\d{10})/i,
          /submission.*?number.*?(\d{10})/i,
          /created.*?submission.*?(\d{10})/i,
          /000\d{7}/
        ];
        
        // Check for policy number first (higher priority
        for (const pattern of policyPatterns) {
          const match = step.title.match(pattern);
          if (match) {
            identifier = match[1];
            console.log(`📝 Found Policy Number in step "${step.title}": ${identifier}`);
            break;
          }
        }
        
        if (identifier) break;
        
        // Then check for submission number
        for (const pattern of submissionPatterns) {
          const match = step.title.match(pattern);
          if (match) {
            identifier = match[1] || match[0];
            console.log(`📝 Found Submission Number in step "${step.title}": ${identifier}`);
            break;
          }
        }
        
        if (identifier) break;
      }
    }
    
    //  PRIORITY 3: Extract from test title (least reliable but still useful)
    if (!identifier) {
      const titleParts = test.title.split("_");
      const firstPart = titleParts[0];
      
      if (/^\d{9,10}$/.test(firstPart)) { // 9-10 digit number (policy number format)
        identifier = firstPart;
        console.log(`📝 Extracted Policy Number from title: ${identifier}`);
      } else if (/^000\d{7}$/.test(firstPart)) { // Submission number format
        identifier = firstPart;
        console.log(`📝 Extracted Submission Number from title: ${identifier}`);
      }
    }
    
    let fileName: string;
    
    if (identifier) {
      // Clean the original title (remove special chars but keep structure)
      const cleanTitle = test.title.replace(/[^\w\-_]/g, "_");
      console.log(`📝 Cleaned test title for filename: ${cleanTitle}`);
      const titleStartsWithId = cleanTitle.startsWith(identifier);
      console.log(`📝 Does title already start with identifier? ${titleStartsWithId}`);
      
      if (titleStartsWithId) {
        // Title already has identifier, use as-is
        fileName = `${cleanTitle}.pdf`;
      } else {
        // Prepend identifier to title
        fileName = `${identifier}_${cleanTitle}.pdf`;
      }
      
      console.log(`📝 PDF filename with identifier: ${fileName}`);
    } else {
      // Fallback to original format
      const safeTitle = test.title.replace(/[^\w\-]/g, "_");
      fileName = `${safeTitle}.pdf`;
      console.log(`📝 PDF filename (no identifier found): ${fileName}`);
    }
      // Save to reports directory
      const reportsPath = path.join(this.outputDir, fileName);
      fs.writeFileSync(reportsPath, pdfBuffer);
      console.log(` PDF report created: ${reportsPath}`);
      
      // Also save to Downloads folder if enabled
      if (this.saveToDownloads) {
        try {
          const downloadsDir = this.getDownloadsDirectory();
          if (fs.existsSync(downloadsDir)) {
            const downloadsPath = path.join(downloadsDir, fileName);
            fs.writeFileSync(downloadsPath, pdfBuffer);
            console.log(`📁 PDF also saved to Downloads: ${downloadsPath}`);
          } else {
            console.log(`⚠️  Downloads folder not found: ${downloadsDir}`);
          }
        } catch (downloadError) {
          console.log(`⚠️  Could not save to Downloads folder:`, downloadError instanceof Error ? downloadError.message : downloadError);
        }
      }
    } catch (err) {
      console.error(`PDF reporter error for ${test.title}:`, err);
      // swallow to prevent reporter crash
    }
  }
}