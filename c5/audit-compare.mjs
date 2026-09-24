import { chromium } from 'playwright-core';

const shotDir = '/private/tmp/claude-502/-Users-lneri-Developer-UXT-acuity-prototypes/818f3d32-41c6-47ce-8ff3-bb385cc8cdfd/scratchpad/audit';
import { mkdirSync } from 'node:fs';
mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

const VIEWPORT = { width: 390, height: 844 };

// ─── c3_c1 (original) ──────────────────────────────────────────────────────
async function auditOriginal() {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto('http://localhost:5173/c3_c1/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shotDir}/orig-01-s1.png` });

  await page.click('.bottom-nav >> text=Start setup');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/orig-02-s2.png` });

  await page.click('.industry-card >> text=Wellness');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/orig-03-s3.png` });

  await page.click('.spec-chip-large >> text=Massage');
  await page.waitForTimeout(2500); // s4 loading -> auto to s5
  await page.screenshot({ path: `${shotDir}/orig-04-s5.png` });

  // Add first available suggestion
  await page.click('#s5-available .appt-icon-btn--add >> nth=0');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${shotDir}/orig-05-s5-added.png` });

  // Open edit sheet on selected card
  await page.click('#s5-selected .appt-card >> nth=0');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/orig-06-s5-edit-sheet.png` });
  await page.click('#sheet-close-btn, .sheet-close-btn, [aria-label="Close"]').catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});

  await page.click('#s5-continue').catch(async () => {
    await page.click('text=Continue with selection');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shotDir}/orig-07-s9.png` });

  // open avail card
  await page.click('.avail-card >> nth=0').catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/orig-08-s9-avail-open.png` });
  await page.keyboard.press('Escape').catch(() => {});

  await page.click('text=Finish').catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shotDir}/orig-09-s10.png` });

  await page.click('.style-pickers-row .swatch-fan-pill, .swatch-fan-pill').catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/orig-10-s10-palette-open.png` });
  await page.keyboard.press('Escape').catch(() => {});

  await page.click('text=Finish setup').catch(() => {});
  await page.waitForTimeout(2200); // s_loading_home -> s_home
  await page.screenshot({ path: `${shotDir}/orig-11-s-home.png` });

  await page.close();
}

// ─── c5 (Vue port) ──────────────────────────────────────────────────────────
async function auditPort() {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForURL('**/v1/s1');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shotDir}/c5-01-s1.png` });

  await page.click('text=Start setup');
  await page.waitForURL('**/s2');
  await page.waitForTimeout(1200); // templates fetch
  await page.screenshot({ path: `${shotDir}/c5-02-s2.png` });

  await page.click('label:has-text("Wellness")');
  await page.waitForURL('**/s3');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/c5-03-s3.png` });

  await page.click('label:has-text("Massage")');
  await page.waitForURL('**/s5', { timeout: 5000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shotDir}/c5-04-s5.png` });

  await page.click('.acuity-appointment-card--ai >> nth=0 >> button[aria-label="Add"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/c5-05-s5-added.png` });

  await page.click('.acuity-appointment-card--selected-item >> nth=0');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/c5-06-s5-edit-sheet.png` });
  await page.click('button:has-text("Cancel")').catch(() => {});

  await page.click('button:has-text("Continue with selection")');
  await page.waitForURL('**/s9');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/c5-07-s9.png` });

  await page.click('.avail-card');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/c5-08-s9-avail-open.png` });
  await page.click('button:has-text("Cancel")').catch(() => {});

  await page.click('button:has-text("Finish")');
  await page.waitForURL('**/s10');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/c5-09-s10.png` });

  await page.click('.style-row__pill >> nth=0, button[aria-label="Choose color theme"]').catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/c5-10-s10-palette-open.png` });
  await page.click('button[aria-label="Close"]').catch(() => {});

  await page.locator('button:has-text("Finish setup")').first().click();
  await page.waitForURL('**/s_home');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/c5-11-s-home.png` });

  await page.close();
}

await auditOriginal();
await auditPort();
await browser.close();
console.log('done, screenshots in', shotDir);
