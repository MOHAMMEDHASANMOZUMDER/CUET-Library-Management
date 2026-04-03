const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET in environment');
  }
  return secret;
}

function parseBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) return null;
  const [scheme, token] = String(header).split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function authOptional(req, _res, next) {
  const token = parseBearerToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const authorities = (decoded.authorities || '').split(',').map(s => s.trim()).filter(Boolean);
    req.user = {
      id: decoded.uid ?? null,
      email: decoded.sub,
      role: decoded.role ?? null,
      authorities,
      isAdmin: authorities.includes('ROLE_ADMIN')
    };
  } catch (_e) {
    // Ignore invalid token for optional auth
  }

  next();
}

function requireAuth(req, res, next) {
  const token = parseBearerToken(req);
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const authorities = (decoded.authorities || '').split(',').map(s => s.trim()).filter(Boolean);
    req.user = {
      id: decoded.uid ?? null,
      email: decoded.sub,
      role: decoded.role ?? null,
      authorities,
      isAdmin: authorities.includes('ROLE_ADMIN')
    };
    return next();
  } catch (e) {
    if (e && e.name === 'TokenExpiredError') return res.status(401).send('Token expired');
    return res.status(401).send('Unauthorized');
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).send('Unauthorized');
  if (!req.user.isAdmin) return res.status(403).send('Forbidden');
  return next();
}

module.exports = { authOptional, requireAuth, requireAdmin };
