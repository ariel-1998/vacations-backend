import { OkPacket } from "mysql2";
import { execute } from "../2-dal/dal";
import { LikeReportModel, LikesCSVReportModel } from "../4-models/LikeReportModel";
import { isSuccessfullDBChange, LIMIT } from "./vacations-logic";

export async function getVacationLikesReports(): Promise<LikesCSVReportModel[]> {
    const query = `SELECT destination,
    (SELECT count(*) FROM likes l WHERE v.vacationId = l.vacationId) as likes
    FROM vacations v`
    const [res] = await execute<LikesCSVReportModel[]>(query);
    return res
}

export async function getVacationLikesByPage(pageNumber: number): Promise<LikeReportModel[]> {
    const offset = (pageNumber - 1) * LIMIT
    const query = `SELECT destination,  vacationId,
    (SELECT count(*) FROM likes l WHERE v.vacationId = l.vacationId) as likes,
    (SELECT count(*) FROM vacations) as totalVacations
    FROM vacations v
    ORDER BY startDate
    LIMIT ${LIMIT} OFFSET ${offset}`
    const [res] = await execute<LikeReportModel[]>(query, [pageNumber]);
    return res
}

export async function addLiketoVacation(userId: number, vacationId: number): Promise<OkPacket> {
    const query = "INSERT INTO likes (userId, vacationId) VALUES(?, ?)";
    const [res] = await execute<OkPacket>(query, [userId, vacationId]);
    return res;
}

export async function removeLikeFromVacation(userId: number, vacationId: number): Promise<boolean> {
    const query = "DELETE FROM likes WHERE userId = ? AND vacationId = ?";
    const [res] = await execute<OkPacket>(query, [userId, vacationId]);
    return isSuccessfullDBChange(res)
}