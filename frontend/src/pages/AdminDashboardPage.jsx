import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleDotDashed, ClipboardList, Clock3, MapPinned } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi, aspirationApi } from '../api';
import AdminPageHeader from '../components/AdminPageHeader';
import { StatusBadge } from '../components/Badges';
import LoadingSpinner from '../components/LoadingSpinner';
import MapView from '../components/MapView';
import { compactNumber, formatDate } from '../utils/format';

export default function AdminDashboardPage() {
  const [data, setData] = useState({ summary: null, items: [], priorities: [], markers: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      analyticsApi.summary(),
      aspirationApi.adminList({ page: 1, limit: 6 }),
      analyticsApi.priorities(),
      aspirationApi.list({ page: 1, limit: 100 })
    ]).then(([summary, list, priorities, map]) => setData({ summary, items: list.data, priorities, markers: map.data })).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSpinner full />;

  const cards = [
    ['Total aspirasi', data.summary?.total, ClipboardList, 'bg-blue-50 text-blue-600'],
    ['Menunggu verifikasi', data.summary?.byStatus?.MENUNGGU_VERIFIKASI, Clock3, 'bg-amber-50 text-amber-600'],
    ['Sedang diproses', data.summary?.byStatus?.DIPROSES, CircleDotDashed, 'bg-violet-50 text-violet-600'],
    ['Selesai', data.summary?.byStatus?.SELESAI, CheckCircle2, 'bg-emerald-50 text-emerald-600']
  ];

  return (
    <div>
      <AdminPageHeader eyebrow="Pusat kendali" title="Ikhtisar hari ini" description="Pantau antrean, sebaran, dan wilayah prioritas dalam satu pandangan." action={<Link to="/admin/aspirasi" className="btn-primary">Kelola aspirasi <ArrowRight size={17} /></Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, color]) => <article key={label} className="panel p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.08em] text-slate-500">{label}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={19} /></span></div><strong className="mt-4 block font-display text-4xl text-civic-950">{compactNumber(value)}</strong></article>)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="panel overflow-hidden p-3"><div className="flex items-center justify-between px-3 py-3"><div><h2 className="font-display text-xl font-bold text-civic-950">Peta persebaran</h2><p className="mt-1 text-xs text-slate-500">{data.markers.length} titik aspirasi terbaru</p></div><MapPinned className="text-civic-600" /></div><MapView markers={data.markers} className="h-[430px]" /></section>
        <section className="panel p-6"><h2 className="font-display text-xl font-bold text-civic-950">Prioritas wilayah</h2><p className="mt-1 text-xs text-slate-500">Berdasarkan skor kebutuhan relatif</p><div className="mt-5 space-y-4">{data.priorities.slice(0, 5).map((item, index) => <div key={item.regency.id} className="flex items-center gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${index === 0 ? 'bg-signal text-civic-950' : 'bg-slate-100 text-slate-500'}`}>#{item.rank}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-800">{item.regency.name}</strong><span className="text-xs text-slate-400">{item.totalAspirations} aspirasi</span></span><strong className="font-display text-lg text-civic-700">{item.priorityScore}</strong></div>)}</div><Link to="/admin/analytics" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-civic-50 py-3 text-xs font-bold text-civic-700">Lihat analitik lengkap <ArrowRight size={15} /></Link></section>
      </div>
      <section className="panel mt-6 overflow-hidden"><div className="flex items-center justify-between border-b p-5 sm:px-6"><div><h2 className="font-display text-xl font-bold text-civic-950">Aspirasi terbaru</h2><p className="mt-1 text-xs text-slate-500">Enam laporan yang terakhir masuk</p></div><Link to="/admin/aspirasi" className="text-xs font-bold text-blue-600">Lihat semua</Link></div><div className="divide-y">{data.items.map((item) => <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-blue-600">{item.trackingCode}</span><h3 className="mt-1 font-semibold text-slate-800">{item.title}</h3><p className="mt-1 text-xs text-slate-400">{item.village.name}, {item.regency.name} / {formatDate(item.createdAt)}</p></div><StatusBadge status={item.status} /></div>)}</div></section>
    </div>
  );
}
