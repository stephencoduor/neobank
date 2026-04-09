import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentUser as mockUser } from "@/data/mock";
import { useApiQuery } from "@/hooks/use-api";
import { fineract } from "@/services/fineract-service";
import {
  User,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Info,
  Lock,
  Fingerprint,
  Smartphone,
  Globe,
  DollarSign,
  Sun,
  Moon,
  Monitor,
  ArrowUpRight,
  AlertTriangle,
  FileText,
  HelpCircle,
  ChevronRight,
  Camera,
  LogOut,
} from "lucide-react";

const activeSessions = [
  { id: "S-001", device: "Chrome on Windows 11", location: "Nairobi, KE", lastActive: "Now", current: true },
  { id: "S-002", device: "NeoBank App on Samsung Galaxy S24", location: "Nairobi, KE", lastActive: "2 hours ago", current: false },
  { id: "S-003", device: "Safari on iPhone 15", location: "Mombasa, KE", lastActive: "1 day ago", current: false },
];

export default function SettingsPage() {
  // Fetch real client from Fineract
  const { data: clientData, error } = useApiQuery(
    () => fineract.getClient(1),
    [],
  );
  const isLive = !!clientData && !error;
  const currentUser = isLive
    ? {
        ...mockUser,
        firstName: clientData.firstname || mockUser.firstName,
        lastName: clientData.lastname || mockUser.lastName,
        phone: clientData.mobileNo || mockUser.phone,
        email: `${clientData.firstname?.toLowerCase()}.${clientData.lastname?.toLowerCase()}@neobank.co.ke`,
      }
    : mockUser;

  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("KES");

  // Toggle states
  const [twoFa, setTwoFa] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [txnAlerts, setTxnAlerts] = useState(true);
  const [cardAlerts, setCardAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {currentUser.firstName[0]}
                  {currentUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                defaultValue={currentUser.firstName}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                defaultValue={currentUser.lastName}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={currentUser.email}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                defaultValue={currentUser.phone}
                className="mt-1"
              />
            </div>
          </div>

          <Button className="w-full sm:w-auto">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Protect your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Change Password</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Add extra security with SMS or authenticator app
                </p>
              </div>
            </div>
            <Switch checked={twoFa} onCheckedChange={setTwoFa} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Fingerprint className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Biometric Login</p>
                <p className="text-xs text-muted-foreground">
                  Use fingerprint or face recognition
                </p>
              </div>
            </div>
            <Switch checked={biometric} onCheckedChange={setBiometric} />
          </div>

          <Separator />

          {/* Active Sessions */}
          <div>
            <p className="mb-3 text-sm font-medium">Active Sessions</p>
            <div className="space-y-2">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {session.device}
                        {session.current && (
                          <Badge className="ml-2 bg-emerald-500/10 text-emerald-600 text-[10px]">
                            Current
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.location} &middot; {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Transaction Alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified for every transaction
              </p>
            </div>
            <Switch checked={txnAlerts} onCheckedChange={setTxnAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Card Alerts</p>
              <p className="text-xs text-muted-foreground">
                Card usage and security notifications
              </p>
            </div>
            <Switch checked={cardAlerts} onCheckedChange={setCardAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Marketing</p>
              <p className="text-xs text-muted-foreground">
                Promotions, offers, and new features
              </p>
            </div>
            <Switch checked={marketing} onCheckedChange={setMarketing} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Security Alerts</p>
              <p className="text-xs text-muted-foreground">
                Login attempts and suspicious activity
              </p>
            </div>
            <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Preferences</CardTitle>
          </div>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val ?? "")}>
                <SelectTrigger className="mt-1">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Kiswahili</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency Display</Label>
              <Select value={currency} onValueChange={(val) => setCurrency(val ?? "")}>
                <SelectTrigger className="mt-1">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(val) => setTheme(val ?? "")}>
                <SelectTrigger className="mt-1">
                  {theme === "light" ? (
                    <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
                  ) : theme === "dark" ? (
                    <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Account tier and management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {currentUser.tier} Tier
                </p>
                <Badge className="bg-blue-500/10 text-blue-600 text-[10px]">
                  {currentUser.tier}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Daily limit: KES 300,000 &middot; Monthly limit: KES 5,000,000
              </p>
            </div>
            <Button size="sm" className="gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Upgrade
            </Button>
          </div>

          <Separator />

          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-red-500 hover:bg-red-500/5 hover:text-red-600"
          >
            <AlertTriangle className="h-4 w-4" />
            Close Account
          </Button>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle>About</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">App Version</span>
            <span className="text-sm font-medium">2.4.1 (Build 2026.04.03)</span>
          </div>
          <Separator />
          <button className="flex w-full items-center justify-between py-2 text-sm hover:text-primary">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Terms of Service
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <Separator />
          <button className="flex w-full items-center justify-between py-2 text-sm hover:text-primary">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Privacy Policy
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <Separator />
          <button className="flex w-full items-center justify-between py-2 text-sm hover:text-primary">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Contact Support
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <Separator />

          <Button
            variant="outline"
            className="mt-2 w-full justify-center gap-2 text-red-500 hover:bg-red-500/5 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
