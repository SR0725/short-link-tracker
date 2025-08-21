import jwt, { SignOptions } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function generateToken(rememberMe: boolean = false): string {
  const payload = { admin: true }
  const options: SignOptions = rememberMe 
    ? { expiresIn: '365d' } 
    : { expiresIn: '24h' }
  
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    console.log('Invalid token', error)
    return false
  }
}

export async function getAuthStatus(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return false
  
  return verifyToken(token)
}

export async function setAuthCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies()
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    ...(rememberMe && { maxAge: 365 * 24 * 60 * 60 }) // 1 year
  }
  
  cookieStore.set('auth-token', token, cookieOptions)
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}