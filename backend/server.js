// backend/server.js — True Blue Legals Express Server
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const contactRouter = require('./routes/contact');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many submissions. Please wait 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/contact', contactLimiter, contactRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));

// Main site — served from frontend/
app.use(express.static(path.join(__dirname, '../frontend'), {
    index: 'index.html',
}));

// Fallback: serve index.html for any unmatched route (SPA-style)
app.get('*', (req, res) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`\nTrue Blue Legals server running at http://localhost:${PORT}`);
    console.log(`   Site:        http://localhost:${PORT}`);
    console.log(`   Admin panel: http://localhost:${PORT}/admin/`);
    console.log(`   API health:  http://localhost:${PORT}/api/health\n`);
});
