import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { organizations } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Manage" title="Organization Settings" subtitle="Add or update Stockora client organization details, limits and contact information." actions={<EntityFormPanel buttonLabel="Add / Update Organization" title="Add / Update Organization" description="Update organization profile used across invoices, reports and workspace settings." fields={[
      { name:"name", label:"Organization Name", required:true, placeholder:"Shree Electronics" },
      { name:"email", label:"Contact Email", type:"email", required:true },
      { name:"phone", label:"Contact Phone", type:"tel", required:true },
      { name:"gst", label:"GST Number", placeholder:"27ABCDE1234F1Z5" },
      { name:"logo", label:"Organization Logo", type:"file" },
      { name:"facilityLimit", label:"Facility Limit", type:"number", placeholder:"Example: 5" },
      { name:"userLimit", label:"User Limit", type:"number", placeholder:"Example: 25" },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"address", label:"Address", type:"textarea", required:true }
    ]} />} />
    <DataTable headers={['Organization Name','Email','Phone','GST','Facility Limit','User Limit','Status']}>{organizations.map(o=><tr key={o.id}><Td>{o.name}</Td><Td>{o.email}</Td><Td>{o.phone}</Td><Td>{o.gst||'-'}</Td><Td>{o.facilityLimit||'-'}</Td><Td>{o.userLimit||'-'}</Td><Td><StatusBadge status={o.status}/></Td></tr>)}</DataTable>
  </>;
}
