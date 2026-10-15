import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function requireAuth(req, res, next) {
  const token = req.cookies?.access_token
  if (!token) return res.status(401).json({ success: false, error: { message: 'Authentication required' } })
  try {
    req.user = jwt.verify(token, env.jwtSecret)
    next()
  } catch {
    res.status(401).json({ success: false, error: { message: 'Authentication required' } })
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ success: false, error: { message: 'Forbidden' } })
    next()
  }
}
