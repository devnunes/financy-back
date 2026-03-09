import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { makeRight } from '@/utils/either'
import { AuthResolver } from './auth.resolver'

type SignUpSetup = {
  input: SignUpInput
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
  type: 'signIn' | 'signUp',
  overrides?: Partial<SignInSetup | SignUpSetup>
): SignInSetup | SignUpSetup {
  const data = {
    input: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      ...overrides?.input,
    },
  }
  if (type === 'signUp') {
    Object.assign(data.input, {
      password: faker.internet.password(),
    })
    return data
  }
  return data
}

describe('AuthResolver.signUp', () => {
  it('should sign up a user', async () => {
    const { input } = makeResolverSetup('signUp') as SignUpSetup
    const context = makeContext()

    const signUp = vi.fn().mockResolvedValue(
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
        signUp,
        signIn: vi.fn(),
      },
    })

    const result = await resolver.signUp(input, context)

    expect(signUp).toHaveBeenCalledWith(input)
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

  it('should use AuthService.signUp when no dependency is injected', async () => {
    const { input } = makeResolverSetup('signUp') as SignUpSetup
    const context = makeContext()
    const signUpSpy = vi.spyOn(AuthService.prototype, 'signUp')
    signUpSpy.mockResolvedValue(
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

    const result = await resolver.signUp(input, context)

    expect(signUpSpy).toHaveBeenCalledWith(input)
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
        signUp: vi.fn(),
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
