package com.qsoftwares.neobank.aml.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RuleMatch {
    private String ruleCode;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String description;
    private Long clientId;
    private String triggerDetail;
    private String matchedAt;
}
