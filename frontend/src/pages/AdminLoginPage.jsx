import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/axiosClient';

export default function AdminLoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: 'admin@local.test', password: 'admin123' });
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  if (token) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault(); setBusy(true);
    try { await login(form); toast.success('Selamat datang di Pusat Kendali.'); navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true }); }
    catch (error) { toast.error(errorMessage(error, 'Login gagal.')); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-civic-950 p-14 text-white lg:flex lg:flex-col"><div className="absolute inset-0 bg-civic-grid bg-[size:44px_44px]" /><div className="relative"><Brand inverse /></div><div className="relative my-auto max-w-xl"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-teal-300"><ShieldCheck size={16} /> Area pengelola</span><h1 className="mt-6 font-display text-6xl font-bold leading-[1.08]">Mengawal suara,<br />menjaga kepercayaan.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Verifikasi laporan, perbarui tindak lanjut, dan baca prioritas wilayah dari satu pusat kendali.</p></div><p className="relative text-xs text-slate-500">Akses terbatas untuk administrator terotorisasi.</p></section>
      <section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><Link to="/" className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-civic-700"><ArrowLeft size={17} /> Kembali ke situs publik</Link><div className="lg:hidden"><Brand /></div><h2 className="mt-8 font-display text-4xl font-bold text-civic-950 lg:mt-0">Masuk admin</h2><p className="mt-2 text-sm text-slate-500">Gunakan akun pengelola RuangWarga.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block"><span className="field-label">Email</span><div className="relative"><Mail size={17} className="absolute left-3.5 top-3.5 text-slate-400" /><input type="email" required className="field pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></label><label className="block"><span className="field-label">Kata sandi</span><div className="relative"><LockKeyhole size={17} className="absolute left-3.5 top-3.5 text-slate-400" /><input type={visible ? 'text' : 'password'} required className="field px-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setVisible(!visible)} className="absolute right-3 top-3 text-slate-400">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label><button disabled={busy} className="btn-primary w-full py-3.5"><LogIn size={18} />{busy ? 'Memeriksa...' : 'Masuk ke Pusat Kendali'}</button></form><div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500"><b className="text-slate-700">Akun demo lokal:</b> admin@local.test / admin123</div></div></section>
    </div>
  );
}
