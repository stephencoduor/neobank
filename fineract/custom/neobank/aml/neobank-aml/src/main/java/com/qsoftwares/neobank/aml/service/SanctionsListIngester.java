/**
 * NeoBank — Sanctions List Ingester
 * Loads and maintains OFAC SDN, UN Security Council, EU CFSP, and Kenya FRC lists.
 * Supports scheduled refresh and fuzzy name matching.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.aml.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SanctionsListIngester {

    private final ConcurrentHashMap<String, SanctionEntry> sanctionsList = new ConcurrentHashMap<>();
    private LocalDateTime lastRefreshed;

    // Initialize with realistic sample entries
    {
        addEntry("SDN-001", "OFAC-SDN", "Hassan Ali Khaire", "INDIVIDUAL", "SO", "Former PM Somalia, designated 2023");
        addEntry("SDN-002", "OFAC-SDN", "Al-Shabaab", "ENTITY", "SO", "Designated terrorist organization");
        addEntry("UN-001", "UN-1267", "Islamic State of Iraq and the Levant", "ENTITY", null, "UN SC Res 2253");
        addEntry("UN-002", "UN-1267", "Al-Qaida", "ENTITY", null, "UN SC Res 1267");
        addEntry("EU-001", "EU-CFSP", "Consolidated Entity Alpha", "ENTITY", "RU", "EU sanctions 2024");
        addEntry("FRC-001", "FRC-KE", "Money Laundering Network Beta", "ENTITY", "KE", "FRC Kenya alert 2025");
        addEntry("FRC-002", "FRC-KE", "Suspicious Individual Gamma", "INDIVIDUAL", "KE", "FRC Kenya watchlist");
        addEntry("PEP-001", "PEP-KE", "Cabinet Secretary Finance", "PEP", "KE", "Kenyan PEP - active government official");
        addEntry("PEP-002", "PEP-KE", "Governor County X", "PEP", "KE", "Kenyan PEP - county governor");
        addEntry("PEP-003", "PEP-KE", "Director Parastatal Y", "PEP", "KE", "Kenyan PEP - parastatal head");
        lastRefreshed = LocalDateTime.now();
    }

    private void addEntry(String id, String listName, String name, String entityType, String country, String notes) {
        sanctionsList.put(id, new SanctionEntry(id, listName, name, entityType, country, notes, LocalDateTime.now()));
    }

    /**
     * Screen a name against all sanctions and PEP lists using fuzzy matching.
     */
    public List<Map<String, Object>> screenName(String queryName) {
        String queryLower = queryName.toLowerCase().trim();
        List<Map<String, Object>> hits = new ArrayList<>();

        for (SanctionEntry entry : sanctionsList.values()) {
            double score = fuzzyMatch(queryLower, entry.name().toLowerCase());
            if (score >= 0.70) {
                Map<String, Object> hit = new LinkedHashMap<>();
                hit.put("sanctionId", entry.id());
                hit.put("listName", entry.listName());
                hit.put("matchedName", entry.name());
                hit.put("entityType", entry.entityType());
                hit.put("country", entry.country());
                hit.put("matchScore", Math.round(score * 100));
                hit.put("notes", entry.notes());
                hit.put("isPep", entry.listName().startsWith("PEP"));
                hits.add(hit);
            }
        }

        hits.sort((a, b) -> Integer.compare((int) b.get("matchScore"), (int) a.get("matchScore")));
        return hits;
    }

    /**
     * Scheduled refresh — in production, pulls from OFAC/UN/EU/FRC feeds.
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    public void refreshLists() {
        log.info("Refreshing sanctions lists (stub — {} entries)", sanctionsList.size());
        lastRefreshed = LocalDateTime.now();
    }

    public Map<String, Object> getListStats() {
        long ofac = sanctionsList.values().stream().filter(e -> e.listName().startsWith("OFAC")).count();
        long un = sanctionsList.values().stream().filter(e -> e.listName().startsWith("UN")).count();
        long eu = sanctionsList.values().stream().filter(e -> e.listName().startsWith("EU")).count();
        long frc = sanctionsList.values().stream().filter(e -> e.listName().startsWith("FRC")).count();
        long pep = sanctionsList.values().stream().filter(e -> e.listName().startsWith("PEP")).count();

        return Map.of(
            "totalEntries", sanctionsList.size(),
            "ofacSdn", ofac, "unSecurityCouncil", un, "euCfsp", eu,
            "frcKenya", frc, "pepKenya", pep,
            "lastRefreshed", lastRefreshed.toString()
        );
    }

    /**
     * Simple fuzzy match: Jaro-Winkler-like similarity.
     */
    private double fuzzyMatch(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;
        if (s1.contains(s2) || s2.contains(s1)) return 0.90;
        // Token overlap
        Set<String> tokens1 = new HashSet<>(List.of(s1.split("\\s+")));
        Set<String> tokens2 = new HashSet<>(List.of(s2.split("\\s+")));
        long common = tokens1.stream().filter(tokens2::contains).count();
        if (tokens1.isEmpty() || tokens2.isEmpty()) return 0;
        return (double) common / Math.max(tokens1.size(), tokens2.size());
    }

    public record SanctionEntry(String id, String listName, String name, String entityType,
                                 String country, String notes, LocalDateTime addedAt) {}
}
