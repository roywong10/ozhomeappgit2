import { IProperty } from "../property";
import { IApiResult } from "./apiResult";
export interface IPropertyArraySearchApiResult extends IApiResult {
    ReturnValue: Array<IProperty>;
}