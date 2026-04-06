/**
 * NeoBank — Smile ID Verification Request DTO
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.kyc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmileIdVerifyRequest {

    private Long clientId;

    /** NATIONAL_ID, PASSPORT, or ALIEN_ID */
    private String idType;

    private String idNumber;

    private String firstName;

    private String lastName;

    /** ISO date format yyyy-MM-dd */
    private String dateOfBirth;

    /** Base64-encoded selfie image for biometric matching */
    private String selfieBase64;

    /** Target KYC tier: STANDARD or ENHANCED */
    private String targetTier;
}
