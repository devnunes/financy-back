import { User } from "../../generated/prisma/client";
import { prismaClient } from "../../prisma/prisma";
import { RegisterInput } from "../dtos/input/auth.input";
import { singJwt } from "../utils/jwt";

export class AuthService {
  async register(data: RegisterInput) {
    const existigUser = await prismaClient.user.findUnique({
      where: {
        email: data.email
      }
    });
    if (existigUser) throw new Error("User already exists");

    const user = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password
      }
    });

    const { token, refreshToken } = this.generateTokens(user);

    return { token, refreshToken, user };
  }

  generateTokens(user: User) {
    const token = singJwt({ id: user.id, email: user.email }, "15m");
    const refreshToken = singJwt({ id: user.id, email: user.email }, "7d");
    return { token, refreshToken };
  }
}