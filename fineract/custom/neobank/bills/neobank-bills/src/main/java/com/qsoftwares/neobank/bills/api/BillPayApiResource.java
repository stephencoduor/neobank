/**
 * NeoBank — Bill Payment API Resource
 * Provides eCitizen / utility bill catalog, payment initiation, and receipt lookup.
 * Routes: /v1/neobank/bills/*
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.bills.api;

import com.qsoftwares.neobank.bills.service.BillCatalogService;
import com.qsoftwares.neobank.bills.service.BillPaymentService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Path("/v1/neobank/bills")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BillPayApiResource {

    private final BillCatalogService catalogService;
    private final BillPaymentService paymentService;

    /**
     * Get the full bill catalog (all billers grouped by category).
     */
    @GET
    @Path("/catalog")
    public Response getCatalog() {
        return Response.ok(catalogService.getCatalog()).build();
    }

    /**
     * Get billers by category (e.g., electricity, water, government).
     */
    @GET
    @Path("/catalog/{category}")
    public Response getBillersByCategory(@PathParam("category") String category) {
        return Response.ok(catalogService.getBillersByCategory(category)).build();
    }

    /**
     * Validate a bill account number before payment.
     */
    @POST
    @Path("/validate")
    public Response validateAccount(Map<String, Object> request) {
        String billerCode = (String) request.get("billerCode");
        String accountNumber = (String) request.get("accountNumber");
        log.info("Bill validation: biller={}, account={}", billerCode, accountNumber);

        Map<String, Object> result = catalogService.validateAccount(billerCode, accountNumber);
        return Response.ok(result).build();
    }

    /**
     * Pay a bill.
     *
     * @param request JSON: { billerCode, accountNumber, amountMinor, clientId }
     */
    @POST
    @Path("/pay")
    public Response payBill(Map<String, Object> request) {
        String billerCode = (String) request.get("billerCode");
        String accountNumber = (String) request.get("accountNumber");
        long amountMinor = ((Number) request.get("amountMinor")).longValue();
        long clientId = ((Number) request.get("clientId")).longValue();

        log.info("Bill payment: biller={}, account={}, amount={} minor, client={}",
            billerCode, accountNumber, amountMinor, clientId);

        Map<String, Object> result = paymentService.payBill(billerCode, accountNumber, amountMinor, clientId);
        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Get payment receipt by transaction ID.
     */
    @GET
    @Path("/receipt/{transactionId}")
    public Response getReceipt(@PathParam("transactionId") String transactionId) {
        Map<String, Object> receipt = paymentService.getReceipt(transactionId);
        return Response.ok(receipt).build();
    }
}
