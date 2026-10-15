import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, maxlength: 5000 },
  highlights: [{ type: String, trim: true, maxlength: 160 }],
  attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  condition: { type: String, enum: ['new', 'used'], default: 'used', index: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  phone: { type: String, required: true },
  featured: { type: Boolean, default: false, index: true },
  promotionTier: { type: String, enum: ['standard', 'vip', 'pro'], default: 'standard', index: true },
  priority: { type: Number, default: 0, min: 0, max: 1000, index: true },
  status: { type: String, enum: ['active', 'sold', 'pending', 'rejected'], default: 'active', index: true },
  views: { type: Number, default: 0 },
}, { timestamps: true })

listingSchema.index({ title: 'text', description: 'text', location: 'text' })
listingSchema.index({ category: 1, status: 1, createdAt: -1 })
listingSchema.index({ price: 1, createdAt: -1 })
listingSchema.index({ status: 1, featured: -1, priority: -1, createdAt: -1 })

export const Listing = mongoose.model('Listing', listingSchema)
