import { IPropertySummary } from './../propertySummary';
import { IApiResult } from './apiResult';
import { IPropertySearchResult } from "./propertySearchResult";
export interface IPropertySearchApiResult extends IApiResult {
    ReturnValue: IPropertySearchResult;
}