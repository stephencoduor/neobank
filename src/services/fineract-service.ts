/**
 * NeoBank Fineract Core Banking Service
 * Direct integration with Fineract REST APIs for clients, savings, loans, GL, etc.
 * Falls back gracefully when backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.fineract.us/fineract-provider/api";
const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? "default";

// Default Basic auth for demo (mifos:password)
const DEFAULT_AUTH = "Basic bWlmb3M6cGFzc3dvcmQ=";

async function fGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem("neobank_token") || DEFAULT_AUTH;
  const res = await fetch(`${API_BASE}/v1${path}`, {
    headers: {
      "Authorization": token.startsWith("Basic ") ? token : `Basic ${token}`,
      "Fineract-Platform-TenantId": TENANT_ID,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Fineract ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────

export interface FClient {
  id: number;
  accountNo: string;
  displayName: string;
  firstname: string;
  lastname: string;
  mobileNo?: string;
  officeId: number;
  officeName: string;
  active: boolean;
  activationDate: number[];
  status: { id: number; code: string; value: string };
  savingsAccounts?: FSavingsAccount[];
  loanAccounts?: FLoanAccount[];
}

export interface FSavingsAccount {
  id: number;
  accountNo: string;
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  status: { id: number; code: string; value: string };
  currency: { code: string; displaySymbol: string };
  accountBalance?: number;
  summary?: {
    accountBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalInterestEarned: number;
    totalInterestPosted: number;
  };
  transactions?: FSavingsTransaction[];
}

export interface FSavingsTransaction {
  id: number;
  transactionType: { id: number; code: string; value: string };
  date: number[];
  amount: number;
  runningBalance: number;
  reversed: boolean;
  currency: { code: string; displaySymbol: string };
}

export interface FLoanAccount {
  id: number;
  accountNo: string;
  clientId: number;
  clientName: string;
  loanProductId: number;
  loanProductName: string;
  principal: number;
  status: { id: number; code: string; value: string };
  currency: { code: string; displaySymbol: string };
  summary?: {
    principalDisbursed: number;
    principalPaid: number;
    principalOutstanding: number;
    interestCharged: number;
    interestPaid: number;
    totalOutstanding: number;
    totalExpectedRepayment: number;
    totalRepayment: number;
  };
}

export interface FLoanProduct {
  id: number;
  name: string;
  shortName: string;
  description: string;
  principal: number;
  minPrincipal: number;
  maxPrincipal: number;
  interestRatePerPeriod: number;
  numberOfRepayments: number;
}

export interface FGLAccount {
  id: number;
  name: string;
  glCode: string;
  type: { id: number; value: string };
  usage: { id: number; value: string };
  manualEntriesAllowed: boolean;
}

export interface FJournalEntry {
  id: number;
  officeId: number;
  officeName: string;
  glAccountId: number;
  glAccountName: string;
  glAccountCode: string;
  entryType: { value: string };
  amount: number;
  transactionDate: number[];
  manualEntry: boolean;
  reversed: boolean;
}

export interface FAuditLog {
  id: number;
  actionName: string;
  entityName: string;
  resourceId: number;
  maker: string;
  madeOnDate: number;
  officeName: string;
  processingResult: string;
}

export interface FOffice {
  id: number;
  name: string;
  openingDate: number[];
}

export interface FUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  officeName: string;
  officeId: number;
}

export interface FPagedResponse<T> {
  totalFilteredRecords: number;
  pageItems: T[];
}

// ─── API Functions ────────────────────────────────────────────────

export const fineract = {
  // Health
  async isConnected(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE.replace("/api", "")}/actuator/health`);
      const data = await res.json();
      return data.status === "UP";
    } catch { return false; }
  },

  // Clients
  getClients: (limit = 50) => fGet<FPagedResponse<FClient>>(`/clients?limit=${limit}`),
  getClient: (id: number) => fGet<FClient>(`/clients/${id}`),
  getClientWithSavings: (id: number) => fGet<FClient>(`/clients/${id}?associations=savingsAccounts`),
  getClientWithLoans: (id: number) => fGet<FClient>(`/clients/${id}?associations=loanAccounts`),
  getClientFull: (id: number) => fGet<FClient>(`/clients/${id}?associations=savingsAccounts,loanAccounts`),

  // Savings
  getSavingsAccounts: (limit = 50) => fGet<FPagedResponse<FSavingsAccount>>(`/savingsaccounts?limit=${limit}`),
  getSavingsAccount: (id: number) => fGet<FSavingsAccount>(`/savingsaccounts/${id}?associations=summary`),
  getSavingsTransactions: (id: number) => fGet<FSavingsAccount>(`/savingsaccounts/${id}?associations=transactions`),

  // Loans
  getLoans: (limit = 50) => fGet<FPagedResponse<FLoanAccount>>(`/loans?limit=${limit}`),
  getLoan: (id: number) => fGet<FLoanAccount>(`/loans/${id}?associations=repaymentSchedule,summary`),
  getLoanProducts: () => fGet<FLoanProduct[]>("/loanproducts"),

  // GL / Accounting
  getGLAccounts: () => fGet<FGLAccount[]>("/glaccounts"),
  getJournalEntries: (limit = 50) => fGet<FPagedResponse<FJournalEntry>>(`/journalentries?limit=${limit}&orderBy=id&sortOrder=DESC`),

  // Admin
  getOffices: () => fGet<FOffice[]>("/offices"),
  getUsers: () => fGet<FUser[]>("/users"),
  getAuditLogs: (limit = 50) => fGet<FPagedResponse<FAuditLog>>(`/audits?limit=${limit}&orderBy=id&sortOrder=DESC`),

  // Auth
  async authenticate(username: string, password: string) {
    const res = await fetch(`${API_BASE}/v1/authentication`, {
      method: "POST",
      headers: {
        "Fineract-Platform-TenantId": TENANT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
    return res.json();
  },
};

export default fineract;
