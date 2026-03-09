import { Field, InputType } from 'type-graphql'

@InputType()
export class SignUpInput {
  @Field(() => String)
  name!: string

  @Field(() => String)
  email!: string

  @Field(() => String)
  password!: string
}

@InputType()
export class SignInInput {
  @Field(() => String)
  email!: string

  @Field(() => String)
  password!: string
}
