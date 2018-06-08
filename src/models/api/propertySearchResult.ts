import { IProperty } from "../property";

export interface IPropertySearchResult {

    CurrentPage: number;
    TotalPages: number;
    TotalItems: number;
    ItemsPerPage: number;
    Items: Array<IProperty>;
    
}