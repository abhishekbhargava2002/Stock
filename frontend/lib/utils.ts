import { ledger } from "@/lib/mock-data";
export function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(" "); }
export function inr(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
export function number(value: number) { return new Intl.NumberFormat("en-IN").format(value); }
export function statusClass(status: string) { const s = status.toLowerCase(); if (s.includes("active") || s.includes("completed")) return "bg-emerald-50 text-emerald-700 border-emerald-200"; if (s.includes("low") || s.includes("pending")) return "bg-amber-50 text-amber-700 border-amber-200"; if (s.includes("cancel") || s.includes("inactive")) return "bg-red-50 text-red-700 border-red-200"; return "bg-slate-50 text-slate-700 border-slate-200"; }
export function calculateAvailableStock(itemName: string, godown?: string) { return ledger.filter(l => l.item === itemName && (!godown || l.godown === godown)).reduce((sum,l)=> sum + l.quantityIn - l.quantityOut, 0); }
export function movementForItem(itemName: string) { return ledger.filter(l => l.item === itemName); }
export function canMoveStock(itemName: string, godown: string, qty: number) { return calculateAvailableStock(itemName, godown) >= qty && qty > 0; }
