import React, { useState } from "react";
import {
  ArrowLeft,
  QrCode,
  Camera,
  Share2,
  Download,
  Smartphone,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accounts, currentUser } from "@/data/mock";
import { cn } from "@/lib/utils";

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── QR Code Placeholder SVG ────────────────────────────────────────── */

function QRCodePlaceholder({ size = 200 }: { size?: number }) {
  // Generates a grid pattern that looks like a QR code
  const cells = 21;
  const cellSize = size / cells;
  const rects: React.JSX.Element[] = [];

  // Fixed pattern corners (QR finder patterns)
  const finderPositions = [
    [0, 0],
    [0, 14],
    [14, 0],
  ];

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      // Finder patterns (7x7 squares in corners)
      const inFinder = finderPositions.some(
        ([fr, fc]) => row >= fr && row < fr + 7 && col >= fc && col < fc + 7
      );

      let filled = false;

      if (inFinder) {
        const r = Math.min(row, row >= 14 ? row - 14 : row);
        const c = Math.min(col, col >= 14 ? col - 14 : col);
        const lr = r % 7;
        const lc = c % 7;
        filled =
          lr === 0 ||
          lr === 6 ||
          lc === 0 ||
          lc === 6 ||
          (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        // Pseudo-random data pattern based on position
        filled = ((row * 7 + col * 13 + row * col) % 3) === 0;
      }

      if (filled) {
        rects.push(
          <rect
            key={`${row}-${col}`}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize}
            height={cellSize}
            fill="currentColor"
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="text-foreground"
      style={{ width: size, height: size }}
    >
      {rects}
    </svg>
  );
}

/* ── Camera Viewfinder ──────────────────────────────────────────────── */

function CameraViewfinder() {
  return (
    <div className="relative bg-black/95 rounded-2xl aspect-square max-w-[320px] mx-auto flex items-center justify-center overflow-hidden">
      {/* Animated scan line */}
      <div className="absolute inset-x-12 h-0.5 bg-primary/80 animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_12px_2px] shadow-primary/40" />

      {/* Corner brackets */}
      <div className="absolute inset-8">
        {/* Top-left */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-sm" />
        {/* Top-right */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-sm" />
        {/* Bottom-left */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-sm" />
        {/* Bottom-right */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-sm" />
      </div>

      {/* Center icon + text */}
      <div className="text-center z-10">
        <Camera className="h-10 w-10 text-white/40 mx-auto mb-3" />
        <p className="text-white/60 text-sm font-medium">
          Point camera at QR code
        </p>
        <p className="text-white/40 text-xs mt-1">
          Align the QR code within the frame
        </p>
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
}

/* ── Recent QR Transactions ─────────────────────────────────────────── */

const qrTransactions = [
  {
    id: "QR-001",
    description: "Payment to Mama Njeri's Kitchen",
    amount: 850,
    type: "debit" as const,
    date: "2026-04-02T14:32:00",
    method: "QR Scan",
  },
  {
    id: "QR-002",
    description: "Received from James Ochieng",
    amount: 2_000,
    type: "credit" as const,
    date: "2026-03-30T11:15:00",
    method: "My QR",
  },
  {
    id: "QR-003",
    description: "Payment to Quickmart - Lavington",
    amount: 4_350,
    type: "debit" as const,
    date: "2026-03-28T16:40:00",
    method: "QR Scan",
  },
];

/* ── Main Page ──────────────────────────────────────────────────────── */

export default function QRPaymentsPage() {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0].id);
  const [qrAmount, setQrAmount] = useState("");


  return (
    <div className="space-y-6 p-4 md:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">QR Payments</h1>
          <p className="text-sm text-muted-foreground">
            Scan or share QR codes to pay
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan" className="gap-2">
            <Camera className="h-4 w-4" />
            Scan QR
          </TabsTrigger>
          <TabsTrigger value="my-qr" className="gap-2">
            <QrCode className="h-4 w-4" />
            My QR Code
          </TabsTrigger>
        </TabsList>

        {/* ── Scan Tab ────────────────────────────────────────────── */}
        <TabsContent value="scan" className="space-y-4 mt-4">
          <CameraViewfinder />
          <div className="text-center space-y-2">
            <Button className="gap-2">
              <Camera className="h-4 w-4" />
              Open Camera
            </Button>
            <p className="text-xs text-muted-foreground">
              Or upload a QR code image from your gallery
            </p>
            <Button variant="outline" size="sm">
              Upload Image
            </Button>
          </div>
        </TabsContent>

        {/* ── My QR Tab ───────────────────────────────────────────── */}
        <TabsContent value="my-qr" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              {/* User info */}
              <p className="text-lg font-semibold mb-1">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {currentUser.phone}
              </p>

              {/* QR code */}
              <div className="p-4 bg-white rounded-xl border shadow-sm">
                <QRCodePlaceholder size={200} />
              </div>

              {/* Amount (optional) */}
              {qrAmount && (
                <p className="mt-3 text-lg font-bold text-primary">
                  {formatKES(parseFloat(qrAmount) || 0)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account selector */}
          <div className="space-y-2">
            <Label>Receive To</Label>
            <Select value={selectedAccount} onValueChange={(val) => setSelectedAccount(val ?? "")}>
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
                          {formatKES(a.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fixed amount */}
          <div className="space-y-2">
            <Label>
              Fixed Amount{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                KES
              </span>
              <Input
                type="text"
                placeholder="Leave empty for any amount"
                value={qrAmount}
                onChange={(e) =>
                  setQrAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                className="pl-14"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set a specific amount for this QR code
            </p>
          </div>

          {/* Share / Download buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share QR
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent QR transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent QR Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qrTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center gap-3 py-2">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    txn.type === "credit"
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {txn.method === "QR Scan" ? (
                    <ShoppingCart className="h-4 w-4" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {txn.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(txn.date)} &middot; {txn.method}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold whitespace-nowrap",
                    txn.type === "credit" ? "text-success" : "text-foreground"
                  )}
                >
                  {txn.type === "credit" ? "+" : "-"}
                  {formatKES(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
