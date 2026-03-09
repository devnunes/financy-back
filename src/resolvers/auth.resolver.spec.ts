import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { RegisterInput, SignInInput } from '@/dtos/input/auth.input'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { makeRight } from '@/utils/either'
import { AuthResolver } from './auth.resolver'

type RegisterSetup = {
  input: RegisterInput
}

type SignInSetup = {
  input: SignInInput
}

function makeContext(): GraphQLContext {
  return {
    userId: undefined,
    token: undefined,
    req: {} as GraphQLContext['req'],
    res: {
      header: vi.fn(),
    } as unknown as GraphQLContext['res'],
  }
}

function makeResolverSetup(
  type: 'register' | 'signIn',
  overrides?: Partial<RegisterSetup | SignInSetup>
): RegisterSetup | SignInSetup {
  const data = {
    input: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      ...overrides?.input,
    },
  }
  if (type === 'register') {
    Object.assign(data.input, {
      password: faker.internet.password(),
    })
    return data
  }
  return data
}

describe('AuthResolver.register', () => {
  it('should register a user', async () => {
    const { input } = makeResolverSetup('register') as RegisterSetup
    const context = makeContext()

    const register = vi.fn().mockResolvedValue(
      makeRight({
        token: faker.internet.jwt(),
        refreshToken: faker.internet.jwt(),
        user: {
          id: faker.string.uuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
          name: input.name,
          email: input.email,
          password: input.password,
        },
      })
    )

    const resolver = new AuthResolver({
      authService: {
        register,
        signIn: vi.fn(),
      },
    })

    const result = await resolver.register(input, context)

    expect(register).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        name: input.name,
        email: input.email,
      },
    })
  })

  it('should use AuthService.register when no dependency is injected', async () => {
    const { input } = makeResolverSetup('register') as RegisterSetup
    const context = makeContext()
    const registerSpy = vi.spyOn(AuthService.prototype, 'register')
    registerSpy.mockResolvedValue(
      makeRight({
        token: faker.internet.jwt(),
        refreshToken: faker.internet.jwt(),
        user: {
          id: faker.string.uuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
          name: input.name,
          email: input.email,
          password: input.password,
        },
      })
    )

    const resolver = new AuthResolver()

    const result = await resolver.register(input, context)

    expect(registerSpy).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result.user.email).toBe(input.email)
  })
})

describe('AuthResolver.signIn', () => {
  it('should sign in a user', async () => {
    const { input } = makeResolverSetup('signIn') as SignInSetup
    const context = makeContext()

    const signIn = vi.fn().mockResolvedValue(
      makeRight({
        token: faker.internet.jwt(),
        refreshToken: faker.internet.jwt(),
        user: {
          email: input.email,
          password: input.password,
        },
      })
    )

    const resolver = new AuthResolver({
      authService: {
        register: vi.fn(),
        signIn,
      },
    })

    const result = await resolver.signIn(input, context)

    expect(signIn).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: input.email,
        password: input.password,
      },
    })
  })

  it('should use AuthService.signIn when no dependency is injected', async () => {
    const { input } = makeResolverSetup('signIn') as SignInSetup
    const context = makeContext()
    const signInSpy = vi.spyOn(AuthService.prototype, 'signIn')
    signInSpy.mockResolvedValue(
      makeRight({
        token: faker.internet.jwt(),
        refreshToken: faker.internet.jwt(),
        user: {
          id: faker.string.uuid(),
          createdAt: new Date(),
          updatedAt: new Date(),
          name: faker.person.fullName(),
          email: input.email,
          password: input.password,
        },
      })
    )

    const resolver = new AuthResolver()

    const result = await resolver.signIn(input, context)

    expect(signInSpy).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result.user.email).toBe(input.email)
  })
})
