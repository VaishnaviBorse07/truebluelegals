// routes/contact.js — Contact form submission API
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { sendEnquiryNotification, sendAutoReply } = require('../utils/mailer');

// Simple server-side validation helper
function validateContact(body) {
    const errors = [];
    if (!body.firstName || body.firstName.trim().length < 2) errors.push('First name is required');
    if (!body.lastName || body.lastName.trim().length < 2) errors.push('Last name is required');
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Valid email is required');
    if (!body.phone || body.phone.trim().length < 7) errors.push('Phone number is required');
    if (!body.message || body.message.trim().length < 10) errors.push('Message must be at least 10 characters');
    return errors;
}

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        const errors = validateContact(body);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const enquiry = {
            first_name: body.firstName.trim(),
            last_name: body.lastName.trim(),
            email: body.email.trim().toLowerCase(),
            phone: body.phone.trim(),
            practice_area: (body.practiceArea || '').trim() || null,
            message: body.message.trim(),
            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        };

        // Insert into DB
        const stmt = db.prepare(`
      INSERT INTO enquiries (first_name, last_name, email, phone, practice_area, message, ip_address)
      VALUES (@first_name, @last_name, @email, @phone, @practice_area, @message, @ip_address)
    `);
        const result = stmt.run(enquiry);
        enquiry.id = result.lastInsertRowid;

        // Send emails (non-blocking — don't fail the request if email fails)
        Promise.all([
            sendEnquiryNotification(enquiry).catch(err => console.warn('[mailer] admin notification failed:', err.message)),
            sendAutoReply(enquiry).catch(err => console.warn('[mailer] auto-reply failed:', err.message)),
        ]);

        return res.status(201).json({
            success: true,
            message: 'Thank you! Your enquiry has been received. We will be in touch within one business day.',
            id: enquiry.id,
        });
    } catch (err) {
        console.error('[contact] error:', err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again or call us directly.' });
    }
});

module.exports = router;
