/**
 * AML-specific React hooks for NeoBank.
 * Wraps amlService with fallback to mock data when backend is unavailable.
 */
import { useApiQuery, useApiMutation } from "./use-api";
import amlService, { type AmlCase, type AmlRule, type DispositionRequest } from "../services/aml-service";

// Mock AML cases — realistic Kenyan context matching the compliance page
const MOCK_CASES: AmlCase[] = [
  {
    id: "AML-001",
    clientId: 1001,
    clientName: "Hassan Mohamed",
    ruleCode: "STRUCTURING_BELOW_50K",
    ruleDescription: "Structuring pattern — multiple deposits just below KES 100K threshold",
    severity: "HIGH",
    status: "OPEN",
    flaggedTransactionIds: ["TXN-4401", "TXN-4402", "TXN-4403"],
    totalAmountMinor: 29_500_000,
    createdAt: "2026-04-03T10:15:00",
    updatedAt: "2026-04-03T10:15:00",
    assignedTo: null,
  },
  {
    id: "AML-002",
    clientId: 1002,
    clientName: "David Kamau",
    ruleCode: "LARGE_SINGLE_1M",
    ruleDescription: "Unusual cross-border transfer pattern to Tanzania",
    severity: "MEDIUM",
    status: "INVESTIGATING",
    flaggedTransactionIds: ["TXN-4410"],
    totalAmountMinor: 150_000_000,
    createdAt: "2026-04-02T14:30:00",
    updatedAt: "2026-04-03T09:00:00",
    assignedTo: "compliance-officer-01",
  },
  {
    id: "AML-003",
    clientId: 1003,
    clientName: "Unknown Entity",
    ruleCode: "MULE_PATTERN",
    ruleDescription: "Rapid movement of funds through multiple accounts within 24 hours",
    severity: "HIGH",
    status: "OPEN",
    flaggedTransactionIds: ["TXN-4415", "TXN-4416", "TXN-4417", "TXN-4418"],
    totalAmountMinor: 87_500_000,
    createdAt: "2026-04-01T16:45:00",
    updatedAt: "2026-04-01T16:45:00",
    assignedTo: null,
  },
  {
    id: "AML-004",
    clientId: 1004,
    clientName: "Grace Akinyi",
    ruleCode: "LARGE_SINGLE_1M",
    ruleDescription: "First-time international wire transfer exceeding KES 500K",
    severity: "LOW",
    status: "RESOLVED",
    flaggedTransactionIds: ["TXN-4420"],
    totalAmountMinor: 75_000_000,
    createdAt: "2026-03-31T11:00:00",
    updatedAt: "2026-04-02T15:00:00",
    assignedTo: "compliance-officer-02",
  },
  {
    id: "AML-005",
    clientId: 1005,
    clientName: "Peter Mwangi",
    ruleCode: "VELOCITY_5_IN_1H",
    ruleDescription: "Transaction with blacklisted merchant category code",
    severity: "MEDIUM",
    status: "INVESTIGATING",
    flaggedTransactionIds: ["TXN-4425", "TXN-4426"],
    totalAmountMinor: 12_000_000,
    createdAt: "2026-03-30T09:15:00",
    updatedAt: "2026-03-31T10:30:00",
    assignedTo: "compliance-officer-01",
  },
];

const MOCK_RULES: AmlRule[] = [
  { code: "VELOCITY_5_IN_1H", description: "5+ transactions within 1 hour", severity: "MEDIUM", enabled: true, thresholdKes: 0, windowMinutes: 60 },
  { code: "STRUCTURING_BELOW_50K", description: "Multiple transactions just below reporting threshold", severity: "HIGH", enabled: true, thresholdKes: 5_000_000, windowMinutes: 1440 },
  { code: "LARGE_SINGLE_1M", description: "Single transaction above KES 1M", severity: "HIGH", enabled: true, thresholdKes: 100_000_000, windowMinutes: 0 },
  { code: "MULE_PATTERN", description: "Receive-and-forward pattern within 30 minutes", severity: "HIGH", enabled: true, thresholdKes: 0, windowMinutes: 30 },
  { code: "DORMANT_REACTIVATION", description: "Large transaction on account dormant 90+ days", severity: "MEDIUM", enabled: true, thresholdKes: 50_000_000, windowMinutes: 0 },
];

export function useAmlCases(params?: { status?: string; severity?: string }) {
  return useApiQuery<AmlCase[]>(
    () => amlService.listCases(params),
    [params?.status, params?.severity],
    MOCK_CASES,
  );
}

export function useAmlCase(caseId: string) {
  const fallback = MOCK_CASES.find((c) => c.id === caseId);
  return useApiQuery<AmlCase>(
    () => amlService.getCase(caseId),
    [caseId],
    fallback,
  );
}

export function useAmlRules() {
  return useApiQuery<AmlRule[]>(
    () => amlService.getRules(),
    [],
    MOCK_RULES,
  );
}

export function useDispositionCase() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => amlService.dispositionCase(vars.caseId, vars as DispositionRequest),
  );
}

export function useSanctionsScreen() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => amlService.screen(vars.name, vars.entityType),
  );
}

export function useStrExport() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => amlService.exportStr(vars),
  );
}
