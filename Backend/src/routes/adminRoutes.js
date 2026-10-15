import { Router } from 'express'
import multer from 'multer'
import { createAdminListing, deleteAdminListing, getAdminListings, updateAdminListing, updateAdminListingStatus, uploadAdminImages } from '../controllers/adminController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const adminRouter = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 5, fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/')) })
adminRouter.use(requireAuth, requireRole('admin'))
adminRouter.get('/listings', getAdminListings)
adminRouter.post('/uploads', (req, res, next) => {
  upload.array('images', 5)(req, res, (error) => {
    if (!error) return next()
    const tooLarge = error.code === 'LIMIT_FILE_SIZE'
    return res.status(tooLarge ? 413 : 400).json({ success: false, error: { message: tooLarge ? 'Each image must be 5 MB or smaller.' : error.message } })
  })
}, uploadAdminImages)
adminRouter.post('/listings', createAdminListing)
adminRouter.put('/listings/:id', updateAdminListing)
adminRouter.patch('/listings/:id/status', updateAdminListingStatus)
adminRouter.delete('/listings/:id', deleteAdminListing)
