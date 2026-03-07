import type { CreateTransactionInput } from '@/dtos/input/transaction.input'
import { prismaClient } from '@/prisma-client'

export class TransactionService {
  async createTransaction(data: CreateTransactionInput, userId: string) {
    return prismaClient.transaction.create({
      data: {
        ...data,
        userId,
      },
    })
  }
}
