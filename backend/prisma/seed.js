const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  ['Infrastruktur', 'infrastruktur', 'Jalan, jembatan, drainase, dan fasilitas umum.', '#2563EB', 'construction'],
  ['Pendidikan', 'pendidikan', 'Layanan, sarana, dan akses pendidikan.', '#7C3AED', 'graduation-cap'],
  ['Kesehatan', 'kesehatan', 'Pelayanan dan fasilitas kesehatan masyarakat.', '#DC2626', 'heart-pulse'],
  ['Ekonomi', 'ekonomi', 'Kesempatan kerja dan penguatan ekonomi lokal.', '#16A34A', 'chart-line'],
  ['Pertanian', 'pertanian', 'Produksi, irigasi, dan kesejahteraan petani.', '#65A30D', 'sprout'],
  ['Lingkungan', 'lingkungan', 'Sampah, pencemaran, dan kelestarian lingkungan.', '#0D9488', 'leaf'],
  ['Keamanan', 'keamanan', 'Ketertiban dan keamanan lingkungan.', '#B91C1C', 'shield'],
  ['Sosial', 'sosial', 'Kesejahteraan dan layanan sosial masyarakat.', '#DB2777', 'users'],
  ['Transportasi', 'transportasi', 'Angkutan umum, lalu lintas, dan mobilitas.', '#EA580C', 'bus'],
  ['Administrasi Publik', 'administrasi-publik', 'Dokumen dan kualitas layanan pemerintahan.', '#475569', 'landmark'],
  ['Bantuan Sosial', 'bantuan-sosial', 'Penyaluran dan ketepatan sasaran bantuan.', '#C026D3', 'hand-heart'],
  ['UMKM', 'umkm', 'Perizinan, pemasaran, dan pembinaan usaha kecil.', '#CA8A04', 'store'],
  ['Air Bersih', 'air-bersih', 'Akses dan kualitas air bersih.', '#0284C7', 'droplets'],
  ['Internet dan Digitalisasi', 'internet-dan-digitalisasi', 'Konektivitas dan layanan digital.', '#4F46E5', 'wifi'],
  ['Pariwisata', 'pariwisata', 'Destinasi, fasilitas, dan ekonomi pariwisata.', '#0891B2', 'map'],
  ['Lainnya', 'lainnya', 'Aspirasi di luar kategori yang tersedia.', '#64748B', 'circle-ellipsis']
];

const regions = [
  {
    code: '34.71', name: 'Kota Yogyakarta', districts: [
      { code: '34.71.05', name: 'Gondokusuman', villages: [['34.71.05.1001', 'Baciro'], ['34.71.05.1002', 'Demangan']] },
      { code: '34.71.09', name: 'Umbulharjo', villages: [['34.71.09.1001', 'Muja Muju'], ['34.71.09.1002', 'Sorosutan']] }
    ]
  },
  {
    code: '34.04', name: 'Sleman', districts: [
      { code: '34.04.11', name: 'Mlati', villages: [['34.04.11.2001', 'Sinduadi'], ['34.04.11.2002', 'Sendangadi']] },
      { code: '34.04.07', name: 'Depok', villages: [['34.04.07.2001', 'Caturtunggal'], ['34.04.07.2002', 'Condongcatur']] },
      { code: '34.04.12', name: 'Gamping', villages: [['34.04.12.2001', 'Ambarketawang'], ['34.04.12.2002', 'Balecatur']] }
    ]
  },
  {
    code: '34.02', name: 'Bantul', districts: [
      { code: '34.02.04', name: 'Sewon', villages: [['34.02.04.2001', 'Panggungharjo'], ['34.02.04.2002', 'Timbulharjo']] },
      { code: '34.02.17', name: 'Kasihan', villages: [['34.02.17.2001', 'Tirtonirmolo'], ['34.02.17.2002', 'Bangunjiwo']] }
    ]
  },
  {
    code: '34.01', name: 'Kulon Progo', districts: [
      { code: '34.01.01', name: 'Wates', villages: [['34.01.01.2001', 'Wates'], ['34.01.01.2002', 'Giripeni']] },
      { code: '34.01.08', name: 'Sentolo', villages: [['34.01.08.2001', 'Sentolo'], ['34.01.08.2002', 'Salamrejo']] }
    ]
  },
  {
    code: '34.03', name: 'Gunungkidul', districts: [
      { code: '34.03.11', name: 'Wonosari', villages: [['34.03.11.2001', 'Wonosari'], ['34.03.11.2002', 'Kepek']] },
      { code: '34.03.06', name: 'Playen', villages: [['34.03.06.2001', 'Playen'], ['34.03.06.2002', 'Bandung']] }
    ]
  }
];

const aspirationSeeds = [
  ['Jalan lingkungan rusak dan berlubang', 'Permukaan jalan lingkungan di sekitar permukiman rusak dan berlubang sehingga membahayakan pengendara saat hujan.', 'infrastruktur', '34.04.11.2001', -7.7472, 110.3604, 'MENUNGGU_VERIFIKASI', 3],
  ['Lampu penerangan dekat sekolah padam', 'Lampu penerangan jalan menuju sekolah sudah lama padam dan membuat siswa merasa tidak aman pada pagi hari.', 'pendidikan', '34.04.07.2001', -7.7721, 110.3788, 'TERVERIFIKASI', 8],
  ['Antrean layanan puskesmas terlalu panjang', 'Warga lanjut usia harus menunggu terlalu lama karena loket pendaftaran puskesmas hanya melayani melalui satu jalur.', 'kesehatan', '34.02.17.2001', -7.8279, 110.3291, 'DIPROSES', 16],
  ['Saluran drainase pasar perlu dibersihkan', 'Saluran drainase di sisi pasar penuh sedimen dan sampah sehingga air meluap ke jalan ketika hujan deras turun.', 'lingkungan', '34.71.05.1001', -7.7838, 110.3901, 'SELESAI', 42],
  ['Jadwal angkutan umum belum memadai', 'Angkutan umum menuju pusat kota sangat jarang pada sore hari sehingga pekerja kesulitan mendapatkan transportasi.', 'transportasi', '34.01.01.2001', -7.8587, 110.1588, 'DIPROSES', 25],
  ['Jaringan internet sering terputus', 'Koneksi internet di wilayah desa sering terputus dan menghambat kegiatan belajar serta pelayanan administrasi daring.', 'internet-dan-digitalisasi', '34.03.06.2001', -7.9521, 110.5517, 'MENUNGGU_VERIFIKASI', 5],
  ['Distribusi air bersih tidak lancar', 'Aliran air bersih hanya tersedia beberapa jam dalam sehari dan belum mencukupi kebutuhan seluruh keluarga warga.', 'air-bersih', '34.02.17.2002', -7.8465, 110.3158, 'TERVERIFIKASI', 11],
  ['Pelatihan pemasaran untuk pelaku UMKM', 'Pelaku usaha kecil membutuhkan pelatihan pemasaran digital dan pendampingan untuk memperluas jangkauan produknya.', 'umkm', '34.04.07.2002', -7.7524, 110.4088, 'SELESAI', 67],
  ['Data penerima bantuan perlu diperbarui', 'Daftar penerima bantuan sosial masih memuat data lama sehingga beberapa keluarga yang membutuhkan belum terjangkau.', 'bantuan-sosial', '34.03.11.2002', -7.9653, 110.6031, 'DITOLAK', 31],
  ['Irigasi sawah mengalami kebocoran', 'Saluran irigasi utama mengalami kebocoran pada beberapa titik dan mengurangi pasokan air bagi lahan pertanian warga.', 'pertanian', '34.01.08.2002', -7.8348, 110.2254, 'DIPROSES', 19],
  ['Rambu penyeberangan perlu ditambah', 'Persimpangan dekat kawasan permukiman ramai dilalui kendaraan tetapi belum dilengkapi rambu penyeberangan yang jelas.', 'keamanan', '34.71.09.1001', -7.8058, 110.3905, 'MENUNGGU_VERIFIKASI', 2],
  ['Toilet kawasan wisata perlu diperbaiki', 'Fasilitas toilet di kawasan wisata tidak terawat dan perlu segera diperbaiki agar nyaman digunakan oleh pengunjung.', 'pariwisata', '34.03.11.2001', -7.9686, 110.6010, 'TERVERIFIKASI', 13]
];

function historyFor(status, createdAt, adminId) {
  const sequence = status === 'DITOLAK'
    ? ['MENUNGGU_VERIFIKASI', 'DITOLAK']
    : ['MENUNGGU_VERIFIKASI', 'TERVERIFIKASI', 'DIPROSES', 'SELESAI'].slice(0, {
        MENUNGGU_VERIFIKASI: 1,
        TERVERIFIKASI: 2,
        DIPROSES: 3,
        SELESAI: 4
      }[status]);

  return sequence.map((newStatus, index) => ({
    oldStatus: index === 0 ? null : sequence[index - 1],
    newStatus,
    note: index === 0 ? 'Aspirasi diterima oleh sistem.' : `Status diperbarui menjadi ${newStatus}.`,
    adminId: index === 0 ? null : adminId,
    createdAt: new Date(createdAt.getTime() + index * 24 * 60 * 60 * 1000)
  }));
}

async function main() {
  const password = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@local.test' },
    update: { name: 'Administrator', password, role: 'admin' },
    create: { name: 'Administrator', email: 'admin@local.test', password, role: 'admin' }
  });

  for (const [name, slug, description, color, icon] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description, color, icon },
      create: { name, slug, description, color, icon }
    });
  }

  const province = await prisma.province.upsert({
    where: { code: '34' },
    update: { name: 'Daerah Istimewa Yogyakarta' },
    create: { code: '34', name: 'Daerah Istimewa Yogyakarta' }
  });

  for (const regencyData of regions) {
    const regency = await prisma.regency.upsert({
      where: { code: regencyData.code },
      update: { name: regencyData.name, provinceId: province.id },
      create: { code: regencyData.code, name: regencyData.name, provinceId: province.id }
    });

    for (const districtData of regencyData.districts) {
      const district = await prisma.district.upsert({
        where: { code: districtData.code },
        update: { name: districtData.name, regencyId: regency.id },
        create: { code: districtData.code, name: districtData.name, regencyId: regency.id }
      });

      for (const [code, name] of districtData.villages) {
        await prisma.village.upsert({
          where: { code },
          update: { name, districtId: district.id },
          create: { code, name, districtId: district.id }
        });
      }
    }
  }

  const categoryRows = await prisma.category.findMany();
  const categoryBySlug = Object.fromEntries(categoryRows.map((category) => [category.slug, category]));
  const villageRows = await prisma.village.findMany({
    include: { district: { include: { regency: true } } }
  });
  const villageByCode = Object.fromEntries(villageRows.map((village) => [village.code, village]));

  for (let index = 0; index < aspirationSeeds.length; index += 1) {
    const [title, content, categorySlug, villageCode, latitude, longitude, status, ageDays] = aspirationSeeds[index];
    const village = villageByCode[villageCode];
    const createdAt = new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000);
    const histories = historyFor(status, createdAt, admin.id);

    await prisma.aspiration.upsert({
      where: { trackingCode: `ASP-SEED-${String(index + 1).padStart(3, '0')}` },
      update: {},
      create: {
        trackingCode: `ASP-SEED-${String(index + 1).padStart(3, '0')}`,
        phone: `08123456${String(7800 + index)}`,
        maskedPhone: `0812****${String(800 + index)}`,
        phoneVerified: true,
        title,
        content,
        categoryId: categoryBySlug[categorySlug].id,
        provinceId: village.district.regency.provinceId,
        regencyId: village.district.regencyId,
        districtId: village.districtId,
        villageId: village.id,
        latitude,
        longitude,
        status,
        adminNote: status === 'MENUNGGU_VERIFIKASI' ? null : 'Data seed untuk demonstrasi tindak lanjut.',
        verifiedByAdminId: status === 'MENUNGGU_VERIFIKASI' ? null : admin.id,
        createdAt,
        updatedAt: histories[histories.length - 1].createdAt,
        statusHistory: { create: histories }
      }
    });
  }

  console.log('Seed completed: DIY regions, 16 categories, admin, and 12 aspirations.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
