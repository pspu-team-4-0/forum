export class ServiceError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class UnknownError extends ServiceError {
    constructor(errObj: any) {
        super(`Unknown error, ${errObj.toString()}`);
    }
}

export class AuthenticateError extends ServiceError {
    constructor() {
        super("Authentication failed");
    }
}