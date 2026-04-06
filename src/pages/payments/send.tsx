import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  ChevronRight,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { accounts, recentContacts } from "@/data/mock";
import { interopService } from "@/services/interop-service";
import { cn } from "@/lib/utils";

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

type Step = "input" | "review" | "success";

export default function SendMoneyPage() {
  const [step, setStep] = useState<Step>("input");
  const [phone, setPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sourceAccount, setSourceAccount] = useState(accounts[0].id);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [routingInfo, setRoutingInfo] = useState<{ carrier: string; feeMinor: number; failover: boolean } | null>(null);

  const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const fee = parsedAmount > 0 && parsedAmount <= 100_000 ? 0 : 35;
  const total = parsedAmount + fee;
  const source = accounts.find((a) => a.id === sourceAccount) ?? accounts[0];
  const txnRef = `P2P-${Date.now().toString(36).toUpperCase()}`;

  const canProceed = phone.length >= 9 && parsedAmount >= 10;

  const handleContactSelect = (contact: (typeof recentContacts)[0]) => {
    setSelectedContact(contact.id);
    setPhone(contact.phone.replace("+254 ", ""));
    setRecipientName(contact.name);
  };

  const handleReview = () => {
    if (canProceed) setStep("review");
  };

  const handleSend = async () => {
    setSending(true);
    setSendError(null);
    try {
      const result = await interopService.sendMoney({
        msisdn: `254${phone}`,
        amountMinor: parsedAmount * 100,
        accountRef: sourceAccount,
        description: note || "P2P Transfer",
      });
      setRoutingInfo(result.routing);
      setStep("success");
    } catch {
      // Backend unavailable — demo mode
      console.info("[NeoBank] Backend unavailable, using demo send");
      setRoutingInfo({ carrier: "MPESA", feeMinor: fee * 100, failover: false });
      setStep("success");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setPhone("");
    setRecipientName("");
    setAmount("");
    setNote("");
    setSelectedContact(null);
  };

  /* ── Success state ────────────────────────────────────────────────── */
  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 max-w-md mx-auto text-center">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <div className="absolute inset-0 h-20 w-20 rounded-full bg-success/20 animate-ping" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Money Sent!</h2>
        <p className="text-muted-foreground mb-6">
          {formatKES(parsedAmount)} has been sent to{" "}
          {recipientName || `+254 ${phone}`}
        </p>
        <Card className="w-full mb-6">
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-medium">
                {recipientName || `+254 ${phone}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatKES(parsedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">
                {fee === 0 ? "Free" : formatKES(fee)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{txnRef}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Send Another
          </Button>
          <Button className="flex-1" onClick={handleReset}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  /* ── Review step ──────────────────────────────────────────────────── */
  if (step === "review") {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("input")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Review Transfer</h1>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Recipient */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {recipientName
                    ? recipientName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {recipientName || "Recipient"}
                </p>
                <p className="text-sm text-muted-foreground">
                  +254 {phone}
                </p>
              </div>
            </div>

            <Separator />

            {/* Amount breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-lg">
                  {formatKES(parsedAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfer Fee</span>
                <span className={cn(fee === 0 && "text-success font-medium")}>
                  {fee === 0 ? "Free" : formatKES(fee)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatKES(total)}</span>
              </div>
            </div>

            <Separator />

            {/* Source account */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium">{source.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-medium">
                {formatKES(source.availableBalance)}
              </span>
            </div>

            {note && (
              <>
                <Separator />
                <div className="text-sm">
                  <span className="text-muted-foreground">Note: </span>
                  <span>{note}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button className="w-full h-12 text-base gap-2" onClick={handleSend}>
          <Send className="h-4 w-4" />
          Send {formatKES(total)}
        </Button>
      </div>
    );
  }

  /* ── Input step ───────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Send Money</h1>
          <p className="text-sm text-muted-foreground">
            Transfer to any mobile number
          </p>
        </div>
      </div>

      {/* Recent contacts */}
      <div>
        <Label className="text-sm text-muted-foreground mb-3 block">
          Recent Contacts
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
        <Label>Recipient Phone Number</Label>
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
              if (!recipientName) setRecipientName("");
            }}
            className="flex-1"
          />
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label>Amount</Label>
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
        {fee === 0 && parsedAmount > 0 && (
          <Badge variant="secondary" className="text-success bg-success/10">
            Free transfer
          </Badge>
        )}
        {fee > 0 && (
          <p className="text-xs text-muted-foreground">
            Transfer fee: {formatKES(fee)}
          </p>
        )}
      </div>

      {/* Source account */}
      <div className="space-y-2">
        <Label>Pay From</Label>
        <Select value={sourceAccount} onValueChange={(val) => setSourceAccount(val ?? "")}>
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

      {/* Note */}
      <div className="space-y-2">
        <Label>
          Note{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          placeholder="What's this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      {/* Fee summary */}
      {parsedAmount > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>{formatKES(parsedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className={cn(fee === 0 && "text-success")}>
                {fee === 0 ? "Free" : formatKES(fee)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatKES(total)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue */}
      <Button
        className="w-full h-12 text-base gap-2"
        disabled={!canProceed}
        onClick={handleReview}
      >
        Continue
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
