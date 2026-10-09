import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { token } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (!token) return <Navigate to="/admin/login" replace state={{ from: location }} />;

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar open={open} onToggle={() => setOpen((value) => !value)} />
      {open && <button aria-label="Tutup menu" className="fixed inset-0 z-[1050] bg-slate-950/45 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-[900] flex h-[64px] items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden"><button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><Menu size={20} /></button><span className="ml-3 font-display text-lg font-bold text-civic-950">Pusat Kendali</span></header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
