import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
const roles = [
  { role:'Super Admin', description:'Full organization access', users:1, status:'Active' },
  { role:'Facility Admin', description:'Manage assigned facility', users:2, status:'Active' },
  { role:'Stock Manager', description:'Stock in/out and transfers', users:4, status:'Active' },
  { role:'Report Viewer', description:'Read-only reports access', users:3, status:'Active' }
];

export default function Page() {
  return <>
    <PageHeader eyebrow="Manage" title="User Roles" subtitle="Add user roles and define role purpose before assigning access controls." actions={<EntityFormPanel buttonLabel="Add User Role" title="Add / Update User Role" description="Create a role that can be used in access control matrix." fields={[
      { name:"role", label:"Role Name", required:true, placeholder:"Example: Stock Manager" },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"description", label:"Description", type:"textarea", required:true }
    ]} />} />
    <DataTable headers={['Role','Description','Users','Status','Actions']}>{roles.map(r=><tr key={r.role}><Td>{r.role}</Td><Td>{r.description}</Td><Td>{r.users}</Td><Td><StatusBadge status={r.status}/></Td><Td><span className="text-sm font-black text-emeraldDeep">Edit</span></Td></tr>)}</DataTable>
  </>;
}
