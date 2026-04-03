const express = require('express');
const multer = require('multer');

const { prisma } = require('../prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { jsonSafe } = require('../utils/json');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

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

function noteWithoutFile(note) {
  const { fileData, ...rest } = note;
  return rest;
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.query.isbn);
    if (isbn === null) return res.status(400).send('Invalid ISBN');

    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(400).send('User not found');

    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) return res.status(400).send('Book not found');

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        bookId: book.id,
        title: 'Untitled Note',
        status: 'PENDING'
      }
    });

    res.json(jsonSafe(note));
  } catch (e) {
    next(e);
  }
});

router.post('/full', requireAuth, async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.body?.isbn ?? req.query.isbn);
    const title = req.body?.title ?? req.query.title;
    const subject = req.body?.subject ?? req.query.subject;

    if (isbn === null || !title) return res.status(400).send('Invalid request');

    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(400).send('User not found');

    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) return res.status(400).send('Book not found');

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        bookId: book.id,
        title: String(title),
        subject: subject ? String(subject) : null,
        status: 'PENDING'
      }
    });

    res.json(jsonSafe(note));
  } catch (e) {
    next(e);
  }
});

router.post('/:id/approve', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const note = await prisma.note.update({ where: { id }, data: { status: 'APPROVED' } });
    res.json(jsonSafe(noteWithoutFile(note)));
  } catch (e) {
    next(e);
  }
});

router.post('/:id/reject', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const note = await prisma.note.update({ where: { id }, data: { status: 'REJECTED' } });
    res.json(jsonSafe(noteWithoutFile(note)));
  } catch (e) {
    next(e);
  }
});

router.get('/user', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.json([]);

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { id: 'desc' },
      include: { book: true }
    });

    res.json(jsonSafe(notes.map(noteWithoutFile)));
  } catch (e) {
    next(e);
  }
});

router.get('/book/:isbn', async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.params.isbn);
    if (isbn === null) return res.status(400).send('Invalid ISBN');

    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) return res.status(400).send('Book not found');

    const notes = await prisma.note.findMany({ where: { bookId: book.id }, orderBy: { id: 'desc' } });
    res.json(jsonSafe(notes.map(noteWithoutFile)));
  } catch (e) {
    next(e);
  }
});

router.get('/status/:status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const status = String(req.params.status).toUpperCase();
    const notes = await prisma.note.findMany({ where: { status }, orderBy: { id: 'desc' }, include: { book: true, user: true } });
    res.json(jsonSafe(notes.map(noteWithoutFile)));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const note = await prisma.note.findUnique({ where: { id }, include: { book: true, user: true } });
    if (!note) return res.status(404).end();

    // If not logged in, allow only approved notes
    if (!req.user && note.status !== 'APPROVED') return res.status(403).end();

    // If logged in but not admin, allow owner or approved
    if (req.user && !req.user.isAdmin) {
      if (note.user?.email !== req.user.email && note.status !== 'APPROVED') return res.status(403).end();
    }

    res.json(jsonSafe(noteWithoutFile(note)));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const note = await prisma.note.findUnique({ where: { id }, include: { user: true } });
    if (!note) return res.status(404).end();

    if (!req.user.isAdmin && note.user?.email !== req.user.email) return res.status(403).end();

    await prisma.note.delete({ where: { id } });
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});

router.get('/admin/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const notes = await prisma.note.findMany({ orderBy: { id: 'desc' }, include: { user: true, book: true } });
    res.json(jsonSafe(notes.map(noteWithoutFile)));
  } catch (e) {
    next(e);
  }
});

router.get('/admin/stats', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      prisma.note.count({ where: { status: 'PENDING' } }),
      prisma.note.count({ where: { status: 'APPROVED' } }),
      prisma.note.count({ where: { status: 'REJECTED' } })
    ]);

    res.json({ pending, approved, rejected });
  } catch (e) {
    next(e);
  }
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const isbn = parseBigIntOrNull(req.body?.isbn);
    const title = req.body?.title;
    const subject = req.body?.subject;
    const file = req.file;

    if (isbn === null || !title || !file) return res.status(400).send('Invalid request');

    // Allow: PDF, text/*, Word docs
    const contentType = file.mimetype;
    const allowed =
      contentType === 'application/pdf' ||
      contentType.startsWith('text/') ||
      contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!allowed) return res.status(400).send('Only PDF, text, and Word documents are allowed');

    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(400).send('User not found');

    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) return res.status(400).send('Book not found');

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        bookId: book.id,
        title: String(title),
        subject: subject ? String(subject) : null,
        fileName: file.originalname,
        fileType: contentType,
        fileSize: file.size,
        fileData: file.buffer,
        status: 'PENDING'
      }
    });

    res.json(jsonSafe(noteWithoutFile(note)));
  } catch (e) {
    next(e);
  }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const note = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        fileData: true,
        user: { select: { email: true } }
      }
    });

    if (!note) return res.status(404).end();
    if (!note.fileData || note.fileData.length === 0) return res.status(404).end();

    // Access control: public can download only approved notes; logged-in owner/admin can download theirs
    if (!req.user) {
      if (note.status !== 'APPROVED') return res.status(403).end();
    } else if (!req.user.isAdmin) {
      if (note.user?.email !== req.user.email && note.status !== 'APPROVED') return res.status(403).end();
    }

    res.setHeader('Content-Type', note.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${note.fileName || 'note.bin'}"`);
    if (note.fileSize) res.setHeader('Content-Length', String(note.fileSize));

    res.status(200).send(Buffer.from(note.fileData));
  } catch (e) {
    next(e);
  }
});

router.get('/:id/has-file', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const note = await prisma.note.findUnique({ where: { id }, select: { fileData: true } });
    if (!note) return res.status(404).end();

    res.json(Boolean(note.fileData && note.fileData.length));
  } catch (e) {
    next(e);
  }
});

router.get('/public/approved', async (_req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: { status: 'APPROVED' },
      orderBy: { uploadTime: 'desc' },
      include: {
        user: { select: { name: true, department: true } },
        book: { select: { title: true, author: true, isbn: true } }
      }
    });

    const dtos = notes.map(n => ({
      id: n.id,
      title: n.title,
      subject: n.subject,
      fileName: n.fileName,
      fileSize: n.fileSize,
      status: n.status,
      uploadTime: n.uploadTime,
      author: n.user?.name,
      department: n.user?.department,
      bookTitle: n.book?.title,
      bookAuthor: n.book?.author,
      bookIsbn: n.book?.isbn
    }));

    res.json(jsonSafe(dtos));
  } catch (e) {
    next(e);
  }
});

router.get('/public/stats', async (_req, res, next) => {
  try {
    const approved = await prisma.note.count({ where: { status: 'APPROVED' } });
    res.json({ approved });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
