/**
 * @natural-js/code - Inspection Report
 *
 * Report utilities for code inspection results.
 */

import { isBrowser, getWindow } from '@natural-js/shared';
import { is as browserIs } from '@natural-js/core';
import type { InspectionReportItem } from '../types.js';
import { SeverityLevels } from './rules.js';

/**
 * Report inspection results to console
 */
export function consoleReport(
  data: InspectionReportItem[] | undefined,
  url: string,
  abortOnError = false
): void {
  if (!data || data.length === 0) {
    return;
  }

  for (const item of data) {
    const levelKey = item.level.toUpperCase() as keyof typeof SeverityLevels;
    const levelDef = SeverityLevels[levelKey];

    if (!levelDef) {
      console.warn('Unknown severity level:', item.level);
      continue;
    }

    const message = `[${item.level}] ${url} - ${item.line} : ${item.code}\n${item.message}\n\n`;

    // Throw error for BLOCKER/CRITICAL if abortOnError is enabled
    if (
      abortOnError &&
      (item.level === SeverityLevels.BLOCKER.name ||
        item.level === SeverityLevels.CRITICAL.name)
    ) {
      throw new Error(message);
    }

    // Log with color in modern browsers
    if (isBrowser() && !browserIs('ie')) {
      levelDef.logger(
        `%c[${item.level}] ${url} - ${item.line} : ${item.code}`,
        `color: ${levelDef.color}; font-weight: bold; line-height: 200%;`,
        `\n${item.message}`
      );
    } else {
      levelDef.logger(
        `[${item.level}] ${url} - ${item.line} : ${item.code}`,
        `\n${item.message}`
      );
    }
  }
}

/**
 * Report inspection results as HTML
 */
export function htmlReport(
  data: InspectionReportItem[] | undefined,
  url: string
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const rows = data
    .map((item) => {
      const levelKey = item.level.toUpperCase() as keyof typeof SeverityLevels;
      const color = SeverityLevels[levelKey]?.color || 'black';

      return `
      <tr>
        <td style="color: ${color}; font-weight: bold;">${item.level}</td>
        <td>${item.line}</td>
        <td><code>${escapeHtml(item.code)}</code></td>
        <td>${escapeHtml(item.message)}</td>
      </tr>
    `;
    })
    .join('');

  return `
    <div class="inspection-report">
      <h3>Code Inspection Report: ${escapeHtml(url)}</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th>Level</th>
            <th>Line</th>
            <th>Code</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p>Total issues: ${data.length}</p>
    </div>
  `;
}

/**
 * Report inspection results as JSON
 */
export function jsonReport(
  data: InspectionReportItem[] | undefined,
  url: string
): string {
  return JSON.stringify(
    {
      url,
      issues: data || [],
      totalCount: data?.length || 0,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Display report in a popup window
 */
export function popupReport(
  data: InspectionReportItem[] | undefined,
  url: string
): void {
  if (!isBrowser()) {
    console.warn('Popup report is only available in browser environment');
    return;
  }

  const win = getWindow();
  if (!win) return;

  const html = htmlReport(data, url);
  const popup = win.open('', 'InspectionReport', 'width=800,height=600,scrollbars=yes');

  if (popup) {
    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Code Inspection Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; }
            code { background: #f5f5f5; padding: 2px 4px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    popup.document.close();
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const report = {
  console: consoleReport,
  html: htmlReport,
  json: jsonReport,
  popup: popupReport,
};

export default report;

