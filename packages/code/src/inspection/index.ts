/**
 * @natural-js/code - Inspection Module
 *
 * Code inspection utilities for detecting potential issues in Natural-JS code.
 */

import { getConfig } from '@natural-js/core';
import type { InspectionReportItem, InspectionConfig } from '../types.js';
import { rules, SeverityLevels } from './rules.js';
import { consoleReport, htmlReport, jsonReport, popupReport } from './report.js';

// Re-export rules and severity levels
export { rules, SeverityLevels } from './rules.js';
export { consoleReport, htmlReport, jsonReport, popupReport } from './report.js';

/**
 * Test code for issues
 *
 * @param codes - HTML/JavaScript code to inspect
 * @param ruleNames - Optional array of specific rule names to run
 * @returns Array of inspection report items, or false if no script found
 */
export function test(
  codes: string,
  ruleNames?: string[]
): InspectionReportItem[] | false {
  // Quick check for script content
  if (!codes.includes('<script')) {
    return false;
  }

  const report: InspectionReportItem[] = [];
  const config = getConfig();
  const inspectionConfig = config.code?.inspection || {};
  const excludes = inspectionConfig.excludes || [];

  // Run specified rules or all rules
  if (ruleNames && ruleNames.length > 0) {
    for (const ruleName of ruleNames) {
      const rule = rules[ruleName];
      if (rule) {
        rule(codes, excludes, report);
      } else {
        console.warn(`Unknown inspection rule: ${ruleName}`);
      }
    }
  } else {
    // Run all rules
    for (const ruleName in rules) {
      const rule = rules[ruleName];
      if (rule) {
        rule(codes, excludes, report);
      }
    }
  }

  return report;
}

/**
 * Inspection class for static access
 */
export class Inspection {
  /**
   * Test code for issues
   */
  static test = test;

  /**
   * Available rules
   */
  static rules = rules;

  /**
   * Report utilities
   */
  static report = {
    console: consoleReport,
    html: htmlReport,
    json: jsonReport,
    popup: popupReport,
  };
}

export default Inspection;

