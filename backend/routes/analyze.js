const express  = require('express')
const multer   = require('multer')
const path     = require('path')
const fs       = require('fs')
const router   = express.Router()
const Scan     = require('../models/Scan')
const User     = require('../models/User')
const { optionalAuth } = require('../middleware/auth')

// ── Multer setup ──────────────────────────────────────────────
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

// ── POST /api/analyze ─────────────────────────────────────────
router.post('/', optionalAuth, upload.single('image'), async (req, res) => {
  let filePath = null

  try {
    const GROQ_KEY = process.env.GROQ_API_KEY

    console.log('Groq key check:', GROQ_KEY ? `Found (${GROQ_KEY.slice(0,8)}...)` : 'NOT FOUND')

    if (!GROQ_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Groq API key missing. Add GROQ_API_KEY to your .env file. Get free key at https://console.groq.com',
      })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded.' })
    }

    filePath       = req.file.path
    const base64   = fs.readFileSync(filePath).toString('base64')
    const mimeType = req.file.mimetype
    const skinTypes = (req.body.skinTypes || 'not specified').trim()

    console.log(`→ Analysing for: ${skinTypes}`)

    // ── Call Groq Vision (FREE) ───────────────────────────────
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model:       'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens:  2048,
        temperature: 0.1,
        messages: [{
          role:    'user',
          content: [
            {
              type:      'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` }
            },
            {
              type: 'text',
              text: `You are a board-certified dermatologist and expert cosmetic chemist. User skin profile: ${skinTypes}. Analyse this skincare product image. Find the product name, brand, and full INCI ingredient list. If only a barcode is visible, identify the product.

STRICT RULES:
- ALWAYS flag Fragrance/Parfum as harmful High severity
- ALWAYS flag any Paraben as harmful High severity
- ALWAYS flag SLS/SLES as harmful High severity
- ALWAYS flag Alcohol Denat as caution Medium severity
- REWARD Niacinamide, Hyaluronic Acid, Ceramides, Peptides as excellent
- safetyScore 90-100 ONLY if zero harmful ingredients

Return ONLY raw JSON no markdown no backticks:
{"productName":"Full name","brand":"Brand","productType":"Moisturizer","overallSafety":"Safe","safetyScore":82,"skinTypeVerdict":"Great Match","skinTypeNote":"One sentence.","summary":"Two sentences.","goodIngredients":[{"name":"Niacinamide","role":"Brightening","benefit":"Minimises pores","rating":"Excellent"}],"harmfulIngredients":[{"name":"Fragrance","concern":"Irritant","risk":"Hides unknown chemicals","severity":"High"}],"cautionIngredients":[{"name":"Alcohol Denat","concern":"Drying","note":"Strips moisture","severity":"Medium"}],"keyIngredients":["Niacinamide","Hyaluronic Acid"],"certifications":["Dermatologist Tested"],"recommendation":"2-3 sentence recommendation for ${skinTypes} skin."}

Rules: safetyScore 0-100. overallSafety: Safe or Caution or Unsafe. skinTypeVerdict: Great Match or Good Match or Neutral or Poor Match or Avoid. severity: High or Medium or Low.`
            }
          ]
        }],
      })
    })

    const groqData = await groqRes.json()

    if (!groqRes.ok) {
      const msg = groqData.error?.message || 'Groq API error'
      console.error('Groq error:', msg)
      return res.status(500).json({ success: false, error: msg })
    }

    const rawText = groqData.choices?.[0]?.message?.content || ''
    const clean   = rawText.replace(/```json|```/gi, '').trim()

    let result
    try {
      result = JSON.parse(clean)
    } catch (e) {
      console.error('JSON parse error:', clean)
      return res.status(500).json({ success: false, error: 'Could not parse AI response. Please try again.' })
    }

    // ── Save to MongoDB ───────────────────────────────────────
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

    console.log(`✓ Done: ${result.productName} | Score: ${result.safetyScore}`)

    res.json({ success: true, scanId: savedScan._id, data: result })

  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ success: false, error: err.message || 'Analysis failed.' })

  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch (_) {}
    }
  }
})

module.exports = router