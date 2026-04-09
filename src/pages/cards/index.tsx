import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Plus,
  Snowflake,
  SlidersHorizontal,
  Eye,
  Ban,
  Wifi,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useClientCards, useToggleFreeze, useIssueVirtualCard } from "@/hooks";
import { useApiQuery } from "@/hooks/use-api";
import { fineract } from "@/services/fineract-service";
import { WifiOff } from "lucide-react";

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/* ── Visa / Mastercard logos as inline SVG snippets ─────────────────── */

function VisaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 500" className={cn("h-8 w-12", className)} fill="currentColor">
      <path d="M293.2 348.73l33.36-195.76h53.35l-33.38 195.76zm246.11-191.54c-10.57-3.97-27.16-8.2-47.89-8.2-52.84 0-90.08 26.58-90.33 64.65-.5 28.12 26.53 43.81 46.78 53.17 20.75 9.58 27.72 15.72 27.72 24.27-.13 13.12-16.63 19.12-32.03 19.12-21.38 0-32.72-2.96-50.28-10.26l-6.88-3.12-7.52 43.9c12.46 5.48 35.56 10.23 59.52 10.48 56.22 0 92.72-26.26 93.08-66.96.2-22.31-14.06-39.3-44.9-53.33-18.69-9.08-30.15-15.13-30.15-24.35.13-8.32 9.72-16.92 30.73-16.92 17.5-.25 30.22 3.55 40.12 7.52l4.8 2.26 7.23-42.23zm137.28-4.22h-41.34c-12.81 0-22.39 3.49-28.03 16.26l-79.5 179.5h56.18s9.18-24.14 11.26-29.42l68.55.08c1.6 6.85 6.52 29.34 6.52 29.34h49.64l-43.28-195.76zm-65.96 126.38c4.44-11.34 21.38-54.96 21.38-54.96-.31.53 4.4-11.38 7.11-18.76l3.63 16.96s10.28 46.9 12.42 56.76h-44.54zM327.14 152.97L275.2 283.4l-5.53-26.8c-9.62-30.86-39.6-64.28-73.16-81.01l47.89 172.91 56.6-.06 84.24-195.47h-56.6z" />
      <path d="M146.92 152.97H60.88l-.69 4.02c67.12 16.21 111.52 55.37 129.93 102.41l-18.74-89.96c-3.23-12.36-12.6-16.08-24.46-16.47z" opacity=".65" />
    </svg>
  );
}

function MastercardLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 500" className={cn("h-8 w-12", className)}>
      <circle cx="310" cy="250" r="170" fill="#EB001B" />
      <circle cx="470" cy="250" r="170" fill="#F79E1B" />
      <path d="M390 120.8a170 170 0 0 0-80 129.2 170 170 0 0 0 80 129.2 170 170 0 0 0 80-129.2 170 170 0 0 0-80-129.2z" fill="#FF5F00" />
    </svg>
  );
}

function CardChipIcon() {
  return (
    <svg viewBox="0 0 50 40" className="h-8 w-10">
      <rect x="2" y="2" width="46" height="36" rx="5" ry="5" fill="currentColor" opacity="0.7" />
      <line x1="2" y1="14" x2="48" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="2" y1="26" x2="48" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="18" y1="2" x2="18" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="32" y1="2" x2="32" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ── Types ─────────────────────────────────────────────────────────── */
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

/* ── Visual Card Component ──────────────────────────────────────────── */

function VisualCard({
  card,
  onClick,
}: {
  card: ApiCard;
  onClick?: () => void;
}) {
  const isVirtual = card.type === "VIRTUAL";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full max-w-[380px] aspect-[1.586/1] rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer select-none overflow-hidden",
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
          <div className={cn("text-gold", isVirtual ? "text-[#d4a532]" : "text-[#2a1f0a]")}>
            <CardChipIcon />
          </div>
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

        <div className="font-mono text-lg tracking-[0.2em] mt-auto mb-2">
          **** **** **** {card.last4}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className={cn("text-xs opacity-60 mb-0.5", isVirtual ? "text-white/60" : "text-[#2a1f0a]/60")}>
              CARD HOLDER
            </p>
            <p className="text-sm font-semibold tracking-wide uppercase">
              {card.cardholderName}
            </p>
            <p className={cn("text-xs mt-1 opacity-60", isVirtual ? "text-white/60" : "text-[#2a1f0a]/60")}>
              VALID THRU {card.expiryDate}
            </p>
          </div>
          <div>
            {card.network === "VISA" ? (
              <VisaLogo className={isVirtual ? "text-white" : "text-[#2a1f0a]"} />
            ) : (
              <MastercardLogo />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */

export default function CardsPage() {
  const navigate = useNavigate();
  const { data: apiCards } = useClientCards(1);
  const toggleFreeze = useToggleFreeze();
  const issueCard = useIssueVirtualCard();
  const [localFrozen, setLocalFrozen] = useState<Set<string>>(new Set());

  // Fineract live status
  const { data: fClient, error: fErr } = useApiQuery(
    () => fineract.getClient(1),
    [],
  );
  const isFineractLive = !!fClient && !fErr;

  const cardList: ApiCard[] = Array.isArray(apiCards) ? apiCards as ApiCard[] : [];

  const handleToggleFreeze = (cardId: string, currentlyFrozen: boolean) => {
    toggleFreeze.mutate({ cardId, freeze: !currentlyFrozen });
    setLocalFrozen((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleRequestCard = () => {
    issueCard.mutate({ clientId: 1, accountRef: "ACC-001", cardholderName: "AMINA WANJIKU" });
  };

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Cards</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your virtual and physical cards
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
        <Button className="gap-2" onClick={handleRequestCard} disabled={issueCard.isPending}>
          {issueCard.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Request New Card
        </Button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {cardList.map((card) => {
          const isFrozen = card.frozen || localFrozen.has(card.cardId);
          const spentPct = card.monthlyLimit > 0
            ? Math.round((card.monthSpend / card.monthlyLimit) * 100)
            : 0;

          return (
            <div key={card.cardId} className="space-y-4">
              <div className={cn("relative", isFrozen && "opacity-60")}>
                <VisualCard
                  card={card}
                  onClick={() => navigate(`/cards/${card.cardId}`)}
                />
                {isFrozen && (
                  <div className="absolute inset-0 rounded-2xl bg-background/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      <Snowflake className="h-6 w-6" />
                      Card Frozen
                    </div>
                  </div>
                )}
              </div>

              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isFrozen ? "secondary" : "default"}
                        className={cn(
                          !isFrozen && "bg-success text-success-foreground"
                        )}
                      >
                        {isFrozen ? "Frozen" : "Active"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {card.network} {card.type.toLowerCase()}
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      {formatKES(card.monthlyLimit - card.monthSpend)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Spent this month
                      </span>
                      <span className="font-medium">
                        {formatKES(card.monthSpend)} /{" "}
                        {formatKES(card.monthlyLimit)}
                      </span>
                    </div>
                    <Progress value={spentPct} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {spentPct}% of limit used
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      {
                        icon: Snowflake,
                        label: isFrozen ? "Unfreeze" : "Freeze",
                        onClick: () => handleToggleFreeze(card.cardId, isFrozen),
                        active: isFrozen,
                      },
                      {
                        icon: SlidersHorizontal,
                        label: "Set Limits",
                        onClick: () => navigate(`/cards/${card.cardId}`),
                      },
                      {
                        icon: Eye,
                        label: "View PIN",
                        onClick: () => navigate(`/cards/${card.cardId}`),
                      },
                      {
                        icon: Ban,
                        label: "Block",
                        onClick: () => {},
                        danger: true,
                      },
                    ].map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex-col h-auto py-3 gap-1.5 text-xs",
                          (action as { active?: boolean }).active && "border-blue-400 text-blue-600",
                          (action as { danger?: boolean }).danger &&
                            "hover:border-destructive hover:text-destructive"
                        )}
                        onClick={action.onClick}
                      >
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Add card CTA */}
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
          <p className="font-medium">Need another card?</p>
          <p className="text-sm text-center max-w-sm">
            Request a virtual card instantly or order a physical Mastercard
            delivered to your address.
          </p>
          <Button variant="outline" className="mt-2 gap-2" onClick={handleRequestCard}>
            <Plus className="h-4 w-4" />
            Request Card
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
