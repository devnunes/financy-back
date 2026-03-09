import type { ApolloFastifyContextFunction } from '@as-integrations/fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getCookieFromHeader, SESSION_COOKIE_NAME } from '@/utils/cookie'
import { type JwtPayload, verifyJwt } from '@/utils/jwt'

export type GraphQLContext = {
  userId: string | undefined
  token: string | undefined
  req: FastifyRequest
  res: FastifyReply
}

function getUserIdFromToken(token: string | undefined): string | undefined {
  if (!token) return undefined
  try {
    const { id } = verifyJwt(token) as JwtPayload
    return id
  } catch (_error) {
    return undefined
  }
}

export const buildContext: ApolloFastifyContextFunction<
  GraphQLContext
> = async (req, res) => {
  const rawAuthorization = req.headers.authorization
  const authHeader = Array.isArray(rawAuthorization)
    ? (rawAuthorization[0] ?? '')
    : (rawAuthorization ?? '')
  const tokenFromHeader = authHeader.replace('Bearer ', '')
  const rawCookieHeader = req.headers.cookie
  const cookieHeader = Array.isArray(rawCookieHeader)
    ? rawCookieHeader.join('; ')
    : rawCookieHeader

  const tokenFromCookie = getCookieFromHeader(cookieHeader, SESSION_COOKIE_NAME)
  const token = tokenFromHeader || tokenFromCookie
  const userId = getUserIdFromToken(token)

  return { userId, token, req, res }
}
