import {
  Send,
  QrCode,
  PlusCircle,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  Repeat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  currentUser,
  accounts,
  transactions,
  chartData,
} from "@/data/mock";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtKES(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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

// ── Quick actions config ─────────────────────────────────────────────────────
const quickActions = [
  { label: "Send Money", icon: Send, color: "bg-primary text-primary-foreground" },
  { label: "Pay Bills", icon: Receipt, color: "bg-gold text-gold-foreground" },
  { label: "QR Pay", icon: QrCode, color: "bg-chart-3 text-white" },
  { label: "Add Money", icon: PlusCircle, color: "bg-chart-1 text-white" },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const totalBalance = accounts.reduce((s, a) => {
    // Convert USD approximate to KES for display total
    const bal = a.currency === "USD" ? a.balance * 129 : a.balance;
    return s + bal;
  }, 0);

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const recentTxns = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── Greeting + Balance ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {currentUser.firstName}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5">
            <ArrowUpRight className="h-4 w-4" /> Send
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <ArrowDownLeft className="h-4 w-4" /> Request
          </Button>
        </div>
      </div>

      {/* Total balance card */}
      <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-sm font-medium opacity-80">Available Balance</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {fmtKES(totalBalance)}
          </p>
          <p className="mt-1 text-xs opacity-60">Across all accounts</p>
        </CardContent>
      </Card>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <button
            key={a.label}
            className="flex flex-col items-center gap-2 rounded-xl p-3 transition hover:bg-muted"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${a.color}`}
            >
              <a.icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      {/* ── Accounts Carousel ───────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">My Accounts</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            {accounts.map((acc) => {
              const isUSD = acc.currency === "USD";
              return (
                <Card
                  key={acc.id}
                  className={`min-w-[260px] shrink-0 border-0 text-white shadow-md ${
                    isUSD
                      ? "bg-gradient-to-br from-blue-600 to-blue-800"
                      : "bg-gradient-to-br from-primary to-emerald-700"
                  }`}
                >
                  <CardContent className="flex flex-col gap-3 py-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium opacity-80">
                        {acc.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white text-[10px] hover:bg-white/30"
                      >
                        {acc.currency}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {fmtKES(acc.balance, acc.currency)}
                    </p>
                    <p className="font-mono text-xs opacity-60">
                      {acc.accountNumber}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* ── Weekly Chart ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData.weekly}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.45 0.1 160)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.45 0.1 160)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.14 80)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.78 0.14 80)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                formatter={(value) => fmtKES(Number(value))}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid var(--border)",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="oklch(0.45 0.1 160)"
                fill="url(#incomeGrad)"
                strokeWidth={2}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="spending"
                stroke="oklch(0.78 0.14 80)"
                fill="url(#spendGrad)"
                strokeWidth={2}
                name="Spending"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Recent Transactions ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {recentTxns.map((tx) => {
            const isCredit = tx.type === "credit";
            const d = new Date(tx.date);
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  {categoryIcon[tx.category] ?? (
                    <CreditCard className="h-4 w-4" />
                  )}
                </span>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium leading-tight truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.toLocaleDateString("en-KE", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    &middot;{" "}
                    {d.toLocaleTimeString("en-KE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isCredit ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isCredit ? "+" : "-"}
                    {fmtKES(tx.amount, tx.currency)}
                  </p>
                  <Badge
                    variant={tx.status === "completed" ? "secondary" : "outline"}
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
    </div>
  );
}
