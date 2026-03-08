import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { UserService } from '@/services/user.service'
import { createUserFactory } from '@/test/factories/user.factory'

describe('UserService.createUser', () => {
  it('should create a user', async () => {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      // password: await hashPassword(Zfaker.internet.password()),
    }
    const service = new UserService()

    const result = await service.createUser(user)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('password')
    expect(result.name).toBe(user.name)
    expect(result.email).toBe(user.email)
  })
})

describe('UserService.getUserById', () => {
  it('should delete a transaction', async () => {
    const user = await createUserFactory()

    const service = new UserService()

    const result = await service.getUserById(user.id)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('password')
    expect(result.name).toBe(user.name)
    expect(result.email).toBe(user.email)
  })
})

describe('UserService.updateUser', () => {
  it('should update a user', async () => {
    const user = await createUserFactory()

    const service = new UserService()

    const result = await service.updateUser(
      { ...user, name: 'Updated Name' },
      user.id
    )

    expect(result).toBe(true)
    const updatedUser = await service.getUserById(user.id)
    expect(updatedUser.name).toBe('Updated Name')
  })
})
