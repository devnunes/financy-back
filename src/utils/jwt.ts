import type { Secret, SignOptions } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'

export type JwtPayload = {
  id: string
  email: string
}

export const singJwt = (payload: JwtPayload, expiresIn?: string): string => {
  const secret: Secret = process.env.JWT_SECRET as unknown as Secret
  const options: SignOptions = expiresIn
    ? {
      expiresIn: expiresIn as unknown as NonNullable<
        SignOptions['expiresIn']
      >,
    }
    : {}

  return jwt.sign(payload, secret, options)
}

export const verifyJwt = (token: string): JwtPayload => {
  const secret: Secret = process.env.JWT_SECRET as unknown as Secret
  try {
    return jwt.verify(token, secret) as JwtPayload
  } catch (_error) {
    throw new Error('Invalid token')
  }
}