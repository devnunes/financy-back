import type { ExpressContextFunctionArgument } from '@as-integrations/express5'
import { type JwtPayload, verifyJwt } from '../../utils/jwt'

export type GraphQLContext = {
  userId: string | undefined
  token: string | undefined
  req: ExpressContextFunctionArgument['req']
  res: ExpressContextFunctionArgument['res']
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

export const buildContext = async ({
  req,
  res,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  return { userId, token, req, res } as GraphQLContext
}
