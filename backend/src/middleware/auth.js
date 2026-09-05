import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  // Fail loudly at startup rather than silently signing/verifying tokens
  // with `undefined`, which would make every token trivially forgeable.
  console.error('FATAL: JWT_SECRET is not set in your .env file.')
  process.exit(1)
}

/**
 * Protects a route: requires a valid "Authorization: Bearer <token>"
 * header. On success, sets req.userId so downstream handlers can scope
 * data (e.g. Analysis history) to the logged-in user.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated. Please log in.' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' })
  }
}