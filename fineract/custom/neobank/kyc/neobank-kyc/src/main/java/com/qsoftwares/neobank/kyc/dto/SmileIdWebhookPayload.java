/**
 * NeoBank — Smile ID Webhook Payload DTO
 * Represents the async callback from Smile ID after verification completes.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.kyc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmileIdWebhookPayload {

    /** Smile ID job identifier */
    private String jobId;

    /** Partner identifier assigned by Smile ID */
    private String partnerId;

    /** Smile ID result code (e.g. "0810" = success, "0811" = no match) */
    private String resultCode;

    /** Human-readable result description */
    private String resultText;

    /** Action recommendations from Smile ID (e.g. "Return Personal Info" -> "Pass") */
    private Map<String, String> actions;

    /** Biometric confidence score 0.0 - 100.0 */
    private double confidence;

    /** Overall verification result */
    private boolean verified;
}
