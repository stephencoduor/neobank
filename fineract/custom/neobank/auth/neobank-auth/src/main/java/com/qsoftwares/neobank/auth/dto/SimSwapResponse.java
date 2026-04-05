/**
 * NeoBank — SIM Swap Check Response DTO
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
public class SimSwapResponse {

    /** E.164 formatted MSISDN that was checked. */
    private String msisdn;

    /** Mobile network operator, e.g. SAFARICOM | AIRTEL_KE | TELKOM_KE. */
    private String carrier;

    /** True if a SIM swap has been detected within the lookback window. */
    private boolean simSwapped;

    /** ISO-8601 timestamp of the last detected SIM change (null if none). */
    private String lastSwapAt;

    /** Risk level: LOW | MEDIUM | HIGH. */
    private String riskLevel;

    /** Provider that served the lookup, e.g. AFRICAS_TALKING | TELCO_DIRECT. */
    private String provider;
}
