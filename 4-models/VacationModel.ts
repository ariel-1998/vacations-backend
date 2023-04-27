import { z } from "zod";


export const ACCEPTED_MIME_TYPES = ["image/gif", "image/jpeg", "image/png"];

function getYesterdayDate() {
    const yesterdayDate = new Date(new Date(Date.now()).getTime() - 24 * 60 * 60 * 1000);
    return yesterdayDate
}



export const vacationSchema = z.object({
    vacationId: z.number().optional(),

    destination: z.string()
        .min(2, 'Destination name must contain at least 2 letters')
        .max(20, 'Destination letters must be 20 letters or less'),

    description: z.string().min(20, 'Description name must contain at least 20 letters')
        .max(400, 'Description name must be under least 400 letters'),

    startDate: z.date()
        .min(getYesterdayDate(), 'Start date must be grater or equal to today'),

    endDate: z.date()
        .min(getYesterdayDate(), 'End date must be grater or equal to today'),

    price: z.number().gt(0, 'Price must be a positive number')
        .lte(10000, 'Price must be lower then 10,000'),

    pic: z.string().optional(),

    likes: z.number().optional(),
    isLiked: z.boolean().optional(),
    totalVacations: z.number().optional()
}).refine(data => data.startDate <= data.endDate,
    'Vacations Start date cant be greater then end date');


export type VacationModel = z.infer<typeof vacationSchema>
