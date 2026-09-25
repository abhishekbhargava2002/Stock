import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
const rows = [
  { type:'Low Stock Alert', channel:'In-app, Email', recipients:'Facility Admin, Stock Manager', status:'Active' },
  { type:'Expiry Alert', channel:'In-app', recipients:'Stock Manager', status:'Active' },
  { type:'Bulk Upload Failed', channel:'In-app, Email', recipients:'Admin', status:'Active' },
  { type:'Incentive Generated', channel:'In-app', recipients:'Super Admin', status:'Active' }
];

export default function Page() {
  return <>
    <PageHeader eyebrow="Manage" title="Notifications" subtitle="Configure notification rules for low stock, expiry, transfer, upload and incentive events." actions={<EntityFormPanel buttonLabel="Add Notification Rule" title="Add / Update Notification" description="Create notification rule and choose channel/recipients." fields={[
      { name:"type", label:"Notification Type", type:"select", options:["Low Stock Alert","Expiry Alert","Stock Transfer Alert","Stock Out Alert","Bulk Upload Failed","Incentive Generated","Manual Adjustment Created"], required:true },
      { name:"channel", label:"Channel", type:"select", options:["In-app","Email","In-app + Email","WhatsApp/SMS Future Scope"], required:true },
      { name:"recipients", label:"Recipients", type:"select", options:["Super Admin","Facility Admin","Stock Manager","Sales Operator","Report Viewer"], required:true },
      { name:"enabled", label:"Enabled", type:"checkbox" },
      { name:"message", label:"Message Template", type:"textarea", placeholder:"Example: Item {item} is below low stock threshold." }
    ]} />} />
    <DataTable headers={['Type','Channel','Recipients','Enabled','Actions']}>{rows.map(r=><tr key={r.type}><Td>{r.type}</Td><Td>{r.channel}</Td><Td>{r.recipients}</Td><Td><StatusBadge status={r.status}/></Td><Td><span className="text-sm font-black text-emeraldDeep">Edit</span></Td></tr>)}</DataTable>
  </>;
}
