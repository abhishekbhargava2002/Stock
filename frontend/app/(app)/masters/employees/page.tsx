import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { facilities, users } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Masters" title="Employees" subtitle="Operators and employees with role and facility access." actions={<EntityFormPanel buttonLabel="Add Employee" title="Add / Update Employee" description="Create employee/operator profile and assign role/facility." fields={[
      { name:"name", label:"Employee Name", required:true, placeholder:"Full name" },
      { name:"email", label:"Email", type:"email", required:true },
      { name:"phone", label:"Phone Number", type:"tel", required:true },
      { name:"gender", label:"Gender", type:"select", options:["Male","Female","Other"] },
      { name:"role", label:"Role", type:"select", options:["Client Super Admin","Admin","Facility Admin","Stock Manager","Sales Operator","Report Viewer"], required:true },
      { name:"facility", label:"Facility", type:"select", options:facilities.map(f=>f.name) },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true }
    ]} />} />
    <DataTable headers={["Name","Email","Phone","Role","Facility","Status","Actions"]}>{users.map(u=><tr key={u.id}><Td>{u.name}</Td><Td>{u.email}</Td><Td>{u.phone}</Td><Td>{u.role}</Td><Td>{u.facility||'-'}</Td><Td><StatusBadge status={u.status}/></Td><Td><Button variant="secondary">Edit</Button></Td></tr>)}</DataTable>
  </>;
}
