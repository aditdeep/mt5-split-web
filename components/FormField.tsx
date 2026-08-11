export default function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-xs font-medium text-text-dim">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-surface-hi px-3 py-2.5 text-sm text-text outline-none focus:border-gold/50";
