import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { vendors } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Masters" title="Vendors" subtitle="Supplier and vendor information with GST details." actions={<EntityFormPanel buttonLabel="Add Vendor" title="Add / Update Vendor" description="Add supplier details for purchase and stock-in records." fields={[
      { name:"name", label:"Vendor Name", required:true, placeholder:"Example: Mahavir Distributors" },
      { name:"phone", label:"Phone Number", type:"tel", required:true, placeholder:"10 digit mobile" },
      { name:"email", label:"Email", type:"email", placeholder:"billing@vendor.in" },
      { name:"gst", label:"GST Number", placeholder:"27ABCDE1234F1Z5" },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"address", label:"Address", type:"textarea", required:true }
    ]} />} />
    <DataTable headers={["Vendor","Phone","Email","GST","Address","Status","Actions"]}>{vendors.map(v=><tr key={v.id}><Td>{v.name}</Td><Td>{v.phone}</Td><Td>{v.email}</Td><Td>{v.gst||'-'}</Td><Td>{v.address}</Td><Td><StatusBadge status={v.status}/></Td><Td><Button variant="secondary">Edit</Button></Td></tr>)}</DataTable>
  </>;
}
