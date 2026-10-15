import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

const credentialsSchema = z.object({ email: z.string().trim().email(), password: z.string().min(8).max(100) })
const registerSchema = credentialsSchema.extend({ fullName: z.string().trim().min(2).max(100) })

function setAuthCookie(res, user) {
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: '7d' })
  res.cookie('access_token', token, { httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
}

function publicUser(user) {
  return { id: user._id.toString(), fullName: user.fullName, email: user.email, role: user.role }
}

export async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body)
    const email = payload.email.toLowerCase()
    const exists = await User.exists({ email })
    if (exists) return res.status(409).json({ success: false, error: { message: 'Email is already registered' } })
    const passwordHash = await bcrypt.hash(payload.password, 12)
    const user = await User.create({ fullName: payload.fullName, email, passwordHash })
    setAuthCookie(res, user)
    res.status(201).json({ success: true, data: { user: publicUser(user) } })
  } catch (error) { next(error) }
}

export async function login(req, res, next) {
  try {
    const payload = credentialsSchema.parse(req.body)
    const user = await User.findOne({ email: payload.email.toLowerCase() }).select('+passwordHash')
    if (!user || user.isBlocked || !(await bcrypt.compare(payload.password, user.passwordHash))) return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } })
    setAuthCookie(res, user)
    res.json({ success: true, data: { user: publicUser(user) } })
  } catch (error) { next(error) }
}

export function logout(_req, res) {
  res.clearCookie('access_token')
  res.json({ success: true, data: null })
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.sub)
    if (!user) return res.status(401).json({ success: false, error: { message: 'Authentication required' } })
    res.json({ success: true, data: { user: publicUser(user) } })
  } catch (error) { next(error) }
}
