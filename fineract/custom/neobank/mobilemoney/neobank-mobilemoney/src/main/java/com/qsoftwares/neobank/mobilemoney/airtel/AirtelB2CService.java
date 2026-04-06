/**
 * NeoBank — Airtel Money B2C Service
 * Implements Airtel Money Business-to-Customer disbursement for Kenya.
 * Used for P2P sends to Airtel subscribers and fallback payments.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.airtel;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class AirtelB2CService {

    @Value("${neobank.airtel.client-id:sandbox_client}")
    private String clientId;

    @Value("${neobank.airtel.client-secret:sandbox_secret}")
    private String clientSecret;

    @Value("${neobank.airtel.base-url:https://openapiuat.airtel.africa}")
    private String baseUrl;

    @Value("${neobank.airtel.pin:sandbox_pin}")
    private String encryptedPin;

    /**
     * Send money to an Airtel subscriber via B2C.
     * In production, calls Airtel Open API /standard/v1/disbursements.
     *
     * @param msisdn subscriber phone (254XXXXXXXXX or 0XXXXXXXXX)
     * @param amountKes amount in KES (whole units)
     * @param reference transaction reference
     * @return Map with transaction ID and status
     */
    public Map<String, Object> disburse(String msisdn, long amountKes, String reference) {
        String txnId = "ATX-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        log.info("Airtel B2C: msisdn={}, amount=KES {}, ref={}, txnId={}", msisdn, amountKes, reference, txnId);

        // Stub response — in production, POST to /standard/v1/disbursements
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("transactionId", txnId);
        response.put("status", "SUCCESS");
        response.put("statusCode", "200");
        response.put("message", "Money sent successfully");
        response.put("data", Map.of(
            "transaction", Map.of(
                "id", txnId,
                "status", "TS",
                "airtel_money_id", "MP" + System.currentTimeMillis()
            )
        ));

        return response;
    }

    /**
     * Check the status of a B2C disbursement.
     */
    public Map<String, Object> checkStatus(String transactionId) {
        log.info("Airtel B2C status query: txnId={}", transactionId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transactionId", transactionId);
        result.put("status", "TS"); // Transaction Successful
        result.put("message", "Transaction completed successfully");
        return result;
    }
}
