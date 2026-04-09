/**
 * NeoBank — Card Management API
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.card.api;

import com.qsoftwares.neobank.card.service.CardManagementService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Path("/v1/neobank/cards")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class CardApiResource {

    private final CardManagementService cardService;

    /** Get all cards for a client. */
    @GET @Path("/client/{clientId}")
    public Response getClientCards(@PathParam("clientId") long clientId) {
        return Response.ok(cardService.getClientCards(clientId)).build();
    }

    /** Get card details. */
    @GET @Path("/{cardId}")
    public Response getCard(@PathParam("cardId") String cardId) {
        return Response.ok(cardService.getCard(cardId)).build();
    }

    /** Get card transactions. */
    @GET @Path("/{cardId}/transactions")
    public Response getCardTransactions(@PathParam("cardId") String cardId, @QueryParam("limit") @DefaultValue("10") int limit) {
        return Response.ok(cardService.getCardTransactions(cardId, limit)).build();
    }

    /** Issue a new virtual card. */
    @POST @Path("/issue")
    public Response issueVirtualCard(Map<String, Object> request) {
        long clientId = Long.parseLong(request.get("clientId").toString());
        String accountRef = (String) request.getOrDefault("accountRef", "");
        String name = (String) request.getOrDefault("cardholderName", "");
        return Response.ok(cardService.issueVirtualCard(clientId, accountRef, name)).build();
    }

    /** Freeze or unfreeze a card. */
    @POST @Path("/{cardId}/freeze")
    public Response toggleFreeze(@PathParam("cardId") String cardId, Map<String, Object> request) {
        boolean freeze = Boolean.parseBoolean(request.getOrDefault("freeze", "true").toString());
        return Response.ok(cardService.toggleFreeze(cardId, freeze)).build();
    }

    /** Update card spending limits. */
    @PUT @Path("/{cardId}/limits")
    public Response updateLimits(@PathParam("cardId") String cardId, Map<String, Object> request) {
        long daily = Long.parseLong(request.getOrDefault("dailyLimit", "50000").toString());
        long monthly = Long.parseLong(request.getOrDefault("monthlyLimit", "500000").toString());
        return Response.ok(cardService.updateLimits(cardId, daily, monthly)).build();
    }

    /** Request PIN reset. */
    @POST @Path("/{cardId}/pin-reset")
    public Response requestPinReset(@PathParam("cardId") String cardId) {
        return Response.ok(cardService.requestPinReset(cardId)).build();
    }
}
