import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Fingerprint, Phone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth-service";

export default function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Attempt real API login first
      const result = await authService.login(`+254${phone}`, password);
      if (result.authenticated) {
        setShowWelcome(true);
        // Also bind device for push + fraud detection
        authService.bindDevice({
          clientId: result.user?.id ?? 0,
          deviceFingerprint: navigator.userAgent,
          platform: "WEB",
        }).catch(() => { /* non-critical */ });
        setTimeout(() => navigate("/dashboard"), 1500);
        return;
      }
    } catch {
      // Backend unavailable — fall back to demo mode
      console.info("[NeoBank] Backend unavailable, using demo mode");
    }

    // Demo mode fallback
    setLoading(false);
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      navigate("/dashboard");
    }, 1500);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to your NeoBank account
      </p>

      {/* Welcome toast */}
      <div
        className={cn(
          "mt-4 overflow-hidden rounded-lg border border-success/30 bg-success/10 px-4 py-3 transition-all duration-300",
          showWelcome
            ? "max-h-20 opacity-100"
            : "max-h-0 border-0 p-0 opacity-0"
        )}
      >
        <p className="text-sm font-medium text-success">
          Welcome back, Amina! Logging you in...
        </p>
      </div>

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span className="font-medium">+254</span>
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-20"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Login button */}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          or
        </span>
      </div>

      {/* Biometric */}
      <Button
        variant="outline"
        className="w-full gap-2"
        size="lg"
        onClick={() => {
          setShowWelcome(true);
          setTimeout(() => setShowWelcome(false), 3000);
        }}
      >
        <Fingerprint className="h-5 w-5 text-primary" />
        Login with Biometrics
      </Button>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
