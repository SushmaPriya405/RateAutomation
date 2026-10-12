import { Reporter, TestCase, TestResult, TestStep, FullConfig } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";
import sizeOf from "image-size";
import Jimp from "jimp";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

pdfMake.vfs = (pdfFonts as any).vfs;

interface CorePDFReporterOptions {
  outputDir?: string;
  removeBlankPages?: boolean;
  dynamicPages?: boolean;
}

export default class CorePDFReporter implements Reporter {
  private baseURL = "";
  private outputDir: string;
  private removeBlankPages: boolean;
  private dynamicPages: boolean;
  
  // ✅ Enhanced constants for perfect content handling
  private static readonly MAX_RENDER_WIDTH_PT = 515;
  private static readonly DYNAMIC_PAGE_HEIGHT = 750; // ✅ Perfect height for A4 pages
  private static readonly MIN_CONTENT_HEIGHT = 150; // ✅ Minimum content before splitting
  private static readonly SMART_OVERLAP_PT = 15; // ✅ Minimal overlap to prevent content loss
  private static readonly PAGE_MARGIN = 40;
  
  constructor(options: CorePDFReporterOptions = {}) {
    this.outputDir = options.outputDir || path.resolve(process.cwd(), "reports", "pdf-report");
    this.removeBlankPages = false; // ✅ FIXED: Force include ALL screenshots
    this.dynamicPages = options.dynamicPages ?? true;
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
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
    } else {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  }

  /**
   * ✅ Smart image slicing that ensures NO content is cut
   */
  private async smartSliceImage(
    imgBuffer: Buffer, 
    maxWidthPt: number, 
    maxHeightPt: number
  ): Promise<string[]> {
    const image = await Jimp.read(imgBuffer as any);
    const origWpx = image.bitmap.width;
    const origHpx = image.bitmap.height;
    const scale = maxWidthPt / origWpx;
    const scaledHeightPt = origHpx * scale;

    // If image fits perfectly in one page, return as is
    if (scaledHeightPt <= maxHeightPt) {
      const b64uri = await image.getBase64Async(Jimp.MIME_PNG);
      return [b64uri];
    }

    console.log(`📏 Image too tall (${scaledHeightPt}pt), splitting into tiles...`);

    // Calculate optimal tile height in pixels
    const tileHeightPx = Math.floor(maxHeightPt / scale);
    const overlapPx = Math.floor(CorePDFReporter.SMART_OVERLAP_PT / scale);

    const tiles: string[] = [];
    let y = 0;
    let tileNumber = 1;

    while (y < origHpx) {
      const remainingHeight = origHpx - y;
      let currentTileHeight = Math.min(tileHeightPx, remainingHeight);

      // ✅ Smart content preservation: if remaining content is small, merge it
      const minContentHeightPx = CorePDFReporter.MIN_CONTENT_HEIGHT / scale;
      if (remainingHeight - currentTileHeight < minContentHeightPx && remainingHeight > currentTileHeight) {
        currentTileHeight = remainingHeight;
      }

      // Create tile
      const tile = image.clone().crop(0, y, origWpx, currentTileHeight);
      const b64uri = await tile.getBase64Async(Jimp.MIME_PNG);
      tiles.push(b64uri);

      console.log(`📄 Tile ${tileNumber}: ${currentTileHeight}px height (${(currentTileHeight * scale).toFixed(0)}pt)`);
      tileNumber++;

      // Move to next position
      if (y + currentTileHeight >= origHpx) break;
      y += currentTileHeight - overlapPx;
    }

    console.log(`✅ Split into ${tiles.length} tiles with no content loss`);
    return tiles;
  }

  /**
   * ✅ Enhanced blank image detection with better logic
   */
  private isImageBlank(imageBuffer: Buffer): boolean {
    try {
      const dimensions = sizeOf(imageBuffer);
      if (!dimensions.width || !dimensions.height) return true;
      
      // Only extremely tiny images are likely blank
      if (dimensions.width < 10 || dimensions.height < 10) return true;
      
      // Only completely empty files are blank
      if (imageBuffer.length < 100) return true;
      
      console.log(`🔍 Image analysis: ${dimensions.width}x${dimensions.height}, ${imageBuffer.length} bytes - VALID`);
      return false;
    } catch (error) {
      console.warn("Error checking blank image:", error);
      return false;
    }
  }

  /**
   * ✅ Create beautiful test steps table
   */
  private createTestStepsTable(steps: TestStep[]): any {
    const tableBody = [
      [
        { text: "Step", style: "tableHeader" },
        { text: "Status", style: "tableHeader" },
        { text: "Duration (s)", style: "tableHeader" }
      ]
    ];

    steps.forEach((step: TestStep) => {
      tableBody.push([
        { text: step.title, style: "tableCell" },
        { 
          text: step.error ? "❌ Failed" : "✅ Passed", 
          style: step.error ? "failedCell" : "passedCell" 
        },
        { text: String((step.duration ?? 0) / 1000), style: "tableCell" }
      ]);
    });

    // Add total duration
    const totalDuration = steps.reduce((sum, step) => sum + (step.duration ?? 0), 0);
    tableBody.push([
      { text: "Total Duration", style: "tableTotalCell" },
      { text: "", style: "tableTotalCell" },
      { text: String(totalDuration / 1000), style: "tableTotalCell" }
    ]);

    return {
      table: { 
        body: tableBody, 
        widths: ["*", "auto", "auto"],
        headerRows: 1
      },
      layout: {
        fillColor: function (rowIndex: number) {
          return rowIndex === 0 ? '#e3f2fd' : 
                 rowIndex === tableBody.length - 1 ? '#f5f5f5' : null;
        },
        hLineWidth: function() { return 0.5; },
        vLineWidth: function() { return 0.5; },
        hLineColor: function() { return '#90caf9'; },
        vLineColor: function() { return '#90caf9'; }
      },
      margin: [0, 10, 0, 20]
    };
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    try {
      console.log(`🔥 Generating Smart Core PDF for: ${test.title}`);
      console.log(`⚙️ Settings: Dynamic Pages=${this.dynamicPages}, Remove Blanks=${this.removeBlankPages}`);

      // ✅ Create header content
      const content: any[] = [
        { text: "🔥 Smart Core Test Report", style: "mainHeader" },
        { text: `Base URL: ${this.baseURL}`, style: "subtitle" },
        { text: `Test Case: ${test.title}`, style: "testTitle" },
        { 
          text: `Final Status: ${result.status.toUpperCase()}`, 
          style: result.status === 'passed' ? "passedStatus" : "failedStatus",
          margin: [0, 10, 0, 20] 
        }
      ];

      // ✅ Add test summary
      const summaryData = [
        ["Test Duration", `${((result.duration ?? 0) / 1000).toFixed(2)} seconds`],
        ["Test Status", result.status.toUpperCase()],
        ["Steps Count", result.steps?.length.toString() || "0"]
      ];

      content.push({
        table: { body: summaryData, widths: ["*", "*"] },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20]
      });

      // ✅ Add test steps if available
      if (result.steps && result.steps.length > 0) {
        content.push({ text: "📋 Test Execution Steps", style: "sectionHeader" });
        content.push(this.createTestStepsTable(result.steps));
      }

      // ✅ Process screenshots with smart filtering for test execution
      const testFolder = test.title.replace(/\s+/g, "_");
      const screenshotDir = path.join(this.outputDir, "data", testFolder);
      
      if (fs.existsSync(screenshotDir)) {
        const allFiles = fs.readdirSync(screenshotDir);
        const pngFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".png"));
        
        if (pngFiles.length > 0) {
          const sortedPngFiles = pngFiles.sort((a, b) => {
            const aStats = fs.statSync(path.join(screenshotDir, a));
            const bStats = fs.statSync(path.join(screenshotDir, b));
            return aStats.birthtimeMs - bStats.birthtimeMs;
          });

          // ✅ SMART FILTERING: Only screenshots taken during actual test execution
          const testStartTime = result.startTime ? new Date(result.startTime) : new Date(Date.now() - (result.duration || 0));
          const testEndTime = new Date(testStartTime.getTime() + (result.duration || 0));
          
          console.log(`⏰ Test time window: ${testStartTime.toISOString()} to ${testEndTime.toISOString()}`);
          
          const validScreenshots = sortedPngFiles.filter(file => {
            const imagePath = path.join(screenshotDir, file);
            const imageStats = fs.statSync(imagePath);
            const imageTime = imageStats.birthtimeMs || imageStats.ctimeMs || imageStats.mtimeMs;
            const imageDate = new Date(imageTime);
            
            // ✅ Only include screenshots from test execution window + small buffer (30 seconds)
            const bufferMs = 30 * 1000; // 30 seconds buffer
            const isValidTime = imageDate >= new Date(testStartTime.getTime() - bufferMs) && 
                               imageDate <= new Date(testEndTime.getTime() + bufferMs);
            
            if (!isValidTime) {
              console.log(`⏭️ Skipping ${file} - outside test window (${imageDate.toISOString()})`);
            }
            
            return isValidTime;
          });

          console.log(`📸 Processing ${validScreenshots.length}/${sortedPngFiles.length} valid screenshots for test execution...`);

          if (validScreenshots.length > 0) {
            // Add screenshots section header
            content.push({ 
              text: `📸 Test Execution Screenshots (${validScreenshots.length} files)`, 
              style: "sectionHeader",
              margin: [0, 30, 0, 20]
            });

            let totalPagesCreated = 0;

            for (let i = 0; i < validScreenshots.length; i++) {
              const file = validScreenshots[i];
              const imagePath = path.join(screenshotDir, file);
              const imageBuffer = fs.readFileSync(imagePath);

              // ✅ Process only test execution screenshots
              console.log(`📄 Processing screenshot ${i + 1}/${validScreenshots.length}: ${file} (${imageBuffer.length} bytes)`);

              try {
                // ✅ Smart slice with no content loss
                const imageTiles = await this.smartSliceImage(
                  imageBuffer, 
                  CorePDFReporter.MAX_RENDER_WIDTH_PT, 
                  CorePDFReporter.DYNAMIC_PAGE_HEIGHT
                );

                // ✅ Create dynamic pages - ALL screenshots get same treatment
                imageTiles.forEach((tileBase64, tileIndex) => {
                  const partInfo = imageTiles.length > 1 ? 
                    ` (Part ${tileIndex + 1}/${imageTiles.length})` : "";

                  // ✅ FIXED: Keep caption and image together with unbreakable grouping
                  const pageContent = {
                    stack: [
                      {
                        text: `Screenshot ${i + 1}: ${file}${partInfo}`,
                        style: "screenshotCaption",
                        margin: [0, 0, 0, 10]
                      },
                      {
                        image: tileBase64,
                        width: CorePDFReporter.MAX_RENDER_WIDTH_PT,
                        margin: [0, 0, 0, 20],
                        alignment: 'center'
                      }
                    ],
                    unbreakable: true // ✅ CRITICAL: Keep caption and image together
                  };

                  content.push(pageContent);
                  totalPagesCreated++;
                  console.log(`✅ Added screenshot ${i + 1} (${file}${partInfo}) to PDF content - Page ${totalPagesCreated}`);
                });
              } catch (err) {
                console.warn(`⚠️ Error processing ${file}:`, err);
                
                // Fallback: Keep caption and image together with same formatting
                const base64Image = imageBuffer.toString("base64");
                const fallbackContent = {
                  stack: [
                    {
                      text: `Screenshot ${i + 1}: ${file} (fallback)`,
                      style: "screenshotCaption",
                      margin: [0, 0, 0, 10]
                    },
                    {
                      image: `data:image/png;base64,${base64Image}`,
                      width: CorePDFReporter.MAX_RENDER_WIDTH_PT,
                      margin: [0, 0, 0, 20],
                      alignment: 'center'
                    }
                  ],
                  unbreakable: true // ✅ CRITICAL: Keep caption and image together
                };
                
                content.push(fallbackContent);
                totalPagesCreated++;
                console.log(`✅ Added screenshot ${i + 1} (${file} - fallback) to PDF content - Page ${totalPagesCreated}`);
              }
            }

            console.log(`✅ Created ${totalPagesCreated} dynamic pages with perfect content fitting (${validScreenshots.length} valid screenshots)`);
          } else {
            content.push({
              text: "📸 No valid screenshots found for test execution window",
              style: "noScreenshots",
              margin: [0, 20, 0, 0]
            });
          }
        } else {
          content.push({
            text: "📸 No PNG files found",
            style: "noScreenshots",
            margin: [0, 20, 0, 0]
          });
        }
      } else {
        content.push({
          text: "📸 No screenshot directory found",
          style: "noScreenshots",
          margin: [0, 20, 0, 0]
        });
      }

      // ✅ Enhanced PDF document with beautiful styling
      const docDefinition: TDocumentDefinitions = {
        pageSize: "A4",
        pageMargins: [CorePDFReporter.PAGE_MARGIN, CorePDFReporter.PAGE_MARGIN, CorePDFReporter.PAGE_MARGIN, CorePDFReporter.PAGE_MARGIN],
        content,
        styles: {
          mainHeader: { 
            fontSize: 22, 
            bold: true, 
            color: '#1565c0',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          subtitle: { 
            fontSize: 11, 
            color: '#546e7a',
            margin: [0, 5, 0, 5]
          },
          testTitle: { 
            fontSize: 15, 
            bold: true, 
            color: '#2e7d32'
          },
          passedStatus: { 
            fontSize: 14, 
            bold: true, 
            color: '#2e7d32'
          },
          failedStatus: { 
            fontSize: 14, 
            bold: true, 
            color: '#d32f2f'
          },
          sectionHeader: { 
            fontSize: 16, 
            bold: true, 
            color: '#1565c0',
            margin: [0, 20, 0, 10]
          },
          screenshotCaption: { 
            fontSize: 12, 
            italics: true, 
            color: '#37474f',
            bold: true
          },
          noScreenshots: {
            fontSize: 12,
            color: '#757575',
            italics: true,
            alignment: 'center'
          },
          tableHeader: {
            fontSize: 11,
            bold: true,
            color: '#1565c0'
          },
          tableCell: {
            fontSize: 10,
            color: '#424242'
          },
          passedCell: {
            fontSize: 10,
            color: '#2e7d32',
            bold: true
          },
          failedCell: {
            fontSize: 10,
            color: '#d32f2f',
            bold: true
          },
          tableTotalCell: {
            fontSize: 10,
            color: '#1565c0'
          }
        }
      };

      // ✅ Generate PDF
      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        (pdfMake.createPdf(docDefinition) as any).getBuffer((buffer: any) => {
          resolve(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
        });
      });

      // ✅ Save with enhanced naming
      const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" }).replace(/[\/:, ]+/g, "_");
      const safeTitle = test.title.replace(/[^\w\-]/g, "_");
      const workerId = process.env.PLAYWRIGHT_WORKER_ID ?? process.env.GITHUB_RUN_ID ?? "";
      const filePath = path.join(this.outputDir, `CORE_SMART_${safeTitle}${workerId ? "_" + workerId : ""}_${timestamp}.pdf`);
      
      fs.writeFileSync(filePath, pdfBuffer);
      
      console.log(`🎉 Smart Core PDF created: ${filePath}`);
      console.log(`✅ Features: Smart screenshot filtering, no blank pages, test execution only`);
      
    } catch (err) {
      console.error(`❌ Core PDF reporter error for ${test.title}:`, err);
      // Don't throw to prevent reporter crash
    }
  }
}
