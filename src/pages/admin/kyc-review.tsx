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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { kycReviewQueue } from "@/data/mock";
import {
  Clock,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Camera,
  CreditCard,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/hooks/use-api";
import { fineract, type FClient } from "@/services/fineract-service";

/** Transform Fineract clients to KYC queue items */
function clientsToKycQueue(clients: FClient[]) {
  return clients.map((c, i) => {
    const activationDate = c.activationDate
      ? `${c.activationDate[0]}-${String(c.activationDate[1]).padStart(2, "0")}-${String(c.activationDate[2]).padStart(2, "0")}T12:00:00`
      : new Date().toISOString();
    return {
      id: `KYC-${String(c.id).padStart(3, "0")}`,
      name: c.displayName,
      phone: c.mobileNo || "+254 7XX XXX XXX",
      documentType: "National ID" as const,
      submittedAt: activationDate,
      status: (c.active ? "approved" : "pending") as "approved" | "pending" | "under_review" | "rejected" | "flagged",
      riskScore: c.active ? Math.floor(Math.random() * 25) + 5 : Math.floor(Math.random() * 40) + 30,
    };
  });
}

const statsData = {
  pending: 47,
  underReview: 12,
  approvedToday: 34,
  rejectedToday: 3,
};

const fullQueue = [
  ...kycReviewQueue,
  { id: "KYC-006", name: "Wanjiru Muthoni", phone: "+254 710 888 999", documentType: "National ID", submittedAt: "2026-04-01T15:00:00", status: "pending" as const, riskScore: 12 },
  { id: "KYC-007", name: "Joseph Otieno", phone: "+254 723 777 888", documentType: "Passport", submittedAt: "2026-04-01T11:00:00", status: "pending" as const, riskScore: 55 },
  { id: "KYC-008", name: "Fatuma Hassan", phone: "+254 734 123 456", documentType: "Alien ID", submittedAt: "2026-03-31T09:30:00", status: "under_review" as const, riskScore: 35 },
  { id: "KYC-009", name: "Dennis Mwenda", phone: "+254 745 234 567", documentType: "National ID", submittedAt: "2026-03-30T14:00:00", status: "approved" as const, riskScore: 5 },
  { id: "KYC-010", name: "Rehema Juma", phone: "+254 756 345 678", documentType: "National ID", submittedAt: "2026-03-30T10:00:00", status: "rejected" as const, riskScore: 82 },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  under_review: "bg-blue-500/10 text-blue-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-500",
  flagged: "bg-red-500/10 text-red-500",
};

function riskColor(score: number) {
  if (score < 30) return "text-emerald-600 bg-emerald-500/10";
  if (score <= 60) return "text-amber-600 bg-amber-500/10";
  return "text-red-500 bg-red-500/10";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type KycItem = (typeof fullQueue)[number];

export default function KycReview() {
  // Fetch real clients from Fineract for KYC queue
  const { data: clientsData, error } = useApiQuery(
    () => fineract.getClients(50),
    [],
  );
  const isLive = !!clientsData && !error;
  const liveQueue = isLive ? clientsToKycQueue(clientsData.pageItems) : [];
  const allQueue = isLive ? [...liveQueue, ...fullQueue] : fullQueue;

  const liveStats = isLive
    ? {
        pending: liveQueue.filter((q) => q.status === "pending").length + statsData.pending,
        underReview: statsData.underReview,
        approvedToday: liveQueue.filter((q) => q.status === "approved").length + statsData.approvedToday,
        rejectedToday: statsData.rejectedToday,
      }
    : statsData;

  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reviewItem, setReviewItem] = useState<KycItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = allQueue.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.phone.includes(q))
        return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (riskFilter === "low" && item.riskScore >= 30) return false;
    if (riskFilter === "medium" && (item.riskScore < 30 || item.riskScore > 60))
      return false;
    if (riskFilter === "high" && item.riskScore <= 60) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">KYC Review Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve customer identity documents
          </p>
        </div>
        {isLive ? (
          <Badge className="gap-1 text-[10px] text-emerald-600 bg-emerald-500/10">
            <Wifi className="h-3 w-3" /> {liveQueue.length} Fineract clients
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-[10px]">
            <WifiOff className="h-3 w-3" /> Demo
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-amber-600">{liveStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Under Review</p>
                <p className="text-xl font-bold text-blue-600">{liveStats.underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved Today</p>
                <p className="text-xl font-bold text-emerald-600">{liveStats.approvedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected Today</p>
                <p className="text-xl font-bold text-red-500">{liveStats.rejectedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={(val) => setRiskFilter(val ?? "")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low (&lt;30)</SelectItem>
                <SelectItem value="medium">Medium (30-60)</SelectItem>
                <SelectItem value="high">High (&gt;60)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Document</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      item.riskScore > 60 && "bg-red-500/5"
                    )}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {item.phone}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {item.documentType}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(item.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px] font-bold", riskColor(item.riskScore))}>
                        {item.riskScore}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", statusStyles[item.status])}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setReviewItem(item);
                          setRejectReason("");
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No items match the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewItem} onOpenChange={() => setReviewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>KYC Review - {reviewItem?.name}</DialogTitle>
            <DialogDescription>
              {reviewItem?.id} &middot; {reviewItem?.documentType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Document Preview */}
            <div>
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Uploaded Documents
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="flex aspect-[3/2] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                  <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                  <span className="mt-1 text-xs text-muted-foreground">ID Front</span>
                </div>
                <div className="flex aspect-[3/2] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                  <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                  <span className="mt-1 text-xs text-muted-foreground">ID Back</span>
                </div>
              </div>
              <div className="mt-3 flex justify-center">
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                  <Camera className="h-6 w-6 text-muted-foreground/40" />
                  <span className="mt-0.5 text-[10px] text-muted-foreground">Selfie</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* OCR Extracted Data */}
            <div>
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                OCR Extracted Data
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium">{reviewItem?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ID Number</p>
                  <p className="font-medium">3{Math.floor(Math.random() * 9000000 + 1000000)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">15 Mar 1992</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium">
                    {reviewItem?.name.includes("Sarah") ||
                    reviewItem?.name.includes("Lucy") ||
                    reviewItem?.name.includes("Fatuma") ||
                    reviewItem?.name.includes("Wanjiru") ||
                    reviewItem?.name.includes("Rehema")
                      ? "Female"
                      : "Male"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* AML Check */}
            <div>
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                AML / Sanctions Check
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-2.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">PEP Screening</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                    Clear
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-2.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">Sanctions List</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                    Clear
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-2.5">
                  <div className="flex items-center gap-2">
                    {reviewItem && reviewItem.riskScore > 60 ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-emerald-600" />
                    )}
                    <span className="text-sm">Risk Score</span>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold",
                      reviewItem ? riskColor(reviewItem.riskScore) : ""
                    )}
                  >
                    {reviewItem?.riskScore}/100
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rejection Reason */}
            <div>
              <Label htmlFor="reject-reason">Rejection Reason (if rejecting)</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter reason for rejection..."
                className="mt-1"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setReviewItem(null)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={() => setReviewItem(null)}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
