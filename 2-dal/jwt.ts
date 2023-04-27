import { UserModel } from "../4-models/UserModel";
import jwt from "jsonwebtoken";

export function generateToken(user: UserModel) {
    return jwt.sign({
        sub: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
    }, user.password, {expiresIn: "3h" });
}