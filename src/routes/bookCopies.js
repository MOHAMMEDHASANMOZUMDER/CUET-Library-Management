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

async function toMap(copy) {
  const book = await prisma.book.findUnique({ where: { isbn: copy.isbn } });
  return {
    copyId: copy.copyId,
    isbn: copy.isbn,
    status: copy.status,
    location: copy.location,
    bookTitle: book?.title || 'Unknown',
    bookAuthor: book?.author || 'Unknown',
    bookCategory: book?.category || 'Unknown'
  };
}

router.get('/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const copies = await prisma.bookCopy.findMany({ orderBy: { copyId: 'asc' } });
    const mapped = [];
    for (const c of copies) mapped.push(await toMap(c));
    res.json(jsonSafe(mapped));
  } catch (e) {
    // keep behavior: return empty list on errors
    console.error('Error fetching book copies:', e);
    res.json([]);
  }
});

router.get('/isbn/:isbn', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.params.isbn);
    if (isbn === null) return res.status(400).send('Invalid ISBN');

    const copies = await prisma.bookCopy.findMany({ where: { isbn }, orderBy: { copyId: 'asc' } });
    const mapped = [];
    for (const c of copies) mapped.push(await toMap(c));
    res.json(jsonSafe(mapped));
  } catch (e) {
    next(e);
  }
});

router.get('/:copyId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const copy = await prisma.bookCopy.findUnique({ where: { copyId: String(req.params.copyId) } });
    if (!copy) return res.status(404).send('Book copy not found');

    res.json(jsonSafe(await toMap(copy)));
  } catch (e) {
    next(e);
  }
});

router.put('/:copyId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const copyId = String(req.params.copyId);
    const updates = req.body || {};

    const copy = await prisma.bookCopy.findUnique({ where: { copyId } });
    if (!copy) return res.status(404).send(`Book copy not found with ID: ${copyId}`);

    const data = {};
    if (Object.prototype.hasOwnProperty.call(updates, 'location')) data.location = updates.location;
    if (Object.prototype.hasOwnProperty.call(updates, 'status')) data.status = String(updates.status);

    const saved = await prisma.bookCopy.update({ where: { copyId }, data });
    res.json(jsonSafe(await toMap(saved)));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
