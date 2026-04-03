const express = require('express');
const bcrypt = require('bcryptjs');

const { prisma } = require('../prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { jsonSafe } = require('../utils/json');

const router = express.Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: { id: true, email: true, name: true, role: true, studentId: true, department: true, session: true }
    });

    if (!user) return res.status(404).end();
    res.json(jsonSafe(user));
  } catch (e) {
    next(e);
  }
});

router.get('/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' },
      select: { id: true, email: true, name: true, studentId: true, department: true, session: true, role: true, enabled: true, createdAt: true }
    });
    res.json(jsonSafe(users));
  } catch (e) {
    next(e);
  }
});

router.get('/search', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const keyword = String(req.query.keyword || '').trim();
    const page = Number(req.query.page || 0);
    const size = Number(req.query.size || 10);
    const skip = Math.max(0, page) * Math.max(1, size);
    const take = Math.max(1, size);

    const where = keyword
      ? { name: { contains: keyword, mode: 'insensitive' } }
      : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { id: 'desc' } }),
      prisma.user.count({ where })
    ]);

    // Spring returns Page<User>; we return a similar shape
    res.json(jsonSafe({
      content: items,
      totalElements: total,
      page,
      size
    }));
  } catch (e) {
    next(e);
  }
});

router.get('/role/:role', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toUpperCase();
    const users = await prisma.user.findMany({ where: { role }, orderBy: { id: 'desc' } });
    res.json(jsonSafe(users));
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim();
    const name = String(body.name || '').trim();
    const password = body.password ? String(body.password) : null;

    if (!email || !name || !password) return res.status(400).send('Missing required fields');

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: body.role ? String(body.role).toUpperCase() : 'STUDENT',
        department: body.department ? String(body.department) : null,
        session: body.session ? String(body.session) : null,
        studentId: body.studentId ? String(body.studentId) : null,
        enabled: body.enabled != null ? Boolean(body.enabled) : true
      }
    });

    res.json(jsonSafe(user));
  } catch (e) {
    res.status(400).end();
  }
});

router.put('/:email', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const email = String(req.params.email);
    const body = req.body || {};

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) return res.status(400).end();

    const updated = await prisma.user.update({
      where: { email },
      data: {
        ...(body.name != null ? { name: String(body.name) } : {}),
        ...(body.email != null ? { email: String(body.email) } : {}),
        ...(body.role != null ? { role: String(body.role).toUpperCase() } : {}),
        ...(body.department != null ? { department: String(body.department) } : {}),
        ...(body.session != null ? { session: String(body.session) } : {}),
        ...(body.studentId != null ? { studentId: String(body.studentId) } : {})
      }
    });

    res.json(jsonSafe(updated));
  } catch (e) {
    res.status(400).end();
  }
});

router.delete('/:email', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const email = String(req.params.email);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) return res.status(400).end();

    await prisma.user.delete({ where: { email } });
    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
});

// MUST be last: /:email would catch /role/* otherwise
router.get('/:email', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const email = String(req.params.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).end();
    res.json(jsonSafe(user));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
