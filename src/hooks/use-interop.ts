/**
 * Interop Hub hooks for NeoBank.
 * Wraps interopService with mock fallback for carrier routing.
 */
import { useApiQuery, useApiMutation } from "./use-api";
import interopService, { type CostOption, type CarrierHealth, type SendMoneyRequest } from "../services/interop-service";

const MOCK_COSTS: CostOption[] = [
  { carrier: "TELKOM", feeMinor: 1000, healthScore: 95, available: true },
  { carrier: "AIRTEL", feeMinor: 1200, healthScore: 98, available: true },
  { carrier: "MPESA", feeMinor: 1500, healthScore: 100, available: true },
];

const MOCK_HEALTH: CarrierHealth[] = [
  { carrier: "MPESA", healthScore: 100, available: true },
  { carrier: "AIRTEL", healthScore: 98, available: true },
  { carrier: "TELKOM", healthScore: 95, available: true },
];

export function useCarrierCosts(amountMinor: number) {
  return useApiQuery<CostOption[]>(
    () => interopService.compareCosts(amountMinor),
    [amountMinor],
    MOCK_COSTS,
  );
}

export function useCarrierHealth() {
  return useApiQuery<CarrierHealth[]>(
    () => interopService.getCarrierHealth(),
    [],
    MOCK_HEALTH,
  );
}

export function useSendMoney() {
  return useApiMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vars: any) => interopService.sendMoney(vars as SendMoneyRequest),
  );
}
