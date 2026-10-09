import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Inbox, RotateCcw, Search } from 'lucide-react';
import { aspirationApi } from '../api';
import { errorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';
import AspirationCard from '../components/AspirationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RegionSelector, { emptyRegion } from '../components/RegionSelector';
import { STATUS_OPTIONS } from '../utils/format';

const initial = { keyword: '', categoryId: '', status: '', dateFrom: '', dateTo: '' };

export default function PublicAspirationPage() {
  const [draft, setDraft] = useState(initial);
  const [region, setRegion] = useState({ ...emptyRegion });
  const [query, setQuery] = useState({ page: 1, limit: 9 });
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { aspirationApi.categories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    aspirationApi.list(query).then((result) => { setItems(result.data); setMeta(result.meta); }).catch((error) => toast.error(errorMessage(error))).finally(() => setLoading(false));
  }, [query]);

  const apply = (event) => {
    event?.preventDefault();
    setQuery({ ...draft, provinceId: region.provinceId, regencyId: region.regencyId, districtId: region.districtId, villageId: region.villageId, page: 1, limit: 9 });
  };
  const reset = () => { setDraft(initial); setRegion({ ...emptyRegion }); setQuery({ page: 1, limit: 9 }); };

  return (
    <div>
      <section className="border-b border-slate-200 bg-white py-14 sm:py-20"><div className="container-shell"><span className="eyebrow">Arsip suara publik</span><div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="font-display text-4xl font-bold text-civic-950 sm:text-5xl">Data aspirasi warga</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Telusuri persoalan, usulan, dan perkembangan tindak lanjut di setiap wilayah.</p></div><div className="rounded-2xl bg-civic-950 px-6 py-4 text-white"><strong className="font-display text-3xl">{meta.total}</strong><span className="ml-2 text-xs uppercase tracking-[.12em] text-teal-200">aspirasi ditemukan</span></div></div></div></section>
      <div className="container-shell py-9">
        <form onSubmit={apply} className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><span className="flex items-center gap-2 font-display text-lg font-bold text-civic-950"><Filter size={18} className="text-civic-600" /> Saring data</span><button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600"><RotateCcw size={14} /> Reset semua</button></div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="relative lg:col-span-2"><span className="field-label">Kata kunci / kode</span><Search size={17} className="absolute bottom-3 left-3.5 text-slate-400" /><input className="field pl-10" value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} placeholder="Cari judul, isi, atau kode pelacakan..." /></label>
            <label><span className="field-label">Kategori</span><select className="field" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}><option value="">Semua kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label><span className="field-label">Status</span><select className="field" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option value="">Semua status</option>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          </div>
          <div className="mt-4"><RegionSelector compact value={region} onChange={setRegion} /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><label><span className="field-label">Dari tanggal</span><input type="date" className="field" value={draft.dateFrom} onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value })} /></label><label><span className="field-label">Sampai tanggal</span><input type="date" className="field" value={draft.dateTo} onChange={(e) => setDraft({ ...draft, dateTo: e.target.value })} /></label><button className="btn-primary self-end"><Search size={16} /> Terapkan filter</button></div>
        </form>

        {loading ? <LoadingSpinner full /> : items.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <AspirationCard key={item.id} item={item} />)}</div>
        ) : (
          <div className="panel mt-8 grid min-h-72 place-items-center p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Inbox /></span><h2 className="mt-4 font-display text-2xl font-bold">Belum ada data yang cocok</h2><p className="mt-2 text-sm text-slate-500">Ubah kata kunci atau longgarkan filter pencarian.</p></div></div>
        )}

        {meta.totalPages > 1 && <div className="mt-9 flex items-center justify-center gap-3"><button className="btn-secondary px-3 py-2.5" disabled={meta.page <= 1} onClick={() => setQuery((old) => ({ ...old, page: old.page - 1 }))}><ChevronLeft size={17} /> Sebelumnya</button><span className="px-3 text-sm font-semibold text-slate-600">{meta.page} / {meta.totalPages}</span><button className="btn-secondary px-3 py-2.5" disabled={meta.page >= meta.totalPages} onClick={() => setQuery((old) => ({ ...old, page: old.page + 1 }))}>Berikutnya <ChevronRight size={17} /></button></div>}
      </div>
    </div>
  );
}
