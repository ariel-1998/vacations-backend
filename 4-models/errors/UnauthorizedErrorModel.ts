import { ErrorModel } from "./ErrorModel";

export class UnAuthorizedErrorModel extends ErrorModel{
    constructor(e: { message: string }) {
        super();
        this.code = 401;
        this.message = e.message
    }
}