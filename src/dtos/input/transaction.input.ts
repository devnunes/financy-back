import { Field, GraphQLISODateTime, InputType } from 'type-graphql'

@InputType()
export class CreateTransactionInput {
  @Field(() => Number)
  amount!: number

  @Field(() => String)
  description!: string

  @Field(() => String)
  type!: string

  @Field(() => String)
  category!: string

  @Field(() => GraphQLISODateTime)
  date!: Date
}
