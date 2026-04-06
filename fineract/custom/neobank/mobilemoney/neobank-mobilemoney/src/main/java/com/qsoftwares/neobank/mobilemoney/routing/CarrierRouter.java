/**
 * NeoBank — Carrier Routing Engine
 * Routes payments to the optimal mobile money carrier based on MSISDN prefix,
 * cost comparison, and carrier health status.
 * Kenyan MSISDN prefixes: 070x/071x/072x/079x → Safaricom, 073x/074x/078x → Airtel,
 * 076x/077x → Telkom. Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.routing;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class CarrierRouter {

    public enum Carrier { MPESA, AIRTEL, TELKOM }

    // Kenyan MSISDN prefix → carrier mapping (+254 stripped, first 3 digits of subscriber)
    private static final Map<String, Carrier> PREFIX_MAP = Map.ofEntries(
        Map.entry("700", Carrier.MPESA), Map.entry("701", Carrier.MPESA),
        Map.entry("702", Carrier.MPESA), Map.entry("703", Carrier.MPESA),
        Map.entry("704", Carrier.MPESA), Map.entry("705", Carrier.MPESA),
        Map.entry("706", Carrier.MPESA), Map.entry("707", Carrier.MPESA),
        Map.entry("708", Carrier.MPESA), Map.entry("709", Carrier.MPESA),
        Map.entry("710", Carrier.MPESA), Map.entry("711", Carrier.MPESA),
        Map.entry("712", Carrier.MPESA), Map.entry("713", Carrier.MPESA),
        Map.entry("714", Carrier.MPESA), Map.entry("715", Carrier.MPESA),
        Map.entry("716", Carrier.MPESA), Map.entry("717", Carrier.MPESA),
        Map.entry("718", Carrier.MPESA), Map.entry("719", Carrier.MPESA),
        Map.entry("720", Carrier.MPESA), Map.entry("721", Carrier.MPESA),
        Map.entry("722", Carrier.MPESA), Map.entry("723", Carrier.MPESA),
        Map.entry("724", Carrier.MPESA), Map.entry("725", Carrier.MPESA),
        Map.entry("726", Carrier.MPESA), Map.entry("727", Carrier.MPESA),
        Map.entry("728", Carrier.MPESA), Map.entry("729", Carrier.MPESA),
        Map.entry("790", Carrier.MPESA), Map.entry("791", Carrier.MPESA),
        Map.entry("792", Carrier.MPESA), Map.entry("793", Carrier.MPESA),
        Map.entry("794", Carrier.MPESA), Map.entry("795", Carrier.MPESA),
        Map.entry("796", Carrier.MPESA), Map.entry("797", Carrier.MPESA),
        Map.entry("798", Carrier.MPESA), Map.entry("799", Carrier.MPESA),
        Map.entry("110", Carrier.MPESA), Map.entry("111", Carrier.MPESA),
        Map.entry("112", Carrier.MPESA),
        // Airtel Kenya
        Map.entry("730", Carrier.AIRTEL), Map.entry("731", Carrier.AIRTEL),
        Map.entry("732", Carrier.AIRTEL), Map.entry("733", Carrier.AIRTEL),
        Map.entry("734", Carrier.AIRTEL), Map.entry("735", Carrier.AIRTEL),
        Map.entry("736", Carrier.AIRTEL), Map.entry("737", Carrier.AIRTEL),
        Map.entry("738", Carrier.AIRTEL), Map.entry("739", Carrier.AIRTEL),
        Map.entry("740", Carrier.AIRTEL), Map.entry("741", Carrier.AIRTEL),
        Map.entry("742", Carrier.AIRTEL), Map.entry("743", Carrier.AIRTEL),
        Map.entry("744", Carrier.AIRTEL), Map.entry("745", Carrier.AIRTEL),
        Map.entry("746", Carrier.AIRTEL), Map.entry("747", Carrier.AIRTEL),
        Map.entry("748", Carrier.AIRTEL), Map.entry("749", Carrier.AIRTEL),
        Map.entry("780", Carrier.AIRTEL), Map.entry("781", Carrier.AIRTEL),
        Map.entry("782", Carrier.AIRTEL), Map.entry("783", Carrier.AIRTEL),
        Map.entry("784", Carrier.AIRTEL), Map.entry("785", Carrier.AIRTEL),
        Map.entry("786", Carrier.AIRTEL), Map.entry("787", Carrier.AIRTEL),
        Map.entry("788", Carrier.AIRTEL), Map.entry("789", Carrier.AIRTEL),
        // Telkom Kenya
        Map.entry("760", Carrier.TELKOM), Map.entry("761", Carrier.TELKOM),
        Map.entry("762", Carrier.TELKOM), Map.entry("763", Carrier.TELKOM),
        Map.entry("764", Carrier.TELKOM), Map.entry("765", Carrier.TELKOM),
        Map.entry("766", Carrier.TELKOM), Map.entry("767", Carrier.TELKOM),
        Map.entry("768", Carrier.TELKOM), Map.entry("769", Carrier.TELKOM),
        Map.entry("770", Carrier.TELKOM), Map.entry("771", Carrier.TELKOM),
        Map.entry("772", Carrier.TELKOM), Map.entry("773", Carrier.TELKOM),
        Map.entry("774", Carrier.TELKOM), Map.entry("775", Carrier.TELKOM),
        Map.entry("776", Carrier.TELKOM), Map.entry("777", Carrier.TELKOM),
        Map.entry("778", Carrier.TELKOM), Map.entry("779", Carrier.TELKOM)
    );

    // Per-carrier health score (0-100). Updated by CarrierHealthMonitor.
    private final ConcurrentHashMap<Carrier, Integer> healthScores = new ConcurrentHashMap<>(
        Map.of(Carrier.MPESA, 100, Carrier.AIRTEL, 100, Carrier.TELKOM, 100)
    );

    // Per-carrier fee in KES minor units (basis points per KES 1000)
    private static final Map<Carrier, Long> FEE_PER_1000_KES = Map.of(
        Carrier.MPESA, 15_00L,   // KES 15 per KES 1000
        Carrier.AIRTEL, 12_00L,  // KES 12 per KES 1000
        Carrier.TELKOM, 10_00L   // KES 10 per KES 1000
    );

    private static final int HEALTH_THRESHOLD = 50;

    /**
     * Resolve the best carrier for a given MSISDN.
     * Prefers the native carrier if healthy; otherwise fails over.
     */
    public RoutingDecision route(String msisdn, long amountMinor) {
        String normalized = normalizeMsisdn(msisdn);
        String prefix = normalized.substring(0, 3);
        Carrier native_ = PREFIX_MAP.getOrDefault(prefix, Carrier.MPESA);

        int nativeHealth = healthScores.getOrDefault(native_, 0);
        if (nativeHealth >= HEALTH_THRESHOLD) {
            long fee = calculateFee(native_, amountMinor);
            log.info("Routing {} to native carrier {} (health={})", msisdn, native_, nativeHealth);
            return new RoutingDecision(native_, fee, false, nativeHealth);
        }

        // Failover: pick healthiest alternative
        Carrier fallback = healthScores.entrySet().stream()
            .filter(e -> e.getKey() != native_ && e.getValue() >= HEALTH_THRESHOLD)
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(native_); // all down — try native anyway

        long fee = calculateFee(fallback, amountMinor);
        log.warn("Failover {} from {} (health={}) to {} (health={})",
            msisdn, native_, nativeHealth, fallback, healthScores.get(fallback));
        return new RoutingDecision(fallback, fee, true, healthScores.getOrDefault(fallback, 0));
    }

    /** Cost comparison across all healthy carriers */
    public List<CostOption> compareCosts(long amountMinor) {
        List<CostOption> options = new ArrayList<>();
        for (Carrier c : Carrier.values()) {
            int health = healthScores.getOrDefault(c, 0);
            long fee = calculateFee(c, amountMinor);
            options.add(new CostOption(c, fee, health, health >= HEALTH_THRESHOLD));
        }
        options.sort(Comparator.comparingLong(CostOption::feeMinor));
        return options;
    }

    public void updateHealth(Carrier carrier, int score) {
        healthScores.put(carrier, Math.max(0, Math.min(100, score)));
    }

    private long calculateFee(Carrier carrier, long amountMinor) {
        long feeRate = FEE_PER_1000_KES.getOrDefault(carrier, 15_00L);
        return (amountMinor * feeRate) / (1000_00L); // minor units
    }

    private String normalizeMsisdn(String msisdn) {
        String clean = msisdn.replaceAll("[^0-9]", "");
        if (clean.startsWith("254") && clean.length() == 12) return clean.substring(3);
        if (clean.startsWith("0") && clean.length() == 10) return clean.substring(1);
        return clean;
    }

    public record RoutingDecision(Carrier carrier, long feeMinor, boolean failover, int healthScore) {}
    public record CostOption(Carrier carrier, long feeMinor, int healthScore, boolean available) {}
}
