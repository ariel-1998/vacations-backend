import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../4-models/errors/ErrorModel";

export function errorHandler(e: ErrorModel, req: Request, res: Response, Next: NextFunction) {
    res.status(e.code).json(e.message);
}