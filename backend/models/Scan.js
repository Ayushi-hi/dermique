const mongoose = require('mongoose')

const IngredientSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  role:     String,
  benefit:  String,
  concern:  String,
  risk:     String,
  note:     String,
  severity: { type: String, enum: ['High','Medium','Low'] },
  rating:   String,
}, { _id: false })

const ScanSchema = new mongoose.Schema({
  // Link to user (optional - guest scans allowed)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null,
  },

  // Skin profile used for this scan
  skinTypes: {
    type:     [String],
    required: true,
  },

  // Product info
  productName:  { type: String, default: 'Unknown Product' },
  brand:        { type: String, default: '' },
  productType:  { type: String, default: '' },

  // Safety analysis
  overallSafety:   { type: String, enum: ['Safe','Caution','Unsafe'], required: true },
  safetyScore:     { type: Number, min: 0, max: 100, required: true },
  skinTypeVerdict: {
    type: String,
    enum: ['Great Match','Good Match','Neutral','Poor Match','Avoid'],
  },
  skinTypeNote:  String,
  summary:       String,
  recommendation: String,

  // Ingredient lists
  goodIngredients:    [IngredientSchema],
  harmfulIngredients: [IngredientSchema],
  cautionIngredients: [IngredientSchema],
  keyIngredients:     [String],
  certifications:     [String],

  // Raw AI response stored for reference
  rawResult: {
    type:   mongoose.Schema.Types.Mixed,
    select: false,
  },

  // Metadata
  createdAt: {
    type:    Date,
    default: Date.now,
    index:   true,
  },
})

// Index for fast user history queries
ScanSchema.index({ user: 1, createdAt: -1 })
ScanSchema.index({ overallSafety: 1 })
ScanSchema.index({ productName: 'text', brand: 'text' })

module.exports = mongoose.model('Scan', ScanSchema)