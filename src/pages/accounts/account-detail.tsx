import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Download,
  Search,
  CreditCard,
  Send,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  RefreshCw,
  Repeat,
  FileText,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { accounts, transactions } from "@/data/mock";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

const categoryIcon: Record<string, React.ReactNode> = {
  p2p: <Send className="h-4 w-4" />,
  merchant: <ShoppingBag className="h-4 w-4" />,
  mobile_money: <Smartphone className="h-4 w-4" />,
  salary: <TrendingUp className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  bills: <Receipt className="h-4 w-4" />,
  refund: <RefreshCw className="h-4 w-4" />,
  subscription: <Repeat className="h-4 w-4" />,
};

const monthlyStatements = [
  { month: "March 2026", id: "ST-202603", size: "124 KB" },
  { month: "February 2026", id: "ST-202602", size: "98 KB" },
  { month: "January 2026", id: "ST-202601", size: "112 KB" },
  { month: "December 2025", id: "ST-202512", size: "145 KB" },
  { month: "November 2025", id: "ST-202511", size: "87 KB" },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function AccountDetailPage() {
  // In a real app, account ID comes from router params
  const account = accounts[0];
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">("all");

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── Account Header ───────────────────────────────────────────── */}
      <Card className="border-0 bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-lg">
        <CardContent className="flex flex-col gap-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{account.name}</h1>
              <p className="font-mono text-sm opacity-70">
                {account.accountNumber}
              </p>
            </div>
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              {account.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm opacity-70">Current Balance</p>
            <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {fmtCurrency(account.balance, account.currency)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-white/20 text-white hover:bg-white/30"
            >
              <ArrowUpRight className="h-4 w-4" /> Send
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-white/20 text-white hover:bg-white/30"
            >
              <ArrowDownLeft className="h-4 w-4" /> Receive
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-white/20 text-white hover:bg-white/30"
            >
              <Receipt className="h-4 w-4" /> Pay Bills
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 bg-white/20 text-white hover:bg-white/30"
            >
              <Download className="h-4 w-4" /> Statement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <Tabs defaultValue="transactions">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
        </TabsList>

        {/* ── Transactions Tab ───────────────────────────────────────── */}
        <TabsContent value="transactions" className="mt-4 flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "credit", "debit"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={typeFilter === t ? "default" : "outline"}
                  onClick={() => setTypeFilter(t)}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Transaction list */}
          <Card>
            <CardContent className="flex flex-col divide-y py-2">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No transactions found.
                </p>
              )}
              {filtered.map((tx) => {
                const isCredit = tx.type === "credit";
                const d = new Date(tx.date);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      {categoryIcon[tx.category] ?? (
                        <CreditCard className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        &middot;{" "}
                        {d.toLocaleTimeString("en-KE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {tx.reference}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          isCredit ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {fmtCurrency(tx.amount, tx.currency)}
                      </p>
                      <Badge
                        variant={
                          tx.status === "completed" ? "secondary" : "outline"
                        }
                        className="mt-0.5 text-[10px]"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Details Tab ────────────────────────────────────────────── */}
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                { label: "Account Number", value: account.accountNumber },
                { label: "Account Type", value: account.type, capitalize: true },
                { label: "Currency", value: account.currency },
                { label: "Status", value: account.status, capitalize: true },
                { label: "Current Balance", value: fmtCurrency(account.balance, account.currency) },
                { label: "Available Balance", value: fmtCurrency(account.availableBalance, account.currency) },
                { label: "Pending Amount", value: fmtCurrency(account.pendingAmount, account.currency) },
                { label: "Date Opened", value: "November 15, 2025" },
                { label: "Interest Rate", value: "4.5% p.a." },
                { label: "Account Tier", value: "Standard" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      {row.label}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        row.capitalize ? "capitalize" : ""
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Statements Tab ─────────────────────────────────────────── */}
        <TabsContent value="statements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Statements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y">
              {monthlyStatements.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{st.month}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> PDF &middot; {st.size}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
