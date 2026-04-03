import { useState } from "react";
import {
  Download,
  CreditCard,
  CalendarClock,
  Banknote,
  TrendingDown,
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ── Mock Data ────────────────────────────────────────────────────────────────
interface LoanOption {
  id: string;
  label: string;
  principal: number;
  rate: number;
  term: number;
  startDate: string;
  monthlyPayment: number;
}

const loans: LoanOption[] = [
  {
    id: "LN-2025-0041",
    label: "Personal Loan — KES 300,000",
    principal: 300_000,
    rate: 14,
    term: 18,
    startDate: "2025-08-15",
    monthlyPayment: 19_200,
  },
  {
    id: "LN-2025-0087",
    label: "Business Loan — KES 150,000",
    principal: 150_000,
    rate: 12,
    term: 12,
    startDate: "2026-01-15",
    monthlyPayment: 14_300,
  },
];

type PaymentStatus = "paid" | "upcoming" | "overdue";

interface ScheduleRow {
  number: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  balance: number;
  status: PaymentStatus;
}

function generateSchedule(loan: LoanOption): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  const monthlyRate = loan.rate / 100 / 12;
  let balance = loan.principal;
  const start = new Date(loan.startDate);

  for (let i = 1; i <= loan.term; i++) {
    const interest = Math.round(balance * monthlyRate);
    const principal = loan.monthlyPayment - interest;
    balance = Math.max(0, balance - principal);

    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);

    // Determine status: first 8 are paid, #9 is overdue, rest upcoming
    // (for the personal loan; for business loan first 3 paid, #4 upcoming)
    let status: PaymentStatus;
    if (loan.id === "LN-2025-0041") {
      if (i <= 8) status = "paid";
      else if (i === 9) status = "overdue";
      else status = "upcoming";
    } else {
      if (i <= 3) status = "paid";
      else status = "upcoming";
    }

    rows.push({
      number: i,
      dueDate: dueDate.toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      principal: Math.abs(principal),
      interest,
      total: loan.monthlyPayment,
      balance: Math.max(0, balance),
      status,
    });
  }

  return rows;
}

const statusStyles: Record<PaymentStatus, string> = {
  paid: "bg-primary/10 text-primary",
  upcoming: "bg-secondary text-secondary-foreground",
  overdue: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<PaymentStatus, string> = {
  paid: "Paid",
  upcoming: "Upcoming",
  overdue: "Overdue",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function RepaymentSchedulePage() {
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0].id);
  const selectedLoan = loans.find((l) => l.id === selectedLoanId) ?? loans[0];
  const schedule = generateSchedule(selectedLoan);

  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
  const totalRepayment = selectedLoan.monthlyPayment * selectedLoan.term;
  const paidRows = schedule.filter((r) => r.status === "paid");
  const totalPaid = paidRows.length * selectedLoan.monthlyPayment;
  const remaining = totalRepayment - totalPaid;

  const nextDue = schedule.find(
    (r) => r.status === "upcoming" || r.status === "overdue"
  );

  const summaryCards = [
    {
      title: "Principal",
      value: fmtKES(selectedLoan.principal),
      icon: Banknote,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Total Interest",
      value: fmtKES(totalInterest),
      icon: TrendingDown,
      color: "bg-gold/10 text-gold",
    },
    {
      title: "Total Repayment",
      value: fmtKES(totalRepayment),
      icon: CreditCard,
      color: "bg-chart-1/10 text-chart-1",
    },
    {
      title: "Remaining Balance",
      value: fmtKES(remaining),
      icon: CalendarClock,
      color: "bg-chart-3/10 text-chart-3",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Repayment Schedule
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your loan repayment timeline
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Export Schedule
        </Button>
      </div>

      {/* Loan selector */}
      <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
        <SelectTrigger className="w-full sm:w-[360px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {loans.map((loan) => (
            <SelectItem key={loan.id} value={loan.id}>
              {loan.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} size="sm">
            <CardContent className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.color}`}
              >
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="font-heading text-lg font-semibold">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Make payment CTA for overdue/next */}
      {nextDue && (
        <Card
          className={
            nextDue.status === "overdue"
              ? "border-destructive/40 bg-destructive/5"
              : ""
          }
        >
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {nextDue.status === "overdue"
                  ? "Overdue Payment"
                  : "Next Payment Due"}
              </p>
              <p className="font-heading text-lg font-semibold">
                {fmtKES(nextDue.total)} &mdash; {nextDue.dueDate}
              </p>
              {nextDue.status === "overdue" && (
                <p className="mt-1 text-xs text-destructive">
                  This payment is past due. Please make payment to avoid
                  penalties.
                </p>
              )}
            </div>
            <Button
              className={
                nextDue.status === "overdue"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-gold text-gold-foreground hover:bg-gold/90"
              }
              size="lg"
            >
              <CreditCard className="mr-1.5 h-4 w-4" />
              Make Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Schedule &mdash; {selectedLoan.id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row) => (
                <TableRow
                  key={row.number}
                  className={
                    row.status === "overdue"
                      ? "bg-destructive/5"
                      : row.status === "paid"
                        ? "text-muted-foreground"
                        : ""
                  }
                >
                  <TableCell className="font-medium">{row.number}</TableCell>
                  <TableCell>{row.dueDate}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtKES(row.principal)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtKES(row.interest)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {fmtKES(row.total)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtKES(row.balance)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusStyles[row.status]}>
                      {statusLabels[row.status]}
                    </Badge>
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
