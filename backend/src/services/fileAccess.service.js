// backend/src/services/fileAccess.service.js
// Linkuri semnate, cu durată scurtă, pentru PDF-urile din /uploads.
// Ideea: PDF-urile nu mai sunt publice; un admin autentificat cere un link, iar linkul expiră singur.
const crypto = require('crypto');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const secret = () => process.env.FILE_URL_SECRET || process.env.JWT_SECRET;
const ttlMs = () => {
  const min = Number(process.env.FILE_URL_TTL_MIN);
  return (Number.isFinite(min) && min > 0 ? min : 10) * 60000;
};

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const sign = (rel, exp) => crypto.createHmac('sha256', secret()).update(`${rel}|${exp}`).digest('base64url');

// "/uploads/rapoarte-eveniment/x.pdf" -> cale absolută pe disc, sau null dacă nu e permisă
// (doar fișiere .pdf din folderul uploads; fără ../, fără căi absolute)
const resolveUploadPath = (rel) => {
  if (typeof rel !== 'string' || rel.includes('\0')) return null;
  const clean = rel.replace(/\\/g, '/');
  if (!clean.startsWith('/uploads/')) return null;
  const abs = path.resolve(UPLOADS_DIR, clean.slice('/uploads/'.length));
  if (!abs.startsWith(UPLOADS_DIR + path.sep)) return null;
  if (path.extname(abs).toLowerCase() !== '.pdf') return null;
  return abs;
};

// Token: <cale în base64url>.<expirare>.<semnătură HMAC>. Semnătura acoperă și calea, deci tokenul nu merge pentru alt fișier.
const createToken = (rel, ttl = ttlMs()) => {
  const exp = Date.now() + ttl;
  return `${b64u(rel)}.${exp}.${sign(rel, exp)}`;
};

// Întoarce calea relativă (ex. "/uploads/...") dacă tokenul e valid și neexpirat, altfel null
const verifyToken = (token) => {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [p, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  let rel;
  try { rel = Buffer.from(p, 'base64url').toString('utf8'); } catch (e) { return null; }
  const asteptat = Buffer.from(sign(rel, exp));
  const primit = Buffer.from(sig);
  if (asteptat.length !== primit.length || !crypto.timingSafeEqual(asteptat, primit)) return null;
  return rel;
};

module.exports = { createToken, verifyToken, resolveUploadPath, UPLOADS_DIR };