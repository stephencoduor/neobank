package com.qsoftwares.neobank.aml.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j @Service
public class SanctionsScreener {

    // Mock sanctions list - fictional names only
    private static final List<Map<String, String>> SANCTIONS_LIST = List.of(
        Map.of("name", "John Kamau Blacklisted", "list", "OFAC-SDN", "idNumber", "99999999"),
        Map.of("name", "Jane Doe Sanctioned", "list", "UN-1267", "idNumber", "88888888"),
        Map.of("name", "Test Subject Alpha", "list", "EU-CFSP", "idNumber", "77777777"),
        Map.of("name", "Fictional Entity Corp", "list", "OFAC-SDN", "idNumber", "66666666"),
        Map.of("name", "Sample Restricted Person", "list", "FRC-KE", "idNumber", "55555555")
    );

    public Map<String, Object> screen(String name, String idNumber) {
        log.info("Sanctions screening: name={}, idNumber={}", name, idNumber);

        for (Map<String, String> entry : SANCTIONS_LIST) {
            boolean nameMatch = entry.get("name").toLowerCase().contains(name.toLowerCase());
            boolean idMatch = entry.get("idNumber").equals(idNumber);
            if (nameMatch || idMatch) {
                return Map.of("matched", true, "matchedName", entry.get("name"),
                    "listSource", entry.get("list"), "confidencePct", nameMatch && idMatch ? 99 : 75,
                    "screenedAt", Instant.now().toString(),
                    "action", "BLOCK_AND_REPORT");
            }
        }

        return Map.of("matched", false, "screenedAt", Instant.now().toString(), "action", "CLEAR");
    }
}
