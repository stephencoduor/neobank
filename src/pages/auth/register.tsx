import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Phone,
} from "lucide-react";

const STEPS = ["Contact", "Personal", "Password", "Verify"] as const;

function PasswordStrength({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-destructive",
    "bg-warning",
    "bg-gold",
    "bg-success",
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? colors[score - 1] : "bg-muted"
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs font-medium",
          score <= 1
            ? "text-destructive"
            : score === 2
              ? "text-warning"
              : score === 3
                ? "text-gold"
                : "text-success"
        )}
      >
        {labels[score - 1] ?? ""}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Form state
  const [form, setForm] = useState({
    phone: "",
    email: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

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
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs sm:inline",
                  i <= step
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {step === 0 && "Enter your contact details to get started"}
        {step === 1 && "Tell us a bit about yourself"}
        {step === 2 && "Choose a secure password for your account"}
        {step === 3 && "Enter the 6-digit code sent to your phone"}
      </p>

      <div className="mt-6 space-y-4">
        {/* Step 1: Contact */}
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Phone Number</Label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-medium">+254</span>
                </div>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="712 345 678"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="pl-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email Address</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="amina@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Step 2: Personal */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="reg-fname">First Name</Label>
                <Input
                  id="reg-fname"
                  placeholder="Amina"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-lname">Last Name</Label>
                <Input
                  id="reg-lname"
                  placeholder="Wanjiku"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-dob">Date of Birth</Label>
              <Input
                id="reg-dob"
                type="date"
                value={form.dob}
                onChange={(e) => update("dob", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => update("gender", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Step 3: Password */}
        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="reg-pass">Password</Label>
              <div className="relative">
                <Input
                  id="reg-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirm Password</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
              {form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li
                className={cn(
                  form.password.length >= 8 && "text-success font-medium"
                )}
              >
                {form.password.length >= 8 ? "✓" : "○"} At least 8 characters
              </li>
              <li
                className={cn(
                  /[A-Z]/.test(form.password) && "text-success font-medium"
                )}
              >
                {/[A-Z]/.test(form.password) ? "✓" : "○"} One uppercase letter
              </li>
              <li
                className={cn(
                  /[0-9]/.test(form.password) && "text-success font-medium"
                )}
              >
                {/[0-9]/.test(form.password) ? "✓" : "○"} One number
              </li>
              <li
                className={cn(
                  /[^A-Za-z0-9]/.test(form.password) &&
                    "text-success font-medium"
                )}
              >
                {/[^A-Za-z0-9]/.test(form.password) ? "✓" : "○"} One special
                character
              </li>
            </ul>
          </>
        )}

        {/* Step 4: OTP */}
        {step === 3 && (
          <>
            <p className="text-sm text-muted-foreground">
              We sent a verification code to{" "}
              <span className="font-medium text-foreground">
                +254 {form.phone || "712 345 678"}
              </span>
            </p>
            <div className="flex justify-center gap-2 py-4">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-12 text-center text-lg font-bold"
                />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Didn't receive the code?{" "}
              <button className="font-semibold text-primary hover:underline">
                Resend
              </button>
            </p>
          </>
        )}
      </div>

      {/* Navigation buttons */}
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
            if (step < STEPS.length - 1) setStep(step + 1);
          }}
        >
          {step === STEPS.length - 1 ? (
            "Create Account"
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
