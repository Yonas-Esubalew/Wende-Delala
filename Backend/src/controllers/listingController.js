import mongoose from 'mongoose'
import { Listing } from '../models/Listing.js'
import { seedListings } from '../data/listings.js'

function normalizeListing(listing, index = 0) {
  return {
    id: listing._id?.toString() || listing.id || `seed-${index + 1}`,
    title: listing.title,
    description: listing.description,
    highlights: listing.highlights || [],
    attributes: listing.attributes || {},
    price: listing.price.toLocaleString('en-US'),
    rawPrice: listing.price,
    location: listing.location,
    time: listing.time || 'Today',
    category: listing.category,
    image: listing.image,
    images: listing.images?.length ? listing.images : [listing.image],
    featured: listing.featured,
    promotionTier: listing.promotionTier || (listing.featured ? 'vip' : 'standard'),
    priority: listing.priority || 0,
    phone: listing.phone,
    condition: listing.condition || 'used',
    views: listing.views || 0,
  }
}

export async function getListings(req, res, next) {
  try {
    const { q, category, city, condition, minPrice, maxPrice, sort = 'newest', page = '1', limit = '24' } = req.query
    const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1)
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 24, 1), 60)
    const query = { status: 'active' }
    if (category && category !== 'all') query.category = category
    if (city) query.location = { $regex: city, $options: 'i' }
    if (condition && condition !== 'all') query.condition = condition
    if (minPrice || maxPrice) query.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) }

    if (req.app.locals.databaseConnected) {
      if (q) query.$text = { $search: q }
      const sortMap = {
        newest: { createdAt: -1 },
        featured: { featured: -1, priority: -1, createdAt: -1 },
        low: { price: 1 },
        high: { price: -1 },
      }
      const [items, total] = await Promise.all([
        Listing.find(query).sort(sortMap[sort] || sortMap.newest).skip((currentPage - 1) * pageSize).limit(pageSize).lean(),
        Listing.countDocuments(query),
      ])
      return res.json({ success: true, data: items.map((item, index) => normalizeListing(item, index)), meta: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) } })
    }

    const search = q?.toLowerCase().trim()
    let items = seedListings.filter((item) => {
      const matchesCategory = !category || category === 'all' || item.category === category
      const matchesQuery = !search || `${item.title} ${item.description} ${item.location}`.toLowerCase().includes(search)
      const matchesCity = !city || item.location.toLowerCase().includes(city.toLowerCase())
      const matchesCondition = !condition || condition === 'all' || (item.condition || 'used') === condition
      const matchesMin = !minPrice || item.price >= Number(minPrice)
      const matchesMax = !maxPrice || item.price <= Number(maxPrice)
      return matchesCategory && matchesQuery && matchesCity && matchesCondition && matchesMin && matchesMax
    })
    if (sort === 'low') items = items.sort((a, b) => a.price - b.price)
    if (sort === 'high') items = items.sort((a, b) => b.price - a.price)
    if (sort === 'featured') items = items.sort((a, b) => Number(b.featured) - Number(a.featured) || (b.priority || 0) - (a.priority || 0))
    const total = items.length
    const start = (currentPage - 1) * pageSize
    return res.json({ success: true, data: items.slice(start, start + pageSize).map((item, index) => normalizeListing(item, start + index)), meta: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) } })
  } catch (error) {
    return next(error)
  }
}

export async function getListingCategoryCounts(req, res, next) {
  try {
    if (req.app.locals.databaseConnected) {
      const counts = await Listing.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ])
      return res.json({
        success: true,
        data: counts.reduce((result, item) => {
          result[item._id] = item.count
          return result
        }, {}),
      })
    }

    const counts = seedListings.reduce((result, item) => {
      result[item.category] = (result[item.category] || 0) + 1
      return result
    }, {})
    return res.json({ success: true, data: counts })
  } catch (error) {
    return next(error)
  }
}

export async function getListingById(req, res, next) {
  try {
    if (req.app.locals.databaseConnected) {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
      const listing = await Listing.findOne({ _id: req.params.id, status: 'active' }).lean()
      if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
      await Listing.updateOne({ _id: listing._id }, { $inc: { views: 1 } })
      return res.json({ success: true, data: normalizeListing({ ...listing, views: (listing.views || 0) + 1 }) })
    }

    const index = Number.parseInt(req.params.id.replace('seed-', ''), 10) - 1
    const listing = seedListings[index]
    if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } })
    return res.json({ success: true, data: normalizeListing(listing, index) })
  } catch (error) {
    return next(error)
  }
}

