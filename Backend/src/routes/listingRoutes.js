import { Router } from 'express'
import { getListingById, getListingCategoryCounts, getListings } from '../controllers/listingController.js'

export const listingRouter = Router()
listingRouter.get('/', getListings)
listingRouter.get('/counts', getListingCategoryCounts)
listingRouter.get('/:id', getListingById)
