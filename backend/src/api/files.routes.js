// backend/src/api/files.routes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { createToken, verifyToken, resolveUploadPath } = require('../services/fileAccess.service');

// @desc    Cere un link temporar către un PDF (valabil câteva minute)
// @route   GET /api/files/signed-url?path=/uploads/.../fisier.pdf
// @access  Private (admin, administrator)
router.get('/signed-url', protect, authorize('admin', 'administrator'), async (req, res) => {
  try {
    const rel = req.query.path;
    const abs = resolveUploadPath(rel);
    if (!abs) return res.status(400).json({ message: 'Cale invalidă.' });

    try {
      await fs.promises.access(abs, fs.constants.R_OK);
    } catch (e) {
      return res.status(404).json({ message: 'Fișierul nu mai există pe server.' });
    }

    res.json({ url: `/files/view?t=${createToken(rel)}` });
  } catch (error) {
    console.error('Eroare la generarea linkului:', error);
    res.status(500).json({ message: 'Eroare server.' });
  }
});

// @desc    Deschide PDF-ul cu un link semnat valid
// @route   GET /api/files/view?t=<token>
// @access  Public, dar numai cu token semnat și neexpirat (se poate folosi în link, iframe sau react-pdf)
router.get('/view', (req, res) => {
  const rel = verifyToken(req.query.t);
  if (!rel) return res.status(403).json({ message: 'Link invalid sau expirat. Redeschideți documentul din aplicație.' });

  const abs = resolveUploadPath(rel);
  if (!abs) return res.status(400).json({ message: 'Cale invalidă.' });

  res.sendFile(
    abs,
    {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.basename(abs).replace(/[^\w.\-]/g, '_')}"`,
        'Cache-Control': 'private, no-store',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    },
    (err) => {
      if (err && !res.headersSent) res.status(err.code === 'ENOENT' ? 404 : 500).json({ message: 'Fișierul nu a putut fi deschis.' });
    }
  );
});

module.exports = router;