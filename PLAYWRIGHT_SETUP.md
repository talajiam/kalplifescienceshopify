# Playwright Visual Regression Testing Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Visual Regression Tests
```bash
npm run test:visual
```

### 3. View Test Report
```bash
npm run test:report
```

---

## Available Test Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests across Chrome, mobile Chrome, and Safari |
| `npm run test:visual` | Run visual regression tests only |
| `npm run test:report` | View HTML test report from last run |
| `npm run test:debug` | Run tests in debug mode (step through code) |
| `npm run test:ui` | Run tests with interactive UI mode |
| `npm run test:chromium` | Run tests on Chromium only (faster) |
| `npm run test:mobile` | Run tests on mobile Chrome viewport |

---

## Test Structure

**Test File**: `tests/e2e/visual-regression.spec.ts`

### Test Categories

1. **Homepage** - Hero, product cards, feature cards, full page
2. **Product Page** - Product layout, gallery, info section
3. **Mobile Responsiveness** - Header, navigation, product cards on mobile
4. **Typography & Contrast** - Font sizes, contrast ratios, readability
5. **Performance Metrics** - Core Web Vitals, image load times
6. **Accessibility** - Header semantics, forms, labels

---

## How Visual Regression Works

1. **Baseline Capture**: First run captures baseline screenshots
2. **Comparison**: Subsequent runs compare new screenshots against baseline
3. **Diff Report**: Failed tests show pixel differences highlighted in red
4. **Approval**: Review diffs and approve or reject changes

### Baseline Screenshot Storage
```
tests/screenshots/baseline/
├── homepage-hero-desktop.png
├── product-page-layout.png
├── mobile-header.png
└── ...
```

---

## Configuration

**File**: `playwright.config.ts`

Key settings:
- **baseURL**: https://kalplifescience.com
- **Projects**: Chromium, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- **Timeout**: 30 seconds per test
- **Screenshots**: On failure only
- **Traces**: On first retry (for debugging)

---

## CI/CD Integration

For GitHub Actions or other CI platforms:

```yaml
- name: Install Dependencies
  run: npm install

- name: Run Visual Tests
  run: npm run test:visual

- name: Upload Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Debugging Failed Tests

### 1. Run with Debugger
```bash
npm run test:debug
```
This opens a debugger where you can step through each test.

### 2. Run with UI
```bash
npm run test:ui
```
Interactive interface showing test execution in real-time.

### 3. Run Single Test
```bash
npx playwright test --grep "should capture homepage hero"
```

### 4. Slow Motion Mode
```bash
npx playwright test --headed --slow-mo 1000
```
Run in browser with 1-second delay between actions.

---

## Visual Regression Workflow

### Initial Setup (First Time)
```bash
npm install
npm run test:visual  # Creates baseline screenshots
```

### After CSS Changes
```bash
npm run test:visual  # Compares new screenshots
npm run test:report  # View differences
```

If changes are intentional:
1. Review the diff report
2. If approved, update baseline: `npx playwright test --update-snapshots`
3. Commit baseline images to git

### Handling Failed Tests

**Option 1: Review & Approve**
```bash
npm run test:report  # View HTML report
# Review screenshot differences
npx playwright test --update-snapshots  # Approve changes
```

**Option 2: Investigate & Fix**
```bash
npm run test:debug  # Debug the test
# Fix CSS/HTML issues
npm run test:visual  # Retest
```

---

## Test Output Examples

### Successful Test Run
```
✓ KalpLifeScience - Visual Regression Tests > Homepage > should capture homepage hero section baseline
✓ KalpLifeScience - Visual Regression Tests > Product Page > should capture product page layout
✓ KalpLifeScience - Visual Regression Tests > Mobile Responsiveness > should display navigation drawer on mobile

3 passed (2.3s)
```

### Failed Visual Test
```
✗ KalpLifeScience - Visual Regression Tests > Homepage > should capture homepage hero section baseline
  Error: Screenshot comparison failed: 45 pixels differ

Run with --update-snapshots to accept the new baseline
```

---

## Extending Tests

### Add a New Visual Test
```typescript
test('should capture new section', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const section = await page.locator('[class*="new-section"]').first();
  if (section) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('new-section-desktop.png');
  }
});
```

### Add a Custom Test
```typescript
test('should verify custom functionality', async ({ page }) => {
  await page.goto('/');

  const button = await page.locator('button:has-text("Click Me")');
  await button.click();

  const result = await page.locator('.result-text');
  await expect(result).toContainText('Success');
});
```

---

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`: `timeout: 60000`
- Or per test: `test.setTimeout(60000)`

### Screenshots Don't Match
- Might be due to animations/random content
- Add waits: `await page.waitForTimeout(500)`
- Or stabilize selectors: `await page.waitForLoadState('networkidle')`

### Mobile Tests Fail on Desktop
- Tests are device-specific, run with correct project:
  ```bash
  npx playwright test --project=mobile-chrome
  ```

### Baseline Images Missing
- Regenerate baseline (first run):
  ```bash
  npx playwright test --update-snapshots
  ```

---

## Best Practices

1. **Always add waits before screenshots**
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(500);  // Wait for animations
   ```

2. **Use meaningful test names**
   - ✅ `should capture homepage hero section on desktop`
   - ❌ `test 1`

3. **Test critical user paths**
   - Hero section visibility
   - Product cards rendering
   - Mobile navigation
   - Button interactions

4. **Keep tests deterministic**
   - Avoid tests that depend on current time/date
   - Stabilize animations (wait for completion)
   - Mock random content if possible

5. **Review diffs manually**
   - Small pixel differences might be font rendering differences
   - Always check report before approving baseline updates

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

---

**Last Updated**: April 18, 2026  
**For questions**: Refer to `tests/AUDIT_FINDINGS.md` for detailed UI recommendations
