# User Acceptance Testing (UAT) Plan — NeoBank & DisbursePro

**Client:** Qsoftwares Ltd
**Date:** April 2026
**Test Environment:** Local development (localhost)

---

## Test Environment Setup

### Prerequisites
```
Node.js 20+
Java 21
Docker Desktop
PostgreSQL 16 (via Docker)
```

### Start NeoBank
```bash
cd D:\neobank
npm install
npm run dev          # Frontend on http://localhost:5173
```

### Start DisbursePro
```bash
cd D:\disbursement-platform
npm install
npm run dev          # Frontend on http://localhost:5175
```

### Start Backends (when ready)
```bash
cd D:\neobank\fineract
./gradlew bootRun    # NeoBank backend on :8443

cd D:\disbursement-platform\fineract
./gradlew bootRun    # DisbursePro backend on :8443
```

> **Note:** Frontend works without backend running — all pages use graceful fallback to realistic mock data.

---

## NeoBank Test Cases

### TC-NB-001: Authentication Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page with phone input (+254), password field |
| 2 | Enter phone and password | Form accepts input |
| 3 | Click "Sign In" | Redirects to dashboard |
| 4 | Navigate to `/register` | 4-step registration wizard |
| 5 | Complete Step 1 (Contact) | Advances to Step 2 |
| 6 | Complete Step 2 (Personal) | Advances to Step 3 |
| 7 | Complete Step 3 (Password) | Advances to Step 4 |
| 8 | Complete Step 4 (OTP) | Registration success |

### TC-NB-002: KYC Verification
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/kyc` | 5-step KYC wizard |
| 2 | Select ID type | Options: National ID, Passport, Alien ID |
| 3 | Upload ID front | Upload area shown |
| 4 | Upload ID back | Upload area shown |
| 5 | Take selfie | Camera interface shown |
| 6 | Review and submit | Summary with submit button |

### TC-NB-003: Dashboard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard` | Dashboard loads with greeting |
| 2 | Verify balance card | Shows total balance across accounts |
| 3 | Verify quick actions | 4 buttons: Send, Pay Bills, QR Pay, Add Money |
| 4 | Verify account carousel | Scrollable account cards |
| 5 | Verify chart | Weekly income/spending chart renders |
| 6 | Verify transactions | Recent transactions list with icons |

### TC-NB-004: Account Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/accounts` | Account cards grid displayed |
| 2 | Click an account | Navigates to account detail |
| 3 | Verify tabs | Transactions, Details, Statements tabs |
| 4 | Check transactions | Transaction list with amounts and dates |

### TC-NB-005: Card Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/cards` | Two cards: Virtual Visa, Physical Mastercard |
| 2 | Verify card visuals | Card shows last4, holder name, expiry |
| 3 | Click Freeze on a card | Card toggles frozen state |
| 4 | Verify spend tracker | Shows month spend / monthly limit |
| 5 | Click a card | Navigates to card detail |
| 6 | Verify card detail | Card info, actions, transaction history |
| 7 | Click "Set Limits" | Limits dialog opens |
| 8 | Click "Reset PIN" | PIN reset confirmation flow |

### TC-NB-006: Send Money
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/payments/send` | Send money page |
| 2 | Toggle to "Bank (PesaLink)" | Bank transfer form shown |
| 3 | Select bank from directory | Kenyan bank list populated |
| 4 | Enter account number | Validation runs |
| 5 | Enter amount | Fee calculation updates in real time |
| 6 | Click Review | Review screen with full breakdown |
| 7 | Click Send | Success confirmation |

### TC-NB-007: QR Payments
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/payments/qr` | QR page with Scan/My QR tabs |
| 2 | Click "Simulate Scan" | Mock M-Pesa QR parsed |
| 3 | Verify scan result | Shows merchant name, till, amount |
| 4 | Click "Confirm & Pay" | Payment processes |
| 5 | Switch to My QR tab | Generate QR button visible |
| 6 | Click "Generate QR Code" | QR generated with ID |

### TC-NB-008: Bill Payments
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/payments/bills` | 8 bill categories displayed |
| 2 | Select a category | Billers listed |
| 3 | Select biller | Payment form opens |
| 4 | Enter account number | Validation shown |
| 5 | Enter amount and pay | Payment confirmation |

### TC-NB-009: Loans
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/loans` | Active loans with progress bars |
| 2 | Click "Apply for Loan" | 4-step application wizard |
| 3 | Navigate to `/loans/schedule` | Amortization table displayed |

### TC-NB-010: Savings Goals
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/savings` | Savings goals with progress rings |
| 2 | Click "Create Goal" | Goal creation dialog |
| 3 | Fill in name, target, deadline | Form accepts input |
| 4 | Submit | New goal appears |
| 5 | Click "Lock" on a goal | Goal locked confirmation |

### TC-NB-011: Merchant Dashboard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/merchant` | Merchant dashboard loads |
| 2 | Verify business info | "Mama Njeri's Kitchen", Nairobi CBD |
| 3 | Verify revenue stats | Today's revenue, monthly, avg ticket |
| 4 | Verify chart | Hourly revenue bar chart |
| 5 | Click "Accept Payment" | Payment dialog opens |
| 6 | Click "View QR Code" | QR dialog with merchant QR |
| 7 | Verify transactions | Today's transactions with method icons |

### TC-NB-012: Admin Panel
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/admin` | Admin dashboard with 8 KPIs |
| 2 | Navigate to `/admin/users` | User table with 12 Kenyan users |
| 3 | Navigate to `/admin/kyc` | KYC review queue |
| 4 | Navigate to `/admin/transactions` | Transaction monitor |
| 5 | Navigate to `/admin/compliance` | Compliance dashboard with AML cases |
| 6 | Navigate to `/admin/audit-log` | Audit log with filters |
| 7 | Navigate to `/admin/settings` | 4-tab settings page |

### TC-NB-013: Dark Mode
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click theme toggle | Switches to dark mode |
| 2 | Verify all pages | Correct dark theme applied |
| 3 | Click again | Returns to light mode |

### TC-NB-014: Mobile Responsive
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Resize to 375px width | Mobile layout activates |
| 2 | Verify hamburger menu | Sidebar collapses to menu |
| 3 | Navigate pages | All pages usable on mobile |

---

## DisbursePro Test Cases

### TC-DP-001: Authentication
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page |
| 2 | Enter credentials | Login succeeds |
| 3 | Navigate to `/register` | Registration form |

### TC-DP-002: Company Dashboard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard` | Dashboard with greeting |
| 2 | Verify wallet balance | Available + held balance shown |
| 3 | Verify KPI cards | 4 metric cards displayed |
| 4 | Verify charts | Weekly volume + purpose pie chart |
| 5 | Verify recent activity | Last 6 disbursements listed |

### TC-DP-003: Employee Management
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/employees` | Employee registry table |
| 2 | Search by name | Filtered results |
| 3 | Filter by carrier | Carrier-specific results |
| 4 | Click employee | Detail page with history |
| 5 | Navigate to `/employees/new` | 4-step wizard |
| 6 | Navigate to `/employees/bulk-upload` | CSV upload interface |

### TC-DP-004: Single Disbursement
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/disburse/single` | Disbursement wizard |
| 2 | Select employee | Employee details shown |
| 3 | Enter amount | Real-time fee calculation |
| 4 | Select purpose | Purpose dropdown works |
| 5 | Review step | Full summary with fees |
| 6 | Submit | Success confirmation |

### TC-DP-005: Bulk Disbursement
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/disburse/bulk` | Upload/history toggle |
| 2 | Click upload area | Batch preview loads |
| 3 | Verify summary cards | Recipients, Net, Fees, Gross |
| 4 | Verify batch table | 5 rows with fee breakdown |
| 5 | Click "Submit Batch" | Success confirmation |
| 6 | Click "Batch History" | History table with status badges |
| 7 | Verify status icons | COMPLETED=green, READY=blue, ERRORS=amber |

### TC-DP-006: Approvals
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/approvals` | 3 KPI cards + tab interface |
| 2 | Click Pending tab | Pending items listed |
| 3 | Click an item | Approval detail page |
| 4 | Verify approve/reject | Buttons functional |

### TC-DP-007: Transaction History
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/transactions` | Full transaction table |
| 2 | Search by name | Filtered results |
| 3 | Filter by status | Status-filtered list |
| 4 | Click transaction | Detail page with timeline |
| 5 | Click CSV export | Export button functional |

### TC-DP-008: Reports
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/reports` | Reports dashboard |
| 2 | Verify 5 KPI cards | Disbursed, Transactions, Avg, Success Rate, Fees |
| 3 | Verify trend chart | 6-month line chart |
| 4 | Verify purpose chart | Donut chart with categories |
| 5 | Verify employee chart | Top 8 horizontal bars |
| 6 | Verify cost centre chart | Vertical bar chart |
| 7 | Click CSV download | Button functional |

### TC-DP-009: Audit Log
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/audit-log` | Audit log table |
| 2 | Search by action | Filtered results |
| 3 | Filter by category | Category filter works |
| 4 | Filter by severity | Severity filter works |
| 5 | Click "Verify Chain" | Hash chain verification result |

### TC-DP-010: Settings
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings` | Multi-tab settings |
| 2 | Click Profile tab | Company + user profile |
| 3 | Click Users tab | Team member list |
| 4 | Click Limits tab | Disbursement limits |
| 5 | Click Workflows tab | Approval tier config |

### TC-DP-011: Platform Operator Portal
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/platform` | Platform dashboard |
| 2 | Verify 6 KPI cards | Companies, volume, revenue, etc. |
| 3 | Navigate to `/platform/companies` | Companies table |
| 4 | Click a company | Company detail page |
| 5 | Navigate to `/platform/revenue` | Revenue dashboard |
| 6 | Navigate to `/platform/settings` | Platform settings |

### TC-DP-012: Dark Mode
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle theme | Dark mode activates |
| 2 | Verify all pages | Correct dark styling |
| 3 | Toggle back | Light mode restored |

### TC-DP-013: Mobile Responsive
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Resize to mobile width | Responsive layout |
| 2 | Verify sidebar collapses | Hamburger menu works |
| 3 | Navigate all pages | All pages usable |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Client Representative | | | |
| Project Manager | | | |
| QA Lead | | | |
| Technical Lead | | | |

---

*UAT covers functional testing of the prototype UI. Integration testing with live backend APIs and third-party services will require separate test cycles after production deployment.*
