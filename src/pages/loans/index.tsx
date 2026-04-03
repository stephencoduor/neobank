import {
  Wallet,
  CalendarClock,
  TrendingUp,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const summaryCards = [
  {
    title: "Active Loans",
    value: "2",
    icon: CreditCard,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Total Borrowed",
    value: fmtKES(450_000),
    icon: Wallet,
    color: "bg-gold/10 text-gold",
  },
  {
    title: "Monthly Repayment",
    value: fmtKES(23_500),
    icon: TrendingUp,
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    title: "Next Due Date",
    value: "15 Apr 2026",
    icon: CalendarClock,
    color: "bg-chart-3/10 text-chart-3",
  },
];

interface Loan {
  id: string;
  name: string;
  type: string;
  principal: number;
  term: number;
  rate: number;
  paymentsMade: number;
  monthlyPayment: number;
  status: "active" | "completed";
  disbursedDate: string;
  completedDate?: string;
}

const activeLoans: Loan[] = [
  {
    id: "LN-2025-0041",
    name: "Personal Loan",
    type: "Personal",
    principal: 300_000,
    term: 18,
    rate: 14,
    paymentsMade: 8,
    monthlyPayment: 19_200,
    status: "active",
    disbursedDate: "10 Aug 2025",
  },
  {
    id: "LN-2025-0087",
    name: "Business Loan",
    type: "Business",
    principal: 150_000,
    term: 12,
    rate: 12,
    paymentsMade: 3,
    monthlyPayment: 4_300,
    status: "active",
    disbursedDate: "05 Jan 2026",
  },
];

const completedLoans: Loan[] = [
  {
    id: "LN-2024-0012",
    name: "Emergency Loan",
    type: "Emergency",
    principal: 50_000,
    term: 6,
    rate: 16,
    paymentsMade: 6,
    monthlyPayment: 9_200,
    status: "completed",
    disbursedDate: "15 Jan 2024",
    completedDate: "15 Jul 2024",
  },
  {
    id: "LN-2024-0035",
    name: "Education Loan",
    type: "Education",
    principal: 120_000,
    term: 12,
    rate: 10,
    paymentsMade: 12,
    monthlyPayment: 11_000,
    status: "completed",
    disbursedDate: "01 Mar 2024",
    completedDate: "01 Mar 2025",
  },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function LoanDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Loans</h1>
          <p className="text-sm text-muted-foreground">
            Manage your loans and track repayment progress
          </p>
        </div>
        <Button className="bg-gold text-gold-foreground hover:bg-gold/90" size="lg">
          <CreditCard className="mr-1.5 h-4 w-4" />
          Apply for Loan
        </Button>
      </div>

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
                <p className="font-heading text-lg font-semibold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Loans */}
      <div>
        <h2 className="font-heading mb-3 text-lg font-medium">Active Loans</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {activeLoans.map((loan) => {
            const progressPct = Math.round(
              (loan.paymentsMade / loan.term) * 100
            );
            const totalRepaid = loan.paymentsMade * loan.monthlyPayment;
            const totalOwed = loan.term * loan.monthlyPayment;

            return (
              <Card key={loan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{loan.name}</CardTitle>
                      <CardDescription>{loan.id}</CardDescription>
                    </div>
                    <Badge variant="secondary">{loan.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Loan details grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal</p>
                      <p className="font-medium">{fmtKES(loan.principal)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{loan.rate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-medium">{loan.term} months</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Payment</p>
                      <p className="font-medium">{fmtKES(loan.monthlyPayment)}</p>
                    </div>
                  </div>

                  {/* Repayment progress */}
                  <div>
                    <Progress value={progressPct}>
                      <ProgressLabel>
                        Repayment: {loan.paymentsMade}/{loan.term} payments
                      </ProgressLabel>
                      <ProgressValue>
                        {fmtKES(totalRepaid)} / {fmtKES(totalOwed)}
                      </ProgressValue>
                    </Progress>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                      Disbursed: {loan.disbursedDate}
                    </p>
                    <Button variant="ghost" size="sm">
                      View Schedule
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Loan History */}
      <div>
        <h2 className="font-heading mb-3 text-lg font-medium">Loan History</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {completedLoans.map((loan) => (
            <Card key={loan.id} className="opacity-80">
              <CardContent className="flex items-center gap-4 pt-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{loan.name}</p>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {fmtKES(loan.principal)} &middot; {loan.term} months @ {loan.rate}%
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {loan.disbursedDate} &mdash; {loan.completedDate}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
