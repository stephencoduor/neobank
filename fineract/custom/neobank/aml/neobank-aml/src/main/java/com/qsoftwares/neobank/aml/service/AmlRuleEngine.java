package com.qsoftwares.neobank.aml.service;

import com.qsoftwares.neobank.aml.dto.RuleMatch;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j @Service
public class AmlRuleEngine {

    public static final String VELOCITY_5_IN_1H = "VELOCITY_5_IN_1H";
    public static final String STRUCTURING_BELOW_50K = "STRUCTURING_BELOW_50K";
    public static final String LARGE_SINGLE_1M = "LARGE_SINGLE_1M";
    public static final String MULE_PATTERN = "MULE_PATTERN";
    public static final String DORMANT_REACTIVATION = "DORMANT_REACTIVATION";

    private static final Map<String, Map<String, String>> RULES = new LinkedHashMap<>();
    static {
        RULES.put(VELOCITY_5_IN_1H, Map.of("severity", "MEDIUM", "description",
            "More than 5 transactions within 1 hour window"));
        RULES.put(STRUCTURING_BELOW_50K, Map.of("severity", "HIGH", "description",
            "Multiple transactions just below KES 50,000 reporting threshold"));
        RULES.put(LARGE_SINGLE_1M, Map.of("severity", "HIGH", "description",
            "Single transaction exceeding KES 1,000,000"));
        RULES.put(MULE_PATTERN, Map.of("severity", "CRITICAL", "description",
            "Funds received then immediately sent to different account within 30 minutes"));
        RULES.put(DORMANT_REACTIVATION, Map.of("severity", "MEDIUM", "description",
            "Account dormant >90 days followed by large transaction"));
    }

    public List<RuleMatch> evaluateTransaction(Long clientId, long amountMinor, int txnCountLastHour) {
        List<RuleMatch> matches = new ArrayList<>();
        String now = Instant.now().toString();

        if (txnCountLastHour > 5) {
            matches.add(RuleMatch.builder().ruleCode(VELOCITY_5_IN_1H).severity("MEDIUM")
                .description(RULES.get(VELOCITY_5_IN_1H).get("description"))
                .clientId(clientId).triggerDetail(txnCountLastHour + " txns in last hour").matchedAt(now).build());
        }
        if (amountMinor >= 4_500_000L && amountMinor < 5_000_000L) {
            matches.add(RuleMatch.builder().ruleCode(STRUCTURING_BELOW_50K).severity("HIGH")
                .description(RULES.get(STRUCTURING_BELOW_50K).get("description"))
                .clientId(clientId).triggerDetail("Amount KES " + amountMinor/100 + " near 50K threshold").matchedAt(now).build());
        }
        if (amountMinor >= 100_000_000L) {
            matches.add(RuleMatch.builder().ruleCode(LARGE_SINGLE_1M).severity("HIGH")
                .description(RULES.get(LARGE_SINGLE_1M).get("description"))
                .clientId(clientId).triggerDetail("Amount KES " + amountMinor/100).matchedAt(now).build());
        }

        log.info("AML evaluation: clientId={}, amount={}, matches={}", clientId, amountMinor, matches.size());
        return matches;
    }

    public List<Map<String, Object>> getRules() {
        List<Map<String, Object>> list = new ArrayList<>();
        RULES.forEach((code, meta) -> list.add(Map.of("ruleCode", code,
            "severity", meta.get("severity"), "description", meta.get("description"), "enabled", true)));
        return list;
    }
}
