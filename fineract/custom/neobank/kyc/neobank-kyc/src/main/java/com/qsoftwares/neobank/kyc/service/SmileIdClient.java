/**
 * NeoBank — Smile ID Client Service
 * Stub implementation simulating Smile ID's enhanced_kyc and biometric_kyc endpoints.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.kyc.service;

import com.qsoftwares.neobank.kyc.dto.SmileIdVerifyRequest;
import com.qsoftwares.neobank.kyc.dto.SmileIdWebhookPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class SmileIdClient {

    /** Smile ID partner identifier for NeoBank Kenya */
    private static final String PARTNER_ID = "SID-NEOBANK-KE-001";

    /**
     * Submit a verification request to Smile ID.
     *
     * In production this would call Smile ID's REST API:
     * - enhanced_kyc for document + IPRS lookup
     * - biometric_kyc for selfie matching
     *
     * @param request the verification request with client details
     * @return map with jobId, partnerId, status (PENDING), and submittedAt
     */
    public Map<String, Object> submitVerification(SmileIdVerifyRequest request) {
        log.info("Smile ID verification submitted: clientId={}, idType={}, targetTier={}, partnerId={}",
                request.getClientId(), request.getIdType(), request.getTargetTier(), PARTNER_ID);

        String jobId = "SID_JOB_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("jobId", jobId);
        result.put("partnerId", PARTNER_ID);
        result.put("clientId", request.getClientId());
        result.put("idType", request.getIdType());
        result.put("targetTier", request.getTargetTier());
        result.put("status", "PENDING");
        result.put("estimatedCompletionSeconds", 30);
        result.put("submittedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return result;
    }

    /**
     * Process an incoming Smile ID webhook callback.
     * Validates the payload, determines whether the verification passed,
     * and returns the tier upgrade decision.
     *
     * @param payload the webhook payload from Smile ID
     * @return map with processingResult: APPROVED/REJECTED, new tier, and details
     */
    public Map<String, Object> processWebhook(SmileIdWebhookPayload payload) {
        log.info("Smile ID webhook received: jobId={}, resultCode={}, confidence={}, verified={}",
                payload.getJobId(), payload.getResultCode(), payload.getConfidence(), payload.isVerified());

        // Validate partner ID
        if (!PARTNER_ID.equals(payload.getPartnerId())) {
            log.warn("Webhook partner ID mismatch: expected={}, received={}", PARTNER_ID, payload.getPartnerId());
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("status", "REJECTED");
            error.put("reason", "Invalid partner ID");
            return error;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("jobId", payload.getJobId());
        result.put("partnerId", payload.getPartnerId());

        // Smile ID result code "0810" = ID verified, confidence >= 80 = biometric match
        boolean idVerified = "0810".equals(payload.getResultCode());
        boolean biometricMatch = payload.getConfidence() >= 80.0;

        if (payload.isVerified() && idVerified && biometricMatch) {
            result.put("processingResult", "APPROVED");
            result.put("upgradedTier", "STANDARD");
            result.put("confidence", payload.getConfidence());
            result.put("resolvedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            log.info("Smile ID verification APPROVED for jobId={}", payload.getJobId());
        } else {
            result.put("processingResult", "REJECTED");
            result.put("reason", !idVerified ? "ID verification failed (code: " + payload.getResultCode() + ")"
                    : "Biometric confidence below threshold (" + payload.getConfidence() + "%)");
            result.put("resolvedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            log.info("Smile ID verification REJECTED for jobId={}: idVerified={}, biometricMatch={}",
                    payload.getJobId(), idVerified, biometricMatch);
        }

        return result;
    }
}
