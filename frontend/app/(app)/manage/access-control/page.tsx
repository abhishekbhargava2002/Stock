"use client";
import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button, Select } from "@/components/shared/FormBits";

export default function Page(){
  const [role, setRole] = useState("Stock Manager");
  const modules=['Masters','Stock In','Stock Transfer','Stock Out','Daily Sale','Reports','Incentives','Manage'];
  const cols=['View','Add','Edit','Delete','Export','Approve'];
  return <>
    <PageHeader eyebrow="Manage" title="Access Control" subtitle="Role-wise permission matrix with view, add, edit, delete, export and approve." actions={<><Select value={role} onChange={(e)=>setRole(e.target.value)}><option>Super Admin</option><option>Facility Admin</option><option>Stock Manager</option><option>Sales Operator</option><option>Report Viewer</option></Select><Button>Save Permissions</Button></>} />
    <div className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">Selected role: <b>{role}</b>. Delete and Approve should be restricted for junior operators. Completed stock movements should use cancel/reversal, not direct delete.</div>
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50"><tr><th className="px-5 py-4 text-left font-black">Module</th>{cols.map(c=><th key={c} className="px-5 py-4 font-black">{c}</th>)}</tr></thead><tbody>{modules.map(m=><tr key={m} className="border-t border-slate-100"><td className="px-5 py-4 font-black">{m}</td>{cols.map(c=><td key={c} className="px-5 py-4 text-center"><input type="checkbox" className="h-4 w-4 accent-emerald-600" defaultChecked={c==='View'||(role!=='Report Viewer'&&['Add','Edit'].includes(c))} /></td>)}</tr>)}</tbody></table></div>
  </>;
}
