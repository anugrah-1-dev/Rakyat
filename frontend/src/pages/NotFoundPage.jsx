import { ArrowLeft, MapPinOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="grid min-h-[65vh] place-items-center px-4 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-civic-50 text-civic-600"><MapPinOff size={30} /></span><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-blue-600">404 / Tidak ditemukan</p><h1 className="mt-2 font-display text-4xl font-bold text-civic-950">Halaman tidak ada di peta.</h1><p className="mt-3 text-sm text-slate-500">Alamat mungkin berubah atau sudah tidak tersedia.</p><Link to="/" className="btn-primary mt-7"><ArrowLeft size={17} /> Kembali ke beranda</Link></div></div>;
}
