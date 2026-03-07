import type { ExpressContextFunctionArgument } from '@as-integrations/express5'
import { type JwtPayload, verifyJwt } from '../../utils/jwt'

export type GraphQLContext = {
  userId: string | undefined
  token: string | undefined
  req: ExpressContextFunctionArgument['req']
  res: ExpressContextFunctionArgument['res']
}

export const buildContext = async ({
  req,
  res,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  const { id } = verifyJwt(token) as JwtPayload || { id: '' }
  const userId = id

  return { userId, token, req, res } as GraphQLContext
}
