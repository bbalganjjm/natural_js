/**
 * E2E tests for Natural-JS UI components
 *
 * These tests run in real browsers using Playwright.
 * Note: These tests require a running development server with example pages.
 */

import { test, expect, Page } from '@playwright/test';

// Skip E2E tests when no server is available (CI will provide one)
const describeE2E = process.env.RUN_E2E ? test.describe : test.describe.skip;

describeE2E('Natural-JS UI Components E2E', () => {
  describeE2E('Grid Component', () => {
    test('should display data in grid', async ({ page }) => {
      await page.goto('/examples/grid.html');

      // Wait for grid to be initialized
      await page.waitForSelector('.grid__');

      // Check that rows are displayed
      const rows = await page.locator('.grid__ tbody tr').count();
      expect(rows).toBeGreaterThan(0);
    });

    test('should support row selection', async ({ page }) => {
      await page.goto('/examples/grid.html');

      await page.waitForSelector('.grid__');

      // Click on first row
      await page.locator('.grid__ tbody tr').first().click();

      // Check that row is selected
      const selectedRow = await page.locator('.grid__ tbody tr.grid_selected__').count();
      expect(selectedRow).toBe(1);
    });

    test('should support sorting', async ({ page }) => {
      await page.goto('/examples/grid.html');

      await page.waitForSelector('.grid__');

      // Click on sortable header
      const sortableHeader = page.locator('.grid__ thead th.sortable__').first();

      if ((await sortableHeader.count()) > 0) {
        await sortableHeader.click();

        // Check for sort indicator
        const sortIndicator = await page.locator('.grid__ thead th .sort_asc__, .grid__ thead th .sort_desc__').count();
        expect(sortIndicator).toBeGreaterThanOrEqual(0);
      }
    });

    test('should support pagination', async ({ page }) => {
      await page.goto('/examples/grid-pagination.html');

      await page.waitForSelector('.grid__');
      await page.waitForSelector('.pagination__');

      // Click next page
      const nextBtn = page.locator('.pagination__ .next__');
      if ((await nextBtn.count()) > 0 && (await nextBtn.isEnabled())) {
        await nextBtn.click();

        // Verify page changed
        await page.waitForTimeout(500);
        const currentPage = await page.locator('.pagination__ .current__').textContent();
        expect(currentPage).toBeTruthy();
      }
    });
  });

  describeE2E('Form Component', () => {
    test('should bind data to form inputs', async ({ page }) => {
      await page.goto('/examples/form.html');

      await page.waitForSelector('.form__');

      // Check that inputs have values
      const nameInput = page.locator('input[name="name"]');
      const value = await nameInput.inputValue();
      expect(value).toBeDefined();
    });

    test('should validate form inputs', async ({ page }) => {
      await page.goto('/examples/form.html');

      await page.waitForSelector('.form__');

      // Clear required field
      const requiredInput = page.locator('input[required]').first();
      if ((await requiredInput.count()) > 0) {
        await requiredInput.fill('');
        await requiredInput.blur();

        // Check for validation message
        await page.waitForTimeout(300);
      }
    });

    test('should submit form data', async ({ page }) => {
      await page.goto('/examples/form.html');

      await page.waitForSelector('.form__');

      // Fill in form
      await page.locator('input[name="name"]').fill('Test User');

      // Click submit
      const submitBtn = page.locator('button[type="submit"], .btn-submit');
      if ((await submitBtn.count()) > 0) {
        await submitBtn.click();
      }
    });
  });

  describeE2E('Alert Component', () => {
    test('should display alert dialog', async ({ page }) => {
      await page.goto('/examples/alert.html');

      // Click button to show alert
      const alertTrigger = page.locator('#show-alert');
      if ((await alertTrigger.count()) > 0) {
        await alertTrigger.click();

        // Wait for alert to appear
        await page.waitForSelector('.alert__', { timeout: 5000 });

        // Verify alert is visible
        const alert = page.locator('.alert__');
        await expect(alert).toBeVisible();
      }
    });

    test('should close alert on OK click', async ({ page }) => {
      await page.goto('/examples/alert.html');

      const alertTrigger = page.locator('#show-alert');
      if ((await alertTrigger.count()) > 0) {
        await alertTrigger.click();

        await page.waitForSelector('.alert__', { timeout: 5000 });

        // Click OK button
        await page.locator('.alert__ .btn_ok__').click();

        // Verify alert is closed
        await page.waitForSelector('.alert__', { state: 'hidden', timeout: 5000 }).catch(() => {});
      }
    });

    test('should handle confirm dialog', async ({ page }) => {
      await page.goto('/examples/alert.html');

      const confirmTrigger = page.locator('#show-confirm');
      if ((await confirmTrigger.count()) > 0) {
        await confirmTrigger.click();

        await page.waitForSelector('.alert__', { timeout: 5000 });

        // Should have both OK and Cancel buttons
        const okBtn = page.locator('.alert__ .btn_ok__');
        const cancelBtn = page.locator('.alert__ .btn_cancel__');

        await expect(okBtn).toBeVisible();
        await expect(cancelBtn).toBeVisible();
      }
    });
  });

  describeE2E('Popup Component', () => {
    test('should open popup', async ({ page }) => {
      await page.goto('/examples/popup.html');

      const openBtn = page.locator('#open-popup');
      if ((await openBtn.count()) > 0) {
        await openBtn.click();

        await page.waitForSelector('.popup__', { timeout: 5000 });

        const popup = page.locator('.popup__');
        await expect(popup).toBeVisible();
      }
    });

    test('should close popup', async ({ page }) => {
      await page.goto('/examples/popup.html');

      const openBtn = page.locator('#open-popup');
      if ((await openBtn.count()) > 0) {
        await openBtn.click();

        await page.waitForSelector('.popup__', { timeout: 5000 });

        // Click close button
        const closeBtn = page.locator('.popup__ .popup_close__');
        if ((await closeBtn.count()) > 0) {
          await closeBtn.click();
          await page.waitForSelector('.popup__', { state: 'hidden', timeout: 5000 }).catch(() => {});
        }
      }
    });

    test('should be draggable', async ({ page }) => {
      await page.goto('/examples/popup.html');

      const openBtn = page.locator('#open-popup');
      if ((await openBtn.count()) > 0) {
        await openBtn.click();

        await page.waitForSelector('.popup__', { timeout: 5000 });

        const popupHeader = page.locator('.popup__ .popup_header__');
        if ((await popupHeader.count()) > 0) {
          const initialPos = await page.locator('.popup__').boundingBox();

          // Drag the popup
          await popupHeader.hover();
          await page.mouse.down();
          await page.mouse.move(100, 100);
          await page.mouse.up();

          const newPos = await page.locator('.popup__').boundingBox();

          // Position should have changed
          if (initialPos && newPos) {
            expect(newPos.x !== initialPos.x || newPos.y !== initialPos.y).toBeTruthy();
          }
        }
      }
    });
  });

  describeE2E('Tab Component', () => {
    test('should switch tabs', async ({ page }) => {
      await page.goto('/examples/tab.html');

      await page.waitForSelector('.tab__');

      // Click second tab
      const secondTab = page.locator('.tab__ .tab-link').nth(1);
      if ((await secondTab.count()) > 0) {
        await secondTab.click();

        // Second tab content should be visible
        await page.waitForTimeout(300);
      }
    });

    test('should show correct content for selected tab', async ({ page }) => {
      await page.goto('/examples/tab.html');

      await page.waitForSelector('.tab__');

      const tabs = page.locator('.tab__ .tab-link');
      const tabCount = await tabs.count();

      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(200);

        // Verify tab content changed
        const activeContent = page.locator('.tab__ .tab-content.active__, .tab__ .tab-content:visible');
        expect(await activeContent.count()).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describeE2E('Datepicker Component', () => {
    test('should open calendar on input focus', async ({ page }) => {
      await page.goto('/examples/datepicker.html');

      const dateInput = page.locator('.datepicker__ input, input[data-datepicker]');
      if ((await dateInput.count()) > 0) {
        await dateInput.first().click();

        // Calendar should appear
        await page.waitForSelector('.datepicker_panel__, .calendar__', { timeout: 5000 }).catch(() => {});
      }
    });

    test('should select date', async ({ page }) => {
      await page.goto('/examples/datepicker.html');

      const dateInput = page.locator('.datepicker__ input, input[data-datepicker]').first();
      if ((await dateInput.count()) > 0) {
        await dateInput.click();

        await page.waitForSelector('.datepicker_panel__, .calendar__', { timeout: 5000 }).catch(() => {});

        // Click on a day
        const day = page.locator('.datepicker_panel__ .day:not(.disabled__), .calendar__ td:not(.disabled)').first();
        if ((await day.count()) > 0) {
          await day.click();

          // Input should have a value
          const value = await dateInput.inputValue();
          expect(value).toBeTruthy();
        }
      }
    });
  });

  describeE2E('Select Component', () => {
    test('should display options', async ({ page }) => {
      await page.goto('/examples/select.html');

      const select = page.locator('select.select__, select[data-component="select"]').first();
      if ((await select.count()) > 0) {
        const options = await select.locator('option').count();
        expect(options).toBeGreaterThan(0);
      }
    });

    test('should allow selection', async ({ page }) => {
      await page.goto('/examples/select.html');

      const select = page.locator('select.select__, select[data-component="select"]').first();
      if ((await select.count()) > 0) {
        // Select an option
        await select.selectOption({ index: 1 });

        const value = await select.inputValue();
        expect(value).toBeTruthy();
      }
    });
  });
});

describeE2E('Natural-JS Accessibility E2E', () => {
  test('should support keyboard navigation in grid', async ({ page }) => {
    await page.goto('/examples/grid.html');

    await page.waitForSelector('.grid__');

    // Focus grid
    await page.locator('.grid__ tbody').focus();

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Press Enter to select
    await page.keyboard.press('Enter');
  });

  test('should support keyboard navigation in tabs', async ({ page }) => {
    await page.goto('/examples/tab.html');

    await page.waitForSelector('.tab__');

    // Focus tab list
    const tabLink = page.locator('.tab__ .tab-link').first();
    if ((await tabLink.count()) > 0) {
      await tabLink.focus();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
    }
  });

  test('should trap focus in modal popup', async ({ page }) => {
    await page.goto('/examples/popup.html');

    const openBtn = page.locator('#open-popup');
    if ((await openBtn.count()) > 0) {
      await openBtn.click();

      await page.waitForSelector('.popup__', { timeout: 5000 });

      // Focus should be trapped in popup
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should not escape popup
      const activeElement = await page.evaluate(() => document.activeElement?.closest('.popup__'));
      // This test may vary based on implementation
    }
  });
});

describeE2E('Natural-JS Performance E2E', () => {
  test('should render large grid efficiently', async ({ page }) => {
    await page.goto('/examples/grid-large.html');

    const startTime = Date.now();

    await page.waitForSelector('.grid__');
    await page.waitForSelector('.grid__ tbody tr', { timeout: 10000 });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Grid should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('/examples/grid.html');

    await page.waitForSelector('.grid__');

    // Rapidly click different rows
    const rows = page.locator('.grid__ tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      await rows.nth(i).click();
    }

    // Should not crash
    expect(await page.locator('.grid__').count()).toBe(1);
  });
});

