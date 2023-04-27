import express from "express";
import { generateToken } from "../2-dal/jwt";
import { Role, UserModel, UserSchema } from "../4-models/UserModel";
import { ZodErrorModel } from "../4-models/errors/ZodErrorModel";
import { login, register } from "../5-logics/auth-logic";
import { UnAuthorizedErrorModel } from "../4-models/errors/UnauthorizedErrorModel";

export const authController = express.Router();

authController.post('/register', async (req, res, next) => {

    try {
        const user: UserModel = req.body;
        user.role = Role.User;
        UserSchema.parse(user);
        const registered = await register(user);
        const token = generateToken(registered);
        res.status(200).send(token);
    } catch (e) {
        if (e.name === 'ZodError') next(new ZodErrorModel(e));
        else next(new UnAuthorizedErrorModel({message: "Email already exist"}));
    }
});

authController.post('/login', async (req, res, next) => {
    try {
        const credentials = req.body;
        const user = await login(credentials);

        if (!user) throw new Error("Email or password are incorrect")

        const token = generateToken(user);
        res.status(200).send(token);
    
    } catch (error) {
        next(new UnAuthorizedErrorModel(error)) 
    }
});
