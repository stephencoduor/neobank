import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Download,
  Search,
  AlertTriangle,
  Info,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Activity,
  Filter,
  Calendar,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/hooks/use-api";
import { fineract, type FAuditLog } from "@/services/fineract-service";

type Severity = "info" | "warning" | "critical";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ipAddress: string;
  severity: Severity;
  details: string;
}

const auditData: AuditEntry[] = [
  {
    id: "AUD-001",
    timestamp: "2026-04-03 14:32:18",
    user: "admin@neobank.co.ke",
    action: "Login",
    resource: "Admin Portal",
    ipAddress: "196.201.214.52",
    severity: "info",
    details: "Successful admin login from Safaricom network",
  },
  {
    id: "AUD-002",
    timestamp: "2026-04-03 14:28:05",
    user: "grace.akinyi@neobank.co.ke",
    action: "KYC",
    resource: "User: James Odhiambo",
    ipAddress: "196.201.214.88",
    severity: "info",
    details: "KYC documents approved — National ID and KRA PIN verified",
  },
  {
    id: "AUD-003",
    timestamp: "2026-04-03 14:15:42",
    user: "system",
    action: "Transaction",
    resource: "TXN-2026-8847",
    ipAddress: "10.0.1.5",
    severity: "critical",
    details:
      "Flagged: KES 2,450,000 transfer to unverified account — exceeds daily limit",
  },
  {
    id: "AUD-004",
    timestamp: "2026-04-03 13:55:30",
    user: "admin@neobank.co.ke",
    action: "User Management",
    resource: "User: Peter Mwangi",
    ipAddress: "196.201.214.52",
    severity: "warning",
    details:
      "Account suspended — multiple failed KYC verification attempts",
  },
  {
    id: "AUD-005",
    timestamp: "2026-04-03 13:42:11",
    user: "unknown",
    action: "Login",
    resource: "Admin Portal",
    ipAddress: "41.89.244.17",
    severity: "critical",
    details:
      "5 failed login attempts from University of Nairobi IP range — account locked",
  },
  {
    id: "AUD-006",
    timestamp: "2026-04-03 13:30:00",
    user: "grace.akinyi@neobank.co.ke",
    action: "KYC",
    resource: "User: Fatuma Hassan",
    ipAddress: "196.201.214.88",
    severity: "info",
    details: "KYC submission received — documents pending review",
  },
  {
    id: "AUD-007",
    timestamp: "2026-04-03 12:58:44",
    user: "admin@neobank.co.ke",
    action: "Settings",
    resource: "Platform Fee",
    ipAddress: "196.201.214.52",
    severity: "warning",
    details: "Platform fee changed from 1.5% to 2.0% — effective immediately",
  },
  {
    id: "AUD-008",
    timestamp: "2026-04-03 12:45:22",
    user: "system",
    action: "Transaction",
    resource: "TXN-2026-8832",
    ipAddress: "10.0.1.5",
    severity: "info",
    details:
      "Bulk salary disbursement — KES 847,500 to 15 recipients via Wanjiku Enterprises",
  },
  {
    id: "AUD-009",
    timestamp: "2026-04-03 12:20:15",
    user: "daniel.kimani@neobank.co.ke",
    action: "User Management",
    resource: "Role: Compliance Officer",
    ipAddress: "196.201.215.33",
    severity: "warning",
    details:
      "New compliance officer role assigned to mercy.wanjiru@neobank.co.ke",
  },
  {
    id: "AUD-010",
    timestamp: "2026-04-03 11:55:08",
    user: "system",
    action: "Transaction",
    resource: "TXN-2026-8819",
    ipAddress: "10.0.1.5",
    severity: "critical",
    details:
      "Structuring alert: 4 deposits of KES 95,000 each within 30 minutes — same source",
  },
  {
    id: "AUD-011",
    timestamp: "2026-04-03 11:30:00",
    user: "admin@neobank.co.ke",
    action: "Settings",
    resource: "Security Policy",
    ipAddress: "196.201.214.52",
    severity: "info",
    details: "Two-factor authentication enforced for all admin accounts",
  },
  {
    id: "AUD-012",
    timestamp: "2026-04-03 11:15:33",
    user: "grace.akinyi@neobank.co.ke",
    action: "KYC",
    resource: "User: Otieno Wycliffe",
    ipAddress: "196.201.214.88",
    severity: "warning",
    details:
      "KYC rejected — National ID photo mismatch with selfie verification",
  },
  {
    id: "AUD-013",
    timestamp: "2026-04-03 10:48:19",
    user: "system",
    action: "Login",
    resource: "Mobile App",
    ipAddress: "41.215.130.72",
    severity: "info",
    details:
      "User wanjiku.njoroge@gmail.com logged in from Airtel Kenya network",
  },
  {
    id: "AUD-014",
    timestamp: "2026-04-03 09:30:00",
    user: "system",
    action: "Settings",
    resource: "System Maintenance",
    ipAddress: "10.0.1.1",
    severity: "warning",
    details:
      "Scheduled database maintenance completed — 4.2s downtime, 0 failed transactions",
  },
  {
    id: "AUD-015",
    timestamp: "2026-04-03 08:00:01",
    user: "system",
    action: "Transaction",
    resource: "Daily Reconciliation",
    ipAddress: "10.0.1.5",
    severity: "info",
    details:
      "Daily reconciliation completed — 3,847 transactions totalling KES 24.6M processed",
  },
];

const severityConfig: Record<
  Severity,
  { label: string; className: string; icon: typeof Info }
> = {
  info: {
    label: "Info",
    className: "bg-slate-500/10 text-slate-600",
    icon: Info,
  },
  warning: {
    label: "Warning",
    className: "bg-amber-500/10 text-amber-600",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-500",
    icon: AlertOctagon,
  },
};

const actionTypes = [
  "All",
  "Login",
  "KYC",
  "Transaction",
  "Settings",
  "User Management",
];
const severityOptions = ["All", "Info", "Warning", "Critical"];

/** Transform Fineract audit logs into our UI format */
function transformAuditLogs(logs: FAuditLog[]): AuditEntry[] {
  return logs.map((log) => {
    const date = new Date(log.madeOnDate);
    const severity: Severity =
      log.processingResult === "FAILURE" ? "critical"
        : log.actionName.includes("DELETE") || log.actionName.includes("REJECT") ? "warning"
        : "info";
    return {
      id: `AUD-F${log.id}`,
      timestamp: date.toISOString().replace("T", " ").slice(0, 19),
      user: log.maker || "system",
      action: log.actionName,
      resource: `${log.entityName} #${log.resourceId}`,
      ipAddress: "—",
      severity,
      details: `${log.actionName} on ${log.entityName} (ID: ${log.resourceId}) at ${log.officeName}`,
    };
  });
}

export default function AuditLog() {
  // Fetch real audit logs from Fineract
  const { data: auditLive, error } = useApiQuery(
    () => fineract.getAuditLogs(50),
    [],
  );
  const isLive = !!auditLive && !error;

  // Merge live audit logs with mock data (live first)
  const liveEntries = isLive ? transformAuditLogs(auditLive.pageItems) : [];
  const allAuditData = isLive ? [...liveEntries, ...auditData] : auditData;

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = allAuditData.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction =
      actionFilter === "All" || entry.action === actionFilter;
    const matchesSeverity =
      severityFilter === "All" ||
      entry.severity === severityFilter.toLowerCase();
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalToday = allAuditData.length;
  const criticalCount = allAuditData.filter(
    (e) => e.severity === "critical"
  ).length;
  const warningCount = allAuditData.filter(
    (e) => e.severity === "warning"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
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
          <p className="text-muted-foreground">
            Track all system events, user actions, and security alerts
            {isLive && ` — ${liveEntries.length} from Fineract`}
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 size-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-muted-foreground">
                Total Events Today
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertOctagon className="size-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Critical Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{warningCount}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs">
                Search
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by user, resource, or details..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label className="text-xs">Action Type</Label>
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val ?? "All");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <Filter className="mr-2 size-3" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <Label className="text-xs">Severity</Label>
              <Select
                value={severityFilter}
                onValueChange={(val) => {
                  setSeverityFilter(val ?? "All");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <Shield className="mr-2 size-3" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <Label className="text-xs">Date Range</Label>
              <Input type="date" className="mt-1" defaultValue="2026-04-03" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Resource
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  IP Address
                </TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="hidden xl:table-cell">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((entry) => {
                const severity = severityConfig[entry.severity];
                const SeverityIcon = severity.icon;
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {entry.timestamp}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm">
                      {entry.user}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-[140px] truncate text-sm lg:table-cell">
                      {entry.resource}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs md:table-cell">
                      {entry.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "gap-1 text-xs",
                          severity.className
                        )}
                      >
                        <SeverityIcon className="size-3" />
                        {severity.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-[280px] truncate text-xs text-muted-foreground xl:table-cell">
                      {entry.details}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No audit entries match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1}
          {" - "}
          {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
          {filtered.length} entries
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
