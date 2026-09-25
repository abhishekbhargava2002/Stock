import PageHeader from "@/components/shared/PageHeader";
import DataTable, { Td } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/FormBits";
import { EntityFormPanel } from "@/components/forms/EntityFormPanel";
import { categories, groups } from "@/lib/mock-data";

export default function Page() {
  return <>
    <PageHeader eyebrow="Masters" title="Categories" subtitle="Manage categories under groups and parent categories." actions={<EntityFormPanel buttonLabel="Add Category" title="Add / Update Category" description="Create hierarchical category under selected group. Keep labels simple for store staff." fields={[
      { name:"name", label:"Category Name", required:true, placeholder:"Example: Television" },
      { name:"group", label:"Group", type:"select", options:groups.map(g=>g.name), required:true },
      { name:"parent", label:"Parent Category", type:"select", options:["None", ...categories.map(c=>c.name)] },
      { name:"status", label:"Status", type:"select", options:["Active","Inactive"], required:true },
      { name:"description", label:"Description", type:"textarea", placeholder:"Short description" }
    ]} />} />
    <DataTable headers={["Category","Group","Parent","Description","Status","Actions"]}>{categories.map(c=><tr key={c.id}><Td>{c.name}</Td><Td>{c.group}</Td><Td>{c.parent||'-'}</Td><Td>{c.description}</Td><Td><StatusBadge status={c.status}/></Td><Td><Button variant="secondary">Edit</Button></Td></tr>)}</DataTable>
  </>;
}
