package com.qsoftwares.neobank.aml.api;

import com.qsoftwares.neobank.aml.dto.AmlCaseResponse;
import com.qsoftwares.neobank.aml.dto.DispositionRequest;
import com.qsoftwares.neobank.aml.service.AmlRuleEngine;
import com.qsoftwares.neobank.aml.service.SanctionsScreener;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Slf4j @Component
@Path("/v1/neobank/aml")
@Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class AmlApiResource {

    private final AmlRuleEngine ruleEngine;
    private final SanctionsScreener sanctionsScreener;

    @GET @Path("/cases")
    public Response listCases(@QueryParam("status") String status, @QueryParam("severity") String severity) {
        log.info("List AML cases: status={}, severity={}", status, severity);
        List<AmlCaseResponse> cases = List.of(
            AmlCaseResponse.builder().caseId("AML-001").clientId(42L).clientName("Suspicious Trader")
                .ruleCode("STRUCTURING_BELOW_50K").severity("HIGH").status("OPEN")
                .triggeredAt("2026-04-01T14:30:00Z").build(),
            AmlCaseResponse.builder().caseId("AML-002").clientId(88L).clientName("High Volume Sender")
                .ruleCode("VELOCITY_5_IN_1H").severity("MEDIUM").status("UNDER_REVIEW")
                .triggeredAt("2026-04-03T09:15:00Z").build()
        );
        return Response.ok(Map.of("cases", cases, "totalCount", cases.size())).build();
    }

    @GET @Path("/cases/{id}")
    public Response getCase(@PathParam("id") String id) {
        log.info("Get AML case: id={}", id);
        return Response.ok(AmlCaseResponse.builder().caseId(id).clientId(42L)
            .clientName("Suspicious Trader").ruleCode("STRUCTURING_BELOW_50K")
            .severity("HIGH").status("OPEN").triggeredAt("2026-04-01T14:30:00Z").build()).build();
    }

    @POST @Path("/cases/{id}/disposition")
    public Response disposeCase(@PathParam("id") String id, DispositionRequest request) {
        log.info("AML case disposition: id={}, action={}", id, request.getAction());
        return Response.ok(Map.of("caseId", id, "action", request.getAction(),
            "newStatus", "DISMISS".equals(request.getAction()) ? "DISMISSED" : "ESCALATED",
            "disposedBy", request.getDisposedBy(), "disposedAt", Instant.now().toString())).build();
    }

    @POST @Path("/str/export")
    public Response exportStr(Map<String, Object> request) {
        log.info("STR export requested");
        return Response.ok(Map.of("format", "FRC-goAML-XML", "caseCount", 2,
            "exportedAt", Instant.now().toString(), "status", "GENERATED",
            "message", "Suspicious Transaction Report generated in FRC goAML XML format")).build();
    }

    @GET @Path("/rules")
    public Response listRules() {
        return Response.ok(Map.of("rules", ruleEngine.getRules())).build();
    }

    @POST @Path("/screen")
    public Response screenPerson(Map<String, Object> request) {
        String name = (String) request.getOrDefault("name", "");
        String idNumber = (String) request.getOrDefault("idNumber", "");
        return Response.ok(sanctionsScreener.screen(name, idNumber)).build();
    }
}
