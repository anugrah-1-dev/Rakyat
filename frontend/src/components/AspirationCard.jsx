import { ArrowUpRight, CalendarDays, MapPin, MessageCircleMore } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryBadge, StatusBadge } from './Badges';
import { formatDate, regionName } from '../utils/format';

export default function AspirationCard({ item }) {
  return (
    <article className="panel group flex h-full flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-civic-200 hover:shadow-lift sm:p-6">
      <div className="flex flex-wrap items-center gap-2"><CategoryBadge category={item.category} /><StatusBadge status={item.status} /></div>
      <Link to={`/aspirasi/${item.id}`} className="mt-4 font-display text-xl font-bold leading-snug text-civic-950 transition group-hover:text-blue-700">{item.title}</Link>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.content}</p>
      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-civic-600" /> <span>{regionName(item)}</span></p>
        <div className="flex flex-wrap gap-x-5 gap-y-2"><span className="flex items-center gap-2"><CalendarDays size={14} />{formatDate(item.createdAt)}</span><span className="flex items-center gap-2"><MessageCircleMore size={14} />{item.maskedPhone}</span></div>
      </div>
      <Link to={`/aspirasi/${item.id}`} className="mt-auto flex items-center justify-between pt-5 text-sm font-bold text-blue-600">Lihat perkembangan <ArrowUpRight size={17} /></Link>
    </article>
  );
}
