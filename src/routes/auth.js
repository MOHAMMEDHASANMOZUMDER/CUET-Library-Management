const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const { prisma } = require('../prisma');
const { requireAuth } = require('../middleware/auth');
const { jsonSafe } = require('../utils/json');

const router = express.Router();

function jwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET');
  }
  return process.env.JWT_SECRET;
}

function jwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '2h';
}

function signToken({ email, authorities, uid, role }) {
  const expiresIn = jwtExpiresIn();
  return jwt.sign(
    {
      authorities: authorities.join(','),
      uid: uid ?? null,
      role: role ?? null
    },
    jwtSecret(),
    { subject: email, expiresIn, issuer: 'LibraryForge' }
  );
}

function otpExpiresMinutes() {
  const raw = process.env.OTP_EXPIRES_MINUTES;
  const n = raw ? Number(raw) : 10;
  if (!Number.isFinite(n) || n <= 0) return 10;
  return Math.min(Math.max(Math.floor(n), 1), 60);
}

function otpCanReturnInResponse() {
  return process.env.OTP_RETURN_CODE === 'true';
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // For this project, OTP delivery requires authenticated SMTP.
  if (!user || !pass) return null;

  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const from = process.env.SMTP_FROM || user;

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    from
  };
}

async function sendOtpEmail({ email, otp, purpose }) {
  const cfg = getSmtpConfig();
  if (!cfg || !cfg.from) return false;

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth
  });

  const minutes = otpExpiresMinutes();
  const subject = purpose === 'REGISTER'
    ? 'Your LibraryForge registration OTP'
    : 'Your LibraryForge password reset OTP';
  const title = purpose === 'REGISTER'
    ? 'Email Verification'
    : 'Password Reset';

  const text = [
    title,
    '',
    `Your OTP code is: ${otp}`,
    '',
    `It expires in ${minutes} minutes.`,
    '',
    'If you did not request this, you can ignore this email.'
  ].join('\n');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.5; color:#0f172a;">
      <h2 style="margin:0 0 12px 0;">${title}</h2>
      <p style="margin:0 0 14px 0;">Use the following one-time password (OTP) to continue:</p>
      <div style="display:inline-block; padding:12px 16px; border-radius:10px; background:#f1f5f9; border:1px solid #e2e8f0; font-size:22px; letter-spacing:3px; font-weight:700;">
        ${otp}
      </div>
      <p style="margin:14px 0 0 0; color:#334155;">This code expires in <b>${minutes} minutes</b>.</p>
      <p style="margin:10px 0 0 0; color:#64748b; font-size:13px;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: cfg.from,
    to: email,
    subject,
    text,
    html
  });

  return true;
}

function smtpNotConfiguredMessage() {
  return 'Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS (Gmail requires an App Password), and optionally SMTP_FROM in .env';
}

function smtpSendFailedMessage(sendError) {
  const responseCode = sendError && (sendError.responseCode || sendError.code);
  const base = 'Email delivery failed.';

  // Common Gmail/Nodemailer auth error
  if (responseCode === 535 || String(responseCode) === 'EAUTH') {
    return `${base} SMTP authentication failed (535). For Gmail, set SMTP_USER to the *sender* Gmail and SMTP_PASS to that account's App Password.`;
  }

  if (responseCode) {
    return `${base} SMTP error (${responseCode}). Check SMTP_* settings and provider security rules.`;
  }

  return `${base} Check SMTP_USER/SMTP_PASS (Gmail requires an App Password) and your provider security settings.`;
}

function isEmailValid(email) {
  const s = String(email || '').trim();
  if (!s) return false;
  // Minimal sanity check; the browser also validates via <input type="email">
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function makeOtpCode() {
  // 6-digit numeric
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

async function upsertOtp({ email, purpose }) {
  const otp = makeOtpCode();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + otpExpiresMinutes() * 60 * 1000);

  await prisma.otpCode.upsert({
    where: { email_purpose: { email, purpose } },
    update: { codeHash, expiresAt, attempts: 0, createdAt: new Date() },
    create: { email, purpose, codeHash, expiresAt, attempts: 0 }
  });

  return { otp, expiresAt };
}

async function verifyOtp({ email, purpose, otp }) {
  const row = await prisma.otpCode.findUnique({ where: { email_purpose: { email, purpose } } });
  if (!row) return { ok: false, message: 'OTP not found' };
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, message: 'OTP expired' };
  if ((row.attempts || 0) >= 8) return { ok: false, message: 'Too many attempts' };

  const match = await bcrypt.compare(String(otp || ''), row.codeHash);
  if (!match) {
    await prisma.otpCode.update({
      where: { email_purpose: { email, purpose } },
      data: { attempts: { increment: 1 } }
    });
    return { ok: false, message: 'Invalid OTP' };
  }

  await prisma.otpCode.delete({ where: { email_purpose: { email, purpose } } });
  return { ok: true };
}

router.get('/health', (_req, res) => {
  res.status(200).send('Authentication service is running');
});

// Registration OTP (email verification)
router.post('/register/request-otp', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();
    if (!isEmailValid(normalized)) return res.status(400).send('Valid email is required');

    const existingEmail = await prisma.user.findUnique({ where: { email: normalized } });
    if (existingEmail) return res.status(400).send('Email is already in use!');

    const { otp, expiresAt } = await upsertOtp({ email: normalized, purpose: 'REGISTER' });

    const smtpConfigured = Boolean(getSmtpConfig());

    // Try to send via SMTP if configured.
    let sent = false;
    let sendError = null;
    try {
      sent = await sendOtpEmail({ email: normalized, otp, purpose: 'REGISTER' });
    } catch (e) {
      sendError = e;
      console.warn('[otp] email send failed:', e && (e.message || e));
      sent = false;
    }

    const response = { message: `OTP generated. Expires in ${otpExpiresMinutes()} minutes.` };
    if (sent) return res.json(jsonSafe(response));

    if (otpCanReturnInResponse()) {
      response.devOtp = otp;
      response.expiresAt = expiresAt.toISOString();
      return res.json(jsonSafe(response));
    }

    if (!smtpConfigured) return res.status(500).send(smtpNotConfiguredMessage());
    // SMTP is configured but sending failed (e.g. bad credentials)
    return res.status(502).send(smtpSendFailedMessage(sendError));
  } catch (e) {
    return next(e);
  }
});

router.post('/register/verify-otp', async (req, res, next) => {
  try {
    const { name, email, password, department, studentId, session, otp } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();
    if (!name || !normalized || !password || !otp) return res.status(400).send('Missing required fields');
    if (!isEmailValid(normalized)) return res.status(400).send('Valid email is required');

    const existingEmail = await prisma.user.findUnique({ where: { email: normalized } });
    if (existingEmail) return res.status(400).send('Email is already in use!');

    if (studentId) {
      const existingStudent = await prisma.user.findUnique({ where: { studentId: String(studentId) } });
      if (existingStudent) return res.status(400).send('Student ID is already in use!');
    }

    const otpRes = await verifyOtp({ email: normalized, purpose: 'REGISTER', otp });
    if (!otpRes.ok) return res.status(400).send(otpRes.message || 'OTP verification failed');

    const hashed = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        name: String(name),
        email: normalized,
        password: hashed,
        department: department ? String(department) : null,
        studentId: studentId ? String(studentId) : null,
        session: session ? String(session) : null,
        role: 'STUDENT',
        enabled: true
      },
      select: { id: true, email: true, name: true, role: true }
    });

    // Optional: auto-login after successful registration
    const token = signToken({ email: user.email, authorities: ['ROLE_STUDENT'], uid: user.id, role: 'STUDENT' });
    return res.json(jsonSafe({ message: 'User registered successfully', token, email: user.email, name: user.name, role: 'STUDENT' }));
  } catch (e) {
    return next(e);
  }
});

// Password reset (OTP)
router.post('/forgot/request-otp', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();
    if (!isEmailValid(normalized)) return res.status(400).send('Valid email is required');

    // Avoid user enumeration: always return 200.
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    const admin = !user ? await prisma.admin.findUnique({ where: { email: normalized } }) : null;
    if (!user && !admin) {
      return res.json(jsonSafe({ message: 'If the email exists, an OTP has been sent.' }));
    }

    const { otp, expiresAt } = await upsertOtp({ email: normalized, purpose: 'PASSWORD_RESET' });

    const smtpConfigured = Boolean(getSmtpConfig());

    let sent = false;
    let sendError = null;
    try {
      sent = await sendOtpEmail({ email: normalized, otp, purpose: 'PASSWORD_RESET' });
    } catch (e) {
      sendError = e;
      console.warn('[otp] email send failed:', e && (e.message || e));
      sent = false;
    }

    const response = { message: `If the email exists, an OTP has been sent. Expires in ${otpExpiresMinutes()} minutes.` };
    if (sent) return res.json(jsonSafe(response));

    if (otpCanReturnInResponse()) {
      response.devOtp = otp;
      response.expiresAt = expiresAt.toISOString();
      return res.json(jsonSafe(response));
    }

    // In production without SMTP, fail closed.
    if (!smtpConfigured) return res.status(500).send(smtpNotConfiguredMessage());
    return res.status(502).send(smtpSendFailedMessage(sendError));
  } catch (e) {
    return next(e);
  }
});

router.post('/forgot/reset', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized || !otp || !newPassword) return res.status(400).send('Missing required fields');
    if (!isEmailValid(normalized)) return res.status(400).send('Valid email is required');

    const otpRes = await verifyOtp({ email: normalized, purpose: 'PASSWORD_RESET', otp });
    if (!otpRes.ok) return res.status(400).send(otpRes.message || 'OTP verification failed');

    const hashed = await bcrypt.hash(String(newPassword), 10);

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (user) {
      await prisma.user.update({ where: { email: normalized }, data: { password: hashed, updatedAt: new Date() } });
      return res.json(jsonSafe({ message: 'Password reset successful' }));
    }

    const admin = await prisma.admin.findUnique({ where: { email: normalized } });
    if (admin) {
      await prisma.admin.update({ where: { email: normalized }, data: { password: hashed } });
      return res.json(jsonSafe({ message: 'Password reset successful' }));
    }

    // Still return 200 to avoid enumeration.
    return res.json(jsonSafe({ message: 'Password reset successful' }));
  } catch (e) {
    return next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, studentId } = req.body || {};
    const loginPassword = String(password || '');

    if (!loginPassword) return res.status(400).send('Password is required');

    let userEmail = email ? String(email) : null;
    let user = null;

    if (studentId) {
      const u = await prisma.user.findUnique({ where: { studentId: String(studentId) } });
      if (u) {
        userEmail = u.email;
        user = u;
      }
    }

    if (!user && userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (user) {
      if (!user.enabled) return res.status(403).send('User account disabled');
      const ok = await bcrypt.compare(loginPassword, user.password);
      if (!ok) return res.status(401).send('Invalid credentials');

      const role = String(user.role || 'STUDENT').toUpperCase();
      const token = signToken({ email: user.email, authorities: [`ROLE_${role}`], uid: user.id, role });
      return res.json(jsonSafe({ token, email: user.email, name: user.name, role }));
    }

    // Fallback: admins table
    if (!userEmail) return res.status(401).send('Invalid credentials');

    const admin = await prisma.admin.findUnique({ where: { email: userEmail } });
    if (!admin || !admin.enabled) return res.status(401).send('Invalid credentials');
    const ok = await bcrypt.compare(loginPassword, admin.password);
    if (!ok) return res.status(401).send('Invalid credentials');

    const token = signToken({ email: admin.email, authorities: ['ROLE_ADMIN'], uid: admin.id, role: 'ADMIN' });
    return res.json(jsonSafe({ token, email: admin.email, name: admin.name, role: 'ADMIN' }));
  } catch (e) {
    return next(e);
  }
});

// Legacy non-OTP registration route (kept for backward compatibility)
router.post('/register', async (req, res, next) => {
  try {
    return res.status(400).send('Registration requires email verification. Use /register/request-otp and /register/verify-otp');
  } catch (e) {
    return next(e);
  }
});

router.post('/logout', (_req, res) => {
  // Stateless JWT: frontend should just delete token
  res.status(200).send('Logged out');
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const email = req.user.email;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, studentId: true, department: true, session: true }
    });

    if (user) return res.json(jsonSafe(user));

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { email: true, name: true }
    });

    if (admin) return res.json(jsonSafe({ email: admin.email, name: admin.name, role: 'ADMIN' }));

    return res.status(400).send('User not found');
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
