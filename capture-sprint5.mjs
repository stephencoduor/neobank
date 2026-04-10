import { chromium } from 'playwright';

const NEOBANK_URL = 'http://localhost:5173';
const DISBURSEPRO_URL = 'http://localhost:5175';

const neobankPages = [
  { path: '/payments/qr', name: '58-qr-payments-scan' },
  { path: '/cards', name: '59-cards-list-wired' },
  { path: '/cards/CARD-V-001', name: '60-card-detail-virtual' },
  { path: '/merchant', name: '61-merchant-dashboard-wired' },
];

async function capture(baseUrl, pages, outputDir) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  for (const p of pages) {
    try {
      await page.goto(`${baseUrl}${p.path}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(3000);
      const filename = `${outputDir}/${p.name}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`✓ ${filename}`);
    } catch (err) {
      console.error(`✗ ${p.path}: ${err.message}`);
    }
  }
  await browser.close();
}

async function main() {
  console.log('=== NeoBank Sprint 5 Screenshots ===');
  await capture(NEOBANK_URL, neobankPages, 'D:/neobank/screenshots');
  console.log('\nDone!');
}

main().catch(console.error);
