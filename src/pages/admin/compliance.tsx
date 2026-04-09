import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  Database,
  UserCheck,
  Scan,
  TrendingUp,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAmlCases, useAmlRules, useStrExport } from "@/hooks/use-aml";
import { useApiQuery } from "@/hooks/use-api";
import { fineract } from "@/services/fineract-service";
import { Wifi, WifiOff } from "lucide-react";

const sarsReports = [
  { id: "SAR-2026-001", subject: "Hassan Mohamed", type: "Structuring", filedDate: "2026-04-03", status: "filed", regulator: "FRC Kenya" },
  { id: "SAR-2026-002", subject: "Unknown Entity", type: "Money Laundering", filedDate: "2026-04-01", status: "under_review", regulator: "FRC Kenya" },
  { id: "SAR-2026-003", subject: "Offshore Ltd", type: "Suspicious Transfer", filedDate: "2026-03-28", status: "filed", regulator: "CBK" },
  { id: "SAR-2026-004", subject: "Global Trade Co.", type: "Trade-Based ML", filedDate: "2026-03-25", status: "acknowledged", regulator: "FRC Kenya" },
];

const regulatoryChecklist = [
  { name: "KYC Coverage", description: "Percentage of users with verified KYC", value: 87, target: 95, icon: UserCheck, status: "warning" },
  { name: "AML Scanning", description: "Real-time transaction monitoring active", value: 100, target: 100, icon: Scan, status: "pass" },
  { name: "PCI-DSS Compliance", description: "Payment Card Industry Data Security Standard", value: 100, target: 100, icon: Lock, status: "pass" },
  { name: "Data Residency", description: "All data stored within Kenya (AWS Nairobi)", value: 100, target: 100, icon: Database, status: "pass" },
  { name: "Transaction Reporting", description: "CTR filings for transactions above threshold", value: 98, target: 100, icon: FileText, status: "pass" },
];

const severityStyles: Record<string, string> = {
  high: "bg-red-500/10 text-red-500",
  medium: "bg-amber-500/10 text-amber-600",
  low: "bg-blue-500/10 text-blue-600",
};

const alertStatusStyles: Record<string, string> = {
  open: "bg-red-500/10 text-red-500",
  investigating: "bg-amber-500/10 text-amber-600",
  resolved: "bg-emerald-500/10 text-emerald-600",
};

const sarStatusStyles: Record<string, string> = {
  filed: "bg-blue-500/10 text-blue-600",
  under_review: "bg-amber-500/10 text-amber-600",
  acknowledged: "bg-emerald-500/10 text-emerald-600",
};

export default function Compliance() {
  // API hooks — fall back to mock data when backend is unavailable
  const { data: amlCases, loading: casesLoading, error: casesError, refetch: refetchCases } = useAmlCases();
  const { data: rules } = useAmlRules();
  const { mutate: exportStr, loading: exporting } = useStrExport();

  // Fineract live status — client count for KYC coverage context
  const { data: clientsData, error: fErr } = useApiQuery(
    () => fineract.getClients(1),
    [],
  );
  const isFineractLive = !!clientsData && !fErr;
  const totalClients = (clientsData as unknown as Record<string, unknown>)?.totalFilteredRecords as number ?? 0;

  // Transform API AML cases into display format
  const amlAlerts = useMemo(() => {
    if (!amlCases) return [];
    return amlCases.map((c) => ({
      id: c.id,
      severity: c.severity.toLowerCase(),
      description: c.ruleDescription,
      user: c.clientName,
      date: c.createdAt.split("T")[0],
      status: c.status === "OPEN" ? "open" : c.status === "INVESTIGATING" ? "investigating" : "resolved",
    }));
  }, [amlCases]);

  const complianceScore = 94;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Compliance & Reports</h1>
          <p className="text-sm text-muted-foreground">
            AML monitoring, regulatory compliance, and reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFineractLive ? (
            <Badge className="gap-1 text-[10px] text-emerald-600 bg-emerald-500/10">
              <Wifi className="h-3 w-3" /> Live · {totalClients} clients
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
              <WifiOff className="h-3 w-3" /> Demo
            </Badge>
          )}
        </div>
        <Button
          className="gap-2"
          onClick={() => exportStr({})}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "Exporting..." : "Export Compliance Report"}
        </Button>
      </div>

      {/* Compliance Score + Regulatory Checklist */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Compliance Score */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
            <CardDescription>Overall regulatory compliance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeDasharray={`${(complianceScore / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold">{complianceScore}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+2 points</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Regulatory Checklist</CardTitle>
            <CardDescription>CBK and FRC compliance requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regulatoryChecklist.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    item.status === "pass"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">
                        {item.value}%
                      </span>
                      {item.status === "pass" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <Progress value={item.value} className="mt-1.5 h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AML Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                AML Alerts
                {rules && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    {rules.filter((r) => r.enabled).length} rules active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Anti-money laundering alerts and investigations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refetchCases} disabled={casesLoading}>
              <RefreshCcw className={cn("h-4 w-4", casesLoading && "animate-spin")} />
            </Button>
          </div>
          {casesError && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
              Using offline data — backend unavailable
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {amlAlerts.map((alert, i) => (
              <div key={alert.id}>
                <div className="flex items-start gap-3 py-2.5">
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      alert.severity === "high"
                        ? "bg-red-500/10"
                        : alert.severity === "medium"
                        ? "bg-amber-500/10"
                        : "bg-blue-500/10"
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4",
                        alert.severity === "high"
                          ? "text-red-500"
                          : alert.severity === "medium"
                          ? "text-amber-600"
                          : "text-blue-600"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-[10px]", severityStyles[alert.severity])}>
                        {alert.severity}
                      </Badge>
                      <Badge className={cn("text-[10px]", alertStatusStyles[alert.status])}>
                        {alert.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{alert.id}</span>
                    </div>
                    <p className="mt-1 text-sm">{alert.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      User: {alert.user} &middot; {new Date(alert.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 text-xs">
                    Investigate
                  </Button>
                </div>
                {i < amlAlerts.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suspicious Activity Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Suspicious Activity Reports (SARs)
          </CardTitle>
          <CardDescription>Filed with Financial Reporting Centre (FRC) Kenya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Filed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Regulator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sarsReports.map((sar) => (
                  <TableRow key={sar.id}>
                    <TableCell className="font-mono text-xs">{sar.id}</TableCell>
                    <TableCell className="text-sm font-medium">{sar.subject}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{sar.type}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(sar.filedDate).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", sarStatusStyles[sar.status])}>
                        {sar.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {sar.regulator}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
