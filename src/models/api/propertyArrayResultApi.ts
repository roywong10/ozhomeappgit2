import { IPropertySummary } from './../propertySummary';
import { IApiResult } from './apiResult';
import { IPropertySearchResult } from "./propertySearchResult";
export interface IPropertyArrayApiResult extends IApiResult {
    ReturnValue: Array<IPropertySummary>;
}