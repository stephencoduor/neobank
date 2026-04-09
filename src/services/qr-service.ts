import api from "./api-client";

const qrService = {
  generate: (accountRef: string, amount: number, merchantName?: string, description?: string) =>
    api.post("/v1/neobank/qr/generate", { accountRef, amount, merchantName, description }),

  scan: (qrContent: string) =>
    api.post("/v1/neobank/qr/scan", { qrContent }),

  pay: (qrId: string, senderAccount: string, amount: number) =>
    api.post("/v1/neobank/qr/pay", { qrId, senderAccount, amount }),
};

export default qrService;
