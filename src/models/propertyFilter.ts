import { ISuburb } from './suburb';
export interface IPropertyFilter {

    language: string;
    pageNum: number;
    itemsPerPage: number;
    pricefrom: number;
    priceto: number;
    propertyTypeArray: Array<string>;
    propertyType: string;
    location: string;
    surroundingSuburbs: boolean;
    beds: number;
    baths: number;
    cars: number;
    orderby: string;
    isSold: boolean;
    suburbs:Array<ISuburb>;
    lat:number;
    lon:number;

}