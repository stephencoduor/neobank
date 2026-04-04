# Payment Integration Guide

## NeoBank (Kenya) & DisbursePro (Zambia) -- Unified Payment Provider Reference

| Field | Detail |
|---|---|
| **Products** | NeoBank (Digital Banking, Kenya) + DisbursePro (Disbursement Platform, Zambia) |
| **Company** | Qsoftwares Ltd. |
| **Version** | 1.0 |
| **Date** | 2026-04-04 |
| **Status** | Draft |

---

## Table of Contents

1. [Overview -- Payment Orchestrator Architecture](#1-overview----payment-orchestrator-architecture)
2. [M-Pesa Daraja API (Kenya)](#2-m-pesa-daraja-api-kenya)
3. [Airtel Money (Kenya + Zambia)](#3-airtel-money-kenya--zambia)
4. [MTN MoMo (Zambia)](#4-mtn-momo-zambia)
5. [Zamtel Kwacha (Zambia)](#5-zamtel-kwacha-zambia)
6. [Flutterwave (Aggregator)](#6-flutterwave-aggregator)
7. [Paystack (Aggregator)](#7-paystack-aggregator)
8. [Common Patterns](#8-common-patterns)
9. [Fee Calculation](#9-fee-calculation)
10. [Testing & Sandbox](#10-testing--sandbox)

---

## 1. Overview -- Payment Orchestrator Architecture

### 1.1 Design Philosophy

Both NeoBank and DisbursePro use a **Payment Orchestrator** pattern: the application never calls carrier APIs directly from the frontend. All payment operations flow through a backend service that handles provider selection, failover, idempotency, fee calculation, and reconciliation.

```
                          NeoBank (Kenya)                    DisbursePro (Zambia)
                    +-----------------------+          +---------------------------+
                    |  React 19 Frontend    |          |  React 19 Frontend        |
                    +----------+------------+          +-------------+-------------+
                               |                                     |
                               v                                     v
                    +----------+------------+          +-------------+-------------+
                    |  API Gateway (Kong)   |          |  API Gateway (Kong)       |
                    |  JWT + Rate Limit     |          |  JWT + Rate Limit         |
                    +----------+------------+          +-------------+-------------+
                               |                                     |
                               v                                     v
                    +----------+------------+          +-------------+-------------+
                    |  Payment Service      |          |  Carrier Adapter Module   |
                    |  (Spring Boot)        |          |  (NestJS)                 |
                    +----------+------------+          +-------------+-------------+
                               |                                     |
              +----------------+----------------+       +------------+------------+
              |        |        |        |      |       |            |            |
              v        v        v        v      v       v            v            v
          +------+ +------+ +------+ +------+ +----+ +------+  +------+  +------+
          |M-Pesa| |Airtel| |Fltr- | |Pay-  | |DPO | |Airtel|  | MTN  |  |Zamtel|
          |Daraja| |Money | |wave  | |stack | |    | |Money |  | MoMo |  |Kwacha|
          +------+ +------+ +------+ +------+ +----+ +------+  +------+  +------+
```

### 1.2 Provider Routing Strategy

NeoBank uses a **fallback chain** pattern. Each payment type has a primary provider and one or two fallback providers:

| Payment Type | Primary | Fallback 1 | Fallback 2 |
|---|---|---|---|
| M-Pesa Deposit (C2B) | Daraja | IntaSend | Cellulant |
| M-Pesa Withdrawal (B2C) | Daraja | IntaSend | Cellulant |
| Card Payment | Flutterwave | Paystack | DPO |
| Airtel Money | Airtel API | Cellulant | -- |
| Cross-border | Chipper Cash | Flutterwave | Cellulant |

DisbursePro routes to a **single carrier per employee** (Airtel Money, MTN MoMo, or Zamtel Kwacha). The carrier is stored on the employee record and does not fall back -- if the carrier is down, the disbursement enters a `failed` state and can be retried manually.

### 1.3 Provider Selection Logic

```typescript
// NeoBank: Payment provider selection with fallback
interface ProviderChain {
  paymentType: string;
  providers: string[];
}

const PROVIDER_CHAINS: ProviderChain[] = [
  { paymentType: "MPESA_DEPOSIT",   providers: ["DARAJA", "INTASEND", "CELLULANT"] },
  { paymentType: "MPESA_WITHDRAW",  providers: ["DARAJA", "INTASEND", "CELLULANT"] },
  { paymentType: "CARD_PAYMENT",    providers: ["FLUTTERWAVE", "PAYSTACK", "DPO"] },
  { paymentType: "AIRTEL_MONEY",    providers: ["AIRTEL", "CELLULANT"] },
  { paymentType: "CROSS_BORDER",    providers: ["CHIPPER", "FLUTTERWAVE", "CELLULANT"] },
];

async function routePayment(request: PaymentRequest): Promise<PaymentResult> {
  const chain = PROVIDER_CHAINS.find(c => c.paymentType === request.type);
  if (!chain) throw new Error(`No provider chain for type: ${request.type}`);

  for (const providerName of chain.providers) {
    const provider = providerRegistry.get(providerName);
    if (!provider) continue;

    // Check circuit breaker state
    if (circuitBreaker.isOpen(providerName)) continue;

    try {
      const result = await provider.process(request);
      return result;
    } catch (error) {
      circuitBreaker.recordFailure(providerName);
      logger.warn(`Provider ${providerName} failed, trying next`, { error });
    }
  }

  throw new Error(`All providers exhausted for type: ${request.type}`);
}
```

### 1.4 Circuit Breaker Configuration

Both platforms use a circuit breaker to prevent cascading failures when a provider is down.

| Parameter | NeoBank | DisbursePro |
|---|---|---|
| **Failure threshold** | 3 failures in 60 seconds | 3 failures in 60 seconds |
| **Open duration** | 30 seconds | 30 seconds |
| **Half-open probes** | 1 request | 1 request |
| **Library** | Resilience4j (Java) | cockatiel (TypeScript) |

### 1.5 Webhook Architecture

Both platforms receive asynchronous callbacks from providers. The processing flow is identical:

1. Provider POSTs to webhook endpoint (e.g., `POST /webhooks/mpesa`)
2. Endpoint verifies signature (provider-specific)
3. Endpoint deduplicates using event ID
4. Event published to Kafka topic (NeoBank) or BullMQ queue (DisbursePro)
5. HTTP 200 returned to provider within 5 seconds
6. Consumer processes event asynchronously (update status, release wallet hold, send notification)
7. Failed processing retried with exponential backoff; dead-letter after 5 attempts

---

## 2. M-Pesa Daraja API (Kenya)

### 2.1 Overview

M-Pesa Daraja is Safaricom's REST API for M-Pesa integration. NeoBank uses it for:

- **C2B (Customer to Business):** Deposit from M-Pesa wallet into NeoBank account via STK Push
- **B2C (Business to Customer):** Withdraw from NeoBank to user's M-Pesa
- **B2B (Business to Business):** Merchant settlement payouts
- **Account Balance:** Query M-Pesa float account balance
- **Transaction Status:** Check status of a prior transaction
- **Reversal:** Reverse a completed B2C or C2B payment

### 2.2 Authentication -- OAuth2

Daraja uses OAuth2 client credentials flow. The access token is valid for 1 hour.

**Base URLs:**

| Environment | URL |
|---|---|
| Sandbox | `https://sandbox.safaricom.co.ke` |
| Production | `https://api.safaricom.co.ke` |

**Token Request:**

```http
GET /oauth/v1/generate?grant_type=client_credentials
Authorization: Basic base64(consumer_key:consumer_secret)
```

**Token Response:**

```json
{
  "access_token": "0A0v8OgxqqoocblflR58nGvXfOHi",
  "expires_in": "3599"
}
```

**TypeScript Token Manager:**

```typescript
interface DarajaToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

class DarajaAuth {
  private token: DarajaToken | null = null;
  private readonly baseUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;

  constructor(config: { baseUrl: string; consumerKey: string; consumerSecret: string }) {
    this.baseUrl = config.baseUrl;
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.token && this.token.expiresAt > Date.now() + 60_000) {
      return this.token.accessToken;
    }

    const credentials = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString("base64");

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` } }
    );

    const data = await response.json();
    this.token = {
      accessToken: data.access_token,
      expiresAt: Date.now() + parseInt(data.expires_in) * 1000,
    };

    return this.token.accessToken;
  }
}
```

### 2.3 STK Push (Lipa Na M-Pesa Online)

STK Push sends a payment prompt to the customer's phone. Used for deposits into NeoBank.

**Endpoint:** `POST /mpesa/stkpush/v1/processrequest`

**Request:**

```json
{
  "BusinessShortCode": 174379,
  "Password": "base64(BusinessShortCode + Passkey + Timestamp)",
  "Timestamp": "20260404143000",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": 1000,
  "PartyA": 254712345678,
  "PartyB": 174379,
  "PhoneNumber": 254712345678,
  "CallBackURL": "https://api.neobank.co.ke/webhooks/mpesa/stkpush",
  "AccountReference": "NB-254-10001234",
  "TransactionDesc": "Deposit to NeoBank"
}
```

**Response (synchronous):**

```json
{
  "MerchantRequestID": "29115-34620561-1",
  "CheckoutRequestID": "ws_CO_04042026143000123456",
  "ResponseCode": "0",
  "ResponseDescription": "Success. Request accepted for processing",
  "CustomerMessage": "Success. Request accepted for processing"
}
```

**Callback (asynchronous):**

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_04042026143000123456",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 1000.00 },
          { "Name": "MpesaReceiptNumber", "Value": "SIK3D2LO4X" },
          { "Name": "Balance" },
          { "Name": "TransactionDate", "Value": 20260404143012 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

**Password Generation:**

```typescript
function generateStkPassword(
  shortCode: number,
  passkey: string,
  timestamp: string
): string {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
}

function formatTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}
```

### 2.4 C2B (Customer to Business)

C2B registers URLs to receive confirmation and validation callbacks when customers pay to a Paybill or Buy Goods number.

**Register URLs:**

```http
POST /mpesa/c2b/v1/registerurl
Authorization: Bearer {access_token}

{
  "ShortCode": 600992,
  "ResponseType": "Completed",
  "ConfirmationURL": "https://api.neobank.co.ke/webhooks/mpesa/c2b/confirm",
  "ValidationURL": "https://api.neobank.co.ke/webhooks/mpesa/c2b/validate"
}
```

**Validation Callback (inbound):**

```json
{
  "TransactionType": "Pay Bill",
  "TransID": "SIK3D2LO4X",
  "TransTime": "20260404143000",
  "TransAmount": "1000.00",
  "BusinessShortCode": "600992",
  "BillRefNumber": "NB-254-10001234",
  "InvoiceNumber": "",
  "OrgAccountBalance": "50000.00",
  "ThirdPartyTransID": "",
  "MSISDN": "254712345678",
  "FirstName": "AMINA",
  "MiddleName": "",
  "LastName": "WANJIKU"
}
```

**Validation Response:**

```json
{
  "ResultCode": 0,
  "ResultDesc": "Accepted"
}
```

To reject a transaction (e.g., invalid account reference), return `ResultCode: 1`.

### 2.5 B2C (Business to Customer)

B2C sends money from the business M-Pesa account to a customer's M-Pesa wallet. Used for NeoBank withdrawals.

**Endpoint:** `POST /mpesa/b2c/v1/paymentrequest`

**Request:**

```json
{
  "InitiatorName": "NeoBank_API",
  "SecurityCredential": "base64(RSA_encrypted(initiator_password))",
  "CommandID": "BusinessPayment",
  "Amount": 5000,
  "PartyA": 600992,
  "PartyB": 254712345678,
  "Remarks": "NeoBank Withdrawal",
  "QueueTimeOutURL": "https://api.neobank.co.ke/webhooks/mpesa/b2c/timeout",
  "ResultURL": "https://api.neobank.co.ke/webhooks/mpesa/b2c/result",
  "Occasion": "Withdrawal NB-254-10001234"
}
```

**Synchronous Response:**

```json
{
  "ConversationID": "AG_20260404_0000111222333aabb",
  "OriginatorConversationID": "16740-34861180-1",
  "ResponseCode": "0",
  "ResponseDescription": "Accept the service request successfully."
}
```

**Result Callback (asynchronous):**

```json
{
  "Result": {
    "ResultType": 0,
    "ResultCode": 0,
    "ResultDesc": "The service request is processed successfully.",
    "OriginatorConversationID": "16740-34861180-1",
    "ConversationID": "AG_20260404_0000111222333aabb",
    "TransactionID": "SIK3D2LO4X",
    "ResultParameters": {
      "ResultParameter": [
        { "Key": "TransactionAmount", "Value": 5000 },
        { "Key": "TransactionReceipt", "Value": "SIK3D2LO4X" },
        { "Key": "ReceiverPartyPublicName", "Value": "254712345678 - AMINA WANJIKU" },
        { "Key": "TransactionCompletedDateTime", "Value": "04.04.2026 14:30:12" },
        { "Key": "B2CUtilityAccountAvailableFunds", "Value": 150000.00 },
        { "Key": "B2CWorkingAccountAvailableFunds", "Value": 50000.00 },
        { "Key": "B2CRecipientIsRegisteredCustomer", "Value": "Y" },
        { "Key": "B2CChargesPaidAccountAvailableFunds", "Value": 0 }
      ]
    }
  }
}
```

**CommandID Options:**

| CommandID | Use Case |
|---|---|
| `BusinessPayment` | Normal B2C payment (business to individual) |
| `SalaryPayment` | Salary disbursement (higher limits, different fees) |
| `PromotionPayment` | Promotional payments |

### 2.6 B2B (Business to Business)

B2B transfers funds between two business M-Pesa short codes. Used for merchant settlement payouts.

**Endpoint:** `POST /mpesa/b2b/v1/paymentrequest`

**Request:**

```json
{
  "Initiator": "NeoBank_API",
  "SecurityCredential": "base64(RSA_encrypted(initiator_password))",
  "CommandID": "BusinessPayBill",
  "SenderIdentifierType": 4,
  "RecieverIdentifierType": 4,
  "Amount": 47250,
  "PartyA": 600992,
  "PartyB": 123456,
  "AccountReference": "SETTLE-20260404-001",
  "Remarks": "Daily settlement for Mama Njeri Kitchen",
  "QueueTimeOutURL": "https://api.neobank.co.ke/webhooks/mpesa/b2b/timeout",
  "ResultURL": "https://api.neobank.co.ke/webhooks/mpesa/b2b/result"
}
```

### 2.7 Account Balance

**Endpoint:** `POST /mpesa/accountbalance/v1/query`

**Request:**

```json
{
  "Initiator": "NeoBank_API",
  "SecurityCredential": "base64(RSA_encrypted(initiator_password))",
  "CommandID": "AccountBalance",
  "PartyA": 600992,
  "IdentifierType": 4,
  "Remarks": "Balance check",
  "QueueTimeOutURL": "https://api.neobank.co.ke/webhooks/mpesa/balance/timeout",
  "ResultURL": "https://api.neobank.co.ke/webhooks/mpesa/balance/result"
}
```

### 2.8 Transaction Status

**Endpoint:** `POST /mpesa/transactionstatus/v1/query`

**Request:**

```json
{
  "Initiator": "NeoBank_API",
  "SecurityCredential": "base64(RSA_encrypted(initiator_password))",
  "CommandID": "TransactionStatusQuery",
  "TransactionID": "SIK3D2LO4X",
  "PartyA": 600992,
  "IdentifierType": 4,
  "Remarks": "Status check",
  "QueueTimeOutURL": "https://api.neobank.co.ke/webhooks/mpesa/status/timeout",
  "ResultURL": "https://api.neobank.co.ke/webhooks/mpesa/status/result",
  "Occasion": "Deposit verification"
}
```

### 2.9 Reversal

**Endpoint:** `POST /mpesa/reversal/v1/request`

**Request:**

```json
{
  "Initiator": "NeoBank_API",
  "SecurityCredential": "base64(RSA_encrypted(initiator_password))",
  "CommandID": "TransactionReversal",
  "TransactionID": "SIK3D2LO4X",
  "Amount": 1000,
  "ReceiverParty": 600992,
  "RecieverIdentifierType": 4,
  "Remarks": "Reversal - customer dispute",
  "QueueTimeOutURL": "https://api.neobank.co.ke/webhooks/mpesa/reversal/timeout",
  "ResultURL": "https://api.neobank.co.ke/webhooks/mpesa/reversal/result",
  "Occasion": "Dispute REF-20260404-001"
}
```

### 2.10 M-Pesa Error Codes

| Code | Description | Action |
|---|---|---|
| `0` | Success | Process callback data |
| `1` | Insufficient funds | Notify user, no retry |
| `1032` | Request cancelled by user | Log, no retry |
| `1037` | Timeout waiting for user | Retry with new STK Push |
| `2001` | Wrong credentials | Check API configuration |
| `17` | Internal M-Pesa error | Retry after 30s, max 3 attempts |
| `26` | System busy | Retry after 60s with backoff |
| `1001` | Unable to lock subscriber | Retry after 30s |
| `1019` | Transaction expired | Create new transaction |
| `1025` | Receiver not M-Pesa registered | Notify sender, no retry |

---

## 3. Airtel Money (Kenya + Zambia)

### 3.1 Overview

Airtel Money is used in both platforms:

- **NeoBank (Kenya):** C2B deposits and B2C withdrawals for Airtel subscribers
- **DisbursePro (Zambia):** Disbursement of funds to employees on Airtel Money ZM

### 3.2 Authentication

Airtel Money uses OAuth2 client credentials. Token validity is 1 hour.

**Base URLs:**

| Environment | URL |
|---|---|
| Sandbox (Kenya) | `https://openapiuat.airtel.africa` |
| Sandbox (Zambia) | `https://openapiuat.airtel.africa` |
| Production | `https://openapi.airtel.africa` |

**Token Request:**

```http
POST /auth/oauth2/token
Content-Type: application/json

{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials"
}
```

**Token Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

### 3.3 Collection (C2B) -- NeoBank Kenya

Used to request payment from a customer's Airtel Money wallet.

**Endpoint:** `POST /merchant/v1/payments/`

**Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
X-Country: KE
X-Currency: KES
```

**Request:**

```json
{
  "reference": "NB-DEP-20260404-001",
  "subscriber": {
    "country": "KE",
    "currency": "KES",
    "msisdn": "733123456"
  },
  "transaction": {
    "amount": 5000,
    "country": "KE",
    "currency": "KES",
    "id": "NB-DEP-20260404-001"
  }
}
```

**Response:**

```json
{
  "data": {
    "transaction": {
      "id": "NB-DEP-20260404-001",
      "status": "TS",
      "message": "Txn Successful"
    }
  },
  "status": {
    "code": "200",
    "message": "SUCCESS",
    "result_code": "ESB000010",
    "success": true
  }
}
```

### 3.4 Disbursement (B2C)

Used by both NeoBank (Kenya withdrawals) and DisbursePro (Zambia employee payouts).

**Endpoint:** `POST /standard/v1/disbursements/`

**Headers (Zambia example):**

```
Authorization: Bearer {access_token}
Content-Type: application/json
X-Country: ZM
X-Currency: ZMW
```

**Request:**

```json
{
  "payee": {
    "msisdn": "971345678",
    "wallet_type": "NORMAL"
  },
  "reference": "DSB-0101",
  "pin": "encrypted_pin_value",
  "transaction": {
    "amount": 1500,
    "id": "DSB-0101-20260404-001",
    "type": "B2C"
  }
}
```

**Response:**

```json
{
  "data": {
    "transaction": {
      "reference_id": "DSB-0101-20260404-001",
      "airtel_money_id": "CI260404.1430.L12345",
      "id": "DSB-0101-20260404-001",
      "status": "TS",
      "message": "Txn Successful"
    }
  },
  "status": {
    "code": "200",
    "message": "SUCCESS",
    "result_code": "ESB000010",
    "success": true
  }
}
```

### 3.5 Transaction Status Check

**Endpoint:** `GET /standard/v1/payments/{id}`

**Headers:**

```
Authorization: Bearer {access_token}
X-Country: ZM
X-Currency: ZMW
```

**Response:**

```json
{
  "data": {
    "transaction": {
      "airtel_money_id": "CI260404.1430.L12345",
      "id": "DSB-0101-20260404-001",
      "message": "Transaction Completed",
      "status": "TS"
    }
  },
  "status": {
    "code": "200",
    "message": "SUCCESS",
    "result_code": "ESB000010",
    "success": true
  }
}
```

### 3.6 Webhooks

Airtel Money sends status callbacks signed with HMAC-SHA256.

**Callback Payload:**

```json
{
  "transaction": {
    "id": "DSB-0101-20260404-001",
    "message": "Txn Successful",
    "status_code": "TS",
    "airtel_money_id": "CI260404.1430.L12345"
  }
}
```

**Signature Verification:**

```typescript
import crypto from "crypto";

function verifyAirtelWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In NestJS guard
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  const signature = request.headers["x-airtel-signature"];
  const body = JSON.stringify(request.body);
  return verifyAirtelWebhook(body, signature, this.config.airtelSecret);
}
```

### 3.7 Airtel Money Status Codes

| Code | Status | Description | Action |
|---|---|---|---|
| `TS` | Transaction Successful | Payment completed | Mark complete |
| `TF` | Transaction Failed | Payment failed | Mark failed, allow retry |
| `TA` | Transaction Ambiguous | Status unknown | Poll status endpoint |
| `TP` | Transaction Pending | Still processing | Wait for callback |
| `ESB000010` | Success | Request processed | -- |
| `ESB000001` | System error | Internal error | Retry after 30s |
| `ESB000008` | Insufficient balance | Subscriber has no funds | Notify, no retry |
| `ESB000011` | Invalid MSISDN | Phone number invalid | Reject, no retry |
| `ESB000014` | Debit not allowed | Subscriber restrictions | Notify, no retry |
| `ESB000033` | Account barred | Regulatory block | Reject, flag for compliance |

---

## 4. MTN MoMo (Zambia)

### 4.1 Overview

MTN Mobile Money (MoMo) is used by DisbursePro in Zambia for disbursements to MTN subscribers. MTN MoMo API follows the Open API standard with subscription key authentication.

### 4.2 Authentication

MTN MoMo uses a two-layer auth model: a **subscription key** (Ocp-Apim-Subscription-Key header) and an **OAuth2 access token** for each API product.

**Base URLs:**

| Environment | URL |
|---|---|
| Sandbox | `https://sandbox.momodeveloper.mtn.com` |
| Production | `https://proxy.momoapi.mtn.com` |

**Step 1 -- Create API User (sandbox only):**

```http
POST /v1_0/apiuser
X-Reference-Id: {uuid}
Ocp-Apim-Subscription-Key: {subscription_key}
Content-Type: application/json

{
  "providerCallbackHost": "https://api.disbursepro.com"
}
```

**Step 2 -- Get API Key (sandbox only):**

```http
POST /v1_0/apiuser/{x-reference-id}/apikey
Ocp-Apim-Subscription-Key: {subscription_key}
```

**Response:**

```json
{
  "apiKey": "f1db798c98df4bcf83b538175893bbf0"
}
```

**Step 3 -- Get Access Token:**

```http
POST /disbursement/token/
Authorization: Basic base64(api_user_id:api_key)
Ocp-Apim-Subscription-Key: {subscription_key}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "access_token",
  "expires_in": 3600
}
```

### 4.3 Disbursement (B2C)

**Endpoint:** `POST /disbursement/v1_0/transfer`

**Headers:**

```
Authorization: Bearer {access_token}
X-Reference-Id: {uuid}
X-Target-Environment: mtnzambia
Ocp-Apim-Subscription-Key: {subscription_key}
Content-Type: application/json
X-Callback-Url: https://api.disbursepro.com/webhooks/mtn
```

**Request:**

```json
{
  "amount": "1500",
  "currency": "ZMW",
  "externalId": "DSB-0102-20260404-001",
  "payee": {
    "partyIdType": "MSISDN",
    "partyId": "260962345678"
  },
  "payerMessage": "DisbursePro fuel allowance",
  "payeeNote": "Fuel allowance from Copperbelt Transport"
}
```

**Response:** `202 Accepted` (no body -- asynchronous processing)

The `X-Reference-Id` header serves as the transaction reference for status checks.

### 4.4 Disbursement Status Check

**Endpoint:** `GET /disbursement/v1_0/transfer/{x-reference-id}`

**Headers:**

```
Authorization: Bearer {access_token}
X-Target-Environment: mtnzambia
Ocp-Apim-Subscription-Key: {subscription_key}
```

**Response (success):**

```json
{
  "amount": "1500",
  "currency": "ZMW",
  "financialTransactionId": "4210526178",
  "externalId": "DSB-0102-20260404-001",
  "payee": {
    "partyIdType": "MSISDN",
    "partyId": "260962345678"
  },
  "payerMessage": "DisbursePro fuel allowance",
  "payeeNote": "Fuel allowance from Copperbelt Transport",
  "status": "SUCCESSFUL"
}
```

**Response (failed):**

```json
{
  "amount": "1500",
  "currency": "ZMW",
  "externalId": "DSB-0102-20260404-001",
  "payee": {
    "partyIdType": "MSISDN",
    "partyId": "260962345678"
  },
  "status": "FAILED",
  "reason": {
    "code": "PAYEE_NOT_FOUND",
    "message": "The payee was not found"
  }
}
```

### 4.5 Account Balance Check

**Endpoint:** `GET /disbursement/v1_0/account/balance`

**Response:**

```json
{
  "availableBalance": "250000",
  "currency": "ZMW"
}
```

### 4.6 Callbacks

MTN MoMo sends callbacks to the URL specified in `X-Callback-Url`. The callback includes an `X-Callback-Token` header for verification.

**Callback Payload:**

```json
{
  "financialTransactionId": "4210526178",
  "externalId": "DSB-0102-20260404-001",
  "amount": "1500",
  "currency": "ZMW",
  "payee": {
    "partyIdType": "MSISDN",
    "partyId": "260962345678"
  },
  "status": "SUCCESSFUL"
}
```

**Callback Verification:**

```typescript
function verifyMtnCallback(request: Request, expectedToken: string): boolean {
  const callbackToken = request.headers["x-callback-token"];
  if (!callbackToken || typeof callbackToken !== "string") return false;
  return crypto.timingSafeEqual(
    Buffer.from(callbackToken),
    Buffer.from(expectedToken)
  );
}
```

### 4.7 MTN MoMo Error Codes

| Code | Description | Action |
|---|---|---|
| `SUCCESSFUL` | Transaction completed | Mark complete |
| `FAILED` | Transaction failed | Mark failed, check reason |
| `PENDING` | Still processing | Wait for callback |
| `PAYEE_NOT_FOUND` | Invalid phone number | Reject, no retry |
| `NOT_ENOUGH_FUNDS` | Insufficient disbursement balance | Alert ops, no retry |
| `PAYER_LIMIT_REACHED` | Daily limit exceeded | Retry next day |
| `NOT_ALLOWED` | Operation not permitted | Check config, no retry |
| `INTERNAL_PROCESSING_ERROR` | MTN internal error | Retry after 60s |
| `SERVICE_UNAVAILABLE` | API down | Circuit breaker opens |

---

## 5. Zamtel Kwacha (Zambia)

### 5.1 Overview

Zamtel Kwacha is the smallest of DisbursePro's three carriers. It uses a simpler REST API with basic auth + IP whitelisting for webhook verification.

### 5.2 Authentication

Zamtel uses API key authentication via a bearer token.

**Base URLs:**

| Environment | URL |
|---|---|
| Sandbox | `https://sandbox.zamtel.co.zm/api` |
| Production | `https://api.zamtel.co.zm/api` |

**Auth Header:**

```
Authorization: Bearer {api_key}
Content-Type: application/json
```

### 5.3 Disbursement

**Endpoint:** `POST /v1/disbursements`

**Request:**

```json
{
  "reference": "DSB-0103-20260404-001",
  "amount": 1500.00,
  "currency": "ZMW",
  "recipient": {
    "msisdn": "+260953456789",
    "name": "Mutinta Moonga"
  },
  "narration": "DisbursePro fuel allowance",
  "callback_url": "https://api.disbursepro.com/webhooks/zamtel"
}
```

**Response:**

```json
{
  "status": "ACCEPTED",
  "transaction_id": "ZK-20260404-88901",
  "reference": "DSB-0103-20260404-001",
  "message": "Disbursement accepted for processing"
}
```

### 5.4 Status Check

**Endpoint:** `GET /v1/disbursements/{transaction_id}`

**Response (completed):**

```json
{
  "transaction_id": "ZK-20260404-88901",
  "reference": "DSB-0103-20260404-001",
  "status": "COMPLETED",
  "amount": 1500.00,
  "currency": "ZMW",
  "recipient_msisdn": "+260953456789",
  "completed_at": "2026-04-04T14:31:22+02:00"
}
```

**Response (failed):**

```json
{
  "transaction_id": "ZK-20260404-88901",
  "reference": "DSB-0103-20260404-001",
  "status": "FAILED",
  "error_code": "INVALID_ACCOUNT",
  "error_message": "Recipient phone number is not registered for Zamtel Kwacha"
}
```

### 5.5 Webhooks

Zamtel uses IP whitelisting + basic auth for webhook security.

**Callback Payload:**

```json
{
  "event": "disbursement.completed",
  "transaction_id": "ZK-20260404-88901",
  "reference": "DSB-0103-20260404-001",
  "status": "COMPLETED",
  "amount": 1500.00,
  "currency": "ZMW",
  "timestamp": "2026-04-04T14:31:22+02:00"
}
```

**Webhook Verification:**

```typescript
const ZAMTEL_IP_WHITELIST = [
  "197.231.221.0/24",   // Zamtel production range
  "41.63.0.0/16",       // Zamtel corporate range
];

function verifyZamtelWebhook(request: Request): boolean {
  const sourceIp = request.ip || request.headers["x-forwarded-for"];
  const isWhitelisted = ZAMTEL_IP_WHITELIST.some(cidr =>
    isIpInCidr(sourceIp, cidr)
  );

  if (!isWhitelisted) return false;

  // Also verify basic auth
  const authHeader = request.headers["authorization"];
  if (!authHeader?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString();
  const [user, pass] = decoded.split(":");
  return user === config.zamtelWebhookUser && pass === config.zamtelWebhookPassword;
}
```

### 5.6 Zamtel Error Codes

| Code | Description | Action |
|---|---|---|
| `COMPLETED` | Disbursement successful | Mark complete |
| `FAILED` | Disbursement failed | Mark failed, check error_code |
| `PENDING` | Still processing | Wait for callback |
| `INVALID_ACCOUNT` | Phone not registered for Kwacha | Reject, no retry |
| `INSUFFICIENT_BALANCE` | API account low | Alert ops |
| `DAILY_LIMIT` | Recipient daily limit exceeded | Retry next day |
| `SYSTEM_ERROR` | Internal Zamtel error | Retry after 60s |
| `TIMEOUT` | Processing timeout | Poll status endpoint |

---

## 6. Flutterwave (Aggregator)

### 6.1 Overview

Flutterwave is NeoBank's primary aggregator for card payments, bank transfers, and mobile money across Africa. It supports 150+ currencies and multiple payment methods in a single integration.

**Used For:**
- Card payments (Visa, Mastercard, AMEX) with 3DS
- Bank transfer (DVA -- Dynamic Virtual Account)
- Mobile money aggregation (fallback for M-Pesa/Airtel)
- Cross-border payments

### 6.2 Authentication

Flutterwave uses a secret key in the `Authorization` header.

**Base URLs:**

| Environment | URL |
|---|---|
| Sandbox | `https://api.flutterwave.com/v3` (use test keys) |
| Production | `https://api.flutterwave.com/v3` |

**Auth Header:**

```
Authorization: Bearer FLWSECK_TEST-xxxxxxxxxxxxx
Content-Type: application/json
```

### 6.3 Card Payment (Charge)

**Endpoint:** `POST /v3/charges?type=card`

**Request:**

```json
{
  "card_number": "4187427415564246",
  "cvv": "828",
  "expiry_month": "09",
  "expiry_year": "32",
  "currency": "KES",
  "amount": 5000,
  "fullname": "Amina Wanjiku",
  "email": "amina.wanjiku@email.com",
  "tx_ref": "NB-CARD-20260404-001",
  "redirect_url": "https://app.neobank.co.ke/payment/callback",
  "meta": {
    "consumer_id": "USR-001",
    "consumer_mac": "92a3-912ba-1192a"
  },
  "authorization": {
    "mode": "pin",
    "pin": "3310"
  }
}
```

**Response (requires 3DS):**

```json
{
  "status": "success",
  "message": "Charge authorization data required",
  "meta": {
    "authorization": {
      "mode": "redirect",
      "redirect": "https://api.flutterwave.com/v3/3ds/verify/FLW-MOCK-xxx"
    }
  }
}
```

**Response (successful charge):**

```json
{
  "status": "success",
  "message": "Charge successful",
  "data": {
    "id": 5988210,
    "tx_ref": "NB-CARD-20260404-001",
    "flw_ref": "FLW-MOCK-9e7e4a8e4c9a445ca3bd8c0d7e6ef3af",
    "device_fingerprint": "N/A",
    "amount": 5000,
    "currency": "KES",
    "charged_amount": 5000,
    "app_fee": 75,
    "merchant_fee": 0,
    "processor_response": "Approved by Financial Institution",
    "auth_model": "PIN",
    "ip": "41.75.80.245",
    "narration": "NeoBank Payment",
    "status": "successful",
    "payment_type": "card",
    "created_at": "2026-04-04T14:30:00.000Z",
    "account_id": 20937,
    "customer": {
      "id": 2161520,
      "name": "Amina Wanjiku",
      "phone_number": null,
      "email": "amina.wanjiku@email.com",
      "created_at": "2026-04-04T14:30:00.000Z"
    },
    "card": {
      "first_6digits": "418742",
      "last_4digits": "4246",
      "issuer": "GUARANTY TRUST BANK",
      "country": "KE",
      "type": "VISA",
      "token": "flw-t1nf-cee831f33f83413c99...",
      "expiry": "09/32"
    }
  }
}
```

### 6.4 Mobile Money (Flutterwave-aggregated)

**Endpoint:** `POST /v3/charges?type=mpesa`

**Request:**

```json
{
  "tx_ref": "NB-MM-20260404-001",
  "amount": 1500,
  "currency": "KES",
  "email": "amina.wanjiku@email.com",
  "phone_number": "0712345678",
  "fullname": "Amina Wanjiku"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Charge initiated",
  "data": {
    "id": 5988211,
    "tx_ref": "NB-MM-20260404-001",
    "flw_ref": "FLW-MOCK-mpesa-xxx",
    "amount": 1500,
    "currency": "KES",
    "status": "pending",
    "payment_type": "mpesa"
  }
}
```

### 6.5 Bank Transfer (DVA)

**Endpoint:** `POST /v3/charges?type=bank_transfer`

**Request:**

```json
{
  "tx_ref": "NB-BT-20260404-001",
  "amount": 50000,
  "currency": "KES",
  "email": "amina.wanjiku@email.com",
  "is_permanent": false,
  "narration": "NeoBank Deposit"
}
```

### 6.6 Transfer (Payout)

Used for NeoBank merchant settlements and B2C payouts.

**Endpoint:** `POST /v3/transfers`

**Request:**

```json
{
  "account_bank": "MPS",
  "account_number": "0712345678",
  "amount": 47250,
  "narration": "Settlement - Mama Njeri Kitchen",
  "currency": "KES",
  "reference": "NB-SETTLE-20260404-001",
  "callback_url": "https://api.neobank.co.ke/webhooks/flutterwave/transfer",
  "debit_currency": "KES",
  "meta": [
    { "sender": "NeoBank Settlements" },
    { "merchant_id": "MERCH-001" }
  ]
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Transfer Queued Successfully",
  "data": {
    "id": 396420,
    "account_number": "0712345678",
    "bank_code": "MPS",
    "full_name": "Mama Njeri",
    "created_at": "2026-04-04T14:30:00.000Z",
    "currency": "KES",
    "debit_currency": "KES",
    "amount": 47250,
    "fee": 45,
    "status": "NEW",
    "reference": "NB-SETTLE-20260404-001",
    "narration": "Settlement - Mama Njeri Kitchen",
    "complete_message": "",
    "requires_approval": 0,
    "is_approved": 1
  }
}
```

### 6.7 Webhook Verification

Flutterwave signs webhooks with a secret hash.

```typescript
function verifyFlutterwaveWebhook(
  request: Request,
  secretHash: string
): boolean {
  const signature = request.headers["verif-hash"];
  if (!signature) return false;
  return signature === secretHash;
}
```

**Webhook Payload (payment completed):**

```json
{
  "event": "charge.completed",
  "data": {
    "id": 5988210,
    "tx_ref": "NB-CARD-20260404-001",
    "flw_ref": "FLW-MOCK-9e7e4a8e4c9a445ca3bd8c0d7e6ef3af",
    "amount": 5000,
    "currency": "KES",
    "charged_amount": 5000,
    "status": "successful",
    "payment_type": "card",
    "customer": {
      "email": "amina.wanjiku@email.com",
      "name": "Amina Wanjiku"
    }
  }
}
```

### 6.8 Flutterwave Error Codes

| Status | Description | Action |
|---|---|---|
| `successful` | Payment completed | Mark complete |
| `failed` | Payment failed | Check processor_response |
| `pending` | Still processing | Wait for webhook |
| `error` | API error | Retry or check payload |
| Processor: `DECLINED` | Card declined | Notify user |
| Processor: `INSUFFICIENT FUNDS` | Card insufficient funds | Notify user |
| Processor: `DO NOT HONOR` | Issuer refused | Try different card |

---

## 7. Paystack (Aggregator)

### 7.1 Overview

Paystack is NeoBank's secondary aggregator, providing card payments, bank transfers, and dedicated virtual accounts (DVA). Primary market: Kenya.

### 7.2 Authentication

Paystack uses a secret key in the `Authorization` header.

**Base URL:** `https://api.paystack.co`

**Auth Header:**

```
Authorization: Bearer sk_test_xxxxxxxxxxxxx
Content-Type: application/json
```

### 7.3 Initialize Transaction

**Endpoint:** `POST /transaction/initialize`

**Request:**

```json
{
  "email": "amina.wanjiku@email.com",
  "amount": 500000,
  "currency": "KES",
  "reference": "NB-PAY-20260404-001",
  "callback_url": "https://app.neobank.co.ke/payment/callback",
  "metadata": {
    "custom_fields": [
      {
        "display_name": "Account",
        "variable_name": "account_id",
        "value": "NB-254-10001234"
      }
    ]
  },
  "channels": ["card", "bank_transfer", "mobile_money"]
}
```

**NOTE:** Paystack amounts are in the smallest currency unit (cents). KES 5,000 = 500000.

**Response:**

```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxx",
    "access_code": "xxx",
    "reference": "NB-PAY-20260404-001"
  }
}
```

### 7.4 Charge Card Directly

**Endpoint:** `POST /charge`

**Request:**

```json
{
  "email": "amina.wanjiku@email.com",
  "amount": 500000,
  "currency": "KES",
  "reference": "NB-PAY-20260404-002",
  "authorization_code": "AUTH_xxx",
  "metadata": {
    "account_id": "NB-254-10001234"
  }
}
```

### 7.5 Verify Transaction

**Endpoint:** `GET /transaction/verify/{reference}`

**Response:**

```json
{
  "status": true,
  "message": "Verification successful",
  "data": {
    "id": 3248170542,
    "domain": "test",
    "status": "success",
    "reference": "NB-PAY-20260404-001",
    "amount": 500000,
    "currency": "KES",
    "channel": "card",
    "ip_address": "41.75.80.245",
    "fees": 7500,
    "authorization": {
      "authorization_code": "AUTH_xxx",
      "bin": "418742",
      "last4": "4246",
      "exp_month": "09",
      "exp_year": "2032",
      "channel": "card",
      "card_type": "visa",
      "bank": "Equity Bank",
      "country_code": "KE",
      "brand": "visa",
      "reusable": true,
      "signature": "SIG_xxx"
    },
    "customer": {
      "email": "amina.wanjiku@email.com",
      "customer_code": "CUS_xxx"
    },
    "paid_at": "2026-04-04T14:30:00.000Z"
  }
}
```

### 7.6 Transfer (Payout)

**Create Transfer Recipient:**

```http
POST /transferrecipient
Authorization: Bearer sk_test_xxx

{
  "type": "mobile_money",
  "name": "Amina Wanjiku",
  "account_number": "0712345678",
  "bank_code": "MPESA",
  "currency": "KES"
}
```

**Initiate Transfer:**

```http
POST /transfer
Authorization: Bearer sk_test_xxx

{
  "source": "balance",
  "amount": 4725000,
  "recipient": "RCP_xxx",
  "reason": "NeoBank settlement",
  "reference": "NB-SETTLE-20260404-002",
  "currency": "KES"
}
```

**Response:**

```json
{
  "status": true,
  "message": "Transfer has been queued",
  "data": {
    "reference": "NB-SETTLE-20260404-002",
    "integration": 100073,
    "domain": "test",
    "amount": 4725000,
    "currency": "KES",
    "source": "balance",
    "reason": "NeoBank settlement",
    "recipient": "RCP_xxx",
    "status": "pending",
    "transfer_code": "TRF_xxx",
    "id": 37272792
  }
}
```

### 7.7 Webhook Verification

Paystack signs webhooks using HMAC-SHA512.

```typescript
import crypto from "crypto";

function verifyPaystackWebhook(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

// Usage in middleware
function paystackWebhookMiddleware(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["x-paystack-signature"] as string;
  const rawBody = JSON.stringify(req.body);

  if (!verifyPaystackWebhook(rawBody, signature, process.env.PAYSTACK_SECRET_KEY!)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
}
```

**Webhook Event Types:**

| Event | Description |
|---|---|
| `charge.success` | Payment completed |
| `transfer.success` | Payout completed |
| `transfer.failed` | Payout failed |
| `transfer.reversed` | Payout reversed |
| `refund.processed` | Refund completed |
| `charge.dispute.create` | Chargeback opened |
| `charge.dispute.remind` | Chargeback reminder |
| `charge.dispute.resolve` | Chargeback resolved |

---

## 8. Common Patterns

### 8.1 TypeScript Payment Adapter Interface

Both NeoBank and DisbursePro implement a common adapter interface for all payment providers.

```typescript
// ====================================================================
// Core Types
// ====================================================================

type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REVERSED";
type PaymentDirection = "INBOUND" | "OUTBOUND";

interface Money {
  amount: number;
  currency: "KES" | "ZMW" | "USD";
}

interface PaymentRecipient {
  msisdn: string;
  name?: string;
  accountNumber?: string;
}

interface PaymentRequest {
  referenceId: string;         // Idempotency reference (UUID v4)
  amount: Money;
  recipient: PaymentRecipient;
  narration: string;
  metadata?: Record<string, string>;
  callbackUrl: string;
}

interface PaymentResult {
  providerTransactionId: string;
  referenceId: string;
  status: PaymentStatus;
  amount: Money;
  providerFee?: Money;
  providerName: string;
  rawResponse: unknown;        // Full provider response for audit
  completedAt?: string;        // ISO 8601
}

interface PaymentStatusResult {
  referenceId: string;
  providerTransactionId: string;
  status: PaymentStatus;
  failureReason?: string;
  rawResponse: unknown;
}

// ====================================================================
// Adapter Interface
// ====================================================================

interface PaymentProviderAdapter {
  /** Unique identifier for this provider */
  readonly name: string;

  /** Country codes this adapter supports */
  readonly supportedCountries: string[];

  /** Currency codes this adapter supports */
  readonly supportedCurrencies: string[];

  /** Initialize / authenticate the adapter */
  initialize(): Promise<void>;

  /** Send money to a mobile money wallet or bank account */
  disburse(request: PaymentRequest): Promise<PaymentResult>;

  /** Request payment from a customer (STK Push / USSD prompt) */
  collect(request: PaymentRequest): Promise<PaymentResult>;

  /** Check the current status of a transaction */
  checkStatus(referenceId: string): Promise<PaymentStatusResult>;

  /** Verify a webhook payload and parse the event */
  verifyWebhook(headers: Record<string, string>, body: string): boolean;

  /** Parse a verified webhook body into a standard result */
  parseWebhook(body: string): PaymentResult;

  /** Check provider health / connectivity */
  healthCheck(): Promise<{ healthy: boolean; latencyMs: number }>;
}
```

**Example Adapter Implementation (Airtel Money):**

```typescript
class AirtelMoneyAdapter implements PaymentProviderAdapter {
  readonly name = "AIRTEL_MONEY";
  readonly supportedCountries = ["KE", "ZM", "UG", "TZ", "RW"];
  readonly supportedCurrencies = ["KES", "ZMW", "UGX", "TZS", "RWF"];

  private auth: AirtelAuth;
  private baseUrl: string;
  private country: string;
  private currency: string;

  constructor(config: AirtelConfig) {
    this.baseUrl = config.baseUrl;
    this.country = config.country;
    this.currency = config.currency;
    this.auth = new AirtelAuth(config);
  }

  async initialize(): Promise<void> {
    await this.auth.getAccessToken(); // Warm the token cache
  }

  async disburse(request: PaymentRequest): Promise<PaymentResult> {
    const token = await this.auth.getAccessToken();
    const response = await fetch(`${this.baseUrl}/standard/v1/disbursements/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Country": this.country,
        "X-Currency": this.currency,
      },
      body: JSON.stringify({
        payee: { msisdn: request.recipient.msisdn, wallet_type: "NORMAL" },
        reference: request.referenceId,
        transaction: {
          amount: request.amount.amount,
          id: request.referenceId,
          type: "B2C",
        },
      }),
    });

    const data = await response.json();
    return {
      providerTransactionId: data.data?.transaction?.airtel_money_id ?? "",
      referenceId: request.referenceId,
      status: this.mapStatus(data.data?.transaction?.status),
      amount: request.amount,
      providerName: this.name,
      rawResponse: data,
    };
  }

  async collect(request: PaymentRequest): Promise<PaymentResult> {
    const token = await this.auth.getAccessToken();
    const response = await fetch(`${this.baseUrl}/merchant/v1/payments/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Country": this.country,
        "X-Currency": this.currency,
      },
      body: JSON.stringify({
        reference: request.referenceId,
        subscriber: {
          country: this.country,
          currency: this.currency,
          msisdn: request.recipient.msisdn,
        },
        transaction: {
          amount: request.amount.amount,
          country: this.country,
          currency: this.currency,
          id: request.referenceId,
        },
      }),
    });

    const data = await response.json();
    return {
      providerTransactionId: data.data?.transaction?.id ?? "",
      referenceId: request.referenceId,
      status: this.mapStatus(data.data?.transaction?.status),
      amount: request.amount,
      providerName: this.name,
      rawResponse: data,
    };
  }

  async checkStatus(referenceId: string): Promise<PaymentStatusResult> {
    const token = await this.auth.getAccessToken();
    const response = await fetch(
      `${this.baseUrl}/standard/v1/payments/${referenceId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Country": this.country,
          "X-Currency": this.currency,
        },
      }
    );

    const data = await response.json();
    return {
      referenceId,
      providerTransactionId: data.data?.transaction?.airtel_money_id ?? "",
      status: this.mapStatus(data.data?.transaction?.status),
      rawResponse: data,
    };
  }

  verifyWebhook(headers: Record<string, string>, body: string): boolean {
    const signature = headers["x-airtel-signature"];
    if (!signature) return false;
    const expected = crypto.createHmac("sha256", this.auth.webhookSecret)
      .update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  parseWebhook(body: string): PaymentResult {
    const data = JSON.parse(body);
    return {
      providerTransactionId: data.transaction?.airtel_money_id ?? "",
      referenceId: data.transaction?.id ?? "",
      status: this.mapStatus(data.transaction?.status_code),
      amount: { amount: 0, currency: this.currency as Money["currency"] },
      providerName: this.name,
      rawResponse: data,
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.auth.getAccessToken();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  private mapStatus(providerStatus?: string): PaymentStatus {
    switch (providerStatus) {
      case "TS": return "COMPLETED";
      case "TF": return "FAILED";
      case "TP": return "PROCESSING";
      case "TA": return "PENDING";
      default:   return "PENDING";
    }
  }
}
```

### 8.2 Idempotency

All payment operations must be idempotent. Both platforms use the `X-Idempotency-Key` header (UUID v4).

**Implementation:**

```typescript
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers["x-idempotency-key"];

    if (!key) {
      throw new BadRequestException("X-Idempotency-Key header required");
    }

    // Key scoped to user to prevent cross-user collisions
    const cacheKey = `idem:${request.user.id}:${key}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      // Return the same response as the original request
      const parsed = JSON.parse(cached);
      // Verify the payload matches (prevent key reuse with different data)
      const currentHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(request.body))
        .digest("hex");
      if (parsed._payloadHash !== currentHash) {
        throw new ConflictException(
          "Idempotency key already used with different payload"
        );
      }
      return of(parsed.response);
    }

    return next.handle().pipe(
      tap(async (response) => {
        const payloadHash = crypto
          .createHash("sha256")
          .update(JSON.stringify(request.body))
          .digest("hex");
        await this.redis.set(
          cacheKey,
          JSON.stringify({ response, _payloadHash: payloadHash }),
          "EX",
          86400 // 24h TTL
        );
      })
    );
  }
}
```

### 8.3 Retry with Exponential Backoff

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableErrors: [
    "ETIMEDOUT",
    "ECONNRESET",
    "SERVICE_UNAVAILABLE",
    "INTERNAL_PROCESSING_ERROR",
    "SYSTEM_ERROR",
  ],
};

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      const isRetryable = config.retryableErrors.some(
        (code) => lastError!.message.includes(code)
      );

      if (!isRetryable || attempt === config.maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        config.baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        config.maxDelayMs
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### 8.4 Circuit Breaker

```typescript
import { CircuitBreaker, ConsecutiveBreaker, ExponentialBackoff } from "cockatiel";

// DisbursePro uses cockatiel for circuit breakers
function createCarrierCircuitBreaker(carrierName: string): CircuitBreaker {
  return new CircuitBreaker({
    halfOpenAfter: 30_000,               // 30s before half-open probe
    breaker: new ConsecutiveBreaker(3),   // Open after 3 consecutive failures
  });
}

// Usage
const airtelBreaker = createCarrierCircuitBreaker("airtel_money");

async function disburseThroughAirtel(request: PaymentRequest): Promise<PaymentResult> {
  return airtelBreaker.execute(async () => {
    return airtelAdapter.disburse(request);
  });
}
```

**NeoBank (Java/Spring Boot) uses Resilience4j:**

```java
@CircuitBreaker(name = "mpesa", fallbackMethod = "mpesaFallback")
@Retry(name = "mpesa", fallbackMethod = "mpesaFallback")
@TimeLimiter(name = "mpesa")
public CompletableFuture<PaymentResult> processMpesaPayment(PaymentRequest request) {
    return CompletableFuture.supplyAsync(() ->
        mpesaAdapter.process(request)
    );
}

public CompletableFuture<PaymentResult> mpesaFallback(PaymentRequest request, Throwable t) {
    // Try IntaSend as fallback
    return CompletableFuture.supplyAsync(() ->
        intaSendAdapter.process(request)
    );
}
```

### 8.5 Reconciliation

Daily reconciliation ensures that the platform's records match the provider's records.

```typescript
interface ReconciliationResult {
  date: string;
  provider: string;
  platformCount: number;
  providerCount: number;
  matched: number;
  mismatched: number;
  missingOnPlatform: string[];   // Provider has it, we don't
  missingOnProvider: string[];   // We have it, provider doesn't
  amountDiscrepancies: Array<{
    referenceId: string;
    platformAmount: number;
    providerAmount: number;
  }>;
}

async function reconcileDay(
  date: string,
  provider: PaymentProviderAdapter
): Promise<ReconciliationResult> {
  // 1. Fetch all platform transactions for this provider on this date
  const platformTxns = await db.query(
    `SELECT reference_id, amount, status, provider_ref
     FROM transactions
     WHERE provider = $1 AND DATE(created_at) = $2`,
    [provider.name, date]
  );

  // 2. Fetch settlement report from provider (provider-specific API)
  const providerTxns = await provider.getSettlementReport(date);

  // 3. Match by reference ID
  const platformMap = new Map(platformTxns.map(t => [t.reference_id, t]));
  const providerMap = new Map(providerTxns.map(t => [t.reference, t]));

  const result: ReconciliationResult = {
    date,
    provider: provider.name,
    platformCount: platformTxns.length,
    providerCount: providerTxns.length,
    matched: 0,
    mismatched: 0,
    missingOnPlatform: [],
    missingOnProvider: [],
    amountDiscrepancies: [],
  };

  for (const [refId, pTxn] of platformMap) {
    const provTxn = providerMap.get(refId);
    if (!provTxn) {
      result.missingOnProvider.push(refId);
      result.mismatched++;
    } else if (Math.abs(pTxn.amount - provTxn.amount) > 0.01) {
      result.amountDiscrepancies.push({
        referenceId: refId,
        platformAmount: pTxn.amount,
        providerAmount: provTxn.amount,
      });
      result.mismatched++;
    } else {
      result.matched++;
    }
  }

  for (const [refId] of providerMap) {
    if (!platformMap.has(refId)) {
      result.missingOnPlatform.push(refId);
      result.mismatched++;
    }
  }

  return result;
}
```

### 8.6 Webhook Signature Verification Summary

| Provider | Method | Header | Algorithm |
|---|---|---|---|
| M-Pesa (Daraja) | IP whitelist | Source IP | Safaricom IP ranges |
| Airtel Money | HMAC signature | `X-Airtel-Signature` | HMAC-SHA256 |
| MTN MoMo | API key | `X-Callback-Token` | String comparison |
| Zamtel Kwacha | IP whitelist + basic auth | `Authorization` + Source IP | Basic Auth + CIDR check |
| Flutterwave | Secret hash | `verif-hash` | String comparison |
| Paystack | HMAC signature | `x-paystack-signature` | HMAC-SHA512 |

---

## 9. Fee Calculation

### 9.1 NeoBank Fee Structure (Kenya)

NeoBank charges fees on external payments (not internal P2P). Fees are absorbed into the transaction or charged separately depending on the payment type.

| Payment Type | Fee Model | Fee |
|---|---|---|
| Internal P2P | Free | KES 0 |
| M-Pesa Deposit (STK Push) | Percentage | 0% (Safaricom charges user) |
| M-Pesa Withdrawal (B2C) | Tiered flat fee | KES 15 - 300 (by amount) |
| Card Payment (Flutterwave) | Percentage + cap | 1.5% (cap KES 2,000) |
| Card Payment (Paystack) | Percentage + cap | 1.5% + KES 100 (cap KES 2,000) |
| Bank Transfer | Flat | KES 50 |
| Merchant MDR | Percentage | 0.5% (QR), 1.5% (Card) |

**NeoBank M-Pesa B2C Fee Tiers:**

| Amount Range (KES) | Fee (KES) |
|---|---|
| 1 - 100 | 15 |
| 101 - 500 | 25 |
| 501 - 1,000 | 30 |
| 1,001 - 5,000 | 55 |
| 5,001 - 10,000 | 75 |
| 10,001 - 35,000 | 100 |
| 35,001 - 50,000 | 150 |
| 50,001 - 150,000 | 300 |

**NeoBank Fee Calculation (TypeScript):**

```typescript
interface NeoBankFeeConfig {
  mpesaB2cTiers: Array<{ maxAmount: number; fee: number }>;
  cardFeeRate: number;
  cardFeeCap: number;
  bankTransferFee: number;
  merchantMdrQr: number;
  merchantMdrCard: number;
}

const NEOBANK_FEES: NeoBankFeeConfig = {
  mpesaB2cTiers: [
    { maxAmount: 100, fee: 15 },
    { maxAmount: 500, fee: 25 },
    { maxAmount: 1000, fee: 30 },
    { maxAmount: 5000, fee: 55 },
    { maxAmount: 10000, fee: 75 },
    { maxAmount: 35000, fee: 100 },
    { maxAmount: 50000, fee: 150 },
    { maxAmount: 150000, fee: 300 },
  ],
  cardFeeRate: 0.015,       // 1.5%
  cardFeeCap: 2000,         // KES 2,000 max fee
  bankTransferFee: 50,      // KES 50 flat
  merchantMdrQr: 0.005,     // 0.5%
  merchantMdrCard: 0.015,   // 1.5%
};

function calculateNeoBankFee(
  amount: number,
  paymentType: "MPESA_B2C" | "CARD" | "BANK_TRANSFER" | "MERCHANT_QR" | "MERCHANT_CARD"
): number {
  switch (paymentType) {
    case "MPESA_B2C": {
      const tier = NEOBANK_FEES.mpesaB2cTiers.find(t => amount <= t.maxAmount);
      return tier?.fee ?? 300; // Default to highest tier
    }
    case "CARD":
      return Math.min(amount * NEOBANK_FEES.cardFeeRate, NEOBANK_FEES.cardFeeCap);
    case "BANK_TRANSFER":
      return NEOBANK_FEES.bankTransferFee;
    case "MERCHANT_QR":
      return amount * NEOBANK_FEES.merchantMdrQr;
    case "MERCHANT_CARD":
      return amount * NEOBANK_FEES.merchantMdrCard;
  }
}
```

### 9.2 DisbursePro Fee Structure (Zambia)

DisbursePro charges three types of fees on every disbursement:

1. **Carrier Fee** -- Charged by the mobile money provider (Airtel/MTN/Zamtel)
2. **Platform Fee** -- DisbursePro's revenue
3. **Levy** -- Government/regulatory levy (currently 0%, placeholder)

**Fee Rates:**

| Fee Type | Withdrawal | Purchase |
|---|---|---|
| Carrier Fee (all carriers) | 2.5% | 0.5% |
| Platform Fee | 1.0% (min ZMW 2.00) | 1.0% (min ZMW 2.00) |
| Levy | 0% | 0% |

**Transaction Limits:**

| Limit Type | Amount (ZMW) |
|---|---|
| Per transaction (network) | 10,000 |
| Per transaction (platform) | 5,000 |
| Daily per employee | 8,000 |
| Daily per company | 500,000 |

**DisbursePro Fee Calculation (from `fee-config.ts`):**

```typescript
import type { MobileMoneyCarrier, DisbursementIntent, FeeBreakdown } from "./types";

// Carrier fee rates
const carrierRates: Record<MobileMoneyCarrier, Record<DisbursementIntent, number>> = {
  airtel_money: {
    withdrawal: 0.025, // 2.5%
    purchase: 0.005,   // 0.5%
  },
  mtn_momo: {
    withdrawal: 0.025, // 2.5%
    purchase: 0.005,   // 0.5%
  },
  zamtel_kwacha: {
    withdrawal: 0.025, // 2.5%
    purchase: 0.005,   // 0.5%
  },
};

// Platform fee: 1% with minimum ZMW 2
const PLATFORM_FEE_RATE = 0.01;
const PLATFORM_FEE_MIN = 2;

// Levy: 0% (placeholder for future regulatory levy)
const LEVY_RATE = 0;

// Network limits per carrier
const networkLimits: Record<MobileMoneyCarrier, number> = {
  airtel_money: 10_000,
  mtn_momo: 10_000,
  zamtel_kwacha: 10_000,
};

// Platform-wide limits
const platformLimits = {
  perTransaction: 5_000,
  dailyPerEmployee: 8_000,
  dailyPerCompany: 500_000,
};

function calculateFees(
  netAmount: number,
  carrier: MobileMoneyCarrier,
  intent: DisbursementIntent
): FeeBreakdown {
  const carrierFee = netAmount * carrierRates[carrier][intent];
  const platformFee = Math.max(netAmount * PLATFORM_FEE_RATE, PLATFORM_FEE_MIN);
  const levy = netAmount * LEVY_RATE;
  const grossAmount = netAmount + carrierFee + platformFee + levy;

  return {
    netAmount,
    carrierFee: Math.round(carrierFee * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    levy: Math.round(levy * 100) / 100,
    grossAmount: Math.round(grossAmount * 100) / 100,
  };
}
```

**Fee Calculation Example:**

```
Employee: Bwalya Mulenga
Carrier: Airtel Money ZM
Intent: withdrawal
Net Amount: ZMW 1,500.00

Carrier Fee: 1,500 * 2.5%   = ZMW  37.50
Platform Fee: 1,500 * 1.0%  = ZMW  15.00  (> min ZMW 2.00)
Levy: 1,500 * 0%            = ZMW   0.00
                               ──────────
Gross Amount:                = ZMW 1,552.50
```

**Small Amount Example (platform fee minimum kicks in):**

```
Net Amount: ZMW 100.00

Carrier Fee: 100 * 2.5%     = ZMW   2.50
Platform Fee: max(100 * 1%, 2) = ZMW 2.00  (minimum applied)
Levy: 0%                    = ZMW   0.00
                               ──────────
Gross Amount:                = ZMW 104.50
```

### 9.3 Amount Validation

```typescript
function validateDisbursementAmount(
  netAmount: number,
  carrier: MobileMoneyCarrier
): { valid: boolean; error?: string } {
  if (netAmount <= 0) {
    return { valid: false, error: "Amount must be greater than zero" };
  }

  if (netAmount > networkLimits[carrier]) {
    return {
      valid: false,
      error: `Exceeds network limit of ZMW ${networkLimits[carrier].toLocaleString()} per transaction`,
    };
  }

  if (netAmount > platformLimits.perTransaction) {
    return {
      valid: false,
      error: `Exceeds platform limit of ZMW ${platformLimits.perTransaction.toLocaleString()} per transaction`,
    };
  }

  return { valid: true };
}
```

### 9.4 FeeBreakdown Type

```typescript
interface FeeBreakdown {
  netAmount: number;       // Amount the recipient receives
  carrierFee: number;      // Fee charged by the mobile money operator
  platformFee: number;     // Fee charged by DisbursePro
  levy: number;            // Regulatory levy
  grossAmount: number;     // Total deducted from company wallet
}
```

---

## 10. Testing & Sandbox

### 10.1 Per-Provider Sandbox Configuration

| Provider | Sandbox URL | Credentials Location | Notes |
|---|---|---|---|
| **M-Pesa Daraja** | `https://sandbox.safaricom.co.ke` | [Daraja Portal](https://developer.safaricom.co.ke) | Free sandbox account |
| **Airtel Money** | `https://openapiuat.airtel.africa` | Airtel Developer Portal | Request UAT credentials |
| **MTN MoMo** | `https://sandbox.momodeveloper.mtn.com` | [MTN Developer Portal](https://momodeveloper.mtn.com) | Free sandbox with API user creation |
| **Zamtel Kwacha** | `https://sandbox.zamtel.co.zm/api` | Direct from Zamtel partnership | Requires NDA + test credentials |
| **Flutterwave** | `https://api.flutterwave.com/v3` (test keys) | [Flutterwave Dashboard](https://dashboard.flutterwave.com) | Use `FLWSECK_TEST-*` secret key |
| **Paystack** | `https://api.paystack.co` (test keys) | [Paystack Dashboard](https://dashboard.paystack.co) | Use `sk_test_*` secret key |

### 10.2 M-Pesa Daraja Sandbox Credentials

```
Consumer Key:     (from Daraja developer portal -- create app)
Consumer Secret:  (from Daraja developer portal -- create app)
Shortcode:        174379 (Lipa Na M-Pesa sandbox)
Passkey:          bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
Initiator Name:   testapi
Initiator Password: Safaricom999!*!
Test Phone:       254708374149
```

### 10.3 MTN MoMo Sandbox Setup

```bash
# Step 1: Create API user
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser \
  -H "X-Reference-Id: $(uuidgen)" \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY" \
  -H "Content-Type: application/json" \
  -d '{"providerCallbackHost": "https://your-callback-host.com"}'

# Step 2: Get API key
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/{x-reference-id}/apikey \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY"

# Step 3: Test token
curl -X POST https://sandbox.momodeveloper.mtn.com/disbursement/token/ \
  -H "Authorization: Basic $(echo -n 'api_user:api_key' | base64)" \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY"
```

**MTN Sandbox Test Numbers:**

| Phone | Behaviour |
|---|---|
| `46733123450` | Success (SUCCESSFUL) |
| `46733123451` | Failed (FAILED) |
| `46733123452` | Pending (PENDING) |
| `46733123453` | Timeout |

### 10.4 Flutterwave Test Cards

| Card Number | Behaviour | PIN | OTP | Expiry | CVV |
|---|---|---|---|---|---|
| `4187427415564246` | Successful payment | 3310 | 12345 | 09/32 | 828 |
| `5531886652142950` | Successful payment (MC) | 3310 | 12345 | 09/32 | 564 |
| `4187427415564246` | Insufficient funds (3DS) | -- | -- | 09/32 | 828 |
| `5399838383838381` | Declined | 3310 | 12345 | 10/31 | 470 |

### 10.5 Paystack Test Cards

| Card Number | Behaviour | Expiry | CVV |
|---|---|---|---|
| `4084084084084081` | Successful payment | Any future | Any 3 |
| `4084084084084081` | PIN authentication | Any future | Any 3 |
| `5060666666666666666` | Declined | Any future | Any 3 |
| `4000000000000002` | Address verification | Any future | Any 3 |

**Paystack Test Bank Accounts (Nigeria -- for transfer testing):**

| Bank | Account Number | Account Name |
|---|---|---|
| Zenith Bank | `0000000000` | Test Account |

### 10.6 Mock Provider for Local Development

For local development and automated testing, both platforms use a mock provider that simulates carrier behavior without making real API calls.

```typescript
class MockPaymentProvider implements PaymentProviderAdapter {
  readonly name = "MOCK";
  readonly supportedCountries = ["KE", "ZM"];
  readonly supportedCurrencies = ["KES", "ZMW"];

  private transactions = new Map<string, PaymentResult>();
  private simulatedLatencyMs = 200;
  private failureRate = 0;        // Set to 0.1 for 10% failure rate
  private pendingRate = 0.1;      // 10% of transactions start as pending

  async initialize(): Promise<void> {
    // No-op for mock
  }

  async disburse(request: PaymentRequest): Promise<PaymentResult> {
    await this.simulateLatency();

    if (this.shouldFail()) {
      const result: PaymentResult = {
        providerTransactionId: `MOCK-FAIL-${Date.now()}`,
        referenceId: request.referenceId,
        status: "FAILED",
        amount: request.amount,
        providerName: this.name,
        rawResponse: { error: "Simulated failure" },
      };
      this.transactions.set(request.referenceId, result);
      return result;
    }

    const isPending = Math.random() < this.pendingRate;
    const result: PaymentResult = {
      providerTransactionId: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      referenceId: request.referenceId,
      status: isPending ? "PENDING" : "COMPLETED",
      amount: request.amount,
      providerName: this.name,
      rawResponse: { mock: true },
      completedAt: isPending ? undefined : new Date().toISOString(),
    };
    this.transactions.set(request.referenceId, result);

    // If pending, auto-complete after 5 seconds (simulates callback)
    if (isPending) {
      setTimeout(() => {
        const txn = this.transactions.get(request.referenceId);
        if (txn) {
          txn.status = "COMPLETED";
          txn.completedAt = new Date().toISOString();
        }
      }, 5000);
    }

    return result;
  }

  async collect(request: PaymentRequest): Promise<PaymentResult> {
    // Same logic as disburse for mock purposes
    return this.disburse(request);
  }

  async checkStatus(referenceId: string): Promise<PaymentStatusResult> {
    await this.simulateLatency();
    const txn = this.transactions.get(referenceId);
    if (!txn) {
      return {
        referenceId,
        providerTransactionId: "",
        status: "FAILED",
        failureReason: "Transaction not found",
        rawResponse: {},
      };
    }
    return {
      referenceId,
      providerTransactionId: txn.providerTransactionId,
      status: txn.status,
      rawResponse: txn.rawResponse,
    };
  }

  verifyWebhook(_headers: Record<string, string>, _body: string): boolean {
    return true; // Always valid in mock mode
  }

  parseWebhook(body: string): PaymentResult {
    return JSON.parse(body);
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    return { healthy: true, latencyMs: 1 };
  }

  // ---- Test helpers ----

  setFailureRate(rate: number): void {
    this.failureRate = rate;
  }

  setLatency(ms: number): void {
    this.simulatedLatencyMs = ms;
  }

  getTransaction(referenceId: string): PaymentResult | undefined {
    return this.transactions.get(referenceId);
  }

  reset(): void {
    this.transactions.clear();
    this.failureRate = 0;
    this.pendingRate = 0.1;
    this.simulatedLatencyMs = 200;
  }

  private async simulateLatency(): Promise<void> {
    await new Promise((r) => setTimeout(r, this.simulatedLatencyMs));
  }

  private shouldFail(): boolean {
    return Math.random() < this.failureRate;
  }
}
```

### 10.7 Environment Configuration

```typescript
// config/payment-providers.ts

interface PaymentProviderConfig {
  provider: string;
  baseUrl: string;
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    subscriptionKey?: string;
    secretHash?: string;
    webhookSecret?: string;
  };
  country: string;
  currency: string;
  callbackBaseUrl: string;
  enabled: boolean;
}

function getProviderConfig(env: "development" | "staging" | "production"): PaymentProviderConfig[] {
  if (env === "development") {
    return [
      {
        provider: "MOCK",
        baseUrl: "http://localhost:3001/mock",
        credentials: {},
        country: "KE",
        currency: "KES",
        callbackBaseUrl: "http://localhost:3000",
        enabled: true,
      },
    ];
  }

  if (env === "staging") {
    return [
      {
        provider: "DARAJA",
        baseUrl: "https://sandbox.safaricom.co.ke",
        credentials: {
          clientId: process.env.MPESA_CONSUMER_KEY!,
          clientSecret: process.env.MPESA_CONSUMER_SECRET!,
        },
        country: "KE",
        currency: "KES",
        callbackBaseUrl: "https://staging-api.neobank.co.ke",
        enabled: true,
      },
      {
        provider: "AIRTEL_MONEY",
        baseUrl: "https://openapiuat.airtel.africa",
        credentials: {
          clientId: process.env.AIRTEL_CLIENT_ID!,
          clientSecret: process.env.AIRTEL_CLIENT_SECRET!,
          webhookSecret: process.env.AIRTEL_WEBHOOK_SECRET!,
        },
        country: "KE",
        currency: "KES",
        callbackBaseUrl: "https://staging-api.neobank.co.ke",
        enabled: true,
      },
      {
        provider: "FLUTTERWAVE",
        baseUrl: "https://api.flutterwave.com/v3",
        credentials: {
          apiKey: process.env.FLW_SECRET_KEY!,         // FLWSECK_TEST-xxx
          secretHash: process.env.FLW_SECRET_HASH!,
        },
        country: "KE",
        currency: "KES",
        callbackBaseUrl: "https://staging-api.neobank.co.ke",
        enabled: true,
      },
      {
        provider: "PAYSTACK",
        baseUrl: "https://api.paystack.co",
        credentials: {
          apiKey: process.env.PAYSTACK_SECRET_KEY!,    // sk_test_xxx
        },
        country: "KE",
        currency: "KES",
        callbackBaseUrl: "https://staging-api.neobank.co.ke",
        enabled: true,
      },
    ];
  }

  // Production config uses the same structure with live URLs and keys
  return [
    {
      provider: "DARAJA",
      baseUrl: "https://api.safaricom.co.ke",
      credentials: {
        clientId: process.env.MPESA_CONSUMER_KEY!,
        clientSecret: process.env.MPESA_CONSUMER_SECRET!,
      },
      country: "KE",
      currency: "KES",
      callbackBaseUrl: "https://api.neobank.co.ke",
      enabled: true,
    },
    // ... remaining providers with production URLs
  ];
}
```

### 10.8 Webhook Testing with ngrok

For local development, use ngrok to expose local webhook endpoints:

```bash
# Start ngrok tunnel
ngrok http 3000

# Use the ngrok URL as callback URL in provider requests
# Example: https://abc123.ngrok.io/webhooks/mpesa/stkpush

# For DisbursePro:
ngrok http 3001
# Callback URL: https://def456.ngrok.io/webhooks/airtel
```

### 10.9 Integration Test Structure

```typescript
// tests/integration/payments/mpesa.test.ts

describe("M-Pesa Daraja Integration", () => {
  const mpesa = new MpesaDarajaAdapter({
    baseUrl: "https://sandbox.safaricom.co.ke",
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    shortCode: 174379,
    passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  });

  beforeAll(async () => {
    await mpesa.initialize();
  });

  it("should authenticate and receive a valid token", async () => {
    const health = await mpesa.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.latencyMs).toBeLessThan(5000);
  });

  it("should initiate STK Push and receive checkout request ID", async () => {
    const result = await mpesa.collect({
      referenceId: crypto.randomUUID(),
      amount: { amount: 1, currency: "KES" },
      recipient: { msisdn: "254708374149" },
      narration: "Test deposit",
      callbackUrl: "https://example.com/callback",
    });

    expect(result.status).toBe("PENDING");
    expect(result.providerTransactionId).toBeTruthy();
  });
});

describe("DisbursePro Carrier Adapters", () => {
  const airtel = new AirtelMoneyAdapter({
    baseUrl: "https://openapiuat.airtel.africa",
    clientId: process.env.AIRTEL_CLIENT_ID!,
    clientSecret: process.env.AIRTEL_CLIENT_SECRET!,
    country: "ZM",
    currency: "ZMW",
  });

  it("should disburse to Airtel Money ZM", async () => {
    const result = await airtel.disburse({
      referenceId: crypto.randomUUID(),
      amount: { amount: 100, currency: "ZMW" },
      recipient: { msisdn: "971345678" },
      narration: "Test disbursement",
      callbackUrl: "https://example.com/callback",
    });

    expect(["COMPLETED", "PENDING", "PROCESSING"]).toContain(result.status);
  });
});
```

### 10.10 Provider Health Dashboard

Both platforms expose a provider health endpoint for monitoring:

**NeoBank:** `GET /api/v1/admin/providers/health`
**DisbursePro:** `GET /api/v1/platform/carriers`

```json
{
  "providers": [
    {
      "name": "DARAJA",
      "status": "operational",
      "latencyMs": 245,
      "lastChecked": "2026-04-04T14:30:00+03:00",
      "circuitBreaker": "CLOSED",
      "failureCount24h": 2,
      "successRate24h": 99.8
    },
    {
      "name": "AIRTEL_MONEY",
      "status": "degraded",
      "latencyMs": 1200,
      "lastChecked": "2026-04-04T14:30:00+03:00",
      "circuitBreaker": "HALF_OPEN",
      "failureCount24h": 15,
      "successRate24h": 97.2
    },
    {
      "name": "FLUTTERWAVE",
      "status": "operational",
      "latencyMs": 180,
      "lastChecked": "2026-04-04T14:30:00+03:00",
      "circuitBreaker": "CLOSED",
      "failureCount24h": 0,
      "successRate24h": 100.0
    }
  ]
}
```

---

## Appendix A: Complete Provider Quick Reference

| Provider | Auth Method | Country | Currency | Deposit | Disburse | Cards | Webhooks |
|---|---|---|---|---|---|---|---|
| M-Pesa Daraja | OAuth2 | KE | KES | STK Push (C2B) | B2C | No | IP whitelist |
| Airtel Money | OAuth2 | KE, ZM | KES, ZMW | Collection API | B2C | No | HMAC-SHA256 |
| MTN MoMo | Subscription Key + OAuth2 | ZM | ZMW | Collections API | Disbursement | No | Callback token |
| Zamtel Kwacha | API Key | ZM | ZMW | No | Disbursement | No | IP + Basic Auth |
| Flutterwave | Secret Key | Pan-Africa | KES, USD | Card, Bank, MoMo | Transfer API | Yes (3DS) | Secret hash |
| Paystack | Secret Key | KE | KES | Card, Bank | Transfer API | Yes (3DS) | HMAC-SHA512 |

## Appendix B: Webhook Endpoint Registry

### NeoBank Inbound Webhooks

| Source | Endpoint | Events |
|---|---|---|
| M-Pesa (Daraja) | `POST /webhooks/mpesa` | C2B confirmation, B2C result, status query, reversal |
| Airtel Money | `POST /webhooks/airtel` | Collection success/failure, disbursement result |
| Flutterwave | `POST /webhooks/flutterwave` | Payment confirmation, refund, chargeback |
| Paystack | `POST /webhooks/paystack` | Charge success, transfer success/failure, dispute |
| BaaS (Marqeta/Stripe) | `POST /webhooks/cards` | Card auth, settlement, dispute, 3DS |
| Smile ID | `POST /webhooks/smileid` | KYC verification, AML screening |

### DisbursePro Inbound Webhooks

| Source | Endpoint | Events |
|---|---|---|
| Airtel Money ZM | `POST /webhooks/airtel` | Disbursement success/failure, balance notification |
| MTN MoMo ZM | `POST /webhooks/mtn` | Disbursement result, transaction status |
| Zamtel Kwacha | `POST /webhooks/zamtel` | Disbursement confirmation/failure |
| Custodian | `POST /webhooks/custodian` | Balance update, settlement confirmation |

## Appendix C: NeoBank Outbound Events (Kafka Topics)

| Topic | Published By | Consumed By | Payload |
|---|---|---|---|
| `txn.completed` | Payment Service | Notification Svc, Compliance, Reporting | Transaction ID, amount, parties, method |
| `txn.failed` | Payment Service | Notification Svc, Compliance | Transaction ID, error, provider |
| `kyc.status` | KYC Service | Notification Svc, Account Svc | User ID, status, tier |
| `card.event` | Card Service | Notification Svc, Compliance | Card ID, event type, amount |
| `merchant.settlement` | Merchant Service | Notification Svc, Reporting | Merchant ID, amount, period |

## Appendix D: DisbursePro Outbound Events (Kafka Topics)

| Topic | Published By | Consumed By | Payload |
|---|---|---|---|
| `carrier.events` | Webhook Endpoint | Disbursement Processor | Carrier name, event ID, status, reference |
| `disbursement.status` | Disbursement Module | Notification, Audit, Wallet | Disbursement ID, old status, new status |
| `wallet.balance` | Wallet Module | Audit Module | Company ID, old balance, new balance, reason |
| `audit.events` | All modules | Audit Module | Actor, action, resource, severity |
| `notification.events` | Multiple | Notification Module | Recipient, channel, template, data |
