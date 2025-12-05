/**
 * @natural-js/code - Inspection Rules
 *
 * Code inspection rules for detecting potential issues.
 */

import { string } from '@natural-js/core';
import type { InspectionRule, InspectionReportItem } from '../types.js';

/**
 * Severity levels for inspection results
 */
export const SeverityLevels = Object.freeze({
  BLOCKER: { name: 'Blocker', color: 'darkred', logger: console.error },
  CRITICAL: { name: 'Critical', color: 'red', logger: console.error },
  MAJOR: { name: 'Major', color: 'orange', logger: console.warn },
  MINOR: { name: 'Minor', color: 'black', logger: console.log },
});

/**
 * Get script content from HTML codes
 */
function getScriptContent(codes: string): string {
  try {
    const startIndex = codes.indexOf('<script');
    const endIndex = codes.indexOf('</script>');
    if (startIndex >= 0 && endIndex > startIndex) {
      return codes.substring(startIndex, endIndex);
    }
  } catch {
    // Ignore parsing errors
  }
  return '';
}

/**
 * Rule: NoContextSpecifiedInSelector
 *
 * Detects code that does not specify view in the context of jQuery/N() Selector.
 * This can lead to selecting elements outside the controller's view scope.
 */
export const NoContextSpecifiedInSelector: InspectionRule = (
  codes: string,
  excludes: string[],
  report: InspectionReportItem[]
): void => {
  const regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(codes)) !== null) {
    let isExclude = false;

    // Check excludes list
    for (const str of excludes) {
      if (match[0].includes(str)) {
        isExclude = true;
        break;
      }
    }

    // Check if view context is specified
    if (match.length > 2 && match[2] && match[2].replace(/ /g, '').includes('view)')) {
      isExclude = true;
    }

    // Skip comments
    if (string.startsWith(match[0], '//')) {
      isExclude = true;
    }

    // Selector excludes
    const selector = string.trimToEmpty(match[1]).replace(/ /g, '');
    if (/^["']/g.test(selector)) {
      if (!isExclude) {
        // Exclude common safe patterns
        if (/[\(\)]|,view|,cont\.view|",|',|^"<|^'<|>"$|>'$|html|body/g.test(selector)) {
          isExclude = true;
        }

        // Check for string concatenation without context
        if (!/,view|,cont.view/g.test(selector) && /"\+|'\+|\+"|\+'/g.test(selector)) {
          isExclude = false;
        }
      }

      // Method excludes - component initializations
      if (!isExclude && match[2]) {
        const method = match[2];
        if (
          /^\.cont\(|^\.comm\(|^\.select\(|^\.form\(|^\.list\(|^\.grid\(|^\.pagination\(|^\.tree\(|^\.instance\(/g.test(
            method
          )
        ) {
          isExclude = true;
        }
      }

      // Report if not excluded and in script
      if (!isExclude) {
        const script = getScriptContent(codes);
        if (script.includes(match[0])) {
          report.push({
            level: SeverityLevels.CRITICAL.name,
            message:
              'Selector without context specified. Use N(selector, view) or N(selector, cont.view) instead.',
            line: codes.substring(0, regex.lastIndex).split('\n').length,
            code: match[0],
          });
        }
      }
    }
  }
};

/**
 * Rule: UseTheComponentsValMethod
 *
 * Detects code using jQuery's val method instead of the val method of the Natural-UI component.
 * Using component's val() ensures proper data binding and state management.
 */
export const UseTheComponentsValMethod: InspectionRule = (
  codes: string,
  excludes: string[],
  report: InspectionReportItem[]
): void => {
  const regex = /\/{2}.*|[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(codes)) !== null) {
    let isExclude = false;

    // Check excludes list
    for (const str of excludes) {
      if (match[0].includes(str)) {
        isExclude = true;
        break;
      }
    }

    // Exclude getter calls (no arguments)
    if (!isExclude) {
      const args = match[2];
      if (string.isEmpty(args)) {
        isExclude = true;
      }
    }

    // Skip comments
    if (string.startsWith(match[0], '//')) {
      isExclude = true;
    }

    // Report if not excluded and in script
    if (!isExclude) {
      const script = getScriptContent(codes);
      if (script.includes(match[0])) {
        report.push({
          level: SeverityLevels.MAJOR.name,
          message:
            "Use the component's val() method instead of jQuery's val(). Example: form.val('fieldName', value)",
          line: codes.substring(0, regex.lastIndex).split('\n').length,
          code: match[0],
        });
      }
    }
  }
};

/**
 * All available inspection rules
 */
export const rules: Record<string, InspectionRule> = {
  NoContextSpecifiedInSelector,
  UseTheComponentsValMethod,
};

export default rules;

