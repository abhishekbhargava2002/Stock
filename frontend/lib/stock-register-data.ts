export type StockLedgerType =
  | "OPENING_STOCK"
  | "STOCK_IN"
  | "STOCK_TRANSFER_IN"
  | "STOCK_TRANSFER_OUT"
  | "STOCK_OUT"
  | "DAILY_SALE"
  | "MANUAL_ADJUSTMENT_INCREASE"
  | "MANUAL_ADJUSTMENT_DECREASE"
  | "REVERSAL";

export interface StockRegisterEntry {
  id: string;
  date: string;
  organizationName: string;
  facilityName: string;
  godownName: string;
  itemName: string;
  skuCode: string;
  transactionType: StockLedgerType;
  quantityIn: number;
  quantityOut: number;
  balanceQuantity: number;
  unitName: string;
  rate: number;
  amount: number;
  referenceType: string;
  referenceId: string;
  remarks?: string;
  createdBy?: string;
}

export const stockRegisterData: StockRegisterEntry[] = [
  {
    id: "LED-001",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Paracetamol 500mg",
    skuCode: "ITM-001",
    transactionType: "OPENING_STOCK",
    quantityIn: 100,
    quantityOut: 0,
    balanceQuantity: 100,
    unitName: "Box",
    rate: 25,
    amount: 2500,
    referenceType: "OPENING",
    referenceId: "OPEN-001",
    remarks: "Opening stock added",
    createdBy: "Admin",
  },
  {
    id: "LED-002",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Paracetamol 500mg",
    skuCode: "ITM-001",
    transactionType: "STOCK_IN",
    quantityIn: 50,
    quantityOut: 0,
    balanceQuantity: 150,
    unitName: "Box",
    rate: 24,
    amount: 1200,
    referenceType: "STOCK_IN",
    referenceId: "SIN-001",
    remarks: "Purchase stock received",
    createdBy: "Admin",
  },
  {
    id: "LED-003",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Paracetamol 500mg",
    skuCode: "ITM-001",
    transactionType: "STOCK_TRANSFER_OUT",
    quantityIn: 0,
    quantityOut: 30,
    balanceQuantity: 120,
    unitName: "Box",
    rate: 24,
    amount: 720,
    referenceType: "STOCK_TRANSFER",
    referenceId: "TRF-001",
    remarks: "Transferred from Main Godown",
    createdBy: "Admin",
  },
  {
    id: "LED-004",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Branch Facility",
    godownName: "Branch Godown",
    itemName: "Paracetamol 500mg",
    skuCode: "ITM-001",
    transactionType: "STOCK_TRANSFER_IN",
    quantityIn: 30,
    quantityOut: 0,
    balanceQuantity: 30,
    unitName: "Box",
    rate: 24,
    amount: 720,
    referenceType: "STOCK_TRANSFER",
    referenceId: "TRF-001",
    remarks: "Received in Branch Godown",
    createdBy: "Admin",
  },
  {
    id: "LED-005",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Paracetamol 500mg",
    skuCode: "ITM-001",
    transactionType: "STOCK_OUT",
    quantityIn: 0,
    quantityOut: 10,
    balanceQuantity: 110,
    unitName: "Box",
    rate: 24,
    amount: 240,
    referenceType: "STOCK_OUT",
    referenceId: "SOUT-001",
    remarks: "Issued to department",
    createdBy: "Store Manager",
  },
  {
    id: "LED-006",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Cetirizine 10mg",
    skuCode: "ITM-002",
    transactionType: "DAILY_SALE",
    quantityIn: 0,
    quantityOut: 5,
    balanceQuantity: 45,
    unitName: "Strip",
    rate: 15,
    amount: 75,
    referenceType: "DAILY_SALE",
    referenceId: "SALE-001",
    remarks: "Daily sale entry",
    createdBy: "Sales User",
  },
  {
    id: "LED-007",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Cetirizine 10mg",
    skuCode: "ITM-002",
    transactionType: "MANUAL_ADJUSTMENT_INCREASE",
    quantityIn: 3,
    quantityOut: 0,
    balanceQuantity: 48,
    unitName: "Strip",
    rate: 15,
    amount: 45,
    referenceType: "MANUAL_ADJUSTMENT",
    referenceId: "ADJ-001",
    remarks: "Physical count found extra stock",
    createdBy: "Admin",
  },
  {
    id: "LED-008",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Dolo 650",
    skuCode: "ITM-003",
    transactionType: "MANUAL_ADJUSTMENT_DECREASE",
    quantityIn: 0,
    quantityOut: 2,
    balanceQuantity: 78,
    unitName: "Box",
    rate: 30,
    amount: 60,
    referenceType: "MANUAL_ADJUSTMENT",
    referenceId: "ADJ-002",
    remarks: "Physical count shortage",
    createdBy: "Admin",
  },
  {
    id: "LED-009",
    date: "2026-05-19",
    organizationName: "Trivoxa Demo Org",
    facilityName: "Main Facility",
    godownName: "Main Godown",
    itemName: "Dolo 650",
    skuCode: "ITM-003",
    transactionType: "REVERSAL",
    quantityIn: 2,
    quantityOut: 0,
    balanceQuantity: 80,
    unitName: "Box",
    rate: 30,
    amount: 60,
    referenceType: "REVERSAL",
    referenceId: "REV-001",
    remarks: "Reversal of incorrect adjustment",
    createdBy: "Admin",
  },
];

export const TRANSACTION_TYPE_FILTER_OPTIONS: Array<{ value: "ALL" | StockLedgerType; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "OPENING_STOCK", label: "Opening Stock" },
  { value: "STOCK_IN", label: "Stock In" },
  { value: "STOCK_TRANSFER_IN", label: "Stock Transfer In" },
  { value: "STOCK_TRANSFER_OUT", label: "Stock Transfer Out" },
  { value: "STOCK_OUT", label: "Stock Out" },
  { value: "DAILY_SALE", label: "Daily Sale" },
  { value: "MANUAL_ADJUSTMENT_INCREASE", label: "Manual Adjustment Increase" },
  { value: "MANUAL_ADJUSTMENT_DECREASE", label: "Manual Adjustment Decrease" },
  { value: "REVERSAL", label: "Reversal" },
];

export function transactionTypeLabel(type: StockLedgerType): string {
  const labels: Record<StockLedgerType, string> = {
    OPENING_STOCK: "Opening Stock",
    STOCK_IN: "Stock In",
    STOCK_TRANSFER_IN: "Transfer In",
    STOCK_TRANSFER_OUT: "Transfer Out",
    STOCK_OUT: "Stock Out",
    DAILY_SALE: "Daily Sale",
    MANUAL_ADJUSTMENT_INCREASE: "Adjustment Increase",
    MANUAL_ADJUSTMENT_DECREASE: "Adjustment Decrease",
    REVERSAL: "Reversal",
  };
  return labels[type];
}

export function transactionTypeBadgeClass(type: StockLedgerType): string {
  const classes: Record<StockLedgerType, string> = {
    OPENING_STOCK: "bg-slate-50 text-slate-700 border-slate-200",
    STOCK_IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
    STOCK_TRANSFER_IN: "bg-blue-50 text-blue-700 border-blue-200",
    STOCK_TRANSFER_OUT: "bg-blue-50 text-blue-700 border-blue-200",
    STOCK_OUT: "bg-red-50 text-red-700 border-red-200",
    DAILY_SALE: "bg-violet-50 text-violet-700 border-violet-200",
    MANUAL_ADJUSTMENT_INCREASE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MANUAL_ADJUSTMENT_DECREASE: "bg-amber-50 text-amber-700 border-amber-200",
    REVERSAL: "bg-slate-100 text-slate-600 border-slate-300",
  };
  return classes[type];
}

export function getStockRegisterSummary(data: StockRegisterEntry[]) {
  const totalStockIn = data.reduce((sum, row) => sum + row.quantityIn, 0);
  const totalStockOut = data.reduce((sum, row) => sum + row.quantityOut, 0);
  const manualAdjustments = data.filter(
    (row) =>
      row.transactionType === "MANUAL_ADJUSTMENT_INCREASE" ||
      row.transactionType === "MANUAL_ADJUSTMENT_DECREASE"
  ).length;

  const latestByKey = new Map<string, StockRegisterEntry>();
  for (const row of data) {
    const key = `${row.itemName}::${row.godownName}`;
    const existing = latestByKey.get(key);
    if (!existing || row.id.localeCompare(existing.id) > 0) {
      latestByKey.set(key, row);
    }
  }
  const currentBalanceValue = [...latestByKey.values()].reduce(
    (sum, row) => sum + row.balanceQuantity * row.rate,
    0
  );

  return {
    totalEntries: data.length,
    totalStockIn,
    totalStockOut,
    manualAdjustments,
    currentBalanceValue,
  };
}

export const stockRegisterGodowns = [...new Set(stockRegisterData.map((row) => row.godownName))].sort();
export const stockRegisterFacilities = [...new Set(stockRegisterData.map((row) => row.facilityName))].sort();
