/**
 * NeoBank — Card Issuing API Resource
 * BaaS Partner Integration (Marqeta / Stripe Issuing)
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.card.api;

import com.qsoftwares.neobank.card.service.CardIssuingService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Path("/v1/neobank/cards")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CardApiResource {

    private final CardIssuingService cardIssuingService;

    /**
     * Issue a new virtual or physical card.
     *
     * @param request JSON body with: clientId, cardType (VIRTUAL|PHYSICAL),
     *                cardNetwork (VISA|MASTERCARD), currency (KES|USD),
     *                nameOnCard, deliveryAddress (for physical)
     * @return issued card details (masked PAN, expiry, status)
     */
    @POST
    @Path("/issue")
    public Response issueCard(Map<String, Object> request) {
        log.info("Card issue request: clientId={}, type={}, network={}",
                request.get("clientId"), request.get("cardType"), request.get("cardNetwork"));

        Map<String, Object> result = cardIssuingService.issueCard(
                (String) request.get("clientId"),
                (String) request.get("cardType"),
                (String) request.get("cardNetwork"),
                (String) request.get("currency"),
                (String) request.get("nameOnCard")
        );

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Freeze a card to temporarily block all transactions.
     *
     * @param cardId the card identifier
     * @return updated card status
     */
    @PUT
    @Path("/{cardId}/freeze")
    public Response freezeCard(@PathParam("cardId") String cardId) {
        log.info("Freeze card request: cardId={}", cardId);

        Map<String, Object> result = cardIssuingService.freezeCard(cardId);

        return Response.ok(result).build();
    }

    /**
     * Unfreeze a previously frozen card.
     *
     * @param cardId the card identifier
     * @return updated card status
     */
    @PUT
    @Path("/{cardId}/unfreeze")
    public Response unfreezeCard(@PathParam("cardId") String cardId) {
        log.info("Unfreeze card request: cardId={}", cardId);

        Map<String, Object> result = cardIssuingService.unfreezeCard(cardId);

        return Response.ok(result).build();
    }

    /**
     * Reset the card PIN.
     *
     * @param cardId  the card identifier
     * @param request JSON body with: currentPin, newPin
     * @return PIN reset confirmation
     */
    @PUT
    @Path("/{cardId}/pin")
    public Response resetPin(@PathParam("cardId") String cardId, Map<String, Object> request) {
        log.info("PIN reset request: cardId={}", cardId);

        Map<String, Object> result = cardIssuingService.resetPin(cardId, request);

        return Response.ok(result).build();
    }

    /**
     * Get card transaction history.
     *
     * @param cardId the card identifier
     * @return list of recent card transactions
     */
    @GET
    @Path("/{cardId}/transactions")
    public Response getCardTransactions(@PathParam("cardId") String cardId) {
        log.info("Card transactions request: cardId={}", cardId);

        Map<String, Object> result = cardIssuingService.getTransactions(cardId);

        return Response.ok(result).build();
    }

    /**
     * Set or update spending limits on a card.
     *
     * @param cardId  the card identifier
     * @param request JSON body with: dailyLimit, monthlyLimit, perTransactionLimit, currency
     * @return updated limit configuration
     */
    @PUT
    @Path("/{cardId}/limits")
    public Response setSpendingLimits(@PathParam("cardId") String cardId, Map<String, Object> request) {
        log.info("Set spending limits: cardId={}", cardId);

        Map<String, Object> result = cardIssuingService.setLimits(cardId, request);

        return Response.ok(result).build();
    }
}
