import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Snowflake,
  Lock,
  SlidersHorizontal,
  List,
  AlertTriangle,
  Ban,
  Eye,
  EyeOff,
  Copy,
  Check,
  Wifi,
  Globe,
  Smartphone,
  CreditCard,
  Building2,
  ShoppingCart,
  Car,
  Coffee,
  Loader2,
  Fuel,
  Tv,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useCard,
  useCardTransactions,
  useToggleFreeze,
  useUpdateCardLimits,
  useRequestPinReset,
} from "@/hooks";
import { useApiQuery } from "@/hooks/use-api";
import { fineract } from "@/services/fineract-service";
import { WifiOff as WifiOffIcon } from "lucide-react";

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const categoryIconMap: Record<string, typeof CreditCard> = {
  GROCERIES: ShoppingCart,
  FOOD_DRINK: Coffee,
  TRANSPORT: Car,
  ENTERTAINMENT: Tv,
  FUEL: Fuel,
  SHOPPING: ShoppingBag,
  UTILITIES: Zap,
};

/* ── Visual Card ────────────────────────────────────────────────────── */

interface ApiCard {
  cardId: string;
  type: string;
  network: string;
  last4: string;
  cardholderName: string;
  expiryDate: string;
  status: string;
  frozen: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  todaySpend: number;
  monthSpend: number;
}

interface CardTxn {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
}

function LargeVisualCard({ card }: { card: ApiCard }) {
  const isVirtual = card.type === "VIRTUAL";

  return (
    <div
      className={cn(
        "relative w-full max-w-[420px] mx-auto aspect-[1.586/1] rounded-2xl p-6 md:p-8 overflow-hidden",
        isVirtual
          ? "bg-gradient-to-br from-[#1a3a2a] via-[#1f5c3a] to-[#0d2818] text-white"
          : "bg-gradient-to-br from-[#d4a532] via-[#f0c75e] to-[#b8922a] text-[#2a1f0a]"
      )}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[70%] rounded-full bg-white/10 blur-3xl" />
      </div>
      <Wifi className="absolute top-6 right-6 h-5 w-5 opacity-60 rotate-90" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <svg viewBox="0 0 50 40" className="h-10 w-12">
            <rect x="2" y="2" width="46" height="36" rx="5" ry="5" fill="currentColor" opacity="0.7" />
            <line x1="2" y1="14" x2="48" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="2" y1="26" x2="48" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="18" y1="2" x2="18" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="32" y1="2" x2="32" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
          <Badge
            variant="outline"
            className={cn(
              "text-xs border-current/30",
              isVirtual ? "text-white/80" : "text-[#2a1f0a]/80"
            )}
          >
            {isVirtual ? "Virtual" : "Physical"}
          </Badge>
        </div>

        <div className="font-mono text-xl tracking-[0.22em] mt-auto mb-3">
          **** **** **** {card.last4}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-60 mb-0.5">CARD HOLDER</p>
            <p className="text-sm font-semibold tracking-wide uppercase">
              {card.cardholderName}
            </p>
            <p className="text-xs mt-1 opacity-60">VALID THRU {card.expiryDate}</p>
          </div>
          <span className="text-xl font-bold opacity-80">{card.network}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */

export default function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { data: cardData } = useCard(cardId ?? "CARD-V-001");
  const { data: txnData } = useCardTransactions(cardId ?? "CARD-V-001");
  const freezeMutation = useToggleFreeze();
  const limitsMutation = useUpdateCardLimits();
  const pinResetMutation = useRequestPinReset();

  // Fineract live status
  const { data: fClient, error: fErr } = useApiQuery(
    () => fineract.getClient(1),
    [],
  );
  const isFineractLive = !!fClient && !fErr;

  const card = cardData as ApiCard;
  const cardTxns = (Array.isArray(txnData) ? txnData : []) as CardTxn[];

  const [frozen, setFrozen] = useState(card?.frozen ?? false);
  const [showCVV, setShowCVV] = useState(false);
  const [copied, setCopied] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [pinResetSent, setPinResetSent] = useState(false);
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [internationalPayments, setInternationalPayments] = useState(false);
  const [contactless, setContactless] = useState(true);
  const [atmWithdrawals, setAtmWithdrawals] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(String(card?.dailyLimit ?? 100000));
  const [monthlyLimit, setMonthlyLimit] = useState(String(card?.monthlyLimit ?? 500000));

  const spentPct = card?.monthlyLimit
    ? Math.round((card.monthSpend / card.monthlyLimit) * 100)
    : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(`**** **** **** ${card?.last4 ?? ""}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFreeze = () => {
    freezeMutation.mutate({ cardId: card.cardId, freeze: !frozen });
    setFrozen(!frozen);
  };

  const handleSaveLimits = () => {
    limitsMutation.mutate({
      cardId: card.cardId,
      dailyLimit: parseInt(dailyLimit),
      monthlyLimit: parseInt(monthlyLimit),
    });
    setLimitsOpen(false);
  };

  const handlePinReset = () => {
    pinResetMutation.mutate({ cardId: card.cardId }, {
      onSuccess: () => setPinResetSent(true),
    });
  };

  if (!card) return null;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cards")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {card.network} {card.type === "VIRTUAL" ? "Virtual" : "Physical"} Card
          </h1>
          <p className="text-sm text-muted-foreground">
            Ending in {card.last4}
          </p>
        </div>
        {isFineractLive ? (
          <Badge className="ml-auto gap-1 text-[10px] text-emerald-600 bg-emerald-500/10">
            <Wifi className="h-3 w-3" /> Live
          </Badge>
        ) : (
          <Badge variant="outline" className="ml-auto gap-1 text-[10px] text-muted-foreground">
            <WifiOffIcon className="h-3 w-3" /> Demo
          </Badge>
        )}
      </div>

      {/* Large card visual */}
      <div className={cn("relative", frozen && "opacity-60")}>
        <LargeVisualCard card={card} />
        {frozen && (
          <div className="absolute inset-0 rounded-2xl bg-background/40 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground font-semibold text-lg">
              <Snowflake className="h-7 w-7" />
              Card Frozen
            </div>
          </div>
        )}
      </div>

      {/* Card info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Card Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Card Number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                **** **** **** {card.last4}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expiry Date</span>
            <span className="text-sm font-medium">{card.expiryDate}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">CVV</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {showCVV ? "847" : "***"}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCVV(!showCVV)}>
                {showCVV ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant={frozen ? "secondary" : "default"}
              className={cn(!frozen && "bg-success text-success-foreground")}
            >
              {frozen ? "Frozen" : "Active"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily Limit</span>
            <span className="text-sm font-medium">{formatKES(card.dailyLimit)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Today's Spend</span>
            <span className="text-sm font-medium">{formatKES(card.todaySpend)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Spending this month */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Spending This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatKES(card.monthSpend)} spent
            </span>
            <span className="font-medium">
              {formatKES(card.monthlyLimit)} limit
            </span>
          </div>
          <Progress value={spentPct} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {formatKES(card.monthlyLimit - card.monthSpend)} remaining ({100 - spentPct}%)
          </p>
        </CardContent>
      </Card>

      {/* Action grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Snowflake,
            label: frozen ? "Unfreeze" : "Freeze",
            onClick: handleToggleFreeze,
            active: frozen,
          },
          {
            icon: Lock,
            label: "Change PIN",
            onClick: handlePinReset,
          },
          {
            icon: SlidersHorizontal,
            label: "Set Limits",
            onClick: () => setLimitsOpen(true),
          },
          {
            icon: List,
            label: "Transactions",
            onClick: () => {},
          },
          {
            icon: AlertTriangle,
            label: "Report Lost",
            onClick: () => {},
            warning: true,
          },
          {
            icon: Ban,
            label: "Block Card",
            onClick: () => {},
            danger: true,
          },
        ].map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className={cn(
              "flex-col h-auto py-4 gap-2 text-xs font-medium",
              (action as { active?: boolean }).active &&
                "border-blue-400 text-blue-600 bg-blue-50",
              (action as { warning?: boolean }).warning &&
                "hover:border-warning hover:text-warning",
              (action as { danger?: boolean }).danger &&
                "hover:border-destructive hover:text-destructive"
            )}
            onClick={action.onClick}
          >
            <action.icon className="h-5 w-5" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* PIN Reset confirmation */}
      {pinResetSent && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-4">
            <p className="text-sm text-success font-medium">
              OTP sent to your registered phone number for PIN reset.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Card Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Card Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              icon: Globe,
              label: "Online Payments",
              description: "Allow card for online transactions",
              checked: onlinePayments,
              onChange: setOnlinePayments,
            },
            {
              icon: Globe,
              label: "International Payments",
              description: "Allow transactions outside Kenya",
              checked: internationalPayments,
              onChange: setInternationalPayments,
            },
            {
              icon: Wifi,
              label: "Contactless Payments",
              description: "Tap to pay at POS terminals",
              checked: contactless,
              onChange: setContactless,
            },
            {
              icon: Building2,
              label: "ATM Withdrawals",
              description: "Cash withdrawals from ATMs",
              checked: atmWithdrawals,
              onChange: setAtmWithdrawals,
            },
          ].map((setting, i) => (
            <div key={setting.label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <setting.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={setting.checked}
                  onCheckedChange={setting.onChange}
                />
              </div>
              {i < 3 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent card transactions — from API */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Card Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {cardTxns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No card transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {cardTxns.map((txn) => {
                const Icon = categoryIconMap[txn.category] ?? CreditCard;
                return (
                  <div key={txn.id} className="flex items-center gap-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{txn.merchant}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(txn.date)} &middot; {txn.category.replace("_", " ")}
                      </p>
                    </div>
                    <span className={cn("text-sm font-semibold whitespace-nowrap", txn.amount > 0 ? "text-success" : "text-foreground")}>
                      {formatKES(Math.abs(txn.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Limits Dialog */}
      <Dialog open={limitsOpen} onOpenChange={setLimitsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Card Limits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Daily Transaction Limit (KES)</Label>
              <Input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum amount per day
              </p>
            </div>
            <div className="space-y-2">
              <Label>Monthly Spending Limit (KES)</Label>
              <Input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum total spending per month
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLimitsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLimits} disabled={limitsMutation.isPending}>
              {limitsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Limits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
