/**
 * @natural-js/code - Inspection Rules Tests
 */

import { describe, it, expect } from 'vitest';
import { NoContextSpecifiedInSelector, UseTheComponentsValMethod, SeverityLevels } from './rules.js';
import type { InspectionReportItem } from '../types.js';

describe('Inspection Rules', () => {
  describe('SeverityLevels', () => {
    it('should have BLOCKER level', () => {
      expect(SeverityLevels.BLOCKER.name).toBe('Blocker');
      expect(SeverityLevels.BLOCKER.color).toBe('darkred');
    });

    it('should have CRITICAL level', () => {
      expect(SeverityLevels.CRITICAL.name).toBe('Critical');
      expect(SeverityLevels.CRITICAL.color).toBe('red');
    });

    it('should have MAJOR level', () => {
      expect(SeverityLevels.MAJOR.name).toBe('Major');
      expect(SeverityLevels.MAJOR.color).toBe('orange');
    });

    it('should have MINOR level', () => {
      expect(SeverityLevels.MINOR.name).toBe('Minor');
      expect(SeverityLevels.MINOR.color).toBe('black');
    });
  });

  describe('NoContextSpecifiedInSelector', () => {
    it('should detect selector without context', () => {
      const codes = `
        <html>
        <script>
          const el = N("#myElement");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBeGreaterThan(0);
      expect(report[0].level).toBe('Critical');
    });

    it('should not report selector with view context', () => {
      const codes = `
        <html>
        <script>
          const el = N("#myElement", view);
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should not report selector with cont.view context', () => {
      const codes = `
        <html>
        <script>
          const el = N("#myElement", cont.view);
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should exclude commented code', () => {
      const codes = `
        <html>
        <script>
          // const el = N("#myElement");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should exclude jQuery creation syntax', () => {
      const codes = `
        <html>
        <script>
          const el = N("<div>");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should exclude component initializations', () => {
      const codes = `
        <html>
        <script>
          const form = N("#myForm").form({});
          const list = N("#myList").list({});
          const grid = N("#myGrid").grid({});
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should respect excludes list', () => {
      const codes = `
        <html>
        <script>
          const el = N("#specialElement");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, ['specialElement'], report);

      expect(report.length).toBe(0);
    });

    it('should exclude html selector', () => {
      const codes = `
        <html>
        <script>
          const el = N("html");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should exclude body selector', () => {
      const codes = `
        <html>
        <script>
          const el = N("body");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should return nothing for code without script', () => {
      const codes = `
        <html>
        <body>
          <div id="test"></div>
        </body>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      NoContextSpecifiedInSelector(codes, [], report);

      expect(report.length).toBe(0);
    });
  });

  describe('UseTheComponentsValMethod', () => {
    it('should detect val() with arguments', () => {
      const codes = `
        <html>
        <script>
          N("#myInput").val("test");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      UseTheComponentsValMethod(codes, [], report);

      expect(report.length).toBeGreaterThan(0);
      expect(report[0].level).toBe('Major');
    });

    it('should not report val() getter (no arguments)', () => {
      const codes = `
        <html>
        <script>
          const value = N("#myInput").val();
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      UseTheComponentsValMethod(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should exclude commented code', () => {
      const codes = `
        <html>
        <script>
          // N("#myInput").val("test");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      UseTheComponentsValMethod(codes, [], report);

      expect(report.length).toBe(0);
    });

    it('should respect excludes list', () => {
      const codes = `
        <html>
        <script>
          N("#specialInput").val("test");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      UseTheComponentsValMethod(codes, ['specialInput'], report);

      expect(report.length).toBe(0);
    });

    it('should detect multiple val() calls', () => {
      const codes = `
        <html>
        <script>
          N("#input1").val("value1");
          N("#input2").val("value2");
        </script>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      UseTheComponentsValMethod(codes, [], report);

      expect(report.length).toBe(2);
    });

    it('should include line number in report', () => {
      const codes = `<html>
<script>
const x = 1;
N("#myInput").val("test");
</script>
</html>`;
      const report: InspectionReportItem[] = [];

      UseTheComponentsValMethod(codes, [], report);

      expect(report.length).toBe(1);
      expect(report[0].line).toBe(4);
    });

    it('should return nothing for code without script', () => {
      const codes = `
        <html>
        <body>
          <input id="test" value="hello" />
        </body>
        </html>
      `;
      const report: InspectionReportItem[] = [];

      UseTheComponentsValMethod(codes, [], report);

      expect(report.length).toBe(0);
    });
  });
});

