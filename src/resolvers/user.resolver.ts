import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'
import { authMiddleware } from '../middlewares/auth.middleware'
import { UserModel } from '../models/user.model'
import { UserService } from '../services/user.service'

@Resolver(() => UserModel)
@UseMiddleware(authMiddleware)
export class UserResolver {
  private userService: UserService
  constructor() {
    this.userService = new UserService()
  }

  @Query(() => UserModel)
  async getUser(@Arg('id', () => String) id: string): Promise<UserModel> {
    return this.userService.getUserById(id)
  }
}
