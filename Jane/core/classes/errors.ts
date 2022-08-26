import { ErrorCode } from "../../types/enums";

export class JaneBaseError extends Error {
  data?: JaneErrorData;
  code?: ErrorCode;
  constructor(message: string, id: ErrorCode) {
    super(message);
    this.code = id;
  }
}

export class JaneDatabaseError extends JaneBaseError {
  constructor(message: string, id: ErrorCode, data?: JaneErrorData) {
    super(message, id);
    this.name = this.constructor.name;
    this.message = message;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class JaneGeneralError extends JaneBaseError {
  constructor(message: string, id: ErrorCode, data?: JaneErrorData) {
    super(message, id);
    this.name = this.constructor.name;
    this.message = message;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class JaneHTTPError extends JaneBaseError {
  constructor(message: string, id: ErrorCode, data?: JaneErrorData) {
    super(message, id);
    this.name = this.constructor.name;
    this.message = message;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}
