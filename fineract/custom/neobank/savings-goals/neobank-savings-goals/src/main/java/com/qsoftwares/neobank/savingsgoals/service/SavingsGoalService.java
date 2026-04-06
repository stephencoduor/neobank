package com.qsoftwares.neobank.savingsgoals.service;

import com.qsoftwares.neobank.savingsgoals.dto.CreateGoalRequest;
import com.qsoftwares.neobank.savingsgoals.dto.SavingsGoalResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j @Service
public class SavingsGoalService {

    private static final List<String> KENYAN_GOALS = List.of(
        "Nyumba Fund", "School Fees - Term 2", "Safari ya Mombasa",
        "Biashara Capital", "Wedding Savings", "Emergency Fund - Daktari",
        "Dowry Fund", "Mama's Land Purchase", "Jiko Solar Panel"
    );

    public SavingsGoalResponse createGoal(CreateGoalRequest req) {
        String goalId = "GOAL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Creating savings goal: id={}, name={}, target={} KES minor", goalId, req.getName(), req.getTargetAmountMinor());

        return SavingsGoalResponse.builder()
            .goalId(goalId).clientId(1L).name(req.getName())
            .targetAmountMinor(req.getTargetAmountMinor()).currentAmountMinor(0L)
            .currencyCode(req.getCurrencyCode()).progressPct(0)
            .linkedSavingsAccountId(req.getLinkedSavingsAccountId())
            .autoSweepEnabled(req.isAutoSweepEnabled())
            .sweepFrequency(req.getSweepFrequency())
            .sweepAmountMinor(req.getSweepAmountMinor())
            .lockUntilDate(req.getLockUntilDate())
            .status(req.getLockUntilDate() != null ? "LOCKED" : "ACTIVE")
            .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString())
            .milestones(List.of(
                Map.of("milestonePct", 25, "reached", false),
                Map.of("milestonePct", 50, "reached", false),
                Map.of("milestonePct", 75, "reached", false),
                Map.of("milestonePct", 100, "reached", false)
            )).build();
    }

    public SavingsGoalResponse getGoal(String goalId) {
        String name = KENYAN_GOALS.get(Math.abs(goalId.hashCode()) % KENYAN_GOALS.size());
        return SavingsGoalResponse.builder()
            .goalId(goalId).clientId(1L).name(name)
            .targetAmountMinor(500_000_00L).currentAmountMinor(187_500_00L)
            .currencyCode("KES").progressPct(37)
            .autoSweepEnabled(true).sweepFrequency("WEEKLY").sweepAmountMinor(10_000_00L)
            .status("ACTIVE").createdAt("2026-01-15T10:00:00Z").updatedAt("2026-04-01T08:00:00Z")
            .milestones(List.of(
                Map.of("milestonePct", 25, "reached", true, "reachedAt", "2026-02-20T08:00:00Z"),
                Map.of("milestonePct", 50, "reached", false),
                Map.of("milestonePct", 75, "reached", false),
                Map.of("milestonePct", 100, "reached", false)
            )).build();
    }

    public List<SavingsGoalResponse> listGoals() {
        return List.of(
            getGoal("GOAL-NYUMBA01"),
            SavingsGoalResponse.builder()
                .goalId("GOAL-FEES0002").clientId(1L).name("School Fees - Term 2")
                .targetAmountMinor(150_000_00L).currentAmountMinor(150_000_00L)
                .currencyCode("KES").progressPct(100).status("COMPLETED")
                .createdAt("2025-11-01T10:00:00Z").updatedAt("2026-03-15T12:00:00Z")
                .milestones(List.of(
                    Map.of("milestonePct", 25, "reached", true),
                    Map.of("milestonePct", 50, "reached", true),
                    Map.of("milestonePct", 75, "reached", true),
                    Map.of("milestonePct", 100, "reached", true, "reachedAt", "2026-03-15T12:00:00Z")
                )).build()
        );
    }

    public Map<String, Object> lockGoal(String goalId, String lockUntilDate) {
        log.info("Locking goal: id={}, until={}", goalId, lockUntilDate);
        return Map.of("goalId", goalId, "status", "LOCKED", "lockUntilDate", lockUntilDate,
            "message", "Goal locked. Withdrawals disabled until " + lockUntilDate);
    }

    public Map<String, Object> triggerSweep(String goalId) {
        log.info("Manual sweep triggered for goal: id={}", goalId);
        return Map.of("goalId", goalId, "sweepAmount", 10_000_00L, "currency", "KES",
            "status", "SUCCESS", "message", "KES 10,000 swept from linked account",
            "newBalance", 197_500_00L, "sweepDate", Instant.now().toString());
    }
}
