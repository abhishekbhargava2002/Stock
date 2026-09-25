"use client";

import Link from "next/link";
import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { ledger, stockIn } from "@/lib/mock-data";
import { inr } from "@/lib/utils";

export default function StockInClient() {
  const [showLedger, setShowLedger] = useState(false);
  const [selectedRef, setSelectedRef] = useState<string>(stockIn[0]?.id || "");
  const ledgerRows = ledger.filter((item) => !selectedRef || item.ref === selectedRef || item.type === "OPENING_STOCK");

  return (
    <>
      <PageHeader
        eyebrow="Stock"
        title="Stock In"
        subtitle="Record incoming stock into a godown with vendor, invoice and vehicle details. View ledger history for stock in, stock out and transfer movement."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowLedger((value) => !value)}>
              {showLedger ? "Hide Ledger" : "View Ledger"}
            </Button>
            <Link href="/stock/stock-in/new"><Button>Add Stock In</Button></Link>
          </>
        }
      />

      <div className="mb-5 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-emeraldDeep" placeholder="Search stock in no, vendor" />
        <select className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"><option>All Godowns</option><option>Main Godown</option><option>Gondia Store</option></select>
        <select className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold"><option>All Status</option><option>Completed</option><option>Draft</option></select>
        <Button variant="secondary">Apply Filter</Button>
      </div>

      <DataTable headers={["Stock In No.", "Date", "Vendor", "Godown", "Items", "Quantity", "Value", "Vehicle", "Created By", "Status", "Ledger"]}>
        {stockIn.map((t) => (
          <tr key={t.id}>
            <Td>{t.id}</Td>
            <Td>{t.date}</Td>
            <Td>{t.vendor}</Td>
            <Td>{t.godown}</Td>
            <Td>{t.items}</Td>
            <Td>{t.quantity}</Td>
            <Td>{inr(t.value)}</Td>
            <Td>{t.vehicle}</Td>
            <Td>{t.createdBy}</Td>
            <Td><StatusBadge status={t.status} /></Td>
            <Td>
              <Button type="button" variant="secondary" onClick={() => { setSelectedRef(t.id); setShowLedger(true); }}>
                View
              </Button>
            </Td>
          </tr>
        ))}
      </DataTable>

      {showLedger && (
        <section className="mt-6 rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emeraldDeep">Stock Ledger Movement</p>
              <h2 className="mt-1 text-xl font-black text-charcoal">Godown-wise movement history</h2>
              <p className="mt-1 text-sm text-slate-500">Tracks opening stock, stock in, stock transfer, stock out and running balance.</p>
            </div>
            <select value={selectedRef} onChange={(e) => setSelectedRef(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold">
              {stockIn.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
            </select>
          </div>
          <DataTable headers={["Date", "Type", "Reference", "Item", "Godown", "Qty In", "Qty Out", "Balance", "Created By"]}>
            {ledgerRows.map((item) => (
              <tr key={item.id}>
                <Td>{item.date}</Td>
                <Td><StatusBadge status={item.type.replaceAll("_", " ")} /></Td>
                <Td>{item.ref}</Td>
                <Td>{item.item}</Td>
                <Td>{item.godown}</Td>
                <Td className="text-emeraldDeep">{item.quantityIn}</Td>
                <Td className="text-red-600">{item.quantityOut}</Td>
                <Td>{item.balance}</Td>
                <Td>{item.createdBy}</Td>
              </tr>
            ))}
          </DataTable>
        </section>
      )}
    </>
  );
}
