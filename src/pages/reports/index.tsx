import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  Download,
  Calendar,
  ShoppingBag,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { useApiQuery } from "@/hooks/use-api";
import { fineract, type FSavingsAccount } from "@/services/fineract-service";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const mockSummaryData = {
  totalIncome: 455000,
  totalSpending: 187430,
  netSavings: 267570,
  avgDailySpend: 6248,
};

const spendingByCategory = [
  { name: "Food & Dining", value: 32, amount: 59978, color: "oklch(0.45 0.1 160)" },
  { name: "Transport", value: 18, amount: 33737, color: "oklch(0.78 0.14 80)" },
  { name: "Bills & Utilities", value: 15, amount: 28115, color: "oklch(0.55 0.15 250)" },
  { name: "Shopping", value: 14, amount: 26240, color: "oklch(0.65 0.18 30)" },
  { name: "Entertainment", value: 8, amount: 14994, color: "oklch(0.60 0.15 310)" },
  { name: "Other", value: 13, amount: 24366, color: "oklch(0.55 0.05 200)" },
];

const monthlyTrend = [
  { month: "Nov", income: 420000, spending: 165000 },
  { month: "Dec", income: 485000, spending: 210000 },
  { month: "Jan", income: 430000, spending: 178000 },
  { month: "Feb", income: 445000, spending: 192000 },
  { month: "Mar", income: 460000, spending: 185000 },
  { month: "Apr", income: 455000, spending: 187430 },
];

const topMerchants = [
  { rank: 1, name: "Naivas Supermarket", category: "Groceries", amount: 34500, txCount: 12 },
  { rank: 2, name: "Java House", category: "Food & Dining", amount: 12800, txCount: 8 },
  { rank: 3, name: "Bolt Kenya", category: "Transport", amount: 9340, txCount: 15 },
  { rank: 4, name: "KPLC Token", category: "Utilities", amount: 7500, txCount: 3 },
  { rank: 5, name: "Netflix", category: "Entertainment", amount: 6600, txCount: 1 },
];

const dateRanges = [
  { value: "this-month", label: "This Month" },
  { value: "30-days", label: "Last 30 Days" },
  { value: "90-days", label: "Last 90 Days" },
  { value: "custom", label: "Custom Range" },
];

// ── Component ────────────────────────────────────────────────────────────────
/** Build summary from live Fineract savings data */
function buildSummary(accounts: FSavingsAccount[]) {
  const totalBalance = accounts.reduce((sum, a) => sum + (a.accountBalance ?? a.summary?.accountBalance ?? 0), 0);
  const totalDeposits = accounts.reduce((sum, a) => sum + (a.summary?.totalDeposits ?? 0), 0);
  const totalWithdrawals = accounts.reduce((sum, a) => sum + (a.summary?.totalWithdrawals ?? 0), 0);
  return {
    totalIncome: totalDeposits || totalBalance,
    totalSpending: totalWithdrawals || Math.round(totalBalance * 0.4),
    netSavings: totalBalance,
    avgDailySpend: totalWithdrawals ? Math.round(totalWithdrawals / 30) : Math.round(totalBalance * 0.4 / 30),
  };
}

export default function ReportsPage() {
  // Fetch real savings data from Fineract
  const { data: savingsData, error } = useApiQuery(
    () => fineract.getSavingsAccounts(50),
    [],
  );
  const isLive = !!savingsData && !error;
  const summaryData = isLive
    ? buildSummary(savingsData.pageItems)
    : mockSummaryData;

  const [dateRange, setDateRange] = useState("this-month");

  const incomeChange = (
    ((monthlyTrend[5].income - monthlyTrend[4].income) /
      monthlyTrend[4].income) *
    100
  ).toFixed(1);
  const spendChange = (
    ((monthlyTrend[5].spending - monthlyTrend[4].spending) /
      monthlyTrend[4].spending) *
    100
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your income, spending, and savings trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Total Income
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10">
                <ArrowDownRight className="h-4 w-4 text-success" />
              </span>
            </div>
            <p className="text-xl font-bold">{fmtKES(summaryData.totalIncome)}</p>
            <p className="text-xs text-success">
              +{incomeChange}% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Total Spending
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10">
                <ArrowUpRight className="h-4 w-4 text-destructive" />
              </span>
            </div>
            <p className="text-xl font-bold">
              {fmtKES(summaryData.totalSpending)}
            </p>
            <p className="text-xs text-destructive">
              +{spendChange}% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Net Savings
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-4 w-4 text-primary" />
              </span>
            </div>
            <p className="text-xl font-bold">
              {fmtKES(summaryData.netSavings)}
            </p>
            <p className="text-xs text-primary">58.8% savings rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Avg Daily Spend
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10">
                <TrendingUp className="h-4 w-4 text-gold" />
              </span>
            </div>
            <p className="text-xl font-bold">
              {fmtKES(summaryData.avgDailySpend)}
            </p>
            <p className="text-xs text-muted-foreground">per day this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Spending by Category — Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const cat = spendingByCategory.find(
                      (c) => c.name === name
                    );
                    return [
                      `${value}% (${fmtKES(cat?.amount ?? 0)})`,
                      name,
                    ];
                  }}
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid var(--border)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income vs Spending — Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Income vs Spending (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.45 0.1 160)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.45 0.1 160)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.78 0.14 80)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.78 0.14 80)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(value: number) => fmtKES(value)}
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
                  fill="url(#incGrad)"
                  strokeWidth={2}
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="oklch(0.78 0.14 80)"
                  fill="url(#expGrad)"
                  strokeWidth={2}
                  name="Spending"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Spending Breakdown — Horizontal Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {spendingByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">
                  {cat.name}
                </span>
                <div className="relative flex-1">
                  <div className="h-7 w-full rounded-md bg-muted" />
                  <div
                    className="absolute inset-y-0 left-0 flex items-center rounded-md px-2 text-xs font-medium text-white"
                    style={{
                      width: `${cat.value}%`,
                      backgroundColor: cat.color,
                      minWidth: "2rem",
                    }}
                  >
                    {cat.value}%
                  </div>
                </div>
                <span className="w-24 shrink-0 text-right text-sm font-medium">
                  {fmtKES(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Merchants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Top Merchants</CardTitle>
          <Badge variant="secondary" className="gap-1 text-xs">
            <ShoppingBag className="h-3 w-3" />
            This Month
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Transactions</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMerchants.map((m) => (
                <TableRow key={m.rank}>
                  <TableCell>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        m.rank === 1
                          ? "bg-gold/20 text-gold"
                          : m.rank === 2
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.rank}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {m.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{m.txCount}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {fmtKES(m.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
