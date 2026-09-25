import { statusClass } from "@/lib/utils";
export default function StatusBadge({ status }: { status: string }) { return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(status)}`}>{status}</span>; }
