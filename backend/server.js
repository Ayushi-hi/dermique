require('dotenv').config()

const express   = require('express')
const mongoose  = require('mongoose')
const cors      = require('cors')
const rateLimit = require('express-rate-limit')
const path      = require('path')

const app  = express()
const PORT = process.env.PORT || 3001

// ── Connect to MongoDB ────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅  MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: false,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})
app.use('/api', limiter)

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      50,
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
    success:   true,
    service:   'DERMIQUÉ API',
    version:   '1.0.0',
    mongodb:   mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime:    `${Math.round(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  })
})

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` })
})

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({ success: false, error: err.message || 'Internal server error.' })
})

// ── Start ─────────────────────────────────────────────────────
const start = async () => {
  await connectDB()

  const groqOk = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_'))

  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║        DERMIQUÉ API — Backend            ║
╠══════════════════════════════════════════╣
║  URL      :  http://localhost:${PORT}         ║
║  MongoDB  :  ${(process.env.MONGODB_URI || '').slice(0,30)}... ║
║  GROQ     :  ${groqOk ? '✅ Key set' : '❌ Key missing — add GROQ_API_KEY to .env'}  ║
║  Env      :  ${process.env.NODE_ENV || 'development'}                    ║
╚══════════════════════════════════════════╝

📋  API Endpoints:
    POST   /api/auth/register    — Create account
    POST   /api/auth/login       — Login
    GET    /api/auth/me          — Get profile
    PATCH  /api/auth/profile     — Update profile
    POST   /api/analyze          — Analyse product
    GET    /api/scans            — Scan history
    GET    /api/scans/stats      — Personal stats
    GET    /api/scans/:id        — Single scan
    DELETE /api/scans/:id        — Delete scan
    GET    /api/health           — Health check
✅  Ready!`)
  })
}

start()