/**
 * NeoBank — KYC Verification API Resource
 * Smile ID Kenya Integration for Document & Biometric Verification.
 * Provides tier management, Smile ID webhook processing, and limit enforcement.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.kyc.api;

import com.qsoftwares.neobank.kyc.dto.KycTierResponse;
import com.qsoftwares.neobank.kyc.dto.SmileIdVerifyRequest;
import com.qsoftwares.neobank.kyc.dto.SmileIdWebhookPayload;
import com.qsoftwares.neobank.kyc.service.KycVerificationService;
import com.qsoftwares.neobank.kyc.service.SmileIdClient;
import com.qsoftwares.neobank.kyc.service.TierLimitEnforcer;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Path("/v1/neobank/kyc")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class KycApiResource {

    private final KycVerificationService kycVerificationService;
    private final SmileIdClient smileIdClient;
    private final TierLimitEnforcer tierLimitEnforcer;

    /**
     * Submit an ID document for KYC verification via Smile ID.
     * Supports Kenyan National ID, Passport, and Alien ID.
     *
     * @param request SmileIdVerifyRequest with client details and selfie
     * @return verification job ID and PENDING status
     */
    @POST
    @Path("/verify")
    public Response submitVerification(SmileIdVerifyRequest request) {
        log.info("KYC verification submitted: clientId={}, idType={}, targetTier={}",
                request.getClientId(), request.getIdType(), request.getTargetTier());

        Map<String, Object> result = smileIdClient.submitVerification(request);

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Receive Smile ID async webhook callback.
     * On successful verification, triggers tier upgrade.
     *
     * @param payload SmileIdWebhookPayload with verification result
     * @return processing result with tier upgrade decision
     */
    @POST
    @Path("/webhook")
    public Response handleWebhook(SmileIdWebhookPayload payload) {
        log.info("Smile ID webhook received: jobId={}, verified={}", payload.getJobId(), payload.isVerified());

        Map<String, Object> result = smileIdClient.processWebhook(payload);

        return Response.ok(result).build();
    }

    /**
     * Get the current KYC tier and associated limits for a client.
     *
     * @param clientId the Fineract client ID
     * @return KycTierResponse with tier, limits, and verification details
     */
    @GET
    @Path("/tier/{clientId}")
    public Response getTier(@PathParam("clientId") Long clientId) {
        log.info("KYC tier inquiry: clientId={}", clientId);

        // Stub: return LITE tier with default limits.
        // Production would query m_neobank_kyc_tier and m_neobank_kyc_tier_limit.
        KycTierResponse response = KycTierResponse.builder()
                .clientId(clientId)
                .currentTier("LITE")
                .dailySendLimitKes(5_000_000L)        // KES 50,000
                .monthlyBalanceLimitKes(10_000_000L)   // KES 100,000
                .singleTxnLimitKes(2_000_000L)         // KES 20,000
                .verifiedAt(null)
                .verificationMethod(null)
                .build();

        return Response.ok(response).build();
    }

    /**
     * Admin manual tier upgrade. Allows compliance officers to upgrade a client's
     * KYC tier with a documented reason.
     *
     * @param request JSON body with: clientId (Long), targetTier (STANDARD/ENHANCED), reason (String)
     * @return upgrade confirmation with new tier and effective limits
     */
    @POST
    @Path("/upgrade")
    public Response manualUpgrade(Map<String, Object> request) {
        Long clientId = ((Number) request.get("clientId")).longValue();
        String targetTier = (String) request.get("targetTier");
        String reason = (String) request.get("reason");

        log.info("Admin tier upgrade: clientId={}, targetTier={}, reason={}", clientId, targetTier, reason);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("clientId", clientId);
        result.put("previousTier", "LITE");
        result.put("newTier", targetTier);
        result.put("upgradeMethod", "ADMIN_MANUAL");
        result.put("reason", reason);
        result.put("upgradedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        result.put("upgradedBy", "admin");

        return Response.ok(result).build();
    }

    /**
     * Check the status of a KYC verification request.
     *
     * @param verificationId the verification request ID
     * @return current verification status and details
     */
    @GET
    @Path("/status/{verificationId}")
    public Response getVerificationStatus(@PathParam("verificationId") String verificationId) {
        log.info("KYC status inquiry: verificationId={}", verificationId);

        Map<String, Object> result = kycVerificationService.getVerificationStatus(verificationId);

        return Response.ok(result).build();
    }

    /**
     * Compare a selfie photo against the ID document photo.
     * Uses Smile ID biometric matching.
     *
     * @param request JSON body with: clientId, verificationId, selfieImageBase64
     * @return match confidence score and result
     */
    @POST
    @Path("/selfie-match")
    public Response selfieMatch(Map<String, Object> request) {
        log.info("Selfie match requested: clientId={}, verificationId={}",
                request.get("clientId"), request.get("verificationId"));

        Map<String, Object> result = kycVerificationService.matchSelfie(
                (String) request.get("clientId"),
                (String) request.get("verificationId"),
                (String) request.get("selfieImageBase64")
        );

        return Response.ok(result).build();
    }

    /**
     * Get the aggregated risk score for a client based on KYC data.
     *
     * @param clientId the Fineract client ID
     * @return risk score (0-100), risk level, and contributing factors
     */
    @GET
    @Path("/risk-score/{clientId}")
    public Response getRiskScore(@PathParam("clientId") String clientId) {
        log.info("Risk score inquiry: clientId={}", clientId);

        Map<String, Object> result = kycVerificationService.getRiskScore(clientId);

        return Response.ok(result).build();
    }
}
