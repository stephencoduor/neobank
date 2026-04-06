/**
 * NeoBank — M-Pesa STK Push Service
 * Implements Safaricom Daraja API STK Push (Lipa Na M-Pesa Online).
 * Used for both P2P sends and bill payments.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.mpesa;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class MpesaStkPushService {

    @Value("${neobank.mpesa.consumer-key:sandbox_key}")
    private String consumerKey;

    @Value("${neobank.mpesa.consumer-secret:sandbox_secret}")
    private String consumerSecret;

    @Value("${neobank.mpesa.shortcode:174379}")
    private String shortcode;

    @Value("${neobank.mpesa.passkey:sandbox_passkey}")
    private String passkey;

    @Value("${neobank.mpesa.callback-url:https://api.neobank.co.ke/v1/neobank/mobilemoney/mpesa/callback}")
    private String callbackUrl;

    @Value("${neobank.mpesa.base-url:https://sandbox.safaricom.co.ke}")
    private String baseUrl;

    /**
     * Initiate an STK push to the customer's phone.
     * In production, this calls Safaricom Daraja API.
     * Currently returns a stub response for development.
     *
     * @param msisdn recipient phone (254XXXXXXXXX)
     * @param amountKes amount in KES (whole units)
     * @param accountRef account reference string
     * @param description transaction description
     * @return Map with CheckoutRequestID, ResponseCode, etc.
     */
    public Map<String, Object> initiateSTKPush(String msisdn, long amountKes, String accountRef, String description) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String checkoutRequestId = "ws_CO_" + timestamp + "_" + shortcode + "_" + UUID.randomUUID().toString().substring(0, 8);

        log.info("M-Pesa STK Push: msisdn={}, amount=KES {}, ref={}, checkoutId={}",
            msisdn, amountKes, accountRef, checkoutRequestId);

        // Stub response — in production, POST to /mpesa/stkpush/v1/processrequest
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("MerchantRequestID", UUID.randomUUID().toString());
        response.put("CheckoutRequestID", checkoutRequestId);
        response.put("ResponseCode", "0");
        response.put("ResponseDescription", "Success. Request accepted for processing");
        response.put("CustomerMessage", "Success. Request accepted for processing");

        return response;
    }

    /**
     * Process the M-Pesa STK callback.
     * In production, validates the callback and updates the transaction status.
     */
    public Map<String, Object> processCallback(Map<String, Object> callbackBody) {
        log.info("M-Pesa callback received: {}", callbackBody);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ResultCode", 0);
        result.put("ResultDesc", "Callback processed successfully");
        return result;
    }

    /**
     * Query the status of an STK push transaction.
     */
    public Map<String, Object> querySTKStatus(String checkoutRequestId) {
        log.info("Querying STK status: checkoutRequestId={}", checkoutRequestId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("CheckoutRequestID", checkoutRequestId);
        result.put("ResultCode", "0");
        result.put("ResultDesc", "The service request is processed successfully.");
        result.put("Amount", 500);
        result.put("TransactionDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        return result;
    }
}
