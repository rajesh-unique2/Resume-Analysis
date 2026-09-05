import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRY = '7d'

function signToken(user) {
  return jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

function toPublicUser(user) {
  return { id: user._id, email: user.email, name: user.name || '' }
}

/**
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: name?.trim() || '',
    })

    const token = signToken(user)
    res.status(201).json({ token, user: toPublicUser(user) })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Could not create account. Please try again.' })
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })
    // Same generic message whether the email doesn't exist or the
    // password is wrong - avoids leaking which emails are registered.
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = signToken(user)
    res.json({ token, user: toPublicUser(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Could not log in. Please try again.' })
  }
}

/**
 * GET /api/auth/me
 * Lets the frontend verify a stored token is still valid on app load,
 * and refresh the user's display name/email without re-logging in.
 */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    res.json({ user: toPublicUser(user) })
  } catch (err) {
    console.error('GetMe error:', err)
    res.status(500).json({ message: 'Could not load account.' })
  }
}