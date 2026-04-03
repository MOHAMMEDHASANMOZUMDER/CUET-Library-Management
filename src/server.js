require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const { authOptional } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookCopyRoutes = require('./routes/bookCopies');
const borrowRoutes = require('./routes/borrow');
const fineRoutes = require('./routes/fines');
const preBookRoutes = require('./routes/prebooks');
const noteRoutes = require('./routes/notes');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

// Optional auth parsing so routes can look at req.user
app.use(authOptional);

// Static frontend (keep existing Spring static folder)
const staticDir = path.join(__dirname, '..', 'src', 'main', 'resources', 'static');
app.use(express.static(staticDir));

// Image placeholder route from Spring controller
app.get('/images/book-placeholder.png', (_req, res) => {
  const svg = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bookGradient)"/>
  <g fill="white" transform="translate(100,100)">
    <path d="M-30,-40 L-30,40 L30,40 L30,-40 Z" stroke="white" stroke-width="2" fill="none"/>
    <path d="M-20,-30 L20,-30 M-20,-20 L20,-20 M-20,-10 L20,-10 M-20,0 L20,0 M-20,10 L20,10 M-20,20 L20,20 M-20,30 L10,30" stroke="white" stroke-width="1"/>
  </g>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/book-copies', bookCopyRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/prebooks', preBookRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

// Basic health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Default route
app.get('/', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send(err.message || 'Internal Server Error');
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`[libraryforge] listening on http://localhost:${port}`);
});
