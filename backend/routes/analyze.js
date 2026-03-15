const express  = require('express')
const multer   = require('multer')
const path     = require('path')
const fs       = require('fs')
const router   = express.Router()
const Scan     = require('../models/Scan')
const User     = require('../models/User')
const { optionalAuth } = require('../middleware/auth')

// ── Multer setup ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename (req, file, cb) {
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits:     { fileSize: 10 * 1024 * 1024 },
  fileFilter (req, file, cb) {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are accepted.'))
  },
})

// ── POST /api/analyze ────────────────────────────────────────
router.post('/', optionalAuth, upload.single('image'), async (req, res) => {
  let filePath = null

  try {
    const KEY = process.env.ANTHROPIC_API_KEY
    if (!KEY || KEY === 'sk-ant-PASTE_YOUR_KEY_HERE') {
      return res.status(500).json({
        success: false,
        error: 'Anthropic API key is missing. Add ANTHROPIC_API_KEY to your .env file.',
      })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded.' })
    }

    filePath   = req.file.path
    const base64   = fs.readFileSync(filePath).toString('base64')
    const mimeType = req.file.mimetype
    const skinTypes = (req.body.skinTypes || 'not specified').trim()

    console.log(`\n→ Analysing [Anthropic] for: ${skinTypes}${req.user ? ` | User: ${req.user.email}` : ' | Guest'}`)

    // ── Call Anthropic Claude Vision ───────────────────────
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1800,
        messages: [{
          role:    'user',
          content: [
            {
              type:   'image',
              source: {
                type:       'base64',
                media_type: mimeType,
                data:       base64,
              },
            },
            {
              type: 'text',
              text: `You are a board-certified dermatologist and expert cosmetic chemist.

User skin profile: ${skinTypes}

Carefully analyse this skincare product image. Identify:
- The product name and brand
- The full INCI ingredient list printed on the packaging
- If only a barcode is visible, identify the product from it

Return ONLY a single valid JSON object — no markdown, no code fences, no explanation, just raw JSON:

{
  "productName": "Full product name",
  "brand": "Brand name",
  "productType": "e.g. Moisturizer / Serum / Cleanser / Toner / Sunscreen",
  "overallSafety": "Safe",
  "safetyScore": 82,
  "skinTypeVerdict": "Great Match",
  "skinTypeNote": "One sentence explaining suitability for this specific skin profile.",
  "summary": "Two sentence overview of this product.",
  "goodIngredients": [
    { "name": "Niacinamide", "role": "Brightening", "benefit": "Minimises pores and reduces dark spots", "rating": "Excellent" }
  ],
  "harmfulIngredients": [
    { "name": "Fragrance", "concern": "Irritant", "risk": "May trigger reactions in sensitive skin", "severity": "High" }
  ],
  "cautionIngredients": [
    { "name": "Alcohol Denat", "concern": "Drying", "note": "Can strip moisture barrier over time", "severity": "Medium" }
  ],
  "keyIngredients": ["Niacinamide", "Hyaluronic Acid", "Ceramide NP"],
  "certifications": ["Dermatologist Tested", "Non-Comedogenic"],
  "recommendation": "Two to three sentence personalised recommendation for the user skin profile."
}

Rules:
- safetyScore: integer 0-100 (100 = perfectly safe)
- overallSafety: MUST be exactly: Safe | Caution | Unsafe
- skinTypeVerdict: MUST be exactly: Great Match | Good Match | Neutral | Poor Match | Avoid
- severity: MUST be exactly: High | Medium | Low
- Be exhaustive — list every notable ingredient you can identify`,
            },
          ],
        }],
      }),
    })

    const apiData = await anthropicRes.json()

    if (!anthropicRes.ok) {
      const msg = apiData.error?.message || 'Anthropic API error'
      console.error('Anthropic error:', msg)
      return res.status(500).json({ success: false, error: msg })
    }

    // Anthropic returns content as array of blocks
    const rawText = apiData.content?.find(b => b.type === 'text')?.text || ''
    const clean   = rawText.replace(/```json|```/gi, '').trim()
    const result  = JSON.parse(clean)

    // ── Save scan to MongoDB ───────────────────────────────
    const scanData = {
      user:               req.user?._id || null,
      skinTypes:          skinTypes.split(',').map(s => s.trim()),
      productName:        result.productName,
      brand:              result.brand,
      productType:        result.productType,
      overallSafety:      result.overallSafety,
      safetyScore:        result.safetyScore,
      skinTypeVerdict:    result.skinTypeVerdict,
      skinTypeNote:       result.skinTypeNote,
      summary:            result.summary,
      recommendation:     result.recommendation,
      goodIngredients:    result.goodIngredients    || [],
      harmfulIngredients: result.harmfulIngredients || [],
      cautionIngredients: result.cautionIngredients || [],
      keyIngredients:     result.keyIngredients     || [],
      certifications:     result.certifications     || [],
      rawResult:          result,
    }

    const savedScan = await Scan.create(scanData)

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalScans: 1 } })
    }

    console.log(`✓ Scan saved: ${result.productName} | Score: ${result.safetyScore} | ID: ${savedScan._id}`)

    res.json({ success: true, scanId: savedScan._id, data: result })

  } catch (err) {
    console.error('Analyze error:', err.message)
    res.status(500).json({ success: false, error: err.message || 'Analysis failed. Please try again.' })

  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch (_) {}
    }
  }
})

module.exports = router