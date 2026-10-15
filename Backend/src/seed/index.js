import { connectDatabase, disconnectDatabase } from '../config/db.js'
import { Listing } from '../models/Listing.js'
import { seedListings } from '../data/listings.js'

const connected = await connectDatabase()

if (!connected) {
	throw new Error('MongoDB is required to seed listings. Check Backend/.env and Atlas access.')
}

await Listing.bulkWrite(seedListings.map((listing) => ({
	updateOne: {
		filter: { title: listing.title },
		update: { $set: listing },
		upsert: true,
	},
})))

console.log(`Seeded ${seedListings.length} listings into MongoDB`)
await disconnectDatabase()
