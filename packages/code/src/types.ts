/**
 * @natural-js/code types
 */

/**
 * Severity levels for code inspection
 */
export type SeverityLevel = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR';

/**
 * Severity level definition
 */
export interface SeverityLevelDef {
  /** Display name */
  name: string;
  /** Color for console output */
  color: string;
  /** Logger function */
  logger: (message: string, ...args: unknown[]) => void;
}

/**
 * Inspection report item
 */
export interface InspectionReportItem {
  /** Severity level */
  level: string;
  /** Message describing the issue */
  message: string;
  /** Line number where issue was found */
  line: number;
  /** Code snippet that triggered the issue */
  code: string;
}

/**
 * Inspection rule function type
 */
export type InspectionRule = (
  codes: string,
  excludes: string[],
  report: InspectionReportItem[]
) => void;

/**
 * Inspection rules registry
 */
export interface InspectionRules {
  [ruleName: string]: InspectionRule;
}

/**
 * Inspection configuration from natural.config.js
 */
export interface InspectionConfig {
  /** Excluded patterns */
  excludes?: string[];
  /** Abort on BLOCKER/CRITICAL errors */
  abortOnError?: boolean;
  /** Message resources for inspection */
  message?: Record<string, unknown>;
}

/**
 * Report output options
 */
export interface ReportOptions {
  /** URL of the inspected file */
  url: string;
  /** Whether to abort on errors */
  abortOnError?: boolean;
}

