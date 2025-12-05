/**
 * @natural-js/code
 *
 * Natural-JS Code package.
 * Provides code inspection and analysis tools.
 */

// Inspection exports
export {
  Inspection,
  test,
  rules,
  SeverityLevels,
  consoleReport,
  htmlReport,
  jsonReport,
  popupReport,
} from './inspection/index.js';

// Utility exports
export {
  addSourceURL,
  extractScripts,
  hasScript,
  getLineNumber,
} from './utils.js';

// Types
export type {
  SeverityLevel,
  SeverityLevelDef,
  InspectionReportItem,
  InspectionRule,
  InspectionRules,
  InspectionConfig,
  ReportOptions,
} from './types.js';

// Version
export const CODE_VERSION = '2.0.0-alpha.0';

/**
 * Code class providing static methods
 * for compatibility with original NCD interface
 */
export class Code {
  static severityLevels = {
    BLOCKER: ['Blocker', 'darkred', console.error] as const,
    CRITICAL: ['Critical', 'red', console.error] as const,
    MAJOR: ['Major', 'orange', console.warn] as const,
    MINOR: ['Minor', 'black', console.log] as const,
  };

  static inspection = {
    test: async (codes: string, ruleNames?: string[]) => {
      const { test } = await import('./inspection/index.js');
      return test(codes, ruleNames);
    },
    rules: {} as Record<string, unknown>,
    report: {
      console: async (
        data: import('./types.js').InspectionReportItem[] | undefined,
        url: string
      ) => {
        const { consoleReport } = await import('./inspection/report.js');
        return consoleReport(data, url);
      },
    },
  };

  static addSourceURL = async (codes: string, sourceURL: string) => {
    const { addSourceURL } = await import('./utils.js');
    return addSourceURL(codes, sourceURL);
  };
}

// Default export for backwards compatibility
export default Code;
