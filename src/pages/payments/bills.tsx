import { useState } from "react";
import {
  ArrowLeft,
  Zap,
  Droplets,
  Wifi,
  Tv,
  Home,
  Shield,
  GraduationCap,
  MoreHorizontal,
  Star,
  ChevronRight,
  CheckCircle2,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { accounts } from "@/data/mock";
import { billsService } from "@/services/bills-service";
import { cn } from "@/lib/utils";

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/* ── Bill categories ────────────────────────────────────────────────── */

const categories = [
  {
    id: "electricity",
    label: "Electricity",
    provider: "KPLC",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-700",
    placeholder: "Meter number",
  },
  {
    id: "water",
    label: "Water",
    provider: "Nairobi Water",
    icon: Droplets,
    color: "bg-blue-100 text-blue-700",
    placeholder: "Account number",
  },
  {
    id: "internet",
    label: "Internet",
    provider: "Safaricom Home",
    icon: Wifi,
    color: "bg-green-100 text-green-700",
    placeholder: "Account number",
  },
  {
    id: "tv",
    label: "TV",
    provider: "DStv / Zuku",
    icon: Tv,
    color: "bg-purple-100 text-purple-700",
    placeholder: "Smartcard number",
  },
  {
    id: "rent",
    label: "Rent",
    provider: "Landlord",
    icon: Home,
    color: "bg-orange-100 text-orange-700",
    placeholder: "Reference / account",
  },
  {
    id: "insurance",
    label: "Insurance",
    provider: "Jubilee / Britam",
    icon: Shield,
    color: "bg-emerald-100 text-emerald-700",
    placeholder: "Policy number",
  },
  {
    id: "school",
    label: "School Fees",
    provider: "Institution",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-700",
    placeholder: "Admission number",
  },
  {
    id: "more",
    label: "More",
    provider: "",
    icon: MoreHorizontal,
    color: "bg-gray-100 text-gray-700",
    placeholder: "",
  },
];

/* ── Saved billers ──────────────────────────────────────────────────── */

const savedBillers = [
  {
    id: "SB-001",
    category: "electricity",
    label: "Home - KPLC Prepaid",
    accountNumber: "54321098765",
    lastAmount: 2_500,
  },
  {
    id: "SB-002",
    category: "internet",
    label: "Safaricom Fibre",
    accountNumber: "SFC-887654",
    lastAmount: 4_999,
  },
  {
    id: "SB-003",
    category: "tv",
    label: "DStv Premium",
    accountNumber: "1234567890",
    lastAmount: 10_500,
  },
];

/* ── Recent bill payments ───────────────────────────────────────────── */

const recentBills = [
  {
    id: "BP-001",
    category: "electricity",
    description: "KPLC Token Purchase",
    amount: 2_500,
    date: "2026-03-31",
    status: "completed" as const,
    token: "4521-8876-3345-2290-1187",
  },
  {
    id: "BP-002",
    category: "internet",
    description: "Safaricom Home Fibre",
    amount: 4_999,
    date: "2026-03-28",
    status: "completed" as const,
  },
  {
    id: "BP-003",
    category: "tv",
    description: "DStv Premium - April",
    amount: 10_500,
    date: "2026-03-25",
    status: "completed" as const,
  },
  {
    id: "BP-004",
    category: "water",
    description: "Nairobi Water - Q1 2026",
    amount: 3_200,
    date: "2026-03-20",
    status: "completed" as const,
  },
];

/* ── Main Page ──────────────────────────────────────────────────────── */

export default function BillPaymentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [sourceAccount, setSourceAccount] = useState(accounts[0].id);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const category = categories.find((c) => c.id === selectedCategory);
  const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const canPay = accountNumber.length >= 5 && parsedAmount >= 10;

  const handleCategoryClick = (catId: string) => {
    if (catId === "more") return;
    setSelectedCategory(catId);
    setAccountNumber("");
    setAmount("");
    setPaymentSuccess(false);
  };

  const handleQuickPay = (biller: (typeof savedBillers)[0]) => {
    setSelectedCategory(biller.category);
    setAccountNumber(biller.accountNumber);
    setAmount(biller.lastAmount.toString());
  };

  const handlePay = () => {
    setPaymentSuccess(true);
  };

  const handleClosePayment = () => {
    setSelectedCategory(null);
    setAccountNumber("");
    setAmount("");
    setPaymentSuccess(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Pay Bills</h1>
          <p className="text-sm text-muted-foreground">
            Electricity, water, internet, and more
          </p>
        </div>
      </div>

      {/* Category grid */}
      <div>
        <Label className="text-sm text-muted-foreground mb-3 block">
          Select Category
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:shadow-sm",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    cat.color
                  )}
                >
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment form dialog */}
      <Dialog
        open={selectedCategory !== null && selectedCategory !== "more"}
        onOpenChange={(open) => {
          if (!open) handleClosePayment();
        }}
      >
        <DialogContent className="sm:max-w-md">
          {paymentSuccess ? (
            /* ── Success state ─────────────────────────────────────── */
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground text-center">
                {formatKES(parsedAmount)} paid to {category?.provider}
              </p>
              {selectedCategory === "electricity" && (
                <Card className="w-full bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Electricity Token
                    </p>
                    <p className="font-mono text-sm font-bold tracking-wider">
                      4521-8876-3345-2290-1187
                    </p>
                  </CardContent>
                </Card>
              )}
              <Button className="w-full mt-2" onClick={handleClosePayment}>
                Done
              </Button>
            </div>
          ) : (
            /* ── Payment form ──────────────────────────────────────── */
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {category && (
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        category.color
                      )}
                    >
                      <category.icon className="h-4 w-4" />
                    </div>
                  )}
                  {category?.label} - {category?.provider}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{category?.placeholder || "Account Number"}</Label>
                  <Input
                    placeholder={`Enter ${category?.placeholder?.toLowerCase() || "account number"}`}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount (KES)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      KES
                    </span>
                    <Input
                      type="text"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                      }
                      className="pl-14 text-lg font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pay From</Label>
                  <Select
                    value={sourceAccount}
                    onValueChange={(val) => setSourceAccount(val ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter((a) => a.currency === "KES")
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{a.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {formatKES(a.availableBalance)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleClosePayment}
                >
                  Cancel
                </Button>
                <Button disabled={!canPay} onClick={handlePay}>
                  Pay {parsedAmount > 0 ? formatKES(parsedAmount) : ""}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Saved billers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-gold" />
            Saved Billers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedBillers.map((biller) => {
              const cat = categories.find((c) => c.id === biller.category);
              if (!cat) return null;

              return (
                <button
                  key={biller.id}
                  onClick={() => handleQuickPay(biller)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                      cat.color
                    )}
                  >
                    <cat.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {biller.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {biller.accountNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatKES(biller.lastAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Quick Pay</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent bill payments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Recent Bill Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBills.map((bill) => {
              const cat = categories.find((c) => c.id === bill.category);
              if (!cat) return null;

              return (
                <div key={bill.id} className="flex items-center gap-3 py-2">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      cat.color
                    )}
                  >
                    <cat.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {bill.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(bill.date).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {bill.token && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Token
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold">
                      {formatKES(bill.amount)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="block text-[10px] mt-0.5 bg-success/10 text-success"
                    >
                      Paid
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
