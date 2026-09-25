import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { groups } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Masters" title="Groups" subtitle="Create groups such as Electronics, Grocery, Hardware and Spare Parts." actions={<EntityFormPanel buttonLabel="Add Group" title="Add / Update Group" description="Create a product group used for item categorization and incentive rules." fields={[
      { name:"name", label:"Group Name", required:true, placeholder:"Example: Electronics" },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"description", label:"Description", type:"textarea", placeholder:"Short description for this group" }
    ]} />} />
    <DataTable headers={["Group Name","Description","Status","Actions"]}>{groups.map(g=><tr key={g.id}><Td>{g.name}</Td><Td>{g.description}</Td><Td><StatusBadge status={g.status}/></Td><Td><Button variant="secondary">Edit</Button></Td></tr>)}</DataTable>
  </>;
}
