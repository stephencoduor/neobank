import { useApiQuery, useApiMutation } from "./use-api";
import qrService from "../services/qr-service";

const MOCK_QR = {
  qrId: "QR-DEMO0001",
  qrContent: '{"type":"NEOBANK_QR","id":"QR-DEMO0001","acc":"ACC-001","amt":0,"name":"Amina Wanjiku","desc":"Payment","exp":"2026-04-06T12:00:00Z"}',
  accountRef: "ACC-001",
  amount: 0,
  merchantName: "Amina Wanjiku",
  description: "Payment",
  expiresAt: "2026-04-06T12:00:00Z",
  status: "ACTIVE",
};

export function useGenerateQr() {
  return useApiMutation((vars: unknown) => {
    const { accountRef, amount, merchantName, description } = vars as {
      accountRef: string; amount: number; merchantName?: string; description?: string;
    };
    return qrService.generate(accountRef, amount, merchantName, description);
  });
}

export function useScanQr() {
  return useApiMutation((vars: unknown) => {
    const { qrContent } = vars as { qrContent: string };
    return qrService.scan(qrContent);
  });
}

export function useQrPay() {
  return useApiMutation((vars: unknown) => {
    const { qrId, senderAccount, amount } = vars as { qrId: string; senderAccount: string; amount: number };
    return qrService.pay(qrId, senderAccount, amount);
  });
}
