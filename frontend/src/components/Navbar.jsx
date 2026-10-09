import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import Brand from './Brand';

const links = [
  ['/', 'Beranda'],
  ['/aspirasi', 'Data Aspirasi'],
  ['/tentang', 'Tentang']
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-civic-50 text-civic-700' : 'text-slate-600 hover:text-civic-700'}`;

  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="container-shell flex h-[72px] items-center justify-between">
        <Link to="/" aria-label="RuangWarga - Beranda"><Brand /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([to, text]) => <NavLink key={to} to={to} end={to === '/'} className={navClass}>{text}</NavLink>)}
          <Link to="/admin/login" className="ml-3 inline-flex items-center gap-2 rounded-xl bg-civic-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-civic-900">
            <ShieldCheck size={16} /> Portal Admin
          </Link>
        </nav>
        <button className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Buka navigasi">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="container-shell grid gap-1 border-t border-slate-100 py-3 md:hidden">
          {links.map(([to, text]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={navClass}>{text}</NavLink>)}
          <Link to="/admin/login" onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-civic-950 px-4 py-3 text-center text-sm font-bold text-white">Portal Admin</Link>
        </nav>
      )}
    </header>
  );
}
