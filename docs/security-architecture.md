# Security Architecture Document

## NeoBank & DisbursePro — Unified Security Framework

| Field | Detail |
|---|---|
| **Platforms** | NeoBank (Digital Banking) + DisbursePro (Enterprise Disbursement) |
| **Version** | 1.0 |
| **Date** | 2026-04-04 |
| **Classification** | CONFIDENTIAL |
| **Authors** | Qsoftwares Engineering & Security Team |
| **Review Cycle** | Quarterly (next review: 2026-07-04) |
| **Status** | Draft — Pre-Implementation |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Regulatory Compliance Framework](#2-regulatory-compliance-framework)
3. [Authentication & Identity](#3-authentication--identity)
4. [Data Protection & Encryption](#4-data-protection--encryption)
5. [PCI-DSS Compliance](#5-pci-dss-compliance)
6. [API Security](#6-api-security)
7. [AML/CFT & Transaction Monitoring](#7-amlcft--transaction-monitoring)
8. [Audit & Logging](#8-audit--logging)
9. [Infrastructure Security](#9-infrastructure-security)
10. [Incident Response Plan](#10-incident-response-plan)
11. [SOC 2 Type II Controls Mapping](#11-soc-2-type-ii-controls-mapping)
12. [Security Testing & Validation](#12-security-testing--validation)
13. [Appendices](#13-appendices)

---

## 1. Executive Summary

### 1.1 Scope

This document defines the security architecture for two fintech platforms operating in East and Southern Africa:

- **NeoBank** — A consumer and merchant digital banking platform targeting Kenya and East Africa (Kenya, Uganda, Tanzania, Rwanda, Ethiopia). Handles retail bank accounts, card issuing, P2P payments, mobile money integration, and merchant point-of-sale acceptance. Built on Apache Fineract core banking with a React web frontend and planned Flutter mobile app.

- **DisbursePro** — An enterprise disbursement and expense management platform targeting Zambia. Operates as a control and orchestration layer for corporate money movement. Licensed custodians hold funds; the platform manages workflows, approvals, and audit trails. Built with a React frontend and planned backend orchestration layer.

Both platforms handle real money, regulated financial data, and personally identifiable information (PII) for citizens in multiple jurisdictions. They share a common technical foundation (React + Spring Boot microservices) and will share security infrastructure where practical.

### 1.2 Threat Landscape

Operating in emerging African markets introduces specific threat vectors:

| Threat Category | Risk Level | Specific Concerns |
|---|---|---|
| Account takeover (ATO) | HIGH | SIM swap attacks prevalent in Kenya and Zambia |
| Mobile malware | HIGH | High Android market share with sideloaded apps |
| Insider threats | MEDIUM | Staff access to financial data and admin tools |
| Payment fraud | HIGH | M-Pesa social engineering, card-not-present fraud |
| Data exfiltration | MEDIUM | PII theft for identity fraud |
| DDoS | MEDIUM | Service disruption targeting payment rails |
| Regulatory penalties | HIGH | CBK and BOZ impose significant fines for non-compliance |
| Third-party compromise | MEDIUM | BaaS partner, KYC provider, or payment provider breach |

### 1.3 Security Principles

1. **Zero Trust** — Every request authenticated and authorized regardless of network origin. Mutual TLS between internal services.
2. **Defense in Depth** — Multiple overlapping security controls at every layer (network, application, data).
3. **Least Privilege** — Users and services receive only the minimum permissions required.
4. **Fail Closed** — Security controls default to deny when they fail or encounter unexpected input.
5. **Immutable Audit** — Every security-relevant action recorded in append-only logs retained for 7 years.
6. **Encryption Everywhere** — Data encrypted at rest and in transit with no exceptions.
7. **Segregation of Duties** — Four-eyes principle for high-risk operations (account closure, bulk disbursement, limit overrides, production deployments).

---

## 2. Regulatory Compliance Framework

### 2.1 Kenya — NeoBank

#### 2.1.1 Kenya Data Protection Act 2019 (KDPA)

The KDPA is enforced by the Office of the Data Protection Commissioner (ODPC). Key obligations:

| Requirement | Implementation |
|---|---|
| Lawful basis for processing | Explicit consent during registration + contractual necessity for financial services |
| Data minimization | Collect only data required for KYC tiers; no unnecessary profiling |
| Purpose limitation | Financial data used only for banking operations, compliance, and user-consented analytics |
| Data subject rights | Export (FR-909), deletion request workflow, access to personal data within 30 days |
| Breach notification | Notify ODPC within 72 hours of discovering a breach; notify affected users without undue delay |
| Cross-border transfers | Default: no transfer outside Africa without explicit consent. Data residency in AWS af-south-1 |
| Data Protection Impact Assessment (DPIA) | Completed before launch; reviewed annually |
| Registration with ODPC | Platform registered as data controller; BaaS partner and KYC provider registered as data processors |

#### 2.1.2 Central Bank of Kenya (CBK) Prudential Guidelines

| Guideline | Compliance Approach |
|---|---|
| CBK/PG/20 — Risk Management | Enterprise risk framework with quarterly risk assessment |
| CBK/PG/08 — Anti-Money Laundering | AML program with designated compliance officer, transaction monitoring, SAR filing |
| CBK/PG/15 — IT Standards | Penetration testing (annual), vulnerability scanning (quarterly), BCP/DRP testing |
| Cybersecurity Guidelines 2024 | CISO appointment, security operations center (SOC) monitoring, incident response plan |
| Payment Service Provider regulations | PSP license application through sponsor bank |

#### 2.1.3 National Payment System Act 2011

- Registration as a Payment Service Provider (PSP) through sponsor bank partnership
- Compliance with payment system rules for M-Pesa, Airtel Money, and card networks
- Settlement finality guarantees for merchant payments
- Consumer protection: transparent fees, dispute resolution within 14 days

#### 2.1.4 Proceeds of Crime and Anti-Money Laundering Act 2009

- Customer Due Diligence (CDD) at account opening
- Enhanced Due Diligence (EDD) for high-risk customers (PEPs, high-value accounts)
- Suspicious Transaction Reports (STRs) filed with Financial Reporting Centre (FRC)
- Cash Transaction Reports (CTRs) for transactions exceeding KES 1,000,000
- Record retention: minimum 7 years from date of transaction or account closure

#### 2.1.5 KYC Tiers (CBK-Aligned)

| Tier | Verification | Daily Limit | Monthly Limit | Card Access |
|---|---|---|---|---|
| **Tier 1 — Basic** | Full name, DOB, phone, selfie with liveness check | KES 50,000 | KES 200,000 | None |
| **Tier 2 — Standard** | + National ID/passport, proof of address, OCR verification | KES 300,000 | KES 1,500,000 | Virtual card |
| **Tier 3 — Premium** | + Bank statement (3 months) or employer letter, video verification | KES 1,000,000 | KES 5,000,000 | Virtual + physical card |

### 2.2 Zambia — DisbursePro

#### 2.2.1 Data Protection Act No. 3 of 2021

| Requirement | Implementation |
|---|---|
| Lawful basis | Contractual necessity (employment/disbursement relationship) + legitimate interest |
| Data Protection Officer | Appointed DPO registered with Zambia Information & Communications Technology Authority (ZICTA) |
| Breach notification | Notify ZICTA within 48 hours; notify affected data subjects within 72 hours |
| Cross-border transfers | Adequate protection assessment required; AWS af-south-1 as primary data center |
| Data retention | Employee disbursement records retained for 7 years per financial regulations |
| Data subject access requests | Respond within 30 days |

#### 2.2.2 Bank of Zambia (BOZ) Payment Systems Regulations

| Regulation | Compliance Approach |
|---|---|
| Payment Systems Act 2007 | Registration as electronic payment service provider |
| BOZ Payment Systems Directives | Compliance with settlement rules, consumer protection, and dispute resolution |
| Electronic Money Regulations | DisbursePro does not hold funds (custodial model) — custodian partner holds the license |
| Mobile Money Guidelines | Airtel Money, MTN MoMo, Zamtel Kwacha integration through licensed aggregators |
| Cybersecurity Directives | Annual penetration testing, incident reporting to BOZ within 24 hours |

#### 2.2.3 Financial Intelligence Centre Act 2010

- Company KYC (KYB) at onboarding: business registration, director verification, tax clearance
- Employee verification: NRC (National Registration Card) number validation
- Transaction monitoring: bulk disbursement pattern analysis
- STR filing with Financial Intelligence Centre (FIC) for suspicious patterns
- Record retention: 10 years (FIC requirement exceeds BOZ minimum)

#### 2.2.4 DisbursePro Limit Hierarchy

DisbursePro enforces a three-tier limit hierarchy where the most restrictive limit always wins:

| Tier | Single Transaction | Daily Aggregate | Monthly Aggregate | Set By |
|---|---|---|---|---|
| **Network** (carrier limits) | ZMW 25,000 | ZMW 100,000 | ZMW 2,000,000 | Mobile money provider |
| **Platform** (DisbursePro) | ZMW 50,000 | ZMW 250,000 | ZMW 5,000,000 | Platform operator |
| **Company** (custom) | Configurable | Configurable | Configurable | Company admin |

### 2.3 Shared Compliance Requirements

| Standard | NeoBank | DisbursePro | Implementation |
|---|---|---|---|
| PCI-DSS | SAQ-A (card tokenization) | Not applicable (no card data) | BaaS partner handles card data |
| SOC 2 Type II | Required | Required | Annual audit by accredited firm |
| ISO 27001 | Target (Year 2) | Target (Year 2) | ISMS implementation roadmap |
| OWASP Top 10 | Required | Required | Automated scanning + manual pen testing |

---

## 3. Authentication & Identity

### 3.1 Keycloak OAuth2/OIDC Configuration

Both platforms use Keycloak 24.x as the centralized Identity and Access Management (IAM) server.

#### 3.1.1 Realm Architecture

```
Keycloak Instance
├── Realm: neobank
│   ├── Client: neobank-mobile      (Flutter app — public client, PKCE)
│   ├── Client: neobank-web         (React consumer app — confidential)
│   ├── Client: neobank-admin       (React admin portal — confidential)
│   ├── Client: neobank-api         (Backend services — service account)
│   ├── Identity Provider: phone-spi (Custom SPI for phone+PIN auth)
│   └── Identity Provider: google   (Social login — consumer only)
│
└── Realm: disbursepro
    ├── Client: disbursepro-web     (React company portal — confidential)
    ├── Client: disbursepro-platform (React platform operator — confidential)
    ├── Client: disbursepro-api     (Backend services — service account)
    └── Identity Provider: email-spi (Custom SPI for email+password auth)
```

#### 3.1.2 Client Configuration

**NeoBank Mobile (Public Client — PKCE Flow):**

```json
{
  "clientId": "neobank-mobile",
  "protocol": "openid-connect",
  "publicClient": true,
  "standardFlowEnabled": true,
  "directAccessGrantsEnabled": false,
  "attributes": {
    "pkce.code.challenge.method": "S256",
    "post.logout.redirect.uris": "neobank://logout"
  },
  "redirectUris": [
    "neobank://callback",
    "https://app.neobank.co.ke/callback"
  ],
  "webOrigins": ["https://app.neobank.co.ke"]
}
```

**NeoBank Web (Confidential Client):**

```json
{
  "clientId": "neobank-web",
  "protocol": "openid-connect",
  "publicClient": false,
  "standardFlowEnabled": true,
  "serviceAccountsEnabled": false,
  "attributes": {
    "client.secret.rotation.enabled": "true",
    "client.secret.expiration.period": "7776000"
  },
  "redirectUris": ["https://app.neobank.co.ke/callback"],
  "webOrigins": ["https://app.neobank.co.ke"]
}
```

**DisbursePro Web (Confidential Client):**

```json
{
  "clientId": "disbursepro-web",
  "protocol": "openid-connect",
  "publicClient": false,
  "standardFlowEnabled": true,
  "attributes": {
    "client.secret.rotation.enabled": "true"
  },
  "redirectUris": ["https://app.disbursepro.co.zm/callback"],
  "webOrigins": ["https://app.disbursepro.co.zm"]
}
```

#### 3.1.3 Token Lifecycle

| Token Type | NeoBank | DisbursePro | Storage |
|---|---|---|---|
| Access Token (JWT) | 15 minutes | 15 minutes | In-memory only (never persisted) |
| Refresh Token (opaque) | 30 days | 7 days | Encrypted in Secure Storage (mobile) / httpOnly cookie (web) |
| Offline Token | 90 days (mobile only) | Not used | Encrypted in KeyStore/Keychain |
| ID Token | 15 minutes | 15 minutes | In-memory only |

**Token Security Configuration:**

```json
{
  "accessTokenLifespan": 900,
  "ssoSessionIdleTimeout": 300,
  "ssoSessionMaxLifespan": 86400,
  "refreshTokenMaxReuse": 0,
  "revokeRefreshToken": true,
  "accessTokenIntrospectionEnabled": false,
  "offlineSessionIdleTimeout": 7776000,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 1800,
  "failureFactor": 5,
  "waitIncrementSeconds": 60
}
```

Refresh token rotation is mandatory — each refresh token can be used exactly once. Reuse of a consumed refresh token immediately revokes the entire token family (detecting token theft).

#### 3.1.4 MFA Flows

**NeoBank MFA:**

| Trigger | Primary Factor | Second Factor | Fallback |
|---|---|---|---|
| App login | Phone + PIN | Biometric (fingerprint/Face ID) | SMS OTP |
| New device login | Phone + PIN | SMS OTP (mandatory) | WhatsApp OTP |
| Transaction > KES 50,000 | Biometric | Transaction PIN | SMS OTP |
| Admin portal login | Email + password | TOTP authenticator | Recovery codes (10 single-use) |
| PIN change | Current PIN | SMS OTP | — |
| Card operations | Biometric | Transaction PIN | SMS OTP |

**DisbursePro MFA:**

| Trigger | Primary Factor | Second Factor | Fallback |
|---|---|---|---|
| Portal login | Email + password | TOTP authenticator | SMS OTP to +260 number |
| Disbursement approval | Session token | TOTP authenticator | — |
| Settings change | Session token | Current password | — |
| Platform operator login | Email + password | TOTP authenticator (mandatory) | Hardware key (FIDO2) |

#### 3.1.5 Social Login (NeoBank Consumer Only)

```json
{
  "identityProviders": [
    {
      "alias": "google",
      "providerId": "google",
      "enabled": true,
      "trustEmail": true,
      "firstBrokerLoginFlowAlias": "first broker login - phone link",
      "config": {
        "clientId": "${GOOGLE_CLIENT_ID}",
        "clientSecret": "${GOOGLE_CLIENT_SECRET}",
        "defaultScope": "openid email profile"
      }
    },
    {
      "alias": "apple",
      "providerId": "apple",
      "enabled": true,
      "config": {
        "clientId": "${APPLE_SERVICE_ID}",
        "keyId": "${APPLE_KEY_ID}",
        "teamId": "${APPLE_TEAM_ID}"
      }
    }
  ]
}
```

Social login requires linking to a verified phone number before the account is activated. Social login alone does not satisfy KYC requirements.

### 3.2 Role-Based Access Control (RBAC)

#### 3.2.1 NeoBank Roles & Permissions

| Permission | Consumer | Merchant | Support Agent | Compliance Officer | Admin | Super Admin |
|---|---|---|---|---|---|---|
| `accounts:read` (own) | Y | Y | Y | Y | Y | Y |
| `accounts:read` (any) | — | — | Y | Y | Y | Y |
| `accounts:write` | Y (own) | Y (own) | — | — | Y | Y |
| `cards:manage` | Y (own) | — | — | — | Y | Y |
| `payments:send` | Y | Y | — | — | — | Y |
| `merchant:dashboard` | — | Y | — | — | Y | Y |
| `merchant:settlement` | — | Y | — | — | Y | Y |
| `kyc:submit` | Y | Y | — | — | — | — |
| `kyc:approve` | — | — | — | Y | Y | Y |
| `kyc:reject` | — | — | — | Y | Y | Y |
| `users:view` | — | — | Y | Y | Y | Y |
| `users:suspend` | — | — | — | — | Y | Y |
| `users:delete` | — | — | — | — | — | Y |
| `transactions:monitor` | — | — | Y | Y | Y | Y |
| `transactions:flag` | — | — | — | Y | Y | Y |
| `transactions:refund` | — | — | Y | — | Y | Y |
| `compliance:sar` | — | — | — | Y | — | Y |
| `reports:view` | — | — | Y | Y | Y | Y |
| `config:read` | — | — | — | — | Y | Y |
| `config:write` | — | — | — | — | — | Y |
| `audit:read` | — | — | — | Y | Y | Y |

#### 3.2.2 DisbursePro Roles & Permissions

| Permission | Platform Operator | Company Admin | Finance User | Approver | Auditor |
|---|---|---|---|---|---|
| `platform:dashboard` | Y | — | — | — | — |
| `platform:companies` | Y | — | — | — | — |
| `platform:credit-wallet` | Y | — | — | — | — |
| `platform:settings` | Y | — | — | — | — |
| `platform:revenue` | Y | — | — | — | — |
| `company:dashboard` | — | Y | Y | Y | Y (read-only) |
| `employees:manage` | — | Y | Y | — | — |
| `employees:view` | — | Y | Y | Y | Y |
| `disburse:create` | — | Y | Y | — | — |
| `disburse:bulk` | — | Y | Y | — | — |
| `approvals:review` | — | — | — | Y | — |
| `approvals:override` | — | Y | — | — | — |
| `transactions:view` | — | Y | Y | Y | Y |
| `transactions:export` | — | Y | Y | — | Y |
| `reports:view` | — | Y | Y | Y | Y |
| `settings:manage` | — | Y | — | — | — |
| `audit:view` | — | Y | — | — | Y |
| `users:manage` | — | Y | — | — | — |

#### 3.2.3 Attribute-Based Access Control (ABAC) Policies

Beyond role-based permissions, both platforms enforce attribute-based policies:

```
// NeoBank ABAC policies
policy "tier-based-limits" {
  condition: user.kyc_tier IN ["BASIC", "STANDARD", "PREMIUM"]
  effect: ALLOW if transaction.amount <= tier_limits[user.kyc_tier].daily
}

policy "merchant-own-data" {
  condition: user.role == "MERCHANT"
  effect: ALLOW if resource.merchant_id == user.merchant_id
}

policy "geo-restriction" {
  condition: user.country_code IN ["KE", "UG", "TZ", "RW", "ET"]
  effect: ALLOW
  else: DENY with "Service not available in your region"
}

// DisbursePro ABAC policies
policy "company-isolation" {
  condition: user.role IN ["COMPANY_ADMIN", "FINANCE_USER", "APPROVER", "AUDITOR"]
  effect: ALLOW if resource.company_id == user.company_id
}

policy "approval-segregation" {
  condition: action == "approve_disbursement"
  effect: DENY if disbursement.created_by == user.id
  message: "Cannot approve your own disbursement"
}

policy "cost-centre-restriction" {
  condition: user.cost_centres IS NOT EMPTY
  effect: ALLOW if resource.cost_centre IN user.cost_centres
}
```

### 3.3 Mobile Security (NeoBank Flutter App)

#### 3.3.1 Biometric Authentication

```dart
// Flutter biometric enrollment and authentication
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class BiometricAuthService {
  final LocalAuthentication _localAuth = LocalAuthentication();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
      keyCipherAlgorithm: KeyCipherAlgorithm.RSA_ECB_OAEPwithSHA_256andMGF1Padding,
      storageCipherAlgorithm: StorageCipherAlgorithm.AES_GCM_NoPadding,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.passcode,
      synchronizable: false,
    ),
  );

  Future<bool> authenticate() async {
    return await _localAuth.authenticate(
      localizedReason: 'Verify your identity to access NeoBank',
      options: const AuthenticationOptions(
        stickyAuth: true,
        biometricOnly: true,
        useErrorDialogs: true,
      ),
    );
  }
}
```

**Biometric Security Requirements:**
- Biometric enrollment data never leaves the device Secure Enclave (iOS) / Strongbox KeyStore (Android)
- App stores a device-bound AES-256 encryption key; biometric unlocks the key
- Refresh token is encrypted with the biometric-protected key
- If biometric data changes on device (new fingerprint added), re-enrollment is required
- Biometric is used for app unlock; transaction PIN is always required for transactions above KES 50,000

#### 3.3.2 Certificate Pinning

```dart
// Dio HTTP client with certificate pinning
import 'package:dio/dio.dart';
import 'package:dio/io.dart';

Dio createSecureClient() {
  final dio = Dio(BaseOptions(
    baseUrl: 'https://api.neobank.co.ke/api/v1',
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 30),
  ));

  (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
    final client = HttpClient();
    client.badCertificateCallback = (cert, host, port) => false; // fail-closed

    // SHA-256 public key pins
    // Primary: current production certificate
    // Backup: pre-deployed rotation certificate
    return client;
  };

  return dio;
}
```

**Pin Configuration:**

| Domain | Primary Pin (SHA-256) | Backup Pin (SHA-256) | Rotation Date |
|---|---|---|---|
| `api.neobank.co.ke` | `sha256/<PRIMARY_HASH>` | `sha256/<BACKUP_HASH>` | Rotate every 12 months |
| `auth.neobank.co.ke` | `sha256/<PRIMARY_HASH>` | `sha256/<BACKUP_HASH>` | Rotate every 12 months |

**Certificate Rotation Procedure:**
1. Deploy backup certificate to production (both old and new certs active)
2. Release app update with new primary pin + new backup pin
3. Wait for 95%+ app adoption (force update after 30 days)
4. Remove old certificate from production
5. Generate new backup certificate for next rotation

#### 3.3.3 Device Security

```dart
// Root/jailbreak detection
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';
import 'package:safe_device/safe_device.dart';

class DeviceSecurityService {
  Future<DeviceSecurityStatus> checkDevice() async {
    final isJailbroken = await FlutterJailbreakDetection.jailbroken;
    final isDeveloperMode = await FlutterJailbreakDetection.developerMode;
    final isRealDevice = await SafeDevice.isRealDevice;
    final canMockLocation = await SafeDevice.canMockLocation;

    return DeviceSecurityStatus(
      jailbroken: isJailbroken,
      developerMode: isDeveloperMode,
      emulator: !isRealDevice,
      mockLocation: canMockLocation,
    );
  }
}
```

**Device Security Policies:**

| Check | Action |
|---|---|
| Root/jailbreak detected | Warning banner + disable biometric auth + require PIN for all transactions |
| Emulator detected | Block app entirely (production builds only) |
| Developer mode | Warning banner |
| Mock location | Block location-based features |
| Screen recording detected | Hide sensitive data (card numbers, balances) |
| USB debugging enabled | Warning on security settings page |

#### 3.3.4 App Attestation

| Platform | API | Purpose |
|---|---|---|
| Android | Play Integrity API | Verify app is genuine, device is not rooted, running on real device |
| iOS | App Attest (DeviceCheck) | Verify app binary integrity and device legitimacy |

Attestation tokens are included in the `X-App-Attestation` header on every API request. Backend validates tokens with Google/Apple servers. Failed attestation results in degraded service (read-only mode, no financial transactions).

#### 3.3.5 Session Management

| Parameter | Value | Rationale |
|---|---|---|
| Max concurrent sessions | 2 devices per account | Prevent credential sharing |
| Inactivity timeout | 5 minutes | KDPA and CBK guidelines |
| Background app timeout | 2 minutes | Re-authenticate on return from background |
| Session revocation | Immediate via Keycloak admin API | Support agent can terminate any session |
| Device binding | Device fingerprint stored on registration | Alert on new device login |
| New device login | Requires SMS OTP + existing device approval | Prevent SIM swap attacks |

---

## 4. Data Protection & Encryption

### 4.1 Encryption at Rest

#### 4.1.1 Database Encryption

**PostgreSQL Configuration:**

```yaml
# postgresql.conf — encryption settings
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ca_file = '/etc/ssl/certs/ca.crt'
ssl_min_protocol_version = 'TLSv1.2'

# AWS RDS encryption
# Enabled at instance creation — AES-256 encryption of:
# - DB storage volume
# - Automated backups
# - Read replicas
# - Snapshots
```

**AWS RDS Encryption:**
- Storage encryption: AES-256 using AWS KMS Customer Managed Key (CMK)
- Key rotation: Automatic annual rotation
- Backup encryption: Inherited from primary instance
- Cross-region replica encryption: Re-encrypted with destination region CMK

#### 4.1.2 Field-Level Encryption (Application Layer)

Sensitive fields are encrypted at the application layer before database storage, providing defense-in-depth beyond volume encryption:

```java
// Field-level encryption service
@Service
public class FieldEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Value("${encryption.key.alias}")
    private String keyAlias;

    private final AWSKMSClient kmsClient;

    /**
     * Encrypt sensitive field using AES-256-GCM with AWS KMS envelope encryption.
     * Data key is generated per-record for forward secrecy.
     */
    public EncryptedField encrypt(String plaintext) {
        // Generate data key from KMS CMK
        GenerateDataKeyResult dataKeyResult = kmsClient.generateDataKey(
            new GenerateDataKeyRequest()
                .withKeyId(keyAlias)
                .withKeySpec(DataKeySpec.AES_256)
        );

        byte[] plaintextKey = dataKeyResult.getPlaintext().array();
        byte[] encryptedKey = dataKeyResult.getCiphertextBlob().array();

        // Encrypt with AES-256-GCM
        byte[] iv = generateSecureRandom(GCM_IV_LENGTH);
        SecretKeySpec keySpec = new SecretKeySpec(plaintextKey, "AES");
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

        // Zero out plaintext key material
        Arrays.fill(plaintextKey, (byte) 0);

        return new EncryptedField(
            Base64.getEncoder().encodeToString(ciphertext),
            Base64.getEncoder().encodeToString(iv),
            Base64.getEncoder().encodeToString(encryptedKey)
        );
    }
}
```

**Fields Requiring Encryption:**

| Platform | Field | Encryption | Searchable |
|---|---|---|---|
| NeoBank | Phone number | AES-256-GCM | Yes (HMAC index) |
| NeoBank | National ID / passport number | AES-256-GCM | Yes (HMAC index) |
| NeoBank | Account number | AES-256-GCM | Yes (HMAC index) |
| NeoBank | Card token (BaaS reference) | AES-256-GCM | No |
| NeoBank | KYC document S3 keys | AES-256-GCM | No |
| NeoBank | Transaction narration (PII) | AES-256-GCM | No |
| DisbursePro | Employee phone number | AES-256-GCM | Yes (HMAC index) |
| DisbursePro | NRC (National Registration Card) number | AES-256-GCM | Yes (HMAC index) |
| DisbursePro | Bank account number | AES-256-GCM | No |
| DisbursePro | Mobile money account number | AES-256-GCM | Yes (HMAC index) |

**Searchable Encryption:** For fields that need equality-search capability, a blind index is maintained using HMAC-SHA256 with a separate key. The HMAC produces a deterministic hash that enables `WHERE hmac_phone = ?` queries without exposing plaintext.

#### 4.1.3 Key Management (AWS KMS)

| Key | Purpose | Rotation | Access |
|---|---|---|---|
| `neobank-data-cmk` | Field-level encryption for NeoBank PII | Annual (automatic) | Backend services only |
| `disbursepro-data-cmk` | Field-level encryption for DisbursePro PII | Annual (automatic) | Backend services only |
| `neobank-rds-cmk` | RDS volume encryption (NeoBank) | Annual (automatic) | AWS RDS service |
| `disbursepro-rds-cmk` | RDS volume encryption (DisbursePro) | Annual (automatic) | AWS RDS service |
| `backup-cmk` | Backup encryption (both platforms) | Annual (automatic) | Backup service only |
| `s3-documents-cmk` | KYC document encryption (S3 SSE-KMS) | Annual (automatic) | KYC service only |

**KMS Key Policy (Example):**

```json
{
  "Statement": [
    {
      "Sid": "AllowBackendEncrypt",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::role/neobank-backend-role"
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "rds.af-south-1.amazonaws.com"
        }
      }
    },
    {
      "Sid": "DenyExternalAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "kms:*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalOrgID": "${ORG_ID}"
        }
      }
    }
  ]
}
```

### 4.2 Encryption in Transit

#### 4.2.1 TLS Configuration

```nginx
# nginx/ALB TLS configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;

# TLS 1.3 cipher suites (preferred)
ssl_conf_command Ciphersuites TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;

# TLS 1.2 fallback cipher suites
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256;

ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
```

#### 4.2.2 Security Headers

All HTTP responses from both platforms include the following headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.neobank.co.ke https://auth.neobank.co.ke; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
```

**Spring Boot Security Header Configuration:**

```java
@Configuration
@EnableWebSecurity
public class SecurityHeaderConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; frame-ancestors 'none'; base-uri 'self'"))
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                    .preload(true))
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(Customizer.withDefaults())
                .referrerPolicy(ref -> ref
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .permissionsPolicy(perm -> perm
                    .policy("camera=(), microphone=(), geolocation=(), payment=(), usb=()"))
                .crossOriginOpenerPolicy(coop -> coop
                    .policy(CrossOriginOpenerPolicyHeaderWriter.CrossOriginOpenerPolicy.SAME_ORIGIN))
                .crossOriginResourcePolicy(corp -> corp
                    .policy(CrossOriginResourcePolicyHeaderWriter.CrossOriginResourcePolicy.SAME_ORIGIN))
            )
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            ;
        return http.build();
    }
}
```

#### 4.2.3 mTLS for Service-to-Service Communication

All internal service communication uses mutual TLS:

```yaml
# Spring Boot mTLS configuration
server:
  ssl:
    enabled: true
    client-auth: need
    key-store: classpath:keystore.p12
    key-store-password: ${MTLS_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    trust-store: classpath:truststore.p12
    trust-store-password: ${MTLS_TRUSTSTORE_PASSWORD}
    trust-store-type: PKCS12
    protocol: TLS
    enabled-protocols: TLSv1.3
```

Internal service certificates are issued by a private CA managed in AWS Private Certificate Authority (PCA). Certificates rotate every 90 days with automated renewal via cert-manager in Kubernetes.

### 4.3 Data Classification

| Classification | Definition | Examples | Controls |
|---|---|---|---|
| **PUBLIC** | No impact if disclosed | Marketing content, public API docs, app store descriptions | Standard access controls |
| **INTERNAL** | Low impact if disclosed | Non-PII operational data, anonymized analytics, system metrics | Authentication required, no external sharing |
| **CONFIDENTIAL** | Significant impact if disclosed | User PII, transaction details, account balances, KYC documents, employee data | Encryption at rest + in transit, access logging, need-to-know basis |
| **RESTRICTED** | Severe impact if disclosed | Encryption keys, API secrets, card tokens, auth credentials, KMS key material | HSM/KMS only, no human access to plaintext, automated rotation, break-glass procedure |

### 4.4 Data Residency

#### 4.4.1 Primary Region: AWS af-south-1 (Cape Town)

Both platforms deploy primary infrastructure in the Africa (Cape Town) region:

```
┌─────────────────────────────────────────────────────┐
│  AWS af-south-1 (Cape Town) — PRIMARY                │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ NeoBank Stack    │  │ DisbursePro Stack│          │
│  │ - EKS Cluster    │  │ - EKS Cluster    │          │
│  │ - RDS Primary    │  │ - RDS Primary    │          │
│  │ - ElastiCache    │  │ - ElastiCache    │          │
│  │ - S3 (KYC docs)  │  │ - S3 (receipts)  │          │
│  └──────────────────┘  └──────────────────┘          │
│                                                      │
│  ┌──────────────────────────────────────────┐        │
│  │ Shared Infrastructure                    │        │
│  │ - Keycloak (Auth)                         │        │
│  │ - Kafka Cluster                           │        │
│  │ - AWS KMS (CMKs)                          │        │
│  │ - CloudWatch / Grafana                    │        │
│  └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  AWS eu-west-1 (Ireland) — DISASTER RECOVERY         │
│                                                      │
│  ┌──────────────────────────────────────────┐        │
│  │ - RDS Read Replicas (async replication)   │        │
│  │ - S3 Cross-Region Replication             │        │
│  │ - EKS Standby Cluster (scaled to zero)    │        │
│  │ - KMS Replica Keys                        │        │
│  └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

**Data Residency Rules:**
- All primary data processing occurs in af-south-1 (Cape Town, South Africa)
- User PII and financial data never leave the African continent in normal operations
- DR failover to eu-west-1 (Ireland) only under declared disaster — requires CISO approval
- CDN (CloudFront) serves static assets globally but does not cache PII or financial data
- CloudFront geo-restrictions: allow only East African + Southern African countries for API endpoints
- Cross-border data transfer (e.g., analytics to global dashboard) requires explicit user consent and DPIA review

---

## 5. PCI-DSS Compliance

### 5.1 Approach: SAQ-A (Outsourced Card Data)

NeoBank achieves PCI-DSS compliance by ensuring that card data (PANs, CVVs, expiration dates) never enters our infrastructure:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PCI-DSS Scope Boundary                     │
│                                                                  │
│  OUT OF SCOPE (NeoBank)          │  IN SCOPE (BaaS Partner)     │
│  ──────────────────────────────  │  ───────────────────────────  │
│                                  │                               │
│  • Store card tokens (tok_xxx)   │  • Store PANs (4111...)       │
│  • Display last 4 digits         │  • Process card transactions  │
│  • Manage card lifecycle         │  • Handle 3DS authentication  │
│    (freeze/unfreeze via API)     │  • PCI-DSS Level 1 certified  │
│  • Show transaction history      │  • Issue physical/virtual     │
│                                  │    cards                      │
│  Card details displayed in-app   │  • Manage card PINs           │
│  fetched in real-time from BaaS  │  • Connect to Visa/Mastercard │
│  via single-use secure session   │    networks                   │
│                                  │                               │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Tokenization Architecture

```
User requests card details:
  App → Backend → BaaS API (authenticated, single-use session token)
                          → Returns: PAN, CVV, expiry (encrypted payload)
                          → Decrypted in-app only (never logged, never cached)
                          → Display timeout: 30 seconds, then cleared from memory

Card authorization flow:
  Merchant POS → Card Network → BaaS Partner (authorizes against NeoBank balance)
                              → Webhook to NeoBank: "Authorization for tok_xxx, KES 1,500"
                              → NeoBank debits Fineract account, updates shadow ledger
```

### 5.3 PCI Controls We Maintain

Even with SAQ-A, NeoBank implements these controls:

| Control | Implementation |
|---|---|
| Network segmentation | Payment services in isolated VPC subnet; no direct internet access |
| Access control | Card service API accessible only from backend services (mTLS) |
| Logging | All card token operations logged with correlation IDs |
| Token storage | Card tokens encrypted at rest (AES-256-GCM) in dedicated database table |
| BaaS API credentials | Stored in AWS Secrets Manager; rotated every 90 days |
| Vulnerability scanning | Quarterly ASV scans on all internet-facing systems |
| Penetration testing | Annual pentest by PCI-QSA firm covering card flows |
| Incident response | Card-specific IR procedures including BaaS partner notification |
| Employee training | Annual PCI awareness training for all engineering staff |

### 5.4 SAQ-A Filing Schedule

| Activity | Frequency | Responsible |
|---|---|---|
| SAQ-A self-assessment | Annual | CISO / Compliance Officer |
| ASV vulnerability scan | Quarterly | Security Engineer + ASV vendor |
| Penetration test | Annual | External QSA firm |
| BaaS partner PCI attestation review | Annual | Compliance Officer |
| Card flow security review | Semi-annual | Security Engineer |

---

## 6. API Security

### 6.1 Rate Limiting

#### 6.1.1 NeoBank Rate Limits

| Endpoint Category | Rate Limit | Window | Burst | Penalty |
|---|---|---|---|---|
| Public (registration, login) | 10 req/min | Per IP | 15 | 5-minute block after 30 requests |
| OTP generation | 5 req/hour | Per phone number | 5 | 1-hour block after exceeded |
| Authenticated read (balance, history) | 100 req/min | Per user | 120 | 429 response, retry-after header |
| Authenticated write (transfers, payments) | 20 req/min | Per user | 25 | 429 + alert to fraud monitoring |
| Card operations | 10 req/min | Per user | 12 | 429 + temporary card freeze |
| Admin API | 200 req/min | Per admin user | 250 | 429 + security alert |
| Webhook callbacks | 500 req/min | Per provider | 600 | Queue overflow → dead letter |

#### 6.1.2 DisbursePro Rate Limits

| Endpoint Category | Rate Limit | Window | Burst | Penalty |
|---|---|---|---|---|
| Public (login) | 10 req/min | Per IP | 15 | 5-minute block |
| Authenticated read | 100 req/min | Per user | 120 | 429 response |
| Disbursement creation | 30 req/min | Per company | 40 | 429 + admin notification |
| Bulk disbursement | 5 req/hour | Per company | 5 | 429 + mandatory cooldown |
| Approval operations | 20 req/min | Per user | 25 | 429 response |
| Platform operator API | 200 req/min | Per operator | 250 | 429 response |
| Export operations | 3 req/hour | Per user | 3 | 429 + queue notification |

#### 6.1.3 Rate Limit Implementation

```java
// Redis-based sliding window rate limiter
@Component
public class RateLimiter {

    private final StringRedisTemplate redis;
    private static final String RATE_LIMIT_PREFIX = "rl:";

    public RateLimitResult check(String key, int maxRequests, Duration window) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        long now = Instant.now().toEpochMilli();
        long windowStart = now - window.toMillis();

        // Atomic sliding window check using Redis sorted set
        List<Object> results = redis.executePipelined((RedisCallback<Object>) connection -> {
            byte[] keyBytes = redisKey.getBytes();
            // Remove expired entries
            connection.zRemRangeByScore(keyBytes, 0, windowStart);
            // Count current entries
            connection.zCard(keyBytes);
            // Add current request
            connection.zAdd(keyBytes, now, (now + ":" + UUID.randomUUID()).getBytes());
            // Set TTL
            connection.expire(keyBytes, window.getSeconds());
            return null;
        });

        long currentCount = (Long) results.get(1);
        boolean allowed = currentCount < maxRequests;

        return new RateLimitResult(
            allowed,
            maxRequests,
            Math.max(0, maxRequests - currentCount - 1),
            Instant.now().plus(window).toEpochMilli()
        );
    }
}
```

**Rate limit response headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1712167200
Retry-After: 45
```

### 6.2 Input Validation & OWASP Protection

#### 6.2.1 Input Validation Strategy

```java
// Example: Transfer request validation
public record TransferRequest(
    @NotNull @Pattern(regexp = "^NB-\\d{3}-\\d{8}$")
    String sourceAccountId,

    @NotNull @Pattern(regexp = "^(NB-\\d{3}-\\d{8}|\\+\\d{10,15})$")
    String destinationIdentifier,

    @NotNull @Positive @Max(100000000) // Max KES 1,000,000 (in minor units)
    Long amount,

    @NotNull @Pattern(regexp = "^[A-Z]{3}$")
    String currency,

    @Size(max = 140, message = "Narration must not exceed 140 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s.,'-]*$", message = "Narration contains invalid characters")
    String narration,

    @NotNull @Pattern(regexp = "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
    String idempotencyKey
) {}
```

#### 6.2.2 OWASP Top 10 Mitigations

| OWASP Risk | Mitigation |
|---|---|
| A01 — Broken Access Control | Keycloak RBAC + ABAC policies; resource-level authorization checks; CORS whitelist |
| A02 — Cryptographic Failures | AES-256-GCM field encryption; TLS 1.3; KMS-managed keys; no hardcoded secrets |
| A03 — Injection | Parameterized queries (JPA/Hibernate); no raw SQL; JSON Schema validation at gateway |
| A04 — Insecure Design | Threat modeling per feature; abuse case testing; rate limiting on all financial endpoints |
| A05 — Security Misconfiguration | Infrastructure-as-Code (Terraform); security baselines; automated drift detection |
| A06 — Vulnerable Components | Dependabot + Snyk scanning; automated PR on CVE detection; 72-hour SLA for critical CVEs |
| A07 — Auth Failures | Keycloak brute force protection; MFA enforcement; refresh token rotation; session limits |
| A08 — Data Integrity Failures | HMAC-SHA256 request signing for financial operations; idempotency keys; CI/CD pipeline signing |
| A09 — Logging & Monitoring | Structured JSON logs; correlation IDs; SIEM integration; automated alerting |
| A10 — SSRF | Allowlist for external service URLs; no user-controlled URL parameters in server-side requests |

#### 6.2.3 Content Security

```java
// Request size and content-type validation at API Gateway
@Configuration
public class RequestSecurityConfig {

    @Bean
    public FilterRegistrationBean<RequestSizeFilter> requestSizeFilter() {
        FilterRegistrationBean<RequestSizeFilter> filter = new FilterRegistrationBean<>();
        filter.setFilter(new RequestSizeFilter(
            1_048_576,    // 1MB general request limit
            10_485_760,   // 10MB file upload limit
            "application/json", "multipart/form-data" // allowed content types
        ));
        filter.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return filter;
    }
}
```

### 6.3 WAF Configuration

#### 6.3.1 AWS WAF Rules

```hcl
# Terraform — AWS WAF WebACL
resource "aws_wafv2_web_acl" "neobank_api" {
  name        = "neobank-api-waf"
  description = "WAF for NeoBank API Gateway"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # AWS Managed Rules — Common Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name               = "CommonRuleSet"
    }
  }

  # AWS Managed Rules — Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name               = "KnownBadInputs"
    }
  }

  # AWS Managed Rules — SQL Injection
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name               = "SQLiRuleSet"
    }
  }

  # Geo-restriction: Allow only target markets
  rule {
    name     = "GeoRestriction"
    priority = 4
    action { block {} }
    statement {
      not_statement {
        statement {
          geo_match_statement {
            country_codes = ["KE", "UG", "TZ", "RW", "ET", "ZM", "ZA", "GB", "US"]
          }
        }
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name               = "GeoBlock"
    }
  }

  # Rate-based rule: DDoS protection
  rule {
    name     = "RateBasedDDoS"
    priority = 5
    action { block {} }
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      sampled_requests_enabled   = true
      cloudwatch_metrics_enabled = true
      metric_name               = "RateBasedDDoS"
    }
  }
}
```

#### 6.3.2 Bot Detection

- AWS WAF Bot Control managed rule group for registration and login endpoints
- CAPTCHA challenge for suspicious registration attempts (> 3 registrations from same IP in 1 hour)
- reCAPTCHA Enterprise v3 integration on web registration forms
- App attestation (Play Integrity / App Attest) for mobile clients

---

## 7. AML/CFT & Transaction Monitoring

### 7.1 KYC Verification Pipeline

#### 7.1.1 NeoBank — Individual KYC (Smile ID Integration)

```
┌───────────────────────────────────────────────────────────────┐
│                    KYC Verification Pipeline                   │
│                                                               │
│  Step 1: ID Capture                                           │
│  ├── User captures government ID (front + back)               │
│  ├── Image quality check (blur, glare, cropping)              │
│  └── Upload to S3 (encrypted, SSE-KMS)                        │
│                                                               │
│  Step 2: Liveness Check                                        │
│  ├── Smile ID SmartSelfie: real-time liveness detection       │
│  ├── Anti-spoofing: detects photos-of-photos, masks, deepfakes│
│  └── Confidence score threshold: 0.85 (configurable)          │
│                                                               │
│  Step 3: ID Verification                                       │
│  ├── OCR extraction of ID fields (name, DOB, ID number)       │
│  ├── Cross-reference with national ID database (via Smile ID) │
│  ├── Face match: selfie vs. ID photo (threshold: 0.80)        │
│  └── Document authenticity checks (holograms, microprint)     │
│                                                               │
│  Step 4: AML Screening                                         │
│  ├── Sanctions lists: OFAC, UN, EU, Kenya Gazette              │
│  ├── PEP (Politically Exposed Persons) screening               │
│  ├── Adverse media screening                                   │
│  └── Risk score: LOW (0-30), MEDIUM (31-60), HIGH (61-100)    │
│                                                               │
│  Step 5: Decision                                              │
│  ├── AUTO-APPROVE: Risk < 30, all checks passed               │
│  ├── MANUAL REVIEW: Risk 31-60 or partial check failure       │
│  └── AUTO-REJECT: Risk > 60 or sanctions hit                  │
│                                                               │
│  Step 6: Post-Verification                                     │
│  ├── Fineract client creation/update                           │
│  ├── Account tier activation                                   │
│  ├── Audit log entry                                           │
│  └── User notification (approved/pending/rejected)             │
└───────────────────────────────────────────────────────────────┘
```

#### 7.1.2 DisbursePro — Company KYC (KYB)

| Step | Verification | Source | Auto/Manual |
|---|---|---|---|
| Business registration | Certificate of incorporation / business permit | PACRA (Zambia) database lookup | Auto |
| Director verification | NRC verification for all directors | ZICTA / SmartZambia | Auto |
| Tax clearance | ZRA Tax Compliance Certificate | Zambia Revenue Authority portal | Manual upload + verification |
| Bank account verification | Confirmation of bank account ownership | Micro-deposit (ZMW 0.01 x2) | Auto |
| AML screening | Company name + directors against sanctions lists | Smile ID / ComplyAdvantage | Auto |
| Risk assessment | Business type, expected volume, industry risk | Internal scoring model | Auto + manual review for HIGH |

### 7.2 Transaction Monitoring Rules

#### 7.2.1 NeoBank Transaction Rules

```yaml
# Transaction monitoring rule engine configuration
rules:
  # Velocity rules
  - id: VELOCITY_HIGH_FREQUENCY
    description: "More than 5 transfers in 1 hour"
    condition: "count(transfers, user_id, 1h) > 5"
    severity: MEDIUM
    action: FLAG_FOR_REVIEW

  - id: VELOCITY_RAPID_FIRE
    description: "More than 3 transfers in 5 minutes"
    condition: "count(transfers, user_id, 5m) > 3"
    severity: HIGH
    action: BLOCK_AND_ALERT

  # Amount threshold rules
  - id: AMOUNT_SINGLE_HIGH
    description: "Single transaction exceeds KES 1,000,000"
    condition: "transaction.amount > 100000000"  # minor units
    severity: HIGH
    action: FLAG_FOR_REVIEW
    ctr_required: true  # Cash Transaction Report

  - id: AMOUNT_DAILY_AGGREGATE
    description: "Daily aggregate exceeds KES 5,000,000"
    condition: "sum(transactions, user_id, 24h) > 500000000"
    severity: HIGH
    action: FLAG_AND_LIMIT

  # Pattern detection rules
  - id: PATTERN_STRUCTURING
    description: "Multiple transactions just below reporting threshold"
    condition: >
      count(transactions, user_id, 24h, amount > 90000000 AND amount < 100000000) >= 3
    severity: CRITICAL
    action: BLOCK_AND_SAR

  - id: PATTERN_ROUND_AMOUNTS
    description: "3+ round-amount transfers to same beneficiary in 24h"
    condition: >
      count(transfers, user_id, 24h,
        beneficiary_id = same AND amount % 100000 == 0) >= 3
    severity: MEDIUM
    action: FLAG_FOR_REVIEW

  - id: PATTERN_RAPID_ONBOARD_TRANSFER
    description: "Large transfer within 1 hour of account creation"
    condition: >
      transaction.amount > 50000000
      AND user.account_age < 1h
    severity: HIGH
    action: BLOCK_AND_ALERT

  # Geographic anomaly rules
  - id: GEO_FOREIGN_IP
    description: "Transaction from foreign IP with local account"
    condition: >
      request.ip.country NOT IN user.registered_countries
      AND transaction.amount > 10000000
    severity: MEDIUM
    action: STEP_UP_AUTH

  - id: GEO_IMPOSSIBLE_TRAVEL
    description: "Transaction from location incompatible with previous"
    condition: >
      distance(request.ip.location, last_transaction.ip.location) > 500km
      AND time_diff(now, last_transaction.time) < 1h
    severity: HIGH
    action: BLOCK_AND_ALERT

  # New payee monitoring
  - id: NEW_PAYEE_HIGH_VALUE
    description: "First transfer to new payee exceeds KES 100,000"
    condition: >
      is_new_payee(user_id, beneficiary_id)
      AND transaction.amount > 10000000
    severity: MEDIUM
    action: FLAG_FOR_REVIEW
```

#### 7.2.2 DisbursePro Transaction Rules

```yaml
rules:
  - id: BULK_UNUSUAL_SIZE
    description: "Bulk disbursement with more than 500 recipients"
    condition: "batch.recipient_count > 500"
    severity: MEDIUM
    action: REQUIRE_PLATFORM_APPROVAL

  - id: BULK_UNUSUAL_AMOUNT
    description: "Bulk disbursement total exceeds ZMW 500,000"
    condition: "batch.total_amount > 50000000"
    severity: HIGH
    action: REQUIRE_PLATFORM_APPROVAL

  - id: DUPLICATE_DISBURSEMENT
    description: "Same amount to same employee within 24 hours"
    condition: >
      exists(disbursements, employee_id = same
        AND amount = same AND time < 24h)
    severity: MEDIUM
    action: FLAG_AND_WARN

  - id: OFF_HOURS_DISBURSEMENT
    description: "Disbursement created outside business hours"
    condition: "created_at.hour < 7 OR created_at.hour > 20"
    severity: LOW
    action: LOG_AND_FLAG

  - id: SELF_DISBURSEMENT
    description: "User disbursing to their own phone number"
    condition: "creator.phone == recipient.phone"
    severity: HIGH
    action: BLOCK_AND_ALERT
```

### 7.3 Suspicious Activity Reporting (SAR)

#### 7.3.1 SAR Workflow

```
Transaction flagged by rule engine
         │
         ▼
┌─────────────────────┐
│  Auto-triage         │
│  (risk score calc)   │
└────────┬────────────┘
         │
    ┌────┴────┐
    │  Score  │
    │  > 80?  │
    └────┬────┘
     Yes │  No
    ┌────┴──────────────┐
    │                   │
    ▼                   ▼
┌──────────┐    ┌──────────────────┐
│ Immediate│    │ Manual review    │
│ block +  │    │ queue            │
│ SAR draft│    │ (SLA: 4 hours)   │
└────┬─────┘    └────────┬─────────┘
     │                   │
     ▼                   ▼
┌──────────────────────────────────┐
│  Compliance officer reviews       │
│  - Transaction history            │
│  - KYC documents                  │
│  - Related accounts               │
│  - Pattern analysis               │
└──────────┬───────────────────────┘
           │
      ┌────┴────┐
      │ File    │
      │ SAR?    │
      └────┬────┘
       Yes │  No
      ┌────┴───────────────┐
      │                    │
      ▼                    ▼
┌───────────┐      ┌────────────┐
│ File with │      │ Clear flag │
│ FRC/FIC   │      │ + document │
│ (72 hours)│      │ rationale  │
└───────────┘      └────────────┘
```

#### 7.3.2 Reporting Obligations

| Jurisdiction | Reporting Body | Report Type | Deadline | Retention |
|---|---|---|---|---|
| Kenya | Financial Reporting Centre (FRC) | STR (Suspicious Transaction Report) | Within 7 working days | 7 years |
| Kenya | FRC | CTR (Cash Transaction Report) | Monthly, by 15th | 7 years |
| Kenya | CBK | Regulatory returns | Monthly/Quarterly | 7 years |
| Zambia | Financial Intelligence Centre (FIC) | STR | Within 5 working days | 10 years |
| Zambia | FIC | CTR (threshold: ZMW 100,000) | Within 3 working days | 10 years |
| Zambia | BOZ | Regulatory returns | Monthly | 10 years |

---

## 8. Audit & Logging

### 8.1 Audit Trail Architecture

#### 8.1.1 Audit Event Structure

```json
{
  "eventId": "evt_01HXYZ123456789ABCDEF",
  "timestamp": "2026-04-04T10:30:45.123+03:00",
  "platform": "neobank",
  "service": "banking-core",
  "correlationId": "req_01HXYZ987654321FEDCBA",
  "sessionId": "ses_01HXYZ111222333444555",

  "actor": {
    "userId": "usr_01HXYZ...",
    "role": "CONSUMER",
    "deviceId": "dev_01HXYZ...",
    "ipAddress": "41.90.XXX.XXX",
    "userAgent": "NeoBank/1.0.0 (Android 14; Samsung SM-S921B)",
    "geoLocation": {
      "country": "KE",
      "city": "Nairobi",
      "coordinates": [-1.2921, 36.8219]
    }
  },

  "action": {
    "type": "TRANSFER_INITIATED",
    "resource": "transfer",
    "resourceId": "txn_01HXYZ...",
    "method": "POST",
    "endpoint": "/api/v1/transfers"
  },

  "context": {
    "sourceAccount": "NB-254-10001234",
    "destinationAccount": "NB-254-10005678",
    "amount": 150000,
    "currency": "KES",
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
  },

  "result": {
    "status": "SUCCESS",
    "httpStatus": 201,
    "duration_ms": 342
  },

  "severity": "INFO",
  "classification": "FINANCIAL"
}
```

#### 8.1.2 Audit Storage

| Store | Purpose | Retention | Access |
|---|---|---|---|
| PostgreSQL (audit schema) | Primary audit store | 7 years (Kenya) / 10 years (Zambia) | Append-only; no UPDATE/DELETE permissions |
| AWS CloudWatch Logs | Operational logging | 90 days hot, 1 year warm | Engineering + Security |
| S3 (audit archive) | Long-term archive | 10 years (both platforms) | Compliance Officer + Legal (read-only) |
| Elasticsearch | Search and analytics | 1 year | Security team (read-only) |

**Immutability Controls:**
- PostgreSQL audit table uses `pg_audit` extension with no DELETE/UPDATE grants
- Database user for audit writes has INSERT-only permission
- Audit table has row-level security preventing modification by any role
- S3 audit bucket has Object Lock (Governance mode, 10-year retention)
- CloudWatch log groups have retention policies enforced via AWS Organizations SCP

#### 8.1.3 Severity Classification

| Severity | Examples | Response |
|---|---|---|
| **INFO** | Login, balance inquiry, profile view, notification read | Logged, no alert |
| **WARNING** | Failed login attempt, rate limit hit, unusual location, validation error | Logged + aggregated alert (5+ in 15 min) |
| **CRITICAL** | Account suspension, SAR filed, privilege escalation, data export, bulk operation, config change | Logged + immediate alert + on-call page |

### 8.2 Security Event Monitoring

#### 8.2.1 SIEM Integration

```yaml
# CloudWatch Metric Filters and Alarms
metric_filters:
  - name: FailedLogins
    pattern: '{ $.action.type = "LOGIN_FAILED" }'
    metric: FailedLoginCount
    alarm:
      threshold: 5
      period: 900  # 15 minutes
      action: SNS → PagerDuty

  - name: PrivilegeEscalation
    pattern: '{ $.action.type = "ROLE_CHANGED" && $.context.newRole IN ["ADMIN", "SUPER_ADMIN"] }'
    metric: PrivilegeEscalationCount
    alarm:
      threshold: 1
      period: 60
      action: SNS → PagerDuty (P1)

  - name: DataExport
    pattern: '{ $.action.type IN ["DATA_EXPORT", "STATEMENT_GENERATED", "BULK_EXPORT"] }'
    metric: DataExportCount
    alarm:
      threshold: 10
      period: 3600  # 1 hour
      action: SNS → Security Team

  - name: AdminConfigChange
    pattern: '{ $.action.type = "CONFIG_CHANGED" && $.severity = "CRITICAL" }'
    metric: ConfigChangeCount
    alarm:
      threshold: 1
      period: 60
      action: SNS → PagerDuty + CISO email

  - name: AMLAlert
    pattern: '{ $.classification = "AML" && $.result.status = "FLAGGED" }'
    metric: AMLAlertCount
    alarm:
      threshold: 1
      period: 60
      action: SNS → Compliance Team
```

#### 8.2.2 Alert Escalation Matrix

| Alert Priority | Response SLA | Responder | Example Triggers |
|---|---|---|---|
| **P1 — Critical** | < 15 minutes | On-call Security Engineer + CISO | Data breach, privilege escalation, mass account lockout, payment system compromise |
| **P2 — High** | < 1 hour | On-call Security Engineer | AML flag (critical score), DDoS detected, BaaS partner outage, certificate expiry imminent |
| **P3 — Medium** | < 4 hours | Security Engineer (business hours) | Unusual login patterns, rate limit bursts, failed ASV scan, dependency CVE (high) |
| **P4 — Low** | < 24 hours | Security Engineer (next business day) | Informational security findings, dependency CVE (medium), policy drift detected |

#### 8.2.3 Dashboards

**Security Operations Dashboard (Grafana):**
- Failed login heatmap (by hour and geographic region)
- Active sessions count (by role and platform)
- Rate limit violations (by endpoint and user)
- AML flags and disposition status
- API error rates (4xx and 5xx by service)
- Certificate expiry countdown
- WAF block rate and top blocked IPs
- Keycloak token issuance rate

---

## 9. Infrastructure Security

### 9.1 VPC Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│  VPC: 10.0.0.0/16 — NeoBank + DisbursePro Production             │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Public Subnet (10.0.1.0/24, 10.0.2.0/24)                  │  │
│  │  ├── ALB (Application Load Balancer) — TLS termination      │  │
│  │  ├── NAT Gateway (outbound internet for private subnets)    │  │
│  │  └── Bastion Host (SSH jump box — IP-restricted)            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                           │                                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Private Subnet — Application (10.0.10.0/24, 10.0.11.0/24) │  │
│  │  ├── EKS Worker Nodes (NeoBank services)                    │  │
│  │  ├── EKS Worker Nodes (DisbursePro services)                │  │
│  │  ├── Keycloak (shared IAM)                                  │  │
│  │  └── Redis Cluster (ElastiCache)                            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                           │                                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Private Subnet — Data (10.0.20.0/24, 10.0.21.0/24)        │  │
│  │  ├── RDS PostgreSQL (NeoBank — Multi-AZ)                    │  │
│  │  ├── RDS PostgreSQL (DisbursePro — Multi-AZ)                │  │
│  │  ├── RDS PostgreSQL (Keycloak — Multi-AZ)                   │  │
│  │  └── RDS PostgreSQL (Audit — Dedicated, append-only)        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                           │                                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Isolated Subnet — Payment (10.0.30.0/24)                   │  │
│  │  ├── Payment Orchestrator Service                           │  │
│  │  ├── Card Service (BaaS adapter)                            │  │
│  │  └── No internet access — egress via VPC Endpoint only      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  VPC Endpoints:                                                    │
│  ├── S3 Gateway Endpoint                                           │
│  ├── KMS Interface Endpoint                                        │
│  ├── Secrets Manager Interface Endpoint                            │
│  ├── ECR Interface Endpoints (api + dkr)                           │
│  ├── CloudWatch Interface Endpoint                                 │
│  └── STS Interface Endpoint                                        │
└───────────────────────────────────────────────────────────────────┘
```

### 9.2 Security Groups

| Security Group | Inbound Rules | Outbound Rules |
|---|---|---|
| `sg-alb` | 443 from 0.0.0.0/0 (HTTPS) | All to `sg-app` on 8080 |
| `sg-bastion` | 22 from office IP + VPN CIDR | All to `sg-app` on 22 |
| `sg-app` | 8080 from `sg-alb`; 22 from `sg-bastion` | All to `sg-data` on 5432; All to `sg-redis` on 6379; All to `sg-payment` on 8443; HTTPS to VPC endpoints |
| `sg-data` | 5432 from `sg-app` only | None (no outbound) |
| `sg-redis` | 6379 from `sg-app` only | None |
| `sg-payment` | 8443 from `sg-app` only (mTLS) | HTTPS to BaaS partner IPs (allowlisted); HTTPS to payment provider IPs |
| `sg-kafka` | 9092 from `sg-app` only | 9092 to `sg-app` |

### 9.3 Secrets Management

```hcl
# Terraform — AWS Secrets Manager configuration
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "neobank/prod/db-credentials"
  recovery_window_in_days = 30

  # Automatic rotation every 30 days
  rotation_rules {
    automatically_after_days = 30
  }
}

resource "aws_secretsmanager_secret" "baas_api_key" {
  name                    = "neobank/prod/baas-api-key"
  recovery_window_in_days = 30

  rotation_rules {
    automatically_after_days = 90
  }
}

resource "aws_secretsmanager_secret" "smile_id_credentials" {
  name                    = "neobank/prod/smile-id"
  recovery_window_in_days = 30

  rotation_rules {
    automatically_after_days = 90
  }
}
```

**Secret Access Policies:**
- Application services access secrets via IAM role (no hardcoded credentials)
- Secrets are injected as environment variables at pod startup via External Secrets Operator
- Secret values are never logged, even in debug mode
- Secret rotation triggers automatic pod restart to pick up new values

### 9.4 Container Security

```dockerfile
# Distroless base image for production services
FROM gcr.io/distroless/java21-debian12:nonroot

# Read-only filesystem
# No shell, no package manager, no utilities
# Runs as non-root user (UID 65534)

COPY --chown=65534:65534 target/app.jar /app/app.jar
WORKDIR /app

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Kubernetes Pod Security Standards:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: banking-core
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 65534
    fsGroup: 65534
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
      resources:
        limits:
          memory: "512Mi"
          cpu: "500m"
        requests:
          memory: "256Mi"
          cpu: "250m"
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir:
        sizeLimit: 100Mi
```

### 9.5 Network Policies (Kubernetes)

```yaml
# Deny all ingress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: neobank
spec:
  podSelector: {}
  policyTypes:
    - Ingress

---
# Allow banking-core to receive from API gateway only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-banking-core-ingress
  namespace: neobank
spec:
  podSelector:
    matchLabels:
      app: banking-core
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 8080

---
# Allow payment service to reach BaaS only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-payment-egress
  namespace: neobank
spec:
  podSelector:
    matchLabels:
      app: payment-service
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 10.0.20.0/24  # Data subnet (PostgreSQL)
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - ipBlock:
            cidr: 10.0.11.0/24  # Redis
      ports:
        - protocol: TCP
          port: 6379
    # BaaS partner IP ranges (Marqeta/Stripe)
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - protocol: TCP
          port: 443
```

---

## 10. Incident Response Plan

### 10.1 Incident Classification

| Category | Severity | Examples | SLA |
|---|---|---|---|
| **SEV-1: Critical** | Service down or data breach | Payment system failure, data exfiltration, unauthorized access to financial data | Respond: 15 min, Resolve: 4 hours |
| **SEV-2: High** | Significant degradation | Partial service outage, AML system failure, BaaS partner down | Respond: 1 hour, Resolve: 8 hours |
| **SEV-3: Medium** | Limited impact | Single-service degradation, failed deployment, non-critical CVE | Respond: 4 hours, Resolve: 24 hours |
| **SEV-4: Low** | Minimal impact | Informational finding, cosmetic issue, low-risk CVE | Respond: 24 hours, Resolve: 1 week |

### 10.2 Incident Response Lifecycle

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  1. DETECT   │────▶│ 2. TRIAGE    │────▶│ 3. CONTAIN  │
│              │     │              │     │             │
│ - Automated  │     │ - Classify   │     │ - Isolate   │
│   alerts     │     │   severity   │     │   affected  │
│ - User       │     │ - Assign     │     │   systems   │
│   reports    │     │   incident   │     │ - Preserve  │
│ - Security   │     │   commander  │     │   evidence  │
│   scans      │     │ - Notify     │     │ - Block     │
│              │     │   stakeholders│    │   attack    │
└─────────────┘     └──────────────┘     │   vector    │
                                          └──────┬──────┘
                                                 │
┌─────────────┐     ┌──────────────┐     ┌──────┴──────┐
│ 6. LESSONS  │◀────│ 5. RECOVER   │◀────│ 4. ERADICATE│
│  LEARNED    │     │              │     │             │
│             │     │ - Restore    │     │ - Remove    │
│ - Post-     │     │   services   │     │   root      │
│   mortem    │     │ - Verify     │     │   cause     │
│ - Update    │     │   integrity  │     │ - Patch     │
│   controls  │     │ - Monitor    │     │   systems   │
│ - Train     │     │   for        │     │ - Reset     │
│   team      │     │   recurrence │     │   credentials│
└─────────────┘     └──────────────┘     └─────────────┘
```

### 10.3 Regulatory Notification Timelines

| Jurisdiction | Regulator | Notification Deadline | Required Information |
|---|---|---|---|
| Kenya (KDPA) | ODPC (Data Protection Commissioner) | 72 hours from discovery | Nature of breach, categories of data, approximate number of affected users, measures taken |
| Kenya (CBK) | Central Bank of Kenya | 24 hours (cybersecurity incident) | Incident description, impact assessment, containment measures |
| Kenya (FRC) | Financial Reporting Centre | Immediate (if financial crime suspected) | SAR with supporting evidence |
| Zambia (DPA) | ZICTA | 48 hours from discovery | Breach notification with impact assessment |
| Zambia (BOZ) | Bank of Zambia | 24 hours (payment system incident) | Incident report with affected services and timeline |
| Zambia (FIC) | Financial Intelligence Centre | Immediate (if financial crime suspected) | STR with supporting evidence |

### 10.4 Communication Templates

**Customer notification (data breach):**

```
Subject: Important Security Notice — [Platform Name]

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected
your account. On [date], we detected [brief description].

What happened: [factual summary, no speculation]
What information was involved: [specific data types]
What we are doing: [containment and remediation steps]
What you can do: [actionable steps for the customer]

We have reported this incident to [relevant regulator] and are cooperating
fully with their investigation.

If you have questions, please contact our support team at [contact details].

Sincerely,
[CISO Name]
Chief Information Security Officer
```

### 10.5 Evidence Preservation

| Evidence Type | Collection Method | Storage |
|---|---|---|
| System logs | CloudWatch export to S3 (immutable) | S3 with Object Lock, 10-year retention |
| Database state | RDS snapshot at time of detection | Encrypted snapshot, preserved indefinitely |
| Network captures | VPC Flow Logs export | S3 with Object Lock |
| Application state | EKS pod memory dump (if applicable) | S3 with Object Lock |
| User session data | Keycloak session export | Encrypted backup |
| WAF logs | AWS WAF full logging to S3 | S3 with Object Lock |

---

## 11. SOC 2 Type II Controls Mapping

### 11.1 Trust Service Criteria Mapping

#### CC1 — Control Environment

| Control | Implementation | Evidence |
|---|---|---|
| CC1.1 — Board oversight | Quarterly security review with board/leadership | Meeting minutes, security dashboard reports |
| CC1.2 — Organizational structure | CISO reports to CEO; Security team independent of Engineering | Org chart, RACI matrix |
| CC1.3 — Commitment to competence | Annual security training for all staff; specialized training for security team | Training records, certifications (CISSP, CISA) |
| CC1.4 — Accountability | Individual access credentials; no shared accounts; role-based access | Keycloak user registry, access review logs |

#### CC2 — Communication & Information

| Control | Implementation | Evidence |
|---|---|---|
| CC2.1 — Internal communication | Security policies documented and accessible; Slack #security channel | Policy documents, acknowledgement records |
| CC2.2 — External communication | Privacy policy published; terms of service; data processing agreements with vendors | Public URLs, signed DPAs |
| CC2.3 — Security awareness | Monthly security newsletter; phishing simulation tests | Newsletter archives, simulation reports |

#### CC3 — Risk Assessment

| Control | Implementation | Evidence |
|---|---|---|
| CC3.1 — Risk identification | Quarterly threat modeling sessions; OWASP risk rating for each service | Threat models, risk register |
| CC3.2 — Risk analysis | Risk scoring matrix (likelihood x impact); maintained in risk register | Risk register with scoring history |
| CC3.3 — Fraud risk | Transaction monitoring rules (Section 7.2); AML program | Rule engine configuration, SAR filings |
| CC3.4 — Change risk | Change management process with security review gate | PR reviews, deployment approvals |

#### CC5 — Control Activities (Logical Access)

| Control | Implementation | Evidence |
|---|---|---|
| CC5.1 — Logical access | Keycloak RBAC + ABAC; MFA for all admin access | Keycloak configuration export, MFA enrollment records |
| CC5.2 — Access provisioning | Onboarding checklist; role assignment requires manager approval | Jira tickets, approval logs |
| CC5.3 — Access review | Quarterly access review; auto-deprovisioning for terminated employees | Access review reports, HR integration logs |
| CC5.4 — Physical access | AWS data centers (SOC 2 Type II certified); office access cards | AWS compliance reports, access card logs |
| CC5.5 — Logical removal | Immediate Keycloak deactivation on termination; SSH key revocation | Offboarding checklist, Keycloak audit logs |

#### CC6 — System Operations

| Control | Implementation | Evidence |
|---|---|---|
| CC6.1 — Vulnerability management | Quarterly ASV scans; Dependabot + Snyk continuous scanning | Scan reports, CVE resolution records |
| CC6.2 — Infrastructure monitoring | Grafana + Prometheus + CloudWatch; PagerDuty escalation | Dashboard screenshots, alert history |
| CC6.3 — Incident management | Documented IR plan (Section 10); PagerDuty on-call rotation | IR plan document, incident post-mortems |
| CC6.4 — Business continuity | Multi-AZ RDS; EKS across 2 AZs; DR region (eu-west-1) | BCP document, DR test results |
| CC6.5 — Data backup | Daily automated RDS snapshots; S3 cross-region replication | Backup logs, restore test records |

#### CC7 — Change Management

| Control | Implementation | Evidence |
|---|---|---|
| CC7.1 — Change authorization | All production changes require PR approval (2 reviewers) | GitHub PR merge rules, approval history |
| CC7.2 — Change testing | CI pipeline: unit tests, integration tests, security scans (SAST/DAST) | GitHub Actions logs, test coverage reports |
| CC7.3 — Change deployment | Automated CI/CD via GitHub Actions; blue-green deployments; automatic rollback | Deployment logs, rollback records |
| CC7.4 — Emergency changes | Emergency change process with post-hoc review within 48 hours | Emergency change log, retrospective records |

#### CC8 — Risk Mitigation

| Control | Implementation | Evidence |
|---|---|---|
| CC8.1 — Vendor assessment | Due diligence questionnaire for all vendors handling data; annual reassessment | Vendor assessment records, DPAs |
| CC8.2 — Insurance | Cyber liability insurance covering data breach costs | Insurance policy document |
| CC8.3 — Recovery procedures | Documented RTO (4 hours) and RPO (1 hour) | BCP document, DR test results |

### 11.2 SOC 2 Audit Timeline

| Activity | Timeline | Responsible |
|---|---|---|
| Controls design and implementation | Months 1-3 (Phase 1) | Security Engineer + CISO |
| Type I readiness assessment | Month 4 | External auditor (readiness) |
| Type I audit | Month 6 | Accredited SOC 2 auditor |
| Observation period begins | Month 7 | Continuous |
| Type II audit (6-month observation) | Month 12 | Accredited SOC 2 auditor |
| Remediation of findings | Month 13-14 | Security team |
| Annual Type II renewal | Every 12 months | Accredited SOC 2 auditor |

---

## 12. Security Testing & Validation

### 12.1 Testing Schedule

| Test Type | Frequency | Scope | Performed By |
|---|---|---|---|
| SAST (Static Analysis) | Every PR | All code changes | Automated (Semgrep + CodeQL) |
| SCA (Software Composition Analysis) | Daily | All dependencies | Automated (Snyk + Dependabot) |
| DAST (Dynamic Analysis) | Weekly | Staging environment | Automated (OWASP ZAP) |
| Container scanning | Every build | All Docker images | Automated (Trivy) |
| Infrastructure scanning | Weekly | Terraform configurations | Automated (Checkov + tfsec) |
| Penetration testing | Annual | Full scope (web + mobile + API) | External firm (PCI-QSA certified) |
| Red team exercise | Annual (Year 2+) | Full scope including social engineering | External firm |
| ASV vulnerability scan | Quarterly | All internet-facing systems | Approved Scanning Vendor |
| DR failover test | Semi-annual | Full platform failover to DR region | Security + Infrastructure team |
| Backup restore test | Quarterly | Database and S3 restore | Infrastructure team |

### 12.2 Vulnerability Management SLA

| Severity | CVSS Score | Remediation SLA | Example |
|---|---|---|---|
| Critical | 9.0 - 10.0 | 24 hours | Remote code execution, SQL injection in production |
| High | 7.0 - 8.9 | 72 hours | Authentication bypass, privilege escalation |
| Medium | 4.0 - 6.9 | 30 days | XSS, information disclosure |
| Low | 0.1 - 3.9 | 90 days | Minor information leak, denial of service (limited) |

### 12.3 Security Review Gates

Every feature or change must pass through these gates before production deployment:

```
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
│   Code     │──▶│   CI       │──▶│  Security  │──▶│ Production │
│   Review   │   │   Pipeline │   │  Review    │   │  Deploy    │
│            │   │            │   │            │   │            │
│ - 2 approvers │ - SAST scan │   │ - Threat   │   │ - Blue-green│
│ - Security │   │ - SCA scan │   │   model    │   │ - Canary   │
│   checklist│   │ - Unit test│   │   (if new  │   │ - Auto-    │
│            │   │ - DAST scan│   │   feature) │   │   rollback │
│            │   │ - Container│   │ - Pen test │   │            │
│            │   │   scan     │   │   (if high │   │            │
│            │   │            │   │   risk)    │   │            │
└────────────┘   └────────────┘   └────────────┘   └────────────┘
```

---

## 13. Appendices

### Appendix A: Security Configuration Checklist

Pre-launch security verification checklist:

- [ ] TLS 1.3 enabled on all endpoints; TLS 1.2 minimum enforced
- [ ] HSTS headers deployed with preload directive
- [ ] All security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Certificate pinning implemented in mobile app
- [ ] Keycloak realms configured with brute force protection
- [ ] MFA enforced for all admin accounts
- [ ] Rate limiting active on all endpoints
- [ ] WAF rules deployed and tested
- [ ] Field-level encryption active for all PII fields
- [ ] KMS keys created with rotation enabled
- [ ] Database encryption at rest verified
- [ ] VPC security groups reviewed (least privilege)
- [ ] Network policies applied in Kubernetes
- [ ] Bastion host access restricted to VPN + office IPs
- [ ] Secrets Manager rotation configured for all secrets
- [ ] Container images scanned and using distroless base
- [ ] Audit logging active and immutable
- [ ] SIEM alerts configured and tested
- [ ] Incident response plan reviewed and tabletop exercise completed
- [ ] Regulatory registrations filed (ODPC, ZICTA)
- [ ] DPAs signed with all data processors
- [ ] PCI-DSS SAQ-A completed
- [ ] Penetration test completed with findings remediated
- [ ] DR failover tested successfully
- [ ] Backup restore tested successfully

### Appendix B: Third-Party Security Requirements

All third-party vendors handling NeoBank or DisbursePro data must meet:

| Requirement | Minimum Standard |
|---|---|
| Compliance certification | SOC 2 Type II or ISO 27001 |
| Encryption | TLS 1.2+ in transit; AES-256 at rest |
| Data processing agreement | Signed DPA with KDPA/Zambia DPA-compliant clauses |
| Breach notification | Within 24 hours of discovery |
| Sub-processor transparency | Written notice 30 days before engaging new sub-processors |
| Right to audit | Annual audit right (remote or on-site) |
| Data deletion | Certifiable deletion within 30 days of contract termination |
| Insurance | Cyber liability insurance with minimum $1M coverage |

### Appendix C: Key Vendor Security Posture

| Vendor | Service | PCI-DSS | SOC 2 | Data Location |
|---|---|---|---|---|
| Marqeta / Stripe Issuing | Card BaaS | Level 1 | Type II | US (card data only — tokenized) |
| Smile Identity | KYC/AML | N/A | Type II | Nigeria + South Africa |
| Safaricom (Daraja) | M-Pesa | N/A | N/A (CBK regulated) | Kenya |
| Airtel Money | Mobile money | N/A | N/A (BOZ regulated) | Multi-country |
| MTN MoMo | Mobile money | N/A | N/A (BOZ regulated) | Multi-country |
| Flutterwave | Payment aggregation | PCI-DSS | Type II | Nigeria + US |
| AWS | Cloud infrastructure | Level 1 | Type II | af-south-1 (Cape Town) |

### Appendix D: Glossary

| Term | Definition |
|---|---|
| AML | Anti-Money Laundering |
| ABAC | Attribute-Based Access Control |
| ASV | Approved Scanning Vendor (PCI-DSS) |
| BaaS | Banking-as-a-Service |
| BOZ | Bank of Zambia |
| CBK | Central Bank of Kenya |
| CDD | Customer Due Diligence |
| CFT | Countering the Financing of Terrorism |
| CMK | Customer Managed Key (AWS KMS) |
| CSP | Content Security Policy |
| CTR | Cash Transaction Report |
| CVE | Common Vulnerabilities and Exposures |
| DAST | Dynamic Application Security Testing |
| DPA | Data Processing Agreement |
| DPIA | Data Protection Impact Assessment |
| DR | Disaster Recovery |
| EDD | Enhanced Due Diligence |
| FIC | Financial Intelligence Centre (Zambia) |
| FRC | Financial Reporting Centre (Kenya) |
| HSTS | HTTP Strict Transport Security |
| IAM | Identity and Access Management |
| IR | Incident Response |
| KDM | Key Data Management |
| KDPA | Kenya Data Protection Act 2019 |
| KMS | Key Management Service |
| KYB | Know Your Business |
| KYC | Know Your Customer |
| MCC | Merchant Category Code |
| MDR | Merchant Discount Rate |
| mTLS | Mutual TLS |
| NRC | National Registration Card (Zambia) |
| ODPC | Office of the Data Protection Commissioner (Kenya) |
| OIDC | OpenID Connect |
| PAN | Primary Account Number |
| PCI-DSS | Payment Card Industry Data Security Standard |
| PEP | Politically Exposed Person |
| PKCE | Proof Key for Code Exchange |
| QSA | Qualified Security Assessor |
| RBAC | Role-Based Access Control |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| SAQ | Self-Assessment Questionnaire |
| SAR | Suspicious Activity Report |
| SAST | Static Application Security Testing |
| SCA | Software Composition Analysis |
| SIEM | Security Information and Event Management |
| SOC | System and Organization Controls |
| STR | Suspicious Transaction Report |
| TDE | Transparent Data Encryption |
| TOTP | Time-Based One-Time Password |
| WAF | Web Application Firewall |
| ZICTA | Zambia Information and Communications Technology Authority |

---

*This document is classified CONFIDENTIAL and is intended for internal use by Qsoftwares Ltd. engineering, security, and compliance teams. Distribution to third parties requires written approval from the CISO.*

*Last updated: 2026-04-04 | Next review: 2026-07-04*
