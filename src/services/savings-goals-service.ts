/**
 * NeoBank Savings Goals Service
 * Handles goal creation, listing, locking, and auto-sweep.
 * Endpoints: /v1/neobank/savings-goals/*
 */
import api from "./api-client";

export interface CreateGoalRequest {
  clientId: number;
  name: string;
  targetAmountMinor: number;
  sweepFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";
  sweepAmountMinor?: number;
  lockUntilDate?: string;
  savingsAccountId?: number;
}

export interface SavingsGoalResponse {
  id: string;
  clientId: number;
  name: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  sweepFrequency: string;
  sweepAmountMinor: number;
  lockUntilDate: string | null;
  locked: boolean;
  percentComplete: number;
  createdAt: string;
  milestones: Array<{
    label: string;
    targetPercent: number;
    reached: boolean;
    reachedAt: string | null;
  }>;
}

export const savingsGoalsService = {
  /** Create a new savings goal */
  create(req: CreateGoalRequest) {
    return api.post<SavingsGoalResponse>("/v1/neobank/savings-goals", req);
  },

  /** List all goals for the authenticated client */
  list(clientId?: number) {
    const params = clientId ? { clientId: String(clientId) } : undefined;
    return api.get<SavingsGoalResponse[]>("/v1/neobank/savings-goals", params);
  },

  /** Get a single goal */
  get(goalId: string) {
    return api.get<SavingsGoalResponse>(`/v1/neobank/savings-goals/${goalId}`);
  },

  /** Lock goal (prevent early withdrawal) */
  lock(goalId: string) {
    return api.post<{ locked: boolean; lockedUntil: string }>(
      `/v1/neobank/savings-goals/${goalId}/lock`,
    );
  },

  /** Trigger manual sweep into goal */
  sweep(goalId: string) {
    return api.post<{ sweptAmountMinor: number; newBalance: number }>(
      `/v1/neobank/savings-goals/${goalId}/sweep`,
    );
  },
};

export default savingsGoalsService;
