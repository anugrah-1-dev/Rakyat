import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { regionApi } from '../api';

const emptyRegion = { provinceId: '', regencyId: '', districtId: '', villageId: '', province: null, regency: null, district: null, village: null };

export default function RegionSelector({ value = emptyRegion, onChange, compact = false, required = false }) {
  const [options, setOptions] = useState({ provinces: [], regencies: [], districts: [], villages: [] });
  const [loading, setLoading] = useState('');

  useEffect(() => {
    regionApi.provinces().then((data) => setOptions((old) => ({ ...old, provinces: data }))).catch(() => toast.error('Daftar provinsi gagal dimuat.'));
  }, []);

  useEffect(() => {
    if (!value.provinceId) return setOptions((old) => ({ ...old, regencies: [], districts: [], villages: [] }));
    setLoading('regency');
    regionApi.regencies(value.provinceId).then((data) => setOptions((old) => ({ ...old, regencies: data }))).catch(() => toast.error('Daftar kabupaten/kota gagal dimuat.')).finally(() => setLoading(''));
  }, [value.provinceId]);

  useEffect(() => {
    if (!value.regencyId) return setOptions((old) => ({ ...old, districts: [], villages: [] }));
    setLoading('district');
    regionApi.districts(value.regencyId).then((data) => setOptions((old) => ({ ...old, districts: data }))).catch(() => toast.error('Daftar kecamatan gagal dimuat.')).finally(() => setLoading(''));
  }, [value.regencyId]);

  useEffect(() => {
    if (!value.districtId) return setOptions((old) => ({ ...old, villages: [] }));
    setLoading('village');
    regionApi.villages(value.districtId).then((data) => setOptions((old) => ({ ...old, villages: data }))).catch(() => toast.error('Daftar desa/kelurahan gagal dimuat.')).finally(() => setLoading(''));
  }, [value.districtId]);

  const change = (level, id) => {
    const map = { province: 'provinces', regency: 'regencies', district: 'districts', village: 'villages' };
    const selected = options[map[level]].find((item) => String(item.id) === id) || null;
    const next = { ...value, [`${level}Id`]: id, [level]: selected };
    if (level === 'province') Object.assign(next, { regencyId: '', districtId: '', villageId: '', regency: null, district: null, village: null });
    if (level === 'regency') Object.assign(next, { districtId: '', villageId: '', district: null, village: null });
    if (level === 'district') Object.assign(next, { villageId: '', village: null });
    onChange(next);
  };

  const fields = [
    ['province', 'Provinsi', options.provinces, false],
    ['regency', 'Kabupaten/Kota', options.regencies, !value.provinceId],
    ['district', 'Kecamatan', options.districts, !value.regencyId],
    ['village', 'Desa/Kelurahan', options.villages, !value.districtId]
  ];

  return (
    <div>
      <div className={`grid gap-3 ${compact ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {fields.map(([level, label, items, disabled]) => (
          <label key={level}>
            <span className="field-label">{label}{required && <b className="ml-1 text-rose-500">*</b>}</span>
            <select className="field" value={value[`${level}Id`] || ''} disabled={disabled || loading === level} onChange={(event) => change(level, event.target.value)}>
              <option value="">{loading === level ? 'Memuat...' : `Pilih ${label}`}</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        ))}
      </div>
      {value.villageId && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-civic-50 px-3.5 py-3 text-xs text-civic-900">
          <span><b>Wilayah terpilih:</b> {value.village?.name}, {value.district?.name}, {value.regency?.name}, {value.province?.name}</span>
          <button type="button" onClick={() => onChange({ ...emptyRegion })} className="flex shrink-0 items-center gap-1 font-bold text-civic-700"><RotateCcw size={13} /> Reset</button>
        </div>
      )}
    </div>
  );
}

export { emptyRegion };
