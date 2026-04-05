/**
 * NeoBank — Step-Up Authentication Request DTO
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StepUpRequest {

    /** Fineract client id requesting the sensitive action. */
    private String clientId;

    /** Bound device id from which the request originates. */
    private String deviceId;

    /** Challenge type: OTP | BIOMETRIC | PIN. */
    private String challengeType;

    /** Action being authorized, e.g. "LARGE_TRANSFER", "PROFILE_CHANGE". */
    private String action;

    /** Optional amount in minor units when action is a money movement. */
    private Long amountMinor;

    /** Optional ISO 4217 currency code, defaults to KES. */
    private String currencyCode;
}
