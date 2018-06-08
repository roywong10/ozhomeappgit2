import { IProperty } from './../property';
import { IApiResult } from './apiResult';
export interface ISinglePropertyApiResult extends IApiResult {
    ReturnValue: IProperty;
}