import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function login(req, res) {
  const { username, password } = req.body || {};
  const u = process.env.ADMIN_USER || 'admin';
  const p = process.env.ADMIN_PASSWORD || 'admin123';
  if (username !== u || password !== p) return res.status(401).json({ error: 'Credenciales inválidas' });
  res.json({ token: jwt.sign({ role: 'admin', sub: u }, SECRET, { expiresIn: '12h' }) });
}

export function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  try {
    const data = jwt.verify(token, SECRET);
    if (data.role !== 'admin') throw new Error('rol');
    req.user = data;
    next();
  } catch {
    res.status(401).json({ error: 'No autorizado' });
  }
}
