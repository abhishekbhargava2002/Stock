"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/shared/FormBits";

type Option = string | { label: string; value: string };

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select" | "file" | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: Option[];
  helper?: string;
};

export function EntityFormPanel({
  title,
  description,
  buttonLabel,
  fields,
  submitLabel = "Save Details",
  compact = false,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  fields: FieldConfig[];
  submitLabel?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[90] bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6" onClick={() => setOpen(false)}>
          <section
            className="mx-auto max-h-[92vh] max-w-5xl overflow-y-auto rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-charcoal">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              </div>
              <span className="w-fit rounded-full bg-mintSoft px-3 py-1 text-xs font-black text-emeraldDeep">
                Simple Indian operations form
              </span>
            </div>

            <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {fields.map((field) => (
                <Field key={field.name} label={field.label} required={field.required}>
                  {field.type === "textarea" ? (
                    <Textarea placeholder={field.placeholder} />
                  ) : field.type === "select" ? (
                    <Select defaultValue="">
                      <option value="" disabled>
                        Select {field.label}
                      </option>
                      {(field.options || []).map((option) => {
                        const value = typeof option === "string" ? option : option.value;
                        const label = typeof option === "string" ? option : option.label;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </Select>
                  ) : field.type === "checkbox" ? (
                    <label className="flex min-h-[46px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700">
                      <input type="checkbox" className="h-4 w-4 accent-emerald-600" />
                      Enable
                    </label>
                  ) : field.type === "file" ? (
                    <Input type="file" />
                  ) : (
                    <Input type={field.type || "text"} placeholder={field.placeholder} />
                  )}
                  {field.helper && <p className="mt-1 text-xs font-semibold text-slate-400">{field.helper}</p>}
                </Field>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
              This is a frontend form with mock submit. Backend API will later validate duplicates, role permissions and audit logs.
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="secondary">
                Save as Draft
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                {submitLabel}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
