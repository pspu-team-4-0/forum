import axios, {Axios, AxiosError} from 'axios';
import {STATUS_CODES} from "node:http";
import {AuthenticateError, ServiceError, UnknownError} from "./errors";

export type AuthenticateResponse = {
    userId: string,
    tgId: string
}

export class AuthService {
    private axios: Axios | null = null;

    constructor(authServiceUri: string) {
        this.axios = axios.create({
            baseURL: authServiceUri,
        })
    }

    async authenticateUser(): Promise<AuthenticateResponse> {
        try {
            const authResponse = await this.axios?.get("/auth");
            const {userId, tgId} = authResponse?.data;
            return {
                userId: userId,
                tgId: tgId
            }
        } catch (error) {
            if (!(error instanceof ServiceError)) {
                throw error;
            }
            if (error instanceof AxiosError) {
                const axiosErr = error as AxiosError;
                const status = axiosErr.response?.status;
                if (status === STATUS_CODES[401]) {
                    throw new AuthenticateError();
                }
                console.log(axiosErr.response?.data);
                throw new UnknownError({req: error.request, res: error.response});
            }
            throw error;
        }
    }
}