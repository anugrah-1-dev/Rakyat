import { STATUS_LABELS } from '../utils/format';

const statusStyles = {
  MENUNGGU_VERIFIKASI: 'bg-amber-50 text-amber-700 ring-amber-200',
  TERVERIFIKASI: 'bg-sky-50 text-sky-700 ring-sky-200',
  DIPROSES: 'bg-violet-50 text-violet-700 ring-violet-200',
  SELESAI: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  DITOLAK: 'bg-rose-50 text-rose-700 ring-rose-200'
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${statusStyles[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
      <i className="h-2 w-2 rounded-full" style={{ backgroundColor: category?.color || '#0d9488' }} />
      {category?.name || 'Lainnya'}
    </span>
  );
}
