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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bluetooth,
  Smartphone,
  Plus,
  Battery,
  BatteryMedium,
  Wifi,
  WifiOff,
  Settings,
  Clock,
  CreditCard,
  QrCode,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/hooks/use-api";
import { fineract } from "@/services/fineract-service";

interface Terminal {
  id: string;
  name: string;
  type: "bluetooth" | "softpos";
  status: "online" | "offline";
  lastTransaction: string;
  batteryLevel: number;
  model: string;
  transactions: {
    id: string;
    amount: number;
    method: string;
    time: string;
    status: "completed" | "failed";
  }[];
}

const terminals: Terminal[] = [
  {
    id: "TRM-001",
    name: "Counter POS",
    type: "bluetooth",
    status: "online",
    lastTransaction: "2 min ago",
    batteryLevel: 85,
    model: "Ingenico Move 5000",
    transactions: [
      { id: "TT-001", amount: 850, method: "NFC Tap", time: "14:32", status: "completed" },
      { id: "TT-002", amount: 1200, method: "Card Chip", time: "14:15", status: "completed" },
      { id: "TT-003", amount: 3450, method: "NFC Tap", time: "13:50", status: "completed" },
      { id: "TT-004", amount: 500, method: "Card Chip", time: "13:20", status: "completed" },
    ],
  },
  {
    id: "TRM-002",
    name: "Delivery SoftPOS",
    type: "softpos",
    status: "online",
    lastTransaction: "15 min ago",
    batteryLevel: 62,
    model: "Samsung Galaxy A54 (SoftPOS)",
    transactions: [
      { id: "TT-005", amount: 2100, method: "NFC Tap", time: "14:17", status: "completed" },
      { id: "TT-006", amount: 780, method: "QR Code", time: "13:45", status: "completed" },
      { id: "TT-007", amount: 1500, method: "NFC Tap", time: "12:30", status: "failed" },
    ],
  },
  {
    id: "TRM-003",
    name: "Kiosk POS",
    type: "bluetooth",
    status: "offline",
    lastTransaction: "3 hours ago",
    batteryLevel: 12,
    model: "PAX A920",
    transactions: [
      { id: "TT-008", amount: 650, method: "Card Chip", time: "11:20", status: "completed" },
    ],
  },
];

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function BatteryIcon({ level }: { level: number }) {
  if (level > 50) return <Battery className="h-4 w-4 text-emerald-600" />;
  if (level > 20) return <BatteryMedium className="h-4 w-4 text-amber-500" />;
  return <BatteryMedium className="h-4 w-4 text-red-500" />;
}

export default function PosManagement() {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [settingsTerminal, setSettingsTerminal] = useState<Terminal | null>(null);

  // Fineract live status
  const { data: fData, error: fErr } = useApiQuery(
    () => fineract.getSavingsAccounts(1),
    [],
  );
  const isFineractLive = !!fData && !fErr;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">POS Terminal Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your payment terminals and SoftPOS devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFineractLive ? (
            <Badge className="gap-1 text-[10px] text-emerald-600 bg-emerald-500/10">
              <Wifi className="h-3 w-3" /> Live
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
              <WifiOff className="h-3 w-3" /> Demo
            </Badge>
          )}
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Terminal
        </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-1">
            <p className="text-xs text-muted-foreground">Total Terminals</p>
            <p className="text-2xl font-bold">{terminals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <p className="text-xs text-muted-foreground">Online</p>
            <p className="text-2xl font-bold text-emerald-600">
              {terminals.filter((t) => t.status === "online").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <p className="text-xs text-muted-foreground">Offline</p>
            <p className="text-2xl font-bold text-red-500">
              {terminals.filter((t) => t.status === "offline").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Terminal Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {terminals.map((terminal) => (
          <Card
            key={terminal.id}
            className={cn(
              "cursor-pointer transition-shadow hover:shadow-md",
              terminal.status === "offline" && "opacity-75"
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      terminal.type === "bluetooth"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-purple-500/10 text-purple-600"
                    )}
                  >
                    {terminal.type === "bluetooth" ? (
                      <Bluetooth className="h-5 w-5" />
                    ) : (
                      <Smartphone className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{terminal.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {terminal.id}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "text-[10px]",
                    terminal.status === "online"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-500"
                  )}
                >
                  <span
                    className={cn(
                      "mr-1 inline-block h-1.5 w-1.5 rounded-full",
                      terminal.status === "online"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    )}
                  />
                  {terminal.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                {terminal.type === "bluetooth" ? "Bluetooth POS" : "SoftPOS"} &middot;{" "}
                {terminal.model}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last txn: {terminal.lastTransaction}
                </div>
                <div className="flex items-center gap-1">
                  <BatteryIcon level={terminal.batteryLevel} />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      terminal.batteryLevel > 50
                        ? "text-emerald-600"
                        : terminal.batteryLevel > 20
                        ? "text-amber-500"
                        : "text-red-500"
                    )}
                  >
                    {terminal.batteryLevel}%
                  </span>
                </div>
              </div>

              <Progress
                value={terminal.batteryLevel}
                className="h-1.5"
              />

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs"
                  onClick={() => setSelectedTerminal(terminal)}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs"
                  onClick={() => setSettingsTerminal(terminal)}
                >
                  <Settings className="h-3 w-3" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Terminal Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Terminal</DialogTitle>
            <DialogDescription>
              Pair a Bluetooth POS device or activate SoftPOS on a phone
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="bluetooth" className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bluetooth" className="gap-2">
                <Bluetooth className="h-4 w-4" />
                Bluetooth POS
              </TabsTrigger>
              <TabsTrigger value="softpos" className="gap-2">
                <Smartphone className="h-4 w-4" />
                SoftPOS
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bluetooth" className="space-y-4 pt-4">
              <div>
                <Label>Terminal Name</Label>
                <Input placeholder="e.g., Counter POS" className="mt-1" />
              </div>
              <div>
                <Label>Device Serial Number</Label>
                <Input placeholder="Enter serial number" className="mt-1" />
              </div>
              <Button className="w-full gap-2">
                <Bluetooth className="h-4 w-4" />
                Scan & Pair Device
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Make sure Bluetooth is enabled on the POS terminal
              </p>
            </TabsContent>
            <TabsContent value="softpos" className="space-y-4 pt-4">
              <div>
                <Label>Device Name</Label>
                <Input placeholder="e.g., Delivery Phone" className="mt-1" />
              </div>
              <div>
                <Label>Phone Model</Label>
                <Input placeholder="e.g., Samsung Galaxy A54" className="mt-1" />
              </div>
              <Button className="w-full gap-2">
                <Smartphone className="h-4 w-4" />
                Generate Activation Code
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                An activation code will be sent to the device via SMS
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog
        open={!!selectedTerminal}
        onOpenChange={() => setSelectedTerminal(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTerminal?.name} - Transactions
            </DialogTitle>
            <DialogDescription>
              {selectedTerminal?.id} &middot; Today's history
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 pt-2">
            {selectedTerminal?.transactions.map((txn, i) => (
              <div key={txn.id}>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        txn.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : "bg-red-500/10 text-red-500"
                      )}
                    >
                      {txn.method === "NFC Tap" ? (
                        <Wifi className="h-3.5 w-3.5" />
                      ) : txn.method === "QR Code" ? (
                        <QrCode className="h-3.5 w-3.5" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.method}</p>
                      <p className="text-xs text-muted-foreground">{txn.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatKES(txn.amount)}</p>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        txn.status === "completed"
                          ? "text-emerald-600"
                          : "text-red-500"
                      )}
                    >
                      {txn.status}
                    </span>
                  </div>
                </div>
                {i < (selectedTerminal?.transactions.length ?? 0) - 1 && (
                  <Separator />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Terminal Settings Dialog */}
      <Dialog
        open={!!settingsTerminal}
        onOpenChange={() => setSettingsTerminal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{settingsTerminal?.name} Settings</DialogTitle>
            <DialogDescription>{settingsTerminal?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Terminal Name</Label>
              <Input
                defaultValue={settingsTerminal?.name}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Accept NFC Payments</p>
                <p className="text-xs text-muted-foreground">
                  Contactless tap to pay
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Accept QR Payments</p>
                <p className="text-xs text-muted-foreground">
                  QR code scanning
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Receipt Printing</p>
                <p className="text-xs text-muted-foreground">
                  Auto-print receipts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button className="flex-1">Save Changes</Button>
              <Button variant="destructive" className="gap-1">
                <WifiOff className="h-4 w-4" />
                Unpair
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
