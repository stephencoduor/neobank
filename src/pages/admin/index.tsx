import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { adminStats } from "@/data/mock";
import {
  Users,
  UserCheck,
  ArrowUpDown,
  DollarSign,
  AlertTriangle,
  Flag,
  CreditCard,
  Store,
  TrendingUp,
  ShieldAlert,
  UserPlus,
  FileCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useApiQuery } from "@/hooks/use-api";
import { fineract } from "@/services/fineract-service";

const mockUserGrowthData = [
  { month: "Oct", users: 8200 },
  { month: "Nov", users: 9100 },
  { month: "Dec", users: 9800 },
  { month: "Jan", users: 10500 },
  { month: "Feb", users: 11200 },
  { month: "Mar", users: 11900 },
  { month: "Apr", users: 12458 },
];

const txnVolumeData = [
  { month: "Oct", volume: 180 },
  { month: "Nov", volume: 195 },
  { month: "Dec", volume: 220 },
  { month: "Jan", volume: 210 },
  { month: "Feb", volume: 225 },
  { month: "Mar", volume: 238 },
  { month: "Apr", volume: 245 },
];

const revenueByProvider = [
  { name: "M-Pesa", value: 42, color: "hsl(142, 76%, 36%)" },
  { name: "Card Payments", value: 28, color: "hsl(210, 80%, 50%)" },
  { name: "Bank Transfer", value: 18, color: "hsl(45, 93%, 47%)" },
  { name: "QR Pay", value: 8, color: "hsl(280, 60%, 50%)" },
  { name: "NFC Tap", value: 4, color: "hsl(0, 70%, 50%)" },
];

const recentActivity = [
  { id: "A-001", type: "signup", name: "Grace Akinyi", description: "New user registered", time: "2 min ago", icon: UserPlus },
  { id: "A-002", type: "kyc", name: "Michael Kipchoge", description: "KYC submitted for review", time: "5 min ago", icon: FileCheck },
  { id: "A-003", type: "flagged", name: "TXN-89234", description: "Flagged: Unusual transfer pattern", time: "12 min ago", icon: ShieldAlert },
  { id: "A-004", type: "signup", name: "Hassan Mohamed", description: "New user registered", time: "18 min ago", icon: UserPlus },
  { id: "A-005", type: "kyc", name: "Sarah Achieng", description: "KYC approved", time: "25 min ago", icon: FileCheck },
  { id: "A-006", type: "flagged", name: "TXN-89201", description: "Flagged: High-value cross-border", time: "32 min ago", icon: ShieldAlert },
  { id: "A-007", type: "signup", name: "Peter Mwangi", description: "New merchant registered", time: "45 min ago", icon: UserPlus },
  { id: "A-008", type: "kyc", name: "Lucy Wanjiku", description: "KYC rejected — blurry ID", time: "1 hour ago", icon: FileCheck },
];

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const kpiCards = [
  {
    label: "Total Users",
    value: adminStats.totalUsers.toLocaleString(),
    icon: Users,
    change: "+3.2%",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Active Users",
    value: adminStats.activeUsers.toLocaleString(),
    icon: UserCheck,
    change: "+1.8%",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    label: "Total Transactions",
    value: formatNumber(adminStats.totalTransactions),
    icon: ArrowUpDown,
    change: "+5.4%",
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    label: "Transaction Volume",
    value: `KES ${formatNumber(adminStats.totalVolume)}`,
    icon: DollarSign,
    change: "+8.1%",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
];

const alertCards = [
  {
    label: "Pending KYC",
    value: adminStats.pendingKyc,
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    label: "Flagged Transactions",
    value: adminStats.flaggedTransactions,
    icon: Flag,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    label: "Active Cards",
    value: adminStats.activeCards.toLocaleString(),
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    label: "Active Merchants",
    value: adminStats.activeMerchants.toLocaleString(),
    icon: Store,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function AdminDashboard() {
  // Fetch live counts from Fineract
  const { data: clientsData, error: clientsErr } = useApiQuery(
    () => fineract.getClients(1),
    [],
  );
  const { data: savingsData, error: savingsErr } = useApiQuery(
    () => fineract.getSavingsAccounts(1),
    [],
  );
  const { data: loansData, error: loansErr } = useApiQuery(
    () => fineract.getLoans(1),
    [],
  );
  const { data: journalsData, error: journalsErr } = useApiQuery(
    () => fineract.getJournalEntries(1),
    [],
  );

  const isLive = !!clientsData && !clientsErr;

  // Override KPI values with live data when available
  const liveKpiCards = isLive
    ? [
        {
          ...kpiCards[0],
          value: (clientsData?.totalFilteredRecords ?? adminStats.totalUsers).toLocaleString(),
          label: "Total Clients",
        },
        {
          ...kpiCards[1],
          value: (savingsData?.totalFilteredRecords ?? adminStats.activeUsers).toLocaleString(),
          label: "Savings Accounts",
        },
        {
          ...kpiCards[2],
          value: formatNumber(journalsData?.totalFilteredRecords ?? adminStats.totalTransactions),
          label: "Journal Entries",
        },
        kpiCards[3],
      ]
    : kpiCards;

  // Append live client count to user growth chart
  const userGrowthData = isLive
    ? mockUserGrowthData.map((d, i) =>
        i === mockUserGrowthData.length - 1
          ? { ...d, users: clientsData?.totalFilteredRecords ?? d.users }
          : d,
      )
    : mockUserGrowthData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Platform overview and key metrics
          </p>
        </div>
        {isLive ? (
          <Badge variant="secondary" className="gap-1 text-emerald-600">
            <Wifi className="h-3 w-3" /> Live API
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <WifiOff className="h-3 w-3" /> Demo Data
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {liveKpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </span>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", kpi.bg)}>
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </div>
              </div>
              <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                {kpi.change} this month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {alertCards.map((alert) => (
          <Card key={alert.label}>
            <CardContent className="pt-1">
              <div className="flex items-center gap-2">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", alert.bg)}>
                  <alert.icon className={cn("h-4 w-4", alert.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{alert.label}</p>
                  <p className={cn("text-xl font-bold", alert.color)}>
                    {alert.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(v) => formatNumber(v)}
                  />
                  <Tooltip
                    formatter={(value: any) => [Number(value).toLocaleString(), "Users"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Monthly volume in KES millions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txnVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(v) => `${v}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`KES ${value}M`, "Volume"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Bar
                    dataKey="volume"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Provider & Activity Feed */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue by Provider */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Provider</CardTitle>
            <CardDescription>Transaction share by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByProvider}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueByProvider.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}%`, name]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[260px] pr-3">
              <div className="space-y-1">
                {recentActivity.map((activity, i) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3 py-2.5">
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          activity.type === "signup"
                            ? "bg-primary/10 text-primary"
                            : activity.type === "kyc"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-red-500/10 text-red-500"
                        )}
                      >
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                    {i < recentActivity.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
