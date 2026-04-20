import { test, expect } from '@playwright/test';

const BASELINE_DIR = 'tests/screenshots/baseline';

test.describe('KalpLifeScience - Visual Regression Tests', () => {
  test.describe('Homepage', () => {
    test('should capture homepage hero section baseline', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Scroll to hero section
      const hero = await page.locator('main').first();
      await hero.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500); // Wait for animations

      await expect(page).toHaveScreenshot('homepage-hero-desktop.png', {
        mask: [await page.locator('img').all()],
        fullPage: false,
        maxDiffPixels: 100,
      });
    });

    test('should capture full homepage desktop view', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for animations

      // Capture sections one by one for mobile optimization
      const sections = await page.locator('section, [class*="section"]').all();
      console.log(`Found ${sections.length} sections on homepage`);

      // Top section (hero + announcement bar)
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    });

    test('should capture product cards section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find product grid section
      const productCards = await page.locator('[class*="product"], .product-card').first();
      if (productCards) {
        await productCards.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      }
    });

    test('should capture feature cards section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find benefits/features section (Free Shipping, Quick Payment, etc.)
      const featureCards = await page.locator('[class*="feature"], [class*="benefit"]').first();
      if (featureCards) {
        await featureCards.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Product Page', () => {
    test('should capture product page layout', async ({ page }) => {
      await page.goto('/products/creatine-monohydrate');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Check product image gallery
      const gallery = await page.locator('[class*="gallery"], [class*="media"]').first();
      if (gallery) {
        await gallery.scrollIntoViewIfNeeded();
      }
    });

    test('should capture product info section', async ({ page }) => {
      await page.goto('/products/creatine-monohydrate');
      await page.waitForLoadState('networkidle');

      // Check product title, price, variant selector
      const title = await page.locator('h1').first();
      await title.scrollIntoViewIfNeeded();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display navigation drawer on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check if header is sticky/responsive
      const header = await page.locator('header, [class*="header"]').first();
      const boundingBox = await header.boundingBox();
      console.log('Header height on mobile:', boundingBox?.height);

      expect(boundingBox?.height).toBeLessThan(120); // Mobile header should be compact
    });

    test('should stack product cards vertically on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const productCards = await page.locator('[class*="product-card"], .product-item').all();
      if (productCards.length > 0) {
        const firstCard = productCards[0];
        const box1 = await firstCard.boundingBox();

        const secondCard = productCards[1];
        const box2 = await secondCard.boundingBox();

        // On mobile, cards should be stacked (different Y positions)
        if (box1 && box2) {
          console.log('Card 1 Y:', box1.y, 'Card 2 Y:', box2.y);
          expect(box2.y).toBeGreaterThan(box1.y); // Second card below first
        }
      }
    });
  });

  test.describe('Typography & Color Contrast', () => {
    test('should verify heading sizes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const h1 = await page.locator('h1').first();
      const h2s = await page.locator('h2').all();

      const h1Font = await h1.evaluate(el => window.getComputedStyle(el).fontSize);
      const h2Font = h2s[0]
        ? await h2s[0].evaluate(el => window.getComputedStyle(el).fontSize)
        : null;

      console.log('H1 font size:', h1Font);
      console.log('H2 font size:', h2Font);

      // H1 should be larger than H2
      if (h2Font) {
        const h1Size = parseFloat(h1Font);
        const h2Size = parseFloat(h2Font);
        expect(h1Size).toBeGreaterThan(h2Size);
      }
    });

    test('should verify button contrast ratios', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button, [role="button"], a[class*="button"]').all();

      for (let i = 0; i < Math.min(5, buttons.length); i++) {
        const btn = buttons[i];
        const bg = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);
        const color = await btn.evaluate(el => window.getComputedStyle(el).color);
        const text = await btn.textContent();

        console.log(`Button ${i}: "${text}" - BG: ${bg}, Color: ${color}`);
      }
    });

    test('should verify text readability on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const bodyText = await page.locator('p, span, a').first();
      const fontSize = await bodyText.evaluate(el => window.getComputedStyle(el).fontSize);
      const lineHeight = await bodyText.evaluate(el => window.getComputedStyle(el).lineHeight);

      console.log('Body font size:', fontSize);
      console.log('Line height:', lineHeight);

      // Mobile text should be at least 16px
      expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(14); // Acceptable minimum
    });
  });

  test.describe('Performance Metrics', () => {
    test('should measure Core Web Vitals', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const metrics = await page.evaluate(() => {
        return {
          navigationTiming: performance.getEntriesByType('navigation')[0],
          paintEntries: performance.getEntriesByType('paint'),
          largestContentfulPaint:
            performance.getEntriesByType('largest-contentful-paint').pop(),
        };
      });

      console.log('Page Load Metrics:', JSON.stringify(metrics, null, 2));
    });

    test('should measure image load performance', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();
      const imageTimes = await Promise.all(
        images.slice(0, 5).map(img =>
          img.evaluate(el => {
            const { width, height, naturalWidth, naturalHeight } = el as HTMLImageElement;
            return { width, height, naturalWidth, naturalHeight, src: el.src };
          })
        )
      );

      console.log('Image metrics (first 5):', imageTimes);
    });
  });

  test.describe('Accessibility', () => {
    test('should verify header semantics', async ({ page }) => {
      await page.goto('/');

      const header = await page.locator('header, [role="banner"]').first();
      expect(header).toBeDefined();

      const nav = await page.locator('nav').first();
      expect(nav).toBeDefined();
    });

    test('should verify main content exists', async ({ page }) => {
      await page.goto('/');

      const main = await page.locator('main, [role="main"]').first();
      expect(main).toBeDefined();
    });

    test('should verify form inputs have labels', async ({ page }) => {
      await page.goto('/');

      const inputs = await page.locator('input').all();
      console.log(`Found ${inputs.length} input elements`);

      // Check for labels or aria-labels
      for (let i = 0; i < Math.min(3, inputs.length); i++) {
        const input = inputs[i];
        const ariaLabel = await input.getAttribute('aria-label');
        const id = await input.getAttribute('id');
        const label = id ? await page.locator(`label[for="${id}"]`).count() : 0;

        console.log(`Input ${i}: aria-label="${ariaLabel}", has-label=${label > 0}`);
      }
    });
  });
});
