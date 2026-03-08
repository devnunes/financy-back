import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql'
import { CreateUserInput, UpdateUserInput } from '@/dtos/input/user.input'
import type { GraphQLContext } from '@/graphql/context'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { UserModel } from '@/models/user.model'
import { UserService } from '@/services/user.service'

type UserResolverDeps = {
  userService?: Pick<UserService, 'createUser' | 'getUserById' | 'updateUser'>
}

@Resolver(() => UserModel)
export class UserResolver {
  private userService: UserService
  constructor(deps?: UserResolverDeps) {
    this.userService = deps?.userService ?? new UserService()
  }

  @Query(() => String)
  async createUser(
    @Arg('data', () => CreateUserInput) data: CreateUserInput
  ): Promise<boolean> {
    const user = await this.userService.createUser(data)
    return !!user
  }

  @Query(() => UserModel)
  @UseMiddleware(authMiddleware)
  async getUser(@Arg('id', () => String) id: string): Promise<UserModel> {
    return this.userService.getUserById(id)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(authMiddleware)
  async updateUser(
    @Arg('data', () => UpdateUserInput) data: UpdateUserInput,
    @Ctx() context: GraphQLContext
  ): Promise<boolean> {
    if (!context.userId) throw new Error('Unauthorized')
    return this.userService.updateUser(data, context.userId)
  }
}
