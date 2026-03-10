// utils/mailer.js — Email notifications via Nodemailer
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') {
        return null; // Email not configured — skip silently
    }
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

/**
 * Notify admin about a new enquiry
 */
async function sendEnquiryNotification(enquiry) {
    const t = getTransporter();
    if (!t) return;
    const notifyEmail = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
    await t.sendMail({
        from: process.env.FROM_EMAIL || `"True Blue Legals Website" <${process.env.SMTP_USER}>`,
        to: notifyEmail,
        subject: `New Enquiry — ${enquiry.practice_area || 'General'} — ${enquiry.first_name} ${enquiry.last_name}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0d1b2e;padding:24px 32px">
          <h2 style="color:#d4aa6e;margin:0;font-size:1.3rem">New Website Enquiry</h2>
          <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:.85rem">True Blue Legals</p>
        </div>
        <div style="padding:28px 32px;border:1px solid #eee">
          <table style="width:100%;border-collapse:collapse;font-size:.9rem">
            <tr><td style="padding:8px 0;color:#666;width:140px">Name</td><td style="padding:8px 0;font-weight:600">${enquiry.first_name} ${enquiry.last_name}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${enquiry.phone}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Practice Area</td><td style="padding:8px 0">${enquiry.practice_area || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0">${enquiry.message.replace(/\n/g, '<br>')}</td></tr>
          </table>
        </div>
        <div style="background:#f5efe6;padding:16px 32px;font-size:.8rem;color:#999">
          Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </div>
      </div>
    `,
    });
}

/**
 * Send auto-reply confirmation to the enquirer
 */
async function sendAutoReply(enquiry) {
    const t = getTransporter();
    if (!t) return;
    await t.sendMail({
        from: process.env.FROM_EMAIL || `"True Blue Legals" <${process.env.SMTP_USER}>`,
        to: `${enquiry.first_name} ${enquiry.last_name} <${enquiry.email}>`,
        subject: `We've received your enquiry — True Blue Legals`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0d1b2e;padding:28px 32px">
          <h2 style="color:#d4aa6e;margin:0;font-size:1.4rem">True Blue Legals</h2>
          <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:.8rem;letter-spacing:.1em">ADVOCATES &amp; SOLICITORS</p>
        </div>
        <div style="padding:32px;border:1px solid #eee">
          <p style="font-size:1rem;color:#333">Dear ${enquiry.first_name},</p>
          <p style="color:#555;line-height:1.7">Thank you for reaching out to us. We have received your enquiry and one of our team members will be in touch with you within <strong>one business day</strong>.</p>
          <p style="color:#555;line-height:1.7">In the meantime, if you have an urgent matter, please call us directly at <a href="tel:+919819289599" style="color:#b8965a">+91 981 928 9599</a>.</p>
          <div style="margin:24px 0;padding:20px;background:#f5efe6;border-left:3px solid #b8965a">
            <p style="margin:0;font-size:.85rem;color:#6a6a6a"><strong>Practice Area enquired:</strong> ${enquiry.practice_area || 'General'}</p>
          </div>
          <p style="color:#555;line-height:1.7">Warm regards,<br><strong>True Blue Legals Team</strong><br>301, Dalal Niwas, Mathuradas Road, Kandivali West, Mumbai – 400067</p>
        </div>
        <div style="background:#080f1a;padding:16px 32px;font-size:.75rem;color:#555;text-align:center">
          This is an automated confirmation. Please do not reply to this email.
        </div>
      </div>
    `,
    });
}

module.exports = { sendEnquiryNotification, sendAutoReply };
