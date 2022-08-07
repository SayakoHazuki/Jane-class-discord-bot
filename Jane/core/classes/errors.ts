import { ErrorCode } from "../../types/enums";

class JaneBaseError extends Error {
    constructor(message: string, id: ErrorCode) {
        super(message);
    }
}

export class JaneDatabaseError extends JaneBaseError {
    constructor(message: string, id: ErrorCode) {
        super(message, id);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class JaneGeneralError extends JaneBaseError {
    constructor(message: string, id: ErrorCode) {
        super(message, id);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class JaneHTTPError extends JaneBaseError {
    constructor(message: string, id: ErrorCode) {
        super(message, id);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}
