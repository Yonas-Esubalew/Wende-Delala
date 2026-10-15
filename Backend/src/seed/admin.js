import bcrypt from 'bcrypt'
import { connectDatabase, disconnectDatabase } from '../config/db.js'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

if (!env.adminEmail || !env.adminPassword || env.adminPassword.length < 12) {
  throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in Backend/.env before seeding admin.')
}

const connected = await connectDatabase()
if (!connected) throw new Error('MongoDB is required to create the admin account.')
const passwordHash = await bcrypt.hash(env.adminPassword, 12)
await User.findOneAndUpdate(
  { email: env.adminEmail },
  { $set: { fullName: env.adminName, email: env.adminEmail, passwordHash, role: 'admin', isBlocked: false } },
  { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
)
console.log(`Admin account ready for ${env.adminEmail}`)
await disconnectDatabase()
