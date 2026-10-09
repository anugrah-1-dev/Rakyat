import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarClock, Check, MapPin, MessageCircleMore } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { aspirationApi } from '../api';
import { errorMessage } from '../api/axiosClient';
import { CategoryBadge, StatusBadge } from '../components/Badges';
import LoadingSpinner from '../components/LoadingSpinner';
import MapView from '../components/MapView';
import { formatDate, regionName, STATUS_LABELS } from '../utils/format';

export default function AspirationDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { aspirationApi.detail(id).then(setItem).catch((error) => toast.error(errorMessage(error))).finally(() => setLoading(false)); }, [id]);
  if (loading) return <LoadingSpinner full />;
  if (!item) return <div className="container-shell py-24 text-center"><h1 className="font-display text-3xl font-bold">Aspirasi tidak ditemukan</h1><Link to="/aspirasi" className="btn-primary mt-6">Kembali ke data</Link></div>;
  const evidenceUrl = /^https?:\/\//i.test(item.evidenceImage || '') ? item.evidenceImage : null;

  return (
    <div className="container-shell py-9 sm:py-14">
      <Link to="/aspirasi" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-civic-700"><ArrowLeft size={17} /> Kembali ke data aspirasi</Link>
      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-7">
          <article className="panel p-6 sm:p-9"><div className="flex flex-wrap gap-2"><CategoryBadge category={item.category} /><StatusBadge status={item.status} /></div><p className="mt-6 text-xs font-bold uppercase tracking-[.14em] text-blue-600">{item.trackingCode}</p><h1 className="mt-2 font-display text-3xl font-bold leading-tight text-civic-950 sm:text-5xl">{item.title}</h1><div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><CalendarClock size={15} /> Dikirim {formatDate(item.createdAt, true)}</span><span className="flex items-center gap-2"><MessageCircleMore size={15} /> {item.maskedPhone}</span></div><div className="my-7 h-px bg-slate-100" /><p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700">{item.content}</p>{evidenceUrl && <a href={evidenceUrl} target="_blank" rel="noreferrer" className="mt-7 block overflow-hidden rounded-2xl border"><img src={evidenceUrl} alt="Bukti aspirasi" className="max-h-[460px] w-full object-cover" /></a>}</article>
          <section className="panel overflow-hidden p-3"><div className="px-3 pb-3 pt-2"><h2 className="font-display text-xl font-bold text-civic-950">Lokasi kejadian</h2><p className="mt-1 flex items-start gap-2 text-sm text-slate-500"><MapPin size={16} className="mt-0.5 shrink-0 text-civic-600" />{regionName(item)}</p></div><MapView location={{ lat: item.latitude, lng: item.longitude }} className="h-[420px]" /></section>
        </div>
        <aside>
          <div className="panel sticky top-24 p-6"><span className="eyebrow">Jejak tindak lanjut</span><h2 className="mt-2 font-display text-2xl font-bold text-civic-950">Riwayat status</h2><div className="mt-6">{item.statusHistory?.map((entry, index) => <div key={entry.id} className="relative flex gap-4 pb-7 last:pb-0"><div className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-civic-600 text-white"><Check size={14} />{index < item.statusHistory.length - 1 && <i className="absolute left-1/2 top-8 h-7 w-px -translate-x-1/2 bg-civic-200" />}</div><div><strong className="block text-sm text-slate-800">{STATUS_LABELS[entry.newStatus]}</strong><span className="mt-1 block text-xs text-slate-400">{formatDate(entry.createdAt, true)}</span></div></div>)}</div><div className="mt-7 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">Terakhir diperbarui pada <b className="text-slate-700">{formatDate(item.updatedAt, true)}</b>.</div></div>
        </aside>
      </div>
    </div>
  );
}
