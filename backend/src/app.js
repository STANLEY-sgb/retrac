const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: config.FRONTEND_URL === '*' ? '*' : [config.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apiKey', 'X-Requested-With']
}));

// HTTP Request Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate Limiting
app.use('/api', apiLimiter);

// API Root Information
app.get('/', (req, res) => {
  res.json({
    platform: 'ReTrac MVP — Digital Aftercare & Reintegration Platform',
    competition: 'DOMINION 2026',
    track: 'Track 05 — Rehabilitation & Reintegration',
    status: 'ONLINE',
    tagline: 'Stay Connected. Stay Recovered. Rebuild Your Life.',
    apiDocumentation: '/api/health',
    version: '1.0.0'
  });
});

// Mount All API Routes
app.use('/api', routes);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
