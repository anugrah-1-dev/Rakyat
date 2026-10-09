import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FilePenLine, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { aspirationApi } from '../api';
import { errorMessage } from '../api/axiosClient';
import AdminPageHeader from '../components/AdminPageHeader';
import { CategoryBadge, StatusBadge } from '../components/Badges';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, STATUS_OPTIONS } from '../utils/format';

export default function AdminAspirationPage() {
  const [query, setQuery] = useState({ keyword: '', status: '', page: 1, limit: 10 });
  const [draft, setDraft] = useState({ keyword: '', status: '' });
  const [result, setResult] = useState({ data: [], meta: { page: 1, total: 0, totalPages: 1 } });
  const [editing, setEditing] = useState(null);
  const [update, setUpdate] = useState({ status: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    aspirationApi.adminList(query).then(setResult).catch((error) => toast.error(errorMessage(error))).finally(() => setLoading(false));
  };
  useEffect(load, [query]);

  const search = (event) => { event.preventDefault(); setQuery({ ...query, ...draft, page: 1 }); };
  const openEdit = (item) => { setEditing(item); setUpdate({ status: item.status, note: item.adminNote || '' }); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try { await aspirationApi.updateStatus(editing.id, { status: update.status, note: update.note.trim() || null }); toast.success('Status dan catatan berhasil diperbarui.'); setEditing(null); load(); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setSaving(false); }
  };
  const remove = async (item) => {
    if (!window.confirm(`Hapus permanen ${item.trackingCode}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try { await aspirationApi.remove(item.id); toast.success('Aspirasi dihapus.'); load(); }
    catch (error) { toast.error(errorMessage(error)); }
  };

  return (
    <div>
      <AdminPageHeader eyebrow="Moderasi dan tindak lanjut" title="Kelola aspirasi" description={`${result.meta.total} aspirasi tersimpan. Perbarui status dan catatan tindak lanjut dengan cermat.`} />
      <form onSubmit={search} className="panel mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_220px_auto]"><label className="relative"><Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" /><input className="field pl-10" value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} placeholder="Cari judul atau kode..." /></label><select className="field" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option value="">Semua status</option>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><button className="btn-primary py-2.5">Terapkan</button></form>
      {loading ? <LoadingSpinner full /> : <section className="panel overflow-hidden">
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-[.12em] text-slate-500"><tr><th className="px-5 py-4">Aspirasi</th><th className="px-5 py-4">Wilayah</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Tanggal</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y">{result.data.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="max-w-md px-5 py-4"><span className="text-[10px] font-bold text-blue-600">{item.trackingCode}</span><strong className="mt-1 block text-sm text-slate-800">{item.title}</strong><div className="mt-2"><CategoryBadge category={item.category} /></div></td><td className="px-5 py-4 text-xs text-slate-500">{item.village.name}<br />{item.district.name}, {item.regency.name}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(item.createdAt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(item)} className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Ubah status"><FilePenLine size={16} /></button><button onClick={() => remove(item)} className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100" title="Hapus spam"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
        <div className="divide-y md:hidden">{result.data.map((item) => <article key={item.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-bold text-blue-600">{item.trackingCode}</span><h3 className="mt-1 text-sm font-bold text-slate-800">{item.title}</h3></div><StatusBadge status={item.status} /></div><p className="mt-3 text-xs text-slate-500">{item.village.name}, {item.regency.name} / {formatDate(item.createdAt)}</p><div className="mt-4 flex gap-2"><button onClick={() => openEdit(item)} className="btn-secondary flex-1 py-2"><FilePenLine size={15} /> Perbarui</button><button onClick={() => remove(item)} className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600"><Trash2 size={16} /></button></div></article>)}</div>
        {!result.data.length && <div className="py-16 text-center text-sm text-slate-500">Tidak ada aspirasi yang cocok.</div>}
      </section>}
      {result.meta.totalPages > 1 && <div className="mt-6 flex items-center justify-end gap-3"><button className="btn-secondary px-3 py-2" disabled={query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}><ChevronLeft size={16} /></button><span className="text-xs font-bold text-slate-500">Halaman {result.meta.page} dari {result.meta.totalPages}</span><button className="btn-secondary px-3 py-2" disabled={query.page >= result.meta.totalPages} onClick={() => setQuery({ ...query, page: query.page + 1 })}><ChevronRight size={16} /></button></div>}

      {editing && <div className="fixed inset-0 z-[2000] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"><form onSubmit={save} className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-600">{editing.trackingCode}</span><h2 className="mt-1 font-display text-2xl font-bold text-civic-950">Perbarui tindak lanjut</h2></div><button type="button" onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500"><X size={18} /></button></div><p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{editing.title}</p><label className="mt-5 block"><span className="field-label">Status baru</span><select className="field" value={update.status} onChange={(e) => setUpdate({ ...update, status: e.target.value })}>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="mt-4 block"><span className="field-label">Catatan admin</span><textarea className="field min-h-28" maxLength={1000} value={update.note} onChange={(e) => setUpdate({ ...update, note: e.target.value })} placeholder="Contoh: Telah diteruskan ke dinas terkait..." /></label><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="btn-secondary">Batal</button><button disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button></div></form></div>}
    </div>
  );
}
