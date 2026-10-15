import { z } from 'zod'
import crypto from 'node:crypto'
import sharp from 'sharp'
import mongoose from 'mongoose'
import { Listing } from '../models/Listing.js'

const createListingSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().nonnegative(),
  category: z.enum(['cars', 'property', 'phones', 'electronics', 'furniture', 'services']),
  location: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+2519\d{8}$|^09\d{8}$/),
  condition: z.enum(['new', 'used']).default('used'),
  image: z.string().url(),
  images: z.array(z.string().url()).max(5).optional(),
  highlights: z.array(z.string().trim().min(2).max(160)).max(8).default([]),
  attributes: z.record(z.string(), z.string()).default({}),
  promotionTier: z.enum(['standard', 'vip', 'pro']).default('standard'),
  priority: z.coerce.number().int().min(0).max(1000).default(0),
})

export async function createAdminListing(req, res, next) {
  try {
    const payload = createListingSchema.parse(req.body)
    const listing = await Listing.create({ ...payload, featured: payload.promotionTier !== 'standard', status: 'active' })
    res.status(201).json({ success: true, data: { id: listing._id.toString(), title: listing.title } })
  } catch (error) {
    next(error)
  }
}

export async function uploadAdminImages(req, res, next) {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, error: { message: 'At least one image is required' } })
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, error: { message: 'Image storage is unavailable. Please try again shortly.' } })
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'listingImages' })
    const images = await Promise.all(req.files.map(async (file) => {
      const imageBuffer = await sharp(file.buffer).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer()
      const filename = `${crypto.randomUUID()}.webp`
      const imageId = await new Promise((resolve, reject) => {
        const upload = bucket.openUploadStream(filename, { contentType: 'image/webp', metadata: { originalName: file.originalname, uploadedAt: new Date() } })
        upload.once('error', reject)
        upload.once('finish', () => resolve(upload.id.toString()))
        upload.end(imageBuffer)
      })
      return `/api/v1/media/${imageId}`
    }))
    return res.status(201).json({ success: true, data: { images } })
  } catch (error) {
    return next(error)
  }
}

export async function getAdminListings(_req, res, next) {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).limit(500).lean()
    res.json({ success: true, data: listings.map((listing) => ({ ...listing, id: listing._id.toString() })) })
  } catch (error) { next(error) }
}

export async function updateAdminListing(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
    const payload = createListingSchema.partial().parse(req.body)
    if (payload.promotionTier) payload.featured = payload.promotionTier !== 'standard'
    const listing = await Listing.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true })
    if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
    res.json({ success: true, data: { id: listing._id.toString(), title: listing.title, status: listing.status } })
  } catch (error) { next(error) }
}

export async function updateAdminListingStatus(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
    const { status } = z.object({ status: z.enum(['active', 'sold', 'pending', 'rejected']) }).parse(req.body)
    const listing = await Listing.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true })
    if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
    res.json({ success: true, data: { id: listing._id.toString(), status: listing.status } })
  } catch (error) { next(error) }
}

export async function deleteAdminListing(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
    const listing = await Listing.findByIdAndDelete(req.params.id)
    if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
    res.json({ success: true, data: { id: listing._id.toString() } })
  } catch (error) { next(error) }
}
