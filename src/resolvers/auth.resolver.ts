import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { LoginInput, RegisterInput } from '@/dtos/input/auth.input'
import { LoginOutput, RegisterOutput } from '@/dtos/output/auth.output'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { setSessionCookie } from '@/utils/cookie'
import { isLeft } from '@/utils/either'

type AuthResolverDeps = {
  authService?: Pick<AuthService, 'register' | 'login'>
}
@Resolver()
export class AuthResolver {
  private authService: Pick<AuthService, 'register' | 'login'>
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

  @Mutation(() => LoginOutput)
  async login(
    @Arg('data', () => LoginInput) data: LoginInput,
    @Ctx() context: GraphQLContext
  ): Promise<LoginOutput> {
    const result = await this.authService.login(data)
    if (isLeft(result)) throw result.left

    setSessionCookie(context.res, result.right.token)

    return result.right
  }
}
