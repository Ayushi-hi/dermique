const express = require('express')
const router  = express.Router()
const Scan    = require('../models/Scan')
const { protect } = require('../middleware/auth')

// ── GET /api/scans — Get current user's scan history ─────────
router.get('/', protect, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 10)
    const skip  = (page - 1) * limit

    const [scans, total] = await Promise.all([
      Scan.find({ user: req.user._id })
          .select('-rawResult')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
      Scan.countDocuments({ user: req.user._id }),
    ])

    res.json({
      success: true,
      total,
      page,
      pages:  Math.ceil(total / limit),
      scans,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch scan history.' })
  }
})

// ── GET /api/scans/stats — User's personal stats ─────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id

    const [total, bySafety, avgScore, recent] = await Promise.all([
      // Total scans
      Scan.countDocuments({ user: userId }),

      // Count by safety category
      Scan.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$overallSafety', count: { $sum: 1 } } },
      ]),

      // Average safety score
      Scan.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, avg: { $avg: '$safetyScore' } } },
      ]),

      // 5 most recent scans
      Scan.find({ user: userId })
          .select('productName brand overallSafety safetyScore createdAt')
          .sort({ createdAt: -1 })
          .limit(5),
    ])

    // Most scanned product
    const topProduct = await Scan.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$productName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])

    // Flatten safety counts
    const safetyMap = { Safe: 0, Caution: 0, Unsafe: 0 }
    bySafety.forEach(b => { safetyMap[b._id] = b.count })

    res.json({
      success: true,
      stats: {
        totalScans:       total,
        averageSafetyScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
        safeCount:        safetyMap.Safe,
        cautionCount:     safetyMap.Caution,
        unsafeCount:      safetyMap.Unsafe,
        topProduct:       topProduct[0]?._id || null,
        recentScans:      recent,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch statistics.' })
  }
})

// ── GET /api/scans/:id — Get a single scan ────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id:  req.params.id,
      user: req.user._id,
    }).select('-rawResult')

    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found.' })
    }

    res.json({ success: true, scan })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch scan.' })
  }
})

// ── DELETE /api/scans/:id — Delete a scan ────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({
      _id:  req.params.id,
      user: req.user._id,
    })

    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found.' })
    }

    res.json({ success: true, message: 'Scan deleted successfully.' })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not delete scan.' })
  }
})

// ── DELETE /api/scans — Delete all user scans ─────────────────
router.delete('/', protect, async (req, res) => {
  try {
    const result = await Scan.deleteMany({ user: req.user._id })
    res.json({ success: true, message: `${result.deletedCount} scans deleted.` })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not delete scans.' })
  }
})

module.exports = router