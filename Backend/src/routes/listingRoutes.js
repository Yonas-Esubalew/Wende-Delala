import { Router } from 'express'
import { getListingById, getListings } from '../controllers/listingController.js'

export const listingRouter = Router()
listingRouter.get('/', getListings)
listingRouter.get('/:id', getListingById)
