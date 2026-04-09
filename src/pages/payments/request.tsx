import { useState } from "react";
import {
  ArrowLeft,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { recentContacts as mockContacts } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/hooks/use-api";
import { fineract, type FClient } from "@/services/fineract-service";

/** Transform Fineract clients to contact format */
function clientsToContacts(clients: FClient[]) {
  return clients.slice(0, 5).map((c) => ({
    id: `CL-${c.id}`,
    name: c.displayName,
    phone: c.mobileNo || `+254 7${String(c.id).padStart(2, "0")} XXX XXX`,
  }));
}

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/* ── Pending requests mock ──────────────────────────────────────────── */
const pendingRequests = [
  {
    id: "REQ-001",
    name: "David Kamau",
    phone: "+254 712 333 444",
    amount: 3_500,
    description: "Lunch share - Java House",
    date: "2026-04-02",
    status: "pending" as const,
  },
  {
    id: "REQ-002",
    name: "Grace Akinyi",
    phone: "+254 700 444 555",
    amount: 12_000,
    description: "Rent contribution",
    date: "2026-03-28",
    status: "pending" as const,
  },
  {
    id: "REQ-003",
    name: "Peter Mwangi",
    phone: "+254 791 555 666",
    amount: 5_000,
    description: "Event tickets",
    date: "2026-03-25",
    status: "declined" as const,
  },
  {
    id: "REQ-004",
    name: "Faith Njeri",
    phone: "+254 733 222 333",
    amount: 8_000,
    description: "Chama contribution",
    date: "2026-03-20",
    status: "completed" as const,
  },
];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-warning/10 text-warning" },
  completed: { label: "Paid", icon: CheckCircle2, color: "bg-success/10 text-success" },
  declined: { label: "Declined", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

export default function RequestMoneyPage() {
  // Fetch real clients from Fineract for contacts
  const { data: clientsData, error } = useApiQuery(
    () => fineract.getClients(10),
    [],
  );
  const isLive = !!clientsData && !error;
  const recentContacts = isLive ? clientsToContacts(clientsData.pageItems) : mockContacts;

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const canSend = phone.length >= 9 && parsedAmount >= 10;

  const handleContactSelect = (contact: (typeof recentContacts)[0]) => {
    setSelectedContact(contact.id);
    setPhone(contact.phone.replace("+254 ", ""));
  };

  const handleSendRequest = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setPhone("");
      setAmount("");
      setDescription("");
      setSelectedContact(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Request Money</h1>
          <p className="text-sm text-muted-foreground">
            Send a payment request to anyone
          </p>
        </div>
      </div>

      {/* Sent confirmation */}
      {sent && (
        <Card className="border-success bg-success/5">
          <CardContent className="flex items-center gap-3 pt-4">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-sm font-medium">Request Sent!</p>
              <p className="text-xs text-muted-foreground">
                {formatKES(parsedAmount)} requested from +254 {phone}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent contacts */}
      <div>
        <Label className="text-sm text-muted-foreground mb-3 block">
          Request From
        </Label>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            {recentContacts.map((contact) => {
              const initials = contact.name
                .split(" ")
                .map((w) => w[0])
                .join("");
              const isSelected = selectedContact === contact.id;

              return (
                <button
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 min-w-[64px] transition-all",
                    isSelected && "scale-105"
                  )}
                >
                  <Avatar
                    className={cn(
                      "h-12 w-12 border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-muted"
                    )}
                  >
                    <AvatarFallback
                      className={cn(
                        "text-xs font-semibold",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate max-w-[64px]">
                    {contact.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Phone number */}
      <div className="space-y-2">
        <Label>Phone Number</Label>
        <div className="flex gap-2">
          <div className="flex items-center justify-center px-3 h-10 rounded-md border bg-muted text-sm font-medium min-w-[72px]">
            +254
          </div>
          <Input
            placeholder="712 345 678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/[^0-9 ]/g, ""));
              setSelectedContact(null);
            }}
            className="flex-1"
          />
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label>Amount to Request</Label>
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
            className="pl-14 text-2xl h-14 font-bold text-center"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Reason for Request</Label>
        <Textarea
          placeholder="e.g. Lunch share, rent contribution..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      {/* Send request */}
      <Button
        className="w-full h-12 text-base gap-2"
        disabled={!canSend}
        onClick={handleSendRequest}
      >
        <Send className="h-4 w-4" />
        Send Request
      </Button>

      <Separator />

      {/* Pending requests list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Outgoing Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.map((req) => {
              const config = statusConfig[req.status];
              const StatusIcon = config.icon;

              return (
                <div key={req.id} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 bg-muted shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {req.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {req.name}
                      </p>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {formatKES(req.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={cn("text-xs gap-1", config.color)}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.date).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
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
