import mongoose from 'mongoose'

export async function getListingImage(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id) || mongoose.connection.readyState !== 1) {
      return res.status(404).json({ success: false, error: { message: 'Image not found' } })
    }

    const imageId = new mongoose.Types.ObjectId(req.params.id)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'listingImages' })
    const [file] = await bucket.find({ _id: imageId }).limit(1).toArray()
    if (!file) return res.status(404).json({ success: false, error: { message: 'Image not found' } })

    res.set({
      'Content-Type': file.contentType || 'image/webp',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    })
    const download = bucket.openDownloadStream(imageId)
    download.once('error', (error) => {
      if (res.headersSent) res.destroy(error)
      else next(error)
    })
    download.pipe(res)
  } catch (error) {
    next(error)
  }
}
