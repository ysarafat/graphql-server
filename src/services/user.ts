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
const JWT_TOKEN =
  "e9090d647b59621ecf06df51c985d9be78e47e007087d3f5f1ec546ab35b79056985716648ab5dd2d8f64a616ba32d04fbd4f12b09c80337c13b5394bfbfe3ba";
class UserService {
  private static generateHash(password: string, salt: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
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
      JWT_TOKEN
    );
    return token;
  }
}

export default UserService;
