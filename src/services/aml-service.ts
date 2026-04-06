/**
 * NeoBank AML Service
 * Handles AML cases, sanctions screening, rules, and STR export.
 * Endpoints: /v1/neobank/aml/*
 */
import api from "./api-client";

export interface AmlCase {
  id: string;
  clientId: number;
  clientName: string;
  ruleCode: string;
  ruleDescription: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "ESCALATED" | "RESOLVED" | "DISMISSED";
  flaggedTransactionIds: string[];
  totalAmountMinor: number;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
}

export interface AmlRule {
  code: string;
  description: string;
  severity: string;
  enabled: boolean;
  thresholdKes: number;
  windowMinutes: number;
}

export interface SanctionScreenResult {
  screened: boolean;
  matchFound: boolean;
  matches: Array<{
    listName: string;
    matchedName: string;
    score: number;
    listEntryId: string;
  }>;
}

export interface DispositionRequest {
  decision: "ESCALATE" | "RESOLVE" | "DISMISS";
  notes: string;
  analystId: string;
}

export const amlService = {
  /** List AML cases with optional filters */
  listCases(params?: { status?: string; severity?: string }) {
    return api.get<AmlCase[]>("/v1/neobank/aml/cases", params as Record<string, string>);
  },

  /** Get a single AML case */
  getCase(caseId: string) {
    return api.get<AmlCase>(`/v1/neobank/aml/cases/${caseId}`);
  },

  /** Submit case disposition (escalate/resolve/dismiss) */
  dispositionCase(caseId: string, req: DispositionRequest) {
    return api.post<{ status: string; updatedAt: string }>(
      `/v1/neobank/aml/cases/${caseId}/disposition`,
      req,
    );
  },

  /** Export STR (Suspicious Transaction Report) to FRC */
  exportStr(params?: { dateFrom?: string; dateTo?: string }) {
    return api.post<{ reportId: string; recordCount: number; exportedAt: string }>(
      "/v1/neobank/aml/str/export",
      params,
    );
  },

  /** Get configured AML rules */
  getRules() {
    return api.get<AmlRule[]>("/v1/neobank/aml/rules");
  },

  /** Screen a name/entity against sanctions lists */
  screen(name: string, entityType?: string) {
    return api.post<SanctionScreenResult>("/v1/neobank/aml/screen", { name, entityType });
  },
};

export default amlService;
