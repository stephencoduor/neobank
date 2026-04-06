/**
 * Savings Goals React hooks for NeoBank.
 * Wraps savingsGoalsService with mock fallback.
 */
import { useApiQuery, useApiMutation } from "./use-api";
import savingsGoalsService, { type SavingsGoalResponse, type CreateGoalRequest } from "../services/savings-goals-service";

// Mock fallback goals — realistic Kenyan context
const MOCK_GOALS: SavingsGoalResponse[] = [
  {
    id: "goal-1",
    clientId: 1,
    name: "Nyumba Fund",
    targetAmountMinor: 50_000_00,
    currentAmountMinor: 32_500_00,
    sweepFrequency: "MONTHLY",
    sweepAmountMinor: 5_000_00,
    lockUntilDate: "2027-01-01",
    locked: true,
    percentComplete: 65,
    createdAt: "2026-01-15T10:00:00",
    milestones: [
      { label: "25%", targetPercent: 25, reached: true, reachedAt: "2026-02-20T08:00:00" },
      { label: "50%", targetPercent: 50, reached: true, reachedAt: "2026-03-18T12:00:00" },
      { label: "75%", targetPercent: 75, reached: false, reachedAt: null },
      { label: "100%", targetPercent: 100, reached: false, reachedAt: null },
    ],
  },
  {
    id: "goal-2",
    clientId: 1,
    name: "School Fees — Term 2",
    targetAmountMinor: 15_000_00,
    currentAmountMinor: 15_000_00,
    sweepFrequency: "WEEKLY",
    sweepAmountMinor: 2_000_00,
    lockUntilDate: null,
    locked: false,
    percentComplete: 100,
    createdAt: "2026-02-01T09:00:00",
    milestones: [
      { label: "25%", targetPercent: 25, reached: true, reachedAt: "2026-02-10T08:00:00" },
      { label: "50%", targetPercent: 50, reached: true, reachedAt: "2026-02-22T12:00:00" },
      { label: "75%", targetPercent: 75, reached: true, reachedAt: "2026-03-05T14:00:00" },
      { label: "100%", targetPercent: 100, reached: true, reachedAt: "2026-03-15T10:00:00" },
    ],
  },
  {
    id: "goal-3",
    clientId: 1,
    name: "Safari ya Mombasa",
    targetAmountMinor: 8_000_00,
    currentAmountMinor: 2_400_00,
    sweepFrequency: "WEEKLY",
    sweepAmountMinor: 500_00,
    lockUntilDate: null,
    locked: false,
    percentComplete: 30,
    createdAt: "2026-03-01T11:00:00",
    milestones: [
      { label: "25%", targetPercent: 25, reached: true, reachedAt: "2026-03-28T09:00:00" },
      { label: "50%", targetPercent: 50, reached: false, reachedAt: null },
      { label: "75%", targetPercent: 75, reached: false, reachedAt: null },
      { label: "100%", targetPercent: 100, reached: false, reachedAt: null },
    ],
  },
  {
    id: "goal-4",
    clientId: 1,
    name: "Biashara Capital",
    targetAmountMinor: 100_000_00,
    currentAmountMinor: 18_750_00,
    sweepFrequency: "MONTHLY",
    sweepAmountMinor: 10_000_00,
    lockUntilDate: "2027-06-01",
    locked: true,
    percentComplete: 19,
    createdAt: "2026-01-01T08:00:00",
    milestones: [
      { label: "25%", targetPercent: 25, reached: false, reachedAt: null },
      { label: "50%", targetPercent: 50, reached: false, reachedAt: null },
      { label: "75%", targetPercent: 75, reached: false, reachedAt: null },
      { label: "100%", targetPercent: 100, reached: false, reachedAt: null },
    ],
  },
];

export function useSavingsGoals(clientId?: number) {
  return useApiQuery<SavingsGoalResponse[]>(
    () => savingsGoalsService.list(clientId),
    [clientId],
    MOCK_GOALS,
  );
}

export function useSavingsGoal(goalId: string) {
  const fallback = MOCK_GOALS.find((g) => g.id === goalId) ?? MOCK_GOALS[0];
  return useApiQuery<SavingsGoalResponse>(
    () => savingsGoalsService.get(goalId),
    [goalId],
    fallback,
  );
}

export function useCreateGoal() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => savingsGoalsService.create(vars as CreateGoalRequest),
  );
}

export function useLockGoal() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => savingsGoalsService.lock(vars.goalId),
  );
}

export function useSweepGoal() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => savingsGoalsService.sweep(vars.goalId),
  );
}
