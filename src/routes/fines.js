const express = require('express');

const { prisma } = require('../prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { jsonSafe } = require('../utils/json');

const router = express.Router();

function fineToDto(fine) {
  if (!fine) return fine;
  // Frontend expects `trXID` while DB field is `trxId`
  // Provide both for compatibility.
  return {
    ...fine,
    trXID: fine.trxId ?? null
  };
}

router.post('/:id/submit-payment', requireAuth, async (req, res, next) => {
  try {
    if (req.user.isAdmin) return res.status(403).send('Forbidden');

    const id = Number(req.params.id);
    const trXID = req.body?.trXID;
    if (!Number.isFinite(id) || !trXID || !String(trXID).trim()) return res.status(400).end();

    const fine = await prisma.fine.findUnique({
      where: { id },
      include: { user: true, borrowRecord: true }
    });
    if (!fine) return res.status(404).end();

    // Ownership check
    if (fine.user?.email !== req.user.email) return res.status(403).send('Forbidden');

    const updated = await prisma.fine.update({
      where: { id },
      data: {
        trxId: String(trXID),
        status: 'PENDING_VERIFICATION',
        paymentSubmissionDate: new Date()
      }
    });

    res.json(jsonSafe(fineToDto(updated)));
  } catch (e) {
    // Unique trxId collisions
    if (e && e.code === 'P2002') return res.status(400).send('Transaction ID already used');
    next(e);
  }
});

router.post('/:id/approve-payment', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const updated = await prisma.fine.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentApprovalDate: new Date()
      }
    });

    res.json(jsonSafe(fineToDto(updated)));
  } catch (e) {
    next(e);
  }
});

router.post('/create', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // application/x-www-form-urlencoded
    const borrowRecordId = Number(req.body?.borrowRecordId);
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(borrowRecordId) || !Number.isFinite(amount)) return res.status(400).send('Invalid request');

    const borrow = await prisma.borrowRecord.findUnique({ where: { id: borrowRecordId } });
    if (!borrow) return res.status(400).send('Borrow record not found');

    const fine = await prisma.fine.create({
      data: {
        userId: borrow.userId,
        borrowRecordId: borrow.id,
        amount,
        status: 'UNPAID'
      }
    });

    res.json(jsonSafe(fineToDto(fine)));
  } catch (e) {
    // Unique borrowRecordId
    if (e && e.code === 'P2002') return res.status(400).send('Fine already exists for this borrow record');
    next(e);
  }
});

router.get('/user', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.json([]);

    const fines = await prisma.fine.findMany({
      where: { userId: user.id },
      orderBy: { id: 'desc' },
      include: { borrowRecord: { include: { book: true, bookCopy: true } } }
    });

    res.json(jsonSafe(fines.map(fineToDto)));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    const fine = await prisma.fine.findUnique({ where: { id }, include: { user: true, borrowRecord: true } });
    if (!fine) return res.status(404).end();

    if (!req.user.isAdmin && fine.user?.email !== req.user.email) return res.status(403).send('Forbidden');

    res.json(jsonSafe(fineToDto(fine)));
  } catch (e) {
    next(e);
  }
});

router.get('/admin/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const fines = await prisma.fine.findMany({
      orderBy: { id: 'desc' },
      include: { user: true, borrowRecord: { include: { book: true } } }
    });
    res.json(jsonSafe(fines.map(fineToDto)));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).end();

    await prisma.fine.delete({ where: { id } });
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
