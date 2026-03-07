import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { CreateTransactionInput } from '@/dtos/input/transaction.input'
import type { GraphQLContext } from '@/graphql/context'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { TransactionModel } from '@/models/transaction.model'
import { UserModel } from '@/models/user.model'
import { TransactionService } from '@/services/transaction.service'
import { UserService } from '@/services/user.service'

@Resolver(() => TransactionModel)
@UseMiddleware(authMiddleware)
export class TransactionResolver {
  private transactionService: TransactionService
  private userService: UserService
  constructor() {
    this.transactionService = new TransactionService()
    this.userService = new UserService()
  }

  @Mutation(() => TransactionModel)
  async createTransaction(
    @Arg('data', () => CreateTransactionInput) data: CreateTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.createTransaction(data, context.userId)
  }

  @FieldResolver(() => UserModel, { nullable: true })
  async user(@Root() transaction: TransactionModel): Promise<UserModel | null> {
    return this.userService.getUserById(transaction.userId)
  }
}
