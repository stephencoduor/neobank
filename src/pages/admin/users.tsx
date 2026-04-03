import { useState } from "react";
import {
  Card,
  CardContent,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Download,
  Bell,
  MoreHorizontal,
  Eye,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: "Basic" | "Standard" | "Premium";
  kycStatus: "verified" | "pending" | "rejected" | "not_started";
  accountStatus: "active" | "suspended" | "closed";
  createdAt: string;
}

const users: User[] = [
  { id: "USR-001", name: "Amina Wanjiku", phone: "+254 712 345 678", email: "amina.wanjiku@gmail.com", tier: "Standard", kycStatus: "verified", accountStatus: "active", createdAt: "2025-11-15" },
  { id: "USR-002", name: "James Ochieng", phone: "+254 722 111 222", email: "james.ochieng@outlook.com", tier: "Premium", kycStatus: "verified", accountStatus: "active", createdAt: "2025-10-03" },
  { id: "USR-003", name: "Faith Njeri", phone: "+254 733 222 333", email: "faith.njeri@yahoo.com", tier: "Basic", kycStatus: "pending", accountStatus: "active", createdAt: "2026-03-20" },
  { id: "USR-004", name: "David Kamau", phone: "+254 712 333 444", email: "david.kamau@gmail.com", tier: "Standard", kycStatus: "verified", accountStatus: "active", createdAt: "2025-12-08" },
  { id: "USR-005", name: "Grace Akinyi", phone: "+254 700 444 555", email: "grace.akinyi@hotmail.com", tier: "Basic", kycStatus: "not_started", accountStatus: "active", createdAt: "2026-04-01" },
  { id: "USR-006", name: "Peter Mwangi", phone: "+254 791 555 666", email: "peter.mwangi@gmail.com", tier: "Premium", kycStatus: "verified", accountStatus: "suspended", createdAt: "2025-09-14" },
  { id: "USR-007", name: "Lucy Wanjiku", phone: "+254 791 456 789", email: "lucy.wanjiku@gmail.com", tier: "Standard", kycStatus: "rejected", accountStatus: "active", createdAt: "2026-02-10" },
  { id: "USR-008", name: "Hassan Mohamed", phone: "+254 722 567 890", email: "hassan.mohamed@gmail.com", tier: "Basic", kycStatus: "pending", accountStatus: "active", createdAt: "2026-03-25" },
  { id: "USR-009", name: "Sarah Achieng", phone: "+254 733 234 567", email: "sarah.achieng@outlook.com", tier: "Standard", kycStatus: "verified", accountStatus: "active", createdAt: "2025-11-30" },
  { id: "USR-010", name: "Michael Kipchoge", phone: "+254 712 345 678", email: "michael.kipchoge@gmail.com", tier: "Premium", kycStatus: "verified", accountStatus: "active", createdAt: "2025-08-22" },
  { id: "USR-011", name: "Wanjiru Muthoni", phone: "+254 710 888 999", email: "wanjiru.m@gmail.com", tier: "Basic", kycStatus: "pending", accountStatus: "active", createdAt: "2026-04-02" },
  { id: "USR-012", name: "Joseph Otieno", phone: "+254 723 777 888", email: "joseph.otieno@yahoo.com", tier: "Standard", kycStatus: "verified", accountStatus: "active", createdAt: "2026-01-15" },
];

const kycStyles: Record<string, string> = {
  verified: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-amber-500/10 text-amber-600",
  rejected: "bg-red-500/10 text-red-500",
  not_started: "bg-muted text-muted-foreground",
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  suspended: "bg-red-500/10 text-red-500",
  closed: "bg-muted text-muted-foreground",
};

const tierStyles: Record<string, string> = {
  Basic: "bg-muted text-muted-foreground",
  Standard: "bg-blue-500/10 text-blue-600",
  Premium: "bg-amber-500/10 text-amber-600",
};

const PAGE_SIZE = 8;

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.phone.includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false;
    }
    if (tierFilter !== "all" && u.tier !== tierFilter) return false;
    if (statusFilter !== "all" && u.accountStatus !== statusFilter) return false;
    if (kycFilter !== "all" && u.kycStatus !== kycFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} total users on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={tierFilter}
              onValueChange={(v) => {
                setTierFilter(v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={kycFilter}
              onValueChange={(v) => {
                setKycFilter(v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {user.phone}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", tierStyles[user.tier])}>
                        {user.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", kycStyles[user.kycStatus])}>
                        {user.kycStatus.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={cn("text-[10px]", statusStyles[user.accountStatus])}>
                        {user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-amber-600">
                            <Ban className="h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
