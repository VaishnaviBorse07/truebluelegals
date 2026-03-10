# True Blue Legals — Law Firm Website

A full-stack law firm website with a Node.js/Express backend, SQLite database, contact form, email notifications, and a JWT-protected admin panel.

---

## Project Structure

```
tbl_site/
├── frontend/                  # All HTML pages & admin UI
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── practice-areas.html
│   ├── practice-*.html        # Individual practice area pages
│   └── admin/
│       ├── index.html         # Admin login page
│       └── dashboard.html     # Admin enquiries dashboard
│
├── backend/                   # Node.js server code
│   ├── server.js              # Express app entry point
│   ├── routes/
│   │   ├── contact.js         # POST /api/contact
│   │   └── admin.js           # /api/admin/* (JWT-protected)
│   ├── db/
│   │   ├── database.js        # SQLite setup & schema
│   │   └── enquiries.db       # SQLite database file
│   └── utils/
│       └── mailer.js          # Nodemailer email helpers
│
├── .env                       # Environment variables (do not commit)
├── .env.example               # Template for .env
├── package.json
└── node_modules/
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (bundled with Node.js)

---

## Getting Started

### 1. Install Dependencies

```bash
cd e:\Sartthi\tbl_site
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your values:

```bash
copy .env.example .env
```

Edit `.env`:

```env
# Server
PORT=3000

# Admin Auth
ADMIN_PASSWORD=YourSecurePassword
JWT_SECRET=your_long_random_secret

# Email (SMTP) — Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16char_app_password
NOTIFY_EMAIL=info@truebluelegals.in
FROM_EMAIL=True Blue Legals <no-reply@truebluelegals.in>
```

> **Gmail App Password:** Enable 2FA on your Google account, then generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Use that 16-character password as `SMTP_PASS`.

### 3. Run the Server

| Mode | Command | Description |
|------|---------|-------------|
| Production | `npm start` | Runs with `node` |
| Development | `npm run dev` | Runs with `nodemon` (auto-restart on changes) |

---

## Accessing the Application

Once the server is running:

| Page | URL |
|------|-----|
| Main website | `http://localhost:3000` |
| Admin panel | `http://localhost:3000/admin/` |
| API health check | `http://localhost:3000/api/health` |

---

## Admin Panel

**URL:** `http://localhost:3000/admin/`

**Default Password:** Set in your `.env` file as `ADMIN_PASSWORD`

Features:
- View all contact form enquiries
- Filter by status (`new`, `read`, `replied`, `closed`)
- Search enquiries by name, email, phone, or message
- Update enquiry status
- Delete enquiries

The admin panel is secured with **JWT tokens** (8-hour expiry). The token is stored in `localStorage` and used for all API requests.

---

## API Endpoints

### Contact Form
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/contact` | Submit a contact enquiry |

Rate limited to **5 requests per 15 minutes** per IP.

### Admin (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Login and receive JWT token |
| `GET` | `/api/admin/enquiries` | List all enquiries (supports `?status=`, `?search=`, `?page=`, `?limit=`) |
| `PATCH` | `/api/admin/enquiries/:id` | Update enquiry status |
| `DELETE` | `/api/admin/enquiries/:id` | Delete an enquiry |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Returns server status and timestamp |

---

## Database

SQLite database stored at `backend/db/enquiries.db`.

**Enquiries table schema:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-incremented primary key |
| `first_name` | TEXT | Enquirer's first name |
| `last_name` | TEXT | Enquirer's last name |
| `email` | TEXT | Enquirer's email address |
| `phone` | TEXT | Enquirer's phone number |
| `practice_area` | TEXT | Selected practice area (optional) |
| `message` | TEXT | Enquiry message |
| `status` | TEXT | `new` / `read` / `replied` / `closed` |
| `ip_address` | TEXT | Submitter's IP address |
| `created_at` | TEXT | Timestamp (local time) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Server | Node.js + Express |
| Database | SQLite (via `better-sqlite3`) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Email | Nodemailer |
| Frontend | Vanilla HTML / CSS / JavaScript |

---

## Security Notes

- Change `ADMIN_PASSWORD` and `JWT_SECRET` before deploying to production
- Never commit your `.env` file to version control
- Rate limiting is enabled on the contact form endpoint
- Admin routes are protected with JWT bearer token authentication
