import type { CreateUserInput, UpdateUserInput } from '@/dtos/input/user.input'
import { prismaClient } from '@/prisma/prisma'
import { hashPassword } from '@/utils/hash'

export class UserService {
  async createUser(data: CreateUserInput) {
    return prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: await hashPassword(data.password),
      },
    })
  }

  async getUserById(id: string) {
    const user = await prismaClient.user.findUnique({
      where: {
        id,
      },
    })
    if (!user) throw new Error('User not found')
    return user
  }

  async updateUser(data: UpdateUserInput, userId: string) {
    if (!userId) throw new Error('Unauthorized')
    if (data.id !== userId) throw new Error('Unauthorized')
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) throw new Error('User not found')

    const password = data.password
      ? await hashPassword(data.password)
      : user.password

    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        password,
      },
    })

    return true
  }
}
