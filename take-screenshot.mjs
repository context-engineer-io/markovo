import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000); // Wait for page to fully load

  await page.screenshot({
    path: '/Users/dkclnoha/topres/intent/header-alignment-fixed.png',
    fullPage: false
  });

  await browser.close();
  console.log('Screenshot saved to /Users/dkclnoha/topres/intent/header-alignment-fixed.png');
})();
