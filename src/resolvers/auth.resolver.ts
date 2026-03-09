import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { RegisterInput, SignInInput } from '@/dtos/input/auth.input'
import { RegisterOutput, SignInOutput } from '@/dtos/output/auth.output'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { setSessionCookie } from '@/utils/cookie'
import { isLeft } from '@/utils/either'

type AuthResolverDeps = {
  authService?: Pick<AuthService, 'register' | 'signIn'>
}
@Resolver()
export class AuthResolver {
  private authService: Pick<AuthService, 'register' | 'signIn'>
  constructor(deps?: AuthResolverDeps) {
    this.authService = deps?.authService ?? new AuthService()
  }

  @Mutation(() => RegisterOutput)
  async register(
    @Arg('data', () => RegisterInput) data: RegisterInput,
    @Ctx() context: GraphQLContext
  ): Promise<RegisterOutput> {
    const result = await this.authService.register(data)
    if (isLeft(result)) throw result.left

    setSessionCookie(context.res, result.right.token)

    return result.right
  }

  @Mutation(() => SignInOutput)
  async signIn(
    @Arg('data', () => SignInInput) data: SignInInput,
    @Ctx() context: GraphQLContext
  ): Promise<SignInOutput> {
    const result = await this.authService.signIn(data)
    if (isLeft(result)) throw result.left

    setSessionCookie(context.res, result.right.token)

    return result.right
  }

  @Mutation(() => Boolean)
  async signout(@Ctx() context: GraphQLContext): Promise<boolean> {
    setSessionCookie(context.res, '', { maxAge: -1 })
    return true
  }
}
