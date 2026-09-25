import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { facilities, users } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Manage" title="Facility Management" subtitle="Add and update facilities, stores and warehouse branches under the organization." actions={<EntityFormPanel buttonLabel="Add / Update Facility" title="Add / Update Facility" description="Create facility used for godown-wise stock, users and reports." fields={[
      { name:"name", label:"Facility Name", required:true, placeholder:"Main Facility" },
      { name:"code", label:"Facility Code", required:true, placeholder:"NGP-MAIN" },
      { name:"phone", label:"Facility Phone", type:"tel" },
      { name:"city", label:"City", required:true },
      { name:"state", label:"State", type:"select", options:["Maharashtra","Madhya Pradesh","Gujarat","Karnataka","Delhi"], required:true },
      { name:"pin", label:"PIN Code", type:"number" },
      { name:"admin", label:"Assigned Admin", type:"select", options:users.map(u=>u.name) },
      { name:"primary", label:"Set as Primary Facility", type:"checkbox" },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"address", label:"Address", type:"textarea", required:true }
    ]} />} />
    <DataTable headers={['Facility Name','Facility Code','City','State','Primary','Status']}>{facilities.map(f=><tr key={f.id}><Td>{f.name}</Td><Td>{f.code}</Td><Td>{f.city}</Td><Td>{f.state}</Td><Td>{f.isPrimary?'Yes':'No'}</Td><Td><StatusBadge status={f.status}/></Td></tr>)}</DataTable>
  </>;
}
