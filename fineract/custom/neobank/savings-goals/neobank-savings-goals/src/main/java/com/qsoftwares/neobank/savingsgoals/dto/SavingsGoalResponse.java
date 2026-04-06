package com.qsoftwares.neobank.savingsgoals.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SavingsGoalResponse {
    private String goalId;
    private Long clientId;
    private String name;
    private long targetAmountMinor;
    private long currentAmountMinor;
    private String currencyCode;
    private int progressPct;
    private Long linkedSavingsAccountId;
    private boolean autoSweepEnabled;
    private String sweepFrequency;
    private long sweepAmountMinor;
    private String lockUntilDate;
    private String status; // ACTIVE, LOCKED, COMPLETED, CANCELLED
    private String createdAt;
    private String updatedAt;
    private List<Map<String, Object>> milestones;
}
