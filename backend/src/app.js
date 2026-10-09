require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { PrismaClient, Prisma } = require('@prisma/client');
const { z, ZodError } = require('zod');

const env = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'local_development_only_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
};

const prisma = new PrismaClient();
const app = express();
const STATUSES = ['MENUNGGU_VERIFIKASI', 'TERVERIFIKASI', 'DIPROSES', 'SELESAI', 'DITOLAK'];
const statusSchema = z.enum(STATUSES);

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const parse = (schema, value) => schema.parse(value);
const idSchema = z.coerce.number().int().positive();
const optionalInt = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.coerce.number().int().positive().optional()
);
const optionalText = (max) => z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.string().trim().max(max).optional()
);
const optionalStatus = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  statusSchema.optional()
);
const optionalDate = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD.').optional()
);

app.disable('x-powered-by');
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.frontendUrls.includes(origin)) return callback(null, true);
    return callback(new HttpError(403, 'Origin tidak diizinkan oleh CORS.'));
  }
}));
app.use(express.json({ limit: '100kb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message: 'Terlalu banyak percobaan login. Coba lagi nanti.' })
});

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message: 'Terlalu banyak pengiriman aspirasi. Coba lagi nanti.' })
});

function normalizePhone(phone) {
  return phone.replace(/[\s()+-]/g, '').replace(/^\+/, '');
}

function isValidIndonesianPhone(phone) {
  return /^(?:08\d{8,13}|628\d{7,12})$/.test(phone);
}

function maskPhone(phone) {
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}

function publicAspiration(row) {
  const {
    phone,
    phoneVerified,
    adminNote,
    verifiedByAdminId,
    verifiedByAdmin,
    statusHistory,
    ...safe
  } = row;

  if (statusHistory) {
    safe.statusHistory = statusHistory.map((entry) => ({
      id: entry.id,
      oldStatus: entry.oldStatus,
      newStatus: entry.newStatus,
      createdAt: entry.createdAt
    }));
  }
  return safe;
}

async function requireAdmin(req, _res, next) {
  try {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) throw new HttpError(401, 'Token admin diperlukan.');
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    const adminId = Number(payload.sub);
    if (!Number.isInteger(adminId)) throw new HttpError(401, 'Token admin tidak valid.');

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!admin) throw new HttpError(401, 'Admin pada token tidak ditemukan.');
    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    return next(new HttpError(401, 'Token admin tidak valid atau telah kedaluwarsa.'));
  }
}

// CAPTCHA records intentionally live in process memory and expire after three minutes.
const captchas = new Map();

function createCaptcha() {
  const operation = Math.random() < 0.5 ? '+' : '-';
  let left = crypto.randomInt(1, 20);
  let right = crypto.randomInt(1, 20);
  if (operation === '-' && right > left) [left, right] = [right, left];

  const id = crypto.randomUUID();
  const expiresAt = Date.now() + 3 * 60 * 1000;
  captchas.set(id, {
    answer: operation === '+' ? left + right : left - right,
    expiresAt
  });
  return { captchaId: id, question: `Berapa hasil ${left} ${operation} ${right}?`, expiresAt: new Date(expiresAt).toISOString() };
}

function consumeCaptcha(id, answer) {
  const record = captchas.get(id);
  captchas.delete(id);
  return Boolean(record && record.expiresAt > Date.now() && record.answer === Number(answer));
}

const captchaCleanup = setInterval(() => {
  const now = Date.now();
  for (const [id, record] of captchas.entries()) {
    if (record.expiresAt <= now) captchas.delete(id);
  }
}, 60 * 1000);
captchaCleanup.unref();

const healthHandler = asyncRoute(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', database: 'connected', uptimeSeconds: Math.floor(process.uptime()) });
});
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.post('/api/auth/login', loginLimiter, asyncRoute(async (req, res) => {
  const body = parse(z.object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128)
  }).strict(), req.body);

  const admin = await prisma.admin.findUnique({ where: { email: body.email } });
  if (!admin || !(await bcrypt.compare(body.password, admin.password))) {
    throw new HttpError(401, 'Email atau password salah.');
  }

  const token = jwt.sign({ role: admin.role }, env.jwtSecret, {
    subject: String(admin.id),
    expiresIn: env.jwtExpiresIn
  });
  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
  });
}));

app.get('/api/regions/provinces', asyncRoute(async (_req, res) => {
  const data = await prisma.province.findMany({ orderBy: { name: 'asc' } });
  res.json({ data });
}));

app.get('/api/regions/regencies', asyncRoute(async (req, res) => {
  const { provinceId } = parse(z.object({ provinceId: idSchema }), req.query);
  const data = await prisma.regency.findMany({ where: { provinceId }, orderBy: { name: 'asc' } });
  res.json({ data });
}));

app.get('/api/regions/districts', asyncRoute(async (req, res) => {
  const { regencyId } = parse(z.object({ regencyId: idSchema }), req.query);
  const data = await prisma.district.findMany({ where: { regencyId }, orderBy: { name: 'asc' } });
  res.json({ data });
}));

app.get('/api/regions/villages', asyncRoute(async (req, res) => {
  const { districtId } = parse(z.object({ districtId: idSchema }), req.query);
  const data = await prisma.village.findMany({ where: { districtId }, orderBy: { name: 'asc' } });
  res.json({ data });
}));

app.get('/api/categories', asyncRoute(async (_req, res) => {
  const data = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json({ data });
}));

app.post('/api/whatsapp/verify', asyncRoute(async (req, res) => {
  const { phone } = parse(z.object({ phone: z.string().trim().min(10).max(24) }).strict(), req.body);
  const normalized = normalizePhone(phone);
  const verified = isValidIndonesianPhone(normalized);
  res.status(verified ? 200 : 400).json({
    verified,
    ...(verified ? { maskedPhone: maskPhone(normalized) } : {}),
    message: verified ? 'Nomor WhatsApp valid secara format.' : 'Nomor harus diawali 08 atau 628 dan memiliki minimal 10 digit.'
  });
}));

app.get('/api/captcha', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(createCaptcha());
});

app.post('/api/captcha/verify', (req, res, next) => {
  try {
    const body = parse(z.object({
      captchaId: z.string().uuid(),
      captchaAnswer: z.coerce.number().int()
    }).strict(), req.body);
    const record = captchas.get(body.captchaId);

    if (!record || record.expiresAt <= Date.now() || record.answer !== body.captchaAnswer) {
      captchas.delete(body.captchaId);
      return res.status(400).json({
        verified: false,
        message: 'CAPTCHA salah atau telah kedaluwarsa.',
        captcha: createCaptcha()
      });
    }
    return res.json({ verified: true, message: 'CAPTCHA benar.', expiresAt: new Date(record.expiresAt).toISOString() });
  } catch (error) {
    return next(error);
  }
});

const aspirationCreateSchema = z.object({
  phone: z.string().trim().min(10).max(24),
  phoneVerified: z.literal(true),
  title: z.string().trim().min(5).max(200),
  content: z.string().trim().min(50).max(2000),
  categoryId: idSchema,
  provinceId: idSchema,
  regencyId: idSchema,
  districtId: idSchema,
  villageId: idSchema,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  evidenceImage: z.string().trim().max(500).optional().nullable(),
  captchaId: z.string().uuid(),
  captchaAnswer: z.coerce.number().int()
}).strict();

app.post('/api/aspirations', submissionLimiter, asyncRoute(async (req, res) => {
  const body = parse(aspirationCreateSchema, req.body);
  const phone = normalizePhone(body.phone);
  if (!isValidIndonesianPhone(phone)) throw new HttpError(400, 'Format nomor WhatsApp tidak valid.');

  const [category, village] = await Promise.all([
    prisma.category.findUnique({ where: { id: body.categoryId }, select: { id: true } }),
    prisma.village.findUnique({
      where: { id: body.villageId },
      include: { district: { include: { regency: true } } }
    })
  ]);
  if (!category) throw new HttpError(400, 'Kategori tidak ditemukan.');
  if (!village || village.districtId !== body.districtId ||
      village.district.regencyId !== body.regencyId ||
      village.district.regency.provinceId !== body.provinceId) {
    throw new HttpError(400, 'Pilihan provinsi, kabupaten/kota, kecamatan, dan desa tidak konsisten.');
  }

  if (!consumeCaptcha(body.captchaId, body.captchaAnswer)) {
    throw new HttpError(400, 'CAPTCHA salah atau telah kedaluwarsa.', { captcha: createCaptcha() });
  }

  const aspiration = await prisma.$transaction(async (tx) => {
    const year = new Date().getFullYear();
    const prefix = `ASP-${year}-`;
    const latest = await tx.aspiration.findFirst({
      where: { trackingCode: { startsWith: prefix } },
      orderBy: { id: 'desc' },
      select: { trackingCode: true }
    });
    const latestNumber = latest ? Number(latest.trackingCode.slice(prefix.length)) || 0 : 0;
    const trackingCode = `${prefix}${String(latestNumber + 1).padStart(5, '0')}`;

    return tx.aspiration.create({
      data: {
        trackingCode,
        phone,
        maskedPhone: maskPhone(phone),
        phoneVerified: true,
        title: body.title,
        content: body.content,
        categoryId: body.categoryId,
        provinceId: body.provinceId,
        regencyId: body.regencyId,
        districtId: body.districtId,
        villageId: body.villageId,
        latitude: body.latitude,
        longitude: body.longitude,
        evidenceImage: body.evidenceImage || null,
        statusHistory: {
          create: { newStatus: 'MENUNGGU_VERIFIKASI', note: 'Aspirasi diterima oleh sistem.' }
        }
      }
    });
  });

  res.status(201).json({
    success: true,
    trackingCode: aspiration.trackingCode,
    message: 'Aspirasi berhasil dikirim.'
  });
}));

const listQuerySchema = z.object({
  keyword: optionalText(100),
  categoryId: optionalInt,
  status: optionalStatus,
  provinceId: optionalInt,
  regencyId: optionalInt,
  districtId: optionalInt,
  villageId: optionalInt,
  dateFrom: optionalDate,
  dateTo: optionalDate,
  page: z.preprocess((value) => value === undefined || value === '' ? 1 : value, z.coerce.number().int().min(1)),
  limit: z.preprocess((value) => value === undefined || value === '' ? 10 : value, z.coerce.number().int().min(1).max(100))
});

function aspirationWhere(query) {
  const where = {};
  if (query.keyword) {
    where.OR = [
      { title: { contains: query.keyword } },
      { content: { contains: query.keyword } },
      { trackingCode: { contains: query.keyword } }
    ];
  }
  for (const field of ['categoryId', 'status', 'provinceId', 'regencyId', 'districtId', 'villageId']) {
    if (query[field] !== undefined) where[field] = query[field];
  }
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
    if (query.dateTo) where.createdAt.lte = new Date(`${query.dateTo}T23:59:59.999Z`);
  }
  return where;
}

const publicRelations = {
  category: true,
  province: true,
  regency: true,
  district: true,
  village: true
};

app.get('/api/aspirations', asyncRoute(async (req, res) => {
  const query = parse(listQuerySchema, req.query);
  const where = aspirationWhere(query);
  const [rows, total] = await prisma.$transaction([
    prisma.aspiration.findMany({
      where,
      include: publicRelations,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    }),
    prisma.aspiration.count({ where })
  ]);

  res.json({
    data: rows.map(publicAspiration),
    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) }
  });
}));

app.get('/api/aspirations/:id', asyncRoute(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const row = await prisma.aspiration.findUnique({
    where: { id },
    include: {
      ...publicRelations,
      statusHistory: { orderBy: { createdAt: 'asc' } }
    }
  });
  if (!row) throw new HttpError(404, 'Aspirasi tidak ditemukan.');
  res.json({ data: publicAspiration(row) });
}));

app.get('/api/admin/aspirations', requireAdmin, asyncRoute(async (req, res) => {
  const query = parse(listQuerySchema, req.query);
  const where = aspirationWhere(query);
  const [data, total] = await prisma.$transaction([
    prisma.aspiration.findMany({
      where,
      include: { ...publicRelations, verifiedByAdmin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    }),
    prisma.aspiration.count({ where })
  ]);
  res.json({ data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } });
}));

app.patch('/api/admin/aspirations/:id/status', requireAdmin, asyncRoute(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const body = parse(z.object({
    status: statusSchema,
    note: z.string().trim().max(1000).optional().nullable()
  }).strict(), req.body);

  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.aspiration.findUnique({ where: { id } });
    if (!current) throw new HttpError(404, 'Aspirasi tidak ditemukan.');
    if (current.status === body.status && !body.note) {
      throw new HttpError(409, 'Status baru sama dengan status saat ini dan tidak ada catatan baru.');
    }

    const row = await tx.aspiration.update({
      where: { id },
      data: {
        status: body.status,
        adminNote: body.note || null,
        verifiedByAdminId: req.admin.id
      },
      include: { ...publicRelations, verifiedByAdmin: { select: { id: true, name: true, email: true } } }
    });
    await tx.aspirationStatusHistory.create({
      data: {
        aspirationId: id,
        oldStatus: current.status,
        newStatus: body.status,
        note: body.note || null,
        adminId: req.admin.id
      }
    });
    return row;
  });

  res.json({ data: updated, message: 'Status aspirasi berhasil diperbarui.' });
}));

app.delete('/api/admin/aspirations/:id', requireAdmin, asyncRoute(async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const existing = await prisma.aspiration.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'Aspirasi tidak ditemukan.');
  await prisma.aspiration.delete({ where: { id } });
  res.status(204).send();
}));

app.get('/api/analytics/summary', asyncRoute(async (_req, res) => {
  const [total, grouped] = await prisma.$transaction([
    prisma.aspiration.count(),
    prisma.aspiration.groupBy({ by: ['status'], _count: { _all: true } })
  ]);
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const row of grouped) byStatus[row.status] = row._count._all;
  res.json({ data: { total, withGeotag: total, byStatus } });
}));

app.get('/api/analytics/categories', asyncRoute(async (_req, res) => {
  const [categoriesList, counts] = await prisma.$transaction([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.aspiration.groupBy({ by: ['categoryId'], _count: { _all: true } })
  ]);
  const countById = Object.fromEntries(counts.map((row) => [row.categoryId, row._count._all]));
  res.json({ data: categoriesList.map((category) => ({ ...category, count: countById[category.id] || 0 })) });
}));

app.get('/api/analytics/statuses', asyncRoute(async (_req, res) => {
  const counts = await prisma.aspiration.groupBy({ by: ['status'], _count: { _all: true } });
  const countByStatus = Object.fromEntries(counts.map((row) => [row.status, row._count._all]));
  res.json({ data: STATUSES.map((status) => ({ status, count: countByStatus[status] || 0 })) });
}));

app.get('/api/analytics/monthly', asyncRoute(async (_req, res) => {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCMonth(start.getUTCMonth() - 11);
  const rows = await prisma.aspiration.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true }
  });
  const counts = new Map();
  for (let offset = 0; offset < 12; offset += 1) {
    const month = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + offset, 1));
    counts.set(month.toISOString().slice(0, 7), 0);
  }
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 7);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  res.json({ data: Array.from(counts, ([month, count]) => ({ month, count })) });
}));

app.get('/api/analytics/priority-regions', asyncRoute(async (_req, res) => {
  const criticalSlugs = new Set(['kesehatan', 'infrastruktur', 'air-bersih', 'keamanan', 'pendidikan']);
  const [regencies, aspirations] = await prisma.$transaction([
    prisma.regency.findMany({ include: { province: true }, orderBy: { name: 'asc' } }),
    prisma.aspiration.findMany({
      select: { regencyId: true, status: true, createdAt: true, category: { select: { slug: true } } }
    })
  ]);
  const now = Date.now();
  const groups = new Map(regencies.map((regency) => [regency.id, {
    regency,
    total: 0,
    waiting: 0,
    critical: 0,
    unresolvedAgeTotal: 0,
    unresolvedCount: 0
  }]));

  for (const aspiration of aspirations) {
    const group = groups.get(aspiration.regencyId);
    if (!group) continue;
    group.total += 1;
    if (aspiration.status === 'MENUNGGU_VERIFIKASI') group.waiting += 1;
    if (criticalSlugs.has(aspiration.category.slug)) group.critical += 1;
    if (!['SELESAI', 'DITOLAK'].includes(aspiration.status)) {
      group.unresolvedAgeTotal += Math.max(0, (now - aspiration.createdAt.getTime()) / 86400000);
      group.unresolvedCount += 1;
    }
  }

  const data = Array.from(groups.values()).map((group) => {
    const averageUnresolvedAgeDays = group.unresolvedCount
      ? group.unresolvedAgeTotal / group.unresolvedCount
      : 0;
    const priorityScore = (group.total * 0.30) + (group.waiting * 0.20) +
      (group.critical * 0.30) + (averageUnresolvedAgeDays * 0.20);
    return {
      regency: group.regency,
      totalAspirations: group.total,
      waitingAspirations: group.waiting,
      criticalCategoryAspirations: group.critical,
      averageUnresolvedAgeDays: Number(averageUnresolvedAgeDays.toFixed(2)),
      priorityScore: Number(priorityScore.toFixed(2))
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  res.json({ data: data.map((row, index) => ({ rank: index + 1, ...row })) });
}));

app.use((_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan.')));

app.use((error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Data tidak valid.',
      errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, ...(error.details || {}) });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Data unik sudah digunakan.' });
    if (error.code === 'P2025') return res.status(404).json({ message: 'Data tidak ditemukan.' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

module.exports = { app, env, prisma };
