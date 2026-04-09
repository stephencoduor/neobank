import api from "./api-client";

const merchantService = {
  list: () => api.get("/v1/neobank/merchants"),

  get: (merchantId: string) => api.get(`/v1/neobank/merchants/${merchantId}`),

  register: (data: { businessName: string; businessType: string; ownerName: string; phone: string; email: string; location: string }) =>
    api.post("/v1/neobank/merchants/register", data),

  configureSettlement: (merchantId: string, frequency: string, bankCode: string, accountNumber: string) =>
    api.put(`/v1/neobank/merchants/${merchantId}/settlement`, { frequency, bankCode, accountNumber }),

  getRevenue: (merchantId: string) =>
    api.get(`/v1/neobank/merchants/${merchantId}/revenue`),
};

export default merchantService;
