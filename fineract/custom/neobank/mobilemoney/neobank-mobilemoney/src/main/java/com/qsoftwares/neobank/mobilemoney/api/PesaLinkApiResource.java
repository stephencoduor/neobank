/**
 * NeoBank — PesaLink API Resource
 * Bank-to-bank transfer endpoints via IPSL PesaLink.
 * Routes: /v1/neobank/pesalink/*
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.api;

import com.qsoftwares.neobank.mobilemoney.pesalink.PesaLinkService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Path("/v1/neobank/pesalink")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PesaLinkApiResource {

    private final PesaLinkService pesaLinkService;

    @GET
    @Path("/banks")
    public Response getBankDirectory() {
        return Response.ok(pesaLinkService.getBankDirectory()).build();
    }

    @GET
    @Path("/banks/{bankCode}")
    public Response lookupBank(@PathParam("bankCode") String bankCode) {
        return Response.ok(pesaLinkService.lookupBank(bankCode)).build();
    }

    @POST
    @Path("/validate")
    public Response validateAccount(Map<String, Object> request) {
        return Response.ok(pesaLinkService.validateAccount(
            (String) request.get("bankCode"),
            (String) request.get("accountNumber")
        )).build();
    }

    @POST
    @Path("/send")
    public Response sendViaPesaLink(Map<String, Object> request) {
        return Response.status(Response.Status.CREATED).entity(
            pesaLinkService.sendViaPesaLink(
                (String) request.get("bankCode"),
                (String) request.get("accountNumber"),
                ((Number) request.get("amountKes")).longValue(),
                (String) request.getOrDefault("senderName", "NeoBank User"),
                (String) request.getOrDefault("reference", "PesaLink Transfer")
            )
        ).build();
    }
}
