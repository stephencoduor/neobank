/**
 * NeoBank — KYC Tier Limit Enforcer
 * Checks transaction amounts against the client's KYC tier limits
 * from m_neobank_kyc_tier_limit.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.kyc.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
public class TierLimitEnforcer {

    /**
     * Tier limit matrix (amounts in minor units, KES 1 = 100).
     * Mirrors the seed data in 0225_neobank_kyc_tiers.xml.
     *
     * In production this would query m_neobank_kyc_tier_limit directly.
     */
    private static final Map<String, Map<String, Long>> TIER_LIMITS = Map.of(
            "LITE", Map.of(
                    "DAILY_SEND",       5_000_000L,    // KES 50,000
                    "DAILY_RECEIVE",    5_000_000L,
                    "MONTHLY_BALANCE", 10_000_000L,    // KES 100,000
                    "SINGLE_TXN",       2_000_000L     // KES 20,000
            ),
            "STANDARD", Map.of(
                    "DAILY_SEND",       50_000_000L,   // KES 500,000
                    "DAILY_RECEIVE",    50_000_000L,
                    "MONTHLY_BALANCE", 500_000_000L,   // KES 5,000,000
                    "SINGLE_TXN",       25_000_000L    // KES 250,000
            ),
            "ENHANCED", Map.of(
                    "DAILY_SEND",       500_000_000L,  // KES 5,000,000
                    "DAILY_RECEIVE",    500_000_000L,
                    "MONTHLY_BALANCE", 5_000_000_000L, // KES 50,000,000
                    "SINGLE_TXN",       200_000_000L   // KES 2,000,000
            )
    );

    /** Default tier for clients without a tier assignment */
    private static final String DEFAULT_TIER = "LITE";

    /**
     * Enforce a transaction limit for the given client.
     *
     * TODO: In production, look up the client's tier from m_neobank_kyc_tier
     *       and limits from m_neobank_kyc_tier_limit via JPA/JDBC.
     *
     * @param clientId  the Fineract client ID
     * @param amountMinor the transaction amount in minor units (cents)
     * @param limitType one of: DAILY_SEND, DAILY_RECEIVE, MONTHLY_BALANCE, SINGLE_TXN
     * @return map with: allowed (boolean), tier, limitType, amountMinor,
     *         limitAmountMinor, and reason (if denied)
     */
    public Map<String, Object> enforceLimit(Long clientId, Long amountMinor, String limitType) {
        log.info("Enforcing limit: clientId={}, amount={}, limitType={}", clientId, amountMinor, limitType);

        // Stub: assume LITE tier for all clients. Production would query DB.
        String tier = DEFAULT_TIER;

        Map<String, Long> limits = TIER_LIMITS.getOrDefault(tier, TIER_LIMITS.get(DEFAULT_TIER));
        Long limitAmount = limits.get(limitType);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("clientId", clientId);
        result.put("tier", tier);
        result.put("limitType", limitType);
        result.put("amountMinor", amountMinor);
        result.put("limitAmountMinor", limitAmount);

        if (limitAmount == null) {
            result.put("allowed", false);
            result.put("reason", "Unknown limit type: " + limitType);
            log.warn("Unknown limit type '{}' for client {}", limitType, clientId);
        } else if (amountMinor > limitAmount) {
            result.put("allowed", false);
            result.put("reason", String.format(
                    "Amount KES %.2f exceeds %s %s limit of KES %.2f",
                    amountMinor / 100.0, tier, limitType, limitAmount / 100.0));
            log.info("Limit DENIED: client={}, {} > {} ({})", clientId, amountMinor, limitAmount, limitType);
        } else {
            result.put("allowed", true);
            log.info("Limit ALLOWED: client={}, {} <= {} ({})", clientId, amountMinor, limitAmount, limitType);
        }

        return result;
    }
}
