const express = require('express');

const { prisma } = require('../prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { jsonSafe } = require('../utils/json');

const router = express.Router();

router.get('/admin/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const preBooks = await prisma.preBook.findMany({
      orderBy: { id: 'desc' },
      include: { user: { select: { id: true, name: true } }, book: true }
    });

    const dtos = preBooks.map(pb => ({
      id: pb.id,
      userId: pb.userId,
      userName: pb.user?.name,
      bookId: pb.bookId,
      bookTitle: pb.book?.title,
      bookAuthor: pb.book?.author,
      copyId: null,
      isbn: pb.book?.isbn,
      requestDate: pb.requestDate,
      approvalDate: null,
      expiresAt: null,
      status: pb.status,
      adminNotes: null,
      createdAt: null,
      updatedAt: null
    }));

    res.json(jsonSafe(dtos));
  } catch (e) {
    next(e);
  }
});

router.get('/admin/status/:status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const status = String(req.params.status || '').toUpperCase();
    const preBooks = await prisma.preBook.findMany({
      where: { status },
      orderBy: { id: 'desc' },
      include: { user: { select: { id: true, name: true } }, book: true }
    });

    const dtos = preBooks.map(pb => ({
      id: pb.id,
      userId: pb.userId,
      userName: pb.user?.name,
      bookId: pb.bookId,
      bookTitle: pb.book?.title,
      bookAuthor: pb.book?.author,
      copyId: null,
      isbn: pb.book?.isbn,
      requestDate: pb.requestDate,
      status: pb.status
    }));

    res.json(jsonSafe(dtos));
  } catch (e) {
    res.status(400).end();
  }
});

router.get('/user', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.json([]);

    const preBooks = await prisma.preBook.findMany({
      where: { userId: user.id },
      orderBy: { id: 'desc' },
      include: { book: true }
    });

    // Return full object with nested book (frontend uses prebook.book.isbn etc)
    res.json(jsonSafe(preBooks.map(pb => ({ ...pb, book: pb.book }))));
  } catch (e) {
    next(e);
  }
});

router.post('/request', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(400).send('User not found');

    const bookId = Number(req.body?.bookId);
    if (!Number.isFinite(bookId)) return res.status(400).send('Invalid bookId');

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(400).send('Book not found');

    const existing = await prisma.preBook.findFirst({
      where: { userId: user.id, bookId, status: { in: ['PENDING', 'APPROVED'] } }
    });
    if (existing) return res.status(400).send('Prebook already exists for this book');

    const pb = await prisma.preBook.create({ data: { userId: user.id, bookId, status: 'PENDING' } });

    const full = await prisma.preBook.findUnique({ where: { id: pb.id }, include: { book: true, user: true } });
    res.json(jsonSafe(full));
  } catch (e) {
    next(e);
  }
});

router.post('/:id/approve', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const updated = await prisma.preBook.update({ where: { id }, data: { status: 'APPROVED' } });
    const full = await prisma.preBook.findUnique({ where: { id }, include: { book: true, user: true } });
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).end();
  }
});

router.post('/:id/reject', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const updated = await prisma.preBook.update({ where: { id }, data: { status: 'REJECTED' } });
    const full = await prisma.preBook.findUnique({ where: { id }, include: { book: true, user: true } });
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).end();
  }
});

router.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const pb = await prisma.preBook.findUnique({ where: { id }, include: { user: true, book: true } });
    if (!pb) return res.status(400).end();

    if (pb.user?.email !== req.user.email && !req.user.isAdmin) return res.status(403).end();
    if (pb.status === 'FULFILLED') return res.status(400).send('Cannot cancel fulfilled prebook');

    const updated = await prisma.preBook.update({ where: { id }, data: { status: 'CANCELLED' } });
    const full = await prisma.preBook.findUnique({ where: { id }, include: { book: true, user: true } });
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).end();
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const pb = await prisma.preBook.findUnique({ where: { id }, include: { book: true, user: true } });
    if (!pb) return res.status(404).end();

    if (!req.user.isAdmin && pb.user?.email !== req.user.email) return res.status(403).end();

    res.json(jsonSafe(pb));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    await prisma.preBook.delete({ where: { id } });
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
