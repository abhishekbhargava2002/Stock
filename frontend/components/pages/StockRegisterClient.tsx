"use client";

import { useMemo, useState } from "react";
import { Eye, FileText, PackageMinus, PackagePlus, Scale, SlidersHorizontal, X } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { Button, Input, Select } from "@/components/shared/FormBits";
import {
  getStockRegisterSummary,
  stockRegisterData,
  stockRegisterFacilities,
  stockRegisterGodowns,
  TRANSACTION_TYPE_FILTER_OPTIONS,
  transactionTypeBadgeClass,
  transactionTypeLabel,
  type StockLedgerType,
  type StockRegisterEntry,
} from "@/lib/stock-register-data";
import { inr, number } from "@/lib/utils";

function TransactionTypeBadge({ type }: { type: StockLedgerType }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${transactionTypeBadgeClass(type)}`}
    >
      {transactionTypeLabel(type)}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-charcoal">{value}</p>
    </div>
  );
}

function LedgerDetailsModal({
  entry,
  onClose,
}: {
  entry: StockRegisterEntry;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <section
        className="mx-auto max-h-[92vh] max-w-4xl overflow-y-auto rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emeraldDeep">Ledger Details</p>
            <h2 className="mt-1 text-xl font-black text-charcoal">{entry.itemName}</h2>
            <p className="mt-1 text-sm text-slate-500">{entry.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Ledger ID" value={entry.id} />
          <DetailRow label="Date" value={entry.date} />
          <DetailRow label="Item Name" value={entry.itemName} />
          <DetailRow label="SKU Code" value={entry.skuCode} />
          <DetailRow label="Transaction Type" value={<TransactionTypeBadge type={entry.transactionType} />} />
          <DetailRow label="Facility" value={entry.facilityName} />
          <DetailRow label="Godown" value={entry.godownName} />
          <DetailRow label="Quantity In" value={entry.quantityIn || "—"} />
          <DetailRow label="Quantity Out" value={entry.quantityOut || "—"} />
          <DetailRow label="Balance Quantity" value={entry.balanceQuantity} />
          <DetailRow label="Unit" value={entry.unitName} />
          <DetailRow label="Rate" value={inr(entry.rate)} />
          <DetailRow label="Amount" value={inr(entry.amount)} />
          <DetailRow label="Reference Type" value={entry.referenceType} />
          <DetailRow label="Reference ID" value={entry.referenceId} />
          <DetailRow label="Created By" value={entry.createdBy || "—"} />
          <DetailRow label="Remarks" value={entry.remarks || "—"} />
        </div>
      </section>
    </div>
  );
}

export default function StockRegisterClient() {
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState<"ALL" | StockLedgerType>("ALL");
  const [godown, setGodown] = useState("All Godowns");
  const [facility, setFacility] = useState("All Facilities");
  const [selectedEntry, setSelectedEntry] = useState<StockRegisterEntry | null>(null);

  const summary = useMemo(() => getStockRegisterSummary(stockRegisterData), []);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stockRegisterData.filter((row) => {
      const matchesSearch =
        !query ||
        row.itemName.toLowerCase().includes(query) ||
        row.skuCode.toLowerCase().includes(query);
      const matchesType = transactionType === "ALL" || row.transactionType === transactionType;
      const matchesGodown = godown === "All Godowns" || row.godownName === godown;
      const matchesFacility = facility === "All Facilities" || row.facilityName === facility;
      return matchesSearch && matchesType && matchesGodown && matchesFacility;
    });
  }, [search, transactionType, godown, facility]);

  const clearFilters = () => {
    setSearch("");
    setTransactionType("ALL");
    setGodown("All Godowns");
    setFacility("All Facilities");
  };

  return (
    <>
      <PageHeader
        eyebrow="Stock"
        title="Stock Register"
        subtitle="View item-wise stock ledger transactions including stock in, transfers, stock out, sales, and manual adjustments."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Ledger Entries" value={number(summary.totalEntries)} icon={FileText} />
        <StatCard title="Total Stock In" value={number(summary.totalStockIn)} note="Sum of quantity in" icon={PackagePlus} tone="mint" />
        <StatCard title="Total Stock Out" value={number(summary.totalStockOut)} note="Sum of quantity out" icon={PackageMinus} tone="red" />
        <StatCard title="Manual Adjustments" value={number(summary.manualAdjustments)} note="Increase & decrease entries" icon={SlidersHorizontal} tone="amber" />
        <StatCard title="Current Balance Value" value={inr(summary.currentBalanceValue)} note="Latest balance by item & godown" icon={Scale} tone="blue" />
      </div>

      <div className="mb-5 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Search item name or SKU code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value as "ALL" | StockLedgerType)}>
          {TRANSACTION_TYPE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select value={godown} onChange={(e) => setGodown(e.target.value)}>
          <option>All Godowns</option>
          {stockRegisterGodowns.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Select value={facility} onChange={(e) => setFacility(e.target.value)}>
          <option>All Facilities</option>
          {stockRegisterFacilities.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Button type="button" variant="secondary" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="No stock register transactions found."
          description="Try changing search text or filters to see ledger entries."
        />
      ) : (
        <DataTable
          headers={[
            "Date",
            "Item Name",
            "SKU Code",
            "Transaction Type",
            "Godown",
            "Quantity In",
            "Quantity Out",
            "Balance Quantity",
            "Unit",
            "Rate",
            "Amount",
            "Reference Type",
            "Reference No",
            "Remarks",
            "Action",
          ]}
        >
          {filteredRows.map((row) => (
            <tr key={row.id}>
              <Td>{row.date}</Td>
              <Td>{row.itemName}</Td>
              <Td>{row.skuCode}</Td>
              <Td>
                <TransactionTypeBadge type={row.transactionType} />
              </Td>
              <Td>{row.godownName}</Td>
              <Td className="text-emeraldDeep">{row.quantityIn > 0 ? row.quantityIn : "—"}</Td>
              <Td className="text-red-600">{row.quantityOut > 0 ? row.quantityOut : "—"}</Td>
              <Td>{row.balanceQuantity}</Td>
              <Td>{row.unitName}</Td>
              <Td>{inr(row.rate)}</Td>
              <Td>{inr(row.amount)}</Td>
              <Td>{row.referenceType}</Td>
              <Td>{row.referenceId}</Td>
              <Td className="max-w-[180px] truncate">{row.remarks || "—"}</Td>
              <Td>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-2"
                  onClick={() => setSelectedEntry(row)}
                >
                  <Eye size={16} />
                  View
                </Button>
              </Td>
            </tr>
          ))}
        </DataTable>
      )}

      {selectedEntry && <LedgerDetailsModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    </>
  );
}
