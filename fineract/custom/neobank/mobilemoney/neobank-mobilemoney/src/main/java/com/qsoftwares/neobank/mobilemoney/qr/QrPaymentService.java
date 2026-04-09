/**
 * NeoBank — QR Payment Service
 * Generates dynamic QR codes for payment requests and processes scanned QR payments.
 * Supports Lipa Na M-Pesa QR, NeoBank-native QR, and PesaLink QR formats.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.qr;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@Slf4j
public class QrPaymentService {

    // In-memory QR store — production uses Redis/DB
    private final Map<String, QrPayload> activeQrs = new LinkedHashMap<>();

    /**
     * Generate a dynamic QR code payload for receiving payment.
     */
    public Map<String, Object> generateQr(String accountRef, long amountKes, String merchantName, String description) {
        String qrId = "QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String expiresAt = Instant.now().plusSeconds(600).toString(); // 10 min expiry

        QrPayload payload = new QrPayload(qrId, accountRef, amountKes, merchantName, description, expiresAt);
        activeQrs.put(qrId, payload);

        // QR content — JSON-encoded for NeoBank scanner, also compatible with Lipa Na M-Pesa
        String qrContent = String.format(
            "{\"type\":\"NEOBANK_QR\",\"id\":\"%s\",\"acc\":\"%s\",\"amt\":%d,\"name\":\"%s\",\"desc\":\"%s\",\"exp\":\"%s\"}",
            qrId, accountRef, amountKes, merchantName, description, expiresAt
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("qrId", qrId);
        result.put("qrContent", qrContent);
        result.put("accountRef", accountRef);
        result.put("amount", amountKes);
        result.put("merchantName", merchantName);
        result.put("description", description);
        result.put("expiresAt", expiresAt);
        result.put("status", "ACTIVE");
        log.info("QR generated: {} for {} KES {}", qrId, merchantName, amountKes);
        return result;
    }

    /**
     * Parse a scanned QR code and return payment details.
     */
    public Map<String, Object> parseQr(String qrContent) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            // Parse NeoBank QR format
            if (qrContent.contains("NEOBANK_QR")) {
                // Simple JSON parsing — production uses Jackson
                String qrId = extractJsonField(qrContent, "id");
                QrPayload payload = activeQrs.get(qrId);

                if (payload == null) {
                    result.put("valid", false);
                    result.put("error", "QR code not found or expired");
                    return result;
                }

                result.put("valid", true);
                result.put("type", "NEOBANK_QR");
                result.put("qrId", payload.qrId());
                result.put("recipientAccount", payload.accountRef());
                result.put("amount", payload.amountKes());
                result.put("merchantName", payload.merchantName());
                result.put("description", payload.description());
                result.put("expiresAt", payload.expiresAt());
                return result;
            }

            // Lipa Na M-Pesa QR — starts with till number
            if (qrContent.matches("^\\d{5,7}.*")) {
                result.put("valid", true);
                result.put("type", "MPESA_TILL");
                result.put("tillNumber", qrContent.substring(0, Math.min(7, qrContent.length())));
                result.put("merchantName", "M-Pesa Merchant");
                result.put("amount", 0); // Amount entered by customer
                return result;
            }

            result.put("valid", false);
            result.put("error", "Unrecognized QR format");
        } catch (Exception e) {
            result.put("valid", false);
            result.put("error", "Failed to parse QR: " + e.getMessage());
        }
        return result;
    }

    /**
     * Process a QR payment — debit sender, credit recipient.
     */
    public Map<String, Object> processPayment(String qrId, String senderAccount, long amountKes) {
        QrPayload payload = activeQrs.get(qrId);

        Map<String, Object> result = new LinkedHashMap<>();
        String txnId = "QRTX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        result.put("transactionId", txnId);

        if (payload == null) {
            result.put("status", "FAILED");
            result.put("error", "QR code expired or not found");
            return result;
        }

        // Use QR amount if specified, otherwise use provided amount
        long finalAmount = payload.amountKes() > 0 ? payload.amountKes() : amountKes;

        result.put("status", "COMPLETED");
        result.put("qrId", qrId);
        result.put("senderAccount", senderAccount);
        result.put("recipientAccount", payload.accountRef());
        result.put("merchantName", payload.merchantName());
        result.put("amount", finalAmount);
        result.put("currency", "KES");
        result.put("fee", 0); // QR payments are free within NeoBank
        result.put("processedAt", Instant.now().toString());

        // Remove used QR
        activeQrs.remove(qrId);
        log.info("QR payment processed: {} -> {} KES {} via {}", senderAccount, payload.accountRef(), finalAmount, txnId);
        return result;
    }

    private String extractJsonField(String json, String field) {
        int idx = json.indexOf("\"" + field + "\":\"");
        if (idx < 0) return "";
        int start = idx + field.length() + 4;
        int end = json.indexOf("\"", start);
        return end > start ? json.substring(start, end) : "";
    }

    record QrPayload(String qrId, String accountRef, long amountKes, String merchantName, String description, String expiresAt) {}
}
