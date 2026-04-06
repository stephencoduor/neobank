package com.qsoftwares.neobank.aml.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AmlCaseResponse {
    private String caseId;
    private Long clientId;
    private String clientName;
    private String ruleCode;
    private String severity;
    private String status; // OPEN, UNDER_REVIEW, ESCALATED, DISMISSED, REPORTED
    private String triggeredAt;
    private String resolvedAt;
    private String resolvedBy;
    private String notes;
    private List<RuleMatch> relatedMatches;
}
