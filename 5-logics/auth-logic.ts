import { OkPacket } from "mysql2";
import { execute } from "../2-dal/dal";
import { UserModel } from "../4-models/UserModel";
import crypto from 'crypto'
import { CredentialsModel } from "../4-models/CredentialsModel";

export async function register(user: UserModel): Promise<UserModel> {
    user.password = hashPassword(user.password);
    const { firstName, lastName, email, password, role } = user;
    const query = 'INSERT INTO users(firstName, lastName, email, password, role) VALUES(?,?,?,?,?)'
    const [results] = await execute<OkPacket>(query, [firstName, lastName, email, password, role])
    user.userId = results.insertId;
    return user;
}

export async function login(credentials: CredentialsModel): Promise<UserModel> {
    const { email, password } = credentials;
    const HashedPassword = hashPassword(password);
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    const [results] = await execute<UserModel[]>(query, [email, HashedPassword]);
    return results[0];
}

export async function getUserById(userId: number): Promise<UserModel> {
    const query = 'SELECT * FROM users WHERE userId = ?';
    const [results] = await execute<UserModel[]>(query, [userId]);
    return results[0];
}

export function hashPassword(password: string): string {
    password = crypto.createHash('sha256').update(password).digest('hex');
    return password;
}

