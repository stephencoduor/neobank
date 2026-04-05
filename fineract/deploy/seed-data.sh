#!/usr/bin/env bash
###############################################################################
# seed-data.sh  --  Populate Apache Fineract with realistic Kenyan SACCO data
#
# Usage:  bash seed-data.sh [--base-url URL]
#
# Defaults:
#   API base   = http://localhost:8443/fineract-provider/api/v1
#   Auth       = Basic bWlmb3M6cGFzc3dvcmQ=
#   Tenant     = default
#
# IDEMPOTENT: queries existing resources before creating, skips duplicates.
###############################################################################
set -uo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL="${FINERACT_BASE_URL:-http://localhost:8443/fineract-provider/api/v1}"
AUTH_HEADER="Authorization: Basic bWlmb3M6cGFzc3dvcmQ="
TENANT_HEADER="Fineract-Platform-TenantId: default"
CONTENT_TYPE="Content-Type: application/json"
DATE_FORMAT="dd MMMM yyyy"
LOCALE="en"
TODAY="01 April 2026"
ACTIVATION_DATE="01 January 2026"
SUBMIT_DATE="01 January 2026"
APPROVAL_DATE="15 January 2026"
DISBURSE_DATE="01 February 2026"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url) BASE_URL="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# Colours & helpers
# ---------------------------------------------------------------------------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log_section() { echo -e "\n${BOLD}${CYAN}=== $1 ===${NC}"; }
log_ok()      { echo -e "  ${GREEN}[OK]${NC} $1"; }
log_warn()    { echo -e "  ${YELLOW}[WARN]${NC} $1"; }
log_fail()    { echo -e "  ${RED}[FAIL]${NC} $1"; }
log_info()    { echo -e "  ${CYAN}[INFO]${NC} $1"; }
log_skip()    { echo -e "  ${YELLOW}[SKIP]${NC} $1"; }

ERRORS=0

api_post() {
  local endpoint="$1"
  local data="$2"
  local url="${BASE_URL}${endpoint}"
  local tmpfile
  tmpfile=$(mktemp)
  HTTP_CODE=$(curl -s -w "%{http_code}" -o "$tmpfile" \
    -X POST "$url" -H "$AUTH_HEADER" -H "$TENANT_HEADER" -H "$CONTENT_TYPE" \
    -d "$data" 2>/dev/null) || true
  RESPONSE=$(cat "$tmpfile"); rm -f "$tmpfile"
  echo "$RESPONSE"
}

api_put() {
  local endpoint="$1"
  local data="$2"
  local url="${BASE_URL}${endpoint}"
  local tmpfile
  tmpfile=$(mktemp)
  HTTP_CODE=$(curl -s -w "%{http_code}" -o "$tmpfile" \
    -X PUT "$url" -H "$AUTH_HEADER" -H "$TENANT_HEADER" -H "$CONTENT_TYPE" \
    -d "$data" 2>/dev/null) || true
  RESPONSE=$(cat "$tmpfile"); rm -f "$tmpfile"
  echo "$RESPONSE"
}

api_get() {
  local endpoint="$1"
  local url="${BASE_URL}${endpoint}"
  curl -s -X GET "$url" -H "$AUTH_HEADER" -H "$TENANT_HEADER" -H "$CONTENT_TYPE" 2>/dev/null
}

extract_id() {
  echo "$1" | grep -oP '"(resourceId|savingsId|loanId|clientId|groupId|officeId|staffId)"\s*:\s*\K[0-9]+' | head -1
}

# Extract all IDs from a JSON array
extract_all_ids() {
  echo "$1" | grep -oP '"id"\s*:\s*\K[0-9]+' || true
}

# Check if a name exists in JSON array response
name_exists() {
  local json="$1" name="$2"
  echo "$json" | grep -qF "\"$name\""
}

# Get ID by name from JSON array
get_id_by_name() {
  local json="$1" name="$2"
  # Simple approach: find the name, then look backwards for id
  echo "$json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, dict) and 'pageItems' in data:
    data = data['pageItems']
for item in data:
    if item.get('name','') == '$name' or item.get('displayName','') == '$name' or (item.get('firstname','') + ' ' + item.get('lastname','')) == '$name':
        print(item['id'])
        break
" 2>/dev/null || echo ""
}

###############################################################################
#  1. OFFICES
###############################################################################
create_offices() {
  log_section "STEP 1: Offices"

  # Get existing offices
  local existing
  existing=$(api_get "/offices")
  log_info "Querying existing offices..."

  # Rename Head Office
  if ! echo "$existing" | grep -q '"Nairobi HQ"'; then
    api_put "/offices/1" '{"name":"Nairobi HQ"}' >/dev/null
    log_ok "Renamed Head Office -> Nairobi HQ"
  else
    log_skip "Nairobi HQ already exists"
  fi

  declare -a BRANCH_NAMES=(
    "Mombasa Branch"
    "Kisumu Branch"
    "Nakuru Branch"
    "Eldoret Branch"
    "Nyeri Branch"
    "Machakos Branch"
    "Kitale Branch"
    "Malindi Sub-Branch"
    "Nanyuki Branch"
    "Thika Sub-Branch"
    "Naivasha Sub-Branch"
  )

  # Re-fetch after rename
  existing=$(api_get "/offices")

  OFFICE_IDS=()
  OFFICE_IDS+=(1)  # Nairobi HQ is always ID 1

  for name in "${BRANCH_NAMES[@]}"; do
    local oid
    oid=$(get_id_by_name "$existing" "$name")
    if [[ -n "$oid" ]]; then
      OFFICE_IDS+=("$oid")
      log_skip "Office '$name' already exists (id=$oid)"
    else
      # Determine parent
      local parent_id=1
      if [[ "$name" == "Naivasha Sub-Branch" ]]; then
        # Under Nakuru
        for i in "${!OFFICE_IDS[@]}"; do
          local check_name
          check_name=$(echo "$existing" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for o in data:
    if o['id'] == ${OFFICE_IDS[$i]}:
        print(o.get('name',''))
        break
" 2>/dev/null || echo "")
          if [[ "$check_name" == *"Nakuru"* ]]; then
            parent_id="${OFFICE_IDS[$i]}"
            break
          fi
        done
      fi

      local resp
      resp=$(api_post "/offices" "{
        \"name\": \"$name\",
        \"parentId\": $parent_id,
        \"dateFormat\": \"$DATE_FORMAT\",
        \"locale\": \"$LOCALE\",
        \"openingDate\": \"01 January 2020\"
      }")
      oid=$(extract_id "$resp")
      if [[ -n "$oid" ]]; then
        OFFICE_IDS+=("$oid")
        log_ok "Created office '$name' (id=$oid)"
      else
        OFFICE_IDS+=(1)
        log_fail "Failed to create '$name': $resp"
        ((ERRORS++)) || true
      fi
    fi
  done

  log_info "Total offices: ${#OFFICE_IDS[@]}"
}

###############################################################################
#  2. STAFF
###############################################################################
create_staff() {
  log_section "STEP 2: Staff"

  local existing
  existing=$(api_get "/staff?status=all")

  declare -a STAFF_DATA=(
    "Benjamin|Ochieng|0|true|true"
    "Ruth|Akinyi|0|true|true"
    "Paul|Kamau|1|true|true"
    "Alice|Wanjiru|2|true|true"
    "Michael|Kiplagat|3|true|true"
    "Florence|Nyambura|4|true|true"
    "Charles|Mutua|5|true|true"
    "Joyce|Chebet|6|true|false"
    "Henry|Otieno|0|true|true"
    "Mercy|Wangari|8|true|false"
  )

  STAFF_IDS=()

  for entry in "${STAFF_DATA[@]}"; do
    IFS='|' read -r fname lname oix active loanofficer <<< "$entry"
    local fullname="$fname $lname"

    # Check if exists
    local sid
    sid=$(echo "$existing" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, dict) and 'pageItems' in data:
    data = data['pageItems']
if not isinstance(data, list):
    data = []
for s in data:
    if s.get('firstname','') == '$fname' and s.get('lastname','') == '$lname':
        print(s['id'])
        break
" 2>/dev/null || echo "")

    if [[ -n "$sid" ]]; then
      STAFF_IDS+=("$sid")
      log_skip "Staff '$fullname' already exists (id=$sid)"
    else
      local office_id="${OFFICE_IDS[$oix]:-1}"
      local resp
      resp=$(api_post "/staff" "{
        \"officeId\": $office_id,
        \"firstname\": \"$fname\",
        \"lastname\": \"$lname\",
        \"isLoanOfficer\": $loanofficer,
        \"isActive\": $active,
        \"dateFormat\": \"$DATE_FORMAT\",
        \"locale\": \"$LOCALE\",
        \"joiningDate\": \"01 January 2022\"
      }")
      sid=$(extract_id "$resp")
      if [[ -n "$sid" ]]; then
        STAFF_IDS+=("$sid")
        log_ok "Created staff '$fullname' (id=$sid)"
      else
        log_fail "Failed to create staff '$fullname': $resp"
        STAFF_IDS+=(1)
        ((ERRORS++)) || true
      fi
    fi
  done

  log_info "Total staff IDs: ${STAFF_IDS[*]}"
}

###############################################################################
#  3. LOAN PRODUCTS
###############################################################################
create_loan_products() {
  log_section "STEP 3: Loan Products"

  local existing
  existing=$(api_get "/loanproducts")

  declare -a LP_DATA=(
    "BSH|Biashara Loan|500000|24|14|Business development loan for SACCO members"
    "KLM|Kilimo Loan|200000|12|12|Agricultural financing for small-scale farmers"
    "NYM|Nyumba Loan|2000000|60|15|Housing and construction loan"
    "ELM|Elimu Loan|150000|12|10|Education and school fees financing"
    "MPF|M-Pesa Float Loan|100000|6|18|Mobile money float financing"
    "DKA|Duka Loan|300000|18|16|Retail shop and small business loan"
    "JKL|Jua Kali Loan|75000|12|15|Artisan and informal sector loan"
    "MTT|Matatu Loan|1500000|36|16|Public transport vehicle financing"
  )

  LOAN_PRODUCT_IDS=()

  for entry in "${LP_DATA[@]}"; do
    IFS='|' read -r short name principal repayments rate desc <<< "$entry"

    local pid
    pid=$(get_id_by_name "$existing" "$name")
    if [[ -n "$pid" ]]; then
      LOAN_PRODUCT_IDS+=("$pid")
      log_skip "Loan product '$name' already exists (id=$pid)"
    else
      local min_principal=$((principal / 10))
      local resp
      resp=$(api_post "/loanproducts" "{
        \"name\": \"$name\",
        \"shortName\": \"$short\",
        \"description\": \"$desc\",
        \"currencyCode\": \"KES\",
        \"digitsAfterDecimal\": 2,
        \"inMultiplesOf\": 100,
        \"principal\": $principal,
        \"minPrincipal\": $min_principal,
        \"maxPrincipal\": $((principal * 2)),
        \"numberOfRepayments\": $repayments,
        \"minNumberOfRepayments\": 1,
        \"maxNumberOfRepayments\": $((repayments * 2)),
        \"repaymentEvery\": 1,
        \"repaymentFrequencyType\": 2,
        \"interestRatePerPeriod\": $rate,
        \"minInterestRatePerPeriod\": $((rate - 2)),
        \"maxInterestRatePerPeriod\": $((rate + 5)),
        \"interestRateFrequencyType\": 3,
        \"amortizationType\": 1,
        \"interestType\": 0,
        \"interestCalculationPeriodType\": 1,
        \"transactionProcessingStrategyCode\": \"mifos-standard-strategy\",
        \"accountingRule\": 1,
        \"daysInMonthType\": 1,
        \"daysInYearType\": 1,
        \"isInterestRecalculationEnabled\": false,
        \"locale\": \"$LOCALE\",
        \"dateFormat\": \"$DATE_FORMAT\"
      }")
      pid=$(extract_id "$resp")
      if [[ -n "$pid" ]]; then
        LOAN_PRODUCT_IDS+=("$pid")
        log_ok "Created loan product '$name' (id=$pid)"
      else
        LOAN_PRODUCT_IDS+=(0)
        log_fail "Failed to create '$name': $resp"
        ((ERRORS++)) || true
      fi
    fi
  done

  log_info "Total loan products: ${#LOAN_PRODUCT_IDS[@]}"
}

###############################################################################
#  4. SAVINGS PRODUCTS
###############################################################################
create_savings_products() {
  log_section "STEP 4: Savings Products"

  local existing
  existing=$(api_get "/savingsproducts")

  declare -a SP_DATA=(
    "AKB|Akiba Savings|6|1000|Regular savings account for SACCO members"
    "HZN|Hazina Fixed Deposit|10|50000|Fixed deposit account with competitive returns"
    "VJN|Vijana Savings|7|500|Youth savings account for under-35 members"
    "BSS|Biashara Savings|5|5000|Business savings for traders and entrepreneurs"
    "MZZ|Mzazi Savings|8|2000|Education savings for school fees planning"
    "PMJ|Pamoja Group Savings|6.5|10000|Group savings for chamas and self-help groups"
  )

  SAVINGS_PRODUCT_IDS=()

  for entry in "${SP_DATA[@]}"; do
    IFS='|' read -r short name rate minbal desc <<< "$entry"

    local pid
    pid=$(get_id_by_name "$existing" "$name")
    if [[ -n "$pid" ]]; then
      SAVINGS_PRODUCT_IDS+=("$pid")
      log_skip "Savings product '$name' already exists (id=$pid)"
    else
      local resp
      resp=$(api_post "/savingsproducts" "{
        \"name\": \"$name\",
        \"shortName\": \"$short\",
        \"description\": \"$desc\",
        \"currencyCode\": \"KES\",
        \"digitsAfterDecimal\": 2,
        \"inMultiplesOf\": 100,
        \"nominalAnnualInterestRate\": $rate,
        \"interestCompoundingPeriodType\": 4,
        \"interestPostingPeriodType\": 4,
        \"interestCalculationType\": 1,
        \"interestCalculationDaysInYearType\": 365,
        \"minRequiredOpeningBalance\": $minbal,
        \"accountingRule\": 1,
        \"locale\": \"$LOCALE\"
      }")
      pid=$(extract_id "$resp")
      if [[ -n "$pid" ]]; then
        SAVINGS_PRODUCT_IDS+=("$pid")
        log_ok "Created savings product '$name' (id=$pid)"
      else
        SAVINGS_PRODUCT_IDS+=(0)
        log_fail "Failed to create '$name': $resp"
        ((ERRORS++)) || true
      fi
    fi
  done

  log_info "Total savings products: ${#SAVINGS_PRODUCT_IDS[@]}"
}

###############################################################################
#  5. CLIENTS (50 Kenyan names with legalFormId)
###############################################################################
create_clients() {
  log_section "STEP 5: Creating Clients (50)"

  # Check existing clients
  local existing_count
  existing_count=$(api_get "/clients?limit=1&paged=true" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('totalFilteredRecords', 0))
" 2>/dev/null || echo "0")

  if [[ "$existing_count" -ge 40 ]]; then
    log_skip "Already $existing_count clients in database, skipping client creation"
    # Load existing client IDs
    local all_clients
    all_clients=$(api_get "/clients?limit=50&paged=true")
    CLIENT_IDS=()
    CLIENT_OFFICES=()
    while IFS= read -r cid; do
      [[ -n "$cid" ]] && CLIENT_IDS+=("$cid") && CLIENT_OFFICES+=(1)
    done <<< "$(echo "$all_clients" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('pageItems', []):
    print(c['id'])
" 2>/dev/null)"
    log_info "Loaded ${#CLIENT_IDS[@]} existing client IDs"
    return
  fi

  # firstname|middlename|lastname|gender(M/F)|officeIndex|staffIndex|phone|nationalId
  declare -a CLIENT_DATA=(
    "Wanjiku|Njeri|Kamau|F|0|0|0712345678|23456789"
    "Ochieng|Otieno|Owino|M|0|0|0723456789|34567890"
    "Aisha|Fatuma|Mohamed|F|1|2|0734567890|45678901"
    "Kipchoge|Kiprono|Mutai|M|3|4|0745678901|56789012"
    "Nyambura|Wangari|Muthoni|F|0|1|0756789012|67890123"
    "Grace|Kemunto|Nyaboke|F|2|3|0767890123|78901234"
    "Samuel|Mwangi|Karanja|M|0|0|0778901234|89012345"
    "Fatma|Amina|Hassan|F|1|2|0789012345|90123456"
    "Joseph|Kiplagat|Cheruiyot|M|3|4|0790123456|12345670"
    "Mary|Wambui|Ngugi|F|0|1|0701234567|23456701"
    "James|Odhiambo|Onyango|M|2|3|0712345670|34567012"
    "Lucy|Wairimu|Njoroge|F|4|5|0723456701|45670123"
    "Peter|Kimani|Githinji|M|5|6|0734567012|56701234"
    "Sarah|Chebet|Kosgei|F|3|4|0745670123|67012345"
    "Daniel|Mutua|Kioko|M|6|7|0756701234|70123456"
    "Esther|Nyambura|Wanjiku|F|0|0|0767012345|01234567"
    "John|Maina|Kuria|M|0|1|0778012345|12345078"
    "Agnes|Adhiambo|Otieno|F|2|3|0789123456|23450789"
    "David|Wekesa|Barasa|M|4|5|0790234567|34501234"
    "Catherine|Nduta|Macharia|F|0|0|0701345678|45012345"
    "Patrick|Rotich|Langat|M|3|4|0712456789|50123456"
    "Janet|Jepkosgei|Ruto|F|4|5|0723567890|01234560"
    "Stephen|Kariuki|Ndirangu|M|0|1|0734678901|10234567"
    "Margaret|Akinyi|Oloo|F|2|3|0745789012|20345678"
    "Thomas|Onyango|Ouma|M|1|2|0756890123|30456789"
    "Elizabeth|Wanjiru|Mbugua|F|5|6|0767901234|40567890"
    "Francis|Kibet|Korir|M|3|4|0778012340|51678901"
    "Rose|Nekesa|Wafula|F|4|5|0789123450|62789012"
    "Anthony|Muthomi|Murungi|M|6|7|0790234560|73890123"
    "Eunice|Moraa|Nyakundi|F|2|3|0701345670|84901234"
    "George|Omondi|Okoth|M|0|0|0712456780|95012345"
    "Priscilla|Chelagat|Kiprop|F|3|4|0723567891|16123456"
    "Victor|Njuguna|Macharia|M|0|1|0734678912|27234567"
    "Monica|Atieno|Achieng|F|1|2|0745789123|38345678"
    "Robert|Kiprotich|Bett|M|4|5|0756890234|49456789"
    "Winnie|Muthoni|Wainaina|F|5|6|0767901345|50567891"
    "Dennis|Ochieng|Odinga|M|2|3|0778012456|61678912"
    "Purity|Wanjala|Simiyu|F|6|7|0789123567|72789123"
    "Christopher|Kirui|Sang|M|3|4|0790234678|83890234"
    "Susan|Nyokabi|Mwangi|F|0|0|0701345789|94901345"
    "Martin|Opondo|Owuor|M|1|2|0712456891|15012456"
    "Carolyne|Jelimo|Chepkoech|F|4|5|0723567912|26123567"
    "Brian|Muchiri|Kamau|M|0|1|0734679012|37234678"
    "Mercy|Nyaguthii|Mugo|F|5|6|0745780123|48345789"
    "Philip|Limo|Kipkemoi|M|3|4|0756891234|59456891"
    "Jane|Nyarangi|Ombati|F|2|3|0767912345|60567912"
    "Andrew|Mwendwa|Kitavi|M|6|7|0778023456|71679023"
    "Tabitha|Waithera|Kinyanjui|F|0|0|0789134567|82780134"
    "Kenneth|Biwott|Kiptoo|M|4|5|0790245678|93891245"
    "Gladys|Kwamboka|Ongeri|F|1|2|0701356789|14902356"
  )

  CLIENT_IDS=()
  CLIENT_OFFICES=()
  local idx=0
  local num_staff=${#STAFF_IDS[@]}

  for entry in "${CLIENT_DATA[@]}"; do
    IFS='|' read -r fname mname lname gender oix six phone natid <<< "$entry"

    local gender_id
    if [[ "$gender" == "M" ]]; then gender_id=23; else gender_id=24; fi

    local office_id="${OFFICE_IDS[$oix]:-1}"
    # Safe staff index - wrap around if out of bounds
    local safe_six=$((six % num_staff))
    local staff_id="${STAFF_IDS[$safe_six]}"

    # Skip if staff_id is 0 or empty, use first available
    if [[ -z "$staff_id" || "$staff_id" == "0" ]]; then
      staff_id="${STAFF_IDS[0]}"
    fi

    local resp
    resp=$(api_post "/clients" "{
      \"officeId\": $office_id,
      \"firstname\": \"$fname\",
      \"middlename\": \"$mname\",
      \"lastname\": \"$lname\",
      \"externalId\": \"KE-$natid\",
      \"mobileNo\": \"+254$phone\",
      \"genderId\": $gender_id,
      \"staffId\": $staff_id,
      \"legalFormId\": 1,
      \"active\": false,
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\",
      \"submittedOnDate\": \"$SUBMIT_DATE\"
    }")
    local cid
    cid=$(extract_id "$resp")
    if [[ -n "$cid" && "$cid" != "0" ]]; then
      # Activate
      api_post "/clients/$cid?command=activate" "{
        \"activationDate\": \"$ACTIVATION_DATE\",
        \"dateFormat\": \"$DATE_FORMAT\",
        \"locale\": \"$LOCALE\"
      }" >/dev/null
      CLIENT_IDS+=("$cid")
      CLIENT_OFFICES+=("$office_id")
      log_ok "Client '$fname $mname $lname' (id=$cid, staff=$staff_id)"
    else
      log_fail "Client '$fname $lname': $resp"
      CLIENT_IDS+=(0)
      CLIENT_OFFICES+=(1)
      ((ERRORS++)) || true
    fi

    ((idx++)) || true
    if (( idx % 10 == 0 )); then
      log_info "Progress: $idx / ${#CLIENT_DATA[@]}"
    fi
  done

  log_info "Total clients: ${#CLIENT_IDS[@]}"
}

###############################################################################
#  6. SAVINGS ACCOUNTS
###############################################################################
create_savings_accounts() {
  log_section "STEP 6: Savings Accounts (~30)"

  SAVINGS_ACCOUNT_IDS=()

  # Check if savings products exist
  if [[ ${#SAVINGS_PRODUCT_IDS[@]} -eq 0 || "${SAVINGS_PRODUCT_IDS[0]}" == "0" ]]; then
    log_fail "No valid savings products — skipping savings accounts"
    return
  fi

  # productIndex|clientIndex|depositAmount
  declare -a SA_DATA=(
    "0|0|25000"   "0|1|15000"   "0|2|10000"   "0|3|50000"
    "0|4|8000"    "0|6|30000"   "0|9|12000"    "0|10|20000"
    "1|7|100000"  "1|12|75000"  "1|16|200000"  "1|20|50000"
    "1|24|150000"
    "2|5|5000"    "2|11|3000"   "2|15|7500"    "2|22|2000"
    "2|30|4000"
    "3|8|50000"   "3|13|35000"  "3|17|80000"   "3|25|45000"
    "3|31|60000"
    "4|14|15000"  "4|18|20000"  "4|26|10000"   "4|32|25000"
    "5|19|100000" "5|23|75000"  "5|27|50000"
  )

  local count=0

  for entry in "${SA_DATA[@]}"; do
    IFS='|' read -r pidx cidx deposit <<< "$entry"

    local product_id="${SAVINGS_PRODUCT_IDS[$pidx]:-${SAVINGS_PRODUCT_IDS[0]}}"
    local client_id="${CLIENT_IDS[$cidx]:-0}"

    if [[ "$client_id" == "0" || "$product_id" == "0" ]]; then
      log_warn "Skip savings (client=$client_id, product=$product_id)"
      continue
    fi

    local resp
    resp=$(api_post "/savingsaccounts" "{
      \"clientId\": $client_id,
      \"productId\": $product_id,
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\",
      \"submittedOnDate\": \"$SUBMIT_DATE\"
    }")
    local said
    said=$(extract_id "$resp")

    if [[ -z "$said" || "$said" == "0" ]]; then
      log_fail "Savings for client $client_id: $resp"
      ((ERRORS++)) || true
      continue
    fi

    # Approve
    api_post "/savingsaccounts/$said?command=approve" "{
      \"approvedOnDate\": \"$APPROVAL_DATE\",
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\"
    }" >/dev/null

    # Activate
    api_post "/savingsaccounts/$said?command=activate" "{
      \"activatedOnDate\": \"$APPROVAL_DATE\",
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\"
    }" >/dev/null

    # Deposit
    api_post "/savingsaccounts/$said/transactions?command=deposit" "{
      \"transactionDate\": \"$DISBURSE_DATE\",
      \"transactionAmount\": $deposit,
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\",
      \"paymentTypeId\": 1
    }" >/dev/null

    SAVINGS_ACCOUNT_IDS+=("$said")
    log_ok "Savings id=$said (client=$client_id, KES $deposit)"

    ((count++)) || true
    if (( count % 10 == 0 )); then
      log_info "Progress: $count savings accounts"
    fi
  done

  log_info "Total savings accounts: ${#SAVINGS_ACCOUNT_IDS[@]}"
}

###############################################################################
#  7. LOANS
###############################################################################
create_loans() {
  log_section "STEP 7: Loans (~20)"

  LOAN_IDS=()

  # productIndex|clientIndex|principal|numRepayments|status
  declare -a LOAN_DATA=(
    "0|0|500000|24|disbursed"
    "0|6|350000|18|disbursed"
    "0|10|250000|12|approved"
    "0|16|400000|24|pending"
    "1|3|150000|12|disbursed"
    "1|8|100000|12|disbursed"
    "1|13|200000|12|approved"
    "1|20|80000|6|pending"
    "2|1|1500000|60|disbursed"
    "2|7|2000000|60|approved"
    "2|24|1000000|36|pending"
    "3|4|100000|12|disbursed"
    "3|11|150000|12|disbursed"
    "3|15|75000|6|approved"
    "4|9|80000|6|disbursed"
    "4|17|100000|6|approved"
    "5|2|250000|18|disbursed"
    "5|14|300000|18|approved"
    "6|5|50000|12|disbursed"
    "7|12|1200000|36|pending"
  )

  declare -a RATES=(14 12 15 10 18 16 15 16)
  local count=0

  for entry in "${LOAN_DATA[@]}"; do
    IFS='|' read -r pidx cidx principal nrepay status <<< "$entry"

    local product_id="${LOAN_PRODUCT_IDS[$pidx]:-${LOAN_PRODUCT_IDS[0]}}"
    local client_id="${CLIENT_IDS[$cidx]:-0}"

    if [[ "$client_id" == "0" || "$product_id" == "0" ]]; then
      log_warn "Skip loan (client=$client_id, product=$product_id)"
      continue
    fi

    local rate="${RATES[$pidx]}"
    local resp
    resp=$(api_post "/loans" "{
      \"clientId\": $client_id,
      \"productId\": $product_id,
      \"principal\": $principal,
      \"loanTermFrequency\": $nrepay,
      \"loanTermFrequencyType\": 2,
      \"numberOfRepayments\": $nrepay,
      \"repaymentEvery\": 1,
      \"repaymentFrequencyType\": 2,
      \"interestRatePerPeriod\": $rate,
      \"amortizationType\": 1,
      \"interestType\": 0,
      \"interestCalculationPeriodType\": 1,
      \"transactionProcessingStrategyCode\": \"mifos-standard-strategy\",
      \"expectedDisbursementDate\": \"$DISBURSE_DATE\",
      \"submittedOnDate\": \"$SUBMIT_DATE\",
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\",
      \"loanType\": \"individual\"
    }")
    local lid
    lid=$(extract_id "$resp")

    if [[ -z "$lid" || "$lid" == "0" ]]; then
      log_fail "Loan for client $client_id: $resp"
      ((ERRORS++)) || true
      continue
    fi

    LOAN_IDS+=("$lid")

    if [[ "$status" == "approved" || "$status" == "disbursed" ]]; then
      api_post "/loans/$lid?command=approve" "{
        \"approvedOnDate\": \"$APPROVAL_DATE\",
        \"dateFormat\": \"$DATE_FORMAT\",
        \"locale\": \"$LOCALE\"
      }" >/dev/null
    fi

    if [[ "$status" == "disbursed" ]]; then
      api_post "/loans/$lid?command=disburse" "{
        \"actualDisbursementDate\": \"$DISBURSE_DATE\",
        \"dateFormat\": \"$DATE_FORMAT\",
        \"locale\": \"$LOCALE\"
      }" >/dev/null
    fi

    log_ok "Loan id=$lid (client=$client_id, KES $principal, $status)"

    ((count++)) || true
    if (( count % 10 == 0 )); then
      log_info "Progress: $count loans"
    fi
  done

  log_info "Total loans: ${#LOAN_IDS[@]}"
}

###############################################################################
#  8. GROUPS
###############################################################################
create_groups() {
  log_section "STEP 8: Groups"

  # Check existing
  local existing_count
  existing_count=$(api_get "/groups?paged=true&limit=1" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('totalFilteredRecords', 0))
" 2>/dev/null || echo "0")

  if [[ "$existing_count" -ge 6 ]]; then
    log_skip "Already $existing_count groups, skipping"
    return
  fi

  declare -a GROUP_DATA=(
    "Umoja Self-Help Group|0|0|0,1,4,6,9"
    "Pamoja Women Group|0|1|2,5,10,15,19"
    "Vijana Savings Circle|2|3|11,17,23,29,35"
    "Harambee Farmers Cooperative|3|4|3,8,13,20,27"
    "Maendeleo Youth Group|1|2|7,14,24,33,41"
    "Tumaini Widows Group|4|5|21,28,34,42,44"
    "Safari Traders Association|5|6|12,25,31,36,43"
    "Jamii Boda Boda Welfare|6|7|18,26,37,38,46"
  )

  GROUP_IDS=()
  local num_staff=${#STAFF_IDS[@]}

  for entry in "${GROUP_DATA[@]}"; do
    IFS='|' read -r gname oix six member_indices <<< "$entry"

    local office_id="${OFFICE_IDS[$oix]:-1}"
    local safe_six=$((six % num_staff))
    local staff_id="${STAFF_IDS[$safe_six]}"

    local resp
    resp=$(api_post "/groups" "{
      \"name\": \"$gname\",
      \"officeId\": $office_id,
      \"staffId\": $staff_id,
      \"active\": false,
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\",
      \"submittedOnDate\": \"$SUBMIT_DATE\"
    }")
    local gid
    gid=$(extract_id "$resp")

    if [[ -z "$gid" || "$gid" == "0" ]]; then
      log_fail "Group '$gname': $resp"
      ((ERRORS++)) || true
      continue
    fi

    # Activate
    api_post "/groups/$gid?command=activate" "{
      \"activationDate\": \"$ACTIVATION_DATE\",
      \"dateFormat\": \"$DATE_FORMAT\",
      \"locale\": \"$LOCALE\"
    }" >/dev/null

    # Add members
    IFS=',' read -ra MIDXS <<< "$member_indices"
    local valid_members=()
    for midx in "${MIDXS[@]}"; do
      local cid="${CLIENT_IDS[$midx]:-0}"
      [[ "$cid" != "0" ]] && valid_members+=("$cid")
    done

    if [[ ${#valid_members[@]} -gt 0 ]]; then
      local members_array
      members_array=$(printf '%s,' "${valid_members[@]}")
      members_array="[${members_array%,}]"
      api_post "/groups/$gid?command=associateClients" "{\"clientMembers\": $members_array}" >/dev/null
    fi

    GROUP_IDS+=("$gid")
    log_ok "Group '$gname' (id=$gid, ${#valid_members[@]} members)"
  done

  log_info "Total groups: ${#GROUP_IDS[@]}"
}

###############################################################################
#  MAIN
###############################################################################
main() {
  echo -e "${BOLD}${CYAN}"
  echo "========================================================"
  echo "  Fineract SACCO Seed Data Loader (Idempotent)"
  echo "  Kenyan / East African Context"
  echo "========================================================"
  echo -e "${NC}"
  echo -e "API Base URL: ${YELLOW}$BASE_URL${NC}"
  echo ""

  log_info "Testing API connectivity..."
  local test_resp
  test_resp=$(api_get "/offices/1")
  if echo "$test_resp" | grep -q '"id"'; then
    log_ok "API is reachable"
  else
    log_fail "Cannot reach Fineract API at $BASE_URL"
    log_fail "Response: $test_resp"
    exit 1
  fi

  local start_time=$SECONDS

  create_offices
  create_staff
  create_loan_products
  create_savings_products
  create_clients
  create_savings_accounts
  create_loans
  create_groups

  local elapsed=$(( SECONDS - start_time ))

  echo ""
  log_section "SEED DATA COMPLETE"
  echo -e "  Offices:          ${GREEN}${#OFFICE_IDS[@]}${NC}"
  echo -e "  Staff:            ${GREEN}${#STAFF_IDS[@]}${NC}"
  echo -e "  Loan Products:    ${GREEN}${#LOAN_PRODUCT_IDS[@]}${NC}"
  echo -e "  Savings Products: ${GREEN}${#SAVINGS_PRODUCT_IDS[@]}${NC}"
  echo -e "  Clients:          ${GREEN}${#CLIENT_IDS[@]}${NC}"
  echo -e "  Savings Accounts: ${GREEN}${#SAVINGS_ACCOUNT_IDS[@]}${NC}"
  echo -e "  Loans:            ${GREEN}${#LOAN_IDS[@]}${NC}"
  echo -e "  Groups:           ${GREEN}${#GROUP_IDS[@]}${NC}"
  echo ""
  echo -e "  Errors:           ${RED}$ERRORS${NC}"
  echo -e "  Time:             ${CYAN}${elapsed}s${NC}"
  echo ""

  if [[ $ERRORS -gt 0 ]]; then
    echo -e "${YELLOW}Some steps had errors. Review output above.${NC}"
  else
    echo -e "${GREEN}All seed data loaded successfully!${NC}"
  fi
}

main "$@"
