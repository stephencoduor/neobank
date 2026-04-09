/**
 * NeoBank — QR Payment API
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.api;

import com.qsoftwares.neobank.mobilemoney.qr.QrPaymentService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Path("/v1/neobank/qr")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class QrPaymentApiResource {

    private final QrPaymentService qrService;

    /** Generate a dynamic QR code for receiving payment. */
    @POST @Path("/generate")
    public Response generateQr(Map<String, Object> request) {
        String accountRef = (String) request.getOrDefault("accountRef", "");
        long amount = Long.parseLong(request.getOrDefault("amount", "0").toString());
        String merchantName = (String) request.getOrDefault("merchantName", "NeoBank User");
        String description = (String) request.getOrDefault("description", "Payment");
        return Response.ok(qrService.generateQr(accountRef, amount, merchantName, description)).build();
    }

    /** Parse/scan a QR code to get payment details. */
    @POST @Path("/scan")
    public Response scanQr(Map<String, String> request) {
        String qrContent = request.getOrDefault("qrContent", "");
        return Response.ok(qrService.parseQr(qrContent)).build();
    }

    /** Process a QR payment. */
    @POST @Path("/pay")
    public Response processPayment(Map<String, Object> request) {
        String qrId = (String) request.getOrDefault("qrId", "");
        String senderAccount = (String) request.getOrDefault("senderAccount", "");
        long amount = Long.parseLong(request.getOrDefault("amount", "0").toString());
        return Response.ok(qrService.processPayment(qrId, senderAccount, amount)).build();
    }
}
