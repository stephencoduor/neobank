/**
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
        List<Map<String, Object>> txns = new ArrayList<>();
        txns.add(txn("CTX-001", "Naivas Supermarket", "GROCERIES", -3450, "2026-04-05"));
        txns.add(txn("CTX-002", "Java House Westlands", "FOOD_DRINK", -1200, "2026-04-04"));
        txns.add(txn("CTX-003", "Bolt Kenya", "TRANSPORT", -850, "2026-04-04"));
        txns.add(txn("CTX-004", "Netflix", "ENTERTAINMENT", -1100, "2026-04-03"));
        txns.add(txn("CTX-005", "Shell Uhuru Highway", "FUEL", -5000, "2026-04-02"));
        txns.add(txn("CTX-006", "Jumia Kenya", "SHOPPING", -7800, "2026-04-01"));
        txns.add(txn("CTX-007", "Safaricom Fibre", "UTILITIES", -4999, "2026-03-31"));
        txns.add(txn("CTX-008", "Chandarana Foodplus", "GROCERIES", -2100, "2026-03-30"));
        return txns.subList(0, Math.min(limit, txns.size()));
    }

    private Map<String, Object> txn(String id, String merchant, String category, int amount, String date) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id); m.put("merchant", merchant); m.put("category", category);
        m.put("amount", amount); m.put("currency", "KES"); m.put("date", date); m.put("status", "COMPLETED");
        return m;
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
