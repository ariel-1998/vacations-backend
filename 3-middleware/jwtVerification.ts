import { NextFunction, Response } from "express";
import { decode, verify } from "jsonwebtoken";
import { CustomReq } from "../4-models/CustomReq";
import { UnAuthorizedErrorModel } from "../4-models/errors/UnauthorizedErrorModel";
import { getUserById } from "../5-logics/auth-logic";

export async function jwtVerification(req: CustomReq, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization.substring(7);
        const { sub } = decode(token);
        const user = await getUserById(+sub);
        verify(token, user.password);
        req.user = user;
        next()
    } catch (error) {
        next(new UnAuthorizedErrorModel({message: "You are not logged in"}))
    }
}