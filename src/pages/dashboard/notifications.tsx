import { useState } from "react";
import {
  Bell,
  ArrowLeftRight,
  Shield,
  CreditCard,
  Megaphone,
  CheckCheck,
  Inbox,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications } from "@/data/mock";

// ── Types ────────────────────────────────────────────────────────────────────
type NotificationType = "transaction" | "security" | "card" | "promo";

// ── Helpers ──────────────────────────────────────────────────────────────────
const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  transaction: {
    icon: <ArrowLeftRight className="h-4 w-4" />,
    color: "bg-primary/10 text-primary",
    label: "Transactions",
  },
  security: {
    icon: <Shield className="h-4 w-4" />,
    color: "bg-destructive/10 text-destructive",
    label: "Security",
  },
  card: {
    icon: <CreditCard className="h-4 w-4" />,
    color: "bg-gold/10 text-gold",
    label: "Cards",
  },
  promo: {
    icon: <Megaphone className="h-4 w-4" />,
    color: "bg-chart-3/10 text-chart-3",
    label: "Promotions",
  },
};

const filterTabs = ["all", "transaction", "security", "card", "promo"] as const;

// ── Component ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [items, setItems] = useState(notifications);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("all");

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    // Mark as read on expand
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered =
    tab === "all" ? items : items.filter((n) => n.type === tab);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {filterTabs.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t === "all" ? (
                <>
                  <Bell className="mr-1.5 h-3.5 w-3.5" /> All
                </>
              ) : (
                <>
                  {typeConfig[t as NotificationType].icon}
                  <span className="ml-1.5 hidden sm:inline">
                    {typeConfig[t as NotificationType].label}
                  </span>
                </>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Single content area — filtering is handled programmatically */}
        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            /* ── Empty state ────────────────────────────────────────── */
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </span>
                <p className="text-sm font-medium text-muted-foreground">
                  No notifications yet
                </p>
                <p className="max-w-xs text-center text-xs text-muted-foreground">
                  When you receive notifications, they will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((n) => {
                const cfg = typeConfig[n.type as NotificationType];
                const isExpanded = expanded === n.id;

                return (
                  <Card
                    key={n.id}
                    className={`cursor-pointer transition hover:shadow-sm ${
                      !n.read ? "border-l-4 border-l-primary" : ""
                    }`}
                    onClick={() => toggleExpand(n.id)}
                  >
                    <CardContent className="flex flex-col gap-2 py-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.color}`}
                        >
                          {cfg.icon}
                        </span>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm ${
                                !n.read ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {n.title}
                            </p>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {n.time}
                              </span>
                              {!n.read && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {n.message}
                          </p>
                        </div>

                        {/* Expand chevron */}
                        <span className="shrink-0 text-muted-foreground">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </div>

                      {/* ── Expanded detail ─────────────────────────── */}
                      {isExpanded && (
                        <div className="ml-12 mt-1 rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">
                            {n.type === "transaction" &&
                              "This transaction has been processed successfully and your account balance has been updated."}
                            {n.type === "security" &&
                              "A new login was detected on your account. If this was not you, please change your password immediately and contact support."}
                            {n.type === "card" &&
                              "Your card was used for a purchase. If you did not authorize this transaction, please freeze your card immediately."}
                            {n.type === "promo" &&
                              "Take advantage of this limited-time offer. Terms and conditions apply. Promotion valid until end of this week."}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {cfg.label}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {n.time}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
