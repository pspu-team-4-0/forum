"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateError = exports.UnknownError = exports.ServiceError = void 0;
class ServiceError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ServiceError = ServiceError;
class UnknownError extends ServiceError {
    constructor(errObj) {
        super(`Unknown error, ${errObj.toString()}`);
    }
}
exports.UnknownError = UnknownError;
class AuthenticateError extends ServiceError {
    constructor() {
        super("Authentication failed");
    }
}
exports.AuthenticateError = AuthenticateError;
