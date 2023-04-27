import mysql, { RowDataPacket } from 'mysql2'
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ArielKashani1998',
    database: 'project3'
});

export function execute<T>(query: string, params?: any[]) {
    return pool.promise().execute<T & RowDataPacket[]>(query, params);
}