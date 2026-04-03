const express = require('express');

const { prisma } = require('../prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { jsonSafe } = require('../utils/json');

const router = express.Router();

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function parseBigIntOrNull(v) {
  if (v === null || v === undefined) return null;
  const s = String(v);
  if (!/^\d+$/.test(s)) return null;
  try {
    return BigInt(s);
  } catch {
    return null;
  }
}

async function borrowIncludeById(id) {
  return prisma.borrowRecord.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, role: true, studentId: true, department: true, session: true } },
      book: true,
      bookCopy: true,
      preBook: { include: { book: true } },
      fine: true
    }
  });
}

function canAccessBorrow(req, borrow) {
  if (!req.user) return false;
  if (req.user.isAdmin) return true;
  return borrow?.user?.email && borrow.user.email === req.user.email;
}

router.post('/manual', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const userId = Number(body.userId);
    const bookId = Number(body.bookId);
    const copyId = String(body.copyId || '');
    const dueDays = body.dueDays != null ? Number(body.dueDays) : 30;
    const prebookId = body.prebookId != null ? Number(body.prebookId) : null;

    if (!Number.isFinite(userId) || !Number.isFinite(bookId) || !copyId) {
      return res.status(400).send('Invalid request');
    }

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) throw new Error('Book not found');

      const copy = await tx.bookCopy.findUnique({ where: { copyId } });
      if (!copy) throw new Error('Book copy not found');
      if (copy.status !== 'AVAILABLE') throw new Error('Book copy is not available');

      let preBook = null;
      if (prebookId != null && Number.isFinite(prebookId)) {
        preBook = await tx.preBook.findUnique({ where: { id: prebookId } });
        if (!preBook) throw new Error('PreBook not found');
      }

      const borrow = await tx.borrowRecord.create({
        data: {
          userId: user.id,
          bookId: book.id,
          copyId: copy.copyId,
          preBookId: preBook ? preBook.id : null,
          borrowDate: new Date(),
          dueDate: addDays(new Date(), Number.isFinite(dueDays) ? dueDays : 30),
          extendedCount: 0
        }
      });

      await tx.bookCopy.update({ where: { copyId: copy.copyId }, data: { status: 'BORROWED' } });
      await tx.book.update({ where: { id: book.id }, data: { availableCopies: Math.max(0, book.availableCopies - 1) } });

      if (preBook) {
        await tx.preBook.update({ where: { id: preBook.id }, data: { status: 'FULFILLED' } });
      }

      return borrow;
    });

    const full = await borrowIncludeById(created.id);
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).send(e.message || 'Bad Request');
  }
});

router.post('/pickup/:preBookId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const preBookId = Number(req.params.preBookId);
    const copyId = req.body?.copyId ? String(req.body.copyId) : '';
    if (!Number.isFinite(preBookId) || !copyId) return res.status(400).send('Invalid request');

    const created = await prisma.$transaction(async (tx) => {
      const pre = await tx.preBook.findUnique({ where: { id: preBookId } });
      if (!pre) throw new Error('PreBook not found');
      if (pre.status !== 'APPROVED') throw new Error('PreBook must be approved before pickup');

      const book = await tx.book.findUnique({ where: { id: pre.bookId } });
      if (!book) throw new Error('Book not found');

      const copy = await tx.bookCopy.findUnique({ where: { copyId } });
      if (!copy) throw new Error('Book copy not found');
      if (copy.status !== 'AVAILABLE') throw new Error('Book copy is not available');

      const borrow = await tx.borrowRecord.create({
        data: {
          userId: pre.userId,
          bookId: pre.bookId,
          copyId: copy.copyId,
          preBookId: pre.id,
          borrowDate: new Date(),
          dueDate: addDays(new Date(), 30),
          extendedCount: 0
        }
      });

      await tx.bookCopy.update({ where: { copyId: copy.copyId }, data: { status: 'BORROWED' } });
      await tx.book.update({ where: { id: book.id }, data: { availableCopies: Math.max(0, book.availableCopies - 1) } });
      await tx.preBook.update({ where: { id: pre.id }, data: { status: 'FULFILLED' } });

      return borrow;
    });

    const full = await borrowIncludeById(created.id);
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).send(e.message || 'Bad Request');
  }
});

router.get('/admin/all', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : null;

    const where = {};
    if (status === 'ACTIVE') where.returnDate = null;
    if (status === 'RETURNED') where.returnDate = { not: null };

    const records = await prisma.borrowRecord.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        book: { select: { id: true, title: true, author: true } },
        bookCopy: { select: { copyId: true } }
      }
    });

    const dtos = records.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.user?.name,
      bookId: r.bookId,
      bookTitle: r.book?.title,
      bookAuthor: r.book?.author,
      copyId: r.bookCopy?.copyId || null,
      borrowDate: r.borrowDate,
      dueDate: r.dueDate,
      returnDate: r.returnDate,
      extendedCount: r.extendedCount
    }));

    res.json(jsonSafe(dtos));
  } catch (e) {
    next(e);
  }
});

router.get('/my-borrows', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.json([]);

    const borrows = await prisma.borrowRecord.findMany({
      where: { userId: user.id },
      orderBy: { id: 'desc' },
      include: { book: true, bookCopy: true }
    });

    res.json(jsonSafe(borrows));
  } catch (e) {
    next(e);
  }
});

router.get('/my-active-borrows', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.json([]);

    const borrows = await prisma.borrowRecord.findMany({
      where: { userId: user.id, returnDate: null },
      orderBy: { dueDate: 'asc' },
      include: { book: true, bookCopy: true }
    });

    res.json(jsonSafe(borrows));
  } catch (e) {
    next(e);
  }
});

router.get('/overdue', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const now = new Date();
    const records = await prisma.borrowRecord.findMany({
      where: { returnDate: null, dueDate: { lt: now } },
      include: { user: true, book: true, bookCopy: true }
    });
    res.json(jsonSafe(records));
  } catch (e) {
    next(e);
  }
});

router.get('/stats/active', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const count = await prisma.borrowRecord.count({ where: { returnDate: null } });
    res.status(200).send(String(count));
  } catch (e) {
    next(e);
  }
});

router.post('/book/:isbn', requireAuth, async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.params.isbn);
    if (isbn === null) return res.status(400).send('Invalid ISBN');

    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(400).send('User not found');

    const created = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { isbn } });
      if (!book) throw new Error('Book not found');
      if (book.availableCopies <= 0) throw new Error('No copies available');

      const copy = await tx.bookCopy.findFirst({ where: { isbn, status: 'AVAILABLE' }, orderBy: { copyId: 'asc' } });
      if (!copy) throw new Error('No copies available');

      const borrow = await tx.borrowRecord.create({
        data: {
          userId: user.id,
          bookId: book.id,
          copyId: copy.copyId,
          borrowDate: new Date(),
          dueDate: addDays(new Date(), 30),
          extendedCount: 0
        }
      });

      await tx.bookCopy.update({ where: { copyId: copy.copyId }, data: { status: 'BORROWED' } });
      await tx.book.update({ where: { id: book.id }, data: { availableCopies: Math.max(0, book.availableCopies - 1) } });

      return borrow;
    });

    const full = await borrowIncludeById(created.id);
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).send(e.message || 'Bad Request');
  }
});

router.put('/return/:borrowRecordId', requireAuth, async (req, res, next) => {
  try {
    const borrowRecordId = Number(req.params.borrowRecordId);
    if (!Number.isFinite(borrowRecordId)) return res.status(400).send('Invalid borrow id');

    const borrow = await borrowIncludeById(borrowRecordId);
    if (!borrow) return res.status(404).send('Borrow record not found');
    if (!canAccessBorrow(req, borrow) && !req.user.isAdmin) return res.status(403).send('Forbidden');

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.borrowRecord.findUnique({ where: { id: borrowRecordId } });
      if (!b) throw new Error('Borrow record not found');
      if (b.returnDate) throw new Error('Book is already returned');

      const book = await tx.book.findUnique({ where: { id: b.bookId } });
      const copy = await tx.bookCopy.findUnique({ where: { copyId: b.copyId } });

      const out = await tx.borrowRecord.update({ where: { id: b.id }, data: { returnDate: new Date() } });
      if (copy) await tx.bookCopy.update({ where: { copyId: copy.copyId }, data: { status: 'AVAILABLE' } });
      if (book) await tx.book.update({ where: { id: book.id }, data: { availableCopies: book.availableCopies + 1 } });
      return out;
    });

    const full = await borrowIncludeById(updated.id);
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).send(e.message || 'Bad Request');
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send('Invalid id');

    const borrow = await borrowIncludeById(id);
    if (!borrow) return res.status(404).end();
    if (!canAccessBorrow(req, borrow)) return res.status(403).send('Forbidden');

    // Return DTO shape like Spring controller
    const dto = {
      id: borrow.id,
      userId: borrow.userId,
      userName: borrow.user?.name,
      bookId: borrow.bookId,
      bookTitle: borrow.book?.title,
      bookAuthor: borrow.book?.author,
      copyId: borrow.bookCopy?.copyId || null,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      returnDate: borrow.returnDate,
      extendedCount: borrow.extendedCount
    };

    res.json(jsonSafe(dto));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send('Invalid id');

    const updates = req.body || {};

    const existing = await prisma.borrowRecord.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    const data = {};
    if (updates.dueDate) data.dueDate = new Date(updates.dueDate);
    if (Object.prototype.hasOwnProperty.call(updates, 'extendedCount')) data.extendedCount = Number(updates.extendedCount) || 0;

    // If admin sets returnDate, apply return side-effects
    const wantsReturn = Object.prototype.hasOwnProperty.call(updates, 'returnDate') && updates.returnDate;

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.borrowRecord.findUnique({ where: { id } });
      if (!b) throw new Error('Not found');

      const out = await tx.borrowRecord.update({
        where: { id },
        data: {
          ...data,
          ...(wantsReturn ? { returnDate: new Date(updates.returnDate) } : {})
        }
      });

      if (wantsReturn && !b.returnDate) {
        const book = await tx.book.findUnique({ where: { id: b.bookId } });
        const copy = await tx.bookCopy.findUnique({ where: { copyId: b.copyId } });
        if (copy) await tx.bookCopy.update({ where: { copyId: copy.copyId }, data: { status: 'AVAILABLE' } });
        if (book) await tx.book.update({ where: { id: book.id }, data: { availableCopies: book.availableCopies + 1 } });
      }

      return out;
    });

    const full = await borrowIncludeById(updated.id);
    res.json(jsonSafe(full));
  } catch (e) {
    res.status(400).send(e.message || 'Bad Request');
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send('Invalid id');

    const existing = await prisma.borrowRecord.findUnique({ where: { id } });
    if (!existing) return res.status(404).end();

    await prisma.borrowRecord.delete({ where: { id } });
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
