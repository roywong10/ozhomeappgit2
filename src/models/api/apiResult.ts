import { IApiResultError } from "./apiResultError";

export interface IApiResult {
    IsValid: boolean;
    Errors: Array<IApiResultError>;
}