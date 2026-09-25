import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { categories, godowns, groups, items, units } from "@/lib/mock-data";
import { inr } from "@/lib/utils";

export default function Page() {
  return <>
    <PageHeader eyebrow="Masters" title="Items" subtitle="SKU master with pricing, unit, low stock and categorization." actions={<EntityFormPanel buttonLabel="Add Item" title="Add / Update Item" description="Add stock item with SKU, opening quantity, pricing, unit and low stock alert. Opening quantity will create stock ledger entry later." fields={[
      { name:"name", label:"Item Name", required:true, placeholder:"Example: TCL TV 43 inch" },
      { name:"sku", label:"SKU Code", required:true, placeholder:"Example: TV-TCL-43" },
      { name:"photo", label:"Item Photo", type:"file" },
      { name:"openingQty", label:"Opening Quantity", type:"number", required:true, placeholder:"0" },
      { name:"group", label:"Group", type:"select", options:groups.map(g=>g.name), required:true },
      { name:"category", label:"Category", type:"select", options:categories.map(c=>c.name), required:true },
      { name:"godown", label:"Opening Godown", type:"select", options:godowns.map(g=>g.name), required:true },
      { name:"partNumber", label:"Part Number", placeholder:"Optional" },
      { name:"batchNumber", label:"Batch Number", placeholder:"Optional" },
      { name:"mfgDate", label:"Manufacturing Date", type:"date" },
      { name:"expiryDate", label:"Expiry Date", type:"date" },
      { name:"mrp", label:"MRP", type:"number", required:true, placeholder:"₹" },
      { name:"sellingPrice", label:"Standard Selling Price", type:"number", required:true, placeholder:"₹" },
      { name:"primaryUnit", label:"Primary Unit", type:"select", options:units.map(u=>u.code), required:true },
      { name:"secondaryUnit", label:"Secondary Unit", type:"select", options:["None", ...units.map(u=>u.code)] },
      { name:"conversion", label:"Conversion Rate", type:"number", placeholder:"Example: 1 BOX = 10 PCS" },
      { name:"lowStock", label:"Low Stock Alert Quantity", type:"number", required:true },
      { name:"lowAlert", label:"Enable Low Stock Notification", type:"checkbox" },
      { name:"description", label:"Description", type:"textarea", placeholder:"Item notes" }
    ]} />} />
    <div className="mb-5 grid gap-3 md:grid-cols-4"><input className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold" placeholder="Search SKU or item"/><select className="rounded-2xl border border-slate-200 px-4 py-3"><option>All Groups</option></select><select className="rounded-2xl border border-slate-200 px-4 py-3"><option>Low Stock</option></select><Button variant="secondary">Filter</Button></div>
    <DataTable headers={["Item","SKU","Group","Category","Available Qty","MRP","Selling Price","Low Stock","Status","Actions"]}>{items.map(i=><tr key={i.id}><Td>{i.name}</Td><Td>{i.sku}</Td><Td>{i.group}</Td><Td>{i.category}</Td><Td>{i.qty} {i.unit}</Td><Td>{inr(i.mrp)}</Td><Td>{inr(i.sellingPrice)}</Td><Td>{i.qty<=i.lowStock?<StatusBadge status="Low Stock"/>:`Min ${i.lowStock}`}</Td><Td><StatusBadge status={i.status}/></Td><Td><Button variant="secondary">Edit</Button></Td></tr>)}</DataTable>
  </>;
}
