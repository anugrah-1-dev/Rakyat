import { BarChart3, ClipboardList, Gauge, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/admin/dashboard', 'Ikhtisar', Gauge],
  ['/admin/aspirasi', 'Kelola Aspirasi', ClipboardList],
  ['/admin/analytics', 'Analitik Wilayah', BarChart3]
];

export default function AdminSidebar({ open, onToggle }) {
  const { admin, logout } = useAuth();
  return (
    <aside className={`fixed inset-y-0 left-0 z-[1100] flex w-72 flex-col bg-civic-950 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6"><Brand inverse /><button className="lg:hidden" onClick={onToggle}><PanelLeftClose size={20} /></button></div>
      <div className="px-5 pt-7"><p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-teal-300">Pusat Kendali</p><nav className="mt-3 grid gap-1.5">{links.map(([to, label, Icon]) => <NavLink key={to} to={to} onClick={() => window.innerWidth < 1024 && onToggle()} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive ? 'bg-white text-civic-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={19} />{label}</NavLink>)}</nav></div>
      <div className="mt-auto border-t border-white/10 p-5"><div className="mb-4 flex items-center gap-3 px-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-teal-400 font-display font-bold text-civic-950">{admin?.name?.[0] || 'A'}</span><span className="min-w-0"><strong className="block truncate text-sm">{admin?.name}</strong><small className="block truncate text-slate-400">{admin?.email}</small></span></div><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-rose-500/10 hover:text-rose-300"><LogOut size={18} /> Keluar</button></div>
      <button onClick={onToggle} className="absolute -right-11 top-4 grid h-10 w-10 place-items-center rounded-r-xl bg-civic-950 text-white shadow-lg lg:hidden"><PanelLeftOpen size={19} /></button>
    </aside>
  );
}
