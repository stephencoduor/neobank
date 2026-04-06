/**
 * NeoBank — Interop Hub API Resource
 * Provides unified payment routing, cost comparison, and carrier health endpoints.
 * Routes: /v1/neobank/interop/*
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.api;

import com.qsoftwares.neobank.mobilemoney.routing.CarrierRouter;
import com.qsoftwares.neobank.mobilemoney.mpesa.MpesaStkPushService;
import com.qsoftwares.neobank.mobilemoney.airtel.AirtelB2CService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Path("/v1/neobank/interop")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InteropApiResource {

    private final CarrierRouter carrierRouter;
    private final MpesaStkPushService mpesaService;
    private final AirtelB2CService airtelService;

    /**
     * Send money to any Kenyan mobile number.
     * The interop hub routes to the optimal carrier automatically.
     *
     * @param request JSON: { msisdn, amountMinor, accountRef, description }
     * @return routing decision + payment initiation result
     */
    @POST
    @Path("/send")
    public Response sendMoney(Map<String, Object> request) {
        String msisdn = (String) request.get("msisdn");
        long amountMinor = ((Number) request.get("amountMinor")).longValue();
        String accountRef = (String) request.getOrDefault("accountRef", "NeoBank");
        String description = (String) request.getOrDefault("description", "Payment");

        log.info("Interop send: msisdn={}, amountMinor={}", msisdn, amountMinor);

        // Route to best carrier
        CarrierRouter.RoutingDecision decision = carrierRouter.route(msisdn, amountMinor);
        long amountKes = amountMinor / 100;

        // Dispatch to carrier
        Map<String, Object> paymentResult;
        switch (decision.carrier()) {
            case MPESA:
                paymentResult = mpesaService.initiateSTKPush(msisdn, amountKes, accountRef, description);
                break;
            case AIRTEL:
                paymentResult = airtelService.disburse(msisdn, amountKes, accountRef);
                break;
            default:
                // Telkom not yet integrated — fall back to M-Pesa
                paymentResult = mpesaService.initiateSTKPush(msisdn, amountKes, accountRef, description);
                break;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("routing", Map.of(
            "carrier", decision.carrier().name(),
            "feeMinor", decision.feeMinor(),
            "failover", decision.failover(),
            "healthScore", decision.healthScore()
        ));
        result.put("payment", paymentResult);
        result.put("amountMinor", amountMinor);
        result.put("msisdn", msisdn);

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Compare costs across all carriers for a given amount.
     */
    @GET
    @Path("/costs")
    public Response compareCosts(@QueryParam("amountMinor") long amountMinor) {
        List<CarrierRouter.CostOption> options = carrierRouter.compareCosts(amountMinor);
        return Response.ok(options).build();
    }

    /**
     * Get current carrier health scores.
     */
    @GET
    @Path("/health")
    public Response carrierHealth() {
        // Return health for all carriers by checking a dummy route
        List<Map<String, Object>> health = new ArrayList<>();
        for (CarrierRouter.Carrier c : CarrierRouter.Carrier.values()) {
            CarrierRouter.RoutingDecision d = carrierRouter.route(
                c == CarrierRouter.Carrier.MPESA ? "254712000000" :
                c == CarrierRouter.Carrier.AIRTEL ? "254733000000" : "254770000000",
                100_00
            );
            health.add(Map.of(
                "carrier", c.name(),
                "healthScore", d.healthScore(),
                "available", d.healthScore() >= 50
            ));
        }
        return Response.ok(health).build();
    }

    /**
     * M-Pesa STK Push callback receiver.
     */
    @POST
    @Path("/mpesa/callback")
    public Response mpesaCallback(Map<String, Object> body) {
        Map<String, Object> result = mpesaService.processCallback(body);
        return Response.ok(result).build();
    }
}
