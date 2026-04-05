/**
 * NeoBank — Strong Customer Authentication (SCA) API Resource
 * Device binding, step-up authentication, and SIM-swap detection (F-27 v1).
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.auth.api;

import com.qsoftwares.neobank.auth.dto.DeviceBindRequest;
import com.qsoftwares.neobank.auth.dto.SimSwapResponse;
import com.qsoftwares.neobank.auth.dto.StepUpRequest;
import com.qsoftwares.neobank.auth.service.NeoBankAuthService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Path("/v1/neobank/auth")
@Component
@RequiredArgsConstructor
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NeoBankAuthApiResource {

    private final NeoBankAuthService neoBankAuthService;

    /**
     * Bind a mobile device to a client account. The device public key is
     * registered and used for subsequent request signing and step-up challenges.
     *
     * @param request device binding request payload
     * @return registered device id and binding metadata
     */
    @POST
    @Path("/device/bind")
    public Response bindDevice(DeviceBindRequest request) {
        log.info("Device bind requested: clientId={}, platform={}, deviceName={}",
                request.getClientId(), request.getPlatform(), request.getDeviceName());

        Map<String, Object> result = neoBankAuthService.bindDevice(request);

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Initiate a step-up authentication challenge (OTP, biometric, or PIN)
     * for high-risk actions such as large transfers or profile changes.
     *
     * @param request step-up challenge request payload
     * @return challenge id and expected verification method
     */
    @POST
    @Path("/stepup")
    public Response initiateStepUp(StepUpRequest request) {
        log.info("Step-up challenge initiated: clientId={}, challengeType={}, action={}",
                request.getClientId(), request.getChallengeType(), request.getAction());

        Map<String, Object> result = neoBankAuthService.initiateStepUp(request);

        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    /**
     * Check whether a Kenyan MSISDN (e.g. +254712345678) has recently had a
     * SIM-swap event. Used to block high-risk transactions immediately after
     * a SIM change to prevent account takeover attacks.
     *
     * @param msisdn E.164 formatted Kenyan mobile number
     * @return SIM swap status and risk indicators
     */
    @GET
    @Path("/sim-swap/{msisdn}")
    public Response checkSimSwap(@PathParam("msisdn") String msisdn) {
        log.info("SIM swap check requested for msisdn={}", msisdn);

        SimSwapResponse result = neoBankAuthService.checkSimSwap(msisdn);

        return Response.ok(result).build();
    }
}
