import { Outlet, Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Brand from '../components/Brand';

export default function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main><Outlet /></main>
      <footer className="mt-20 bg-civic-950 text-white">
        <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.4fr_.7fr_.9fr]">
          <div><Brand inverse /><p className="mt-5 max-w-md text-sm leading-6 text-slate-300">Ruang bersama untuk menyampaikan kebutuhan, memetakan persoalan, dan mengawal tindak lanjut pembangunan lokal.</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-300">Jelajahi</p><div className="mt-4 grid gap-3 text-sm text-slate-300"><Link to="/aspirasi" className="hover:text-white">Data aspirasi</Link><Link to="/tentang" className="hover:text-white">Tentang platform</Link><Link to="/admin/login" className="hover:text-white">Masuk admin</Link></div></div>
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-300">Transparansi dimulai dari suara</p><p className="mt-4 text-sm leading-6 text-slate-300">Prototype civic-tech lokal untuk pembelajaran dan pengembangan internal.</p><a href="mailto:halo@ruangwarga.local" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white"><Mail size={16} /> halo@ruangwarga.local <ArrowUpRight size={14} /></a></div>
        </div>
        <div className="border-t border-white/10"><div className="container-shell flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:justify-between"><span>&copy; {new Date().getFullYear()} RuangWarga</span><span>Dibangun untuk aspirasi yang lebih terukur.</span></div></div>
      </footer>
    </div>
  );
}
