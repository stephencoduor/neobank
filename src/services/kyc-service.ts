/**
 * NeoBank KYC Service
 * Handles KYC verification, tier management, and risk scoring.
 * Endpoints: /v1/neobank/kyc/*
 */
import api from "./api-client";

export interface KycVerifyRequest {
  clientId: number;
  idType: "NATIONAL_ID" | "PASSPORT" | "ALIEN_ID";
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  selfieImageBase64?: string;
  targetTier: "STANDARD" | "ENHANCED";
}

export interface KycTierResponse {
  clientId: number;
  currentTier: "LITE" | "STANDARD" | "ENHANCED";
  dailySendLimitKes: number;
  monthlyBalanceLimitKes: number;
  singleTxnLimitKes: number;
  verifiedAt: string | null;
  verificationMethod: string | null;
}

export interface KycVerificationStatus {
  verificationId: string;
  status: "PENDING" | "PROCESSING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  jobId?: string;
  confidenceScore?: number;
  resultCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskScoreResponse {
  clientId: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: Array<{ factor: string; weight: number; detail: string }>;
  assessedAt: string;
}

export const kycService = {
  /** Submit ID document for Smile ID verification */
  submitVerification(req: KycVerifyRequest) {
    return api.post<{ verificationId: string; jobId: string; status: string }>(
      "/v1/neobank/kyc/verify",
      req,
    );
  },

  /** Get current KYC tier and limits */
  getTier(clientId: number) {
    return api.get<KycTierResponse>(`/v1/neobank/kyc/tier/${clientId}`);
  },

  /** Check verification status */
  getVerificationStatus(verificationId: string) {
    return api.get<KycVerificationStatus>(`/v1/neobank/kyc/status/${verificationId}`);
  },

  /** Admin manual tier upgrade */
  manualUpgrade(clientId: number, targetTier: string, reason: string) {
    return api.post<Record<string, unknown>>("/v1/neobank/kyc/upgrade", {
      clientId,
      targetTier,
      reason,
    });
  },

  /** Selfie-to-ID photo match */
  selfieMatch(clientId: string, verificationId: string, selfieImageBase64: string) {
    return api.post<{ matchScore: number; matched: boolean }>("/v1/neobank/kyc/selfie-match", {
      clientId,
      verificationId,
      selfieImageBase64,
    });
  },

  /** Get aggregated risk score */
  getRiskScore(clientId: string) {
    return api.get<RiskScoreResponse>(`/v1/neobank/kyc/risk-score/${clientId}`);
  },
};

export default kycService;
