/**
 * NeoBank — Mobile Money API Resource
 * M-Pesa STK Push + Airtel Money Kenya Integration
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.api;

import com.qsoftwares.neobank.mobilemoney.service.MobileMoneyService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Path("/v1/neobank/mobilemoney")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MobileMoneyApiResource {

    private final MobileMoneyService mobileMoneyService;

    /**
     * Send money via M-Pesa STK Push or Airtel Money.
     * Initiates an outbound payment to the specified phone number.
     *
     * @param request JSON body with: provider (MPESA|AIRTEL), phoneNumber (+254...),
     *                amount (KES), accountReference, description
     * @return transaction reference and status
     */
    @POST
    @Path("/send")
    public Response sendMoney(Map<String, Object> request) {
        log.info("Mobile money send request: provider={}, phone={}",
                request.get("provider"), request.get("phoneNumber"));

        Map<String, Object> result = mobileMoneyService.sendMoney(
                (String) request.get("provider"),
                (String) request.get("phoneNumber"),
                request.get("amount"),
                (String) request.get("accountReference"),
                (String) request.get("description")
        );

        return Response.ok(result).build();
    }

    /**
     * Process incoming M-Pesa/Airtel payment callback.
     * This endpoint is called by the payment provider's webhook.
     *
     * @param callbackPayload raw callback payload from M-Pesa or Airtel
     * @return acknowledgement response
     */
    @POST
    @Path("/receive")
    public Response receivePayment(Map<String, Object> callbackPayload) {
        log.info("Mobile money callback received: {}", callbackPayload.get("transactionId"));

        Map<String, Object> result = mobileMoneyService.processCallback(callbackPayload);

        return Response.ok(result).build();
    }

    /**
     * Check mobile money wallet balance.
     *
     * @param walletId the wallet identifier
     * @return current balance and currency
     */
    @GET
    @Path("/balance/{walletId}")
    public Response getBalance(@PathParam("walletId") String walletId) {
        log.info("Balance inquiry for wallet: {}", walletId);

        Map<String, Object> result = mobileMoneyService.getBalance(walletId);

        return Response.ok(result).build();
    }

    /**
     * Check transaction status by transaction ID.
     *
     * @param transactionId the M-Pesa/Airtel transaction reference
     * @return transaction status details
     */
    @GET
    @Path("/status/{transactionId}")
    public Response getTransactionStatus(@PathParam("transactionId") String transactionId) {
        log.info("Transaction status inquiry: {}", transactionId);

        Map<String, Object> result = mobileMoneyService.getTransactionStatus(transactionId);

        return Response.ok(result).build();
    }
}
