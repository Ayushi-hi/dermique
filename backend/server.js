require('dotenv').config()

const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const rateLimit  = require('express-rate-limit')
const path       = require('path')

const app  = express()
const PORT = process.env.PORT || 3000

// ── Connect to MongoDB ────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅  MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message)
    console.error('    Make sure MongoDB is running and MONGODB_URI is correct in .env')
    process.exit(1)
  }
}

// ── Middleware ────────────────────────────────────────────────

// CORS — allow requests from the React frontend
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting — protect against abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,             // 100 requests per window
  message:  { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})
app.use('/api', limiter)

// Stricter rate limit for analysis endpoint (costs money)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      20,              // 20 analyses per hour
  message:  { success: false, error: 'Analysis limit reached. Please try again in an hour.' },
})
app.use('/api/analyze', analyzeLimiter)

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/analyze', require('./routes/analyze'))
app.use('/api/scans',   require('./routes/scans'))

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success:  true,
    service:  'DERMIQUÉ API',
    version:  '1.0.0',
    mongodb:  mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime:   `${Math.round(process.uptime())}s`,
    keySet:   !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-proj-PASTE_YOUR_KEY_HERE'),
    timestamp: new Date().toISOString(),
  })
})

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` })
})

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' })
  }

  res.status(err.status || 500).json({
    success: false,
    error:   err.message || 'An unexpected error occurred.',
  })
})

// ── Start server ──────────────────────────────────────────────
const start = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════╗')
    console.log('║        DERMIQUÉ API — Backend            ║')
    console.log('╠══════════════════════════════════════════╣')
    console.log(`║  URL      :  http://localhost:${PORT}         ║`)
    console.log(`║  MongoDB  :  ${process.env.MONGODB_URI?.slice(0,30)}... ║`)
    console.log(`║  OpenAI   :  ${process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-proj-PASTE_YOUR_KEY_HERE' ? '✅ Key set' : '❌ Key missing'}                    ║`)
    console.log(`║  Env      :  ${process.env.NODE_ENV || 'development'}                    ║`)
    console.log('╚══════════════════════════════════════════╝')
    console.log('\n📋  API Endpoints:')
    console.log('    POST   /api/auth/register    — Create account')
    console.log('    POST   /api/auth/login       — Login')
    console.log('    GET    /api/auth/me          — Get profile')
    console.log('    PATCH  /api/auth/profile     — Update profile')
    console.log('    POST   /api/analyze          — Analyse product (GPT-4o)')
    console.log('    GET    /api/scans            — Scan history')
    console.log('    GET    /api/scans/stats      — Personal stats')
    console.log('    GET    /api/scans/:id        — Single scan')
    console.log('    DELETE /api/scans/:id        — Delete scan')
    console.log('    GET    /api/health           — Health check')
    console.log('\n✅  Ready!\n')
  })
}

start()