/**
 * NeoBank Interop Hub Service
 * Handles unified payment sending, cost comparison, and carrier health.
 * Endpoints: /v1/neobank/interop/*
 */
import api from "./api-client";

export interface SendMoneyRequest {
  msisdn: string;
  amountMinor: number;
  accountRef?: string;
  description?: string;
}

export interface RoutingDecision {
  carrier: "MPESA" | "AIRTEL" | "TELKOM";
  feeMinor: number;
  failover: boolean;
  healthScore: number;
}

export interface SendMoneyResponse {
  routing: RoutingDecision;
  payment: Record<string, unknown>;
  amountMinor: number;
  msisdn: string;
}

export interface CostOption {
  carrier: string;
  feeMinor: number;
  healthScore: number;
  available: boolean;
}

export interface CarrierHealth {
  carrier: string;
  healthScore: number;
  available: boolean;
}

export const interopService = {
  sendMoney(req: SendMoneyRequest) {
    return api.post<SendMoneyResponse>("/v1/neobank/interop/send", req);
  },

  compareCosts(amountMinor: number) {
    return api.get<CostOption[]>("/v1/neobank/interop/costs", { amountMinor: String(amountMinor) });
  },

  getCarrierHealth() {
    return api.get<CarrierHealth[]>("/v1/neobank/interop/health");
  },
};

export default interopService;
