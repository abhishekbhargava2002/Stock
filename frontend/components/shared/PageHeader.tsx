import { ReactNode } from "react";
export default function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
 return <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between"><div>{eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-emeraldDeep">{eyebrow}</p>}<h1 className="text-2xl font-black tracking-tight text-charcoal sm:text-3xl">{title}</h1>{subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{subtitle}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}
