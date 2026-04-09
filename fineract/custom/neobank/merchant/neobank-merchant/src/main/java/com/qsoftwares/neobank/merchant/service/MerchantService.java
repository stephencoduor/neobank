/**
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
