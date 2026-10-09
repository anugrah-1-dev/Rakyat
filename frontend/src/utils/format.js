export const STATUS_LABELS = {
  MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi',
  TERVERIFIKASI: 'Terverifikasi',
  DIPROSES: 'Diproses',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak'
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

export const formatDate = (value, includeTime = false) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  }).format(new Date(value));
};

export const regionName = (item) =>
  [item?.village?.name, item?.district?.name, item?.regency?.name, item?.province?.name].filter(Boolean).join(', ');

export const compactNumber = (number = 0) => new Intl.NumberFormat('id-ID', {
  notation: number > 9999 ? 'compact' : 'standard', maximumFractionDigits: 1
}).format(number);

export const monthLabel = (month) => new Intl.DateTimeFormat('id-ID', { month: 'short' })
  .format(new Date(`${month}-01T00:00:00Z`));
