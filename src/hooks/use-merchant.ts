import { useApiQuery, useApiMutation } from "./use-api";
import merchantService from "../services/merchant-service";

const MOCK_MERCHANTS = [
  {
    merchantId: "MER-001", businessName: "Mama Njeri's Kitchen", businessType: "RESTAURANT",
    ownerName: "Njeri Kamau", phone: "+254 722 456 789", location: "Tom Mboya Street, Nairobi CBD",
    tillNumber: "5274831", status: "ACTIVE", kybStatus: "VERIFIED",
    totalRevenue: 1245000, totalTransactions: 623,
  },
  {
    merchantId: "MER-002", businessName: "Westlands Auto Spares", businessType: "RETAIL",
    ownerName: "John Odhiambo", phone: "+254 733 123 456", location: "Westlands, Nairobi",
    tillNumber: "6389201", status: "ACTIVE", kybStatus: "VERIFIED",
    totalRevenue: 3890000, totalTransactions: 412,
  },
];

const MOCK_REVENUE = {
  merchantId: "MER-001", businessName: "Mama Njeri's Kitchen",
  today: { revenue: 45600, transactions: 23, avgTicket: 1983 },
  thisWeek: { revenue: 312400, transactions: 156, avgTicket: 2003 },
  thisMonth: { revenue: 1245000, transactions: 623, avgTicket: 1998 },
  topProducts: [
    { name: "Lunch Special", revenue: 345000, count: 230 },
    { name: "Nyama Choma", revenue: 280000, count: 112 },
    { name: "Chai & Mandazi", revenue: 156000, count: 520 },
    { name: "Ugali & Sukuma", revenue: 134000, count: 178 },
  ],
  peakHours: [
    { hour: "12:00-13:00", transactions: 45 },
    { hour: "18:00-19:00", transactions: 38 },
    { hour: "07:00-08:00", transactions: 28 },
  ],
};

export function useMerchants() {
  return useApiQuery(() => merchantService.list(), [], MOCK_MERCHANTS);
}

export function useMerchant(merchantId: string) {
  return useApiQuery(() => merchantService.get(merchantId), [merchantId], MOCK_MERCHANTS[0]);
}

export function useMerchantRevenue(merchantId: string) {
  return useApiQuery(() => merchantService.getRevenue(merchantId), [merchantId], MOCK_REVENUE);
}

export function useRegisterMerchant() {
  return useApiMutation((vars: unknown) => {
    const data = vars as { businessName: string; businessType: string; ownerName: string; phone: string; email: string; location: string };
    return merchantService.register(data);
  });
}
