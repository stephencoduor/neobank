import { useState, useMemo } from "react";
import {
  Target,
  Plane,
  Laptop,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  Lock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Loader2,
  RefreshCcw,
  Milestone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSavingsGoals, useCreateGoal, useLockGoal, useSweepGoal } from "@/hooks/use-savings-goals";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtKES(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── SVG Progress Ring ────────────────────────────────────────────────────────
function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  color = "stroke-primary",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-sm font-bold"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {percentage}%
      </text>
    </svg>
  );
}

// ── Goal icon mapping ────────────────────────────────────────────────────────
const goalIcons: Record<string, typeof Target> = {
  "Nyumba Fund": Target,
  "Emergency Fund": Target,
  "School Fees": Milestone,
  "Safari ya Mombasa": Plane,
  "Biashara Capital": TrendingUp,
  "New Laptop": Laptop,
  "Nairobi Trip": Plane,
};
const goalColors = ["stroke-primary", "stroke-gold", "stroke-chart-3", "stroke-chart-4"];

const activeDeposits = [
  {
    id: 1,
    principal: 200000,
    rate: 10.5,
    tenure: 12,
    startDate: "Jan 2026",
    maturityDate: "Jan 2027",
    earned: 8750,
    status: "Active",
  },
  {
    id: 2,
    principal: 100000,
    rate: 9.8,
    tenure: 6,
    startDate: "Feb 2026",
    maturityDate: "Aug 2026",
    earned: 3267,
    status: "Active",
  },
];

const maturedDeposits = [
  {
    id: 3,
    principal: 50000,
    rate: 9.5,
    tenure: 12,
    startDate: "Mar 2025",
    maturityDate: "Mar 2026",
    earned: 4875,
    status: "Matured",
  },
];

const interestRates = [
  { tenure: "3 months", rate: 8.5 },
  { tenure: "6 months", rate: 9.8 },
  { tenure: "9 months", rate: 10.2 },
  { tenure: "12 months", rate: 10.5 },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function SavingsPage() {
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState("12");
  const [depositAmount, setDepositAmount] = useState("");

  // New goal form state
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalAutoSave, setNewGoalAutoSave] = useState(false);
  const [newGoalAutoAmount, setNewGoalAutoAmount] = useState("");

  // API hooks — falls back to mock data when backend is unavailable
  const { data: apiGoals, loading: goalsLoading, error: goalsError, refetch: refetchGoals } = useSavingsGoals();
  const { mutate: createGoal, loading: creating } = useCreateGoal();

  // Transform API goals into display format
  const savingsGoals = useMemo(() => {
    if (!apiGoals) return [];
    return apiGoals.map((g, i) => {
      const iconKey = Object.keys(goalIcons).find((k) => g.name.includes(k));
      return {
        id: g.id,
        name: g.name,
        icon: iconKey ? goalIcons[iconKey] : Target,
        target: g.targetAmountMinor / 100,
        saved: g.currentAmountMinor / 100,
        percentage: g.percentComplete,
        color: goalColors[i % goalColors.length],
        autoSave: g.sweepFrequency !== "NONE",
        autoSaveAmount: g.sweepAmountMinor / 100,
        note: g.locked
          ? `Locked until ${g.lockUntilDate ?? "maturity"}`
          : g.sweepFrequency !== "NONE"
            ? `${g.sweepFrequency.toLowerCase()} auto-save KES ${(g.sweepAmountMinor / 100).toLocaleString()}`
            : `${g.percentComplete}% complete`,
        locked: g.locked,
        milestones: g.milestones,
      };
    });
  }, [apiGoals]);

  async function handleCreateGoal() {
    if (!newGoalName || !newGoalTarget) return;
    await createGoal({
      clientId: 1,
      name: newGoalName,
      targetAmountMinor: Number(newGoalTarget) * 100,
      sweepFrequency: newGoalAutoSave ? "MONTHLY" : "NONE",
      sweepAmountMinor: newGoalAutoSave ? Number(newGoalAutoAmount) * 100 : 0,
    });
    setGoalDialogOpen(false);
    setNewGoalName("");
    setNewGoalTarget("");
    setNewGoalAutoSave(false);
    setNewGoalAutoAmount("");
    refetchGoals();
  }

  const tenureMonths = parseInt(selectedTenure, 10);
  const rate = interestRates.find(
    (r) => r.tenure === `${tenureMonths} months`
  )?.rate ?? 10.5;
  const projectedInterest =
    depositAmount && !isNaN(Number(depositAmount))
      ? Math.round(
          (Number(depositAmount) * rate * tenureMonths) / (12 * 100)
        )
      : 0;

  const totalSaved = savingsGoals.reduce((s, g) => s + g.saved, 0);
  const totalDeposits = activeDeposits.reduce((s, d) => s + d.principal, 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Savings & Deposits
          </h1>
          <p className="text-sm text-muted-foreground">
            Grow your money with goals and fixed deposits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="border-0 bg-primary/10 px-4 py-2">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-lg font-bold text-primary">{fmtKES(totalSaved)}</p>
          </Card>
          <Card className="border-0 bg-gold/10 px-4 py-2">
            <p className="text-xs text-muted-foreground">Fixed Deposits</p>
            <p className="text-lg font-bold text-gold">{fmtKES(totalDeposits)}</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals">
            <PiggyBank className="h-4 w-4" />
            Savings Goals
          </TabsTrigger>
          <TabsTrigger value="deposits">
            <Lock className="h-4 w-4" />
            Fixed Deposits
          </TabsTrigger>
        </TabsList>

        {/* ── Savings Goals Tab ─────────────────────────────────────────── */}
        <TabsContent value="goals">
          <div className="flex flex-col gap-4">
            {/* Loading / error states */}
            {goalsLoading && savingsGoals.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading savings goals...</span>
              </div>
            )}
            {goalsError && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-600">
                <span>Using offline data — backend unavailable</span>
                <Button variant="ghost" size="sm" onClick={refetchGoals}>
                  <RefreshCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savingsGoals.map((goal) => (
                <Card key={goal.id} className="relative overflow-hidden">
                  <CardContent className="flex flex-col gap-4 p-5">
                    {/* Top row: icon + progress ring */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <goal.icon className="h-5 w-5 text-foreground" />
                        </span>
                        <div>
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {goal.note}
                          </p>
                        </div>
                      </div>
                      <ProgressRing
                        percentage={goal.percentage}
                        color={goal.color}
                      />
                    </div>

                    {/* Amounts */}
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">
                          Saved
                        </span>
                        <span className="text-lg font-bold">
                          {fmtKES(goal.saved)}
                        </span>
                      </div>
                      <Progress value={goal.percentage} />
                      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                        <span>Target: {fmtKES(goal.target)}</span>
                        <span>
                          {fmtKES(goal.target - goal.saved)} remaining
                        </span>
                      </div>
                    </div>

                    {/* Auto-save badge & Lock badge */}
                    <div className="flex flex-wrap gap-1.5">
                      {goal.autoSave && (
                        <Badge
                          variant="secondary"
                          className="w-fit gap-1 text-xs"
                        >
                          <TrendingUp className="h-3 w-3" />
                          Auto-save {fmtKES(goal.autoSaveAmount)}/mo
                        </Badge>
                      )}
                      {goal.locked && (
                        <Badge
                          variant="secondary"
                          className="w-fit gap-1 text-xs bg-amber-500/10 text-amber-600"
                        >
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1.5">
                        <ArrowDownToLine className="h-4 w-4" />
                        Add Money
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                      >
                        <ArrowUpFromLine className="h-4 w-4" />
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create New Goal */}
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" className="w-fit gap-2" />
                }
              >
                <Plus className="h-4 w-4" />
                Create New Goal
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Savings Goal</DialogTitle>
                  <DialogDescription>
                    Set a savings target and track your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="goal-name">Goal Name</Label>
                    <Input
                      id="goal-name"
                      placeholder="e.g. Nyumba Fund, School Fees"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="goal-target">Target Amount (KES)</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      placeholder="e.g. 250,000"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="goal-deadline">Deadline</Label>
                    <Input id="goal-deadline" type="date" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Auto-Save</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically save each month
                      </p>
                    </div>
                    <Switch
                      checked={newGoalAutoSave}
                      onCheckedChange={setNewGoalAutoSave}
                    />
                  </div>
                  {newGoalAutoSave && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="auto-amount">
                        Monthly Auto-Save Amount (KES)
                      </Label>
                      <Input
                        id="auto-amount"
                        type="number"
                        placeholder="e.g. 10,000"
                        value={newGoalAutoAmount}
                        onChange={(e) => setNewGoalAutoAmount(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    className="w-full gap-2"
                    onClick={handleCreateGoal}
                    disabled={creating || !newGoalName || !newGoalTarget}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                    {creating ? "Creating..." : "Create Goal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* ── Fixed Deposits Tab ────────────────────────────────────────── */}
        <TabsContent value="deposits">
          <div className="flex flex-col gap-6">
            {/* Interest Rate Cards */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Current Interest Rates
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {interestRates.map((r) => (
                  <Card
                    key={r.tenure}
                    className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 text-center"
                  >
                    <CardContent className="py-3">
                      <p className="text-2xl font-bold text-primary">
                        {r.rate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.tenure}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Active Deposits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Active Deposits</CardTitle>
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  {activeDeposits.length} Active
                </Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Tenure</TableHead>
                      <TableHead>Maturity</TableHead>
                      <TableHead className="text-right">
                        Interest Earned
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeDeposits.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          {fmtKES(d.principal)}
                        </TableCell>
                        <TableCell>{d.rate}% p.a.</TableCell>
                        <TableCell>{d.tenure} months</TableCell>
                        <TableCell>{d.maturityDate}</TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          +{fmtKES(d.earned)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary">
                            {d.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Matured Deposits */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Matured Deposits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Tenure</TableHead>
                      <TableHead>Matured On</TableHead>
                      <TableHead className="text-right">
                        Total Interest
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maturedDeposits.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          {fmtKES(d.principal)}
                        </TableCell>
                        <TableCell>{d.rate}% p.a.</TableCell>
                        <TableCell>{d.tenure} months</TableCell>
                        <TableCell>{d.maturityDate}</TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          +{fmtKES(d.earned)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="gap-1 bg-success/10 text-success"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {d.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Open Fixed Deposit Dialog */}
            <Dialog
              open={depositDialogOpen}
              onOpenChange={setDepositDialogOpen}
            >
              <DialogTrigger
                render={
                  <Button className="w-fit gap-2" />
                }
              >
                <Plus className="h-4 w-4" />
                Open Fixed Deposit
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Open Fixed Deposit</DialogTitle>
                  <DialogDescription>
                    Lock your funds and earn guaranteed interest
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="deposit-amount">
                      Deposit Amount (KES)
                    </Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="Minimum KES 10,000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum deposit: KES 10,000
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Tenure</Label>
                    <Select
                      value={selectedTenure}
                      onValueChange={setSelectedTenure}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Months (8.5% p.a.)</SelectItem>
                        <SelectItem value="6">6 Months (9.8% p.a.)</SelectItem>
                        <SelectItem value="9">9 Months (10.2% p.a.)</SelectItem>
                        <SelectItem value="12">
                          12 Months (10.5% p.a.)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Projected Interest */}
                  <Card className="border-0 bg-gradient-to-r from-primary/5 to-gold/5">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Projected Interest
                        </p>
                        <p className="text-xl font-bold text-primary">
                          {fmtKES(projectedInterest)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          At Maturity
                        </p>
                        <p className="text-lg font-semibold">
                          {fmtKES(
                            (Number(depositAmount) || 0) + projectedInterest
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 rounded-lg bg-gold/10 p-3 text-xs text-gold">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      Maturity date:{" "}
                      {new Date(
                        Date.now() + tenureMonths * 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-KE", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="w-full gap-2"
                    onClick={() => setDepositDialogOpen(false)}
                  >
                    <Lock className="h-4 w-4" />
                    Open Deposit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
