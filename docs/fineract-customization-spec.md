# Fineract Customization Specification

## NeoBank Digital Banking & Payments Ecosystem

| Field | Detail |
|---|---|
| **Product** | NeoBank -- Next-Gen Digital Banking & Payments Ecosystem |
| **Client** | Qsoftwares Ltd. |
| **Version** | 1.0 |
| **Date** | 2026-04-04 |
| **Depends On** | `fineract-integration-plan.md`, `TECH-SPEC.md`, `api-mapping.md` |
| **Core Banking** | Apache Fineract 1.9.x (Java 21, Spring Boot 3.x) |
| **Status** | Implemented — custom/neobank module created with 9 sub-modules |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Module 1: Mobile Money Payment Channel](#2-module-1-mobile-money-payment-channel)
3. [Module 2: KYC Tier Enforcement](#3-module-2-kyc-tier-enforcement)
4. [Module 3: Card Transaction Posting](#4-module-3-card-transaction-posting)
5. [Module 4: QR Payment Processing](#5-module-4-qr-payment-processing)
6. [Module 5: Merchant Module](#6-module-5-merchant-module)
7. [Module 6: Notification Hooks](#7-module-6-notification-hooks)
8. [Module 7: Custom Datatables](#8-module-7-custom-datatables)
9. [Module 8: Custom Reports](#9-module-8-custom-reports)
10. [Deployment and Testing](#10-deployment-and-testing)

---

## 1. Overview

### 1.1 What Fineract Provides Natively

Apache Fineract 1.9.x delivers a mature core banking engine covering:

- **Client lifecycle management** -- create, activate, KYC tiers, close, transfer between offices
- **Savings accounts** -- products, interest calculation, deposit/withdrawal, charges, block/unblock
- **Loan management** -- application, approval, disbursement, repayment scheduling, collections, delinquency
- **Double-entry GL accounting** -- chart of accounts, journal entries, auto-posting rules, financial closures
- **Role-based access control** -- 157+ granular permissions, custom roles, user management
- **Parameterized reporting** -- SQL-based report definitions, Pentaho integration, CSV/XLS/PDF output
- **Data tables** -- custom extension tables attached to any entity (clients, loans, savings)
- **Multi-tenant architecture** -- tenant isolation via `Fineract-Platform-TenantId` header
- **Batch API** -- execute multiple operations in a single request

### 1.2 What Requires Customization

The gap analysis in `fineract-integration-plan.md` identifies seven critical and high gaps. This specification defines eight custom Fineract modules that extend the platform without forking the core:

| Module | Gap Addressed | Priority |
|---|---|---|
| Mobile Money Payment Channel | C3: M-Pesa, Airtel Money, MTN MoMo integration | CRITICAL |
| KYC Tier Enforcement | C2: Identity verification + transaction limits | CRITICAL |
| Card Transaction Posting | C1: BaaS webhook receiver for card events | CRITICAL |
| QR Payment Processing | H2: EMVCo QR standard for merchant payments | HIGH |
| Merchant Module | H1: Merchant onboarding, POS, settlement, MDR | HIGH |
| Notification Hooks | H4: Event-driven push/SMS/email notifications | HIGH |
| Custom Datatables | Foundation: Schema extensions for all modules | FOUNDATION |
| Custom Reports | H5: Consumer analytics + admin dashboards | HIGH |

### 1.3 Extension Strategy

All customizations follow Fineract's official extension mechanism. The rules are:

1. **No core fork.** NeoBank never modifies `fineract-provider` source code. All extensions are delivered as separate JAR modules.
2. **Fineract SDK modules.** Each custom module is a standalone Gradle subproject that depends on `fineract-provider` as a compile-only dependency and registers itself via Spring auto-configuration.
3. **Classpath loading.** Custom JARs are placed in `$FINERACT_HOME/lib/` or mounted as volumes in Docker. Fineract discovers them via Spring Boot's auto-configuration scanning.
4. **Datatable framework.** All custom entity data is stored using Fineract's native datatable system, which provides automatic REST API access at `GET/POST /v1/datatables/{tableName}/{entityId}`.
5. **Event hooks.** Custom modules register Spring event listeners on Fineract's domain events (`SavingsDepositBusinessEvent`, `LoanApprovedBusinessEvent`, etc.).
6. **Payment type extensions.** New payment channels (M-Pesa, card, QR) register as Fineract payment types with GL posting rules.
7. **Report framework.** Custom SQL reports register with Fineract's report engine and are accessible via `GET /v1/runreports/{reportName}`.

### 1.4 Module Packaging

> **Updated April 2026:** The custom module has been implemented at `custom/neobank/` within the Fineract source tree (not as external JARs). The Fineract backend was stripped of 12 unused modules and unnecessary provider packages to reduce the footprint.

**Actual implementation:**
```
fineract/custom/neobank/
  mobilemoney/                          # M-Pesa, Airtel Money, MTN MoMo integration
  kyc/                                  # KYC tier enforcement and verification
  card/                                 # BaaS card transaction posting
  merchant/                             # Merchant onboarding, POS, settlement
  aml/                                  # AML/sanctions screening
  auth/                                 # Authentication extensions
  bills/                                # Bill payment aggregation
  savings-goals/                        # Savings goals and targets
  notifications/                        # Event-driven notifications
```

**Stripped modules (removed from Fineract):**
- fineract-investor, fineract-mix, fineract-loan-origination, fineract-client-feign
- fineract-react, fineract-e2e-tests-core, fineract-e2e-tests-runner
- oauth2-tests, twofactor-tests, custom/acme, fineract-working-capital-loan
- Provider packages: shareaccounts, shareproducts, meeting, collectionsheet, repaymentwithpostdatedchecks, interoperation, spm, gcm, campaigns, adhocquery, teller
- fineract-progressive-loan was **kept** (too deeply integrated)

**Original planned structure (for reference):**
```
neobank-fineract-extensions/
  build.gradle                          # Root build (multi-module)
  settings.gradle                       # Include subprojects
  neobank-mobilemoney/                  # Module 1
    build.gradle
    src/main/java/ke/co/neobank/fineract/mobilemoney/
    src/main/resources/db/migration/    # Flyway migrations
  neobank-kyc/                          # Module 2
    build.gradle
    src/main/java/ke/co/neobank/fineract/kyc/
    src/main/resources/db/migration/
  neobank-card/                         # Module 3
  neobank-qr/                           # Module 4
  neobank-merchant/                     # Module 5
  neobank-notification/                 # Module 6
  neobank-datatables/                   # Module 7
  neobank-reports/                      # Module 8
```

Each module produces a single JAR:

```groovy
// neobank-mobilemoney/build.gradle
plugins {
    id 'java-library'
    id 'org.springframework.boot' version '3.2.5' apply false
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'ke.co.neobank.fineract'
version = '1.0.0'

dependencies {
    compileOnly 'org.apache.fineract:fineract-provider:1.9.0'
    compileOnly 'org.springframework.boot:spring-boot-starter-web'
    compileOnly 'org.springframework.boot:spring-boot-starter-data-jpa'

    implementation 'org.flywaydb:flyway-core:10.10.0'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.testcontainers:postgresql:1.19.7'
}
```

---

## 2. Module 1: Mobile Money Payment Channel

### 2.1 Purpose

Fineract has no concept of mobile money. It processes deposits and withdrawals against savings accounts but has no integration with Safaricom Daraja (M-Pesa), Airtel Money, or MTN MoMo. This module registers mobile money as a first-class Fineract payment type, enabling GL posting rules and transaction tracking through the native savings transaction API.

### 2.2 Payment Type Registration

Fineract's payment type system allows custom payment methods. Each mobile money provider is registered as a distinct payment type:

```sql
-- V1.0.0__neobank_mobilemoney_payment_types.sql
-- Register mobile money payment types in Fineract

INSERT INTO m_payment_type (value, description, is_cash_payment, order_position)
VALUES ('M-Pesa', 'Safaricom M-Pesa mobile money', 0, 10);

INSERT INTO m_payment_type (value, description, is_cash_payment, order_position)
VALUES ('Airtel Money', 'Airtel Money mobile wallet', 0, 11);

INSERT INTO m_payment_type (value, description, is_cash_payment, order_position)
VALUES ('MTN MoMo', 'MTN Mobile Money', 0, 12);

INSERT INTO m_payment_type (value, description, is_cash_payment, order_position)
VALUES ('Flutterwave', 'Flutterwave payment aggregator', 0, 13);

-- Store payment type IDs for reference
-- M-Pesa: id will be auto-generated (e.g., 10)
-- Airtel Money: id will be auto-generated (e.g., 11)
-- MTN MoMo: id will be auto-generated (e.g., 12)
```

### 2.3 GL Account Mapping

Each mobile money provider requires dedicated GL accounts for clearing and settlement:

```sql
-- V1.0.1__neobank_mobilemoney_gl_accounts.sql
-- GL accounts for mobile money clearing

-- Asset accounts for mobile money clearing
INSERT INTO acc_gl_account (name, gl_code, disabled, manual_entries_allowed,
    account_usage, classification_enum, description)
VALUES
    ('M-Pesa Clearing', '11100', 0, 1, 2, 1, 'M-Pesa deposit/withdrawal clearing account'),
    ('Airtel Money Clearing', '11101', 0, 1, 2, 1, 'Airtel Money clearing account'),
    ('MTN MoMo Clearing', '11102', 0, 1, 2, 1, 'MTN MoMo clearing account'),
    ('Mobile Money Settlement', '11110', 0, 1, 2, 1, 'Settlement account for all mobile money providers');

-- Income accounts for mobile money fees
INSERT INTO acc_gl_account (name, gl_code, disabled, manual_entries_allowed,
    account_usage, classification_enum, description)
VALUES
    ('Mobile Money Fee Income', '41100', 0, 1, 2, 4, 'Fee income from mobile money transactions');

-- Map payment types to GL accounts for automatic posting
INSERT INTO acc_product_mapping (gl_account_id, product_id, product_type,
    payment_type, charge_id, financial_account_type)
SELECT ga.id, sp.id, 2, pt.id, NULL, 1  -- 2=savings product, 1=fund source
FROM acc_gl_account ga, m_savings_product sp, m_payment_type pt
WHERE ga.gl_code = '11100' AND pt.value = 'M-Pesa';
```

**GL Posting Rules:**

| Transaction | Debit | Credit |
|---|---|---|
| M-Pesa deposit (C2B) | M-Pesa Clearing (11100) | Customer Savings Account |
| M-Pesa withdrawal (B2C) | Customer Savings Account | M-Pesa Clearing (11100) |
| M-Pesa settlement (bank receives funds) | Bank Operating Account | M-Pesa Clearing (11100) |
| Mobile money fee | Customer Savings Account | Mobile Money Fee Income (41100) |

### 2.4 Java Class Structure

```
ke.co.neobank.fineract.mobilemoney/
  MobileMoneyModuleAutoConfiguration.java
  domain/
    MobileMoneyTransaction.java
    MobileMoneyTransactionRepository.java
    MobileMoneyProvider.java              # Enum: MPESA, AIRTEL, MTN
    MobileMoneyStatus.java                # Enum: INITIATED, PENDING, CONFIRMED, FAILED, REVERSED
  service/
    MobileMoneyPaymentChannelHandler.java
    MobileMoneyTransactionProcessor.java
    DarajaApiClient.java                  # Safaricom Daraja API client
    AirtelMoneyApiClient.java
    MtnMomoApiClient.java
  api/
    MobileMoneyApiResource.java           # REST controller
    MobileMoneyCallbackResource.java      # Webhook receiver
  dto/
    StkPushRequest.java
    StkPushResponse.java
    MobileMoneyCallbackPayload.java
    B2CRequest.java
    C2BConfirmation.java
```

#### MobileMoneyPaymentChannelHandler.java

```java
package ke.co.neobank.fineract.mobilemoney.service;

import org.apache.fineract.portfolio.paymenttype.domain.PaymentType;
import org.apache.fineract.portfolio.savings.domain.SavingsAccount;
import org.apache.fineract.portfolio.savings.domain.SavingsAccountTransaction;
import org.apache.fineract.infrastructure.core.api.JsonCommand;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class MobileMoneyPaymentChannelHandler {

    private final DarajaApiClient darajaClient;
    private final MobileMoneyTransactionRepository transactionRepo;
    private final SavingsAccountRepository savingsAccountRepo;
    private final PaymentTypeRepository paymentTypeRepo;
    private final JournalEntryWritePlatformService journalEntryService;

    public MobileMoneyPaymentChannelHandler(
            DarajaApiClient darajaClient,
            MobileMoneyTransactionRepository transactionRepo,
            SavingsAccountRepository savingsAccountRepo,
            PaymentTypeRepository paymentTypeRepo,
            JournalEntryWritePlatformService journalEntryService) {
        this.darajaClient = darajaClient;
        this.transactionRepo = transactionRepo;
        this.savingsAccountRepo = savingsAccountRepo;
        this.paymentTypeRepo = paymentTypeRepo;
        this.journalEntryService = journalEntryService;
    }

    /**
     * Initiate M-Pesa STK Push for customer deposit (C2B).
     * Sends a payment prompt to the customer's phone.
     * The actual deposit is posted when the callback confirms success.
     */
    @Transactional
    public StkPushResponse initiateStkPush(Long savingsAccountId,
                                            String phoneNumber,
                                            BigDecimal amount,
                                            String narration) {
        SavingsAccount account = savingsAccountRepo.findById(savingsAccountId)
                .orElseThrow(() -> new SavingsAccountNotFoundException(savingsAccountId));

        // Validate phone number format (+254...)
        String formattedPhone = formatKenyanPhone(phoneNumber);

        // Generate unique transaction reference
        String transactionRef = generateTransactionRef("MPESA", savingsAccountId);

        // Create pending transaction record
        MobileMoneyTransaction mmTxn = MobileMoneyTransaction.builder()
                .provider(MobileMoneyProvider.MPESA)
                .savingsAccountId(savingsAccountId)
                .clientId(account.getClient().getId())
                .phoneNumber(formattedPhone)
                .amount(amount)
                .currency("KES")
                .transactionRef(transactionRef)
                .direction(TransactionDirection.INBOUND)  // C2B deposit
                .status(MobileMoneyStatus.INITIATED)
                .createdAt(LocalDate.now())
                .build();
        transactionRepo.save(mmTxn);

        // Call Daraja STK Push API
        StkPushResponse response = darajaClient.stkPush(
                formattedPhone,
                amount,
                transactionRef,
                narration,
                "CustomerPayBillOnline"  // Transaction type
        );

        // Update with Daraja checkout request ID
        mmTxn.setProviderTransactionId(response.getCheckoutRequestId());
        mmTxn.setStatus(MobileMoneyStatus.PENDING);
        transactionRepo.save(mmTxn);

        return response;
    }

    /**
     * Process confirmed M-Pesa callback.
     * Posts a deposit transaction to the customer's Fineract savings account.
     */
    @Transactional
    public void processConfirmedDeposit(MobileMoneyTransaction mmTxn) {
        SavingsAccount account = savingsAccountRepo.findById(mmTxn.getSavingsAccountId())
                .orElseThrow();

        PaymentType mpesaPaymentType = paymentTypeRepo.findByValue("M-Pesa")
                .orElseThrow(() -> new PaymentTypeNotFoundException("M-Pesa"));

        // Build Fineract deposit command
        // This uses Fineract's native savings transaction API:
        // POST /v1/savingsaccounts/{id}/transactions?command=deposit
        PaymentDetail paymentDetail = PaymentDetail.create(
                mpesaPaymentType,
                mmTxn.getPhoneNumber(),        // accountNumber
                null,                           // checkNumber
                null,                           // routingCode
                mmTxn.getMpesaReceiptNumber(),  // receiptNumber
                null                            // bankNumber
        );

        SavingsAccountTransaction depositTxn = account.deposit(
                DateUtils.getBusinessLocalDate(),
                mmTxn.getAmount(),
                paymentDetail,
                account.getCurrency()
        );

        savingsAccountRepo.save(account);

        // Update mobile money transaction status
        mmTxn.setStatus(MobileMoneyStatus.CONFIRMED);
        mmTxn.setFineractTransactionId(depositTxn.getId());
        transactionRepo.save(mmTxn);
    }

    /**
     * Initiate B2C transfer (withdrawal to M-Pesa).
     * Debits customer savings account, then sends to M-Pesa.
     */
    @Transactional
    public B2CResponse initiateB2CWithdrawal(Long savingsAccountId,
                                              String recipientPhone,
                                              BigDecimal amount,
                                              String narration) {
        SavingsAccount account = savingsAccountRepo.findById(savingsAccountId)
                .orElseThrow();

        // Validate sufficient balance
        if (account.getAccountBalance().compareTo(amount) < 0) {
            throw new InsufficientAccountBalanceException(
                    "savings", savingsAccountId, amount);
        }

        String transactionRef = generateTransactionRef("B2C", savingsAccountId);

        // Debit savings account first (Fineract withdrawal)
        PaymentType mpesaPaymentType = paymentTypeRepo.findByValue("M-Pesa")
                .orElseThrow();

        PaymentDetail paymentDetail = PaymentDetail.create(
                mpesaPaymentType,
                formatKenyanPhone(recipientPhone),
                null, null,
                transactionRef,
                null
        );

        SavingsAccountTransaction withdrawalTxn = account.withdraw(
                DateUtils.getBusinessLocalDate(),
                amount,
                paymentDetail,
                account.getCurrency()
        );

        savingsAccountRepo.save(account);

        // Create mobile money transaction record
        MobileMoneyTransaction mmTxn = MobileMoneyTransaction.builder()
                .provider(MobileMoneyProvider.MPESA)
                .savingsAccountId(savingsAccountId)
                .clientId(account.getClient().getId())
                .phoneNumber(formatKenyanPhone(recipientPhone))
                .amount(amount)
                .currency("KES")
                .transactionRef(transactionRef)
                .direction(TransactionDirection.OUTBOUND)
                .status(MobileMoneyStatus.INITIATED)
                .fineractTransactionId(withdrawalTxn.getId())
                .build();
        transactionRepo.save(mmTxn);

        // Call Daraja B2C API
        B2CResponse response = darajaClient.b2cPayment(
                formatKenyanPhone(recipientPhone),
                amount,
                transactionRef,
                narration,
                "BusinessPayment"
        );

        mmTxn.setProviderTransactionId(response.getConversationId());
        mmTxn.setStatus(MobileMoneyStatus.PENDING);
        transactionRepo.save(mmTxn);

        return response;
    }

    private String formatKenyanPhone(String phone) {
        if (phone.startsWith("+254")) return phone;
        if (phone.startsWith("0")) return "+254" + phone.substring(1);
        if (phone.startsWith("254")) return "+" + phone;
        return "+254" + phone;
    }

    private String generateTransactionRef(String prefix, Long accountId) {
        return prefix + "-" + accountId + "-" + System.currentTimeMillis();
    }
}
```

#### MobileMoneyTransactionProcessor.java

```java
package ke.co.neobank.fineract.mobilemoney.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MobileMoneyTransactionProcessor {

    private final MobileMoneyPaymentChannelHandler channelHandler;
    private final MobileMoneyTransactionRepository transactionRepo;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public MobileMoneyTransactionProcessor(
            MobileMoneyPaymentChannelHandler channelHandler,
            MobileMoneyTransactionRepository transactionRepo,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.channelHandler = channelHandler;
        this.transactionRepo = transactionRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Process M-Pesa STK Push callback.
     * Called from MobileMoneyCallbackResource when Daraja POSTs to our callback URL.
     */
    @Transactional
    public void processMpesaCallback(MobileMoneyCallbackPayload payload) {
        String checkoutRequestId = payload.getBody()
                .getStkCallback()
                .getCheckoutRequestID();
        int resultCode = payload.getBody()
                .getStkCallback()
                .getResultCode();

        MobileMoneyTransaction mmTxn = transactionRepo
                .findByProviderTransactionId(checkoutRequestId)
                .orElseThrow(() -> new TransactionNotFoundException(checkoutRequestId));

        if (resultCode == 0) {
            // Success -- extract M-Pesa receipt from callback metadata
            String mpesaReceipt = extractMetadataItem(
                    payload.getBody().getStkCallback().getCallbackMetadata(),
                    "MpesaReceiptNumber"
            );
            mmTxn.setMpesaReceiptNumber(mpesaReceipt);

            // Post deposit to Fineract savings account
            channelHandler.processConfirmedDeposit(mmTxn);

            // Publish event for notification service and compliance
            kafkaTemplate.send("txn.completed", new TransactionCompletedEvent(
                    mmTxn.getClientId(),
                    mmTxn.getSavingsAccountId(),
                    mmTxn.getAmount(),
                    "KES",
                    "MOBILE_MONEY_DEPOSIT",
                    mmTxn.getTransactionRef(),
                    mpesaReceipt
            ));
        } else {
            // Failure
            mmTxn.setStatus(MobileMoneyStatus.FAILED);
            mmTxn.setFailureReason(payload.getBody()
                    .getStkCallback().getResultDesc());
            transactionRepo.save(mmTxn);

            kafkaTemplate.send("txn.failed", new TransactionFailedEvent(
                    mmTxn.getClientId(),
                    mmTxn.getTransactionRef(),
                    mmTxn.getFailureReason()
            ));
        }
    }

    /**
     * Process B2C result callback.
     */
    @Transactional
    public void processB2CResult(B2CResultPayload payload) {
        String conversationId = payload.getResult().getConversationID();

        MobileMoneyTransaction mmTxn = transactionRepo
                .findByProviderTransactionId(conversationId)
                .orElseThrow();

        if (payload.getResult().getResultCode() == 0) {
            mmTxn.setStatus(MobileMoneyStatus.CONFIRMED);
            mmTxn.setMpesaReceiptNumber(
                    extractResultParam(payload, "TransactionReceipt"));
            transactionRepo.save(mmTxn);

            kafkaTemplate.send("txn.completed", new TransactionCompletedEvent(
                    mmTxn.getClientId(),
                    mmTxn.getSavingsAccountId(),
                    mmTxn.getAmount(),
                    "KES",
                    "MOBILE_MONEY_WITHDRAWAL",
                    mmTxn.getTransactionRef(),
                    mmTxn.getMpesaReceiptNumber()
            ));
        } else {
            // B2C failed -- reverse the Fineract withdrawal
            mmTxn.setStatus(MobileMoneyStatus.FAILED);
            mmTxn.setFailureReason(payload.getResult().getResultDesc());
            transactionRepo.save(mmTxn);

            // Compensating action: reverse the savings withdrawal
            channelHandler.reverseWithdrawal(mmTxn);
        }
    }

    private String extractMetadataItem(CallbackMetadata metadata, String key) {
        return metadata.getItem().stream()
                .filter(i -> i.getName().equals(key))
                .findFirst()
                .map(i -> String.valueOf(i.getValue()))
                .orElse(null);
    }

    private String extractResultParam(B2CResultPayload payload, String key) {
        return payload.getResult().getResultParameters()
                .getResultParameter().stream()
                .filter(p -> p.getKey().equals(key))
                .findFirst()
                .map(p -> String.valueOf(p.getValue()))
                .orElse(null);
    }
}
```

### 2.5 DarajaApiClient.java

```java
package ke.co.neobank.fineract.mobilemoney.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Component
public class DarajaApiClient {

    private static final String DARAJA_BASE_URL = "https://api.safaricom.co.ke";
    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Value("${neobank.mpesa.consumer-key}")
    private String consumerKey;

    @Value("${neobank.mpesa.consumer-secret}")
    private String consumerSecret;

    @Value("${neobank.mpesa.shortcode}")
    private String businessShortCode;

    @Value("${neobank.mpesa.passkey}")
    private String passkey;

    @Value("${neobank.mpesa.callback-url}")
    private String callbackUrl;

    @Value("${neobank.mpesa.b2c.initiator-name}")
    private String b2cInitiatorName;

    @Value("${neobank.mpesa.b2c.security-credential}")
    private String b2cSecurityCredential;

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    private volatile String accessToken;
    private volatile long tokenExpiresAt;

    public DarajaApiClient(OkHttpClient httpClient, ObjectMapper objectMapper) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Initiate STK Push (Lipa Na M-Pesa Online).
     * Sends a payment prompt to the customer's phone.
     */
    public StkPushResponse stkPush(String phoneNumber,
                                    BigDecimal amount,
                                    String accountReference,
                                    String transactionDesc,
                                    String transactionType) throws IOException {
        String token = getAccessToken();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        String password = Base64.getEncoder().encodeToString(
                (businessShortCode + passkey + timestamp).getBytes());

        String requestBody = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("BusinessShortCode", businessShortCode);
            put("Password", password);
            put("Timestamp", timestamp);
            put("TransactionType", transactionType);
            put("Amount", amount.intValue());
            put("PartyA", phoneNumber.replace("+", ""));
            put("PartyB", businessShortCode);
            put("PhoneNumber", phoneNumber.replace("+", ""));
            put("CallBackURL", callbackUrl + "/v1/mobilemoney/callback/stk");
            put("AccountReference", accountReference);
            put("TransactionDesc", transactionDesc);
        }});

        Request request = new Request.Builder()
                .url(DARAJA_BASE_URL + "/mpesa/stkpush/v1/processrequest")
                .header("Authorization", "Bearer " + token)
                .post(RequestBody.create(requestBody,
                        MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new MobileMoneyApiException(
                        "STK Push failed: " + response.code() + " " + response.body().string());
            }
            return objectMapper.readValue(
                    response.body().string(), StkPushResponse.class);
        }
    }

    /**
     * Initiate B2C payment (send money to customer M-Pesa).
     */
    public B2CResponse b2cPayment(String recipientPhone,
                                   BigDecimal amount,
                                   String transactionRef,
                                   String remarks,
                                   String commandId) throws IOException {
        String token = getAccessToken();

        String requestBody = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("InitiatorName", b2cInitiatorName);
            put("SecurityCredential", b2cSecurityCredential);
            put("CommandID", commandId);
            put("Amount", amount.intValue());
            put("PartyA", businessShortCode);
            put("PartyB", recipientPhone.replace("+", ""));
            put("Remarks", remarks);
            put("QueueTimeOutURL", callbackUrl + "/v1/mobilemoney/callback/b2c/timeout");
            put("ResultURL", callbackUrl + "/v1/mobilemoney/callback/b2c/result");
            put("Occasion", transactionRef);
        }});

        Request request = new Request.Builder()
                .url(DARAJA_BASE_URL + "/mpesa/b2c/v3/paymentrequest")
                .header("Authorization", "Bearer " + token)
                .post(RequestBody.create(requestBody,
                        MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new MobileMoneyApiException(
                        "B2C failed: " + response.code() + " " + response.body().string());
            }
            return objectMapper.readValue(
                    response.body().string(), B2CResponse.class);
        }
    }

    /**
     * Get or refresh Daraja OAuth access token.
     */
    private synchronized String getAccessToken() throws IOException {
        if (accessToken != null && System.currentTimeMillis() < tokenExpiresAt) {
            return accessToken;
        }

        String credentials = Base64.getEncoder().encodeToString(
                (consumerKey + ":" + consumerSecret).getBytes());

        Request request = new Request.Builder()
                .url(DARAJA_BASE_URL +
                     "/oauth/v1/generate?grant_type=client_credentials")
                .header("Authorization", "Basic " + credentials)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            var body = objectMapper.readTree(response.body().string());
            accessToken = body.get("access_token").asText();
            long expiresIn = body.get("expires_in").asLong();
            tokenExpiresAt = System.currentTimeMillis() + (expiresIn * 1000) - 60000;
            return accessToken;
        }
    }
}
```

### 2.6 REST Endpoints

```java
package ke.co.neobank.fineract.mobilemoney.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

@Path("/v1/mobilemoney")
@Component
public class MobileMoneyApiResource {

    private final MobileMoneyPaymentChannelHandler channelHandler;
    private final MobileMoneyTransactionProcessor processor;

    public MobileMoneyApiResource(
            MobileMoneyPaymentChannelHandler channelHandler,
            MobileMoneyTransactionProcessor processor) {
        this.channelHandler = channelHandler;
        this.processor = processor;
    }

    /**
     * POST /v1/mobilemoney/stk-push
     * Initiate M-Pesa STK Push for deposit.
     *
     * Request:
     * {
     *   "savingsAccountId": 42,
     *   "phoneNumber": "+254712345678",
     *   "amount": 5000.00,
     *   "narration": "Account top-up"
     * }
     */
    @POST
    @Path("/stk-push")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response initiateStkPush(StkPushRequest request) {
        StkPushResponse response = channelHandler.initiateStkPush(
                request.getSavingsAccountId(),
                request.getPhoneNumber(),
                request.getAmount(),
                request.getNarration()
        );
        return Response.ok(response).build();
    }

    /**
     * POST /v1/mobilemoney/b2c
     * Initiate B2C withdrawal to M-Pesa.
     *
     * Request:
     * {
     *   "savingsAccountId": 42,
     *   "recipientPhone": "+254798765432",
     *   "amount": 2500.00,
     *   "narration": "Withdrawal to M-Pesa"
     * }
     */
    @POST
    @Path("/b2c")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response initiateB2C(B2CRequest request) {
        B2CResponse response = channelHandler.initiateB2CWithdrawal(
                request.getSavingsAccountId(),
                request.getRecipientPhone(),
                request.getAmount(),
                request.getNarration()
        );
        return Response.ok(response).build();
    }

    /**
     * GET /v1/mobilemoney/transactions/{savingsAccountId}
     * List mobile money transactions for an account.
     */
    @GET
    @Path("/transactions/{savingsAccountId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listTransactions(
            @PathParam("savingsAccountId") Long savingsAccountId,
            @QueryParam("limit") @DefaultValue("20") int limit,
            @QueryParam("offset") @DefaultValue("0") int offset) {
        var transactions = channelHandler.listTransactions(
                savingsAccountId, limit, offset);
        return Response.ok(transactions).build();
    }
}
```

```java
package ke.co.neobank.fineract.mobilemoney.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

@Path("/v1/mobilemoney/callback")
@Component
public class MobileMoneyCallbackResource {

    private final MobileMoneyTransactionProcessor processor;

    public MobileMoneyCallbackResource(
            MobileMoneyTransactionProcessor processor) {
        this.processor = processor;
    }

    /**
     * POST /v1/mobilemoney/callback/stk
     * Webhook receiver for M-Pesa STK Push callback.
     * Called by Safaricom Daraja when STK Push completes.
     */
    @POST
    @Path("/stk")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response handleStkCallback(MobileMoneyCallbackPayload payload) {
        processor.processMpesaCallback(payload);
        return Response.ok().build();
    }

    /**
     * POST /v1/mobilemoney/callback/b2c/result
     * Webhook receiver for M-Pesa B2C result.
     */
    @POST
    @Path("/b2c/result")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response handleB2CResult(B2CResultPayload payload) {
        processor.processB2CResult(payload);
        return Response.ok().build();
    }

    /**
     * POST /v1/mobilemoney/callback/b2c/timeout
     * Webhook receiver for B2C timeout notification.
     */
    @POST
    @Path("/b2c/timeout")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response handleB2CTimeout(B2CTimeoutPayload payload) {
        processor.processB2CTimeout(payload);
        return Response.ok().build();
    }

    /**
     * POST /v1/mobilemoney/callback/c2b
     * Webhook receiver for C2B payment confirmation.
     * For paybill/till-based collections.
     */
    @POST
    @Path("/c2b")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response handleC2BConfirmation(C2BConfirmation payload) {
        processor.processC2BConfirmation(payload);
        return Response.ok().build();
    }
}
```

### 2.7 SQL Migration: Mobile Money Transaction Table

```sql
-- V1.0.2__neobank_mobilemoney_transactions.sql

CREATE TABLE nb_mobile_money_transaction (
    id                      BIGSERIAL PRIMARY KEY,
    provider                VARCHAR(20) NOT NULL,           -- MPESA, AIRTEL, MTN
    savings_account_id      BIGINT NOT NULL,
    client_id               BIGINT NOT NULL,
    phone_number            VARCHAR(20) NOT NULL,
    amount                  DECIMAL(19,4) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'KES',
    direction               VARCHAR(10) NOT NULL,           -- INBOUND (C2B), OUTBOUND (B2C)
    status                  VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
    transaction_ref         VARCHAR(100) NOT NULL UNIQUE,
    provider_transaction_id VARCHAR(100),                   -- Daraja CheckoutRequestID or ConversationID
    mpesa_receipt_number    VARCHAR(50),                    -- e.g., REK3456789
    fineract_transaction_id BIGINT,                         -- FK to m_savings_account_transaction.id
    failure_reason          TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mm_savings_account FOREIGN KEY (savings_account_id)
        REFERENCES m_savings_account(id),
    CONSTRAINT fk_mm_client FOREIGN KEY (client_id)
        REFERENCES m_client(id)
);

CREATE INDEX idx_mm_txn_provider_id ON nb_mobile_money_transaction(provider_transaction_id);
CREATE INDEX idx_mm_txn_savings ON nb_mobile_money_transaction(savings_account_id);
CREATE INDEX idx_mm_txn_client ON nb_mobile_money_transaction(client_id);
CREATE INDEX idx_mm_txn_status ON nb_mobile_money_transaction(status);
CREATE INDEX idx_mm_txn_ref ON nb_mobile_money_transaction(transaction_ref);
```

---

## 3. Module 2: KYC Tier Enforcement

### 3.1 Purpose

Fineract stores client data but has no KYC tier system or transaction-limit enforcement based on verification level. This module hooks into savings operations to enforce daily transaction limits based on the client's KYC tier, as required by CBK (Central Bank of Kenya) regulations for digital lenders.

### 3.2 KYC Tier Definitions

| Tier | Name | Daily Limit (KES) | Single Txn Limit | Verification Required |
|---|---|---|---|---|
| 1 | Basic | 150,000 | 70,000 | Phone + OTP only |
| 2 | Enhanced | 500,000 | 250,000 | National ID + Selfie |
| 3 | Full | Unlimited | 1,000,000 | Full KYC (ID + Selfie + Liveness + AML) |

### 3.3 Custom Datatable: dt_kyc_verification

```sql
-- V2.0.0__neobank_kyc_datatable.sql
-- Register with Fineract datatable framework

CREATE TABLE dt_kyc_verification (
    client_id               BIGINT NOT NULL,
    tier                    SMALLINT NOT NULL DEFAULT 1,    -- 1=Basic, 2=Enhanced, 3=Full
    document_type           VARCHAR(30),                    -- NATIONAL_ID, PASSPORT, ALIEN_ID
    document_number         VARCHAR(50),
    document_front_url      VARCHAR(500),                   -- S3 pre-signed URL reference
    document_back_url       VARCHAR(500),
    selfie_url              VARCHAR(500),
    verification_provider   VARCHAR(30),                    -- SMILE_ID, MANUAL
    verification_session_id VARCHAR(100),                   -- Smile ID job ID
    verification_score      DECIMAL(5,2),                   -- 0.00-100.00 confidence score
    verified_at             TIMESTAMP,
    expiry_date             DATE,                           -- Document expiry
    rejection_reason        TEXT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, VERIFIED, REJECTED, EXPIRED
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_kyc_verification PRIMARY KEY (client_id),
    CONSTRAINT fk_kyc_client FOREIGN KEY (client_id)
        REFERENCES m_client(id)
);

-- Register as Fineract datatable
INSERT INTO x_registered_table (registered_table_name, application_table_name,
    category, display_name)
VALUES ('dt_kyc_verification', 'm_client', 100, 'KYC Verification');
```

### 3.4 Pre-Transaction Validation Hook

```java
package ke.co.neobank.fineract.kyc.service;

import org.apache.fineract.portfolio.savings.domain.SavingsAccount;
import org.apache.fineract.portfolio.savings.domain.SavingsAccountTransaction;
import org.apache.fineract.portfolio.savings.exception.SavingsAccountTransactionNotAllowedException;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class KycTierEnforcementService {

    private final KycVerificationRepository kycRepo;
    private final DailyTransactionLimitRepository limitRepo;

    // Tier limits in KES
    private static final BigDecimal TIER1_DAILY = new BigDecimal("150000");
    private static final BigDecimal TIER1_SINGLE = new BigDecimal("70000");
    private static final BigDecimal TIER2_DAILY = new BigDecimal("500000");
    private static final BigDecimal TIER2_SINGLE = new BigDecimal("250000");
    private static final BigDecimal TIER3_SINGLE = new BigDecimal("1000000");

    public KycTierEnforcementService(
            KycVerificationRepository kycRepo,
            DailyTransactionLimitRepository limitRepo) {
        this.kycRepo = kycRepo;
        this.limitRepo = limitRepo;
    }

    /**
     * Validate a savings transaction against KYC tier limits.
     * Called before every deposit and withdrawal operation.
     *
     * This hooks into Fineract's domain event system via
     * SavingsPreTransactionCheckBusinessEvent.
     */
    @EventListener
    public void validateTransactionAgainstKycTier(
            SavingsPreTransactionCheckBusinessEvent event) {

        SavingsAccount account = event.getSavingsAccount();
        BigDecimal amount = event.getTransactionAmount();
        Long clientId = account.getClient().getId();

        // Look up client KYC tier
        KycVerification kyc = kycRepo.findByClientId(clientId)
                .orElse(KycVerification.defaultBasicTier(clientId));

        int tier = kyc.getTier();

        // 1. Check single transaction limit
        BigDecimal singleLimit = getSingleTransactionLimit(tier);
        if (singleLimit != null && amount.compareTo(singleLimit) > 0) {
            throw new KycTierLimitExceededException(
                    "Transaction amount KES " + amount.toPlainString() +
                    " exceeds Tier " + tier + " single transaction limit of KES " +
                    singleLimit.toPlainString() +
                    ". Please upgrade your KYC verification level."
            );
        }

        // 2. Check daily cumulative limit
        BigDecimal dailyLimit = getDailyTransactionLimit(tier);
        if (dailyLimit != null) {
            BigDecimal todayTotal = limitRepo.getDailyTotal(
                    clientId, LocalDate.now());
            BigDecimal projectedTotal = todayTotal.add(amount);

            if (projectedTotal.compareTo(dailyLimit) > 0) {
                BigDecimal remaining = dailyLimit.subtract(todayTotal);
                throw new KycTierLimitExceededException(
                        "Daily transaction limit for Tier " + tier +
                        " is KES " + dailyLimit.toPlainString() +
                        ". Today's total: KES " + todayTotal.toPlainString() +
                        ". Remaining: KES " + remaining.toPlainString() +
                        ". Please upgrade your KYC level or try again tomorrow."
                );
            }
        }
    }

    /**
     * Update client KYC tier when Smile ID verification completes.
     * Called via webhook from the KYC middleware service.
     */
    public void upgradeClientTier(Long clientId, int newTier,
                                   String documentType, String documentNumber,
                                   String verificationProvider,
                                   String verificationSessionId,
                                   BigDecimal verificationScore) {
        KycVerification kyc = kycRepo.findByClientId(clientId)
                .orElse(new KycVerification(clientId));

        kyc.setTier(newTier);
        kyc.setDocumentType(documentType);
        kyc.setDocumentNumber(documentNumber);
        kyc.setVerificationProvider(verificationProvider);
        kyc.setVerificationSessionId(verificationSessionId);
        kyc.setVerificationScore(verificationScore);
        kyc.setVerifiedAt(java.time.Instant.now());
        kyc.setStatus("VERIFIED");
        kycRepo.save(kyc);
    }

    private BigDecimal getSingleTransactionLimit(int tier) {
        return switch (tier) {
            case 1 -> TIER1_SINGLE;
            case 2 -> TIER2_SINGLE;
            case 3 -> TIER3_SINGLE;
            default -> TIER1_SINGLE;
        };
    }

    private BigDecimal getDailyTransactionLimit(int tier) {
        return switch (tier) {
            case 1 -> TIER1_DAILY;
            case 2 -> TIER2_DAILY;
            case 3 -> null;  // Unlimited
            default -> TIER1_DAILY;
        };
    }
}
```

### 3.5 Smile ID Webhook Integration

```java
package ke.co.neobank.fineract.kyc.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

@Path("/v1/kyc")
@Component
public class KycWebhookResource {

    private final KycTierEnforcementService kycService;

    public KycWebhookResource(KycTierEnforcementService kycService) {
        this.kycService = kycService;
    }

    /**
     * POST /v1/kyc/smile-id/callback
     * Webhook receiver for Smile ID verification results.
     *
     * Smile ID posts results when document verification + liveness
     * check completes. Typical payload includes confidence score,
     * document data, and AML screening results.
     */
    @POST
    @Path("/smile-id/callback")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response handleSmileIdCallback(SmileIdCallbackPayload payload) {
        // Validate webhook signature
        if (!verifySmileIdSignature(payload)) {
            return Response.status(401).build();
        }

        Long clientId = Long.parseLong(payload.getPartnerParams().getUserId());
        String jobType = payload.getResultType();

        if ("Document Verification".equals(jobType) &&
            "Approved".equals(payload.getResultText())) {

            int newTier = determineNewTier(payload);

            kycService.upgradeClientTier(
                    clientId,
                    newTier,
                    payload.getIdType(),
                    payload.getIdNumber(),
                    "SMILE_ID",
                    payload.getSmileJobId(),
                    new java.math.BigDecimal(payload.getConfidenceValue())
            );
        }

        return Response.ok().build();
    }

    /**
     * GET /v1/kyc/tier/{clientId}
     * Get current KYC tier and limits for a client.
     */
    @GET
    @Path("/tier/{clientId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getClientTier(@PathParam("clientId") Long clientId) {
        var tierInfo = kycService.getClientTierInfo(clientId);
        return Response.ok(tierInfo).build();
    }

    private int determineNewTier(SmileIdCallbackPayload payload) {
        boolean hasLiveness = payload.getActions() != null &&
                "Verified".equals(payload.getActions().getLivenessCheck());
        boolean hasAml = payload.getActions() != null &&
                "Approved".equals(payload.getActions().getAmlCheck());

        if (hasLiveness && hasAml) return 3;   // Full KYC
        if (hasLiveness) return 2;              // Enhanced
        return 1;                                // Basic (should not happen via Smile ID)
    }

    private boolean verifySmileIdSignature(SmileIdCallbackPayload payload) {
        // HMAC-SHA256 verification of webhook signature
        // Implementation depends on Smile ID partner configuration
        return true; // Placeholder
    }
}
```

### 3.6 Daily Transaction Tracking Table

```sql
-- V2.0.1__neobank_kyc_daily_limits.sql

CREATE TABLE nb_daily_transaction_total (
    id              BIGSERIAL PRIMARY KEY,
    client_id       BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    total_amount    DECIMAL(19,4) NOT NULL DEFAULT 0,
    transaction_count INT NOT NULL DEFAULT 0,
    last_updated    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_daily_total UNIQUE (client_id, transaction_date),
    CONSTRAINT fk_daily_client FOREIGN KEY (client_id) REFERENCES m_client(id)
);

CREATE INDEX idx_daily_total_client_date ON nb_daily_transaction_total(client_id, transaction_date);
```

---

## 4. Module 3: Card Transaction Posting

### 4.1 Purpose

NeoBank issues virtual and physical cards through a BaaS partner (Marqeta or Stripe Issuing). When a cardholder makes a purchase, the BaaS partner sends a webhook event that must be recorded as a Fineract journal entry. This module receives BaaS webhook events and maps them to the correct Fineract savings account transactions.

### 4.2 Custom Datatable: dt_card_details

```sql
-- V3.0.0__neobank_card_datatable.sql

CREATE TABLE dt_card_details (
    id              BIGSERIAL PRIMARY KEY,
    client_id       BIGINT NOT NULL,
    savings_account_id BIGINT NOT NULL,           -- Linked funding account
    card_token      VARCHAR(100) NOT NULL UNIQUE,  -- BaaS-issued token (tok_xxx)
    card_type       VARCHAR(20) NOT NULL,           -- VIRTUAL, PHYSICAL
    card_network    VARCHAR(20) NOT NULL,           -- VISA, MASTERCARD
    last4           VARCHAR(4) NOT NULL,
    expiry_month    SMALLINT NOT NULL,
    expiry_year     SMALLINT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, FROZEN, CANCELLED, LOST
    baas_card_id    VARCHAR(100) NOT NULL,          -- Marqeta/Stripe card ID
    baas_provider   VARCHAR(20) NOT NULL DEFAULT 'MARQETA',
    daily_limit     DECIMAL(19,4) DEFAULT 100000,
    monthly_limit   DECIMAL(19,4) DEFAULT 500000,
    per_txn_limit   DECIMAL(19,4) DEFAULT 50000,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_card_client FOREIGN KEY (client_id) REFERENCES m_client(id),
    CONSTRAINT fk_card_savings FOREIGN KEY (savings_account_id) REFERENCES m_savings_account(id)
);

-- Register as Fineract datatable
INSERT INTO x_registered_table (registered_table_name, application_table_name,
    category, display_name)
VALUES ('dt_card_details', 'm_client', 100, 'Card Details');

-- GL accounts for card clearing
INSERT INTO acc_gl_account (name, gl_code, disabled, manual_entries_allowed,
    account_usage, classification_enum, description)
VALUES
    ('Card Clearing Account', '11200', 0, 1, 2, 1, 'Clearing for card authorizations'),
    ('Card Settlement Account', '11210', 0, 1, 2, 1, 'Settlement with BaaS partner');

-- Payment type for card transactions
INSERT INTO m_payment_type (value, description, is_cash_payment, order_position)
VALUES ('Card Payment', 'Debit/credit card transaction via BaaS', 0, 20);
```

### 4.3 BaaS Webhook Receiver

```java
package ke.co.neobank.fineract.card.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

@Path("/v1/cards/webhook")
@Component
public class CardWebhookResource {

    private final CardTransactionPostingService postingService;

    public CardWebhookResource(CardTransactionPostingService postingService) {
        this.postingService = postingService;
    }

    /**
     * POST /v1/cards/webhook/marqeta
     * Webhook receiver for Marqeta card events.
     *
     * Marqeta sends events for:
     * - authorization (hold funds)
     * - authorization.clearing (settle transaction)
     * - authorization.reversal (release hold)
     * - pin.debit (ATM withdrawal)
     */
    @POST
    @Path("/marqeta")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response handleMarqetaWebhook(MarqetaWebhookPayload payload) {
        // Verify webhook signature
        if (!verifyMarqetaSignature(payload)) {
            return Response.status(401).build();
        }

        switch (payload.getType()) {
            case "authorization":
                postingService.processAuthorization(payload);
                break;
            case "authorization.clearing":
                postingService.processClearing(payload);
                break;
            case "authorization.reversal":
                postingService.processReversal(payload);
                break;
            case "pin.debit":
                postingService.processPinDebit(payload);
                break;
            default:
                // Log unknown event type
                break;
        }

        return Response.ok().build();
    }

    /**
     * POST /v1/cards/webhook/stripe
     * Webhook receiver for Stripe Issuing events.
     */
    @POST
    @Path("/stripe")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response handleStripeWebhook(StripeWebhookPayload payload) {
        // Verify Stripe webhook signature
        if (!verifyStripeSignature(payload)) {
            return Response.status(401).build();
        }

        switch (payload.getType()) {
            case "issuing_authorization.created":
                postingService.processStripeAuthorization(payload);
                break;
            case "issuing_transaction.created":
                postingService.processStripeTransaction(payload);
                break;
            default:
                break;
        }

        return Response.ok().build();
    }

    private boolean verifyMarqetaSignature(MarqetaWebhookPayload payload) {
        // HMAC verification against Marqeta shared secret
        return true; // Placeholder
    }

    private boolean verifyStripeSignature(StripeWebhookPayload payload) {
        // Stripe-Signature header verification
        return true; // Placeholder
    }
}
```

### 4.4 Card Transaction Posting Service

```java
package ke.co.neobank.fineract.card.service;

import org.apache.fineract.portfolio.savings.domain.SavingsAccount;
import org.apache.fineract.portfolio.savings.domain.SavingsAccountTransaction;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class CardTransactionPostingService {

    private final CardDetailsRepository cardRepo;
    private final SavingsAccountRepository savingsRepo;
    private final PaymentTypeRepository paymentTypeRepo;
    private final CardTransactionRepository cardTxnRepo;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public CardTransactionPostingService(
            CardDetailsRepository cardRepo,
            SavingsAccountRepository savingsRepo,
            PaymentTypeRepository paymentTypeRepo,
            CardTransactionRepository cardTxnRepo,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.cardRepo = cardRepo;
        this.savingsRepo = savingsRepo;
        this.paymentTypeRepo = paymentTypeRepo;
        this.cardTxnRepo = cardTxnRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Process card authorization event.
     * Maps card token to Fineract savings account and creates a hold.
     *
     * GL Posting:
     *   Debit:  Customer Savings Account
     *   Credit: Card Clearing Account (11200)
     */
    @Transactional
    public void processAuthorization(MarqetaWebhookPayload payload) {
        String cardToken = payload.getCardToken();
        BigDecimal amount = payload.getGpa().getCurrencyCode().equals("KES")
                ? new BigDecimal(payload.getAmount())
                : convertToKES(payload.getAmount(), payload.getGpa().getCurrencyCode());

        // Look up card and linked savings account
        CardDetails card = cardRepo.findByCardToken(cardToken)
                .orElseThrow(() -> new CardNotFoundException(cardToken));

        if (!"ACTIVE".equals(card.getStatus())) {
            throw new CardNotActiveException(cardToken);
        }

        SavingsAccount savingsAccount = savingsRepo
                .findById(card.getSavingsAccountId())
                .orElseThrow();

        // Verify sufficient balance
        if (savingsAccount.getAccountBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceForCardException(
                    card.getLast4(), amount);
        }

        // Create withdrawal on linked savings account
        var paymentType = paymentTypeRepo.findByValue("Card Payment")
                .orElseThrow();

        PaymentDetail paymentDetail = PaymentDetail.create(
                paymentType,
                card.getLast4(),                    // accountNumber
                null,                               // checkNumber
                null,                               // routingCode
                payload.getToken(),                 // receiptNumber (auth token)
                null                                // bankNumber
        );

        SavingsAccountTransaction withdrawal = savingsAccount.withdraw(
                DateUtils.getBusinessLocalDate(),
                amount,
                paymentDetail,
                savingsAccount.getCurrency()
        );

        savingsRepo.save(savingsAccount);

        // Record card transaction for tracking
        CardTransaction cardTxn = CardTransaction.builder()
                .cardId(card.getId())
                .clientId(card.getClientId())
                .savingsAccountId(card.getSavingsAccountId())
                .amount(amount)
                .currency("KES")
                .merchantName(payload.getMerchant().getName())
                .merchantCategory(payload.getMerchant().getMcc())
                .merchantCity(payload.getMerchant().getCity())
                .authorizationToken(payload.getToken())
                .fineractTransactionId(withdrawal.getId())
                .status("AUTHORIZED")
                .createdAt(java.time.Instant.now())
                .build();
        cardTxnRepo.save(cardTxn);

        // Publish event for notification and compliance
        kafkaTemplate.send("card.transaction", new CardTransactionEvent(
                card.getClientId(),
                card.getLast4(),
                amount,
                payload.getMerchant().getName(),
                "AUTHORIZED"
        ));
    }

    /**
     * Process authorization clearing (final settlement).
     * The actual amount may differ from the authorization amount.
     */
    @Transactional
    public void processClearing(MarqetaWebhookPayload payload) {
        String authToken = payload.getPrecedingRelatedTransactionToken();
        CardTransaction cardTxn = cardTxnRepo
                .findByAuthorizationToken(authToken)
                .orElseThrow();

        BigDecimal clearingAmount = new BigDecimal(payload.getAmount());
        BigDecimal authAmount = cardTxn.getAmount();

        // If clearing amount differs, adjust
        if (clearingAmount.compareTo(authAmount) != 0) {
            BigDecimal difference = clearingAmount.subtract(authAmount);
            SavingsAccount account = savingsRepo
                    .findById(cardTxn.getSavingsAccountId()).orElseThrow();

            if (difference.compareTo(BigDecimal.ZERO) > 0) {
                // Additional debit needed
                account.withdraw(DateUtils.getBusinessLocalDate(),
                        difference, null, account.getCurrency());
            } else {
                // Partial refund
                account.deposit(DateUtils.getBusinessLocalDate(),
                        difference.abs(), null, account.getCurrency());
            }
            savingsRepo.save(account);
        }

        cardTxn.setStatus("CLEARED");
        cardTxn.setClearedAmount(clearingAmount);
        cardTxnRepo.save(cardTxn);
    }

    /**
     * Process authorization reversal (release hold).
     */
    @Transactional
    public void processReversal(MarqetaWebhookPayload payload) {
        String authToken = payload.getPrecedingRelatedTransactionToken();
        CardTransaction cardTxn = cardTxnRepo
                .findByAuthorizationToken(authToken).orElseThrow();

        // Reverse the withdrawal (deposit the amount back)
        SavingsAccount account = savingsRepo
                .findById(cardTxn.getSavingsAccountId()).orElseThrow();

        account.deposit(DateUtils.getBusinessLocalDate(),
                cardTxn.getAmount(), null, account.getCurrency());
        savingsRepo.save(account);

        cardTxn.setStatus("REVERSED");
        cardTxnRepo.save(cardTxn);
    }

    private BigDecimal convertToKES(String amount, String fromCurrency) {
        // Currency conversion via rates service
        // Simplified for specification
        return new BigDecimal(amount);
    }
}
```

### 4.5 Card Transaction Table

```sql
-- V3.0.1__neobank_card_transactions.sql

CREATE TABLE nb_card_transaction (
    id                      BIGSERIAL PRIMARY KEY,
    card_id                 BIGINT NOT NULL,
    client_id               BIGINT NOT NULL,
    savings_account_id      BIGINT NOT NULL,
    amount                  DECIMAL(19,4) NOT NULL,
    cleared_amount          DECIMAL(19,4),
    currency                VARCHAR(3) NOT NULL DEFAULT 'KES',
    merchant_name           VARCHAR(200),
    merchant_category       VARCHAR(10),       -- MCC code
    merchant_city           VARCHAR(100),
    merchant_country        VARCHAR(3),
    authorization_token     VARCHAR(100) UNIQUE,
    fineract_transaction_id BIGINT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'AUTHORIZED',
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ctxn_card FOREIGN KEY (card_id)
        REFERENCES dt_card_details(id),
    CONSTRAINT fk_ctxn_client FOREIGN KEY (client_id)
        REFERENCES m_client(id),
    CONSTRAINT fk_ctxn_savings FOREIGN KEY (savings_account_id)
        REFERENCES m_savings_account(id)
);

CREATE INDEX idx_ctxn_card ON nb_card_transaction(card_id);
CREATE INDEX idx_ctxn_auth_token ON nb_card_transaction(authorization_token);
CREATE INDEX idx_ctxn_client ON nb_card_transaction(client_id);
CREATE INDEX idx_ctxn_status ON nb_card_transaction(status);
```

---

## 5. Module 4: QR Payment Processing

### 5.1 Purpose

NeoBank supports QR-based payments where merchants display a QR code and consumers scan to pay. This module implements the EMVCo merchant-presented QR standard, generates and parses QR payloads, and routes payments through the Fineract account transfer API.

### 5.2 EMVCo QR Standard

The QR payload follows EMVCo Merchant Presented Mode (MPM) specification:

| Tag | Name | Value |
|---|---|---|
| 00 | Payload Format Indicator | 01 |
| 01 | Point of Initiation | 12 (dynamic) |
| 26 | Merchant Account Info (custom) | NeoBank merchant ID + account |
| 52 | Merchant Category Code | 5812 (restaurants), 5411 (grocery), etc. |
| 53 | Transaction Currency | 404 (KES) |
| 54 | Transaction Amount | (optional, for fixed-price QR) |
| 58 | Country Code | KE |
| 59 | Merchant Name | Mama Njeri's Kitchen |
| 60 | Merchant City | Nairobi |
| 63 | CRC | CRC-16 checksum |

### 5.3 Custom Datatable: dt_qr_merchant

```sql
-- V4.0.0__neobank_qr_datatable.sql

CREATE TABLE dt_qr_merchant (
    id              BIGSERIAL PRIMARY KEY,
    client_id       BIGINT NOT NULL,              -- Merchant's Fineract client ID
    merchant_id     VARCHAR(20) NOT NULL UNIQUE,   -- NeoBank merchant ID (NB-M-001234)
    savings_account_id BIGINT NOT NULL,            -- Settlement account
    business_name   VARCHAR(200) NOT NULL,
    category_code   VARCHAR(10) NOT NULL,          -- MCC code
    city            VARCHAR(100) NOT NULL DEFAULT 'Nairobi',
    country_code    VARCHAR(2) NOT NULL DEFAULT 'KE',
    qr_data_static  TEXT,                          -- Pre-generated static QR payload
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qr_client FOREIGN KEY (client_id) REFERENCES m_client(id),
    CONSTRAINT fk_qr_savings FOREIGN KEY (savings_account_id) REFERENCES m_savings_account(id)
);

-- Register as Fineract datatable
INSERT INTO x_registered_table (registered_table_name, application_table_name,
    category, display_name)
VALUES ('dt_qr_merchant', 'm_client', 100, 'QR Merchant');
```

### 5.4 QR Payment Processing Service

```java
package ke.co.neobank.fineract.qr.service;

import org.apache.fineract.portfolio.account.service.AccountTransfersWritePlatformService;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class QrPaymentService {

    private final QrMerchantRepository qrMerchantRepo;
    private final SavingsAccountRepository savingsRepo;
    private final AccountTransfersWritePlatformService transferService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public QrPaymentService(
            QrMerchantRepository qrMerchantRepo,
            SavingsAccountRepository savingsRepo,
            AccountTransfersWritePlatformService transferService,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.qrMerchantRepo = qrMerchantRepo;
        this.savingsRepo = savingsRepo;
        this.transferService = transferService;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Generate EMVCo merchant-presented QR code data.
     *
     * For static QR (no amount pre-set):
     *   Consumer scans, enters amount, and confirms.
     *
     * For dynamic QR (amount pre-set):
     *   Consumer scans and confirms the displayed amount.
     */
    public String generateMerchantQR(String merchantId, BigDecimal amount) {
        QrMerchant merchant = qrMerchantRepo.findByMerchantId(merchantId)
                .orElseThrow(() -> new MerchantNotFoundException(merchantId));

        EmvcoQrBuilder builder = new EmvcoQrBuilder()
                .payloadFormatIndicator("01")
                .pointOfInitiation(amount != null ? "12" : "11")  // 12=dynamic, 11=static
                .merchantAccountInfo("ke.co.neobank", merchantId,
                        merchant.getSavingsAccountId().toString())
                .merchantCategoryCode(merchant.getCategoryCode())
                .transactionCurrency("404")  // KES ISO 4217
                .countryCode(merchant.getCountryCode())
                .merchantName(merchant.getBusinessName())
                .merchantCity(merchant.getCity());

        if (amount != null) {
            builder.transactionAmount(amount.toPlainString());
        }

        return builder.build();  // Returns TLV-encoded string with CRC
    }

    /**
     * Process a QR payment scan.
     *
     * Flow:
     * 1. Parse QR payload to extract merchant ID
     * 2. Look up merchant's Fineract savings account
     * 3. Execute Fineract account transfer: payer -> merchant
     * 4. Publish payment event
     */
    @Transactional
    public QrPaymentResult processQrPayment(Long payerClientId,
                                             Long payerSavingsAccountId,
                                             String qrData,
                                             BigDecimal amount,
                                             String narration) {
        // Parse EMVCo QR payload
        EmvcoQrData parsed = EmvcoQrParser.parse(qrData);

        // Validate QR data
        if (!parsed.verify()) {
            throw new InvalidQrCodeException("QR code CRC validation failed");
        }

        String merchantId = parsed.getMerchantAccountInfo().getMerchantId();
        QrMerchant merchant = qrMerchantRepo.findByMerchantId(merchantId)
                .orElseThrow(() -> new MerchantNotFoundException(merchantId));

        if (!merchant.isActive()) {
            throw new MerchantNotActiveException(merchantId);
        }

        // If QR has pre-set amount, use it
        if (parsed.getTransactionAmount() != null) {
            amount = new BigDecimal(parsed.getTransactionAmount());
        }

        // Execute Fineract account transfer
        // POST /fineract-provider/api/v1/accounttransfers
        AccountTransferData transferResult = transferService.transferFunds(
                1L,                                 // fromOfficeId (Head Office)
                payerClientId,                      // fromClientId
                2,                                  // fromAccountType (savings)
                payerSavingsAccountId,              // fromAccountId
                1L,                                 // toOfficeId
                merchant.getClientId(),             // toClientId
                2,                                  // toAccountType (savings)
                merchant.getSavingsAccountId(),     // toAccountId
                amount,
                "QR Payment: " + narration
        );

        // Publish event
        kafkaTemplate.send("merchant.transaction", new MerchantTransactionEvent(
                merchant.getMerchantId(),
                merchant.getClientId(),
                payerClientId,
                amount,
                "QR_PAYMENT",
                transferResult.getTransactionId()
        ));

        return new QrPaymentResult(
                transferResult.getTransactionId(),
                merchant.getBusinessName(),
                amount,
                "COMPLETED"
        );
    }
}
```

### 5.5 QR REST Endpoints

```java
package ke.co.neobank.fineract.qr.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

@Path("/v1/qr")
@Component
public class QrPaymentApiResource {

    private final QrPaymentService qrService;

    public QrPaymentApiResource(QrPaymentService qrService) {
        this.qrService = qrService;
    }

    /**
     * POST /v1/qr/generate
     * Generate a merchant QR code.
     *
     * Request:
     * {
     *   "merchantId": "NB-M-001234",
     *   "amount": 1500.00  // Optional. Null for static (open-amount) QR.
     * }
     */
    @POST
    @Path("/generate")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response generateQr(QrGenerateRequest request) {
        String qrData = qrService.generateMerchantQR(
                request.getMerchantId(), request.getAmount());
        return Response.ok(new QrGenerateResponse(qrData)).build();
    }

    /**
     * POST /v1/qr/pay
     * Process a QR code payment (consumer scans merchant QR).
     *
     * Request:
     * {
     *   "payerClientId": 42,
     *   "payerSavingsAccountId": 89,
     *   "qrData": "00020101021226...",
     *   "amount": 1500.00,
     *   "narration": "Lunch at Mama Njeri's"
     * }
     */
    @POST
    @Path("/pay")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response processPayment(QrPaymentRequest request) {
        QrPaymentResult result = qrService.processQrPayment(
                request.getPayerClientId(),
                request.getPayerSavingsAccountId(),
                request.getQrData(),
                request.getAmount(),
                request.getNarration()
        );
        return Response.ok(result).build();
    }
}
```

---

## 6. Module 5: Merchant Module

### 6.1 Purpose

Fineract treats all clients identically -- there is no concept of a merchant with business attributes, MDR (Merchant Discount Rate), POS terminals, or settlement schedules. This module extends the Fineract client entity with merchant-specific data and provides settlement batch processing.

### 6.2 Custom Datatables

```sql
-- V5.0.0__neobank_merchant_datatables.sql

-- Merchant details attached to Fineract client entity
CREATE TABLE dt_merchant_details (
    client_id           BIGINT NOT NULL,
    business_name       VARCHAR(200) NOT NULL,
    business_type       VARCHAR(50) NOT NULL,        -- RESTAURANT, RETAIL, SERVICES, etc.
    business_reg_number VARCHAR(50),                  -- KRA PIN or registration number
    mdr_rate            DECIMAL(5,4) NOT NULL DEFAULT 0.0050,  -- 0.50% default MDR
    settlement_type     VARCHAR(20) NOT NULL DEFAULT 'T1',     -- T0 (instant), T1 (next day), T7 (weekly)
    settlement_account_id BIGINT,                     -- Fineract savings account for settlements
    pos_count           INT NOT NULL DEFAULT 0,
    softpos_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_volume      DECIMAL(19,4) DEFAULT 0,
    onboarding_status   VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_merchant_details PRIMARY KEY (client_id),
    CONSTRAINT fk_merchant_client FOREIGN KEY (client_id) REFERENCES m_client(id),
    CONSTRAINT fk_merchant_settlement FOREIGN KEY (settlement_account_id)
        REFERENCES m_savings_account(id)
);

-- Register as Fineract datatable
INSERT INTO x_registered_table (registered_table_name, application_table_name,
    category, display_name)
VALUES ('dt_merchant_details', 'm_client', 100, 'Merchant Details');

-- POS terminal tracking
CREATE TABLE dt_pos_terminals (
    id              BIGSERIAL PRIMARY KEY,
    merchant_id     BIGINT NOT NULL,               -- FK to dt_merchant_details.client_id
    terminal_id     VARCHAR(20) NOT NULL UNIQUE,    -- NB-POS-001234
    serial_number   VARCHAR(50) NOT NULL,
    terminal_type   VARCHAR(20) NOT NULL,           -- BLUETOOTH, ANDROID_POS, SOFTPOS
    model           VARCHAR(50),                    -- PAX A920, Sunmi V2
    status          VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',  -- ACTIVE, INACTIVE, MAINTENANCE
    last_active     TIMESTAMP,
    last_heartbeat  TIMESTAMP,
    firmware_version VARCHAR(20),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pos_merchant FOREIGN KEY (merchant_id)
        REFERENCES dt_merchant_details(client_id)
);

-- Register as Fineract datatable
INSERT INTO x_registered_table (registered_table_name, application_table_name,
    category, display_name)
VALUES ('dt_pos_terminals', 'm_client', 100, 'POS Terminals');

CREATE INDEX idx_pos_merchant ON dt_pos_terminals(merchant_id);
CREATE INDEX idx_pos_status ON dt_pos_terminals(status);
```

### 6.3 Settlement Processing

```java
package ke.co.neobank.fineract.merchant.service;

import org.apache.fineract.accounting.journalentry.service.JournalEntryWritePlatformService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class MerchantSettlementService {

    private final MerchantDetailsRepository merchantRepo;
    private final MerchantTransactionRepository txnRepo;
    private final SavingsAccountRepository savingsRepo;
    private final JournalEntryWritePlatformService journalEntryService;
    private final PaymentTypeRepository paymentTypeRepo;
    private final SettlementRepository settlementRepo;

    public MerchantSettlementService(
            MerchantDetailsRepository merchantRepo,
            MerchantTransactionRepository txnRepo,
            SavingsAccountRepository savingsRepo,
            JournalEntryWritePlatformService journalEntryService,
            PaymentTypeRepository paymentTypeRepo,
            SettlementRepository settlementRepo) {
        this.merchantRepo = merchantRepo;
        this.txnRepo = txnRepo;
        this.savingsRepo = savingsRepo;
        this.journalEntryService = journalEntryService;
        this.paymentTypeRepo = paymentTypeRepo;
        this.settlementRepo = settlementRepo;
    }

    /**
     * Daily settlement batch job.
     * Runs at 02:00 EAT to process previous day's merchant transactions.
     *
     * For each T1 merchant:
     * 1. Sum all transactions from previous day
     * 2. Calculate MDR fee deduction
     * 3. Post net amount to merchant's settlement savings account
     * 4. Create GL journal entry: Debit Merchant Clearing, Credit Merchant Settlement
     */
    @Scheduled(cron = "0 0 2 * * *", zone = "Africa/Nairobi")
    @Transactional
    public void processDailySettlements() {
        LocalDate settlementDate = LocalDate.now().minusDays(1);

        List<MerchantDetails> t1Merchants = merchantRepo
                .findBySettlementTypeAndOnboardingStatus("T1", "APPROVED");

        for (MerchantDetails merchant : t1Merchants) {
            processSettlementForMerchant(merchant, settlementDate);
        }
    }

    @Transactional
    public void processSettlementForMerchant(MerchantDetails merchant,
                                              LocalDate settlementDate) {
        // Get unsettled transactions
        List<MerchantTransaction> unsettledTxns = txnRepo
                .findUnsettledByMerchant(merchant.getClientId(), settlementDate);

        if (unsettledTxns.isEmpty()) return;

        // Calculate totals
        BigDecimal grossAmount = unsettledTxns.stream()
                .map(MerchantTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal mdrFee = grossAmount.multiply(merchant.getMdrRate())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal netAmount = grossAmount.subtract(mdrFee);

        // Post deposit to merchant's settlement savings account
        // POST /v1/savingsaccounts/{id}/transactions?command=deposit
        SavingsAccount settlementAccount = savingsRepo
                .findById(merchant.getSettlementAccountId())
                .orElseThrow();

        var paymentType = paymentTypeRepo.findByValue("Settlement")
                .orElseThrow();

        PaymentDetail paymentDetail = PaymentDetail.create(
                paymentType,
                "SETTLEMENT-" + settlementDate,
                null, null,
                "STL-" + merchant.getClientId() + "-" + settlementDate,
                null
        );

        settlementAccount.deposit(
                LocalDate.now(),
                netAmount,
                paymentDetail,
                settlementAccount.getCurrency()
        );
        savingsRepo.save(settlementAccount);

        // Create settlement record
        Settlement settlement = Settlement.builder()
                .merchantClientId(merchant.getClientId())
                .settlementDate(settlementDate)
                .grossAmount(grossAmount)
                .mdrFee(mdrFee)
                .netAmount(netAmount)
                .transactionCount(unsettledTxns.size())
                .status("COMPLETED")
                .fineractTransactionId(settlementAccount
                        .getTransactions().stream()
                        .reduce((a, b) -> b).map(t -> t.getId()).orElse(null))
                .build();
        settlementRepo.save(settlement);

        // Mark transactions as settled
        unsettledTxns.forEach(txn -> {
            txn.setSettled(true);
            txn.setSettlementId(settlement.getId());
        });
        txnRepo.saveAll(unsettledTxns);
    }
}
```

### 6.4 MDR Fee GL Posting

```sql
-- V5.0.1__neobank_merchant_gl_accounts.sql

-- GL accounts for merchant settlement
INSERT INTO acc_gl_account (name, gl_code, disabled, manual_entries_allowed,
    account_usage, classification_enum, description)
VALUES
    ('Merchant Clearing', '11300', 0, 1, 2, 1, 'Pending merchant settlements'),
    ('Merchant Settlement', '11310', 0, 1, 2, 1, 'Settled merchant funds'),
    ('MDR Fee Income', '41200', 0, 1, 2, 4, 'Merchant discount rate fee income');

-- Payment type for settlements
INSERT INTO m_payment_type (value, description, is_cash_payment, order_position)
VALUES ('Settlement', 'Merchant settlement disbursement', 0, 30);
```

### 6.5 Merchant REST Endpoints

```java
package ke.co.neobank.fineract.merchant.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

@Path("/v1/merchant")
@Component
public class MerchantApiResource {

    private final MerchantService merchantService;
    private final MerchantSettlementService settlementService;

    public MerchantApiResource(
            MerchantService merchantService,
            MerchantSettlementService settlementService) {
        this.merchantService = merchantService;
        this.settlementService = settlementService;
    }

    /**
     * POST /v1/merchant/onboard
     * Register a new merchant. Creates Fineract client with MERCHANT type
     * and associated savings (settlement) account.
     */
    @POST
    @Path("/onboard")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response onboardMerchant(MerchantOnboardRequest request) {
        var result = merchantService.onboardMerchant(request);
        return Response.status(201).entity(result).build();
    }

    /**
     * GET /v1/merchant/{clientId}/settlements
     * List settlement history for a merchant.
     */
    @GET
    @Path("/{clientId}/settlements")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listSettlements(
            @PathParam("clientId") Long clientId,
            @QueryParam("from") String fromDate,
            @QueryParam("to") String toDate,
            @QueryParam("limit") @DefaultValue("20") int limit,
            @QueryParam("offset") @DefaultValue("0") int offset) {
        var settlements = settlementService.listSettlements(
                clientId, fromDate, toDate, limit, offset);
        return Response.ok(settlements).build();
    }

    /**
     * POST /v1/merchant/{clientId}/terminals
     * Register a new POS terminal for a merchant.
     */
    @POST
    @Path("/{clientId}/terminals")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addTerminal(
            @PathParam("clientId") Long clientId,
            PosTerminalRequest request) {
        var terminal = merchantService.addTerminal(clientId, request);
        return Response.status(201).entity(terminal).build();
    }

    /**
     * GET /v1/merchant/{clientId}/terminals
     * List POS terminals for a merchant.
     */
    @GET
    @Path("/{clientId}/terminals")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listTerminals(@PathParam("clientId") Long clientId) {
        var terminals = merchantService.listTerminals(clientId);
        return Response.ok(terminals).build();
    }

    /**
     * GET /v1/merchant/{clientId}/dashboard
     * Merchant dashboard summary (today's sales, txn count, MDR, net).
     */
    @GET
    @Path("/{clientId}/dashboard")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDashboard(
            @PathParam("clientId") Long clientId,
            @QueryParam("period") @DefaultValue("today") String period) {
        var dashboard = merchantService.getDashboard(clientId, period);
        return Response.ok(dashboard).build();
    }
}
```

---

## 7. Module 6: Notification Hooks

### 7.1 Purpose

Fineract has no notification system. This module registers Spring event listeners on Fineract's domain events and routes notifications to SMS (Africa's Talking), Push (Firebase Cloud Messaging), and Email (SendGrid/AWS SES) based on client preferences.

### 7.2 Event Listeners

```java
package ke.co.neobank.fineract.notification.service;

import org.apache.fineract.portfolio.savings.domain.SavingsAccountTransaction;
import org.apache.fineract.portfolio.loanaccount.domain.Loan;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class FineractEventNotificationListener {

    private final NotificationPreferencesRepository prefsRepo;
    private final NotificationTemplateEngine templateEngine;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public FineractEventNotificationListener(
            NotificationPreferencesRepository prefsRepo,
            NotificationTemplateEngine templateEngine,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.prefsRepo = prefsRepo;
        this.templateEngine = templateEngine;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Listen for savings deposit events.
     * Triggered when any deposit is posted to a savings account.
     */
    @EventListener
    public void onSavingsDeposit(SavingsDepositBusinessEvent event) {
        SavingsAccountTransaction txn = event.get();
        Long clientId = txn.getSavingsAccount().getClient().getId();

        NotificationPayload payload = templateEngine.render(
                "TRANSACTION_CREDIT",
                clientId,
                java.util.Map.of(
                    "amount", formatMoney(txn.getAmount(), "KES"),
                    "balance", formatMoney(
                        txn.getRunningBalance(txn.getSavingsAccount().getCurrency()),
                        "KES"),
                    "reference", txn.getPaymentDetail() != null
                        ? txn.getPaymentDetail().getReceiptNumber() : "",
                    "date", txn.getTransactionDate().toString()
                )
        );

        routeNotification(clientId, "TRANSACTION_CREDIT", payload);
    }

    /**
     * Listen for savings withdrawal events.
     */
    @EventListener
    public void onSavingsWithdrawal(SavingsWithdrawalBusinessEvent event) {
        SavingsAccountTransaction txn = event.get();
        Long clientId = txn.getSavingsAccount().getClient().getId();

        NotificationPayload payload = templateEngine.render(
                "TRANSACTION_DEBIT",
                clientId,
                java.util.Map.of(
                    "amount", formatMoney(txn.getAmount(), "KES"),
                    "balance", formatMoney(
                        txn.getRunningBalance(txn.getSavingsAccount().getCurrency()),
                        "KES"),
                    "date", txn.getTransactionDate().toString()
                )
        );

        routeNotification(clientId, "TRANSACTION_DEBIT", payload);
    }

    /**
     * Listen for loan approval events.
     */
    @EventListener
    public void onLoanApproved(LoanApprovedBusinessEvent event) {
        Loan loan = event.get();
        Long clientId = loan.getClient().getId();

        NotificationPayload payload = templateEngine.render(
                "LOAN_APPROVED",
                clientId,
                java.util.Map.of(
                    "amount", formatMoney(loan.getApprovedPrincipal(), "KES"),
                    "product", loan.getLoanProduct().getName(),
                    "loanId", loan.getAccountNumber()
                )
        );

        routeNotification(clientId, "LOAN_APPROVED", payload);
    }

    /**
     * Listen for loan disbursement events.
     */
    @EventListener
    public void onLoanDisbursed(LoanDisbursalBusinessEvent event) {
        Loan loan = event.get();
        Long clientId = loan.getClient().getId();

        NotificationPayload payload = templateEngine.render(
                "LOAN_DISBURSED",
                clientId,
                java.util.Map.of(
                    "amount", formatMoney(loan.getDisbursedAmount(), "KES"),
                    "accountNo", loan.getAccountNumber()
                )
        );

        routeNotification(clientId, "LOAN_DISBURSED", payload);
    }

    /**
     * Listen for loan repayment events.
     */
    @EventListener
    public void onLoanRepayment(LoanTransactionMakeRepaymentPostBusinessEvent event) {
        var txn = event.get();
        Long clientId = txn.getLoan().getClient().getId();

        NotificationPayload payload = templateEngine.render(
                "LOAN_REPAYMENT",
                clientId,
                java.util.Map.of(
                    "amount", formatMoney(txn.getAmount(), "KES"),
                    "outstanding", formatMoney(
                        txn.getLoan().getSummary().getTotalOutstanding(), "KES"),
                    "loanId", txn.getLoan().getAccountNumber()
                )
        );

        routeNotification(clientId, "LOAN_REPAYMENT", payload);
    }

    /**
     * Route notification to appropriate channels based on client preferences.
     */
    private void routeNotification(Long clientId, String eventType,
                                    NotificationPayload payload) {
        var preferences = prefsRepo.findByClientIdAndEventType(
                clientId, eventType);

        for (NotificationPreference pref : preferences) {
            if (!pref.isEnabled()) continue;

            switch (pref.getChannel()) {
                case "SMS":
                    kafkaTemplate.send("notification.sms", payload);
                    break;
                case "PUSH":
                    kafkaTemplate.send("notification.push", payload);
                    break;
                case "EMAIL":
                    kafkaTemplate.send("notification.email", payload);
                    break;
                case "IN_APP":
                    kafkaTemplate.send("notification.inapp", payload);
                    break;
            }
        }
    }

    private String formatMoney(java.math.BigDecimal amount, String currency) {
        return currency + " " + String.format("%,.2f", amount);
    }
}
```

### 7.3 Notification Templates

```java
package ke.co.neobank.fineract.notification.service;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class NotificationTemplateEngine {

    private static final Map<String, NotificationTemplate> TEMPLATES = Map.of(
        "TRANSACTION_CREDIT", new NotificationTemplate(
            "Money Received",
            "You have received {{amount}}. New balance: {{balance}}. Ref: {{reference}}.",
            "You have received {{amount}} in your NeoBank account on {{date}}. " +
            "Your new balance is {{balance}}. Reference: {{reference}}."
        ),
        "TRANSACTION_DEBIT", new NotificationTemplate(
            "Payment Sent",
            "Payment of {{amount}} sent. Balance: {{balance}}.",
            "A payment of {{amount}} was made from your NeoBank account on {{date}}. " +
            "Your new balance is {{balance}}."
        ),
        "LOAN_APPROVED", new NotificationTemplate(
            "Loan Approved",
            "Your {{product}} loan of {{amount}} has been approved. Ref: {{loanId}}.",
            "Congratulations! Your {{product}} loan application for {{amount}} " +
            "has been approved. Loan reference: {{loanId}}."
        ),
        "LOAN_DISBURSED", new NotificationTemplate(
            "Loan Disbursed",
            "{{amount}} has been disbursed to your account. Ref: {{accountNo}}.",
            "Your loan of {{amount}} has been disbursed to your NeoBank account. " +
            "Loan reference: {{accountNo}}."
        ),
        "LOAN_REPAYMENT", new NotificationTemplate(
            "Repayment Received",
            "Repayment of {{amount}} received. Outstanding: {{outstanding}}.",
            "Your loan repayment of {{amount}} has been received. " +
            "Outstanding balance: {{outstanding}}. Loan: {{loanId}}."
        ),
        "KYC_APPROVED", new NotificationTemplate(
            "KYC Verified",
            "Your identity has been verified. Your limits have been upgraded.",
            "Your KYC verification is complete. Your transaction limits " +
            "have been upgraded. You can now transact up to {{dailyLimit}} per day."
        ),
        "CARD_TRANSACTION", new NotificationTemplate(
            "Card Payment",
            "Card *{{last4}}: {{amount}} at {{merchant}}.",
            "A payment of {{amount}} was made using your card ending in {{last4}} " +
            "at {{merchant}}. New balance: {{balance}}."
        )
    );

    public NotificationPayload render(String templateKey, Long clientId,
                                       Map<String, String> variables) {
        NotificationTemplate template = TEMPLATES.get(templateKey);
        if (template == null) {
            throw new IllegalArgumentException("Unknown template: " + templateKey);
        }

        String smsBody = substituteVariables(template.smsTemplate(), variables);
        String pushBody = substituteVariables(template.smsTemplate(), variables);
        String emailBody = substituteVariables(template.emailTemplate(), variables);

        return new NotificationPayload(
                clientId,
                templateKey,
                template.title(),
                smsBody,
                pushBody,
                emailBody
        );
    }

    private String substituteVariables(String template,
                                        Map<String, String> variables) {
        String result = template;
        for (var entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}",
                    entry.getValue() != null ? entry.getValue() : "");
        }
        return result;
    }

    record NotificationTemplate(String title, String smsTemplate,
                                 String emailTemplate) {}
}
```

### 7.4 Notification Preferences Table

```sql
-- V6.0.0__neobank_notification_tables.sql

CREATE TABLE nb_notification_preferences (
    id          BIGSERIAL PRIMARY KEY,
    client_id   BIGINT NOT NULL,
    event_type  VARCHAR(50) NOT NULL,     -- TRANSACTION_CREDIT, LOAN_APPROVED, etc.
    channel     VARCHAR(20) NOT NULL,     -- SMS, PUSH, EMAIL, IN_APP
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_notif_pref UNIQUE (client_id, event_type, channel),
    CONSTRAINT fk_notif_client FOREIGN KEY (client_id) REFERENCES m_client(id)
);

-- Default preferences: all new clients get PUSH + IN_APP for all events
INSERT INTO nb_notification_preferences (client_id, event_type, channel, enabled)
SELECT c.id, evt.event_type, ch.channel, TRUE
FROM m_client c
CROSS JOIN (VALUES
    ('TRANSACTION_CREDIT'), ('TRANSACTION_DEBIT'),
    ('LOAN_APPROVED'), ('LOAN_DISBURSED'), ('LOAN_REPAYMENT'),
    ('KYC_APPROVED'), ('CARD_TRANSACTION'), ('SECURITY_ALERT')
) AS evt(event_type)
CROSS JOIN (VALUES ('PUSH'), ('IN_APP')) AS ch(channel);

-- Notifications store (in-app notification center)
CREATE TABLE nb_notifications (
    id          BIGSERIAL PRIMARY KEY,
    client_id   BIGINT NOT NULL,
    event_type  VARCHAR(50) NOT NULL,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    channel     VARCHAR(20) NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    delivered   BOOLEAN NOT NULL DEFAULT FALSE,
    delivered_at TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notif_client_msg FOREIGN KEY (client_id) REFERENCES m_client(id)
);

CREATE INDEX idx_notif_client_read ON nb_notifications(client_id, is_read);
CREATE INDEX idx_notif_client_date ON nb_notifications(client_id, created_at DESC);

-- Device tokens for push notifications
CREATE TABLE nb_device_tokens (
    id          BIGSERIAL PRIMARY KEY,
    client_id   BIGINT NOT NULL,
    device_id   VARCHAR(200) NOT NULL,
    token       TEXT NOT NULL,                -- FCM/APNs token
    platform    VARCHAR(10) NOT NULL,         -- ANDROID, IOS
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_device_token UNIQUE (client_id, device_id),
    CONSTRAINT fk_devtoken_client FOREIGN KEY (client_id) REFERENCES m_client(id)
);
```

### 7.5 Notification Channel Configuration

```yaml
# application-neobank.yml
neobank:
  notifications:
    sms:
      provider: africas-talking
      api-key: ${AT_API_KEY}
      username: ${AT_USERNAME}
      sender-id: NeoBank
      # Quiet hours: no SMS between 10 PM and 7 AM EAT
      quiet-hours-start: "22:00"
      quiet-hours-end: "07:00"
      quiet-hours-timezone: "Africa/Nairobi"
    push:
      fcm-project-id: ${FCM_PROJECT_ID}
      fcm-credentials-path: /secrets/fcm-service-account.json
    email:
      provider: sendgrid
      api-key: ${SENDGRID_API_KEY}
      from-address: notifications@neobank.co.ke
      from-name: NeoBank
```

---

## 8. Module 7: Custom Datatables

### 8.1 Purpose

All NeoBank custom data is stored using Fineract's datatable framework where possible. This module provides the complete DDL for all custom datatables referenced across modules 1-6, along with their registration in Fineract's datatable registry.

### 8.2 Complete DDL

The following tables are created by this module. Modules 1-6 reference these tables but rely on this module for creation and registration.

```sql
-- V7.0.0__neobank_all_datatables.sql
-- Master migration that creates all NeoBank custom datatables
-- Individual modules may have additional non-datatable tables

-- ============================================================
-- 1. KYC Verification (attached to m_client)
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_kyc_verification (
    client_id               BIGINT NOT NULL,
    tier                    SMALLINT NOT NULL DEFAULT 1,
    document_type           VARCHAR(30),
    document_number         VARCHAR(50),
    document_front_url      VARCHAR(500),
    document_back_url       VARCHAR(500),
    selfie_url              VARCHAR(500),
    verification_provider   VARCHAR(30),
    verification_session_id VARCHAR(100),
    verification_score      DECIMAL(5,2),
    verified_at             TIMESTAMP,
    expiry_date             DATE,
    rejection_reason        TEXT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_dt_kyc PRIMARY KEY (client_id),
    CONSTRAINT fk_dt_kyc_client FOREIGN KEY (client_id) REFERENCES m_client(id)
);

-- ============================================================
-- 2. Card Details (attached to m_client)
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_card_details (
    id                  BIGSERIAL PRIMARY KEY,
    client_id           BIGINT NOT NULL,
    savings_account_id  BIGINT NOT NULL,
    card_token          VARCHAR(100) NOT NULL UNIQUE,
    card_type           VARCHAR(20) NOT NULL,
    card_network        VARCHAR(20) NOT NULL,
    last4               VARCHAR(4) NOT NULL,
    expiry_month        SMALLINT NOT NULL,
    expiry_year         SMALLINT NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    baas_card_id        VARCHAR(100) NOT NULL,
    baas_provider       VARCHAR(20) NOT NULL DEFAULT 'MARQETA',
    daily_limit         DECIMAL(19,4) DEFAULT 100000,
    monthly_limit       DECIMAL(19,4) DEFAULT 500000,
    per_txn_limit       DECIMAL(19,4) DEFAULT 50000,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dt_card_client FOREIGN KEY (client_id) REFERENCES m_client(id),
    CONSTRAINT fk_dt_card_savings FOREIGN KEY (savings_account_id)
        REFERENCES m_savings_account(id)
);

-- ============================================================
-- 3. QR Merchant Data (attached to m_client)
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_qr_merchant (
    id                  BIGSERIAL PRIMARY KEY,
    client_id           BIGINT NOT NULL,
    merchant_id         VARCHAR(20) NOT NULL UNIQUE,
    savings_account_id  BIGINT NOT NULL,
    business_name       VARCHAR(200) NOT NULL,
    category_code       VARCHAR(10) NOT NULL,
    city                VARCHAR(100) NOT NULL DEFAULT 'Nairobi',
    country_code        VARCHAR(2) NOT NULL DEFAULT 'KE',
    qr_data_static      TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dt_qr_client FOREIGN KEY (client_id) REFERENCES m_client(id),
    CONSTRAINT fk_dt_qr_savings FOREIGN KEY (savings_account_id)
        REFERENCES m_savings_account(id)
);

-- ============================================================
-- 4. Merchant Details (attached to m_client)
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_merchant_details (
    client_id               BIGINT NOT NULL,
    business_name           VARCHAR(200) NOT NULL,
    business_type           VARCHAR(50) NOT NULL,
    business_reg_number     VARCHAR(50),
    mdr_rate                DECIMAL(5,4) NOT NULL DEFAULT 0.0050,
    settlement_type         VARCHAR(20) NOT NULL DEFAULT 'T1',
    settlement_account_id   BIGINT,
    pos_count               INT NOT NULL DEFAULT 0,
    softpos_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_volume          DECIMAL(19,4) DEFAULT 0,
    onboarding_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at             TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_dt_merchant PRIMARY KEY (client_id),
    CONSTRAINT fk_dt_merchant_client FOREIGN KEY (client_id) REFERENCES m_client(id),
    CONSTRAINT fk_dt_merchant_settlement FOREIGN KEY (settlement_account_id)
        REFERENCES m_savings_account(id)
);

-- ============================================================
-- 5. POS Terminals (attached to m_client via merchant)
-- ============================================================
CREATE TABLE IF NOT EXISTS dt_pos_terminals (
    id              BIGSERIAL PRIMARY KEY,
    merchant_id     BIGINT NOT NULL,
    terminal_id     VARCHAR(20) NOT NULL UNIQUE,
    serial_number   VARCHAR(50) NOT NULL,
    terminal_type   VARCHAR(20) NOT NULL,
    model           VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    last_active     TIMESTAMP,
    last_heartbeat  TIMESTAMP,
    firmware_version VARCHAR(20),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dt_pos_merchant FOREIGN KEY (merchant_id)
        REFERENCES dt_merchant_details(client_id)
);

-- ============================================================
-- Register all datatables with Fineract
-- ============================================================
INSERT INTO x_registered_table (registered_table_name, application_table_name,
    category, display_name)
VALUES
    ('dt_kyc_verification', 'm_client', 100, 'KYC Verification'),
    ('dt_card_details', 'm_client', 100, 'Card Details'),
    ('dt_qr_merchant', 'm_client', 100, 'QR Merchant'),
    ('dt_merchant_details', 'm_client', 100, 'Merchant Details'),
    ('dt_pos_terminals', 'm_client', 100, 'POS Terminals');
```

### 8.3 Datatable API Access Patterns

Once registered, Fineract exposes these datatables via its standard REST API:

| Operation | Endpoint | Description |
|---|---|---|
| Read | `GET /v1/datatables/dt_kyc_verification/{clientId}` | Get KYC data for a client |
| Create | `POST /v1/datatables/dt_kyc_verification/{clientId}` | Add KYC record for a client |
| Update | `PUT /v1/datatables/dt_kyc_verification/{clientId}` | Update KYC record |
| Delete | `DELETE /v1/datatables/dt_kyc_verification/{clientId}` | Remove KYC record |
| Read | `GET /v1/datatables/dt_card_details/{clientId}` | Get all cards for a client |
| Create | `POST /v1/datatables/dt_card_details/{clientId}` | Add card record |
| Read | `GET /v1/datatables/dt_merchant_details/{clientId}` | Get merchant data |
| Read | `GET /v1/datatables/dt_pos_terminals/{clientId}` | Get terminals for merchant |

**Example: Read KYC tier for client 42**

```http
GET /fineract-provider/api/v1/datatables/dt_kyc_verification/42
Authorization: Basic <service_token>
Fineract-Platform-TenantId: neobank

Response:
[
  {
    "client_id": 42,
    "tier": 2,
    "document_type": "NATIONAL_ID",
    "document_number": "32456789",
    "verification_provider": "SMILE_ID",
    "verification_score": 98.50,
    "verified_at": "2026-04-04T10:30:00",
    "status": "VERIFIED"
  }
]
```

**Example: Add card record for client 42**

```http
POST /fineract-provider/api/v1/datatables/dt_card_details/42
Authorization: Basic <service_token>
Fineract-Platform-TenantId: neobank
Content-Type: application/json

{
  "savings_account_id": 89,
  "card_token": "tok_marqeta_abc123",
  "card_type": "VIRTUAL",
  "card_network": "VISA",
  "last4": "4523",
  "expiry_month": 4,
  "expiry_year": 2029,
  "status": "ACTIVE",
  "baas_card_id": "card_01HXYZ",
  "baas_provider": "MARQETA",
  "daily_limit": 100000,
  "monthly_limit": 500000,
  "per_txn_limit": 50000
}
```

---

## 9. Module 8: Custom Reports

### 9.1 Purpose

Fineract's built-in reports are designed for back-office staff (loan portfolio, savings summary, GL trial balance). NeoBank needs consumer-facing analytics (spending by category, income trends) and admin dashboards (transaction volume by channel, user growth, revenue by product). This module registers custom SQL-based reports with Fineract's reporting engine.

### 9.2 Report Registration

```sql
-- V8.0.0__neobank_custom_reports.sql
-- Register custom reports with Fineract report framework

-- Report 1: Transaction Volume by Channel
INSERT INTO stretchy_report (report_name, report_type, report_subtype,
    report_category, report_sql, description, core_report, use_report)
VALUES (
    'NeoBank - Transaction Volume by Channel',
    'Table',
    NULL,
    'Transaction',
    'SELECT
        CASE
            WHEN pt.value = ''M-Pesa'' THEN ''Mobile Money (M-Pesa)''
            WHEN pt.value = ''Airtel Money'' THEN ''Mobile Money (Airtel)''
            WHEN pt.value = ''MTN MoMo'' THEN ''Mobile Money (MTN)''
            WHEN pt.value = ''Card Payment'' THEN ''Card''
            WHEN pt.value = ''Settlement'' THEN ''Settlement''
            ELSE COALESCE(pt.value, ''Internal Transfer'')
        END AS channel,
        COUNT(*) AS transaction_count,
        SUM(sat.amount) AS total_volume,
        AVG(sat.amount) AS average_amount,
        MIN(sat.amount) AS min_amount,
        MAX(sat.amount) AS max_amount
    FROM m_savings_account_transaction sat
    LEFT JOIN m_payment_detail pd ON sat.payment_detail_id = pd.id
    LEFT JOIN m_payment_type pt ON pd.payment_type_id = pt.id
    WHERE sat.transaction_date BETWEEN ''${startDate}'' AND ''${endDate}''
      AND sat.is_reversed = FALSE
    GROUP BY channel
    ORDER BY total_volume DESC',
    'Transaction volume breakdown by payment channel (M-Pesa, Card, QR, Bank Transfer)',
    FALSE,
    TRUE
);

-- Report 1 parameters
INSERT INTO stretchy_report_parameter (report_id, parameter_id, report_parameter_name)
SELECT r.id, sp.id, sp.parameter_name
FROM stretchy_report r, stretchy_parameter sp
WHERE r.report_name = 'NeoBank - Transaction Volume by Channel'
  AND sp.parameter_name IN ('startDate', 'endDate');

-- Report 2: User Growth and KYC Conversion Funnel
INSERT INTO stretchy_report (report_name, report_type, report_subtype,
    report_category, report_sql, description, core_report, use_report)
VALUES (
    'NeoBank - User Growth and KYC Funnel',
    'Table',
    NULL,
    'Client',
    'SELECT
        DATE_TRUNC(''${groupBy}'', c.submittedon_date) AS period,
        COUNT(DISTINCT c.id) AS total_registrations,
        COUNT(DISTINCT CASE WHEN c.status_enum = 300 THEN c.id END) AS active_users,
        COUNT(DISTINCT CASE WHEN kyc.tier = 1 THEN kyc.client_id END) AS kyc_tier1,
        COUNT(DISTINCT CASE WHEN kyc.tier = 2 THEN kyc.client_id END) AS kyc_tier2,
        COUNT(DISTINCT CASE WHEN kyc.tier = 3 THEN kyc.client_id END) AS kyc_tier3,
        ROUND(
            COUNT(DISTINCT CASE WHEN kyc.tier >= 2 THEN kyc.client_id END) * 100.0 /
            NULLIF(COUNT(DISTINCT c.id), 0), 2
        ) AS kyc_conversion_rate_pct
    FROM m_client c
    LEFT JOIN dt_kyc_verification kyc ON c.id = kyc.client_id
    WHERE c.submittedon_date BETWEEN ''${startDate}'' AND ''${endDate}''
    GROUP BY period
    ORDER BY period',
    'User registration trend with KYC tier conversion funnel',
    FALSE,
    TRUE
);

-- Report 3: Revenue by Product
INSERT INTO stretchy_report (report_name, report_type, report_subtype,
    report_category, report_sql, description, core_report, use_report)
VALUES (
    'NeoBank - Revenue by Product',
    'Table',
    NULL,
    'Accounting',
    'SELECT
        ''Loan Interest'' AS revenue_source,
        SUM(lt.interest_portion_derived) AS amount,
        COUNT(DISTINCT lt.loan_id) AS contributing_accounts
    FROM m_loan_transaction lt
    WHERE lt.transaction_type_enum = 2
      AND lt.is_reversed = FALSE
      AND lt.transaction_date BETWEEN ''${startDate}'' AND ''${endDate}''

    UNION ALL

    SELECT
        ''Loan Fees'' AS revenue_source,
        SUM(lt.fee_charges_portion_derived) AS amount,
        COUNT(DISTINCT lt.loan_id) AS contributing_accounts
    FROM m_loan_transaction lt
    WHERE lt.transaction_type_enum = 2
      AND lt.is_reversed = FALSE
      AND lt.fee_charges_portion_derived > 0
      AND lt.transaction_date BETWEEN ''${startDate}'' AND ''${endDate}''

    UNION ALL

    SELECT
        ''Merchant MDR Fees'' AS revenue_source,
        SUM(s.mdr_fee) AS amount,
        COUNT(DISTINCT s.merchant_client_id) AS contributing_accounts
    FROM nb_settlement s  -- Custom NeoBank table from merchant module
    WHERE s.settlement_date BETWEEN ''${startDate}'' AND ''${endDate}''
      AND s.status = ''COMPLETED''

    UNION ALL

    SELECT
        ''Mobile Money Fees'' AS revenue_source,
        SUM(CASE WHEN ga.gl_code = ''41100'' THEN je.amount ELSE 0 END) AS amount,
        COUNT(DISTINCT je.id) AS contributing_accounts
    FROM acc_gl_journal_entry je
    JOIN acc_gl_account ga ON je.account_id = ga.id
    WHERE ga.gl_code = ''41100''
      AND je.entry_date BETWEEN ''${startDate}'' AND ''${endDate}''

    ORDER BY amount DESC',
    'Revenue breakdown by product line (loans, cards, merchant fees, mobile money fees)',
    FALSE,
    TRUE
);

-- Report 4: Daily Transaction Summary (for Dashboard)
INSERT INTO stretchy_report (report_name, report_type, report_subtype,
    report_category, report_sql, description, core_report, use_report)
VALUES (
    'NeoBank - Daily Transaction Summary',
    'Table',
    NULL,
    'Transaction',
    'SELECT
        sat.transaction_date AS txn_date,
        SUM(CASE WHEN sat.transaction_type_enum = 1 THEN sat.amount ELSE 0 END) AS total_deposits,
        SUM(CASE WHEN sat.transaction_type_enum = 2 THEN sat.amount ELSE 0 END) AS total_withdrawals,
        SUM(CASE WHEN sat.transaction_type_enum = 1 THEN sat.amount ELSE 0 END) -
        SUM(CASE WHEN sat.transaction_type_enum = 2 THEN sat.amount ELSE 0 END) AS net_flow,
        COUNT(CASE WHEN sat.transaction_type_enum = 1 THEN 1 END) AS deposit_count,
        COUNT(CASE WHEN sat.transaction_type_enum = 2 THEN 1 END) AS withdrawal_count
    FROM m_savings_account_transaction sat
    WHERE sat.transaction_date BETWEEN ''${startDate}'' AND ''${endDate}''
      AND sat.is_reversed = FALSE
    GROUP BY sat.transaction_date
    ORDER BY sat.transaction_date',
    'Daily deposit/withdrawal summary for dashboard charts',
    FALSE,
    TRUE
);

-- Report 5: Top Merchants by Volume
INSERT INTO stretchy_report (report_name, report_type, report_subtype,
    report_category, report_sql, description, core_report, use_report)
VALUES (
    'NeoBank - Top Merchants by Volume',
    'Table',
    NULL,
    'Transaction',
    'SELECT
        md.business_name,
        md.business_type,
        COUNT(*) AS transaction_count,
        SUM(ct.amount) AS total_volume,
        AVG(ct.amount) AS avg_transaction,
        md.mdr_rate,
        SUM(ct.amount) * md.mdr_rate AS total_mdr_earned
    FROM nb_card_transaction ct
    JOIN dt_merchant_details md ON md.client_id = (
        SELECT qm.client_id FROM dt_qr_merchant qm
        WHERE qm.merchant_id = ct.merchant_name  -- simplified join
        LIMIT 1
    )
    WHERE ct.created_at BETWEEN ''${startDate}'' AND ''${endDate}''
      AND ct.status IN (''AUTHORIZED'', ''CLEARED'')
    GROUP BY md.business_name, md.business_type, md.mdr_rate
    ORDER BY total_volume DESC
    LIMIT ${limit}',
    'Top merchants ranked by transaction volume',
    FALSE,
    TRUE
);

-- Report 6: Client Spending by Category (consumer-facing)
INSERT INTO stretchy_report (report_name, report_type, report_subtype,
    report_category, report_sql, description, core_report, use_report)
VALUES (
    'NeoBank - Spending by Category',
    'Table',
    NULL,
    'Client',
    'SELECT
        CASE
            WHEN ct.merchant_category IN (''5411'', ''5412'', ''5422'') THEN ''Groceries''
            WHEN ct.merchant_category IN (''5812'', ''5813'', ''5814'') THEN ''Restaurants''
            WHEN ct.merchant_category IN (''4121'', ''4131'', ''4111'') THEN ''Transport''
            WHEN ct.merchant_category IN (''4900'') THEN ''Utilities''
            WHEN ct.merchant_category IN (''5311'', ''5331'', ''5399'') THEN ''Shopping''
            WHEN ct.merchant_category IN (''8011'', ''8021'', ''8031'') THEN ''Healthcare''
            WHEN ct.merchant_category IN (''8211'', ''8220'', ''8241'') THEN ''Education''
            ELSE ''Other''
        END AS category,
        COUNT(*) AS transaction_count,
        SUM(ct.amount) AS total_spent,
        ROUND(
            SUM(ct.amount) * 100.0 /
            NULLIF((SELECT SUM(amount) FROM nb_card_transaction
                    WHERE client_id = ${clientId}
                    AND created_at BETWEEN ''${startDate}'' AND ''${endDate}''), 0),
            2
        ) AS percentage
    FROM nb_card_transaction ct
    WHERE ct.client_id = ${clientId}
      AND ct.created_at BETWEEN ''${startDate}'' AND ''${endDate}''
      AND ct.status IN (''AUTHORIZED'', ''CLEARED'')
    GROUP BY category
    ORDER BY total_spent DESC',
    'Consumer spending breakdown by merchant category for personal finance insights',
    FALSE,
    TRUE
);
```

### 9.3 Running Reports

Reports are executed via Fineract's standard report runner:

```http
GET /fineract-provider/api/v1/runreports/NeoBank%20-%20Transaction%20Volume%20by%20Channel
    ?R_startDate=2026-03-01&R_endDate=2026-04-04&output-type=JSON
Authorization: Basic <service_token>
Fineract-Platform-TenantId: neobank
```

```http
GET /fineract-provider/api/v1/runreports/NeoBank%20-%20User%20Growth%20and%20KYC%20Funnel
    ?R_startDate=2026-01-01&R_endDate=2026-04-04&R_groupBy=month&output-type=JSON
Authorization: Basic <service_token>
Fineract-Platform-TenantId: neobank
```

```http
GET /fineract-provider/api/v1/runreports/NeoBank%20-%20Spending%20by%20Category
    ?R_clientId=42&R_startDate=2026-03-01&R_endDate=2026-04-04&output-type=JSON
Authorization: Basic <service_token>
Fineract-Platform-TenantId: neobank
```

### 9.4 Report Output Formats

All reports support multiple output formats:

| Format | Parameter | Use Case |
|---|---|---|
| JSON | `output-type=JSON` | API consumption by React frontend |
| CSV | `output-type=CSV` | Data export, spreadsheet analysis |
| XLS | `output-type=XLS` | Excel reports for admin staff |
| PDF | `output-type=PDF` | Printable regulatory reports |

---

## 10. Deployment and Testing

### 10.1 Module Packaging

Each custom module is built as a fat JAR (excluding Fineract core dependencies, which are `compileOnly`):

```bash
# Build all custom modules
cd neobank-fineract-extensions
./gradlew clean build

# Output JARs
# neobank-mobilemoney/build/libs/neobank-mobilemoney-1.0.0.jar
# neobank-kyc/build/libs/neobank-kyc-1.0.0.jar
# neobank-card/build/libs/neobank-card-1.0.0.jar
# neobank-qr/build/libs/neobank-qr-1.0.0.jar
# neobank-merchant/build/libs/neobank-merchant-1.0.0.jar
# neobank-notification/build/libs/neobank-notification-1.0.0.jar
# neobank-datatables/build/libs/neobank-datatables-1.0.0.jar
# neobank-reports/build/libs/neobank-reports-1.0.0.jar
```

### 10.2 Docker Deployment

```dockerfile
# Dockerfile.fineract-custom
FROM apache/fineract:1.9.0

# Copy custom module JARs to Fineract classpath
COPY neobank-mobilemoney/build/libs/neobank-mobilemoney-*.jar /app/libs/
COPY neobank-kyc/build/libs/neobank-kyc-*.jar /app/libs/
COPY neobank-card/build/libs/neobank-card-*.jar /app/libs/
COPY neobank-qr/build/libs/neobank-qr-*.jar /app/libs/
COPY neobank-merchant/build/libs/neobank-merchant-*.jar /app/libs/
COPY neobank-notification/build/libs/neobank-notification-*.jar /app/libs/
COPY neobank-datatables/build/libs/neobank-datatables-*.jar /app/libs/
COPY neobank-reports/build/libs/neobank-reports-*.jar /app/libs/

# Custom configuration
COPY application-neobank.yml /app/config/

# Flyway migrations run automatically on startup
ENV SPRING_PROFILES_ACTIVE=neobank
```

```yaml
# docker-compose.yml (relevant service)
services:
  fineract:
    build:
      context: ./neobank-fineract-extensions
      dockerfile: Dockerfile.fineract-custom
    ports:
      - "8443:8443"
    environment:
      - FINERACT_PLATFORM_TENANTID=neobank
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/fineract_neobank
      - SPRING_DATASOURCE_USERNAME=${DB_USER}
      - SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
      - NEOBANK_MPESA_CONSUMER_KEY=${MPESA_CONSUMER_KEY}
      - NEOBANK_MPESA_CONSUMER_SECRET=${MPESA_CONSUMER_SECRET}
      - NEOBANK_MPESA_SHORTCODE=${MPESA_SHORTCODE}
      - NEOBANK_MPESA_PASSKEY=${MPESA_PASSKEY}
      - NEOBANK_MPESA_CALLBACK_URL=https://api.neobank.co.ke
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    depends_on:
      - postgres
      - kafka
    volumes:
      - ./secrets:/secrets:ro
```

### 10.3 Integration Testing with Testcontainers

```java
package ke.co.neobank.fineract.test;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class MobileMoneyIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgres:16"))
            .withDatabaseName("fineract_test")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("fineract-schema.sql");

    @Container
    static KafkaContainer kafka = new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Test
    void shouldRegisterMobileMoneyPaymentTypes() {
        // Verify M-Pesa, Airtel Money, MTN MoMo payment types exist
        var paymentTypes = paymentTypeRepo.findAll();
        assertThat(paymentTypes)
                .extracting("value")
                .contains("M-Pesa", "Airtel Money", "MTN MoMo");
    }

    @Test
    void shouldCreateMobileMoneyTransaction() {
        // Create a test client and savings account
        Long clientId = createTestClient("Grace", "Kemunto");
        Long savingsId = createTestSavingsAccount(clientId);

        // Simulate STK Push initiation
        var response = channelHandler.initiateStkPush(
                savingsId, "+254712345678",
                new java.math.BigDecimal("5000"), "Test deposit");

        assertThat(response.getCheckoutRequestId()).isNotNull();

        // Verify transaction record created
        var txn = transactionRepo.findByTransactionRef(response.getTransactionRef());
        assertThat(txn).isPresent();
        assertThat(txn.get().getStatus()).isEqualTo(MobileMoneyStatus.PENDING);
    }

    @Test
    void shouldEnforceKycTierLimits() {
        // Create Tier 1 client
        Long clientId = createTestClient("John", "Ochieng");
        createKycRecord(clientId, 1);  // Tier 1: 150K daily, 70K per txn

        // Attempt transaction exceeding single limit
        assertThatThrownBy(() ->
                kycEnforcement.validateTransaction(clientId,
                        new java.math.BigDecimal("80000")))
                .isInstanceOf(KycTierLimitExceededException.class)
                .hasMessageContaining("Tier 1");
    }

    @Test
    void shouldProcessCardWebhookAndPostToFineract() {
        // Create client with card
        Long clientId = createTestClient("Amina", "Wanjiku");
        Long savingsId = createTestSavingsAccount(clientId);
        depositToAccount(savingsId, new java.math.BigDecimal("100000"));
        createCardRecord(clientId, savingsId, "tok_test_123");

        // Simulate Marqeta authorization webhook
        MarqetaWebhookPayload payload = MarqetaWebhookPayload.builder()
                .type("authorization")
                .cardToken("tok_test_123")
                .amount("1500.00")
                .merchant(new MerchantData("Java House", "5812", "Nairobi"))
                .build();

        cardPostingService.processAuthorization(payload);

        // Verify savings account was debited
        SavingsAccount account = savingsRepo.findById(savingsId).orElseThrow();
        assertThat(account.getAccountBalance())
                .isEqualByComparingTo(new java.math.BigDecimal("98500"));
    }

    @Test
    void shouldProcessQrPayment() {
        // Create payer and merchant
        Long payerClientId = createTestClient("Brian", "Mwangi");
        Long payerSavingsId = createTestSavingsAccount(payerClientId);
        depositToAccount(payerSavingsId, new java.math.BigDecimal("50000"));

        Long merchantClientId = createTestClient("Mama", "Njeri");
        Long merchantSavingsId = createTestSavingsAccount(merchantClientId);
        createQrMerchant(merchantClientId, merchantSavingsId, "NB-M-001");

        // Generate and process QR payment
        String qrData = qrService.generateMerchantQR("NB-M-001",
                new java.math.BigDecimal("1500"));
        QrPaymentResult result = qrService.processQrPayment(
                payerClientId, payerSavingsId, qrData,
                new java.math.BigDecimal("1500"), "Lunch");

        assertThat(result.getStatus()).isEqualTo("COMPLETED");

        // Verify balances
        assertThat(savingsRepo.findById(payerSavingsId).get().getAccountBalance())
                .isEqualByComparingTo(new java.math.BigDecimal("48500"));
        assertThat(savingsRepo.findById(merchantSavingsId).get().getAccountBalance())
                .isEqualByComparingTo(new java.math.BigDecimal("1500"));
    }

    @Test
    void shouldRunCustomReport() {
        // Create test data
        createTestTransactions();

        // Run report
        var result = reportRunner.runReport(
                "NeoBank - Transaction Volume by Channel",
                Map.of("startDate", "2026-03-01", "endDate", "2026-04-04"));

        assertThat(result).isNotEmpty();
        assertThat(result.get(0)).containsKey("channel");
        assertThat(result.get(0)).containsKey("transaction_count");
        assertThat(result.get(0)).containsKey("total_volume");
    }
}
```

### 10.4 CI/CD Pipeline

```yaml
# .github/workflows/fineract-custom-modules.yml
name: Fineract Custom Modules CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'neobank-fineract-extensions/**'
  pull_request:
    paths:
      - 'neobank-fineract-extensions/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: fineract_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Build all modules
        working-directory: neobank-fineract-extensions
        run: ./gradlew clean build -x test

      - name: Run unit tests
        working-directory: neobank-fineract-extensions
        run: ./gradlew test

      - name: Run integration tests
        working-directory: neobank-fineract-extensions
        run: ./gradlew integrationTest
        env:
          TESTCONTAINERS_RYUK_DISABLED: true

      - name: Build Docker image
        if: github.ref == 'refs/heads/main'
        working-directory: neobank-fineract-extensions
        run: |
          docker build -t neobank-fineract:${{ github.sha }} \
            -f Dockerfile.fineract-custom .

      - name: Push to ECR
        if: github.ref == 'refs/heads/main'
        run: |
          aws ecr get-login-password --region af-south-1 | \
            docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag neobank-fineract:${{ github.sha }} \
            ${{ secrets.ECR_REGISTRY }}/neobank-fineract:${{ github.sha }}
          docker push \
            ${{ secrets.ECR_REGISTRY }}/neobank-fineract:${{ github.sha }}

  deploy-staging:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to EKS staging
        run: |
          kubectl set image deployment/fineract \
            fineract=${{ secrets.ECR_REGISTRY }}/neobank-fineract:${{ github.sha }} \
            -n neobank-staging

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/fineract \
            -n neobank-staging --timeout=300s

      - name: Run smoke tests
        run: |
          curl -sf https://fineract-staging.neobank.co.ke/fineract-provider/api/v1/authentication \
            -H "Fineract-Platform-TenantId: neobank" \
            -H "Content-Type: application/json" \
            -d '{"username":"smoke_test","password":"test"}' || exit 1
```

### 10.5 Module Dependency Order

Modules must be deployed in this order due to schema dependencies:

| Order | Module | Depends On |
|---|---|---|
| 1 | neobank-datatables | Fineract core tables only |
| 2 | neobank-reports | neobank-datatables (references dt_* tables) |
| 3 | neobank-kyc | neobank-datatables (dt_kyc_verification) |
| 4 | neobank-mobilemoney | Fineract payment types |
| 5 | neobank-card | neobank-datatables (dt_card_details) |
| 6 | neobank-qr | neobank-datatables (dt_qr_merchant), neobank-merchant |
| 7 | neobank-merchant | neobank-datatables (dt_merchant_details, dt_pos_terminals) |
| 8 | neobank-notification | All other modules (listens to events from all) |

### 10.6 Configuration Properties

```yaml
# application-neobank.yml -- complete configuration reference
neobank:
  # Mobile Money (Module 1)
  mpesa:
    consumer-key: ${MPESA_CONSUMER_KEY}
    consumer-secret: ${MPESA_CONSUMER_SECRET}
    shortcode: ${MPESA_SHORTCODE}
    passkey: ${MPESA_PASSKEY}
    callback-url: https://api.neobank.co.ke
    b2c:
      initiator-name: ${MPESA_B2C_INITIATOR}
      security-credential: ${MPESA_B2C_CREDENTIAL}

  airtel:
    client-id: ${AIRTEL_CLIENT_ID}
    client-secret: ${AIRTEL_CLIENT_SECRET}
    environment: production  # or sandbox

  # KYC (Module 2)
  kyc:
    smile-id:
      partner-id: ${SMILE_ID_PARTNER_ID}
      api-key: ${SMILE_ID_API_KEY}
      callback-url: https://api.neobank.co.ke/v1/kyc/smile-id/callback
    tier-limits:
      tier1-daily: 150000
      tier1-single: 70000
      tier2-daily: 500000
      tier2-single: 250000
      tier3-single: 1000000

  # Cards (Module 3)
  cards:
    baas-provider: marqeta  # or stripe
    marqeta:
      base-url: https://sandbox-api.marqeta.com/v3
      application-token: ${MARQETA_APP_TOKEN}
      admin-access-token: ${MARQETA_ADMIN_TOKEN}
      webhook-secret: ${MARQETA_WEBHOOK_SECRET}
    stripe:
      secret-key: ${STRIPE_SECRET_KEY}
      webhook-secret: ${STRIPE_WEBHOOK_SECRET}

  # Merchant (Module 5)
  merchant:
    default-mdr-rate: 0.0050  # 0.50%
    settlement-schedule: "0 0 2 * * *"  # 2 AM EAT daily
    settlement-timezone: Africa/Nairobi

  # Notifications (Module 6)
  notifications:
    sms:
      provider: africas-talking
      api-key: ${AT_API_KEY}
      username: ${AT_USERNAME}
      sender-id: NeoBank
      quiet-hours-start: "22:00"
      quiet-hours-end: "07:00"
      quiet-hours-timezone: Africa/Nairobi
    push:
      fcm-project-id: ${FCM_PROJECT_ID}
      fcm-credentials-path: /secrets/fcm-service-account.json
    email:
      provider: sendgrid
      api-key: ${SENDGRID_API_KEY}
      from-address: notifications@neobank.co.ke
      from-name: NeoBank
```

---

## Appendix A: GL Account Summary

| GL Code | Name | Type | Module |
|---|---|---|---|
| 11100 | M-Pesa Clearing | Asset | Mobile Money |
| 11101 | Airtel Money Clearing | Asset | Mobile Money |
| 11102 | MTN MoMo Clearing | Asset | Mobile Money |
| 11110 | Mobile Money Settlement | Asset | Mobile Money |
| 11200 | Card Clearing Account | Asset | Card |
| 11210 | Card Settlement Account | Asset | Card |
| 11300 | Merchant Clearing | Asset | Merchant |
| 11310 | Merchant Settlement | Asset | Merchant |
| 41100 | Mobile Money Fee Income | Income | Mobile Money |
| 41200 | MDR Fee Income | Income | Merchant |

## Appendix B: Payment Type Summary

| ID (auto) | Name | Module |
|---|---|---|
| 10 | M-Pesa | Mobile Money |
| 11 | Airtel Money | Mobile Money |
| 12 | MTN MoMo | Mobile Money |
| 13 | Flutterwave | Mobile Money |
| 20 | Card Payment | Card |
| 30 | Settlement | Merchant |

## Appendix C: Kafka Topics

| Topic | Producer | Consumers |
|---|---|---|
| `txn.completed` | Mobile Money, Card, QR, Merchant | Notification, Compliance, Reporting |
| `txn.failed` | Mobile Money, Card | Notification |
| `card.transaction` | Card | Notification, Compliance |
| `merchant.transaction` | QR, Merchant | Notification, Settlement, Reporting |
| `kyc.approved` | KYC | Notification, Account (tier upgrade) |
| `notification.sms` | Notification Hooks | SMS Delivery Worker |
| `notification.push` | Notification Hooks | Push Delivery Worker |
| `notification.email` | Notification Hooks | Email Delivery Worker |
| `notification.inapp` | Notification Hooks | In-App Storage Worker |
