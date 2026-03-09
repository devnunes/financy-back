import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { AuthService } from '@/services/auth.service'
import { createUserFactory } from '@/test/factories/user.factory'
import { isLeft, isRight, unwrapEither } from '@/utils/either'
import { verifyJwt } from '@/utils/jwt'

describe('AuthService.register', () => {
  it('creates a new user and returns signed tokens', async () => {
    const service = new AuthService()
    const password = 'register-password'
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
    }
    const result = await service.register(user)

    expect(isRight(result)).toBe(true)
    expect(result.right).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          name: user.name,
          email: user.email,
        }),
      })
    )
    const tokenPayload = verifyJwt(result.right.token)
    const refreshTokenPayload = verifyJwt(result.right.refreshToken)

    expect(tokenPayload.email).toBe(user.email)
    expect(refreshTokenPayload.id).toBe(result.right.user.id)
  })

  it('throws when user already exists', async () => {
    const service = new AuthService()
    const existingUser = await createUserFactory()
    const result = await service.register({
      name: existingUser.name,
      email: existingUser.email,
      password: 'any-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })
})

describe('AuthService.login', () => {
  it('returns signed tokens when credentials are valid', async () => {
    const service = new AuthService()
    const password = 'valid-password'
    const user = await createUserFactory({
      password,
    })

    const result = await service.login({
      email: user.email,
      password,
    })

    expect(isRight(result)).toBe(true)
    if (!isRight(result)) throw result.left

    expect(result.right).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: user.email,
        }),
      })
    )
    const tokenPayload = verifyJwt(result.right.token)
    const refreshTokenPayload = verifyJwt(result.right.refreshToken)

    expect(tokenPayload.email).toBe(user.email)
    expect(refreshTokenPayload.id).toBe(result.right.user.id)
  })

  it('throws when credentials are invalid', async () => {
    const service = new AuthService()
    const user = await createUserFactory()
    const result = await service.login({
      email: user.email,
      password: 'wrong-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })

  it('throws when user does not exist', async () => {
    const service = new AuthService()
    const result = await service.login({
      email: `not-found-${Date.now()}@mail.com`,
      password: 'any-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })
})
