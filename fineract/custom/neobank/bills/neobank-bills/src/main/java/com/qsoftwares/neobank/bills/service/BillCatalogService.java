/**
 * NeoBank — Bill Catalog Service
 * Provides a static catalog of Kenyan billers as a fallback when Gava Connect is unavailable.
 * 8 high-frequency categories with real Kenyan billers.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.bills.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BillCatalogService {

    private static final List<Map<String, Object>> CATALOG = List.of(
        biller("KPLC_PREPAID", "KPLC Prepaid", "electricity", "Kenya Power prepaid tokens", "Meter Number"),
        biller("KPLC_POSTPAID", "KPLC Postpaid", "electricity", "Kenya Power postpaid bills", "Account Number"),
        biller("NAIROBI_WATER", "Nairobi Water", "water", "Nairobi City Water & Sewerage", "Account Number"),
        biller("ELDOWAS", "Eldoret Water", "water", "Eldoret Water & Sanitation Company", "Account Number"),
        biller("NHIF", "NHIF", "government", "National Hospital Insurance Fund", "ID Number"),
        biller("NSSF", "NSSF", "government", "National Social Security Fund", "Member Number"),
        biller("NTSA", "NTSA", "government", "National Transport & Safety Authority", "ID/DL Number"),
        biller("ECITIZEN", "eCitizen", "government", "Government of Kenya eCitizen portal", "Invoice Number"),
        biller("KRA_TAX", "KRA", "government", "Kenya Revenue Authority tax payments", "KRA PIN"),
        biller("DSTV", "DStv", "entertainment", "MultiChoice DStv Kenya", "Smartcard Number"),
        biller("GOTV", "GOtv", "entertainment", "MultiChoice GOtv Kenya", "IUC Number"),
        biller("SHOWMAX", "Showmax", "entertainment", "Showmax streaming subscription", "Email/Phone"),
        biller("ZUKU", "Zuku", "internet", "Zuku internet & TV", "Account Number"),
        biller("SAFARICOM_HOME", "Safaricom Home", "internet", "Safaricom Home Fibre", "Account Number"),
        biller("FAIBA", "Faiba", "internet", "JTL Faiba internet", "Account Number"),
        biller("JUBILEE_INSURANCE", "Jubilee Insurance", "insurance", "Jubilee Health & Life Insurance", "Policy Number"),
        biller("BRITAM", "Britam", "insurance", "Britam Insurance premiums", "Policy Number"),
        biller("NAIROBI_COUNTY", "Nairobi County", "rent", "Nairobi County rates & parking", "Account Number"),
        biller("SCHOOL_FEES", "School Fees", "education", "Pay school fees via paybill", "Admission Number")
    );

    private static Map<String, Object> biller(String code, String name, String category, String description, String accountLabel) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("billerCode", code);
        b.put("billerName", name);
        b.put("category", category);
        b.put("description", description);
        b.put("accountLabel", accountLabel);
        b.put("minAmountKes", 10);
        b.put("maxAmountKes", 500000);
        return b;
    }

    public List<Map<String, Object>> getCatalog() {
        return CATALOG;
    }

    public List<Map<String, Object>> getBillersByCategory(String category) {
        return CATALOG.stream()
            .filter(b -> category.equalsIgnoreCase((String) b.get("category")))
            .toList();
    }

    public Map<String, Object> validateAccount(String billerCode, String accountNumber) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("billerCode", billerCode);
        result.put("accountNumber", accountNumber);
        result.put("valid", true);
        result.put("accountName", "Account Holder — " + accountNumber);
        result.put("billerName", CATALOG.stream()
            .filter(b -> billerCode.equals(b.get("billerCode")))
            .map(b -> b.get("billerName"))
            .findFirst()
            .orElse(billerCode));
        return result;
    }
}
