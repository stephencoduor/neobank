/**
 * NeoBank PesaLink Service — Bank-to-bank transfers via IPSL.
 */
import api from "./api-client";

export interface BankInfo { bankCode: string; bic: string; shortName: string; fullName: string; }
export interface PesaLinkSendRequest { bankCode: string; accountNumber: string; amountKes: number; senderName?: string; reference?: string; }
export interface PesaLinkResult { transactionId: string; status: string; destinationBank: string; amountKes: number; feeKes: number; }

export const pesalinkService = {
  getBankDirectory: () => api.get<BankInfo[]>("/v1/neobank/pesalink/banks"),
  lookupBank: (bankCode: string) => api.get<Record<string, unknown>>(`/v1/neobank/pesalink/banks/${bankCode}`),
  validateAccount: (bankCode: string, accountNumber: string) =>
    api.post<Record<string, unknown>>("/v1/neobank/pesalink/validate", { bankCode, accountNumber }),
  send: (req: PesaLinkSendRequest) => api.post<PesaLinkResult>("/v1/neobank/pesalink/send", req),
};
export default pesalinkService;
