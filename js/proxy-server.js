// proxy-server.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// (Optional) Whitelist target API biar lebih aman
const ALLOWED_TARGETS = [
  'https://script.google.com/macros/s/AKfycbzlXjdPrLyUqqDGkJYqdlhGa0DL9cXtagtTGf4zfXBGrcv5cYikDMrifCcObpWuqrPQvw/exec',
  'https://script.google.com/macros/s/AKfycbzJ5pd5sC3idY0H7z4zwyX6DvTVxRyI7o7awuoAP7VfG-wyHGOltIKbJHfYKy2Me9L-_A/exec',
  'https://script.google.com/macros/s/AKfycbyPexx8tcTcr4uueb3tZvTmrqVcoXZA58r7VV2ZNZNHrTT8xpy3UPNpzXvNRfUBMZBGdQ/exec',
  'https://script.google.com/macros/s/AKfycbz51UR2MCv5jYXhAIfadGwueAmOfpBSpI4VjE9YMmPgezXw1RalZ3_pT6lOLSY7v3yv6Q/exec',
  'https://script.google.com/macros/s/AKfycbw0oC6qCpr8S8LWF3A5OUj6sKYgjE9qlTNtfAt3uKdT2Jpo5QCHfDSGkRGqNnjWrxiAmA/exec',
  // Tambah URL lain jika perlu
];

// Middleware logging
app.use(morgan('dev'));

// CORS bebas (gak pilih-pilih origin)
app.use(cors());

// Body parser buat POST/PUT
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint proxy universal
app.use('/proxy', (req, res, next) => {
  const target = req.query.url || req.headers['x-target-url'];
  if (!target) {
    return res.status(400).json({ error: 'Missing target URL.' });
  }
  if (!ALLOWED_TARGETS.some(prefix => target.startsWith(prefix))) {
    return res.status(403).json({ error: 'Target URL not allowed.' });
  }
  // Gunakan http-proxy-middleware
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/proxy': '', // Hapus prefix /proxy
    },
    onProxyReq(proxyReq, req, res) {
      // Optional: custom headers
    },
    onError(err, req, res) {
      res.status(500).json({ error: err.message });
    }
  })(req, res, next);
});

// Root
app.get('/', (req, res) => {
  res.send('Proxy anti-CORS aktif! 🚀');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Proxy anti-CORS listening on port ${PORT}`);
});
