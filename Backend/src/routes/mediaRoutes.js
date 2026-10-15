import { Router } from 'express'
import { getListingImage } from '../controllers/mediaController.js'

export const mediaRouter = Router()
mediaRouter.get('/:id', getListingImage)
