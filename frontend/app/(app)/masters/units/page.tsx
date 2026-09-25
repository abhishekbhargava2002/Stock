import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { units } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Masters" title="Units of Measurement" subtitle="Manage PCS, BOX, KG and conversion-ready units." actions={<EntityFormPanel buttonLabel="Add Unit" title="Add / Update Unit" description="Define measurement unit used for item and stock quantity." fields={[
      { name:"name", label:"Unit Name", required:true, placeholder:"Example: Pieces" },
      { name:"code", label:"Short Code", required:true, placeholder:"PCS" },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"description", label:"Description", type:"textarea", placeholder:"Optional" }
    ]} />} />
    <DataTable headers={["Unit Name","Short Code","Description","Status","Actions"]}>{units.map(u=><tr key={u.id}><Td>{u.name}</Td><Td>{u.code}</Td><Td>{u.description||'-'}</Td><Td><StatusBadge status={u.status}/></Td><Td><Button variant="secondary">Edit</Button></Td></tr>)}</DataTable>
  </>;
}
