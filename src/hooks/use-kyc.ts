/**
 * KYC-specific React hooks for NeoBank.
 * Wraps kycService with fallback to mock data when backend is unavailable.
 */
import { useCallback } from "react";
import { useApiQuery, useApiMutation } from "./use-api";
import kycService, { type KycTierResponse, type KycVerifyRequest, type RiskScoreResponse } from "../services/kyc-service";

// Mock fallback for KYC tier
const MOCK_TIER: KycTierResponse = {
  clientId: 1,
  currentTier: "LITE",
  dailySendLimitKes: 5_000_000,
  monthlyBalanceLimitKes: 10_000_000,
  singleTxnLimitKes: 2_000_000,
  verifiedAt: null,
  verificationMethod: null,
};

// Mock fallback for risk score
const MOCK_RISK: RiskScoreResponse = {
  clientId: "1",
  riskScore: 25,
  riskLevel: "LOW",
  factors: [
    { factor: "ACCOUNT_AGE", weight: 0.15, detail: "Account older than 6 months" },
    { factor: "KYC_TIER", weight: 0.30, detail: "LITE tier — limited verification" },
    { factor: "TRANSACTION_VOLUME", weight: 0.10, detail: "Normal transaction patterns" },
  ],
  assessedAt: new Date().toISOString(),
};

export function useKycTier(clientId: number) {
  return useApiQuery<KycTierResponse>(
    () => kycService.getTier(clientId),
    [clientId],
    MOCK_TIER,
  );
}

export function useRiskScore(clientId: string) {
  return useApiQuery<RiskScoreResponse>(
    () => kycService.getRiskScore(clientId),
    [clientId],
    MOCK_RISK,
  );
}

export function useSubmitVerification() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => kycService.submitVerification(vars as KycVerifyRequest),
  );
}

export function useManualUpgrade() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => kycService.manualUpgrade(vars.clientId, vars.targetTier, vars.reason),
  );
}

export function useSelfieMatch() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => kycService.selfieMatch(vars.clientId, vars.verificationId, vars.selfieImageBase64),
  );
}
