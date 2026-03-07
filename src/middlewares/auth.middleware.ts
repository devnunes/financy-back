import type { MiddlewareFn } from 'type-graphql'
import type { GraphQLContext } from '../graphql/context'

export const authMiddleware: MiddlewareFn<GraphQLContext> = async (
  { context },
  next
) => {
  console.log('Running auth middleware with context:', context)
  if (!context.userId) throw new Error('Unauthorized')

  return next()
}
