/**
 * NeoBank — KYC Verification API Resource
 * Smile ID Kenya Integration for Document & Biometric Verification
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.kyc.api;

import com.qsoftwares.neobank.kyc.service.KycVerificationService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Path("/v1/neobank/kyc")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class KycApiResource {

    private final KycVerificationService kycVerificationService;

    /**
     * Submit an ID document for KYC verification.
     * Supports Kenyan National ID, Passport, and Alien Card.
     *
     * @param request JSON body with: clientId, idType (NATIONAL_ID|PASSPORT|ALIEN_CARD),
     *                idNumber, frontImageBase64, backImageBase64, countryCode (KE)
     * @return verification ID and initial status
     */
    @POST
    @Path("/verify")
    public Response submitVerification(Map<String, Object> request) {
        log.info("KYC verification submitted: clientId={}, idType={}",
                request.get("clientId"), request.get("idType"));

        Map<String, Object> result = kycVerificationService.submitVerification(
                (String) request.get("clientId"),
                (String) request.get("idType"),
                (String) request.get("idNumber"),
                (String) request.get("frontImageBase64"),
                (String) request.get("backImageBase64")
        );

        return Response.status(Response.Status.CREATED).entity(result).build();
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
