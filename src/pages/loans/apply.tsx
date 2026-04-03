import { useState } from "react";
import {
  User,
  Briefcase,
  AlertTriangle,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Check,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

// ── Types & Data ─────────────────────────────────────────────────────────────
const STEPS = ["Loan Type", "Amount & Term", "Documents", "Review & Submit"] as const;

interface LoanTypeOption {
  id: string;
  label: string;
  description: string;
  icon: typeof User;
  rate: number;
  maxAmount: number;
  color: string;
}

const loanTypes: LoanTypeOption[] = [
  {
    id: "personal",
    label: "Personal Loan",
    description: "For personal expenses, home improvement, or emergencies",
    icon: User,
    rate: 14,
    maxAmount: 1_000_000,
    color: "bg-primary/10 text-primary border-primary/30",
  },
  {
    id: "business",
    label: "Business Loan",
    description: "Working capital, inventory, or equipment for your enterprise",
    icon: Briefcase,
    rate: 12,
    maxAmount: 1_000_000,
    color: "bg-gold/10 text-gold border-gold/30",
  },
  {
    id: "emergency",
    label: "Emergency Loan",
    description: "Quick disbursement for urgent financial needs",
    icon: AlertTriangle,
    rate: 16,
    maxAmount: 200_000,
    color: "bg-destructive/10 text-destructive border-destructive/30",
  },
  {
    id: "education",
    label: "Education Loan",
    description: "School fees, training, and professional development",
    icon: GraduationCap,
    rate: 10,
    maxAmount: 500_000,
    color: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  },
];

const TERM_OPTIONS = [3, 6, 9, 12, 18, 24, 36];

interface DocumentSlot {
  id: string;
  label: string;
  description: string;
  accepted: string;
}

const documentSlots: DocumentSlot[] = [
  {
    id: "payslip",
    label: "Recent Payslip",
    description: "Last 3 months payslip or income proof",
    accepted: "PDF, JPG, PNG (max 5MB)",
  },
  {
    id: "bank_statements",
    label: "Bank Statements",
    description: "Last 6 months bank statements",
    accepted: "PDF (max 10MB)",
  },
  {
    id: "national_id",
    label: "National ID / Passport",
    description: "Valid Kenyan national ID or passport",
    accepted: "PDF, JPG, PNG (max 5MB)",
  },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function LoanApplyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [amount, setAmount] = useState(100_000);
  const [term, setTerm] = useState(12);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const selectedLoan = loanTypes.find((t) => t.id === selectedType);
  const interestRate = selectedLoan?.rate ?? 14;

  // Simple monthly repayment estimate (reducing balance approximation)
  const monthlyRate = interestRate / 100 / 12;
  const monthlyRepayment =
    monthlyRate > 0
      ? Math.round(
          (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
            (Math.pow(1 + monthlyRate, term) - 1)
        )
      : Math.round(amount / term);
  const totalRepayment = monthlyRepayment * term;
  const totalInterest = totalRepayment - amount;

  const canProceed = () => {
    if (currentStep === 0) return selectedType !== null;
    if (currentStep === 1) return amount >= 10_000 && amount <= 1_000_000;
    if (currentStep === 2) return Object.keys(uploadedDocs).length >= 1;
    if (currentStep === 3) return termsAccepted;
    return true;
  };

  const handleDocUpload = (docId: string) => {
    // Simulate file selection
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: `${docId}_uploaded.pdf`,
    }));
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold">Apply for a Loan</h1>
        <p className="text-sm text-muted-foreground">
          Complete the steps below to submit your loan application
        </p>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i < currentStep
                    ? "bg-primary text-primary-foreground"
                    : i === currentStep
                      ? "bg-gold text-gold-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  i <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 ${
                  i < currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {/* Step 1: Loan Type */}
        {currentStep === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {loanTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all ${
                  selectedType === type.id
                    ? "ring-2 ring-primary"
                    : "hover:ring-1 hover:ring-foreground/20"
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${type.color}`}
                    >
                      <type.icon className="h-5 w-5" />
                    </span>
                    {selectedType === type.id && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-heading font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Badge variant="secondary">{type.rate}% p.a.</Badge>
                    <span className="text-muted-foreground">
                      Up to {fmtKES(type.maxAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Amount & Term */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Loan Amount & Term</CardTitle>
              <CardDescription>
                Choose how much you need and your preferred repayment period
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Amount slider */}
              <div className="flex flex-col gap-2">
                <Label>Loan Amount</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={10_000}
                    max={selectedLoan?.maxAmount ?? 1_000_000}
                    step={10_000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <span className="min-w-[120px] text-right font-heading text-lg font-semibold">
                    {fmtKES(amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmtKES(10_000)}</span>
                  <span>{fmtKES(selectedLoan?.maxAmount ?? 1_000_000)}</span>
                </div>
              </div>

              {/* Term selector */}
              <div className="flex flex-col gap-2">
                <Label>Repayment Term</Label>
                <Select value={String(term)} onValueChange={(v) => setTerm(Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TERM_OPTIONS.map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {t} months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calculation summary */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="mb-3 text-sm font-medium">Repayment Estimate</p>
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-heading text-lg font-semibold text-primary">
                      {interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Payment</p>
                    <p className="font-heading text-lg font-semibold">
                      {fmtKES(monthlyRepayment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Interest</p>
                    <p className="font-heading text-lg font-semibold text-gold">
                      {fmtKES(totalInterest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Repayment</p>
                    <p className="font-heading text-lg font-semibold">
                      {fmtKES(totalRepayment)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Documents */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Provide the required documents to support your application
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {documentSlots.map((doc) => {
                  const isUploaded = doc.id in uploadedDocs;
                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors ${
                        isUploaded
                          ? "border-primary/40 bg-primary/5"
                          : "border-muted-foreground/20 hover:border-muted-foreground/40"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isUploaded
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isUploaded ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{doc.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.description}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/60">
                          {doc.accepted}
                        </p>
                      </div>
                      <Button
                        variant={isUploaded ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => handleDocUpload(doc.id)}
                      >
                        {isUploaded ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Uploaded
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1 h-3 w-3" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Application</CardTitle>
                <CardDescription>
                  Please review the details below before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Loan type summary */}
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Loan Type
                  </p>
                  <div className="flex items-center gap-3">
                    {selectedLoan && (
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${selectedLoan.color}`}
                      >
                        <selectedLoan.icon className="h-4 w-4" />
                      </span>
                    )}
                    <span className="font-medium">{selectedLoan?.label}</span>
                  </div>
                </div>

                {/* Financial summary */}
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Loan Details
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold">{fmtKES(amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-semibold">{term} months</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">{interestRate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Repayment</p>
                      <p className="font-semibold">{fmtKES(monthlyRepayment)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Interest</p>
                      <p className="font-semibold text-gold">{fmtKES(totalInterest)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Repayment</p>
                      <p className="font-semibold">{fmtKES(totalRepayment)}</p>
                    </div>
                  </div>
                </div>

                {/* Documents summary */}
                <div className="rounded-lg border p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Documents
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {documentSlots.map((doc) => (
                      <Badge
                        key={doc.id}
                        variant={doc.id in uploadedDocs ? "default" : "outline"}
                      >
                        {doc.id in uploadedDocs ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : null}
                        {doc.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Terms checkbox */}
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-muted/30">
                  <Input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) =>
                      setTermsAccepted((e.target as HTMLInputElement).checked)
                    }
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I have read and agree to the{" "}
                    <span className="font-medium text-primary underline">
                      Loan Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-primary underline">
                      SACCO Borrowing Policy
                    </span>
                    . I confirm that the information provided is accurate and
                    complete.
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-gold text-gold-foreground hover:bg-gold/90"
            disabled={!canProceed()}
          >
            <CreditCard className="mr-1.5 h-4 w-4" />
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
}
