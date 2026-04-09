import api from "./api-client";

const cardService = {
  getClientCards: (clientId: number) =>
    api.get(`/v1/neobank/cards/client/${clientId}`),

  getCard: (cardId: string) =>
    api.get(`/v1/neobank/cards/${cardId}`),

  getCardTransactions: (cardId: string, limit = 10) =>
    api.get(`/v1/neobank/cards/${cardId}/transactions?limit=${limit}`),

  issueVirtualCard: (clientId: number, accountRef: string, cardholderName: string) =>
    api.post("/v1/neobank/cards/issue", { clientId, accountRef, cardholderName }),

  toggleFreeze: (cardId: string, freeze: boolean) =>
    api.post(`/v1/neobank/cards/${cardId}/freeze`, { freeze }),

  updateLimits: (cardId: string, dailyLimit: number, monthlyLimit: number) =>
    api.put(`/v1/neobank/cards/${cardId}/limits`, { dailyLimit, monthlyLimit }),

  requestPinReset: (cardId: string) =>
    api.post(`/v1/neobank/cards/${cardId}/pin-reset`, {}),
};

export default cardService;
