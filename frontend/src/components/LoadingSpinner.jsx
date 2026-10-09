import { LoaderCircle } from 'lucide-react';

export default function LoadingSpinner({ label = 'Memuat data...', full = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm font-semibold text-slate-500 ${full ? 'min-h-[45vh]' : 'py-10'}`}>
      <LoaderCircle className="animate-spin text-civic-600" size={22} />
      <span>{label}</span>
    </div>
  );
}
