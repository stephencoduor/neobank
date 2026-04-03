import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts
const AppLayout = lazy(() => import("@/components/layout/app-layout"));
const AdminLayout = lazy(() => import("@/components/layout/admin-layout"));
const AuthLayout = lazy(() => import("@/components/layout/auth-layout"));

// Auth pages
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const KycVerificationPage = lazy(() => import("@/pages/auth/kyc-verification"));

// Consumer pages
const DashboardPage = lazy(() => import("@/pages/dashboard/index"));
const NotificationsPage = lazy(() => import("@/pages/dashboard/notifications"));
const AccountsPage = lazy(() => import("@/pages/accounts/index"));
const AccountDetailPage = lazy(() => import("@/pages/accounts/account-detail"));
const CardsPage = lazy(() => import("@/pages/cards/index"));
const CardDetailPage = lazy(() => import("@/pages/cards/card-detail"));
const SendMoneyPage = lazy(() => import("@/pages/payments/send"));
const RequestMoneyPage = lazy(() => import("@/pages/payments/request"));
const QrPaymentsPage = lazy(() => import("@/pages/payments/qr"));
const BillPaymentsPage = lazy(() => import("@/pages/payments/bills"));

// Merchant pages
const MerchantDashboardPage = lazy(() => import("@/pages/merchant/index"));
const PosManagementPage = lazy(() => import("@/pages/merchant/pos-management"));
const SettlementsPage = lazy(() => import("@/pages/merchant/settlements"));

// Admin pages
const AdminDashboardPage = lazy(() => import("@/pages/admin/index"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users"));
const KycReviewPage = lazy(() => import("@/pages/admin/kyc-review"));
const TransactionsMonitorPage = lazy(
  () => import("@/pages/admin/transactions-monitor")
);
const CompliancePage = lazy(() => import("@/pages/admin/compliance"));

// Loans
const LoansPage = lazy(() => import("@/pages/loans/index"));
const LoanApplyPage = lazy(() => import("@/pages/loans/apply"));
const LoanSchedulePage = lazy(() => import("@/pages/loans/schedule"));

// Savings
const SavingsPage = lazy(() => import("@/pages/savings/index"));

// Reports
const ReportsPage = lazy(() => import("@/pages/reports/index"));

// Settings
const SettingsPage = lazy(() => import("@/pages/settings/index"));

// Merchant onboarding
const MerchantOnboardingPage = lazy(
  () => import("@/pages/merchant/onboarding")
);

// Admin additional
const AdminSettingsPage = lazy(() => import("@/pages/admin/settings"));
const AuditLogPage = lazy(() => import("@/pages/admin/audit-log"));

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/kyc" element={<KycVerificationPage />} />
          </Route>

          {/* Consumer routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/:id" element={<AccountDetailPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/cards/:id" element={<CardDetailPage />} />
            <Route path="/payments/send" element={<SendMoneyPage />} />
            <Route path="/payments/request" element={<RequestMoneyPage />} />
            <Route path="/payments/qr" element={<QrPaymentsPage />} />
            <Route path="/payments/bills" element={<BillPaymentsPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/apply" element={<LoanApplyPage />} />
            <Route path="/loans/schedule" element={<LoanSchedulePage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/merchant" element={<MerchantDashboardPage />} />
            <Route path="/merchant/pos" element={<PosManagementPage />} />
            <Route
              path="/merchant/settlements"
              element={<SettlementsPage />}
            />
            <Route
              path="/merchant/onboarding"
              element={<MerchantOnboardingPage />}
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/kyc" element={<KycReviewPage />} />
            <Route
              path="/admin/transactions"
              element={<TransactionsMonitorPage />}
            />
            <Route path="/admin/compliance" element={<CompliancePage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/audit-log" element={<AuditLogPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
