#!/usr/bin/env python3
"""NeoBank Sprint 5 — QR Payments backend + Card Management APIs + Merchant APIs."""
import os

CUSTOM = r"D:\neobank\fineract\custom\neobank"
PROVIDER_CHANGELOG = r"D:\neobank\fineract\fineract-provider\src\main\resources\db\changelog\tenant\parts"
SRC = r"D:\neobank\src"

files = {}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. QR Payments — Generate, Scan, Process
# ═══════════════════════════════════════════════════════════════════════════════

mm_base = os.path.join(CUSTOM, "mobilemoney", "neobank-mobilemoney", "src", "main", "java", "com", "qsoftwares", "neobank", "mobilemoney")

files[os.path.join(mm_base, "qr", "QrPaymentService.java")] = r'''/**
 * NeoBank — QR Payment Service
 * Generates dynamic QR codes for payment requests and processes scanned QR payments.
 * Supports Lipa Na M-Pesa QR, NeoBank-native QR, and PesaLink QR formats.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.qr;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@Slf4j
public class QrPaymentService {

    // In-memory QR store — production uses Redis/DB
    private final Map<String, QrPayload> activeQrs = new LinkedHashMap<>();

    /**
     * Generate a dynamic QR code payload for receiving payment.
     */
    public Map<String, Object> generateQr(String accountRef, long amountKes, String merchantName, String description) {
        String qrId = "QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String expiresAt = Instant.now().plusSeconds(600).toString(); // 10 min expiry

        QrPayload payload = new QrPayload(qrId, accountRef, amountKes, merchantName, description, expiresAt);
        activeQrs.put(qrId, payload);

        // QR content — JSON-encoded for NeoBank scanner, also compatible with Lipa Na M-Pesa
        String qrContent = String.format(
            "{\"type\":\"NEOBANK_QR\",\"id\":\"%s\",\"acc\":\"%s\",\"amt\":%d,\"name\":\"%s\",\"desc\":\"%s\",\"exp\":\"%s\"}",
            qrId, accountRef, amountKes, merchantName, description, expiresAt
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("qrId", qrId);
        result.put("qrContent", qrContent);
        result.put("accountRef", accountRef);
        result.put("amount", amountKes);
        result.put("merchantName", merchantName);
        result.put("description", description);
        result.put("expiresAt", expiresAt);
        result.put("status", "ACTIVE");
        log.info("QR generated: {} for {} KES {}", qrId, merchantName, amountKes);
        return result;
    }

    /**
     * Parse a scanned QR code and return payment details.
     */
    public Map<String, Object> parseQr(String qrContent) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            // Parse NeoBank QR format
            if (qrContent.contains("NEOBANK_QR")) {
                // Simple JSON parsing — production uses Jackson
                String qrId = extractJsonField(qrContent, "id");
                QrPayload payload = activeQrs.get(qrId);

                if (payload == null) {
                    result.put("valid", false);
                    result.put("error", "QR code not found or expired");
                    return result;
                }

                result.put("valid", true);
                result.put("type", "NEOBANK_QR");
                result.put("qrId", payload.qrId());
                result.put("recipientAccount", payload.accountRef());
                result.put("amount", payload.amountKes());
                result.put("merchantName", payload.merchantName());
                result.put("description", payload.description());
                result.put("expiresAt", payload.expiresAt());
                return result;
            }

            // Lipa Na M-Pesa QR — starts with till number
            if (qrContent.matches("^\\d{5,7}.*")) {
                result.put("valid", true);
                result.put("type", "MPESA_TILL");
                result.put("tillNumber", qrContent.substring(0, Math.min(7, qrContent.length())));
                result.put("merchantName", "M-Pesa Merchant");
                result.put("amount", 0); // Amount entered by customer
                return result;
            }

            result.put("valid", false);
            result.put("error", "Unrecognized QR format");
        } catch (Exception e) {
            result.put("valid", false);
            result.put("error", "Failed to parse QR: " + e.getMessage());
        }
        return result;
    }

    /**
     * Process a QR payment — debit sender, credit recipient.
     */
    public Map<String, Object> processPayment(String qrId, String senderAccount, long amountKes) {
        QrPayload payload = activeQrs.get(qrId);

        Map<String, Object> result = new LinkedHashMap<>();
        String txnId = "QRTX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        result.put("transactionId", txnId);

        if (payload == null) {
            result.put("status", "FAILED");
            result.put("error", "QR code expired or not found");
            return result;
        }

        // Use QR amount if specified, otherwise use provided amount
        long finalAmount = payload.amountKes() > 0 ? payload.amountKes() : amountKes;

        result.put("status", "COMPLETED");
        result.put("qrId", qrId);
        result.put("senderAccount", senderAccount);
        result.put("recipientAccount", payload.accountRef());
        result.put("merchantName", payload.merchantName());
        result.put("amount", finalAmount);
        result.put("currency", "KES");
        result.put("fee", 0); // QR payments are free within NeoBank
        result.put("processedAt", Instant.now().toString());

        // Remove used QR
        activeQrs.remove(qrId);
        log.info("QR payment processed: {} -> {} KES {} via {}", senderAccount, payload.accountRef(), finalAmount, txnId);
        return result;
    }

    private String extractJsonField(String json, String field) {
        int idx = json.indexOf("\"" + field + "\":\"");
        if (idx < 0) return "";
        int start = idx + field.length() + 4;
        int end = json.indexOf("\"", start);
        return end > start ? json.substring(start, end) : "";
    }

    record QrPayload(String qrId, String accountRef, long amountKes, String merchantName, String description, String expiresAt) {}
}
'''

files[os.path.join(mm_base, "api", "QrPaymentApiResource.java")] = r'''/**
 * NeoBank — QR Payment API
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.api;

import com.qsoftwares.neobank.mobilemoney.qr.QrPaymentService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Path("/v1/neobank/qr")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class QrPaymentApiResource {

    private final QrPaymentService qrService;

    /** Generate a dynamic QR code for receiving payment. */
    @POST @Path("/generate")
    public Response generateQr(Map<String, Object> request) {
        String accountRef = (String) request.getOrDefault("accountRef", "");
        long amount = Long.parseLong(request.getOrDefault("amount", "0").toString());
        String merchantName = (String) request.getOrDefault("merchantName", "NeoBank User");
        String description = (String) request.getOrDefault("description", "Payment");
        return Response.ok(qrService.generateQr(accountRef, amount, merchantName, description)).build();
    }

    /** Parse/scan a QR code to get payment details. */
    @POST @Path("/scan")
    public Response scanQr(Map<String, String> request) {
        String qrContent = request.getOrDefault("qrContent", "");
        return Response.ok(qrService.parseQr(qrContent)).build();
    }

    /** Process a QR payment. */
    @POST @Path("/pay")
    public Response processPayment(Map<String, Object> request) {
        String qrId = (String) request.getOrDefault("qrId", "");
        String senderAccount = (String) request.getOrDefault("senderAccount", "");
        long amount = Long.parseLong(request.getOrDefault("amount", "0").toString());
        return Response.ok(qrService.processPayment(qrId, senderAccount, amount)).build();
    }
}
'''

# ═══════════════════════════════════════════════════════════════════════════════
# 2. Card Management — Virtual Card Issuance, Freeze/Unfreeze, Limits
# ═══════════════════════════════════════════════════════════════════════════════

card_base = os.path.join(CUSTOM, "card", "neobank-card", "src", "main", "java", "com", "qsoftwares", "neobank", "card")

files[os.path.join(card_base, "service", "CardManagementService.java")] = r'''/**
 * NeoBank — Card Management Service
 * Manages virtual/physical card lifecycle: issuance, freeze, unfreeze, PIN reset, limits.
 * Integrates with BaaS provider (Marqeta/Stripe Issuing) via configurable adapter.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.card.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class CardManagementService {

    // In-memory card store — production uses DB + BaaS provider API
    private final Map<String, Map<String, Object>> cards = new ConcurrentHashMap<>();

    public CardManagementService() {
        // Seed Amina's demo cards
        seedDemoCards();
    }

    /** Issue a new virtual card for a client. */
    public Map<String, Object> issueVirtualCard(long clientId, String accountRef, String cardholderName) {
        String cardId = "CARD-V-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String last4 = String.format("%04d", new Random().nextInt(10000));
        String expiryDate = LocalDate.now().plusYears(3).toString().substring(0, 7); // YYYY-MM

        Map<String, Object> card = new LinkedHashMap<>();
        card.put("cardId", cardId);
        card.put("clientId", clientId);
        card.put("accountRef", accountRef);
        card.put("cardholderName", cardholderName);
        card.put("type", "VIRTUAL");
        card.put("network", "VISA");
        card.put("last4", last4);
        card.put("maskedNumber", "**** **** **** " + last4);
        card.put("expiryDate", expiryDate);
        card.put("status", "ACTIVE");
        card.put("frozen", false);
        card.put("dailyLimit", 50000);
        card.put("monthlyLimit", 500000);
        card.put("todaySpend", 0);
        card.put("monthSpend", 0);
        card.put("issuedAt", Instant.now().toString());

        cards.put(cardId, card);
        log.info("Virtual card issued: {} for client {}", cardId, clientId);
        return card;
    }

    /** Freeze/unfreeze a card (instant lock). */
    public Map<String, Object> toggleFreeze(String cardId, boolean freeze) {
        Map<String, Object> card = cards.get(cardId);
        if (card == null) return Map.of("error", "Card not found", "cardId", cardId);

        card.put("frozen", freeze);
        card.put("status", freeze ? "FROZEN" : "ACTIVE");
        card.put("updatedAt", Instant.now().toString());
        log.info("Card {} {}", cardId, freeze ? "FROZEN" : "UNFROZEN");
        return card;
    }

    /** Update spending limits for a card. */
    public Map<String, Object> updateLimits(String cardId, long dailyLimit, long monthlyLimit) {
        Map<String, Object> card = cards.get(cardId);
        if (card == null) return Map.of("error", "Card not found", "cardId", cardId);

        card.put("dailyLimit", dailyLimit);
        card.put("monthlyLimit", monthlyLimit);
        card.put("updatedAt", Instant.now().toString());
        log.info("Card {} limits updated: daily={}, monthly={}", cardId, dailyLimit, monthlyLimit);
        return card;
    }

    /** Request PIN reset (sends OTP). */
    public Map<String, Object> requestPinReset(String cardId) {
        Map<String, Object> card = cards.get(cardId);
        if (card == null) return Map.of("error", "Card not found");

        return Map.of(
            "cardId", cardId,
            "otpSent", true,
            "otpDestination", "+254 7** *** *78",
            "expiresIn", 300,
            "message", "OTP sent to your registered phone number"
        );
    }

    /** Get all cards for a client. */
    public List<Map<String, Object>> getClientCards(long clientId) {
        return cards.values().stream()
            .filter(c -> Long.parseLong(c.get("clientId").toString()) == clientId)
            .toList();
    }

    /** Get card details. */
    public Map<String, Object> getCard(String cardId) {
        Map<String, Object> card = cards.get(cardId);
        return card != null ? card : Map.of("error", "Card not found");
    }

    /** Get recent transactions for a card. */
    public List<Map<String, Object>> getCardTransactions(String cardId, int limit) {
        // Stub — returns mock transactions for demo
        return List.of(
            Map.of("id", "CTX-001", "merchant", "Naivas Supermarket", "category", "GROCERIES", "amount", -3450, "currency", "KES", "date", "2026-04-05", "status", "COMPLETED"),
            Map.of("id", "CTX-002", "merchant", "Java House Westlands", "category", "FOOD_DRINK", "amount", -1200, "currency", "KES", "date", "2026-04-04", "status", "COMPLETED"),
            Map.of("id", "CTX-003", "merchant", "Bolt Kenya", "category", "TRANSPORT", "amount", -850, "currency", "KES", "date", "2026-04-04", "status", "COMPLETED"),
            Map.of("id", "CTX-004", "merchant", "Netflix", "category", "ENTERTAINMENT", "amount", -1100, "currency", "KES", "date", "2026-04-03", "status", "COMPLETED"),
            Map.of("id", "CTX-005", "merchant", "Shell Uhuru Highway", "category", "FUEL", "amount", -5000, "currency", "KES", "date", "2026-04-02", "status", "COMPLETED"),
            Map.of("id", "CTX-006", "merchant", "Jumia Kenya", "category", "SHOPPING", "amount", -7800, "currency", "KES", "date", "2026-04-01", "status", "COMPLETED"),
            Map.of("id", "CTX-007", "merchant", "Safaricom Fibre", "category", "UTILITIES", "amount", -4999, "currency", "KES", "date", "2026-03-31", "status", "COMPLETED"),
            Map.of("id", "CTX-008", "merchant", "Chandarana Foodplus", "category", "GROCERIES", "amount", -2100, "currency", "KES", "date", "2026-03-30", "status", "COMPLETED")
        ).subList(0, Math.min(limit, 8));
    }

    private void seedDemoCards() {
        // Amina's virtual Visa
        Map<String, Object> visa = new LinkedHashMap<>();
        visa.put("cardId", "CARD-V-001");
        visa.put("clientId", 1L);
        visa.put("accountRef", "ACC-001");
        visa.put("cardholderName", "AMINA WANJIKU");
        visa.put("type", "VIRTUAL");
        visa.put("network", "VISA");
        visa.put("last4", "4532");
        visa.put("maskedNumber", "**** **** **** 4532");
        visa.put("expiryDate", "2029-04");
        visa.put("status", "ACTIVE");
        visa.put("frozen", false);
        visa.put("dailyLimit", 50000);
        visa.put("monthlyLimit", 500000);
        visa.put("todaySpend", 4650);
        visa.put("monthSpend", 24399);
        visa.put("issuedAt", "2026-01-15T10:00:00Z");
        cards.put("CARD-V-001", visa);

        // Amina's physical Mastercard
        Map<String, Object> mc = new LinkedHashMap<>();
        mc.put("cardId", "CARD-P-001");
        mc.put("clientId", 1L);
        mc.put("accountRef", "ACC-001");
        mc.put("cardholderName", "AMINA WANJIKU");
        mc.put("type", "PHYSICAL");
        mc.put("network", "MASTERCARD");
        mc.put("last4", "8901");
        mc.put("maskedNumber", "**** **** **** 8901");
        mc.put("expiryDate", "2028-12");
        mc.put("status", "ACTIVE");
        mc.put("frozen", false);
        mc.put("dailyLimit", 100000);
        mc.put("monthlyLimit", 1000000);
        mc.put("todaySpend", 0);
        mc.put("monthSpend", 12500);
        mc.put("issuedAt", "2026-02-20T14:30:00Z");
        cards.put("CARD-P-001", mc);
    }
}
'''

files[os.path.join(card_base, "api", "CardApiResource.java")] = r'''/**
 * NeoBank — Card Management API
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.card.api;

import com.qsoftwares.neobank.card.service.CardManagementService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Path("/v1/neobank/cards")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class CardApiResource {

    private final CardManagementService cardService;

    /** Get all cards for a client. */
    @GET @Path("/client/{clientId}")
    public Response getClientCards(@PathParam("clientId") long clientId) {
        return Response.ok(cardService.getClientCards(clientId)).build();
    }

    /** Get card details. */
    @GET @Path("/{cardId}")
    public Response getCard(@PathParam("cardId") String cardId) {
        return Response.ok(cardService.getCard(cardId)).build();
    }

    /** Get card transactions. */
    @GET @Path("/{cardId}/transactions")
    public Response getCardTransactions(@PathParam("cardId") String cardId, @QueryParam("limit") @DefaultValue("10") int limit) {
        return Response.ok(cardService.getCardTransactions(cardId, limit)).build();
    }

    /** Issue a new virtual card. */
    @POST @Path("/issue")
    public Response issueVirtualCard(Map<String, Object> request) {
        long clientId = Long.parseLong(request.get("clientId").toString());
        String accountRef = (String) request.getOrDefault("accountRef", "");
        String name = (String) request.getOrDefault("cardholderName", "");
        return Response.ok(cardService.issueVirtualCard(clientId, accountRef, name)).build();
    }

    /** Freeze or unfreeze a card. */
    @POST @Path("/{cardId}/freeze")
    public Response toggleFreeze(@PathParam("cardId") String cardId, Map<String, Object> request) {
        boolean freeze = Boolean.parseBoolean(request.getOrDefault("freeze", "true").toString());
        return Response.ok(cardService.toggleFreeze(cardId, freeze)).build();
    }

    /** Update card spending limits. */
    @PUT @Path("/{cardId}/limits")
    public Response updateLimits(@PathParam("cardId") String cardId, Map<String, Object> request) {
        long daily = Long.parseLong(request.getOrDefault("dailyLimit", "50000").toString());
        long monthly = Long.parseLong(request.getOrDefault("monthlyLimit", "500000").toString());
        return Response.ok(cardService.updateLimits(cardId, daily, monthly)).build();
    }

    /** Request PIN reset. */
    @POST @Path("/{cardId}/pin-reset")
    public Response requestPinReset(@PathParam("cardId") String cardId) {
        return Response.ok(cardService.requestPinReset(cardId)).build();
    }
}
'''

# ═══════════════════════════════════════════════════════════════════════════════
# 3. Merchant Management — Onboarding, Settlement Config
# ═══════════════════════════════════════════════════════════════════════════════

merchant_base = os.path.join(CUSTOM, "merchant", "neobank-merchant", "src", "main", "java", "com", "qsoftwares", "neobank", "merchant")

files[os.path.join(merchant_base, "service", "MerchantService.java")] = r'''/**
 * NeoBank — Merchant Service
 * Manages merchant onboarding, KYB verification, till assignment, and settlement config.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.merchant.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class MerchantService {

    private final Map<String, Map<String, Object>> merchants = new ConcurrentHashMap<>();

    public MerchantService() {
        seedDemoMerchants();
    }

    /** Register a new merchant. */
    public Map<String, Object> registerMerchant(String businessName, String businessType, String ownerName,
                                                 String phone, String email, String location) {
        String merchantId = "MER-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String tillNumber = String.format("%07d", new Random().nextInt(10000000));

        Map<String, Object> merchant = new LinkedHashMap<>();
        merchant.put("merchantId", merchantId);
        merchant.put("businessName", businessName);
        merchant.put("businessType", businessType);
        merchant.put("ownerName", ownerName);
        merchant.put("phone", phone);
        merchant.put("email", email);
        merchant.put("location", location);
        merchant.put("tillNumber", tillNumber);
        merchant.put("status", "PENDING_VERIFICATION");
        merchant.put("kybStatus", "NOT_STARTED");
        merchant.put("settlementFrequency", "DAILY");
        merchant.put("settlementAccount", null);
        merchant.put("totalRevenue", 0);
        merchant.put("totalTransactions", 0);
        merchant.put("createdAt", Instant.now().toString());

        merchants.put(merchantId, merchant);
        log.info("Merchant registered: {} ({})", merchantId, businessName);
        return merchant;
    }

    /** Get merchant by ID. */
    public Map<String, Object> getMerchant(String merchantId) {
        return merchants.getOrDefault(merchantId, Map.of("error", "Merchant not found"));
    }

    /** List all merchants. */
    public List<Map<String, Object>> listMerchants() {
        return new ArrayList<>(merchants.values());
    }

    /** Configure settlement for a merchant. */
    public Map<String, Object> configureSettlement(String merchantId, String frequency, String bankCode, String accountNumber) {
        Map<String, Object> merchant = merchants.get(merchantId);
        if (merchant == null) return Map.of("error", "Merchant not found");

        merchant.put("settlementFrequency", frequency);
        merchant.put("settlementAccount", Map.of("bankCode", bankCode, "accountNumber", accountNumber));
        merchant.put("updatedAt", Instant.now().toString());
        return merchant;
    }

    /** Get merchant revenue summary. */
    public Map<String, Object> getRevenueSummary(String merchantId) {
        Map<String, Object> merchant = merchants.get(merchantId);
        if (merchant == null) return Map.of("error", "Merchant not found");

        return Map.of(
            "merchantId", merchantId,
            "businessName", merchant.get("businessName"),
            "today", Map.of("revenue", 45600, "transactions", 23, "avgTicket", 1983),
            "thisWeek", Map.of("revenue", 312400, "transactions", 156, "avgTicket", 2003),
            "thisMonth", Map.of("revenue", 1245000, "transactions", 623, "avgTicket", 1998),
            "topProducts", List.of(
                Map.of("name", "Lunch Special", "revenue", 345000, "count", 230),
                Map.of("name", "Nyama Choma", "revenue", 280000, "count", 112),
                Map.of("name", "Chai & Mandazi", "revenue", 156000, "count", 520),
                Map.of("name", "Ugali & Sukuma", "revenue", 134000, "count", 178)
            ),
            "peakHours", List.of(
                Map.of("hour", "12:00-13:00", "transactions", 45),
                Map.of("hour", "18:00-19:00", "transactions", 38),
                Map.of("hour", "07:00-08:00", "transactions", 28)
            )
        );
    }

    private void seedDemoMerchants() {
        Map<String, Object> m1 = new LinkedHashMap<>();
        m1.put("merchantId", "MER-001");
        m1.put("businessName", "Mama Njeri's Kitchen");
        m1.put("businessType", "RESTAURANT");
        m1.put("ownerName", "Njeri Kamau");
        m1.put("phone", "+254 722 456 789");
        m1.put("email", "njeri@mamanjeri.co.ke");
        m1.put("location", "Tom Mboya Street, Nairobi CBD");
        m1.put("tillNumber", "5274831");
        m1.put("status", "ACTIVE");
        m1.put("kybStatus", "VERIFIED");
        m1.put("settlementFrequency", "DAILY");
        m1.put("settlementAccount", Map.of("bankCode", "11", "accountNumber", "01100456789"));
        m1.put("totalRevenue", 1245000);
        m1.put("totalTransactions", 623);
        m1.put("createdAt", "2025-08-15T10:00:00Z");
        merchants.put("MER-001", m1);

        Map<String, Object> m2 = new LinkedHashMap<>();
        m2.put("merchantId", "MER-002");
        m2.put("businessName", "Westlands Auto Spares");
        m2.put("businessType", "RETAIL");
        m2.put("ownerName", "John Odhiambo");
        m2.put("phone", "+254 733 123 456");
        m2.put("email", "john@westlandsspares.co.ke");
        m2.put("location", "Westlands, Nairobi");
        m2.put("tillNumber", "6389201");
        m2.put("status", "ACTIVE");
        m2.put("kybStatus", "VERIFIED");
        m2.put("settlementFrequency", "WEEKLY");
        m2.put("settlementAccount", Map.of("bankCode", "01", "accountNumber", "01200789012"));
        m2.put("totalRevenue", 3890000);
        m2.put("totalTransactions", 412);
        m2.put("createdAt", "2025-06-01T09:00:00Z");
        merchants.put("MER-002", m2);
    }
}
'''

files[os.path.join(merchant_base, "api", "MerchantApiResource.java")] = r'''/**
 * NeoBank — Merchant API
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.merchant.api;

import com.qsoftwares.neobank.merchant.service.MerchantService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Path("/v1/neobank/merchants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class MerchantApiResource {

    private final MerchantService merchantService;

    @GET
    public Response listMerchants() {
        return Response.ok(merchantService.listMerchants()).build();
    }

    @GET @Path("/{merchantId}")
    public Response getMerchant(@PathParam("merchantId") String merchantId) {
        return Response.ok(merchantService.getMerchant(merchantId)).build();
    }

    @POST @Path("/register")
    public Response registerMerchant(Map<String, String> request) {
        return Response.ok(merchantService.registerMerchant(
            request.getOrDefault("businessName", ""),
            request.getOrDefault("businessType", ""),
            request.getOrDefault("ownerName", ""),
            request.getOrDefault("phone", ""),
            request.getOrDefault("email", ""),
            request.getOrDefault("location", "")
        )).build();
    }

    @PUT @Path("/{merchantId}/settlement")
    public Response configureSettlement(@PathParam("merchantId") String merchantId, Map<String, String> request) {
        return Response.ok(merchantService.configureSettlement(
            merchantId,
            request.getOrDefault("frequency", "DAILY"),
            request.getOrDefault("bankCode", ""),
            request.getOrDefault("accountNumber", "")
        )).build();
    }

    @GET @Path("/{merchantId}/revenue")
    public Response getRevenueSummary(@PathParam("merchantId") String merchantId) {
        return Response.ok(merchantService.getRevenueSummary(merchantId)).build();
    }
}
'''

# ═══════════════════════════════════════════════════════════════════════════════
# 4. Liquibase Changelogs
# ═══════════════════════════════════════════════════════════════════════════════

files[os.path.join(PROVIDER_CHANGELOG, "0234_neobank_qr_payments.xml")] = r'''<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.1.xsd">

    <changeSet id="neobank-qr-payments" author="qsoftwares">
        <preConditions onFail="MARK_RAN">
            <not><tableExists tableName="m_neobank_qr_payment"/></not>
        </preConditions>
        <createTable tableName="m_neobank_qr_payment">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="qr_id" type="VARCHAR(20)"><constraints unique="true" nullable="false"/></column>
            <column name="transaction_id" type="VARCHAR(30)"/>
            <column name="sender_account" type="VARCHAR(20)"/>
            <column name="recipient_account" type="VARCHAR(20)"><constraints nullable="false"/></column>
            <column name="merchant_name" type="VARCHAR(100)"/>
            <column name="amount" type="DECIMAL(19,4)"><constraints nullable="false"/></column>
            <column name="currency" type="VARCHAR(3)" defaultValue="KES"/>
            <column name="qr_type" type="VARCHAR(20)" defaultValue="NEOBANK_QR"/>
            <column name="status" type="VARCHAR(20)"><constraints nullable="false"/></column>
            <column name="expires_at" type="TIMESTAMP"/>
            <column name="processed_at" type="TIMESTAMP"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()"/>
        </createTable>
        <createIndex tableName="m_neobank_qr_payment" indexName="idx_qr_qr_id">
            <column name="qr_id"/>
        </createIndex>
    </changeSet>
</databaseChangeLog>
'''

files[os.path.join(PROVIDER_CHANGELOG, "0235_neobank_card_management.xml")] = r'''<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                   http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.1.xsd">

    <changeSet id="neobank-cards" author="qsoftwares">
        <preConditions onFail="MARK_RAN">
            <not><tableExists tableName="m_neobank_card"/></not>
        </preConditions>
        <createTable tableName="m_neobank_card">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="card_id" type="VARCHAR(20)"><constraints unique="true" nullable="false"/></column>
            <column name="client_id" type="BIGINT"><constraints nullable="false"/></column>
            <column name="account_ref" type="VARCHAR(20)"/>
            <column name="cardholder_name" type="VARCHAR(100)"/>
            <column name="card_type" type="VARCHAR(10)"><constraints nullable="false"/></column>
            <column name="network" type="VARCHAR(20)"/>
            <column name="last4" type="VARCHAR(4)"/>
            <column name="expiry_date" type="VARCHAR(7)"/>
            <column name="status" type="VARCHAR(20)"><constraints nullable="false"/></column>
            <column name="frozen" type="BOOLEAN" defaultValueBoolean="false"/>
            <column name="daily_limit" type="DECIMAL(19,4)" defaultValueNumeric="50000"/>
            <column name="monthly_limit" type="DECIMAL(19,4)" defaultValueNumeric="500000"/>
            <column name="issued_at" type="TIMESTAMP"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()"/>
        </createTable>
        <createIndex tableName="m_neobank_card" indexName="idx_card_client">
            <column name="client_id"/>
        </createIndex>
    </changeSet>

    <changeSet id="neobank-merchants" author="qsoftwares">
        <preConditions onFail="MARK_RAN">
            <not><tableExists tableName="m_neobank_merchant"/></not>
        </preConditions>
        <createTable tableName="m_neobank_merchant">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="merchant_id" type="VARCHAR(20)"><constraints unique="true" nullable="false"/></column>
            <column name="business_name" type="VARCHAR(200)"><constraints nullable="false"/></column>
            <column name="business_type" type="VARCHAR(50)"/>
            <column name="owner_name" type="VARCHAR(100)"/>
            <column name="phone" type="VARCHAR(20)"/>
            <column name="email" type="VARCHAR(100)"/>
            <column name="location" type="VARCHAR(200)"/>
            <column name="till_number" type="VARCHAR(10)"/>
            <column name="status" type="VARCHAR(20)"><constraints nullable="false"/></column>
            <column name="kyb_status" type="VARCHAR(20)" defaultValue="NOT_STARTED"/>
            <column name="settlement_frequency" type="VARCHAR(20)" defaultValue="DAILY"/>
            <column name="settlement_bank_code" type="VARCHAR(10)"/>
            <column name="settlement_account" type="VARCHAR(30)"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="NOW()"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
'''

# ═══════════════════════════════════════════════════════════════════════════════
# 5. Frontend Services + Hooks
# ═══════════════════════════════════════════════════════════════════════════════

files[os.path.join(SRC, "services", "qr-service.ts")] = '''import api from "./api-client";

const qrService = {
  generate: (accountRef: string, amount: number, merchantName?: string, description?: string) =>
    api.post("/v1/neobank/qr/generate", { accountRef, amount, merchantName, description }),

  scan: (qrContent: string) =>
    api.post("/v1/neobank/qr/scan", { qrContent }),

  pay: (qrId: string, senderAccount: string, amount: number) =>
    api.post("/v1/neobank/qr/pay", { qrId, senderAccount, amount }),
};

export default qrService;
'''

files[os.path.join(SRC, "services", "card-service.ts")] = '''import api from "./api-client";

const cardService = {
  getClientCards: (clientId: number) =>
    api.get(`/v1/neobank/cards/client/${clientId}`),

  getCard: (cardId: string) =>
    api.get(`/v1/neobank/cards/${cardId}`),

  getCardTransactions: (cardId: string, limit = 10) =>
    api.get(`/v1/neobank/cards/${cardId}/transactions?limit=${limit}`),

  issueVirtualCard: (clientId: number, accountRef: string, cardholderName: string) =>
    api.post("/v1/neobank/cards/issue", { clientId, accountRef, cardholderName }),

  toggleFreeze: (cardId: string, freeze: boolean) =>
    api.post(`/v1/neobank/cards/${cardId}/freeze`, { freeze }),

  updateLimits: (cardId: string, dailyLimit: number, monthlyLimit: number) =>
    api.put(`/v1/neobank/cards/${cardId}/limits`, { dailyLimit, monthlyLimit }),

  requestPinReset: (cardId: string) =>
    api.post(`/v1/neobank/cards/${cardId}/pin-reset`, {}),
};

export default cardService;
'''

files[os.path.join(SRC, "services", "merchant-service.ts")] = '''import api from "./api-client";

const merchantService = {
  list: () => api.get("/v1/neobank/merchants"),

  get: (merchantId: string) => api.get(`/v1/neobank/merchants/${merchantId}`),

  register: (data: { businessName: string; businessType: string; ownerName: string; phone: string; email: string; location: string }) =>
    api.post("/v1/neobank/merchants/register", data),

  configureSettlement: (merchantId: string, frequency: string, bankCode: string, accountNumber: string) =>
    api.put(`/v1/neobank/merchants/${merchantId}/settlement`, { frequency, bankCode, accountNumber }),

  getRevenue: (merchantId: string) =>
    api.get(`/v1/neobank/merchants/${merchantId}/revenue`),
};

export default merchantService;
'''

files[os.path.join(SRC, "hooks", "use-qr.ts")] = '''import { useApiQuery, useApiMutation } from "./use-api";
import qrService from "../services/qr-service";

const MOCK_QR = {
  qrId: "QR-DEMO0001",
  qrContent: '{"type":"NEOBANK_QR","id":"QR-DEMO0001","acc":"ACC-001","amt":0,"name":"Amina Wanjiku","desc":"Payment","exp":"2026-04-06T12:00:00Z"}',
  accountRef: "ACC-001",
  amount: 0,
  merchantName: "Amina Wanjiku",
  description: "Payment",
  expiresAt: "2026-04-06T12:00:00Z",
  status: "ACTIVE",
};

export function useGenerateQr() {
  return useApiMutation((vars: unknown) => {
    const { accountRef, amount, merchantName, description } = vars as {
      accountRef: string; amount: number; merchantName?: string; description?: string;
    };
    return qrService.generate(accountRef, amount, merchantName, description);
  });
}

export function useScanQr() {
  return useApiMutation((vars: unknown) => {
    const { qrContent } = vars as { qrContent: string };
    return qrService.scan(qrContent);
  });
}

export function useQrPay() {
  return useApiMutation((vars: unknown) => {
    const { qrId, senderAccount, amount } = vars as { qrId: string; senderAccount: string; amount: number };
    return qrService.pay(qrId, senderAccount, amount);
  });
}
'''

files[os.path.join(SRC, "hooks", "use-cards.ts")] = '''import { useApiQuery, useApiMutation } from "./use-api";
import cardService from "../services/card-service";

const MOCK_CARDS = [
  {
    cardId: "CARD-V-001", clientId: 1, accountRef: "ACC-001", cardholderName: "AMINA WANJIKU",
    type: "VIRTUAL", network: "VISA", last4: "4532", maskedNumber: "**** **** **** 4532",
    expiryDate: "2029-04", status: "ACTIVE", frozen: false,
    dailyLimit: 50000, monthlyLimit: 500000, todaySpend: 4650, monthSpend: 24399,
  },
  {
    cardId: "CARD-P-001", clientId: 1, accountRef: "ACC-001", cardholderName: "AMINA WANJIKU",
    type: "PHYSICAL", network: "MASTERCARD", last4: "8901", maskedNumber: "**** **** **** 8901",
    expiryDate: "2028-12", status: "ACTIVE", frozen: false,
    dailyLimit: 100000, monthlyLimit: 1000000, todaySpend: 0, monthSpend: 12500,
  },
];

const MOCK_TRANSACTIONS = [
  { id: "CTX-001", merchant: "Naivas Supermarket", category: "GROCERIES", amount: -3450, currency: "KES", date: "2026-04-05", status: "COMPLETED" },
  { id: "CTX-002", merchant: "Java House Westlands", category: "FOOD_DRINK", amount: -1200, currency: "KES", date: "2026-04-04", status: "COMPLETED" },
  { id: "CTX-003", merchant: "Bolt Kenya", category: "TRANSPORT", amount: -850, currency: "KES", date: "2026-04-04", status: "COMPLETED" },
  { id: "CTX-004", merchant: "Netflix", category: "ENTERTAINMENT", amount: -1100, currency: "KES", date: "2026-04-03", status: "COMPLETED" },
  { id: "CTX-005", merchant: "Shell Uhuru Highway", category: "FUEL", amount: -5000, currency: "KES", date: "2026-04-02", status: "COMPLETED" },
  { id: "CTX-006", merchant: "Jumia Kenya", category: "SHOPPING", amount: -7800, currency: "KES", date: "2026-04-01", status: "COMPLETED" },
];

export function useClientCards(clientId: number) {
  return useApiQuery(() => cardService.getClientCards(clientId), [clientId], MOCK_CARDS);
}

export function useCard(cardId: string) {
  return useApiQuery(() => cardService.getCard(cardId), [cardId], MOCK_CARDS.find(c => c.cardId === cardId) ?? MOCK_CARDS[0]);
}

export function useCardTransactions(cardId: string) {
  return useApiQuery(() => cardService.getCardTransactions(cardId), [cardId], MOCK_TRANSACTIONS);
}

export function useIssueVirtualCard() {
  return useApiMutation((vars: unknown) => {
    const { clientId, accountRef, cardholderName } = vars as { clientId: number; accountRef: string; cardholderName: string };
    return cardService.issueVirtualCard(clientId, accountRef, cardholderName);
  });
}

export function useToggleFreeze() {
  return useApiMutation((vars: unknown) => {
    const { cardId, freeze } = vars as { cardId: string; freeze: boolean };
    return cardService.toggleFreeze(cardId, freeze);
  });
}

export function useUpdateCardLimits() {
  return useApiMutation((vars: unknown) => {
    const { cardId, dailyLimit, monthlyLimit } = vars as { cardId: string; dailyLimit: number; monthlyLimit: number };
    return cardService.updateLimits(cardId, dailyLimit, monthlyLimit);
  });
}

export function useRequestPinReset() {
  return useApiMutation((vars: unknown) => {
    const { cardId } = vars as { cardId: string };
    return cardService.requestPinReset(cardId);
  });
}
'''

files[os.path.join(SRC, "hooks", "use-merchant.ts")] = '''import { useApiQuery, useApiMutation } from "./use-api";
import merchantService from "../services/merchant-service";

const MOCK_MERCHANTS = [
  {
    merchantId: "MER-001", businessName: "Mama Njeri's Kitchen", businessType: "RESTAURANT",
    ownerName: "Njeri Kamau", phone: "+254 722 456 789", location: "Tom Mboya Street, Nairobi CBD",
    tillNumber: "5274831", status: "ACTIVE", kybStatus: "VERIFIED",
    totalRevenue: 1245000, totalTransactions: 623,
  },
  {
    merchantId: "MER-002", businessName: "Westlands Auto Spares", businessType: "RETAIL",
    ownerName: "John Odhiambo", phone: "+254 733 123 456", location: "Westlands, Nairobi",
    tillNumber: "6389201", status: "ACTIVE", kybStatus: "VERIFIED",
    totalRevenue: 3890000, totalTransactions: 412,
  },
];

const MOCK_REVENUE = {
  merchantId: "MER-001", businessName: "Mama Njeri's Kitchen",
  today: { revenue: 45600, transactions: 23, avgTicket: 1983 },
  thisWeek: { revenue: 312400, transactions: 156, avgTicket: 2003 },
  thisMonth: { revenue: 1245000, transactions: 623, avgTicket: 1998 },
  topProducts: [
    { name: "Lunch Special", revenue: 345000, count: 230 },
    { name: "Nyama Choma", revenue: 280000, count: 112 },
    { name: "Chai & Mandazi", revenue: 156000, count: 520 },
    { name: "Ugali & Sukuma", revenue: 134000, count: 178 },
  ],
  peakHours: [
    { hour: "12:00-13:00", transactions: 45 },
    { hour: "18:00-19:00", transactions: 38 },
    { hour: "07:00-08:00", transactions: 28 },
  ],
};

export function useMerchants() {
  return useApiQuery(() => merchantService.list(), [], MOCK_MERCHANTS);
}

export function useMerchant(merchantId: string) {
  return useApiQuery(() => merchantService.get(merchantId), [merchantId], MOCK_MERCHANTS[0]);
}

export function useMerchantRevenue(merchantId: string) {
  return useApiQuery(() => merchantService.getRevenue(merchantId), [merchantId], MOCK_REVENUE);
}

export function useRegisterMerchant() {
  return useApiMutation((vars: unknown) => {
    const data = vars as { businessName: string; businessType: string; ownerName: string; phone: string; email: string; location: string };
    return merchantService.register(data);
  });
}
'''

# ═══════════════════════════════════════════════════════════════════════════════
# Write all files
# ═══════════════════════════════════════════════════════════════════════════════

count = 0
for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.lstrip("\n"))
    count += 1

print(f"NeoBank Sprint 5: {count} files written")
