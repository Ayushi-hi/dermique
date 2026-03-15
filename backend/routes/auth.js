const express  = require('express')
const router   = express.Router()
const User     = require('../models/User')
const { protect, signToken } = require('../middleware/auth')

// Helper: send token response
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      skinProfile: user.skinProfile,
      totalScans:  user.totalScans,
      createdAt:   user.createdAt,
    },
  })
}

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, skinProfile } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required.' })
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' })
    }

    const user = await User.create({
      name,
      email,
      password,
      skinProfile: skinProfile || [],
    })

    sendToken(user, 201, res)
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ')
      return res.status(400).json({ success: false, error: msg })
    }
    res.status(500).json({ success: false, error: 'Server error. Please try again.' })
  }
})

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' })
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' })
    }

    sendToken(user, 200, res)
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error. Please try again.' })
  }
})

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id:          req.user._id,
      name:        req.user.name,
      email:       req.user.email,
      skinProfile: req.user.skinProfile,
      totalScans:  req.user.totalScans,
      createdAt:   req.user.createdAt,
    },
  })
})

// ── PATCH /api/auth/profile ──────────────────────────────────
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, skinProfile } = req.body
    const updates = {}
    if (name)        updates.name = name
    if (skinProfile) updates.skinProfile = skinProfile

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new:          true,
      runValidators: true,
    })

    res.json({
      success: true,
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        skinProfile: user.skinProfile,
        totalScans:  user.totalScans,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not update profile.' })
  }
})

module.exports = router