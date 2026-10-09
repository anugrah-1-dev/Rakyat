import { BarChart3, Eye, MapPinned, ShieldCheck, Waypoints } from 'lucide-react';

const principles = [
  [Eye, 'Terbuka', 'Data aspirasi dapat ditelusuri publik tanpa mengekspos identitas pribadi pelapor.'],
  [MapPinned, 'Kontekstual', 'Setiap suara terhubung dengan titik kejadian dan struktur wilayah yang jelas.'],
  [Waypoints, 'Terukur', 'Riwayat status membuat proses verifikasi dan tindak lanjut mudah dipantau.'],
  [ShieldCheck, 'Aman', 'Masking nomor, CAPTCHA, dan akses admin bertoken menjaga integritas data.']
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-civic-950 py-20 text-white sm:py-28"><div className="absolute inset-0 bg-civic-grid bg-[size:42px_42px]" /><div className="container-shell relative"><span className="text-xs font-bold uppercase tracking-[.2em] text-teal-300">Tentang RuangWarga</span><h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-tight sm:text-6xl">Teknologi yang mendekatkan suara warga dengan keputusan.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Prototype civic-tech lokal untuk mengumpulkan, memetakan, dan mengawal aspirasi masyarakat secara transparan.</p></div></section>
      <section className="container-shell py-20"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><span className="eyebrow">Mengapa dibuat</span><h2 className="mt-4 font-display text-4xl font-bold text-civic-950">Masalah lokal membutuhkan konteks lokal.</h2></div><div className="space-y-5 text-base leading-8 text-slate-600"><p>Aspirasi sering hadir sebagai percakapan yang tersebar dan sulit dibaca sebagai pola. RuangWarga mengubahnya menjadi data spasial yang tetap manusiawi: setiap titik memiliki cerita, kategori, wilayah, dan jejak tindak lanjut.</p><p>Platform ini tidak mewakili lembaga pemerintah tertentu. Ia dibangun sebagai sarana pembelajaran, prototyping, dan pengembangan internal dengan identitas mandiri.</p></div></div></section>
      <section className="bg-white py-20"><div className="container-shell"><div className="grid gap-px overflow-hidden rounded-[28px] border bg-slate-200 md:grid-cols-2 xl:grid-cols-4">{principles.map(([Icon,title,text], index) => <article key={title} className="bg-white p-7 sm:p-8"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${index % 2 ? 'bg-blue-50 text-blue-600' : 'bg-civic-50 text-civic-600'}`}><Icon /></span><h3 className="mt-6 font-display text-2xl font-bold text-civic-950">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></div></section>
      <section className="container-shell py-20"><div className="grid items-center gap-10 rounded-[28px] bg-signal/15 p-8 sm:p-12 lg:grid-cols-[auto_1fr]"><span className="grid h-20 w-20 place-items-center rounded-[24px] bg-signal text-civic-950"><BarChart3 size={36} /></span><div><h2 className="font-display text-3xl font-bold text-civic-950">Dari aspirasi menjadi prioritas.</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Analitik menggabungkan jumlah laporan, antrean verifikasi, kategori kritis, dan umur aspirasi terbuka untuk membantu membaca wilayah yang paling membutuhkan perhatian.</p></div></div></section>
    </div>
  );
}
