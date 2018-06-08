import { IPropertyBase } from './../propertyBase';
import { IProperty } from "../property";
import { IApiResult } from "./apiResult";

export interface IMapSearchResultApi extends IApiResult {
  
    ReturnValue: Array<IPropertyBase>;
    
}