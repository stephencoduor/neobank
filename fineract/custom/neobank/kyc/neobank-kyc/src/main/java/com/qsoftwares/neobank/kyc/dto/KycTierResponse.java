/**
 * NeoBank — KYC Tier Response DTO
 * Returns the client's current KYC tier and associated transaction limits.
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
public class KycTierResponse {

    private Long clientId;

    /** Current tier: LITE, STANDARD, or ENHANCED */
    private String currentTier;

    /** Daily send limit in minor units (cents). KES 1 = 100 */
    private Long dailySendLimitKes;

    /** Monthly balance cap in minor units */
    private Long monthlyBalanceLimitKes;

    /** Single transaction limit in minor units */
    private Long singleTxnLimitKes;

    /** ISO timestamp when tier was last verified */
    private String verifiedAt;

    /** Method used for verification: SMILE_ID_ENHANCED_KYC, SMILE_ID_BIOMETRIC, ADMIN_MANUAL */
    private String verificationMethod;
}
