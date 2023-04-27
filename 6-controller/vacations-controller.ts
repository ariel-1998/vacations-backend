import express from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { adminValidation } from "../3-middleware/adminValidation";
import { jwtVerification } from "../3-middleware/jwtVerification";
import { CustomReq } from "../4-models/CustomReq";
import { ZodErrorModel } from "../4-models/errors/ZodErrorModel";
import { VacationModel, vacationSchema } from "../4-models/VacationModel";
import { addVacation, deleleteImage, deleteVacation, DOT_PNG, getActiveVacations, getAdminVacations, getFutureVacations, getLikedVacations, getSingleVacation, getVacations, IMAGE_FOLDER, saveImage, updateVacation } from "../5-logics/vacations-logic";
import fs from 'fs';
import { BadRequestErrorModel } from "../4-models/errors/BadRequestErrorModel";

export const vacationsRouter = express.Router();

vacationsRouter.get('/image/:pic', async (req, res, next) => {
    const { pic } = req.params;
    const imagePath = path.resolve(IMAGE_FOLDER + pic)

    if (!fs.existsSync(imagePath)) {
        res.sendStatus(404);
        return;
    }
    res.status(200).sendFile(imagePath);
});


vacationsRouter.use(jwtVerification);

vacationsRouter.get('/:pageNum([0-9]+)', async (req: CustomReq, res, next) => {
    let pageNum = +req.params.pageNum;
    if (pageNum < 1) {
        res.sendStatus(404);
        return;
    }
    const { userId } = req.user;
    const vacations = await getVacations(pageNum, userId);
    res.status(200).json(vacations);
});

vacationsRouter.get('/liked/:pageNum([0-9]+)', async (req: CustomReq, res, next) => {
    let pageNum = +req.params.pageNum;
    if (pageNum < 1) {
        res.sendStatus(404);
        return;
    }
    const { userId } = req.user;
    const vacations = await getLikedVacations(pageNum, userId);
    res.status(200).json(vacations);
});

vacationsRouter.get('/future/:pageNum([0-9]+)', async (req: CustomReq, res, next) => {
    let pageNum = +req.params.pageNum;

    if (pageNum < 1) {
        res.sendStatus(404);
        return;
    }
    const { userId } = req.user;
    const vacations = await getFutureVacations(pageNum, userId);
    res.status(200).json(vacations);
});

vacationsRouter.get('/active/:pageNum([0-9]+)', async (req: CustomReq, res, next) => {
    let pageNum = +req.params.pageNum;

    if (pageNum < 1) {
        res.sendStatus(404);
        return;
    }
    const { userId } = req.user;
    const vacations = await getActiveVacations(pageNum, userId);
    res.status(200).json(vacations);
});

vacationsRouter.get('/single/:vacationId([0-9]+)', async (req: CustomReq, res, next) => {
    const { userId } = req.user;
    const { vacationId } = req.params;
    const vacation = await getSingleVacation(userId, +vacationId);
    if (vacation) res.status(200).json(vacation);
    else res.sendStatus(404);
});



vacationsRouter.use(adminValidation);

vacationsRouter.get("/admin/:pageNum([0-9]+)", async (req, res, next) => {
    let pageNum = +req.params.pageNum;
    if (pageNum < 1) {
        res.sendStatus(404);
        return;
    }
    const vacations = await getAdminVacations(pageNum);
    res.status(200).json(vacations);
});


vacationsRouter.post('/', async (req, res, next) => {
    try {
        const vacation: VacationModel = req.body;
        const file = req.files

        vacation.startDate = new Date(vacation.startDate);
        vacation.endDate = new Date(vacation.endDate);
        vacation.price = Number(vacation.price)


        vacationSchema.parse(vacation);
        if (!file) throw new Error("All fields are required")
        const image = file.pic as UploadedFile

        const newVacation = await addVacation(vacation);
        saveImage(image, newVacation.pic)
        res.status(200).json(newVacation)

    } catch (e) {
        if (e.name === 'ZodError') next(new ZodErrorModel(e));
        else next(new BadRequestErrorModel(e))
    }
});





vacationsRouter.put('/:vacationId([0-9]+)', async (req, res, next) => {

    try {
        const vacation: VacationModel = req.body;
        vacation.vacationId = +req.params.vacationId;
        const file = req.files;

        vacation.price = Number(vacation.price)
        vacation.startDate = new Date(vacation.startDate);
        vacation.endDate = new Date(vacation.endDate);
        vacationSchema.parse(vacation);



        if (file) {
            const image = file.pic as UploadedFile;
            deleleteImage(vacation.vacationId + DOT_PNG);
            saveImage(image, vacation.vacationId + DOT_PNG);
        }

        await updateVacation(vacation);
        res.sendStatus(204)

    } catch (e) {
        next(new ZodErrorModel(e))
    }
});


vacationsRouter.delete('/:vacationId([0-9]+)', async (req, res, next) => {
    const vacationId = +req.params.vacationId;
    deleleteImage(vacationId + DOT_PNG)
    await deleteVacation(vacationId);
    res.sendStatus(204);
})