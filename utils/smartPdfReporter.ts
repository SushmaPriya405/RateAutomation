import { Reporter, TestCase, TestResult, FullConfig } from "@playwright/test/reporter";
import CorePDFReporter from './corePdfReporter';
import OriginalPDFReporter from './pdfReporter';

interface SmartPDFReporterOptions {
  outputDir?: string;
}

class SmartPDFReporter implements Reporter {
  private coreReporter: CorePDFReporter;
  private originalReporter: OriginalPDFReporter;

  constructor(options: SmartPDFReporterOptions = {}) {
    this.coreReporter = new CorePDFReporter(options);
    this.originalReporter = new OriginalPDFReporter(options);
  }

  onBegin(config: FullConfig) {
    this.coreReporter.onBegin(config);
    this.originalReporter.onBegin(config);
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    // Check if this is a Core test based on file path
    const isCoreTest = test.location.file.includes('Core_');

    if (isCoreTest) {
      console.log(`🔥 Using Enhanced Core PDF Reporter for: ${test.title}`);
      await this.coreReporter.onTestEnd(test, result);    } else {
      console.log(`📄 Using Original GPA PDF Reporter for: ${test.title}`);
      await this.originalReporter.onTestEnd(test, result);
    }
  }
}
