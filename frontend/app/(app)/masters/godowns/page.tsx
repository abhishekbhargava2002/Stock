import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { godowns } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Masters" title="Godowns" subtitle="Storage locations and default godown settings." actions={<EntityFormPanel buttonLabel="Add Godown" title="Add / Update Godown" description="Create warehouse/godown used in stock in, stock out and transfer." fields={[
      { name:"name", label:"Godown Name", required:true, placeholder:"Example: Main Godown" },
      { name:"address", label:"Address", type:"textarea", required:true, placeholder:"Full address" },
      { name:"default", label:"Set as Default", type:"checkbox" },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"description", label:"Description", type:"textarea", placeholder:"Optional notes" }
    ]} />} />
    <DataTable headers={["Godown","Address","Default","Status","Actions"]}>{godowns.map(g=><tr key={g.id}><Td>{g.name}</Td><Td>{g.address}</Td><Td>{g.isDefault?'Yes':'No'}</Td><Td><StatusBadge status={g.status}/></Td><Td><Button variant="secondary">Edit</Button></Td></tr>)}</DataTable>
  </>;
}
