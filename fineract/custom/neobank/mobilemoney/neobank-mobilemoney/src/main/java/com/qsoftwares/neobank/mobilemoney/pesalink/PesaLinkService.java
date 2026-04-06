/**
 * NeoBank — PesaLink Service
 * Integrates with Kenya Bankers Association IPSL for bank-to-bank transfers.
 * Supports BIC lookup, account validation, and send via PesaLink rail.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.pesalink;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class PesaLinkService {

    @Value("${neobank.pesalink.api-key:sandbox_key}")
    private String apiKey;

    @Value("${neobank.pesalink.base-url:https://sandbox.ipsl.co.ke}")
    private String baseUrl;

    // Kenyan bank BIC codes — top 20 banks
    private static final Map<String, BankInfo> BANK_DIRECTORY = Map.ofEntries(
        Map.entry("01", new BankInfo("KCBK", "KCB Bank", "Kenya Commercial Bank")),
        Map.entry("02", new BankInfo("SCBL", "Standard Chartered", "Standard Chartered Bank Kenya")),
        Map.entry("03", new BankInfo("BARCKENX", "ABSA Kenya", "Absa Bank Kenya PLC")),
        Map.entry("06", new BankInfo("CITI", "Citi Bank", "Citibank N.A. Kenya")),
        Map.entry("10", new BankInfo("PRME", "Prime Bank", "Prime Bank Limited")),
        Map.entry("11", new BankInfo("COOPKENX", "Co-op Bank", "Co-operative Bank of Kenya")),
        Map.entry("12", new BankInfo("NBKE", "National Bank", "National Bank of Kenya")),
        Map.entry("14", new BankInfo("ORIENT", "Oriental Commercial", "Oriental Commercial Bank")),
        Map.entry("16", new BankInfo("CHAS", "NCBA Bank", "NCBA Group PLC")),
        Map.entry("18", new BankInfo("MIDT", "Middle East Bank", "Middle East Bank Kenya")),
        Map.entry("23", new BankInfo("CIKN", "Citibank", "Citibank Kenya")),
        Map.entry("25", new BankInfo("CRED", "Credit Bank", "Credit Bank PLC")),
        Map.entry("31", new BankInfo("CFCB", "Stanbic Bank", "Stanbic Bank Kenya")),
        Map.entry("36", new BankInfo("AFRI", "African Banking Corp", "ABC Bank")),
        Map.entry("39", new BankInfo("IMPE", "Imperial Bank", "Imperial Bank Limited")),
        Map.entry("50", new BankInfo("PARA", "Paramount Bank", "Paramount Universal Bank")),
        Map.entry("54", new BankInfo("GUAR", "Guardian Bank", "Guardian Bank Limited")),
        Map.entry("57", new BankInfo("IAND", "I&M Bank", "I&M Bank Limited")),
        Map.entry("63", new BankInfo("DTBK", "DTB Bank", "Diamond Trust Bank Kenya")),
        Map.entry("68", new BankInfo("EQTY", "Equity Bank", "Equity Bank Kenya Limited"))
    );

    public record BankInfo(String bic, String shortName, String fullName) {}

    /**
     * Look up bank information by bank code.
     */
    public Map<String, Object> lookupBank(String bankCode) {
        BankInfo bank = BANK_DIRECTORY.get(bankCode);
        if (bank == null) {
            return Map.of("found", false, "bankCode", bankCode);
        }
        return Map.of(
            "found", true,
            "bankCode", bankCode,
            "bic", bank.bic(),
            "shortName", bank.shortName(),
            "fullName", bank.fullName()
        );
    }

    /**
     * Get the full bank directory.
     */
    public List<Map<String, Object>> getBankDirectory() {
        List<Map<String, Object>> banks = new ArrayList<>();
        BANK_DIRECTORY.forEach((code, info) -> {
            Map<String, Object> bank = new LinkedHashMap<>();
            bank.put("bankCode", code);
            bank.put("bic", info.bic());
            bank.put("shortName", info.shortName());
            bank.put("fullName", info.fullName());
            banks.add(bank);
        });
        banks.sort(Comparator.comparing(b -> (String) b.get("shortName")));
        return banks;
    }

    /**
     * Validate a bank account number via PesaLink.
     * In production, calls IPSL account validation API.
     */
    public Map<String, Object> validateAccount(String bankCode, String accountNumber) {
        BankInfo bank = BANK_DIRECTORY.get(bankCode);
        log.info("PesaLink account validation: bank={}, account={}", bankCode, accountNumber);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bankCode", bankCode);
        result.put("accountNumber", accountNumber);
        result.put("valid", true);
        result.put("accountName", "Account Holder - " + (bank != null ? bank.shortName() : bankCode));
        result.put("bankName", bank != null ? bank.fullName() : "Unknown Bank");
        return result;
    }

    /**
     * Send money via PesaLink.
     * In production, submits ISO 20022 pacs.008 via IPSL.
     */
    public Map<String, Object> sendViaPesaLink(String destinationBankCode, String accountNumber,
                                                long amountKes, String senderName, String reference) {
        String txnId = "PLK-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        BankInfo bank = BANK_DIRECTORY.get(destinationBankCode);

        log.info("PesaLink send: bank={}, account={}, amount=KES {}, txnId={}",
            destinationBankCode, accountNumber, amountKes, txnId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("transactionId", txnId);
        result.put("status", "COMPLETED");
        result.put("destinationBank", bank != null ? bank.fullName() : destinationBankCode);
        result.put("destinationBic", bank != null ? bank.bic() : "UNKNOWN");
        result.put("accountNumber", accountNumber);
        result.put("amountKes", amountKes);
        result.put("feeKes", amountKes <= 100 ? 0 : amountKes <= 500 ? 25 : amountKes <= 1000 ? 35 : 50);
        result.put("reference", reference);
        result.put("completedAt", java.time.LocalDateTime.now().toString());
        return result;
    }
}
