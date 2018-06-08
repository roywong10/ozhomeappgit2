import { IPropertyAlert } from './../propertyAlert';
import { IApiResult } from './apiResult';

export interface IPropertyAlertArrayApiResult extends IApiResult {
    ReturnValue: Array<IPropertyAlert>;
}