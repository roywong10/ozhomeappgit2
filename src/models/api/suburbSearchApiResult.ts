import { ISuburb } from './../suburb';
import { IApiResult } from './apiResult';
export interface ISuburbSearchApiResult extends IApiResult {
    ReturnValue: Array<ISuburb>;
}