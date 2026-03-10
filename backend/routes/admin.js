// routes/admin.js — Admin dashboard API (JWT-protected)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const VALID_STATUSES = ['new', 'read', 'replied', 'closed'];

// --- Auth middleware ---
function authenticate(req, res, next) {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorised' });
    }
    try {
        const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev_secret');
        req.admin = payload;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

// POST /api/admin/login
router.post('/login', (req, res) => {
    const { password } = req.body || {};
    const adminPassword = process.env.ADMIN_PASSWORD || 'TBL@Admin2026';

    if (!password || password !== adminPassword) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
        { role: 'admin', iat: Date.now() },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: '8h' }
    );

    return res.json({ success: true, token });
});

// GET /api/admin/enquiries
router.get('/enquiries', authenticate, (req, res) => {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = [];
    let params = {};

    if (status && VALID_STATUSES.includes(status)) {
        where.push('status = @status');
        params.status = status;
    }
    if (search) {
        where.push(`(first_name LIKE @search OR last_name LIKE @search OR email LIKE @search OR phone LIKE @search OR message LIKE @search)`);
        params.search = `%${search}%`;
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM enquiries ${whereClause}`).get(params)?.count || 0;
    const rows = db.prepare(`
    SELECT * FROM enquiries ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${parseInt(limit)} OFFSET ${offset}
  `).all(params);

    return res.json({ success: true, total, page: parseInt(page), data: rows });
});

// PATCH /api/admin/enquiries/:id — update status
router.patch('/enquiries/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const result = db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    return res.json({ success: true, message: 'Status updated' });
});

// DELETE /api/admin/enquiries/:id
router.delete('/enquiries/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    return res.json({ success: true, message: 'Enquiry deleted' });
});

module.exports = router;
