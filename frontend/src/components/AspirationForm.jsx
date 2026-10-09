import { useEffect, useState } from 'react';
import { CheckCircle2, FileImage, LocateFixed, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { aspirationApi } from '../api';
import { errorMessage } from '../api/axiosClient';
import MapView from './MapView';
import RegionSelector, { emptyRegion } from './RegionSelector';

const initialForm = { phone: '', categoryId: '', title: '', content: '', evidenceImage: '', captchaAnswer: '' };

export default function AspirationForm({ markers = [], onSubmitted }) {
  const [form, setForm] = useState(initialForm);
  const [region, setRegion] = useState({ ...emptyRegion });
  const [location, setLocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [captcha, setCaptcha] = useState(null);
  const [verifiedPhone, setVerifiedPhone] = useState(null);
  const [busy, setBusy] = useState('');

  const loadCaptcha = async () => {
    try { setCaptcha(await aspirationApi.captcha()); setForm((old) => ({ ...old, captchaAnswer: '' })); }
    catch { toast.error('CAPTCHA tidak dapat dimuat.'); }
  };

  useEffect(() => {
    aspirationApi.categories().then(setCategories).catch(() => toast.error('Kategori gagal dimuat.'));
    loadCaptcha();
  }, []);

  const update = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
    if (key === 'phone') setVerifiedPhone(null);
  };

  const verifyPhone = async () => {
    if (form.phone.replace(/\D/g, '').length < 10) return toast.error('Masukkan sedikitnya 10 digit nomor.');
    setBusy('phone');
    try {
      const result = await aspirationApi.verifyWhatsapp(form.phone);
      setVerifiedPhone(result);
      toast.success(result.message);
    } catch (error) { setVerifiedPhone(null); toast.error(errorMessage(error)); }
    finally { setBusy(''); }
  };

  const validate = () => {
    if (!verifiedPhone?.verified) return 'Verifikasi nomor WhatsApp terlebih dahulu.';
    if (!region.villageId) return 'Pilih wilayah lengkap hingga desa/kelurahan.';
    if (!form.categoryId) return 'Pilih kategori aspirasi.';
    if (form.title.trim().length < 5) return 'Judul minimal 5 karakter.';
    if (form.content.trim().length < 50) return 'Isi aspirasi minimal 50 karakter.';
    if (form.content.length > 2000) return 'Isi aspirasi maksimal 2.000 karakter.';
    if (!location) return 'Tandai lokasi kejadian pada peta.';
    if (!captcha || form.captchaAnswer === '') return 'Jawab CAPTCHA terlebih dahulu.';
    return null;
  };

  const submit = async (event) => {
    event.preventDefault();
    const invalid = validate();
    if (invalid) return toast.error(invalid);
    setBusy('submit');
    try {
      const result = await aspirationApi.submit({
        phone: form.phone, phoneVerified: true, title: form.title.trim(), content: form.content.trim(),
        categoryId: Number(form.categoryId), provinceId: Number(region.provinceId), regencyId: Number(region.regencyId),
        districtId: Number(region.districtId), villageId: Number(region.villageId), latitude: location.lat, longitude: location.lng,
        ...(form.evidenceImage.trim() ? { evidenceImage: form.evidenceImage.trim() } : {}),
        captchaId: captcha.captchaId, captchaAnswer: Number(form.captchaAnswer)
      });
      toast.success(`${result.message} Kode: ${result.trackingCode}`, { duration: 7000 });
      setForm(initialForm); setRegion({ ...emptyRegion }); setLocation(null); setVerifiedPhone(null);
      loadCaptcha(); onSubmitted?.();
    } catch (error) {
      const freshCaptcha = error.response?.data?.captcha;
      if (freshCaptcha) { setCaptcha(freshCaptcha); setForm((old) => ({ ...old, captchaAnswer: '' })); }
      else loadCaptcha();
      toast.error(errorMessage(error, 'Aspirasi gagal dikirim.'));
    } finally { setBusy(''); }
  };

  return (
    <form onSubmit={submit} className="grid overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-lift lg:grid-cols-[1.15fr_.85fr]">
      <div className="relative min-h-[520px] border-b border-slate-200 p-3 lg:min-h-[840px] lg:border-b-0 lg:border-r">
        <MapView markers={markers} location={location} onChange={setLocation} interactive className="h-[520px] lg:h-[814px]" />
        <div className="absolute bottom-7 right-7 z-[500] hidden rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-600 shadow-lg sm:block"><LocateFixed size={14} className="mr-1.5 inline text-civic-600" />{location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Belum ada geotag'}</div>
      </div>
      <div className="p-5 sm:p-7 lg:p-8">
        <span className="eyebrow"><ShieldCheck size={14} /> Form aspirasi aman</span>
        <h2 className="mt-2 font-display text-3xl font-bold text-civic-950">Ceritakan yang perlu dibenahi.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Lengkapi data berikut. Nomor Anda tidak akan ditampilkan secara penuh kepada publik.</p>
        <div className="mt-7 space-y-6">
          <div>
            <label className="field-label">Nomor WhatsApp <b className="text-rose-500">*</b></label>
            <div className="flex gap-2"><input className="field" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Contoh: 081234567890" inputMode="tel" /><button type="button" onClick={verifyPhone} disabled={busy === 'phone'} className="btn-secondary shrink-0 px-3.5">{busy === 'phone' ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Cek</button></div>
            {verifiedPhone && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} /> Terverifikasi sebagai {verifiedPhone.maskedPhone}</p>}
          </div>
          <RegionSelector value={region} onChange={setRegion} required />
          <label><span className="field-label">Kategori <b className="text-rose-500">*</b></span><select className="field" value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}><option value="">Pilih kategori aspirasi</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span className="field-label">Judul aspirasi <b className="text-rose-500">*</b></span><input className="field" value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={200} placeholder="Ringkas masalah dalam satu kalimat" /></label>
          <label><span className="field-label">Isi aspirasi <b className="text-rose-500">*</b></span><textarea className="field min-h-32 resize-y" value={form.content} onChange={(event) => update('content', event.target.value)} maxLength={2000} placeholder="Jelaskan kondisi, dampak, dan kebutuhan warga secara rinci..." /><span className={`mt-1 block text-right text-[11px] ${form.content.length < 50 ? 'text-slate-400' : 'text-emerald-600'}`}>{form.content.length}/2.000 karakter</span></label>
          <label><span className="field-label"><FileImage size={14} className="mr-1 inline" /> Tautan foto bukti <span className="font-normal normal-case tracking-normal text-slate-400">(opsional)</span></span><input type="url" className="field" value={form.evidenceImage} onChange={(event) => update('evidenceImage', event.target.value)} maxLength={500} placeholder="https://..." /></label>
          <div className="rounded-2xl border border-dashed border-civic-200 bg-civic-50/60 p-4">
            <div className="flex items-center justify-between gap-3"><span><span className="field-label !mb-1">Verifikasi anti-spam</span><strong className="font-display text-lg text-civic-950">{captcha?.question || 'Memuat pertanyaan...'}</strong></span><button type="button" onClick={loadCaptcha} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-civic-700 shadow-sm" title="Ganti CAPTCHA"><RefreshCw size={16} /></button></div>
            <input className="field mt-3" value={form.captchaAnswer} onChange={(event) => update('captchaAnswer', event.target.value)} type="number" inputMode="numeric" placeholder="Masukkan jawaban" />
          </div>
          <button type="submit" disabled={busy === 'submit'} className="btn-primary w-full py-3.5">{busy === 'submit' ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />} {busy === 'submit' ? 'Mengirim...' : 'Kirim aspirasi'}</button>
          <p className="text-center text-[11px] leading-5 text-slate-400">Dengan mengirim, Anda menyatakan informasi yang diberikan benar dan dapat diverifikasi oleh pengelola.</p>
        </div>
      </div>
    </form>
  );
}
