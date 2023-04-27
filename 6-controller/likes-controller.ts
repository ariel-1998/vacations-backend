import express from "express";
import { adminValidation } from "../3-middleware/adminValidation";
import { jwtVerification } from "../3-middleware/jwtVerification";
import { userValidation } from "../3-middleware/userValidation";
import { CustomReq } from "../4-models/CustomReq";
import { addLiketoVacation, getVacationLikesByPage, getVacationLikesReports, removeLikeFromVacation } from "../5-logics/likes-logic";

export const likesRouter = express.Router();
likesRouter.use(jwtVerification);

likesRouter.get("/", adminValidation, async (req, res, next) => {
    const reports = await getVacationLikesReports()
    res.status(200).json(reports)
})

likesRouter.get("/:pageNum([0-9]+)", adminValidation, async (req, res, next) => {
    let pageNum  = +req.params.pageNum
    if (pageNum < 1) {
        res.sendStatus(404);
        return;
    }
    const reports = await getVacationLikesByPage(pageNum)
    res.status(200).json(reports)
})


likesRouter.post('/', userValidation, async (req: CustomReq, res, next) => {
    try {
        const { vacationId } = req.body;
        const { userId } = req.user
        await addLiketoVacation(userId, vacationId);
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(400)
    }
});

likesRouter.delete('/:vacationId', userValidation, async (req: CustomReq, res, next) => {
    const { vacationId } = req.params;
    const { userId } = req.user;
    const like = await removeLikeFromVacation(userId, +vacationId);
    if (like) res.sendStatus(200)
    else (res.sendStatus(400))
})