"""Retake all NeoBank screenshots — light, dark, and mobile modes."""
import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

BASE = "http://localhost:5179"
OUT = r"D:\neobank\screenshots"
os.makedirs(OUT, exist_ok=True)

# Delete existing screenshots
for f in os.listdir(OUT):
    if f.endswith(".png"):
        os.remove(os.path.join(OUT, f))

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1440,900")
options.add_argument("--force-device-scale-factor=1")
options.add_argument("--disable-gpu")

driver = webdriver.Chrome(options=options)
driver.implicitly_wait(2)

# Set light theme
def set_theme(theme):
    driver.execute_script(f"localStorage.setItem('neobank-theme', '{theme}')")

# ─── LIGHT MODE (30 pages) ────────────────────────────────────────────
light_pages = [
    ("01-login", "/login"),
    ("02-register", "/register"),
    ("03-kyc-verification", "/kyc"),
    ("04-dashboard", "/dashboard"),
    ("05-notifications", "/notifications"),
    ("06-accounts", "/accounts"),
    ("07-account-detail", "/accounts/acc-001"),
    ("08-cards", "/cards"),
    ("09-card-detail", "/cards/card-001"),
    ("10-send-money", "/payments/send"),
    ("11-request-money", "/payments/request"),
    ("12-qr-payments", "/payments/qr"),
    ("13-bill-payments", "/payments/bills"),
    ("14-loans-dashboard", "/loans"),
    ("15-loan-apply", "/loans/apply"),
    ("16-loan-schedule", "/loans/schedule"),
    ("17-savings-goals", "/savings"),
    ("18-reports-analytics", "/reports"),
    ("19-merchant-dashboard", "/merchant"),
    ("20-pos-management", "/merchant/pos"),
    ("21-settlements", "/merchant/settlements"),
    ("22-merchant-onboarding", "/merchant/onboarding"),
    ("23-settings", "/settings"),
    ("24-admin-dashboard", "/admin"),
    ("25-admin-users", "/admin/users"),
    ("26-kyc-review", "/admin/kyc"),
    ("27-transactions-monitor", "/admin/transactions"),
    ("28-compliance", "/admin/compliance"),
    ("29-admin-settings", "/admin/settings"),
    ("30-admin-audit-log", "/admin/audit-log"),
]

print("=== LIGHT MODE ===")
# Navigate first to set theme
driver.get(f"{BASE}/dashboard")
time.sleep(1)
set_theme("light")
driver.execute_script("document.documentElement.classList.remove('dark')")

for name, path in light_pages:
    driver.get(f"{BASE}{path}")
    time.sleep(1.5)
    driver.save_screenshot(os.path.join(OUT, f"{name}.png"))
    print(f"  OK {name}")

# ─── DARK MODE (key pages) ────────────────────────────────────────────
dark_pages = [
    ("31-dashboard-dark", "/dashboard"),
    ("32-accounts-dark", "/accounts"),
    ("33-cards-dark", "/cards"),
    ("34-loans-dark", "/loans"),
    ("35-savings-dark", "/savings"),
    ("36-reports-dark", "/reports"),
    ("37-merchant-dark", "/merchant"),
    ("38-admin-dashboard-dark", "/admin"),
    ("39-admin-users-dark", "/admin/users"),
    ("40-settings-dark", "/settings"),
    ("41-send-money-dark", "/payments/send"),
    ("42-bill-payments-dark", "/payments/bills"),
    ("43-transactions-dark", "/admin/transactions"),
    ("44-compliance-dark", "/admin/compliance"),
    ("45-audit-log-dark", "/admin/audit-log"),
    ("46-login-dark", "/login"),
]

print("\n=== DARK MODE ===")
driver.get(f"{BASE}/dashboard")
time.sleep(1)
set_theme("dark")
driver.execute_script("document.documentElement.classList.add('dark')")
time.sleep(0.5)

for name, path in dark_pages:
    driver.get(f"{BASE}{path}")
    time.sleep(1.5)
    set_theme("dark")
    driver.execute_script("document.documentElement.classList.add('dark')")
    time.sleep(0.5)
    driver.save_screenshot(os.path.join(OUT, f"{name}.png"))
    print(f"  OK {name}")

# ─── MOBILE (key pages, 375x812) ──────────────────────────────────────
mobile_pages = [
    ("47-mobile-login", "/login"),
    ("48-mobile-dashboard", "/dashboard"),
    ("49-mobile-accounts", "/accounts"),
    ("50-mobile-cards", "/cards"),
    ("51-mobile-send", "/payments/send"),
]

print("\n=== MOBILE ===")
driver.set_window_size(375, 812)
set_theme("light")
driver.execute_script("document.documentElement.classList.remove('dark')")

for name, path in mobile_pages:
    driver.get(f"{BASE}{path}")
    time.sleep(1.5)
    driver.save_screenshot(os.path.join(OUT, f"{name}.png"))
    print(f"  OK {name}")

driver.quit()
print(f"\nDone! {len(light_pages) + len(dark_pages) + len(mobile_pages)} screenshots saved to {OUT}")
