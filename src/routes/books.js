const express = require('express');

const { prisma } = require('../prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { jsonSafe } = require('../utils/json');

const router = express.Router();

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

function bookToDto(book) {
  return {
    id: book.id,
    bookId: book.id,
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    category: book.category,
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies
  };
}

// Admin-only list (no pagination)
router.get('/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { id: 'desc' } });
    res.json(jsonSafe(books.map(bookToDto)));
  } catch (e) {
    next(e);
  }
});

// Paginated list
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page || 0);
    const size = Number(req.query.size || 10);
    const skip = Math.max(0, page) * Math.max(1, size);
    const take = Math.max(1, size);

    const books = await prisma.book.findMany({
      orderBy: { id: 'desc' },
      skip,
      take
    });

    res.json(jsonSafe(books.map(bookToDto)));
  } catch (e) {
    next(e);
  }
});

router.get('/available', async (_req, res, next) => {
  try {
    const books = await prisma.book.findMany({ where: { availableCopies: { gt: 0 } }, orderBy: { id: 'desc' } });
    res.json(jsonSafe(books.map(bookToDto)));
  } catch (e) {
    next(e);
  }
});

router.get('/isbn/:isbn', async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.params.isbn);
    if (isbn === null) return res.status(400).send('Invalid ISBN');

    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) return res.status(404).end();

    res.json(jsonSafe(bookToDto(book)));
  } catch (e) {
    next(e);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const keyword = String(req.query.keyword || '').trim();
    if (!keyword) return res.json([]);

    const page = Number(req.query.page || 0);
    const size = Number(req.query.size || 10);
    const skip = Math.max(0, page) * Math.max(1, size);
    const take = Math.max(1, size);

    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { author: { contains: keyword, mode: 'insensitive' } },
          { category: { contains: keyword, mode: 'insensitive' } }
        ]
      },
      orderBy: { id: 'desc' },
      skip,
      take
    });

    res.json(jsonSafe(books.map(bookToDto)));
  } catch (e) {
    next(e);
  }
});

router.get('/author/:author', async (req, res, next) => {
  try {
    const author = String(req.params.author);
    const books = await prisma.book.findMany({ where: { author }, orderBy: { id: 'desc' } });
    res.json(jsonSafe(books.map(bookToDto)));
  } catch (e) {
    next(e);
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const category = String(req.params.category);
    const books = await prisma.book.findMany({ where: { category }, orderBy: { id: 'desc' } });
    res.json(jsonSafe(books.map(bookToDto)));
  } catch (e) {
    next(e);
  }
});

router.get('/stats/total', async (_req, res, next) => {
  try {
    const total = await prisma.book.count();
    res.status(200).send(String(total));
  } catch (e) {
    next(e);
  }
});

router.get('/stats/available', async (_req, res, next) => {
  try {
    const total = await prisma.book.aggregate({ _sum: { availableCopies: true } });
    res.status(200).send(String(total._sum.availableCopies || 0));
  } catch (e) {
    next(e);
  }
});

router.get('/:bookId/copies/available', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const bookId = Number(req.params.bookId);
    if (!Number.isFinite(bookId)) return res.status(400).send('Invalid bookId');

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).send('Book not found');

    const copies = await prisma.bookCopy.findMany({
      where: { isbn: book.isbn, status: 'AVAILABLE' },
      orderBy: { copyId: 'asc' }
    });

    const payload = copies.map(c => ({ copyId: c.copyId, status: c.status, location: c.location }));
    res.json(jsonSafe(payload));
  } catch (e) {
    next(e);
  }
});

// Get by id OR isbn (Spring controller supports both)
router.get('/:id', async (req, res, next) => {
  try {
    const raw = String(req.params.id);
    const num = Number(raw);

    let book = null;
    if (Number.isFinite(num) && Number.isInteger(num)) {
      book = await prisma.book.findUnique({ where: { id: num } });
    }
    if (!book) {
      const isbn = parseBigIntOrNull(raw);
      if (isbn !== null) {
        book = await prisma.book.findUnique({ where: { isbn } });
      }
    }

    if (!book) return res.status(404).end();
    res.json(jsonSafe(bookToDto(book)));
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const isbn = parseBigIntOrNull(body.isbn);
    if (isbn === null) return res.status(400).send('Invalid ISBN');

    const title = String(body.title || '').trim();
    const author = String(body.author || '').trim();
    const category = body.category != null ? String(body.category) : null;
    const totalCopies = Number(body.totalCopies || 1);
    const location = body.location != null ? String(body.location) : null;

    if (!title || !author) return res.status(400).send('Missing title/author');
    if (!Number.isFinite(totalCopies) || totalCopies < 1) return res.status(400).send('Invalid totalCopies');

    const created = await prisma.$transaction(async (tx) => {
      const book = await tx.book.create({
        data: {
          isbn,
          title,
          author,
          category,
          totalCopies,
          availableCopies: totalCopies
        }
      });

      const copies = [];
      for (let i = 1; i <= totalCopies; i++) {
        const suffix = String(i).padStart(3, '0');
        copies.push({
          copyId: `${isbn.toString()}-${suffix}`,
          isbn,
          status: 'AVAILABLE',
          location
        });
      }

      await tx.bookCopy.createMany({ data: copies });
      return book;
    });

    res.json(jsonSafe(bookToDto(created)));
  } catch (e) {
    // Unique constraint error -> 400
    if (e && e.code === 'P2002') return res.status(400).send('ISBN already exists');
    next(e);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const raw = String(req.params.id);
    const updates = req.body || {};

    const title = updates.title != null ? String(updates.title) : undefined;
    const author = updates.author != null ? String(updates.author) : undefined;
    const category = updates.category != null ? String(updates.category) : undefined;
    const totalCopies = updates.totalCopies != null ? Number(updates.totalCopies) : undefined;
    const availableCopies = updates.availableCopies != null ? Number(updates.availableCopies) : undefined;

    // Locate by id first, then isbn
    let book = null;
    const num = Number(raw);
    if (Number.isFinite(num) && Number.isInteger(num)) {
      book = await prisma.book.findUnique({ where: { id: num } });
    }
    if (!book) {
      const isbn = parseBigIntOrNull(raw);
      if (isbn !== null) book = await prisma.book.findUnique({ where: { isbn } });
    }
    if (!book) return res.status(404).end();

    const updated = await prisma.book.update({
      where: { id: book.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(Number.isFinite(totalCopies) ? { totalCopies } : {}),
        ...(Number.isFinite(availableCopies) ? { availableCopies } : {})
      }
    });

    res.json(jsonSafe(bookToDto(updated)));
  } catch (e) {
    next(e);
  }
});

router.delete('/isbn/:isbn', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.params.isbn);
    if (isbn === null) return res.status(400).send('Invalid ISBN');

    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) return res.status(404).end();

    await prisma.book.delete({ where: { id: book.id } });
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const raw = String(req.params.id);

    let book = null;
    const num = Number(raw);
    if (Number.isFinite(num) && Number.isInteger(num)) {
      book = await prisma.book.findUnique({ where: { id: num } });
    }
    if (!book) {
      const isbn = parseBigIntOrNull(raw);
      if (isbn !== null) book = await prisma.book.findUnique({ where: { isbn } });
    }

    if (!book) return res.status(404).end();

    await prisma.book.delete({ where: { id: book.id } });
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
