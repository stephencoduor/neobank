import { useApiQuery, useApiMutation } from "./use-api";
import cardService from "../services/card-service";

const MOCK_CARDS = [
  {
    cardId: "CARD-V-001", clientId: 1, accountRef: "ACC-001", cardholderName: "AMINA WANJIKU",
    type: "VIRTUAL", network: "VISA", last4: "4532", maskedNumber: "**** **** **** 4532",
    expiryDate: "2029-04", status: "ACTIVE", frozen: false,
    dailyLimit: 50000, monthlyLimit: 500000, todaySpend: 4650, monthSpend: 24399,
  },
  {
    cardId: "CARD-P-001", clientId: 1, accountRef: "ACC-001", cardholderName: "AMINA WANJIKU",
    type: "PHYSICAL", network: "MASTERCARD", last4: "8901", maskedNumber: "**** **** **** 8901",
    expiryDate: "2028-12", status: "ACTIVE", frozen: false,
    dailyLimit: 100000, monthlyLimit: 1000000, todaySpend: 0, monthSpend: 12500,
  },
];

const MOCK_TRANSACTIONS = [
  { id: "CTX-001", merchant: "Naivas Supermarket", category: "GROCERIES", amount: -3450, currency: "KES", date: "2026-04-05", status: "COMPLETED" },
  { id: "CTX-002", merchant: "Java House Westlands", category: "FOOD_DRINK", amount: -1200, currency: "KES", date: "2026-04-04", status: "COMPLETED" },
  { id: "CTX-003", merchant: "Bolt Kenya", category: "TRANSPORT", amount: -850, currency: "KES", date: "2026-04-04", status: "COMPLETED" },
  { id: "CTX-004", merchant: "Netflix", category: "ENTERTAINMENT", amount: -1100, currency: "KES", date: "2026-04-03", status: "COMPLETED" },
  { id: "CTX-005", merchant: "Shell Uhuru Highway", category: "FUEL", amount: -5000, currency: "KES", date: "2026-04-02", status: "COMPLETED" },
  { id: "CTX-006", merchant: "Jumia Kenya", category: "SHOPPING", amount: -7800, currency: "KES", date: "2026-04-01", status: "COMPLETED" },
];

export function useClientCards(clientId: number) {
  return useApiQuery(() => cardService.getClientCards(clientId), [clientId], MOCK_CARDS);
}

export function useCard(cardId: string) {
  return useApiQuery(() => cardService.getCard(cardId), [cardId], MOCK_CARDS.find(c => c.cardId === cardId) ?? MOCK_CARDS[0]);
}

export function useCardTransactions(cardId: string) {
  return useApiQuery(() => cardService.getCardTransactions(cardId), [cardId], MOCK_TRANSACTIONS);
}

export function useIssueVirtualCard() {
  return useApiMutation((vars: unknown) => {
    const { clientId, accountRef, cardholderName } = vars as { clientId: number; accountRef: string; cardholderName: string };
    return cardService.issueVirtualCard(clientId, accountRef, cardholderName);
  });
}

export function useToggleFreeze() {
  return useApiMutation((vars: unknown) => {
    const { cardId, freeze } = vars as { cardId: string; freeze: boolean };
    return cardService.toggleFreeze(cardId, freeze);
  });
}

export function useUpdateCardLimits() {
  return useApiMutation((vars: unknown) => {
    const { cardId, dailyLimit, monthlyLimit } = vars as { cardId: string; dailyLimit: number; monthlyLimit: number };
    return cardService.updateLimits(cardId, dailyLimit, monthlyLimit);
  });
}

export function useRequestPinReset() {
  return useApiMutation((vars: unknown) => {
    const { cardId } = vars as { cardId: string };
    return cardService.requestPinReset(cardId);
  });
}
