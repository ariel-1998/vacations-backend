import { z } from "zod";

export enum Role {
    Admin = "Admin", User = "User"
}

export const UserSchema = z.object({
    userId: z.number().optional(),
    firstName: z.string()
    .min(2, 'First name must contain at least 2 letters!')
    .max(15, "First name can't be longer than 15 letters"),
    
    lastName: z.string()
    .min(2, 'Last name must contain at least 2 letters!')
    .max(15, "Last name can't be longer than 15 letters"),
    email: z.string().email('this is an invalid email address')
        .max(40, 'Email must be under 40 letters'),
    password: z.string()
        .min(4, 'Password must contain 4-8 letters')
        .max(8, 'Password must contain 4-8 letters'),
    role: z.nativeEnum(Role)
});


export type UserModel = z.infer<typeof UserSchema>
