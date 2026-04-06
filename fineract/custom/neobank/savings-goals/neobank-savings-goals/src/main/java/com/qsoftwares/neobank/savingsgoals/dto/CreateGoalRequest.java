package com.qsoftwares.neobank.savingsgoals.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateGoalRequest {
    private String name;
    private long targetAmountMinor;
    @Builder.Default private String currencyCode = "KES";
    private Long linkedSavingsAccountId;
    private boolean autoSweepEnabled;
    private String sweepFrequency; // DAILY, WEEKLY, MONTHLY
    private long sweepAmountMinor;
    private String lockUntilDate; // ISO date yyyy-MM-dd
}
