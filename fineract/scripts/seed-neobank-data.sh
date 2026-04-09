#!/bin/bash
# NeoBank Seed Data Script
# Seeds: Currency (KES), Offices, GL Accounts, Products, Clients, Savings, Loans
# Target: NeoBank Fineract on port 9443

API="https://localhost:9443/fineract-provider/api/v1"
AUTH="Basic bWlmb3M6cGFzc3dvcmQ="
TENANT="default"
DATE_FORMAT="dd MMMM yyyy"
LOCALE="en"
TODAY="09 April 2026"

h() {
  curl -sk -X "$1" "$API$2" \
    -H "Authorization: $AUTH" \
    -H "Fineract-Platform-TenantId: $TENANT" \
    -H "Content-Type: application/json" \
    ${3:+-d "$3"} 2>/dev/null
}

echo "=== NeoBank Seed Data ==="
echo ""

# ─── 1. CURRENCY ──────────────────────────────
echo ">>> 1. Configuring KES currency..."
h PUT "/currencies" '{
  "currencies": ["KES"]
}' > /dev/null
echo "  Done: KES enabled"

# ─── 2. OFFICES ───────────────────────────────
echo ">>> 2. Creating offices..."

# Rename Head Office
h PUT "/offices/1" "{
  \"name\": \"NeoBank Kenya - Nairobi HQ\",
  \"dateFormat\": \"$DATE_FORMAT\",
  \"locale\": \"$LOCALE\",
  \"openingDate\": \"01 January 2025\"
}" > /dev/null
echo "  Renamed Head Office"

# Mombasa branch
MOMBASA=$(h POST "/offices" "{
  \"parentId\": 1,
  \"name\": \"NeoBank Mombasa\",
  \"dateFormat\": \"$DATE_FORMAT\",
  \"locale\": \"$LOCALE\",
  \"openingDate\": \"15 March 2025\"
}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('officeId',''))" 2>/dev/null)
echo "  Created Mombasa branch (ID: $MOMBASA)"

# Kisumu branch
KISUMU=$(h POST "/offices" "{
  \"parentId\": 1,
  \"name\": \"NeoBank Kisumu\",
  \"dateFormat\": \"$DATE_FORMAT\",
  \"locale\": \"$LOCALE\",
  \"openingDate\": \"01 June 2025\"
}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('officeId',''))" 2>/dev/null)
echo "  Created Kisumu branch (ID: $KISUMU)"

# ─── 3. GL ACCOUNTS (Chart of Accounts) ──────
echo ">>> 3. Creating Chart of Accounts..."

create_gl() {
  local name="$1" code="$2" type="$3" usage="$4"
  h POST "/glaccounts" "{
    \"name\": \"$name\",
    \"glCode\": \"$code\",
    \"type\": $type,
    \"usage\": $usage,
    \"manualEntriesAllowed\": true,
    \"description\": \"$name\"
  }" > /dev/null
}

# Assets (type=1)
create_gl "Cash in Hand"                    "100001" 1 1
create_gl "Bank Accounts"                   "100002" 1 1
create_gl "Loans Outstanding"               "100003" 1 1
create_gl "Interest Receivable"             "100004" 1 1
create_gl "M-Pesa Float"                    "100005" 1 1
create_gl "Merchant Settlements Receivable" "100006" 1 1
create_gl "Card Transactions Clearing"      "100007" 1 1
echo "  Created 7 Asset accounts"

# Liabilities (type=2)
create_gl "Savings Deposits"               "200001" 2 1
create_gl "Fixed Deposits"                 "200002" 2 1
create_gl "Interest Payable on Savings"    "200003" 2 1
create_gl "M-Pesa Liability"               "200004" 2 1
create_gl "Merchant Payables"              "200005" 2 1
create_gl "Suspense Account"               "200006" 2 1
echo "  Created 6 Liability accounts"

# Equity (type=3)
create_gl "Share Capital"                  "300001" 3 1
create_gl "Retained Earnings"              "300002" 3 1
echo "  Created 2 Equity accounts"

# Revenue (type=4)
create_gl "Interest on Loans"              "400001" 4 1
create_gl "Loan Processing Fees"           "400002" 4 1
create_gl "Transaction Fees"               "400003" 4 1
create_gl "Card Revenue"                   "400004" 4 1
create_gl "M-Pesa Commission"              "400005" 4 1
create_gl "Merchant Service Fees"          "400006" 4 1
echo "  Created 6 Revenue accounts"

# Expenses (type=5)
create_gl "Interest on Savings"            "500001" 5 1
create_gl "Provision for Bad Debts"        "500002" 5 1
create_gl "Operating Expenses"             "500003" 5 1
create_gl "M-Pesa Charges"                 "500004" 5 1
echo "  Created 4 Expense accounts"

# ─── 4. SAVINGS PRODUCTS ─────────────────────
echo ">>> 4. Creating Savings Products..."

# Get GL account IDs
GL_SAVINGS_REF=$(h GET "/glaccounts?type=2" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '200001' in a.get('glCode','')), ''))" 2>/dev/null)
GL_SAVINGS_CONTROL=$(h GET "/glaccounts?type=2" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '200001' in a.get('glCode','')), ''))" 2>/dev/null)
GL_INTEREST_SAVINGS=$(h GET "/glaccounts?type=5" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '500001' in a.get('glCode','')), ''))" 2>/dev/null)
GL_FEES_INCOME=$(h GET "/glaccounts?type=4" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '400003' in a.get('glCode','')), ''))" 2>/dev/null)
GL_OVERDRAFT=$(h GET "/glaccounts?type=1" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '100001' in a.get('glCode','')), ''))" 2>/dev/null)
GL_TRANSFER_SUSPENSE=$(h GET "/glaccounts?type=2" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '200006' in a.get('glCode','')), ''))" 2>/dev/null)
GL_INTEREST_PAYABLE=$(h GET "/glaccounts?type=2" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '200003' in a.get('glCode','')), ''))" 2>/dev/null)

SAVINGS_PROD1=$(h POST "/savingsproducts" "{
  \"name\": \"NeoBank Savings\",
  \"shortName\": \"NBS\",
  \"description\": \"Standard personal savings account with competitive interest\",
  \"currencyCode\": \"KES\",
  \"digitsAfterDecimal\": 2,
  \"inMultiplesOf\": 1,
  \"nominalAnnualInterestRate\": 7.5,
  \"interestCompoundingPeriodType\": 4,
  \"interestPostingPeriodType\": 4,
  \"interestCalculationType\": 1,
  \"interestCalculationDaysInYearType\": 365,
  \"accountingRule\": 2,
  \"savingsReferenceAccountId\": $GL_SAVINGS_REF,
  \"savingsControlAccountId\": $GL_SAVINGS_CONTROL,
  \"interestOnSavingsAccountId\": $GL_INTEREST_SAVINGS,
  \"incomeFromFeeAccountId\": $GL_FEES_INCOME,
  \"transfersInSuspenseAccountId\": $GL_TRANSFER_SUSPENSE,
  \"overdraftPortfolioControlId\": $GL_OVERDRAFT,
  \"incomeFromPenaltyAccountId\": $GL_FEES_INCOME,
  \"interestPayableAccountId\": $GL_INTEREST_PAYABLE,
  \"locale\": \"$LOCALE\"
}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceId',''))" 2>/dev/null)
echo "  Created NeoBank Savings (ID: $SAVINGS_PROD1)"

SAVINGS_PROD2=$(h POST "/savingsproducts" "{
  \"name\": \"NeoBank Business Savings\",
  \"shortName\": \"NBBS\",
  \"description\": \"Business savings account with higher limits and features\",
  \"currencyCode\": \"KES\",
  \"digitsAfterDecimal\": 2,
  \"inMultiplesOf\": 1,
  \"nominalAnnualInterestRate\": 5.0,
  \"interestCompoundingPeriodType\": 4,
  \"interestPostingPeriodType\": 4,
  \"interestCalculationType\": 1,
  \"interestCalculationDaysInYearType\": 365,
  \"accountingRule\": 2,
  \"savingsReferenceAccountId\": $GL_SAVINGS_REF,
  \"savingsControlAccountId\": $GL_SAVINGS_CONTROL,
  \"interestOnSavingsAccountId\": $GL_INTEREST_SAVINGS,
  \"incomeFromFeeAccountId\": $GL_FEES_INCOME,
  \"transfersInSuspenseAccountId\": $GL_TRANSFER_SUSPENSE,
  \"overdraftPortfolioControlId\": $GL_OVERDRAFT,
  \"incomeFromPenaltyAccountId\": $GL_FEES_INCOME,
  \"interestPayableAccountId\": $GL_INTEREST_PAYABLE,
  \"locale\": \"$LOCALE\"
}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceId',''))" 2>/dev/null)
echo "  Created NeoBank Business Savings (ID: $SAVINGS_PROD2)"

# ─── 5. LOAN PRODUCTS ────────────────────────
echo ">>> 5. Creating Loan Products..."

GL_LOANS=$(h GET "/glaccounts?type=1" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '100003' in a.get('glCode','')), ''))" 2>/dev/null)
GL_INTEREST_RCV=$(h GET "/glaccounts?type=1" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '100004' in a.get('glCode','')), ''))" 2>/dev/null)
GL_LOAN_INTEREST=$(h GET "/glaccounts?type=4" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '400001' in a.get('glCode','')), ''))" 2>/dev/null)
GL_LOAN_FEES=$(h GET "/glaccounts?type=4" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '400002' in a.get('glCode','')), ''))" 2>/dev/null)
GL_PROVISION=$(h GET "/glaccounts?type=5" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '500002' in a.get('glCode','')), ''))" 2>/dev/null)
GL_FUND_SRC=$(h GET "/glaccounts?type=1" | python3 -c "import sys,json; accs=json.load(sys.stdin); print(next((a['id'] for a in accs if '100002' in a.get('glCode','')), ''))" 2>/dev/null)

LOAN_PROD1=$(h POST "/loanproducts" "{
  \"name\": \"NeoBank Personal Loan\",
  \"shortName\": \"NBPL\",
  \"description\": \"Personal loan for salary earners, up to KES 500,000\",
  \"currencyCode\": \"KES\",
  \"digitsAfterDecimal\": 2,
  \"inMultiplesOf\": 1,
  \"principal\": 100000,
  \"minPrincipal\": 10000,
  \"maxPrincipal\": 500000,
  \"numberOfRepayments\": 12,
  \"minNumberOfRepayments\": 3,
  \"maxNumberOfRepayments\": 24,
  \"repaymentEvery\": 1,
  \"repaymentFrequencyType\": 2,
  \"interestRatePerPeriod\": 1.5,
  \"minInterestRatePerPeriod\": 1.0,
  \"maxInterestRatePerPeriod\": 2.5,
  \"interestRateFrequencyType\": 2,
  \"amortizationType\": 1,
  \"interestType\": 0,
  \"interestCalculationPeriodType\": 1,
  \"transactionProcessingStrategyCode\": \"mifos-standard-strategy\",
  \"daysInYearType\": 365,
  \"daysInMonthType\": 30,
  \"accountingRule\": 2,
  \"fundSourceAccountId\": $GL_FUND_SRC,
  \"loanPortfolioAccountId\": $GL_LOANS,
  \"receivableInterestAccountId\": $GL_INTEREST_RCV,
  \"receivableFeeAccountId\": $GL_INTEREST_RCV,
  \"receivablePenaltyAccountId\": $GL_INTEREST_RCV,
  \"interestOnLoanAccountId\": $GL_LOAN_INTEREST,
  \"incomeFromFeeAccountId\": $GL_LOAN_FEES,
  \"incomeFromPenaltyAccountId\": $GL_LOAN_FEES,
  \"writeOffAccountId\": $GL_PROVISION,
  \"transfersInSuspenseAccountId\": $GL_TRANSFER_SUSPENSE,
  \"overpaymentLiabilityAccountId\": $GL_TRANSFER_SUSPENSE,
  \"incomeFromRecoveryAccountId\": $GL_LOAN_FEES,
  \"incomeFromChargeOffInterestAccountId\": $GL_LOAN_INTEREST,
  \"incomeFromChargeOffFeesAccountId\": $GL_LOAN_FEES,
  \"chargeOffExpenseAccountId\": $GL_PROVISION,
  \"chargeOffFraudExpenseAccountId\": $GL_PROVISION,
  \"incomeFromChargeOffPenaltyAccountId\": $GL_LOAN_FEES,
  \"incomeFromGoodwillCreditInterestAccountId\": $GL_LOAN_INTEREST,
  \"incomeFromGoodwillCreditFeesAccountId\": $GL_LOAN_FEES,
  \"incomeFromGoodwillCreditPenaltyAccountId\": $GL_LOAN_FEES,
  \"dateFormat\": \"$DATE_FORMAT\",
  \"locale\": \"$LOCALE\"
}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceId',''))" 2>/dev/null)
echo "  Created NeoBank Personal Loan (ID: $LOAN_PROD1)"

LOAN_PROD2=$(h POST "/loanproducts" "{
  \"name\": \"NeoBank Business Loan\",
  \"shortName\": \"NBBL\",
  \"description\": \"Business loan for SMEs, up to KES 2,000,000\",
  \"currencyCode\": \"KES\",
  \"digitsAfterDecimal\": 2,
  \"inMultiplesOf\": 1,
  \"principal\": 500000,
  \"minPrincipal\": 50000,
  \"maxPrincipal\": 2000000,
  \"numberOfRepayments\": 12,
  \"minNumberOfRepayments\": 6,
  \"maxNumberOfRepayments\": 36,
  \"repaymentEvery\": 1,
  \"repaymentFrequencyType\": 2,
  \"interestRatePerPeriod\": 1.2,
  \"minInterestRatePerPeriod\": 0.8,
  \"maxInterestRatePerPeriod\": 2.0,
  \"interestRateFrequencyType\": 2,
  \"amortizationType\": 1,
  \"interestType\": 0,
  \"interestCalculationPeriodType\": 1,
  \"transactionProcessingStrategyCode\": \"mifos-standard-strategy\",
  \"daysInYearType\": 365,
  \"daysInMonthType\": 30,
  \"accountingRule\": 2,
  \"fundSourceAccountId\": $GL_FUND_SRC,
  \"loanPortfolioAccountId\": $GL_LOANS,
  \"receivableInterestAccountId\": $GL_INTEREST_RCV,
  \"receivableFeeAccountId\": $GL_INTEREST_RCV,
  \"receivablePenaltyAccountId\": $GL_INTEREST_RCV,
  \"interestOnLoanAccountId\": $GL_LOAN_INTEREST,
  \"incomeFromFeeAccountId\": $GL_LOAN_FEES,
  \"incomeFromPenaltyAccountId\": $GL_LOAN_FEES,
  \"writeOffAccountId\": $GL_PROVISION,
  \"transfersInSuspenseAccountId\": $GL_TRANSFER_SUSPENSE,
  \"overpaymentLiabilityAccountId\": $GL_TRANSFER_SUSPENSE,
  \"incomeFromRecoveryAccountId\": $GL_LOAN_FEES,
  \"incomeFromChargeOffInterestAccountId\": $GL_LOAN_INTEREST,
  \"incomeFromChargeOffFeesAccountId\": $GL_LOAN_FEES,
  \"chargeOffExpenseAccountId\": $GL_PROVISION,
  \"chargeOffFraudExpenseAccountId\": $GL_PROVISION,
  \"incomeFromChargeOffPenaltyAccountId\": $GL_LOAN_FEES,
  \"incomeFromGoodwillCreditInterestAccountId\": $GL_LOAN_INTEREST,
  \"incomeFromGoodwillCreditFeesAccountId\": $GL_LOAN_FEES,
  \"incomeFromGoodwillCreditPenaltyAccountId\": $GL_LOAN_FEES,
  \"dateFormat\": \"$DATE_FORMAT\",
  \"locale\": \"$LOCALE\"
}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('resourceId',''))" 2>/dev/null)
echo "  Created NeoBank Business Loan (ID: $LOAN_PROD2)"

# ─── 6. CLIENTS ──────────────────────────────
echo ">>> 6. Creating clients..."

create_client() {
  local fn="$1" ln="$2" phone="$3" office="$4" date="$5"
  h POST "/clients" "{
    \"officeId\": $office,
    \"firstname\": \"$fn\",
    \"lastname\": \"$ln\",
    \"mobileNo\": \"$phone\",
    \"active\": true,
    \"activationDate\": \"$date\",
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\"
  }" > /dev/null
}

# 15 Kenyan clients across offices
create_client "Amina"    "Wanjiku"     "+254712345678"  1 "15 March 2025"
create_client "Brian"    "Kipchoge"    "+254721555001"  1 "10 January 2026"
create_client "Mercy"    "Achieng"     "+254733555002"  1 "22 August 2025"
create_client "Hassan"   "Omar"        "+254722555003"  ${MOMBASA:-1} "01 June 2025"
create_client "Grace"    "Wambui"      "+254710555004"  1 "14 February 2026"
create_client "Peter"    "Mwangi"      "+254740555005"  1 "30 January 2025"
create_client "Fatuma"   "Abdalla"     "+254711555006"  ${MOMBASA:-1} "05 November 2025"
create_client "Otieno"   "Odhiambo"    "+254733987654"  ${KISUMU:-1} "18 April 2025"
create_client "Wanjiru"  "Kariuki"     "+254720555008"  1 "02 March 2026"
create_client "Juma"     "Bakari"      "+254725555009"  ${MOMBASA:-1} "14 September 2025"
create_client "Njeri"    "Gathoni"     "+254700555010"  1 "20 February 2025"
create_client "Kiprop"   "Langat"      "+254715555011"  ${KISUMU:-1} "01 December 2024"
create_client "Rose"     "Wangari"     "+254708555012"  1 "10 July 2025"
create_client "Abdi"     "Hussein"     "+254723555013"  ${MOMBASA:-1} "25 April 2025"
create_client "Catherine" "Njoroge"    "+254719555014"  1 "08 August 2025"
echo "  Created 15 clients"

# ─── 7. SAVINGS ACCOUNTS ─────────────────────
echo ">>> 7. Creating savings accounts..."

create_savings() {
  local client="$1" product="$2" date="$3"
  local id=$(h POST "/savingsaccounts" "{
    \"clientId\": $client,
    \"productId\": $product,
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\",
    \"submittedOnDate\": \"$date\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('savingsId',''))" 2>/dev/null)

  # Approve
  h POST "/savingsaccounts/$id?command=approve" "{
    \"approvedOnDate\": \"$date\",
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\"
  }" > /dev/null

  # Activate
  h POST "/savingsaccounts/$id?command=activate" "{
    \"activatedOnDate\": \"$date\",
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\"
  }" > /dev/null

  echo "$id"
}

deposit() {
  local acct="$1" amount="$2" date="$3"
  h POST "/savingsaccounts/$acct/transactions?command=deposit" "{
    \"transactionDate\": \"$date\",
    \"transactionAmount\": $amount,
    \"paymentTypeId\": 1,
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\"
  }" > /dev/null
}

# Create savings for each client (product 1 = personal, product 2 = business)
P1=${SAVINGS_PROD1:-1}
P2=${SAVINGS_PROD2:-2}

SA1=$(create_savings 1 $P1 "15 March 2025")
deposit $SA1 250000 "15 March 2025"
deposit $SA1 75000 "01 April 2025"
echo "  Client 1 (Amina): KES 325,000"

SA2=$(create_savings 2 $P1 "10 January 2026")
deposit $SA2 45000 "10 January 2026"
echo "  Client 2 (Brian): KES 45,000"

SA3=$(create_savings 3 $P1 "22 August 2025")
deposit $SA3 180000 "22 August 2025"
deposit $SA3 50000 "01 September 2025"
echo "  Client 3 (Mercy): KES 230,000"

SA4=$(create_savings 4 $P1 "01 June 2025")
deposit $SA4 120000 "01 June 2025"
echo "  Client 4 (Hassan): KES 120,000"

SA5=$(create_savings 5 $P1 "14 February 2026")
deposit $SA5 35000 "14 February 2026"
echo "  Client 5 (Grace): KES 35,000"

SA6=$(create_savings 6 $P2 "30 January 2025")
deposit $SA6 500000 "30 January 2025"
deposit $SA6 150000 "01 March 2025"
echo "  Client 6 (Peter): KES 650,000 (Business)"

SA7=$(create_savings 7 $P1 "05 November 2025")
deposit $SA7 95000 "05 November 2025"
echo "  Client 7 (Fatuma): KES 95,000"

SA8=$(create_savings 8 $P1 "18 April 2025")
deposit $SA8 160000 "18 April 2025"
echo "  Client 8 (Otieno): KES 160,000"

SA9=$(create_savings 9 $P1 "02 March 2026")
deposit $SA9 28000 "02 March 2026"
echo "  Client 9 (Wanjiru): KES 28,000"

SA10=$(create_savings 10 $P1 "14 September 2025")
deposit $SA10 78000 "14 September 2025"
echo "  Client 10 (Juma): KES 78,000"

SA11=$(create_savings 11 $P2 "20 February 2025")
deposit $SA11 450000 "20 February 2025"
deposit $SA11 200000 "01 April 2025"
echo "  Client 11 (Njeri): KES 650,000 (Business)"

SA12=$(create_savings 12 $P1 "01 December 2024")
deposit $SA12 15000 "01 December 2024"
echo "  Client 12 (Kiprop): KES 15,000"

SA13=$(create_savings 13 $P1 "10 July 2025")
deposit $SA13 85000 "10 July 2025"
echo "  Client 13 (Rose): KES 85,000"

SA14=$(create_savings 14 $P2 "25 April 2025")
deposit $SA14 350000 "25 April 2025"
echo "  Client 14 (Abdi): KES 350,000 (Business)"

SA15=$(create_savings 15 $P1 "08 August 2025")
deposit $SA15 110000 "08 August 2025"
echo "  Client 15 (Catherine): KES 110,000"

# ─── 8. LOAN ACCOUNTS ────────────────────────
echo ">>> 8. Creating loan accounts..."

create_loan() {
  local client="$1" product="$2" principal="$3" term="$4" date="$5"
  local id=$(h POST "/loans" "{
    \"clientId\": $client,
    \"productId\": $product,
    \"principal\": $principal,
    \"loanTermFrequency\": $term,
    \"loanTermFrequencyType\": 2,
    \"numberOfRepayments\": $term,
    \"repaymentEvery\": 1,
    \"repaymentFrequencyType\": 2,
    \"interestRatePerPeriod\": 1.5,
    \"amortizationType\": 1,
    \"interestType\": 0,
    \"interestCalculationPeriodType\": 1,
    \"transactionProcessingStrategyCode\": \"mifos-standard-strategy\",
    \"expectedDisbursementDate\": \"$date\",
    \"submittedOnDate\": \"$date\",
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\"
  }" | python3 -c "import sys,json; print(json.load(sys.stdin).get('loanId',''))" 2>/dev/null)

  # Approve
  h POST "/loans/$id?command=approve" "{
    \"approvedOnDate\": \"$date\",
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\"
  }" > /dev/null

  # Disburse
  h POST "/loans/$id?command=disburse" "{
    \"actualDisbursementDate\": \"$date\",
    \"transactionAmount\": $principal,
    \"dateFormat\": \"$DATE_FORMAT\",
    \"locale\": \"$LOCALE\"
  }" > /dev/null

  echo "$id"
}

LP1=${LOAN_PROD1:-1}
LP2=${LOAN_PROD2:-2}

L1=$(create_loan 1 $LP1 150000 12 "01 April 2025")
echo "  Amina: Personal Loan KES 150,000 / 12m"

L2=$(create_loan 3 $LP1 200000 18 "01 September 2025")
echo "  Mercy: Personal Loan KES 200,000 / 18m"

L3=$(create_loan 6 $LP2 750000 24 "01 March 2025")
echo "  Peter: Business Loan KES 750,000 / 24m"

L4=$(create_loan 8 $LP1 100000 12 "01 May 2025")
echo "  Otieno: Personal Loan KES 100,000 / 12m"

L5=$(create_loan 11 $LP2 1500000 36 "01 April 2025")
echo "  Njeri: Business Loan KES 1,500,000 / 36m"

L6=$(create_loan 14 $LP2 500000 18 "01 May 2025")
echo "  Abdi: Business Loan KES 500,000 / 18m"

# ─── 9. SUMMARY ──────────────────────────────
echo ""
echo "=== Seed Complete ==="
echo ""
echo "  Offices:          3 (Nairobi HQ, Mombasa, Kisumu)"
echo "  GL Accounts:      25"
echo "  Savings Products: 2 (Personal 7.5%, Business 5.0%)"
echo "  Loan Products:    2 (Personal 1.5%/m, Business 1.2%/m)"
echo "  Clients:          15"
echo "  Savings Accounts: 15 (Total: ~KES 2.98M)"
echo "  Loans:            6 (Total: ~KES 3.2M)"
echo ""
echo "NeoBank Fineract is ready at https://localhost:9443"
