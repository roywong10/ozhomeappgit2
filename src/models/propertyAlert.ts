import { ISuburb } from './suburb';
export interface IPropertyAlert {
    Id: string;
    AlertName: string;
    PriceFrom: number;
    PriceTo: number;
    PropertyType: string;
    Locations: string;
    IncludeSurroundingSuburb: boolean;
    Bedrooms: number;
    Bathrooms: number;
    Parking: number;
    IsSold: boolean;
    
    suburbs:Array<ISuburb>;
    propertyTypeList: Array<string>;
}