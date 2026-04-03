import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CreditCard,
  FileText,
  Globe,
  Loader2,
  ScanFace,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

const STEPS = [
  "ID Type",
  "Front Photo",
  "Back Photo",
  "Selfie",
  "Review",
] as const;

const idTypes = [
  {
    id: "national_id",
    label: "National ID",
    description: "Kenyan National Identity Card",
    icon: CreditCard,
  },
  {
    id: "passport",
    label: "Passport",
    description: "Valid Kenyan or foreign passport",
    icon: Globe,
  },
  {
    id: "alien_id",
    label: "Alien ID",
    description: "Foreign National Certificate",
    icon: FileText,
  },
] as const;

function UploadZone({
  label,
  file,
  onFileChange,
}: {
  label: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
        file
          ? "border-success/50 bg-success/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />

      {file ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <Check className="h-6 w-6 text-success" />
          </div>
          <p className="mt-3 text-sm font-medium">{file.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(0)} KB
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Remove
          </Button>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <p className="mt-3 text-sm font-medium">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Drag and drop or click to upload
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            JPG, PNG up to 5MB
          </p>
        </>
      )}
    </div>
  );
}

export default function KycVerificationPage() {
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string>("");
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  function handleSubmit() {
    setSubmitted(true);
    setVerifying(true);
    // Simulate verification
    setTimeout(() => setVerifying(false), 4000);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        {verifying ? (
          <>
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20" />
            </div>
            <h2 className="mt-6 text-xl font-bold">
              Verifying your identity...
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              We're reviewing your documents. This usually takes a few minutes
              but can take up to 24 hours.
            </p>
            <Progress value={65} className="mt-6 h-2 w-64" />
            <p className="mt-2 text-xs text-muted-foreground">
              Processing documents...
            </p>
          </>
        ) : (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <ShieldCheck className="h-10 w-10 text-success" />
            </div>
            <h2 className="mt-6 text-xl font-bold">Verification Submitted</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Your documents have been received. We'll notify you once your
              identity has been verified. You can continue using basic features
              in the meantime.
            </p>
            <Badge className="mt-4 bg-gold/10 text-gold">
              Estimated: 5-15 minutes
            </Badge>
            <Button className="mt-6" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="font-medium text-foreground">{STEPS[step]}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        Identity Verification
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {step === 0 && "Select your identification document type"}
        {step === 1 && "Upload a clear photo of the front of your ID"}
        {step === 2 && "Upload a clear photo of the back of your ID"}
        {step === 3 && "Take a selfie to verify your identity"}
        {step === 4 && "Review your documents before submission"}
      </p>

      <div className="mt-6">
        {/* Step 1: ID Type Selection */}
        {step === 0 && (
          <div className="space-y-3">
            {idTypes.map((type) => (
              <Card
                key={type.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedId === type.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/30"
                )}
                onClick={() => setSelectedId(type.id)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                      selectedId === type.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{type.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                      selectedId === type.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedId === type.id && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Front Photo */}
        {step === 1 && (
          <div className="space-y-4">
            <UploadZone
              label="Upload front of your ID"
              file={frontPhoto}
              onFileChange={setFrontPhoto}
            />
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium">Tips for a good photo:</p>
              <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                <li>- Place document on a flat, well-lit surface</li>
                <li>- Ensure all four corners are visible</li>
                <li>- Avoid glare and shadows</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Back Photo */}
        {step === 2 && (
          <div className="space-y-4">
            <UploadZone
              label="Upload back of your ID"
              file={backPhoto}
              onFileChange={setBackPhoto}
            />
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium">
                Make sure the barcode/MRZ is clearly visible
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Selfie/Liveness */}
        {step === 3 && (
          <div className="space-y-4">
            {selfie ? (
              <div className="flex flex-col items-center rounded-xl border-2 border-success/50 bg-success/5 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <p className="mt-3 text-sm font-medium">Selfie captured</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selfie.name}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive hover:text-destructive"
                  onClick={() => setSelfie(null)}
                >
                  Retake
                </Button>
              </div>
            ) : (
              <div className="relative flex flex-col items-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8">
                {/* Face outline placeholder */}
                <div className="relative flex h-48 w-48 items-center justify-center">
                  {/* Dashed oval */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40" />
                  <ScanFace className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <p className="mt-4 text-sm font-medium">
                  Position your face within the oval
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ensure good lighting and remove glasses
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    className="gap-2"
                    onClick={() => {
                      // Simulate capture
                      const blob = new Blob(["selfie"], { type: "image/jpeg" });
                      const file = new File([blob], "selfie.jpg", {
                        type: "image/jpeg",
                      });
                      setSelfie(file);
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    Take Selfie
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const f = (e.target as HTMLInputElement).files?.[0];
                        if (f) setSelfie(f);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 p-5">
                <h3 className="text-sm font-semibold">Document Summary</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Document Type
                      </p>
                      <p className="text-sm font-medium">
                        {idTypes.find((t) => t.id === selectedId)?.label ??
                          "Not selected"}
                      </p>
                    </div>
                    {selectedId && (
                      <Badge variant="outline" className="text-success">
                        <Check className="mr-1 h-3 w-3" />
                        Selected
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Front Photo
                      </p>
                      <p className="text-sm font-medium">
                        {frontPhoto?.name ?? "Not uploaded"}
                      </p>
                    </div>
                    {frontPhoto && (
                      <Badge variant="outline" className="text-success">
                        <Check className="mr-1 h-3 w-3" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Back Photo
                      </p>
                      <p className="text-sm font-medium">
                        {backPhoto?.name ?? "Not uploaded"}
                      </p>
                    </div>
                    {backPhoto && (
                      <Badge variant="outline" className="text-success">
                        <Check className="mr-1 h-3 w-3" />
                        Uploaded
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Selfie</p>
                      <p className="text-sm font-medium">
                        {selfie?.name ?? "Not captured"}
                      </p>
                    </div>
                    {selfie && (
                      <Badge variant="outline" className="text-success">
                        <Check className="mr-1 h-3 w-3" />
                        Captured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
              <p className="text-xs text-muted-foreground">
                By submitting, you confirm that the information provided is
                accurate and consent to NeoBank verifying your identity in
                accordance with CBK regulations and our Privacy Policy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          className="flex-1 gap-2"
          size="lg"
          onClick={() => {
            if (step < STEPS.length - 1) {
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
          disabled={step === 0 && !selectedId}
        >
          {step === STEPS.length - 1 ? (
            <>
              <ShieldCheck className="h-4 w-4" />
              Submit for Verification
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
