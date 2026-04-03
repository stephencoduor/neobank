import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  FileText,
  Landmark,
  Settings2,
  CheckCircle2,
  Upload,
  ArrowLeft,
  ArrowRight,
  Store,
  Phone,
  Mail,
  MapPin,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Business Info", icon: Building2 },
  { id: 2, label: "Documents", icon: FileText },
  { id: 3, label: "Bank Details", icon: Landmark },
  { id: 4, label: "Settlement", icon: Settings2 },
  { id: 5, label: "Review & Submit", icon: CheckCircle2 },
];

const businessCategories = [
  "Food & Beverage",
  "Retail",
  "Services",
  "Healthcare",
  "Education",
  "Agriculture",
  "Transport & Logistics",
  "Hospitality",
  "Technology",
  "Manufacturing",
];

const counties = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Kiambu",
  "Machakos",
  "Nyeri",
  "Meru",
  "Kakamega",
  "Kilifi",
  "Uasin Gishu",
  "Kajiado",
  "Laikipia",
  "Nyandarua",
];

const banks = [
  "KCB Bank",
  "Equity Bank",
  "Co-operative Bank",
  "NCBA Bank",
  "Stanbic Bank",
  "ABSA Bank Kenya",
  "Standard Chartered",
  "I&M Bank",
  "DTB Bank",
  "Family Bank",
];

interface FormData {
  businessName: string;
  category: string;
  county: string;
  town: string;
  phone: string;
  email: string;
  kraPin: File | null;
  businessReg: File | null;
  nationalId: File | null;
  bankName: string;
  accountNumber: string;
  branch: string;
  mpesaNumber: string;
  settlementFrequency: string;
  minimumAmount: string;
  preferredMethod: string;
  agreedToTerms: boolean;
}

function FileDropZone({
  label,
  description,
  file,
  onFileSelect,
}: {
  label: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : file
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-muted-foreground/25 hover:border-primary/50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) onFileSelect(droppedFile);
      }}
    >
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <FileCheck className="size-8 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-700">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <span>Browse Files</span>
            </Button>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) onFileSelect(selectedFile);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default function MerchantOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    businessName: "",
    category: "",
    county: "",
    town: "",
    phone: "",
    email: "",
    kraPin: null,
    businessReg: null,
    nationalId: null,
    bankName: "",
    accountNumber: "",
    branch: "",
    mpesaNumber: "",
    settlementFrequency: "daily",
    minimumAmount: "1000",
    preferredMethod: "mpesa",
    agreedToTerms: false,
  });

  const updateForm = (updates: Partial<FormData>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold">Application Under Review</h2>
            <p className="mt-2 text-muted-foreground">
              Your merchant application for{" "}
              <span className="font-semibold text-foreground">
                {form.businessName}
              </span>{" "}
              has been submitted successfully. Our team will review your
              documents and get back to you within 2-3 business days.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Reference: <span className="font-mono">MRC-2026-04-0847</span>
            </p>
            <Badge className="mt-3 bg-amber-500/10 text-amber-600">
              Pending Review
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Merchant Onboarding
        </h1>
        <p className="text-muted-foreground">
          Complete all steps to activate your merchant account
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isCompleted) setCurrentStep(step.id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted &&
                    "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
                  !isActive &&
                    !isCompleted &&
                    "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{step.id}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px w-6 lg:w-10",
                    isCompleted ? "bg-emerald-500" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].label}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Tell us about your business"}
            {currentStep === 2 && "Upload required business documents"}
            {currentStep === 3 && "Add your bank and payment details"}
            {currentStep === 4 && "Configure how you receive settlements"}
            {currentStep === 5 && "Review your information before submitting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="e.g. Mama Ngina Grocers Ltd"
                  className="mt-1"
                  value={form.businessName}
                  onChange={(e) =>
                    updateForm({ businessName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Business Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) =>
                    updateForm({ category: val ?? "" })
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>County</Label>
                <Select
                  value={form.county}
                  onValueChange={(val) =>
                    updateForm({ county: val ?? "" })
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="town">Town / Area</Label>
                <Input
                  id="town"
                  placeholder="e.g. Westlands, Kilimani"
                  className="mt-1"
                  value={form.town}
                  onChange={(e) => updateForm({ town: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+254 7XX XXX XXX"
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => updateForm({ phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@mamangina.co.ke"
                  className="mt-1"
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="grid gap-5 md:grid-cols-3">
              <FileDropZone
                label="KRA PIN Certificate"
                description="Upload PDF or image (max 5MB)"
                file={form.kraPin}
                onFileSelect={(f) => updateForm({ kraPin: f })}
              />
              <FileDropZone
                label="Business Registration"
                description="Certificate of incorporation / registration"
                file={form.businessReg}
                onFileSelect={(f) => updateForm({ businessReg: f })}
              />
              <FileDropZone
                label="Director's National ID"
                description="Front and back in a single PDF or image"
                file={form.nationalId}
                onFileSelect={(f) => updateForm({ nationalId: f })}
              />
            </div>
          )}

          {/* Step 3: Bank Details */}
          {currentStep === 3 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Bank Name</Label>
                <Select
                  value={form.bankName}
                  onValueChange={(val) =>
                    updateForm({ bankName: val ?? "" })
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  placeholder="e.g. Kenyatta Avenue"
                  className="mt-1"
                  value={form.branch}
                  onChange={(e) => updateForm({ branch: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="e.g. 1234567890"
                  className="mt-1"
                  value={form.accountNumber}
                  onChange={(e) =>
                    updateForm({ accountNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mpesaNumber">
                  M-Pesa Paybill / Till Number
                </Label>
                <Input
                  id="mpesaNumber"
                  placeholder="e.g. 174379 or 5123456"
                  className="mt-1"
                  value={form.mpesaNumber}
                  onChange={(e) =>
                    updateForm({ mpesaNumber: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 4: Settlement Preferences */}
          {currentStep === 4 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Settlement Frequency</Label>
                <Select
                  value={form.settlementFrequency}
                  onValueChange={(val) =>
                    updateForm({ settlementFrequency: val ?? "daily" })
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="minimumAmount">
                  Minimum Settlement Amount (KES)
                </Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  placeholder="1000"
                  className="mt-1"
                  value={form.minimumAmount}
                  onChange={(e) =>
                    updateForm({ minimumAmount: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Preferred Settlement Method</Label>
                <Select
                  value={form.preferredMethod}
                  onValueChange={(val) =>
                    updateForm({ preferredMethod: val ?? "mpesa" })
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Business Info Summary */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Store className="size-4" /> Business Information
                </h3>
                <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">
                      Business Name:
                    </span>{" "}
                    <span className="font-medium">
                      {form.businessName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span className="font-medium">
                      {form.category || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>{" "}
                    <span className="font-medium">
                      {form.town ? `${form.town}, ` : ""}
                      {form.county || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span className="font-medium">{form.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{form.email || "—"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Documents Summary */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <FileText className="size-4" /> Documents
                </h3>
                <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    {form.kraPin ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <Upload className="size-4 text-amber-500" />
                    )}
                    <span>KRA PIN Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {form.businessReg ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <Upload className="size-4 text-amber-500" />
                    )}
                    <span>Business Registration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {form.nationalId ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <Upload className="size-4 text-amber-500" />
                    )}
                    <span>Director&apos;s National ID</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bank Details Summary */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Landmark className="size-4" /> Bank & Payment Details
                </h3>
                <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Bank:</span>{" "}
                    <span className="font-medium">
                      {form.bankName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Branch:</span>{" "}
                    <span className="font-medium">{form.branch || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Account Number:
                    </span>{" "}
                    <span className="font-medium">
                      {form.accountNumber || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      M-Pesa Paybill/Till:
                    </span>{" "}
                    <span className="font-medium">
                      {form.mpesaNumber || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Settlement Summary */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Settings2 className="size-4" /> Settlement Preferences
                </h3>
                <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm md:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>{" "}
                    <span className="font-medium capitalize">
                      {form.settlementFrequency}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min Amount:</span>{" "}
                    <span className="font-medium">
                      KES {Number(form.minimumAmount).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Method:</span>{" "}
                    <span className="font-medium">
                      {form.preferredMethod === "mpesa"
                        ? "M-Pesa"
                        : "Bank Transfer"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Switch
                  checked={form.agreedToTerms}
                  onCheckedChange={(checked) =>
                    updateForm({ agreedToTerms: !!checked })
                  }
                />
                <div className="text-sm">
                  <p className="font-medium">Terms & Conditions</p>
                  <p className="text-muted-foreground">
                    I agree to the NeoBank Merchant Agreement, fee schedule, and
                    confirm that all information provided is accurate and
                    compliant with CBK regulations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>

            {currentStep < 5 ? (
              <Button onClick={() => setCurrentStep((s) => s + 1)}>
                Next
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button
                disabled={!form.agreedToTerms}
                onClick={() => setSubmitted(true)}
              >
                <CheckCircle2 className="mr-2 size-4" />
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
