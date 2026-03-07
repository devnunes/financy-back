import { prismaClient } from "../../prisma/prisma";

export class UserService {

  async getUserById(id: string) {
    const user = await prismaClient.user.findUnique({
      where: {
        id
      }
    })
    if (!user) throw new Error("User not found");
    return user;
  }
}
