import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { merchantProfile, merchantTransactions } from "@/data/mock";
import {
  Store,
  TrendingUp,
  DollarSign,
  Monitor,
  Clock,
  CreditCard,
  QrCode,
  History,
  Smartphone,
  Wifi,
  ArrowUpRight,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const hourlyRevenue = [
  { hour: "9AM", revenue: 2800 },
  { hour: "10AM", revenue: 4500 },
  { hour: "11AM", revenue: 6200 },
  { hour: "12PM", revenue: 8100 },
  { hour: "1PM", revenue: 5400 },
  { hour: "2PM", revenue: 4200 },
  { hour: "3PM", revenue: 2100 },
  { hour: "4PM", revenue: 850 },
  { hour: "5PM", revenue: 350 },
];

const methodIcons: Record<string, React.ReactNode> = {
  "NFC Tap": <Wifi className="h-4 w-4" />,
  "QR Code": <QrCode className="h-4 w-4" />,
  "Card Chip": <CreditCard className="h-4 w-4" />,
  "M-Pesa": <Smartphone className="h-4 w-4" />,
};

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export default function MerchantDashboard() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{merchantProfile.businessName}</h1>
              <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {merchantProfile.category} &middot; {merchantProfile.location}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit">
          MDR: {merchantProfile.mdr}% &middot; Settlement: Instant
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Today's Revenue</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatKES(merchantProfile.todayRevenue)}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3 w-3" />
              +12% vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Total Revenue</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatKES(merchantProfile.totalRevenue)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span className="text-xs font-medium">Active Terminals</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{merchantProfile.terminals}</p>
            <p className="mt-0.5 text-xs text-emerald-600">All online</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Settlement Status</span>
            </div>
            <p className="mt-1 text-lg font-bold text-emerald-600">Settled</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Last: Today 2:00 PM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Revenue</CardTitle>
            <CardDescription>Hourly breakdown (9 AM - 5 PM)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="hour"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatKES(Number(value)), "Revenue"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button
              className="h-auto flex-col gap-2 py-4"
              onClick={() => setPaymentOpen(true)}
            >
              <Banknote className="h-5 w-5" />
              <span className="text-xs">Accept Payment</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => setQrOpen(true)}
            >
              <QrCode className="h-5 w-5" />
              <span className="text-xs">View QR Code</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <History className="h-5 w-5" />
              <span className="text-xs">Settlements</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Monitor className="h-5 w-5" />
              <span className="text-xs">Terminals</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Transactions</CardTitle>
          <CardDescription>
            {merchantTransactions.length} transactions today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {merchantTransactions.map((txn, i) => (
              <div key={txn.id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        txn.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-500/10 text-amber-600"
                      )}
                    >
                      {methodIcons[txn.method] || (
                        <CreditCard className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.customer}</p>
                      <p className="text-xs text-muted-foreground">
                        {txn.method} &middot; {txn.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatKES(txn.amount)}</p>
                    <Badge
                      variant={
                        txn.status === "completed" ? "default" : "secondary"
                      }
                      className={cn(
                        "text-[10px]",
                        txn.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      )}
                    >
                      {txn.status}
                    </Badge>
                  </div>
                </div>
                {i < merchantTransactions.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accept Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Payment</DialogTitle>
            <DialogDescription>
              Enter amount to receive from customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Amount (KES)</label>
              <Input
                type="number"
                placeholder="0.00"
                className="mt-1 text-2xl font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button className="gap-2">
                <QrCode className="h-4 w-4" />
                Generate QR
              </Button>
              <Button variant="outline" className="gap-2">
                <Wifi className="h-4 w-4" />
                NFC / Tap
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your QR Code</DialogTitle>
            <DialogDescription>
              Customers can scan this to pay {merchantProfile.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50">
              <QrCode className="h-24 w-24 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Merchant ID: {merchantProfile.id}
            </p>
            <Button variant="outline" className="gap-2">
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
