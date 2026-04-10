import { chromium } from 'playwright';

const NEOBANK_URL = 'http://localhost:5174';
const DISBURSEPRO_URL = 'http://localhost:5175';

const neobankPages = [
  { path: '/login', name: '52-login-wired' },
  { path: '/savings', name: '53-savings-goals-wired' },
  { path: '/payments/send', name: '54-send-money-mobile' },
  { path: '/payments/bills', name: '55-pay-bills-wired' },
  { path: '/admin/compliance', name: '56-compliance-aml-wired' },
];

const disbuseProPages = [
  { path: '/platform/companies/COMP-001', name: '01-company-detail-kyb' },
  { path: '/deposits', name: '02-deposits-wallet-topup' },
  { path: '/approvals/DIS-2026-0001', name: '03-approval-detail-wired' },
  { path: '/audit-log', name: '04-audit-log-wired' },
];

async function capture(baseUrl, pages, outputDir, prefix = '') {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  for (const p of pages) {
    try {
      await page.goto(`${baseUrl}${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      const filename = `${outputDir}/${prefix}${p.name}.png`;
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`OK: ${filename}`);
    } catch (err) {
      console.log(`SKIP: ${p.path} — ${err.message}`);
    }
  }

  await browser.close();
}

// Capture NeoBank
console.log('=== NeoBank Screenshots ===');
await capture(NEOBANK_URL, neobankPages, 'D:/neobank/screenshots');

// Also capture PesaLink tab
const browser2 = await chromium.launch({ headless: true });
const ctx2 = await browser2.newContext({ viewport: { width: 1280, height: 900 } });
const pg2 = await ctx2.newPage();
await pg2.goto(`${NEOBANK_URL}/payments/send`, { waitUntil: 'networkidle', timeout: 15000 });
await pg2.waitForTimeout(1000);
// Click Bank (PesaLink) tab
const pesalinkBtn = pg2.locator('button', { hasText: 'PesaLink' });
if (await pesalinkBtn.count() > 0) {
  await pesalinkBtn.click();
  await pg2.waitForTimeout(500);
  await pg2.screenshot({ path: 'D:/neobank/screenshots/57-send-money-pesalink.png' });
  console.log('OK: 57-send-money-pesalink.png');
}
await browser2.close();

console.log('\n=== DisbursePro Screenshots ===');
await capture(DISBURSEPRO_URL, disbuseProPages, 'D:/disbursement-platform/screenshots', 'sprint4-');

console.log('\nDone!');
