/**
 * NeoBank — Merchant Services API Resource
 * Merchant Onboarding, POS Management & Settlements
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.merchant.api;

import com.qsoftwares.neobank.merchant.service.MerchantService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Path("/v1/neobank/merchants")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MerchantApiResource {

    private final MerchantService merchantService;

    /**
     * Onboard a new merchant.
     *
     * @param request JSON body with: businessName, businessType, registrationNumber,
     *                kraPin, ownerName, ownerPhone (+254), ownerEmail,
     *                physicalAddress, county, settlementAccountNumber
     * @return merchant ID and onboarding status
     */
    @POST
    @Path("/onboard")
    public Response onboardMerchant(Map<String, Object> request) {
        log.info("Merchant onboarding request: business={}", request.get("businessName"));

        Map<String, Object> result = merchantService.onboardMerchant(request);

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Get merchant details by ID.
     *
     * @param merchantId the merchant identifier
     * @return merchant profile and status
     */
    @GET
    @Path("/{merchantId}")
    public Response getMerchant(@PathParam("merchantId") String merchantId) {
        log.info("Get merchant details: merchantId={}", merchantId);

        Map<String, Object> result = merchantService.getMerchant(merchantId);

        return Response.ok(result).build();
    }

    /**
     * Get settlement history for a merchant.
     *
     * @param merchantId the merchant identifier
     * @return list of settlements with amounts, dates, and statuses
     */
    @GET
    @Path("/{merchantId}/settlements")
    public Response getSettlements(@PathParam("merchantId") String merchantId) {
        log.info("Get settlements: merchantId={}", merchantId);

        Map<String, Object> result = merchantService.getSettlements(merchantId);

        return Response.ok(result).build();
    }

    /**
     * Register a new POS terminal for a merchant.
     *
     * @param merchantId the merchant identifier
     * @param request    JSON body with: terminalType (ANDROID_POS|MPOS|VIRTUAL),
     *                   terminalLabel, location
     * @return terminal ID and activation details
     */
    @POST
    @Path("/{merchantId}/pos")
    public Response registerPosTerminal(@PathParam("merchantId") String merchantId,
                                        Map<String, Object> request) {
        log.info("Register POS terminal: merchantId={}, type={}", merchantId, request.get("terminalType"));

        Map<String, Object> result = merchantService.registerPosTerminal(merchantId, request);

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Get revenue analytics for a merchant.
     *
     * @param merchantId the merchant identifier
     * @return revenue summary, hourly breakdown, top payment methods
     */
    @GET
    @Path("/{merchantId}/analytics")
    public Response getAnalytics(@PathParam("merchantId") String merchantId) {
        log.info("Get merchant analytics: merchantId={}", merchantId);

        Map<String, Object> result = merchantService.getAnalytics(merchantId);

        return Response.ok(result).build();
    }
}
