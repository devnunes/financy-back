import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { CreateUserInput, UpdateUserInput } from '@/dtos/input/user.input'
import type { GraphQLContext } from '@/graphql/context'
import { UserResolver } from './user.resolver'

type createSetup = {
  input: CreateUserInput
  context: GraphQLContext
}

type updateSetup = {
  input: UpdateUserInput
  context: GraphQLContext
}

function makeResolverSetup(
  method: 'create' | 'update' | 'delete' | 'get',
  overrides?: Partial<createSetup | updateSetup>
): createSetup | updateSetup {
  const data = {
    input: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...overrides?.input,
    },
    context: {
      userId: faker.string.uuid(),
      ...overrides?.context,
    } as GraphQLContext,
  }
  if (method === 'update') {
    Object.assign(data.input, { id: faker.string.uuid() })
    return data
  }
  return data
}

describe('UserResolver.createUser', () => {
  it('should delegate creation to UserService', async () => {
    const { input } = makeResolverSetup('create') as createSetup
    const createUser = vi.fn().mockResolvedValue({
      ...input,
    })

    const resolver = new UserResolver({
      userService: {
        createUser,
        getUserById: vi.fn(),
        updateUser: vi.fn(),
      },
    })

    const result = await resolver.createUser(input)

    expect(createUser).toHaveBeenCalledWith(input)
    expect(result).toBe(true)
  })
})

describe('UserResolver.updateUser', () => {
  it('should delegate update to UserService', async () => {
    const { input, context } = makeResolverSetup('update') as updateSetup

    const updateUser = vi.fn().mockResolvedValue({
      ...input,
      userId: context.userId,
    })

    const resolver = new UserResolver({
      userService: {
        createUser: vi.fn(),
        getUserById: vi.fn(),
        updateUser,
      },
    })

    const result = await resolver.updateUser(input, context)

    expect(updateUser).toHaveBeenCalledWith(input, context.userId)
    expect(result).toMatchObject({
      id: input.id,
      userId: context.userId,
      name: input.name,
      email: input.email,
      password: input.password,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new UserResolver()
    const { input, context } = makeResolverSetup('update', {
      context: {
        userId: undefined,
      } as GraphQLContext,
    }) as updateSetup

    await expect(resolver.updateUser(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})
