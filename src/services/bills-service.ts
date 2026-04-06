/**
 * NeoBank Bill Payment Service
 * Handles bill catalog, validation, payment, and receipts.
 * Endpoints: /v1/neobank/bills/*
 */
import api from "./api-client";

export interface Biller {
  billerCode: string;
  billerName: string;
  category: string;
  description: string;
  accountLabel: string;
  minAmountKes: number;
  maxAmountKes: number;
}

export interface BillValidation {
  billerCode: string;
  accountNumber: string;
  valid: boolean;
  accountName: string;
  billerName: string;
}

export interface BillPaymentRequest {
  billerCode: string;
  accountNumber: string;
  amountMinor: number;
  clientId: number;
}

export interface BillPaymentResponse {
  transactionId: string;
  billerCode: string;
  accountNumber: string;
  amountMinor: number;
  status: string;
  paidAt: string;
  receiptNumber: string;
  confirmationMessage: string;
}

export const billsService = {
  getCatalog() {
    return api.get<Biller[]>("/v1/neobank/bills/catalog");
  },

  getBillersByCategory(category: string) {
    return api.get<Biller[]>(`/v1/neobank/bills/catalog/${category}`);
  },

  validateAccount(billerCode: string, accountNumber: string) {
    return api.post<BillValidation>("/v1/neobank/bills/validate", { billerCode, accountNumber });
  },

  payBill(req: BillPaymentRequest) {
    return api.post<BillPaymentResponse>("/v1/neobank/bills/pay", req);
  },

  getReceipt(transactionId: string) {
    return api.get<Record<string, unknown>>(`/v1/neobank/bills/receipt/${transactionId}`);
  },
};

export default billsService;
