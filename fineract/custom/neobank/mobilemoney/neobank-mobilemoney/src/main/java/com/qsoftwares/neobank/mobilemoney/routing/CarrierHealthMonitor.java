/**
 * NeoBank — Carrier Health Monitor
 * Tracks success rate and latency per carrier using a rolling window.
 * Updates CarrierRouter health scores every 15 seconds.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.routing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
@RequiredArgsConstructor
@Slf4j
public class CarrierHealthMonitor {

    private final CarrierRouter carrierRouter;

    private static final int WINDOW_SIZE = 100;
    private static final long WINDOW_MS = 15 * 60 * 1000L; // 15 minutes

    private final Map<CarrierRouter.Carrier, ConcurrentLinkedDeque<Sample>> windows = Map.of(
        CarrierRouter.Carrier.MPESA, new ConcurrentLinkedDeque<>(),
        CarrierRouter.Carrier.AIRTEL, new ConcurrentLinkedDeque<>(),
        CarrierRouter.Carrier.TELKOM, new ConcurrentLinkedDeque<>()
    );

    public void recordOutcome(CarrierRouter.Carrier carrier, boolean success, long latencyMs) {
        ConcurrentLinkedDeque<Sample> window = windows.get(carrier);
        if (window == null) return;
        window.addLast(new Sample(Instant.now().toEpochMilli(), success, latencyMs));
        while (window.size() > WINDOW_SIZE) window.pollFirst();
    }

    @Scheduled(fixedRate = 15_000)
    public void recalculateHealth() {
        long cutoff = Instant.now().toEpochMilli() - WINDOW_MS;
        for (var entry : windows.entrySet()) {
            List<Sample> recent = entry.getValue().stream()
                .filter(s -> s.timestamp >= cutoff)
                .toList();
            if (recent.isEmpty()) {
                carrierRouter.updateHealth(entry.getKey(), 100); // no data = assume healthy
                continue;
            }
            long successes = recent.stream().filter(s -> s.success).count();
            double successRate = (double) successes / recent.size();
            long p95Latency = recent.stream()
                .mapToLong(s -> s.latencyMs)
                .sorted()
                .skip((long) (recent.size() * 0.95))
                .findFirst()
                .orElse(0);
            // Health = 70% success rate + 30% latency score
            int latencyScore = p95Latency < 2000 ? 100 : p95Latency < 5000 ? 70 : p95Latency < 10000 ? 40 : 10;
            int health = (int) (successRate * 70 + latencyScore * 0.30);
            carrierRouter.updateHealth(entry.getKey(), health);
            log.debug("Carrier {} health={} (successRate={}, p95={}ms, samples={})",
                entry.getKey(), health, String.format("%.1f%%", successRate * 100), p95Latency, recent.size());
        }
    }

    private record Sample(long timestamp, boolean success, long latencyMs) {}
}
