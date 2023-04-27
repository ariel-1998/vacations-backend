import { ErrorModel } from './ErrorModel';

interface ZodIssuesModel {
    issues: {message: string}[]
}

export class ZodErrorModel extends ErrorModel{
    constructor(e: ZodIssuesModel) {
        super();
        this.code = 401;
        this.message = e.issues.map(e => e.message)
    }
}