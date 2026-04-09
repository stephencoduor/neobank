import {
  Plus,
  Wallet,
  Landmark,
  DollarSign,
  Briefcase,
  Clock,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { accounts as mockAccounts } from "@/data/mock";
import { useApiQuery } from "@/hooks/use-api";
import { fineract, type FSavingsAccount } from "@/services/fineract-service";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

const typeIcon: Record<string, React.ReactNode> = {
  savings: <Landmark className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
};

const currencyFlag: Record<string, string> = {
  KES: "🇰🇪",
  USD: "🇺🇸",
};

/** Transform Fineract savings into account cards */
function toAccountCards(items: FSavingsAccount[]) {
  return items.map((sa) => ({
    id: `SA-${sa.id}`,
    name: sa.clientName ? `${sa.clientName} — ${sa.productName}` : sa.productName,
    type: sa.productName?.toLowerCase().includes("business") ? "business" as const : "savings" as const,
    currency: sa.currency?.code || "KES",
    balance: sa.accountBalance ?? sa.summary?.accountBalance ?? 0,
    availableBalance: sa.accountBalance ?? sa.summary?.accountBalance ?? 0,
    pendingAmount: 0,
    accountNumber: sa.accountNo,
    status: sa.status?.value?.toLowerCase() === "active" ? "active" as const : "inactive" as const,
  }));
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  const { data: savingsData, error } = useApiQuery(
    () => fineract.getSavingsAccounts(50),
    [],
  );

  const isLive = !!savingsData && !error;
  const accounts = isLive ? toAccountCards(savingsData.pageItems) : mockAccounts;

  const totalBalance = accounts
    .filter((a) => a.currency === "KES")
    .reduce((s, a) => s + a.balance, 0);
  const totalPending = accounts.reduce((s, a) => s + a.pendingAmount, 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">My Accounts</h1>
          {isLive ? (
            <Badge variant="secondary" className="gap-1 text-[10px] text-emerald-600">
              <Wifi className="h-3 w-3" /> Live
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <WifiOff className="h-3 w-3" /> Demo
            </Badge>
          )}
        </div>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" /> Open New Account
        </Button>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Total Balance (KES)</p>
              <p className="text-lg font-bold">{fmtCurrency(totalBalance)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
              <DollarSign className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Total Accounts</p>
              <p className="text-lg font-bold">{accounts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Pending Amount</p>
              <p className="text-lg font-bold">{fmtCurrency(totalPending)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Accounts Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {accounts.map((acc) => {
          const isUSD = acc.currency === "USD";
          return (
            <Card
              key={acc.id}
              className="group cursor-pointer transition hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-4 py-5">
                {/* top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      {typeIcon[acc.type] ?? <Wallet className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{acc.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {acc.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={acc.status === "active" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {acc.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {acc.type}
                    </Badge>
                  </div>
                </div>

                {/* balance */}
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">
                    <span className="mr-1">{currencyFlag[acc.currency]}</span>
                    {fmtCurrency(acc.balance, acc.currency)}
                  </p>
                </div>

                {/* details row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Available:{" "}
                    <span className={`font-medium ${isUSD ? "text-blue-600" : "text-primary"}`}>
                      {fmtCurrency(acc.availableBalance, acc.currency)}
                    </span>
                  </span>
                  {acc.pendingAmount > 0 && (
                    <span>
                      Pending:{" "}
                      <span className="font-medium text-gold">
                        {fmtCurrency(acc.pendingAmount, acc.currency)}
                      </span>
                    </span>
                  )}
                </div>

                {/* footer link */}
                <div className="flex items-center justify-end text-xs font-medium text-primary transition group-hover:translate-x-1">
                  View Details <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
