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
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Activity,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Search,
  Flag,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/hooks/use-api";
import { fineract, type FJournalEntry } from "@/services/fineract-service";

interface MonitoredTransaction {
  id: string;
  user: string;
  type: "credit" | "debit";
  amount: number;
  provider: string;
  status: "completed" | "pending" | "failed";
  time: string;
  riskFlag: boolean;
  riskReason?: string;
  recipientOrSender?: string;
  phone?: string;
}

const monitoredTxns: MonitoredTransaction[] = [
  { id: "TXN-89234", user: "Amina Wanjiku", type: "debit", amount: 150_000, provider: "Bank Transfer", status: "completed", time: "2026-04-03T14:32:00", riskFlag: true, riskReason: "Unusual high-value transfer", recipientOrSender: "Offshore Ltd", phone: "+254 712 345 678" },
  { id: "TXN-89233", user: "James Ochieng", type: "credit", amount: 5_000, provider: "M-Pesa", status: "completed", time: "2026-04-03T14:28:00", riskFlag: false, recipientOrSender: "Peter Mwangi", phone: "+254 722 111 222" },
  { id: "TXN-89232", user: "Faith Njeri", type: "debit", amount: 3_450, provider: "Card Payment", status: "completed", time: "2026-04-03T14:15:00", riskFlag: false, recipientOrSender: "Naivas Supermarket", phone: "+254 733 222 333" },
  { id: "TXN-89231", user: "David Kamau", type: "debit", amount: 89_000, provider: "Bank Transfer", status: "pending", time: "2026-04-03T14:10:00", riskFlag: true, riskReason: "Multiple rapid transfers", recipientOrSender: "Global Trade Co.", phone: "+254 712 333 444" },
  { id: "TXN-89230", user: "Grace Akinyi", type: "credit", amount: 125_000, provider: "Bank Transfer", status: "completed", time: "2026-04-03T14:05:00", riskFlag: false, recipientOrSender: "Qsoftwares Ltd", phone: "+254 700 444 555" },
  { id: "TXN-89229", user: "Peter Mwangi", type: "debit", amount: 780, provider: "Card Payment", status: "completed", time: "2026-04-03T13:58:00", riskFlag: false, recipientOrSender: "Bolt Kenya", phone: "+254 791 555 666" },
  { id: "TXN-89228", user: "Hassan Mohamed", type: "debit", amount: 245_000, provider: "M-Pesa", status: "failed", time: "2026-04-03T13:50:00", riskFlag: true, riskReason: "Exceeds daily limit", recipientOrSender: "Unknown Recipient", phone: "+254 722 567 890" },
  { id: "TXN-89227", user: "Sarah Achieng", type: "credit", amount: 15_000, provider: "M-Pesa", status: "completed", time: "2026-04-03T13:45:00", riskFlag: false, recipientOrSender: "James K.", phone: "+254 733 234 567" },
  { id: "TXN-89226", user: "Michael Kipchoge", type: "debit", amount: 2_500, provider: "KPLC Paybill", status: "completed", time: "2026-04-03T13:40:00", riskFlag: false, recipientOrSender: "KPLC Token", phone: "+254 712 345 678" },
  { id: "TXN-89225", user: "Lucy Wanjiku", type: "debit", amount: 67_000, provider: "Bank Transfer", status: "completed", time: "2026-04-03T13:35:00", riskFlag: true, riskReason: "New payee, high value", recipientOrSender: "Import Goods Ltd", phone: "+254 791 456 789" },
];

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-500",
};

/** Transform Fineract journal entries into MonitoredTransaction format */
function journalsToTxns(entries: FJournalEntry[]): MonitoredTransaction[] {
  return entries.map((je) => {
    const date = je.transactionDate
      ? `${je.transactionDate[0]}-${String(je.transactionDate[1]).padStart(2, "0")}-${String(je.transactionDate[2]).padStart(2, "0")}T12:00:00`
      : new Date().toISOString();
    const isDebit = je.entryType?.value === "DEBIT";
    return {
      id: `JE-${je.id}`,
      user: je.glAccountName || "System",
      type: isDebit ? "debit" : "credit",
      amount: je.amount,
      provider: je.manualEntry ? "Manual Entry" : "System",
      status: je.reversed ? "failed" : "completed",
      time: date,
      riskFlag: je.amount > 100_000,
      riskReason: je.amount > 100_000 ? "High-value journal entry" : undefined,
      recipientOrSender: `${je.officeName} — GL ${je.glAccountCode}`,
      phone: "—",
    };
  });
}

export default function TransactionsMonitor() {
  // Fetch live journal entries from Fineract
  const { data: journalsData, error } = useApiQuery(
    () => fineract.getJournalEntries(20),
    [],
  );
  const isLive = !!journalsData && !error;

  // Merge live journal entries (as transactions) with mock data
  const liveJournalTxns = isLive ? journalsToTxns(journalsData.pageItems) : [];
  const allTxns = isLive ? [...liveJournalTxns, ...monitoredTxns] : monitoredTxns;

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<MonitoredTransaction | null>(null);

  const filtered = allTxns.filter((txn) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !txn.user.toLowerCase().includes(q) &&
        !txn.id.toLowerCase().includes(q)
      )
        return false;
    }
    if (typeFilter !== "all" && txn.type !== typeFilter) return false;
    if (statusFilter !== "all" && txn.status !== statusFilter) return false;
    if (providerFilter !== "all" && txn.provider !== providerFilter) return false;
    return true;
  });

  const flaggedCount = allTxns.filter((t) => t.riskFlag).length;
  const successRate = Math.round(
    (allTxns.filter((t) => t.status === "completed").length /
      allTxns.length) *
      100
  );
  const avgAmount = Math.round(
    allTxns.reduce((s, t) => s + t.amount, 0) / allTxns.length
  );
  const totalToday = allTxns.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Transaction Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Real-time transaction surveillance and risk detection
            {isLive && ` — ${liveJournalTxns.length} live journal entries`}
          </p>
        </div>
        {isLive ? (
          <Badge variant="secondary" className="gap-1 text-emerald-600">
            <Wifi className="h-3 w-3" /> Live
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <WifiOff className="h-3 w-3" /> Demo
          </Badge>
        )}
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Txns/min</span>
            </div>
            <p className="mt-1 text-2xl font-bold">24</p>
            <p className="text-xs text-emerald-600">Live</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium">Success Rate</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{successRate}%</p>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium">Avg Amount</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatKES(avgAmount)}</p>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium">Total Today</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatKES(totalToday)}</p>
            <p className="text-xs text-emerald-600">+8.3% vs yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user or ID..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val ?? "")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={(val) => setProviderFilter(val ?? "")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Card Payment">Card Payment</SelectItem>
                <SelectItem value="KPLC Paybill">KPLC Paybill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Alert */}
      {flaggedCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-600">
              {flaggedCount} flagged transactions require attention
            </p>
            <p className="text-xs text-red-500/80">
              Review flagged items highlighted below
            </p>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Time</TableHead>
                  <TableHead className="w-[50px]">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((txn) => (
                  <TableRow
                    key={txn.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      txn.riskFlag && "bg-red-500/5 hover:bg-red-500/10"
                    )}
                    onClick={() => setSelectedTxn(txn)}
                  >
                    <TableCell className="font-mono text-xs">
                      {txn.id}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {txn.user}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        {txn.type === "credit" ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className="text-xs capitalize">{txn.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {formatKES(txn.amount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {txn.provider}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", statusStyles[txn.status])}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatTime(txn.time)}
                    </TableCell>
                    <TableCell>
                      {txn.riskFlag && (
                        <Flag className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTxn} onOpenChange={() => setSelectedTxn(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>{selectedTxn?.id}</DialogDescription>
          </DialogHeader>
          {selectedTxn && (
            <div className="space-y-4 pt-2">
              {selectedTxn.riskFlag && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    {selectedTxn.riskReason}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="font-medium">{selectedTxn.user}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedTxn.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedTxn.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-bold">{formatKES(selectedTxn.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="font-medium">{selectedTxn.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={cn("text-[10px]", statusStyles[selectedTxn.status])}>
                    {selectedTxn.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {selectedTxn.type === "credit" ? "Sender" : "Recipient"}
                  </p>
                  <p className="font-medium">{selectedTxn.recipientOrSender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {new Date(selectedTxn.time).toLocaleString("en-KE")}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                {selectedTxn.riskFlag && (
                  <>
                    <Button
                      className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setSelectedTxn(null)}
                    >
                      Mark Safe
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => setSelectedTxn(null)}
                    >
                      Block & Report
                    </Button>
                  </>
                )}
                {!selectedTxn.riskFlag && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedTxn(null)}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
