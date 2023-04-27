import { NextFunction, Response } from "express";
import { CustomReq } from "../4-models/CustomReq";
import { UnAuthorizedErrorModel } from "../4-models/errors/UnauthorizedErrorModel";
import { Role } from "../4-models/UserModel";

export function adminValidation(req: CustomReq, res: Response, next: NextFunction) {
  try {
      const { role } = req.user;
      if (role === Role.Admin) next();
      else throw new Error("Unauthorized")
  
  } catch (error) {
    next(new UnAuthorizedErrorModel(error))
    
  }
}