import { MapPinned } from 'lucide-react';

export default function Brand({ inverse = false, compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`relative grid h-10 w-10 place-items-center rounded-[14px] ${inverse ? 'bg-white text-civic-950' : 'bg-civic-950 text-white'}`}>
        <MapPinned size={21} strokeWidth={2.2} />
        <i className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-current bg-signal" />
      </span>
      {!compact && (
        <span className="leading-none">
          <strong className={`block font-display text-xl ${inverse ? 'text-white' : 'text-civic-950'}`}>RuangWarga</strong>
          <span className={`mt-1 block text-[9px] font-bold uppercase tracking-[.18em] ${inverse ? 'text-teal-200' : 'text-civic-600'}`}>Aspirasi terpetakan</span>
        </span>
      )}
    </div>
  );
}
