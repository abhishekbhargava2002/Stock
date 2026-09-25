import { LucideIcon } from "lucide-react";
export default function StatCard({ title, value, note, icon: Icon, tone="mint" }: { title:string; value:string; note?:string; icon:LucideIcon; tone?:"mint"|"amber"|"red"|"blue" }) {
 const tones={mint:"bg-emerald-50 text-emerald-700", amber:"bg-amber-50 text-amber-700", red:"bg-red-50 text-red-700", blue:"bg-blue-50 text-blue-700"};
 return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{title}</p><p className="mt-2 text-2xl font-black text-charcoal">{value}</p>{note && <p className="mt-1 text-xs font-semibold text-slate-500">{note}</p>}</div><div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}><Icon size={22}/></div></div></div>;
}
