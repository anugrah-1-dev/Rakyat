import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, CheckCircle2, Clock3, Map, ScanSearch, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsApi, aspirationApi } from '../api';
import { compactNumber } from '../utils/format';
import AspirationForm from '../components/AspirationForm';

export default function HomePage() {
  const [summary, setSummary] = useState({ total: 0, withGeotag: 0, byStatus: {} });
  const [markers, setMarkers] = useState([]);

  const load = () => Promise.all([
    analyticsApi.summary().then(setSummary),
    aspirationApi.list({ page: 1, limit: 100 }).then((result) => setMarkers(result.data))
  ]).catch(() => {});

  useEffect(() => { load(); }, []);

  const stats = [
    ['Aspirasi masuk', compactNumber(summary.total), UsersRound, 'Seluruh laporan warga'],
    ['Sedang ditangani', compactNumber((summary.byStatus?.TERVERIFIKASI || 0) + (summary.byStatus?.DIPROSES || 0)), Clock3, 'Terverifikasi dan diproses'],
    ['Tuntas', compactNumber(summary.byStatus?.SELESAI || 0), CheckCircle2, 'Telah selesai ditindaklanjuti'],
    ['Titik terpetakan', compactNumber(summary.withGeotag), Map, 'Lokasi kejadian terdata']
  ];

  return (
    <>
      <section className="hero-cut relative overflow-hidden bg-civic-950 pb-28 pt-16 text-white sm:pb-36 sm:pt-24">
        <div className="absolute inset-0 bg-civic-grid bg-[size:46px_46px]" />
        <div className="absolute -right-28 top-[-150px] h-[520px] w-[520px] rounded-full border-[100px] border-blue-500/10" />
        <div className="absolute bottom-12 left-[48%] h-40 w-40 rotate-12 rounded-[44px] bg-teal-400/10 blur-sm" />
        <div className="container-shell relative grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-teal-200"><Sparkles size={14} /> Suara warga, arah pembangunan</span>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-bold leading-[1.03] sm:text-6xl lg:text-7xl">Peta aspirasi,<br /><span className="text-teal-300">gerak nyata.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Sampaikan kebutuhan di sekitar Anda, tandai lokasinya, dan ikuti perkembangan tindak lanjut secara transparan.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#sampaikan" className="btn-primary bg-blue-500 px-6 py-3.5 hover:bg-blue-600">Sampaikan aspirasi <ArrowDown size={17} /></a><Link to="/aspirasi" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10">Jelajahi data publik <ArrowRight size={17} /></Link></div>
          </div>
          <div className="relative hidden min-h-[390px] lg:block">
            <div className="absolute inset-10 rotate-3 rounded-[46px] border border-white/10 bg-white/[.04]" />
            <div className="absolute left-2 top-8 w-64 -rotate-3 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"><ScanSearch className="text-teal-300" /><p className="mt-8 text-xs uppercase tracking-[.16em] text-slate-400">Aspirasi terpetakan</p><strong className="mt-1 block font-display text-5xl">{compactNumber(summary.withGeotag)}</strong><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[82%] rounded-full bg-teal-300" /></div></div>
            <div className="absolute bottom-4 right-0 w-72 rotate-2 rounded-2xl bg-white p-5 text-slate-900 shadow-2xl"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-civic-600">Prinsip kami</span><p className="mt-3 font-display text-2xl font-bold leading-tight">Tidak ada suara yang sekadar menjadi angka.</p><div className="mt-5 flex -space-x-2">{['RW','RT','W','+'].map((text, i) => <span key={text} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-[10px] font-bold ${i === 3 ? 'bg-signal text-civic-950' : 'bg-civic-100 text-civic-800'}`}>{text}</span>)}</div></div>
          </div>
        </div>
      </section>

      <section className="container-shell relative -mt-10 z-10">
        <div className="grid overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-lift sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value, Icon, note], index) => <div key={label} className={`metric-rule p-6 pt-7 ${index ? 'border-t sm:border-l sm:border-t-0' : ''}`}><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[.1em] text-slate-500">{label}</span><Icon size={19} className="text-civic-600" /></div><strong className="mt-3 block font-display text-4xl text-civic-950">{value}</strong><span className="mt-1 block text-xs text-slate-400">{note}</span></div>)}
        </div>
      </section>

      <section id="sampaikan" className="container-shell scroll-mt-24 pt-24">
        <div className="mb-8 max-w-3xl"><span className="eyebrow">01 / Tandai dan sampaikan</span><h2 className="mt-3 font-display text-4xl font-bold leading-tight text-civic-950 sm:text-5xl">Satu titik di peta dapat<br className="hidden sm:block" /> memulai perubahan.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-600">Pilih lokasi kejadian pada peta, lengkapi wilayah administratif, lalu kirimkan aspirasi Anda.</p></div>
        <AspirationForm markers={markers} onSubmitted={load} />
      </section>

      <section className="container-shell mt-24">
        <div className="grid overflow-hidden rounded-[28px] bg-blue-600 text-white lg:grid-cols-[.85fr_1.15fr]">
          <div className="p-8 sm:p-12"><span className="text-xs font-bold uppercase tracking-[.18em] text-blue-100">Data untuk semua</span><h2 className="mt-4 font-display text-4xl font-bold">Pantau. Ukur. Kawal.</h2><p className="mt-5 leading-7 text-blue-100">Setiap aspirasi publik dapat dicari berdasarkan wilayah, kategori, status, dan waktu. Privasi pelapor tetap terlindungi.</p><Link to="/aspirasi" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700">Buka data aspirasi <ArrowRight size={17} /></Link></div>
          <div className="grid grid-cols-2 border-t border-white/20 lg:border-l lg:border-t-0">{[['16','Kategori isu'],['5','Tahap status'],['4','Jenjang wilayah'],['100%','Nomor tersamarkan']].map(([number,label], index) => <div key={label} className={`p-8 sm:p-10 ${(index % 2) ? 'border-l' : ''} ${index > 1 ? 'border-t' : ''} border-white/20`}><strong className="font-display text-4xl sm:text-5xl">{number}</strong><span className="mt-2 block text-sm text-blue-100">{label}</span></div>)}</div>
        </div>
      </section>
    </>
  );
}
