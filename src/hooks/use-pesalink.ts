import { useApiQuery, useApiMutation } from "./use-api";
import pesalinkService from "../services/pesalink-service";
import type { PesaLinkSendRequest } from "../services/pesalink-service";

// ── Mock fallback data ──────────────────────────────────────────────────────

const MOCK_BANK_DIRECTORY = [
  { bankCode: "01", bic: "KCBK", shortName: "KCB Bank", fullName: "Kenya Commercial Bank" },
  { bankCode: "02", bic: "SCBL", shortName: "Standard Chartered", fullName: "Standard Chartered Bank Kenya" },
  { bankCode: "03", bic: "BARCKENX", shortName: "ABSA Kenya", fullName: "Absa Bank Kenya PLC" },
  { bankCode: "11", bic: "COOPKENX", shortName: "Co-op Bank", fullName: "Co-operative Bank of Kenya" },
  { bankCode: "12", bic: "NBKE", shortName: "National Bank", fullName: "National Bank of Kenya" },
  { bankCode: "16", bic: "EQBLKENA", shortName: "Equity Bank", fullName: "Equity Bank Kenya Limited" },
  { bankCode: "18", bic: "MABORBI", shortName: "Middle East Bank", fullName: "Middle East Bank Kenya" },
  { bankCode: "20", bic: "DTKE", shortName: "DTB", fullName: "Diamond Trust Bank Kenya" },
  { bankCode: "23", bic: "I&M", shortName: "I&M Bank", fullName: "I&M Bank Limited" },
  { bankCode: "31", bic: "CITIKE", shortName: "Citi Bank", fullName: "Citibank N.A. Kenya" },
  { bankCode: "50", bic: "FAMB", shortName: "Family Bank", fullName: "Family Bank Limited" },
  { bankCode: "54", bic: "HFCK", shortName: "HFC", fullName: "HF Group (Housing Finance)" },
  { bankCode: "55", bic: "GTBI", shortName: "GT Bank", fullName: "Guaranty Trust Bank Kenya" },
  { bankCode: "61", bic: "KCBL", shortName: "KCB Karen", fullName: "KCB Bank Karen Branch" },
  { bankCode: "63", bic: "NCBA", shortName: "NCBA", fullName: "NCBA Bank Kenya" },
  { bankCode: "66", bic: "SIDIAN", shortName: "Sidian Bank", fullName: "Sidian Bank Limited" },
  { bankCode: "68", bic: "ECOBANK", shortName: "Ecobank", fullName: "Ecobank Kenya" },
  { bankCode: "70", bic: "SBMK", shortName: "SBM Bank", fullName: "SBM Bank Kenya Limited" },
  { bankCode: "72", bic: "GULF", shortName: "Gulf African", fullName: "Gulf African Bank" },
  { bankCode: "76", bic: "UBLKE", shortName: "UBA Kenya", fullName: "United Bank for Africa Kenya" },
];

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useBankDirectory() {
  return useApiQuery(
    () => pesalinkService.getBankDirectory(),
    [],
    MOCK_BANK_DIRECTORY
  );
}

export function useValidateAccount() {
  return useApiMutation((vars: unknown) => {
    const { bankCode, accountNumber } = vars as { bankCode: string; accountNumber: string };
    return pesalinkService.validateAccount(bankCode, accountNumber);
  });
}

export function usePesaLinkSend() {
  return useApiMutation((vars: unknown) => {
    const req = vars as PesaLinkSendRequest;
    return pesalinkService.send(req);
  });
}
