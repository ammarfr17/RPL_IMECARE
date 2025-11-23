const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'dev-secret';

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload; // { id, username, role, email }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (roles.length === 0) return next();
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { authenticate, requireRole };
