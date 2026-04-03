// ── Mock Data — Realistic Kenyan/East African Context ───────────────────────

export const currentUser = {
  id: "USR-001",
  firstName: "Amina",
  lastName: "Wanjiku",
  email: "amina.wanjiku@gmail.com",
  phone: "+254 712 345 678",
  avatar: "",
  tier: "Standard" as const,
  kycStatus: "verified" as const,
  createdAt: "2025-11-15",
};

export const accounts = [
  {
    id: "ACC-001",
    name: "Main Account",
    type: "savings" as const,
    currency: "KES",
    balance: 147_520.0,
    availableBalance: 145_020.0,
    pendingAmount: 2_500.0,
    accountNumber: "2024 **** **** 7891",
    status: "active" as const,
  },
  {
    id: "ACC-002",
    name: "Business Account",
    type: "business" as const,
    currency: "KES",
    balance: 892_100.5,
    availableBalance: 890_100.5,
    pendingAmount: 2_000.0,
    accountNumber: "2024 **** **** 3456",
    status: "active" as const,
  },
  {
    id: "ACC-003",
    name: "USD Account",
    type: "savings" as const,
    currency: "USD",
    balance: 1_250.0,
    availableBalance: 1_250.0,
    pendingAmount: 0,
    accountNumber: "2024 **** **** 9012",
    status: "active" as const,
  },
];

export const cards = [
  {
    id: "CRD-001",
    type: "virtual" as const,
    brand: "Visa",
    last4: "4523",
    name: "Amina Wanjiku",
    expiryDate: "12/28",
    status: "active" as const,
    balance: 147_520.0,
    currency: "KES",
    spendLimit: 500_000,
    spentThisMonth: 89_200,
    frozen: false,
    color: "primary" as const,
  },
  {
    id: "CRD-002",
    type: "physical" as const,
    brand: "Mastercard",
    last4: "8917",
    name: "Amina Wanjiku",
    expiryDate: "06/29",
    status: "active" as const,
    balance: 892_100.5,
    currency: "KES",
    spendLimit: 1_000_000,
    spentThisMonth: 234_500,
    frozen: false,
    color: "gold" as const,
  },
];

export const transactions = [
  {
    id: "TXN-001",
    type: "credit" as const,
    category: "p2p" as const,
    description: "From James Ochieng",
    amount: 5_000,
    currency: "KES",
    date: "2026-04-03T10:30:00",
    status: "completed" as const,
    reference: "P2P-2026040310300001",
  },
  {
    id: "TXN-002",
    type: "debit" as const,
    category: "merchant" as const,
    description: "Naivas Supermarket - Westlands",
    amount: 3_450,
    currency: "KES",
    date: "2026-04-03T09:15:00",
    status: "completed" as const,
    reference: "MRC-2026040309150002",
  },
  {
    id: "TXN-003",
    type: "debit" as const,
    category: "mobile_money" as const,
    description: "M-Pesa Top Up",
    amount: 10_000,
    currency: "KES",
    date: "2026-04-02T16:45:00",
    status: "completed" as const,
    reference: "MPE-2026040216450003",
  },
  {
    id: "TXN-004",
    type: "credit" as const,
    category: "salary" as const,
    description: "Salary - Qsoftwares Ltd",
    amount: 125_000,
    currency: "KES",
    date: "2026-04-01T08:00:00",
    status: "completed" as const,
    reference: "SAL-2026040108000004",
  },
  {
    id: "TXN-005",
    type: "debit" as const,
    category: "card" as const,
    description: "Bolt Ride - CBD to Kilimani",
    amount: 780,
    currency: "KES",
    date: "2026-04-01T18:30:00",
    status: "completed" as const,
    reference: "CRD-2026040118300005",
  },
  {
    id: "TXN-006",
    type: "debit" as const,
    category: "bills" as const,
    description: "KPLC Electricity - Token",
    amount: 2_500,
    currency: "KES",
    date: "2026-03-31T12:00:00",
    status: "completed" as const,
    reference: "BIL-2026033112000006",
  },
  {
    id: "TXN-007",
    type: "debit" as const,
    category: "p2p" as const,
    description: "To Faith Njeri",
    amount: 15_000,
    currency: "KES",
    date: "2026-03-30T14:20:00",
    status: "completed" as const,
    reference: "P2P-2026033014200007",
  },
  {
    id: "TXN-008",
    type: "debit" as const,
    category: "merchant" as const,
    description: "Java House - Kenyatta Ave",
    amount: 1_200,
    currency: "KES",
    date: "2026-03-30T08:45:00",
    status: "completed" as const,
    reference: "MRC-2026033008450008",
  },
  {
    id: "TXN-009",
    type: "credit" as const,
    category: "refund" as const,
    description: "Refund - Jumia Kenya",
    amount: 4_300,
    currency: "KES",
    date: "2026-03-29T11:00:00",
    status: "pending" as const,
    reference: "REF-2026032911000009",
  },
  {
    id: "TXN-010",
    type: "debit" as const,
    category: "subscription" as const,
    description: "Netflix Subscription",
    amount: 1_100,
    currency: "KES",
    date: "2026-03-28T00:00:00",
    status: "completed" as const,
    reference: "SUB-2026032800000010",
  },
];

export const recentContacts = [
  { id: "C-001", name: "James Ochieng", phone: "+254 722 111 222", avatar: "" },
  { id: "C-002", name: "Faith Njeri", phone: "+254 733 222 333", avatar: "" },
  { id: "C-003", name: "David Kamau", phone: "+254 712 333 444", avatar: "" },
  { id: "C-004", name: "Grace Akinyi", phone: "+254 700 444 555", avatar: "" },
  { id: "C-005", name: "Peter Mwangi", phone: "+254 791 555 666", avatar: "" },
];

export const notifications = [
  { id: "N-001", type: "transaction" as const, title: "Payment Received", message: "KES 5,000 from James Ochieng", time: "10 min ago", read: false },
  { id: "N-002", type: "security" as const, title: "New Login Detected", message: "Login from Chrome on Windows", time: "1 hour ago", read: false },
  { id: "N-003", type: "card" as const, title: "Card Transaction", message: "KES 3,450 at Naivas Supermarket", time: "2 hours ago", read: true },
  { id: "N-004", type: "promo" as const, title: "Earn Cashback!", message: "Get 2% cashback on all card payments this week", time: "1 day ago", read: true },
];

export const kycDocuments = [
  { id: "DOC-001", type: "National ID", status: "verified" as const, uploadedAt: "2025-11-15" },
  { id: "DOC-002", type: "Selfie Verification", status: "verified" as const, uploadedAt: "2025-11-15" },
  { id: "DOC-003", type: "Proof of Address", status: "pending" as const, uploadedAt: "2026-03-20" },
];

// Merchant data
export const merchantProfile = {
  id: "MER-001",
  businessName: "Mama Njeri's Kitchen",
  category: "Food & Beverage",
  location: "Tom Mboya Street, Nairobi CBD",
  phone: "+254 722 987 654",
  status: "active" as const,
  mdr: 1.5,
  settlementType: "instant" as const,
  totalRevenue: 1_245_000,
  todayRevenue: 34_500,
  terminals: 2,
};

export const merchantTransactions = [
  { id: "MT-001", customer: "Walk-in Customer", amount: 850, method: "NFC Tap", time: "14:32", status: "completed" as const },
  { id: "MT-002", customer: "James K.", amount: 1_200, method: "QR Code", time: "14:15", status: "completed" as const },
  { id: "MT-003", customer: "Amina W.", amount: 3_450, method: "Card Chip", time: "13:50", status: "completed" as const },
  { id: "MT-004", customer: "Walk-in Customer", amount: 500, method: "M-Pesa", time: "13:20", status: "completed" as const },
  { id: "MT-005", customer: "Peter M.", amount: 2_100, method: "NFC Tap", time: "12:45", status: "pending" as const },
];

// Admin data
export const adminStats = {
  totalUsers: 12_458,
  activeUsers: 8_932,
  totalTransactions: 89_234,
  totalVolume: 245_000_000,
  pendingKyc: 47,
  flaggedTransactions: 12,
  activeCards: 6_234,
  activeMerchants: 1_245,
};

export const kycReviewQueue = [
  { id: "KYC-001", name: "John Wambua", phone: "+254 700 123 456", documentType: "National ID", submittedAt: "2026-04-03T09:00:00", status: "pending" as const, riskScore: 15 },
  { id: "KYC-002", name: "Sarah Achieng", phone: "+254 733 234 567", documentType: "Passport", submittedAt: "2026-04-03T08:30:00", status: "pending" as const, riskScore: 8 },
  { id: "KYC-003", name: "Michael Kipchoge", phone: "+254 712 345 678", documentType: "National ID", submittedAt: "2026-04-02T16:00:00", status: "under_review" as const, riskScore: 42 },
  { id: "KYC-004", name: "Lucy Wanjiku", phone: "+254 791 456 789", documentType: "Alien ID", submittedAt: "2026-04-02T14:00:00", status: "pending" as const, riskScore: 25 },
  { id: "KYC-005", name: "Hassan Mohamed", phone: "+254 722 567 890", documentType: "National ID", submittedAt: "2026-04-02T10:00:00", status: "flagged" as const, riskScore: 78 },
];

export const chartData = {
  weekly: [
    { day: "Mon", income: 45000, spending: 12000 },
    { day: "Tue", income: 8000, spending: 23000 },
    { day: "Wed", income: 15000, spending: 8500 },
    { day: "Thu", income: 125000, spending: 3450 },
    { day: "Fri", income: 5000, spending: 15780 },
    { day: "Sat", income: 0, spending: 6200 },
    { day: "Sun", income: 0, spending: 1100 },
  ],
};
