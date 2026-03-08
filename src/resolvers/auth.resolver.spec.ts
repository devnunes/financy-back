import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { LoginInput, RegisterInput } from '@/dtos/input/auth.input'
import { AuthResolver } from './auth.resolver'

type RegisterSetup = {
  input: RegisterInput
}

type LoginSetup = {
  input: LoginInput
}

function makeResolverSetup(
  type: 'register' | 'login',
  overrides?: Partial<RegisterSetup | LoginSetup>
): RegisterSetup | LoginSetup {
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

describe('AuthResolver', () => {
  it('should register a user', async () => {
    const { input } = makeResolverSetup('register') as RegisterSetup

    const register = vi.fn().mockResolvedValue(input)

    const resolver = new AuthResolver({
      authService: {
        register,
        login: vi.fn(),
      },
    })

    const result = await resolver.register(input)

    expect(register).toHaveBeenCalledWith(input)
    expect(result).toMatchObject({
      name: input.name,
      email: input.email,
    })
  })

  it('should login a user', async () => {
    const { input } = makeResolverSetup('login') as LoginSetup

    const login = vi.fn().mockResolvedValue({
      token: faker.internet.jwt(),
      refreshToken: faker.internet.jwt(),
      user: {
        email: input.email,
        password: input.password,
      },
    })

    const resolver = new AuthResolver({
      authService: {
        register: vi.fn(),
        login,
      },
    })

    const result = await resolver.login(input)

    expect(login).toHaveBeenCalledWith(input)
    expect(result).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: input.email,
        password: input.password,
      },
    })
  })
})
