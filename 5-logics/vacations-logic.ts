import { UploadedFile } from "express-fileupload";
import { OkPacket } from "mysql2";
import path from "path";
import { execute } from "../2-dal/dal";
import { VacationModel } from "../4-models/VacationModel";
import fs from 'fs';

export const LIMIT = 10;
export const IMAGE_FOLDER = '1-assets/'
export const DOT_PNG = '.png'


export async function getAdminVacations(pageNumber: number) {
    const offset = (pageNumber - 1) * LIMIT
    const query = `SELECT *,
    (SELECT count(vacationId) from vacations) AS totalVacations 
    FROM vacations v
    ORDER BY v.startDate LIMIT ${LIMIT} OFFSET ${offset}`; 

    const [res] = await execute<VacationModel[]>(query);
    return res
}

export async function getVacations(pageNumber: number, userId: number): Promise<VacationModel[]> {
    const offset = (pageNumber - 1) * LIMIT
    const query = `SELECT *,
	(SELECT COUNT(*) FROM vacations  WHERE startDate >= CURDATE()) AS totalVacations,
    (SELECT userId FROM likes l WHERE userId = ? AND l.vacationId = v.vacationId) AS isLiked,
    (SELECT COUNT(*) FROM likes l WHERE l.vacationId = v.vacationId) AS likes
    FROM vacations v 
    WHERE startDate >= CURDATE() 
    ORDER BY startDate LIMIT ${LIMIT} OFFSET ${offset}`;
    const [res] = await execute<VacationModel[]>(query, [userId]);
    return res;
}

export async function getLikedVacations(pageNumber: number, userId: number): Promise<VacationModel[]> {
    const offset = (pageNumber - 1) * LIMIT
    const query = `select v.*, userId AS isLiked,
    (SELECT COUNT(*) FROM likes l WHERE v.vacationId = l.vacationId) AS likes,
    (SELECT COUNT(*) FROM likes WHERE userId = ? ) AS totalVacations
    from vacations v
    JOIN likes l
    ON v.vacationId = l.vacationId
    WHERE userId = ?
    ORDER BY startDate  LIMIT ${LIMIT} OFFSET ${offset}`;
    const [res] = await execute<VacationModel[]>(query, [userId, userId]);
    return res;
}

export async function getFutureVacations(pageNumber: number, userId: number): Promise<VacationModel[]> {
    const offset = (pageNumber - 1) * LIMIT
    const query = `SELECT *,
    (SELECT userId FROM likes l WHERE userId = ? AND l.vacationId = v.vacationId) AS isLiked,
    (SELECT COUNT(*) FROM likes l WHERE l.vacationId = v.vacationId) AS likes,
    (SELECT COUNT(*) FROM vacations WHERE startDate > CURDATE()) AS totalVacations
    FROM vacations v
    WHERE startDate > CURDATE()
    ORDER BY startDate  LIMIT ${LIMIT} OFFSET ${offset}`;
    const [res] = await execute<VacationModel[]>(query, [userId]);
    return res;
}

export async function getActiveVacations(pageNumber: number, userId: number): Promise<VacationModel[]> {
    const offset = (pageNumber - 1) * LIMIT
    const query = `SELECT *,
    (SELECT userId FROM likes l WHERE userId = ? AND l.vacationId = v.vacationId) AS isLiked,
    (SELECT COUNT(*) FROM likes l WHERE l.vacationId = v.vacationId) AS likes,
    (SELECT COUNT(*) FROM vacations WHERE startDate <= CURDATE() AND endDate >= CURDATE()) AS totalVacations
    FROM vacations v
    WHERE startDate <= CURDATE() AND endDate >= CURDATE()
    ORDER BY startDate  LIMIT ${LIMIT} OFFSET ${offset}`;
    const [res] = await execute<VacationModel[]>(query, [userId]);
    return res;
}

export async function getSingleVacation(userId: number, vacationId: number): Promise<VacationModel> {
    const query = `select *,
    (SELECT COUNT(*) FROM likes l WHERE v.vacationId = l.vacationId) AS likes,
    (SELECT userId FROM likes l WHERE userId = ? AND l.vacationId = v.vacationId) as isLiked
    from vacations v
    WHERE vacationId = ?`;

    const [res] = await execute<VacationModel[]>(query, [userId, vacationId]);
    return res[0];
}

export async function addVacation(vacation: VacationModel): Promise<VacationModel> {
    const query = `INSERT INTO vacations 
    (destination, description, startDate, endDate, price) 
    VALUES(?, ?, ?, ?, ?)`
    const { destination, description, startDate, endDate, price } = vacation;
    const [res] = await execute<OkPacket>(query, [destination,
        description, startDate, endDate, price]);
    const vacationId = res.insertId;

    await insertImageNameToDB(vacationId)

    return {
        vacationId,
        destination,
        description,
        startDate,
        endDate,
        price,
        pic: vacationId + DOT_PNG
    }
}

export async function updateVacation(vacation: VacationModel): Promise<OkPacket> {
    const { vacationId, destination, description, startDate, endDate, price } = vacation;

    const query = `UPDATE vacations
    SET 
    destination = ?,
    description = ?,
    startDate = ?,
    endDate = ?,
    price = ?
    WHERE vacationId = ?`
    const [res] = await execute<OkPacket>(query, [destination,
        description, startDate, endDate, price, vacationId]);
    return res
}

export async function deleteVacation(vacationId: number): Promise<boolean> {
    const query = "DELETE FROM vacations WHERE vacationId = ?"
    const [res] = await execute<OkPacket>(query, [vacationId]);
    return isSuccessfullDBChange(res)
}


export async function insertImageNameToDB(vacationId: number) {
    const query = `UPDATE vacations SET pic = ? WHERE vacationId = ?`
    const [res] = await execute<VacationModel[]>(query, [vacationId + DOT_PNG, vacationId]);
    return res
}



export function isSuccessfullDBChange(res: OkPacket) {
    if (res.affectedRows > 0) return true;
    else return false
}

export function saveImage(image: UploadedFile, imageName: string): void {
    image.mv(path.resolve(IMAGE_FOLDER + imageName))
}

export function deleleteImage(imageName: string) {
    const imagePath = path.resolve(IMAGE_FOLDER + imageName)

    if (!fs.existsSync(imagePath)) {
        return;
    } else {
        fs.rmSync(imagePath)
    }
}