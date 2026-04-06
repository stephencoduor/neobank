/**
 * NeoBank — Suspicious Transaction Report (STR) Draft Service
 * Generates FRC goAML-format STR drafts from AML cases.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.aml.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class StrDraftService {

    /**
     * Generate a Suspicious Transaction Report draft for FRC Kenya submission.
     */
    public Map<String, Object> generateStrDraft(String caseId, String subjectName,
                                                 String subjectIdNumber, String narrative,
                                                 List<Map<String, Object>> transactions) {
        String strId = "STR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) +
                       "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        log.info("Generating STR draft: caseId={}, subject={}, strId={}", caseId, subjectName, strId);

        long totalAmountMinor = transactions.stream()
            .mapToLong(t -> ((Number) t.getOrDefault("amountMinor", 0)).longValue())
            .sum();

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("strId", strId);
        draft.put("caseId", caseId);
        draft.put("status", "DRAFT");
        draft.put("reportType", "STR");
        draft.put("regulator", "FRC Kenya");
        draft.put("format", "goAML XML");

        // Subject details
        draft.put("subject", Map.of(
            "fullName", subjectName,
            "idType", "NATIONAL_ID",
            "idNumber", subjectIdNumber,
            "nationality", "KE",
            "accountNumbers", transactions.stream()
                .map(t -> t.getOrDefault("accountId", ""))
                .distinct().toList()
        ));

        // Transaction summary
        draft.put("transactionSummary", Map.of(
            "count", transactions.size(),
            "totalAmountMinor", totalAmountMinor,
            "totalAmountKes", String.format("KES %,.2f", totalAmountMinor / 100.0),
            "dateRange", Map.of(
                "from", transactions.stream().map(t -> (String) t.get("date")).min(String::compareTo).orElse(""),
                "to", transactions.stream().map(t -> (String) t.get("date")).max(String::compareTo).orElse("")
            )
        ));

        draft.put("narrative", narrative);
        draft.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        draft.put("generatedBy", "NeoBank AML System");
        draft.put("filingDeadline", LocalDateTime.now().plusDays(3).format(DateTimeFormatter.ISO_LOCAL_DATE));

        return draft;
    }
}
