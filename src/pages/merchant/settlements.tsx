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
  Banknote,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Settlement {
  id: string;
  date: string;
  amount: number;
  transactionCount: number;
  method: string;
  status: "settled" | "pending" | "processing";
  reference: string;
}

const settlements: Settlement[] = [
  { id: "STL-001", date: "2026-04-03", amount: 34_500, transactionCount: 23, method: "M-Pesa", status: "settled", reference: "MP-20260403-001" },
  { id: "STL-002", date: "2026-04-02", amount: 42_800, transactionCount: 31, method: "Bank Transfer", status: "settled", reference: "BT-20260402-001" },
  { id: "STL-003", date: "2026-04-01", amount: 28_950, transactionCount: 18, method: "M-Pesa", status: "settled", reference: "MP-20260401-001" },
  { id: "STL-004", date: "2026-03-31", amount: 51_200, transactionCount: 37, method: "Bank Transfer", status: "settled", reference: "BT-20260331-001" },
  { id: "STL-005", date: "2026-03-30", amount: 19_700, transactionCount: 14, method: "M-Pesa", status: "settled", reference: "MP-20260330-001" },
  { id: "STL-006", date: "2026-03-29", amount: 36_400, transactionCount: 26, method: "M-Pesa", status: "settled", reference: "MP-20260329-001" },
  { id: "STL-007", date: "2026-03-28", amount: 8_250, transactionCount: 9, method: "Bank Transfer", status: "settled", reference: "BT-20260328-001" },
  { id: "STL-008", date: "2026-04-03", amount: 12_350, transactionCount: 8, method: "Bank Transfer", status: "pending", reference: "BT-20260403-002" },
  { id: "STL-009", date: "2026-04-03", amount: 5_600, transactionCount: 4, method: "M-Pesa", status: "processing", reference: "MP-20260403-003" },
];

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusStyles: Record<string, string> = {
  settled: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-amber-500/10 text-amber-600",
  processing: "bg-blue-500/10 text-blue-600",
};

export default function Settlements() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = settlements.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (dateFrom && s.date < dateFrom) return false;
    if (dateTo && s.date > dateTo) return false;
    return true;
  });

  const settledToday = settlements
    .filter((s) => s.date === "2026-04-03" && s.status === "settled")
    .reduce((sum, s) => sum + s.amount, 0);

  const pendingAmount = settlements
    .filter((s) => s.status === "pending" || s.status === "processing")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Settlement History</h1>
          <p className="text-sm text-muted-foreground">
            Track your payment settlements and payouts
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium">Settled Today</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {formatKES(settledToday)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium">Pending Settlement</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {formatKES(pendingAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Next Settlement</span>
            </div>
            <p className="mt-1 text-lg font-bold">Today, 6:00 PM</p>
            <p className="text-xs text-muted-foreground">Via M-Pesa</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters:
            </div>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[150px]"
                placeholder="From"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[150px]"
                placeholder="To"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlements Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Settlements ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Transactions</TableHead>
                  <TableHead className="hidden md:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell className="font-medium">
                      {formatDate(settlement.date)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatKES(settlement.amount)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {settlement.transactionCount} txns
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {settlement.method === "M-Pesa" ? (
                          <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                        )}
                        {settlement.method}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", statusStyles[settlement.status])}>
                        {settlement.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                      {settlement.reference}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No settlements found for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
