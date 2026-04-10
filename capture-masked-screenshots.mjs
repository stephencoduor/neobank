import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = 'D:/neobank/screenshots';

// ─── Masking function injected into the page DOM ────────────────────────────
const MASK_SCRIPT = () => {
  function maskText(text) {
    // Mask full phone numbers: +254 7XX XXX XXX → +254 7•• ••• •••
    text = text.replace(/\+254\s*(\d)\d{2}\s*\d{3}\s*\d{3,4}/g, '+254 $1•• ••• •••');

    // Mask standalone Kenyan numbers without +254 prefix (e.g. "712 345 678" in placeholders)
    text = text.replace(/\b([17]\d{2})\s*(\d{3})\s*(\d{3})\b/g, (match, a, b, c) => {
      return a[0] + '•• ••• •••';
    });

    // Mask emails: user@domain.com → u•••@d•••.com
    text = text.replace(
      /([a-zA-Z0-9])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9])[a-zA-Z0-9.-]*\.([a-zA-Z]{2,})/g,
      '$1•••@$2•••.$3'
    );

    return text;
  }

  // Walk all text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const masked = maskText(node.textContent);
    if (masked !== node.textContent) {
      node.textContent = masked;
    }
  }

  // Mask placeholder and value attributes on inputs/textareas
  document.querySelectorAll('input, textarea').forEach((el) => {
    if (el.placeholder) {
      el.placeholder = maskText(el.placeholder);
    }
    if (el.value) {
      el.value = maskText(el.value);
    }
  });

  // Mask aria-label and title attributes that may contain phone/email
  document.querySelectorAll('[aria-label], [title]').forEach((el) => {
    if (el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', maskText(el.getAttribute('aria-label')));
    }
    if (el.getAttribute('title')) {
      el.setAttribute('title', maskText(el.getAttribute('title')));
    }
  });
};

// ─── All 61 screenshots ────────────────────────────────────────────────────
const LIGHT_PAGES = [
  { path: '/login', name: '01-login' },
  { path: '/register', name: '02-register' },
  { path: '/kyc', name: '03-kyc-verification' },
  { path: '/dashboard', name: '04-dashboard' },
  { path: '/notifications', name: '05-notifications' },
  { path: '/accounts', name: '06-accounts' },
  { path: '/accounts/ACC-001', name: '07-account-detail' },
  { path: '/cards', name: '08-cards' },
  { path: '/cards/CARD-V-001', name: '09-card-detail' },
  { path: '/payments/send', name: '10-send-money' },
  { path: '/payments/request', name: '11-request-money' },
  { path: '/payments/qr', name: '12-qr-payments' },
  { path: '/payments/bills', name: '13-bill-payments' },
  { path: '/loans', name: '14-loans-dashboard' },
  { path: '/loans/apply', name: '15-loan-apply' },
  { path: '/loans/schedule', name: '16-loan-schedule' },
  { path: '/savings', name: '17-savings-goals' },
  { path: '/reports', name: '18-reports-analytics' },
  { path: '/merchant', name: '19-merchant-dashboard' },
  { path: '/merchant/pos', name: '20-pos-management' },
  { path: '/merchant/settlements', name: '21-settlements' },
  { path: '/merchant/onboarding', name: '22-merchant-onboarding' },
  { path: '/settings', name: '23-settings' },
  { path: '/admin', name: '24-admin-dashboard' },
  { path: '/admin/users', name: '25-admin-users' },
  { path: '/admin/kyc', name: '26-kyc-review' },
  { path: '/admin/transactions', name: '27-transactions-monitor' },
  { path: '/admin/compliance', name: '28-compliance' },
  { path: '/admin/settings', name: '29-admin-settings' },
  { path: '/admin/audit-log', name: '30-admin-audit-log' },
];

const DARK_PAGES = [
  { path: '/dashboard', name: '31-dashboard-dark' },
  { path: '/accounts', name: '32-accounts-dark' },
  { path: '/cards', name: '33-cards-dark' },
  { path: '/loans', name: '34-loans-dark' },
  { path: '/savings', name: '35-savings-dark' },
  { path: '/reports', name: '36-reports-dark' },
  { path: '/merchant', name: '37-merchant-dark' },
  { path: '/admin', name: '38-admin-dashboard-dark' },
  { path: '/admin/users', name: '39-admin-users-dark' },
  { path: '/settings', name: '40-settings-dark' },
  { path: '/payments/send', name: '41-send-money-dark' },
  { path: '/payments/bills', name: '42-bill-payments-dark' },
  { path: '/admin/transactions', name: '43-transactions-dark' },
  { path: '/admin/compliance', name: '44-compliance-dark' },
  { path: '/admin/audit-log', name: '45-audit-log-dark' },
  { path: '/login', name: '46-login-dark' },
];

const MOBILE_PAGES = [
  { path: '/login', name: '47-mobile-login' },
  { path: '/dashboard', name: '48-mobile-dashboard' },
  { path: '/accounts', name: '49-mobile-accounts' },
  { path: '/cards', name: '50-mobile-cards' },
  { path: '/payments/send', name: '51-mobile-send' },
];

const WIRED_PAGES = [
  { path: '/login', name: '52-login-wired' },
  { path: '/savings', name: '53-savings-goals-wired' },
  { path: '/payments/send', name: '54-send-money-mobile' },
  { path: '/payments/bills', name: '55-pay-bills-wired' },
  { path: '/admin/compliance', name: '56-compliance-aml-wired' },
  { path: '/payments/qr', name: '58-qr-payments-scan' },
  { path: '/cards', name: '59-cards-list-wired' },
  { path: '/cards/CARD-V-001', name: '60-card-detail-virtual' },
  { path: '/merchant', name: '61-merchant-dashboard-wired' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

async function enableDarkMode(page) {
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
}

async function enableLightMode(page) {
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  });
}

async function capturePages(page, pages, { dark = false, mobile = false, fullPage = false } = {}) {
  for (const p of pages) {
    try {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(2000);

      if (dark) await enableDarkMode(page);
      else await enableLightMode(page);

      // Wait a bit for theme to apply
      if (dark) await page.waitForTimeout(300);

      // Mask phone numbers and emails
      await page.evaluate(MASK_SCRIPT);

      const filename = `${OUTPUT_DIR}/${p.name}.png`;
      await page.screenshot({ path: filename, fullPage });
      console.log(`OK: ${p.name}.png`);
    } catch (err) {
      console.log(`SKIP: ${p.name} — ${err.message}`);
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const browser = await chromium.launch({ headless: true });

  // === Desktop Light (1280x900) ===
  console.log('\n=== Light Mode (30 pages) ===');
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await capturePages(desktopPage, LIGHT_PAGES);

  // === Desktop Dark (1280x900) ===
  console.log('\n=== Dark Mode (16 pages) ===');
  await capturePages(desktopPage, DARK_PAGES, { dark: true });

  await desktopCtx.close();

  // === Mobile (390x844 — iPhone 14) ===
  console.log('\n=== Mobile (5 pages) ===');
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  await capturePages(mobilePage, MOBILE_PAGES, { mobile: true });
  await mobileCtx.close();

  // === Wired pages (1280x900, fullPage) ===
  console.log('\n=== Wired Pages (9 pages) ===');
  const wiredCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const wiredPage = await wiredCtx.newPage();
  await capturePages(wiredPage, WIRED_PAGES, { fullPage: true });

  // === PesaLink special capture (57) ===
  console.log('\n=== PesaLink Tab ===');
  try {
    await wiredPage.goto(`${BASE_URL}/payments/send`, { waitUntil: 'load', timeout: 20000 });
    await wiredPage.waitForTimeout(2000);
    const pesalinkBtn = wiredPage.locator('button', { hasText: 'PesaLink' });
    if (await pesalinkBtn.count() > 0) {
      await pesalinkBtn.click();
      await wiredPage.waitForTimeout(500);
      await wiredPage.evaluate(MASK_SCRIPT);
      await wiredPage.screenshot({ path: `${OUTPUT_DIR}/57-send-money-pesalink.png`, fullPage: true });
      console.log('OK: 57-send-money-pesalink.png');
    }
  } catch (err) {
    console.log(`SKIP: 57-pesalink — ${err.message}`);
  }

  await wiredCtx.close();
  await browser.close();

  console.log('\nAll done! Screenshots saved to screenshots/');
}

main().catch(console.error);
