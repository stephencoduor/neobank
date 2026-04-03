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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Shield,
  Bell,
  Plug,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smartphone,
  CreditCard,
  ScanFace,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const integrations = [
  {
    name: "M-Pesa API",
    description: "Safaricom Daraja API for mobile money",
    status: "connected" as const,
    lastSync: "2 min ago",
    icon: Smartphone,
  },
  {
    name: "Smile ID (KYC)",
    description: "Identity verification and KYC/AML checks",
    status: "connected" as const,
    lastSync: "15 min ago",
    icon: ScanFace,
  },
  {
    name: "Marqeta (Cards)",
    description: "Virtual and physical card issuance",
    status: "pending" as const,
    lastSync: "Pending setup",
    icon: CreditCard,
  },
  {
    name: "IPRS (ID Verification)",
    description: "Integrated Population Registration System",
    status: "connected" as const,
    lastSync: "8 min ago",
    icon: Globe,
  },
];

const statusStyles: Record<string, { badge: string; dot: string }> = {
  connected: {
    badge: "bg-emerald-500/10 text-emerald-600",
    dot: "bg-emerald-500",
  },
  pending: {
    badge: "bg-amber-500/10 text-amber-600",
    dot: "bg-amber-500",
  },
};

export default function AdminSettings() {
  // General
  const [platformName, setPlatformName] = useState("NeoBank Kenya");
  const [supportEmail, setSupportEmail] = useState("support@neobank.co.ke");
  const [supportPhone, setSupportPhone] = useState("+254 20 123 4567");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [platformFee, setPlatformFee] = useState("1.5");

  // Security
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(
    "196.201.214.0/24\n41.215.0.0/16"
  );

  // Notifications
  const [notifications, setNotifications] = useState({
    newRegistration: { email: true, sms: false, push: true },
    kycSubmission: { email: true, sms: false, push: true },
    largeTransaction: { email: true, sms: true, push: true },
    failedTransaction: { email: true, sms: true, push: false },
    dailySummary: { email: true, sms: false, push: false },
  });

  const toggleNotification = (
    event: keyof typeof notifications,
    channel: "email" | "sms" | "push"
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [channel]: !prev[event][channel],
      },
    }));
  };

  const notificationRows: {
    key: keyof typeof notifications;
    label: string;
    description: string;
  }[] = [
    {
      key: "newRegistration",
      label: "New Registration",
      description: "When a new user signs up",
    },
    {
      key: "kycSubmission",
      label: "KYC Submission",
      description: "When a user submits KYC documents",
    },
    {
      key: "largeTransaction",
      label: "Large Transactions",
      description: "Transactions exceeding KES 100,000",
    },
    {
      key: "failedTransaction",
      label: "Failed Transactions",
      description: "Payment failures and declines",
    },
    {
      key: "dailySummary",
      label: "Daily Summary",
      description: "End-of-day transaction summary",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Manage platform configuration, security, and integrations
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="size-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>
                Basic platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    className="mt-1"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    className="mt-1"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    className="mt-1"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="platformFee">Platform Fee (%)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    step="0.1"
                    className="mt-1"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable platform access for all users
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {maintenanceMode && (
                    <Badge className="bg-amber-500/10 text-amber-600">
                      <AlertTriangle className="mr-1 size-3" />
                      Active
                    </Badge>
                  )}
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={(checked) =>
                      setMaintenanceMode(!!checked)
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>
                Configure password requirements for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="minPasswordLength">
                    Minimum Password Length
                  </Label>
                  <Input
                    id="minPasswordLength"
                    type="number"
                    className="mt-1"
                    value={minPasswordLength}
                    onChange={(e) => setMinPasswordLength(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    className="mt-1"
                    value={maxLoginAttempts}
                    onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label>Require Uppercase Letters</Label>
                  <Switch
                    checked={requireUppercase}
                    onCheckedChange={(checked) =>
                      setRequireUppercase(!!checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label>Require Numbers</Label>
                  <Switch
                    checked={requireNumbers}
                    onCheckedChange={(checked) =>
                      setRequireNumbers(!!checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session & Authentication</CardTitle>
              <CardDescription>
                Control session duration and two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Session Timeout</Label>
                <Select
                  value={sessionTimeout}
                  onValueChange={(val) =>
                    setSessionTimeout(val ?? "30")
                  }
                >
                  <SelectTrigger className="mt-1 w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Enforce Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require all admin users to enable 2FA
                  </p>
                </div>
                <Switch
                  checked={enforce2FA}
                  onCheckedChange={(checked) => setEnforce2FA(!!checked)}
                />
              </div>

              <div>
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <p className="mb-1 text-xs text-muted-foreground">
                  One CIDR range per line. Leave empty to allow all IPs.
                </p>
                <Textarea
                  id="ipWhitelist"
                  className="mt-1 font-mono text-sm"
                  rows={4}
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which events trigger notifications and through which
                channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Column Headers */}
              <div className="mb-2 grid grid-cols-[1fr_80px_80px_80px] items-center gap-4 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Event</span>
                <span className="text-center">Email</span>
                <span className="text-center">SMS</span>
                <span className="text-center">Push</span>
              </div>

              <div className="space-y-1">
                {notificationRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-4 rounded-lg border p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.description}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        size="sm"
                        checked={notifications[row.key].email}
                        onCheckedChange={() =>
                          toggleNotification(row.key, "email")
                        }
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        size="sm"
                        checked={notifications[row.key].sms}
                        onCheckedChange={() =>
                          toggleNotification(row.key, "sms")
                        }
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        size="sm"
                        checked={notifications[row.key].push}
                        onCheckedChange={() =>
                          toggleNotification(row.key, "push")
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>
                Manage third-party service connections and API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  const style = statusStyles[integration.status];
                  return (
                    <Card key={integration.name} className="relative">
                      <CardContent className="pt-5">
                        <div className="flex items-start gap-4">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                            <Icon className="size-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {integration.name}
                              </h4>
                              <Badge className={style.badge}>
                                <span
                                  className={cn(
                                    "mr-1 inline-block size-1.5 rounded-full",
                                    style.dot
                                  )}
                                />
                                {integration.status === "connected"
                                  ? "Connected"
                                  : "Pending Setup"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {integration.description}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {integration.status === "connected"
                                ? `Last sync: ${integration.lastSync}`
                                : integration.lastSync}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button variant="outline" size="sm">
                                Configure
                              </Button>
                              <Button variant="outline" size="sm">
                                Test Connection
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <Button>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
