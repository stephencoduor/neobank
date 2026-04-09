/**
 * NeoBank — Merchant API
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.merchant.api;

import com.qsoftwares.neobank.merchant.service.MerchantService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Path("/v1/neobank/merchants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class MerchantApiResource {

    private final MerchantService merchantService;

    @GET
    public Response listMerchants() {
        return Response.ok(merchantService.listMerchants()).build();
    }

    @GET @Path("/{merchantId}")
    public Response getMerchant(@PathParam("merchantId") String merchantId) {
        return Response.ok(merchantService.getMerchant(merchantId)).build();
    }

    @POST @Path("/register")
    public Response registerMerchant(Map<String, String> request) {
        return Response.ok(merchantService.registerMerchant(
            request.getOrDefault("businessName", ""),
            request.getOrDefault("businessType", ""),
            request.getOrDefault("ownerName", ""),
            request.getOrDefault("phone", ""),
            request.getOrDefault("email", ""),
            request.getOrDefault("location", "")
        )).build();
    }

    @PUT @Path("/{merchantId}/settlement")
    public Response configureSettlement(@PathParam("merchantId") String merchantId, Map<String, String> request) {
        return Response.ok(merchantService.configureSettlement(
            merchantId,
            request.getOrDefault("frequency", "DAILY"),
            request.getOrDefault("bankCode", ""),
            request.getOrDefault("accountNumber", "")
        )).build();
    }

    @GET @Path("/{merchantId}/revenue")
    public Response getRevenueSummary(@PathParam("merchantId") String merchantId) {
        return Response.ok(merchantService.getRevenueSummary(merchantId)).build();
    }
}
