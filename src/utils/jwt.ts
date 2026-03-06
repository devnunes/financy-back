import { Secret, sign, SignOptions } from "jsonwebtoken";

export type JwtPayload = {
  id: string;
  email: string;
}

export const singJwt = (payload: JwtPayload, expiresIn?: string): string => {
  const secret: Secret = process.env.JWT_SECRET as unknown as Secret;
  const options: SignOptions = expiresIn ? { expiresIn: expiresIn as unknown as NonNullable<SignOptions['expiresIn']> } : {};

  return sign(payload, secret, options);
}