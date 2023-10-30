import { createHmac, randomBytes } from "crypto";
import Jwt from "jsonwebtoken";
import { prisma } from "../lib/db";
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  profileImageURl: string;
  email: string;
  password: string;
}
export interface GetUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  private static generateHash(password: string, salt: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }
  public static getUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, profileImageURl, email, password } = payload;
    const salt = randomBytes(16).toString("hex");
    const hash = UserService.generateHash(salt, password);
    return prisma.user.create({
      data: {
        firstName,
        lastName,
        profileImageURl,
        email,
        password: hash,
        salt: salt,
      },
    });
  }

  private static getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    const { id, password: userPassword, salt }: any = user;
    if (!user) throw new Error("User not found");

    const userHashPassword = UserService.generateHash(salt, password);
    if (userHashPassword !== userPassword) throw new Error("Invalid password");
    // generate token
    const token = Jwt.sign(
      {
        id,
        email,
      },
      process.env.JWT_SECRET!
    );
    return token;
  }
  public static decodeJWT(token: string) {
    return Jwt.verify(token, process.env.JWT_SECRET!);
  }
}

export default UserService;
