package com.qsoftwares.neobank.savingsgoals.api;

import com.qsoftwares.neobank.savingsgoals.dto.CreateGoalRequest;
import com.qsoftwares.neobank.savingsgoals.dto.SavingsGoalResponse;
import com.qsoftwares.neobank.savingsgoals.service.SavingsGoalService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j @Component
@Path("/v1/neobank/savings-goals")
@Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class SavingsGoalApiResource {

    private final SavingsGoalService savingsGoalService;

    @POST
    public Response createGoal(CreateGoalRequest request) {
        log.info("Create savings goal: name={}", request.getName());
        SavingsGoalResponse result = savingsGoalService.createGoal(request);
        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    @GET @Path("/{id}")
    public Response getGoal(@PathParam("id") String id) {
        log.info("Get savings goal: id={}", id);
        return Response.ok(savingsGoalService.getGoal(id)).build();
    }

    @GET
    public Response listGoals() {
        log.info("List all savings goals");
        List<SavingsGoalResponse> goals = savingsGoalService.listGoals();
        return Response.ok(Map.of("goals", goals, "totalCount", goals.size())).build();
    }

    @POST @Path("/{id}/lock")
    public Response lockGoal(@PathParam("id") String id, Map<String, Object> request) {
        String lockUntil = (String) request.getOrDefault("lockUntilDate", "2027-01-01");
        return Response.ok(savingsGoalService.lockGoal(id, lockUntil)).build();
    }

    @POST @Path("/{id}/sweep")
    public Response triggerSweep(@PathParam("id") String id) {
        log.info("Manual sweep for goal: id={}", id);
        return Response.ok(savingsGoalService.triggerSweep(id)).build();
    }
}
