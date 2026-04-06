/**
 * NeoBank Auth Service
 * Handles device binding, step-up auth, and SIM swap checks.
 * Endpoints: /v1/neobank/auth/*
 */
import api, { setAuthToken, clearAuthToken } from "./api-client";

export interface DeviceBindRequest {
  clientId: number;
  deviceFingerprint: string;
  pushToken?: string;
  platform: "ANDROID" | "IOS" | "WEB";
}

export interface StepUpRequest {
  clientId: number;
  channel: "SMS_OTP" | "TOTP" | "BIOMETRIC";
  transactionRef?: string;
}

export interface SimSwapResponse {
  msisdn: string;
  swappedRecently: boolean;
  lastSwapDate: string | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface LoginResponse {
  authenticated: boolean;
  token?: string;
  user?: {
    id: number;
    displayName: string;
    phone: string;
    kycTier: string;
  };
}

export const authService = {
  /** Fineract basic auth login */
  async login(username: string, password: string): Promise<LoginResponse> {
    const result = await api.post<LoginResponse>("/v1/authentication", {
      username,
      password,
    });
    if (result.token) setAuthToken(result.token);
    return result;
  },

  logout() {
    clearAuthToken();
  },

  /** Bind this device for push notifications & fraud detection */
  bindDevice(req: DeviceBindRequest) {
    return api.post<{ deviceId: string; status: string }>("/v1/neobank/auth/device/bind", req);
  },

  /** Trigger a step-up authentication challenge */
  stepUp(req: StepUpRequest) {
    return api.post<{ challengeId: string; expiresInSeconds: number; channel: string }>(
      "/v1/neobank/auth/stepup",
      req,
    );
  },

  /** Check if MSISDN had a recent SIM swap (fraud signal) */
  checkSimSwap(msisdn: string) {
    return api.get<SimSwapResponse>(`/v1/neobank/auth/sim-swap/${encodeURIComponent(msisdn)}`);
  },
};

export default authService;
