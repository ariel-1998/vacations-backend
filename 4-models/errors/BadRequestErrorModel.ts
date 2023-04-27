import { ErrorModel } from "./ErrorModel";

export class BadRequestErrorModel extends ErrorModel{
    constructor(e: { message: string }) {
        super();
        this.code = 400;
        this.message = e.message
    }
}