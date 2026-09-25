import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { facilities, users } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Manage" title="Admin Management" subtitle="Add admins and assign facility-level access for Stockora operations." actions={<EntityFormPanel buttonLabel="Add Admin" title="Add / Update Admin" description="Create admin user with role and facility access." fields={[
      { name:"name", label:"Admin Name", required:true },
      { name:"email", label:"Email", type:"email", required:true },
      { name:"phone", label:"Phone", type:"tel", required:true },
      { name:"role", label:"Role", type:"select", options:["Client Super Admin","Admin","Facility Admin"], required:true },
      { name:"facility", label:"Facility Access", type:"select", options:["All Facilities", ...facilities.map(f=>f.name)], required:true },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true }
    ]} />} />
    <DataTable headers={['Admin Name','Email','Phone','Role','Facility Access','Status']}>{users.filter(u=>u.role.includes('Admin')).map(u=><tr key={u.id}><Td>{u.name}</Td><Td>{u.email}</Td><Td>{u.phone}</Td><Td>{u.role}</Td><Td>{u.facility||'All Facilities'}</Td><Td><StatusBadge status={u.status}/></Td></tr>)}</DataTable>
  </>;
}
