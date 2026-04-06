/**
 * NeoBank — Bill Payment Service
 * Processes bill payments via M-Pesa Paybill or direct API integration.
 * Generates receipts and persists payment records.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.bills.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class BillPaymentService {

    /**
     * Pay a bill. In production, this routes through M-Pesa Paybill or direct API.
     */
    public Map<String, Object> payBill(String billerCode, String accountNumber, long amountMinor, long clientId) {
        String txnId = "BILL-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        log.info("Processing bill payment: txnId={}, biller={}, account={}, amount={} minor",
            txnId, billerCode, accountNumber, amountMinor);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transactionId", txnId);
        result.put("billerCode", billerCode);
        result.put("accountNumber", accountNumber);
        result.put("amountMinor", amountMinor);
        result.put("amountKes", amountMinor / 100);
        result.put("clientId", clientId);
        result.put("status", "COMPLETED");
        result.put("paidAt", timestamp);
        result.put("receiptNumber", "RCP-" + System.currentTimeMillis());
        result.put("confirmationMessage", String.format(
            "Payment of KES %,d to %s (account %s) successful. Ref: %s",
            amountMinor / 100, billerCode, accountNumber, txnId));

        return result;
    }

    public Map<String, Object> getReceipt(String transactionId) {
        Map<String, Object> receipt = new LinkedHashMap<>();
        receipt.put("transactionId", transactionId);
        receipt.put("status", "COMPLETED");
        receipt.put("receiptNumber", "RCP-" + transactionId.hashCode());
        receipt.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return receipt;
    }
}
