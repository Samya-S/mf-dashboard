type StatCardProps = {
  label: string;
  value: string;
  meta?: string;
  valueClassName?: string;
};

export function StatCard({ label, value, meta, valueClassName }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">{label}</p>
        {meta && <p className="text-[11px] text-slate-500">{meta}</p>}
      </div>
      <p className={`mt-1 text-lg font-semibold ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}
